-- Location: supabase/migrations/20251004220000_fix_market_data_sync_jobs_rls_policies.sql
-- Schema Analysis: market_data_sync_jobs table exists with RLS enabled but restrictive policies
-- Integration Type: Fix existing RLS policies for system table operations
-- Dependencies: Uses existing market_data_sync_jobs table

-- Fix RLS policies for market_data_sync_jobs table
-- This is a SYSTEM table that needs service-level and public access for data sync operations

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Service role access for sync jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "authenticated_read_market_data_sync_jobs" ON public.market_data_sync_jobs;  
DROP POLICY IF EXISTS "authenticated_create_market_data_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "authenticated_update_market_data_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "anon_create_market_data_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "service_role_full_access_market_data_sync_jobs" ON public.market_data_sync_jobs;
DROP POLICY IF EXISTS "System access for market data sync" ON public.market_data_sync_jobs;

-- Create new comprehensive policies for system operations
-- Pattern: System/Service Tables - Allow service-level operations for data sync

-- Service role has full access for backend operations
CREATE POLICY "service_role_full_access_market_data_sync_jobs"
ON public.market_data_sync_jobs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public access for system operations (like Google Finance sync)
CREATE POLICY "public_system_access_market_data_sync_jobs"  
ON public.market_data_sync_jobs
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Authenticated users can read sync job status
CREATE POLICY "authenticated_read_market_data_sync_jobs"
ON public.market_data_sync_jobs
FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can create sync jobs (for public data feeds)
CREATE POLICY "anon_create_sync_jobs"
ON public.market_data_sync_jobs
FOR INSERT
TO anon
WITH CHECK (true);

-- Anonymous users can update sync jobs (for completion status)
CREATE POLICY "anon_update_sync_jobs"
ON public.market_data_sync_jobs
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);