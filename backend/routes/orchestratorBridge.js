import express from 'express';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service key for database access
const supa = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

const bridge = express.Router();

// Security guard middleware - validates internal admin key
function guard(req, res, next) {
    const k = req.headers['x-internal-key'] || '';
    if (k !== process.env.INTERNAL_ADMIN_KEY) {
        return res.status(401).json({
            ok: false, 
            error: 'unauthorized',
            message: 'Invalid or missing x-internal-key header'
        });
    }
    next();
}

// 1) Assistant/Console envoie un ordre à l'orchestrateur 
bridge.post('/enqueue', guard, async (req, res) => {
    try {
        const { 
            channel = 'default', 
            command, 
            payload = {}, 
            priority = 0, 
            issued_by = 'assistant' 
        } = req.body || {};

        if (!command) {
            return res.status(400).json({
                ok: false, 
                error: 'command_required',
                message: 'Command field is required'
            });
        }

        const { data, error } = await supa
            .from('orch_inbox')
            .insert([{
                channel,
                command,
                payload,
                priority,
                issued_by
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({
            ok: true, 
            inbox_id: data.id,
            message: `Command '${command}' queued successfully`
        });

    } catch (e) {
        console.error('Bridge enqueue error:', e);
        res.status(500).json({
            ok: false, 
            error: String(e.message || e),
            endpoint: 'enqueue'
        });
    }
});

// 2) Chef Orchestrateur "pull" la prochaine commande (atomique, skip locked)
bridge.post('/pull', guard, async (req, res) => {
    try {
        const { channel = 'default' } = req.body || {};

        const { data, error } = await supa.rpc('pull_orch_cmd', { 
            p_channel: channel 
        });

        if (error) throw error;

        res.json({
            ok: true, 
            cmd: data || null,
            message: data ? `Command pulled from channel '${channel}'` : `No commands available in channel '${channel}'`
        });

    } catch (e) {
        console.error('Bridge pull error:', e);
        res.status(500).json({
            ok: false, 
            error: String(e.message || e),
            endpoint: 'pull'
        });
    }
});

// 3) Chef Orchestrateur pousse le résultat
bridge.post('/report', guard, async (req, res) => {
    try {
        const { inbox_id, ok: success = true, result = {} } = req.body || {};

        if (!inbox_id) {
            return res.status(400).json({
                ok: false, 
                error: 'inbox_id_required',
                message: 'inbox_id field is required'
            });
        }

        // Update inbox status
        const { data: inRow, error: e1 } = await supa
            .from('orch_inbox')
            .update({
                status: success ? 'done' : 'error',
                updated_at: new Date().toISOString()
            })
            .eq('id', inbox_id)
            .select('id,channel,command')
            .single();

        if (e1) throw e1;

        // Insert result into outbox
        const { error: e2 } = await supa
            .from('orch_outbox')
            .insert([{
                inbox_id,
                channel: inRow.channel,
                command: inRow.command,
                ok: success,
                result
            }]);

        if (e2) throw e2;

        res.json({
            ok: true,
            message: `Result reported for command '${inRow.command}' with status: ${success ? 'success' : 'error'}`
        });

    } catch (e) {
        console.error('Bridge report error:', e);
        res.status(500).json({
            ok: false, 
            error: String(e.message || e),
            endpoint: 'report'
        });
    }
});

// 4) (Optionnel) Lire le dernier résultat lié à un inbox_id
bridge.get('/result/:inbox_id', guard, async (req, res) => {
    try {
        const { inbox_id } = req.params;

        const { data, error } = await supa
            .from('orch_outbox')
            .select('*')
            .eq('inbox_id', inbox_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;

        res.json({
            ok: true, 
            result: data,
            message: `Result retrieved for inbox_id '${inbox_id}'`
        });

    } catch (e) {
        console.error('Bridge result error:', e);
        res.status(500).json({
            ok: false, 
            error: String(e.message || e),
            endpoint: 'result'
        });
    }
});

// 5) Health check endpoint
bridge.get('/health', (req, res) => {
    res.json({
        ok: true,
        service: 'orchestrator-bridge',
        timestamp: new Date().toISOString(),
        message: 'Bridge is operational'
    });
});

export default bridge;