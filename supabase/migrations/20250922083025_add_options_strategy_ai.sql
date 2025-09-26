-- Location: supabase/migrations/20250922083025_add_options_strategy_ai.sql
-- Schema Analysis: Existing trading platform with assets, market_data, portfolios, orders, trades, ai_agents
-- Integration Type: Extension - Adding options-specific functionality
-- Dependencies: assets, user_profiles, portfolios

-- 1. Types for Options Strategy AI
CREATE TYPE public.option_type AS ENUM ('call', 'put');
CREATE TYPE public.option_strategy AS ENUM ('bull_call_spread', 'cash_secured_put', 'covered_call', 'long_call', 'iron_condor');
CREATE TYPE public.screening_status AS ENUM ('pending', 'completed', 'failed');

-- 2. Options Contracts Table
CREATE TABLE public.options_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    option_type public.option_type NOT NULL,
    strike_price NUMERIC(12,4) NOT NULL,
    expiration_date DATE NOT NULL,
    implied_volatility NUMERIC(8,4),
    delta NUMERIC(8,4),
    gamma NUMERIC(8,4),
    theta NUMERIC(8,4),
    vega NUMERIC(8,4),
    bid_price NUMERIC(10,4),
    ask_price NUMERIC(10,4),
    last_price NUMERIC(10,4),
    volume INTEGER DEFAULT 0,
    open_interest INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Options Strategy Definitions
CREATE TABLE public.options_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    strategy_type public.option_strategy NOT NULL,
    entry_date DATE,
    expiration_date DATE,
    max_profit NUMERIC(12,2),
    max_loss NUMERIC(12,2),
    break_even_points JSONB,
    strategy_legs JSONB NOT NULL,
    risk_parameters JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. AI Screening Results
CREATE TABLE public.ai_screening_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    screening_date DATE DEFAULT CURRENT_DATE,
    composite_score NUMERIC(5,2),
    valuation_score NUMERIC(5,2),
    quality_score NUMERIC(5,2),
    momentum_score NUMERIC(5,2),
    sentiment_score NUMERIC(5,2),
    liquidity_score NUMERIC(5,2),
    pe_zscore NUMERIC(8,4),
    roe NUMERIC(8,4),
    roic NUMERIC(8,4),
    iv_rank NUMERIC(5,2),
    performance_vs_sector NUMERIC(8,4),
    recommended_strategy public.option_strategy,
    screening_status public.screening_status DEFAULT 'pending'::public.screening_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Fundamental Data (Extended from assets)
CREATE TABLE public.fundamental_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    pe_ratio NUMERIC(10,4),
    ev_ebitda NUMERIC(10,4),
    peg_ratio NUMERIC(10,4),
    gross_margin NUMERIC(8,4),
    operating_cash_flow NUMERIC(15,2),
    net_debt_ebitda NUMERIC(10,4),
    ma_50 NUMERIC(12,4),
    ma_200 NUMERIC(12,4),
    performance_3m NUMERIC(8,4),
    performance_6m NUMERIC(8,4),
    performance_12m NUMERIC(8,4),
    data_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indexes for performance
CREATE INDEX idx_options_contracts_asset_id ON public.options_contracts(asset_id);
CREATE INDEX idx_options_contracts_expiration ON public.options_contracts(expiration_date);
CREATE INDEX idx_options_contracts_strike ON public.options_contracts(strike_price);
CREATE INDEX idx_options_strategies_user_id ON public.options_strategies(user_id);
CREATE INDEX idx_options_strategies_asset_id ON public.options_strategies(asset_id);
CREATE INDEX idx_ai_screening_results_user_id ON public.ai_screening_results(user_id);
CREATE INDEX idx_ai_screening_results_score ON public.ai_screening_results(composite_score DESC);
CREATE INDEX idx_fundamental_data_asset_id ON public.fundamental_data(asset_id);
CREATE INDEX idx_fundamental_data_pe_ratio ON public.fundamental_data(pe_ratio);

