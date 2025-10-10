-- Location: supabase/migrations/20251007162649_add_captains_log_table.sql
-- Schema Analysis: Existing comprehensive health monitoring infrastructure
-- Integration Type: Addition - Adding Captain's Log functionality
-- Dependencies: user_profiles (existing)

-- Create Captain's Log table as requested in user requirements
-- This table stores decisions made by both humans and AI agents
CREATE TABLE public.captains_log (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ DEFAULT NOW(),
    author TEXT NOT NULL, -- 'Matthieu' or 'AAS_Sentinel' or user name
    entry TEXT NOT NULL,
    tags TEXT[],
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for efficient querying
CREATE INDEX idx_captains_log_ts ON public.captains_log(ts);
CREATE INDEX idx_captains_log_author ON public.captains_log(author);
CREATE INDEX idx_captains_log_user_id ON public.captains_log(user_id);
CREATE INDEX idx_captains_log_tags ON public.captains_log USING GIN(tags);

-- Enable RLS
ALTER TABLE public.captains_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own logs and view system logs
CREATE POLICY "users_manage_own_captains_log"
ON public.captains_log
FOR ALL
TO authenticated
USING (user_id = auth.uid() OR author = 'AAS_Sentinel')
WITH CHECK (user_id = auth.uid());

-- Allow admins full access
CREATE POLICY "admin_full_access_captains_log"
ON public.captains_log
FOR ALL
TO authenticated
USING (is_admin_from_auth())
WITH CHECK (is_admin_from_auth());

-- Add trigger for updated_at
CREATE TRIGGER update_captains_log_updated_at
BEFORE UPDATE ON public.captains_log
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Mock data for Captain's Log
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Get existing user ID
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.captains_log (author, entry, tags, user_id)
        VALUES
            ('Matthieu', 'Activation du mode Freeze suite à une volatilité extrême sur le marché. Raison : prudence.', ARRAY['freeze', 'manual', 'risk_management'], existing_user_id),
            ('AAS_Sentinel', 'Passage en mode SAFE. Raison : DHI du flux de données BTC/USD < 0.6. Activation du Kill Switch LIVE_TRADING.', ARRAY['auto', 'kill_switch', 'data_health'], existing_user_id),
            ('Matthieu', 'Unfreeze du système canary après validation des métriques. Retour à la normale.', ARRAY['unfreeze', 'manual', 'canary'], existing_user_id),
            ('AAS_Sentinel', 'Détection d''anomalie sur les données de marché EURUSD. Passage automatique en shadow mode.', ARRAY['auto', 'anomaly', 'shadow_mode'], existing_user_id);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating Captain''s Log mock data: %', SQLERRM;
END $$;