-- Location: supabase/migrations/20251211183000_fix_ibkr_missing_last_heartbeat_column.sql
-- Schema Analysis: Extending existing ibkr_connections table with missing last_heartbeat column
-- Integration Type: MODIFICATIVE - Adding missing column to existing table
-- Dependencies: ibkr_connections table (created in 20250922145749_add_ibkr_integration.sql)

-- Fix missing last_heartbeat column in ibkr_connections table
-- The application queries are expecting this column but it doesn't exist in the schema
ALTER TABLE public.ibkr_connections 
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ;

-- Add index for the new column to improve query performance
CREATE INDEX IF NOT EXISTS idx_ibkr_connections_last_heartbeat 
ON public.ibkr_connections(last_heartbeat);

-- Update the existing function to handle last_heartbeat as well
CREATE OR REPLACE FUNCTION public.update_ibkr_connection_status(
    connection_uuid UUID,
    new_status public.connection_status,
    error_message TEXT DEFAULT NULL,
    latency_value INTEGER DEFAULT NULL,
    heartbeat_timestamp TIMESTAMPTZ DEFAULT NULL
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
        last_heartbeat = COALESCE(heartbeat_timestamp, 
            CASE 
                WHEN new_status = 'connected'::public.connection_status THEN CURRENT_TIMESTAMP
                ELSE last_heartbeat
            END
        ),
        latency_ms = COALESCE(latency_value, latency_ms),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = connection_uuid;
END;
$func$;

-- Update existing records to have a reasonable last_heartbeat value
-- Set last_heartbeat to last_connected_at for existing connected connections
UPDATE public.ibkr_connections 
SET last_heartbeat = last_connected_at 
WHERE connection_status = 'connected'::public.connection_status 
  AND last_connected_at IS NOT NULL
  AND last_heartbeat IS NULL;