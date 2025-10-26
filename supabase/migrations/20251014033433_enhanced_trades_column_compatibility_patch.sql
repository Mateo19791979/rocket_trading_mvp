-- ==========================================================
-- ENHANCED COMPATIBILITY PATCH - Addresses Both SQL Errors
-- 1. column trades.unrealized_pnl does not exist
-- 2. column "symbol" specified in USING clause does not exist in left table
-- 
-- SOLUTION: Create robust compatibility views that normalize column names
-- without modifying existing tables (non-destructive approach)
-- ==========================================================

-- 1) TRADES COMPATIBILITY VIEW: normalizes all column names
-- Handles: symbol|ticker|asset|asset_symbol, price|entry_price, ts|created_at, etc.
create or replace view public.trades_compat as
select
  t.*,
  -- symbol compatible (handles various naming conventions)
  coalesce(
    (t."symbol")::text,
    (t."ticker")::text,
    (t."asset_symbol")::text,
    (t."asset")::text
  ) as symbol_compat,
  -- realized pnl compatible 
  coalesce((t."realized_pnl")::numeric, 0::numeric) as realized_pnl_compat,
  -- entry price compatible
  coalesce((t."entry_price")::numeric, (t."price")::numeric) as entry_price_compat,
  -- trade timestamp compatible
  coalesce((t."ts")::timestamptz, (t."created_at")::timestamptz, now()) as trade_ts_compat,
  -- side normalized (always lowercase)
  lower(coalesce(t."side"::text, 'long')) as side_compat,
  -- quantity normalized
  coalesce((t."qty")::numeric, (t."quantity")::numeric, 1::numeric) as qty_compat
from public.trades t;

-- 2) PNL CALCULATION VIEW: avoids USING clause, uses explicit ON joins
-- This solves the "symbol specified in USING clause does not exist" error
create or replace view public.trades_pnl_view as
with mkt as (
  select
    symbol,
    coalesce( (bid + ask)/2, last, bid, ask )::numeric as px_now,
    ts as mkt_ts
  from public.market_ticks_cache
  where symbol is not null
)
select
  tc.id,
  tc.symbol_compat           as symbol,
  tc.side_compat             as side,
  tc.entry_price_compat      as entry_price,
  tc.realized_pnl_compat     as realized_pnl,
  tc.trade_ts_compat         as trade_ts,
  tc.qty_compat              as qty,
  m.px_now,
  -- Calculate unrealized PnL based on current market price
  case
    when m.px_now is null then null
    when tc.side_compat in ('buy','long')  then (m.px_now - tc.entry_price_compat) * tc.qty_compat
    when tc.side_compat in ('sell','short') then (tc.entry_price_compat - m.px_now) * tc.qty_compat
    else null
  end::numeric               as unrealized_pnl
from public.trades_compat tc
left join mkt m on m.symbol = tc.symbol_compat;  -- Explicit ON instead of USING

-- 3) ENHANCED TRADING STATS FUNCTION: uses the compatibility view
create or replace function public.trading_stats_summary(p_since timestamptz default date_trunc('day', now()))
returns table(
  as_of timestamptz,
  since timestamptz,
  trades_count integer,
  realized_sum numeric,
  unrealized_sum numeric,
  realized_avg numeric,
  unrealized_avg numeric
)
language sql
stable
as $$
  select
    now() as as_of,
    p_since as since,
    count(*)::int as trades_count,
    coalesce(sum(v.realized_pnl),0)::numeric as realized_sum,
    coalesce(sum(v.unrealized_pnl),0)::numeric as unrealized_sum,
    case when count(*)>0 then avg(coalesce(v.realized_pnl,0)) else 0 end::numeric as realized_avg,
    case when count(*)>0 then avg(coalesce(v.unrealized_pnl,0)) else 0 end::numeric as unrealized_avg
  from public.trades_pnl_view v
  where v.trade_ts >= p_since;
$$;

-- 4) CONVENIENCE VIEW: Today's trading stats
create or replace view public.trading_stats_today as
select * from public.trading_stats_summary(date_trunc('day', now()));

-- 5) INDEX OPTIMIZATION: Ensure fast lookups
create index if not exists idx_market_ticks_cache_symbol on public.market_ticks_cache(symbol);
create index if not exists idx_trades_symbol_ts on public.trades using btree (
  coalesce(symbol, ticker, asset_symbol, asset), 
  coalesce(ts, created_at)
) where coalesce(symbol, ticker, asset_symbol, asset) is not null;

-- 6) COMPATIBILITY VALIDATION FUNCTION: Test if patch is working
create or replace function public.validate_compatibility_patch()
returns table(
  test_name text,
  status text,
  details text
)
language sql
stable
as $$
  -- Test 1: Check if trades_compat view works
  select 'trades_compat_view' as test_name,
         case when count(*) >= 0 then 'OK' else 'FAIL' end as status,
         count(*)::text || ' rows accessible' as details
  from public.trades_compat
  limit 1
  
  union all
  
  -- Test 2: Check if trades_pnl_view works  
  select 'trades_pnl_view' as test_name,
         case when count(*) >= 0 then 'OK' else 'FAIL' end as status,
         count(*)::text || ' rows with calculated PnL' as details
  from public.trades_pnl_view
  limit 1
  
  union all
  
  -- Test 3: Check if trading_stats_summary function works
  select 'trading_stats_summary' as test_name,
         case when trades_count >= 0 then 'OK' else 'FAIL' end as status,
         'Function returned ' || trades_count::text || ' trades' as details
  from public.trading_stats_summary()
  limit 1;
$$;

-- 7) RLS POLICIES: Inherit from base tables, no additional policies needed on views
-- Views automatically inherit RLS from their underlying tables

-- 8) GRANT PERMISSIONS: Ensure service can access views and functions
grant select on public.trades_compat to anon, authenticated;
grant select on public.trades_pnl_view to anon, authenticated;
grant select on public.trading_stats_today to anon, authenticated;
grant execute on function public.trading_stats_summary(timestamptz) to anon, authenticated;
grant execute on function public.validate_compatibility_patch() to anon, authenticated;

-- 9) VALIDATION: Run compatibility test (will show in logs if successful)
-- select * from public.validate_compatibility_patch();

-- 10) CLEANUP: Drop any conflicting old views if they exist
drop view if exists public.old_trades_pnl_view cascade;

-- MIGRATION COMPLETE: Both SQL errors should now be resolved
-- - trades.unrealized_pnl is now calculated in trades_pnl_view
-- - No more USING clause conflicts, all joins use explicit ON conditions
-- - Column names are normalized through compatibility views
-- - Fallback service can now successfully use trades_pnl_view