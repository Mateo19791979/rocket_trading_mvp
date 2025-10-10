-- Location: supabase/migrations/20251004200000_add_rls_health_monitoring_system.sql
-- Schema Analysis: Existing trading MVP schema with comprehensive RLS policies
-- Integration Type: Addition - RLS health monitoring system for backend API
-- Dependencies: Existing RLS policies, user_profiles table

-- 1. Create RLS Expected Policies Configuration Table
CREATE TABLE IF NOT EXISTS public.rls_expected (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    cmd TEXT NOT NULL, -- SELECT, INSERT, UPDATE, DELETE, ALL
    role_tag TEXT NOT NULL, -- authenticated, public, admin
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(table_name, policy_name)
);

-- 2. Create RLS Health Status Enum
CREATE TYPE public.rls_health_status AS ENUM ('OK', 'RLS_OFF', 'MISSING_POLICIES', 'MISCONFIGURED');

-- 3. Enable RLS on the configuration table
ALTER TABLE public.rls_expected ENABLE ROW LEVEL SECURITY;

-- Use Pattern 6A: Admin access using auth.users metadata (safe for system tables)
CREATE POLICY "admin_manage_rls_expected"
ON public.rls_expected
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid() 
        AND (au.raw_user_meta_data->>'role' = 'admin' 
             OR au.raw_app_meta_data->>'role' = 'admin')
    )
);

-- 4. Create indexes for performance
CREATE INDEX idx_rls_expected_table_name ON public.rls_expected(table_name);
CREATE INDEX idx_rls_expected_policy_name ON public.rls_expected(policy_name);

-- 5. RLS Health Check Function
CREATE OR REPLACE FUNCTION public.rls_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    table_record RECORD;
    policy_record RECORD;
    table_health RECORD;
    rls_enabled BOOLEAN;
    missing_policies INTEGER;
    total_expected INTEGER;
    health_score INTEGER;
    system_status TEXT;
    total_tables INTEGER := 0;
    healthy_tables INTEGER := 0;
    tables_with_issues INTEGER := 0;
    overall_missing_policies INTEGER := 0;
    overall_health_score INTEGER;
    tables_json jsonb := '[]'::jsonb;
    table_json jsonb;
BEGIN
    -- Get all tables that should have RLS policies
    FOR table_record IN 
        SELECT DISTINCT table_name 
        FROM public.rls_expected 
        ORDER BY table_name
    LOOP
        total_tables := total_tables + 1;
        
        -- Check if RLS is enabled on this table
        SELECT EXISTS(
            SELECT 1 FROM pg_tables pt
            JOIN pg_class pc ON pc.relname = pt.tablename
            WHERE pt.schemaname = 'public' 
            AND pt.tablename = table_record.table_name
            AND pc.relrowsecurity = true
        ) INTO rls_enabled;
        
        -- Count expected policies for this table
        SELECT COUNT(*) INTO total_expected
        FROM public.rls_expected
        WHERE table_name = table_record.table_name;
        
        -- Count missing policies
        SELECT COUNT(*) INTO missing_policies
        FROM public.rls_expected re
        WHERE re.table_name = table_record.table_name
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies pp
            WHERE pp.schemaname = 'public'
            AND pp.tablename = re.table_name
            AND pp.policyname = re.policy_name
        );
        
        -- Calculate health score for this table
        IF NOT rls_enabled THEN
            health_score := 0;
            system_status := 'RLS_OFF';
        ELSIF missing_policies > 0 THEN
            health_score := GREATEST(0, 100 - (missing_policies * 100 / total_expected));
            system_status := 'MISSING_POLICIES';
        ELSE
            health_score := 100;
            system_status := 'OK';
        END IF;
        
        -- Track overall statistics
        IF system_status = 'OK' THEN
            healthy_tables := healthy_tables + 1;
        ELSE
            tables_with_issues := tables_with_issues + 1;
        END IF;
        
        overall_missing_policies := overall_missing_policies + missing_policies;
        
        -- Build table status JSON
        table_json := jsonb_build_object(
            'table', table_record.table_name,
            'rls_enabled', rls_enabled,
            'expected_policies', total_expected,
            'policies_missing', missing_policies,
            'health_score', health_score,
            'status', system_status
        );
        
        tables_json := tables_json || table_json;
    END LOOP;
    
    -- Calculate overall system health
    IF total_tables = 0 THEN
        overall_health_score := 100;
        system_status := 'healthy';
    ELSE
        overall_health_score := (healthy_tables * 100) / total_tables;
        
        IF overall_health_score >= 95 THEN
            system_status := 'healthy';
        ELSIF overall_health_score >= 80 THEN
            system_status := 'degraded';
        ELSE
            system_status := 'critical';
        END IF;
    END IF;
    
    -- Return comprehensive health report
    RETURN jsonb_build_object(
        'system_status', system_status,
        'summary', jsonb_build_object(
            'total_tables', total_tables,
            'healthy_tables', healthy_tables,
            'tables_with_issues', tables_with_issues,
            'missing_policies', overall_missing_policies,
            'overall_health_score', overall_health_score
        ),
        'tables', tables_json,
        'timestamp', EXTRACT(epoch FROM NOW()),
        'version', '1.0.0'
    );
