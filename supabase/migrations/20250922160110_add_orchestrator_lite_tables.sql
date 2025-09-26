-- Location: supabase/migrations/20250922160110_add_orchestrator_lite_tables.sql
-- Schema Analysis: Existing ai_agents, event_bus, system_health tables provide advanced features
-- Integration Type: Addition - Creating simple postgres-compatible tables for Redis+Postgres architecture
-- Dependencies: References existing user_profiles for user relationships

-- 🎯 IMPLEMENTING MODULE: Orchestrator-Lite Redis + Postgres

-- Create simple agent registry table compatible with traditional postgres architecture
CREATE TABLE public.agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    agent_group TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    last_beat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create simple events table for redis pub/sub compatibility
CREATE TABLE public.events (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    ts TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    source TEXT,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create orchestrator state table
CREATE TABLE public.orchestrator_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Essential indexes for performance
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_agents_group ON public.agents(agent_group);
CREATE INDEX idx_agents_last_beat ON public.agents(last_beat);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_ts ON public.events(ts DESC);
CREATE INDEX idx_events_processed ON public.events(processed);
CREATE INDEX idx_events_source ON public.events(source);
CREATE INDEX idx_orchestrator_state_key ON public.orchestrator_state(key);

-- RLS Setup
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orchestrator_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin access for orchestration tables
CREATE POLICY "admin_full_access_agents"
ON public.agents
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_events"
ON public.events
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_orchestrator_state"
ON public.orchestrator_state
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Triggers for updated_at
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orchestrator_state_updated_at
    BEFORE UPDATE ON public.orchestrator_state
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper functions for orchestration
CREATE OR REPLACE FUNCTION public.update_agent_heartbeat(agent_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.agents 
    SET 
        last_beat = CURRENT_TIMESTAMP,
        status = 'active',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = agent_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.agents (id, name, status, last_beat)
        VALUES (agent_id, agent_id, 'active', CURRENT_TIMESTAMP);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_orchestrator_event(
    event_type TEXT,
    event_payload JSONB DEFAULT '{}',
    event_source TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    event_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.events (type, payload, source)
    VALUES (event_type, event_payload, event_source);
    
    RETURN event_id;
END;
$$;

-- Mock data for orchestrator system
DO $$
DECLARE
    agent1_id TEXT := 'dev-agent-1';
    agent2_id TEXT := 'quotes-agent-1';
    agent3_id TEXT := 'regime-detector-1';
BEGIN
    -- Insert sample agents
    INSERT INTO public.agents (id, name, agent_group, status, last_beat) VALUES
        (agent1_id, 'Development Agent', 'development', 'active', CURRENT_TIMESTAMP),
        (agent2_id, 'Market Quotes Agent', 'ingestion', 'active', CURRENT_TIMESTAMP),
        (agent3_id, 'Regime Detector', 'signals', 'inactive', CURRENT_TIMESTAMP - INTERVAL '5 minutes');
    
    -- Insert sample events
    INSERT INTO public.events (type, payload, source, ts) VALUES
        ('heartbeat', '{"agent":"dev-agent-1","status":"healthy","uptime":3600}', agent1_id, CURRENT_TIMESTAMP),
        ('strategy.candidate', '{"symbol":"STLA","strategy":"momentum","score":0.85}', agent1_id, CURRENT_TIMESTAMP - INTERVAL '30 seconds'),
        ('data.market.STLA.1m', '{"symbol":"STLA","price":8.01,"volume":15000,"timestamp":"2025-09-22T16:01:00Z"}', agent2_id, CURRENT_TIMESTAMP - INTERVAL '1 minute'),
        ('quant.regime.state', '{"regime":"volatile","volatility":0.25,"trend":"bullish"}', agent3_id, CURRENT_TIMESTAMP - INTERVAL '2 minutes'),
        ('risk.killswitch', '{"enabled":false,"reason":null,"timestamp":"2025-09-22T16:00:00Z"}', 'risk-controller', CURRENT_TIMESTAMP - INTERVAL '3 minutes');
    
    -- Insert orchestrator state
    INSERT INTO public.orchestrator_state (key, value) VALUES
        ('last_regime_update', '{"timestamp":"2025-09-22T16:00:00Z","regime":"volatile"}'),
        ('killswitch_status', '{"enabled":false,"last_triggered":null}'),
        ('active_agents_count', '{"count":2,"last_updated":"2025-09-22T16:01:00Z"}');
        
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting orchestrator mock data: %', SQLERRM;
END $$;