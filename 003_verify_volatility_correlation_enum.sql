-- =============================================================================
-- Verification queries for 'volatility_correlation' enum value addition
-- =============================================================================

-- 1) Vérifier que la valeur est bien présente dans l'enum extraction_type
-- Cette requête liste toutes les valeurs de l'enum par ordre
SELECT e.enumlabel
FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
WHERE t.typname = 'extraction_type'
ORDER BY e.enumsortorder;

-- 2) Test de casting pour vérifier que la nouvelle valeur est utilisable
-- Cette requête simple teste l'utilisation de la nouvelle valeur après commit
SELECT 1 WHERE 'volatility_correlation'::extraction_type IS NOT NULL;

-- 3) Requête supplémentaire : Compter le nombre total de valeurs dans l'enum
-- Devrait retourner 5 valeurs si 'volatility_correlation' a été ajoutée
SELECT 
    t.typname AS enum_name,
    COUNT(e.enumlabel) AS total_values
FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
WHERE t.typname = 'extraction_type'
GROUP BY t.typname;

-- 4) Vérification spécifique pour 'volatility_correlation'
-- Retourne TRUE si la valeur existe, FALSE sinon
SELECT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'extraction_type'
      AND e.enumlabel = 'volatility_correlation'
) AS volatility_correlation_exists;

-- 5) Test d'insertion dans une table qui utilise cet enum (strategy_extractions)
-- Cette requête teste si la nouvelle valeur peut être utilisée dans une vraie table
-- ATTENTION: Cette requête est un test de validation - ne l'exécutez que si vous voulez tester
-- SELECT extraction_type FROM strategy_extractions 
-- WHERE extraction_type = 'volatility_correlation'::extraction_type
-- LIMIT 1;

-- =============================================================================
-- Instructions d'exécution:
-- 
-- Pour Supabase CLI:
-- psql "$DATABASE_URL" -f 003_verify_volatility_correlation_enum.sql
-- 
-- Pour une vérification complète:
-- 1. Exécutez la requête 1 pour voir toutes les valeurs
-- 2. Exécutez la requête 4 pour confirmation booléenne
-- 3. Exécutez la requête 2 dans une NOUVELLE session après commit
-- =============================================================================