-- Fix RLS Policy for Risk Controller Table
-- This migration fixes the RLS policy violation causing JSON parsing errors

-- Enable RLS on risk_controller table if not already enabled
ALTER TABLE IF EXISTS public.risk_controller ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_manage_own_risk_controller" ON public.risk_controller;
DROP POLICY IF EXISTS "authenticated_users_risk_controller" ON public.risk_controller;
DROP POLICY IF EXISTS "admin_access_risk_controller" ON public.risk_controller;

-- Create simple, safe RLS policy for risk_controller table
-- Using Pattern 2: Simple User Ownership with auth-based access
CREATE POLICY "authenticated_users_can_access_risk_controller"
ON public.risk_controller
FOR ALL
TO authenticated
USING (
    -- Allow access for authenticated users (service-level table)
    auth.uid() IS NOT NULL
)
WITH CHECK (
    -- Allow inserts/updates for authenticated users
    auth.uid() IS NOT NULL
);

-- Create additional policy for public health checks (read-only)
CREATE POLICY "public_health_check_risk_controller"
ON public.risk_controller
FOR SELECT
TO public
USING (
    -- Allow read access for basic health checks
    true
);

-- Grant necessary permissions for the health endpoint
GRANT SELECT ON public.risk_controller TO anon;
GRANT SELECT, INSERT, UPDATE ON public.risk_controller TO authenticated;

-- Ensure service role has full access
GRANT ALL ON public.risk_controller TO service_role;

-- Add comment for documentation
COMMENT ON POLICY "authenticated_users_can_access_risk_controller" ON public.risk_controller 
IS 'Allows authenticated users to access risk controller configuration - fixes RLS policy violation in health checks';

COMMENT ON POLICY "public_health_check_risk_controller" ON public.risk_controller 
IS 'Allows public read access for health check endpoints to prevent JSON parsing errors';

-- Insert default risk controller configuration if not exists
INSERT INTO public.risk_controller (
    configuration,
    killswitch_enabled,
    created_at,
    updated_at
) 
SELECT 
    '{"max_position_size": 10000, "max_daily_loss": 5000, "risk_limits": {"var_95": 0.05, "cvar_95": 0.10}}'::jsonb,
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.risk_controller LIMIT 1);

-- Create index for better performance on health checks
CREATE INDEX IF NOT EXISTS idx_risk_controller_health 
ON public.risk_controller (killswitch_enabled, updated_at);

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Successfully fixed RLS policy for risk_controller table - JSON parsing errors should be resolved';
END $$;