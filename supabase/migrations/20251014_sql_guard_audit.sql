-- ======================================================================
-- SUPABASE — Migration SQL Guard Audit & Schema Monitoring System
-- Crée un journal d'audit de schéma + vue de contrôle + fonction de check idempotente
-- ======================================================================

-- Table d'audit (log)
CREATE TABLE IF NOT EXISTS public.schema_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  item TEXT NOT NULL,                    -- ex: 'positions.is_active'
  status TEXT NOT NULL,                  -- 'ok' | 'missing' | 'repaired' | 'error'
  details TEXT
);

CREATE INDEX IF NOT EXISTS schema_audit_log_run_at_idx ON public.schema_audit_log(run_at DESC);

-- Vue de contrôle rapide (derniers statuts par item)
CREATE OR REPLACE VIEW public.schema_audit_status AS
SELECT item,
       (array_agg(status ORDER BY run_at DESC))[1] AS last_status,
       (array_agg(run_at ORDER BY run_at DESC))[1] AS last_run_at
FROM public.schema_audit_log
GROUP BY item;

-- Fonction utilitaire: check & (optionnel) réparation de positions.is_active
CREATE OR REPLACE FUNCTION public.ensure_positions_is_active(do_repair BOOLEAN DEFAULT false)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  col_exists BOOLEAN;
  note TEXT;
BEGIN
  -- Vérifie l'existence de la colonne
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='positions' AND column_name='is_active'
  ) INTO col_exists;

  IF col_exists THEN
    note := 'positions.is_active already present';
    INSERT INTO public.schema_audit_log(item,status,details)
    VALUES ('positions.is_active','ok',note);
    RETURN note;
  END IF;

  -- Si manquante: soit log 'missing', soit réparation si do_repair=true
  IF do_repair IS FALSE THEN
    note := 'positions.is_active is missing (no repair executed)';
    INSERT INTO public.schema_audit_log(item,status,details)
    VALUES ('positions.is_active','missing',note);
    RETURN note;
  END IF;

  -- Réparation idempotente et sûre
  BEGIN
    ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    CREATE INDEX IF NOT EXISTS idx_positions_is_active ON public.positions(is_active);
    note := 'positions.is_active added + indexed';
    INSERT INTO public.schema_audit_log(item,status,details)
    VALUES ('positions.is_active','repaired',note);
    RETURN note;
  EXCEPTION WHEN OTHERS THEN
    note := 'repair failed: ' || SQLERRM;
    INSERT INTO public.schema_audit_log(item,status,details)
    VALUES ('positions.is_active','error',note);
    RETURN note;
  END;
END;
$$;

-- Optionnel: exécuter un check sans réparation lors de la migration (ne crash pas)
SELECT public.ensure_positions_is_active(false);