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