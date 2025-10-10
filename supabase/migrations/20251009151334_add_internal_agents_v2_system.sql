-- ====================================================================== 
-- Internal Agents — v2 (Robuste & Atomique) — SQL SUPABASE Schema
-- Fixed: Foreign Key Constraint Issue Resolution
-- ====================================================================

-- 0) Core Tables Creation (Sequential & Safe)
-- Create agents table first with explicit unique constraint
CREATE TABLE IF NOT EXISTS public.agents (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   name TEXT NOT NULL,
   kind TEXT NOT NULL CHECK (kind IN ('momentum','arbitrage','scalping','vol','macro','crypto','sentiment','utility','custom')),
   version TEXT DEFAULT '1.0.0',
   status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','busy','error','offline')),
   capabilities JSONB DEFAULT '[]'::JSONB,
   last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure unique constraint exists on name column (idempotent)
DO $$
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'agents_name_unique' 
        AND contype = 'u'
    ) THEN
        ALTER TABLE public.agents ADD CONSTRAINT agents_name_unique UNIQUE (name);
    END IF;
EXCEPTION
    WHEN duplicate_table THEN 
        -- Constraint already exists, continue
        NULL;
END $$;

-- Create dependent tables
CREATE TABLE IF NOT EXISTS public.agent_tasks (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   agent_name TEXT NOT NULL,
   task_type TEXT NOT NULL,
   payload JSONB NOT NULL,
   status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed','stale','timeout')),
   priority SMALLINT NOT NULL DEFAULT 0,
   result JSONB,
   error TEXT,
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW(),
   started_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.agent_metrics (
   id BIGSERIAL PRIMARY KEY,
   agent_name TEXT NOT NULL,
   ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   kpi JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS public.kill_switches (
   module TEXT PRIMARY KEY,
   is_active BOOLEAN DEFAULT FALSE,
   reason TEXT,
   activated_by TEXT,
   updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default kill switches
INSERT INTO public.kill_switches (module) 
VALUES 
  ('LIVE_TRADING'),
  ('STRATEGY_GENERATION'),
  ('EXECUTION')
ON CONFLICT (module) DO NOTHING;

-- 1) Hooks for updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at() 
RETURNS TRIGGER 
LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END $$;

-- Create triggers (idempotent)
DROP TRIGGER IF EXISTS trg_agents_touch ON public.agents;
CREATE TRIGGER trg_agents_touch 
  BEFORE UPDATE ON public.agents 
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_tasks_touch ON public.agent_tasks;
CREATE TRIGGER trg_tasks_touch 
  BEFORE UPDATE ON public.agent_tasks 
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) Indexes for performance
CREATE INDEX IF NOT EXISTS agent_tasks_pull_idx 
  ON public.agent_tasks(agent_name, status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS agent_metrics_name_ts_idx 
  ON public.agent_metrics(agent_name, ts DESC);

-- 3) Foreign Key Integrity (Create AFTER unique constraint confirmed)
DO $$
BEGIN
    -- Remove existing constraints if any
    ALTER TABLE public.agent_tasks DROP CONSTRAINT IF EXISTS fk_agent_name;
    ALTER TABLE public.agent_metrics DROP CONSTRAINT IF EXISTS fk_agent_name;
    
    -- Add foreign key constraints
    ALTER TABLE public.agent_tasks 
    ADD CONSTRAINT fk_agent_tasks_agent_name 
    FOREIGN KEY (agent_name) REFERENCES public.agents(name) ON DELETE CASCADE;

    ALTER TABLE public.agent_metrics 
    ADD CONSTRAINT fk_agent_metrics_agent_name 
    FOREIGN KEY (agent_name) REFERENCES public.agents(name) ON DELETE CASCADE;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint failed - verify agents table and unique constraint exist';
    WHEN others THEN
        RAISE NOTICE 'Error creating foreign key constraints: %', SQLERRM;
END $$;

-- 4) Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kill_switches ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies (Read access for all, write via service key)
DO $$
BEGIN
  -- Agents table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='agents' AND policyname='agents_select_all'
  ) THEN
    CREATE POLICY agents_select_all ON public.agents FOR SELECT USING (TRUE);
  END IF;

  -- Agent tasks policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='agent_tasks' AND policyname='agent_tasks_select_all'
  ) THEN
    CREATE POLICY agent_tasks_select_all ON public.agent_tasks FOR SELECT USING (TRUE);
  END IF;

  -- Agent metrics policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='agent_metrics' AND policyname='agent_metrics_select_all'
  ) THEN
    CREATE POLICY agent_metrics_select_all ON public.agent_metrics FOR SELECT USING (TRUE);
  END IF;

  -- Kill switches policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='kill_switches' AND policyname='kill_switches_select_all'
  ) THEN
    CREATE POLICY kill_switches_select_all ON public.kill_switches FOR SELECT USING (TRUE);
  END IF;
