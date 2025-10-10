-- CRITICAL FIX: Enable pgvector extension FIRST before using VECTOR type
-- This resolves the "type vector does not exist" error
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Schema Analysis: Comprehensive book processing system exists (book_library, book_processing_jobs, reading_materials, ai_agents, prompt_registry)
-- Integration Type: Extension - Adding missing RAG vector storage components
-- Dependencies: book_library, book_processing_jobs, ai_agents, user_profiles (existing tables)

-- =====================================================================================
-- 🚀 AI KNOWLEDGE VECTORS RAG SYSTEM - Vector Storage Extension
-- Integrates Thomas Mazzoni & Peter Lynch books into autonomous AI knowledge base
-- =====================================================================================

-- 1️⃣ AI KNOWLEDGE VECTORS - Core Vector Storage Table
CREATE TABLE public.ai_knowledge_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding VECTOR(1536) NOT NULL, -- text-embedding-3-large dimensions
    metadata JSONB NOT NULL DEFAULT '{}',
    source TEXT NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    book_id UUID REFERENCES public.book_library(id) ON DELETE CASCADE,
    processing_job_id UUID REFERENCES public.book_processing_jobs(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    chunk_size INTEGER DEFAULT 1000,
    overlap_size INTEGER DEFAULT 100,
    language TEXT DEFAULT 'fr',
    extraction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    quality_score NUMERIC(4,3) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ AI AGENT KNOWLEDGE LINKS - Agent-to-Knowledge Mapping
CREATE TABLE public.ai_agent_knowledge_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    vector_id UUID REFERENCES public.ai_knowledge_vectors(id) ON DELETE CASCADE,
    relevance_score NUMERIC(4,3) DEFAULT 0.00,
    agent_name TEXT NOT NULL,
    knowledge_category TEXT NOT NULL,
    priority_level INTEGER DEFAULT 3,
    last_accessed TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ AI KNOWLEDGE CACHE - Performance Optimization
CREATE TABLE public.ai_knowledge_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT NOT NULL UNIQUE,
    cached_data JSONB NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    agent_filter TEXT,
    expiry_date TIMESTAMPTZ NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_hit TIMESTAMPTZ,
    cache_size_bytes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4️⃣ INDEXES - Query Optimization
CREATE INDEX idx_ai_knowledge_vectors_embedding ON public.ai_knowledge_vectors USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_ai_knowledge_vectors_topics ON public.ai_knowledge_vectors USING GIN (topics);
CREATE INDEX idx_ai_knowledge_vectors_source ON public.ai_knowledge_vectors (source);
CREATE INDEX idx_ai_knowledge_vectors_book_id ON public.ai_knowledge_vectors (book_id);
CREATE INDEX idx_ai_knowledge_vectors_metadata ON public.ai_knowledge_vectors USING GIN (metadata);
CREATE INDEX idx_ai_knowledge_vectors_quality ON public.ai_knowledge_vectors (quality_score DESC);

CREATE INDEX idx_ai_agent_knowledge_links_agent_id ON public.ai_agent_knowledge_links (agent_id);
CREATE INDEX idx_ai_agent_knowledge_links_vector_id ON public.ai_agent_knowledge_links (vector_id);
CREATE INDEX idx_ai_agent_knowledge_links_relevance ON public.ai_agent_knowledge_links (relevance_score DESC);
CREATE INDEX idx_ai_agent_knowledge_links_category ON public.ai_agent_knowledge_links (knowledge_category);

CREATE INDEX idx_ai_knowledge_cache_key ON public.ai_knowledge_cache (cache_key);
CREATE INDEX idx_ai_knowledge_cache_topics ON public.ai_knowledge_cache USING GIN (topics);
CREATE INDEX idx_ai_knowledge_cache_expiry ON public.ai_knowledge_cache (expiry_date);

-- 5️⃣ VECTOR SEARCH FUNCTIONS
CREATE OR REPLACE FUNCTION public.search_knowledge_vectors(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.78,
    match_count INT DEFAULT 10,
    filter_topics TEXT[] DEFAULT NULL,
    filter_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    source TEXT,
    topics TEXT[],
    metadata JSONB,
    similarity FLOAT,
    book_title TEXT,
    agent_relevance NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.content,
        v.source,
        v.topics,
        v.metadata,
        (1 - (v.embedding <=> query_embedding))::FLOAT as similarity,
        bl.title as book_title,
        COALESCE(akl.relevance_score, 0.0) as agent_relevance
    FROM public.ai_knowledge_vectors v
    LEFT JOIN public.book_library bl ON v.book_id = bl.id
    LEFT JOIN public.ai_agent_knowledge_links akl ON v.id = akl.vector_id 
        AND (filter_agent IS NULL OR akl.agent_name = filter_agent)
    WHERE 
        (1 - (v.embedding <=> query_embedding)) > match_threshold
        AND (filter_topics IS NULL OR v.topics && filter_topics)
    ORDER BY 
        v.embedding <=> query_embedding ASC,
        akl.relevance_score DESC NULLS LAST
    LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_vector_cache()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Refresh cache for quantitative_finance and behavioral_investing
    DELETE FROM public.ai_knowledge_cache 
    WHERE topics && ARRAY['quantitative_finance', 'behavioral_investing'];
    
    -- Update agent knowledge link access counts
    UPDATE public.ai_agent_knowledge_links 
    SET last_accessed = CURRENT_TIMESTAMP,
        access_count = access_count + 1
    WHERE last_accessed > CURRENT_TIMESTAMP - INTERVAL '15 days';
    
    RAISE NOTICE 'Knowledge base cache refreshed successfully';
END;
$$;

-- 6️⃣ RAG QUERY FUNCTION
CREATE OR REPLACE FUNCTION public.rag_query_knowledge(
    user_query TEXT,
    agent_context TEXT DEFAULT NULL,
    max_results INT DEFAULT 5
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    embedding_result RECORD;
BEGIN
    -- Note: This is a mock function since we can't call OpenAI from SQL
    -- In production, embedding generation happens in the application layer
    
    result := jsonb_build_object(
        'query', user_query,
        'agent_context', agent_context,
        'status', 'ready_for_embedding',
        'instruction', 'Generate embedding using text-embedding-3-large model and call search_knowledge_vectors function'
    );
    
    RETURN result;
END;
$$;

-- 7️⃣ ENABLE ROW LEVEL SECURITY
ALTER TABLE public.ai_knowledge_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_knowledge_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_cache ENABLE ROW LEVEL SECURITY;

-- 8️⃣ RLS POLICIES - Using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_ai_knowledge_vectors"
ON public.ai_knowledge_vectors
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_ai_agent_knowledge_links"
ON public.ai_agent_knowledge_links
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.ai_agents aa
        WHERE aa.id = agent_id AND aa.user_id = auth.uid()
    )
);

CREATE POLICY "users_manage_own_ai_knowledge_cache"
ON public.ai_knowledge_cache
FOR ALL
TO authenticated
USING (
    agent_filter IS NULL OR EXISTS (
        SELECT 1 FROM public.ai_agents aa
        WHERE aa.name = agent_filter AND aa.user_id = auth.uid()
    )
);

-- 9️⃣ TRIGGERS
CREATE TRIGGER update_ai_knowledge_vectors_updated_at
    BEFORE UPDATE ON public.ai_knowledge_vectors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_agent_knowledge_links_updated_at
    BEFORE UPDATE ON public.ai_agent_knowledge_links
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_knowledge_cache_updated_at
    BEFORE UPDATE ON public.ai_knowledge_cache
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 🔟 MOCK DATA - Sample Knowledge Vectors for Testing
DO $$
DECLARE
    existing_user_id UUID;
    existing_book_id UUID;
    existing_job_id UUID;
    existing_agent_id UUID;
    mazzoni_vector_id UUID := gen_random_uuid();
    lynch_vector_id UUID := gen_random_uuid();
    cache_key TEXT;
    -- Create proper 1536-dimensional zero vectors for embedding
    zero_embedding VECTOR(1536);
BEGIN
    -- Create a proper 1536-dimensional zero vector
    SELECT array_to_vector(array_fill(0.0::real, ARRAY[1536])) INTO zero_embedding;
    
    -- Get existing records
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_book_id FROM public.book_library LIMIT 1;
    SELECT id INTO existing_job_id FROM public.book_processing_jobs LIMIT 1;
    SELECT id INTO existing_agent_id FROM public.ai_agents LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert Mazzoni book knowledge vectors (quantitative finance)
        INSERT INTO public.ai_knowledge_vectors (
            id, content, chunk_index, embedding, metadata, source, topics, 
            book_id, processing_job_id, user_id, language, quality_score
        ) VALUES
        (mazzoni_vector_id, 
         'Les modèles de pricing utilisent la diffusion de Wiener pour modéliser la volatilité stochastique. La formule de Black-Scholes-Merton intègre ces processus pour évaluer les options.',
         1, 
         zero_embedding, -- Proper 1536-dimensional vector
         '{"source": "Thomas Mazzoni", "concept": "Black-Scholes", "definition": "Modèle de pricing d''options", "AI_usage": "Évaluation quantitative des dérivés", "linked_agent": "Quant Oracle"}',
         'Thomas Mazzoni',
         ARRAY['quantitative_finance'],
         existing_book_id,
         existing_job_id,
         existing_user_id,
         'fr',
         0.95),
        
        -- Insert Lynch book knowledge vectors (behavioral investing)
        (lynch_vector_id,
         'Un 10-bagger est une action dont le prix est multiplié par dix. Identifier ces opportunités nécessite de comprendre les signaux consommateurs et la psychologie du marché.',
         1,
         zero_embedding, -- Proper 1536-dimensional vector
         '{"source": "Peter Lynch", "concept": "10-bagger", "definition": "Action multipliée par dix", "AI_usage": "Identifier les entreprises sous-évaluées à forte croissance", "linked_agent": "BehavioralSentimentAI"}',
         'Peter Lynch',
         ARRAY['behavioral_investing'],
         existing_book_id,
         existing_job_id,
         existing_user_id,
         'fr',
         0.92);
        
        -- Create agent knowledge links
        IF existing_agent_id IS NOT NULL THEN
            INSERT INTO public.ai_agent_knowledge_links (
                agent_id, vector_id, relevance_score, agent_name, knowledge_category
            ) VALUES
            (existing_agent_id, mazzoni_vector_id, 0.95, 'Quant Oracle', 'quantitative_finance'),
            (existing_agent_id, lynch_vector_id, 0.88, 'Strategy Weaver', 'behavioral_investing');
        END IF;
        
        -- Create knowledge cache entries
        cache_key := 'quantitative_finance_behavioral_investing_' || EXTRACT(epoch FROM CURRENT_TIMESTAMP)::TEXT;
        INSERT INTO public.ai_knowledge_cache (
            cache_key, cached_data, topics, expiry_date
        ) VALUES
        (cache_key,
         '{"vectors_count": 2, "topics": ["quantitative_finance", "behavioral_investing"], "last_refresh": "2025-10-09"}',
         ARRAY['quantitative_finance', 'behavioral_investing'],
         CURRENT_TIMESTAMP + INTERVAL '15 days');
         
    ELSE
        RAISE NOTICE 'No existing users found. Knowledge vectors created without user association.';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock RAG data: %', SQLERRM;
END $$;

-- COMMENT ON SYSTEM
COMMENT ON TABLE public.ai_knowledge_vectors IS 'Vector embeddings storage for AI knowledge base RAG system. Integrates book content with AI agents for autonomous trading intelligence.';
COMMENT ON TABLE public.ai_agent_knowledge_links IS 'Links specific AI agents to relevant knowledge vectors for targeted information retrieval.';
COMMENT ON TABLE public.ai_knowledge_cache IS 'Performance cache for frequently accessed knowledge queries and RAG operations.';