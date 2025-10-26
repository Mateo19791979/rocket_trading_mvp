-- Location: supabase/migrations/20241211174500_add_dialogue_ia_communication_channel.sql
-- Schema Analysis: Adding dialogue system for tripartite communication
-- Integration Type: Addition to existing schema
-- Dependencies: Existing auth system and user_profiles table

-- 1. Create role enum for dialogue participants
CREATE TYPE public.dialogue_role AS ENUM ('human', 'orchestrator', 'core_ai', 'agent');

-- 2. Create table for persistent dialogue messages
CREATE TABLE public.orch_dialogues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.dialogue_role NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    channel TEXT NOT NULL DEFAULT 'tripartite',
    importance SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create indexes for efficient queries
CREATE INDEX idx_orch_dialogues_channel ON public.orch_dialogues(channel, created_at DESC);
CREATE INDEX idx_orch_dialogues_role ON public.orch_dialogues(role);
CREATE INDEX idx_orch_dialogues_importance ON public.orch_dialogues(importance);
CREATE INDEX idx_orch_dialogues_created_at ON public.orch_dialogues(created_at DESC);

-- 4. Create view for recent messages (72 hours)
CREATE OR REPLACE VIEW public.orch_dialogues_recent AS
SELECT * FROM public.orch_dialogues
WHERE created_at > NOW() - INTERVAL '72 hours'
ORDER BY created_at DESC;

-- 5. Enable RLS
ALTER TABLE public.orch_dialogues ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies using Pattern 4 (Public Read, Private Write)
-- Allow public read access to dialogue messages
CREATE POLICY "public_can_read_orch_dialogues"
ON public.orch_dialogues
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create messages
CREATE POLICY "authenticated_can_create_orch_dialogues"
ON public.orch_dialogues
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own messages (based on timing/metadata if needed)
CREATE POLICY "authenticated_can_update_orch_dialogues"
ON public.orch_dialogues
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Create function for automated message cleanup (optional)
CREATE OR REPLACE FUNCTION public.cleanup_old_dialogues()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    -- Clean up messages older than 30 days
    DELETE FROM public.orch_dialogues
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$func$;

-- 8. Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_orch_dialogues_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$func$;

CREATE TRIGGER trigger_update_orch_dialogues_updated_at
    BEFORE UPDATE ON public.orch_dialogues
    FOR EACH ROW
    EXECUTE FUNCTION public.update_orch_dialogues_updated_at();

-- 9. Insert initial seed data for demonstration
DO $$
BEGIN
    INSERT INTO public.orch_dialogues(role, message, channel, importance) VALUES
        ('human', 'Démarrage du canal tripartite. Confirmez la réception.', 'tripartite', 1),
        ('orchestrator', 'Réception confirmée. Orchestrateur en ligne.', 'tripartite', 1),
        ('core_ai', '🧠 AAS opérationnelle. Surveillance et apprentissage activés.', 'tripartite', 2),
        ('agent', 'Agent Momentum-EU prêt. En attente de fenêtre de marché.', 'europe', 1),
        ('human', 'Statut des agents Alpha et Beta ?', 'tripartite', 1),
        ('orchestrator', 'Alpha Momentum Pro: 68.5% win rate, Beta Arbitrage Elite: 72.3% win rate', 'tripartite', 2),
        ('core_ai', '📊 Analyse: Performance optimale détectée. Recommandation: augmenter allocation.', 'tripartite', 2),
        ('agent', 'Delta Scalping Bot: Détection d''opportunité scalping TSLA - Exécution imminente', 'us', 1);
END $$;

-- 10. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.orch_dialogues TO authenticated;
GRANT SELECT ON public.orch_dialogues_recent TO public;