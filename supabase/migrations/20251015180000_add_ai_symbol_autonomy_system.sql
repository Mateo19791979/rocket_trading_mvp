-- Location: supabase/migrations/20251015180000_add_ai_symbol_autonomy_system.sql
-- AI Symbol Autonomy System - Let AI agents choose which symbols to trade/observe with guardrails
-- Integration Type: Additive - builds upon existing IBKR market cache system
-- Dependencies: market_ticks_cache table already exists

-- AI trade intents table for audit/traceability
CREATE TABLE IF NOT EXISTS public.ai_trade_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  intent TEXT NOT NULL CHECK (intent IN ('watch', 'trade', 'unwatch')),
  symbol TEXT NOT NULL,
  confidence NUMERIC,
  metadata JSONB DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Control lists (guardrails)
CREATE TABLE IF NOT EXISTS public.symbol_whitelist (
  symbol TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.symbol_blacklist (
  symbol TEXT PRIMARY KEY
);

-- Agent quotas (how many symbols simultaneously)
CREATE TABLE IF NOT EXISTS public.agent_symbol_quotas (
  agent_name TEXT PRIMARY KEY,
  max_symbols INTEGER NOT NULL DEFAULT 50
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_trade_intents_agent_name ON public.ai_trade_intents(agent_name);
CREATE INDEX IF NOT EXISTS idx_ai_trade_intents_symbol ON public.ai_trade_intents(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_trade_intents_created_at ON public.ai_trade_intents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_trade_intents_status ON public.ai_trade_intents(status);

-- Enable RLS (access service_role only)
ALTER TABLE public.ai_trade_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbol_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symbol_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_symbol_quotas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS p_ai_trade_intents_all ON public.ai_trade_intents;
DROP POLICY IF EXISTS p_symbol_whitelist_all ON public.symbol_whitelist;
DROP POLICY IF EXISTS p_symbol_blacklist_all ON public.symbol_blacklist;
DROP POLICY IF EXISTS p_agent_symbol_quotas_all ON public.agent_symbol_quotas;

-- RLS policies (service_role access only for AI operations)
CREATE POLICY p_ai_trade_intents_all ON public.ai_trade_intents
  FOR ALL 
  USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY p_symbol_whitelist_all ON public.symbol_whitelist
  FOR ALL 
  USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY p_symbol_blacklist_all ON public.symbol_blacklist
  FOR ALL 
  USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY p_agent_symbol_quotas_all ON public.agent_symbol_quotas
  FOR ALL 
  USING (auth.role() = 'service_role') 
  WITH CHECK (auth.role() = 'service_role');

-- Default quota setting
INSERT INTO public.agent_symbol_quotas(agent_name, max_symbols)
  VALUES ('*', 100) 
  ON CONFLICT (agent_name) DO NOTHING;

-- Mock data for testing AI symbol autonomy
DO $$
BEGIN
    -- Add some sample whitelist symbols
    INSERT INTO public.symbol_whitelist(symbol) VALUES
        ('AAPL'), ('MSFT'), ('TSLA'), ('SPY'), ('QQQ'), ('NVDA'),
        ('EUR.USD'), ('GBP.USD'), ('BTCUSD'), ('ETHUSD')
    ON CONFLICT (symbol) DO NOTHING;
    
    -- Add some blacklisted symbols
    INSERT INTO public.symbol_blacklist(symbol) VALUES
        ('PENNY'), ('SCAM'), ('FRAUD')
    ON CONFLICT (symbol) DO NOTHING;
    
    -- Set quotas for specific agents
    INSERT INTO public.agent_symbol_quotas(agent_name, max_symbols) VALUES
        ('MomentumHunter_US', 25),
        ('ArbitrageBot_FX', 15),
        ('CryptoScalper_1', 10),
        ('AITrader_Premium', 50)
    ON CONFLICT (agent_name) DO UPDATE SET max_symbols = EXCLUDED.max_symbols;
    
    -- Sample AI trade intents for testing
    INSERT INTO public.ai_trade_intents(agent_name, intent, symbol, confidence, metadata, status) VALUES
        ('MomentumHunter_US', 'watch', 'NVDA', 0.85, '{"timeframe":"1m","reason":"breakout_20D"}'::JSONB, 'accepted'),
        ('ArbitrageBot_FX', 'trade', 'EUR.USD', 0.92, '{"strategy":"cross_currency","spread":0.002}'::JSONB, 'accepted'),
        ('CryptoScalper_1', 'watch', 'BTCUSD', 0.78, '{"volatility":"high","volume_spike":true}'::JSONB, 'accepted'),
        ('AITrader_Premium', 'unwatch', 'SPY', 0.45, '{"reason":"low_volatility","exit_strategy":"timeout"}'::JSONB, 'accepted');
        
    RAISE NOTICE 'AI Symbol Autonomy System installed successfully with sample data';
END $$;

-- Comments for documentation
COMMENT ON TABLE public.ai_trade_intents IS 'AI agent trading intentions for audit and traceability';
COMMENT ON TABLE public.symbol_whitelist IS 'Approved symbols that AI agents can trade';
COMMENT ON TABLE public.symbol_blacklist IS 'Forbidden symbols that AI agents cannot trade';
COMMENT ON TABLE public.agent_symbol_quotas IS 'Maximum number of symbols each AI agent can monitor simultaneously';