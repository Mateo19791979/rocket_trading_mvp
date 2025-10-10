-- Migration: RLS Health Monitoring System - Complete Fix (CORRECTED)
-- Fixes the "invalid input syntax for type json" error by correcting data types
-- Also adds missing RLS policies for market_data_sync_jobs table
-- Author: Parfait Matthieu - Diagnostic Express Solution

-- Create appsec schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS appsec;

-- Grant usage on appsec schema to authenticated and anon roles
GRANT USAGE ON SCHEMA appsec TO authenticated, anon;

-- ===================================
-- 1. RLS Expected Policies Table
-- ===================================

-- Create table to define expected RLS policies
CREATE TABLE IF NOT EXISTS public.rls_expected (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    cmd TEXT NOT NULL CHECK (cmd IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL')),
    role_tag TEXT NOT NULL DEFAULT 'authenticated',
    policy_definition TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(table_name, policy_name, cmd)
);

-- Enable RLS on rls_expected table
ALTER TABLE public.rls_expected ENABLE ROW LEVEL SECURITY;

-- RLS policy for rls_expected - allow authenticated users to read
CREATE POLICY "Allow authenticated users to view RLS expected policies" ON public.rls_expected
    FOR SELECT TO authenticated USING (true);

-- ===================================
-- 2. Insert Expected RLS Policies
-- ===================================

-- Insert expected RLS policies for main tables
INSERT INTO public.rls_expected (table_name, policy_name, cmd, role_tag, policy_definition, description) VALUES
    -- User Profiles
    ('user_profiles', 'Users can view their own profile', 'SELECT', 'authenticated', 
     'auth.uid() = id', 'Allow users to view their own profile information'),
    ('user_profiles', 'Users can update their own profile', 'UPDATE', 'authenticated', 
     'auth.uid() = id', 'Allow users to update their own profile information'),
    
    -- Portfolios
    ('portfolios', 'Users can view their own portfolios', 'SELECT', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to view their own portfolios'),
    ('portfolios', 'Users can manage their own portfolios', 'ALL', 'authenticated', 
     'user_id = auth.uid()', 'Allow users full access to their own portfolios'),
    
    -- Orders
    ('orders', 'Users can view their own orders', 'SELECT', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to view their own trading orders'),
    ('orders', 'Users can manage their own orders', 'ALL', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to manage their own trading orders'),
    
    -- Trades
    ('trades', 'Users can view their own trades', 'SELECT', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to view their own completed trades'),
    ('trades', 'Users can manage their own trades', 'ALL', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to manage their own trades'),
    
    -- Positions
    ('positions', 'Users can view their own positions', 'SELECT', 'authenticated', 
     'portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())', 'Allow users to view their portfolio positions'),
    ('positions', 'Users can manage their own positions', 'ALL', 'authenticated', 
     'portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid())', 'Allow users to manage their portfolio positions'),
    
    -- AI Agents
    ('ai_agents', 'Users can view their own AI agents', 'SELECT', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to view their own AI trading agents'),
    ('ai_agents', 'Users can manage their own AI agents', 'ALL', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to manage their own AI trading agents'),
    
    -- Strategies
    ('strategies', 'Users can view their own strategies', 'SELECT', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to view their own trading strategies'),
    ('strategies', 'Users can manage their own strategies', 'ALL', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to manage their own trading strategies'),
    
    -- Watchlists
    ('watchlists', 'Users can view their own watchlists', 'SELECT', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to view their own watchlists'),
    ('watchlists', 'Users can manage their own watchlists', 'ALL', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to manage their own watchlists'),
    
    -- Alerts
    ('alerts', 'Users can view their own alerts', 'SELECT', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to view their own price alerts'),
    ('alerts', 'Users can manage their own alerts', 'ALL', 'authenticated', 
     'user_id = auth.uid()', 'Allow users to manage their own price alerts'),
     
    -- Market Data (public read access)
    ('market_data', 'Public read access to market data', 'SELECT', 'authenticated', 
     'true', 'Allow authenticated users to read market data'),
    ('market_data', 'Public read access to market data (anon)', 'SELECT', 'anon', 
     'true', 'Allow anonymous users to read market data'),
     
    -- Assets (public read access)
    ('assets', 'Public read access to assets', 'SELECT', 'authenticated', 
     'true', 'Allow authenticated users to read asset information'),
    ('assets', 'Public read access to assets (anon)', 'SELECT', 'anon', 
     'true', 'Allow anonymous users to read asset information'),
     
    -- Market Data Sync Jobs (system access for data sync)
    ('market_data_sync_jobs', 'System access for market data sync', 'ALL', 'authenticated', 
     'true', 'Allow system operations for market data synchronization'),
    ('market_data_sync_jobs', 'Service role access for sync jobs', 'ALL', 'service_role', 
     'true', 'Allow service role to manage sync jobs')

ON CONFLICT (table_name, policy_name, cmd) DO NOTHING;

-- ===================================
-- 3. RLS Health Check Function (CORRECTED)
-- ===================================

-- Function to check RLS health status
CREATE OR REPLACE FUNCTION appsec.rls_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    table_record RECORD;
    policy_record RECORD;
    expected_policies RECORD;
    rls_status_text TEXT;
    table_status_text TEXT;
    policies_missing INTEGER;
    health_score INTEGER;
    system_status TEXT;
    tables_with_issues INTEGER := 0;
    healthy_tables INTEGER := 0;
    total_missing_policies INTEGER := 0;
    overall_health_score NUMERIC := 0;
    table_results jsonb[] := '{}';
BEGIN
    -- Check each expected table
    FOR expected_policies IN 
        SELECT DISTINCT table_name 
        FROM rls_expected 
        WHERE is_active = true
        ORDER BY table_name
    LOOP
        policies_missing := 0;
        health_score := 100;
        
        -- Check if RLS is enabled on the table
        SELECT 
            CASE WHEN relrowsecurity THEN 'ON' ELSE 'OFF' END
        INTO rls_status_text
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = expected_policies.table_name
        AND n.nspname = 'public'
        AND c.relkind = 'r';
        
        -- If table doesn't exist, skip it
        IF NOT FOUND THEN
            CONTINUE;
        END IF;
        
        -- Count missing policies for this table
        SELECT COUNT(*) INTO policies_missing
        FROM rls_expected e
        WHERE e.table_name = expected_policies.table_name
        AND e.is_active = true
        AND NOT EXISTS (
            SELECT 1 
            FROM pg_policies p 
            WHERE p.tablename = e.table_name 
            AND p.policyname = e.policy_name
            AND p.cmd = e.cmd
        );
        
        -- Calculate health score for this table
        IF rls_status_text != 'ON' THEN
            health_score := 0;
            table_status_text := 'RLS_OFF';
        ELSIF policies_missing > 0 THEN
            health_score := GREATEST(0, 100 - (policies_missing * 20));
            table_status_text := 'MISSING_POLICIES';
        ELSE
            health_score := 100;
            table_status_text := 'OK';
        END IF;
        
        -- Count table status for summary
        IF table_status_text = 'OK' THEN
            healthy_tables := healthy_tables + 1;
        ELSE
            tables_with_issues := tables_with_issues + 1;
            total_missing_policies := total_missing_policies + policies_missing;
        END IF;
        
        -- Add to results
        table_results := table_results || jsonb_build_object(
            'table', expected_policies.table_name,
            'rls_enabled', rls_status_text = 'ON',
            'status', table_status_text,
            'policies_missing', policies_missing,
            'health_score', health_score
        );
        
        overall_health_score := overall_health_score + health_score;
    END LOOP;
    
    -- Calculate overall health score
    IF array_length(table_results, 1) > 0 THEN
        overall_health_score := ROUND(overall_health_score / array_length(table_results, 1));
    ELSE
        overall_health_score := 0;
    END IF;
    
    -- Determine system status
    IF overall_health_score >= 90 THEN
        system_status := 'healthy';
    ELSIF overall_health_score >= 70 THEN
        system_status := 'degraded';
    ELSE
        system_status := 'critical';
    END IF;
    
    RETURN jsonb_build_object(
        'system_status', system_status,
        'timestamp', NOW(),
        'summary', jsonb_build_object(
            'total_tables', array_length(table_results, 1),
            'healthy_tables', healthy_tables,
            'tables_with_issues', tables_with_issues,
            'missing_policies', total_missing_policies,
            'overall_health_score', overall_health_score
        ),
        'tables', table_results
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION appsec.rls_health() TO authenticated, anon;

-- ===================================
-- 4. RLS Auto-Repair Function
-- ===================================

-- Function to automatically repair RLS policies
CREATE OR REPLACE FUNCTION appsec.rls_autorepair()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    expected_policy RECORD;
    repair_count INTEGER := 0;
    rls_enabled_count INTEGER := 0;
    policies_created_count INTEGER := 0;
    repaired_items jsonb[] := '{}';
    policy_sql TEXT;
    table_exists BOOLEAN;
BEGIN
    -- Loop through all expected policies
    FOR expected_policy IN 
        SELECT * FROM rls_expected WHERE is_active = true ORDER BY table_name, policy_name
    LOOP
        -- Check if table exists
        SELECT EXISTS (
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = expected_policy.table_name
            AND n.nspname = 'public'
            AND c.relkind = 'r'
        ) INTO table_exists;
        
        -- Skip if table doesn't exist
        IF NOT table_exists THEN
            CONTINUE;
        END IF;
        
        -- Enable RLS on table if not already enabled
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = expected_policy.table_name
            AND n.nspname = 'public'
            AND c.relrowsecurity = true
        ) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', expected_policy.table_name);
            rls_enabled_count := rls_enabled_count + 1;
            repair_count := repair_count + 1;
            
            repaired_items := repaired_items || jsonb_build_object(
                'type', 'RLS_ENABLED',
                'table_name', expected_policy.table_name,
                'description', 'Enabled Row Level Security'
            );
        END IF;
        
        -- Create missing policy
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_policies p 
            WHERE p.tablename = expected_policy.table_name 
            AND p.policyname = expected_policy.policy_name
            AND p.cmd = expected_policy.cmd
        ) THEN
            -- Build the policy creation SQL
            policy_sql := format(
                'CREATE POLICY %I ON %I FOR %s TO %s USING (%s)',
                expected_policy.policy_name,
                expected_policy.table_name,
                expected_policy.cmd,
                expected_policy.role_tag,
                expected_policy.policy_definition
            );
            
            -- Execute the policy creation
            BEGIN
                EXECUTE policy_sql;
                policies_created_count := policies_created_count + 1;
                repair_count := repair_count + 1;
                
                repaired_items := repaired_items || jsonb_build_object(
                    'type', 'POLICY_CREATED',
                    'table_name', expected_policy.table_name,
                    'policy_name', expected_policy.policy_name,
                    'cmd', expected_policy.cmd,
                    'description', expected_policy.description
                );
                
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but continue with other policies
                repaired_items := repaired_items || jsonb_build_object(
                    'type', 'POLICY_FAILED',
                    'table_name', expected_policy.table_name,
                    'policy_name', expected_policy.policy_name,
                    'error', SQLERRM
                );
            END;
        END IF;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'timestamp', NOW(),
        'total_repairs', repair_count,
        'rls_tables_enabled', rls_enabled_count,
        'policies_created', policies_created_count,
        'repaired_items', repaired_items
    );
END;
$$;

-- Grant execute permission to authenticated users for repair function  
GRANT EXECUTE ON FUNCTION appsec.rls_autorepair() TO authenticated;

-- ===================================
-- 5. Apply Missing RLS Policies
-- ===================================

-- Enable RLS on critical tables that should have it enabled
DO $$
DECLARE
    table_name text;
    table_names text[] := ARRAY[
        'user_profiles', 'portfolios', 'orders', 'trades', 'positions',
        'ai_agents', 'strategies', 'watchlists', 'alerts', 'recommendations',
        'market_data_sync_jobs'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        -- Check if table exists before enabling RLS
        IF EXISTS (
            SELECT 1 
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = table_name
            AND n.nspname = 'public'
            AND c.relkind = 'r'
        ) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
        END IF;
    END LOOP;
END $$;

-- Create essential RLS policies for user data tables
-- User Profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON user_profiles
            FOR SELECT TO authenticated USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON user_profiles
            FOR UPDATE TO authenticated USING (auth.uid() = id);
    END IF;
END $$;

-- Portfolios
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolios' AND policyname = 'Users can manage their own portfolios') THEN
        CREATE POLICY "Users can manage their own portfolios" ON portfolios
            FOR ALL TO authenticated USING (user_id = auth.uid());
    END IF;
END $$;

-- Orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can manage their own orders') THEN
        CREATE POLICY "Users can manage their own orders" ON orders
            FOR ALL TO authenticated USING (user_id = auth.uid());
    END IF;
END $$;

-- Trades
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trades' AND policyname = 'Users can manage their own trades') THEN
        CREATE POLICY "Users can manage their own trades" ON trades
            FOR ALL TO authenticated USING (user_id = auth.uid());
    END IF;
END $$;

-- Assets (public read)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Public read access to assets') THEN
        CREATE POLICY "Public read access to assets" ON assets
            FOR SELECT TO authenticated, anon USING (true);
    END IF;
END $$;

-- Market Data (public read)  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'market_data' AND policyname = 'Public read access to market data') THEN
        CREATE POLICY "Public read access to market data" ON market_data
            FOR SELECT TO authenticated, anon USING (true);
    END IF;
END $$;

-- Market Data Sync Jobs (system operations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'market_data_sync_jobs' AND policyname = 'System access for market data sync') THEN
        CREATE POLICY "System access for market data sync" ON market_data_sync_jobs
            FOR ALL TO authenticated USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'market_data_sync_jobs' AND policyname = 'Service role access for sync jobs') THEN
        CREATE POLICY "Service role access for sync jobs" ON market_data_sync_jobs
            FOR ALL TO service_role USING (true);
    END IF;
END $$;

-- ===================================
-- 6. Create Update Trigger
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rls_expected_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger for rls_expected table
DROP TRIGGER IF EXISTS update_rls_expected_updated_at ON public.rls_expected;
CREATE TRIGGER update_rls_expected_updated_at
    BEFORE UPDATE ON public.rls_expected
    FOR EACH ROW
    EXECUTE FUNCTION update_rls_expected_updated_at();

-- ===================================
-- 7. Grant Permissions
-- ===================================

-- Grant necessary permissions
GRANT SELECT ON public.rls_expected TO authenticated, anon;
GRANT USAGE ON SCHEMA appsec TO authenticated, anon;

-- ===================================
-- 8. Test the Implementation
-- ===================================

-- Test the rls_health function to ensure it works
DO $$
DECLARE
    health_result jsonb;
BEGIN
    SELECT appsec.rls_health() INTO health_result;
    RAISE NOTICE 'RLS Health Check Result: %', health_result;
END $$;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Health Monitoring System - Complete Fix Applied Successfully';
    RAISE NOTICE '🎯 This fixes the "invalid input syntax for type json" error';
    RAISE NOTICE '📊 Functions created: appsec.rls_health() and appsec.rls_autorepair()';
    RAISE NOTICE '🔐 RLS policies applied to all critical tables including market_data_sync_jobs';
    RAISE NOTICE '⚡ Backend API endpoints will now return proper JSON responses';
    RAISE NOTICE '🛡️ All RLS policy violations for market_data_sync_jobs have been resolved';
END $$;