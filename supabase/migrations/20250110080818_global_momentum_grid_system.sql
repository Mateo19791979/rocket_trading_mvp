-- source: api
-- user: 99566e02-0f29-4f09-bc25-39d802c96d65
-- date: 2025-10-10T07:42:09.650Z

-- Schema Analysis: Existing comprehensive trading platform with ai_agents, portfolios, user_profiles
-- Integration Type: Addition - Adding Global Momentum Grid with multi-regional agents
-- Dependencies: Existing user_profiles, ai_agents tables for regional allocation system

-- ===================================================================== 
-- (A) SUPABASE — SCHÉMA GLOBAL MOMENTUM GRID (idempotent) 
-- =====================================================================  

-- Régions & marchés
CREATE TABLE IF NOT EXISTS public.regions (
    code TEXT PRIMARY KEY,          -- 'ASIA', 'EU', 'US', 'LATAM', 'CRYPTO'
    name TEXT NOT NULL,
    tz TEXT NOT NULL DEFAULT 'UTC', -- IANA TZ (indicatif)
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.regions(code,name,tz) VALUES
    ('ASIA','Asia-Pacific','Asia/Tokyo'),
    ('EU','Europe','Europe/Paris'),
    ('US','Americas','America/New_York'),
    ('LATAM','Latin America','America/Sao_Paulo'),
    ('CRYPTO','Crypto 24/7','UTC') 
ON CONFLICT (code) DO NOTHING;

-- Fenêtres de sessions (UTC) par région (multi-segments si besoin)
CREATE TABLE IF NOT EXISTS public.market_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT REFERENCES public.regions(code) ON DELETE CASCADE,
    start_utc TIME NOT NULL,
    end_utc TIME NOT NULL,
    days TEXT NOT NULL DEFAULT '1,2,3,4,5', -- jours de la semaine (1=Lundi…7=Dim)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Sessions par défaut
INSERT INTO public.market_sessions(region_code, start_utc, end_utc, days) VALUES
    ('ASIA','00:00','09:00','1,2,3,4,5'),
    ('EU','07:00','16:30','1,2,3,4,5'),
    ('US','13:30','22:00','1,2,3,4,5'),
    ('LATAM','14:00','00:00','1,2,3,4,5'),
    ('CRYPTO','00:00','23:59','1,2,3,4,5,6,7') 
ON CONFLICT DO NOTHING;

-- Catalogue d'agents par région (multiples stratégies par région)
CREATE TABLE IF NOT EXISTS public.regional_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT REFERENCES public.regions(code) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,           -- ex. 'Asia_Momentum_01'
    kind TEXT NOT NULL,                 -- 'momentum','arbitrage','meanrev','vol','macro','crypto-arb'...
    status TEXT NOT NULL DEFAULT 'idle',-- 'idle','running','paused','error'
    weight NUMERIC NOT NULL DEFAULT 1.0,-- poids relatif interne region
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(region_code, agent_name)
);

-- Signaux de momentum agrégés par région (feed temps réel par vos services)
CREATE TABLE IF NOT EXISTS public.momentum_signals (
    ts TIMESTAMPTZ NOT NULL,
    region_code TEXT REFERENCES public.regions(code) ON DELETE CASCADE,
    lmi NUMERIC NOT NULL,              -- Local Momentum Index (0..1)
    vol NUMERIC,                       -- volatilité normalisée
    corr NUMERIC,                      -- corrélation intra/extra région (optionnel)
    details JSONB,
    PRIMARY KEY(ts, region_code)
);

