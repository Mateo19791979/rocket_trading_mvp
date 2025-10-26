-- ======================================================================
-- ROCKETNEW — STABILISATION v2 (Alertes Slack + Audit SQL multi-tables)
-- Objectif : audit multi-tables + fonctions d'audit sécurisées
-- ======================================================================

-- Table des cibles d'audit (schéma/table/colonne facultative)
CREATE TABLE IF NOT EXISTS public.schema_audit_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL CHECK (target_type IN ('table','column','pk')),
  schema_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  column_name TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  details TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Journal d'audit (si non créé précédemment)
CREATE TABLE IF NOT EXISTS public.schema_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  item TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ok','missing','error','repaired')),
  details TEXT
);

CREATE INDEX IF NOT EXISTS schema_audit_log_run_idx ON public.schema_audit_log(run_at DESC);

-- Vue: dernier statut par item
CREATE OR REPLACE VIEW public.schema_audit_status AS
SELECT item,
       (array_agg(status ORDER BY run_at DESC))[1] AS last_status,
       (array_agg(run_at ORDER BY run_at DESC))[1] AS last_run_at
FROM public.schema_audit_log
GROUP BY item;

-- Fonctions utilitaires d'audit
CREATE OR REPLACE FUNCTION public.audit_table_exists(p_schema TEXT, p_table TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables
    WHERE table_schema=p_schema AND table_name=p_table
  );
$$;

CREATE OR REPLACE FUNCTION public.audit_column_exists(p_schema TEXT, p_table TEXT, p_column TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema=p_schema AND table_name=p_table AND column_name=p_column
  );
$$;

CREATE OR REPLACE FUNCTION public.audit_has_pk(p_schema TEXT, p_table TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = p_schema AND tc.table_name = p_table AND tc.constraint_type='PRIMARY KEY'
  );
$$;

-- Fonction générique: check booléen + réparation (optionnelle)
CREATE OR REPLACE FUNCTION public.audit_ensure_boolean_column(
  p_schema TEXT, p_table TEXT, p_column TEXT, p_default BOOLEAN, p_do_repair BOOLEAN DEFAULT FALSE
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  has_col BOOLEAN;
  q TEXT;
  item_id TEXT := p_schema||'.'||p_table||'.'||p_column;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema=p_schema AND table_name=p_table AND column_name=p_column
  ) INTO has_col;

  IF has_col THEN
    INSERT INTO public.schema_audit_log(item,status,details) VALUES (item_id,'ok','column present');
    RETURN 'ok';
  END IF;

  IF NOT p_do_repair THEN
    INSERT INTO public.schema_audit_log(item,status,details) VALUES (item_id,'missing','no repair executed');
    RETURN 'missing';
  END IF;

  BEGIN
    q := format('ALTER TABLE %I.%I ADD COLUMN IF NOT EXISTS %I BOOLEAN DEFAULT %L', p_schema, p_table, p_column, p_default);
    EXECUTE q;
    INSERT INTO public.schema_audit_log(item,status,details) VALUES (item_id,'repaired','column added with default');
    RETURN 'repaired';
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.schema_audit_log(item,status,details) VALUES (item_id,'error',SQLERRM);
    RETURN 'error: '||SQLERRM;
  END;
END
$$;

-- Exécute l'audit sur toutes les cibles actives (sans réparation)
CREATE OR REPLACE FUNCTION public.audit_run_all()
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
  rec RECORD;
  ok BOOLEAN;
  item TEXT;
  results JSONB := '[]'::JSONB;
BEGIN
  FOR rec IN SELECT * FROM public.schema_audit_targets WHERE active LOOP
    IF rec.target_type='table' THEN
      ok := public.audit_table_exists(rec.schema_name, rec.table_name);
      item := rec.schema_name||'.'||rec.table_name;
    ELSIF rec.target_type='column' THEN
      ok := public.audit_column_exists(rec.schema_name, rec.table_name, rec.column_name);
      item := rec.schema_name||'.'||rec.table_name||'.'||COALESCE(rec.column_name,'*');
    ELSE -- 'pk'
      ok := public.audit_has_pk(rec.schema_name, rec.table_name);
      item := rec.schema_name||'.'||rec.table_name||' (pk)';
    END IF;

    INSERT INTO public.schema_audit_log(item,status,details)
    VALUES (item, CASE WHEN ok THEN 'ok' ELSE (CASE WHEN rec.required THEN 'missing' ELSE 'ok' END) END,
                 COALESCE(rec.details,''));

    results := results || jsonb_build_object(
      'item', item,
      'type', rec.target_type,
      'ok', ok,
      'required', rec.required
    );
  END LOOP;

  RETURN json_build_object('ok', true, 'results', results);
END
$$;

-- Cibles par défaut (adapte si besoin)
INSERT INTO public.schema_audit_targets(target_type, schema_name, table_name, column_name, details)
VALUES
('table','public','positions',NULL,'positions doit exister'),
('column','public','positions','is_active','colonne bool is_active'),
('table','public','market_ticks_cache',NULL,'cache feed'),
('pk','public','market_ticks_cache',NULL,'pk sur symbol'),
('table','public','ai_opportunities',NULL,'pipeline opportunités'),
('column','public','ai_opportunities','status','statut opportunité'),
('table','public','execution_queue',NULL,'file exécution'),
('column','public','execution_queue','status','statut exécution'),
('table','public','risk_metrics',NULL,'var/cvar'),
('column','public','risk_metrics','var_95','var')
ON CONFLICT DO NOTHING;

-- RLS service_role only
ALTER TABLE public.schema_audit_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schema_audit_targets') THEN
    CREATE POLICY p_schema_audit_targets ON public.schema_audit_targets
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schema_audit_log') THEN
    CREATE POLICY p_schema_audit_log ON public.schema_audit_log
      FOR ALL USING (auth.role()='service_role') WITH CHECK (auth.role()='service_role');
  END IF;
END$$;