-- Location: supabase/migrations/20251210200000_fix_ai_agents_management_system.sql
-- Schema Analysis: Existing governance tables present, missing core AI agent system tables
-- Integration Type: Addition - Creating new AI agent management system
-- Dependencies: Existing orchestration tables (orch_schedule, orch_playbooks, orch_proposals)

-- 1. TYPES - Agent status and categories for French system (Fixed: Removed IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_status') THEN
        CREATE TYPE public.agent_status AS ENUM (
            'active', 'paused', 'error', 'inactive', 'maintenance'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_category') THEN
        CREATE TYPE public.agent_category AS ENUM (
            'orchestration_governance', 'data_acquisition', 'quantitative_analysis', 'execution_security'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_side') THEN
        CREATE TYPE public.trade_side AS ENUM ('BUY', 'SELL', 'HOLD');
    END IF;
END $$;

-- 2. CORE TABLES - User profiles (intermediary for PostgREST compatibility)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'trader',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. ASSETS TABLE - Required for trading operations
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type TEXT DEFAULT 'stock',
  exchange TEXT,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. AI AGENTS TABLE - Core agent management with French categories
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  strategy TEXT NOT NULL,
  agent_status public.agent_status DEFAULT 'inactive'::public.agent_status,
  agent_category public.agent_category DEFAULT 'execution_security'::public.agent_category,
  agent_group TEXT,
  win_rate NUMERIC DEFAULT 0,
  total_pnl NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  configuration JSONB DEFAULT '{}'::jsonb,
  risk_parameters JSONB DEFAULT '{}'::jsonb,
  daily_loss_limit NUMERIC DEFAULT 1000,
  monthly_loss_limit NUMERIC DEFAULT 10000,
  max_position_size NUMERIC DEFAULT 10000,
  is_autonomous BOOLEAN DEFAULT false,
  communication_enabled BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ,
  last_trade_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. TRADES TABLE - Trading operations for agent tracking
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  trade_side public.trade_side NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  realized_pnl NUMERIC DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  -- Backward compatibility
  order_side TEXT GENERATED ALWAYS AS (trade_side::text) STORED,
  pnl NUMERIC GENERATED ALWAYS AS (realized_pnl) STORED
);

-- 6. AI AGENT TRADES TABLE - Links agents to their trades
CREATE TABLE IF NOT EXISTS public.ai_agent_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE,
  confidence_level NUMERIC DEFAULT 0,
  signal_strength NUMERIC DEFAULT 0,
  execution_time_ms INTEGER DEFAULT 0,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. SYSTEM HEALTH TABLE - Agent health monitoring
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  health_status TEXT DEFAULT 'unknown',
  cpu_usage NUMERIC DEFAULT 0,
  memory_usage NUMERIC DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  last_heartbeat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  uptime_seconds INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. ESSENTIAL INDEXES
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON public.ai_agents(agent_status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_category ON public.ai_agents(agent_category);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_asset_id ON public.trades(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_agent_id ON public.ai_agent_trades(ai_agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_trade_id ON public.ai_agent_trades(trade_id);
CREATE INDEX IF NOT EXISTS idx_system_health_agent_id ON public.system_health(agent_id);

-- 9. HELPER FUNCTIONS (Must be created BEFORE RLS policies)
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

-- Function for automatic user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'trader')
  );
  RETURN NEW;
END;
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- 10. ENABLE RLS ON ALL TABLES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- 11. RLS POLICIES (Following correct patterns to avoid circular dependencies)

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 4: Public read, private write for assets
CREATE POLICY "public_can_read_assets"
ON public.assets
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_assets"
ON public.assets
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Simple user ownership for AI agents
CREATE POLICY "users_manage_own_ai_agents"
ON public.ai_agents
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple user ownership for trades
CREATE POLICY "users_manage_own_trades"
ON public.trades
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 3: Operation-specific for ai_agent_trades (complex relationships)
CREATE POLICY "users_can_view_agent_trades"
ON public.ai_agent_trades
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ai_agents aa
    WHERE aa.id = ai_agent_id AND aa.user_id = auth.uid()
  )
);

CREATE POLICY "users_can_create_agent_trades"
ON public.ai_agent_trades
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_agents aa
    WHERE aa.id = ai_agent_id AND aa.user_id = auth.uid()
  )
);

