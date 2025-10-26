-- Location: supabase/migrations/20251015115407_multi_ia_trading_orchestrator_system.sql
-- Multi-IA Trading Orchestrator System - Production Ready IBKR Integration
-- Schema Analysis: Building upon existing ai_agents, orders, event_bus tables
-- Integration Type: Additive enhancement to existing trading infrastructure
-- Dependencies: ai_agents, orders, user_profiles, event_bus

-- 1. Enhanced Types for Multi-IA Trading System (WITH SAFE CREATION)
-- Create types only if they don't exist
DO $$
BEGIN
    -- Create ia_agent_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ia_agent_type') THEN
        CREATE TYPE public.ia_agent_type AS ENUM ('strategy', 'risk', 'validation', 'execution', 'orchestrator');
    END IF;
    
    -- Create decision_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'decision_status') THEN
        CREATE TYPE public.decision_status AS ENUM ('pending', 'approved', 'rejected', 'consensus_reached', 'consensus_failed');
    END IF;
    
    -- Create order_execution_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_execution_status') THEN
        CREATE TYPE public.order_execution_status AS ENUM ('planned', 'submitted', 'filled', 'partially_filled', 'cancelled', 'rejected', 'error');
    END IF;
    
    -- Handle risk_level type - it may already exist, so we check and extend if needed
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
        CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high', 'extreme');
    ELSE
        -- If risk_level exists, ensure all our required values are present
        ALTER TYPE public.risk_level ADD VALUE IF NOT EXISTS 'low';
        ALTER TYPE public.risk_level ADD VALUE IF NOT EXISTS 'medium';
        ALTER TYPE public.risk_level ADD VALUE IF NOT EXISTS 'high';
        ALTER TYPE public.risk_level ADD VALUE IF NOT EXISTS 'extreme';
    END IF;
    
    -- Create market_session if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'market_session') THEN
        CREATE TYPE public.market_session AS ENUM ('pre_market', 'regular', 'after_hours', 'closed');
    END IF;
END $$;

-- 2. Policy Engine Configuration
CREATE TABLE IF NOT EXISTS public.policy_engine_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    max_pos_per_symbol INTEGER DEFAULT 1000,
    max_notional_per_symbol DECIMAL(15,2) DEFAULT 25000.00,
    max_leverage DECIMAL(5,2) DEFAULT 2.00,
    daily_loss_stop DECIMAL(15,2) DEFAULT -500.00,
    allow_extended_hours BOOLEAN DEFAULT false,
    trading_enabled BOOLEAN DEFAULT true,
    kill_switch_active BOOLEAN DEFAULT false,
    config_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. IA Decisions and Consensus System
