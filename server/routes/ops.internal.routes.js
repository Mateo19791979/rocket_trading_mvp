// ======================================================================
// Routes JSON — server/routes/ops.internal.routes.js
// Déclencher un audit à la demande + lire dernier statut
// ======================================================================

/* eslint-disable */
import express from 'express';
import { createClient } from '@supabase/supabase-js';

export const ops = express?.Router();

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
const ADMIN = process.env?.INTERNAL_ADMIN_KEY || '';

ops?.use((req, res, next) => {
  res?.set('content-type', 'application/json; charset=utf-8');
  next();
});

// POST /internal/ops/audit-run (protégé)
ops?.post('/audit-run', async (req, res) => {
  if (req?.headers?.['x-internal-key'] !== ADMIN) return res?.status(401)?.json({ ok: false, error: 'unauthorized' });

  try {
    const { data, error } = await supa?.rpc('audit_run_all');
    if (error) return res?.status(200)?.json({ ok: false, error: String(error?.message || error) });

    res?.json({ ok: true, results: data?.results || [] });
  } catch (e) {
    res?.status(200)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// GET /internal/ops/audit-status
ops?.get('/audit-status', async (_req, res) => {
  try {
    const { data, error } = await supa?.from('schema_audit_status')?.select('*');
    if (error) return res?.status(200)?.json({ ok: false, error: String(error?.message || error) });

    res?.json({ ok: true, status: data || [] });
  } catch (e) {
    res?.status(200)?.json({ ok: false, error: String(e?.message || e) });
  }
});

// POST /internal/ops/repair/positions-is_active
ops?.post('/repair/positions-is_active', async (req, res) => {
  if (req?.headers?.['x-internal-key'] !== ADMIN) return res?.status(401)?.json({ ok: false, error: 'unauthorized' });

  try {
    const { data, error } = await supa?.rpc('audit_ensure_boolean_column', {
      p_schema: 'public', p_table: 'positions', p_column: 'is_active', p_default: true, p_do_repair: true
    });

    if (error) return res?.status(200)?.json({ ok: false, error: String(error?.message || error) });

    res?.json({ ok: true, result: data });
  } catch (e) {
    res?.status(200)?.json({ ok: false, error: String(e?.message || e) });
  }
});

export default ops;