-- ======================================================================
-- ROCKETNEW — PACK "DIAGNOSTIC & RÉPARATION CHIRURGICALE" v2 (bloc unique)
-- Objectif : 
--   1) Diagnostiquer précisément les pannes de pages (SQL/React/Supabase/RLS)
--   2) Réparer les colonnes manquantes UNIQUEMENT si on le demande (no migration intrusive)
--   3) Rendre les pages "simples" robustes (ErrorBoundary + hooks sûrs)
--   4) Forcer la sortie JSON côté health (fini les "Not JSON")
-- ======================================================================

-- ================================
-- (1) SQL — Migration d'audit sûrs
-- ================================

-- Journal d'audit
CREATE TABLE IF NOT EXISTS public.schema_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  item TEXT NOT NULL,        -- 'public.positions.is_active'
  status TEXT NOT NULL,      -- 'ok'|'missing'|'repaired'|'error'
  details TEXT
);

CREATE INDEX IF NOT EXISTS schema_audit_log_run_idx ON public.schema_audit_log(run_at DESC);

-- Vue: dernier état par item
CREATE OR REPLACE VIEW public.schema_audit_status AS
SELECT item,
       (array_agg(status ORDER BY run_at DESC))[1] AS last_status,
       (array_agg(run_at ORDER BY run_at DESC))[1] AS last_run_at
FROM public.schema_audit_log
GROUP BY item;

-- Fonction générique: check booléen + réparation (optionnelle)
CREATE OR REPLACE FUNCTION public.audit_ensure_boolean_column(
  p_schema TEXT, 
  p_table TEXT, 
  p_column TEXT, 
  p_default BOOLEAN, 
  p_do_repair BOOLEAN DEFAULT false
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  has_col BOOLEAN;
  note TEXT;
  full_item TEXT;
BEGIN
  full_item := p_schema || '.' || p_table || '.' || p_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = p_schema 
    AND table_name = p_table 
    AND column_name = p_column
  ) INTO has_col;

  IF has_col THEN
    note := format('Column %s.%s.%s already exists', p_schema, p_table, p_column);
    INSERT INTO public.schema_audit_log(item, status, details)
    VALUES (full_item, 'ok', note);
    RETURN note;
  END IF;

  IF NOT p_do_repair THEN
    note := format('Column %s.%s.%s missing (no repair executed)', p_schema, p_table, p_column);
    INSERT INTO public.schema_audit_log(item, status, details)
    VALUES (full_item, 'missing', note);
    RETURN note;
  END IF;

  BEGIN
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS %I BOOLEAN DEFAULT %L', 
                   p_schema, p_table, p_column, p_default);
    
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_%s ON %I.%I(%I)', 
                   p_table, p_column, p_schema, p_table, p_column);
    
    note := format('Column %s.%s.%s added with default %s + indexed', 
                   p_schema, p_table, p_column, p_default);
    INSERT INTO public.schema_audit_log(item, status, details)
    VALUES (full_item, 'repaired', note);
    RETURN note;
  EXCEPTION WHEN OTHERS THEN
    note := format('Repair failed for %s: %s', full_item, SQLERRM);
    INSERT INTO public.schema_audit_log(item, status, details)
    VALUES (full_item, 'error', note);
    RETURN note;
  END;
END
$$;

-- Fonction JSON "ok" pour health checks (toujours JSON)
CREATE OR REPLACE FUNCTION public.health_json_ok()
RETURNS JSON LANGUAGE sql STABLE AS $$
  SELECT json_build_object('ok', true, 'ts', now(), 'app', 'rocket-trading-mvp');
$$;

-- Fonction de contrôle de la colonne positions.is_active (réparation OPCIONNELLE)
CREATE OR REPLACE FUNCTION public.ensure_positions_is_active(do_repair BOOLEAN DEFAULT false)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  result_note TEXT;
BEGIN
  SELECT public.audit_ensure_boolean_column('public', 'positions', 'is_active', true, do_repair)
  INTO result_note;
  
  RETURN result_note;
END
$$;

-- Fonction de diagnostic complet des colonnes critiques
CREATE OR REPLACE FUNCTION public.diagnostic_colonnes_critiques(do_repair BOOLEAN DEFAULT false)
RETURNS TABLE(
  table_column TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  audit_result TEXT;
BEGIN
  -- Check positions.is_active
  SELECT public.ensure_positions_is_active(do_repair) INTO audit_result;
  
  -- Check d'autres colonnes critiques potentielles
  SELECT public.audit_ensure_boolean_column('public', 'portfolios', 'is_default', false, do_repair) INTO audit_result;
  SELECT public.audit_ensure_boolean_column('public', 'user_profiles', 'is_active', true, do_repair) INTO audit_result;
  
  -- Retourner le résumé des audits récents
  RETURN QUERY
  SELECT 
    sas.item::TEXT,
    sas.last_status::TEXT,
    sal.details::TEXT
  FROM public.schema_audit_status sas
  JOIN public.schema_audit_log sal ON sal.item = sas.item AND sal.run_at = sas.last_run_at
  WHERE sas.last_run_at > now() - INTERVAL '1 hour'
  ORDER BY sas.last_run_at DESC;
END
$$;

-- Fonction health diagnostic simple (JSON forcé)
CREATE OR REPLACE FUNCTION public.health_diagnostic_simple()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result_json JSON;
  positions_check TEXT;
  total_positions INTEGER;
  error_count INTEGER;
BEGIN
  -- Quick diagnostic sans réparation
  SELECT public.ensure_positions_is_active(false) INTO positions_check;
  
  -- Count des positions (avec fallback)
  BEGIN
    SELECT COUNT(*) FROM public.positions INTO total_positions;
  EXCEPTION WHEN OTHERS THEN
    total_positions := -1;
  END;
  
  -- Count des erreurs récentes dans l'audit
  SELECT COUNT(*) 
  FROM public.schema_audit_log 
  WHERE status = 'error' 
  AND run_at > now() - INTERVAL '1 hour'
  INTO error_count;
  
  result_json := json_build_object(
    'ok', true,
    'timestamp', now(),
    'app', 'rocket-trading-mvp',
    'diagnostic', json_build_object(
      'positions_check', positions_check,
      'total_positions', total_positions,
      'recent_errors', error_count,
      'schema_status', CASE 
        WHEN error_count = 0 THEN 'healthy'
        WHEN error_count < 5 THEN 'warnings'
        ELSE 'critical'
      END
    )
  );
  
  RETURN result_json;
END
$$;

-- Enable RLS sur les nouvelles tables
ALTER TABLE public.schema_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy pour l'audit (lecture pour tous les authentifiés)
CREATE POLICY "authenticated_can_read_audit_log"
ON public.schema_audit_log
FOR SELECT
TO authenticated
USING (true);

-- Exécution d'un CHECK initial (sans réparation) lors de la migration
SELECT public.diagnostic_colonnes_critiques(false);