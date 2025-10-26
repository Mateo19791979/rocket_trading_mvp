-- Location: supabase/migrations/20251014_add_ibkr_market_ticks_cache.sql
-- IBKR Market Ticks Cache System
-- Integration Type: addition
-- Dependencies: none (new standalone system)

-- Create market_ticks_cache table for IBKR data caching
create table if not exists public.market_ticks_cache (
  symbol text not null,
  ts timestamptz not null default now(),
  bid numeric,
  ask numeric,
  last numeric,
  volume numeric,
  source text default 'ibkr',
  primary key(symbol)
);

-- Index for timestamp-based queries
create index if not exists idx_market_ticks_cache_ts_desc on public.market_ticks_cache (ts desc);

-- RLS setup - service_role only access for background processes
alter table public.market_ticks_cache enable row level security;

drop policy if exists market_ticks_cache_all on public.market_ticks_cache;
create policy market_ticks_cache_all on public.market_ticks_cache
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- View for fresh market data (< 5s old)
drop view if exists public.market_ticks_fresh;
create view public.market_ticks_fresh as
select *
from public.market_ticks_cache
where ts > now() - make_interval(secs => 5);

-- Mock data for testing
DO $$
DECLARE
    mock_symbols TEXT[] := ARRAY['AAPL', 'MSFT', 'TSLA', 'SPY'];
    current_symbol TEXT;
BEGIN
    FOREACH current_symbol IN ARRAY mock_symbols
    LOOP
        INSERT INTO public.market_ticks_cache (symbol, bid, ask, last, volume, source, ts)
        VALUES (
            current_symbol,
            150.00 + (random() * 50),  -- bid
            150.05 + (random() * 50),  -- ask
            150.02 + (random() * 50),  -- last
            1000000 + (random() * 500000)::int,  -- volume
            'ibkr',
            now() - (random() * 30)::int * interval '1 second'  -- recent timestamps
        )
        ON CONFLICT (symbol) DO UPDATE SET
            bid = EXCLUDED.bid,
            ask = EXCLUDED.ask,
            last = EXCLUDED.last,
            volume = EXCLUDED.volume,
            ts = EXCLUDED.ts;
    END LOOP;
END $$;