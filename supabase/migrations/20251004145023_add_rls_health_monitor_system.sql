-- RLS Health Monitor System Migration
-- Creates comprehensive RLS monitoring and auto-repair functionality

-- 1) Create appsec schema for security monitoring
CREATE SCHEMA IF NOT EXISTS appsec;

-- 2) Reference table for expected RLS policies
CREATE TABLE IF NOT EXISTS appsec.rls_expected (
    table_name TEXT NOT NULL,
    policy_name TEXT NOT NULL,
    cmd TEXT NOT NULL CHECK (cmd IN ('select','insert','update','delete','all')),
    role_tag TEXT NOT NULL,   -- 'system_ai' | 'data_ingest' | 'public' | 'admin'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (table_name, policy_name)
);

-- Populate with key tables from existing schema
INSERT INTO appsec.rls_expected (table_name, policy_name, cmd, role_tag, description) VALUES
    -- Provider management (most sensitive)
    ('providers','providers_insert_admin','insert','admin','Admin only can add new providers'),
    ('providers','providers_update_admin','update','admin','Admin only can update provider configs'),
    ('providers','providers_select_admin','select','admin','Admin can read all provider data'),
    ('providers','providers_public_health','select','public','Public can check provider health status'),
    
    -- External data sources state
    ('external_sources_state','ext_state_upsert_ingest','insert','data_ingest','Data ingest services can create source state'),
    ('external_sources_state','ext_state_update_ingest','update','data_ingest','Data ingest services can update source state'),
    ('external_sources_state','ext_state_select_public','select','public','Public can read external sources state'),
    
    -- OHLC market data
    ('ohlc','ohlc_insert_ingest','insert','data_ingest','Data ingest can insert OHLC bars'),
    ('ohlc','ohlc_select_public','select','public','Public can read OHLC data'),
    
    -- Reading materials (knowledge base)
    ('reading_materials','reading_select_public','select','public','Public can read learning materials'),
    ('reading_materials','reading_manage_admin','all','admin','Admin can manage reading materials'),
    
    -- AI Agents critical tables
    ('ai_agents','ai_agents_select_public','select','public','Public can view AI agent status'),
    ('ai_agents','ai_agents_manage_system','all','system_ai','System AI can manage agent configs'),
    
    -- System health monitoring
    ('system_health','system_health_insert_system','insert','system_ai','System AI can log health metrics'),
    ('system_health','system_health_select_admin','select','admin','Admin can read system health'),
    
    -- Event bus for AI coordination  
    ('event_bus','event_bus_insert_system','insert','system_ai','System AI can create events'),
    ('event_bus','event_bus_select_system','select','system_ai','System AI can read events'),
    
    -- Risk controller
    ('risk_controller','risk_insert_system','insert','system_ai','System can log risk events'),
    ('risk_controller','risk_select_admin','select','admin','Admin can view risk events')
ON CONFLICT (table_name, policy_name) DO NOTHING;

-- 3) RLS Health Check Function (READ-ONLY RPC)
CREATE OR REPLACE FUNCTION appsec.rls_health()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    out JSONB := jsonb_build_object(
        'ts', NOW(), 
        'system_status', 'checking',
        'tables', jsonb_build_array(),
        'summary', jsonb_build_object(
            'total_tables', 0,
            'healthy_tables', 0,
            'tables_with_issues', 0,
            'total_policies_expected', 0,
            'missing_policies', 0
        )
    );
    table_count INT := 0;
    healthy_count INT := 0;
    issue_count INT := 0;
    total_policies INT := 0;
    missing_policies INT := 0;
