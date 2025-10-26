-- Journal d'audit

create table if not exists public.schema_audit_log (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  item text not null,        -- 'public.positions.is_active'
  status text not null,      -- 'ok'|'missing'|'repaired'|'error'
  details text
);

create index if not exists schema_audit_log_run_idx on public.schema_audit_log(run_at desc);

-- Vue: dernier état par item

create or replace view public.schema_audit_status as
select item,
       (array_agg(status order by run_at desc))[1] as last_status,
       (array_agg(run_at order by run_at desc))[1] as last_run_at
from public.schema_audit_log
group by item;

-- Fonction générique: check booléen + réparation (optionnelle)

create or replace function public.audit_ensure_boolean_column(
  p_schema text, p_table text, p_column text, p_default boolean, p_do_repair boolean default false
) returns text
language plpgsql
as $$
declare
  has_col boolean;
  q text;
  item_id text := p_schema||'.'||p_table||'.'||p_column;
begin
  select exists(
    select 1 from information_schema.columns
    where table_schema=p_schema and table_name=p_table and column_name=p_column
  ) into has_col;

  if has_col then
    insert into public.schema_audit_log(item,status,details) values (item_id,'ok','column present');
    return 'ok';
  end if;

  if not p_do_repair then
    insert into public.schema_audit_log(item,status,details) values (item_id,'missing','no repair executed');
    return 'missing';
  end if;

  begin
    q := format('alter table %I.%I add column if not exists %I boolean default %L', p_schema, p_table, p_column, p_default);
    execute q;
    insert into public.schema_audit_log(item,status,details) values (item_id,'repaired','column added with default');
    return 'repaired';
  exception when others then
    insert into public.schema_audit_log(item,status,details) values (item_id,'error',sqlerrm);
    return 'error: '||sqlerrm;
  end;
end
$$;

-- CHECKS (sans réparation par défaut) — Ajoute ici les colonnes à surveiller

select public.audit_ensure_boolean_column('public','positions','is_active', true, false);

-- Fin SQL