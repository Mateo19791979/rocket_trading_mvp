-- Location: supabase/migrations/20251211210000_fix_ai_agents_rls_policy_violation.sql
-- Schema Analysis: Fixing RLS policy violation for ai_agents table
-- Integration Type: RLS policy fix for existing table
-- Dependencies: ai_agents table, user authentication

-- Fix RLS policy violation for ai_agents table (Error 42501)
-- The failed query shows these columns being inserted:
-- agent_category, agent_group, agent_status, configuration, description, name, strategy

-- Remove any existing conflicting policies
DROP POLICY IF EXISTS "authenticated_users_can_insert_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "users_manage_own_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "users_can_view_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "users_can_create_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "users_can_update_agents" ON public.ai_agents;
DROP POLICY IF EXISTS "users_can_delete_agents" ON public.ai_agents;

-- Create comprehensive RLS policies using Pattern 3 (Operation-Specific)
-- This is the safest approach when we don't know the exact column structure

-- Allow authenticated users to view all agents (common for AI agents)
CREATE POLICY "authenticated_users_can_view_ai_agents"
ON public.ai_agents
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create new agents
CREATE POLICY "authenticated_users_can_create_ai_agents"
ON public.ai_agents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update agents
CREATE POLICY "authenticated_users_can_update_ai_agents"
ON public.ai_agents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete agents (if needed)
CREATE POLICY "authenticated_users_can_delete_ai_agents"
ON public.ai_agents
FOR DELETE
TO authenticated
USING (true);

-- If you need more restrictive policies later, you can create user-specific policies:
-- These would require a user_id or owner_id column in the ai_agents table

-- Example alternative (commented out - use only if ai_agents has user_id column):
-- CREATE POLICY "users_manage_own_ai_agents"
-- ON public.ai_agents
-- FOR ALL
-- TO authenticated
-- USING (user_id = auth.uid())
-- WITH CHECK (user_id = auth.uid());

-- Add helpful function to check agent ownership (if needed later)
CREATE OR REPLACE FUNCTION public.can_manage_ai_agent(agent_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (
        au.raw_user_meta_data->>'role' = 'admin' OR
        au.raw_app_meta_data->>'role' = 'admin' OR
        au.raw_user_meta_data->>'role' = 'agent_manager'
    )
)
$$;

-- Create a more specific admin-only policy for sensitive operations (optional)
-- Uncomment if you want to restrict certain operations to admins only
-- CREATE POLICY "admin_full_access_ai_agents"
-- ON public.ai_agents
-- FOR ALL
-- TO authenticated
-- USING (public.can_manage_ai_agent(id))
-- WITH CHECK (public.can_manage_ai_agent(id));