-- Location: supabase/migrations/20251209180000_add_orchestrator_bridge_system.sql
-- Schema Analysis: Adding orchestrator bridge system for AAS ↔ Chef Orchestrateur communication
-- Integration Type: addition/extension 
-- Dependencies: Using service role authentication for secure bridge operations

-- 1. Create command status enum
CREATE TYPE public.cmd_status AS ENUM ('queued','ack','running','done','error');

-- 2. Create inbox table for incoming commands
CREATE TABLE IF NOT EXISTS public.orch_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL DEFAULT 'default',
    command TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    issued_by TEXT NOT NULL DEFAULT 'assistant',
    priority SMALLINT NOT NULL DEFAULT 0,
    status public.cmd_status NOT NULL DEFAULT 'queued'::public.cmd_status,
    picked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create outbox table for command results
CREATE TABLE IF NOT EXISTS public.orch_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inbox_id UUID REFERENCES public.orch_inbox(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    command TEXT NOT NULL,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    ok BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS orch_inbox_status_idx ON public.orch_inbox(channel, status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS orch_outbox_inbox_idx ON public.orch_outbox(inbox_id);

-- 5. Create atomic pull function with skip locked
CREATE OR REPLACE FUNCTION public.pull_orch_cmd(p_channel TEXT)
RETURNS public.orch_inbox
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    row public.orch_inbox;
BEGIN
    -- Update and return the next queued command atomically
    UPDATE public.orch_inbox
    SET status = 'ack'::public.cmd_status, 
        picked_at = CURRENT_TIMESTAMP, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = (
        SELECT id
        FROM public.orch_inbox
        WHERE channel = COALESCE(p_channel, 'default')
          AND status = 'queued'::public.cmd_status
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING * INTO row;

    -- If we got a row, mark it as running
    IF row.id IS NOT NULL THEN
        UPDATE public.orch_inbox 
        SET status = 'running'::public.cmd_status, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = row.id;
    END IF;

    RETURN row;
END;
$$;

-- 6. Enable RLS for security
ALTER TABLE public.orch_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orch_outbox ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist
DROP POLICY IF EXISTS orch_inbox_all ON public.orch_inbox;
DROP POLICY IF EXISTS orch_outbox_all ON public.orch_outbox;

-- 8. Create RLS policies for service role only access
CREATE POLICY orch_inbox_all ON public.orch_inbox
    FOR ALL USING (auth.role() = 'service_role') 
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY orch_outbox_all ON public.orch_outbox
    FOR ALL USING (auth.role() = 'service_role') 
    WITH CHECK (auth.role() = 'service_role');

-- 9. Sample mock data for testing
DO $$
BEGIN
    -- Insert sample commands for testing
    INSERT INTO public.orch_inbox (channel, command, payload, issued_by, priority)
    VALUES
        ('execution', 'rebalance', '{"symbol":"SPY","target":0.15}'::jsonb, 'assistant', 1),
        ('data', 'sync-books', '{"source":"yahoo","symbols":["AAPL","GOOGL"]}'::jsonb, 'system', 0),
        ('research', 'run-backtest', '{"strategy":"momentum","period":"1Y"}'::jsonb, 'assistant', 2);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Sample data insertion failed: %', SQLERRM;
END $$;