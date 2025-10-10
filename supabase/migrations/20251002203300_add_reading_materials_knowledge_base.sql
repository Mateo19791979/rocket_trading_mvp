-- Location: supabase/migrations/20251002203300_add_reading_materials_knowledge_base.sql
-- Schema Analysis: Existing book_library, ai_agents, book_processing_agents tables
-- Integration Type: Extension - adding knowledge base mapping functionality  
-- Dependencies: book_library, ai_agents tables (existing)

-- Create reading materials table to map books to AI agents
CREATE TABLE public.reading_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.book_library(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    applies_to JSONB DEFAULT '[]'::jsonb,
    purpose TEXT,
    page_count INTEGER DEFAULT 0,
    cover_image_url TEXT,
    key_topics JSONB DEFAULT '[]'::jsonb,
    agent_mappings JSONB DEFAULT '{}'::jsonb,
    reading_progress NUMERIC DEFAULT 0.00,
    difficulty_level TEXT DEFAULT 'intermediate',
    priority_level INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_reading_materials_book_id ON public.reading_materials(book_id);
CREATE INDEX idx_reading_materials_title ON public.reading_materials(title);
CREATE INDEX idx_reading_materials_author ON public.reading_materials(author);
CREATE INDEX idx_reading_materials_difficulty ON public.reading_materials(difficulty_level);
CREATE INDEX idx_reading_materials_priority ON public.reading_materials(priority_level);

-- Enable RLS
ALTER TABLE public.reading_materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - public read access for knowledge base
CREATE POLICY "public_can_read_reading_materials"
ON public.reading_materials
FOR SELECT
TO public
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_reading_materials_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_reading_materials_updated_at
    BEFORE UPDATE ON public.reading_materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reading_materials_updated_at();

-- Insert the 7 books from the user's knowledge base
DO $$
DECLARE
    dda_id UUID := gen_random_uuid();
    bsrs_id UUID := gen_random_uuid();
    sre_wb_id UUID := gen_random_uuid();
    afml_id UUID := gen_random_uuid();
    sat_id UUID := gen_random_uuid();
    phoenix_id UUID := gen_random_uuid();
    signals_id UUID := gen_random_uuid();
BEGIN
    -- Insert reading materials with detailed mappings
    INSERT INTO public.reading_materials (
        id, title, author, applies_to, purpose, page_count, 
        key_topics, agent_mappings, difficulty_level, priority_level
    ) VALUES
        (
            dda_id,
            'Designing Data-Intensive Applications',
            'Martin Kleppmann',
            '["Data Phoenix", "Deployer", "Telemetry"]'::jsonb,
            'Modèles de données, logs immuables, reprise',
            590,
            '["CQRS", "Event Sourcing", "Distributed Systems", "Data Modeling", "Fault Tolerance"]'::jsonb,
            '{
                "Data Phoenix": {"confidence": 0.95, "chapters": ["Chapter 3", "Chapter 5", "Chapter 11"]},
                "Deployer": {"confidence": 0.85, "chapters": ["Chapter 8", "Chapter 9"]},
                "Telemetry": {"confidence": 0.80, "chapters": ["Chapter 4", "Chapter 10"]}
            }'::jsonb,
            'advanced',
            1
        ),
        (
            bsrs_id,
            'Building Secure and Reliable Systems',
            'Google SRE/Security',
            '["Compliance Guard", "KillSwitch", "Deployer"]'::jsonb,
            'Menaces, contrôle des changements, sécurité par défaut',
            520,
            '["Security", "Risk Management", "Change Control", "Threat Modeling"]'::jsonb,
            '{
                "Compliance Guard": {"confidence": 0.98, "chapters": ["Chapter 4", "Chapter 6", "Chapter 7"]},
                "KillSwitch": {"confidence": 0.90, "chapters": ["Chapter 12", "Chapter 13"]},
                "Deployer": {"confidence": 0.85, "chapters": ["Chapter 14", "Chapter 15"]}
            }'::jsonb,
            'advanced',
            1
        ),
        (
            sre_wb_id,
            'The Site Reliability Workbook',
            'Google SRE',
            '["Telemetry", "Deployer", "Immune Sentinel"]'::jsonb,
            'SLO/SLI, alerting, post-mortems',
            480,
            '["SLO", "SLI", "Alerting", "Incident Response", "Monitoring"]'::jsonb,
            '{
                "Telemetry": {"confidence": 0.95, "chapters": ["Chapter 2", "Chapter 4", "Chapter 5"]},
                "Deployer": {"confidence": 0.88, "chapters": ["Chapter 16", "Chapter 17"]},
                "Immune Sentinel": {"confidence": 0.92, "chapters": ["Chapter 10", "Chapter 11"]}
            }'::jsonb,
            'intermediate',
            1
        ),
        (
            afml_id,
            'Advances in Financial Machine Learning',
            'Marcos López de Prado',
            '["Quant Oracle", "Strategy Weaver", "Correlation Hunter"]'::jsonb,
            'Labeling, validation OOS, anti-sur-optimisation',
            400,
            '["Triple Barrier", "Meta Labeling", "Backtesting", "Feature Engineering", "Overfitting"]'::jsonb,
            '{
                "Quant Oracle": {"confidence": 0.98, "chapters": ["Chapter 3", "Chapter 4", "Chapter 7"]},
                "Strategy Weaver": {"confidence": 0.93, "chapters": ["Chapter 10", "Chapter 12"]},
                "Correlation Hunter": {"confidence": 0.87, "chapters": ["Chapter 2", "Chapter 17"]}
            }'::jsonb,
            'advanced',
            2
        ),
        (
            sat_id,
            'Successful Algorithmic Trading',
            'Michael Halls-Moore',
            '["Execution Guru", "Quant Oracle"]'::jsonb,
            'Pipeline backtest, coûts, exécution event-driven',
            350,
            '["Backtesting", "Event-Driven Architecture", "Transaction Costs", "Risk Management"]'::jsonb,
            '{
                "Execution Guru": {"confidence": 0.96, "chapters": ["Chapter 8", "Chapter 10", "Chapter 12"]},
                "Quant Oracle": {"confidence": 0.90, "chapters": ["Chapter 4", "Chapter 6"]}
            }'::jsonb,
            'intermediate',
            2
        ),
        (
            phoenix_id,
            'The Phoenix Project',
            'Gene Kim et al.',
            '["Deployer", "FinOps", "DataGov"]'::jsonb,
            'Flux DevOps, WIP limits, time-to-value',
            300,
            '["DevOps", "Theory of Constraints", "Lean", "Continuous Delivery", "Cultural Change"]'::jsonb,
            '{
                "Deployer": {"confidence": 0.94, "chapters": ["Chapter 15", "Chapter 20", "Chapter 25"]},
                "FinOps": {"confidence": 0.82, "chapters": ["Chapter 30", "Chapter 32"]},
                "DataGov": {"confidence": 0.78, "chapters": ["Chapter 18", "Chapter 22"]}
            }'::jsonb,
            'beginner',
            3
        ),
        (
            signals_id,
            'The Signals Are Talking',
            'Amy Webb',
            '["NewsMiner", "Community Pulse", "Narrative Builder"]'::jsonb,
            'Veille signaux faibles, cadrage idées',
            320,
            '["Trend Analysis", "Signal Detection", "Future Forecasting", "Strategic Planning"]'::jsonb,
            '{
                "NewsMiner": {"confidence": 0.91, "chapters": ["Chapter 2", "Chapter 4", "Chapter 6"]},
                "Community Pulse": {"confidence": 0.88, "chapters": ["Chapter 8", "Chapter 9"]},
                "Narrative Builder": {"confidence": 0.85, "chapters": ["Chapter 10", "Chapter 12"]}
            }'::jsonb,
            'intermediate',
            3
        );

    -- Log successful insertion
    RAISE NOTICE 'Successfully inserted % reading materials', 7;

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Some reading materials already exist, skipping duplicates';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents insertion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting reading materials: %', SQLERRM;
END $$;

