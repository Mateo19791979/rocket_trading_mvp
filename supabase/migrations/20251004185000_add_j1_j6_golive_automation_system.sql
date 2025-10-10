-- Location: supabase/migrations/20251004185000_add_j1_j6_golive_automation_system.sql
-- Schema Analysis: Existing comprehensive deployment infrastructure with projects, system_health, provider_health_checks, feature_flags, ssl_certificates, dns_health_checks 
-- Integration Type: Addition - New J1-J6 automation tables that reference existing user_profiles and projects
-- Dependencies: user_profiles, projects tables (existing)

-- ==========================================
-- J1-J6 GO-LIVE AUTOMATION SYSTEM
-- ==========================================

-- 1. ENUMS for Deployment States
CREATE TYPE public.deployment_stage AS ENUM (
    'j1_boot_guard',
    'j2_performance_testing', 
    'j3_security_scanning',
    'j4_monitoring_setup',
    'j5_qa_validation',
    'j6_production_release'
);

CREATE TYPE public.execution_status AS ENUM (
    'pending',
    'running', 
    'completed',
    'failed',
    'skipped',
    'cancelled'
);

CREATE TYPE public.automation_priority AS ENUM (
    'low',
    'medium', 
    'high',
    'critical'
);

-- 2. DEPLOYMENT PIPELINES - Main orchestrator table
CREATE TABLE public.deployment_pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_name TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    target_date DATE DEFAULT '2025-10-09'::date,
    current_stage public.deployment_stage DEFAULT 'j1_boot_guard'::public.deployment_stage,
    overall_status public.execution_status DEFAULT 'pending'::public.execution_status,
    completion_percentage NUMERIC(5,2) DEFAULT 0.00,
    environment_variables JSONB DEFAULT '{}'::jsonb,
    configuration JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 3. STAGE EXECUTIONS - Individual J1-J6 stage tracking
CREATE TABLE public.stage_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES public.deployment_pipelines(id) ON DELETE CASCADE,
    stage public.deployment_stage NOT NULL,
    status public.execution_status DEFAULT 'pending'::public.execution_status,
    priority public.automation_priority DEFAULT 'medium'::public.automation_priority,
    script_name TEXT NOT NULL,
    command_template TEXT NOT NULL,
    execution_order INTEGER NOT NULL,
    depends_on_stages public.deployment_stage[] DEFAULT array[]::public.deployment_stage[],
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    exit_code INTEGER,
    stdout_log TEXT,
    stderr_log TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. AUTOMATION SCRIPTS - Script templates and configurations
CREATE TABLE public.automation_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage public.deployment_stage NOT NULL,
    script_name TEXT NOT NULL UNIQUE,
    script_path TEXT NOT NULL,
    description TEXT,
    command_template TEXT NOT NULL,
    required_env_vars TEXT[] DEFAULT array[]::text[],
    success_criteria JSONB DEFAULT '{}'::jsonb,
    failure_conditions JSONB DEFAULT '{}'::jsonb,
    timeout_minutes INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. DEPLOYMENT METRICS - Performance and validation metrics
