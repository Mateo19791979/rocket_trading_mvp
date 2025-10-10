-- ==============================================================================
-- == AAS Genius Pack - Extension for Rocketnew
-- == Schema Analysis: Existing trading system with strategy_candidates, ai_agents, kill_switches, compute_budget
-- == Integration Type: Addition - New genius modules that complement existing AAS Level 5
-- == Dependencies: strategy_candidates, ai_agents, user_profiles
-- ==============================================================================

-- 1. Table pour le Jumeau Antagoniste (Omega AI)
CREATE TABLE IF NOT EXISTS public.omega_attacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alpha_strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
  omega_strategy_spec_yaml TEXT NOT NULL, -- La stratégie d'attaque
  outcome TEXT NOT NULL, -- 'SUCCESS' (Alpha a perdu), 'FAIL' (Alpha a survécu)
  simulated_pnl NUMERIC, -- PnL de la stratégie Alpha durant l'attaque
  attack_vectors JSONB, -- Paramètres de l'attaque (ex: volatilité augmentée)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table pour le Marché Synthétique Prédictif
CREATE TABLE IF NOT EXISTS public.forward_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
  simulation_id TEXT NOT NULL, -- Identifiant du lot de simulations
  total_runs INTEGER NOT NULL DEFAULT 1000,
  success_runs INTEGER NOT NULL DEFAULT 0, -- Nombre de futurs où la stratégie a été profitable
  avg_pnl NUMERIC DEFAULT 0.0,
  pnl_stddev NUMERIC DEFAULT 0.0, -- Écart-type du PnL (mesure de risque)
  worst_case_pnl NUMERIC DEFAULT 0.0,
  robustness_score NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN total_runs = 0 THEN 0 
      ELSE success_runs::NUMERIC / total_runs 
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table pour le Marché Interne de l'Attention
CREATE TABLE IF NOT EXISTS public.attention_market_bids (
  id BIGSERIAL PRIMARY KEY,
  agent TEXT NOT NULL,
  task_id TEXT NOT NULL, -- Identifiant unique de la tâche (ex: "analyze:TSLA")
  bid_amount INTEGER NOT NULL DEFAULT 0, -- Montant de l'enchère en "Attention Tokens"
  task_priority INTEGER DEFAULT 5, -- Priorité intrinsèque de la tâche
  status TEXT DEFAULT 'pending', -- pending | won | lost
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes pour les performances
CREATE INDEX IF NOT EXISTS omega_attacks_alpha_strategy_id_idx ON public.omega_attacks(alpha_strategy_id);
CREATE INDEX IF NOT EXISTS omega_attacks_outcome_idx ON public.omega_attacks(outcome);
CREATE INDEX IF NOT EXISTS omega_attacks_created_at_idx ON public.omega_attacks(created_at DESC);

CREATE INDEX IF NOT EXISTS forward_test_results_strategy_id_idx ON public.forward_test_results(strategy_id);
CREATE INDEX IF NOT EXISTS forward_test_results_simulation_id_idx ON public.forward_test_results(simulation_id);
CREATE INDEX IF NOT EXISTS forward_test_results_robustness_idx ON public.forward_test_results(robustness_score DESC);
CREATE INDEX IF NOT EXISTS forward_test_results_created_at_idx ON public.forward_test_results(created_at DESC);

CREATE INDEX IF NOT EXISTS attention_market_bids_status_ts_idx ON public.attention_market_bids(status, created_at DESC);
CREATE INDEX IF NOT EXISTS attention_market_bids_agent_idx ON public.attention_market_bids(agent);
CREATE INDEX IF NOT EXISTS attention_market_bids_task_id_idx ON public.attention_market_bids(task_id);

-- 5. Enable RLS on new tables
ALTER TABLE public.omega_attacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forward_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attention_market_bids ENABLE ROW LEVEL SECURITY;

-- 6. Functions for Admin Access
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

-- 7. RLS Policies using Pattern 6A (Admin access via auth.users metadata)
CREATE POLICY "admin_full_access_omega_attacks"
ON public.omega_attacks
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_forward_test_results"
ON public.forward_test_results
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_attention_market_bids"
ON public.attention_market_bids
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 8. Helper functions for the Genius Pack
CREATE OR REPLACE FUNCTION public.run_omega_attack(
    p_alpha_strategy_id UUID,
    p_omega_spec TEXT,
    p_attack_vectors JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    attack_id UUID;
    simulated_outcome TEXT;
    simulated_pnl_result NUMERIC;
BEGIN
    -- Simuler le résultat (à remplacer par une vraie logique de backtesting)
    simulated_outcome := CASE WHEN random() < 0.3 THEN 'SUCCESS' ELSE 'FAIL' END;
    simulated_pnl_result := CASE WHEN simulated_outcome = 'SUCCESS' THEN -random() * 500 ELSE random() * 1000 END;
    
    -- Enregistrer l'attaque
    INSERT INTO public.omega_attacks (
        alpha_strategy_id,
        omega_strategy_spec_yaml,
        outcome,
        simulated_pnl,
        attack_vectors
    ) VALUES (
        p_alpha_strategy_id,
        p_omega_spec,
        simulated_outcome,
        simulated_pnl_result,
        p_attack_vectors
    ) RETURNING id INTO attack_id;
    
    -- Marquer la stratégie comme fragile si l'attaque a réussi
    IF simulated_outcome = 'SUCCESS' THEN
        UPDATE public.strategy_candidates 
        SET notes = COALESCE(notes, '') || ' [FRAGILE: Failed Omega attack at ' || NOW()::TEXT || ']'
        WHERE id = p_alpha_strategy_id;
    END IF;
    
    RETURN attack_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.run_forward_test(
    p_strategy_id UUID,
    p_total_runs INTEGER DEFAULT 1000
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_id UUID;
    simulation_id_val TEXT;
    success_runs_val INTEGER;
    avg_pnl_val NUMERIC;
    worst_case_val NUMERIC;
BEGIN
    -- Générer un ID de simulation unique
    simulation_id_val := 'sim_' || EXTRACT(epoch FROM NOW())::TEXT;
    
    -- Simuler les résultats (à remplacer par de vrais calculs)
    success_runs_val := FLOOR(random() * 400 + 550); -- Entre 55% et 95%
    avg_pnl_val := random() * 2000 - 500;
    worst_case_val := -random() * 1000;
    
    -- Enregistrer les résultats
    INSERT INTO public.forward_test_results (
        strategy_id,
        simulation_id,
        total_runs,
        success_runs,
        avg_pnl,
        pnl_stddev,
        worst_case_pnl
    ) VALUES (
        p_strategy_id,
        simulation_id_val,
        p_total_runs,
        success_runs_val,
        avg_pnl_val,
        abs(avg_pnl_val) * 0.3, -- Écart-type simulé
        worst_case_val
    ) RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_attention_bid(
    p_agent TEXT,
    p_task_id TEXT,
    p_bid_amount INTEGER,
    p_priority INTEGER DEFAULT 5
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bid_id BIGINT;
BEGIN
    INSERT INTO public.attention_market_bids (
        agent,
        task_id,
        bid_amount,
        task_priority
    ) VALUES (
        p_agent,
        p_task_id,
        p_bid_amount,
        p_priority
    ) RETURNING id INTO bid_id;
    
    RETURN bid_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_attention_bids()
RETURNS TABLE(
    winners TEXT[],
    total_spent INTEGER,
    bids_resolved INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_budget_per_cycle INTEGER := 1000000; -- 1M tokens par cycle
    remaining_budget INTEGER;
    winning_task_ids TEXT[] := ARRAY[]::TEXT[];
    total_cost INTEGER := 0;
    resolved_count INTEGER := 0;
    bid_record RECORD;
BEGIN
    remaining_budget := total_budget_per_cycle;
    
    -- Traiter les enchères par ordre de priorité (plus haute enchère + priorité + ancienneté)
    FOR bid_record IN 
        SELECT * FROM public.attention_market_bids 
        WHERE status = 'pending' 
        ORDER BY bid_amount DESC, task_priority DESC, created_at ASC
    LOOP
        IF remaining_budget >= bid_record.bid_amount THEN
            -- Enchère gagnante
            remaining_budget := remaining_budget - bid_record.bid_amount;
            total_cost := total_cost + bid_record.bid_amount;
            winning_task_ids := array_append(winning_task_ids, bid_record.task_id);
            
            UPDATE public.attention_market_bids 
            SET status = 'won', updated_at = NOW()
            WHERE id = bid_record.id;
        ELSE
            -- Enchère perdante
            UPDATE public.attention_market_bids 
            SET status = 'lost', updated_at = NOW()
            WHERE id = bid_record.id;
        END IF;
        
        resolved_count := resolved_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT winning_task_ids, total_cost, resolved_count;
END;
$$;

-- 9. Triggers pour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_omega_attacks_updated_at 
    BEFORE UPDATE ON public.omega_attacks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forward_test_results_updated_at 
    BEFORE UPDATE ON public.forward_test_results
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attention_market_bids_updated_at 
    BEFORE UPDATE ON public.attention_market_bids
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Mock data pour tester les nouveaux modules
DO $$
DECLARE
    existing_strategy_id UUID;
    attack_id UUID;
    forward_test_id UUID;
    attention_bid_id BIGINT;
BEGIN
    -- Récupérer une stratégie existante pour les tests
    SELECT id INTO existing_strategy_id FROM public.strategy_candidates LIMIT 1;
    
    IF existing_strategy_id IS NOT NULL THEN
        -- Test Omega AI Attack
        SELECT public.run_omega_attack(
            existing_strategy_id,
            'strategy_id: omega_counter_001
features:
  - inverse_RSI(14)
  - short_when_long
  - contrarian_momentum
parameters:
  aggressiveness: high
  counter_signals: true',
            '{"simulation_type": "inverse_logic", "volatility_multiplier": 1.5}'::jsonb
        ) INTO attack_id;
        
        -- Test Forward Testing
        SELECT public.run_forward_test(existing_strategy_id, 1000) INTO forward_test_id;
        
        -- Test Attention Market
        SELECT public.submit_attention_bid('strategy_weaver', 'analyze:TSLA', 50000, 8) INTO attention_bid_id;
        SELECT public.submit_attention_bid('execution_guru', 'optimize:SPY', 30000, 6) INTO attention_bid_id;
        SELECT public.submit_attention_bid('options_screener', 'scan:high_iv', 25000, 7) INTO attention_bid_id;
        
        RAISE NOTICE 'AAS Genius Pack test data created successfully!';
        RAISE NOTICE 'Omega attack ID: %', attack_id;
        RAISE NOTICE 'Forward test ID: %', forward_test_id;
    ELSE
        RAISE NOTICE 'No existing strategies found. Genius Pack tables created but no test data inserted.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Genius Pack test data: %', SQLERRM;
END $$;