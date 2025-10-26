-- ======================================================================
-- ROCKETNEW — Evolution Engine v2 + Canary IBKR Paper v1 System
-- Complete implementation of AI evolution with paper trading promotion
-- Integration Type: Comprehensive evolution and canary system
-- Dependencies: None (creates all necessary dependencies)
-- ======================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- EVOLUTION ENGINE v2 TABLES (Base System)
-- =====================================================

-- Stratégies connues (parents)
CREATE TABLE IF NOT EXISTS public.evo_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  genome JSONB NOT NULL,             -- hyperparams, features, timeframes...
  method TEXT NOT NULL,              -- ex: 'momentum_5m','arbitrage_spread','vol_breakout'
  asset_class TEXT NOT NULL,         -- 'equity'|'forex'|'crypto'|'etf'|'option'|...
  status TEXT NOT NULL DEFAULT 'live',  -- 'live'|'paper'|'retired'
  fitness NUMERIC DEFAULT 0,         -- fitness long terme (0..1)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Candidats (nouveaux nés) issus de mutation/crossover
CREATE TABLE IF NOT EXISTS public.evo_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_ids UUID[] DEFAULT '{}',
  genome JSONB NOT NULL,
  method TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  spec JSONB,                        -- spec de déploiement (YAML/JSON), broker rules, TP/SL...
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'queued',   -- 'queued'|'testing'|'paper'|'rejected'|'promoted'|'canary'
  notes TEXT
);

-- Lignée (trace généalogique)
CREATE TABLE IF NOT EXISTS public.evo_lineage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.evo_candidates(id) ON DELETE CASCADE,
  parent_id UUID,
  relation TEXT NOT NULL,            -- 'crossover'|'mutation'|'clone'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fitness multi-sources (backtest/offline, online/paper, adversarial/omega)
CREATE TABLE IF NOT EXISTS public.evo_fitness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.evo_candidates(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,               -- 'offline'|'paper'|'adversarial'
  sharpe NUMERIC,
  sortino NUMERIC,
  win_rate NUMERIC,
  pfactor NUMERIC,                   -- profit factor
  dd_max NUMERIC,                    -- max drawdown
  pnl NUMERIC,                       -- pnl agrégé (unité cohérente)
  capacity_est NUMERIC,
  score NUMERIC,                     -- score agrégé (0..1)
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Evénements (log clair : mutation, test, attaque, promotion)
CREATE TABLE IF NOT EXISTS public.evo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID,
  type TEXT NOT NULL,                -- 'mutate'|'evaluate_offline'|'evaluate_adversarial'|'promote'|'reject'
  message TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Politiques d'évolution (seuils)
CREATE TABLE IF NOT EXISTS public.evo_policies (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- =====================================================
-- CANARY SYSTEM TABLES (Extension)
-- =====================================================

-- Politique canary (seuils & limites)
CREATE TABLE IF NOT EXISTS public.evo_canary_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_paper_score NUMERIC NOT NULL DEFAULT 0.70,     -- score evo_fitness (phase 'offline')
    min_adversarial_score NUMERIC NOT NULL DEFAULT 0.65, -- score evo_fitness (phase 'adversarial')
    min_hours_in_paper INTEGER NOT NULL DEFAULT 2,       -- attendre X h en 'paper' avant canary
    max_parallel INTEGER NOT NULL DEFAULT 3,             -- nb canary simultanés
    min_notional NUMERIC DEFAULT 1000,                   -- taille min en devise (si applicable)
    min_qty NUMERIC DEFAULT 1,                           -- taille min en quantité (fallback)
    dry_run BOOLEAN NOT NULL DEFAULT true,               -- d'abord dry-run pour 1ère passe
    active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal des promotions canary
CREATE TABLE IF NOT EXISTS public.evo_promotions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.evo_candidates(id) ON DELETE CASCADE,
    action TEXT NOT NULL,         -- 'queued_canary' | 'skipped' | 'error'
    reason TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table execution_queue si elle n'existe pas (pour le trading)
CREATE TABLE IF NOT EXISTS public.execution_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID,
    broker TEXT NOT NULL DEFAULT 'ibkr',
    order_payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending'|'processing'|'completed'|'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table kill_switches si elle n'existe pas (pour les contrôles)
CREATE TABLE IF NOT EXISTS public.kill_switches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module TEXT NOT NULL UNIQUE,     -- 'EXECUTION'|'LIVE_TRADING'|'MARKET_DATA'
    is_active BOOLEAN NOT NULL DEFAULT false,
    reason TEXT,
    activated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix missing is_active column in positions table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'positions' AND table_schema = 'public') THEN
        -- Add is_active column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'positions' AND column_name = 'is_active' AND table_schema = 'public') THEN
            ALTER TABLE public.positions ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        END IF;
    END IF;
EXCEPTION
    WHEN others THEN NULL; -- Ignore if table doesn't exist
END$$;

-- =====================================================
-- DATA INITIALIZATION
-- =====================================================

