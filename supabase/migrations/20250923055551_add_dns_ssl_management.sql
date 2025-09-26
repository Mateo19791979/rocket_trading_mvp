-- Location: supabase/migrations/20250923055551_add_dns_ssl_management.sql
-- Schema Analysis: Existing trading platform with user_profiles, comprehensive trading tables
-- Integration Type: NEW MODULE - DNS & SSL Management for Trading Platform
-- Dependencies: References existing user_profiles table

-- 1. Types (New DNS & SSL related enums)
CREATE TYPE public.dns_record_type AS ENUM ('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'PTR', 'NS');
CREATE TYPE public.ssl_certificate_type AS ENUM ('lets_encrypt', 'self_signed', 'ca_signed', 'wildcard', 'extended_validation');
CREATE TYPE public.domain_status AS ENUM ('active', 'inactive', 'pending_verification', 'suspended', 'expired');
CREATE TYPE public.ssl_certificate_status AS ENUM ('valid', 'expired', 'expiring_soon', 'revoked', 'pending');
CREATE TYPE public.dns_provider AS ENUM ('cloudflare', 'route53', 'godaddy', 'namecheap', 'google_domains', 'custom');

-- 2. Core Tables for DNS & SSL Management

-- Domain Management Table
CREATE TABLE public.domain_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    domain_name TEXT NOT NULL,
    status public.domain_status DEFAULT 'pending_verification'::public.domain_status,
    dns_provider public.dns_provider DEFAULT 'cloudflare'::public.dns_provider,
    provider_api_key_encrypted TEXT,
    provider_zone_id TEXT,
    is_primary BOOLEAN DEFAULT false,
    whois_protection BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    verification_token TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- DNS Records Management Table
CREATE TABLE public.dns_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domain_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    record_type public.dns_record_type NOT NULL,
    record_name TEXT NOT NULL,
    record_value TEXT NOT NULL,
    ttl INTEGER DEFAULT 300,
    priority INTEGER DEFAULT 0,
    weight INTEGER DEFAULT 0,
    port INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_proxied BOOLEAN DEFAULT false,
    last_modified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    provider_record_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SSL Certificate Management Table  
CREATE TABLE public.ssl_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domain_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    certificate_type public.ssl_certificate_type DEFAULT 'lets_encrypt'::public.ssl_certificate_type,
    status public.ssl_certificate_status DEFAULT 'pending'::public.ssl_certificate_status,
    common_name TEXT NOT NULL,
    subject_alternative_names TEXT[],
    issuer TEXT,
    serial_number TEXT,
    fingerprint TEXT,
    certificate_pem TEXT,
    private_key_encrypted TEXT,
    certificate_chain_pem TEXT,
    issued_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    renewal_threshold_days INTEGER DEFAULT 30,
    last_renewal_attempt_at TIMESTAMPTZ,
    renewal_error TEXT,
    validation_method TEXT DEFAULT 'dns',
    acme_challenge_token TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- DNS Health Monitoring Table
CREATE TABLE public.dns_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID REFERENCES public.domain_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL, -- 'dns_resolution', 'ssl_expiry', 'uptime', 'response_time'
    check_url TEXT NOT NULL,
    expected_result TEXT,
    actual_result TEXT,
    is_healthy BOOLEAN DEFAULT true,
    response_time_ms INTEGER,
    error_message TEXT,
    check_interval_minutes INTEGER DEFAULT 60,
    next_check_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_checked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    consecutive_failures INTEGER DEFAULT 0,
    max_consecutive_failures INTEGER DEFAULT 3,
    alert_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- SSL Security Scan Results Table
CREATE TABLE public.ssl_security_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ssl_certificate_id UUID REFERENCES public.ssl_certificates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    scan_type TEXT NOT NULL, -- 'ssllabs', 'security_headers', 'cipher_suites'
    overall_grade TEXT,
    scan_results JSONB DEFAULT '{}'::JSONB,
    vulnerabilities JSONB DEFAULT '[]'::JSONB,
    recommendations JSONB DEFAULT '[]'::JSONB,
    scan_score INTEGER,
    max_score INTEGER DEFAULT 100,
    has_critical_issues BOOLEAN DEFAULT false,
    scan_duration_seconds INTEGER,
    scan_url TEXT,
    scanned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes for Performance
CREATE INDEX idx_domain_configs_user_id ON public.domain_configs(user_id);
CREATE INDEX idx_domain_configs_domain_name ON public.domain_configs(domain_name);
CREATE INDEX idx_domain_configs_status ON public.domain_configs(status);
CREATE INDEX idx_domain_configs_expires_at ON public.domain_configs(expires_at);

CREATE INDEX idx_dns_records_domain_id ON public.dns_records(domain_id);
CREATE INDEX idx_dns_records_user_id ON public.dns_records(user_id);
CREATE INDEX idx_dns_records_record_type ON public.dns_records(record_type);
CREATE INDEX idx_dns_records_is_active ON public.dns_records(is_active);

CREATE INDEX idx_ssl_certificates_domain_id ON public.ssl_certificates(domain_id);
CREATE INDEX idx_ssl_certificates_user_id ON public.ssl_certificates(user_id);
CREATE INDEX idx_ssl_certificates_status ON public.ssl_certificates(status);
CREATE INDEX idx_ssl_certificates_expires_at ON public.ssl_certificates(expires_at);

CREATE INDEX idx_dns_health_checks_domain_id ON public.dns_health_checks(domain_id);
CREATE INDEX idx_dns_health_checks_next_check_at ON public.dns_health_checks(next_check_at);
CREATE INDEX idx_dns_health_checks_is_healthy ON public.dns_health_checks(is_healthy);

CREATE INDEX idx_ssl_security_scans_ssl_certificate_id ON public.ssl_security_scans(ssl_certificate_id);
CREATE INDEX idx_ssl_security_scans_has_critical_issues ON public.ssl_security_scans(has_critical_issues);

-- 4. Helper Functions (BEFORE RLS policies)

-- Function to check if user has admin role for DNS management
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND up.role = 'admin'
)
$$;

