-- Location: supabase/migrations/20250101131320_enrich_trading_mvp_test_data.sql
-- Schema Analysis: Complete trading MVP system exists with 54 tables including assets, market_data, ai_agents, portfolios, user_profiles
-- Integration Type: ADDITIVE - Enriching existing data with more comprehensive test data
-- Dependencies: Existing assets, user_profiles, ai_agents, portfolios, market_data tables

-- Enrich the existing trading MVP system with comprehensive test data
-- This migration adds more assets, recent market data, active AI agents, and realistic portfolio values

DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    portfolio1_id UUID;
    portfolio2_id UUID;
    -- New assets
    msft_id UUID := gen_random_uuid();
    amzn_id UUID := gen_random_uuid();
    tsla_id UUID := gen_random_uuid();
    nvda_id UUID := gen_random_uuid();
    meta_id UUID := gen_random_uuid();
    nflx_id UUID := gen_random_uuid();
    spy_id UUID := gen_random_uuid();
    qqq_id UUID := gen_random_uuid();
    -- Crypto assets
    btc_id UUID := gen_random_uuid();
    eth_id UUID := gen_random_uuid();
    -- Get existing AAPL for reference
    existing_aapl_id UUID;
BEGIN
    -- Get existing user IDs
    SELECT id INTO user1_id FROM public.user_profiles WHERE email = 'admin@tradingai.com' LIMIT 1;
    SELECT id INTO user2_id FROM public.user_profiles WHERE email = 'trader@tradingai.com' LIMIT 1;
    
    -- Get existing portfolio IDs
    SELECT id INTO portfolio1_id FROM public.portfolios WHERE user_id = user1_id LIMIT 1;
    SELECT id INTO portfolio2_id FROM public.portfolios WHERE user_id = user2_id LIMIT 1;
    
    -- Get existing AAPL ID
    SELECT id INTO existing_aapl_id FROM public.assets WHERE symbol = 'AAPL' LIMIT 1;
    
    -- 1. ADD MORE POPULAR TRADING ASSETS
    INSERT INTO public.assets (id, symbol, name, asset_type, exchange, sector, currency, is_active, is_tradable, sync_enabled, market_cap)
    VALUES
        -- Tech Giants
        (msft_id, 'MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ', 'Technology', 'USD', true, true, true, 3000000000000),
        (amzn_id, 'AMZN', 'Amazon.com Inc.', 'stock', 'NASDAQ', 'Consumer Discretionary', 'USD', true, true, true, 1500000000000),
        (tsla_id, 'TSLA', 'Tesla Inc.', 'stock', 'NASDAQ', 'Consumer Discretionary', 'USD', true, true, true, 800000000000),
        (nvda_id, 'NVDA', 'NVIDIA Corporation', 'stock', 'NASDAQ', 'Technology', 'USD', true, true, true, 2000000000000),
        (meta_id, 'META', 'Meta Platforms Inc.', 'stock', 'NASDAQ', 'Technology', 'USD', true, true, true, 900000000000),
        (nflx_id, 'NFLX', 'Netflix Inc.', 'stock', 'NASDAQ', 'Communication Services', 'USD', true, true, true, 200000000000),
        -- ETFs
        (spy_id, 'SPY', 'SPDR S&P 500 ETF Trust', 'etf', 'NYSE', 'ETF', 'USD', true, true, true, 500000000000),
        (qqq_id, 'QQQ', 'Invesco QQQ Trust', 'etf', 'NASDAQ', 'ETF', 'USD', true, true, true, 200000000000),
        -- Crypto (simulated as stocks for trading)
        (btc_id, 'BTC-USD', 'Bitcoin USD', 'cryptocurrency', 'CRYPTO', 'Cryptocurrency', 'USD', true, true, true, 1000000000000),
        (eth_id, 'ETH-USD', 'Ethereum USD', 'cryptocurrency', 'CRYPTO', 'Cryptocurrency', 'USD', true, true, true, 400000000000);

    -- 2. ADD FRESH MARKET DATA (recent timestamps)
    INSERT INTO public.market_data (asset_id, timestamp, open_price, high_price, low_price, close_price, volume, api_provider, data_source, is_real_time, last_updated)
    VALUES
        -- Current session data (today)
        (existing_aapl_id, NOW() - INTERVAL '1 hour', 178.50, 179.25, 177.80, 178.90, 25000000, 'google_finance', 'api', true, NOW()),
        (msft_id, NOW() - INTERVAL '1 hour', 415.20, 417.50, 414.10, 416.80, 18000000, 'google_finance', 'api', true, NOW()),
        (amzn_id, NOW() - INTERVAL '1 hour', 155.40, 157.20, 154.80, 156.75, 35000000, 'google_finance', 'api', true, NOW()),
        (tsla_id, NOW() - INTERVAL '1 hour', 248.30, 252.10, 245.90, 250.45, 45000000, 'google_finance', 'api', true, NOW()),
        (nvda_id, NOW() - INTERVAL '1 hour', 875.20, 882.50, 870.10, 879.30, 28000000, 'google_finance', 'api', true, NOW()),
        (meta_id, NOW() - INTERVAL '1 hour', 485.70, 489.20, 482.40, 487.65, 15000000, 'google_finance', 'api', true, NOW()),
        (nflx_id, NOW() - INTERVAL '1 hour', 625.80, 630.40, 622.30, 628.90, 8000000, 'google_finance', 'api', true, NOW()),
        (spy_id, NOW() - INTERVAL '1 hour', 478.20, 479.80, 477.50, 479.15, 50000000, 'google_finance', 'api', true, NOW()),
        (qqq_id, NOW() - INTERVAL '1 hour', 405.60, 407.30, 404.80, 406.90, 32000000, 'google_finance', 'api', true, NOW()),
        (btc_id, NOW() - INTERVAL '1 hour', 97500.00, 98200.00, 96800.00, 97850.00, 2500000, 'coinbase', 'api', true, NOW()),
        (eth_id, NOW() - INTERVAL '1 hour', 3850.00, 3920.00, 3810.00, 3885.00, 8000000, 'coinbase', 'api', true, NOW()),
        
        -- Historical data for charts (past week)
        (existing_aapl_id, NOW() - INTERVAL '1 day', 177.20, 178.80, 176.50, 178.50, 30000000, 'google_finance', 'api', true, NOW() - INTERVAL '1 day'),
        (existing_aapl_id, NOW() - INTERVAL '2 days', 175.90, 177.40, 175.20, 177.20, 28000000, 'google_finance', 'api', true, NOW() - INTERVAL '2 days'),
        (msft_id, NOW() - INTERVAL '1 day', 412.80, 415.50, 411.90, 415.20, 20000000, 'google_finance', 'api', true, NOW() - INTERVAL '1 day'),
        (tsla_id, NOW() - INTERVAL '1 day', 245.60, 248.90, 244.20, 248.30, 48000000, 'google_finance', 'api', true, NOW() - INTERVAL '1 day');

    -- 3. UPDATE EXISTING PORTFOLIOS WITH REALISTIC VALUES
    UPDATE public.portfolios 
    SET 
        total_value = 125000.00,
        cash_balance = 15000.00,
        total_cost = 110000.00,
        unrealized_pnl = 15000.00,
        realized_pnl = 5000.00,
        performance_1d = 2.15,
        performance_1w = 5.80,
        performance_1m = 12.40,
        performance_3m = 22.75,
        performance_1y = 18.90,
        risk_score = 65.50,
        sharpe_ratio = 1.45,
        volatility = 18.20,
        beta = 1.05,
        max_drawdown = -8.30
    WHERE id = portfolio1_id;

    UPDATE public.portfolios 
    SET 
        total_value = 87500.00,
        cash_balance = 12500.00,
        total_cost = 75000.00,
        unrealized_pnl = 12500.00,
        realized_pnl = 3200.00,
        performance_1d = 1.85,
        performance_1w = 4.20,
        performance_1m = 8.90,
        performance_3m = 18.60,
        performance_1y = 15.20,
        risk_score = 58.30,
        sharpe_ratio = 1.28,
        volatility = 16.80,
        beta = 0.95,
        max_drawdown = -6.80
    WHERE id = portfolio2_id;

    -- 4. UPDATE USER PROFILES WITH TRADING BALANCES
    UPDATE public.user_profiles 
    SET 
        account_balance = 140000.00,
        available_balance = 15000.00,
        buying_power = 30000.00
    WHERE id = user1_id;

    UPDATE public.user_profiles 
    SET 
        account_balance = 100000.00,
        available_balance = 12500.00,
        buying_power = 25000.00
    WHERE id = user2_id;

    -- 5. ACTIVATE AND ENHANCE AI AGENTS
    UPDATE public.ai_agents 
    SET 
        agent_status = 'active'::public.ai_agent_status,
        total_trades = 156,
        successful_trades = 98,
        total_pnl = 8750.00,
        win_rate = 62.82,
        last_active_at = NOW() - INTERVAL '5 minutes',
        last_trade_at = NOW() - INTERVAL '2 hours',
        performance_metrics = '{"sharpe_ratio": 1.35, "max_drawdown": -4.2, "avg_trade_duration": "2.5 hours", "profit_factor": 1.68}'::jsonb,
        risk_parameters = '{"max_position_size": 10000, "stop_loss": 0.02, "take_profit": 0.04, "max_daily_trades": 5}'::jsonb
    WHERE name = 'Momentum Trader';

    UPDATE public.ai_agents 
    SET 
        agent_status = 'active'::public.ai_agent_status,
        total_trades = 203,
        successful_trades = 141,
        total_pnl = 6420.00,
        win_rate = 69.46,
        last_active_at = NOW() - INTERVAL '3 minutes',
        last_trade_at = NOW() - INTERVAL '1 hour',
        performance_metrics = '{"sharpe_ratio": 1.52, "max_drawdown": -3.8, "avg_trade_duration": "6.2 hours", "profit_factor": 1.84}'::jsonb,
        risk_parameters = '{"max_position_size": 5000, "stop_loss": 0.015, "take_profit": 0.03, "max_daily_trades": 3}'::jsonb
    WHERE name = 'Mean Reversion Bot';

    -- 6. ADD SYSTEM HEALTH DATA FOR AI AGENTS
    INSERT INTO public.system_health (agent_id, health_status, cpu_usage, memory_usage, error_count, warning_count, last_heartbeat, uptime_seconds, response_time_ms, metrics)
    SELECT 
        id,
        'healthy',
        RANDOM() * 30 + 20, -- CPU usage 20-50%
        RANDOM() * 40 + 30, -- Memory usage 30-70%
        0, -- No errors
        RANDOM() * 3, -- 0-3 warnings
        NOW() - INTERVAL '30 seconds',
        EXTRACT(EPOCH FROM (NOW() - created_at))::INTEGER,
        RANDOM() * 50 + 25, -- Response time 25-75ms
        '{"trades_processed": 15, "signals_generated": 8, "api_calls": 42}'::jsonb
    FROM public.ai_agents 
    WHERE agent_status = 'active'::public.ai_agent_status;

    -- 7. ADD EXTERNAL API CONFIGURATIONS
    INSERT INTO public.external_api_configs (api_name, base_url, is_active, rate_limit_per_minute, total_calls_today, last_successful_call, api_key_encrypted)
    VALUES
        ('google_finance', 'https://finance.google.com/api', true, 100, 1250, NOW() - INTERVAL '5 minutes', 'encrypted_key_placeholder'),
        ('yahoo_finance', 'https://query1.finance.yahoo.com/v8/finance', true, 150, 890, NOW() - INTERVAL '10 minutes', 'encrypted_key_placeholder'),
        ('alpha_vantage', 'https://www.alphavantage.co/query', true, 75, 320, NOW() - INTERVAL '15 minutes', 'encrypted_key_placeholder'),
        ('polygon', 'https://api.polygon.io', true, 200, 1480, NOW() - INTERVAL '3 minutes', 'encrypted_key_placeholder')
    ON CONFLICT (api_name) DO UPDATE SET
        is_active = EXCLUDED.is_active,
        total_calls_today = EXCLUDED.total_calls_today,
        last_successful_call = EXCLUDED.last_successful_call;

    -- 8. ADD SAMPLE TRADES FOR HISTORY
    INSERT INTO public.trades (asset_id, user_id, portfolio_id, order_type, side, quantity, price, total_amount, status, executed_at)
    VALUES
        (existing_aapl_id, user1_id, portfolio1_id, 'market', 'buy', 50, 176.80, 8840.00, 'filled', NOW() - INTERVAL '2 days'),
        (msft_id, user1_id, portfolio1_id, 'limit', 'buy', 25, 412.50, 10312.50, 'filled', NOW() - INTERVAL '1 day'),
        (tsla_id, user2_id, portfolio2_id, 'market', 'buy', 20, 247.30, 4946.00, 'filled', NOW() - INTERVAL '3 hours'),
        (spy_id, user2_id, portfolio2_id, 'limit', 'buy', 100, 478.50, 47850.00, 'filled', NOW() - INTERVAL '1 day');

    -- 9. ADD CURRENT POSITIONS
    INSERT INTO public.positions (asset_id, portfolio_id, quantity, average_cost, current_price, unrealized_pnl, position_type, status, opened_at, last_updated)
    VALUES
        (existing_aapl_id, portfolio1_id, 50, 176.80, 178.90, 105.00, 'long', 'open', NOW() - INTERVAL '2 days', NOW()),
        (msft_id, portfolio1_id, 25, 412.50, 416.80, 107.50, 'long', 'open', NOW() - INTERVAL '1 day', NOW()),
        (tsla_id, portfolio2_id, 20, 247.30, 250.45, 63.00, 'long', 'open', NOW() - INTERVAL '3 hours', NOW()),
        (spy_id, portfolio2_id, 100, 478.50, 479.15, 65.00, 'long', 'open', NOW() - INTERVAL '1 day', NOW());

    -- 10. ADD EVENT BUS ACTIVITY FOR REAL-TIME MONITORING
    INSERT INTO public.event_bus (event_type, priority, source_agent_id, target_agent_id, event_data, is_processed, created_at)
    SELECT 
        'trade_signal'::public.event_type,
        'medium'::public.event_priority,
        id,
        NULL,
        '{"signal": "BUY", "confidence": 0.75, "asset": "AAPL", "reason": "momentum_breakout"}'::jsonb,
        true,
        NOW() - INTERVAL '15 minutes'
    FROM public.ai_agents WHERE name = 'Momentum Trader'
    UNION ALL
    SELECT 
        'market_analysis'::public.event_type,
        'low'::public.event_priority,
        id,
        NULL,
        '{"analysis": "oversold_condition", "assets": ["TSLA", "MSFT"], "recommendation": "accumulate"}'::jsonb,
        true,
        NOW() - INTERVAL '30 minutes'
    FROM public.ai_agents WHERE name = 'Mean Reversion Bot';

    RAISE NOTICE 'Trading MVP test data enrichment completed successfully!';
    RAISE NOTICE 'Added: % new assets, updated portfolios, activated AI agents', 10;
    RAISE NOTICE 'Portfolio 1 value: $125,000 | Portfolio 2 value: $87,500';
    RAISE NOTICE 'AI Agents: Active with positive performance metrics';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error during data enrichment: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error during data enrichment: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error during data enrichment: %', SQLERRM;
