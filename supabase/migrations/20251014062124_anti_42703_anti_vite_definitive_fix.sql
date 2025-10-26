-- ==========================================================
-- 🔧 PATCH "ANTI-42703 + ANTI-VITE" — Bloc unique (SQL + Front)
-- Idempotent • JSON only • Aucune modif destructrice
-- ==========================================================

-- 1) Nettoyage des vues problématiques (si elles existent)
drop view if exists public.trades_pnl_view cascade;
drop view if exists public.trades_compat cascade;

-- 2) Petit helper : numeric safe
create or replace function public._is_numeric(text)
returns boolean language sql immutable parallel safe as $$
  select $1 ~ '^\s*[-+]?\d+(\.\d+)?\s*$'
$$;

-- 3) VUE COMPAT robuste (AUCUNE référence à une colonne qui n'existe pas) 
create or replace view public.trades_compat as
select
  t.*,
  coalesce(
    to_jsonb(t)->>'symbol',
    to_jsonb(t)->>'ticker',
    to_jsonb(t)->>'asset_symbol',
    to_jsonb(t)->>'asset'
  )                                                   as symbol_compat,
  case when public._is_numeric(to_jsonb(t)->>'realized_pnl')
       then (to_jsonb(t)->>'realized_pnl')::numeric
       else 0::numeric end                            as realized_pnl_compat,
  case
    when public._is_numeric(to_jsonb(t)->>'entry_price')
      then (to_jsonb(t)->>'entry_price')::numeric
    when public._is_numeric(to_jsonb(t)->>'price')
      then (to_jsonb(t)->>'price')::numeric
    else null
  end                                                 as entry_price_compat,
  case
    when public._is_numeric(to_jsonb(t)->>'qty')
      then (to_jsonb(t)->>'qty')::numeric
    else 0::numeric
  end                                                 as qty_compat,
  coalesce(
    (to_jsonb(t)->>'ts')::timestamptz,
    (to_jsonb(t)->>'created_at')::timestamptz,
    now()
  )                                                   as trade_ts_compat,
  lower(coalesce(to_jsonb(t)->>'side','long'))        as side_compat
from public.trades t;

-- 4) VUE PNL (unrealized_pnl calculé via cache — jointure explicite)
create or replace view public.trades_pnl_view as
with mkt as (
  select
    symbol,
    coalesce( (bid + ask)/2, last, bid, ask )::numeric as px_now,
    ts as mkt_ts
  from public.market_ticks_cache
)
select
  tc.ctid                               as id_fallback,   -- au cas où trades n'a pas id
  tc.symbol_compat                      as symbol,
  tc.side_compat                        as side,
  tc.qty_compat                         as qty,
  tc.entry_price_compat                 as entry_price,
  tc.realized_pnl_compat                as realized_pnl,
  tc.trade_ts_compat                    as trade_ts,
  m.px_now,
  case
    when m.px_now is null or tc.entry_price_compat is null then null
    when tc.side_compat in ('buy','long')
      then (m.px_now - tc.entry_price_compat) * tc.qty_compat
    when tc.side_compat in ('sell','short')
      then (tc.entry_price_compat - m.px_now) * tc.qty_compat
    else null
  end::numeric                          as unrealized_pnl
from public.trades_compat tc
left join mkt m
  on m.symbol = tc.symbol_compat;

-- 5) RPC propre (pour le front) — même schéma attendu que ton UI
drop function if exists public.get_trades_with_pnl(timestamptz);

create or replace function public.get_trades_with_pnl(p_since timestamptz)
returns table(
  id text,
  symbol text,
  side text,
  qty numeric,
  price numeric,
  realized_pnl numeric,
  unrealized_pnl numeric,
  ts timestamptz,
  px_now numeric
)
language sql
stable
as $$
  select
    coalesce((to_jsonb(t)->>'id')::text, (tpv.id_fallback)::text) as id,
    tpv.symbol,
    tpv.side,
    tpv.qty,
    tpv.entry_price as price,
    tpv.realized_pnl,
    tpv.unrealized_pnl,
    tpv.trade_ts     as ts,
    tpv.px_now
  from public.trades_pnl_view tpv
  left join public.trades t
    on tpv.id_fallback = t.ctid
  where tpv.trade_ts >= p_since
  order by tpv.trade_ts desc
$$;

-- 6) Index côté cache (si absent)
create index if not exists idx_mkt_ticks_symbol on public.market_ticks_cache(symbol);

-- Sanity checks :
-- select * from public.trades_compat limit 1;
-- select * from public.trades_pnl_view limit 1;
-- select * from public.get_trades_with_pnl(date_trunc('day', now())) limit 3;