-- Pattern 3: Operation-specific for system health
CREATE POLICY "users_can_view_agent_health"
ON public.system_health
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ai_agents aa
    WHERE aa.id = agent_id AND aa.user_id = auth.uid()
  )
);

CREATE POLICY "users_can_update_agent_health"
ON public.system_health
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_agents aa
    WHERE aa.id = agent_id AND aa.user_id = auth.uid()
  )
);

-- 12. TRIGGERS - Fixed syntax without IF NOT EXISTS
DO $$ 
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP TRIGGER IF EXISTS ai_agents_updated_at ON public.ai_agents;
    DROP TRIGGER IF EXISTS system_health_updated_at ON public.system_health;
    
    -- Create triggers
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    CREATE TRIGGER ai_agents_updated_at
        BEFORE UPDATE ON public.ai_agents
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

    CREATE TRIGGER system_health_updated_at
        BEFORE UPDATE ON public.system_health
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
END $$;

-- 13. MOCK DATA FOR FRENCH AI AGENT SYSTEM (24 IA agents as mentioned in description)
DO $$
DECLARE
    demo_user_id UUID := gen_random_uuid();
    orchestration_user_id UUID := gen_random_uuid();
    
    -- Asset IDs
    aapl_id UUID := gen_random_uuid();
    tsla_id UUID := gen_random_uuid();
    msft_id UUID := gen_random_uuid();
    googl_id UUID := gen_random_uuid();
    nvda_id UUID := gen_random_uuid();
    meta_id UUID := gen_random_uuid();
    
    -- Agent IDs for each category
    agent_ids UUID[24];
