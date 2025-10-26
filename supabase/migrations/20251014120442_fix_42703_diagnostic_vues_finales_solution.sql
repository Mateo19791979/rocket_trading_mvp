-- Location: supabase/migrations/20251014120442_fix_42703_diagnostic_vues_finales_solution.sql
-- Schema Analysis: Emergency fix for 42703 errors - missing columns positions.is_active and trades.unrealized_pnl
-- Integration Type: Compatibility views without touching existing tables
-- Dependencies: existing positions, trades, market_ticks_cache tables

-- Helper function: Tolerant numeric validation (handles absent columns gracefully)
CREATE OR REPLACE FUNCTION public._is_numeric(text) 
RETURNS BOOLEAN 
LANGUAGE SQL 
IMMUTABLE 
PARALLEL SAFE 
AS $$   
  SELECT $1 ~ '^\s*[-+]?\d+(\.\d+)?\s*$'
$$;

-- Vue finale POSITIONS: provides symbol, qty, price, is_active=TRUE by default
DROP VIEW IF EXISTS public.positions_final;
CREATE OR REPLACE VIEW public.positions_final AS
SELECT   
  COALESCE(
    to_jsonb(p)->>'symbol',
    to_jsonb(p)->>'ticker',
    to_jsonb(p)->>'asset_symbol',
    to_jsonb(p)->>'asset'
  )::TEXT                                               AS symbol,
  CASE WHEN public._is_numeric(to_jsonb(p)->>'qty')        
       THEN (to_jsonb(p)->>'qty')::NUMERIC ELSE 0 END   AS qty,
  CASE WHEN public._is_numeric(to_jsonb(p)->>'price')        
       THEN (to_jsonb(p)->>'price')::NUMERIC ELSE NULL END AS price,
  TRUE                                                 AS is_active,
  NOW()                                                AS as_of
FROM public.positions p;

-- Vue finale TRADES PnL: calculates unrealized_pnl via market cache
DROP VIEW IF EXISTS public.trades_pnl_view;
CREATE OR REPLACE VIEW public.trades_pnl_view AS
WITH tc AS (
  SELECT
    COALESCE(
      to_jsonb(t)->>'symbol',
      to_jsonb(t)->>'ticker',
      to_jsonb(t)->>'asset_symbol',
      to_jsonb(t)->>'asset'
    )::TEXT                                             AS symbol,
    LOWER(COALESCE(to_jsonb(t)->>'side','long'))        AS side,
    CASE WHEN public._is_numeric(to_jsonb(t)->>'qty')          
         THEN (to_jsonb(t)->>'qty')::NUMERIC ELSE 0 END AS qty,
    CASE WHEN public._is_numeric(to_jsonb(t)->>'entry_price')          
         THEN (to_jsonb(t)->>'entry_price')::NUMERIC          
         WHEN public._is_numeric(to_jsonb(t)->>'price')          
         THEN (to_jsonb(t)->>'price')::NUMERIC          
         ELSE NULL END                                  AS price,
    CASE WHEN public._is_numeric(to_jsonb(t)->>'realized_pnl')          
         THEN (to_jsonb(t)->>'realized_pnl')::NUMERIC ELSE 0 END AS realized_pnl,
    COALESCE(
      (to_jsonb(t)->>'ts')::TIMESTAMPTZ,
      (to_jsonb(t)->>'created_at')::TIMESTAMPTZ,
      NOW()
    )                                                   AS ts
  FROM public.trades t
), mkt AS (
  SELECT
    symbol,
    COALESCE((bid+ask)/2, last, bid, ask)::NUMERIC AS px_now,
    ts AS mkt_ts
  FROM public.market_ticks_cache
)
SELECT
  md5(COALESCE(tc.symbol,'?')||'|'||tc.ts::TEXT) AS id, -- stable hash if no ID
  tc.symbol, 
  tc.side, 
  tc.qty, 
  tc.price, 
  tc.realized_pnl, 
  tc.ts,
  m.px_now,
  CASE
    WHEN m.px_now IS NULL OR tc.price IS NULL THEN NULL
    WHEN tc.side IN ('buy','long')            
         THEN (m.px_now - tc.price) * tc.qty
    WHEN tc.side IN ('sell','short')          
         THEN (tc.price - m.px_now) * tc.qty
    ELSE NULL
  END::NUMERIC AS unrealized_pnl
FROM tc 
LEFT JOIN mkt m ON m.symbol = tc.symbol;

-- Optional RPC for frontend: same schema as PnL card
DROP FUNCTION IF EXISTS public.get_trades_with_pnl(TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION public.get_trades_with_pnl(p_since TIMESTAMPTZ) 
RETURNS TABLE(
  id TEXT,
  symbol TEXT,
  side TEXT,
  qty NUMERIC,
  price NUMERIC,
  realized_pnl NUMERIC,
  unrealized_pnl NUMERIC,
  ts TIMESTAMPTZ,
  px_now NUMERIC
) 
LANGUAGE SQL 
STABLE 
AS $$
  SELECT 
    id, 
    symbol, 
    side, 
    qty, 
    price, 
    realized_pnl, 
    unrealized_pnl, 
    ts, 
    px_now
  FROM public.trades_pnl_view
  WHERE ts >= p_since
  ORDER BY ts DESC
$$;

-- Sanity check queries (read-only; won't crash if empty)
-- SELECT * FROM public.positions_final LIMIT 1;
-- SELECT * FROM public.trades_pnl_view LIMIT 1;
-- SELECT * FROM public.get_trades_with_pnl(DATE_TRUNC('day', NOW())) LIMIT 1;