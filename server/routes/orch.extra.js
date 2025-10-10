import express from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

export const orchExtra = express?.Router();

// Guard middleware - require internal admin key
orchExtra?.use((req, res, next) => {
  if ((req?.headers?.['x-internal-key'] || '') !== process.env?.INTERNAL_ADMIN_KEY) {
    return res?.status(401)?.json({ ok: false, error: 'unauthorized' });
  }
  next();
});

/* ---------- (A) SCHEDULER: créer/mettre à jour des plannings ----------- */

const scheduleBody = z?.object({
  channel: z?.string()?.min(1),
  command: z?.string()?.min(1),
  payload: z?.any()?.default({}),
  // EITHER cron_expression OR run_at (ISO)
  cron_expression: z?.string()?.optional(),
  run_at: z?.string()?.datetime()?.optional(),
  is_active: z?.boolean()?.optional()
});

orchExtra?.post('/schedule', async (req, res) => {
  try {
    const b = scheduleBody?.parse(req?.body || {});
    const next_run_at = b?.run_at ? new Date(b.run_at)?.toISOString() : null;

    if (!b?.cron_expression && !next_run_at) {
      return res?.status(400)?.json({ ok: false, error: 'provide cron_expression or run_at' });
    }

    const { data, error } = await supa?.from('orch_schedule')?.insert({
      channel: b?.channel,
      command: b?.command,
      payload: b?.payload,
      cron_expression: b?.cron_expression || null,
      next_run_at,
      is_active: b?.is_active ?? true
    })?.select('id')?.single();

    if (error) throw error;

    res?.json({ ok: true, id: data?.id });
  } catch (e) {
    res?.status(400)?.json({ ok: false, error: String(e?.message || e) });
  }
});

orchExtra?.post('/schedule/toggle', async (req, res) => {
  try {
    const p = z?.object({ id: z?.string()?.uuid(), is_active: z?.boolean() })?.parse(req?.body || {});

    const { error } = await supa?.from('orch_schedule')?.update({
      is_active: p?.is_active,
      updated_at: new Date()?.toISOString()
    })?.eq('id', p?.id);

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(400)?.json({ ok: false, error: String(e?.message || e) });
  }
});

orchExtra?.get('/schedule', async (req, res) => {
  try {
    const { data, error } = await supa?.from('orch_schedule')?.select('*')?.order('created_at', { ascending: false })?.limit(100);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

/* ---------- (B) PROPOSALS: liste / approve / reject -------------------- */

orchExtra?.get('/proposals', async (req, res) => {
  try {
    const { data, error } = await supa?.from('orch_proposals')?.select('*')?.order('created_at', { ascending: false })?.limit(200);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

orchExtra?.post('/proposals/approve', async (req, res) => {
  try {
    const p = z?.object({ id: z?.string()?.uuid() })?.parse(req?.body || {});

    const { data: prop, error: e1 } = await supa?.from('orch_proposals')?.update({ status: 'approved', updated_at: new Date()?.toISOString() })?.eq('id', p?.id)?.select('id, action, payload')?.single();

    if (e1) throw e1;

    // Enqueue dans orch_inbox (on suppose que la table existe déjà)
    const { error: e2 } = await supa?.from('orch_inbox')?.insert({
      channel: 'strategy-proposals',
      command: prop?.action,
      payload: prop?.payload,
      status: 'queued',
      created_at: new Date()?.toISOString()
    });

    if (e2) throw e2;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(400)?.json({ ok: false, error: String(e?.message || e) });
  }
});

orchExtra?.post('/proposals/reject', async (req, res) => {
  try {
    const p = z?.object({
      id: z?.string()?.uuid(),
      reason: z?.string()?.optional()
    })?.parse(req?.body || {});

    const { error } = await supa?.from('orch_proposals')?.update({
      status: 'rejected',
      justification: (p?.reason || 'rejected'),
      updated_at: new Date()?.toISOString()
    })?.eq('id', p?.id);

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(400)?.json({ ok: false, error: String(e?.message || e) });
  }
});

/* ---------- (C) PLAYBOOKS: liste et gestion ----------------------- */

orchExtra?.get('/playbooks', async (req, res) => {
  try {
    const { data, error } = await supa?.from('orch_playbooks')?.select('*')?.order('created_at', { ascending: false })?.limit(50);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

orchExtra?.post('/playbooks/toggle', async (req, res) => {
  try {
    const p = z?.object({ id: z?.string()?.uuid(), is_active: z?.boolean() })?.parse(req?.body || {});

    const { error } = await supa?.from('orch_playbooks')?.update({
      is_active: p?.is_active,
      updated_at: new Date()?.toISOString()
    })?.eq('id', p?.id);

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(400)?.json({ ok: false, error: String(e?.message || e) });
  }
});

/* ---------- (D) SCALING: ruleset configuration ------------------- */

orchExtra?.post('/scaling/ruleset', async (req, res) => {
  try {
    const { rules } = req?.body || {};

    const { error } = await supa?.from('kv_store')?.upsert({
      k: 'scaling_rules',
      v: rules,
      updated_at: new Date()?.toISOString()
    }, { onConflict: 'k' });

    if (error) throw error;

    res?.json({ ok: true });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

orchExtra?.get('/scaling/ruleset', async (req, res) => {
  try {
    const { data, error } = await supa?.from('kv_store')?.select('v')?.eq('k', 'scaling_rules')?.single();

    if (error) throw error;

    res?.json({ ok: true, rules: data?.v || {} });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

/* ---------- (E) LEARNING KPIS: récupération des métriques -------- */

orchExtra?.get('/learning-kpis', async (req, res) => {
  try {
    const { data, error } = await supa?.from('learning_kpis_daily')?.select('*')?.order('day', { ascending: false })?.limit(30);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

orchExtra?.get('/agent-kpis/:agent_name', async (req, res) => {
  try {
    const { agent_name } = req?.params;
    const { data, error } = await supa?.from('agent_kpis_daily')?.select('*')?.eq('agent_name', agent_name)?.order('day', { ascending: false })?.limit(30);

    if (error) throw error;

    res?.json({ ok: true, items: data || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

export default orchExtra;