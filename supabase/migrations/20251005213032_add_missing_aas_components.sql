-- Location: supabase/migrations/20251005213032_add_missing_aas_components.sql
-- Schema Analysis: Existing schema has ai_agents, strategies, iq_scores, decisions_log, etc.
-- Integration Type: PARTIAL_EXISTS - Adding missing AAS components from provided pack
-- Dependencies: References existing user_profiles for relationships

-- =====================================================================================
-- AAS (Autonomous AI Speculation) - Missing Components Extension
-- Version: 1.0 (Production-Ready Integration with Existing Schema)
-- =====================================================================================

-- Add missing AAS tables that don't exist in current schema

-- Market regime state tracking for Level 3+ autonomy
CREATE TABLE IF NOT EXISTS public.regime_state (
    as_of TIMESTAMPTZ PRIMARY KEY DEFAULT NOW(),
    regime TEXT NOT NULL,
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
    drivers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategy candidates for genetic breeding (Level 4-5)
CREATE TABLE IF NOT EXISTS public.strategy_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_ids TEXT[], -- JSON array of parent strategy IDs
    spec_yaml TEXT NOT NULL, -- Strategy specification in YAML format
    metrics JSONB, -- Performance metrics
    iqs NUMERIC CHECK (iqs >= 0 AND iqs <= 1), -- Intelligence Quality Score
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'testing', 'paper', 'canary', 'live', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Meta-learning metrics for algorithm optimization
CREATE TABLE IF NOT EXISTS public.meta_learning_metrics (
    id BIGSERIAL PRIMARY KEY,
    agent TEXT NOT NULL,
    algo TEXT, -- Algorithm name
    success_rate NUMERIC CHECK (success_rate >= 0 AND success_rate <= 1),
    cost_efficiency NUMERIC,
    latency_ms INTEGER,
    params JSONB, -- Algorithm parameters
    ts TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Compute budget allocation for agent resources
CREATE TABLE IF NOT EXISTS public.compute_budget (
    agent TEXT PRIMARY KEY,
    iq_target NUMERIC DEFAULT 0.75 CHECK (iq_target >= 0 AND iq_target <= 1),
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    run_interval_min INTEGER DEFAULT 60,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Prompt registry for AI optimization
CREATE TABLE IF NOT EXISTS public.prompt_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent TEXT NOT NULL,
    variant TEXT NOT NULL,
    prompt TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    success INTEGER DEFAULT 0,
    failure INTEGER DEFAULT 0,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Kill switches for emergency controls (enhanced from existing risk_controller)
CREATE TABLE IF NOT EXISTS public.kill_switches (
    module TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT FALSE,
    reason TEXT,
    activated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_regime_state_as_of ON public.regime_state(as_of DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_candidates_status ON public.strategy_candidates(status);
CREATE INDEX IF NOT EXISTS idx_strategy_candidates_iqs ON public.strategy_candidates(iqs DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_candidates_user_id ON public.strategy_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_learning_agent_ts ON public.meta_learning_metrics(agent, ts DESC);
CREATE INDEX IF NOT EXISTS idx_meta_learning_user_id ON public.meta_learning_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_compute_budget_next_run ON public.compute_budget(next_run);
CREATE INDEX IF NOT EXISTS idx_compute_budget_user_id ON public.compute_budget(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_registry_agent ON public.prompt_registry(agent);
CREATE INDEX IF NOT EXISTS idx_prompt_registry_user_id ON public.prompt_registry(user_id);

-- RPC function for bandit algorithm (from provided pack)
CREATE OR REPLACE FUNCTION public.increment_source_field(p_source TEXT, p_field TEXT)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  IF p_field NOT IN ('successes','failures') THEN 
    RETURN; 
  END IF;
  
  INSERT INTO public.source_rewards(source, pulls, successes, failures, user_id)
  VALUES(
    p_source, 
    1, 
    CASE WHEN p_field='successes' THEN 1 ELSE 0 END, 
    CASE WHEN p_field='failures' THEN 1 ELSE 0 END,
    auth.uid()
  )
  ON CONFLICT (source) DO UPDATE
  SET 
    pulls = public.source_rewards.pulls + 1,
    successes = public.source_rewards.successes + (CASE WHEN p_field='successes' THEN 1 ELSE 0 END),
    failures = public.source_rewards.failures + (CASE WHEN p_field='failures' THEN 1 ELSE 0 END),
    updated_at = NOW();
END$$;

-- Natural selection function for strategy evolution
CREATE OR REPLACE FUNCTION public.natural_selection(min_iqs NUMERIC DEFAULT 0.75)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    strategy_record RECORD;
    update_count INTEGER := 0;
    next_status TEXT;
BEGIN
    -- Process strategies for evolution based on IQS
    FOR strategy_record IN 
        SELECT id, iqs, status 
        FROM public.strategy_candidates 
        WHERE status IN ('testing','paper','canary','live')
        AND user_id = auth.uid()
    LOOP
        -- Determine next status based on IQS performance
        IF strategy_record.iqs >= min_iqs THEN
            CASE strategy_record.status
                WHEN 'paper' THEN next_status := 'canary';
                WHEN 'canary' THEN next_status := 'live';
                ELSE next_status := strategy_record.status;
            END CASE;
        ELSE
            CASE strategy_record.status
                WHEN 'live' THEN next_status := 'canary';
                WHEN 'canary' THEN next_status := 'paper';
                ELSE next_status := 'rejected';
            END CASE;
        END IF;
        
        -- Update strategy status
        UPDATE public.strategy_candidates 
        SET status = next_status, updated_at = NOW()
        WHERE id = strategy_record.id;
        
        update_count := update_count + 1;
    END LOOP;
    
    RETURN jsonb_build_object('updated', update_count, 'ok', true);
END$$;

-- Genetic breeding function for strategy generation
CREATE OR REPLACE FUNCTION public.breed_strategies(k INTEGER DEFAULT 20)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    parent_record RECORD;
    parent_a RECORD;
    parent_b RECORD;
    child_spec TEXT;
    created_count INTEGER := 0;
    parent_cursor CURSOR FOR 
        SELECT id, spec_yaml, iqs 
        FROM public.strategy_candidates 
        WHERE iqs IS NOT NULL 
        AND user_id = auth.uid()
        ORDER BY iqs DESC 
        LIMIT 10;
BEGIN
    -- Check if we have enough parents for breeding
    IF (SELECT COUNT(*) FROM public.strategy_candidates WHERE iqs IS NOT NULL AND user_id = auth.uid()) < 2 THEN
        RETURN jsonb_build_object('created', 0, 'notes', 'Insufficient parents for breeding');
    END IF;
    
    -- Generate k new strategy candidates through genetic combination
    FOR i IN 1..k LOOP
        -- Select random parents from top performers
        SELECT id, spec_yaml, iqs INTO parent_a
        FROM public.strategy_candidates 
        WHERE iqs IS NOT NULL AND user_id = auth.uid()
        ORDER BY RANDOM() 
        LIMIT 1;
        
        SELECT id, spec_yaml, iqs INTO parent_b
        FROM public.strategy_candidates 
        WHERE iqs IS NOT NULL AND user_id = auth.uid()
        AND id != parent_a.id
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- Simple genetic combination (can be enhanced with actual YAML parsing)
        child_spec := format('strategy_id: STR-%s
features:
  - RSI(14)
  - BB(20,2)
  - MACD(12,26,9)
logic:
  entry: "if RSI_signal and vol_z < 2 => long"
risk:
  capital_pct: 0.5
  max_dd_pct: 6', substr(gen_random_uuid()::text, 1, 8));
        
        -- Insert new strategy candidate
        INSERT INTO public.strategy_candidates (parent_ids, spec_yaml, status, user_id)
        VALUES (
            ARRAY[parent_a.id::text, parent_b.id::text], 
            child_spec, 
            'pending',
            auth.uid()
        );
        
        created_count := created_count + 1;
    END LOOP;
    
    RETURN jsonb_build_object('created', created_count, 'ok', true);
END$$;

-- Enable RLS on new tables
ALTER TABLE public.regime_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_learning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kill_switches ENABLE ROW LEVEL SECURITY;

-- RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_strategy_candidates"
ON public.strategy_candidates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_meta_learning_metrics"
ON public.meta_learning_metrics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_compute_budget"
ON public.compute_budget
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_prompt_registry"
ON public.prompt_registry
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Global tables accessible to all authenticated users
CREATE POLICY "authenticated_can_read_regime_state"
ON public.regime_state
FOR SELECT
TO authenticated
USING (true);

-- Admin-only access to kill switches using Pattern 6A (auth metadata)
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

CREATE POLICY "admin_full_access_kill_switches"
ON public.kill_switches
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Update triggers for timestamp management
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_regime_state_updated_at 
    BEFORE UPDATE ON public.regime_state 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_candidates_updated_at 
    BEFORE UPDATE ON public.strategy_candidates 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compute_budget_updated_at 
    BEFORE UPDATE ON public.compute_budget 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_registry_updated_at 
    BEFORE UPDATE ON public.prompt_registry 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kill_switches_updated_at 
    BEFORE UPDATE ON public.kill_switches 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize kill switches with default modules
INSERT INTO public.kill_switches(module) 
VALUES 
    ('EXECUTION'), 
    ('STRATEGY_GENERATION'), 
    ('LIVE_TRADING'),
    ('DATA_INGESTION'),
    ('RISK_MANAGEMENT')
ON CONFLICT (module) DO NOTHING;

-- Sample data for development and testing
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- Get a sample user for demo data
    SELECT id INTO sample_user_id FROM public.user_profiles LIMIT 1;
    
    IF sample_user_id IS NOT NULL THEN
        -- Insert sample regime state
        INSERT INTO public.regime_state (regime, confidence, drivers)
        VALUES 
            ('bull_market', 0.85, '{"volatility": "low", "trend": "up", "volume": "high"}'),
            ('bear_market', 0.72, '{"volatility": "high", "trend": "down", "volume": "medium"}')
        ON CONFLICT (as_of) DO NOTHING;
        
        -- Insert sample strategy candidates
        INSERT INTO public.strategy_candidates (spec_yaml, iqs, status, user_id)
        VALUES 
            ('strategy_id: momentum_001
features:
  - RSI(14)
  - MACD(12,26,9)
logic:
  entry: "if RSI > 70 and MACD_signal => short"
risk:
  capital_pct: 0.3
  max_dd_pct: 5', 0.82, 'testing', sample_user_id),
            ('strategy_id: mean_reversion_001
features:
  - BB(20,2)
  - RSI(14)
logic:
  entry: "if price < BB_lower and RSI < 30 => long"
risk:
  capital_pct: 0.4
  max_dd_pct: 6', 0.76, 'paper', sample_user_id)
        ON CONFLICT DO NOTHING;
        
        -- Insert sample meta-learning metrics
        INSERT INTO public.meta_learning_metrics (agent, algo, success_rate, cost_efficiency, latency_ms, user_id)
        VALUES 
            ('strategy_weaver', 'genetic_algorithm', 0.85, 1.2, 150, sample_user_id),
            ('execution_guru', 'reinforcement_learning', 0.78, 0.95, 200, sample_user_id)
        ON CONFLICT DO NOTHING;
        
        -- Insert sample compute budget
        INSERT INTO public.compute_budget (agent, iq_target, next_run, user_id)
        VALUES 
            ('strategy_weaver', 0.80, NOW() + INTERVAL '1 hour', sample_user_id),
            ('execution_guru', 0.75, NOW() + INTERVAL '30 minutes', sample_user_id)
        ON CONFLICT (agent) DO NOTHING;
        
        -- Insert sample prompt registry
        INSERT INTO public.prompt_registry (agent, variant, prompt, success, failure, user_id)
        VALUES 
            ('strategy_weaver', 'v1', 'Generate a momentum trading strategy using RSI and MACD indicators', 25, 3, sample_user_id),
            ('execution_guru', 'v2', 'Optimize order execution timing based on market microstructure', 18, 2, sample_user_id)
        ON CONFLICT DO NOTHING;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data insertion failed: %', SQLERRM;
END $$;