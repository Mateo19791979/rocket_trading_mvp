-- Location: supabase/migrations/20250928072307_add_recommendation_system.sql
-- Schema Analysis: Existing trading platform with user_profiles, assets, portfolios, positions, trades, ai_screening_results
-- Integration Type: Addition - New recommendation system module
-- Dependencies: user_profiles, assets, portfolios, ai_screening_results

-- 1. Types pour le système de recommandation
CREATE TYPE public.recommendation_type AS ENUM ('buy', 'sell', 'hold', 'reduce', 'increase');
CREATE TYPE public.recommendation_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.recommendation_source AS ENUM ('ai_analysis', 'technical_analysis', 'fundamental_analysis', 'market_sentiment', 'risk_management');
CREATE TYPE public.user_investment_style AS ENUM ('conservative', 'moderate', 'aggressive', 'day_trader', 'long_term');
CREATE TYPE public.risk_appetite AS ENUM ('very_low', 'low', 'moderate', 'high', 'very_high');

-- 2. Table des préférences utilisateur pour les recommandations
CREATE TABLE public.user_recommendation_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    investment_style public.user_investment_style DEFAULT 'moderate'::public.user_investment_style,
    risk_appetite public.risk_appetite DEFAULT 'moderate'::public.risk_appetite,
    preferred_sectors TEXT[],
    excluded_sectors TEXT[],
    min_investment_amount NUMERIC DEFAULT 1000,
    max_investment_amount NUMERIC DEFAULT 10000,
    preferred_recommendation_frequency INTEGER DEFAULT 3, -- recommendations per week
    enable_ai_recommendations BOOLEAN DEFAULT true,
    enable_technical_recommendations BOOLEAN DEFAULT true,
    enable_fundamental_recommendations BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table principale des recommandations
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    recommendation_type public.recommendation_type NOT NULL,
    priority public.recommendation_priority DEFAULT 'medium'::public.recommendation_priority,
    source public.recommendation_source NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reasoning TEXT,
    target_price NUMERIC,
    current_price NUMERIC,
    potential_return_percent NUMERIC,
    confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
    risk_score NUMERIC CHECK (risk_score >= 0 AND risk_score <= 100),
    time_horizon_days INTEGER DEFAULT 30,
    suggested_allocation_percent NUMERIC CHECK (suggested_allocation_percent >= 0 AND suggested_allocation_percent <= 100),
    is_active BOOLEAN DEFAULT true,
    is_read BOOLEAN DEFAULT false,
    is_dismissed BOOLEAN DEFAULT false,
    executed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table pour les actions de l'utilisateur sur les recommandations
CREATE TABLE public.recommendation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'viewed', 'dismissed', 'executed', 'bookmarked', 'shared'
    action_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table pour suivre les performances des recommandations
CREATE TABLE public.recommendation_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE CASCADE,
    actual_return_percent NUMERIC,
    days_held INTEGER,
    outcome TEXT, -- 'profitable', 'loss', 'neutral', 'pending'
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Index pour optimiser les performances
CREATE INDEX idx_user_recommendation_preferences_user_id ON public.user_recommendation_preferences(user_id);
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_asset_id ON public.recommendations(asset_id);
CREATE INDEX idx_recommendations_active ON public.recommendations(user_id, is_active, created_at DESC);
CREATE INDEX idx_recommendations_priority ON public.recommendations(priority, created_at DESC);
CREATE INDEX idx_recommendations_source ON public.recommendations(source);
CREATE INDEX idx_recommendation_actions_recommendation_id ON public.recommendation_actions(recommendation_id);
CREATE INDEX idx_recommendation_actions_user_id ON public.recommendation_actions(user_id);
CREATE INDEX idx_recommendation_performance_recommendation_id ON public.recommendation_performance(recommendation_id);

