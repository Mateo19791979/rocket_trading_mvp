-- Location: supabase/migrations/20250922145749_add_ibkr_integration.sql
-- Schema Analysis: Extending existing trading infrastructure for IBKR integration
-- Integration Type: PARTIAL_EXISTS - Extending existing external_api_configs, user_profiles, and system_health
-- Dependencies: external_api_configs, user_profiles, system_health

-- Create IBKR-specific ENUMs
CREATE TYPE public.trading_mode AS ENUM ('paper', 'live');
CREATE TYPE public.connection_status AS ENUM ('disconnected', 'connecting', 'connected', 'error', 'timeout');

-- Create IBKR connections tracking table
CREATE TABLE public.ibkr_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    trading_mode public.trading_mode NOT NULL DEFAULT 'paper'::public.trading_mode,
    connection_status public.connection_status NOT NULL DEFAULT 'disconnected'::public.connection_status,
    host TEXT NOT NULL DEFAULT '127.0.0.1',
    port INTEGER NOT NULL, -- 7497 for paper, 7496 for live
    client_id INTEGER NOT NULL,
    last_connected_at TIMESTAMPTZ,
    last_error TEXT,
    latency_ms INTEGER,
    connection_settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for IBKR connections
CREATE INDEX idx_ibkr_connections_user_id ON public.ibkr_connections(user_id);
CREATE INDEX idx_ibkr_connections_status ON public.ibkr_connections(connection_status);
CREATE INDEX idx_ibkr_connections_active ON public.ibkr_connections(is_active);

-- Enable RLS
ALTER TABLE public.ibkr_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policy for IBKR connections (Pattern 2: Simple User Ownership)
CREATE POLICY "users_manage_own_ibkr_connections"
ON public.ibkr_connections
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to update IBKR connection status
CREATE OR REPLACE FUNCTION public.update_ibkr_connection_status(
    connection_uuid UUID,
    new_status public.connection_status,
    error_message TEXT DEFAULT NULL,
    latency_value INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    UPDATE public.ibkr_connections
    SET 
        connection_status = new_status,
        last_error = CASE 
            WHEN new_status = 'error'::public.connection_status THEN error_message
            ELSE NULL
        END,
        last_connected_at = CASE 
            WHEN new_status = 'connected'::public.connection_status THEN CURRENT_TIMESTAMP
            ELSE last_connected_at
        END,
        latency_ms = COALESCE(latency_value, latency_ms),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = connection_uuid;
END;
$func$;

-- Insert IBKR API configuration into existing external_api_configs
INSERT INTO public.external_api_configs (
    api_name,
    base_url,
    is_active,
    rate_limit_per_minute
) VALUES 
(
    'ibkr_gateway_paper',
    'http://127.0.0.1:7497',
    true,
    300
),
(
    'ibkr_gateway_live',
    'http://127.0.0.1:7496',
    false,
    300
) ON CONFLICT (api_name) DO UPDATE SET
    base_url = EXCLUDED.base_url,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    updated_at = CURRENT_TIMESTAMP;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

CREATE TRIGGER update_ibkr_connections_updated_at
    BEFORE UPDATE ON public.ibkr_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Mock data for testing IBKR connections
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Create mock IBKR connection if user exists
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.ibkr_connections (
            user_id,
            trading_mode,
            connection_status,
            host,
            port,
            client_id,
            connection_settings
        ) VALUES (
            existing_user_id,
            'paper'::public.trading_mode,
            'disconnected'::public.connection_status,
            '127.0.0.1',
            7497,
            42,
            '{"auto_connect": false, "timeout_seconds": 10, "retry_attempts": 3}'::jsonb
        );
    ELSE
        RAISE NOTICE 'No existing users found. Create users first to test IBKR connections.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock IBKR connection data: %', SQLERRM;
END $$;