-- Location: supabase/migrations/20250928082829_add_trading_mvp_core_tables.sql
-- Schema Analysis: Existing trading schema with assets, market_data, orders, portfolios, positions, trades
-- Integration Type: Addition - Adding missing tables for trading MVP backend
-- Dependencies: References existing user_profiles table

-- Core tables for Trading MVP backend compatibility

-- 1. Strategies table for trading strategies
CREATE TABLE public.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    selected BOOLEAN DEFAULT false,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    parameters JSONB DEFAULT '{}'::JSONB,
    performance_metrics JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Scores table for performance scoring
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    value DOUBLE PRECISION NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential indexes for performance
CREATE INDEX idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX idx_strategies_selected ON public.strategies(selected) WHERE selected = true;
CREATE INDEX idx_strategies_active ON public.strategies(is_active) WHERE is_active = true;
CREATE INDEX idx_scores_strategy_id ON public.scores(strategy_id);
CREATE INDEX idx_scores_date ON public.scores(date);
CREATE INDEX idx_scores_strategy_date ON public.scores(strategy_id, date);

-- 4. Enable RLS
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_strategies"
ON public.strategies
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Public read access for scores (as referenced in backend)
CREATE POLICY "public_can_read_scores"
ON public.scores
FOR SELECT
TO public
USING (true);

-- Users can manage scores for their strategies
CREATE POLICY "users_manage_scores_via_strategies"
ON public.scores
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.strategies s 
        WHERE s.id = scores.strategy_id 
        AND s.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.strategies s 
        WHERE s.id = scores.strategy_id 
        AND s.user_id = auth.uid()
    )
);

-- 6. Triggers for updated_at
CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON public.strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Mock data for Trading MVP backend compatibility
DO $$
DECLARE
    existing_user_id UUID;
    strategy_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user (or create system user if needed)
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NULL THEN
        -- Create a system user for demo purposes
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
            is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
            recovery_token, recovery_sent_at, email_change_token_new, email_change,
            email_change_sent_at, email_change_token_current, email_change_confirm_status,
            reauthentication_token, reauthentication_sent_at, phone, phone_change,
            phone_change_token, phone_change_sent_at
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'trading@system.com', crypt('system123', gen_salt('bf', 10)), now(), now(), now(),
            '{"full_name": "Trading System"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
            false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
        );
        
        -- Get the new user ID
        SELECT id INTO existing_user_id FROM public.user_profiles WHERE email = 'trading@system.com';
    END IF;
    
    -- Insert sample strategy (RSI+Bollinger as referenced in backend)
    INSERT INTO public.strategies (id, name, description, selected, user_id, parameters)
    VALUES (
        strategy_id,
        'RSI+Bollinger',
        'Combined RSI and Bollinger Bands strategy for trend following',
        true,
        existing_user_id,
        '{"rsi_period": 14, "bb_period": 20, "bb_std": 2}'::JSONB
    );
    
    -- Insert sample scores for the past 30 days
    FOR i IN 1..30 LOOP
        INSERT INTO public.scores (strategy_id, date, value)
        VALUES (
            strategy_id,
            CURRENT_DATE - INTERVAL '30 days' + (i || ' days')::INTERVAL,
            RANDOM() * 100 + 50 -- Random score between 50-150
        );
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data generation error: %', SQLERRM;
END $$;