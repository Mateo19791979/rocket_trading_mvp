-- Helper numérique (tolérant aux colonnes absentes)
create or replace function public._is_numeric(text) returns boolean
language sql immutable parallel safe as $$
  select $1 ~ '^\s*[-+]?\d+(\.\d+)?\s*$'
$$;

-- Vue de compat : calcule unrealized_pnl via le cache marché
drop view if exists public.trades_pnl_view;
create or replace view public.trades_pnl_view as
with tc as (
  select
    coalesce(
      to_jsonb(t)->>'symbol',
      to_jsonb(t)->>'ticker',
      to_jsonb(t)->>'asset_symbol',
      to_jsonb(t)->>'asset'
    )::text                                         as symbol,
    lower(coalesce(to_jsonb(t)->>'side','long'))    as side,
    case when (to_jsonb(t)->>'qty') ~ '^\-?\d+(\.\d+)?$'
         then (to_jsonb(t)->>'qty')::numeric else 0 end as qty,
    case when (to_jsonb(t)->>'entry_price') ~ '^\-?\d+(\.\d+)?$'
         then (to_jsonb(t)->>'entry_price')::numeric
         when (to_jsonb(t)->>'price') ~ '^\-?\d+(\.\d+)?$'
         then (to_jsonb(t)->>'price')::numeric
         else null end                              as price,
    case when (to_jsonb(t)->>'realized_pnl') ~ '^\-?\d+(\.\d+)?$'
         then (to_jsonb(t)->>'realized_pnl')::numeric else 0 end as realized_pnl,
    coalesce(
      (to_jsonb(t)->>'ts')::timestamptz,
      (to_jsonb(t)->>'created_at')::timestamptz,
      now()
    )                                               as ts
  from public.trades t
),
mkt as (
  select
    symbol,
    coalesce((bid+ask)/2, last, bid, ask)::numeric as px_now,
    ts as mkt_ts
  from public.market_ticks_cache
)
select
  md5(coalesce(tc.symbol,'?')||'|'||tc.ts::text) as id, -- id stable
  tc.symbol, tc.side, tc.qty, tc.price, tc.realized_pnl, tc.ts,
  m.px_now,
  case
    when m.px_now is null or tc.price is null then null
    when tc.side in ('buy','long')
         then (m.px_now - tc.price) * tc.qty
    when tc.side in ('sell','short')
         then (tc.price - m.px_now) * tc.qty
    else null
  end::numeric as unrealized_pnl
from tc left join mkt m on m.symbol = tc.symbol;

-- (utile si absent)
create index if not exists idx_mkt_ticks_symbol on public.market_ticks_cache(symbol);

-- RPC simple pour le front (mêmes colonnes que la carte)
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
language sql stable as $$
  select id, symbol, side, qty, price, realized_pnl, unrealized_pnl, ts, px_now
  from public.trades_pnl_view
  where ts >= p_since
  order by ts desc
$$;