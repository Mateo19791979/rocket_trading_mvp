-- Location: supabase/migrations/20251209190000_add_aas_governance_learning_pack_v3.sql
-- Schema Analysis: Adding comprehensive governance system with scheduler, playbooks, proposals, and learning KPIs
-- Integration Type: Addition - New governance module extending existing orchestrator system
-- Dependencies: Existing orch_inbox table from orchestrator bridge system

-- 1) GOVERNANCE ORCHESTRATION TABLES

-- Schedule table for cron and one-shot tasks
CREATE TABLE IF NOT EXISTS public.orch_schedule(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  channel TEXT NOT NULL DEFAULT 'execution',
  command TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  cron_expression TEXT,                  -- ex: "0 8 * * 1-5" ; si nul, one-shot via next_run_at
  next_run_at TIMESTAMPTZ,               -- one-shot ou seed/compute next
  priority SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Playbooks for automated response to metrics/conditions
CREATE TABLE IF NOT EXISTS public.orch_playbooks(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  trigger_spec JSONB NOT NULL,  -- {"kind":"metric","name":"global_dd","op":">=","value":0.03}
  steps JSONB NOT NULL,         -- [{"channel":"execution","command":"kill-switch","payload":{"module":"LIVE_TRADING","active":true}}]
  cooldown_seconds INT NOT NULL DEFAULT 300,
  last_triggered_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Strategic proposals from AI that require human approval
CREATE TABLE IF NOT EXISTS public.orch_proposals(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','rejected','executed')),
  action TEXT NOT NULL,          -- ex: 'rebalance' | 'deploy-strategy' | 'set-risk'
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  justification TEXT,
  created_by TEXT DEFAULT 'AAS',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) LEARNING KPIS TABLES (track AI agent learning curve)

-- Daily consolidated learning metrics
CREATE TABLE IF NOT EXISTS public.learning_kpis_daily(
  day DATE PRIMARY KEY,
  win_rate NUMERIC,                  -- trades gagnants / total (global)
  avg_gain NUMERIC,                  -- gain moyen par trade gagnant (%)
  avg_loss NUMERIC,                  -- perte moyenne par trade perdant (%)
  rr_ratio NUMERIC,                  -- avg_gain / avg_loss
  trades_count INT,
  pnl_daily NUMERIC,                 -- PnL total du jour
  notes TEXT
);

-- KPIs par agent (pour allocation dynamique et méta-apprentissage simple)
CREATE TABLE IF NOT EXISTS public.agent_kpis_daily(
  day DATE NOT NULL,
  agent_name TEXT NOT NULL,
  win_rate NUMERIC,
  sharpe NUMERIC,
  pnl NUMERIC,
  drawdown NUMERIC,
  activity INT,                      -- nb de trades
  regime TEXT,                       -- tag "bull", "range", "vol-high", etc.
  PRIMARY KEY(day, agent_name)
);

-- 3) PORTFOLIO METRICS & AGENT HEALTH (feed playbooks)

-- Real-time portfolio risk metrics
CREATE TABLE IF NOT EXISTS public.portfolio_metrics(
  as_of TIMESTAMPTZ PRIMARY KEY,
  global_drawdown_pct NUMERIC,       -- e.g. 0.032 pour 3.2%
  pnl_1h NUMERIC,
  pnl_24h NUMERIC,
  exposure NUMERIC                    -- exposition du capital (0..1)
);

-- Agent error tracking and health monitoring
CREATE TABLE IF NOT EXISTS public.agent_metrics_agg(
  agent_name TEXT PRIMARY KEY,
  error_count_1h INT DEFAULT 0,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Key-value store for governance rules and configuration
CREATE TABLE IF NOT EXISTS public.kv_store(
  k TEXT PRIMARY KEY, 
  v JSONB, 
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) INDEXES for performance
CREATE INDEX IF NOT EXISTS orch_schedule_due_idx ON public.orch_schedule(is_active, next_run_at);
CREATE INDEX IF NOT EXISTS orch_playbooks_active_idx ON public.orch_playbooks(is_active);
CREATE INDEX IF NOT EXISTS orch_proposals_idx ON public.orch_proposals(status, created_at DESC);

-- 5) RLS POLICIES (restrict to service_role for governance operations)
ALTER TABLE public.orch_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orch_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orch_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_kpis_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_kpis_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_metrics_agg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv_store ENABLE ROW LEVEL SECURITY;

-- Service role only access (production governance)
DROP POLICY IF EXISTS "orch_schedule_all" ON public.orch_schedule;
DROP POLICY IF EXISTS "orch_playbooks_all" ON public.orch_playbooks;
DROP POLICY IF EXISTS "orch_proposals_all" ON public.orch_proposals;
DROP POLICY IF EXISTS "learning_kpis_all" ON public.learning_kpis_daily;
DROP POLICY IF EXISTS "agent_kpis_all" ON public.agent_kpis_daily;
DROP POLICY IF EXISTS "portfolio_metrics_all" ON public.portfolio_metrics;
DROP POLICY IF EXISTS "agent_metrics_agg_all" ON public.agent_metrics_agg;
DROP POLICY IF EXISTS "kv_store_all" ON public.kv_store;

CREATE POLICY "orch_schedule_all" ON public.orch_schedule
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "orch_playbooks_all" ON public.orch_playbooks
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "orch_proposals_all" ON public.orch_proposals
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "learning_kpis_all" ON public.learning_kpis_daily
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "agent_kpis_all" ON public.agent_kpis_daily
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "portfolio_metrics_all" ON public.portfolio_metrics
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "agent_metrics_agg_all" ON public.agent_metrics_agg
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "kv_store_all" ON public.kv_store
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 6) UTILITY FUNCTIONS

