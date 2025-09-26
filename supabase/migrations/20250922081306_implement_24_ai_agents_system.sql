-- Location: supabase/migrations/20250922081306_implement_24_ai_agents_system.sql
-- Schema Analysis: Existing comprehensive trading platform with ai_agents, portfolios, user_profiles
-- Integration Type: Addition - Adding 24 AI agents system with EventBus + StateDB + Orchestration
-- Dependencies: Existing ai_agents, user_profiles, portfolios, assets, market_data tables

-- 1. Add new types for AI agent grouping and EventBus system
CREATE TYPE public.ai_agent_group AS ENUM ('ingestion', 'signals', 'execution', 'orchestration');
CREATE TYPE public.event_type AS ENUM ('market_data', 'trade_signal', 'order_execution', 'risk_alert', 'system_status');
CREATE TYPE public.event_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- 2. Add AI Agent Groups tracking table
CREATE TABLE public.ai_agent_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    group_type public.ai_agent_group NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    agent_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. EventBus system for AI agent communication
CREATE TABLE public.event_bus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type public.event_type NOT NULL,
    priority public.event_priority DEFAULT 'medium'::public.event_priority,
    source_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    target_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE SET NULL,
    event_data JSONB NOT NULL,
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour')
);

-- 4. StateDB for AI agent state management  
CREATE TABLE public.ai_agent_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    state_key TEXT NOT NULL,
    state_value JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, state_key)
);

-- 5. System Health monitoring for agents
CREATE TABLE public.system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    health_status TEXT NOT NULL DEFAULT 'healthy',
    cpu_usage NUMERIC,
    memory_usage NUMERIC,
    last_heartbeat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    error_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    uptime_seconds INTEGER DEFAULT 0,
    metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add AI Agent Categories (extend existing ai_agents table)
ALTER TABLE public.ai_agents 
ADD COLUMN IF NOT EXISTS agent_group public.ai_agent_group,
ADD COLUMN IF NOT EXISTS agent_category TEXT,
ADD COLUMN IF NOT EXISTS is_autonomous BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS communication_enabled BOOLEAN DEFAULT true;

-- 7. Essential indexes for performance
CREATE INDEX idx_ai_agent_groups_type ON public.ai_agent_groups(group_type);
CREATE INDEX idx_event_bus_type_priority ON public.event_bus(event_type, priority);
CREATE INDEX idx_event_bus_processed ON public.event_bus(is_processed, created_at);
CREATE INDEX idx_event_bus_agent_source ON public.event_bus(source_agent_id);
CREATE INDEX idx_event_bus_agent_target ON public.event_bus(target_agent_id);
CREATE INDEX idx_ai_agent_state_agent_key ON public.ai_agent_state(agent_id, state_key);
CREATE INDEX idx_system_health_agent_status ON public.system_health(agent_id, health_status);
CREATE INDEX idx_ai_agents_group ON public.ai_agents(agent_group);