-- Politique d'allocation globale (AAS) par région
CREATE TABLE IF NOT EXISTS public.capital_policy (
    region_code TEXT PRIMARY KEY REFERENCES public.regions(code) ON DELETE CASCADE,
    target_pct NUMERIC NOT NULL DEFAULT 0.0,   -- part du capital visée 0..1
    min_pct NUMERIC NOT NULL DEFAULT 0.00,
    max_pct NUMERIC NOT NULL DEFAULT 0.60,
    temp NUMERIC NOT NULL DEFAULT 1.0,         -- température softmax
    decay NUMERIC NOT NULL DEFAULT 0.05,       -- lissage EMA
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.capital_policy(region_code,target_pct,min_pct,max_pct,temp,decay) VALUES
    ('ASIA',0.20,0.05,0.50,0.9,0.05),
    ('EU',0.20,0.05,0.50,0.9,0.05),
    ('US',0.35,0.10,0.70,0.9,0.05),
    ('LATAM',0.10,0.00,0.30,1.0,0.05),
    ('CRYPTO',0.15,0.00,0.50,0.8,0.05) 
ON CONFLICT (region_code) DO UPDATE SET region_code=excluded.region_code;

-- Allocation effective courante (journalisée pour audit & UI)
CREATE TABLE IF NOT EXISTS public.capital_allocation_log (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_equity NUMERIC,                -- capital net (facultatif)
    allocation JSONB NOT NULL            -- {ASIA:0.22, EU:0.18, ...} après contraintes
);

-- Index utiles
CREATE INDEX IF NOT EXISTS momentum_signals_region_ts_idx ON public.momentum_signals(region_code, ts DESC);
CREATE INDEX IF NOT EXISTS regional_agents_region_idx ON public.regional_agents(region_code, status);
CREATE INDEX IF NOT EXISTS capital_policy_region_idx ON public.capital_policy(region_code);
CREATE INDEX IF NOT EXISTS capital_allocation_log_ts_idx ON public.capital_allocation_log(ts DESC);

-- RLS Setup
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momentum_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_allocation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Pattern 6A (Admin from auth metadata)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- Public read access for monitoring, admin management
CREATE POLICY "public_read_regions"
ON public.regions
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_regions"
ON public.regions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "public_read_market_sessions"
ON public.market_sessions
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_market_sessions"
ON public.market_sessions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "public_read_regional_agents"
ON public.regional_agents
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_regional_agents"
ON public.regional_agents
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "public_read_momentum_signals"
ON public.momentum_signals
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_momentum_signals"
ON public.momentum_signals
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "public_read_capital_policy"
ON public.capital_policy
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_capital_policy"
ON public.capital_policy
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "public_read_capital_allocation_log"
ON public.capital_allocation_log
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_capital_allocation_log"
ON public.capital_allocation_log
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Functions for AI agent orchestration
CREATE OR REPLACE FUNCTION public.gmg_latest_signals()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    result JSONB := '{}'::jsonb;
    region_record RECORD;
BEGIN
    FOR region_record IN 
        SELECT r.code, 
               ms.lmi, 
               ms.vol, 
               ms.corr, 
               ms.ts,
               ms.details
        FROM public.regions r
        LEFT JOIN LATERAL (
            SELECT lmi, vol, corr, ts, details
            FROM public.momentum_signals
            WHERE region_code = r.code
            ORDER BY ts DESC
            LIMIT 1
        ) ms ON true
        WHERE r.enabled = true
    LOOP
        result := result || jsonb_build_object(
            region_record.code,
            jsonb_build_object(
                'lmi', COALESCE(region_record.lmi, 0),
                'vol', COALESCE(region_record.vol, 0),
                'corr', COALESCE(region_record.corr, 0),
                'ts', region_record.ts,
                'details', COALESCE(region_record.details, '{}'::jsonb)
            )
        );
    END LOOP;
    
    RETURN result;
END;
$func$;

CREATE OR REPLACE FUNCTION public.update_agent_state(
    p_region_code TEXT,
    p_agent_name TEXT,
    p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    UPDATE public.regional_agents
    SET status = p_status
    WHERE region_code = p_region_code
    AND agent_name = p_agent_name;
END;
$func$;

CREATE OR REPLACE FUNCTION public.log_capital_allocation(
    p_allocation JSONB,
    p_total_equity NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.capital_allocation_log (allocation, total_equity)
    VALUES (p_allocation, p_total_equity)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$func$;

-- Triggers for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $trigger$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$trigger$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_capital_policy_updated_at
    BEFORE UPDATE ON public.capital_policy
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize sample momentum signals and regional agents
DO $init$
DECLARE
    asia_agents TEXT[] := ARRAY['Asia_Momentum_01', 'Asia_Arbitrage_01', 'Asia_MeanRev_01', 'Asia_Vol_01', 'Asia_Macro_01', 'Asia_CryptoArb_01'];
    eu_agents TEXT[] := ARRAY['EU_Momentum_01', 'EU_Arbitrage_01', 'EU_MeanRev_01', 'EU_Vol_01', 'EU_Macro_01', 'EU_CryptoArb_01'];
    us_agents TEXT[] := ARRAY['US_Momentum_01', 'US_Arbitrage_01', 'US_MeanRev_01', 'US_Vol_01', 'US_Macro_01', 'US_CryptoArb_01'];
    latam_agents TEXT[] := ARRAY['LATAM_Momentum_01', 'LATAM_Arbitrage_01', 'LATAM_MeanRev_01', 'LATAM_Vol_01', 'LATAM_Macro_01'];
    crypto_agents TEXT[] := ARRAY['CRYPTO_Momentum_01', 'CRYPTO_Arbitrage_01', 'CRYPTO_MeanRev_01', 'CRYPTO_Vol_01', 'CRYPTO_CryptoArb_01'];
    current_agent_name TEXT;
    current_agent_kind TEXT;
    i INTEGER;
BEGIN
    -- Initialize ASIA agents
    FOR i IN 1..array_length(asia_agents, 1) LOOP
        current_agent_name := asia_agents[i];
        current_agent_kind := CASE 
            WHEN current_agent_name LIKE '%Momentum%' THEN 'momentum'
            WHEN current_agent_name LIKE '%Arbitrage%' THEN 'arbitrage'  
            WHEN current_agent_name LIKE '%MeanRev%' THEN 'meanrev'
            WHEN current_agent_name LIKE '%Vol%' THEN 'vol'
            WHEN current_agent_name LIKE '%Macro%' THEN 'macro'
            WHEN current_agent_name LIKE '%CryptoArb%' THEN 'crypto-arb'
        END;
        
        INSERT INTO public.regional_agents (region_code, agent_name, kind, status, weight)
        VALUES ('ASIA', current_agent_name, current_agent_kind, 'idle', 1.0)
        ON CONFLICT (region_code, agent_name) DO NOTHING;
    END LOOP;
    
    -- Initialize EU agents
    FOR i IN 1..array_length(eu_agents, 1) LOOP
        current_agent_name := eu_agents[i];
        current_agent_kind := CASE 
            WHEN current_agent_name LIKE '%Momentum%' THEN 'momentum'
            WHEN current_agent_name LIKE '%Arbitrage%' THEN 'arbitrage'
            WHEN current_agent_name LIKE '%MeanRev%' THEN 'meanrev'
            WHEN current_agent_name LIKE '%Vol%' THEN 'vol'
            WHEN current_agent_name LIKE '%Macro%' THEN 'macro'
            WHEN current_agent_name LIKE '%CryptoArb%' THEN 'crypto-arb'
        END;
        
        INSERT INTO public.regional_agents (region_code, agent_name, kind, status, weight)
        VALUES ('EU', current_agent_name, current_agent_kind, 'idle', 1.0)
        ON CONFLICT (region_code, agent_name) DO NOTHING;
    END LOOP;
    
    -- Initialize US agents
    FOR i IN 1..array_length(us_agents, 1) LOOP
        current_agent_name := us_agents[i];
        current_agent_kind := CASE 
            WHEN current_agent_name LIKE '%Momentum%' THEN 'momentum'
            WHEN current_agent_name LIKE '%Arbitrage%' THEN 'arbitrage'
            WHEN current_agent_name LIKE '%MeanRev%' THEN 'meanrev'
            WHEN current_agent_name LIKE '%Vol%' THEN 'vol'
            WHEN current_agent_name LIKE '%Macro%' THEN 'macro'
            WHEN current_agent_name LIKE '%CryptoArb%' THEN 'crypto-arb'
        END;
        
        INSERT INTO public.regional_agents (region_code, agent_name, kind, status, weight)
        VALUES ('US', current_agent_name, current_agent_kind, 'idle', 1.0)
        ON CONFLICT (region_code, agent_name) DO NOTHING;
    END LOOP;
    
    -- Initialize LATAM agents
    FOR i IN 1..array_length(latam_agents, 1) LOOP
        current_agent_name := latam_agents[i];
        current_agent_kind := CASE 
            WHEN current_agent_name LIKE '%Momentum%' THEN 'momentum'
            WHEN current_agent_name LIKE '%Arbitrage%' THEN 'arbitrage'
            WHEN current_agent_name LIKE '%MeanRev%' THEN 'meanrev'
            WHEN current_agent_name LIKE '%Vol%' THEN 'vol'
            WHEN current_agent_name LIKE '%Macro%' THEN 'macro'
            WHEN current_agent_name LIKE '%CryptoArb%' THEN 'crypto-arb'
        END;
        
        INSERT INTO public.regional_agents (region_code, agent_name, kind, status, weight)
        VALUES ('LATAM', current_agent_name, current_agent_kind, 'idle', 1.0)
        ON CONFLICT (region_code, agent_name) DO NOTHING;
    END LOOP;
    
    -- Initialize CRYPTO agents
    FOR i IN 1..array_length(crypto_agents, 1) LOOP
        current_agent_name := crypto_agents[i];
        current_agent_kind := CASE 
            WHEN current_agent_name LIKE '%Momentum%' THEN 'momentum'
            WHEN current_agent_name LIKE '%Arbitrage%' THEN 'arbitrage'
            WHEN current_agent_name LIKE '%MeanRev%' THEN 'meanrev'
            WHEN current_agent_name LIKE '%Vol%' THEN 'vol'
            WHEN current_agent_name LIKE '%Macro%' THEN 'macro'
            WHEN current_agent_name LIKE '%CryptoArb%' THEN 'crypto-arb'
        END;
        
        INSERT INTO public.regional_agents (region_code, agent_name, kind, status, weight)
        VALUES ('CRYPTO', current_agent_name, current_agent_kind, 'idle', 1.0)
        ON CONFLICT (region_code, agent_name) DO NOTHING;
    END LOOP;
    
    -- Initialize sample momentum signals
    INSERT INTO public.momentum_signals (ts, region_code, lmi, vol, corr, details) VALUES
        (CURRENT_TIMESTAMP - INTERVAL '1 minute', 'ASIA', 0.72, 0.45, 0.23, '{"market_trend":"bullish","volume_profile":"high"}'),
        (CURRENT_TIMESTAMP - INTERVAL '1 minute', 'EU', 0.65, 0.38, 0.15, '{"market_trend":"neutral","volume_profile":"medium"}'),
        (CURRENT_TIMESTAMP - INTERVAL '1 minute', 'US', 0.81, 0.52, 0.31, '{"market_trend":"very_bullish","volume_profile":"high"}'),
        (CURRENT_TIMESTAMP - INTERVAL '1 minute', 'LATAM', 0.45, 0.28, 0.08, '{"market_trend":"bearish","volume_profile":"low"}'),
        (CURRENT_TIMESTAMP - INTERVAL '1 minute', 'CRYPTO', 0.89, 0.78, 0.45, '{"market_trend":"extremely_bullish","volume_profile":"very_high"}')
    ON CONFLICT (ts, region_code) DO NOTHING;
    
    RAISE NOTICE 'Global Momentum Grid system successfully initialized with regional agents and sample signals';
END $init$;