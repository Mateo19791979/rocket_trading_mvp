-- Location: supabase/migrations/20251005213000_add_aas_system_tables.sql
-- Schema Analysis: PARTIAL_EXISTS - extending existing ai_agents, risk_controller, system_health
-- Integration Type: extension/enhancement  
-- Dependencies: user_profiles, ai_agents, risk_controller, orchestrator_state

-- AAS (AI Autonome Spéculative) System Extension
-- Based on the provided pack, adding missing sophisticated AI trading components

-- 1. Types for AAS levels and regimes
CREATE TYPE public.aas_level AS ENUM ('level_1_monitoring', 'level_2_strategy_freeze', 'level_3_autonomy_reduction', 'level_4_breeding_termination', 'level_5_complete_halt');
CREATE TYPE public.market_regime AS ENUM ('bull', 'bear', 'sideways', 'volatile', 'quiet');
CREATE TYPE public.strategy_status AS ENUM ('pending', 'testing', 'paper', 'canary', 'live', 'rejected');

-- 2. Core AAS Tables (from provided pack)

-- Market Regime State Detection
CREATE TABLE public.regime_state (
    as_of TIMESTAMPTZ PRIMARY KEY DEFAULT NOW(),
    regime public.market_regime NOT NULL,
    confidence NUMERIC(5,4) CHECK (confidence >= 0 AND confidence <= 1),
    drivers JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategy Breeding System
CREATE TABLE public.strategy_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_ids TEXT[] DEFAULT '{}',
    spec_yaml TEXT NOT NULL,
    metrics JSONB DEFAULT '{}',
    iqs NUMERIC(5,4) CHECK (iqs >= 0 AND iqs <= 1),
    status public.strategy_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meta Learning System
CREATE TABLE public.meta_learning_metrics (
    id BIGSERIAL PRIMARY KEY,
    agent TEXT NOT NULL,
    algo TEXT NOT NULL,
    success_rate NUMERIC(5,4) CHECK (success_rate >= 0 AND success_rate <= 1),
    cost_efficiency NUMERIC(10,4),
    latency_ms INTEGER CHECK (latency_ms >= 0),
    params JSONB DEFAULT '{}',
    ts TIMESTAMPTZ DEFAULT NOW()
);

-- System Health Monitoring (extends existing system_health)
CREATE TABLE public.aas_system_health (
    ts TIMESTAMPTZ PRIMARY KEY DEFAULT NOW(),
    dhi_avg NUMERIC(5,4) CHECK (dhi_avg >= 0 AND dhi_avg <= 1),
    alpha_decay NUMERIC(5,4),
    compute_alpha NUMERIC(5,4),
    errors_1h INTEGER DEFAULT 0,
    mode TEXT DEFAULT 'normal' CHECK (mode IN ('normal', 'degraded', 'safe'))
);

-- Compute Budget Management
CREATE TABLE public.compute_budget (
    agent TEXT PRIMARY KEY,
    iq_target NUMERIC(5,4) DEFAULT 0.75 CHECK (iq_target >= 0 AND iq_target <= 1),
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    run_interval_min INTEGER DEFAULT 60 CHECK (run_interval_min > 0),
    priority INTEGER DEFAULT 0
);

-- Prompt Registry for AI Agents
CREATE TABLE public.prompt_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent TEXT NOT NULL,
    variant TEXT NOT NULL,
    prompt TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    success INTEGER DEFAULT 0 CHECK (success >= 0),
    failure INTEGER DEFAULT 0 CHECK (failure >= 0),
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-Level Kill Switch System (extends existing risk_controller)
CREATE TABLE public.aas_kill_switches (
    module TEXT PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    aas_level public.aas_level DEFAULT 'level_1_monitoring',
    reason TEXT,
    activated_by TEXT,
    impact_assessment JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Incident Management
CREATE TABLE public.emergency_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type TEXT NOT NULL,
    severity public.alert_severity DEFAULT 'medium',
    description TEXT NOT NULL,
    affected_systems TEXT[] DEFAULT '{}',
    response_actions JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'escalated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- 3. Essential Indexes for Performance
CREATE INDEX idx_regime_state_as_of ON public.regime_state(as_of DESC);
CREATE INDEX idx_strategy_candidates_status ON public.strategy_candidates(status);
CREATE INDEX idx_strategy_candidates_iqs ON public.strategy_candidates(iqs DESC NULLS LAST);
CREATE INDEX idx_meta_learning_agent_ts ON public.meta_learning_metrics(agent, ts DESC);
CREATE INDEX idx_prompt_registry_agent ON public.prompt_registry(agent);
CREATE INDEX idx_prompt_registry_enabled ON public.prompt_registry(enabled) WHERE enabled = true;
CREATE INDEX idx_aas_system_health_mode ON public.aas_system_health(mode);
CREATE INDEX idx_emergency_incidents_status ON public.emergency_incidents(status);
CREATE INDEX idx_emergency_incidents_severity ON public.emergency_incidents(severity);

-- 4. Functions for Strategy Breeding (from provided pack)
CREATE OR REPLACE FUNCTION public.increment_source_rewards(p_source TEXT, p_field TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_field NOT IN ('successes','failures') THEN 
        RETURN; 
    END IF;
    
    INSERT INTO public.source_rewards(source, pulls, successes, failures)
    VALUES(
        p_source, 
        1, 
        CASE WHEN p_field='successes' THEN 1 ELSE 0 END, 
        CASE WHEN p_field='failures' THEN 1 ELSE 0 END
    )
    ON CONFLICT (source) DO UPDATE
    SET pulls = public.source_rewards.pulls + 1,
        successes = public.source_rewards.successes + (CASE WHEN p_field='successes' THEN 1 ELSE 0 END),
        failures = public.source_rewards.failures + (CASE WHEN p_field='failures' THEN 1 ELSE 0 END),
        updated_at = NOW();
END;
$$;

-- Function for System Health Calculation
CREATE OR REPLACE FUNCTION public.calculate_system_dhi()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avg_dhi NUMERIC;
    error_penalty NUMERIC;
    final_dhi NUMERIC;
BEGIN
    -- Calculate average DHI from various sources
    SELECT 
        COALESCE(AVG(
            CASE 
                WHEN sh.health_status = 'healthy' THEN 1.0
                WHEN sh.health_status = 'degraded' THEN 0.7
                ELSE 0.3
            END
        ), 0.5)
    INTO avg_dhi
    FROM public.system_health sh
    WHERE sh.created_at > NOW() - INTERVAL '1 hour';
    
    -- Calculate error penalty
    SELECT COALESCE(SUM(error_count) * 0.01, 0)
    INTO error_penalty
    FROM public.system_health
    WHERE created_at > NOW() - INTERVAL '1 hour';
    
    final_dhi := GREATEST(0, LEAST(1, avg_dhi - error_penalty));
    
    RETURN final_dhi;
END;
$$;

-- Function for Emergency Response Activation
CREATE OR REPLACE FUNCTION public.activate_emergency_response(
    incident_type_param TEXT,
    severity_param public.alert_severity,
    description_param TEXT,
    affected_systems_param TEXT[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    incident_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Create emergency incident
    INSERT INTO public.emergency_incidents (
        incident_type,
        severity,
        description,
        affected_systems,
        assigned_to
    )
    VALUES (
        incident_type_param,
        severity_param,
        description_param,
        affected_systems_param,
        current_user_id
    )
    RETURNING id INTO incident_id;
    
    -- Auto-activate appropriate kill switches based on severity
    IF severity_param IN ('high', 'critical') THEN
        INSERT INTO public.aas_kill_switches (module, is_active, aas_level, reason, activated_by)
        VALUES 
            ('LIVE_TRADING', true, 'level_4_breeding_termination', 'Emergency incident: ' || incident_type_param, current_user_id::TEXT),
            ('STRATEGY_GENERATION', true, 'level_3_autonomy_reduction', 'Emergency incident: ' || incident_type_param, current_user_id::TEXT)
        ON CONFLICT (module) DO UPDATE SET
            is_active = true,
            reason = 'Emergency incident: ' || incident_type_param,
            updated_at = NOW();
    END IF;
    
    RETURN incident_id;
END;
$$;

-- 5. Enable RLS on all AAS tables
ALTER TABLE public.regime_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_learning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aas_system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compute_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aas_kill_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_incidents ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies using Pattern 6A (auth.users metadata)
-- Admin access for all AAS tables
CREATE POLICY "admin_full_access_regime_state"
ON public.regime_state
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_strategy_candidates"
ON public.strategy_candidates
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_meta_learning_metrics"
ON public.meta_learning_metrics
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_aas_system_health"
ON public.aas_system_health
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_compute_budget"
ON public.compute_budget
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_prompt_registry"
ON public.prompt_registry
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_aas_kill_switches"
ON public.aas_kill_switches
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2 for emergency incidents (user ownership)
CREATE POLICY "users_manage_own_emergency_incidents"
ON public.emergency_incidents
FOR ALL
TO authenticated
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- 7. Triggers for updated_at columns
CREATE TRIGGER update_strategy_candidates_updated_at
    BEFORE UPDATE ON public.strategy_candidates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aas_kill_switches_updated_at
    BEFORE UPDATE ON public.aas_kill_switches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Initialize default kill switch modules
INSERT INTO public.aas_kill_switches (module, is_active, aas_level, reason) VALUES
    ('EXECUTION', false, 'level_1_monitoring', 'System initialization'),
    ('STRATEGY_GENERATION', false, 'level_1_monitoring', 'System initialization'),
    ('LIVE_TRADING', false, 'level_1_monitoring', 'System initialization'),
    ('META_LEARNING', false, 'level_1_monitoring', 'System initialization'),
    ('BREEDING_ENGINE', false, 'level_1_monitoring', 'System initialization')
ON CONFLICT DO NOTHING;

-- 9. Sample AAS data for demonstration
DO $$
DECLARE
    strategy_id UUID;
BEGIN
    -- Insert sample regime state
    INSERT INTO public.regime_state (regime, confidence, drivers) VALUES
        ('volatile', 0.87, '{"vix_spike": true, "correlation_breakdown": 0.45, "volume_surge": 1.23}'),
        ('bull', 0.92, '{"trend_strength": 0.89, "momentum": "strong", "breadth": "positive"}');

    -- Insert sample strategy candidates
    INSERT INTO public.strategy_candidates (spec_yaml, iqs, status, notes) VALUES
        (
            E'strategy_id: STR-001\nfeatures:\n  - RSI(14)\n  - BB(20,2)\n  - VWAP\nlogic:\n  entry: "if RSI_signal and vol_z < 2 => long"\nrisk:\n  capital_pct: 0.5\n  max_dd_pct: 6',
            0.84,
            'testing',
            'High performance momentum strategy'
        ),
        (
            E'strategy_id: STR-002\nfeatures:\n  - MACD(12,26,9)\n  - ATR(14)\n  - HMA(50)\nlogic:\n  entry: "if MACD_cross and ATR_expansion => long"\nrisk:\n  capital_pct: 0.3\n  max_dd_pct: 4',
            0.78,
            'paper',
            'Mean reversion with trend filter'
        ) RETURNING id INTO strategy_id;

    -- Insert system health data
    INSERT INTO public.aas_system_health (dhi_avg, alpha_decay, compute_alpha, errors_1h, mode) VALUES
        (0.89, 0.02, 0.75, 0, 'normal'),
        (0.76, 0.05, 0.68, 2, 'degraded');

    -- Insert meta learning metrics
    INSERT INTO public.meta_learning_metrics (agent, algo, success_rate, cost_efficiency, latency_ms, params) VALUES
        ('strategy_weaver', 'genetic_algo', 0.82, 1.45, 250, '{"population_size": 100, "mutation_rate": 0.1}'),
        ('risk_manager', 'reinforcement_learning', 0.91, 2.1, 180, '{"learning_rate": 0.001, "epsilon": 0.1}');

    -- Insert compute budget allocations
    INSERT INTO public.compute_budget (agent, iq_target, run_interval_min, priority) VALUES
        ('strategy_breeder', 0.85, 30, 1),
        ('market_analyzer', 0.78, 15, 2),
        ('risk_assessor', 0.92, 60, 0);

    -- Insert prompt registry
    INSERT INTO public.prompt_registry (agent, variant, prompt, enabled, success, failure) VALUES
        ('strategy_generator', 'v1.2', 'Generate a momentum trading strategy using the following indicators: {indicators}. Focus on risk-adjusted returns with maximum drawdown of {max_dd}%.', true, 45, 5),
        ('market_analyst', 'v2.0', 'Analyze current market regime based on volatility: {volatility}, correlation: {correlation}, and volume profile: {volume}. Provide confidence score.', true, 38, 12);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data insertion completed with warnings: %', SQLERRM;
END $$;

-- Cleanup function for AAS test data
CREATE OR REPLACE FUNCTION public.cleanup_aas_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.emergency_incidents WHERE description LIKE '%test%' OR description LIKE '%demo%';
    DELETE FROM public.strategy_candidates WHERE notes LIKE '%sample%' OR spec_yaml LIKE '%STR-001%' OR spec_yaml LIKE '%STR-002%';
    DELETE FROM public.regime_state WHERE drivers->>'vix_spike' = 'true';
    DELETE FROM public.meta_learning_metrics WHERE agent IN ('strategy_weaver', 'risk_manager');
    DELETE FROM public.compute_budget WHERE agent IN ('strategy_breeder', 'market_analyzer', 'risk_assessor');
    DELETE FROM public.prompt_registry WHERE agent IN ('strategy_generator', 'market_analyst');
    DELETE FROM public.aas_system_health WHERE mode = 'degraded';
    
    RAISE NOTICE 'AAS test data cleanup completed';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'AAS cleanup failed: %', SQLERRM;
END;
$$;