CREATE TABLE IF NOT EXISTS public.ia_trading_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_order_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
    order_type TEXT NOT NULL CHECK (order_type IN ('MKT', 'LMT', 'STP', 'STP_LMT', 'BRACKET')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    limit_price DECIMAL(15,4),
    stop_price DECIMAL(15,4),
    tif TEXT DEFAULT 'DAY' CHECK (tif IN ('DAY', 'GTC', 'IOC', 'FOK')),
    strategy_decision JSONB,
    risk_decision JSONB,
    validation_decision JSONB,
    execution_decision JSONB,
    consensus_status public.decision_status DEFAULT 'pending',
    approvals_count INTEGER DEFAULT 0,
    final_decision JSONB,
    decision_rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enhanced Order Store with IBKR Integration
CREATE TABLE IF NOT EXISTS public.ibkr_order_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_order_id UUID REFERENCES public.ia_trading_decisions(client_order_id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    ibkr_order_id BIGINT,
    account_id TEXT NOT NULL DEFAULT 'DUN766038',
    route TEXT DEFAULT 'TWS' CHECK (route IN ('TWS', 'CPAPI')),
    symbol TEXT NOT NULL,
    sec_type TEXT DEFAULT 'STK' CHECK (sec_type IN ('STK', 'OPT', 'FUT', 'CASH', 'CFD')),
    exchange TEXT DEFAULT 'SMART',
    currency TEXT DEFAULT 'USD',
    action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
    order_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    limit_price DECIMAL(15,4),
    stop_price DECIMAL(15,4),
    tif TEXT DEFAULT 'DAY',
    execution_status public.order_execution_status DEFAULT 'planned',
    dry_run BOOLEAN DEFAULT true,
    order_metadata JSONB DEFAULT '{}',
    fill_data JSONB DEFAULT '[]',
    error_message TEXT,
    submitted_at TIMESTAMPTZ,
    filled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Trading Telemetry and Audit Trail
CREATE TABLE IF NOT EXISTS public.trading_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_order_id UUID REFERENCES public.ia_trading_decisions(client_order_id),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_source TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    latency_ms INTEGER,
    error_code TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warn', 'error', 'critical')),
    correlation_id UUID,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Market Session and Trading Hours
CREATE TABLE IF NOT EXISTS public.market_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    exchange TEXT NOT NULL,
    session_type public.market_session NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'America/New_York',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Risk Metrics Tracking
CREATE TABLE IF NOT EXISTS public.real_time_risk_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    symbol TEXT,
    current_position INTEGER DEFAULT 0,
    current_notional DECIMAL(15,2) DEFAULT 0.00,
    daily_pnl DECIMAL(15,2) DEFAULT 0.00,
    unrealized_pnl DECIMAL(15,2) DEFAULT 0.00,
    risk_level public.risk_level DEFAULT 'low',
    var_95 DECIMAL(15,2),
    exposure_percentage DECIMAL(5,2),
    last_calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Indexes for Performance (CREATE IF NOT EXISTS equivalent using DO block)
DO $$
BEGIN
    -- ia_trading_decisions indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ia_trading_decisions_user_id') THEN
        CREATE INDEX idx_ia_trading_decisions_user_id ON public.ia_trading_decisions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ia_trading_decisions_client_order_id') THEN
        CREATE INDEX idx_ia_trading_decisions_client_order_id ON public.ia_trading_decisions(client_order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ia_trading_decisions_consensus_status') THEN
        CREATE INDEX idx_ia_trading_decisions_consensus_status ON public.ia_trading_decisions(consensus_status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ia_trading_decisions_created_at') THEN
        CREATE INDEX idx_ia_trading_decisions_created_at ON public.ia_trading_decisions(created_at);
    END IF;

    -- ibkr_order_store indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ibkr_order_store_client_order_id') THEN
        CREATE INDEX idx_ibkr_order_store_client_order_id ON public.ibkr_order_store(client_order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ibkr_order_store_user_id') THEN
        CREATE INDEX idx_ibkr_order_store_user_id ON public.ibkr_order_store(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ibkr_order_store_execution_status') THEN
        CREATE INDEX idx_ibkr_order_store_execution_status ON public.ibkr_order_store(execution_status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ibkr_order_store_symbol') THEN
        CREATE INDEX idx_ibkr_order_store_symbol ON public.ibkr_order_store(symbol);
    END IF;

    -- trading_telemetry indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trading_telemetry_client_order_id') THEN
        CREATE INDEX idx_trading_telemetry_client_order_id ON public.trading_telemetry(client_order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trading_telemetry_user_id') THEN
        CREATE INDEX idx_trading_telemetry_user_id ON public.trading_telemetry(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trading_telemetry_event_type') THEN
        CREATE INDEX idx_trading_telemetry_event_type ON public.trading_telemetry(event_type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trading_telemetry_created_at') THEN
        CREATE INDEX idx_trading_telemetry_created_at ON public.trading_telemetry(created_at);
    END IF;

    -- Other indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_policy_engine_config_user_id') THEN
        CREATE INDEX idx_policy_engine_config_user_id ON public.policy_engine_config(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_real_time_risk_metrics_user_id') THEN
        CREATE INDEX idx_real_time_risk_metrics_user_id ON public.real_time_risk_metrics(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_real_time_risk_metrics_symbol') THEN
        CREATE INDEX idx_real_time_risk_metrics_symbol ON public.real_time_risk_metrics(symbol);
    END IF;
END $$;

-- 9. Functions for Multi-IA System (MUST BE BEFORE RLS POLICIES)

-- Idempotence checker for client orders
CREATE OR REPLACE FUNCTION public.is_order_duplicate(order_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.ibkr_order_store ios
    WHERE ios.client_order_id = order_id_param
)
$$;

-- Policy engine validation
CREATE OR REPLACE FUNCTION public.validate_trading_policy(
    user_id_param UUID,
    symbol_param TEXT,
    quantity_param INTEGER,
    notional_param DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    policy_config RECORD;
    current_position INTEGER := 0;
    current_notional DECIMAL := 0.00;
    daily_pnl DECIMAL := 0.00;
    result JSONB := '{"allowed": true, "reason": ""}';
BEGIN
    -- Get user policy configuration
    SELECT * INTO policy_config
    FROM public.policy_engine_config pec
    WHERE pec.user_id = user_id_param
    LIMIT 1;
    
    -- Use defaults if no config found
    IF policy_config IS NULL THEN
        policy_config := ROW(
            gen_random_uuid(), user_id_param, 1000, 25000.00, 2.00, -500.00,
            false, true, false, '{}', NOW(), NOW()
        );
    END IF;
    
    -- Check kill switch
    IF policy_config.kill_switch_active OR NOT policy_config.trading_enabled THEN
        result := '{"allowed": false, "reason": "Trading disabled by kill switch"}';
        RETURN result;
    END IF;
    
    -- Get current metrics
    SELECT 
        COALESCE(current_position, 0),
        COALESCE(current_notional, 0.00),
        COALESCE(daily_pnl, 0.00)
    INTO current_position, current_notional, daily_pnl
    FROM public.real_time_risk_metrics rtm
    WHERE rtm.user_id = user_id_param AND rtm.symbol = symbol_param
    LIMIT 1;
    
    -- Check position limits
    IF ABS(current_position + quantity_param) > policy_config.max_pos_per_symbol THEN
        result := '{"allowed": false, "reason": "Position limit exceeded"}';
        RETURN result;
    END IF;
    
    -- Check notional limits
    IF (current_notional + notional_param) > policy_config.max_notional_per_symbol THEN
        result := '{"allowed": false, "reason": "Notional limit exceeded"}';
        RETURN result;
    END IF;
    
    -- Check daily loss limit
    IF daily_pnl < policy_config.daily_loss_stop THEN
        result := '{"allowed": false, "reason": "Daily loss limit reached"}';
        RETURN result;
    END IF;
    
    RETURN result;
END;
$$;

-- Market hours validation
CREATE OR REPLACE FUNCTION public.is_market_open(symbol_param TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.market_sessions ms
    WHERE ms.symbol = symbol_param
    AND ms.is_active = true
    AND CURRENT_TIME BETWEEN ms.start_time AND ms.end_time
    AND ms.session_type = 'regular'
)
$$;

-- IA consensus calculator
CREATE OR REPLACE FUNCTION public.calculate_ia_consensus(decision_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
AS $$
DECLARE
    decision_record RECORD;
    approvals INTEGER := 0;
    consensus_result JSONB;
BEGIN
    -- Get the decision record
    SELECT * INTO decision_record
    FROM public.ia_trading_decisions itd
    WHERE itd.id = decision_id;
    
    IF decision_record IS NULL THEN
        RETURN '{"consensus": false, "reason": "Decision not found"}';
    END IF;
    
    -- Count approvals from each IA
    IF (decision_record.strategy_decision->>'approved')::BOOLEAN = true THEN
        approvals := approvals + 1;
    END IF;
    
    IF (decision_record.risk_decision->>'approved')::BOOLEAN = true THEN
        approvals := approvals + 1;
    END IF;
    
    IF (decision_record.validation_decision->>'approved')::BOOLEAN = true THEN
        approvals := approvals + 1;
    END IF;
    
    -- Consensus requires at least 2/3 approvals
    IF approvals >= 2 THEN
        consensus_result := json_build_object(
            'consensus', true,
            'approvals', approvals,
            'status', 'consensus_reached',
            'reason', 'Minimum 2/3 IA approval achieved'
        );
    ELSE
        consensus_result := json_build_object(
            'consensus', false,
            'approvals', approvals,
            'status', 'consensus_failed',
            'reason', 'Insufficient IA approvals (need 2/3)'
        );
    END IF;
    
    -- Update the decision record
    UPDATE public.ia_trading_decisions
    SET 
        approvals_count = approvals,
        consensus_status = (consensus_result->>'status')::public.decision_status,
        final_decision = consensus_result,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = decision_id;
    
    RETURN consensus_result;
END;
$$;

-- Telemetry logging function
CREATE OR REPLACE FUNCTION public.log_trading_event(
    client_order_id_param UUID,
    user_id_param UUID,
    event_type_param TEXT,
    event_source_param TEXT,
    event_data_param JSONB DEFAULT '{}',
    latency_ms_param INTEGER DEFAULT NULL,
    error_code_param TEXT DEFAULT NULL,
    severity_param TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE sql
VOLATILE
SECURITY DEFINER
AS $$
INSERT INTO public.trading_telemetry (
    client_order_id, user_id, event_type, event_source,
    event_data, latency_ms, error_code, severity
)
VALUES (
    client_order_id_param, user_id_param, event_type_param, event_source_param,
    event_data_param, latency_ms_param, error_code_param, severity_param
)
RETURNING id;
$$;

-- 10. Enable RLS on all tables (ONLY if not already enabled)
DO $$
BEGIN
    -- Enable RLS only if tables exist and RLS is not already enabled
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'policy_engine_config') THEN
        ALTER TABLE public.policy_engine_config ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ia_trading_decisions') THEN
        ALTER TABLE public.ia_trading_decisions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ibkr_order_store') THEN
        ALTER TABLE public.ibkr_order_store ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trading_telemetry') THEN
        ALTER TABLE public.trading_telemetry ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_sessions') THEN
        ALTER TABLE public.market_sessions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'real_time_risk_metrics') THEN
        ALTER TABLE public.real_time_risk_metrics ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 11. RLS Policies using Pattern 2 (Simple User Ownership) - SAFE CREATION
DO $$
BEGIN
    -- Policy Engine Config
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_manage_own_policy_engine_config') THEN
        CREATE POLICY "users_manage_own_policy_engine_config"
        ON public.policy_engine_config
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;

    -- IA Trading Decisions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_manage_own_ia_trading_decisions') THEN
        CREATE POLICY "users_manage_own_ia_trading_decisions"
        ON public.ia_trading_decisions
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;

    -- IBKR Order Store
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_manage_own_ibkr_order_store') THEN
        CREATE POLICY "users_manage_own_ibkr_order_store"
        ON public.ibkr_order_store
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;

    -- Trading Telemetry
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_manage_own_trading_telemetry') THEN
        CREATE POLICY "users_manage_own_trading_telemetry"
        ON public.trading_telemetry
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;

    -- Real-time Risk Metrics
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_manage_own_real_time_risk_metrics') THEN
        CREATE POLICY "users_manage_own_real_time_risk_metrics"
        ON public.real_time_risk_metrics
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;

    -- Market Sessions (Public read, admin write)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_can_read_market_sessions') THEN
        CREATE POLICY "public_can_read_market_sessions"
        ON public.market_sessions
        FOR SELECT
        TO public
        USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_can_manage_market_sessions') THEN
        CREATE POLICY "authenticated_can_manage_market_sessions"
        ON public.market_sessions
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 12. Insert Default Market Sessions (SAFE INSERT)
INSERT INTO public.market_sessions (symbol, exchange, session_type, start_time, end_time)
SELECT '*', 'NYSE', 'regular', '09:30:00', '16:00:00'
WHERE NOT EXISTS (SELECT 1 FROM public.market_sessions WHERE symbol = '*' AND exchange = 'NYSE' AND session_type = 'regular');

INSERT INTO public.market_sessions (symbol, exchange, session_type, start_time, end_time)
SELECT '*', 'NASDAQ', 'regular', '09:30:00', '16:00:00'
WHERE NOT EXISTS (SELECT 1 FROM public.market_sessions WHERE symbol = '*' AND exchange = 'NASDAQ' AND session_type = 'regular');

INSERT INTO public.market_sessions (symbol, exchange, session_type, start_time, end_time)
SELECT '*', 'NYSE', 'pre_market', '04:00:00', '09:30:00'
WHERE NOT EXISTS (SELECT 1 FROM public.market_sessions WHERE symbol = '*' AND exchange = 'NYSE' AND session_type = 'pre_market');

INSERT INTO public.market_sessions (symbol, exchange, session_type, start_time, end_time)
SELECT '*', 'NASDAQ', 'pre_market', '04:00:00', '09:30:00'
WHERE NOT EXISTS (SELECT 1 FROM public.market_sessions WHERE symbol = '*' AND exchange = 'NASDAQ' AND session_type = 'pre_market');

INSERT INTO public.market_sessions (symbol, exchange, session_type, start_time, end_time)
SELECT '*', 'NYSE', 'after_hours', '16:00:00', '20:00:00'
WHERE NOT EXISTS (SELECT 1 FROM public.market_sessions WHERE symbol = '*' AND exchange = 'NYSE' AND session_type = 'after_hours');

INSERT INTO public.market_sessions (symbol, exchange, session_type, start_time, end_time)
SELECT '*', 'NASDAQ', 'after_hours', '16:00:00', '20:00:00'
WHERE NOT EXISTS (SELECT 1 FROM public.market_sessions WHERE symbol = '*' AND exchange = 'NASDAQ' AND session_type = 'after_hours');

-- 13. Mock Data for Testing Multi-IA System (SAFE INSERT)
DO $$
DECLARE
    existing_user_id UUID;
    test_client_order_id UUID := gen_random_uuid();
    policy_config_id UUID := gen_random_uuid();
BEGIN
    -- Get existing user ID from user_profiles
    SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert default policy configuration (SAFE INSERT)
        INSERT INTO public.policy_engine_config (
            id, user_id, max_pos_per_symbol, max_notional_per_symbol,
            max_leverage, daily_loss_stop, allow_extended_hours,
            trading_enabled, kill_switch_active
        )
        SELECT 
            policy_config_id, existing_user_id, 1000, 25000.00,
            2.00, -500.00, false, true, false
        WHERE NOT EXISTS (
            SELECT 1 FROM public.policy_engine_config WHERE user_id = existing_user_id
        );
        
        -- Insert sample IA trading decision (SAFE INSERT)
        INSERT INTO public.ia_trading_decisions (
            client_order_id, user_id, symbol, action, order_type, quantity, limit_price,
            strategy_decision, risk_decision, validation_decision,
            consensus_status, decision_rationale
        )
        SELECT 
            test_client_order_id, existing_user_id, 'AAPL', 'BUY', 'LMT', 10, 190.00,
            '{"approved": true, "confidence": 0.85, "reasoning": "Technical breakout detected"}',
            '{"approved": true, "risk_score": 0.3, "max_quantity": 15}',
            '{"approved": true, "market_open": true, "within_limits": true}',
            'pending', 'Multi-IA analysis shows strong buy signal with acceptable risk'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.ia_trading_decisions WHERE client_order_id = test_client_order_id
        );
        
        -- Insert corresponding order store record (SAFE INSERT)
        INSERT INTO public.ibkr_order_store (
            client_order_id, user_id, symbol, action, order_type, quantity, limit_price,
            execution_status, dry_run, order_metadata
        )
        SELECT 
            test_client_order_id, existing_user_id, 'AAPL', 'BUY', 'LMT', 10, 190.00,
            'planned', true, '{"strategy": "momentum-v1", "risk_score": 0.3}'
        WHERE NOT EXISTS (
            SELECT 1 FROM public.ibkr_order_store WHERE client_order_id = test_client_order_id
        );
        
        -- Insert risk metrics (SAFE INSERT)
        INSERT INTO public.real_time_risk_metrics (
            user_id, symbol, current_position, current_notional,
            daily_pnl, risk_level, exposure_percentage
        )
        SELECT 
            existing_user_id, 'AAPL', 0, 0.00, 0.00, 'low', 0.00
        WHERE NOT EXISTS (
            SELECT 1 FROM public.real_time_risk_metrics WHERE user_id = existing_user_id AND symbol = 'AAPL'
        );
        
        -- Log initial trading event (SAFE INSERT)
        IF NOT EXISTS (SELECT 1 FROM public.trading_telemetry WHERE client_order_id = test_client_order_id) THEN
            PERFORM public.log_trading_event(
                test_client_order_id, existing_user_id, 'decision_created', 'multi_ia_orchestrator',
                '{"action": "BUY", "symbol": "AAPL", "quantity": 10}', null, null, 'info'
            );
        END IF;
    ELSE
        RAISE NOTICE 'No existing users found. Multi-IA system ready but requires user creation.';
    END IF;
END $$;

-- Success message
SELECT 'Multi-IA Trading Orchestrator System migration completed successfully!' AS status;