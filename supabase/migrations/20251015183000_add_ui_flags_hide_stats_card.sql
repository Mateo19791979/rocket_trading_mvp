-- Location: supabase/migrations/20251015183000_add_ui_flags_hide_stats_card.sql
-- Schema Analysis: Adding UI flags system to avoid PGRST116 errors
-- Integration Type: Addition - New standalone table for UI configuration
-- Dependencies: None - Standalone feature flag system

-- Create trading schema if it doesn't exist (idempotent)
CREATE SCHEMA IF NOT EXISTS trading;
SET search_path TO trading, public;

-- Create UI flags table for frontend configuration control
CREATE TABLE IF NOT EXISTS trading.ui_flags (
    key TEXT PRIMARY KEY,
    value BOOLEAN NOT NULL DEFAULT false,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert the hide_stats_card flag with idempotent upsert
INSERT INTO trading.ui_flags (key, value, note) 
VALUES ('hide_stats_card', true, 'Masque la carte Statistiques pour éviter PGRST116')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    note = EXCLUDED.note,
    updated_at = CURRENT_TIMESTAMP;

-- Enable RLS for security
ALTER TABLE trading.ui_flags ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (UI flags can be read by anyone)
CREATE POLICY "public_can_read_ui_flags"
ON trading.ui_flags
FOR SELECT
TO public
USING (true);

-- Create policy for authenticated users to manage flags (optional admin control)
CREATE POLICY "authenticated_can_manage_ui_flags"
ON trading.ui_flags
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ui_flags_key ON trading.ui_flags(key);

-- Verify the flag was created
SELECT key, value, note FROM trading.ui_flags WHERE key = 'hide_stats_card';

-- Function to get UI flag value safely
CREATE OR REPLACE FUNCTION trading.get_ui_flag(flag_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(
    (SELECT value FROM trading.ui_flags WHERE key = flag_key LIMIT 1),
    true  -- Default to true (hide) if flag doesn't exist for safety
);
$$;

-- Function to set UI flag value (for admin control)
CREATE OR REPLACE FUNCTION trading.set_ui_flag(flag_key TEXT, flag_value BOOLEAN, flag_note TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO trading.ui_flags (key, value, note, updated_at)
    VALUES (flag_key, flag_value, flag_note, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        note = COALESCE(EXCLUDED.note, trading.ui_flags.note),
        updated_at = EXCLUDED.updated_at;
    
    RETURN flag_value;
END;
$$;

-- Add some example flags for future use
INSERT INTO trading.ui_flags (key, value, note) VALUES
    ('hide_advanced_features', false, 'Cache les fonctionnalités avancées en mode maintenance'),
    ('enable_debug_mode', false, 'Active les logs de debug dans l''interface'),
    ('maintenance_mode', false, 'Mode maintenance général de l''interface')
ON CONFLICT (key) DO NOTHING;

-- Create a view for easy flag access
CREATE OR REPLACE VIEW trading.v_ui_flags AS
SELECT 
    key,
    value,
    note,
    created_at,
    updated_at
FROM trading.ui_flags
ORDER BY key;

-- Grant permissions for the view
GRANT SELECT ON trading.v_ui_flags TO public, authenticated;