CREATE TABLE public.deployment_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES public.deployment_pipelines(id) ON DELETE CASCADE,
    stage_execution_id UUID REFERENCES public.stage_executions(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_unit TEXT,
    threshold_min NUMERIC,
    threshold_max NUMERIC,
    is_within_threshold BOOLEAN,
    measured_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. EMERGENCY_CONTROLS - Killswitch and rollback capabilities  
CREATE TABLE public.emergency_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES public.deployment_pipelines(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    control_type TEXT NOT NULL CHECK (control_type IN ('killswitch', 'rollback', 'pause', 'resume')),
    trigger_reason TEXT NOT NULL,
    triggered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    impact_assessment JSONB DEFAULT '{}'::jsonb
);

-- 7. AUDIT_LOGS - Comprehensive deployment audit trail
CREATE TABLE public.deployment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES public.deployment_pipelines(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. ESSENTIAL INDEXES for Performance
CREATE INDEX idx_deployment_pipelines_project_id ON public.deployment_pipelines(project_id);
CREATE INDEX idx_deployment_pipelines_created_by ON public.deployment_pipelines(created_by);
CREATE INDEX idx_deployment_pipelines_current_stage ON public.deployment_pipelines(current_stage);
CREATE INDEX idx_deployment_pipelines_overall_status ON public.deployment_pipelines(overall_status);
CREATE INDEX idx_deployment_pipelines_target_date ON public.deployment_pipelines(target_date);

CREATE INDEX idx_stage_executions_pipeline_id ON public.stage_executions(pipeline_id);
CREATE INDEX idx_stage_executions_stage ON public.stage_executions(stage);
CREATE INDEX idx_stage_executions_status ON public.stage_executions(status);
CREATE INDEX idx_stage_executions_execution_order ON public.stage_executions(execution_order);

CREATE INDEX idx_automation_scripts_stage ON public.automation_scripts(stage);
CREATE INDEX idx_automation_scripts_is_active ON public.automation_scripts(is_active);

CREATE INDEX idx_deployment_metrics_pipeline_id ON public.deployment_metrics(pipeline_id);
CREATE INDEX idx_deployment_metrics_stage_execution_id ON public.deployment_metrics(stage_execution_id);
CREATE INDEX idx_deployment_metrics_metric_type ON public.deployment_metrics(metric_type);

CREATE INDEX idx_emergency_controls_pipeline_id ON public.emergency_controls(pipeline_id);
CREATE INDEX idx_emergency_controls_triggered_by ON public.emergency_controls(triggered_by);
CREATE INDEX idx_emergency_controls_control_type ON public.emergency_controls(control_type);

CREATE INDEX idx_deployment_audit_logs_pipeline_id ON public.deployment_audit_logs(pipeline_id);
CREATE INDEX idx_deployment_audit_logs_user_id ON public.deployment_audit_logs(user_id);
CREATE INDEX idx_deployment_audit_logs_action ON public.deployment_audit_logs(action);
CREATE INDEX idx_deployment_audit_logs_created_at ON public.deployment_audit_logs(created_at);

-- 9. FUNCTIONS for Automation Logic (Must be before RLS policies)
CREATE OR REPLACE FUNCTION public.calculate_pipeline_completion_percentage(pipeline_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    ROUND(
        (COUNT(se.*) FILTER (WHERE se.status = 'completed')::numeric / 
         NULLIF(COUNT(se.*), 0)) * 100, 
        2
    ), 
    0.00
)
FROM public.stage_executions se
WHERE se.pipeline_id = pipeline_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_next_executable_stages(pipeline_uuid UUID)
RETURNS TABLE(
    stage_id UUID,
    stage public.deployment_stage,
    can_execute BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER  
AS $$
SELECT 
    se.id,
    se.stage,
    (
        se.status = 'pending' AND 
        COALESCE(array_length(se.depends_on_stages, 1), 0) = 0 OR
        NOT EXISTS (
            SELECT 1 FROM public.stage_executions dep_se
            WHERE dep_se.pipeline_id = pipeline_uuid
            AND dep_se.stage = ANY(se.depends_on_stages)
            AND dep_se.status != 'completed'
        )
    ) AS can_execute
FROM public.stage_executions se
WHERE se.pipeline_id = pipeline_uuid
ORDER BY se.execution_order;
$$;

CREATE OR REPLACE FUNCTION public.update_pipeline_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update pipeline completion percentage and current stage
    UPDATE public.deployment_pipelines dp
    SET 
        completion_percentage = public.calculate_pipeline_completion_percentage(dp.id),
        current_stage = (
            SELECT se.stage 
            FROM public.stage_executions se
            WHERE se.pipeline_id = dp.id 
            AND se.status IN ('running', 'pending')
            ORDER BY se.execution_order
            LIMIT 1
        ),
        overall_status = CASE
            WHEN EXISTS (
                SELECT 1 FROM public.stage_executions se
                WHERE se.pipeline_id = dp.id AND se.status = 'failed'
            ) THEN 'failed'::public.execution_status
            WHEN EXISTS (
                SELECT 1 FROM public.stage_executions se  
                WHERE se.pipeline_id = dp.id AND se.status = 'running'
            ) THEN 'running'::public.execution_status
            WHEN NOT EXISTS (
                SELECT 1 FROM public.stage_executions se
                WHERE se.pipeline_id = dp.id AND se.status != 'completed'
            ) THEN 'completed'::public.execution_status
            ELSE 'pending'::public.execution_status
        END,
        completed_at = CASE
            WHEN NOT EXISTS (
                SELECT 1 FROM public.stage_executions se
                WHERE se.pipeline_id = dp.id AND se.status != 'completed'
            ) AND dp.completed_at IS NULL
            THEN CURRENT_TIMESTAMP
            ELSE dp.completed_at
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE dp.id = NEW.pipeline_id;
    
    RETURN NEW;
END;
$$;

-- 10. ENABLE RLS on all tables
ALTER TABLE public.deployment_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_audit_logs ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES using Pattern 2 and Pattern 6

-- Pattern 2: Simple user ownership for pipelines
CREATE POLICY "users_manage_own_deployment_pipelines"
ON public.deployment_pipelines
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Pattern 7: Complex relationship - stages access through pipeline ownership
CREATE OR REPLACE FUNCTION public.can_access_pipeline_stages(pipeline_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.deployment_pipelines dp
    WHERE dp.id = pipeline_uuid 
    AND dp.created_by = auth.uid()
)
$$;

CREATE POLICY "users_manage_pipeline_stage_executions"
ON public.stage_executions
FOR ALL
TO authenticated
USING (public.can_access_pipeline_stages(pipeline_id))
WITH CHECK (public.can_access_pipeline_stages(pipeline_id));

-- Pattern 4: Public read for automation scripts (templates), admin manage
CREATE POLICY "public_can_read_automation_scripts"
ON public.automation_scripts
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_manage_automation_scripts"
ON public.automation_scripts
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 7: Deployment metrics access through pipeline ownership
CREATE POLICY "users_view_pipeline_deployment_metrics"
ON public.deployment_metrics
FOR SELECT
TO authenticated
USING (public.can_access_pipeline_stages(pipeline_id));

-- Pattern 2: Simple user ownership for emergency controls
CREATE POLICY "users_manage_own_emergency_controls"
ON public.emergency_controls
FOR ALL
TO authenticated
USING (triggered_by = auth.uid())
WITH CHECK (triggered_by = auth.uid());

-- Pattern 6: Admin access for audit logs (using auth.users metadata)
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
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE POLICY "admin_full_access_deployment_audit_logs"
ON public.deployment_audit_logs
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Users can view their own audit logs
CREATE POLICY "users_view_own_deployment_audit_logs"
ON public.deployment_audit_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 12. TRIGGERS for automatic updates
CREATE TRIGGER update_deployment_pipelines_updated_at
    BEFORE UPDATE ON public.deployment_pipelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stage_executions_updated_at
    BEFORE UPDATE ON public.stage_executions  
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_scripts_updated_at
    BEFORE UPDATE ON public.automation_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pipeline_status_trigger
    AFTER INSERT OR UPDATE ON public.stage_executions
    FOR EACH ROW EXECUTE FUNCTION public.update_pipeline_status();

-- 13. MOCK DATA for J1-J6 Go-Live System
DO $$
DECLARE
    existing_user_id UUID;
    existing_project_id UUID;
    pipeline1_id UUID := gen_random_uuid();
    pipeline2_id UUID := gen_random_uuid();
    stage_j1_id UUID := gen_random_uuid();
    stage_j2_id UUID := gen_random_uuid();
    stage_j3_id UUID := gen_random_uuid();
    stage_j4_id UUID := gen_random_uuid();
    stage_j5_id UUID := gen_random_uuid();
    stage_j6_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user and project IDs (don't create new ones)
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_project_id FROM public.projects LIMIT 1;

    -- Create automation scripts templates
    INSERT INTO public.automation_scripts (stage, script_name, script_path, description, command_template, required_env_vars, timeout_minutes) VALUES
        ('j1_boot_guard', 'day1_boot_guard.sh', 'ops/day1_boot_guard.sh', 'Boot guard & redeploy with RLS health checks', 'bash ./ops/day1_boot_guard.sh', ARRAY['API_BASE_URL', 'INTERNAL_ADMIN_KEY'], 15),
        ('j2_performance_testing', 'day2_k6_suite.sh', 'ops/day2_k6_suite.sh', 'K6 performance testing suite with HTTP/WS/RAG tests', 'bash ./ops/day2_k6_suite.sh', ARRAY['API_BASE_URL', 'WS_URL', 'PROMETHEUS_URL'], 45),
        ('j3_security_scanning', 'day3_security_scan.sh', 'ops/day3_security_scan.sh', 'OWASP ZAP security scanning and SSL checks', 'bash ./ops/day3_security_scan.sh', ARRAY['APP_BASE_URL', 'SENTRY_TEST_URL'], 30),
        ('j4_monitoring_setup', 'day4_monitoring_alerts.yml', 'ops/day4_monitoring_alerts.yml', 'Prometheus alerting rules installation', 'echo "Import ops/day4_monitoring_alerts.yml to Prometheus"', ARRAY['PROMETHEUS_URL'], 10),
        ('j5_qa_validation', 'day5_qa_final.sh', 'ops/day5_qa_final.sh', 'Final QA validation with E2E smoke tests', 'bash ./ops/day5_qa_final.sh', ARRAY['APP_BASE_URL', 'API_BASE_URL', 'WS_URL'], 20),
        ('j6_production_release', 'day6_release.sh', 'ops/day6_release.sh', 'Production release with backup and tagging', 'bash ./ops/day6_release.sh', ARRAY['PG_URL'], 25);

    -- Create deployment pipelines if user and project exist
    IF existing_user_id IS NOT NULL AND existing_project_id IS NOT NULL THEN
        INSERT INTO public.deployment_pipelines (id, pipeline_name, project_id, created_by, target_date, current_stage, overall_status, environment_variables) VALUES
            (pipeline1_id, 'Rocket Trading MVP - Production Go-Live', existing_project_id, existing_user_id, '2025-10-09'::date, 'j1_boot_guard'::public.deployment_stage, 'running'::public.execution_status, 
             '{"API_BASE_URL":"https://api.trading-mvp.com","APP_BASE_URL":"https://trading-mvp.com","WS_URL":"wss://api.trading-mvp.com/ws/quotes","PROMETHEUS_URL":"http://prometheus:9090","INTERNAL_ADMIN_KEY":"xxxxxxxxxxxxxxxx","SENTRY_DSN":"xxxxxx","SENTRY_TEST_URL":"https://api.trading-mvp.com/debug/sentry-test","SUPABASE_URL":"https://your.supabase.co","SUPABASE_SERVICE_KEY":"eyJhbGciOi...","DOCKER":"1"}'::jsonb),
            (pipeline2_id, 'Rocket Trading MVP - Staging Validation', existing_project_id, existing_user_id, '2025-10-07'::date, 'j3_security_scanning'::public.deployment_stage, 'pending'::public.execution_status, 
             '{"API_BASE_URL":"https://staging-api.trading-mvp.com","APP_BASE_URL":"https://staging.trading-mvp.com"}'::jsonb);

        -- Create stage executions for Pipeline 1 (Production)
        INSERT INTO public.stage_executions (id, pipeline_id, stage, status, script_name, command_template, execution_order, started_at, completed_at, duration_seconds, exit_code, stdout_log, metrics) VALUES
            (stage_j1_id, pipeline1_id, 'j1_boot_guard', 'completed', 'day1_boot_guard.sh', 'bash ./ops/day1_boot_guard.sh', 1, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes', 900, 0, '== J1: Boot guard & redeploy ==\n✅ RLS health OK\n✅ J1 OK', '{"rls_checks_passed":true,"api_response_time_ms":120,"deployment_successful":true}'::jsonb),
            (stage_j2_id, pipeline1_id, 'j2_performance_testing', 'running', 'day2_k6_suite.sh', 'bash ./ops/day2_k6_suite.sh', 2, CURRENT_TIMESTAMP - INTERVAL '1 hour 30 minutes', NULL, NULL, NULL, '== J2: k6 perf suite ==\nRunning HTTP tests...', '{"tests_running":4,"completed_tests":1}'::jsonb),
            (stage_j3_id, pipeline1_id, 'j3_security_scanning', 'pending', 'day3_security_scan.sh', 'bash ./ops/day3_security_scan.sh', 3, NULL, NULL, NULL, NULL, NULL, '{}'::jsonb),
            (stage_j4_id, pipeline1_id, 'j4_monitoring_setup', 'pending', 'day4_monitoring_alerts.yml', 'echo "Import monitoring rules"', 4, NULL, NULL, NULL, NULL, NULL, '{}'::jsonb),
            (stage_j5_id, pipeline1_id, 'j5_qa_validation', 'pending', 'day5_qa_final.sh', 'bash ./ops/day5_qa_final.sh', 5, NULL, NULL, NULL, NULL, NULL, '{}'::jsonb),
            (stage_j6_id, pipeline1_id, 'j6_production_release', 'pending', 'day6_release.sh', 'bash ./ops/day6_release.sh', 6, NULL, NULL, NULL, NULL, NULL, '{}'::jsonb);

        -- Create deployment metrics
        INSERT INTO public.deployment_metrics (pipeline_id, stage_execution_id, metric_type, metric_name, metric_value, metric_unit, threshold_min, threshold_max, is_within_threshold) VALUES
            (pipeline1_id, stage_j1_id, 'performance', 'api_response_time', 120, 'ms', 0, 400, true),
            (pipeline1_id, stage_j1_id, 'reliability', 'rls_health_score', 100, 'percentage', 95, 100, true),
            (pipeline1_id, stage_j2_id, 'performance', 'k6_http_p95_latency', 350, 'ms', 0, 700, true),
            (pipeline1_id, stage_j2_id, 'performance', 'k6_error_rate', 0.5, 'percentage', 0, 2, true);

        -- Create sample audit log
        INSERT INTO public.deployment_audit_logs (pipeline_id, user_id, action, resource_type, resource_id, new_values) VALUES
            (pipeline1_id, existing_user_id, 'PIPELINE_STARTED', 'deployment_pipeline', pipeline1_id, '{"stage":"j1_boot_guard","started_by":"system","timestamp":"2025-10-04T18:50:00Z"}'::jsonb),
            (pipeline1_id, existing_user_id, 'STAGE_COMPLETED', 'stage_execution', stage_j1_id, '{"stage":"j1_boot_guard","status":"completed","duration_seconds":900}'::jsonb);

    ELSE
        RAISE NOTICE 'No existing users or projects found. Create users and projects first.';
    END IF;

END $$;

-- 14. CLEANUP FUNCTION for testing
CREATE OR REPLACE FUNCTION public.cleanup_j1j6_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete in dependency order
    DELETE FROM public.deployment_audit_logs WHERE pipeline_id IN (
        SELECT id FROM public.deployment_pipelines WHERE pipeline_name LIKE '%Test%' OR pipeline_name LIKE '%Demo%'
    );
    DELETE FROM public.deployment_metrics WHERE pipeline_id IN (
        SELECT id FROM public.deployment_pipelines WHERE pipeline_name LIKE '%Test%' OR pipeline_name LIKE '%Demo%'
    );
    DELETE FROM public.emergency_controls WHERE pipeline_id IN (
        SELECT id FROM public.deployment_pipelines WHERE pipeline_name LIKE '%Test%' OR pipeline_name LIKE '%Demo%'
    );
    DELETE FROM public.stage_executions WHERE pipeline_id IN (
        SELECT id FROM public.deployment_pipelines WHERE pipeline_name LIKE '%Test%' OR pipeline_name LIKE '%Demo%'
    );
    DELETE FROM public.deployment_pipelines WHERE pipeline_name LIKE '%Test%' OR pipeline_name LIKE '%Demo%';
    
    -- Clean up test automation scripts
    DELETE FROM public.automation_scripts WHERE script_name LIKE '%test%' OR script_name LIKE '%demo%';
    
    RAISE NOTICE 'J1-J6 test data cleaned up successfully';
END;
$$;