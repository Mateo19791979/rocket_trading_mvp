-- Location: supabase/migrations/20251213145000_add_ibkr_gateway_trading_system.sql
-- Schema Analysis: Trading system with IBKR Gateway as exclusive data source
-- Integration Type: IBKR Gateway trading data storage and management
-- Dependencies: Existing user authentication system

-- 1. IBKR Trading Data Types
CREATE TYPE public.trade_side AS ENUM ('BUY', 'SELL');
CREATE TYPE public.order_status AS ENUM ('submitted', 'filled', 'cancelled', 'rejected', 'pending');
CREATE TYPE public.trading_source AS ENUM ('IBKR', 'IBKR_PAPER', 'IBKR_LIVE');

-- 2. IBKR Daily Metrics Table - Stockage des performances journalières
CREATE TABLE public.ibkr_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trading_date DATE NOT NULL,
    today_trades INTEGER DEFAULT 0,
    daily_pnl DECIMAL(15,2) DEFAULT 0,
    daily_pnl_percent DECIMAL(8,4) DEFAULT 0,
    active_positions INTEGER DEFAULT 0,
    last_activity TEXT,
    win_rate DECIMAL(5,2) DEFAULT 0,
    total_volume DECIMAL(15,2) DEFAULT 0,
    avg_trade_size DECIMAL(15,2) DEFAULT 0,
    source TEXT DEFAULT 'IBKR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, trading_date)
);

-- 3. Trades Table - Stockage des trades IBKR
CREATE TABLE public.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    side public.trade_side NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    pnl DECIMAL(15,2) DEFAULT 0,
    source public.trading_source DEFAULT 'IBKR',
    ibkr_order_id TEXT,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table - Stockage des ordres IBKR
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    side public.trade_side NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(15,4),
    order_type TEXT DEFAULT 'market',
    status public.order_status DEFAULT 'submitted',
    source public.trading_source DEFAULT 'IBKR',
    ibkr_order_id TEXT UNIQUE,
    filled_quantity INTEGER DEFAULT 0,
    avg_fill_price DECIMAL(15,4),
    commission DECIMAL(10,2) DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    filled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Positions Table - Stockage des positions IBKR
CREATE TABLE public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    avg_price DECIMAL(15,4) NOT NULL,
    current_price DECIMAL(15,4),
    unrealized_pnl DECIMAL(15,2) DEFAULT 0,
    realized_pnl DECIMAL(15,2) DEFAULT 0,
    source public.trading_source DEFAULT 'IBKR',
    is_active BOOLEAN DEFAULT true,
    opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol, source)
);

-- 6. IBKR Connection Status Table - Statut des connexions Gateway
CREATE TABLE public.ibkr_connection_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trading_mode TEXT DEFAULT 'paper',
    gateway_host TEXT DEFAULT '127.0.0.1',
    gateway_port INTEGER DEFAULT 7497,
    connection_status TEXT DEFAULT 'disconnected',
    last_heartbeat TIMESTAMPTZ,
    latency_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 7. Essential Indexes pour performance IBKR
CREATE INDEX idx_ibkr_daily_metrics_user_date ON public.ibkr_daily_metrics(user_id, trading_date);
CREATE INDEX idx_ibkr_daily_metrics_date ON public.ibkr_daily_metrics(trading_date);

CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_trades_source ON public.trades(source);
CREATE INDEX idx_trades_created_at ON public.trades(created_at);
CREATE INDEX idx_trades_user_source ON public.trades(user_id, source);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_source ON public.orders(source);
CREATE INDEX idx_orders_ibkr_id ON public.orders(ibkr_order_id);

CREATE INDEX idx_positions_user_id ON public.positions(user_id);
CREATE INDEX idx_positions_source ON public.positions(source);
CREATE INDEX idx_positions_active ON public.positions(is_active);
CREATE INDEX idx_positions_user_active ON public.positions(user_id, is_active);

CREATE INDEX idx_ibkr_status_user ON public.ibkr_connection_status(user_id);

-- 8. Enable RLS sur toutes les tables IBKR
ALTER TABLE public.ibkr_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ibkr_connection_status ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies - Pattern 2 (Simple User Ownership)
-- IBKR Daily Metrics
CREATE POLICY "users_manage_own_ibkr_daily_metrics"
ON public.ibkr_daily_metrics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trades
CREATE POLICY "users_manage_own_trades"
ON public.trades
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Orders
CREATE POLICY "users_manage_own_orders"
ON public.orders
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Positions
CREATE POLICY "users_manage_own_positions"
ON public.positions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- IBKR Connection Status
CREATE POLICY "users_manage_own_ibkr_connection_status"
ON public.ibkr_connection_status
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 10. Fonctions utilitaires IBKR
CREATE OR REPLACE FUNCTION public.update_ibkr_metrics_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Triggers pour mise à jour automatique des timestamps
CREATE TRIGGER trigger_update_ibkr_daily_metrics_timestamp
    BEFORE UPDATE ON public.ibkr_daily_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ibkr_metrics_timestamp();

CREATE TRIGGER trigger_update_trades_timestamp
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ibkr_metrics_timestamp();

CREATE TRIGGER trigger_update_orders_timestamp
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ibkr_metrics_timestamp();

