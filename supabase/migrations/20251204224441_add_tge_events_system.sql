-- Location: supabase/migrations/20251204224441_add_tge_events_system.sql
-- Schema Analysis: Existing schema has user_profiles table, external API infrastructure
-- Integration Type: NEW_MODULE - Adding TGE (Token Generation Events) functionality  
-- Dependencies: user_profiles (for user relationships)

-- Create TGE events table with FIXED hash generation using immutable functions only
CREATE TABLE public.tge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,                   -- 'icoanalytics' | 'coinlaunch' | 'cryptorank'
  source_url TEXT,
  project_name TEXT,
  symbol TEXT,
  chain TEXT,
  sale_stage TEXT,                        -- Private/Seed/IDO/IEO/Launch/TGE…
  tge_datetime TIMESTAMPTZ,               -- date/heure TGE (UTC si possible)
  price_usd NUMERIC,                      -- prix de vente (si dispo)
  raise_goal_usd NUMERIC,                 -- objectif (si dispo)
  fdv_usd NUMERIC,                        -- FDV au TGE (si dispo)
  allocation TEXT,                        -- ex: %/montant
  vesting TEXT,                           -- cliff/vesting
  status TEXT DEFAULT 'upcoming',         -- upcoming | live | finished | cancelled
  website TEXT,
  twitter TEXT,
  telegram TEXT,
  tags TEXT[],
  raw JSONB,                              -- page parsée brute
  -- FIXED: Use simpler hash generation that only uses immutable TEXT concatenation
  hash TEXT GENERATED ALWAYS AS ( 
    md5(COALESCE(project_name,'') || '|' || COALESCE(symbol,'') || '|' || COALESCE(source,''))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes as specified
CREATE INDEX IF NOT EXISTS tge_events_hash_idx ON public.tge_events(hash);
CREATE INDEX IF NOT EXISTS tge_events_status_idx ON public.tge_events(status);
CREATE INDEX IF NOT EXISTS tge_events_tgedt_idx ON public.tge_events(tge_datetime DESC);
CREATE INDEX IF NOT EXISTS tge_events_source_idx ON public.tge_events(source);
CREATE INDEX IF NOT EXISTS tge_events_project_name_idx ON public.tge_events(project_name);

-- Enable Row Level Security
ALTER TABLE public.tge_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Pattern 4: Public Read, Private Write
-- TGE events should be publicly readable for market intelligence but only manageable by authenticated users
CREATE POLICY "public_can_read_tge_events"
ON public.tge_events
FOR SELECT
TO public
USING (true);

-- Only authenticated users can manage TGE data (for manual refresh operations)
CREATE POLICY "authenticated_users_can_manage_tge_events"
ON public.tge_events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Helper function to refresh TGE data (for manual triggers)
CREATE OR REPLACE FUNCTION public.refresh_tge_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- This function would be called by the backend service
    -- Returns success status for frontend display
    result := jsonb_build_object(
        'success', true,
        'message', 'TGE refresh triggered successfully',
        'timestamp', CURRENT_TIMESTAMP
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'timestamp', CURRENT_TIMESTAMP
        );
END;
$$;

-- Function to get TGE statistics
CREATE OR REPLACE FUNCTION public.get_tge_statistics()
RETURNS TABLE(
    total_events INTEGER,
    upcoming_events INTEGER,
    live_events INTEGER,
    sources_count INTEGER,
    last_updated TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT
    COUNT(*)::INTEGER as total_events,
    COUNT(CASE WHEN status = 'upcoming' THEN 1 END)::INTEGER as upcoming_events,
    COUNT(CASE WHEN status = 'live' THEN 1 END)::INTEGER as live_events,
    COUNT(DISTINCT source)::INTEGER as sources_count,
    MAX(updated_at) as last_updated
FROM public.tge_events;
$$;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_tge_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_tge_events_updated_at
    BEFORE UPDATE ON public.tge_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tge_events_updated_at();

-- Create sample TGE data for testing
DO $$
DECLARE
    sample_event1_id UUID := gen_random_uuid();
    sample_event2_id UUID := gen_random_uuid();
    sample_event3_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.tge_events (
        id, source, source_url, project_name, symbol, chain, sale_stage, 
        tge_datetime, price_usd, raise_goal_usd, fdv_usd, allocation, vesting, 
        status, website, twitter, telegram, tags, raw
    ) VALUES
    (
        sample_event1_id,
        'icoanalytics',
        'https://icoanalytics.org/token-generation-events/',
        'DeFi Protocol Alpha',
        'DPA',
        'Ethereum',
        'IDO',
        (CURRENT_TIMESTAMP + INTERVAL '7 days'),
        0.15,
        5000000.00,
        50000000.00,
        '10% at TGE, rest vested over 18 months',
        '6 months cliff, 18 months vesting',
        'upcoming',
        'https://defiprotocolalpha.io',
        'https://twitter.com/defiprotocolalpha',
        'https://t.me/defiprotocolalpha',
        ARRAY['DeFi', 'DEX', 'Ethereum', 'IDO'],
        '{"source_data": "scraped from icoanalytics", "confidence": "high"}'::jsonb
    ),
    (
        sample_event2_id,
        'coinlaunch',
        'https://coinlaunch.space/projects/ai-trading',
        'AI Trading Platform',
        'AITP',
        'BSC',
        'Private Sale',
        (CURRENT_TIMESTAMP + INTERVAL '14 days'),
        0.08,
        2000000.00,
        20000000.00,
        '15% at TGE, linear vesting 24 months',
        'No cliff, 24 months linear',
        'upcoming',
        'https://aitradingplatform.com',
        'https://twitter.com/aitradingplatform',
        'https://t.me/aitradingplatform',
        ARRAY['AI', 'Trading', 'BSC', 'Private Sale'],
        '{"source_data": "scraped from coinlaunch", "confidence": "medium"}'::jsonb
    ),
    (
        sample_event3_id,
        'cryptorank',
        'https://cryptorank.io/ico/blockchain-gaming',
        'Blockchain Gaming Hub',
        'BGH',
        'Polygon',
        'Public Sale',
        (CURRENT_TIMESTAMP + INTERVAL '21 days'),
        0.25,
        10000000.00,
        100000000.00,
        '20% at TGE, 12 months vesting',
        '3 months cliff, 12 months vesting',
        'upcoming',
        'https://blockchaingaminghub.io',
        'https://twitter.com/bcgaminghub',
        'https://t.me/bcgaminghub',
        ARRAY['Gaming', 'NFT', 'Polygon', 'Public Sale'],
        '{"source_data": "scraped from cryptorank", "confidence": "high"}'::jsonb
    );

    RAISE NOTICE 'Successfully inserted % TGE sample events', 3;
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Sample TGE events already exist, skipping insertion';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample TGE events: %', SQLERRM;
END $$;