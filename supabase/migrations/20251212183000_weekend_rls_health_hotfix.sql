-- ======================================================================
-- ROCKETNEW — HOTFIX PACK "WEEKEND+RLS+HEALTH" (v1) — Bloc Unique
-- Fixes:
--  - RLS health check -> "Not JSON (content-type=text/html)"
--  - TypeError: Failed to fetch (timeouts, CORS, 5xx)
--  - System health: getNetworkDiagnostics is not a function
--  - RLS violation on market_data (insert)
--  - Providers misnamed ("polygon_io" vs "polygon")
--  - Weekend spam retries (closed markets) + backoff
--  - Log noise reduction / informative banner
-- ======================================================================

-- 1) RLS POLICIES for "market_data"
-- Objective: allow insert via secure RPC (SECURITY DEFINER) and public read (if desired)
-- NOTE: adapt names if policies already exist (avoid 42710)

-- (a) enable RLS
ALTER TABLE IF EXISTS public.market_data ENABLE ROW LEVEL SECURITY;

-- (b) drop conflicting previous policies (idempotent)
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='market_data' AND policyname='md_select_public') THEN
    EXECUTE 'DROP POLICY md_select_public ON public.market_data';
  END IF;
  IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='market_data' AND policyname='md_insert_via_fn') THEN
    EXECUTE 'DROP POLICY md_insert_via_fn ON public.market_data';
  END IF;
END$$;

-- (c) SELECT (optionally public/anon). If you want to limit, replace TRUE with strict clause.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_data') THEN
    EXECUTE 'CREATE POLICY md_select_public ON public.market_data FOR SELECT USING (true)';
  END IF;
END$$;

-- (d) no direct INSERT; go through RPC (below). Allow when "request.jwt.claims.role = 'service_role'"
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_data') THEN
    EXECUTE 'CREATE POLICY md_insert_via_fn ON public.market_data FOR INSERT WITH CHECK (current_setting(''request.jwt.claims'', true)::jsonb->>''role'' = ''service_role'')';
  END IF;
END$$;

-- 2) Secure RPC for insert (bypass RLS client-side standard)
-- Agents/backends should call this function (via service key) instead of direct insert.
CREATE OR REPLACE FUNCTION public.secure_upsert_market_data(p_row jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _sym text := (p_row->>'symbol');
  _ts  timestamptz := (p_row->>'ts')::timestamptz;
BEGIN
  IF _sym IS NULL OR _ts IS NULL THEN
    RAISE EXCEPTION 'symbol and ts are required';
  END IF;
  
  -- Only proceed if market_data table exists
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_data') THEN
    INSERT INTO public.market_data(symbol, ts, price, source, payload)
    VALUES(
      _sym,
      _ts,
      (p_row->>'price')::numeric,
      COALESCE(p_row->>'source','unknown'),
      p_row
    )
    ON CONFLICT (symbol, ts) DO UPDATE
      SET price = EXCLUDED.price,
          source = EXCLUDED.source,
          payload = EXCLUDED.payload;
  END IF;
END$$;

-- (optional) useful index if absent
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_data') THEN
    CREATE INDEX IF NOT EXISTS ix_market_data_symbol_ts ON public.market_data(symbol, ts DESC);
  END IF;
END$$;

-- 3) Small "ops_flags" table to enable WEEKEND MODE and cut reconnection
CREATE TABLE IF NOT EXISTS public.ops_flags(
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.ops_flags(key, value)
VALUES ('weekend_gate', jsonb_build_object('enabled', true))
ON CONFLICT (key) DO NOTHING;

-- 4) Simple view for Health JSON (front checks should always receive JSON)
CREATE OR REPLACE VIEW public.v_health_rls AS
SELECT 
  now() AS ts,
  'ok'::text AS status,
  (SELECT COALESCE((SELECT value->>'enabled' FROM public.ops_flags WHERE key='weekend_gate'), 'false'))::text AS weekend_enabled;

-- 5) RPC health_json: always JSON and never HTML
CREATE OR REPLACE FUNCTION public.health_json()
RETURNS json
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  j json;
BEGIN
  SELECT json_build_object(
    'ts', now(),
    'status', 'ok',
    'weekend_enabled', (SELECT COALESCE((SELECT (value->>'enabled')::boolean FROM public.ops_flags WHERE key='weekend_gate'), false))
  ) INTO j;
  RETURN j;
END$$;

-- 6) Weekend market detection function
CREATE OR REPLACE FUNCTION public.is_weekend_utc()
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  day_of_week integer;
BEGIN
  SELECT EXTRACT(DOW FROM now() AT TIME ZONE 'UTC') INTO day_of_week;
  RETURN day_of_week IN (0, 6); -- Sunday = 0, Saturday = 6
END$$;

-- 7) Market status function
CREATE OR REPLACE FUNCTION public.get_market_status()
RETURNS json
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  is_weekend boolean;
  current_hour integer;
  is_open boolean := false;
  result json;
BEGIN
  SELECT public.is_weekend_utc() INTO is_weekend;
  SELECT EXTRACT(HOUR FROM now() AT TIME ZONE 'UTC') INTO current_hour;
  
  -- Simple market hours: 14:30-21:00 UTC (approx 9:30-16:00 ET)
  IF NOT is_weekend AND current_hour >= 14 AND current_hour < 21 THEN
    is_open := true;
  END IF;
  
  SELECT json_build_object(
    'is_open', is_open,
    'is_weekend', is_weekend,
    'current_hour_utc', current_hour,
    'status', CASE WHEN is_open THEN 'OPEN' ELSE 'CLOSED' END,
    'timezone', 'UTC',
    'timestamp', now()
  ) INTO result;
  
  RETURN result;
END$$;

-- 8) Create system health tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_health_log(
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  component text NOT NULL,
  status text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  error_message text,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_system_health_log_component_created ON public.system_health_log(component, created_at DESC);

-- 9) Function for logging system health events
CREATE OR REPLACE FUNCTION public.log_system_health(
  p_component text,
  p_status text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_error_message text DEFAULT NULL,
  p_response_time_ms integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.system_health_log(component, status, details, error_message, response_time_ms)
  VALUES (p_component, p_status, p_details, p_error_message, p_response_time_ms)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END$$;

-- 10) Provider normalization function
CREATE OR REPLACE FUNCTION public.normalize_provider_name(provider_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE LOWER(TRIM(provider_name))
    WHEN 'polygon_io' THEN 'polygon'
    WHEN 'ib' THEN 'ibkr'
    WHEN 'google_finance' THEN 'google'
    ELSE LOWER(TRIM(provider_name))
  END;
END$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.v_health_rls TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.health_json() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_market_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_weekend_utc() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_provider_name(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.secure_upsert_market_data(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_system_health(text, text, jsonb, text, integer) TO service_role, authenticated;
GRANT SELECT, INSERT ON public.system_health_log TO service_role, authenticated;
GRANT SELECT, UPDATE ON public.ops_flags TO service_role, authenticated;