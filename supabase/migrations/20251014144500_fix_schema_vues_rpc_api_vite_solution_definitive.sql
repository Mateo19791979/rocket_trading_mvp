-- ======================================================================
-- 🔒 BLOC UNIQUE — OVERLAY COMPAT + VUES FINALES + API + VITE FIX
-- ======================================================================
-- Schema Analysis: Fixing 42703 errors (positions.is_active, trades.unrealized_pnl)
-- Integration Type: Compatibility layer with JSON-based extraction
-- Dependencies: Existing positions, trades, market_ticks_cache tables

-- ===============================
-- (A) SQL — Overlays + Vues finales
-- ===============================

-- 0) Utilitaires
create or replace function public._is_numeric(text) 
returns boolean 
language sql 
immutable 
parallel safe as $$
  select $1 ~ '^\s*[-+]?\d+(\.\d+)?\s*$'
$$;

-- 1) Overlay "is_active" pour positions
--    Si "positions" est une vue, on ne peut pas l'altérer : on superpose une table overlay
create table if not exists public.positions_active_overlay (
  -- clé souple : on mappe par identifiant fonctionnel. Adapte la "clé" si tu as un id.
  symbol text primary key,
  is_active boolean not null default true,
  updated_at timestamptz default now()
);

-- 2) Vue compat de positions : "positions_final"
--    - extrait les colonnes par to_jsonb(t)->>'...' (jamais 42703)
--    - injecte is_active depuis l'overlay (par défaut true si absent)
drop view if exists public.positions_final cascade;
create or replace view public.positions_final as
select
  coalesce(
    to_jsonb(p)->>'symbol',
    to_jsonb(p)->>'ticker',
    to_jsonb(p)->>'asset_symbol',
    to_jsonb(p)->>'asset'
  )::text                                   as symbol,
  coalesce((to_jsonb(p)->>'qty')::numeric, 0::numeric) as qty,
  coalesce((to_jsonb(p)->>'price')::numeric, null)     as price,
  coalesce(ov.is_active, true)              as is_active,
  now()                                     as as_of
from public.positions p
left join public.positions_active_overlay ov
  on ov.symbol = coalesce(
    to_jsonb(p)->>'symbol',
    to_jsonb(p)->>'ticker',
    to_jsonb(p)->>'asset_symbol',
    to_jsonb(p)->>'asset'
  );

create index if not exists idx_positions_active_overlay_symbol
  on public.positions_active_overlay(symbol);

-- 3) Overlay pour unrealized PnL si tu veux persister un calcul (optionnel, lecture seule par défaut)
create table if not exists public.trades_unrealized_overlay (
  trade_key text primary key, -- peut être "id" si présent, sinon hash symbol|ts
  unrealized_pnl numeric,
  updated_at timestamptz default now()
);

-- 4) Vue compat trades : aucune référence directe à symbol/price/qty/ts
drop view if exists public.trades_compat cascade;
create or replace view public.trades_compat as
select
  -- identifiant logique si disponible
  (to_jsonb(t)->>'id')::text                                  as id_compat,
  coalesce(
    to_jsonb(t)->>'symbol',
    to_jsonb(t)->>'ticker',
    to_jsonb(t)->>'asset_symbol',
    to_jsonb(t)->>'asset'
  )::text                                                     as symbol_compat,
  lower(coalesce(to_jsonb(t)->>'side','long'))                as side_compat,
  case when public._is_numeric(to_jsonb(t)->>'qty')
       then (to_jsonb(t)->>'qty')::numeric else 0::numeric end as qty_compat,
  case when public._is_numeric(to_jsonb(t)->>'entry_price')
       then (to_jsonb(t)->>'entry_price')::numeric
       when public._is_numeric(to_jsonb(t)->>'price')
       then (to_jsonb(t)->>'price')::numeric
       else null end                                          as entry_price_compat,
  case when public._is_numeric(to_jsonb(t)->>'realized_pnl')
       then (to_jsonb(t)->>'realized_pnl')::numeric
       else 0::numeric end                                    as realized_pnl_compat,
  coalesce(
    (to_jsonb(t)->>'ts')::timestamptz,
    (to_jsonb(t)->>'created_at')::timestamptz,
    now()
  )                                                           as trade_ts_compat
from public.trades t;

-- 5) Vue marché (cache)
--    On suppose market_ticks_cache(symbol,bid,ask,last,ts) — indexé sur symbol
create index if not exists idx_mkt_ticks_cache_symbol on public.market_ticks_cache(symbol);

-- 6) Vue PnL finale : calcule unrealized_pnl via cache (join explicite), et superpose overlay si dispo
drop view if exists public.trades_pnl_view cascade;
create or replace view public.trades_pnl_view as
with mkt as (
  select
    symbol,
    coalesce((bid+ask)/2, last, bid, ask)::numeric as px_now,
    ts as mkt_ts
  from public.market_ticks_cache
)
, base as (
  select
    tc.id_compat::text                              as id_key,
    tc.symbol_compat                                as symbol,
    tc.side_compat                                  as side,
    tc.qty_compat                                   as qty,
    tc.entry_price_compat                           as price,
    tc.realized_pnl_compat                          as realized_pnl,
    tc.trade_ts_compat                              as ts,
    m.px_now,
    case
      when m.px_now is null or tc.entry_price_compat is null then null
      when tc.side_compat in ('buy','long')   then (m.px_now - tc.entry_price_compat) * tc.qty_compat
      when tc.side_compat in ('sell','short') then (tc.entry_price_compat - m.px_now) * tc.qty_compat
      else null
    end::numeric                                    as unrealized_calc
  from public.trades_compat tc
  left join mkt m
    on m.symbol = tc.symbol_compat
)
select
  coalesce(b.id_key, md5(coalesce(b.symbol,'?')||'|'||coalesce(b.ts::text,'?'))) as id,
  b.symbol, b.side, b.qty, b.price, b.realized_pnl, b.ts, b.px_now,
  coalesce(ov.unrealized_pnl, b.unrealized_calc) as unrealized_pnl
from base b
left join public.trades_unrealized_overlay ov
  on ov.trade_key = coalesce(b.id_key, md5(coalesce(b.symbol,'?')||'|'||coalesce(b.ts::text,'?')));

-- 7) RPC propre (lecture front)
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
  select id, symbol, side, qty, price, realized_pnl, unrealized_pnl, ts, px_now
  from public.trades_pnl_view
  where ts >= p_since
  order by ts desc
$$;

-- SANITY CHECKS (doivent renvoyer, même vide)
-- select * from public.positions_final limit 1;
-- select * from public.trades_compat limit 1;
-- select * from public.trades_pnl_view limit 1;
-- select * from public.get_trades_with_pnl(date_trunc('day', now())) limit 1;