BEGIN
    FOR rec IN
        WITH rls AS (
            SELECT 
                c.relname AS table_name, 
                c.relrowsecurity AS rls_on,
                n.nspname AS schema_name
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'r'
        ),
        pol AS (
            SELECT 
                pol.polrelid::regclass::text AS table_name,
                pol.polname AS policy_name,
                CASE pol.polcmd 
                    WHEN 'r' THEN 'select'
                    WHEN 'a' THEN 'insert'  
                    WHEN 'w' THEN 'update'
                    WHEN 'd' THEN 'delete'
                    WHEN '*' THEN 'all'
                    ELSE pol.polcmd::text
                END AS cmd,
                pg_get_expr(pol.polqual, pol.polrelid) AS using_clause,
                pg_get_expr(pol.polwithcheck, pol.polrelid) AS check_clause
            FROM pg_policy pol
        ),
        exp AS (
            SELECT * FROM appsec.rls_expected
        )
        SELECT
            rls.table_name,
            rls.rls_on,
            rls.schema_name,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'policy_name', exp.policy_name,
                        'cmd', exp.cmd,
                        'role_tag', exp.role_tag,
                        'expected', true,
                        'exists', (pol.policy_name IS NOT NULL),
                        'description', exp.description,
                        'actual_using', pol.using_clause,
                        'actual_check', pol.check_clause
                    ) ORDER BY exp.policy_name
                ) FILTER (WHERE exp.policy_name IS NOT NULL),
                '[]'::jsonb
            ) AS policies,
            -- Also get unexpected policies
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'policy_name', pol.policy_name,
                        'cmd', pol.cmd,
                        'expected', false,
                        'exists', true,
                        'actual_using', pol.using_clause,
                        'actual_check', pol.check_clause
                    ) ORDER BY pol.policy_name
                ) FILTER (WHERE exp.policy_name IS NULL AND pol.policy_name IS NOT NULL),
                '[]'::jsonb
            ) AS unexpected_policies
        FROM rls
        LEFT JOIN exp ON exp.table_name = rls.table_name
        LEFT JOIN pol ON pol.table_name = rls.table_name 
            AND (pol.policy_name = exp.policy_name OR exp.policy_name IS NULL)
        WHERE EXISTS (SELECT 1 FROM exp e WHERE e.table_name = rls.table_name)
           OR EXISTS (SELECT 1 FROM pol p WHERE p.table_name = rls.table_name)
        GROUP BY rls.table_name, rls.rls_on, rls.schema_name
    LOOP
        table_count := table_count + 1;
        
        DECLARE
            table_status TEXT := 'OK';
            missing_count INT := 0;
            expected_count INT := 0;
        BEGIN
            -- Count expected policies
            SELECT jsonb_array_length(rec.policies) INTO expected_count;
            total_policies := total_policies + expected_count;
            
            -- Check if RLS is off
            IF NOT rec.rls_on THEN
                table_status := 'RLS_OFF';
                issue_count := issue_count + 1;
            ELSE
                -- Count missing policies
                SELECT COUNT(*)::INT
                FROM jsonb_array_elements(rec.policies) p
                WHERE (p->>'exists')::boolean = false
                INTO missing_count;
                
                missing_policies := missing_policies + missing_count;
                
                IF missing_count > 0 THEN
                    table_status := 'MISSING_POLICIES';
                    issue_count := issue_count + 1;
                ELSE
                    healthy_count := healthy_count + 1;
                END IF;
            END IF;
            
            -- Add table to output
            out := jsonb_set(out, '{tables}', (out->'tables') || jsonb_build_array(
                jsonb_build_object(
                    'table', rec.table_name,
                    'schema', rec.schema_name,
                    'rls_on', rec.rls_on,
                    'status', table_status,
                    'policies_expected', expected_count,
                    'policies_missing', missing_count,
                    'policies', COALESCE(rec.policies, '[]'::jsonb),
                    'unexpected_policies', COALESCE(rec.unexpected_policies, '[]'::jsonb),
                    'health_score', CASE 
                        WHEN NOT rec.rls_on THEN 0
                        WHEN missing_count = 0 THEN 100
                        ELSE GREATEST(0, 100 - (missing_count::float / expected_count * 100)::int)
                    END
                )
            ));
        END;
    END LOOP;
    
    -- Update summary
    out := jsonb_set(out, '{summary}', jsonb_build_object(
        'total_tables', table_count,
        'healthy_tables', healthy_count,  
        'tables_with_issues', issue_count,
        'total_policies_expected', total_policies,
        'missing_policies', missing_policies,
        'overall_health_score', CASE 
            WHEN table_count = 0 THEN 100
            ELSE (healthy_count::float / table_count * 100)::int
        END
    ));
    
    -- Set system status
    out := jsonb_set(out, '{system_status}', 
        CASE 
            WHEN issue_count = 0 THEN '"healthy"'::jsonb
            WHEN issue_count < table_count THEN '"degraded"'::jsonb  
            ELSE '"critical"'::jsonb
        END
    );
    
    RETURN out;
