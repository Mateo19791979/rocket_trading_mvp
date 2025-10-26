-- Location: supabase/migrations/20251015180500_add_feature_flags_provider_control_system.sql
-- Schema Analysis: Adding Feature Flags and Provider Control tables to existing Trading MVP
-- Integration Type: Addition of configuration management system
-- Dependencies: Existing auth.users system for user management

-- 1. Custom types for feature flags system
CREATE TYPE public.flag_type AS ENUM ('boolean', 'string', 'number', 'json');
CREATE TYPE public.provider_status AS ENUM ('active', 'inactive', 'degraded', 'maintenance');

-- 2. Core tables
-- Feature flags table for dynamic configuration
CREATE TABLE public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    flag_type public.flag_type DEFAULT 'boolean'::public.flag_type,
    value TEXT NOT NULL DEFAULT 'false',
    description TEXT,
    environment TEXT DEFAULT 'production',
    is_active BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Provider toggles table for service management
CREATE TABLE public.provider_toggles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT true,
    status public.provider_status DEFAULT 'active'::public.provider_status,
    priority INTEGER DEFAULT 50,
    health_score DECIMAL(3,2) DEFAULT 1.0 CHECK (health_score >= 0 AND health_score <= 1),
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    circuit_breaker_open BOOLEAN DEFAULT false,
    circuit_breaker_opens_at TIMESTAMPTZ,
    last_health_check TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential indexes for performance
CREATE INDEX idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX idx_feature_flags_active ON public.feature_flags(is_active);
CREATE INDEX idx_feature_flags_environment ON public.feature_flags(environment);
CREATE INDEX idx_feature_flags_expires ON public.feature_flags(expires_at);
CREATE INDEX idx_provider_toggles_name ON public.provider_toggles(provider_name);
CREATE INDEX idx_provider_toggles_status ON public.provider_toggles(status);
CREATE INDEX idx_provider_toggles_enabled ON public.provider_toggles(enabled);
CREATE INDEX idx_provider_toggles_priority ON public.provider_toggles(priority);

-- 4. Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_feature_flags_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.update_provider_toggles_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

-- 5. Enable RLS for secure access
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_toggles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies using Pattern 6 - Role-based access (auth metadata)
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

-- Feature flags policies
CREATE POLICY "admins_manage_feature_flags"
ON public.feature_flags
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "authenticated_read_feature_flags"
ON public.feature_flags
FOR SELECT
TO authenticated
USING (true);

-- Provider toggles policies
CREATE POLICY "admins_manage_provider_toggles"
ON public.provider_toggles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "authenticated_read_provider_toggles"
ON public.provider_toggles
FOR SELECT
TO authenticated
USING (true);

-- 7. Triggers for automatic timestamp updates
CREATE TRIGGER update_feature_flags_timestamp
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_feature_flags_timestamp();

CREATE TRIGGER update_provider_toggles_timestamp
    BEFORE UPDATE ON public.provider_toggles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_provider_toggles_timestamp();

-- 8. Mock data for immediate functionality
DO $$
BEGIN
    -- Sample feature flags
    INSERT INTO public.feature_flags (key, flag_type, value, description, is_active) VALUES
        ('maintenance_mode', 'boolean', 'false', 'System maintenance mode flag', true),
        ('ai_trading_enabled', 'boolean', 'true', 'Enable AI trading features', true),
        ('max_daily_trades', 'number', '100', 'Maximum daily trades allowed', true),
        ('trading_hours', 'json', '{"start": "09:30", "end": "16:00"}', 'Trading hours configuration', true),
        ('debug_mode', 'boolean', 'false', 'Enable debug logging', false),
        ('paper_trading_only', 'boolean', 'true', 'Force paper trading mode', true);

    -- Sample provider toggles
    INSERT INTO public.provider_toggles (
        provider_name, enabled, status, priority, health_score, 
        success_count, error_count, notes
    ) VALUES
        ('polygon', true, 'active', 90, 0.98, 1250, 25, 'Primary market data provider'),
        ('alpha_vantage', true, 'active', 80, 0.95, 890, 45, 'Secondary market data provider'),
        ('finnhub', false, 'maintenance', 70, 0.92, 567, 38, 'Under maintenance - circuit breaker open'),
        ('yahoo_finance', true, 'degraded', 60, 0.85, 445, 78, 'Experiencing intermittent issues'),
        ('ibkr_gateway', true, 'active', 100, 0.99, 2340, 12, 'Primary trading execution gateway'),
        ('openai_gpt4', true, 'active', 85, 0.97, 678, 21, 'AI analysis and decision making'),
        ('anthropic_claude', false, 'inactive', 75, 0.94, 234, 15, 'Backup AI provider - disabled'),
        ('redis_cache', true, 'active', 95, 1.0, 5678, 0, 'Redis caching layer');

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Sample data already exists, skipping insertion';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;

-- 9. Helper functions for common operations
CREATE OR REPLACE FUNCTION public.get_active_feature_flags()
RETURNS TABLE (
    key TEXT,
    value TEXT,
    flag_type TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    ff.key, 
    ff.value, 
    ff.flag_type::TEXT
FROM public.feature_flags ff
WHERE ff.is_active = true
AND (ff.expires_at IS NULL OR ff.expires_at > CURRENT_TIMESTAMP);
$$;

CREATE OR REPLACE FUNCTION public.get_healthy_providers()
RETURNS TABLE (
    provider_name TEXT,
    priority INTEGER,
    health_score DECIMAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    pt.provider_name,
    pt.priority,
    pt.health_score
FROM public.provider_toggles pt
WHERE pt.enabled = true 
AND pt.status = 'active'
AND pt.circuit_breaker_open = false
AND pt.health_score >= 0.8
ORDER BY pt.priority DESC, pt.health_score DESC;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_active_feature_flags() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_healthy_providers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_from_auth() TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.feature_flags IS 'Dynamic feature flags for runtime configuration control';
COMMENT ON TABLE public.provider_toggles IS 'Provider service toggles and health monitoring';
COMMENT ON FUNCTION public.get_active_feature_flags() IS 'Returns all active feature flags';
COMMENT ON FUNCTION public.get_healthy_providers() IS 'Returns healthy providers sorted by priority';