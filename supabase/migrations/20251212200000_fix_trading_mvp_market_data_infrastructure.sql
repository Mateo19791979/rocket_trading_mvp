-- =========================== 
-- (A) SUPABASE — ROBUST SCHEMA PATCH 
-- ===========================  

-- 1) Check if market_data table exists and fix schema
DO $$
BEGIN
    -- Check if table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'market_data') THEN
        CREATE TABLE public.market_data (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            symbol text NOT NULL,
            price numeric NOT NULL,
            ts timestamptz NOT NULL DEFAULT now(),
            source text NOT NULL,
            response_time_ms integer,
            meta jsonb,
            created_at timestamptz DEFAULT now()
        );
    ELSE
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_data' AND column_name = 'symbol') THEN
            ALTER TABLE public.market_data ADD COLUMN symbol text NOT NULL DEFAULT 'UNKNOWN';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_data' AND column_name = 'price') THEN
            ALTER TABLE public.market_data ADD COLUMN price numeric NOT NULL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_data' AND column_name = 'ts') THEN
            ALTER TABLE public.market_data ADD COLUMN ts timestamptz NOT NULL DEFAULT now();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_data' AND column_name = 'source') THEN
            ALTER TABLE public.market_data ADD COLUMN source text NOT NULL DEFAULT 'unknown';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_data' AND column_name = 'response_time_ms') THEN
            ALTER TABLE public.market_data ADD COLUMN response_time_ms integer;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_data' AND column_name = 'meta') THEN
            ALTER TABLE public.market_data ADD COLUMN meta jsonb;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'market_data' AND column_name = 'created_at') THEN
            ALTER TABLE public.market_data ADD COLUMN created_at timestamptz DEFAULT now();
        END IF;
    END IF;
END $$;

-- 2) Drop any restrictive constraints on source column
ALTER TABLE public.market_data DROP CONSTRAINT IF EXISTS market_data_source_check;
ALTER TABLE public.market_data DROP CONSTRAINT IF EXISTS market_data_source_key;

-- 3) Create indexes only if they don't exist (safe approach)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'market_data' AND indexname = 'ix_market_data_symbol_ts') THEN
        CREATE INDEX ix_market_data_symbol_ts ON public.market_data(symbol, ts DESC);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'market_data' AND indexname = 'ix_market_data_source') THEN
        CREATE INDEX ix_market_data_source ON public.market_data(source);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'market_data' AND indexname = 'ix_market_data_created_at') THEN
        CREATE INDEX ix_market_data_created_at ON public.market_data(created_at DESC);
    END IF;
END $$;

-- 4) Health ping function for frontend diagnostics
CREATE OR REPLACE FUNCTION public.health_ping() 
RETURNS text 
LANGUAGE sql 
STABLE 
AS $$
    SELECT 'ok'::text;
$$;

-- 5) Database ping function with more details
CREATE OR REPLACE FUNCTION public.db_diagnostics() 
RETURNS jsonb 
LANGUAGE plpgsql 
AS $$
DECLARE
    result jsonb;
    table_count integer;
    market_data_count integer;
BEGIN
    -- Count total tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- Count market_data rows
    SELECT COUNT(*) INTO market_data_count 
    FROM public.market_data;
    
    result := jsonb_build_object(
        'status', 'healthy',
        'timestamp', now(),
        'tables_count', table_count,
        'market_data_rows', market_data_count,
        'database_version', version()
    );
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'status', 'error',
        'error_message', SQLERRM,
        'timestamp', now()
    );
END $$;

-- 6) Enhanced RLS policies
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS md_all_service ON public.market_data;
DROP POLICY IF EXISTS market_data_service_policy ON public.market_data;
DROP POLICY IF EXISTS market_data_read_policy ON public.market_data;

-- Create comprehensive RLS policies
CREATE POLICY market_data_service_full_access ON public.market_data 
FOR ALL USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY market_data_anon_read ON public.market_data 
FOR SELECT USING (auth.role() = 'anon');

CREATE POLICY market_data_authenticated_read ON public.market_data 
FOR SELECT USING (auth.role() = 'authenticated');

-- 7) Market data helper functions
CREATE OR REPLACE FUNCTION public.get_latest_market_data(p_symbol text DEFAULT 'AAPL')
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'symbol', symbol,
        'price', price,
        'source', source,
        'timestamp', ts,
        'response_time_ms', response_time_ms,
        'meta', meta
    ) INTO result
    FROM public.market_data 
    WHERE symbol = UPPER(p_symbol)
    ORDER BY ts DESC 
    LIMIT 1;
    
    IF result IS NULL THEN
        result := jsonb_build_object(
            'symbol', UPPER(p_symbol),
            'error', 'No data found',
            'timestamp', now()
        );
    END IF;
    
    RETURN result;
END $$;

-- 8) Provider normalization function
CREATE OR REPLACE FUNCTION public.normalize_provider_source(p_source text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    CASE LOWER(p_source)
        WHEN 'polygon_io', 'polygonio' THEN RETURN 'polygon';
        WHEN 'alpha_vantage', 'alphavantage' THEN RETURN 'alpha_vantage';
        WHEN 'yahoo_finance', 'yahoofinance' THEN RETURN 'yahoo';
        WHEN 'finnhub_io', 'finnhub' THEN RETURN 'finnhub';
        ELSE RETURN COALESCE(LOWER(p_source), 'unknown');
    END CASE;
END $$;

-- 9) Insert sample data for testing (only if table is empty)
DO $$
DECLARE
    row_count integer;
BEGIN
    SELECT COUNT(*) INTO row_count FROM public.market_data;
    
    IF row_count = 0 THEN
        INSERT INTO public.market_data (symbol, price, source, response_time_ms, meta) VALUES
        ('AAPL', 175.50, 'polygon', 120, '{"volume": 50000000, "change": 2.5}'),
        ('GOOGL', 2800.25, 'alpha_vantage', 200, '{"volume": 25000000, "change": -15.75}'),
        ('MSFT', 380.75, 'yahoo', 150, '{"volume": 30000000, "change": 5.25}'),
        ('TSLA', 250.00, 'polygon', 130, '{"volume": 80000000, "change": 10.50}'),
        ('AMZN', 145.30, 'finnhub', 180, '{"volume": 35000000, "change": -3.20}');
    END IF;
END $$;

-- 10) Grant necessary permissions
GRANT ALL ON public.market_data TO service_role;
GRANT SELECT ON public.market_data TO anon;
GRANT SELECT ON public.market_data TO authenticated;

-- 11) Create market data sync job status table
CREATE TABLE IF NOT EXISTS public.market_data_sync_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider text NOT NULL,
    symbol text NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz,
    error_message text,
    records_processed integer DEFAULT 0,
    meta jsonb,
    created_at timestamptz DEFAULT now()
);

-- RLS for sync jobs
ALTER TABLE public.market_data_sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY sync_jobs_service_access ON public.market_data_sync_jobs 
FOR ALL USING (auth.role() = 'service_role') 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY sync_jobs_read_access ON public.market_data_sync_jobs 
FOR SELECT USING (auth.role() IN ('anon', 'authenticated'));

GRANT ALL ON public.market_data_sync_jobs TO service_role;
GRANT SELECT ON public.market_data_sync_jobs TO anon;
GRANT SELECT ON public.market_data_sync_jobs TO authenticated;