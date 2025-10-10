import cronParser from 'cron-parser';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

const POLL_MS = Number(process.env?.GOV_POLL_MS || 4000);

// === HELPERS
const OP = { 
  '>': (a, b) => a > b, 
  '>=': (a, b) => a >= b, 
  '<': (a, b) => a < b, 
  '<=': (a, b) => a <= b, 
  '==': (a, b) => a == b, 
  '!=': (a, b) => a != b 
};

async function enqueue(channel, command, payload = {}, priority = 0, issued_by = 'governance') {
  try {
    await supa?.from('orch_inbox')?.insert({ 
      channel, 
      command, 
      payload, 
      status: 'queued', 
      priority, 
      issued_by, 
      created_at: new Date()?.toISOString() 
    });
    console.log(`[Governance] Enqueued: ${command} on ${channel}`);
  } catch (error) {
    console.error('[Governance] Enqueue error:', error);
  }
}

// === SCHEDULER
async function runScheduler() {
  try {
    const nowIso = new Date()?.toISOString();

    // Process due one-shot tasks
    const { data: due, error: e1 } = await supa?.rpc('dequeue_due_schedule', { p_now: nowIso });

    if (e1) {
      console.error('[Scheduler] dequeue error', e1);
      return;
    }

    for (const s of (due || [])) {
      await enqueue(s?.channel, s?.command, s?.payload, s?.priority, `scheduler:${s?.name}`);

      // Handle recurring vs one-shot tasks
      if (s?.cron_expression) {
        try {
          const it = cronParser?.parseExpression(s?.cron_expression, { utc: true, currentDate: new Date() });
          const next = it?.next()?.toDate()?.toISOString();

          await supa?.from('orch_schedule')?.update({ 
            next_run_at: next, 
            last_run_at: nowIso, 
            updated_at: nowIso 
          })?.eq('id', s?.id);
        } catch (e) {
          console.error('[Scheduler] invalid cron', s?.name, e);
          await supa?.from('orch_schedule')?.update({ is_active: false })?.eq('id', s?.id);
        }
      } else {
        // One-shot task - deactivate after execution
        await supa?.from('orch_schedule')?.update({ is_active: false })?.eq('id', s?.id);
      }
    }

    // Seed next_run_at for active cron tasks without next run time
    const { data: seeds, error: e2 } = await supa?.from('orch_schedule')
      ?.select('id,name,cron_expression')
      ?.eq('is_active', true)
      ?.is('next_run_at', null)
      ?.not('cron_expression', 'is', null);

    if (e2) {
      console.error('[Scheduler] seed select error', e2);
      return;
    }

    for (const r of (seeds || [])) {
      try {
        const it = cronParser?.parseExpression(r?.cron_expression, { utc: true, currentDate: new Date() });
        const next = it?.next()?.toDate()?.toISOString();

        await supa?.from('orch_schedule')?.update({ 
          next_run_at: next, 
          updated_at: new Date()?.toISOString() 
        })?.eq('id', r?.id);
      } catch (e) {
        console.error('[Scheduler] seed invalid cron', r?.name, e);
        await supa?.from('orch_schedule')?.update({ is_active: false })?.eq('id', r?.id);
      }
    }
  } catch (error) {
    console.error('[Scheduler] runScheduler error:', error);
  }
}

// === PLAYBOOKS
async function latestPortfolioDD() {
  try {
    const { data, error } = await supa?.from('portfolio_metrics')?.select('global_drawdown_pct')?.order('as_of', { ascending: false })?.limit(1)?.single();

    if (error) return null;
    return Number(data?.global_drawdown_pct ?? 0);
  } catch {
    return null;
  }
}

async function agentErrors(agent) {
  try {
    const { data, error } = await supa?.from('agent_metrics_agg')?.select('error_count_1h')?.eq('agent_name', agent)?.single();

    if (error) return 0;
    return Number(data?.error_count_1h ?? 0);
  } catch {
    return 0;
  }
}

async function evalTrigger(spec) {
  try {
    if (spec?.kind === 'metric' && spec?.name === 'global_drawdown_pct') {
      const v = await latestPortfolioDD();
      return OP?.[spec?.op]?.(Number(v || 0), Number(spec?.value));
    }

    if (spec?.kind === 'agent_errors') {
      const c = await agentErrors(spec?.agent);
      return OP?.[spec?.op]?.(Number(c || 0), Number(spec?.value));
    }

    return false;
  } catch {
    return false;
  }
}

async function runPlaybooks() {
  try {
    const { data: pbs, error } = await supa?.from('orch_playbooks')?.select('*')?.eq('is_active', true);

    if (error) {
      console.error('[Playbooks] select error', error);
      return;
    }

    const now = Date.now();

    for (const pb of (pbs || [])) {
      // Check cooldown period
      if (pb?.last_triggered_at && (now - new Date(pb?.last_triggered_at)?.getTime()) < (pb?.cooldown_seconds * 1000)) {
        continue;
      }

      const ok = await evalTrigger(pb?.trigger_spec || {});

      if (!ok) continue;

      try {
        const steps = Array.isArray(pb?.steps) ? pb?.steps : [];

        for (const s of steps) {
          await enqueue(s?.channel || 'execution', s?.command, s?.payload || {}, s?.priority || 100, `playbook:${pb?.name}`);
        }

        await supa?.from('orch_playbooks')?.update({ 
          last_triggered_at: new Date()?.toISOString(), 
          updated_at: new Date()?.toISOString() 
        })?.eq('id', pb?.id);

        console.log('[Playbooks] TRIGGERED', pb?.name);
      } catch (e) {
        console.error('[Playbooks] trigger error', pb?.name, e);
      }
    }
  } catch (error) {
    console.error('[Playbooks] runPlaybooks error:', error);
  }
}