-- 8. RLS Setup
ALTER TABLE public.ai_agent_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies using Pattern 6A (Admin from auth metadata)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- Admin access to agent groups
CREATE POLICY "admin_manage_ai_agent_groups"
ON public.ai_agent_groups
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 4: Public read access to event bus for monitoring, private management
CREATE POLICY "public_read_event_bus"
ON public.event_bus
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admin_manage_event_bus"
ON public.event_bus
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: User ownership for agent state
CREATE POLICY "users_manage_agent_state"
ON public.ai_agent_state
FOR ALL
TO authenticated
USING (
    agent_id IN (
        SELECT id FROM public.ai_agents WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    agent_id IN (
        SELECT id FROM public.ai_agents WHERE user_id = auth.uid()
    )
);

-- Pattern 2: User ownership for system health
CREATE POLICY "users_view_agent_health"
ON public.system_health
FOR ALL
TO authenticated
USING (
    agent_id IN (
        SELECT id FROM public.ai_agents WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    agent_id IN (
        SELECT id FROM public.ai_agents WHERE user_id = auth.uid()
    )
);

-- 10. Functions for AI agent orchestration
CREATE OR REPLACE FUNCTION public.create_event(
    p_event_type public.event_type,
    p_source_agent_id UUID,
    p_target_agent_id UUID DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}',
    p_priority public.event_priority DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.event_bus (
        event_type, source_agent_id, target_agent_id, 
        event_data, priority
    ) VALUES (
        p_event_type, p_source_agent_id, p_target_agent_id,
        p_event_data, p_priority
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_agent_state(
    p_agent_id UUID,
    p_state_key TEXT,
    p_state_value JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.ai_agent_state (agent_id, state_key, state_value)
    VALUES (p_agent_id, p_state_key, p_state_value)
    ON CONFLICT (agent_id, state_key)
    DO UPDATE SET 
        state_value = p_state_value,
        version = ai_agent_state.version + 1,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_system_health(
    p_agent_id UUID,
    p_health_status TEXT DEFAULT 'healthy',
    p_cpu_usage NUMERIC DEFAULT NULL,
    p_memory_usage NUMERIC DEFAULT NULL,
    p_metrics JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.system_health (
        agent_id, health_status, cpu_usage, memory_usage, 
        last_heartbeat, metrics
    )
    VALUES (
        p_agent_id, p_health_status, p_cpu_usage, p_memory_usage,
        CURRENT_TIMESTAMP, p_metrics
    )
    ON CONFLICT (agent_id)
    DO UPDATE SET 
        health_status = p_health_status,
        cpu_usage = COALESCE(p_cpu_usage, system_health.cpu_usage),
        memory_usage = COALESCE(p_memory_usage, system_health.memory_usage),
        last_heartbeat = CURRENT_TIMESTAMP,
        metrics = COALESCE(p_metrics, system_health.metrics),
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- 11. Triggers for automatic timestamps
CREATE OR REPLACE TRIGGER update_ai_agent_groups_updated_at
    BEFORE UPDATE ON public.ai_agent_groups
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ai_agent_state_updated_at
    BEFORE UPDATE ON public.ai_agent_state
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_system_health_updated_at
    BEFORE UPDATE ON public.system_health
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Initialize 24 AI Agents in 4 groups with proper configuration
DO $$
DECLARE
    admin_user_id UUID;
    trader_user_id UUID;
    admin_portfolio_id UUID;
    trader_portfolio_id UUID;
    group_id UUID;
    
    -- Agent Group A: Ingestion (6 agents)
    ingestion_group_id UUID;
    -- Agent Group B: Signals (8 agents) 
    signals_group_id UUID;
    -- Agent Group C: Execution (5 agents)
    execution_group_id UUID;
    -- Agent Group D: Orchestration (5 agents)
    orchestration_group_id UUID;
BEGIN
    -- Get existing users and portfolios
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE email = 'admin@tradingai.com' LIMIT 1;
    SELECT id INTO trader_user_id FROM public.user_profiles WHERE email = 'trader@tradingai.com' LIMIT 1;
    
    SELECT id INTO admin_portfolio_id FROM public.portfolios WHERE user_id = admin_user_id LIMIT 1;
    SELECT id INTO trader_portfolio_id FROM public.portfolios WHERE user_id = trader_user_id LIMIT 1;

    -- Create AI Agent Groups
    INSERT INTO public.ai_agent_groups (name, group_type, description, agent_count)
    VALUES 
        ('Ingestion Group', 'ingestion', 'Data ingestion and processing agents', 6),
        ('Signals Group', 'signals', 'Technical analysis and signal generation agents', 8),
        ('Execution Group', 'execution', 'Order execution and risk management agents', 5),
        ('Orchestration Group', 'orchestration', 'System coordination and monitoring agents', 5);

    SELECT id INTO ingestion_group_id FROM public.ai_agent_groups WHERE group_type = 'ingestion';
    SELECT id INTO signals_group_id FROM public.ai_agent_groups WHERE group_type = 'signals';
    SELECT id INTO execution_group_id FROM public.ai_agent_groups WHERE group_type = 'execution';
    SELECT id INTO orchestration_group_id FROM public.ai_agent_groups WHERE group_type = 'orchestration';

    -- A — Ingestion Group (6 agents)
    INSERT INTO public.ai_agents (
        name, description, strategy, agent_status, user_id, portfolio_id, 
        agent_group, agent_category, configuration, risk_parameters
    ) VALUES
        ('Quotes Ingestion Agent', 'Real-time quotes data ingestion from multiple sources', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'ingestion', 'data_collector',
         '{"sources":["Yahoo Finance","Polygon.io","Alpha Vantage"],"refresh_rate":"1s","data_types":["quotes","prices"]}',
         '{"max_api_calls_per_minute":1000}'),
        ('History Data Agent', 'Historical market data collection and storage', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'ingestion', 'data_collector',
         '{"sources":["Polygon.io","TwelveData","Finnhub"],"timeframes":["1m","5m","1h","1d"],"lookback_days":365}',
         '{"storage_limit_gb":50}'),
        ('News Sentiment Agent', 'News collection and sentiment analysis', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'ingestion', 'sentiment_analyzer',
         '{"sources":["SeekingAlpha","MarketWatch","Bloomberg"],"sentiment_models":["VADER","TextBlob"],"update_frequency":"5m"}',
         '{"max_articles_per_day":1000}'),
        ('Fundamentals Agent', 'Company fundamentals and financial data collection', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'ingestion', 'data_collector',
         '{"sources":["Alpha Vantage","Finnhub"],"data_types":["earnings","ratios","financials"],"update_frequency":"1h"}',
         '{"storage_retention_days":90}'),
        ('Shipping Data Agent', 'Maritime transport and logistics data ingestion', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'ingestion', 'specialized_data',
         '{"sources":["MarineTraffic API"],"data_types":["vessel_tracking","port_activity"],"update_frequency":"15m"}',
         '{"max_vessels_tracked":10000}'),
        ('Weather Data Agent', 'Agricultural and weather data for commodity trading', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'ingestion', 'specialized_data',
         '{"sources":["NOAA","Meteoblue"],"data_types":["temperature","precipitation","crop_conditions"],"regions":["US","EU","APAC"]}',
         '{"forecast_horizon_days":14}'),

    -- B — Signals Group (8 agents)
        ('Moving Average Agent', 'Moving average crossover signals', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'signals', 'technical_indicator',
         '{"periods":[20,50,200],"types":["SMA","EMA","WMA"],"timeframes":["5m","1h","1d"],"signal_strength_threshold":0.7}',
         '{"max_signals_per_day":100}'),
        ('RSI Signal Agent', 'RSI overbought/oversold signals', 'mean_reversion', 'active', trader_user_id, trader_portfolio_id, 'signals', 'technical_indicator',
         '{"period":14,"overbought":70,"oversold":30,"timeframes":["5m","15m","1h"],"divergence_detection":true}',
         '{"max_positions":10}'),
        ('Mean Reversion Agent', 'Statistical arbitrage and mean reversion signals', 'mean_reversion', 'active', trader_user_id, trader_portfolio_id, 'signals', 'statistical',
         '{"lookback_period":50,"z_score_threshold":2.0,"pairs":["AAPL-MSFT","SPY-QQQ"],"reversion_timeout":"4h"}',
         '{"max_pair_exposure":0.1}'),
        ('Breakout Detection Agent', 'Price breakout and momentum signals', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'signals', 'pattern_recognition',
         '{"volume_confirmation":true,"breakout_threshold":0.02,"consolidation_period":"2h","false_breakout_filter":true}',
         '{"position_size_multiplier":1.5}'),
        ('Anomaly Detection Agent', 'Market anomaly and outlier detection', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'signals', 'machine_learning',
         '{"models":["isolation_forest","local_outlier_factor"],"sensitivity":0.1,"lookback_window":100}',
         '{"max_anomaly_signals_per_hour":5}'),
        ('Multi-Factor Agent', 'Multi-factor model signals', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'signals', 'quantitative',
         '{"factors":["momentum","value","quality","volatility"],"rebalance_frequency":"weekly","factor_weights":[0.3,0.25,0.25,0.2]}',
         '{"max_factor_exposure":0.4}'),
        ('Regime Detection Agent', 'Market regime identification and signals', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'signals', 'macro_analysis',
         '{"regimes":["bull","bear","sideways","high_vol"],"indicators":["VIX","yield_curve","momentum"],"regime_switch_threshold":0.8}',
         '{"position_adjustment_factor":0.5}'),
        ('Options Greeks Agent', 'Options Greeks analysis and signals', 'arbitrage', 'active', trader_user_id, trader_portfolio_id, 'signals', 'derivatives',
         '{"greeks":["delta","gamma","theta","vega"],"strategies":["covered_call","protective_put"],"expiration_range_days":[7,45]}',
         '{"max_options_exposure":0.2}'),

    -- C — Execution Group (5 agents)
        ('Paper Trading Broker', 'Simulated order execution and fills', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'execution', 'broker_simulation',
         '{"slippage_model":"linear","latency_ms":50,"fill_probability":0.95,"partial_fills":true,"market_impact_factor":0.001}',
         '{"max_order_size":10000}'),
        ('Smart Order Router', 'Intelligent order routing and execution', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'execution', 'order_management',
         '{"algorithms":["TWAP","VWAP","implementation_shortfall"],"venues":["NYSE","NASDAQ","ARCA"],"dark_pool_usage":0.3}',
         '{"max_order_slices":20}'),
        ('Slippage Monitor', 'Transaction cost and slippage analysis', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'execution', 'cost_analysis',
         '{"cost_models":["linear","sqrt","market_impact"],"benchmark_period":"1d","alert_threshold":0.005}',
         '{"tracking_window_hours":24}'),
        ('Risk Manager Agent', 'Real-time risk monitoring and controls', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'execution', 'risk_control',
         '{"position_limits":{"single_stock":0.05,"sector":0.2,"total":1.0},"var_limit":0.02,"stress_test_frequency":"1h"}',
         '{"emergency_liquidation_threshold":0.1}'),
        ('Portfolio Rebalancer', 'Automated portfolio rebalancing', 'momentum', 'active', trader_user_id, trader_portfolio_id, 'execution', 'portfolio_management',
         '{"rebalance_frequency":"daily","threshold_drift":0.05,"cost_benefit_analysis":true,"tax_awareness":false}',
         '{"max_turnover_per_day":0.2}'),

    -- D — Orchestration Group (5 agents)  
        ('Master Orchestrator', 'Central coordination of all AI agents', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'orchestration', 'coordinator',
         '{"coordination_mode":"event_driven","health_check_frequency":"30s","auto_restart":true,"load_balancing":true}',
         '{"max_concurrent_agents":24}'),
        ('State Database Manager', 'Centralized state management and persistence', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'orchestration', 'data_manager',
         '{"backup_frequency":"5m","state_retention_hours":168,"compression":true,"encryption":true}',
         '{"max_state_size_mb":1000}'),
        ('EventBus Controller', 'Event routing and message queue management', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'orchestration', 'message_broker',
         '{"queue_size":10000,"message_ttl":"1h","priority_queues":4,"dead_letter_queue":true}',
         '{"max_events_per_second":1000}'),
        ('Metrics Collector', 'System metrics and alerting', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'orchestration', 'monitoring',
         '{"metrics":["latency","throughput","error_rate","resource_usage"],"alert_thresholds":{"error_rate":0.05,"latency_ms":1000}}',
         '{"metric_retention_days":30}'),
        ('API Gateway Agent', 'External API management and rate limiting', 'momentum', 'active', admin_user_id, admin_portfolio_id, 'orchestration', 'api_manager',
         '{"rate_limits":{"yahoo":100,"polygon":1000,"alpha_vantage":500},"retry_logic":true,"circuit_breaker":true}',
         '{"max_concurrent_requests":200}');

    -- Initialize system health for all agents
    INSERT INTO public.system_health (agent_id, health_status, cpu_usage, memory_usage, uptime_seconds)
    SELECT 
        id, 
        'healthy',
        RANDOM() * 30 + 10, -- CPU 10-40%
        RANDOM() * 20 + 5,  -- Memory 5-25%
        0
    FROM public.ai_agents;

    -- Create initial EventBus events for system startup
    INSERT INTO public.event_bus (event_type, priority, event_data, source_agent_id)
    SELECT 
        'system_status'::public.event_type,
        'high'::public.event_priority,
        jsonb_build_object(
            'message', 'Agent initialized',
            'agent_name', name,
            'group', agent_group,
            'timestamp', CURRENT_TIMESTAMP
        ),
        id
    FROM public.ai_agents
    WHERE agent_group IS NOT NULL;

    RAISE NOTICE '24 AI Agents system successfully initialized with EventBus and StateDB';
END $$;