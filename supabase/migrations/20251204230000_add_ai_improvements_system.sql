-- Location: supabase/migrations/20251204230000_add_ai_improvements_system.sql
-- Schema Analysis: Existing complex trading system with 87 tables, TGE events already implemented
-- Integration Type: NEW_MODULE - AI improvements system for decision logging, data health, source rewards, and IQS
-- Dependencies: user_profiles, tge_events

-- 1. AI Decision Logging (apprentissage par erreurs)
CREATE TABLE IF NOT EXISTS public.decisions_log (
    id BIGSERIAL PRIMARY KEY,
    agent TEXT NOT NULL,               -- ex: newsminer, strategy_weaver, execution_guru
    task TEXT,                         -- ex: "build_strategy", "fetch_news"
    input JSONB,
    tools JSONB,                       -- outils appelés + paramètres
    output JSONB,                      -- résultat brut
    outcome TEXT,                      -- success | guard_blocked | error | canary_fail
    error_sig TEXT,                    -- haché de l'erreur (pour dédup)
    human_feedback TEXT,               -- annotation opérateur
    ts TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Scores d'insight (IQS)
CREATE TABLE IF NOT EXISTS public.iq_scores (
    insight_id TEXT PRIMARY KEY,
    iqs NUMERIC CHECK (iqs BETWEEN 0 AND 1),
    breakdown JSONB,
    ts TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indice santé data (DHI) par flux
CREATE TABLE IF NOT EXISTS public.data_health_index (
    stream TEXT PRIMARY KEY,           -- ex: data.market.btc.1m
    dhi NUMERIC CHECK (dhi BETWEEN 0 AND 1),
    timeliness NUMERIC,
    completeness NUMERIC,
    consistency NUMERIC,
    anomaly_inverse NUMERIC,
    coverage NUMERIC,
    license_status NUMERIC,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mémoire d'échecs (patterns toxiques)
CREATE TABLE IF NOT EXISTS public.toxic_vectors (
    id BIGSERIAL PRIMARY KEY,
    strategy_id TEXT,
    when_bad TIMESTAMPTZ DEFAULT NOW(),
    embedding JSONB,                   -- using jsonb since pgvector may not be available
    notes TEXT
);

-- 5. Récompenses par source (bandits)
CREATE TABLE IF NOT EXISTS public.source_rewards (
    source TEXT PRIMARY KEY,           -- domaine / provider
    pulls INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0,           -- éléments utiles extraits
    failures INTEGER DEFAULT 0,            -- 4xx/5xx/timeouts
    last_reward NUMERIC DEFAULT 0,     -- reward instantané
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Essential Indexes
CREATE INDEX IF NOT EXISTS decisions_log_agent_ts_idx ON public.decisions_log(agent, ts DESC);
CREATE INDEX IF NOT EXISTS decisions_log_error_sig_idx ON public.decisions_log(error_sig);
CREATE INDEX IF NOT EXISTS data_health_index_stream_idx ON public.data_health_index(stream);
CREATE INDEX IF NOT EXISTS source_rewards_updated_at_idx ON public.source_rewards(updated_at);

-- 7. Helper function for bandits increment
CREATE OR REPLACE FUNCTION public.increment_source_field(p_source TEXT, p_field TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF p_field NOT IN ('successes','failures') THEN RETURN; END IF;
    INSERT INTO public.source_rewards(source, pulls, successes, failures)
    VALUES(p_source, 1, CASE WHEN p_field='successes' THEN 1 ELSE 0 END, CASE WHEN p_field='failures' THEN 1 ELSE 0 END)
    ON CONFLICT (source) DO UPDATE
    SET pulls = public.source_rewards.pulls + 1,
        successes = public.source_rewards.successes + (CASE WHEN p_field='successes' THEN 1 ELSE 0 END),
        failures = public.source_rewards.failures + (CASE WHEN p_field='failures' THEN 1 ELSE 0 END),
        updated_at = NOW();
END$$;

-- 8. Enable RLS
ALTER TABLE public.decisions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iq_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_health_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toxic_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_rewards ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies using admin pattern from existing schema
CREATE POLICY "admin_manage_decisions_log"
ON public.decisions_log
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_manage_iq_scores"
ON public.iq_scores
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_manage_data_health_index"
ON public.data_health_index
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_manage_toxic_vectors"
ON public.toxic_vectors
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_manage_source_rewards"
ON public.source_rewards
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 10. Mock data for testing
DO $$
BEGIN
    -- Sample decision logs
    INSERT INTO public.decisions_log (agent, task, input, tools, output, outcome, error_sig, human_feedback)
    VALUES 
        ('newsminer', 'fetch_news', '{"source": "cryptonews"}', '{"scraper": "beautifulsoup"}', '{"articles": 5}', 'success', null, 'Good extraction quality'),
        ('strategy_weaver', 'build_strategy', '{"market": "BTC"}', '{"analysis": "technical"}', '{"signal": "buy"}', 'guard_blocked', 'risk_too_high', 'Strategy blocked by risk limits'),
        ('execution_guru', 'place_order', '{"symbol": "BTCUSD", "qty": 0.1}', '{"broker": "ibkr"}', '{"order_id": "12345"}', 'error', 'connection_failed', 'Broker connectivity issues');

    -- Sample IQ scores
    INSERT INTO public.iq_scores (insight_id, iqs, breakdown)
    VALUES 
        ('btc_momentum_signal_001', 0.85, '{"robustness": 0.9, "stability": 0.8, "causality": 0.85, "transferability": 0.8, "cost_efficiency": 0.9, "explainability": 0.8}'),
        ('eth_reversal_pattern_002', 0.72, '{"robustness": 0.7, "stability": 0.75, "causality": 0.7, "transferability": 0.7, "cost_efficiency": 0.8, "explainability": 0.65}');

    -- Sample data health metrics
    INSERT INTO public.data_health_index (stream, dhi, timeliness, completeness, consistency, anomaly_inverse, coverage, license_status)
    VALUES 
        ('data.market.btc.1m', 0.92, 0.95, 0.90, 0.88, 0.95, 0.92, 1.0),
        ('data.news.crypto.feed', 0.78, 0.80, 0.75, 0.80, 0.85, 0.70, 1.0),
        ('data.social.twitter.sentiment', 0.65, 0.70, 0.60, 0.65, 0.70, 0.60, 0.8);

    -- Sample source rewards
    INSERT INTO public.source_rewards (source, pulls, successes, failures, last_reward)
    VALUES 
        ('icoanalytics.com', 45, 38, 7, 0.84),
        ('coinlaunch.io', 32, 25, 7, 0.78),
        ('cryptorank.io', 28, 20, 8, 0.71);

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Some test data already exists, skipping duplicates';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting test data: %', SQLERRM;
END $$;