-- Create function to get reading materials with agent mappings
CREATE OR REPLACE FUNCTION public.get_reading_materials_with_agents()
RETURNS TABLE(
    id UUID,
    title TEXT,
    author TEXT,
    applies_to JSONB,
    purpose TEXT,
    page_count INTEGER,
    cover_image_url TEXT,
    key_topics JSONB,
    agent_mappings JSONB,
    reading_progress NUMERIC,
    difficulty_level TEXT,
    priority_level INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    rm.id,
    rm.title,
    rm.author,
    rm.applies_to,
    rm.purpose,
    rm.page_count,
    rm.cover_image_url,
    rm.key_topics,
    rm.agent_mappings,
    rm.reading_progress,
    rm.difficulty_level,
    rm.priority_level,
    rm.created_at,
    rm.updated_at
FROM public.reading_materials rm
ORDER BY rm.priority_level ASC, rm.title ASC;
$$;

-- Create function to search reading materials
CREATE OR REPLACE FUNCTION public.search_reading_materials(search_term TEXT)
RETURNS TABLE(
    id UUID,
    title TEXT,
    author TEXT,
    applies_to JSONB,
    purpose TEXT,
    page_count INTEGER,
    key_topics JSONB,
    agent_mappings JSONB,
    relevance_score NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    rm.id,
    rm.title,
    rm.author,
    rm.applies_to,
    rm.purpose,
    rm.page_count,
    rm.key_topics,
    rm.agent_mappings,
    (
        CASE 
            WHEN LOWER(rm.title) LIKE LOWER('%' || search_term || '%') THEN 1.0
            WHEN LOWER(rm.author) LIKE LOWER('%' || search_term || '%') THEN 0.8
            WHEN LOWER(rm.purpose) LIKE LOWER('%' || search_term || '%') THEN 0.6
            ELSE 0.3
        END
    ) as relevance_score
FROM public.reading_materials rm
WHERE 
    LOWER(rm.title) LIKE LOWER('%' || search_term || '%') OR
    LOWER(rm.author) LIKE LOWER('%' || search_term || '%') OR
    LOWER(rm.purpose) LIKE LOWER('%' || search_term || '%') OR
    EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(rm.key_topics) topic
        WHERE LOWER(topic) LIKE LOWER('%' || search_term || '%')
    )
ORDER BY relevance_score DESC, rm.priority_level ASC;
$$;