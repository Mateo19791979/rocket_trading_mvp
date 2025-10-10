-- Schema Analysis: Existing book-related tables exist but NO pgvector RAG functionality
-- Integration Type: NEW_MODULE - Creating new pgvector-powered RAG system
-- Dependencies: user_profiles table (existing)

-- Extensions for pgvector and text search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Knowledge Base Books metadata (pgvector RAG system)
CREATE TABLE IF NOT EXISTS public.kb_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  edition TEXT,
  year INTEGER,
  tags TEXT[],          -- ex: {SRE,DATA,ML,TRADING}
  source_url TEXT,      -- lien légal (éditeur / achat / interne)
  sha256 TEXT UNIQUE,   -- hash du fichier pour dédup
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Sections (chapitres, annexes)
CREATE TABLE IF NOT EXISTS public.kb_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.kb_books(id) ON DELETE CASCADE,
  section TEXT NOT NULL,   -- ex: "Ch. 3 – Backtesting"
  page_start INTEGER,
  page_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Chunks with pgvector embeddings (RAG core)
-- NOTE: dim=1536 for text-embedding-3-small (OpenAI)
CREATE TABLE IF NOT EXISTS public.kb_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.kb_books(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.kb_sections(id),
  chunk_no INTEGER NOT NULL,
  content TEXT NOT NULL,
  tokens INTEGER,
  embedding vector(1536),
  -- routage / filtrage agent
  domains TEXT[],        -- ex: {QuantOracle,StrategyWeaver,Deployer}
  lang TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexation pour recherche vectorielle
CREATE INDEX IF NOT EXISTS idx_kb_chunks_book ON public.kb_chunks(book_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_domains ON public.kb_chunks USING gin(domains);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_content_trgm ON public.kb_chunks USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding ON public.kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Indexes for other tables
CREATE INDEX IF NOT EXISTS idx_kb_books_sha256 ON public.kb_books(sha256);
CREATE INDEX IF NOT EXISTS idx_kb_books_tags ON public.kb_books USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_kb_sections_book_id ON public.kb_sections(book_id);

-- Vue pratique pour statistiques
CREATE OR REPLACE VIEW public.kb_stats AS
SELECT
  b.id as book_id, 
  b.title, 
  b.author,
  count(c.*) as chunks,
  array_agg(DISTINCT unnest(c.domains)) FILTER (WHERE c.domains IS NOT NULL) as domains
FROM public.kb_books b
LEFT JOIN public.kb_chunks c ON c.book_id = b.id
GROUP BY b.id, b.title, b.author;

-- Enable RLS for all tables
ALTER TABLE public.kb_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_chunks ENABLE ROW LEVEL SECURITY;

-- Pattern 4: Public Read, Private Write for knowledge content
CREATE POLICY "public_can_read_kb_books"
ON public.kb_books
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_kb_sections"
ON public.kb_sections
FOR SELECT
TO public
USING (true);

CREATE POLICY "public_can_read_kb_chunks"
ON public.kb_chunks
FOR SELECT
TO public
USING (true);

-- Admin can manage knowledge base (using auth metadata)
CREATE OR REPLACE FUNCTION public.is_kb_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.email LIKE '%@admin.%')
)
$$;

CREATE POLICY "admins_manage_kb_books"
ON public.kb_books
FOR ALL
TO authenticated
USING (public.is_kb_admin())
WITH CHECK (public.is_kb_admin());

CREATE POLICY "admins_manage_kb_sections"
ON public.kb_sections
FOR ALL
TO authenticated
USING (public.is_kb_admin())
WITH CHECK (public.is_kb_admin());

CREATE POLICY "admins_manage_kb_chunks"
ON public.kb_chunks
FOR ALL
TO authenticated
USING (public.is_kb_admin())
WITH CHECK (public.is_kb_admin());

