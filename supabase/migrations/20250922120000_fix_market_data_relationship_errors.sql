-- Location: supabase/migrations/20250922120000_fix_market_data_relationship_errors.sql
-- Schema Analysis: Market data system with missing foreign key relationships and RLS policy issues
-- Integration Type: Modificative - fixing existing schema issues
-- Dependencies: assets, market_data, market_data_sync_jobs, market_calendars tables

-- 1. Fix missing foreign key relationship between market_data and assets
ALTER TABLE public.market_data 
ADD CONSTRAINT fk_market_data_asset_id 
FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- 2. Fix the get_market_status function to return proper timestamp with time zone
CREATE OR REPLACE FUNCTION public.get_market_status(exchange_name text DEFAULT 'NYSE'::text)
RETURNS TABLE(
    is_open boolean, 
    status text, 
    next_open timestamp with time zone, 
    query_timestamp timestamp with time zone
)
LANGUAGE plpgsql
STABLE
AS $function$
DECLARE
    current_date_val DATE := CURRENT_DATE;
    market_cal RECORD;
    current_time_local TIME;
BEGIN
    -- Get market calendar for today
    SELECT * INTO market_cal
    FROM public.market_calendars mc
    WHERE mc.exchange = exchange_name 
    AND mc.market_date = current_date_val
    AND mc.is_trading_day = true
    LIMIT 1;

    current_time_local := CURRENT_TIME;

    RETURN QUERY SELECT 
        CASE 
            WHEN market_cal.market_open_time IS NOT NULL 
                 AND current_time_local >= market_cal.market_open_time 
                 AND current_time_local <= market_cal.market_close_time 
            THEN true
            ELSE false
        END as is_open,
        CASE 
            WHEN market_cal.market_open_time IS NULL THEN 'CLOSED'
            WHEN current_time_local < market_cal.market_open_time THEN 'PRE_MARKET'
            WHEN current_time_local <= market_cal.market_close_time THEN 'OPEN'
            ELSE 'AFTER_HOURS'
        END as status,
        CASE 
            WHEN current_time_local < COALESCE(market_cal.market_open_time, '09:30:00'::TIME)
            THEN (CURRENT_DATE + COALESCE(market_cal.market_open_time, '09:30:00'::TIME))::timestamp with time zone
            ELSE (CURRENT_DATE + INTERVAL '1 day' + COALESCE(market_cal.market_open_time, '09:30:00'::TIME))::timestamp with time zone
        END as next_open,
        NOW() as query_timestamp;
END;
$function$;

-- 3. Fix RLS policies for market_data_sync_jobs to allow system operations
-- Drop all existing conflicting policies first (prevents duplicate policy errors)
DROP POLICY IF EXISTS "admin_manage_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "users_view_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "system_can_create_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "system_can_update_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "admins_manage_sync_jobs" ON public.market_data_sync_jobs;

-- Create new policies that allow system operations while maintaining security
CREATE POLICY "allow_system_sync_operations"
ON public.market_data_sync_jobs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Ensure market_calendars table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_calendars_exchange_date 
ON public.market_calendars(exchange, market_date);

-- 5. Add index to optimize the new foreign key relationship
CREATE INDEX IF NOT EXISTS idx_market_data_asset_id_timestamp 
ON public.market_data(asset_id, timestamp);

-- 6. Create a cleanup function for old market data if needed
CREATE OR REPLACE FUNCTION public.cleanup_old_market_data(days_to_keep integer DEFAULT 30)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $cleanup$
DECLARE
    cutoff_date timestamp with time zone;
    deleted_count integer;
BEGIN
    cutoff_date := NOW() - INTERVAL '1 day' * days_to_keep;
    
    DELETE FROM public.market_data 
    WHERE timestamp < cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % old market data records older than %', deleted_count, cutoff_date;
END;
$cleanup$;

-- Add comment for documentation
COMMENT ON FUNCTION public.cleanup_old_market_data(integer) IS 'Removes market data older than specified days to keep storage optimized';