-- ======================================================================
-- ROCKETNEW — GLOBAL AI SWARM HUB (IA NOMADES & LIBRES FUSIONNÉES)
-- Version: 1.0 — Stable & JSON only
-- Schema Analysis: New module implementation - AI Swarm Management
-- Integration Type: Addition - New functionality
-- Dependencies: None (standalone AI management system)
-- ======================================================================

-- Log de mobilité IA
CREATE TABLE IF NOT EXISTS public.ai_mobility_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  from_region TEXT,
  to_region TEXT,
  asset_focus TEXT CHECK (asset_focus IN ('equity','forex','crypto','option','etf','fund')),
  motive TEXT CHECK (motive IN ('volatility','momentum','arbitrage','macro','rotation')),
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_mobility_agent ON public.ai_mobility_log(agent_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_mobility_regions ON public.ai_mobility_log(from_region, to_region);
CREATE INDEX IF NOT EXISTS idx_ai_mobility_asset_focus ON public.ai_mobility_log(asset_focus);

-- État courant des IA du Swarm
CREATE TABLE IF NOT EXISTS public.ai_swarm_state (
  agent_name TEXT PRIMARY KEY,
  current_region TEXT,
  current_focus TEXT, -- marché principal
  strategy_method TEXT, -- méthode en cours
  performance_7d NUMERIC DEFAULT 0,
  energy_level NUMERIC DEFAULT 1.0 CHECK (energy_level >= 0 AND energy_level <= 1),
  last_move TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_swarm_state_region ON public.ai_swarm_state(current_region);
CREATE INDEX IF NOT EXISTS idx_ai_swarm_state_focus ON public.ai_swarm_state(current_focus);
CREATE INDEX IF NOT EXISTS idx_ai_swarm_state_active ON public.ai_swarm_state(active);
CREATE INDEX IF NOT EXISTS idx_ai_swarm_state_performance ON public.ai_swarm_state(performance_7d DESC);

-- Journal global des décisions IA (aggrégé)
CREATE TABLE IF NOT EXISTS public.ai_swarm_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT,
  decision_type TEXT CHECK (decision_type IN ('migrate', 'switch_method', 'pause', 'fusion', 'spawn')),
  context JSONB,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  outcome TEXT CHECK (outcome IN ('success', 'fail', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_swarm_decisions_agent ON public.ai_swarm_decisions(agent_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_swarm_decisions_type ON public.ai_swarm_decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_ai_swarm_decisions_outcome ON public.ai_swarm_decisions(outcome);

-- Paramètres du Swarm (régulation)
CREATE TABLE IF NOT EXISTS public.ai_swarm_parameters (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Insertion des paramètres par défaut
INSERT INTO public.ai_swarm_parameters(key, value)
VALUES
('mobility_policy', '{"cooldown_hours":2, "min_confidence":0.55, "energy_cost":0.05}'::jsonb),
('fusion_policy', '{"trigger_score":0.85, "probability":0.2}'::jsonb),
('energy_policy', '{"drain_per_trade":0.02, "regen_per_rest":0.03}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- RLS : Enable on all tables (service_role access in backend)
ALTER TABLE public.ai_mobility_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_swarm_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_swarm_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_swarm_parameters ENABLE ROW LEVEL SECURITY;

-- Helper function for admin access using auth metadata
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

-- RLS Policies: Admin-only access for AI Swarm management
CREATE POLICY "admin_full_access_ai_mobility_log"
ON public.ai_mobility_log
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_ai_swarm_state"
ON public.ai_swarm_state
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_ai_swarm_decisions"
ON public.ai_swarm_decisions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_ai_swarm_parameters"
ON public.ai_swarm_parameters
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Utility functions for AI Swarm management

-- Function to get agent performance summary
CREATE OR REPLACE FUNCTION public.get_agent_performance_summary(agent_name_param TEXT DEFAULT NULL)
RETURNS TABLE(
    agent_name TEXT,
    current_region TEXT,
    current_focus TEXT,
    performance_7d NUMERIC,
    energy_level NUMERIC,
    total_moves BIGINT,
    last_decision_type TEXT,
    last_decision_outcome TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    ass.agent_name::TEXT,
    ass.current_region::TEXT,
    ass.current_focus::TEXT,
    ass.performance_7d,
    ass.energy_level,
    COALESCE(move_counts.move_count, 0) as total_moves,
    latest_decisions.decision_type::TEXT as last_decision_type,
    latest_decisions.outcome::TEXT as last_decision_outcome
FROM public.ai_swarm_state ass
LEFT JOIN (
    SELECT agent_name, COUNT(*) as move_count
    FROM public.ai_mobility_log
    GROUP BY agent_name
) move_counts ON ass.agent_name = move_counts.agent_name
LEFT JOIN (
    SELECT DISTINCT ON (agent_name) 
        agent_name, decision_type, outcome
    FROM public.ai_swarm_decisions
    ORDER BY agent_name, created_at DESC
) latest_decisions ON ass.agent_name = latest_decisions.agent_name
WHERE (agent_name_param IS NULL OR ass.agent_name = agent_name_param);
$$;

-- Function to get swarm statistics
CREATE OR REPLACE FUNCTION public.get_swarm_statistics()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT json_build_object(
    'total_agents', (SELECT COUNT(*) FROM public.ai_swarm_state WHERE active = true),
    'total_moves_today', (SELECT COUNT(*) FROM public.ai_mobility_log WHERE started_at >= CURRENT_DATE),
    'total_decisions_today', (SELECT COUNT(*) FROM public.ai_swarm_decisions WHERE created_at >= CURRENT_DATE),
    'average_energy', (SELECT ROUND(AVG(energy_level), 3) FROM public.ai_swarm_state WHERE active = true),
    'average_performance', (SELECT ROUND(AVG(performance_7d), 3) FROM public.ai_swarm_state WHERE active = true),
    'by_region', (
        SELECT json_object_agg(current_region, agent_count)
        FROM (
            SELECT current_region, COUNT(*) as agent_count
            FROM public.ai_swarm_state 
            WHERE active = true AND current_region IS NOT NULL
            GROUP BY current_region
        ) region_stats
    ),
    'by_focus', (
        SELECT json_object_agg(current_focus, agent_count)
        FROM (
            SELECT current_focus, COUNT(*) as agent_count
            FROM public.ai_swarm_state 
            WHERE active = true AND current_focus IS NOT NULL
            GROUP BY current_focus
        ) focus_stats
    )
);
$$;

-- Mock data for testing
DO $$
DECLARE
    test_agent_1 TEXT := 'alpha_trader_001';
    test_agent_2 TEXT := 'beta_arbitrage_002';
    test_agent_3 TEXT := 'gamma_momentum_003';
BEGIN
    -- Insert test agents into swarm state
    INSERT INTO public.ai_swarm_state (agent_name, current_region, current_focus, strategy_method, performance_7d, energy_level)
    VALUES
        (test_agent_1, 'us_east', 'equity', 'momentum_trading', 0.15, 0.85),
        (test_agent_2, 'eu_central', 'forex', 'arbitrage_strategy', 0.08, 0.92),
        (test_agent_3, 'asia_pacific', 'crypto', 'trend_following', 0.22, 0.76)
    ON CONFLICT (agent_name) DO UPDATE SET
        current_region = EXCLUDED.current_region,
        performance_7d = EXCLUDED.performance_7d,
        energy_level = EXCLUDED.energy_level,
        updated_at = now();

    -- Insert test mobility logs
    INSERT INTO public.ai_mobility_log (agent_name, from_region, to_region, asset_focus, motive, confidence)
    VALUES
        (test_agent_1, 'us_west', 'us_east', 'equity', 'volatility', 0.72),
        (test_agent_2, 'eu_west', 'eu_central', 'forex', 'arbitrage', 0.68),
        (test_agent_3, 'asia_east', 'asia_pacific', 'crypto', 'momentum', 0.81);

    -- Insert test decisions
    INSERT INTO public.ai_swarm_decisions (agent_name, decision_type, context, confidence, outcome)
    VALUES
        (test_agent_1, 'migrate', '{"reason": "high_volatility_detected", "target_market": "nasdaq"}'::jsonb, 0.72, 'success'),
        (test_agent_2, 'switch_method', '{"old_method": "grid_trading", "new_method": "arbitrage_strategy"}'::jsonb, 0.68, 'success'),
        (test_agent_3, 'fusion', '{"partner_agent": "delta_scalper_004", "combined_strategy": "hybrid_momentum"}'::jsonb, 0.85, 'pending');

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;