CREATE TRIGGER trigger_update_positions_timestamp
    BEFORE UPDATE ON public.positions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ibkr_metrics_timestamp();

CREATE TRIGGER trigger_update_ibkr_connection_status_timestamp
    BEFORE UPDATE ON public.ibkr_connection_status
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ibkr_metrics_timestamp();

-- 11. Fonction de calcul P&L temps réel
CREATE OR REPLACE FUNCTION public.calculate_daily_pnl(target_user_id UUID, target_date DATE)
RETURNS DECIMAL(15,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_pnl DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(pnl), 0) INTO total_pnl
    FROM public.trades
    WHERE user_id = target_user_id
    AND source IN ('IBKR', 'IBKR_PAPER', 'IBKR_LIVE')
    AND DATE(created_at) = target_date;
    
    RETURN total_pnl;
END;
$$;

-- 12. Fonction de récupération métriques quotidiennes
CREATE OR REPLACE FUNCTION public.get_daily_trading_summary(target_user_id UUID, target_date DATE)
RETURNS TABLE(
    trades_count INTEGER,
    total_pnl DECIMAL(15,2),
    total_volume DECIMAL(15,2),
    win_rate DECIMAL(5,2),
    active_positions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(t.id)::INTEGER as trades_count,
        COALESCE(SUM(t.pnl), 0) as total_pnl,
        COALESCE(SUM(t.quantity * t.price), 0) as total_volume,
        CASE 
            WHEN COUNT(t.id) > 0 THEN 
                (COUNT(CASE WHEN t.pnl > 0 THEN 1 END)::DECIMAL / COUNT(t.id)::DECIMAL * 100)
            ELSE 0::DECIMAL
        END as win_rate,
        (SELECT COUNT(*)::INTEGER FROM public.positions p 
         WHERE p.user_id = target_user_id 
         AND p.is_active = true 
         AND p.source IN ('IBKR', 'IBKR_PAPER', 'IBKR_LIVE')) as active_positions
    FROM public.trades t
    WHERE t.user_id = target_user_id
    AND t.source IN ('IBKR', 'IBKR_PAPER', 'IBKR_LIVE')
    AND DATE(t.created_at) = target_date;
END;
$$;

-- 13. Mock Data IBKR pour démonstration (optionnel)
DO $$
DECLARE
    demo_user_id UUID;
    demo_date DATE := CURRENT_DATE;
BEGIN
    -- Récupérer un utilisateur existant ou créer un utilisateur demo
    SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        -- Insérer métriques demo
        INSERT INTO public.ibkr_daily_metrics (
            user_id, trading_date, today_trades, daily_pnl, daily_pnl_percent,
            active_positions, last_activity, win_rate, total_volume, avg_trade_size
        ) VALUES (
            demo_user_id, demo_date, 12, 347.80, 3.48,
            8, '14:23', 75.0, 125680.45, 10473.37
        ) ON CONFLICT (user_id, trading_date) DO UPDATE SET
            today_trades = EXCLUDED.today_trades,
            daily_pnl = EXCLUDED.daily_pnl,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Insérer trades demo IBKR
        INSERT INTO public.trades (user_id, symbol, side, quantity, price, pnl, source, executed_at) VALUES
            (demo_user_id, 'AAPL', 'BUY', 100, 185.42, 124.50, 'IBKR', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
            (demo_user_id, 'TSLA', 'SELL', 50, 248.91, -89.20, 'IBKR', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
            (demo_user_id, 'NVDA', 'BUY', 25, 891.34, 245.80, 'IBKR', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
            (demo_user_id, 'MSFT', 'SELL', 75, 412.67, 156.90, 'IBKR', CURRENT_TIMESTAMP - INTERVAL '4 hours');
        
        -- Insérer positions demo IBKR
        INSERT INTO public.positions (user_id, symbol, quantity, avg_price, current_price, unrealized_pnl, source) VALUES
            (demo_user_id, 'AAPL', 200, 182.45, 185.42, 594.00, 'IBKR'),
            (demo_user_id, 'GOOGL', 30, 2745.20, 2738.15, -211.50, 'IBKR'),
            (demo_user_id, 'AMZN', 50, 3234.80, 3267.90, 1655.00, 'IBKR'),
            (demo_user_id, 'META', 80, 478.92, 485.34, 513.60, 'IBKR')
        ON CONFLICT (user_id, symbol, source) DO UPDATE SET
            quantity = EXCLUDED.quantity,
            current_price = EXCLUDED.current_price,
            unrealized_pnl = EXCLUDED.unrealized_pnl,
            updated_at = CURRENT_TIMESTAMP;
        
        -- Insérer statut connexion IBKR
        INSERT INTO public.ibkr_connection_status (user_id, connection_status, last_heartbeat, latency_ms) VALUES
            (demo_user_id, 'connected', CURRENT_TIMESTAMP, 45)
        ON CONFLICT (user_id) DO UPDATE SET
            connection_status = EXCLUDED.connection_status,
            last_heartbeat = EXCLUDED.last_heartbeat,
            latency_ms = EXCLUDED.latency_ms,
            updated_at = CURRENT_TIMESTAMP;
            
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo data insertion failed: %', SQLERRM;
END $$;