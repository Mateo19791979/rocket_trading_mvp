-- =====================================================================
-- PATCH COMPAT • PnL sans toucher à la table trades (idempotent)
-- Crée une VUE "trades_pnl_view" qui expose unrealized_pnl calculé.
-- Ajoute une fonction "trading_stats_summary" (read-only) pour tes cartes.
-- =====================================================================

-- 0) Sécurité : extension UUID si besoin (pas obligatoire ici)
create extension if not exists "pgcrypto";

-- 1) Vue compat : calcule unrealized_pnl depuis market_ticks_cache
-- Hypothèses minimales:
--   trades(id, symbol, side, qty, price, realized_pnl, ts)
--   market_ticks_cache(symbol, bid, ask, last, ts)
-- Le prix de marché utilisé = mid(bid,ask) sinon last

create or replace view public.trades_pnl_view as
with mkt as (
  select
    symbol,
    coalesce( (bid + ask)/2, last, bid, ask )::numeric as px_now,
    ts as mkt_ts
  from public.market_ticks_cache
)
select
  t.id,
  t.symbol,
  t.side,
  t.qty,
  t.price           as entry_price,
  t.realized_pnl    as realized_pnl,
  t.ts              as trade_ts,
  m.px_now,
  case
    when m.px_now is null then null
    when lower(t.side) in ('buy','long')  then (m.px_now - t.price) * t.qty
    when lower(t.side) in ('sell','short') then (t.price - m.px_now) * t.qty
    else null
  end::numeric       as unrealized_pnl
from public.trades t
left join mkt m using(symbol);

-- 2) Fonction de résumé (fenêtrée)
--    Retourne 1 ligne: nb trades, realized_sum, unrealized_sum, depuis p_since
create or replace function public.trading_stats_summary(p_since timestamptz default (date_trunc('day', now())))
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
    coalesce(sum(r.realized_pnl),0)::numeric as realized_sum,
    coalesce(sum(r.unrealized_pnl),0)::numeric as unrealized_sum,
    case when count(*)>0 then avg(coalesce(r.realized_pnl,0)) else 0 end::numeric as realized_avg,
    case when count(*)>0 then avg(coalesce(r.unrealized_pnl,0)) else 0 end::numeric as unrealized_avg
  from public.trades_pnl_view r
  where r.trade_ts >= p_since;
$$;

-- 3) (optionnel) vue "aujourd'hui"
create or replace view public.trading_stats_today as
select * from public.trading_stats_summary(date_trunc('day', now()));

-- 4) RLS: lecture via service_role (comme ton backend)
-- vue (pas de RLS direct) - les vues héritent des politiques des tables sous-jacentes

-- 5) Sanity checks (ne plantent pas si vide)
-- select * from public.trades_pnl_view limit 5;
-- select * from public.trading_stats_summary(date_trunc('day', now()));