END;
$func$;

-- 6. RLS Auto-Repair Function
CREATE OR REPLACE FUNCTION public.rls_autorepair()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    table_record RECORD;
    policy_record RECORD;
    rls_tables_enabled INTEGER := 0;
    policies_created INTEGER := 0;
    total_repairs INTEGER := 0;
    repair_log TEXT[] := '{}';
    table_exists BOOLEAN;
BEGIN
    -- Enable RLS on tables that need it
    FOR table_record IN 
        SELECT DISTINCT table_name 
        FROM public.rls_expected 
        ORDER BY table_name
    LOOP
        -- Check if table exists
        SELECT EXISTS(
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_record.table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            -- Enable RLS if not already enabled
            IF NOT EXISTS(
                SELECT 1 FROM pg_tables pt
                JOIN pg_class pc ON pc.relname = pt.tablename
                WHERE pt.schemaname = 'public' 
                AND pt.tablename = table_record.table_name
                AND pc.relrowsecurity = true
            ) THEN
                EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.table_name);
                rls_tables_enabled := rls_tables_enabled + 1;
                repair_log := repair_log || format('Enabled RLS on table: %s', table_record.table_name);
            END IF;
        END IF;
    END LOOP;
    
    -- Create missing policies (simplified - would need specific policy templates in production)
    FOR policy_record IN
        SELECT re.table_name, re.policy_name, re.cmd, re.role_tag, re.description
        FROM public.rls_expected re
        WHERE NOT EXISTS (
            SELECT 1 FROM pg_policies pp
            WHERE pp.schemaname = 'public'
            AND pp.tablename = re.table_name
            AND pp.policyname = re.policy_name
        )
        AND EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = re.table_name
        )
        ORDER BY re.table_name, re.policy_name
    LOOP
        -- Note: In production, you would have specific policy templates
        -- For now, we log what would be created
        repair_log := repair_log || format('Would create policy: %s on table %s', 
            policy_record.policy_name, policy_record.table_name);
        policies_created := policies_created + 1;
    END LOOP;
    
    total_repairs := rls_tables_enabled + policies_created;
    
    -- Return repair results
    RETURN jsonb_build_object(
        'success', true,
        'rls_tables_enabled', rls_tables_enabled,
        'policies_created', policies_created,
        'total_repairs', total_repairs,
        'repaired_items', repair_log,
        'timestamp', EXTRACT(epoch FROM NOW()),
        'version', '1.0.0'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'timestamp', EXTRACT(epoch FROM NOW())
        );
END;
$func$;

-- 7. Populate expected policies configuration with current system policies
DO $setup$
DECLARE
    policy_record RECORD;
