-- Location: supabase/migrations/20251215183000_fix_stats_overview_one_line_guarantee.sql
-- Schema Analysis: Trading system with positions, trades, market_ticks_cache tables
-- Integration Type: Hotfix - Stats overview that guarantees 1 line return
-- Dependencies: public.positions, public.trades, public.market_ticks_cache

-- Ce patch crée un overview qui renvoie toujours 1 ligne (même si les tables sont vides) 
-- et l'expose en public pour l'UI.

CREATE SCHEMA IF NOT EXISTS trading; 
SET search_path TO trading, public;

-- Vue qui renvoie TOUJOURS 1 ligne
CREATE OR REPLACE VIEW trading.stats_overview_one AS 
SELECT   
  COALESCE( (SELECT COUNT(*) FROM public.positions), 0 )::bigint AS positions,   
  COALESCE( (SELECT COUNT(*) FROM public.trades),    0 )::bigint AS trades,   
  COALESCE( (SELECT MAX(ts)   FROM public.market_ticks_cache), to_timestamp(0) )::timestamptz AS last_tick_at;

-- Vue de compat en public (si ton front lit public.*)
CREATE OR REPLACE VIEW public.stats_overview_one AS 
SELECT positions, trades, last_tick_at FROM trading.stats_overview_one;

-- (Optionnel) RPC qui renvoie 1 ligne (utile si votre front appelle /rpc/* en single-object)
CREATE OR REPLACE FUNCTION public.rpc_stats_overview() 
RETURNS TABLE(positions bigint, trades bigint, last_tick_at timestamptz) 
LANGUAGE sql STABLE AS $$   
  SELECT positions, trades, last_tick_at   
  FROM public.stats_overview_one 
$$;

-- Enable RLS pour la vue publique (si nécessaire)
-- Note: Les vues héritent des permissions des tables sous-jacentes
-- Mais on peut ajouter des policies spécifiques si besoin

-- Policy pour permettre l'accès public aux stats overview
CREATE OR REPLACE FUNCTION public.allow_stats_overview_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT true  -- Accès libre aux statistiques globales
$$;

-- Pas de RLS sur les vues par défaut car elles n'ont pas de données utilisateur sensibles
-- Si besoin d'authentication plus tard :
-- ALTER VIEW public.stats_overview_one SET (security_barrier = true);
-- CREATE POLICY "public_stats_access" ON public.stats_overview_one FOR SELECT USING (true);

-- Vérification rapide du fonctionnement
-- Cette requête devrait toujours renvoyer exactement 1 ligne
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count FROM public.stats_overview_one;
    
    IF result_count = 1 THEN
        RAISE NOTICE '✅ Stats overview fix successful - exactly 1 row returned';
    ELSE
        RAISE NOTICE '❌ Stats overview fix failed - returned % rows instead of 1', result_count;
    END IF;
END $$;