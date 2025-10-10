-- Location: supabase/migrations/20251007162649_add_captains_log_decision_intelligence.sql
-- Schema Analysis: Existing deployment and decision tracking tables available
-- Integration Type: Addition of Captain's Log functionality for AI-Human decision collaboration
-- Dependencies: user_profiles table for foreign key relationships

-- Create the Captain's Log table for shared decision intelligence between humans and AI
CREATE TABLE public.captains_log (
    id BIGSERIAL PRIMARY KEY,
    ts TIMESTAMPTZ DEFAULT NOW(),
    author TEXT NOT NULL, -- 'Matthieu' or 'AAS_Sentinel' or other agents
    entry TEXT NOT NULL,
    tags TEXT[],
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_captains_log_author ON public.captains_log(author);
CREATE INDEX idx_captains_log_ts ON public.captains_log(ts);
CREATE INDEX idx_captains_log_user_id ON public.captains_log(user_id);
CREATE INDEX idx_captains_log_tags ON public.captains_log USING GIN(tags);

-- Enable RLS
ALTER TABLE public.captains_log ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER update_captains_log_updated_at
    BEFORE UPDATE ON public.captains_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_captains_log"
ON public.captains_log
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add some sample entries for the Captain's Log
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Get an existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Only insert if we have a user
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.captains_log (author, entry, tags, user_id) VALUES
            ('Matthieu', 'Activation du mode Freeze suite à une volatilité extrême sur le marché. Raison : prudence.', ARRAY['freeze', 'volatility', 'manual'], existing_user_id),
            ('AAS_Sentinel', 'Passage en mode SAFE. Raison : DHI du flux de données BTC/USD < 0.6. Activation du Kill Switch LIVE_TRADING.', ARRAY['safe_mode', 'dhi', 'kill_switch', 'automated'], existing_user_id),
            ('Matthieu', 'Déploiement canary activé à 0.1% de notional. Surveillance 24h commencée.', ARRAY['canary', 'deployment', 'go_live'], existing_user_id),
            ('AAS_Sentinel', 'Détection de dérive live vs paper > 5%. Investigation automatique lancée.', ARRAY['drift', 'performance', 'investigation'], existing_user_id),
            ('Matthieu', 'Extension progressive du canary à 2% du capital. Tous les indicateurs restent verts.', ARRAY['canary', 'expansion', 'performance'], existing_user_id);
    ELSE
        RAISE NOTICE 'No user profiles found. Captain log entries not created.';
    END IF;
END $$;