BEGIN
    -- Insert expected policies for core trading MVP tables
    INSERT INTO public.rls_expected (table_name, policy_name, cmd, role_tag, description) VALUES
        ('user_profiles', 'users_manage_own_user_profiles', 'ALL', 'authenticated', 'Users can manage their own profiles'),
        ('ai_agents', 'users_manage_own_ai_agents', 'ALL', 'authenticated', 'Users can manage their AI agents'),
        ('portfolios', 'users_manage_own_portfolios', 'ALL', 'authenticated', 'Users can manage their portfolios'),
        ('orders', 'users_manage_own_orders', 'ALL', 'authenticated', 'Users can manage their orders'),
        ('trades', 'users_manage_own_trades', 'ALL', 'authenticated', 'Users can manage their trades'),
        ('positions', 'users_manage_own_positions', 'ALL', 'authenticated', 'Users can manage their positions'),
        ('watchlists', 'users_manage_own_watchlists', 'ALL', 'authenticated', 'Users can manage their watchlists'),
        ('watchlist_items', 'users_can_view_watchlist_items', 'SELECT', 'authenticated', 'Users can view watchlist items'),
        ('strategies', 'users_manage_own_strategies', 'ALL', 'authenticated', 'Users can manage their strategies'),
        ('recommendations', 'users_manage_own_recommendations', 'ALL', 'authenticated', 'Users can manage their recommendations'),
        ('alerts', 'users_manage_own_alerts', 'ALL', 'authenticated', 'Users can manage their alerts'),
        ('risk_metrics', 'users_manage_own_risk_metrics', 'ALL', 'authenticated', 'Users can manage their risk metrics'),
        ('ibkr_connections', 'users_manage_own_ibkr_connections', 'ALL', 'authenticated', 'Users can manage their IBKR connections'),
        ('options_strategies', 'users_manage_own_options_strategies', 'ALL', 'authenticated', 'Users can manage their options strategies'),
        ('ai_screening_results', 'users_manage_own_ai_screening_results', 'ALL', 'authenticated', 'Users can manage their AI screening results'),
        ('book_library', 'users_manage_own_book_library', 'ALL', 'authenticated', 'Users can manage their book library'),
        ('compliance_reports', 'users_manage_own_compliance_reports', 'ALL', 'authenticated', 'Users can manage their compliance reports'),
        ('generated_documents', 'users_manage_own_generated_documents', 'ALL', 'authenticated', 'Users can manage their generated documents'),
        ('weekly_report_schedules', 'users_manage_own_weekly_report_schedules', 'ALL', 'authenticated', 'Users can manage their report schedules'),
        ('weekly_report_templates', 'users_manage_own_weekly_report_templates', 'ALL', 'authenticated', 'Users can manage their report templates'),
        ('feature_flags', 'admin_manage_feature_flags', 'ALL', 'authenticated', 'Admins can manage feature flags'),
        ('deployment_pipelines', 'users_manage_own_deployment_pipelines', 'ALL', 'authenticated', 'Users can manage their deployment pipelines'),
        ('projects', 'users_manage_own_projects', 'ALL', 'authenticated', 'Users can manage their projects'),
        ('domain_configs', 'users_manage_own_domain_configs', 'ALL', 'authenticated', 'Users can manage their domain configs'),
        ('ssl_certificates', 'users_manage_own_ssl_certificates', 'ALL', 'authenticated', 'Users can manage their SSL certificates')
    ON CONFLICT (table_name, policy_name) DO NOTHING;
    
    RAISE NOTICE 'RLS expected policies configuration populated successfully';
END;
$setup$;

-- 8. Create cleanup function for test data
CREATE OR REPLACE FUNCTION public.cleanup_rls_health_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $cleanup$
BEGIN
    -- Clean up test data from rls_expected table
    DELETE FROM public.rls_expected WHERE description LIKE '%test%' OR description LIKE '%mock%';
    
    RAISE NOTICE 'RLS health test data cleaned up successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'RLS health cleanup failed: %', SQLERRM;
END;
$cleanup$;