-- 7. Functions for Options Strategy AI
CREATE OR REPLACE FUNCTION public.calculate_composite_score(
    valuation_score NUMERIC,
    quality_score NUMERIC,
    momentum_score NUMERIC,
    sentiment_score NUMERIC,
    liquidity_score NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $func$
BEGIN
    RETURN (
        valuation_score * 0.35 +
        quality_score * 0.25 +
        momentum_score * 0.20 +
        sentiment_score * 0.10 +
        liquidity_score * 0.10
    );
END;
$func$;

CREATE OR REPLACE FUNCTION public.get_options_screening_recommendations(user_uuid UUID)
RETURNS TABLE(
    asset_symbol TEXT,
    composite_score NUMERIC,
    recommended_strategy TEXT,
    pe_zscore NUMERIC,
    roe NUMERIC,
    roic NUMERIC,
    iv_rank NUMERIC,
    performance_vs_sector NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        a.symbol::TEXT,
        sr.composite_score,
        sr.recommended_strategy::TEXT,
        sr.pe_zscore,
        sr.roe,
        sr.roic,
        sr.iv_rank,
        sr.performance_vs_sector
    FROM public.ai_screening_results sr
    JOIN public.assets a ON sr.asset_id = a.id
    WHERE sr.user_id = user_uuid
    AND sr.screening_status = 'completed'::public.screening_status
    AND sr.composite_score >= 70
    ORDER BY sr.composite_score DESC;
END;
$func$;

-- 8. Enable RLS
ALTER TABLE public.options_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundamental_data ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies using Pattern 4 (Public Read, Private Write) and Pattern 2 (Simple User Ownership)

-- Options contracts - public read for market data
CREATE POLICY "public_can_read_options_contracts"
ON public.options_contracts
FOR SELECT
TO public
USING (true);

-- Options strategies - user ownership
CREATE POLICY "users_manage_own_options_strategies"
ON public.options_strategies
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- AI screening results - user ownership
CREATE POLICY "users_manage_own_ai_screening_results"
ON public.ai_screening_results
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fundamental data - public read
CREATE POLICY "public_can_read_fundamental_data"
ON public.fundamental_data
FOR SELECT
TO public
USING (true);

-- 10. Triggers for updated_at
CREATE TRIGGER update_options_contracts_updated_at
    BEFORE UPDATE ON public.options_contracts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_options_strategies_updated_at
    BEFORE UPDATE ON public.options_strategies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_screening_results_updated_at
    BEFORE UPDATE ON public.ai_screening_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fundamental_data_updated_at
    BEFORE UPDATE ON public.fundamental_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Mock Data for Options Strategy AI
DO $$
DECLARE
    existing_user_id UUID;
    aapl_asset_id UUID;
    msft_asset_id UUID;
    aapl_call_option UUID := gen_random_uuid();
    msft_put_option UUID := gen_random_uuid();
BEGIN
    -- Get existing user and assets
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO aapl_asset_id FROM public.assets WHERE symbol = 'AAPL' LIMIT 1;
    SELECT id INTO msft_asset_id FROM public.assets WHERE symbol = 'MSFT' LIMIT 1;
    
    -- Add options contracts
    INSERT INTO public.options_contracts (id, asset_id, option_type, strike_price, expiration_date, implied_volatility, delta, last_price)
    VALUES
        (aapl_call_option, aapl_asset_id, 'call'::public.option_type, 180.00, '2025-03-21', 0.28, 0.65, 8.50),
        (msft_put_option, msft_asset_id, 'put'::public.option_type, 290.00, '2025-02-21', 0.32, -0.45, 12.30);
    
    -- Add fundamental data
    INSERT INTO public.fundamental_data (asset_id, pe_ratio, ev_ebitda, peg_ratio, gross_margin, ma_50, ma_200, performance_3m)
    VALUES
        (aapl_asset_id, 28.5, 22.1, 1.8, 0.38, 175.20, 172.80, 0.12),
        (msft_asset_id, 31.2, 24.8, 1.5, 0.69, 295.40, 290.15, 0.08);
    
    -- Add AI screening results
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.ai_screening_results (
            user_id, asset_id, composite_score, valuation_score, quality_score, 
            momentum_score, sentiment_score, liquidity_score, pe_zscore, roe, roic, 
            iv_rank, performance_vs_sector, recommended_strategy, screening_status
        )
        VALUES
            (existing_user_id, aapl_asset_id, 78.5, 75.0, 85.0, 82.0, 70.0, 88.0, -0.8, 0.28, 0.35, 65.0, -0.07, 'bull_call_spread'::public.option_strategy, 'completed'::public.screening_status),
            (existing_user_id, msft_asset_id, 82.3, 80.0, 88.0, 85.0, 75.0, 90.0, -0.5, 0.32, 0.41, 72.0, -0.03, 'cash_secured_put'::public.option_strategy, 'completed'::public.screening_status);
        
        -- Add sample options strategy
        INSERT INTO public.options_strategies (
            user_id, asset_id, strategy_type, expiration_date, max_profit, max_loss,
            break_even_points, strategy_legs, risk_parameters
        )
        VALUES
            (existing_user_id, aapl_asset_id, 'bull_call_spread'::public.option_strategy, '2025-03-21', 1150.00, -850.00,
             '{"break_even": 188.50}'::jsonb,
             '{"long_call": {"strike": 180, "premium": 8.50}, "short_call": {"strike": 200, "premium": 2.00}}'::jsonb,
             '{"max_risk_per_trade": 0.02, "stop_loss": 0.5}'::jsonb);
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in mock data creation: %', SQLERRM;
END $$;