-- PostgreSQL RPC function for semantic search
CREATE OR REPLACE FUNCTION public.kb_search(
  q_embedding vector(1536), 
  domains_filter text[] DEFAULT NULL, 
  match_k integer DEFAULT 8
)
RETURNS TABLE (
  book_id uuid, 
  section_id uuid, 
  chunk_id uuid, 
  title text, 
  author text, 
  content text, 
  similarity float
)
LANGUAGE sql 
STABLE
AS $$
  SELECT
    c.book_id, 
    c.section_id, 
    c.id as chunk_id,
    b.title, 
    b.author, 
    c.content,
    1 - (c.embedding <=> q_embedding) as similarity
  FROM public.kb_chunks c
  JOIN public.kb_books b ON b.id = c.book_id
  WHERE domains_filter IS NULL
     OR c.domains && domains_filter
  ORDER BY c.embedding <=> q_embedding
  LIMIT match_k;
$$;

-- Sample data with the 7 books from user's list
DO $$
DECLARE
    book1_id UUID := gen_random_uuid();
    book2_id UUID := gen_random_uuid();
    book3_id UUID := gen_random_uuid();
    book4_id UUID := gen_random_uuid();
    book5_id UUID := gen_random_uuid();
    book6_id UUID := gen_random_uuid();
    book7_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.kb_books (id, title, author, year, tags) VALUES
        (book1_id, 'Designing Data-Intensive Applications', 'Martin Kleppmann', 2017, 
         ARRAY['DATA', 'ARCHITECTURE', 'SYSTEMS']),
        (book2_id, 'Building Secure and Reliable Systems', 'Google SRE/Security', 2020, 
         ARRAY['SRE', 'SECURITY', 'RELIABILITY']),
        (book3_id, 'The Site Reliability Workbook', 'Google SRE', 2018, 
         ARRAY['SRE', 'MONITORING', 'OPERATIONS']),
        (book4_id, 'Advances in Financial Machine Learning', 'Marcos López de Prado', 2018, 
         ARRAY['ML', 'FINANCE', 'TRADING']),
        (book5_id, 'Successful Algorithmic Trading', 'Michael Halls-Moore', 2019, 
         ARRAY['TRADING', 'ALGORITHMS', 'FINANCE']),
        (book6_id, 'The Phoenix Project', 'Gene Kim, Kevin Behr, George Spafford', 2013, 
         ARRAY['DEVOPS', 'PROCESS', 'MANAGEMENT']),
        (book7_id, 'The Signals Are Talking', 'Amy Webb', 2016, 
         ARRAY['STRATEGY', 'SIGNALS', 'ANALYSIS']);

    -- Sample sections
    INSERT INTO public.kb_sections (book_id, section, page_start, page_end) VALUES
        (book1_id, 'Chapter 1: Reliable, Scalable, and Maintainable Applications', 1, 30),
        (book1_id, 'Chapter 2: Data Models and Query Languages', 31, 70),
        (book2_id, 'Chapter 1: The Intersection of Security and Reliability', 1, 25),
        (book3_id, 'Chapter 1: How SRE Relates to DevOps', 1, 20),
        (book4_id, 'Chapter 1: Financial Machine Learning as a Distinct Subject', 1, 15);

END $$;

-- Mock chunks with sample vector embeddings (normally generated by OpenAI)
DO $$
DECLARE
    book1_id UUID;
    section1_id UUID;
    sample_embedding vector(1536);
BEGIN
    -- Get first book and section
    SELECT id INTO book1_id FROM public.kb_books WHERE title = 'Designing Data-Intensive Applications' LIMIT 1;
    SELECT id INTO section1_id FROM public.kb_sections WHERE book_id = book1_id LIMIT 1;
    
    -- Create sample embedding (normally from OpenAI text-embedding-3-small)
    SELECT array_to_vector(array_fill(0.1::float, ARRAY[1536])) INTO sample_embedding;
    
    INSERT INTO public.kb_chunks (book_id, section_id, chunk_no, content, tokens, embedding, domains) VALUES
        (book1_id, section1_id, 1, 
         'Data-intensive applications typically require high availability, scalability, and consistency. These systems must handle large volumes of data while maintaining performance and reliability.',
         256, sample_embedding, ARRAY['DataPhoenix', 'Deployer']),
        (book1_id, section1_id, 2,
         'Three important concerns in software design: Reliability (system works correctly even when things go wrong), Scalability (strategies for keeping performance good under increased load), and Maintainability (operability, simplicity, evolvability).',
         312, sample_embedding, ARRAY['DataPhoenix', 'Telemetry']);
         
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample chunks creation failed: %', SQLERRM;
END $$;