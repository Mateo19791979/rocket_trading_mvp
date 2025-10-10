-- Location: supabase/migrations/20251004200000_add_paper_trading_security_system.sql
-- Schema Analysis: Existing comprehensive trading system with feature_flags, orders, trades, portfolios, risk_controller, shadow_prices, user_profiles
-- Integration Type: NEW_MODULE - Paper trading security enhancements
-- Dependencies: feature_flags, orders, trades, portfolios, risk_controller, shadow_prices, user_profiles, assets

-- Paper Trading Security Module Implementation
-- Implements: Feature flag broker, Shadow portfolios, Trade audit logging, Telegram alerts

-- 1. SHADOW PORTFOLIOS - Extend existing shadow pricing to portfolio level
CREATE TABLE public.shadow_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
    shadow_total_value NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    shadow_cash_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    shadow_unrealized_pnl NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    shadow_realized_pnl NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    shadow_positions JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRADING AUDIT LOG - Log all trading activity with security tracking
CREATE TABLE public.trading_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('trade_attempt', 'live_order_blocked', 'paper_order_executed', 'killswitch_triggered', 'broker_flag_change')),
    trading_mode public.trading_mode NOT NULL,
    order_data JSONB,
    trade_data JSONB,
    blocked_reason TEXT,
    alert_sent BOOLEAN DEFAULT false,
    telegram_message_id TEXT,
    ip_address INET,
    user_agent TEXT,
    session_info JSONB,
    severity_level TEXT DEFAULT 'info' CHECK (severity_level IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. TELEGRAM ALERT CONFIGS - Configuration for security alerts
CREATE TABLE public.telegram_alert_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    chat_id TEXT NOT NULL,
    bot_token TEXT NOT NULL,
    alert_types TEXT[] DEFAULT '{"live_order_blocked", "killswitch_triggered", "suspicious_activity"}'::TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. INDEXES for performance
CREATE INDEX idx_shadow_portfolios_user_id ON public.shadow_portfolios(user_id);
CREATE INDEX idx_shadow_portfolios_portfolio_id ON public.shadow_portfolios(portfolio_id);
CREATE INDEX idx_shadow_portfolios_last_updated ON public.shadow_portfolios(last_updated);

CREATE INDEX idx_trading_audit_logs_user_id ON public.trading_audit_logs(user_id);
CREATE INDEX idx_trading_audit_logs_created_at ON public.trading_audit_logs(created_at);
CREATE INDEX idx_trading_audit_logs_action_type ON public.trading_audit_logs(action_type);
CREATE INDEX idx_trading_audit_logs_trading_mode ON public.trading_audit_logs(trading_mode);
CREATE INDEX idx_trading_audit_logs_alert_sent ON public.trading_audit_logs(alert_sent);

CREATE INDEX idx_telegram_alert_configs_user_id ON public.telegram_alert_configs(user_id);
CREATE INDEX idx_telegram_alert_configs_is_active ON public.telegram_alert_configs(is_active);

-- 5. FUNCTIONS for paper trading security operations
CREATE OR REPLACE FUNCTION public.log_trading_audit(
    p_user_id UUID,
    p_action_type TEXT,
    p_trading_mode public.trading_mode,
    p_order_data JSONB DEFAULT NULL,
    p_trade_data JSONB DEFAULT NULL,
    p_blocked_reason TEXT DEFAULT NULL,
    p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    audit_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.trading_audit_logs (
        id, user_id, action_type, trading_mode, order_data, 
        trade_data, blocked_reason, severity_level
    ) VALUES (
        audit_id, p_user_id, p_action_type, p_trading_mode, 
        p_order_data, p_trade_data, p_blocked_reason, p_severity
    );
    
    RETURN audit_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to log trading audit: %', SQLERRM;
        RETURN NULL;
END;
$func$;

CREATE OR REPLACE FUNCTION public.update_shadow_portfolio(
    p_user_id UUID,
    p_portfolio_id UUID,
    p_shadow_positions JSONB,
    p_shadow_total_value NUMERIC DEFAULT NULL,
    p_shadow_cash_balance NUMERIC DEFAULT NULL,
    p_shadow_unrealized_pnl NUMERIC DEFAULT NULL,
    p_shadow_realized_pnl NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
    INSERT INTO public.shadow_portfolios (
        user_id, portfolio_id, shadow_positions, shadow_total_value,
        shadow_cash_balance, shadow_unrealized_pnl, shadow_realized_pnl
    ) VALUES (
        p_user_id, p_portfolio_id, p_shadow_positions, 
        COALESCE(p_shadow_total_value, 0), COALESCE(p_shadow_cash_balance, 0),
        COALESCE(p_shadow_unrealized_pnl, 0), COALESCE(p_shadow_realized_pnl, 0)
    )
    ON CONFLICT (user_id, portfolio_id) 
    DO UPDATE SET
        shadow_positions = EXCLUDED.shadow_positions,
        shadow_total_value = COALESCE(EXCLUDED.shadow_total_value, shadow_portfolios.shadow_total_value),
        shadow_cash_balance = COALESCE(EXCLUDED.shadow_cash_balance, shadow_portfolios.shadow_cash_balance),
        shadow_unrealized_pnl = COALESCE(EXCLUDED.shadow_unrealized_pnl, shadow_portfolios.shadow_unrealized_pnl),
        shadow_realized_pnl = COALESCE(EXCLUDED.shadow_realized_pnl, shadow_portfolios.shadow_realized_pnl),
        last_updated = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to update shadow portfolio: %', SQLERRM;
        RETURN false;
END;
$func$;

CREATE OR REPLACE FUNCTION public.check_broker_flag()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $func$
SELECT COALESCE(
    (SELECT ff.value 
     FROM public.feature_flags ff 
     WHERE ff.key = 'BROKER' AND ff.is_active = true
     ORDER BY ff.updated_at DESC
     LIMIT 1),
    'paper'
)::TEXT;
$func$;

CREATE OR REPLACE FUNCTION public.is_paper_mode_enabled()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $func$
SELECT public.check_broker_flag() IN ('mock', 'disabled', 'paper');
$func$;

-- 6. UNIQUE CONSTRAINT for shadow portfolios
ALTER TABLE public.shadow_portfolios 
ADD CONSTRAINT unique_shadow_portfolio_per_user 
UNIQUE (user_id, portfolio_id);

-- 7. ENABLE RLS
ALTER TABLE public.shadow_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_alert_configs ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICIES using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_shadow_portfolios"
ON public.shadow_portfolios
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_trading_audit_logs"
ON public.trading_audit_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_telegram_alert_configs"
ON public.telegram_alert_configs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. TRIGGERS for automatic timestamps
CREATE TRIGGER update_shadow_portfolios_updated_at
    BEFORE UPDATE ON public.shadow_portfolios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_alert_configs_updated_at
    BEFORE UPDATE ON public.telegram_alert_configs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. INSERT REQUIRED FEATURE FLAGS for broker control
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin found, use first user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM public.user_profiles LIMIT 1;
    END IF;
    
    -- Insert BROKER feature flag if not exists
    INSERT INTO public.feature_flags (key, value, flag_type, is_active, description, environment, created_by)
    VALUES (
        'BROKER',
        'paper',
        'string',
        true,
        'Trading broker mode: paper (safe), mock (disabled), or live (real trading)',
        'production',
        admin_user_id
    )
    ON CONFLICT (key) DO NOTHING;
    
    -- Insert PAPER_MODE_BANNER flag
    INSERT INTO public.feature_flags (key, value, flag_type, is_active, description, environment, created_by)
    VALUES (
        'PAPER_MODE_BANNER',
        'true',
        'boolean',
        true,
        'Show paper mode banner in UI when not in live mode',
        'all',
        admin_user_id
    )
    ON CONFLICT (key) DO NOTHING;
    
    -- Insert LIVE_TRADING_ENABLED flag
    INSERT INTO public.feature_flags (key, value, flag_type, is_active, description, environment, created_by)
    VALUES (
        'LIVE_TRADING_ENABLED',
        'false',
        'boolean',
        true,
        'Enable live trading endpoints (/trade/live)',
        'production',
        admin_user_id
    )
    ON CONFLICT (key) DO NOTHING;
    
    -- Insert TELEGRAM_ALERTS_ENABLED flag
    INSERT INTO public.feature_flags (key, value, flag_type, is_active, description, environment, created_by)
    VALUES (
        'TELEGRAM_ALERTS_ENABLED',
        'true',
        'boolean',
        true,
        'Enable Telegram alerts for blocked live trades and security events',
        'all',
        admin_user_id
    )
    ON CONFLICT (key) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to insert feature flags: %', SQLERRM;
END $$;

-- 11. MOCK DATA for testing paper trading security
DO $$
DECLARE
    test_user_id UUID;
    test_portfolio_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get existing user and portfolio for testing
    SELECT id INTO test_user_id FROM public.user_profiles LIMIT 1;
    SELECT id INTO test_portfolio_id FROM public.portfolios WHERE user_id = test_user_id LIMIT 1;
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_portfolio_id IS NOT NULL THEN
        -- Create shadow portfolio
        INSERT INTO public.shadow_portfolios (
            user_id, portfolio_id, shadow_total_value, shadow_cash_balance,
            shadow_unrealized_pnl, shadow_realized_pnl, shadow_positions
        ) VALUES (
            test_user_id, test_portfolio_id, 125000.00, 25000.00,
            2500.00, 1250.00,
            '[
                {"symbol": "AAPL", "quantity": 50, "avg_price": 175.50, "current_price": 177.25, "unrealized_pnl": 87.50},
                {"symbol": "MSFT", "quantity": 30, "avg_price": 285.75, "current_price": 290.10, "unrealized_pnl": 130.50}
            ]'::jsonb
        )
        ON CONFLICT (user_id, portfolio_id) DO NOTHING;
        
        -- Create sample audit logs
        INSERT INTO public.trading_audit_logs (
            user_id, action_type, trading_mode, order_data, blocked_reason, severity_level
        ) VALUES 
        (
            test_user_id, 'live_order_blocked', 'paper',
            '{"symbol": "AAPL", "quantity": 100, "order_type": "market", "side": "buy"}'::jsonb,
            'Live trading disabled - BROKER flag set to paper mode',
            'warning'
        ),
        (
            test_user_id, 'paper_order_executed', 'paper',
            '{"symbol": "MSFT", "quantity": 50, "order_type": "limit", "side": "sell", "price": 290.00}'::jsonb,
            NULL,
            'info'
        );
        
        -- Create Telegram config if admin exists
        IF admin_user_id IS NOT NULL THEN
            INSERT INTO public.telegram_alert_configs (
                user_id, chat_id, bot_token, alert_types, is_active
            ) VALUES (
                admin_user_id, 
                '-1001234567890',
                'placeholder_bot_token',
                '{"live_order_blocked", "killswitch_triggered", "suspicious_activity"}'::TEXT[],
                true
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to insert mock data: %', SQLERRM;
END $$;