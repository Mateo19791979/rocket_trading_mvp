-- Location: supabase/migrations/20251007174000_add_aas_performance_plus_plus_system.sql
-- Schema Analysis: Building upon existing AAS system with comprehensive performance enhancements
-- Integration Type: Addition/Enhancement - Adding new performance optimization tables
-- Dependencies: user_profiles, strategy_candidates, system_health, source_rewards

-- AAS Performance++ System: 10 Advanced Features Implementation
-- 1. Sizing Adaptatif "Kelly-Lite" par stratégie
-- 2. Volatility Targeting intra-day
-- 3. Meta-labeling + purged K-fold
-- 4. TCA live + modèle de slippage auto-calibré
-- 5. Hyper-params "régime-conditionnés"
-- 6. Universe dynamique "capacity-aware"
-- 7. Bandit Thompson sur sources de vérité (DHI-aware)
-- 8. Stop de volatilité + time-stop intelligent
-- 9. "Canary perpétuel" + Alpha-Decay Watchdog
-- 10. Coût/alpha (FinOps) — priorisation compute

-- Step 1: Create new enums for performance system
CREATE TYPE public.sizing_method AS ENUM ('kelly_lite', 'fixed', 'adaptive', 'vol_target');
CREATE TYPE public.volatility_regime AS ENUM ('low', 'normal', 'high', 'extreme');
CREATE TYPE public.meta_label_status AS ENUM ('pass', 'block', 'pending', 'review');
CREATE TYPE public.execution_venue AS ENUM ('primary', 'dark_pool', 'ecn', 'smart_router');
CREATE TYPE public.regime_type AS ENUM ('bull', 'bear', 'sideways', 'volatile', 'quiet');
CREATE TYPE public.capacity_status AS ENUM ('available', 'constrained', 'blocked', 'limited');

-- Step 2: Core Performance Enhancement Tables

