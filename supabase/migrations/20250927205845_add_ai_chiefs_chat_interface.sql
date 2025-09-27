-- Location: supabase/migrations/20250927205845_add_ai_chiefs_chat_interface.sql
-- Schema Analysis: Existing comprehensive AI trading system with user_profiles, ai_agents, event_bus
-- Integration Type: NEW_MODULE - Adding specialized AI Chiefs chat interface
-- Dependencies: user_profiles (existing)

-- 1. Create custom types for AI Chiefs Chat
CREATE TYPE public.ai_chief_role AS ENUM (
    'orchestrateur',
    'risque', 
    'recherche',
    'execution',
    'donnees'
);

CREATE TYPE public.conversation_status AS ENUM (
    'active',
    'archived',
    'paused'
);

CREATE TYPE public.message_type AS ENUM (
    'user_message',
    'chief_response',
    'system_notification'
);

-- 2. AI Chiefs Chat Conversations Table
CREATE TABLE public.ai_chief_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    chief_role public.ai_chief_role NOT NULL,
    title TEXT NOT NULL DEFAULT 'Nouvelle conversation',
    status public.conversation_status DEFAULT 'active'::public.conversation_status,
    last_message_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. AI Chiefs Messages Table  
CREATE TABLE public.ai_chief_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.ai_chief_conversations(id) ON DELETE CASCADE,
    sender_type public.message_type NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. AI Chiefs Available Tools Table
CREATE TABLE public.ai_chief_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name TEXT NOT NULL UNIQUE,
    endpoint_path TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Essential Indexes
CREATE INDEX idx_ai_chief_conversations_user_id ON public.ai_chief_conversations(user_id);
CREATE INDEX idx_ai_chief_conversations_chief_role ON public.ai_chief_conversations(chief_role);
CREATE INDEX idx_ai_chief_conversations_status ON public.ai_chief_conversations(status);
CREATE INDEX idx_ai_chief_messages_conversation_id ON public.ai_chief_messages(conversation_id);
CREATE INDEX idx_ai_chief_messages_created_at ON public.ai_chief_messages(created_at);
CREATE INDEX idx_ai_chief_tools_enabled ON public.ai_chief_tools(is_enabled);

-- 6. Enable RLS
ALTER TABLE public.ai_chief_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chief_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chief_tools ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Pattern 2: Simple User Ownership for conversations
CREATE POLICY "users_manage_own_ai_chief_conversations"
ON public.ai_chief_conversations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for messages (through conversation)
CREATE OR REPLACE FUNCTION public.user_owns_conversation(conversation_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.ai_chief_conversations acc
    WHERE acc.id = conversation_uuid AND acc.user_id = auth.uid()
)
$$;

CREATE POLICY "users_manage_own_ai_chief_messages"
ON public.ai_chief_messages
FOR ALL
TO authenticated
USING (public.user_owns_conversation(conversation_id))
WITH CHECK (public.user_owns_conversation(conversation_id));

-- Pattern 4: Public read for tools (available to all authenticated users)
CREATE POLICY "authenticated_read_ai_chief_tools"
ON public.ai_chief_tools
FOR SELECT
TO authenticated
USING (is_enabled = true);

-- Admin policy for tools management
CREATE POLICY "admin_manage_ai_chief_tools"
ON public.ai_chief_tools
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 8. Update functions for timestamps
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.ai_chief_conversations 
    SET last_message_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.ai_chief_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_timestamp();

CREATE TRIGGER update_ai_chief_conversations_updated_at
    BEFORE UPDATE ON public.ai_chief_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Mock Data for AI Chiefs Chat
