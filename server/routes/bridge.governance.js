import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

export const bridgeGov = express?.Router();

// Authentication guard middleware
bridgeGov?.use((req, res, next) => {
  if ((req?.headers?.['x-internal-key'] || '') !== process.env?.INTERNAL_ADMIN_KEY) {
    return res?.status(401)?.json({ ok: false, error: 'unauthorized' });
  }
  next();
});

// === SCHEDULE MANAGEMENT ===

// CREATE/UPSERT schedule (cron or one-shot via next_run_at ISO)
bridgeGov?.post('/schedule', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      channel = 'execution', 
      command, 
      payload = {}, 
      cron_expression = null, 
      next_run_at = null, 
      priority = 0, 
      is_active = true 
    } = req?.body || {};

    if (!name || !command || (!cron_expression && !next_run_at)) {
      return res?.status(400)?.json({ 
        ok: false, 
        error: 'name, command, and cron_expression or next_run_at required' 
      });
    }

    const { data, error } = await supa?.from('orch_schedule')?.upsert({ 
      name, 
      description, 
      channel, 
      command, 
      payload, 
      cron_expression, 
      next_run_at, 
      priority, 
      is_active 
    }, { onConflict: 'name' })?.select()?.single();

    if (error) throw error;

    res?.json({ ok: true, schedule: data });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// TOGGLE schedule active/inactive
bridgeGov?.post('/schedule/toggle', async (req, res) => {
  try {
    const { name, is_active } = req?.body || {};

    if (!name || typeof is_active !== 'boolean') {
      return res?.status(400)?.json({ ok: false, error: 'name and is_active required' });
    }

    const { error } = await supa?.from('orch_schedule')?.update({ 
      is_active, 
      updated_at: new Date()?.toISOString() 
    })?.eq('name', name);

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// GET all schedules
bridgeGov?.get('/schedule', async (req, res) => {
  try {
    const { data, error } = await supa?.from('orch_schedule')?.select('*')?.order('created_at', { ascending: false })?.limit(100);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// === PROPOSALS MANAGEMENT ===

// GET proposals for UI
bridgeGov?.get('/proposals', async (req, res) => {
  try {
    const { data, error } = await supa?.from('orch_proposals')?.select('*')?.in('status', ['proposed', 'approved'])?.order('created_at', { ascending: false })?.limit(200);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// APPROVE proposal => enqueue command
bridgeGov?.post('/proposals/approve', async (req, res) => {
  try {
    const { id } = req?.body || {};

    if (!id) return res?.status(400)?.json({ ok: false, error: 'id required' });

    const { data: prop, error: e1 } = await supa?.from('orch_proposals')?.update({ 
      status: 'approved', 
      updated_at: new Date()?.toISOString() 
    })?.eq('id', id)?.select('action,payload')?.single();

    if (e1) throw e1;

    // Enqueue for execution
    const { error: e2 } = await supa?.from('orch_inbox')?.insert({ 
      channel: 'strategy-proposals', 
      command: prop?.action, 
      payload: prop?.payload, 
      status: 'queued', 
      priority: 50, 
      created_at: new Date()?.toISOString() 
    });

    if (e2) throw e2;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// REJECT proposal
bridgeGov?.post('/proposals/reject', async (req, res) => {
  try {
    const { id, reason = 'rejected' } = req?.body || {};

    if (!id) return res?.status(400)?.json({ ok: false, error: 'id required' });

    const { error } = await supa?.from('orch_proposals')?.update({ 
      status: 'rejected', 
      justification: reason, 
      updated_at: new Date()?.toISOString() 
    })?.eq('id', id);

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// === PLAYBOOKS MANAGEMENT ===

// GET playbooks
bridgeGov?.get('/playbooks', async (req, res) => {
  try {
    const { data, error } = await supa?.from('orch_playbooks')?.select('*')?.order('created_at', { ascending: false })?.limit(50);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// TOGGLE playbook
bridgeGov?.post('/playbooks/toggle', async (req, res) => {
  try {
    const { id, is_active } = req?.body || {};

    if (!id || typeof is_active !== 'boolean') {
      return res?.status(400)?.json({ ok: false, error: 'id and is_active required' });
    }

    const { error } = await supa?.from('orch_playbooks')?.update({ 
      is_active, 
      updated_at: new Date()?.toISOString() 
    })?.eq('id', id);

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// === SCALING RULESET STORE ===

// SET scaling ruleset (KV store)
bridgeGov?.post('/scaling/ruleset', async (req, res) => {
  try {
    const { rules } = req?.body || {};

    // Create KV table if needed
    await supa?.rpc('ensure_kv_table')?.catch(() => {});

    const { error } = await supa?.from('kv_store')?.upsert({ 
      k: 'scaling_rules', 
      v: rules || {}, 
      updated_at: new Date()?.toISOString() 
    }, { onConflict: 'k' });

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// GET scaling ruleset
bridgeGov?.get('/scaling/ruleset', async (req, res) => {
  try {
    const { data, error } = await supa?.from('kv_store')?.select('v')?.eq('k', 'scaling_rules')?.single();

    if (error && error?.code !== 'PGRST116') throw error;

    res?.json({ ok: true, rules: data?.v || {} });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// === LEARNING KPIS ===

// GET learning KPIs
bridgeGov?.get('/learning-kpis', async (req, res) => {
  try {
    const { data, error } = await supa?.from('learning_kpis_daily')?.select('*')?.order('day', { ascending: false })?.limit(30);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// GET agent KPIs by name
bridgeGov?.get('/agent-kpis/:agent_name', async (req, res) => {
  try {
    const { agent_name } = req?.params;
    const { data, error } = await supa?.from('agent_kpis_daily')?.select('*')?.eq('agent_name', agent_name)?.order('day', { ascending: false })?.limit(30);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// === PORTFOLIO METRICS ===

// GET portfolio metrics
bridgeGov?.get('/portfolio-metrics', async (req, res) => {
  try {
    const { data, error } = await supa?.from('portfolio_metrics')?.select('*')?.order('as_of', { ascending: false })?.limit(100);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// Health check endpoint for governance bridge
bridgeGov?.get('/health', (req, res) => {
  res?.json({ 
    ok: true, 
    service: 'governance-bridge',
    timestamp: new Date()?.toISOString(),
    endpoints: {
      schedule: ['POST /schedule', 'POST /schedule/toggle', 'GET /schedule'],
      proposals: ['GET /proposals', 'POST /proposals/approve', 'POST /proposals/reject'],
      playbooks: ['GET /playbooks', 'POST /playbooks/toggle'],
      scaling: ['POST /scaling/ruleset', 'GET /scaling/ruleset'],
      kpis: ['GET /learning-kpis', 'GET /agent-kpis/:agent_name'],
      metrics: ['GET /portfolio-metrics']
    }
  });
});

export default bridgeGov;