-- Location: supabase/migrations/20250101220000_configure_provided_api_keys.sql
-- Schema Analysis: Existing providers table with finnhub_api, alpha_api, twelve_api columns
-- Integration Type: modification/update - updating existing provider configuration
-- Dependencies: providers table (already exists)

-- Update the providers table with the actual API keys provided by the user
UPDATE public.providers
SET 
    finnhub_api = 'd3f8pdhr01qolknc612gd3f8pdhr01qolknc6130',
    alpha_api = 'ZQ0MOE2ZTN2AWY8J', 
    twelve_api = 'bbab9cf2ad5f4d42bd67e5792ab32d73',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'default';

-- Ensure the row exists, if not create it with the API keys
INSERT INTO public.providers (id, finnhub_api, alpha_api, twelve_api, updated_at)
VALUES ('default', 'd3f8pdhr01qolknc612gd3f8pdhr01qolknc6130', 'ZQ0MOE2ZTN2AWY8J', 'bbab9cf2ad5f4d42bd67e5792ab32d73', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    finnhub_api = EXCLUDED.finnhub_api,
    alpha_api = EXCLUDED.alpha_api,
    twelve_api = EXCLUDED.twelve_api,
    updated_at = EXCLUDED.updated_at;

-- Update external_api_configs table to ensure API configurations are consistent
-- Update Finnhub configuration
INSERT INTO public.external_api_configs (api_name, base_url, is_active, rate_limit_per_minute, total_calls_today)
VALUES ('finnhub', 'https://finnhub.io/api/v1', true, 60, 0)
ON CONFLICT (api_name) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    updated_at = CURRENT_TIMESTAMP;

-- Update Alpha Vantage configuration  
INSERT INTO public.external_api_configs (api_name, base_url, is_active, rate_limit_per_minute, total_calls_today)
VALUES ('alpha_vantage', 'https://www.alphavantage.co/query', true, 5, 0)
ON CONFLICT (api_name) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    updated_at = CURRENT_TIMESTAMP;

-- Update TwelveData configuration
INSERT INTO public.external_api_configs (api_name, base_url, is_active, rate_limit_per_minute, total_calls_today)
VALUES ('twelve_data', 'https://api.twelvedata.com', true, 800, 0)
ON CONFLICT (api_name) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    updated_at = CURRENT_TIMESTAMP;