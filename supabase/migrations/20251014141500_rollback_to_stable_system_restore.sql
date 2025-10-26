-- ========================================
-- 🔄 RESTAURATION SYSTÈME STABLE
-- Rollback complet vers l'état stable pré-14 octobre
-- Suppression de toutes les vues et fonctions expérimentales
-- ========================================

-- ⚠️ ATTENTION: Cette migration supprime UNIQUEMENT les objets expérimentaux
-- Les données dans les tables 'positions' et 'trades' sont PRÉSERVÉES

-- 1️⃣ SUPPRESSION DES VUES EXPÉRIMENTALES (causant les erreurs 42703)
DROP VIEW IF EXISTS public.trades_pnl_view CASCADE;
DROP VIEW IF EXISTS public.trades_compat CASCADE;
DROP VIEW IF EXISTS public.positions_final CASCADE;
DROP VIEW IF EXISTS public.positions_extended_view CASCADE;
DROP VIEW IF EXISTS public.daily_trading_performance CASCADE;
DROP VIEW IF EXISTS public.trading_summary_view CASCADE;

-- 2️⃣ SUPPRESSION DES FONCTIONS EXPÉRIMENTALES 
DROP FUNCTION IF EXISTS public.get_trades_with_pnl(timestamptz) CASCADE;
DROP FUNCTION IF EXISTS public.get_trading_stats_today() CASCADE;
DROP FUNCTION IF EXISTS public.get_trading_stats_period(timestamptz) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_unrealized_pnl() CASCADE;
DROP FUNCTION IF EXISTS public.get_positions_with_pnl() CASCADE;

-- 3️⃣ VERIFICATION DES TABLES NATIVES
-- Confirmer que 'positions' et 'trades' sont bien des TABLES (pas des VIEWS)
DO $$
DECLARE
    positions_type TEXT;
    trades_type TEXT;
BEGIN
    -- Vérifier le type de 'positions'
    SELECT table_type INTO positions_type 
    FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='positions';
    
    -- Vérifier le type de 'trades'  
    SELECT table_type INTO trades_type
    FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='trades';
    
    -- Log des résultats
    RAISE NOTICE '✅ Table positions: % (type: %)', 
        CASE WHEN positions_type IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, 
        COALESCE(positions_type, 'N/A');
        
    RAISE NOTICE '✅ Table trades: % (type: %)', 
        CASE WHEN trades_type IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, 
        COALESCE(trades_type, 'N/A');
    
    -- Vérifier que ce sont bien des tables
    IF positions_type != 'BASE TABLE' AND positions_type IS NOT NULL THEN
        RAISE EXCEPTION 'ERREUR: positions est de type % au lieu de BASE TABLE', positions_type;
    END IF;
    
    IF trades_type != 'BASE TABLE' AND trades_type IS NOT NULL THEN
        RAISE EXCEPTION 'ERREUR: trades est de type % au lieu de BASE TABLE', trades_type;
    END IF;
END $$;

-- 4️⃣ CRÉATION D'UNE FONCTION SIMPLE POUR LE FRONTEND
-- Fonction basique qui lit directement les tables sans colonnes problématiques
CREATE OR REPLACE FUNCTION public.get_simple_trading_stats()
RETURNS TABLE (
    trades_count INTEGER,
    total_trades INTEGER,
    last_updated TIMESTAMPTZ
) 
LANGUAGE SQL STABLE
AS $$
    SELECT 
        COUNT(*)::INTEGER as trades_count,
        COUNT(*)::INTEGER as total_trades,
        NOW() as last_updated
    FROM public.trades
    WHERE (
        COALESCE(
            (to_jsonb(trades)->>'ts')::timestamptz,
            (to_jsonb(trades)->>'created_at')::timestamptz,
            NOW()
        ) >= date_trunc('day', NOW())
    );
$$;

-- 5️⃣ FONCTION BASIQUE POUR LES POSITIONS
CREATE OR REPLACE FUNCTION public.get_positions_count()
RETURNS TABLE (
    positions_count INTEGER,
    last_updated TIMESTAMPTZ
)
LANGUAGE SQL STABLE  
AS $$
    SELECT 
        COUNT(*)::INTEGER as positions_count,
        NOW() as last_updated
    FROM public.positions;
$$;

-- 6️⃣ NETTOYAGE DES INDICES ORPHELINS (si ils existent)
DROP INDEX IF EXISTS idx_trades_unrealized_pnl;
DROP INDEX IF EXISTS idx_positions_is_active;
DROP INDEX IF EXISTS idx_trades_pnl_view_symbol;

-- 7️⃣ VERIFICATION FINALE - LISTER LES OBJETS RESTANTS
DO $$
BEGIN
    RAISE NOTICE '🔍 VERIFICATION FINALE - OBJETS DANS LE SCHEMA PUBLIC:';
    RAISE NOTICE '================================================';
END $$;

-- Lister les tables
SELECT 'TABLE: ' || table_name as remaining_objects
FROM information_schema.tables 
WHERE table_schema='public' 
ORDER BY table_name;

-- Lister les vues (ne devrait plus y en avoir d'expérimentales)
SELECT 'VIEW: ' || table_name as remaining_views
FROM information_schema.views 
WHERE table_schema='public' 
ORDER BY table_name;

-- Lister les fonctions (uniquement celles que nous venons de créer)
SELECT 'FUNCTION: ' || routine_name as remaining_functions
FROM information_schema.routines 
WHERE routine_schema='public' 
  AND routine_name IN ('get_simple_trading_stats', 'get_positions_count')
ORDER BY routine_name;

-- 8️⃣ MESSAGE DE CONFIRMATION
DO $$
BEGIN
    RAISE NOTICE '🎯 RESTAURATION SYSTÈME STABLE TERMINÉE';
    RAISE NOTICE '✅ Toutes les vues expérimentales supprimées';
    RAISE NOTICE '✅ Toutes les fonctions expérimentales supprimées'; 
    RAISE NOTICE '✅ Tables natives positions & trades préservées';
    RAISE NOTICE '✅ Fonctions de base créées pour le frontend';
    RAISE NOTICE '🔄 Système prêt pour redémarrage stable';
END $$;