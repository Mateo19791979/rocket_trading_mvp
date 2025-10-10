import express from 'express';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
export const pnlTracker = express?.Router();

// Middleware de sécurité simple
function guard(req, res, next) {
  if ((req?.headers?.['x-internal-key'] || '') !== process.env?.INTERNAL_ADMIN_KEY)
    return res?.status(401)?.json({ ok: false, error: 'unauthorized' });
  next();
}

/**
 * POST /ops/pnl/ingest
 * Body: { d?: 'YYYY-MM-DD', total_pnl, win_rate, trades, agents_active, max_drawdown, notes? }
 * Insertion directe (utilisé si vous calculez côté Orchestrateur)
 */
pnlTracker?.post('/ops/pnl/ingest', guard, async (req, res) => {
  try {
    const d = req?.body?.d || new Date()?.toISOString()?.slice(0,10);
    const payload = {
      p_d: d,
      p_total_pnl: Number(req?.body?.total_pnl || 0),
      p_win_rate: Number(req?.body?.win_rate || 0),
      p_trades: Number(req?.body?.trades || 0),
      p_agents_active: Number(req?.body?.agents_active || 0),
      p_max_drawdown: Number(req?.body?.max_drawdown || 0),
      p_notes: req?.body?.notes || null
    };

    const { data, error } = await supa?.rpc('upsert_pnl_daily', payload);
    if (error) throw error;

    const { data: alerts, error: err2 } = await supa?.rpc('guardrail_check', { p_d: d });
    if (err2) throw err2;

    res?.json({ ok: true, row: data, alerts: alerts || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

/**
 * POST /ops/pnl/snapshot-today
 * Option "auto" (agrégation naïve) : si vous avez une table ex. decisions_log ou trades,
 * adaptez le SELECT ci-dessous. Sinon, envoyez les valeurs via /ops/pnl/ingest.
 */
pnlTracker?.post('/ops/pnl/snapshot-today', guard, async (_req, res) => {
  try {
    const d = new Date()?.toISOString()?.slice(0,10);

    // ⚠️ ADAPTEZ CES SELECTS à vos tables réelles
    // Exemple minimaliste à base de vues/agrégats existants
    const { data: kpis, error: e1 } = await supa?.rpc('get_today_basic_kpis')?.catch(()=>({data:null,error:null}));
    // si vous n'avez pas de RPC 'get_today_basic_kpis', on met des zéros pour ne pas bloquer
    const total_pnl = kpis?.total_pnl ?? 0;
    const win_rate  = kpis?.win_rate ?? 0;
    const trades    = kpis?.trades ?? 0;
    const agents    = kpis?.agents_active ?? 0;
    const dd        = kpis?.max_drawdown ?? 0;

    const { data, error } = await supa?.rpc('upsert_pnl_daily', {
      p_d: d,
      p_total_pnl: total_pnl,
      p_win_rate: win_rate,
      p_trades: trades,
      p_agents_active: agents,
      p_max_drawdown: dd,
      p_notes: 'snapshot-auto'
    });
    if (error) throw error;

    const { data: alerts, error: err2 } = await supa?.rpc('guardrail_check', { p_d: d });
    if (err2) throw err2;

    res?.json({ ok: true, row: data, alerts: alerts || [] });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

/**
 * GET /pnl/policy → voir les paramètres de garde-fous
 */
pnlTracker?.get('/pnl/policy', guard, async (req, res) => {
  try {
    const { data, error } = await supa?.from('pnl_guardrails')?.select('*')?.single();
    if (error) throw error;
    res?.json({ ok: true, policy: data });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});

/**
 * POST /pnl/policy → mettre à jour les seuils
 */
pnlTracker?.post('/pnl/policy', guard, async (req, res) => {
  try {
    const updates = {
      dd_limit_pct: Number(req?.body?.dd_limit_pct || 3),
      min_win_rate: Number(req?.body?.min_win_rate || 45),
      neg_day_cap: Number(req?.body?.neg_day_cap || -20000)
    };
    
    const { data, error } = await supa?.from('pnl_guardrails')?.update(updates)?.eq('id', true)?.select()?.single();
    if (error) throw error;
    
    res?.json({ ok: true, policy: data });
  } catch (e) {
    res?.status(500)?.json({ ok: false, error: String(e?.message || e) });
  }
});