-- Function to validate domain ownership
CREATE OR REPLACE FUNCTION public.verify_domain_ownership(domain_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.domain_configs dc
    WHERE dc.id = domain_uuid 
    AND dc.user_id = auth.uid()
    AND dc.status IN ('active', 'pending_verification')
)
$$;

-- Function to check SSL certificate expiry
CREATE OR REPLACE FUNCTION public.check_ssl_expiry_soon(cert_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.ssl_certificates sc
    WHERE sc.id = cert_uuid
    AND sc.expires_at <= (CURRENT_TIMESTAMP + INTERVAL '30 days')
    AND sc.status = 'valid'
)
$$;

-- Function to get domain security score
CREATE OR REPLACE FUNCTION public.calculate_domain_security_score(domain_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    (
        SELECT AVG(sss.scan_score)::INTEGER
        FROM public.ssl_certificates sc
        JOIN public.ssl_security_scans sss ON sc.id = sss.ssl_certificate_id
        WHERE sc.domain_id = domain_uuid
        AND sss.scanned_at >= (CURRENT_TIMESTAMP - INTERVAL '7 days')
    ), 
    0
)
$$;

-- 5. Enable Row Level Security
ALTER TABLE public.domain_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssl_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ssl_security_scans ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Using Pattern 2 - Simple User Ownership)

-- Domain Configs Policies
CREATE POLICY "users_manage_own_domain_configs"
ON public.domain_configs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DNS Records Policies
CREATE POLICY "users_manage_own_dns_records"
ON public.dns_records
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- SSL Certificates Policies
CREATE POLICY "users_manage_own_ssl_certificates"
ON public.ssl_certificates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DNS Health Checks Policies
CREATE POLICY "users_manage_own_dns_health_checks"
ON public.dns_health_checks
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- SSL Security Scans Policies
CREATE POLICY "users_manage_own_ssl_security_scans"
ON public.ssl_security_scans
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin policies for monitoring and system management (Pattern 6B)
CREATE POLICY "admin_can_view_all_domain_configs"
ON public.domain_configs
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "admin_can_view_all_dns_health_checks"
ON public.dns_health_checks
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- 7. Triggers for Updated At timestamps
CREATE TRIGGER update_domain_configs_updated_at
    BEFORE UPDATE ON public.domain_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dns_records_updated_at
    BEFORE UPDATE ON public.dns_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ssl_certificates_updated_at
    BEFORE UPDATE ON public.ssl_certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dns_health_checks_updated_at
    BEFORE UPDATE ON public.dns_health_checks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ssl_security_scans_updated_at
    BEFORE UPDATE ON public.ssl_security_scans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Sample Mock Data for Testing
