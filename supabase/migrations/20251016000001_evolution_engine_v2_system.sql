-- ======================================================================
-- ROCKETNEW — EVOLUTION ENGINE v2 (Nomad & Free + Omega Adversarial)
-- Objectif : générer, muter, stresser et promouvoir des stratégies IA.
-- ======================================================================

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
  status TEXT NOT NULL DEFAULT 'queued',   -- 'queued'|'testing'|'paper'|'rejected'|'promoted'
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

INSERT INTO public.evo_policies(key, value) VALUES
('selection', '{"min_offline_score":0.62,"min_adversarial_score":0.58,"max_dd":0.12,"min_win_rate":0.55}'),
('mutation', '{"rate":0.25,"genes":["timeframe","lookback","entry_thr","exit_thr","atr_mult","assets"]}'),
('promotion','{"to_paper_score":0.68,"to_live_score":0.75,"cooldown_hours":4}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- RLS: service_role only
ALTER TABLE public.evo_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_fitness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evo_policies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Create policies for evolution system tables
  CREATE POLICY IF NOT EXISTS p_evo_str ON public.evo_strategies
    FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  CREATE POLICY IF NOT EXISTS p_evo_cand ON public.evo_candidates
    FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  CREATE POLICY IF NOT EXISTS p_evo_lin ON public.evo_lineage
    FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  CREATE POLICY IF NOT EXISTS p_evo_fit ON public.evo_fitness
    FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  CREATE POLICY IF NOT EXISTS p_evo_evt ON public.evo_events
    FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  CREATE POLICY IF NOT EXISTS p_evo_pol ON public.evo_policies
    FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
EXCEPTION
  WHEN OTHERS THEN NULL;
END$$;

-- Indices utiles
CREATE INDEX IF NOT EXISTS idx_evo_cand_status ON public.evo_candidates(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evo_fit_cand_phase ON public.evo_fitness(candidate_id, phase);