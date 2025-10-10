-- ==============================================================================
-- AAS Genius Pack Extension - Migration Script
-- Version: 1.0 (Production Architecture) 
-- Date: 2025-12-06 16:25:25
-- ==============================================================================

-- 1. Table pour le Jumeau Antagoniste (Omega AI)
CREATE TABLE IF NOT EXISTS public.omega_attacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alpha_strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
  omega_strategy_spec_yaml TEXT NOT NULL, -- La stratégie d'attaque
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'FAIL')), -- 'SUCCESS' (Alpha a perdu), 'FAIL' (Alpha a survécu)
  simulated_pnl NUMERIC,                  -- PnL de la stratégie Alpha durant l'attaque
  attack_vectors JSONB,                   -- Paramètres de l'attaque (ex: volatilité augmentée)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS omega_attacks_alpha_strategy_id_idx ON public.omega_attacks(alpha_strategy_id);
CREATE INDEX IF NOT EXISTS omega_attacks_outcome_idx ON public.omega_attacks(outcome);
CREATE INDEX IF NOT EXISTS omega_attacks_created_at_idx ON public.omega_attacks(created_at DESC);

-- 2. Table pour le Marché Synthétique Prédictif
CREATE TABLE IF NOT EXISTS public.forward_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
  simulation_id TEXT NOT NULL,            -- Identifiant du lot de simulations
  total_runs INT NOT NULL CHECK (total_runs > 0),
  success_runs INT NOT NULL CHECK (success_runs >= 0),                       -- Nombre de futurs où la stratégie a été profitable
  avg_pnl NUMERIC,
  pnl_stddev NUMERIC,                     -- Écart-type du PnL (mesure de risque)
  worst_case_pnl NUMERIC,
  robustness_score NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN total_runs > 0 THEN success_runs::NUMERIC / total_runs 
      ELSE 0 
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS forward_test_results_strategy_id_idx ON public.forward_test_results(strategy_id);
CREATE INDEX IF NOT EXISTS forward_test_results_simulation_id_idx ON public.forward_test_results(simulation_id);
CREATE INDEX IF NOT EXISTS forward_test_results_robustness_score_idx ON public.forward_test_results(robustness_score DESC);
CREATE INDEX IF NOT EXISTS forward_test_results_created_at_idx ON public.forward_test_results(created_at DESC);

-- 3. Table pour le Marché Interne de l'Attention
CREATE TABLE IF NOT EXISTS public.attention_market_bids (
  id BIGSERIAL PRIMARY KEY,
  agent TEXT NOT NULL,
  task_id TEXT NOT NULL,                  -- Identifiant unique de la tâche (ex: "analyze:TSLA")
  bid_amount INT NOT NULL CHECK (bid_amount > 0),                -- Montant de l'enchère en "Attention Tokens"
  task_priority INT DEFAULT 5 CHECK (task_priority BETWEEN 1 AND 10),                      -- Priorité intrinsèque de la tâche
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),          -- pending | won | lost
  computational_resources JSONB,          -- Ressources demandées (CPU, GPU, mémoire)
  estimated_duration_minutes INT,         -- Durée estimée de la tâche
  actual_duration_minutes INT,            -- Durée réelle (une fois terminée)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS attention_market_bids_status_ts_idx ON public.attention_market_bids(status, created_at DESC);
