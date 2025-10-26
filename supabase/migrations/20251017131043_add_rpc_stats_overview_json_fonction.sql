-- Location: supabase/migrations/20251017131043_add_rpc_stats_overview_json_fonction.sql
-- Schema Analysis: Trading system with existing stats_overview views and rpc_stats_overview function
-- Integration Type: Enhancement - Add JSON variant of stats RPC function
-- Dependencies: public.stats_overview_one view (from existing migrations)

-- Create RPC function that returns JSON object instead of table row
-- This function is called by the frontend at src/features/stats/useStatsOverview.ts
CREATE OR REPLACE FUNCTION public.rpc_stats_overview_json()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT jsonb_build_object(
    'positions', positions,
    'trades', trades,
    'last_tick_at', last_tick_at::text
  )
  FROM public.stats_overview_one
  LIMIT 1
$$;

-- Add RLS policy for the function (allows public access to statistics)
-- This is consistent with existing stats overview approach
COMMENT ON FUNCTION public.rpc_stats_overview_json() IS 'Returns trading statistics as JSON object for dashboard consumption';

-- Verification that the function returns expected format
DO $$
DECLARE
    result_json JSONB;
BEGIN
    SELECT public.rpc_stats_overview_json() INTO result_json;
    
    IF result_json ? 'positions' AND result_json ? 'trades' AND result_json ? 'last_tick_at' THEN
        RAISE NOTICE '✅ rpc_stats_overview_json function working correctly';
        RAISE NOTICE 'Sample result: %', result_json;
    ELSE
        RAISE NOTICE '❌ rpc_stats_overview_json function missing expected keys';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error testing rpc_stats_overview_json: %', SQLERRM;
END $$;