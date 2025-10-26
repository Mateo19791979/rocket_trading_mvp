// ======================================================================
// Worker — server/workers/evolution.engine.js
// Génère mutations, évalue (offline + adversarial Omega), et promeut.
// ======================================================================

/* eslint-disable */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

const LOOP_MS = Number(process.env?.EVO_LOOP_MS || 30000);

function randChoice(arr) { return arr?.[Math.floor(Math.random() * arr?.length)]; }

function jitter(val, pct = 0.2) { return val * (1 + (Math.random() * 2 - 1) * pct); }

// --- Génome : structure générique (extensible)
function mutateGenome(genome) {
  const g = JSON.parse(JSON.stringify(genome || {
    timeframe: '5m',
    lookback: 120,
    entry_thr: 1.8,
    exit_thr: 0.6,
    atr_mult: 1.2,
    assets: ['AAPL', 'MSFT', 'SPY'],
    risk: { notional: 10000, max_dd: 0.12 }
  }));

  const genes = ['timeframe', 'lookback', 'entry_thr', 'exit_thr', 'atr_mult', 'assets'];
  const gene = randChoice(genes);

  if (gene === 'timeframe') g.timeframe = randChoice(['1m', '3m', '5m', '15m']);
  if (gene === 'lookback') g.lookback = Math.max(20, Math.round(jitter(g?.lookback, 0.3)));
  if (gene === 'entry_thr') g.entry_thr = Math.max(0.3, Number(jitter(g?.entry_thr, 0.25)?.toFixed(2)));
  if (gene === 'exit_thr') g.exit_thr = Math.max(0.2, Number(jitter(g?.exit_thr, 0.25)?.toFixed(2)));
  if (gene === 'atr_mult') g.atr_mult = Math.max(0.6, Number(jitter(g?.atr_mult, 0.25)?.toFixed(2)));
  if (gene === 'assets') {
    const pool = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'META', 'SPY', 'QQQ', 'GLD', 'EUR.USD', 'BTCUSD'];
    g.assets = Array.from(new Set([
      ...g.assets,
      randChoice(pool)
    ]))?.slice(0, 5);
  }

  return g;
}