END $$;

-- 4) Auto-repair function (SECURITY DEFINER) - backend only
CREATE OR REPLACE FUNCTION appsec.rls_autorepair()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, appsec
AS $$
DECLARE
    t RECORD;
    pol RECORD;
    created INT := 0;
    turned_on INT := 0;
    repaired_tables TEXT[] := ARRAY[]::TEXT[];
    sql_cmd TEXT;
BEGIN
    -- Step 1: Enable RLS on tables that have expected policies but RLS is off
    FOR t IN
        SELECT DISTINCT rls_expected.table_name
        FROM appsec.rls_expected
        JOIN pg_class c ON c.relname = rls_expected.table_name
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
            AND c.relkind = 'r'
            AND NOT c.relrowsecurity
    LOOP
        BEGIN
            sql_cmd := format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t.table_name);
            EXECUTE sql_cmd;
            turned_on := turned_on + 1;
            repaired_tables := array_append(repaired_tables, t.table_name || ':RLS_ENABLED');
            
            RAISE NOTICE 'Enabled RLS on table: %', t.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to enable RLS on %: %', t.table_name, SQLERRM;
        END;
    END LOOP;
    
    -- Step 2: Create missing policies based on role patterns
    FOR pol IN
        SELECT table_name, policy_name, cmd, role_tag, description
        FROM appsec.rls_expected
        WHERE NOT EXISTS (
            SELECT 1 FROM pg_policy 
            WHERE polname = rls_expected.policy_name
                AND polrelid = (
                    SELECT c.oid 
                    FROM pg_class c 
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relname = rls_expected.table_name 
                        AND n.nspname = 'public'
                )
        )
        ORDER BY table_name, policy_name
    LOOP
        BEGIN
            DECLARE
                policy_sql TEXT;
                using_clause TEXT := 'true';
                check_clause TEXT := 'true';
                target_roles TEXT := 'authenticated';
            BEGIN
                -- Determine roles and clauses based on role_tag
                CASE pol.role_tag
                    WHEN 'admin' THEN
                        using_clause := 'is_admin_from_auth()';
                        check_clause := 'is_admin_from_auth()';
                        target_roles := 'authenticated';
                    WHEN 'system_ai' THEN  
                        using_clause := 'coalesce(auth.jwt() ->> ''role'','''') = ''system_ai''';
                        check_clause := 'coalesce(auth.jwt() ->> ''role'','''') = ''system_ai''';
                        target_roles := 'authenticated';
                    WHEN 'data_ingest' THEN
                        using_clause := 'coalesce(auth.jwt() ->> ''role'','''') = ''data_ingest''';  
                        check_clause := 'coalesce(auth.jwt() ->> ''role'','''') = ''data_ingest''';
                        target_roles := 'authenticated';
                    WHEN 'public' THEN
                        using_clause := 'true';
                        check_clause := 'true'; 
                        target_roles := 'anon, authenticated';
                    ELSE
                        using_clause := 'true';
                        check_clause := 'true';
                        target_roles := 'authenticated';
                END CASE;
                
                -- Build policy SQL based on command type
                CASE pol.cmd
                    WHEN 'select' THEN
                        policy_sql := format(
                            'CREATE POLICY %I ON %I FOR SELECT TO %s USING (%s)',
                            pol.policy_name, pol.table_name, target_roles, using_clause
                        );
                    WHEN 'insert' THEN
                        policy_sql := format(
                            'CREATE POLICY %I ON %I FOR INSERT TO %s WITH CHECK (%s)',
                            pol.policy_name, pol.table_name, target_roles, check_clause  
                        );
                    WHEN 'update' THEN
                        policy_sql := format(
                            'CREATE POLICY %I ON %I FOR UPDATE TO %s USING (%s) WITH CHECK (%s)',
                            pol.policy_name, pol.table_name, target_roles, using_clause, check_clause
                        );
                    WHEN 'delete' THEN
                        policy_sql := format(
                            'CREATE POLICY %I ON %I FOR DELETE TO %s USING (%s)',
                            pol.policy_name, pol.table_name, target_roles, using_clause
                        );
                    WHEN 'all' THEN
                        policy_sql := format(
                            'CREATE POLICY %I ON %I FOR ALL TO %s USING (%s) WITH CHECK (%s)',
                            pol.policy_name, pol.table_name, target_roles, using_clause, check_clause
                        );
                    ELSE
                        RAISE WARNING 'Unknown command type: % for policy %', pol.cmd, pol.policy_name;
                        CONTINUE;
                END CASE;
                
                -- Execute the policy creation
                EXECUTE policy_sql;
                created := created + 1;
                repaired_tables := array_append(repaired_tables, 
                    pol.table_name || ':POLICY_CREATED:' || pol.policy_name
                );
                
                RAISE NOTICE 'Created policy: % on table: %', pol.policy_name, pol.table_name;
            END;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to create policy % on %: %', pol.policy_name, pol.table_name, SQLERRM;
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'timestamp', NOW(),
        'rls_tables_enabled', turned_on,
        'policies_created', created,
        'total_repairs', turned_on + created,
        'repaired_items', repaired_tables,
        'message', format('RLS Auto-repair completed: %s tables enabled, %s policies created', 
                         turned_on, created)
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'timestamp', NOW(),
        'error', SQLERRM,
        'rls_tables_enabled', turned_on,
        'policies_created', created,
        'repaired_items', repaired_tables
    );
