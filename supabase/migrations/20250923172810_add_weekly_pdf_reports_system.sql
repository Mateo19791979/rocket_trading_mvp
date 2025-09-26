-- Location: supabase/migrations/20250923172810_add_weekly_pdf_reports_system.sql
-- Schema Analysis: Existing generated_documents table supports reports, portfolios/trades/positions data available
-- Integration Type: Extension - Adding weekly PDF reports scheduling and template management
-- Dependencies: generated_documents, portfolios, user_profiles, trades, positions, market_data

-- 1. Enums for report configuration
CREATE TYPE public.report_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly');
CREATE TYPE public.report_status AS ENUM ('active', 'paused', 'disabled');
CREATE TYPE public.report_template_type AS ENUM ('executive_summary', 'detailed_performance', 'risk_assessment', 'portfolio_summary');

-- 2. Weekly PDF Report Templates table
CREATE TABLE public.weekly_report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type public.report_template_type DEFAULT 'portfolio_summary'::public.report_template_type,
    template_config JSONB DEFAULT '{}'::jsonb,
    branding_config JSONB DEFAULT '{}'::jsonb,
    sections_config JSONB DEFAULT '{}'::jsonb,
    chart_types JSONB DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Weekly PDF Report Schedules table
CREATE TABLE public.weekly_report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.weekly_report_templates(id) ON DELETE SET NULL,
    schedule_name TEXT NOT NULL,
    frequency public.report_frequency DEFAULT 'weekly'::public.report_frequency,
    schedule_status public.report_status DEFAULT 'active'::public.report_status,
    delivery_time TIME DEFAULT '09:00:00',
    delivery_day INTEGER DEFAULT 1, -- 1=Monday, 7=Sunday
    email_recipients JSONB DEFAULT '[]'::jsonb,
    portfolio_filters JSONB DEFAULT '{}'::jsonb,
    performance_periods JSONB DEFAULT '["1w", "1m", "3m", "1y"]'::jsonb,
    last_generated_at TIMESTAMPTZ,
    next_generation_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Report Generation Jobs tracking table
CREATE TABLE public.report_generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.weekly_report_schedules(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.generated_documents(id) ON DELETE SET NULL,
    job_status TEXT DEFAULT 'pending',
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    error_details TEXT,
    generation_params JSONB DEFAULT '{}'::jsonb,
    processing_time_seconds INTEGER
);

-- 5. Essential Indexes
CREATE INDEX idx_weekly_report_templates_user_id ON public.weekly_report_templates(user_id);
CREATE INDEX idx_weekly_report_templates_type ON public.weekly_report_templates(template_type);
CREATE INDEX idx_weekly_report_schedules_user_id ON public.weekly_report_schedules(user_id);
CREATE INDEX idx_weekly_report_schedules_status ON public.weekly_report_schedules(schedule_status);
CREATE INDEX idx_weekly_report_schedules_next_gen ON public.weekly_report_schedules(next_generation_at) WHERE schedule_status = 'active';
CREATE INDEX idx_report_generation_jobs_user_id ON public.report_generation_jobs(user_id);
CREATE INDEX idx_report_generation_jobs_status ON public.report_generation_jobs(job_status);

