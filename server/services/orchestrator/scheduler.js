import parser from 'cron-parser';
import { createClient } from '@supabase/supabase-js';

const supaS = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

function computeNextRun(cronExpr, fromDate = new Date()) {
  try {
    const it = parser?.parseExpression(cronExpr, { currentDate: fromDate });
    return it?.next()?.toDate();
  } catch {
    return null;
  }
}

export async function schedulerLoop() {
  console.log('[Scheduler] started');

  while (true) {
    try {
      const now = new Date();

      // 1) consommer les tâches arrivées à échéance
      const { data: dues, error: e1 } = await supaS?.rpc('dequeue_due_schedule', { p_now: now?.toISOString() });

      if (e1) {
        console.error('[Scheduler] dequeue error', e1);
      } else {
        for (const s of (dues || [])) {
          try {
            // 2) injecter en inbox
            const { error: e2 } = await supaS?.from('orch_inbox')?.insert({
              channel: s?.channel,
              command: s?.command,
              payload: s?.payload,
              status: 'queued',
              issued_by: `scheduler:${s?.name}`,
              created_at: now?.toISOString()
            });

            if (e2) {
              console.error('[Scheduler] enqueue error', e2);
              continue;
            }

            // 3) recalculer next_run_at si cron ; sinon désactiver
            if (s?.cron_expression) {
              const next = computeNextRun(s?.cron_expression, now);
              const { error: e3 } = await supaS?.from('orch_schedule')?.update({
                next_run_at: next ? next?.toISOString() : null,
                updated_at: new Date()?.toISOString(),
                is_active: !!next
              })?.eq('id', s?.id);

              if (e3) {
                console.error('[Scheduler] update next_run_at error', e3);
              }
            } else {
              // One-shot task, désactiver après exécution
              const { error: e4 } = await supaS?.from('orch_schedule')?.update({
                is_active: false,
                updated_at: new Date()?.toISOString()
              })?.eq('id', s?.id);

              if (e4) {
                console.error('[Scheduler] deactivate one-shot error', e4);
              }
            }

            console.log(`[Scheduler] Executed: ${s?.name} (${s?.command})`);
          } catch (taskError) {
            console.error(`[Scheduler] Task execution error for ${s?.name}:`, taskError);
          }
        }
      }

      // 4) seed automatique : si des enregistrements ont cron mais pas de next_run_at, on l'amorce
      const { data: needsSeed, error: e5 } = await supaS?.from('orch_schedule')?.select('id, name, cron_expression')?.eq('is_active', true)?.is('next_run_at', null)?.not('cron_expression', 'is', null)?.limit(50);

      if (e5) {
        console.error('[Scheduler] seed select error', e5);
      } else {
        for (const r of (needsSeed || [])) {
          try {
            const next = computeNextRun(r?.cron_expression, now);
            const { error: e6 } = await supaS?.from('orch_schedule')?.update({
              next_run_at: next?.toISOString() || null,
              updated_at: new Date()?.toISOString(),
              is_active: !!next
            })?.eq('id', r?.id);

            if (e6) {
              console.error('[Scheduler] seed next_run_at error', e6);
            } else if (next) {
              console.log(`[Scheduler] Seeded next run for: ${r?.name} at ${next?.toISOString()}`);
            } else {
              console.warn(`[Scheduler] Invalid cron expression for: ${r?.name}`);
            }
          } catch (seedError) {
            console.error(`[Scheduler] Seed error for ${r?.name}:`, seedError);
          }
        }
      }

    } catch (e) {
      console.error('[Scheduler] loop error', e);
    }

    await new Promise(r => setTimeout(r, 1000)); // tick 1s
  }
}

// Helper function to create new scheduled tasks programmatically
export async function scheduleTask(taskConfig) {
  try {
    const { name, description, channel = 'execution', command, payload = {}, cron_expression, run_at, priority = 0 } = taskConfig;

    if (!name || !command) {
      throw new Error('Name and command are required');
    }

    const next_run_at = run_at ? new Date(run_at)?.toISOString() : null;

    if (!cron_expression && !next_run_at) {
      throw new Error('Either cron_expression or run_at must be provided');
    }

    const { data, error } = await supaS?.from('orch_schedule')?.insert({
      name,
      description,
      channel,
      command,
      payload,
      cron_expression: cron_expression || null,
      next_run_at,
      priority,
      is_active: true
    })?.select('id')?.single();

    if (error) throw error;

    console.log(`[Scheduler] Task scheduled: ${name} (${data?.id})`);
    return data?.id;
  } catch (error) {
    console.error('[Scheduler] Schedule task error:', error);
    throw error;
  }
}

// Helper function to pause/resume scheduled tasks
export async function toggleScheduledTask(taskId, isActive) {
  try {
    const { error } = await supaS?.from('orch_schedule')?.update({
      is_active: isActive,
      updated_at: new Date()?.toISOString()
    })?.eq('id', taskId);

    if (error) throw error;

    console.log(`[Scheduler] Task ${isActive ? 'activated' : 'paused'}: ${taskId}`);
    return true;
  } catch (error) {
    console.error('[Scheduler] Toggle task error:', error);
    throw error;
  }
}