DO $$
DECLARE
    existing_user_id UUID;
    conversation_orch_id UUID := gen_random_uuid();
    conversation_risk_id UUID := gen_random_uuid();
    conversation_research_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Create sample conversations with different AI Chiefs
        INSERT INTO public.ai_chief_conversations (id, user_id, chief_role, title, status) VALUES
            (conversation_orch_id, existing_user_id, 'orchestrateur', 'Stratégie de Trading Q4', 'active'),
            (conversation_risk_id, existing_user_id, 'risque', 'Analyse des Risques Portfolio', 'active'),
            (conversation_research_id, existing_user_id, 'recherche', 'Nouvelles Opportunités', 'archived');

        -- Sample messages for orchestrateur conversation
        INSERT INTO public.ai_chief_messages (conversation_id, sender_type, content, metadata) VALUES
            (conversation_orch_id, 'user_message', 'Bonjour Chef Orchestrateur, je souhaite optimiser ma stratégie pour Q4', '{"timestamp": "2025-09-27T20:58:45.716536Z"}'),
            (conversation_orch_id, 'chief_response', 'Excellent timing ! Pour Q4, je recommande une approche équilibrée entre momentum et mean reversion. Analysons vos positions actuelles.', '{"confidence": 0.95, "analysis_type": "strategic_planning"}'),
            (conversation_orch_id, 'user_message', 'Quels sont les indicateurs clés à surveiller ?', '{"timestamp": "2025-09-27T21:00:15.716536Z"}'),
            (conversation_orch_id, 'chief_response', 'Focus sur : VIX < 20, rotation sectorielle, corrélations inter-marchés. Je déclenche une analyse complète via /select.', '{"indicators": ["VIX", "sector_rotation", "correlations"], "action": "trigger_analysis"}');

        -- Sample messages for risk conversation  
        INSERT INTO public.ai_chief_messages (conversation_id, sender_type, content, metadata) VALUES
            (conversation_risk_id, 'user_message', 'Chef Risque, évaluez mon exposition actuelle', '{"timestamp": "2025-09-27T20:55:12.716536Z"}'),
            (conversation_risk_id, 'chief_response', 'VaR journalier: 2.3%, CVaR: 4.1%. Concentration secteur tech: 35% - proche limite 40%. Recommandation: diversification.', '{"var_daily": 0.023, "cvar": 0.041, "sector_concentration": {"tech": 0.35}, "limit_warning": true}'),
            (conversation_risk_id, 'system_notification', 'Limite de risque approchée - alerte automatique générée', '{"alert_type": "risk_limit", "severity": "warning"}');

        -- Sample messages for research conversation
        INSERT INTO public.ai_chief_messages (conversation_id, sender_type, content, metadata) VALUES
            (conversation_research_id, 'user_message', 'Quelles sont les dernières découvertes ?', '{"timestamp": "2025-09-27T19:30:45.716536Z"}'),
            (conversation_research_id, 'chief_response', 'Analyse de 847 papers cette semaine. Pattern émergent: stratégies cross-asset momentum. Potentiel alpha: +12%.', '{"papers_analyzed": 847, "new_patterns": 3, "alpha_potential": 0.12}'),
            (conversation_research_id, 'chief_response', 'Nouvelle famille de stratégies identifiée: "Regime-Aware Momentum". Tests en cours.', '{"strategy_family": "regime_aware_momentum", "status": "testing"}');

        -- Insert available tools
        INSERT INTO public.ai_chief_tools (tool_name, endpoint_path, description, permissions) VALUES
            ('status', '/status', 'Vérification du statut système et agents', '{"read_only": true}'),
            ('registry', '/registry', 'Consultation du registre des stratégies', '{"read_only": true}'),
            ('scores', '/scores', 'Analyse des performances et scores', '{"read_only": true}'),  
            ('select', '/select', 'Sélection et allocation de stratégies', '{"read_only": true}'),
            ('allocate', '/allocate', 'Allocation de capital et ressources', '{"read_only": true}');

        RAISE NOTICE 'AI Chiefs Chat mock data created successfully for user: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No existing users found. Create users first before adding chat conversations.';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating AI Chiefs Chat mock data: %', SQLERRM;
END $$;

-- 10. Cleanup function for testing
CREATE OR REPLACE FUNCTION public.cleanup_ai_chiefs_chat_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete in dependency order
    DELETE FROM public.ai_chief_messages WHERE conversation_id IN (
        SELECT id FROM public.ai_chief_conversations WHERE user_id IN (
            SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
        )
    );
    DELETE FROM public.ai_chief_conversations WHERE user_id IN (
        SELECT id FROM public.user_profiles WHERE email LIKE '%@tradingai.com'
    );
    DELETE FROM public.ai_chief_tools WHERE tool_name IN ('status', 'registry', 'scores', 'select', 'allocate');
    
    RAISE NOTICE 'AI Chiefs Chat test data cleaned up successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error cleaning up AI Chiefs Chat test data: %', SQLERRM;
END $$;