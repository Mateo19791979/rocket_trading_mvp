// ====================================================================== 
// (B) API NODE/EXPRESS — Validation, Pull atomique, Kill-switch status
// ======================================================================

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
const router = express?.Router();

// ------- Guard --------
router?.use((req, res, next) => {
  if ((req?.headers?.['x-internal-key'] || '') !== process.env?.INTERNAL_ADMIN_KEY) {
    return res?.status(401)?.json({ ok: false, error: 'unauthorized' });
  }
  next();
});

// ------- Register -------
router?.post('/register', async (req, res) => {
  try {
    const { name, kind = 'custom', version = '1.0.0', capabilities = [] } = req?.body || {};
    if (!name) return res?.status(400)?.json({ ok: false, error: 'name required' });
    
    const updateData = { 
      name, 
      kind, 
      version, 
      capabilities, 
      status: 'idle', 
      last_heartbeat: new Date()?.toISOString() 
    };
    
    const { data, error } = await supabase?.from('agents')?.upsert(updateData, { onConflict: 'name' })?.select()?.single();
      
    if (error) throw error;
    
    return res?.json({ ok: true, agent: data });
  } catch (e) {
    return res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// ------- Heartbeat -------
router?.post('/heartbeat', async (req, res) => {
  try {
    const { name, status = 'idle', kpi } = req?.body || {};
    if (!name) return res?.status(400)?.json({ ok: false, error: 'name required' });
    
    await supabase?.from('agents')?.update({ 
        status, 
        last_heartbeat: new Date()?.toISOString() 
      })?.eq('name', name);
    
    if (kpi) {
      await supabase?.from('agent_metrics')?.insert({ agent_name: name, kpi });
    }
    
    return res?.json({ ok: true });
  } catch (e) {
    return res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// ------- Pull (atomic via RPC) -------
router?.post('/pull', async (req, res) => {
  try {
    const { name } = req?.body || {};
    if (!name) return res?.status(400)?.json({ ok: false, error: 'name required' });
    
    const { data: task, error } = await supabase?.rpc('pull_agent_task', { 
      p_agent_name: name 
    });
    
    if (error) throw error;
    
    return res?.json({ ok: true, task: task || null });
  } catch (e) {
    return res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// ------- Report -------
router?.post('/report', async (req, res) => {
  try {
    const { task_id, status, result, error } = req?.body || {};
    if (!task_id || !status) {
      return res?.status(400)?.json({ ok: false, error: 'task_id & status required' });
    }
    
    const nextStatus = (status === 'ok') ? 'done' : (status === 'fail' ? 'failed' : status);
    
    await supabase?.from('agent_tasks')?.update({
        status: nextStatus,
        result: result || null,
        error: error || null
      })?.eq('id', task_id);
    
    return res?.json({ ok: true });
  } catch (e) {
    return res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// ------- Enqueue (admin helper) -------
router?.post('/enqueue', async (req, res) => {
  try {
    const { agent_name, task_type, payload, priority = 0 } = req?.body || {};
    if (!agent_name || !task_type) {
      return res?.status(400)?.json({ ok: false, error: 'agent_name & task_type required' });
    }
    
    const { data, error } = await supabase?.from('agent_tasks')?.insert({
        agent_name, 
        task_type, 
        payload: payload || {}, 
        priority
      })?.select()?.single();
      
    if (error) throw error;
    
    return res?.json({ ok: true, task: data });
  } catch (e) {
    return res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// ------- Kill-switch status (read) -------
router?.get('/kill-switches-status', async (_req, res) => {
  try {
    const { data, error } = await supabase?.from('kill_switches')?.select('*')?.order('module');
      
    if (error) throw error;
    
    return res?.json({ ok: true, switches: data || [] });
  } catch (e) {
    return res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

export default router;
export function internalAgents(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: internalAgents is not implemented yet.', args);
  return null;
}
