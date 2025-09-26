-- Location: supabase/migrations/20250926150459_add_book_processing_pipeline.sql
-- Schema Analysis: Existing AI trading system with ai_agents, generated_documents, orchestrator_state
-- Integration Type: NEW_MODULE - Book processing pipeline functionality 
-- Dependencies: ai_agents, generated_documents, orchestrator_state, user_profiles

-- 1. Types for book processing
CREATE TYPE public.book_processing_status AS ENUM ('pending', 'ingesting', 'extracting', 'completed', 'failed');
CREATE TYPE public.extraction_type AS ENUM ('buy', 'sell', 'alloc', 'risk');
CREATE TYPE public.document_format AS ENUM ('pdf', 'epub', 'docx', 'txt');
CREATE TYPE public.processing_stage AS ENUM ('ocr', 'chunking', 'embedding', 'extraction', 'normalization', 'validation');

-- 2. Book Library Management
CREATE TABLE public.book_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    publication_year INTEGER,
    document_format public.document_format NOT NULL,
    file_size BIGINT,
    file_path TEXT,
    upload_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    processing_status public.book_processing_status DEFAULT 'pending'::public.book_processing_status,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Book Processing Jobs Pipeline
CREATE TABLE public.book_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.book_library(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    processing_stage public.processing_stage NOT NULL,
    status public.book_processing_status DEFAULT 'pending'::public.book_processing_status,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    stage_config JSONB DEFAULT '{}',
    output_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Strategy Extraction Results
CREATE TABLE public.strategy_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.book_library(id) ON DELETE CASCADE,
    processing_job_id UUID REFERENCES public.book_processing_jobs(id) ON DELETE CASCADE,
    extraction_type public.extraction_type NOT NULL,
    strategy_name TEXT NOT NULL,
    strategy_description TEXT,
    parameters JSONB NOT NULL DEFAULT '{}',
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    source_chapter TEXT,
    source_page_range TEXT,
    yaml_output TEXT,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pipeline Registry State
CREATE TABLE public.pipeline_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_version TEXT NOT NULL DEFAULT 'v0.1',
    total_books_processed INTEGER DEFAULT 0,
    total_strategies_extracted INTEGER DEFAULT 0,
    last_processing_date TIMESTAMPTZ,
    deduplication_score DECIMAL(5,2) DEFAULT 0.00,
    confidence_threshold DECIMAL(5,2) DEFAULT 0.70,
    scaling_config JSONB DEFAULT '{}',
    integration_status JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. AI Processing Agents for Books
CREATE TABLE public.book_processing_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL, -- 'knowledge_miner', 'normalizer', 'risk_auditor'
    specialization TEXT[], -- array of specializations
    processing_config JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Essential Indexes for performance
CREATE INDEX idx_book_library_user_id ON public.book_library(user_id);
CREATE INDEX idx_book_library_status ON public.book_library(processing_status);
CREATE INDEX idx_book_processing_jobs_book_id ON public.book_processing_jobs(book_id);
CREATE INDEX idx_book_processing_jobs_status ON public.book_processing_jobs(status);
CREATE INDEX idx_book_processing_jobs_stage ON public.book_processing_jobs(processing_stage);
CREATE INDEX idx_strategy_extractions_book_id ON public.strategy_extractions(book_id);
CREATE INDEX idx_strategy_extractions_type ON public.strategy_extractions(extraction_type);
CREATE INDEX idx_strategy_extractions_confidence ON public.strategy_extractions(confidence_score);
CREATE INDEX idx_book_processing_agents_type ON public.book_processing_agents(agent_type);
CREATE INDEX idx_book_processing_agents_ai_agent ON public.book_processing_agents(ai_agent_id);

-- 8. Functions for pipeline management
CREATE OR REPLACE FUNCTION public.update_pipeline_registry_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.pipeline_registry
    SET 
        total_books_processed = (
            SELECT COUNT(*) FROM public.book_library 
            WHERE processing_status = 'completed'
        ),
        total_strategies_extracted = (
            SELECT COUNT(*) FROM public.strategy_extractions
        ),
        last_processing_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_deduplication_score()
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_strategies INTEGER;
    unique_strategies INTEGER;
    dedup_score DECIMAL(5,2);
BEGIN
    SELECT COUNT(*) INTO total_strategies FROM public.strategy_extractions;
    
    SELECT COUNT(DISTINCT strategy_name) INTO unique_strategies 
    FROM public.strategy_extractions;
    
    IF total_strategies > 0 THEN
        dedup_score := (unique_strategies::DECIMAL / total_strategies::DECIMAL) * 100;
    ELSE
        dedup_score := 0.00;
    END IF;
    
    RETURN dedup_score;
END;
$$;

-- 9. Enable RLS on all tables
ALTER TABLE public.book_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_processing_agents ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_book_library"
ON public.book_library
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_book_processing_jobs"
ON public.book_processing_jobs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_strategy_extractions"
ON public.strategy_extractions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_book_processing_agents"
ON public.book_processing_agents
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read for pipeline registry (system-wide stats)
CREATE POLICY "public_can_read_pipeline_registry"
ON public.pipeline_registry
FOR SELECT
TO public
USING (true);

CREATE POLICY "authenticated_can_update_pipeline_registry"
ON public.pipeline_registry
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 11. Triggers for updated_at columns
CREATE TRIGGER update_book_library_updated_at
    BEFORE UPDATE ON public.book_library
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_processing_jobs_updated_at
    BEFORE UPDATE ON public.book_processing_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_extractions_updated_at
    BEFORE UPDATE ON public.strategy_extractions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipeline_registry_updated_at
    BEFORE UPDATE ON public.pipeline_registry
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_processing_agents_updated_at
    BEFORE UPDATE ON public.book_processing_agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Mock Data for Pipeline Books Registry
DO $$
DECLARE
    existing_user_id UUID;
    admin_user_id UUID;
    book1_id UUID := gen_random_uuid();
    book2_id UUID := gen_random_uuid();
    book3_id UUID := gen_random_uuid();
    job1_id UUID := gen_random_uuid();
    job2_id UUID := gen_random_uuid();
    agent1_id UUID;
    agent2_id UUID;
    registry_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user IDs from existing schema
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO admin_user_id FROM public.user_profiles 
    WHERE id IN (SELECT id FROM auth.users LIMIT 1) LIMIT 1;

    -- Use first available user if specific user not found
    IF admin_user_id IS NULL THEN
        admin_user_id := existing_user_id;
    END IF;

    -- Insert sample books
    INSERT INTO public.book_library (id, title, author, isbn, document_format, file_size, user_id, processing_status, metadata) VALUES
        (book1_id, 'Technical Analysis of Financial Markets', 'John Murphy', '978-0735200661', 'pdf', 15728640, admin_user_id, 'completed', '{"pages": 542, "language": "en", "topics": ["technical_analysis", "chart_patterns", "indicators"]}'),
        (book2_id, 'Options as a Strategic Investment', 'Lawrence McMillan', '978-0735204454', 'pdf', 23456789, admin_user_id, 'completed', '{"pages": 1056, "language": "en", "topics": ["options", "derivatives", "strategies"]}'),
        (book3_id, 'Quantitative Trading Strategies', 'Lars Kestner', '978-0071459556', 'pdf', 12345678, admin_user_id, 'extracting', '{"pages": 320, "language": "en", "topics": ["quantitative", "algorithmic", "backtesting"]}');

    -- Get existing AI agent IDs
    SELECT id INTO agent1_id FROM public.ai_agents WHERE name LIKE '%Momentum%' LIMIT 1;
    SELECT id INTO agent2_id FROM public.ai_agents WHERE name LIKE '%Mean%' LIMIT 1;

    -- Insert book processing agents if AI agents exist
    IF agent1_id IS NOT NULL THEN
        INSERT INTO public.book_processing_agents (ai_agent_id, agent_type, specialization, processing_config, user_id) VALUES
            (agent1_id, 'knowledge_miner', ARRAY['momentum', 'trend_following'], '{"extraction_threshold": 0.75, "pattern_recognition": true}', admin_user_id);
    END IF;

    IF agent2_id IS NOT NULL THEN
        INSERT INTO public.book_processing_agents (ai_agent_id, agent_type, specialization, processing_config, user_id) VALUES
            (agent2_id, 'normalizer', ARRAY['mean_reversion', 'statistical'], '{"yaml_format": "v2.1", "validation_strict": true}', admin_user_id);
    END IF;

    -- Insert processing jobs
    INSERT INTO public.book_processing_jobs (id, book_id, user_id, processing_stage, status, progress_percentage, stage_config) VALUES
        (job1_id, book1_id, admin_user_id, 'completed', 'completed', 100.00, '{"ocr_accuracy": 0.98, "chunks_generated": 2847}'),
        (job2_id, book2_id, admin_user_id, 'completed', 'completed', 100.00, '{"ocr_accuracy": 0.95, "chunks_generated": 4128}');

    -- Insert strategy extractions
    INSERT INTO public.strategy_extractions (book_id, processing_job_id, extraction_type, strategy_name, strategy_description, parameters, confidence_score, source_chapter, yaml_output, user_id) VALUES
        (book1_id, job1_id, 'buy', 'Bollinger RSI Contrarian', 'Bollinger Bands (9) + RSI(14) contrarian strategy', '{"bb_period": 9, "rsi_period": 14, "rsi_oversold": 21, "rsi_overbought": 79}', 0.87, 'Chapter 12: Oscillators', 
         'name: Bollinger_RSI_Contrarian
rules:
  buy: "Close <= LowerBB(9) or RSI < 21"
  sell: "Close >= UpperBB(9) or RSI > 79"
instruments: [equities, futures]
timeframe: daily
risk:
  max_dd: 0.15
  vol_target: 0.20', admin_user_id),
        
        (book1_id, job1_id, 'buy', 'Momentum MA CrossOver', 'Moving Average 10/30 trend following system', '{"ma_fast": 10, "ma_slow": 30, "trend_filter": true}', 0.82, 'Chapter 8: Moving Averages', 
         'name: Momentum_MA_CrossOver
rules:
  buy: "MA(10) > MA(30) and Close > MA(10)"
  sell: "MA(10) < MA(30) and Close < MA(10)"
instruments: [equities, etfs]
timeframe: daily
risk:
  max_dd: 0.12
  vol_target: 0.18', admin_user_id),
  
        (book2_id, job2_id, 'risk', 'Volatility Breakout System', 'ATR-based volatility breakout with k-multiplier', '{"atr_period": 14, "k_multiplier": 2.0, "breakout_confirmation": true}', 0.79, 'Chapter 15: Volatility Analysis',
         'name: Volatility_Breakout
rules:
  buy: "High > HighestHigh(20) + k*ATR(14)"
  sell: "Low < LowestLow(20) - k*ATR(14)"  
instruments: [futures, forex]
timeframe: daily
risk:
  max_dd: 0.20
  vol_target: 0.25', admin_user_id);

    -- Initialize pipeline registry
    INSERT INTO public.pipeline_registry (id, registry_version, total_books_processed, total_strategies_extracted, deduplication_score, scaling_config, integration_status) VALUES
        (registry_id, 'v0.1', 20, 47, 85.30, 
         '{"current_capacity": 20, "target_capacity": 500, "processing_threads": 4, "auto_scaling": true}',
         '{"rocket_integration": true, "api_endpoints": ["/registry", "/scores", "/select", "/allocate"], "backend_status": "active", "express_server": "running"}');

    -- Update registry stats
    PERFORM public.update_pipeline_registry_stats();

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion completed with warnings: %', SQLERRM;
END $$;