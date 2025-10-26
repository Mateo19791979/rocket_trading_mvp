-- 📊 Solution simple : Statistiques trading réalisé-only
-- Calcule tout à partir du réalisé du jour sans colonnes fantômes

-- Helper fonction pour validation numérique
CREATE OR REPLACE FUNCTION public._is_numeric(text)
RETURNS boolean 
LANGUAGE sql 
IMMUTABLE 
PARALLEL SAFE 
AS $$
    SELECT $1 ~ '^\s*[-+]?\d+(\.\d+)?\s*$'
$$;

-- RPC principal : Statistiques trading du jour (UTC) - robuste
CREATE OR REPLACE FUNCTION public.get_trading_stats_today()
RETURNS TABLE(
    as_of TIMESTAMPTZ,
    since TIMESTAMPTZ,
    trades_count INTEGER,
    winners INTEGER,
    losers INTEGER,
    win_rate NUMERIC,
    avg_pnl_per_trade NUMERIC,
    avg_win NUMERIC,
    avg_loss_abs NUMERIC,
    realized_sum NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
WITH day_trades AS (
    SELECT
        -- PnL réalisé du trade (0 si absent/non num)
        CASE WHEN (to_jsonb(t)->>'realized_pnl') ~ '^\-?\d+(\.\d+)?$'
             THEN (to_jsonb(t)->>'realized_pnl')::numeric
             ELSE 0::numeric 
        END as realized_pnl
    FROM public.trades t
    WHERE COALESCE(
            (to_jsonb(t)->>'ts')::timestamptz,
            (to_jsonb(t)->>'created_at')::timestamptz,
            now()
          ) >= date_trunc('day', now())
)
SELECT
    now() as as_of,
    date_trunc('day', now()) as since,
    count(*)::int as trades_count,
    sum(CASE WHEN realized_pnl > 0 THEN 1 ELSE 0 END)::int as winners,
    sum(CASE WHEN realized_pnl < 0 THEN 1 ELSE 0 END)::int as losers,
    CASE WHEN count(*) > 0 
         THEN round(avg(CASE WHEN realized_pnl > 0 THEN 1.0 ELSE 0.0 END)::numeric, 4)
         ELSE 0 
    END as win_rate,
    round(coalesce(avg(realized_pnl), 0)::numeric, 4) as avg_pnl_per_trade,
    round(coalesce(avg(realized_pnl) FILTER (WHERE realized_pnl > 0), 0)::numeric, 4) as avg_win,
    round(abs(coalesce(avg(realized_pnl) FILTER (WHERE realized_pnl < 0), 0)::numeric), 4) as avg_loss_abs,
    round(coalesce(sum(realized_pnl), 0)::numeric, 4) as realized_sum
FROM day_trades;
$$;

-- RPC pour période personnalisée
CREATE OR REPLACE FUNCTION public.get_trading_stats_period(p_since TIMESTAMPTZ)
RETURNS TABLE(
    as_of TIMESTAMPTZ,
    since TIMESTAMPTZ,
    trades_count INTEGER,
    winners INTEGER,
    losers INTEGER,
    win_rate NUMERIC,
    avg_pnl_per_trade NUMERIC,
    avg_win NUMERIC,
    avg_loss_abs NUMERIC,
    realized_sum NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
WITH period_trades AS (
    SELECT
        CASE WHEN (to_jsonb(t)->>'realized_pnl') ~ '^\-?\d+(\.\d+)?$'
             THEN (to_jsonb(t)->>'realized_pnl')::numeric
             ELSE 0::numeric 
        END as realized_pnl
    FROM public.trades t
    WHERE COALESCE(
            (to_jsonb(t)->>'ts')::timestamptz,
            (to_jsonb(t)->>'created_at')::timestamptz,
            now()
          ) >= p_since
)
SELECT
    now() as as_of,
    p_since as since,
    count(*)::int as trades_count,
    sum(CASE WHEN realized_pnl > 0 THEN 1 ELSE 0 END)::int as winners,
    sum(CASE WHEN realized_pnl < 0 THEN 1 ELSE 0 END)::int as losers,
    CASE WHEN count(*) > 0 
         THEN round(avg(CASE WHEN realized_pnl > 0 THEN 1.0 ELSE 0.0 END)::numeric, 4)
         ELSE 0 
    END as win_rate,
    round(coalesce(avg(realized_pnl), 0)::numeric, 4) as avg_pnl_per_trade,
    round(coalesce(avg(realized_pnl) FILTER (WHERE realized_pnl > 0), 0)::numeric, 4) as avg_win,
    round(abs(coalesce(avg(realized_pnl) FILTER (WHERE realized_pnl < 0), 0)::numeric), 4) as avg_loss_abs,
    round(coalesce(sum(realized_pnl), 0)::numeric, 4) as realized_sum
FROM period_trades;
$$;

-- Test de vérification (peut être commenté/supprimé)
-- SELECT * FROM public.get_trading_stats_today();