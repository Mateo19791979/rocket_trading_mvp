-- =============================================================================
-- AAS Level 5 Completion: Health Sentinel, Triggers, Indexes & Functions
-- =============================================================================

-- Trigger function for updated_at columns
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END 
$$;

-- Add updated_at triggers for strategy_candidates (if not exists)
DROP TRIGGER IF EXISTS trg_touch_sc ON public.strategy_candidates;
CREATE TRIGGER trg_touch_sc BEFORE UPDATE ON public.strategy_candidates
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Add updated_at triggers for kill_switches (if not exists) 
DROP TRIGGER IF EXISTS trg_touch_ks ON public.kill_switches;
CREATE TRIGGER trg_touch_ks BEFORE UPDATE ON public.kill_switches
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Performance indexes for Level 5 operations (FIXED: using correct column names)
CREATE INDEX IF NOT EXISTS system_health_created_at_idx ON public.system_health(created_at DESC);
CREATE INDEX IF NOT EXISTS regime_state_as_of_idx ON public.regime_state(as_of DESC);
CREATE INDEX IF NOT EXISTS decisions_log_ts_outcome_idx ON public.decisions_log(ts DESC, outcome);
CREATE INDEX IF NOT EXISTS meta_learning_metrics_agent_ts_idx ON public.meta_learning_metrics(agent, ts DESC);
CREATE INDEX IF NOT EXISTS kill_switches_active_idx ON public.kill_switches(is_active) WHERE is_active = true;

-- Enhanced system_health table to support Level 5 Health Sentinel
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_health' AND column_name = 'dhi_avg'
  ) THEN
    ALTER TABLE public.system_health ADD COLUMN dhi_avg NUMERIC;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_health' AND column_name = 'alpha_decay'
  ) THEN
    ALTER TABLE public.system_health ADD COLUMN alpha_decay NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_health' AND column_name = 'compute_alpha'
  ) THEN
    ALTER TABLE public.system_health ADD COLUMN compute_alpha NUMERIC DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_health' AND column_name = 'errors_1h'
  ) THEN
    ALTER TABLE public.system_health ADD COLUMN errors_1h INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_health' AND column_name = 'mode'
  ) THEN
    ALTER TABLE public.system_health ADD COLUMN mode TEXT DEFAULT 'normal';
  END IF;
END $$;

-- Enhanced kill_switches table to support LIVE_TRADING module if not exists
INSERT INTO public.kill_switches (module, is_active, reason, created_at, updated_at) 
VALUES ('LIVE_TRADING', false, null, NOW(), NOW())
ON CONFLICT (module) DO NOTHING;

-- Function to increment prompt success/failure (placeholder - implement as needed)
CREATE OR REPLACE FUNCTION increment_prompt_success(prompt_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.prompt_registry 
  SET success = success + 1, 
      last_used = NOW(),
      updated_at = NOW()
  WHERE id = prompt_id;
END $$;

CREATE OR REPLACE FUNCTION increment_prompt_failure(prompt_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.prompt_registry 
  SET failure = failure + 1,
      updated_at = NOW()
  WHERE id = prompt_id;
END $$;

-- Enhanced RLS policies for Level 5 operations
DROP POLICY IF EXISTS "admin_system_health_access" ON public.system_health;
CREATE POLICY "admin_system_health_access" ON public.system_health
FOR ALL USING (is_admin_from_auth());

DROP POLICY IF EXISTS "admin_regime_state_access" ON public.regime_state;  
CREATE POLICY "admin_regime_state_access" ON public.regime_state
FOR ALL USING (is_admin_from_auth());

-- AAS Level 5 completion: Health Sentinel infrastructure, triggers, indexes, and Level 5 operational support