BEGIN
    -- Create demo auth users with French interface support
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (demo_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'demo@trading-mvp.fr', crypt('demo123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Démonstrateur Français", "role": "trader"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (orchestration_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@trading-mvp.fr', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Administrateur Système", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create sample assets
    INSERT INTO public.assets (id, symbol, name, asset_type, exchange, currency) VALUES
        (aapl_id, 'AAPL', 'Apple Inc.', 'stock', 'NASDAQ', 'USD'),
        (tsla_id, 'TSLA', 'Tesla Inc.', 'stock', 'NASDAQ', 'USD'),
        (msft_id, 'MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ', 'USD'),
        (googl_id, 'GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ', 'USD'),
        (nvda_id, 'NVDA', 'NVIDIA Corporation', 'stock', 'NASDAQ', 'USD'),
        (meta_id, 'META', 'Meta Platforms Inc.', 'stock', 'NASDAQ', 'USD');

    -- Generate agent UUIDs
    FOR i IN 1..24 LOOP
        agent_ids[i] := gen_random_uuid();
    END LOOP;

    -- Create 24 AI agents matching French categories with realistic performance data
    INSERT INTO public.ai_agents (
        id, user_id, name, description, strategy, agent_status, agent_category, 
        agent_group, win_rate, total_pnl, total_trades, successful_trades,
        performance_metrics, is_autonomous, communication_enabled,
        last_active_at, last_trade_at
    ) VALUES
        -- ORCHESTRATION & GOUVERNANCE (6 agents)
        (agent_ids[1], demo_user_id, 'Alpha Momentum Pro', 'Agent de momentum haute performance', 'momentum', 'active', 'orchestration_governance', 'signals', 68.5, 12450.75, 147, 101, '{"sharpe_ratio": 1.45, "max_drawdown": 8.2}'::jsonb, true, true, now() - interval '5 minutes', now() - interval '1 hour'),
        (agent_ids[2], demo_user_id, 'Beta Arbitrage Elite', 'Spécialiste arbitrage inter-échanges', 'arbitrage', 'active', 'orchestration_governance', 'execution', 72.3, 8920.30, 89, 64, '{"sharpe_ratio": 1.8, "max_drawdown": 5.1}'::jsonb, true, true, now() - interval '2 minutes', now() - interval '30 minutes'),
        (agent_ids[3], demo_user_id, 'Gamma Superviseur', 'Superviseur des stratégies complexes', 'supervision', 'active', 'orchestration_governance', 'governance', 55.8, 3275.60, 156, 87, '{"sharpe_ratio": 0.95, "max_drawdown": 12.5}'::jsonb, true, true, now() - interval '10 minutes', now() - interval '2 hours'),
        (agent_ids[4], demo_user_id, 'Delta Orchestrateur', 'Orchestrateur de flux de trading', 'orchestration', 'paused', 'orchestration_governance', 'orchestration', 45.2, -1250.40, 76, 34, '{"sharpe_ratio": -0.3, "max_drawdown": 25.8}'::jsonb, false, false, now() - interval '2 hours', now() - interval '4 hours'),
        (agent_ids[5], demo_user_id, 'Epsilon Risk Manager', 'Gestionnaire de risque automatisé', 'risk_management', 'active', 'orchestration_governance', 'risk', 82.1, 15680.90, 203, 167, '{"sharpe_ratio": 2.1, "max_drawdown": 6.3}'::jsonb, true, true, now() - interval '1 minute', now() - interval '15 minutes'),
        (agent_ids[6], demo_user_id, 'Zeta Compliance', 'Vérificateur de conformité réglementaire', 'compliance', 'active', 'orchestration_governance', 'compliance', 91.5, 2850.15, 65, 59, '{"sharpe_ratio": 1.6, "max_drawdown": 3.2}'::jsonb, true, true, now() - interval '8 minutes', now() - interval '45 minutes'),

        -- DONNÉES (acquisition & sens) (6 agents)
        (agent_ids[7], demo_user_id, 'Data Hunter Pro', 'Chasseur de données de marché', 'data_mining', 'active', 'data_acquisition', 'data', 58.9, 4120.80, 198, 117, '{"sharpe_ratio": 1.1, "max_drawdown": 9.7}'::jsonb, true, true, now() - interval '3 minutes', now() - interval '20 minutes'),
        (agent_ids[8], demo_user_id, 'News Sentiment AI', 'Analyseur de sentiment des nouvelles', 'sentiment', 'active', 'data_acquisition', 'data', 63.7, 6789.25, 142, 91, '{"sharpe_ratio": 1.35, "max_drawdown": 11.4}'::jsonb, true, true, now() - interval '7 minutes', now() - interval '35 minutes'),
        (agent_ids[9], demo_user_id, 'Market Scanner', 'Scanner automatisé des marchés', 'scanning', 'active', 'data_acquisition', 'data', 71.2, 9430.50, 178, 127, '{"sharpe_ratio": 1.65, "max_drawdown": 7.8}'::jsonb, true, true, now() - interval '4 minutes', now() - interval '25 minutes'),
        (agent_ids[10], demo_user_id, 'Pattern Detective', 'Détecteur de patterns techniques', 'pattern_recognition', 'error', 'data_acquisition', 'data', 0, 0, 0, 0, '{"sharpe_ratio": 0, "max_drawdown": 0}'::jsonb, false, false, now() - interval '1 day', null),
        (agent_ids[11], demo_user_id, 'Volume Analyzer', 'Analyseur de volume et liquidité', 'volume_analysis', 'active', 'data_acquisition', 'data', 49.3, 1890.75, 87, 43, '{"sharpe_ratio": 0.6, "max_drawdown": 15.2}'::jsonb, true, true, now() - interval '12 minutes', now() - interval '1 hour'),
        (agent_ids[12], demo_user_id, 'Correlation Engine', 'Moteur de corrélation inter-marchés', 'correlation', 'active', 'data_acquisition', 'data', 76.8, 11250.40, 165, 127, '{"sharpe_ratio": 1.9, "max_drawdown": 6.7}'::jsonb, true, true, now() - interval '6 minutes', now() - interval '40 minutes'),

        -- ANALYSE QUANTITATIVE (6 agents)  
        (agent_ids[13], demo_user_id, 'Quant Master', 'Maître des stratégies quantitatives', 'quantitative', 'active', 'quantitative_analysis', 'quant', 79.4, 18750.60, 234, 186, '{"sharpe_ratio": 2.3, "max_drawdown": 5.5}'::jsonb, true, true, now() - interval '2 minutes', now() - interval '10 minutes'),
        (agent_ids[14], demo_user_id, 'Statistical Arbitrage', 'Arbitrage statistique avancé', 'stat_arbitrage', 'active', 'quantitative_analysis', 'quant', 65.3, 7890.25, 153, 100, '{"sharpe_ratio": 1.4, "max_drawdown": 10.1}'::jsonb, true, true, now() - interval '9 minutes', now() - interval '50 minutes'),
        (agent_ids[15], demo_user_id, 'Mean Reversion Pro', 'Expert en retour à la moyenne', 'mean_reversion', 'paused', 'quantitative_analysis', 'quant', 42.8, -2150.90, 98, 42, '{"sharpe_ratio": -0.5, "max_drawdown": 22.3}'::jsonb, false, false, now() - interval '3 hours', now() - interval '6 hours'),
        (agent_ids[16], demo_user_id, 'Pairs Trading AI', 'IA de trading par paires', 'pairs_trading', 'active', 'quantitative_analysis', 'quant', 83.1, 16420.35, 187, 155, '{"sharpe_ratio": 2.05, "max_drawdown": 4.8}'::jsonb, true, true, now() - interval '1 minute', now() - interval '8 minutes'),
        (agent_ids[17], demo_user_id, 'Options Strategist', 'Stratège en options complexes', 'options', 'active', 'quantitative_analysis', 'derivatives', 59.7, 5230.80, 112, 67, '{"sharpe_ratio": 1.2, "max_drawdown": 13.6}'::jsonb, true, true, now() - interval '15 minutes', now() - interval '1.5 hours'),
        (agent_ids[18], demo_user_id, 'Volatility Surfer', 'Surfeur de volatilité implicite', 'volatility', 'active', 'quantitative_analysis', 'derivatives', 74.6, 10890.75, 201, 150, '{"sharpe_ratio": 1.75, "max_drawdown": 8.9}'::jsonb, true, true, now() - interval '5 minutes', now() - interval '22 minutes'),

        -- EXÉCUTION & SÉCURITÉ (6 agents)
        (agent_ids[19], demo_user_id, 'Execution Master', 'Maître d''exécution ultra-rapide', 'execution', 'active', 'execution_security', 'execution', 88.2, 22150.45, 312, 275, '{"sharpe_ratio": 2.8, "max_drawdown": 3.1}'::jsonb, true, true, now() - interval '30 seconds', now() - interval '5 minutes'),
        (agent_ids[20], demo_user_id, 'Security Guardian', 'Gardien de sécurité des positions', 'security', 'active', 'execution_security', 'security', 95.3, 1250.90, 34, 32, '{"sharpe_ratio": 3.2, "max_drawdown": 1.8}'::jsonb, true, true, now() - interval '2 minutes', now() - interval '12 minutes'),
        (agent_ids[21], demo_user_id, 'Slippage Optimizer', 'Optimiseur de glissement d''exécution', 'slippage', 'active', 'execution_security', 'execution', 67.8, 8750.20, 167, 113, '{"sharpe_ratio": 1.5, "max_drawdown": 9.3}'::jsonb, true, true, now() - interval '4 minutes', now() - interval '18 minutes'),
        (agent_ids[22], demo_user_id, 'Liquidity Seeker', 'Chercheur de liquidité optimale', 'liquidity', 'maintenance', 'execution_security', 'execution', 72.1, 9650.75, 189, 136, '{"sharpe_ratio": 1.6, "max_drawdown": 7.4}'::jsonb, false, false, now() - interval '30 minutes', now() - interval '2 hours'),
        (agent_ids[23], demo_user_id, 'Risk Sentinel', 'Sentinelle des limites de risque', 'risk_monitoring', 'active', 'execution_security', 'risk', 89.7, 3420.60, 78, 70, '{"sharpe_ratio": 2.4, "max_drawdown": 4.2}'::jsonb, true, true, now() - interval '1 minute', now() - interval '7 minutes'),
        (agent_ids[24], demo_user_id, 'Emergency Breaker', 'Disjoncteur d''urgence automatique', 'emergency', 'active', 'execution_security', 'emergency', 100.0, 450.25, 12, 12, '{"sharpe_ratio": 4.5, "max_drawdown": 0.5}'::jsonb, true, true, now() - interval '6 minutes', now() - interval '30 minutes');

    -- Create sample trades for active agents
    INSERT INTO public.trades (user_id, asset_id, trade_side, quantity, price, realized_pnl, executed_at) VALUES
        (demo_user_id, aapl_id, 'BUY', 100, 175.50, 250.00, now() - interval '30 minutes'),
        (demo_user_id, tsla_id, 'SELL', 50, 242.30, 180.00, now() - interval '1 hour'),
        (demo_user_id, msft_id, 'BUY', 25, 380.25, 125.50, now() - interval '45 minutes'),
        (demo_user_id, googl_id, 'SELL', 15, 2865.00, -75.25, now() - interval '1.5 hours'),
        (demo_user_id, nvda_id, 'BUY', 75, 485.60, 340.80, now() - interval '20 minutes'),
        (demo_user_id, meta_id, 'BUY', 40, 295.75, 185.30, now() - interval '35 minutes');

    -- Link trades to agents
    INSERT INTO public.ai_agent_trades (ai_agent_id, trade_id, confidence_level, signal_strength, execution_time_ms, reasoning) 
    SELECT 
        agent_ids[1], t.id, 85.5, 92.3, 145, 
        'Signal momentum haussier détecté avec conditions RSI survente et confirmation volume'
    FROM public.trades t WHERE t.asset_id = aapl_id LIMIT 1;

    INSERT INTO public.ai_agent_trades (ai_agent_id, trade_id, confidence_level, signal_strength, execution_time_ms, reasoning) 
    SELECT 
        agent_ids[2], t.id, 92.1, 88.7, 87, 
        'Divergence de prix détectée entre NYSE et NASDAQ, opportunité d''écart 0.3%'
    FROM public.trades t WHERE t.asset_id = tsla_id LIMIT 1;

    -- Create system health records for all agents
    FOR i IN 1..24 LOOP
        INSERT INTO public.system_health (agent_id, health_status, cpu_usage, memory_usage, error_count, warning_count, uptime_seconds, metrics) VALUES
        (
            agent_ids[i], 
            CASE 
                WHEN i = 4 OR i = 10 OR i = 15 THEN 'degraded'
                WHEN i = 22 THEN 'maintenance' 
                ELSE 'healthy' 
            END,
            random() * 80 + 10, -- 10-90% CPU
            random() * 60 + 20, -- 20-80% memory
            CASE WHEN i IN (4, 10, 15) THEN floor(random() * 5 + 1)::INTEGER ELSE 0 END, -- errors for problematic agents
            floor(random() * 3)::INTEGER, -- random warnings
            floor(random() * 86400 + 3600)::INTEGER, -- 1-24 hours uptime
            ('{"response_time_ms": ' || floor(random() * 200 + 50) || ', "throughput_per_sec": ' || floor(random() * 100 + 10) || '}')::jsonb
        );
    END LOOP;

    RAISE NOTICE 'Mock data created successfully: 24 AI agents, 6 assets, 6 sample trades';
    RAISE NOTICE 'Demo credentials: demo@trading-mvp.fr / demo123, admin@trading-mvp.fr / admin123';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Erreur de clé étrangère: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Erreur de contrainte unique: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Erreur inattendue: %', SQLERRM;
END $$;