CREATE INDEX IF NOT EXISTS attention_market_bids_agent_idx ON public.attention_market_bids(agent);
CREATE INDEX IF NOT EXISTS attention_market_bids_task_id_idx ON public.attention_market_bids(task_id);
CREATE INDEX IF NOT EXISTS attention_market_bids_bid_amount_idx ON public.attention_market_bids(bid_amount DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.omega_attacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forward_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attention_market_bids ENABLE ROW LEVEL SECURITY;

-- Omega Attacks Policies
CREATE POLICY "users_view_omega_attacks" ON public.omega_attacks
  FOR SELECT USING (true); -- Public readable for analysis

CREATE POLICY "service_role_manage_omega_attacks" ON public.omega_attacks
  FOR ALL USING (auth.role() = 'service_role');

-- Forward Test Results Policies  
CREATE POLICY "users_view_forward_test_results" ON public.forward_test_results
  FOR SELECT USING (true); -- Public readable for analysis

CREATE POLICY "service_role_manage_forward_test_results" ON public.forward_test_results
  FOR ALL USING (auth.role() = 'service_role');

-- Attention Market Bids Policies
CREATE POLICY "users_view_attention_market_bids" ON public.attention_market_bids
  FOR SELECT USING (true); -- Public readable for analysis

CREATE POLICY "service_role_manage_attention_market_bids" ON public.attention_market_bids
  FOR ALL USING (auth.role() = 'service_role');

-- ==============================================================================
-- GENIUS PACK FUNCTIONS
-- ==============================================================================

-- Function to execute Omega attack simulation
CREATE OR REPLACE FUNCTION public.run_omega_attack_simulation(
  p_alpha_strategy_id UUID,
  p_omega_spec_yaml TEXT,
  p_attack_vectors JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  v_did_omega_win BOOLEAN;
  v_simulated_pnl NUMERIC;
  v_attack_id UUID;
  v_result JSONB;
BEGIN
  -- Simple simulation logic (to be enhanced with real backtesting)
  v_did_omega_win := (random() < 0.3); -- Omega wins 30% of the time
  v_simulated_pnl := CASE 
    WHEN v_did_omega_win THEN -random() * 500
    ELSE random() * 1000
  END;

  -- Insert attack record
  INSERT INTO public.omega_attacks (
    alpha_strategy_id, 
    omega_strategy_spec_yaml, 
    outcome, 
    simulated_pnl, 
    attack_vectors
  )
  VALUES (
    p_alpha_strategy_id,
    p_omega_spec_yaml,
    CASE WHEN v_did_omega_win THEN 'SUCCESS' ELSE 'FAIL' END,
    v_simulated_pnl,
    p_attack_vectors
  )
  RETURNING id INTO v_attack_id;

  -- Update strategy notes if attack succeeded
  IF v_did_omega_win THEN
    UPDATE public.strategy_candidates 
    SET notes = COALESCE(notes, '') || 
               FORMAT(' Fragile: Failed Omega attack at %s', NOW()::TEXT)
    WHERE id = p_alpha_strategy_id;
  END IF;

  -- Return result
  v_result := jsonb_build_object(
    'attack_id', v_attack_id,
    'alpha_strategy_id', p_alpha_strategy_id,
    'omega_won', v_did_omega_win,
    'pnl', v_simulated_pnl,
    'outcome', CASE WHEN v_did_omega_win THEN 'SUCCESS' ELSE 'FAIL' END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve attention market bids
CREATE OR REPLACE FUNCTION public.resolve_attention_market_bids(
  p_total_budget INT DEFAULT 1000000
)
RETURNS JSONB AS $$
DECLARE
  v_bid RECORD;
  v_remaining_budget INT := p_total_budget;
  v_winners TEXT[] := '{}';
  v_total_spent INT := 0;
  v_result JSONB;
BEGIN
  -- Get all pending bids ordered by bid amount, priority, and age
  FOR v_bid IN 
    SELECT id, agent, task_id, bid_amount, task_priority
    FROM public.attention_market_bids
    WHERE status = 'pending'
    ORDER BY bid_amount DESC, task_priority DESC, created_at ASC
  LOOP
    IF v_remaining_budget >= v_bid.bid_amount THEN
      -- Winner: update status and deduct budget
      UPDATE public.attention_market_bids 
      SET status = 'won' 
      WHERE id = v_bid.id;
      
      v_remaining_budget := v_remaining_budget - v_bid.bid_amount;
      v_total_spent := v_total_spent + v_bid.bid_amount;
      v_winners := array_append(v_winners, v_bid.task_id);
    ELSE
      -- Loser: update status
      UPDATE public.attention_market_bids 
      SET status = 'lost' 
      WHERE id = v_bid.id;
    END IF;
  END LOOP;

  -- Return results
  v_result := jsonb_build_object(
    'winners', v_winners,
    'total_spent', v_total_spent,
    'remaining_budget', v_remaining_budget,
    'processed_at', NOW()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create forward test simulation
CREATE OR REPLACE FUNCTION public.create_forward_test_simulation(
  p_strategy_id UUID,
  p_total_runs INT DEFAULT 1000
)
RETURNS JSONB AS $$
DECLARE
  v_simulation_id TEXT;
  v_success_runs INT;
  v_avg_pnl NUMERIC;
  v_pnl_stddev NUMERIC;
  v_worst_case_pnl NUMERIC;
  v_result_id UUID;
  v_result JSONB;
BEGIN
  -- Generate simulation ID
  v_simulation_id := 'sim_' || extract(epoch from NOW())::BIGINT::TEXT;
  
  -- Simulate results (to be replaced with real forward testing)
  v_success_runs := (random() * 400 + 550)::INT; -- Between 55% and 95%
  v_avg_pnl := random() * 2000 - 500;
  v_pnl_stddev := random() * 500 + 100;
  v_worst_case_pnl := -random() * 1000;

  -- Insert simulation results
  INSERT INTO public.forward_test_results (
    strategy_id,
    simulation_id,
    total_runs,
    success_runs,
    avg_pnl,
    pnl_stddev,
    worst_case_pnl
  )
  VALUES (
    p_strategy_id,
    v_simulation_id,
    p_total_runs,
    v_success_runs,
    v_avg_pnl,
    v_pnl_stddev,
    v_worst_case_pnl
  )
  RETURNING id INTO v_result_id;

  -- Return results
  v_result := jsonb_build_object(
    'result_id', v_result_id,
    'strategy_id', p_strategy_id,
    'simulation_id', v_simulation_id,
    'total_runs', p_total_runs,
    'success_runs', v_success_runs,
    'avg_pnl', v_avg_pnl,
    'robustness_score', (v_success_runs::NUMERIC / p_total_runs)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- MOCK DATA FOR TESTING
-- ==============================================================================

-- Insert mock Omega attacks
INSERT INTO public.omega_attacks (alpha_strategy_id, omega_strategy_spec_yaml, outcome, simulated_pnl, attack_vectors)
SELECT 
  sc.id,
  'strategy_id: omega_inverse_' || substring(sc.id::text, 1, 8) || E'\nfeatures:\n  - INVERSE(' || 
  COALESCE(substring(sc.spec_yaml, 1, 100), 'RSI(14)') || ')',
  CASE WHEN random() < 0.3 THEN 'SUCCESS' ELSE 'FAIL' END,
  CASE WHEN random() < 0.3 THEN -random() * 500 ELSE random() * 1000 END,
  jsonb_build_object('simulation_type', 'inverse_logic', 'volatility_multiplier', 1.5 + random())
FROM public.strategy_candidates sc
LIMIT 5;

-- Insert mock forward test results  
INSERT INTO public.forward_test_results (strategy_id, simulation_id, total_runs, success_runs, avg_pnl, pnl_stddev, worst_case_pnl)
SELECT 
  sc.id,
  'sim_' || extract(epoch from NOW() - interval '1 day' * generate_series(1, 3))::BIGINT::TEXT,
  1000,
  (random() * 400 + 550)::INT,
  random() * 2000 - 500,
  random() * 500 + 100,
  -random() * 1000
FROM public.strategy_candidates sc
CROSS JOIN generate_series(1, 3)
LIMIT 6;

-- Insert mock attention market bids
INSERT INTO public.attention_market_bids (agent, task_id, bid_amount, task_priority, status, computational_resources, estimated_duration_minutes)
VALUES
  ('momentum_trader_01', 'analyze:TSLA', 5000, 8, 'pending', '{"cpu_cores": 2, "memory_gb": 4, "gpu_required": false}', 15),
  ('mean_reversion_bot', 'analyze:AAPL', 7500, 9, 'pending', '{"cpu_cores": 4, "memory_gb": 8, "gpu_required": true}', 30),
  ('options_screener', 'scan:options_market', 10000, 10, 'won', '{"cpu_cores": 8, "memory_gb": 16, "gpu_required": true}', 45),
  ('sentiment_analyzer', 'process:news_feed', 3000, 6, 'pending', '{"cpu_cores": 1, "memory_gb": 2, "gpu_required": false}', 10),
  ('risk_controller', 'calculate:portfolio_risk', 8000, 9, 'won', '{"cpu_cores": 4, "memory_gb": 8, "gpu_required": false}', 20),
  ('strategy_weaver', 'generate:new_strategies', 12000, 10, 'pending', '{"cpu_cores": 8, "memory_gb": 32, "gpu_required": true}', 60),
  ('execution_guru', 'optimize:order_routing', 6000, 7, 'lost', '{"cpu_cores": 2, "memory_gb": 4, "gpu_required": false}', 25),
  ('data_miner', 'extract:market_patterns', 4500, 6, 'pending', '{"cpu_cores": 6, "memory_gb": 12, "gpu_required": false}', 90);

-- ==============================================================================
-- COMPLETION MESSAGE
-- ==============================================================================

-- Log successful migration
INSERT INTO public.automation_scripts (
  script_name, 
  description, 
  status, 
  last_run_at
) VALUES (
  'aas_genius_pack_migration',
  'AAS Genius Pack Extension Migration - Omega AI, Synthetic Market, Attention Market',
  'completed',
  NOW()
) ON CONFLICT (script_name) DO UPDATE SET
  status = 'completed',
  last_run_at = NOW(),
  description = 'AAS Genius Pack Extension Migration - Omega AI, Synthetic Market, Attention Market';

COMMIT;