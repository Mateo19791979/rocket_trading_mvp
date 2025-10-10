-- ===================================================================
-- (A) SUPABASE – SCHÉMA "PNL Daily Tracker"
-- ===================================================================

-- 1) Journal quotidien des performances
create table if not exists public.pnl_daily (
  d date primary key,
  total_pnl numeric not null default 0,         -- PnL net du jour (même devise que le compte)
  cum_pnl numeric not null default 0,           -- PnL cumulé depuis le début
  win_rate numeric not null default 0,          -- en %
  trades int not null default 0,
  agents_active int not null default 0,
  max_drawdown numeric not null default 0,      -- en %
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Seuils & alertes
create table if not exists public.pnl_alerts (
  id uuid primary key default gen_random_uuid(),
  d date not null,
  level text not null check (level in ('info','warn','crit')),
  code text not null,                 -- ex: 'DD_LIMIT', 'NEG_DAY', 'LOW_WINRATE'
  message text not null,
  ctx jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3) Paramètres (seuils de gouvernance simples)
create table if not exists public.pnl_guardrails (
  id bool primary key default true,             -- singleton
  dd_limit_pct numeric not null default 3,      -- désactive live si DD du jour > 3%
  min_win_rate numeric not null default 45,     -- alerte si win rate < 45%
  neg_day_cap numeric not null default -20000   -- alerte si PnL jour < -20k
);

insert into public.pnl_guardrails(id) values(true) on conflict (id) do nothing;

-- 4) Vue simple: 30 derniers jours + moyennes mobiles
create or replace view public.v_pnl_last30 as
select
  d,
  total_pnl,
  cum_pnl,
  win_rate,
  trades,
  agents_active,
  max_drawdown,
  avg(total_pnl) over (order by d rows between 6 preceding and current row) as ma7_pnl,
  avg(win_rate)  over (order by d rows between 6 preceding and current row) as ma7_wr
from public.pnl_daily
where d >= (current_date - 30)
order by d desc;

-- 5) Politiques RLS: accès service only
alter table public.pnl_daily enable row level security;
alter table public.pnl_alerts enable row level security;
alter table public.pnl_guardrails enable row level security;

drop policy if exists pnl_daily_all on public.pnl_daily;
drop policy if exists pnl_alerts_all on public.pnl_alerts;
drop policy if exists pnl_guardrails_all on public.pnl_guardrails;

create policy pnl_daily_all on public.pnl_daily
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy pnl_alerts_all on public.pnl_alerts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy pnl_guardrails_all on public.pnl_guardrails
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- 6) RPC utilitaire: calcule cumulé automatiquement
create or replace function public.upsert_pnl_daily(
  p_d date,
  p_total_pnl numeric,
  p_win_rate numeric,
  p_trades int,
  p_agents_active int,
  p_max_drawdown numeric,
  p_notes text default null
) returns public.pnl_daily
language plpgsql as $$
declare
  prev_cum numeric := 0;
  out_row public.pnl_daily;
begin
  select coalesce(cum_pnl,0) into prev_cum
  from public.pnl_daily
  where d = (p_d - 1);
  
  insert into public.pnl_daily(d,total_pnl,cum_pnl,win_rate,trades,agents_active,max_drawdown,notes,updated_at)
  values (p_d, p_total_pnl, prev_cum + p_total_pnl, p_win_rate, p_trades, p_agents_active, p_max_drawdown, p_notes, now())
  on conflict (d) do update set
    total_pnl     = excluded.total_pnl,
    cum_pnl       = prev_cum + excluded.total_pnl,
    win_rate      = excluded.win_rate,
    trades        = excluded.trades,
    agents_active = excluded.agents_active,
    max_drawdown  = excluded.max_drawdown,
    notes         = excluded.notes,
    updated_at    = now()
  returning * into out_row;
  
  return out_row;
end
$$;

-- 7) RPC: contrôle & alertes
create or replace function public.guardrail_check(p_d date)
returns setof public.pnl_alerts
language plpgsql as $$
declare
  cfg record;
  row_data record;
  alert_record public.pnl_alerts;
begin
  select * into cfg from public.pnl_guardrails where id = true;
  
  for row_data in select * from public.pnl_daily where d = p_d loop
    if row_data.max_drawdown > cfg.dd_limit_pct then
      insert into public.pnl_alerts(d, level, code, message, ctx)
      values (p_d, 'crit', 'DD_LIMIT', 'Max drawdown du jour dépasse la limite', 
              jsonb_build_object('dd',row_data.max_drawdown,'limit',cfg.dd_limit_pct))
      returning * into alert_record;
      return next alert_record;
    end if;
    
    if row_data.win_rate < cfg.min_win_rate then
      insert into public.pnl_alerts(d, level, code, message, ctx)
      values (p_d, 'warn', 'LOW_WINRATE', 'Taux de réussite du jour faible', 
              jsonb_build_object('wr',row_data.win_rate,'min',cfg.min_win_rate))
      returning * into alert_record;
      return next alert_record;
    end if;
    
    if row_data.total_pnl < cfg.neg_day_cap then
      insert into public.pnl_alerts(d, level, code, message, ctx)
      values (p_d, 'crit', 'NEG_DAY', 'PnL du jour très négatif', 
              jsonb_build_object('pnl',row_data.total_pnl,'cap',cfg.neg_day_cap))
      returning * into alert_record;
      return next alert_record;
    end if;
  end loop;
  
  return;
end
$$;