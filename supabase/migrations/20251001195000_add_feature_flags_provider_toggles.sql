-- Location: supabase/migrations/20251001195000_add_feature_flags_provider_toggles.sql
-- Schema Analysis: Existing provider tables (providers, external_api_configs, provider_security_status, provider_failover_configs)
-- Integration Type: Addition - Add missing tables for feature flags and provider toggle functionality
-- Dependencies: user_profiles table (referenced in foreign keys)

-- 1. Custom Types (ENUMs)
CREATE TYPE public.feature_flag_type AS ENUM ('boolean', 'string', 'number', 'json');
CREATE TYPE public.feature_flag_environment AS ENUM ('development', 'staging', 'production', 'all');

-- 2. Core Tables

-- Feature Flags Table
CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    flag_type public.feature_flag_type DEFAULT 'boolean'::public.feature_flag_type,
    value TEXT NOT NULL DEFAULT 'false',
    description TEXT,
    environment public.feature_flag_environment DEFAULT 'all'::public.feature_flag_environment,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Provider Toggles Table
CREATE TABLE public.provider_toggles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 10,
    status public.provider_status DEFAULT 'active'::public.provider_status,
    health_score DECIMAL(3,2) DEFAULT 1.0,
    circuit_breaker_open BOOLEAN DEFAULT false,
    circuit_breaker_opens_at TIMESTAMPTZ,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_health_check TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX idx_feature_flags_is_active ON public.feature_flags(is_active);
CREATE INDEX idx_feature_flags_environment ON public.feature_flags(environment);
CREATE INDEX idx_feature_flags_created_by ON public.feature_flags(created_by);
CREATE INDEX idx_feature_flags_expires_at ON public.feature_flags(expires_at);

CREATE INDEX idx_provider_toggles_provider_name ON public.provider_toggles(provider_name);
CREATE INDEX idx_provider_toggles_enabled ON public.provider_toggles(enabled);
CREATE INDEX idx_provider_toggles_priority ON public.provider_toggles(priority);
CREATE INDEX idx_provider_toggles_status ON public.provider_toggles(status);
CREATE INDEX idx_provider_toggles_circuit_breaker_open ON public.provider_toggles(circuit_breaker_open);

-- 4. Helper Functions (MUST BE BEFORE RLS POLICIES)
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

-- 5. Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_toggles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Feature Flags RLS Policies
CREATE POLICY "users_manage_own_feature_flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "admin_full_access_feature_flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "public_can_read_active_feature_flags"
ON public.feature_flags
FOR SELECT
TO public
USING (is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP));

-- Provider Toggles RLS Policies
CREATE POLICY "admin_full_access_provider_toggles"
ON public.provider_toggles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "authenticated_can_read_provider_toggles"
ON public.provider_toggles
FOR SELECT
TO authenticated
USING (true);

-- 7. Triggers for auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_provider_toggles_updated_at
    BEFORE UPDATE ON public.provider_toggles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Mock Data for Testing
DO $$
DECLARE
    admin_user_id UUID;
    regular_user_id UUID;
BEGIN
    -- Get existing user IDs from user_profiles (don't create new auth users)
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE email LIKE '%admin%' LIMIT 1;
    SELECT id INTO regular_user_id FROM public.user_profiles WHERE email NOT LIKE '%admin%' LIMIT 1;

    -- If no users found, get any existing user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM public.user_profiles LIMIT 1;
    END IF;
    
    IF regular_user_id IS NULL AND admin_user_id IS NOT NULL THEN
        regular_user_id := admin_user_id;
    END IF;

    -- Only add mock data if users exist
    IF admin_user_id IS NOT NULL THEN
        -- Feature Flags Mock Data
        INSERT INTO public.feature_flags (key, flag_type, value, description, environment, is_active, created_by)
        VALUES
            ('trading_enabled', 'boolean', 'true', 'Enable trading functionality for all users', 'production', true, admin_user_id),
            ('max_positions', 'number', '50', 'Maximum number of positions per user', 'production', true, admin_user_id),
            ('experimental_ui', 'boolean', 'false', 'Show experimental UI features', 'development', false, admin_user_id),
            ('api_version', 'string', 'v2', 'Current API version to use', 'all', true, admin_user_id),
            ('maintenance_mode', 'boolean', 'false', 'System maintenance mode', 'all', false, admin_user_id);

        -- Provider Toggles Mock Data
        INSERT INTO public.provider_toggles (provider_name, enabled, priority, status, health_score, success_count, error_count, notes)
        VALUES
            ('finnhub', true, 90, 'active', 0.98, 1250, 25, 'Primary market data provider - high reliability'),
            ('alpha_vantage', true, 80, 'active', 0.95, 890, 45, 'Secondary provider - good for fundamental data'),
            ('twelve_data', true, 70, 'active', 0.92, 670, 58, 'Tertiary provider - backup for real-time quotes'),
            ('yahoo_finance', false, 60, 'inactive', 0.85, 456, 89, 'Legacy provider - temporarily disabled'),
            ('google_sheets_fallback', true, 10, 'maintenance', 0.75, 23, 7, 'Emergency fallback using Google Sheets');
        
        RAISE NOTICE 'Mock data created successfully with user_id: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No existing users found. Create user_profiles first to add feature flags and provider toggles mock data.';
    END IF;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error while creating mock data: %', SQLERRM;
END $$;

-- 9. Cleanup Function (Optional - for testing)
CREATE OR REPLACE FUNCTION public.cleanup_feature_flags_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete mock data (preserves real data by targeting specific test patterns)
    DELETE FROM public.feature_flags 
    WHERE key IN ('trading_enabled', 'max_positions', 'experimental_ui', 'api_version', 'maintenance_mode');
    
    DELETE FROM public.provider_toggles 
    WHERE provider_name IN ('finnhub', 'alpha_vantage', 'twelve_data', 'yahoo_finance', 'google_sheets_fallback');
    
    RAISE NOTICE 'Test data cleanup completed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END $$;