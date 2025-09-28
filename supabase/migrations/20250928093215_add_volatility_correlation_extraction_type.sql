-- Ajoute la valeur 'volatility_correlation' à l'ENUM extraction_type
-- de manière idempotente (si elle n'existe pas déjà).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'extraction_type'
      AND e.enumlabel = 'volatility_correlation'
  ) THEN
    ALTER TYPE public.extraction_type ADD VALUE 'volatility_correlation';
  END IF;
END $$;

-- Mise à jour des extractions existantes pour utiliser le nouveau type
-- pour les stratégies liées à la volatilité et corrélation du marché suisse
UPDATE public.strategy_extractions se
SET extraction_type = 'volatility_correlation'::public.extraction_type,
    updated_at = CURRENT_TIMESTAMP
WHERE (se.strategy_description ILIKE '%volatility%correlation%'
       OR se.strategy_description ILIKE '%swiss%market%volatility%'
       OR se.strategy_name ILIKE '%volatility%correlation%'
       OR se.parameters::text ILIKE '%volatility_correlation%')
  AND se.extraction_type != 'volatility_correlation'::public.extraction_type;

-- Index pour optimiser les requêtes sur le nouveau type d'extraction
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_strategy_extractions_volatility_correlation 
ON public.strategy_extractions (id)
WHERE extraction_type = 'volatility_correlation';

-- Définir un DEFAULT pour nouveaux enregistrements (optionnel)
-- ALTER TABLE public.strategy_extractions
--   ALTER COLUMN extraction_type SET DEFAULT 'volatility_correlation'::public.extraction_type;