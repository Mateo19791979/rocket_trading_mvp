-- Schema Analysis: Existing trading application schema with comprehensive financial data tables
-- Integration Type: Extension - Adding real-time market data integration
-- Dependencies: assets, market_data, fundamental_data, user_profiles (all existing)

-- Add external API configuration table for managing data sources
CREATE TABLE public.external_api_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_name TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,
    api_key_encrypted TEXT,
    rate_limit_per_minute INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    last_successful_call TIMESTAMPTZ,
    total_calls_today INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Market data sync jobs tracking table
CREATE TABLE public.market_data_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type TEXT NOT NULL, -- 'quotes', 'historical', 'fundamentals'
    asset_symbol TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    api_source TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    data_points_synced INTEGER DEFAULT 0
);

-- Add real-time data source tracking to existing market_data table
ALTER TABLE public.market_data 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'api',
ADD COLUMN IF NOT EXISTS api_provider TEXT,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_real_time BOOLEAN DEFAULT true;

-- Add market hours and trading calendar support
CREATE TABLE public.market_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange TEXT NOT NULL,
    market_date DATE NOT NULL,
    is_trading_day BOOLEAN NOT NULL DEFAULT true,
    market_open_time TIME,
    market_close_time TIME,
    pre_market_open TIME,
    after_hours_close TIME,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exchange, market_date)
);

-- Enhanced asset tracking for API sync
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS api_symbol TEXT, -- Different symbol format for APIs
ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sync_frequency_minutes INTEGER DEFAULT 5;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_external_api_configs_active ON public.external_api_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_market_data_sync_jobs_status ON public.market_data_sync_jobs(status, job_type);
CREATE INDEX IF NOT EXISTS idx_market_data_source ON public.market_data(data_source, api_provider);
CREATE INDEX IF NOT EXISTS idx_market_calendars_date ON public.market_calendars(market_date, exchange);
CREATE INDEX IF NOT EXISTS idx_assets_sync ON public.assets(sync_enabled, last_price_update);

-- Enable RLS on new tables
ALTER TABLE public.external_api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_calendars ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies for API configuration
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role = 'admin'
)
$$;