END $$;

-- 5) Grant permissions for RPC access
-- Health check: public access (read-only)
REVOKE ALL ON FUNCTION appsec.rls_health() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION appsec.rls_health() TO anon, authenticated;

-- Auto-repair: service role only (write operations)  
REVOKE ALL ON FUNCTION appsec.rls_autorepair() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION appsec.rls_autorepair() TO service_role;

-- Grant schema usage
GRANT USAGE ON SCHEMA appsec TO anon, authenticated, service_role;
GRANT SELECT ON appsec.rls_expected TO anon, authenticated, service_role;

-- 6) Add helpful comments
COMMENT ON SCHEMA appsec IS 'Security monitoring and management schema for RLS policies';
COMMENT ON TABLE appsec.rls_expected IS 'Reference table defining expected RLS policies for system tables';
COMMENT ON FUNCTION appsec.rls_health() IS 'Read-only function to check RLS policy health status - exposed as RPC';
COMMENT ON FUNCTION appsec.rls_autorepair() IS 'Write function to automatically repair missing RLS policies - service role only';

-- 7) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rls_expected_table ON appsec.rls_expected(table_name);
CREATE INDEX IF NOT EXISTS idx_rls_expected_role ON appsec.rls_expected(role_tag);
CREATE INDEX IF NOT EXISTS idx_rls_expected_cmd ON appsec.rls_expected(cmd);

-- Migration completed
SELECT 'RLS Health Monitor System migration completed successfully' AS status;