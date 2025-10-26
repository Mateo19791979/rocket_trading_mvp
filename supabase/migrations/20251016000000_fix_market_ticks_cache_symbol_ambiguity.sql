-- Location: supabase/migrations/20251016000000_fix_market_ticks_cache_symbol_ambiguity.sql  
-- Fix Symbol Ambiguity in Market Ticks Cache
-- Integration Type: Enhancement - resolves PostgreSQL variable/column naming conflicts
-- Dependencies: market_ticks_cache table (existing)

-- Ensure table exists with proper structure and unique constraint
CREATE TABLE IF NOT EXISTS public.market_ticks_cache (
  symbol TEXT PRIMARY KEY,
  bid NUMERIC,
  ask NUMERIC,
  last NUMERIC,
  volume BIGINT,
  source TEXT DEFAULT 'ibkr',
  ts TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure unique index exists
CREATE UNIQUE INDEX IF NOT EXISTS market_ticks_cache_symbol_uq
  ON public.market_ticks_cache(symbol);

-- Additional index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_market_ticks_cache_ts_desc 
  ON public.market_ticks_cache (ts DESC);

-- ✅ Version 1: Single symbol upsert (ambiguity resolved)
DO $$
DECLARE
  target_symbol TEXT := 'NVDA';  -- ⚠️ Variable renamed to avoid conflict with column 'symbol'
BEGIN
  INSERT INTO public.market_ticks_cache(symbol, bid, ask, last, volume, source, ts)
  VALUES (
    target_symbol,
    150.00 + (random() * 50),                    -- bid
    150.05 + (random() * 50),                    -- ask
    150.02 + (random() * 50),                    -- last
    1000000 + (random() * 500000)::int,          -- volume
    'ibkr',
    now() - ((random() * 30)::int) * interval '1 second'
  )
  ON CONFLICT (symbol) DO UPDATE
  SET bid = EXCLUDED.bid,
      ask = EXCLUDED.ask,
      last = EXCLUDED.last,
      volume = EXCLUDED.volume,
      ts = EXCLUDED.ts;
      
  RAISE NOTICE 'Single symbol % upserted successfully', target_symbol;
END$$;

-- ✅ Version 2: Multi-symbol loop (clean variable naming)
DO $$
DECLARE
  current_sym TEXT;
  symbol_list TEXT[] := ARRAY['NVDA','AAPL','SPY','MSFT','TSLA','QQQ'];  -- ← Adapt your list
BEGIN
  FOREACH current_sym IN ARRAY symbol_list LOOP
    INSERT INTO public.market_ticks_cache(symbol, bid, ask, last, volume, source, ts)
    VALUES (
      current_sym,
      150.00 + (random() * 50),                  -- bid: 150-200
      150.05 + (random() * 50),                  -- ask: 150.05-200.05  
      150.02 + (random() * 50),                  -- last: 150.02-200.02
      1000000 + (random() * 500000)::int,        -- volume: 1M-1.5M
      'ibkr',
      now() - ((random() * 30)::int) * interval '1 second'  -- Recent timestamps
    )
    ON CONFLICT (symbol) DO UPDATE
    SET bid = EXCLUDED.bid,
        ask = EXCLUDED.ask,
        last = EXCLUDED.last,
        volume = EXCLUDED.volume,
        ts = EXCLUDED.ts;
  END LOOP;
  
  RAISE NOTICE 'Successfully processed % symbols', array_length(symbol_list, 1);
END$$;

-- Additional crypto symbols for testing
DO $$
DECLARE
  crypto_sym TEXT;
  crypto_symbols TEXT[] := ARRAY['BTC-USD','ETH-USD','ADA-USD','DOT-USD'];
BEGIN
  FOREACH crypto_sym IN ARRAY crypto_symbols LOOP
    INSERT INTO public.market_ticks_cache(symbol, bid, ask, last, volume, source, ts)
    VALUES (
      crypto_sym,
      30000.00 + (random() * 20000),             -- crypto pricing range
      30005.00 + (random() * 20000),
      30002.50 + (random() * 20000), 
      500000 + (random() * 1000000)::int,
      'crypto_exchange',
      now() - ((random() * 60)::int) * interval '1 second'
    )
    ON CONFLICT (symbol) DO UPDATE  
    SET bid = EXCLUDED.bid,
        ask = EXCLUDED.ask,
        last = EXCLUDED.last,
        volume = EXCLUDED.volume,
        ts = EXCLUDED.ts,
        source = EXCLUDED.source;
  END LOOP;
  
  RAISE NOTICE 'Crypto symbols processed successfully';
END$$;

-- Create view for fresh data (< 5 seconds old)
DROP VIEW IF EXISTS public.market_ticks_fresh;
CREATE VIEW public.market_ticks_fresh AS
SELECT *
FROM public.market_ticks_cache
WHERE ts > (NOW() - INTERVAL '5 seconds');

-- Enable RLS if not already enabled
ALTER TABLE public.market_ticks_cache ENABLE ROW LEVEL SECURITY;

-- Create/update RLS policy for service role access
DROP POLICY IF EXISTS market_ticks_cache_service_access ON public.market_ticks_cache;
CREATE POLICY market_ticks_cache_service_access ON public.market_ticks_cache
  FOR ALL USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

-- Add table comment for documentation
COMMENT ON TABLE public.market_ticks_cache IS 
'Real-time market data cache for IBKR and other providers. Resolves symbol/variable naming conflicts.';

-- Final verification query (optional - for debugging)
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM public.market_ticks_cache;
  RAISE NOTICE 'Market ticks cache contains % rows after migration', row_count;
END$$;