END $$;

-- 6) RPC Functions
-- Atomic task pull function
CREATE OR REPLACE FUNCTION public.pull_agent_task(p_agent_name TEXT)
RETURNS public.agent_tasks
LANGUAGE plpgsql AS $$
DECLARE
  task_row public.agent_tasks;
BEGIN
  UPDATE public.agent_tasks
  SET status = 'running',
      started_at = NOW(),
      updated_at = NOW()
  WHERE id = (
    SELECT id FROM public.agent_tasks
    WHERE agent_name = p_agent_name
      AND status = 'queued'
    ORDER BY priority DESC, created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING * INTO task_row;
  
  RETURN task_row; -- Returns null if no task available
END;
$$;

-- Maintenance function for timeouts and stale tasks
CREATE OR REPLACE FUNCTION public.mark_stale_and_timeouts(
  p_timeout_sec INT DEFAULT 900, 
  p_queued_stale_sec INT DEFAULT 86400
)
RETURNS TABLE(timeout_count INT, stale_count INT)
LANGUAGE plpgsql AS $$
DECLARE
  timeout_count INT;
  stale_count INT;
BEGIN
  -- Mark running tasks as timeout
  UPDATE public.agent_tasks
  SET status = 'timeout',
      error = COALESCE(error, 'timeout by maintenance RPC'),
      updated_at = NOW()
  WHERE status = 'running'
    AND started_at IS NOT NULL
    AND NOW() - started_at > MAKE_INTERVAL(secs => p_timeout_sec);
  
  GET DIAGNOSTICS timeout_count = ROW_COUNT;
  
  -- Mark old queued tasks as stale
  UPDATE public.agent_tasks
  SET status = 'stale',
      error = COALESCE(error, 'stale by maintenance RPC'),
      updated_at = NOW()
  WHERE status = 'queued'
    AND NOW() - created_at > MAKE_INTERVAL(secs => p_queued_stale_sec);
  
  GET DIAGNOSTICS stale_count = ROW_COUNT;
  
  RETURN NEXT;
END;
$$;

-- 7) Sample Data (Safe insertion with proper error handling)
DO $$
DECLARE
    agent_uuid_1 UUID := gen_random_uuid();
    agent_uuid_2 UUID := gen_random_uuid();
    task_uuid_1 UUID := gen_random_uuid();
    task_uuid_2 UUID := gen_random_uuid();
BEGIN
    -- Insert sample agents (ignore if already exist)
    INSERT INTO public.agents (id, name, kind, version, capabilities) VALUES
        (agent_uuid_1, 'QuantOracle', 'custom', '2.0.0', '["backtest","screen","signal"]'::JSONB),
        (agent_uuid_2, 'BehavioralAI', 'sentiment', '2.0.0', '["screen","backtest"]'::JSONB)
    ON CONFLICT (name) DO NOTHING;
    
    -- Insert sample tasks (only if agents exist)
    INSERT INTO public.agent_tasks (id, agent_name, task_type, payload, priority) 
    SELECT task_uuid_1, 'QuantOracle', 'backtest', '{"symbol":"NVDA","strategy":"momentum"}'::JSONB, 5
    WHERE EXISTS (SELECT 1 FROM public.agents WHERE name = 'QuantOracle')
    UNION ALL
    SELECT task_uuid_2, 'BehavioralAI', 'screen', '{"sector":"tech","sentiment":"positive"}'::JSONB, 3
    WHERE EXISTS (SELECT 1 FROM public.agents WHERE name = 'BehavioralAI');
    
    -- Insert sample metrics (only if agents exist)
    INSERT INTO public.agent_metrics (agent_name, kpi) 
    SELECT 'QuantOracle', '{"sharpe":1.08,"trades":300,"cpu":45.2}'::JSONB
    WHERE EXISTS (SELECT 1 FROM public.agents WHERE name = 'QuantOracle')
    UNION ALL
    SELECT 'BehavioralAI', '{"accuracy":87.5,"processed":150,"mem_mb":512}'::JSONB
    WHERE EXISTS (SELECT 1 FROM public.agents WHERE name = 'BehavioralAI');
        
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key violation during sample data insertion: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint violation during sample data insertion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error during sample data insertion: %', SQLERRM;
END $$;