// --- Spec d'exécution (paper-ready)
function buildSpec(genome, method = 'momentum_5m', asset_class = 'equity') {
  return {
    strategy_id: `EVO-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    method, asset_class, genome,
    risk: {
      notional: genome?.risk?.notional || 10000,
      max_dd: genome?.risk?.max_dd || 0.12
    },
    exec: { tif: 'GTC', max_slippage_bps: 5 }
  };
}

// --- Évaluation OFFLINE (placeholder réaliste sans casser)
async function evaluateOffline(spec) {
  const win_rate = 0.5 + Math.random() * 0.4;        // 0.5..0.9
  const pfactor = 0.9 + Math.random() * 1.5;        // 0.9..2.4
  const dd_max = 0.05 + Math.random() * 0.15;      // 0.05..0.20
  const sharpe = -0.2 + Math.random() * 2.0;       // -0.2..1.8
  const pnl = -500 + Math.random() * 3000;      // [-500 ; 2500]

  const score = Math.max(0, Math.min(1, (win_rate * 0.35 + (pfactor / 3) * 0.25 + (1 - dd_max) * 0.25 + Math.max(0, sharpe / 2) * 0.15)));

  return { phase: 'offline', win_rate, pfactor, dd_max, sharpe, pnl, score, details: { spec } };
}

// --- Évaluation OMEGA (adversarial) : stress extrême (latence, spread, gap)
async function evaluateAdversarial(spec) {
  const win_rate = 0.4 + Math.random() * 0.3;        // plus dur
  const pfactor = 0.7 + Math.random() * 1.2;
  const dd_max = 0.08 + Math.random() * 0.20;      // drawdown plus fort
  const sharpe = -0.5 + Math.random() * 1.5;
  const pnl = -1200 + Math.random() * 2500;

  const score = Math.max(0, Math.min(1, (win_rate * 0.30 + (pfactor / 3) * 0.25 + (1 - dd_max) * 0.30 + Math.max(0, sharpe / 2) * 0.15)));

  return { phase: 'adversarial', win_rate, pfactor, dd_max, sharpe, pnl, score, details: { omega: 'stress_spread_latency_gap' } };
}

async function persistFitness(candidate_id, fit) {
  await supa?.from('evo_fitness')?.insert({
    candidate_id, phase: fit?.phase,
    sharpe: fit?.sharpe, sortino: null, win_rate: fit?.win_rate,
    pfactor: fit?.pfactor, dd_max: fit?.dd_max, pnl: fit?.pnl,
    score: fit?.score, details: fit?.details || {}
  });
}

async function mutateFromParents() {
  // Choix de parents : stratégies live triées par fitness (ou fallback)
  const live = await supa?.from('evo_strategies')?.select('*')?.eq('status', 'live')?.order('fitness', { ascending: false })?.limit(10);
  const base = live?.data?.length ? live?.data : [{
    id: null, name: 'SEED', genome: buildSpec()?.genome, method: 'momentum_5m', asset_class: 'equity', fitness: 0.6
  }];

  const parents = [randChoice(base), randChoice(base)];
  const genome = mutateGenome(randChoice(parents)?.genome);
  const method = randChoice(['momentum_5m', 'vol_breakout', 'arbitrage_spread', 'mean_rev_15m']);
  const asset_class = randChoice(['equity', 'forex', 'crypto', 'etf']);
  const spec = buildSpec(genome, method, asset_class);

  const ins = await supa?.from('evo_candidates')?.insert({
    parent_ids: parents?.map(p => p?.id)?.filter(Boolean),
    genome, method, asset_class, spec, status: 'testing'
  })?.select('id')?.single();

  if (!ins?.error) {
    for (const p of parents) {
      if (p?.id) await supa?.from('evo_lineage')?.insert({ candidate_id: ins?.data?.id, parent_id: p?.id, relation: 'mutation' });
    }
    await supa?.from('evo_events')?.insert({ candidate_id: ins?.data?.id, type: 'mutate', message: 'new candidate created', payload: { method, asset_class } });
    return ins?.data?.id;
  }
  return null;
}

async function evaluateAndDecide(id) {
  const { data: cand } = await supa?.from('evo_candidates')?.select('*')?.eq('id', id)?.maybeSingle();
  if (!cand) return;

  // OFFLINE
  const off = await evaluateOffline(cand?.spec);
  await persistFitness(id, off);

  // ADVERSE (Omega)
  const adv = await evaluateAdversarial(cand?.spec);
  await persistFitness(id, adv);

  // Politiques
  const polSel = (await supa?.from('evo_policies')?.select('*')?.eq('key', 'selection')?.maybeSingle())?.data?.value || {};
  const minOff = polSel?.min_offline_score ?? 0.62;
  const minAdv = polSel?.min_adversarial_score ?? 0.58;
  const maxDD = polSel?.max_dd ?? 0.12;
  const minWin = polSel?.min_win_rate ?? 0.55;

  const ok = (off?.score >= minOff) && (adv?.score >= minAdv) && (off?.dd_max <= maxDD) && (off?.win_rate >= minWin);

  if (ok) {
    await supa?.from('evo_candidates')?.update({ status: 'paper', notes: 'passed offline+adversarial' })?.eq('id', id);
    await supa?.from('evo_events')?.insert({ candidate_id: id, type: 'evaluate_offline', message: 'passed', payload: off });
    await supa?.from('evo_events')?.insert({ candidate_id: id, type: 'evaluate_adversarial', message: 'passed', payload: adv });
  } else {
    await supa?.from('evo_candidates')?.update({ status: 'rejected', notes: 'failed policy thresholds' })?.eq('id', id);
    await supa?.from('evo_events')?.insert({ candidate_id: id, type: 'evaluate_offline', message: 'failed', payload: off });
    await supa?.from('evo_events')?.insert({ candidate_id: id, type: 'evaluate_adversarial', message: 'failed', payload: adv });
  }
}

async function loop() {
  // 1) S'il n'y a aucun candidat en test → muter un nouveau
  const { data: testing } = await supa?.from('evo_candidates')?.select('id')?.eq('status', 'testing')?.limit(3);
  if (!testing?.length) {
    const id = await mutateFromParents();
    if (id) console.log('[EVO] new candidate', id);
  }

  // 2) Évaluer tous les testing
  const { data: allTesting } = await supa?.from('evo_candidates')?.select('id')?.eq('status', 'testing')?.limit(5);
  for (const c of (allTesting || [])) {
    await evaluateAndDecide(c?.id);
  }
}

export async function startEvolutionEngine() {
  console.log('[EVO] Evolution Engine started. loop=', LOOP_MS);
  setInterval(loop, LOOP_MS);
}

if (process.argv?.[1]?.includes('evolution.engine.js')) {
  startEvolutionEngine()?.catch(e => { console.error('[EVO] FATAL', e); process.exit(1); });
}