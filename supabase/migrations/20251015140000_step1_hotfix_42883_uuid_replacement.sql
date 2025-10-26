-- Step 1 (idempotent): ne fait rien si trading.orders n'existe pas
CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

DO $$
BEGIN
  IF to_regclass('trading.orders') IS NOT NULL THEN
    UPDATE trading.orders
    SET client_order_id = COALESCE(client_order_id, replace(gen_random_uuid()::text, '-', ''))
    WHERE client_order_id IS NULL;
  ELSE
    RAISE NOTICE 'Skip: trading.orders is not present yet. This migration will be a no-op.';
  END IF;
END $$;

-- Vérif (tolérante)
DO $$
DECLARE
  missing int;
BEGIN
  IF to_regclass('trading.orders') IS NOT NULL THEN
    EXECUTE 'SELECT count(*) FROM trading.orders WHERE client_order_id IS NULL' INTO missing;
    RAISE NOTICE 'orders rows with missing client_order_id: %', missing;
  ELSE
    RAISE NOTICE 'orders table absent at this step (expected if Step 3 not applied yet).';
  END IF;
END $$;