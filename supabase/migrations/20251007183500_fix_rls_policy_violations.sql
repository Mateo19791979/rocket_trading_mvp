-- Schema Analysis: Existing captains_log and kill_switches tables with inadequate RLS policies
-- Integration Type: Security enhancement - fixing RLS policy violations
-- Dependencies: captains_log, kill_switches, user_profiles tables

-- Fix RLS policies for captains_log table
-- Current issue: Policy requires user_id = auth.uid() but doesn't handle NULL user_id cases

-- Drop existing restrictive policy and create more flexible ones
DROP POLICY IF EXISTS "users_manage_own_captains_log" ON public.captains_log;

-- Create comprehensive policies for captains_log
-- Pattern 2: Simple User Ownership for user entries
CREATE POLICY "users_manage_own_captains_log"
ON public.captains_log
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 4: Public read for system entries (where user_id might be NULL)
CREATE POLICY "authenticated_can_read_system_logs"
ON public.captains_log
FOR SELECT
TO authenticated
USING (user_id IS NULL OR user_id = auth.uid());

-- Allow system/service accounts to create entries without user_id
CREATE POLICY "system_can_create_captains_log"
ON public.captains_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Fix RLS policies for kill_switches table
-- Current issue: Only admin access policy exists, needs broader access for operations

-- Current policy should remain but add operational access
-- Keep existing admin policy: admin_full_access_kill_switches

-- Add operational read access for authenticated users
CREATE POLICY "authenticated_can_read_kill_switches"
ON public.kill_switches
FOR SELECT
TO authenticated
USING (true);

-- Add service role access for automated systems
CREATE POLICY "service_can_manage_kill_switches"
ON public.kill_switches
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create helper function for admin checks using auth.users metadata (Pattern 6A)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin'
         OR au.email = 'admin@trading-mvp.com')
)
$$;

-- Add admin write access for kill switches using correct syntax
-- Create separate policies for INSERT, UPDATE, DELETE
CREATE POLICY "admin_can_insert_kill_switches"
ON public.kill_switches
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_can_update_kill_switches"
ON public.kill_switches
FOR UPDATE
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_can_delete_kill_switches"
ON public.kill_switches
FOR DELETE
TO authenticated
USING (public.is_admin_from_auth());

-- Update captains_log to use user_profiles relationship properly
-- Ensure foreign key constraint exists
DO $$
BEGIN
    -- Check if foreign key constraint exists, add if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'captains_log_user_id_fkey'
        AND table_name = 'captains_log'
    ) THEN
        ALTER TABLE public.captains_log 
        ADD CONSTRAINT captains_log_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Foreign key constraint may already exist or user_profiles table not found: %', SQLERRM;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_captains_log_user_id_null 
ON public.captains_log(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_captains_log_system_entries 
ON public.captains_log(created_at) WHERE user_id IS NULL;

-- Grant necessary permissions
GRANT SELECT ON public.captains_log TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.captains_log TO authenticated;
GRANT SELECT ON public.kill_switches TO authenticated;

-- Comment on policies for clarity
COMMENT ON POLICY "users_manage_own_captains_log" ON public.captains_log IS 
'Allows users to manage their own captain log entries';

COMMENT ON POLICY "authenticated_can_read_system_logs" ON public.captains_log IS 
'Allows authenticated users to read system logs and their own entries';

COMMENT ON POLICY "system_can_create_captains_log" ON public.captains_log IS 
'Allows service role to create system log entries';

COMMENT ON POLICY "authenticated_can_read_kill_switches" ON public.kill_switches IS 
'Allows authenticated users to read kill switch status';

COMMENT ON POLICY "admin_can_insert_kill_switches" ON public.kill_switches IS 
'Allows admin users to insert kill switches';

COMMENT ON POLICY "admin_can_update_kill_switches" ON public.kill_switches IS 
'Allows admin users to update kill switches';

COMMENT ON POLICY "admin_can_delete_kill_switches" ON public.kill_switches IS 
'Allows admin users to delete kill switches';

COMMENT ON POLICY "service_can_manage_kill_switches" ON public.kill_switches IS 
'Allows service role to manage kill switches for automated systems';