-- RPC function for atomically dequeuing due scheduled tasks
CREATE OR REPLACE FUNCTION public.dequeue_due_schedule(p_now TIMESTAMPTZ)
RETURNS SETOF public.orch_schedule
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.orch_schedule s
     SET last_run_at = p_now, updated_at = p_now
   WHERE s.is_active = true 
     AND s.next_run_at IS NOT NULL 
     AND s.next_run_at <= p_now
  RETURNING *;
END $$;

-- Utility function for kv_store compatibility
CREATE OR REPLACE FUNCTION public.ensure_kv_table() 
RETURNS VOID 
LANGUAGE plpgsql 
AS $$ 
BEGIN 
  -- Table already exists, this is a noop
  NULL; 
END $$;

-- 7) SEED DATA - Base playbooks and schedules for production readiness

-- Insert foundational playbooks for risk management
INSERT INTO public.orch_playbooks(name, description, trigger_spec, steps, cooldown_seconds, is_active)
VALUES
('PANIC_DD_3', 'Disjoncteur global à DD>=3%', 
 '{"kind":"metric","name":"global_drawdown_pct","op":">=","value":0.03}',
 '[{"channel":"execution","command":"kill-switch","payload":{"module":"LIVE_TRADING","active":true,"reason":"DD>=3%"}},
   {"channel":"execution","command":"rebalance","payload":{"targets":{"CASH":1.0}}},
   {"channel":"data","command":"health-check","payload":{"scope":"all"}}]', 600, true),
   
('ROGUE_AGENT', 'Isolation agent en erreur', 
 '{"kind":"agent_errors","agent":"Alpha Momentum Pro","op":">","value":5,"window_min":60}',
 '[{"channel":"execution","command":"pause-agent","payload":{"agent":"Alpha Momentum Pro"}},
   {"channel":"ops","command":"enqueue_notification","payload":{"channel":"ops-alerts","message":"Alpha Momentum Pro isolé (erreurs>5/h)."}}]', 900, true)

ON CONFLICT (name) DO NOTHING;

-- Insert base scheduled tasks
INSERT INTO public.orch_schedule(name, description, channel, command, payload, cron_expression, priority, is_active)
VALUES
('SYNC_BOOKS_08H', 'Sync positions avant ouverture', 'execution', 'sync-books', '{}', '0 8 * * 1-5', 10, true),
('REDUCE_RISK_FRI_16H', 'Réduction risque avant WE', 'execution', 'set-risk', '{"leverage":0.5}', '0 16 * * 5', 10, true)
ON CONFLICT (name) DO NOTHING;

-- Seed initial learning KPI baseline
DO $$
DECLARE
    today_str DATE := CURRENT_DATE;
BEGIN
    INSERT INTO public.learning_kpis_daily (day, win_rate, avg_gain, avg_loss, rr_ratio, trades_count, pnl_daily, notes)
    VALUES (today_str, 0.55, 0.6, 0.4, 1.5, 0, 0.0, 'Initial baseline - system learning phase')
    ON CONFLICT (day) DO NOTHING;
END $$;