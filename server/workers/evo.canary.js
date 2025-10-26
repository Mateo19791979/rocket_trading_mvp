// ======================================================================
// Worker — server/workers/evo.canary.js
// Promeut les evo_candidates (status='paper') en canary IBKR Paper
// ======================================================================

/* eslint-disable */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

const LOOP_MS = Number(process.env?.CANARY_LOOP_MS || 30000);

async function getPolicy() {
    const { data, error } = await supa?.from('evo_canary_policy')?.select('*')?.eq('active', true)?.order('updated_at', { ascending: false })?.limit(1);

    if (error) throw error;

    return (data && data?.[0]) || {
        min_paper_score: 0.70, min_adversarial_score: 0.65, min_hours_in_paper: 2,
        max_parallel: 3, min_notional: 1000, min_qty: 1, dry_run: true, active: true
    };
}

async function killSwitchOn(module = 'LIVE_TRADING') {
    const { data } = await supa?.from('kill_switches')?.select('is_active')?.eq('module', module)?.maybeSingle();
    return !!(data && data?.is_active);
}

async function countParallelCanary() {
    const { data, error } = await supa?.from('evo_candidates')?.select('id', { count: 'exact', head: true })?.eq('status', 'canary');
    if (error) return 0;
    return data?.length || 0;
}

async function candidateReadyList(hoursMin) {
    // Candidats en 'paper' depuis +Xh, avec fitness OK // On récupère l'heure de passage 'paper' via created_at ou updated_at ; ici on prend created_at.
    const since = new Date(Date.now() - hoursMin * 3600 * 1000)?.toISOString();

    const { data: cands, error } = await supa
        ?.from('evo_candidates')
        ?.select('id, spec, created_at')
        ?.eq('status', 'paper')
        ?.lte('created_at', since)
        ?.limit(10);

    if (error || !cands?.length) return [];
    return cands;
}

async function fitnessOK(id, minPaper, minAdv) {
    const { data: fits } = await supa
        ?.from('evo_fitness')
        ?.select('phase,score,dd_max,win_rate')
        ?.eq('candidate_id', id);

    if (!fits?.length) return false;

    const off = fits?.find(f => f?.phase === 'offline');
    const adv = fits?.find(f => f?.phase === 'adversarial');

    if (!off || !adv) return false;

    return (Number(off?.score) >= minPaper && Number(adv?.score) >= minAdv);
}

function buildCanaryOrderPayload(spec, policy) {
    // Construire ordre minimal paper : notional min si dispo, sinon qty min
    const base = {
        mode: 'paper',
        dry_run: !!policy?.dry_run,
        broker: 'ibkr',
        method: spec?.method || 'unknown',
        asset_class: spec?.asset_class || 'equity',
        tif: 'DAY',
        max_slippage_bps: spec?.exec?.max_slippage_bps ?? 10
    };

    const assets = spec?.genome?.assets || ['SPY'];
    const symbol = assets?.[0];

    // si notional (préféré), sinon qty
    const notional = policy?.min_notional || 1000;
    const qty = policy?.min_qty || 1;

    return {
        ...base,
        symbol, qty, notional,
        risk: spec?.risk || { max_dd: 0.12 },
        genome: spec?.genome || {}
    };
}

async function enqueueCanary(candidate_id, payload) {
    const ins = await supa?.from('execution_queue')?.insert({
        opportunity_id: candidate_id,
        broker: 'ibkr',
        order_payload: payload,
        status: 'pending'
    })?.select('id')?.single();

    if (ins?.error) throw ins?.error;

    // status canary
    await supa?.from('evo_candidates')?.update({ status: 'canary', notes: 'queued canary paper' })?.eq('id', candidate_id);

    // log
    await supa?.from('evo_promotions_log')?.insert({
        candidate_id, action: 'queued_canary', reason: null, payload
    });

    return ins?.data?.id;
}

async function loop() {
    try {
        // 0) kill-switch vérif
        if ((await killSwitchOn('EXECUTION')) || (await killSwitchOn('LIVE_TRADING'))) {
            // on log seulement
            await supa?.from('evo_promotions_log')?.insert({
                candidate_id: null, action: 'skipped', reason: 'kill_switch_active', payload: { live: false }
            });
            return;
        }

        // 1) policy & slots
        const pol = await getPolicy();
        const used = await countParallelCanary();

        if (used >= pol?.max_parallel) {
            await supa?.from('evo_promotions_log')?.insert({
                candidate_id: null, action: 'skipped', reason: `parallel_limit (${used}/${pol?.max_parallel})`
            });
            return;
        }

        // 2) candidats éligibles (en 'paper' depuis assez longtemps)
        const list = await candidateReadyList(pol?.min_hours_in_paper);
        if (!list?.length) return;

        // 3) filtrer par fitness
        for (const c of list) {
            if (used >= pol?.max_parallel) break;

            const okFit = await fitnessOK(c?.id, pol?.min_paper_score, pol?.min_adversarial_score);

            if (!okFit) {
                await supa?.from('evo_promotions_log')?.insert({
                    candidate_id: c?.id, action: 'skipped', reason: 'fitness_below_threshold'
                });
                continue;
            }

            // 4) construire ordre canary (paper)
            const payload = buildCanaryOrderPayload(c?.spec, pol);

            try {
                await enqueueCanary(c?.id, payload);
                // incrémenter used local
                used + 1;
            } catch (e) {
                await supa?.from('evo_promotions_log')?.insert({
                    candidate_id: c?.id, action: 'error', reason: String(e?.message || e)
                });
            }
        }

    } catch (e) {
        await supa?.from('evo_promotions_log')?.insert({
            candidate_id: null, action: 'error', reason: String(e?.message || e)
        });
    }
}

export async function startCanaryPromoter() {
    console.log(`[EVO] Canary promoter started. loop=${LOOP_MS}ms`);
    setInterval(loop, LOOP_MS);
}

if (process.argv?.[1]?.includes('evo.canary.js')) {
    startCanaryPromoter()?.catch(e => { console.error('[EVO] FATAL', e); process.exit(1); });
}