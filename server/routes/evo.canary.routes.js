// ======================================================================
// Routes JSON — server/routes/evo.canary.routes.js
// ======================================================================

/* eslint-disable */
import express from 'express';
import { createClient } from '@supabase/supabase-js';

export function makeCanaryRoutes() {
    const r = express?.Router();
    const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);
    const ADMIN = process.env?.INTERNAL_ADMIN_KEY || '';

    r?.use((req, res, next) => {
        res?.set('content-type', 'application/json; charset=utf-8');
        next();
    });

    // GET /api/evo/canary/policy
    r?.get('/policy', async (_req, res) => {
        const { data, error } = await supa?.from('evo_canary_policy')?.select('*')?.eq('active', true)?.order('updated_at', { ascending: false })?.limit(1);

        if (error) return res?.json({ ok: false, error: String(error?.message || error) });

        res?.json({ ok: true, policy: data?.[0] || null });
    });

    // POST /api/evo/canary/policy  (update) — protégé
    r?.post('/policy', async (req, res) => {
        if (req?.headers?.['x-internal-key'] !== ADMIN) return res?.status(401)?.json({ ok: false, error: 'unauthorized' });

        const patch = req?.body || {};

        const { data, error } = await supa?.from('evo_canary_policy')?.update({
            ...patch, updated_at: new Date()?.toISOString()
        })?.eq('active', true)?.select()?.single();

        if (error) return res?.json({ ok: false, error: String(error?.message || error) });

        res?.json({ ok: true, policy: data });
    });

    // GET /api/evo/canary/logs
    r?.get('/logs', async (_req, res) => {
        const { data, error } = await supa?.from('evo_promotions_log')?.select('*')?.order('created_at', { ascending: false })?.limit(100);

        if (error) return res?.json({ ok: false, error: String(error?.message || error) });

        res?.json({ ok: true, data });
    });

    // POST /api/evo/canary/promote { candidate_id } — manuel (protégé)
    r?.post('/promote', async (req, res) => {
        if (req?.headers?.['x-internal-key'] !== ADMIN) return res?.status(401)?.json({ ok: false, error: 'unauthorized' });

        const id = String(req?.body?.candidate_id || '');
        if (!id) return res?.status(400)?.json({ ok: false, error: 'candidate_id required' });

        // vérifier status & fitness minimal
        const { data: pol } = await supa?.from('evo_canary_policy')?.select('*')?.eq('active', true)?.limit(1);
        const policy = pol?.[0] || {};

        const { data: c } = await supa?.from('evo_candidates')?.select('*')?.eq('id', id)?.maybeSingle();
        if (!c) return res?.json({ ok: false, error: 'candidate not found' });

        const { data: fit } = await supa?.from('evo_fitness')?.select('phase,score,dd_max,win_rate')?.eq('candidate_id', id);
        const off = fit?.find(f => f?.phase === 'offline'); const adv = fit?.find(f => f?.phase === 'adversarial');

        if (!off || !adv || off?.score < (policy?.min_paper_score || 0.7) || adv?.score < (policy?.min_adversarial_score || 0.65)) {
            return res?.json({ ok: false, error: 'fitness below threshold' });
        }

        const order = {
            mode: 'paper', dry_run: !!policy?.dry_run, broker: 'ibkr',
            method: c?.spec?.method || c?.method, asset_class: c?.spec?.asset_class || c?.asset_class,
            symbol: (c?.spec?.genome?.assets || ['SPY'])?.[0],
            qty: policy?.min_qty || 1, notional: policy?.min_notional || 1000,
            risk: c?.spec?.risk || { max_dd: 0.12 }, genome: c?.spec?.genome || {}
        };

        const ins = await supa?.from('execution_queue')?.insert({ opportunity_id: id, broker: 'ibkr', order_payload: order })?.select('id')?.single();
        if (ins?.error) return res?.json({ ok: false, error: String(ins?.error?.message || ins?.error) });

        await supa?.from('evo_candidates')?.update({ status: 'canary', notes: 'manual canary' })?.eq('id', id);
        await supa?.from('evo_promotions_log')?.insert({ candidate_id: id, action: 'queued_canary', payload: order });

        res?.json({ ok: true, enqueued: true, exec_id: ins?.data?.id });
    });

    return r;
}