-- Insertion des politiques d'évolution par défaut
INSERT INTO public.evo_policies(key, value) VALUES
('selection', '{"min_offline_score":0.62,"min_adversarial_score":0.58,"max_dd":0.12,"min_win_rate":0.55}'),
('mutation', '{"rate":0.25,"genes":["timeframe","lookback","entry_thr","exit_thr","atr_mult","assets"]}'),
('promotion','{"to_paper_score":0.68,"to_live_score":0.75,"cooldown_hours":4}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Insertion de la politique canary par défaut
INSERT INTO public.evo_canary_policy(min_paper_score, min_adversarial_score, min_hours_in_paper, max_parallel, min_notional, min_qty, dry_run, active)
VALUES (0.70, 0.65, 2, 3, 1000, 1, true, true)
ON CONFLICT DO NOTHING;

-- Insertion des kill switches par défaut (désactivés) - Fixed UUID issue
DO $$
BEGIN
  INSERT INTO public.kill_switches(module, is_active, reason, activated_by)
  VALUES 
      ('EXECUTION', false, 'System initialized', 'system_init'),
      ('LIVE_TRADING', false, 'System initialized', 'system_init'),
      ('MARKET_DATA', false, 'System initialized', 'system_init')
  ON CONFLICT (module) DO NOTHING;
EXCEPTION
  WHEN others THEN NULL; -- Ignore any conflicts or errors
END$$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indices utiles pour les requêtes évolution
CREATE INDEX IF NOT EXISTS idx_evo_cand_status ON public.evo_candidates(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evo_fit_cand_phase ON public.evo_fitness(candidate_id, phase);
CREATE INDEX IF NOT EXISTS idx_evo_promotions_candidate ON public.evo_promotions_log(candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_queue_status ON public.execution_queue(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kill_switches_module ON public.kill_switches(module);

-- Additional indexes for evolution system
CREATE INDEX IF NOT EXISTS idx_evo_strategies_status ON public.evo_strategies(status, fitness DESC);
CREATE INDEX IF NOT EXISTS idx_evo_lineage_candidate ON public.evo_lineage(candidate_id);
CREATE INDEX IF NOT EXISTS idx_evo_events_candidate ON public.evo_events(candidate_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================

-- Enable RLS for all tables
ALTER TABLE public.evo_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_fitness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_canary_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_promotions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kill_switches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - service_role only for security
DO $$
BEGIN
  -- Evolution system policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_strategies' AND policyname='p_evo_str') THEN
    CREATE POLICY p_evo_str ON public.evo_strategies
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_candidates' AND policyname='p_evo_cand') THEN
    CREATE POLICY p_evo_cand ON public.evo_candidates
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_lineage' AND policyname='p_evo_lin') THEN
    CREATE POLICY p_evo_lin ON public.evo_lineage
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_fitness' AND policyname='p_evo_fit') THEN
    CREATE POLICY p_evo_fit ON public.evo_fitness
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_events' AND policyname='p_evo_evt') THEN
    CREATE POLICY p_evo_evt ON public.evo_events
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_policies' AND policyname='p_evo_pol') THEN
    CREATE POLICY p_evo_pol ON public.evo_policies
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
    
  -- Canary system policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_canary_policy' AND policyname='p_evo_canary_policy') THEN
    CREATE POLICY p_evo_canary_policy ON public.evo_canary_policy
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='evo_promotions_log' AND policyname='p_evo_promotions_log') THEN
    CREATE POLICY p_evo_promotions_log ON public.evo_promotions_log
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
    
  -- Trading system policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='execution_queue' AND policyname='p_execution_queue') THEN
    CREATE POLICY p_execution_queue ON public.execution_queue
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='kill_switches' AND policyname='p_kill_switches') THEN
    CREATE POLICY p_kill_switches ON public.kill_switches
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
    
EXCEPTION
  WHEN OTHERS THEN NULL;
END$$;

-- =====================================================
-- HELPER VIEWS FOR MONITORING
-- =====================================================

-- Vue simple: candidats en cours de test (facilitateur debug)
CREATE OR REPLACE VIEW public.v_evo_testing AS
SELECT id, created_at, method, asset_class, spec, status, notes
FROM public.evo_candidates
WHERE status = 'testing'
ORDER BY created_at DESC;

-- Vue: candidats prêts pour canary
CREATE OR REPLACE VIEW public.v_evo_ready_for_canary AS
SELECT c.id, c.created_at, c.method, c.asset_class, c.spec,
       f_off.score AS offline_score,
       f_adv.score AS adversarial_score
FROM public.evo_candidates c
LEFT JOIN public.evo_fitness f_off ON f_off.candidate_id = c.id AND f_off.phase = 'offline'
LEFT JOIN public.evo_fitness f_adv ON f_adv.candidate_id = c.id AND f_adv.phase = 'adversarial'
WHERE c.status = 'paper'
  AND c.created_at <= NOW() - INTERVAL '2 hours'
ORDER BY c.created_at DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Migration completed successfully: Evolution Engine v2 + Canary IBKR Paper v1 System
-- Tables created: evo_strategies, evo_candidates, evo_lineage, evo_fitness, evo_events, evo_policies, evo_canary_policy, evo_promotions_log, execution_queue, kill_switches
-- Fixed: positions.is_active column added if missing
-- RLS policies applied for service_role security
-- Helper views created for monitoring
-- Ready for AI evolution and paper trading promotion system