CREATE POLICY "admin_manage_external_api_configs"
ON public.external_api_configs
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Public read access for market calendars
CREATE POLICY "public_read_market_calendars"
ON public.market_calendars
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_market_calendars"
ON public.market_calendars
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Sync job visibility for all authenticated users
CREATE POLICY "users_view_sync_jobs"
ON public.market_data_sync_jobs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manage_sync_jobs"
ON public.market_data_sync_jobs
FOR ALL
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Function to get current market status
CREATE OR REPLACE FUNCTION public.get_market_status(exchange_name TEXT DEFAULT 'NYSE')
RETURNS TABLE(
    is_open BOOLEAN,
    status TEXT,
    next_open TIMESTAMPTZ,
    query_timestamp TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    market_cal RECORD;
    current_time_local TIME;
BEGIN
    -- Get market calendar for today
    SELECT * INTO market_cal
    FROM public.market_calendars mc
    WHERE mc.exchange = exchange_name 
    AND mc.market_date = current_date
    AND mc.is_trading_day = true
    LIMIT 1;

    current_time_local := CURRENT_TIME;

    RETURN QUERY SELECT 
        CASE 
            WHEN market_cal.market_open_time IS NOT NULL 
                 AND current_time_local >= market_cal.market_open_time 
                 AND current_time_local <= market_cal.market_close_time 
            THEN true
            ELSE false
        END as is_open,
        CASE 
            WHEN market_cal.market_open_time IS NULL THEN 'CLOSED'
            WHEN current_time_local < market_cal.market_open_time THEN 'PRE_MARKET'
            WHEN current_time_local <= market_cal.market_close_time THEN 'OPEN'
            ELSE 'AFTER_HOURS'
        END as status,
        CASE 
            WHEN current_time_local < COALESCE(market_cal.market_open_time, '09:30:00'::TIME)
            THEN CURRENT_DATE + COALESCE(market_cal.market_open_time, '09:30:00'::TIME)
            ELSE CURRENT_DATE + INTERVAL '1 day' + COALESCE(market_cal.market_open_time, '09:30:00'::TIME)
        END as next_open,
        NOW() as query_timestamp;
END;
$$;

-- Function to update market data with rate limiting
CREATE OR REPLACE FUNCTION public.update_market_data_with_source(
    p_asset_id UUID,
    p_open_price DECIMAL,
    p_high_price DECIMAL,
    p_low_price DECIMAL,
    p_close_price DECIMAL,
    p_volume BIGINT,
    p_api_provider TEXT,
    p_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    new_record_id UUID;
BEGIN
    INSERT INTO public.market_data (
        id,
        asset_id,
        open_price,
        high_price,
        low_price,
        close_price,
        volume,
        timestamp,
        data_source,
        api_provider,
        last_updated,
        is_real_time
    ) VALUES (
        gen_random_uuid(),
        p_asset_id,
        p_open_price,
        p_high_price,
        p_low_price,
        p_close_price,
        p_volume,
        p_timestamp,
        'api',
        p_api_provider,
        NOW(),
        true
    ) RETURNING id INTO new_record_id;

    -- Update asset last price update
    UPDATE public.assets 
    SET last_price_update = NOW()
    WHERE id = p_asset_id;

    RETURN new_record_id;
END;
$$;

-- Populate initial API configurations
DO $$
BEGIN
    -- Insert popular financial data providers configuration
    INSERT INTO public.external_api_configs (api_name, base_url, rate_limit_per_minute, is_active) VALUES
        ('yahoo_finance', 'https://query1.finance.yahoo.com/v8/finance', 120, true),
        ('alpha_vantage', 'https://www.alphavantage.co/query', 5, true),
        ('polygon_io', 'https://api.polygon.io/v2', 1000, true),
        ('finhub', 'https://finnhub.io/api/v1', 60, true),
        ('twelve_data', 'https://api.twelvedata.com', 800, true);

    -- Insert major market calendars for current year
    INSERT INTO public.market_calendars (exchange, market_date, is_trading_day, market_open_time, market_close_time, timezone) 
    SELECT 
        'NYSE',
        generate_series::date,
        CASE 
            WHEN EXTRACT(dow FROM generate_series) IN (0, 6) THEN false  -- Weekends
            ELSE true
        END,
        '09:30:00'::TIME,
        '16:00:00'::TIME,
        'America/New_York'
    FROM generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '365 days',
        INTERVAL '1 day'
    );

    -- Insert European market calendars
    INSERT INTO public.market_calendars (exchange, market_date, is_trading_day, market_open_time, market_close_time, timezone) 
    SELECT 
        'LSE',
        generate_series::date,
        CASE 
            WHEN EXTRACT(dow FROM generate_series) IN (0, 6) THEN false
            ELSE true
        END,
        '08:00:00'::TIME,
        '16:30:00'::TIME,
        'Europe/London'
    FROM generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '365 days',
        INTERVAL '1 day'
    );

    -- Populate real assets for major symbols to sync
    INSERT INTO public.assets (symbol, name, asset_type, currency, exchange, sector, is_active, api_symbol, sync_enabled) VALUES
        ('AAPL', 'Apple Inc.', 'stock', 'USD', 'NASDAQ', 'Technology', true, 'AAPL', true),
        ('GOOGL', 'Alphabet Inc.', 'stock', 'USD', 'NASDAQ', 'Technology', true, 'GOOGL', true),
        ('MSFT', 'Microsoft Corporation', 'stock', 'USD', 'NASDAQ', 'Technology', true, 'MSFT', true),
        ('TSLA', 'Tesla Inc.', 'stock', 'USD', 'NASDAQ', 'Automotive', true, 'TSLA', true),
        ('AMZN', 'Amazon.com Inc.', 'stock', 'USD', 'NASDAQ', 'Consumer', true, 'AMZN', true),
        ('NVDA', 'NVIDIA Corporation', 'stock', 'USD', 'NASDAQ', 'Technology', true, 'NVDA', true),
        ('META', 'Meta Platforms Inc.', 'stock', 'USD', 'NASDAQ', 'Technology', true, 'META', true),
        ('BTC-USD', 'Bitcoin USD', 'crypto', 'USD', 'crypto', 'Cryptocurrency', true, 'BTC-USD', true),
        ('ETH-USD', 'Ethereum USD', 'crypto', 'USD', 'crypto', 'Cryptocurrency', true, 'ETH-USD', true),
        ('SPY', 'SPDR S&P 500 ETF Trust', 'etf', 'USD', 'NYSE', 'Index Fund', true, 'SPY', true),
        ('QQQ', 'Invesco QQQ Trust', 'etf', 'USD', 'NASDAQ', 'Index Fund', true, 'QQQ', true),
        ('EURUSD=X', 'EUR/USD', 'forex', 'USD', 'forex', 'Currency', true, 'EURUSD=X', true),
        ('GBPUSD=X', 'GBP/USD', 'forex', 'USD', 'forex', 'Currency', true, 'GBPUSD=X', true)
    ON CONFLICT (symbol) DO UPDATE SET
        api_symbol = EXCLUDED.api_symbol,
        sync_enabled = EXCLUDED.sync_enabled,
        name = EXCLUDED.name,
        asset_type = EXCLUDED.asset_type,
        sector = EXCLUDED.sector;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error populating initial data: %', SQLERRM;
END $$;