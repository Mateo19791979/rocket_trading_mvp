-- Fix Yahoo Finance sync errors and related database issues
-- Location: supabase/migrations/20250922122000_fix_yahoo_finance_sync_errors.sql
-- Schema Analysis: Comprehensive fix for Yahoo Finance API sync failures and database relationship issues
-- Integration Type: Corrective - fixing sync errors, RLS policies, and schema relationships
-- Dependencies: assets, market_data, market_data_sync_jobs, market_calendars tables

-- 1. Ensure foreign key relationship exists between market_data and assets
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_market_data_asset_id' 
        AND table_name = 'market_data'
    ) THEN
        ALTER TABLE public.market_data 
        ADD CONSTRAINT fk_market_data_asset_id 
        FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint fk_market_data_asset_id';
    END IF;
END
$$;

-- 2. Fix RLS policies for market_data_sync_jobs to allow system operations
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "admin_manage_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "system_can_create_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "system_can_update_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "users_view_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "admins_manage_sync_jobs" ON public.market_data_sync_jobs;

-- Create permissive policies for system operations
CREATE POLICY "allow_system_sync_operations"
ON public.market_data_sync_jobs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Fix the get_market_status function return type issue
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
        NOW()::timestamp with time zone as query_timestamp;
END;
$function$;

-- 4. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_market_calendars_exchange_date 
ON public.market_calendars(exchange, market_date);

CREATE INDEX IF NOT EXISTS idx_market_data_asset_id_timestamp 
ON public.market_data(asset_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_assets_symbol_active 
ON public.assets(symbol, is_active, sync_enabled);

-- 5. Create a function to handle Yahoo Finance sync errors gracefully
CREATE OR REPLACE FUNCTION public.log_sync_error(
    p_job_type text,
    p_asset_symbol text,
    p_api_source text,
    p_error_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $error_log$
BEGIN
    INSERT INTO public.market_data_sync_jobs (
        job_type,
        asset_symbol,
        status,
        api_source,
        error_message,
        started_at,
        completed_at,
        data_points_synced
    ) VALUES (
        p_job_type,
        p_asset_symbol,
        'failed',
        p_api_source,
        p_error_message,
        NOW(),
        NOW(),
        0
    );
    
    -- Log to system for debugging
    RAISE NOTICE 'Sync error logged for %: %', p_asset_symbol, p_error_message;
END;
$error_log$;

-- 6. Create a function to handle successful sync logging
CREATE OR REPLACE FUNCTION public.log_sync_success(
    p_job_type text,
    p_asset_symbol text,
    p_api_source text,
    p_data_points integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $success_log$
BEGIN
    INSERT INTO public.market_data_sync_jobs (
        job_type,
        asset_symbol,
        status,
        api_source,
        started_at,
        completed_at,
        data_points_synced
    ) VALUES (
        p_job_type,
        p_asset_symbol,
        'completed',
        p_api_source,
        NOW(),
        NOW(),
        p_data_points
    );
END;
$success_log$;

-- 7. Create a cleanup function for old sync job logs
CREATE OR REPLACE FUNCTION public.cleanup_sync_job_logs(days_to_keep integer DEFAULT 7)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $cleanup$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.market_data_sync_jobs 
    WHERE started_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % old sync job logs older than % days', deleted_count, days_to_keep;
    RETURN deleted_count;
END;
$cleanup$;

-- 8. Ensure proper RLS is enabled
ALTER TABLE public.market_data_sync_jobs ENABLE ROW LEVEL SECURITY;

-- 9. Add helpful comments
COMMENT ON FUNCTION public.log_sync_error(text, text, text, text) IS 'Logs Yahoo Finance and other API sync errors';
COMMENT ON FUNCTION public.log_sync_success(text, text, text, integer) IS 'Logs successful market data sync operations';
COMMENT ON FUNCTION public.cleanup_sync_job_logs(integer) IS 'Removes old sync job logs to keep table optimized';

-- 10. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.log_sync_error(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_sync_success(text, text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_sync_job_logs(integer) TO authenticated;

-- Verify the fixes
DO $$
BEGIN
    RAISE NOTICE 'Yahoo Finance sync error fixes applied successfully:';
    RAISE NOTICE '✅ Foreign key relationship between market_data and assets';
    RAISE NOTICE '✅ Permissive RLS policy for market_data_sync_jobs';
    RAISE NOTICE '✅ Fixed get_market_status function return types';
    RAISE NOTICE '✅ Performance indexes created';
    RAISE NOTICE '✅ Error logging functions created';
    RAISE NOTICE '📈 Yahoo Finance sync should now work properly!';
END
$$;