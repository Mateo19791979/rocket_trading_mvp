-- Location: supabase/migrations/20250104161500_add_ai_learning_system.sql
-- Schema Analysis: Extending existing trading schema with AI learning components
-- Integration Type: Additive - Building upon existing ai_agents, user_profiles, etc.
-- Dependencies: user_profiles, ai_agents tables

-- 1. New Types for AI Learning System
CREATE TYPE public.outcome_type AS ENUM ('success', 'guard_blocked', 'error', 'canary_fail');
CREATE TYPE public.learning_source AS ENUM ('newsminer', 'strategy_weaver', 'execution_guru', 'options_screener', 'sentiment_analyzer');

-- 2. Decision Logging for Learning Loops
CREATE TABLE public.decisions_log (
    id BIGSERIAL PRIMARY KEY,
    agent TEXT NOT NULL,
    task TEXT,
    input JSONB,
    tools JSONB,
    output JSONB,
    outcome public.outcome_type,
    error_sig TEXT,
    human_feedback TEXT,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. IQ Scores for Strategy Intelligence
CREATE TABLE public.iq_scores (
    insight_id TEXT PRIMARY KEY,
    iqs NUMERIC CHECK (iqs BETWEEN 0 AND 1),
    breakdown JSONB,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    ts TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Data Health Index per Stream
CREATE TABLE public.data_health_index (
    stream TEXT PRIMARY KEY,
    dhi NUMERIC CHECK (dhi BETWEEN 0 AND 1),
    timeliness NUMERIC,
    completeness NUMERIC,
    consistency NUMERIC,
    anomaly_inverse NUMERIC,
    coverage NUMERIC,
    license_status NUMERIC,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Toxic Vectors Memory (Pattern Memory)
CREATE TABLE public.toxic_vectors (
    id BIGSERIAL PRIMARY KEY,
    strategy_id TEXT,
    when_bad TIMESTAMPTZ DEFAULT now(),
    embedding JSONB,
    notes TEXT,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Source Rewards (Bandit Algorithm)
CREATE TABLE public.source_rewards (
    source TEXT PRIMARY KEY,
    pulls INT DEFAULT 0,
    successes INT DEFAULT 0,
    failures INT DEFAULT 0,
    last_reward NUMERIC DEFAULT 0,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Essential Indexes
CREATE INDEX idx_decisions_log_agent_ts ON public.decisions_log(agent, ts DESC);
CREATE INDEX idx_decisions_log_error_sig ON public.decisions_log(error_sig);
CREATE INDEX idx_decisions_log_user_id ON public.decisions_log(user_id);
CREATE INDEX idx_iq_scores_user_id ON public.iq_scores(user_id);
CREATE INDEX idx_data_health_index_user_id ON public.data_health_index(user_id);
CREATE INDEX idx_toxic_vectors_user_id ON public.toxic_vectors(user_id);
CREATE INDEX idx_source_rewards_user_id ON public.source_rewards(user_id);

-- 8. Helper Functions
CREATE OR REPLACE FUNCTION public.compute_iqs(breakdown JSONB)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
SELECT COALESCE(
    0.25 * COALESCE((breakdown->>'robustness')::numeric, 0) +
    0.20 * COALESCE((breakdown->>'stability')::numeric, 0) +
    0.15 * COALESCE((breakdown->>'causality')::numeric, 0) +
    0.15 * COALESCE((breakdown->>'transferability')::numeric, 0) +
    0.15 * COALESCE((breakdown->>'cost_efficiency')::numeric, 0) +
    0.10 * COALESCE((breakdown->>'explainability')::numeric, 0),
    0
);
$$;

CREATE OR REPLACE FUNCTION public.update_dhi_score(
    stream_name TEXT,
    timeliness_val NUMERIC DEFAULT 0.9,
    completeness_val NUMERIC DEFAULT 0.9,
    consistency_val NUMERIC DEFAULT 0.9,
    anomaly_inverse_val NUMERIC DEFAULT 0.9,
    coverage_val NUMERIC DEFAULT 0.9,
    license_status_val NUMERIC DEFAULT 1.0
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calculated_dhi NUMERIC;
BEGIN
    calculated_dhi := 0.25 * timeliness_val + 0.20 * completeness_val + 
                     0.20 * consistency_val + 0.15 * anomaly_inverse_val + 
                     0.10 * coverage_val + 0.10 * license_status_val;
    
    INSERT INTO public.data_health_index (
        stream, dhi, timeliness, completeness, consistency, 
        anomaly_inverse, coverage, license_status, user_id
    ) VALUES (
        stream_name, calculated_dhi, timeliness_val, completeness_val,
        consistency_val, anomaly_inverse_val, coverage_val, license_status_val,
        auth.uid()
    )
    ON CONFLICT (stream) DO UPDATE SET
        dhi = calculated_dhi,
        timeliness = timeliness_val,
        completeness = completeness_val,
        consistency = consistency_val,
        anomaly_inverse = anomaly_inverse_val,
        coverage = coverage_val,
        license_status = license_status_val,
        updated_at = now();
        
    RETURN calculated_dhi;
END;
$$;

CREATE OR REPLACE FUNCTION public.thompson_sampling(source_names TEXT[])
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    source_rec RECORD;
    best_source TEXT;
    best_score NUMERIC := -1;
    current_score NUMERIC;
BEGIN
    FOR source_rec IN 
        SELECT source, successes, failures 
        FROM public.source_rewards 
        WHERE source = ANY(source_names)
    LOOP
        -- Simple Thompson sampling approximation
        current_score := (source_rec.successes + 1.0) / 
                        (source_rec.successes + source_rec.failures + 2.0) * 
                        (0.9 + 0.2 * random());
        
        IF current_score > best_score THEN
            best_score := current_score;
            best_source := source_rec.source;
        END IF;
    END LOOP;
    
    -- Return first source if none found
    RETURN COALESCE(best_source, source_names[1]);
END;
$$;

-- 9. RLS Setup
ALTER TABLE public.decisions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iq_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_health_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toxic_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_rewards ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_decisions_log"
ON public.decisions_log
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_iq_scores"
ON public.iq_scores
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_data_health_index"
ON public.data_health_index
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_toxic_vectors"
ON public.toxic_vectors
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_source_rewards"
ON public.source_rewards
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 11. Triggers for updated_at
CREATE TRIGGER update_decisions_log_updated_at
    BEFORE UPDATE ON public.decisions_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iq_scores_updated_at
    BEFORE UPDATE ON public.iq_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_health_index_updated_at
    BEFORE UPDATE ON public.data_health_index
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_toxic_vectors_updated_at
    BEFORE UPDATE ON public.toxic_vectors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_source_rewards_updated_at
    BEFORE UPDATE ON public.source_rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Sample Data for Testing
DO $$
DECLARE
    existing_user_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get existing user IDs (don't create new auth users for non-auth module)
    SELECT id INTO existing_user_id FROM public.user_profiles WHERE role = 'basic_user' LIMIT 1;
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Sample decision logs
        INSERT INTO public.decisions_log (agent, task, input, tools, output, outcome, user_id)
        VALUES
        ('newsminer', 'fetch_market_news', '{"symbol": "AAPL"}'::jsonb, '{"reuters": true}'::jsonb, '{"articles": 5}'::jsonb, 'success', existing_user_id),
        ('strategy_weaver', 'build_momentum_strategy', '{"timeframe": "1h"}'::jsonb, '{"indicators": ["RSI", "MACD"]}'::jsonb, '{"signals": 3}'::jsonb, 'success', existing_user_id),
        ('execution_guru', 'place_order', '{"symbol": "TSLA", "qty": 100}'::jsonb, '{"broker_api": true}'::jsonb, '{"order_id": "12345"}'::jsonb, 'error', existing_user_id);

        -- Sample IQ scores
        INSERT INTO public.iq_scores (insight_id, iqs, breakdown, user_id)
        VALUES
        ('momentum_strategy_001', 0.85, '{"robustness": 0.9, "stability": 0.8, "causality": 0.85, "transferability": 0.82, "cost_efficiency": 0.88, "explainability": 0.75}'::jsonb, existing_user_id),
        ('mean_reversion_002', 0.72, '{"robustness": 0.75, "stability": 0.7, "causality": 0.68, "transferability": 0.74, "cost_efficiency": 0.72, "explainability": 0.80}'::jsonb, existing_user_id);

        -- Sample data health index
        INSERT INTO public.data_health_index (stream, dhi, timeliness, completeness, consistency, anomaly_inverse, coverage, license_status, user_id)
        VALUES
        ('data.market.btc.1m', 0.92, 0.95, 0.90, 0.95, 0.88, 0.92, 1.0, existing_user_id),
        ('data.market.eth.5m', 0.87, 0.85, 0.88, 0.90, 0.85, 0.87, 1.0, existing_user_id),
        ('data.news.reuters', 0.78, 0.80, 0.75, 0.82, 0.75, 0.78, 0.95, existing_user_id);

        -- Sample source rewards
        INSERT INTO public.source_rewards (source, pulls, successes, failures, last_reward, user_id)
        VALUES
        ('reuters.com', 150, 142, 8, 0.85, existing_user_id),
        ('bloomberg.com', 200, 185, 15, 0.78, existing_user_id),
        ('yahoo.finance', 100, 88, 12, 0.72, existing_user_id),
        ('alpha.vantage', 75, 68, 7, 0.82, existing_user_id);

        -- Sample toxic vectors
        INSERT INTO public.toxic_vectors (strategy_id, embedding, notes, user_id)
        VALUES
        ('failed_strategy_001', '{"pattern": "high_volatility_trap", "features": [0.9, -0.2, 0.3, 0.8]}'::jsonb, 'Strategy failed during high volatility conditions', existing_user_id),
        ('failed_strategy_002', '{"pattern": "correlation_breakdown", "features": [0.1, 0.7, -0.5, 0.2]}'::jsonb, 'Asset correlation broke down causing losses', existing_user_id);
    END IF;

    -- Log success
    RAISE NOTICE 'AI Learning System tables created and populated successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample data: %', SQLERRM;
END $$;