// === LEARNING KPIs ROLLUP
async function rollupLearningKPIs() {
  try {
    const today = new Date();
    today?.setHours(0, 0, 0, 0);
    const dayStr = today?.toISOString()?.slice(0, 10);

    // Check if today's KPIs already exist
    const { data: exists } = await supa?.from('learning_kpis_daily')?.select('day')?.eq('day', dayStr)?.maybeSingle();

    if (!exists) {
      // Create initial seed data (in production, this would compute from actual trades)
      await supa?.from('learning_kpis_daily')?.insert({
        day: dayStr,
        win_rate: 0.55,
        avg_gain: 0.6,
        avg_loss: 0.4,
        rr_ratio: 1.5,
        trades_count: 42,
        pnl_daily: 0.8,
        notes: 'seed'
      });

      console.log(`[Learning KPIs] Created daily KPI record for ${dayStr}`);
    }
  } catch (error) {
    console.error('[Learning KPIs] rollup error:', error);
  }
}

// === SCALING ENGINE
async function scalingEngine() {
  try {
    // Get recent learning KPIs
    const { data: kpi } = await supa?.from('learning_kpis_daily')?.select('*')?.order('day', { ascending: false })?.limit(5);

    const last = kpi?.[0];
    const dd = await latestPortfolioDD();

    // Step-up logic: good performance + low drawdown
    if (last && last?.win_rate >= 0.55 && last?.rr_ratio >= 1.5 && Number(dd || 0) < 0.03) {
      await enqueue('execution', 'set-allocation', { 
        mode: 'step-up', 
        target: 'canary_best', 
        delta_pct: 0.01 
      }, 50, 'scaling');
    }

    // Risk management: drawdown-based scaling
    if (Number(dd || 0) >= 0.06) {
      // Full cash + kill switch at 6% drawdown
      await enqueue('execution', 'rebalance', { targets: { CASH: 1.0 } }, 200, 'scaling');
      await enqueue('execution', 'kill-switch', { 
        module: 'LIVE_TRADING', 
        active: true, 
        reason: 'DD>=6%' 
      }, 200, 'scaling');
    } else if (Number(dd || 0) >= 0.04) {
      // Reduce leverage at 4% drawdown
      await enqueue('execution', 'set-risk', { leverage: 0.5 }, 150, 'scaling');
    }
  } catch (error) {
    console.error('[Scaling Engine] error:', error);
  }
}

// === MAIN GOVERNANCE WORKER
export async function startGovernanceWorker() {
  console.log('🚀 [AAS Governance & Learning Pack v3.1] Starting comprehensive governance system...');
  console.log(`⏱️  Poll interval: ${POLL_MS}ms`);

  // Initial run
  await runScheduler();

  while (true) {
    try {
      await runScheduler();
      await runPlaybooks();
      await rollupLearningKPIs();
      await scalingEngine();
    } catch (e) {
      console.error('[Governance] loop error', e);
    }

    await new Promise(r => setTimeout(r, POLL_MS));
  }
}

// Additional utility functions for external use
export async function createScheduledTask(taskConfig) {
  const { name, description, channel = 'execution', command, payload = {}, cron_expression, next_run_at, priority = 0, is_active = true } = taskConfig;

  const { data, error } = await supa?.from('orch_schedule')?.insert({
    name,
    description,
    channel,
    command,
    payload,
    cron_expression,
    next_run_at,
    priority,
    is_active
  })?.select('id')?.single();

  if (error) throw error;

  console.log(`[Governance] Task scheduled: ${name} (${data?.id})`);
  return data?.id;
}

export async function createPlaybook(playbookConfig) {
  const { name, description, trigger_spec, steps, cooldown_seconds = 300, is_active = true } = playbookConfig;

  const { data, error } = await supa?.from('orch_playbooks')?.insert({
    name,
    description,
    trigger_spec,
    steps,
    cooldown_seconds,
    is_active
  })?.select('id')?.single();

  if (error) throw error;

  console.log(`[Governance] Playbook created: ${name} (${data?.id})`);
  return data?.id;
}

export async function createProposal(proposalConfig) {
  const { action, payload, justification, created_by = 'AAS', expires_at } = proposalConfig;

  const { data, error } = await supa?.from('orch_proposals')?.insert({
    action,
    payload,
    justification,
    created_by,
    expires_at,
    status: 'proposed'
  })?.select('id')?.single();

  if (error) throw error;

  console.log(`[Governance] Proposal created: ${action} (${data?.id})`);
  return data?.id;
}

export default { 
  startGovernanceWorker,
  createScheduledTask,
  createPlaybook,
  createProposal
};