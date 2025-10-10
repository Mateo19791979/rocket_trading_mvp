-- Location: supabase/migrations/20251001174930_add_simple_providers_table.sql
-- Schema Analysis: Existing sophisticated provider system with external_api_configs, provider_failover_configs, provider_health_checks, google_sheets_configs
-- Integration Type: Addition - Adding simple providers table for specific user requirements
-- Dependencies: References existing user_profiles table

-- Create simple providers table as requested by user
CREATE TABLE IF NOT EXISTS public.providers (
    id TEXT PRIMARY KEY,
    finnhub_api TEXT,
    alpha_api TEXT,
    twelve_api TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration as requested
INSERT INTO public.providers (id, finnhub_api, alpha_api, twelve_api)
VALUES ('default', null, null, null)
ON CONFLICT (id) DO NOTHING;

-- Add index for performance
CREATE INDEX idx_providers_id ON public.providers(id);

-- Enable RLS for security
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Add RLS policy using Pattern 6A (auth metadata approach for admin access)
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

-- Admin access policy for providers table
CREATE POLICY "admin_full_access_providers"
ON public.providers
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Add public read access for the default configuration
CREATE POLICY "public_read_default_provider"
ON public.providers
FOR SELECT
TO public
USING (id = 'default');

-- Add update trigger
CREATE OR REPLACE FUNCTION public.update_providers_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_providers_updated_at
    BEFORE UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION public.update_providers_updated_at();

-- Add integration function to sync between providers and external_api_configs
CREATE OR REPLACE FUNCTION public.sync_providers_with_external_configs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update external_api_configs when providers table changes
    IF NEW.finnhub_api IS DISTINCT FROM OLD.finnhub_api THEN
        UPDATE public.external_api_configs 
        SET api_key_encrypted = NEW.finnhub_api, updated_at = CURRENT_TIMESTAMP
        WHERE api_name = 'finhub';
    END IF;
    
    IF NEW.alpha_api IS DISTINCT FROM OLD.alpha_api THEN
        UPDATE public.external_api_configs 
        SET api_key_encrypted = NEW.alpha_api, updated_at = CURRENT_TIMESTAMP
        WHERE api_name = 'alpha_vantage';
    END IF;
    
    IF NEW.twelve_api IS DISTINCT FROM OLD.twelve_api THEN
        UPDATE public.external_api_configs 
        SET api_key_encrypted = NEW.twelve_api, updated_at = CURRENT_TIMESTAMP
        WHERE api_name = 'twelve_data';
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add trigger to keep systems in sync
CREATE TRIGGER trigger_sync_providers_external
    AFTER UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION public.sync_providers_with_external_configs();

-- Add helper function for the user's specific use case
CREATE OR REPLACE FUNCTION public.get_provider_keys()
RETURNS TABLE(
    provider_name TEXT,
    api_key TEXT,
    last_updated TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    CASE 
        WHEN p.finnhub_api IS NOT NULL THEN 'finnhub'
        WHEN p.alpha_api IS NOT NULL THEN 'alpha_vantage' 
        WHEN p.twelve_api IS NOT NULL THEN 'twelve_data'
        ELSE 'none'
    END as provider_name,
    COALESCE(p.finnhub_api, p.alpha_api, p.twelve_api, 'not_configured') as api_key,
    p.updated_at as last_updated
FROM public.providers p
WHERE p.id = 'default';
$$;

-- Comment for documentation
COMMENT ON TABLE public.providers IS 'Simple provider configuration table for storing financial data provider API keys (Finnhub, Alpha Vantage, TwelveData)';
COMMENT ON COLUMN public.providers.id IS 'Provider configuration identifier, typically "default"';
COMMENT ON COLUMN public.providers.finnhub_api IS 'Finnhub API key for real-time financial data';
COMMENT ON COLUMN public.providers.alpha_api IS 'Alpha Vantage API key for stock market data';
COMMENT ON COLUMN public.providers.twelve_api IS 'TwelveData API key for global financial data';