-- 7. Fonctions utiles pour les recommandations
CREATE OR REPLACE FUNCTION public.get_user_recommendation_stats(user_uuid UUID)
RETURNS TABLE(
    total_recommendations INTEGER,
    active_recommendations INTEGER,
    executed_recommendations INTEGER,
    avg_confidence_score NUMERIC,
    avg_success_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    COUNT(*)::INTEGER as total_recommendations,
    COUNT(*) FILTER (WHERE r.is_active = true)::INTEGER as active_recommendations,
    COUNT(*) FILTER (WHERE r.executed_at IS NOT NULL)::INTEGER as executed_recommendations,
    ROUND(AVG(r.confidence_score), 2) as avg_confidence_score,
    ROUND(
        (COUNT(*) FILTER (WHERE rp.outcome = 'profitable')::NUMERIC / 
         NULLIF(COUNT(*) FILTER (WHERE rp.outcome IS NOT NULL), 0)) * 100, 2
    ) as avg_success_rate
FROM public.recommendations r
LEFT JOIN public.recommendation_performance rp ON r.id = rp.recommendation_id
WHERE r.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.generate_ai_recommendation(
    target_user_id UUID,
    target_asset_id UUID,
    rec_type public.recommendation_type,
    rec_title TEXT,
    rec_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_recommendation_id UUID;
    asset_current_price NUMERIC;
    user_prefs RECORD;
BEGIN
    -- Get user preferences
    SELECT * INTO user_prefs FROM public.user_recommendation_preferences 
    WHERE user_id = target_user_id LIMIT 1;
    
    -- Get current asset price from market data or positions
    SELECT current_price INTO asset_current_price 
    FROM public.positions 
    WHERE asset_id = target_asset_id 
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    -- Create the recommendation
    INSERT INTO public.recommendations (
        user_id,
        asset_id,
        recommendation_type,
        source,
        title,
        description,
        current_price,
        confidence_score,
        risk_score,
        time_horizon_days
    )
    VALUES (
        target_user_id,
        target_asset_id,
        rec_type,
        'ai_analysis'::public.recommendation_source,
        rec_title,
        rec_description,
        asset_current_price,
        ROUND(RANDOM() * 30 + 70), -- 70-100 confidence for AI recommendations
        ROUND(RANDOM() * 40 + 30), -- 30-70 risk score
        COALESCE(user_prefs.min_investment_amount::INTEGER, 30)
    )
    RETURNING id INTO new_recommendation_id;
    
    RETURN new_recommendation_id;
END;
$$;

-- 8. Triggers pour maintenir les timestamps
CREATE OR REPLACE FUNCTION public.update_recommendation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_user_recommendation_preferences_updated_at
    BEFORE UPDATE ON public.user_recommendation_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_recommendation_updated_at();

CREATE TRIGGER update_recommendations_updated_at
    BEFORE UPDATE ON public.recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_recommendation_updated_at();

CREATE TRIGGER update_recommendation_performance_updated_at
    BEFORE UPDATE ON public.recommendation_performance
    FOR EACH ROW
    EXECUTE FUNCTION public.update_recommendation_updated_at();

-- 9. RLS (Row Level Security)
ALTER TABLE public.user_recommendation_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies utilisant Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_recommendation_preferences"
ON public.user_recommendation_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_recommendations"
ON public.recommendations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_recommendation_actions"
ON public.recommendation_actions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_view_own_recommendation_performance"
ON public.recommendation_performance
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recommendations r 
        WHERE r.id = recommendation_performance.recommendation_id 
        AND r.user_id = auth.uid()
    )
);

-- 10. Données de test pour les recommandations
DO $$
DECLARE
    existing_user_id UUID;
    existing_asset_id UUID;
    rec_id1 UUID;
    rec_id2 UUID;
    rec_id3 UUID;
BEGIN
    -- Récupérer un utilisateur existant
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    -- Récupérer des assets existants
    SELECT id INTO existing_asset_id FROM public.assets WHERE symbol = 'AAPL' LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Créer les préférences par défaut
        INSERT INTO public.user_recommendation_preferences (
            user_id,
            investment_style,
            risk_appetite,
            preferred_sectors,
            min_investment_amount,
            max_investment_amount
        )
        VALUES (
            existing_user_id,
            'moderate'::public.user_investment_style,
            'moderate'::public.risk_appetite,
            ARRAY['Technology', 'Healthcare', 'Finance'],
            1000,
            50000
        )
        ON CONFLICT DO NOTHING;
        
        IF existing_asset_id IS NOT NULL THEN
            -- Créer des recommandations de test
            INSERT INTO public.recommendations (
                user_id,
                asset_id,
                recommendation_type,
                source,
                title,
                description,
                reasoning,
                target_price,
                current_price,
                potential_return_percent,
                confidence_score,
                risk_score,
                suggested_allocation_percent,
                priority
            )
            VALUES 
            (
                existing_user_id,
                existing_asset_id,
                'buy'::public.recommendation_type,
                'ai_analysis'::public.recommendation_source,
                'Opportunité d achat AAPL',
                'Apple présente une opportunité d achat intéressante basée sur l analyse technique et fondamentale.',
                'Support technique solide à 150$, perspectives de croissance robustes dans les services et l IA.',
                185.00,
                176.80,
                4.6,
                87,
                35,
                15,
                'high'::public.recommendation_priority
            ),
            (
                existing_user_id,
                existing_asset_id,
                'hold'::public.recommendation_type,
                'technical_analysis'::public.recommendation_source,
                'Maintenir position AAPL',
                'Conserver la position actuelle en attendant une clarification de la tendance.',
                'Consolidation en cours, attendre la sortie de range 170-180$.',
                NULL,
                176.80,
                NULL,
                72,
                25,
                NULL,
                'medium'::public.recommendation_priority
            ),
            (
                existing_user_id,
                existing_asset_id,
                'reduce'::public.recommendation_type,
                'risk_management'::public.recommendation_source,
                'Réduire exposition AAPL',
                'Recommandation de réduction de position pour optimiser le profil de risque.',
                'Surpondération détectée dans le portefeuille, rébalancement nécessaire.',
                NULL,
                176.80,
                NULL,
                65,
                45,
                10,
                'medium'::public.recommendation_priority
            )
            RETURNING id;
        END IF;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur lors de la création des données de test: %', SQLERRM;
END $$;