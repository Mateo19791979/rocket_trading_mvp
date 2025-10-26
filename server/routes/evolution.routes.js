// ======================================================================
// Routes JSON — server/routes/evolution.routes.js
// ======================================================================

/* eslint-disable */
import express from 'express';
import { createClient } from '@supabase/supabase-js';

export function makeEvolutionRoutes() {
  const r = express?.Router();
  const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
  const ADMIN = process.env?.INTERNAL_ADMIN_KEY || '';

  r?.use((req, res, next) => {
    res?.set('content-type', 'application/json; charset=utf-8');
    next();
  });

  // POST /api/evo/mutate (forcé) — protégé
  r?.post('/mutate', async (req, res) => {
    if (req?.headers?.['x-internal-key'] !== ADMIN) return res?.status(401)?.json({ ok: false, error: 'unauthorized' });

    // Déclenche simplement un cycle
    try { 
      await fetch('http://127.0.0.1:' + (process.env?.PORT || 3000) + '/__evo_tick')?.catch(() => {}); 
    } catch (_e) { }

    res?.json({ ok: true, message: 'tick requested' });
  });

  // GET /api/evo/candidates?status=testing|paper|rejected
  r?.get('/candidates', async (req, res) => {
    const status = String(req?.query?.status || 'testing');
    const { data, error } = await supa?.from('evo_candidates')?.select('*')?.eq('status', status)?.order('created_at', { ascending: false })?.limit(50);

    if (error) return res?.status(200)?.json({ ok: false, error: String(error?.message || error) });

    res?.json({ ok: true, data });
  });

  // GET /api/evo/fitness/:id
  r?.get('/fitness/:id', async (req, res) => {
    const { data, error } = await supa?.from('evo_fitness')?.select('*')?.eq('candidate_id', req?.params?.id)?.order('created_at', { ascending: false });

    if (error) return res?.status(200)?.json({ ok: false, error: String(error?.message || error) });

    res?.json({ ok: true, data });
  });

  // GET /api/evo/policies
  r?.get('/policies', async (_req, res) => {
    const { data, error } = await supa?.from('evo_policies')?.select('*');

    res?.json({ ok: !error, data });
  });

  // GET /api/evo/strategies
  r?.get('/strategies', async (req, res) => {
    const status = req?.query?.status || 'live';
    const { data, error } = await supa?.from('evo_strategies')?.select('*')?.eq('status', status)?.order('fitness', { ascending: false })?.limit(20);

    if (error) return res?.status(200)?.json({ ok: false, error: String(error?.message || error) });

    res?.json({ ok: true, data });
  });

  // GET /api/evo/events/:candidateId
  r?.get('/events/:candidateId', async (req, res) => {
    const { data, error } = await supa?.from('evo_events')?.select('*')?.eq('candidate_id', req?.params?.candidateId)?.order('created_at', { ascending: false });

    if (error) return res?.status(200)?.json({ ok: false, error: String(error?.message || error) });

    res?.json({ ok: true, data });
  });

  return r;
}