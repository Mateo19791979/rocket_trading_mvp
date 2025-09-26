-- Location: supabase/migrations/20250922154750_add_risk_controller.sql
-- Schema Analysis: Existing risk management infrastructure with risk_metrics, alerts, event_bus, system_health
-- Integration Type: Addition of risk controller killswitch management
-- Dependencies: user_profiles, ai_agents, event_bus, risk_metrics, alerts

-- Create enum for killswitch status
CREATE TYPE public.killswitch_status AS ENUM ('active', 'inactive', 'triggered', 'recovering');

-- Create risk controller table for emergency killswitch management
CREATE TABLE public.risk_controller (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    killswitch_enabled BOOLEAN DEFAULT false,
    killswitch_status public.killswitch_status DEFAULT 'inactive'::public.killswitch_status,
    triggered_at TIMESTAMPTZ,
    triggered_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    trigger_reason TEXT,
    max_daily_loss NUMERIC(12,2) DEFAULT 1000.00,
    max_portfolio_drawdown NUMERIC(5,2) DEFAULT 10.00,
    emergency_stop_all BOOLEAN DEFAULT false,
    auto_recovery_enabled BOOLEAN DEFAULT true,
    recovery_delay_minutes INTEGER DEFAULT 30,
    last_health_check TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    configuration JSONB DEFAULT '{"market_hours_only": true, "validate_orders": true, "max_position_size": 50000}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create risk events table for audit trail
CREATE TABLE public.risk_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_controller_id UUID REFERENCES public.risk_controller(id) ON DELETE CASCADE,
    event_type public.event_type DEFAULT 'risk_alert'::public.event_type,
    severity public.alert_severity DEFAULT 'medium'::public.alert_severity,
    description TEXT NOT NULL,
    details JSONB,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_risk_controller_user_id ON public.risk_controller(user_id);
CREATE INDEX idx_risk_controller_status ON public.risk_controller(killswitch_status);
CREATE INDEX idx_risk_events_controller_id ON public.risk_events(risk_controller_id);
CREATE INDEX idx_risk_events_type_severity ON public.risk_events(event_type, severity);
CREATE INDEX idx_risk_events_created_at ON public.risk_events(created_at DESC);

-- Create function to activate killswitch
CREATE OR REPLACE FUNCTION public.activate_killswitch(
    controller_id UUID,
    reason TEXT DEFAULT 'Manual activation'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    agent_count INTEGER;
BEGIN
    -- Update killswitch status
    UPDATE public.risk_controller 
    SET 
        killswitch_enabled = true,
        killswitch_status = 'triggered'::public.killswitch_status,
        triggered_at = CURRENT_TIMESTAMP,
        triggered_by = auth.uid(),
        trigger_reason = reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = controller_id AND user_id = auth.uid();

    -- Pause all user's AI agents
    UPDATE public.ai_agents 
    SET agent_status = 'paused'::public.ai_agent_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid();

    GET DIAGNOSTICS agent_count = ROW_COUNT;

    -- Create event bus entry
    INSERT INTO public.event_bus (event_type, priority, event_data, source_agent_id)
    VALUES (
        'risk_alert'::public.event_type,
        'critical'::public.event_priority,
        jsonb_build_object(
            'action', 'killswitch_activated',
            'reason', reason,
            'agents_paused', agent_count,
            'timestamp', CURRENT_TIMESTAMP
        ),
        NULL
    );

    -- Log risk event
    INSERT INTO public.risk_events (risk_controller_id, event_type, severity, description, details)
    VALUES (
        controller_id,
        'risk_alert'::public.event_type,
        'critical'::public.alert_severity,
        'Emergency killswitch activated',
        jsonb_build_object(
            'reason', reason,
            'agents_affected', agent_count,
            'triggered_by', auth.uid()
        )
    );

    RETURN true;
END;
$func$;

-- Create function to deactivate killswitch
CREATE OR REPLACE FUNCTION public.deactivate_killswitch(
    controller_id UUID,
    recovery_reason TEXT DEFAULT 'Manual deactivation'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
    agent_count INTEGER;
BEGIN
    -- Update killswitch status
    UPDATE public.risk_controller 
    SET 
        killswitch_enabled = false,
        killswitch_status = 'inactive'::public.killswitch_status,
        emergency_stop_all = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = controller_id AND user_id = auth.uid();

    -- Reactivate user's AI agents
    UPDATE public.ai_agents 
    SET agent_status = 'active'::public.ai_agent_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid() AND agent_status = 'paused'::public.ai_agent_status;

    GET DIAGNOSTICS agent_count = ROW_COUNT;

    -- Create event bus entry
    INSERT INTO public.event_bus (event_type, priority, event_data)
    VALUES (
        'system_status'::public.event_type,
        'medium'::public.event_priority,
        jsonb_build_object(
            'action', 'killswitch_deactivated',
            'reason', recovery_reason,
            'agents_reactivated', agent_count,
            'timestamp', CURRENT_TIMESTAMP
        )
    );

    -- Log risk event
    INSERT INTO public.risk_events (risk_controller_id, event_type, severity, description, details, resolved_at, resolved_by)
    VALUES (
        controller_id,
        'system_status'::public.event_type,
        'low'::public.alert_severity,
        'Killswitch deactivated - system recovered',
        jsonb_build_object(
            'reason', recovery_reason,
            'agents_reactivated', agent_count
        ),
        CURRENT_TIMESTAMP,
        auth.uid()
    );

    RETURN true;
END;
$func$;

-- Create function to update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

-- Enable RLS
ALTER TABLE public.risk_controller ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using Pattern 2 (Simple User Ownership)
CREATE POLICY "users_manage_own_risk_controller"
ON public.risk_controller
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_risk_events"
ON public.risk_events
FOR ALL
TO authenticated
USING (
    risk_controller_id IN (
        SELECT id FROM public.risk_controller WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    risk_controller_id IN (
        SELECT id FROM public.risk_controller WHERE user_id = auth.uid()
    )
);

-- Create triggers for updated_at
CREATE TRIGGER update_risk_controller_updated_at
    BEFORE UPDATE ON public.risk_controller
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default risk controller for existing users
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Create risk controller for existing users
    FOR existing_user_id IN SELECT id FROM public.user_profiles LOOP
        INSERT INTO public.risk_controller (user_id, max_daily_loss, max_portfolio_drawdown)
        VALUES (existing_user_id, 1000.00, 10.00)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;