DO $$
DECLARE
    admin_user_id UUID;
    trader_user_id UUID;
    trading_domain_id UUID := gen_random_uuid();
    api_domain_id UUID := gen_random_uuid();
    main_cert_id UUID := gen_random_uuid();
    api_cert_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE email = 'admin@tradingai.com' LIMIT 1;
    SELECT id INTO trader_user_id FROM public.user_profiles WHERE email = 'trader@tradingai.com' LIMIT 1;

    -- Only proceed if users exist
    IF admin_user_id IS NOT NULL AND trader_user_id IS NOT NULL THEN
        -- Insert domain configurations
        INSERT INTO public.domain_configs (
            id, user_id, domain_name, status, dns_provider, 
            is_primary, whois_protection, auto_renew, 
            expires_at, last_verified_at
        ) VALUES
            (trading_domain_id, admin_user_id, 'trading.mvp.com', 'active', 'cloudflare', 
             true, true, true, 
             CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP),
            (api_domain_id, admin_user_id, 'api.trading.mvp.com', 'active', 'cloudflare', 
             false, true, true, 
             CURRENT_TIMESTAMP + INTERVAL '365 days', CURRENT_TIMESTAMP);

        -- Insert DNS records
        INSERT INTO public.dns_records (
            domain_id, user_id, record_type, record_name, record_value, ttl, is_active
        ) VALUES
            (trading_domain_id, admin_user_id, 'A', '@', '104.198.14.52', 300, true),
            (trading_domain_id, admin_user_id, 'CNAME', 'www', 'trading.mvp.com', 300, true),
            (trading_domain_id, admin_user_id, 'TXT', '@', 'v=spf1 -all', 3600, true),
            (trading_domain_id, admin_user_id, 'TXT', '_dmarc', 'v=DMARC1; p=reject;', 3600, true),
            (api_domain_id, admin_user_id, 'CNAME', '@', 'your-api-server.herokuapp.com', 300, true);

        -- Insert SSL certificates
        INSERT INTO public.ssl_certificates (
            id, domain_id, user_id, certificate_type, status, common_name,
            subject_alternative_names, issuer, issued_at, expires_at, auto_renew
        ) VALUES
            (main_cert_id, trading_domain_id, admin_user_id, 'lets_encrypt', 'valid', 'trading.mvp.com',
             ARRAY['www.trading.mvp.com', 'trading.mvp.com'], 'Let''s Encrypt Authority',
             CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP + INTERVAL '60 days', true),
            (api_cert_id, api_domain_id, admin_user_id, 'lets_encrypt', 'valid', 'api.trading.mvp.com',
             ARRAY['api.trading.mvp.com'], 'Let''s Encrypt Authority',
             CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP + INTERVAL '70 days', true);

        -- Insert health checks
        INSERT INTO public.dns_health_checks (
            domain_id, user_id, check_type, check_url, expected_result, 
            is_healthy, response_time_ms, check_interval_minutes
        ) VALUES
            (trading_domain_id, admin_user_id, 'dns_resolution', 'trading.mvp.com', '104.198.14.52', 
             true, 45, 60),
            (trading_domain_id, admin_user_id, 'ssl_expiry', 'https://trading.mvp.com', 'valid', 
             true, 120, 1440), -- Check daily
            (api_domain_id, admin_user_id, 'uptime', 'https://api.trading.mvp.com/health', '200', 
             true, 89, 15); -- Check every 15 minutes

        -- Insert security scans
        INSERT INTO public.ssl_security_scans (
            ssl_certificate_id, user_id, scan_type, overall_grade, scan_results,
            scan_score, has_critical_issues
        ) VALUES
            (main_cert_id, admin_user_id, 'ssllabs', 'A+', 
             '{"protocol_support": "TLS 1.2, TLS 1.3", "cipher_strength": "strong", "key_exchange": "ECDHE"}'::JSONB,
             95, false),
            (api_cert_id, admin_user_id, 'security_headers', 'A', 
             '{"hsts": true, "csp": true, "x_frame_options": "DENY"}'::JSONB,
             88, false);

    ELSE
        RAISE NOTICE 'Required users not found. Skipping DNS & SSL mock data insertion.';
    END IF;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint error in DNS SSL data: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error in DNS SSL data: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating DNS SSL mock data: %', SQLERRM;
END $$;

-- 9. Cleanup function for testing
CREATE OR REPLACE FUNCTION public.cleanup_dns_ssl_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $cleanup$
BEGIN
    -- Delete in dependency order
    DELETE FROM public.ssl_security_scans WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    
    DELETE FROM public.dns_health_checks WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    
    DELETE FROM public.ssl_certificates WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    
    DELETE FROM public.dns_records WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    
    DELETE FROM public.domain_configs WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );

    RAISE NOTICE 'DNS & SSL test data cleanup completed';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during DNS SSL cleanup: %', SQLERRM;
END;
$cleanup$;