-- 1. Kelly-Lite Sizing Management
CREATE TABLE public.live_sizing (
    strategy_id UUID PRIMARY KEY REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
    kelly_raw NUMERIC NOT NULL DEFAULT 0,
    kelly_capped NUMERIC NOT NULL DEFAULT 0,
    as_of TIMESTAMPTZ DEFAULT now(),
    cap_min NUMERIC DEFAULT 0.0,
    cap_max NUMERIC DEFAULT 0.015, -- 1.5% notional max
    method public.sizing_method DEFAULT 'kelly_lite'::public.sizing_method,
    confidence_level NUMERIC DEFAULT 0.95,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Volatility Targeting System
CREATE TABLE public.vol_targets (
    symbol TEXT PRIMARY KEY,
    sigma_target_yr NUMERIC NOT NULL DEFAULT 0.12, -- 12% annual target
    sigma_realized NUMERIC DEFAULT 0,
    vol_adj_factor NUMERIC DEFAULT 1.0,
    regime public.volatility_regime DEFAULT 'normal'::public.volatility_regime,
    last_update TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Meta-Labeling System for Strategy Validation
CREATE TABLE public.meta_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
    primary_signal JSONB NOT NULL, -- Original strategy signal
    meta_prediction NUMERIC NOT NULL, -- Probability this signal will be profitable
    meta_threshold NUMERIC DEFAULT 0.55, -- Minimum confidence to pass
    status public.meta_label_status DEFAULT 'pending'::public.meta_label_status,
    features JSONB, -- Feature vector used for meta-labeling
    model_version TEXT DEFAULT 'v1.0',
    purged_validation BOOLEAN DEFAULT false, -- Used purged k-fold
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transaction Cost Analysis (TCA) Live System
CREATE TABLE public.exec_tca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    ts TIMESTAMPTZ DEFAULT now(),
    is_bps NUMERIC, -- Implementation shortfall in basis points
    fill_rate NUMERIC, -- Percentage filled
    adverse_sel_z NUMERIC, -- Adverse selection z-score
    spread_bp NUMERIC, -- Bid-ask spread in basis points
    venue public.execution_venue DEFAULT 'primary'::public.execution_venue,
    slippage_bps NUMERIC DEFAULT 0,
    market_impact_bps NUMERIC DEFAULT 0,
    timing_cost_bps NUMERIC DEFAULT 0,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Regime-Conditional Hyperparameters
CREATE TABLE public.regime_params (
    regime public.regime_type PRIMARY KEY,
    params JSONB NOT NULL, -- {"bb_len":12, "rsi_th":28, "aggr_cap":0.35}
    active BOOLEAN DEFAULT true,
    last_calibration TIMESTAMPTZ DEFAULT now(),
    performance_score NUMERIC DEFAULT 0,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Dynamic Universe with Capacity Awareness
CREATE TABLE public.universe_live (
    symbol TEXT PRIMARY KEY,
    adv_usd NUMERIC, -- Average daily volume in USD
    vol_z NUMERIC, -- Volatility z-score
    enabled BOOLEAN DEFAULT true,
    capacity_limit NUMERIC, -- Max position size / ADV ratio
    status public.capacity_status DEFAULT 'available'::public.capacity_status,
    last_review TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Enhanced Source Rewards for Thompson Sampling (builds on existing source_rewards)
CREATE TABLE public.source_rewards_enhanced (
    source TEXT PRIMARY KEY,
    alpha NUMERIC DEFAULT 1.0, -- Beta distribution alpha parameter
    beta NUMERIC DEFAULT 1.0, -- Beta distribution beta parameter
    pulls INTEGER DEFAULT 0,
    successes INTEGER DEFAULT 0,
    failures INTEGER DEFAULT 0,
    last_reward NUMERIC DEFAULT 0,
    confidence_interval NUMERIC DEFAULT 0.95,
    expected_reward NUMERIC DEFAULT 0.5,
    dhi_weight NUMERIC DEFAULT 1.0, -- Data Health Index weighting
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Volatility and Time-Based Stop Management
CREATE TABLE public.stop_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
    vol_stop_multiplier NUMERIC DEFAULT 2.0, -- ATR multiplier for vol stop
    time_stop_hours INTEGER DEFAULT 24, -- Maximum holding period
    max_drawdown_pct NUMERIC DEFAULT 0.02, -- 2% max drawdown
    trailing_stop_pct NUMERIC DEFAULT 0.01, -- 1% trailing stop
    dynamic_sizing BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Canary Deployment and Alpha Decay Monitoring
CREATE TABLE public.canary_monitoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
    canary_allocation_pct NUMERIC DEFAULT 0.01, -- 1% risk allocation for canary
    alpha_decay_threshold NUMERIC DEFAULT -0.05, -- -5% alpha decay triggers alert
    consecutive_failures INTEGER DEFAULT 0,
    quarantine_active BOOLEAN DEFAULT false,
    last_alpha_measurement NUMERIC DEFAULT 0,
    health_score NUMERIC DEFAULT 1.0,
    deployment_stage TEXT DEFAULT 'canary', -- canary, partial, full
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. FinOps Alpha ROI for Compute Prioritization
CREATE TABLE public.finops_alpha_roi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID REFERENCES public.strategy_candidates(id) ON DELETE CASCADE,
    time_window TEXT NOT NULL, -- '1d', '1w', '1m'
    pnl_attrib NUMERIC DEFAULT 0, -- PnL attributed to this strategy
    data_cost NUMERIC DEFAULT 0, -- Cost of data feeds
    compute_cost NUMERIC DEFAULT 0, -- Cost of compute resources
    roi_alpha NUMERIC DEFAULT 0, -- ROI calculation: pnl_attrib / (data_cost + compute_cost)
    priority_score NUMERIC DEFAULT 0, -- Priority for resource allocation
    breed_eligible BOOLEAN DEFAULT false, -- Eligible for genetic breeding
    ts TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Essential Indexes for Performance
CREATE INDEX idx_live_sizing_user_id ON public.live_sizing(user_id);
CREATE INDEX idx_live_sizing_strategy_id ON public.live_sizing(strategy_id);
CREATE INDEX idx_live_sizing_as_of ON public.live_sizing(as_of DESC);

CREATE INDEX idx_vol_targets_user_id ON public.vol_targets(user_id);
CREATE INDEX idx_vol_targets_symbol ON public.vol_targets(symbol);
CREATE INDEX idx_vol_targets_regime ON public.vol_targets(regime);

CREATE INDEX idx_meta_labels_strategy_id ON public.meta_labels(strategy_id);
CREATE INDEX idx_meta_labels_status ON public.meta_labels(status);
CREATE INDEX idx_meta_labels_user_id ON public.meta_labels(user_id);

CREATE INDEX idx_exec_tca_strategy_id ON public.exec_tca(strategy_id);
CREATE INDEX idx_exec_tca_symbol ON public.exec_tca(symbol);
CREATE INDEX idx_exec_tca_ts ON public.exec_tca(ts DESC);
CREATE INDEX idx_exec_tca_user_id ON public.exec_tca(user_id);

CREATE INDEX idx_regime_params_regime ON public.regime_params(regime);
CREATE INDEX idx_regime_params_active ON public.regime_params(active);

CREATE INDEX idx_universe_live_enabled ON public.universe_live(enabled);
CREATE INDEX idx_universe_live_status ON public.universe_live(status);
CREATE INDEX idx_universe_live_user_id ON public.universe_live(user_id);

CREATE INDEX idx_source_rewards_enhanced_user_id ON public.source_rewards_enhanced(user_id);
CREATE INDEX idx_source_rewards_enhanced_expected_reward ON public.source_rewards_enhanced(expected_reward DESC);

CREATE INDEX idx_stop_policies_strategy_id ON public.stop_policies(strategy_id);
CREATE INDEX idx_stop_policies_active ON public.stop_policies(active);
CREATE INDEX idx_stop_policies_user_id ON public.stop_policies(user_id);

CREATE INDEX idx_canary_monitoring_strategy_id ON public.canary_monitoring(strategy_id);
CREATE INDEX idx_canary_monitoring_quarantine ON public.canary_monitoring(quarantine_active);
CREATE INDEX idx_canary_monitoring_user_id ON public.canary_monitoring(user_id);

CREATE INDEX idx_finops_alpha_roi_strategy_id ON public.finops_alpha_roi(strategy_id);
CREATE INDEX idx_finops_alpha_roi_priority ON public.finops_alpha_roi(priority_score DESC);
CREATE INDEX idx_finops_alpha_roi_breed_eligible ON public.finops_alpha_roi(breed_eligible);
CREATE INDEX idx_finops_alpha_roi_user_id ON public.finops_alpha_roi(user_id);
CREATE INDEX idx_finops_alpha_roi_ts ON public.finops_alpha_roi(ts DESC);

-- Step 4: Advanced Functions for Performance Optimization

-- Kelly-Lite Sizing Function
CREATE OR REPLACE FUNCTION public.calculate_kelly_lite(
    mu_param NUMERIC,
    sigma2_param NUMERIC,
    cap_min_param NUMERIC DEFAULT 0.0,
    cap_max_param NUMERIC DEFAULT 0.015
)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT GREATEST(cap_min_param, LEAST(mu_param / NULLIF(sigma2_param, 0), cap_max_param));
$$;

-- Aggressiveness Tuning from TCA
CREATE OR REPLACE FUNCTION public.calculate_aggressiveness_from_tca(
    fill_rate_param NUMERIC,
    adverse_sel_z_param NUMERIC,
    spread_bp_param NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    aggr NUMERIC := 0.25; -- base = passive
BEGIN
    -- Increase aggressiveness if fill rate is low
    IF fill_rate_param < 0.6 THEN
        aggr := aggr + 0.2;
    END IF;
    
    -- Reduce aggressiveness if adverse selection is high
    IF adverse_sel_z_param > 2.0 THEN
        aggr := aggr - 0.15;
    END IF;
    
    -- Reduce aggressiveness in wide spreads
    IF spread_bp_param > 5 THEN
        aggr := aggr - 0.1;
    END IF;
    
    -- Ensure bounds
    RETURN GREATEST(0.05, LEAST(0.8, aggr));
END;
$$;

-- Thompson Sampling for Source Selection
CREATE OR REPLACE FUNCTION public.thompson_sampling_select_source()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    selected_source TEXT;
    max_sample NUMERIC := 0;
    current_sample NUMERIC;
    source_record RECORD;
BEGIN
    -- Thompson Sampling: draw from Beta distribution for each source
    FOR source_record IN 
        SELECT source, alpha, beta FROM public.source_rewards_enhanced
        WHERE alpha > 0 AND beta > 0
    LOOP
        -- Approximate Beta sample using transformed uniform random
        current_sample := random() * (source_record.alpha / (source_record.alpha + source_record.beta));
        
        IF current_sample > max_sample THEN
            max_sample := current_sample;
            selected_source := source_record.source;
        END IF;
    END LOOP;
    
    RETURN COALESCE(selected_source, 'default');
END;
$$;

-- Alpha Decay Calculation
CREATE OR REPLACE FUNCTION public.calculate_alpha_decay(strategy_uuid UUID, window_days INTEGER DEFAULT 30)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (
            SELECT 
                (SUM(CASE WHEN created_at >= now() - interval '7 days' THEN pnl_attrib ELSE 0 END) /
                 NULLIF(SUM(CASE WHEN created_at >= now() - interval '30 days' THEN pnl_attrib ELSE 0 END), 0)) - 1
            FROM public.finops_alpha_roi 
            WHERE strategy_id = strategy_uuid
            AND created_at >= now() - (window_days || ' days')::interval
        ), 0
    );
$$;

-- Step 5: Enable RLS on all new tables
ALTER TABLE public.live_sizing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vol_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exec_tca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regime_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universe_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_rewards_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canary_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finops_alpha_roi ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS Policies (Using Pattern 2 - Simple User Ownership)

-- Live Sizing Policies
CREATE POLICY "users_manage_own_live_sizing"
ON public.live_sizing
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Vol Targets Policies
CREATE POLICY "users_manage_own_vol_targets"
ON public.vol_targets
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Meta Labels Policies
CREATE POLICY "users_manage_own_meta_labels"
ON public.meta_labels
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Exec TCA Policies
CREATE POLICY "users_manage_own_exec_tca"
ON public.exec_tca
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Regime Params Policies
CREATE POLICY "users_manage_own_regime_params"
ON public.regime_params
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Universe Live Policies  
CREATE POLICY "users_manage_own_universe_live"
ON public.universe_live
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Source Rewards Enhanced Policies
CREATE POLICY "users_manage_own_source_rewards_enhanced"
ON public.source_rewards_enhanced
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Stop Policies Policies
CREATE POLICY "users_manage_own_stop_policies"
ON public.stop_policies
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Canary Monitoring Policies
CREATE POLICY "users_manage_own_canary_monitoring"
ON public.canary_monitoring
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- FinOps Alpha ROI Policies
CREATE POLICY "users_manage_own_finops_alpha_roi"
ON public.finops_alpha_roi
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 7: Update Triggers for all tables
CREATE TRIGGER update_live_sizing_updated_at
    BEFORE UPDATE ON public.live_sizing
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vol_targets_updated_at
    BEFORE UPDATE ON public.vol_targets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meta_labels_updated_at
    BEFORE UPDATE ON public.meta_labels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exec_tca_updated_at
    BEFORE UPDATE ON public.exec_tca
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regime_params_updated_at
    BEFORE UPDATE ON public.regime_params
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_universe_live_updated_at
    BEFORE UPDATE ON public.universe_live
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_source_rewards_enhanced_updated_at
    BEFORE UPDATE ON public.source_rewards_enhanced
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stop_policies_updated_at
    BEFORE UPDATE ON public.stop_policies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_canary_monitoring_updated_at
    BEFORE UPDATE ON public.canary_monitoring
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finops_alpha_roi_updated_at
    BEFORE UPDATE ON public.finops_alpha_roi
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Step 8: Sample Performance Data for Demo
DO $$
DECLARE
    existing_user_id UUID;
    existing_strategy_id UUID;
    sample_strategy_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user and strategy
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO existing_strategy_id FROM public.strategy_candidates LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- 1. Kelly-Lite Sizing Demo Data
        INSERT INTO public.live_sizing (strategy_id, kelly_raw, kelly_capped, user_id)
        VALUES 
            (COALESCE(existing_strategy_id, sample_strategy_id), 0.025, 0.015, existing_user_id),
            (sample_strategy_id, 0.032, 0.015, existing_user_id);

        -- 2. Volatility Targets Demo Data
        INSERT INTO public.vol_targets (symbol, sigma_target_yr, sigma_realized, user_id)
        VALUES 
            ('AAPL', 0.15, 0.18, existing_user_id),
            ('TSLA', 0.25, 0.22, existing_user_id),
            ('SPY', 0.12, 0.14, existing_user_id);

        -- 3. Meta Labels Demo Data
        INSERT INTO public.meta_labels (strategy_id, primary_signal, meta_prediction, status, user_id)
        VALUES 
            (COALESCE(existing_strategy_id, sample_strategy_id), 
             '{"action": "buy", "confidence": 0.75}', 0.82, 'pass'::public.meta_label_status, existing_user_id);

        -- 4. TCA Demo Data
        INSERT INTO public.exec_tca (strategy_id, symbol, is_bps, fill_rate, adverse_sel_z, spread_bp, user_id)
        VALUES 
            (COALESCE(existing_strategy_id, sample_strategy_id), 'AAPL', 2.5, 0.95, 0.8, 1.2, existing_user_id),
            (COALESCE(existing_strategy_id, sample_strategy_id), 'TSLA', 4.2, 0.88, 1.4, 2.8, existing_user_id);

        -- 5. Regime Parameters Demo Data
        INSERT INTO public.regime_params (regime, params, user_id)
        VALUES 
            ('bull'::public.regime_type, '{"bb_len": 20, "rsi_th": 30, "aggr_cap": 0.4}', existing_user_id),
            ('bear'::public.regime_type, '{"bb_len": 14, "rsi_th": 25, "aggr_cap": 0.25}', existing_user_id);

        -- 6. Universe Live Demo Data
        INSERT INTO public.universe_live (symbol, adv_usd, vol_z, enabled, user_id)
        VALUES 
            ('AAPL', 50000000, 0.8, true, existing_user_id),
            ('TSLA', 25000000, 1.5, true, existing_user_id),
            ('NVDA', 35000000, 1.2, true, existing_user_id);

        -- 7. Source Rewards Enhanced Demo Data
        INSERT INTO public.source_rewards_enhanced (source, alpha, beta, successes, failures, user_id)
        VALUES 
            ('reuters.com', 142, 8, 142, 8, existing_user_id),
            ('bloomberg.com', 185, 15, 185, 15, existing_user_id),
            ('yahoo_finance', 95, 25, 95, 25, existing_user_id);

        -- 8. Stop Policies Demo Data
        INSERT INTO public.stop_policies (strategy_id, vol_stop_multiplier, time_stop_hours, user_id)
        VALUES 
            (COALESCE(existing_strategy_id, sample_strategy_id), 2.5, 48, existing_user_id);

        -- 9. Canary Monitoring Demo Data
        INSERT INTO public.canary_monitoring (strategy_id, canary_allocation_pct, alpha_decay_threshold, user_id)
        VALUES 
            (COALESCE(existing_strategy_id, sample_strategy_id), 0.01, -0.05, existing_user_id);

        -- 10. FinOps Alpha ROI Demo Data
        INSERT INTO public.finops_alpha_roi (strategy_id, time_window, pnl_attrib, data_cost, compute_cost, roi_alpha, user_id)
        VALUES 
            (COALESCE(existing_strategy_id, sample_strategy_id), '1d', 1250.0, 50.0, 25.0, 16.67, existing_user_id),
            (COALESCE(existing_strategy_id, sample_strategy_id), '1w', 8500.0, 350.0, 175.0, 16.19, existing_user_id);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo data insertion error: %', SQLERRM;
END $$;

-- Step 9: Create Views for Performance Dashboards

-- Kelly Sizing Performance View
CREATE VIEW public.kelly_sizing_performance AS
SELECT 
    ls.strategy_id,
    COALESCE(
        SPLIT_PART(
            SPLIT_PART(sc.spec_yaml, 'strategy_id:', 2), 
            E'\n', 1
        ), 
        'unknown'
    ) as strategy_name,
    ls.kelly_raw,
    ls.kelly_capped,
    ls.method,
    sc.iqs,
    sc.status as strategy_status,
    ls.updated_at
FROM public.live_sizing ls
JOIN public.strategy_candidates sc ON ls.strategy_id = sc.id
WHERE ls.user_id = auth.uid();

-- TCA Performance Summary View
CREATE VIEW public.tca_performance_summary AS
SELECT 
    symbol,
    COUNT(*) as trade_count,
    AVG(is_bps) as avg_is_bps,
    AVG(fill_rate) as avg_fill_rate,
    AVG(adverse_sel_z) as avg_adverse_sel,
    AVG(spread_bp) as avg_spread_bp,
    STDDEV(is_bps) as is_bps_volatility
FROM public.exec_tca
WHERE user_id = auth.uid()
AND ts >= now() - interval '30 days'
GROUP BY symbol;

-- Alpha ROI Ranking View  
CREATE VIEW public.alpha_roi_ranking AS
SELECT 
    far.strategy_id,
    COALESCE(
        SPLIT_PART(
            SPLIT_PART(sc.spec_yaml, 'strategy_id:', 2), 
            E'\n', 1
        ), 
        'unknown'
    ) as strategy_name,
    far.roi_alpha,
    far.priority_score,
    far.breed_eligible,
    RANK() OVER (ORDER BY far.roi_alpha DESC) as roi_rank
FROM public.finops_alpha_roi far
JOIN public.strategy_candidates sc ON far.strategy_id = sc.id
WHERE far.user_id = auth.uid()
AND far.time_window = '1w'
ORDER BY far.roi_alpha DESC;

-- Enable RLS on views (inherited from base tables)
-- Views automatically inherit RLS from underlying tables

-- Step 10: Comment the migration
COMMENT ON TABLE public.live_sizing IS 'AAS Performance++: Kelly-Lite adaptive sizing system';
COMMENT ON TABLE public.vol_targets IS 'AAS Performance++: Volatility targeting for risk normalization';
COMMENT ON TABLE public.meta_labels IS 'AAS Performance++: Meta-labeling system for signal validation';
COMMENT ON TABLE public.exec_tca IS 'AAS Performance++: Transaction cost analysis and slippage modeling';
COMMENT ON TABLE public.regime_params IS 'AAS Performance++: Regime-conditional hyperparameters';
COMMENT ON TABLE public.universe_live IS 'AAS Performance++: Dynamic universe with capacity awareness';
COMMENT ON TABLE public.source_rewards_enhanced IS 'AAS Performance++: Thompson sampling for source selection';
COMMENT ON TABLE public.stop_policies IS 'AAS Performance++: Volatility and time-based stop management';
COMMENT ON TABLE public.canary_monitoring IS 'AAS Performance++: Canary deployment and alpha decay monitoring';
COMMENT ON TABLE public.finops_alpha_roi IS 'AAS Performance++: Cost/alpha optimization for compute prioritization';