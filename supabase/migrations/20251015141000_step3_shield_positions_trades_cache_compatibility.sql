-- Étape 3 — 42703 SHIELD (positions/trades/cache + compat)
-- Add missing tables and compatibility views for trading system
-- Schema Analysis: Create missing core trading tables if they don't exist
-- Integration Type: Addition - Core trading infrastructure
-- Dependencies: None (creates base trading tables)

CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- Tables canoniques
CREATE TABLE IF NOT EXISTS trading.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid,
  symbol text NOT NULL,
  qty numeric NOT NULL DEFAULT 0,
  avg_price numeric,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trading.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  account_id uuid,
  symbol text NOT NULL,
  side text NOT NULL,
  qty numeric NOT NULL,
  price numeric NOT NULL,
  fees numeric DEFAULT 0,
  realized_pnl numeric DEFAULT 0,
  unrealized_pnl numeric,
  ts timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trading.market_ticks_cache (
  symbol text PRIMARY KEY,
  last numeric,
  bid numeric,
  ask numeric,
  ts timestamptz NOT NULL DEFAULT now()
);

-- Compléter colonnes manquantes si besoin
DO $$
BEGIN
  IF to_regclass('trading.positions') IS NOT NULL AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='positions' AND column_name='is_active') THEN
    EXECUTE 'ALTER TABLE trading.positions ADD COLUMN is_active boolean NOT NULL DEFAULT true';
  END IF;

  IF to_regclass('trading.trades') IS NOT NULL AND
     NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema='trading' AND table_name='trades' AND column_name='unrealized_pnl') THEN
    EXECUTE 'ALTER TABLE trading.trades ADD COLUMN unrealized_pnl numeric';
  END IF;
END $$;

-- Vues compat en public (ce que l'UI attend)
CREATE OR REPLACE VIEW public.positions AS
SELECT id, account_id, symbol, qty, avg_price, is_active, updated_at
FROM trading.positions;

CREATE OR REPLACE VIEW public.trades AS
SELECT id, order_id, account_id, symbol, side, qty, price, fees, realized_pnl, unrealized_pnl, ts
FROM trading.trades;

CREATE OR REPLACE VIEW public.market_ticks_cache AS
SELECT symbol, last, bid, ask, ts
FROM trading.market_ticks_cache;

-- Seed léger pour éviter pages vides
INSERT INTO trading.market_ticks_cache(symbol, last, bid, ask)
VALUES ('AAPL', 185.20, 185.18, 185.22)
ON CONFLICT (symbol) DO UPDATE
  SET last=EXCLUDED.last, bid=EXCLUDED.bid, ask=EXCLUDED.ask, ts=now();

-- Vérifs rapides
SELECT 'positions.has_is_active' AS check_name,
       COUNT(*) AS ok 
FROM information_schema.columns 
WHERE table_schema='trading' AND table_name='positions' AND column_name='is_active';

SELECT 'trades.has_unrealized_pnl' AS check_name,
       COUNT(*) AS ok 
FROM information_schema.columns 
WHERE table_schema='trading' AND table_name='trades' AND column_name='unrealized_pnl';

-- Test compatibilité views
DO $$
BEGIN
  RAISE NOTICE 'Testing public views compatibility...';
  PERFORM count(*) FROM public.positions;
  PERFORM count(*) FROM public.trades;
  PERFORM count(*) FROM public.market_ticks_cache;
  RAISE NOTICE 'Public views are accessible and functional.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'View compatibility issue: %', SQLERRM;
END $$;