END $$;

-- Update timestamps on market_data for freshness
UPDATE public.market_data 
SET last_updated = NOW() 
WHERE last_updated < NOW() - INTERVAL '1 day';

-- Function to refresh test data periodically (for development)
CREATE OR REPLACE FUNCTION public.refresh_market_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $refresh$
BEGIN
    -- Update prices with small random changes to simulate market movement
    UPDATE public.market_data 
    SET 
        close_price = close_price * (1 + (RANDOM() - 0.5) * 0.02), -- ±1% random change
        timestamp = NOW(),
        last_updated = NOW()
    WHERE timestamp > NOW() - INTERVAL '1 day';
    
    -- Update portfolio values based on current positions
    UPDATE public.portfolios p
    SET 
        total_value = (
            SELECT COALESCE(SUM(pos.quantity * md.close_price), p.cash_balance)
            FROM public.positions pos
            JOIN public.market_data md ON pos.asset_id = md.asset_id
            WHERE pos.portfolio_id = p.id 
            AND pos.status = 'open'
            AND md.timestamp = (SELECT MAX(timestamp) FROM public.market_data WHERE asset_id = pos.asset_id)
        ) + p.cash_balance,
        updated_at = NOW()
    WHERE total_value > 0;

    RAISE NOTICE 'Market data refreshed at %', NOW();
END;
$refresh$;

-- Comment explaining the enrichment
COMMENT ON FUNCTION public.refresh_market_data() IS 'Refreshes market data with simulated price movements for development testing';