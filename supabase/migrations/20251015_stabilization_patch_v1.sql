-- ======================================================================
-- TEAM PRO • PACK DE STABILISATION v1 — SQL Migration (FIXED)
-- Location: supabase/migrations/20251015_stabilization_patch_v1.sql
-- ======================================================================

-- Journal d'audit de schéma (idempotent)
CREATE TABLE IF NOT EXISTS public.schema_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  item TEXT NOT NULL,
  status TEXT NOT NULL,                  -- 'ok'|'missing'|'repaired'|'error'
  details TEXT
);

-- Index pour les requêtes par date
CREATE INDEX IF NOT EXISTS schema_audit_log_run_idx ON public.schema_audit_log(run_at DESC);

-- Vue "dernier état par item" (idempotente)
CREATE OR REPLACE VIEW public.schema_audit_status AS
SELECT item,
       (array_agg(status ORDER BY run_at DESC))[1] AS last_status,
       (array_agg(run_at ORDER BY run_at DESC))[1] AS last_run_at
FROM public.schema_audit_log
GROUP BY item;

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
  col_exists BOOLEAN;
  note TEXT;
BEGIN
  -- Vérifier si la colonne existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='positions' AND column_name='is_active'
  ) INTO col_exists;

  IF col_exists THEN
    note := 'positions.is_active already present';
    INSERT INTO public.schema_audit_log(item, status, details)
    VALUES ('positions.is_active', 'ok', note);
    RETURN note;
  END IF;

  IF NOT do_repair THEN
    note := 'positions.is_active missing (no repair executed)';
    INSERT INTO public.schema_audit_log(item, status, details)
    VALUES ('positions.is_active', 'missing', note);
    RETURN note;
  END IF;

  -- Tentative de réparation
  BEGIN
    -- Vérifier d'abord que la table positions existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='positions') THEN
      EXECUTE 'ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true';
      -- Créer l'index si la colonne a été ajoutée
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_positions_is_active ON public.positions(is_active)';
      note := 'positions.is_active added + indexed';
      INSERT INTO public.schema_audit_log(item, status, details)
      VALUES ('positions.is_active', 'repaired', note);
    ELSE
      note := 'positions table does not exist - cannot add column';
      INSERT INTO public.schema_audit_log(item, status, details)
      VALUES ('positions.is_active', 'error', note);
    END IF;
    RETURN note;

  EXCEPTION WHEN OTHERS THEN
    note := 'repair failed: ' || SQLERRM;
    INSERT INTO public.schema_audit_log(item, status, details)
    VALUES ('positions.is_active', 'error', note);
    RETURN note;
  END;
END;
$$;

-- Exécution d'un CHECK (sans réparation) lors de la migration
SELECT public.ensure_positions_is_active(false);

-- RLS pour les nouvelles tables (si nécessaire)
ALTER TABLE public.schema_audit_log ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS avec gestion d'erreur idempotente
DO $$
BEGIN
    -- Politique lecture publique pour les logs d'audit
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'schema_audit_log' 
        AND policyname = 'public_read_audit_logs'
    ) THEN
        CREATE POLICY "public_read_audit_logs"
        ON public.schema_audit_log
        FOR SELECT
        TO public
        USING (true);
    END IF;

    -- Politique écriture pour service_role
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'schema_audit_log' 
        AND policyname = 'service_write_audit_logs'
    ) THEN
        CREATE POLICY "service_write_audit_logs"
        ON public.schema_audit_log
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;