-- 6. Functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.calculate_next_report_generation(
    frequency_param public.report_frequency,
    delivery_day_param INTEGER,
    delivery_time_param TIME
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
STABLE
AS $func$
DECLARE
    next_date TIMESTAMPTZ;
    current_ts TIMESTAMPTZ := NOW();
BEGIN
    CASE frequency_param
        WHEN 'daily' THEN
            next_date := date_trunc('day', current_ts) + interval '1 day' + delivery_time_param;
        WHEN 'weekly' THEN
            next_date := date_trunc('week', current_ts) + 
                        (delivery_day_param - 1) * interval '1 day' + 
                        delivery_time_param;
            IF next_date <= current_ts THEN
                next_date := next_date + interval '1 week';
            END IF;
        WHEN 'monthly' THEN
            next_date := date_trunc('month', current_ts) + interval '1 month' + 
                        (delivery_day_param - 1) * interval '1 day' + 
                        delivery_time_param;
            IF next_date <= current_ts THEN
                next_date := date_trunc('month', current_ts) + interval '2 months' + 
                           (delivery_day_param - 1) * interval '1 day' + 
                           delivery_time_param;
            END IF;
        WHEN 'quarterly' THEN
            next_date := date_trunc('quarter', current_ts) + interval '3 months' + 
                        (delivery_day_param - 1) * interval '1 day' + 
                        delivery_time_param;
            IF next_date <= current_ts THEN
                next_date := date_trunc('quarter', current_ts) + interval '6 months' + 
                           (delivery_day_param - 1) * interval '1 day' + 
                           delivery_time_param;
            END IF;
        ELSE
            next_date := current_ts + interval '1 week';
    END CASE;
    
    RETURN next_date;
END;
$func$;

CREATE OR REPLACE FUNCTION public.update_report_schedule_next_generation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.next_generation_at := public.calculate_next_report_generation(
        NEW.frequency,
        NEW.delivery_day,
        NEW.delivery_time
    );
    RETURN NEW;
END;
$func$;

-- 7. Enable RLS
ALTER TABLE public.weekly_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_generation_jobs ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies (Pattern 2 - Simple User Ownership)
CREATE POLICY "users_manage_own_weekly_report_templates"
ON public.weekly_report_templates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_weekly_report_schedules"
ON public.weekly_report_schedules
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_report_generation_jobs"
ON public.report_generation_jobs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Triggers
CREATE TRIGGER update_weekly_report_templates_updated_at
    BEFORE UPDATE ON public.weekly_report_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_report_schedules_updated_at
    BEFORE UPDATE ON public.weekly_report_schedules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_next_generation_time
    BEFORE INSERT OR UPDATE ON public.weekly_report_schedules
    FOR EACH ROW EXECUTE FUNCTION public.update_report_schedule_next_generation();

-- 10. Mock Data using existing users
DO $$
DECLARE
    existing_user_id UUID;
    template1_id UUID := gen_random_uuid();
    template2_id UUID := gen_random_uuid();
    schedule1_id UUID := gen_random_uuid();
    job1_id UUID := gen_random_uuid();
    sample_doc_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample report templates
        INSERT INTO public.weekly_report_templates (id, user_id, template_name, template_type, template_config, branding_config, sections_config, chart_types, is_default)
        VALUES
            (template1_id, existing_user_id, 'Executive Summary Template', 'executive_summary'::public.report_template_type, 
             '{"includeLogo": true, "colorScheme": "professional", "layout": "modern"}'::jsonb,
             '{"logoUrl": "", "primaryColor": "#1e40af", "secondaryColor": "#f3f4f6"}'::jsonb,
             '{"sections": ["performance_overview", "key_metrics", "top_positions", "risk_summary"]}'::jsonb,
             '["line_chart", "pie_chart", "bar_chart"]'::jsonb, true),
            (template2_id, existing_user_id, 'Detailed Analysis Template', 'detailed_performance'::public.report_template_type,
             '{"includeLogo": true, "colorScheme": "detailed", "layout": "comprehensive"}'::jsonb,
             '{"logoUrl": "", "primaryColor": "#059669", "secondaryColor": "#ecfdf5"}'::jsonb,
             '{"sections": ["full_performance", "all_positions", "trade_history", "risk_analysis", "market_comparison"]}'::jsonb,
             '["line_chart", "candlestick_chart", "heat_map", "scatter_plot"]'::jsonb, false);

        -- Create sample report schedule
        INSERT INTO public.weekly_report_schedules (id, user_id, template_id, schedule_name, frequency, schedule_status, delivery_time, delivery_day, email_recipients, portfolio_filters, performance_periods)
        VALUES
            (schedule1_id, existing_user_id, template1_id, 'Weekly Executive Summary', 'weekly'::public.report_frequency, 'active'::public.report_status, 
             '09:00:00'::time, 1, '["admin@tradingai.com", "trader@tradingai.com"]'::jsonb,
             '{"includeAllPortfolios": true, "portfolioIds": []}'::jsonb,
             '["1w", "1m", "3m", "1y"]'::jsonb);

        -- Create sample generated document for reports
        INSERT INTO public.generated_documents (id, user_id, title, document_type, generation_status, file_path, mime_type, file_size, downloaded_count, parameters, generated_at)
        VALUES
            (sample_doc_id, existing_user_id, 'Weekly Trading Performance Report - 2025-09-23', 'portfolio_summary'::public.document_type, 'completed', 
             '/reports/weekly-2025-09-23.pdf', 'application/pdf', 1024000, 2, 
             '{"reportType": "weekly", "period": "2025-09-16_to_2025-09-23", "templateId": "' || template1_id || '"}'::jsonb,
             CURRENT_TIMESTAMP - interval '1 day');

        -- Create sample generation job
        INSERT INTO public.report_generation_jobs (id, user_id, schedule_id, document_id, job_status, started_at, completed_at, processing_time_seconds, generation_params)
        VALUES
            (job1_id, existing_user_id, schedule1_id, sample_doc_id, 'completed', 
             CURRENT_TIMESTAMP - interval '1 day', CURRENT_TIMESTAMP - interval '1 day' + interval '45 seconds', 45,
             '{"templateId": "' || template1_id || '", "portfoliosIncluded": 2, "tradesAnalyzed": 15}'::jsonb);

    ELSE
        RAISE NOTICE 'No existing users found. Please ensure user_profiles table has data for weekly PDF reports functionality.';
    END IF;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error in weekly reports mock data: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating weekly reports mock data: %', SQLERRM;
END $$;

-- 11. Cleanup function for test data
CREATE OR REPLACE FUNCTION public.cleanup_weekly_reports_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    DELETE FROM public.report_generation_jobs WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    DELETE FROM public.weekly_report_schedules WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    DELETE FROM public.weekly_report_templates WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    DELETE FROM public.generated_documents WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    ) AND document_type IN ('portfolio_summary', 'trade_report');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Weekly reports cleanup failed: %', SQLERRM;
END;
$func$;