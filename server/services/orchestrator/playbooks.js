import { createClient } from '@supabase/supabase-js';

const supaS = createClient(
    process.env?.SUPABASE_URL, 
    process.env?.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

/**
 * Comparison operators for trigger evaluation
 */
const OPERATORS = {
    '>':  (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '<':  (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
    'eq': (a, b) => a == b,
    'ne': (a, b) => a != b,
    'gt': (a, b) => a > b,
    'gte': (a, b) => a >= b,
    'lt': (a, b) => a < b,
    'lte': (a, b) => a <= b
};

/**
 * Get current global drawdown percentage from portfolio metrics
 * @returns {Promise<number>} Drawdown percentage (0.032 = 3.2%)
 */
async function getDrawdownGlobalPct() {
    try {
        const { data, error } = await supaS?.from('portfolio_metrics')?.select('drawdown_global_pct')?.order('as_of', { ascending: false })?.limit(1)?.single();

        if (error) {
            console.warn('[Playbooks] Could not fetch drawdown_global_pct:', error?.message);
            return 0;
        }

        return Number(data?.drawdown_global_pct ?? 0);
    } catch (err) {
        console.warn('[Playbooks] Error fetching drawdown:', err?.message);
        return 0;
    }
}

/**
 * Get agent error count for specified time window
 * @param {string} agentName - Name of the agent
 * @param {number} windowMin - Time window in minutes (default: 60)
 * @returns {Promise<number>} Error count
 */
async function getAgentErrorsLast(agentName, windowMin = 60) {
    try {
        const { data, error } = await supaS?.from('agent_metrics_agg')?.select('error_count_1h')?.eq('agent_name', agentName)?.single();

        if (error) {
            console.warn(`[Playbooks] Could not fetch errors for agent ${agentName}:`, error?.message);
            return 0;
        }

        return Number(data?.error_count_1h ?? 0);
    } catch (err) {
        console.warn(`[Playbooks] Error fetching agent errors for ${agentName}:`, err?.message);
        return 0;
    }
}

/**
 * Get PnL metrics from portfolio
 * @param {string} period - Period ('1h' or '24h')
 * @returns {Promise<number>} PnL value
 */
async function getPortfolioPnL(period = '1h') {
    try {
        const column = period === '24h' ? 'pnl_24h' : 'pnl_1h';
        const { data, error } = await supaS?.from('portfolio_metrics')?.select(column)?.order('as_of', { ascending: false })?.limit(1)?.single();

        if (error) {
            console.warn(`[Playbooks] Could not fetch ${column}:`, error?.message);
            return 0;
        }

        return Number(data?.[column] ?? 0);
    } catch (err) {
        console.warn(`[Playbooks] Error fetching PnL ${period}:`, err?.message);
        return 0;
    }
}

/**
 * Evaluate if a trigger condition is met
 * @param {Object} triggerSpec - Trigger specification
 * @returns {Promise<boolean>} True if trigger condition is met
 */
async function triggerIsTrue(triggerSpec) {
    try {
        if (!triggerSpec || typeof triggerSpec !== 'object') {
            return false;
        }

        const { kind, name, op, value, agent, window_min } = triggerSpec;

        // Validate operator
        const operatorFn = OPERATORS?.[op];
        if (!operatorFn) {
            console.warn(`[Playbooks] Unknown operator: ${op}`);
            return false;
        }

        let actualValue;

        switch (kind) {
            case 'metric':
                switch (name) {
                    case 'drawdown_global_pct':
                        actualValue = await getDrawdownGlobalPct();
                        break;
                    case 'pnl_1h':
                        actualValue = await getPortfolioPnL('1h');
                        break;
                    case 'pnl_24h':
                        actualValue = await getPortfolioPnL('24h');
                        break;
                    default:
                        console.warn(`[Playbooks] Unknown metric: ${name}`);
                        return false;
                }
                break;

            case 'agent_errors':
                if (!agent) {
                    console.warn('[Playbooks] agent_errors trigger missing agent name');
                    return false;
                }
                actualValue = await getAgentErrorsLast(agent, window_min);
                break;

            case 'portfolio_value':
                // Example: {"kind":"portfolio_value","op":"<","value":100000}
                try {
                    const { data, error } = await supaS?.from('portfolio_metrics')?.select('*')?.order('as_of', { ascending: false })?.limit(1)?.single();

                    if (error) {
                        console.warn('[Playbooks] Could not fetch portfolio value:', error?.message);
                        return false;
                    }

                    // Calculate total portfolio value (example logic)
                    actualValue = Number(data?.pnl_24h ?? 0) + 100000; // Base value + PnL
                } catch (err) {
                    console.warn('[Playbooks] Error calculating portfolio value:', err?.message);
                    return false;
                }
                break;

            default:
                console.warn(`[Playbooks] Unknown trigger kind: ${kind}`);
                return false;
        }

        const targetValue = Number(value);
        const currentValue = Number(actualValue);
        const result = operatorFn(currentValue, targetValue);

        if (result) {
            console.log(`[Playbooks] Trigger fired: ${kind}.${name || agent} ${currentValue} ${op} ${targetValue}`);
        }

        return result;

    } catch (error) {
        console.error('[Playbooks] Error evaluating trigger:', error?.message);
        return false;
    }
}

/**
 * Main playbooks loop - monitors triggers and executes playbook steps
 * Runs continuously, checking triggers every 3 seconds
 */
export async function playbooksLoop() {
    console.log('[Playbooks] Started - Monitoring triggers and executing playbooks');

    while (true) {
        try {
            // Fetch all active playbooks
            const { data: playbooks, error } = await supaS?.from('orch_playbooks')?.select('id, name, trigger_spec, steps')?.eq('is_active', true)?.limit(100);

            if (error) {
                console.error('[Playbooks] Error fetching playbooks:', error?.message);
                await sleep(10000); // Wait longer on error
                continue;
            }

            // Process each playbook
            for (const playbook of (playbooks || [])) {
                try {
                    const isTriggered = await triggerIsTrue(playbook?.trigger_spec || {});

                    if (isTriggered) {
                        console.log(`[Playbooks] Executing playbook: ${playbook?.name} (${playbook?.id})`);
                        await executePlaybookSteps(playbook);
                    }

                } catch (playbookError) {
                    console.error(`[Playbooks] Error processing playbook ${playbook?.name}:`, playbookError?.message);
                }
            }

        } catch (error) {
            console.error('[Playbooks] Fatal error in main loop:', error?.message);
        }

        // Sleep for 3 seconds before next iteration
        await sleep(3000);
    }
}

/**
 * Execute all steps in a playbook
 * @param {Object} playbook - Playbook object with steps array
 */
async function executePlaybookSteps(playbook) {
    const steps = Array.isArray(playbook?.steps) ? playbook?.steps : [];
    
    if (steps?.length === 0) {
        console.warn(`[Playbooks] No steps defined for playbook: ${playbook?.name}`);
        return;
    }

    console.log(`[Playbooks] Executing ${steps?.length} steps for playbook: ${playbook?.name}`);

    // Prepare all steps for insertion
    const commandRows = steps?.map((step, index) => ({
        channel: step?.channel || 'default',
        command: step?.command || 'unknown',
        payload: step?.payload || {},
        status: 'queued',
        issued_by: `playbook:${playbook?.name}`,
        priority: step?.priority || 0,
        created_at: new Date()?.toISOString()
    }));

    // Insert all commands at once
    const { error: insertError } = await supaS?.from('orch_inbox')?.insert(commandRows);

    if (insertError) {
        console.error(`[Playbooks] Failed to enqueue steps for ${playbook?.name}:`, insertError?.message);
        return;
    }

    console.log(`[Playbooks] Successfully enqueued ${steps?.length} commands for playbook: ${playbook?.name}`);

    // Log playbook execution
    await logPlaybookExecution(playbook?.id, playbook?.name, steps?.length);
}

/**
 * Log playbook execution for audit trail
 * @param {string} playbookId - Playbook ID
 * @param {string} playbookName - Playbook name
 * @param {number} stepCount - Number of steps executed
 */
async function logPlaybookExecution(playbookId, playbookName, stepCount) {
    try {
        // This could insert into a playbook_executions log table if it exists
        console.log(`[Playbooks] Execution logged: ${playbookName} (${stepCount} steps)`);
    } catch (error) {
        console.warn('[Playbooks] Failed to log execution:', error?.message);
    }
}

/**
 * Helper function for sleeping
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a new playbook
 * @param {Object} params - Playbook parameters
 * @param {string} params.name - Playbook name
 * @param {Object} params.triggerSpec - Trigger specification
 * @param {Array} params.steps - Array of command steps
 * @param {boolean} params.isActive - Whether playbook is active
 * @returns {Promise<string>} Playbook ID
 */
export async function createPlaybook({ name, triggerSpec, steps, isActive = true }) {
    const { data, error } = await supaS?.from('orch_playbooks')?.insert({
        name,
        trigger_spec: triggerSpec,
        steps,
        is_active: isActive
    })?.select('id')?.single();

    if (error) throw error;

    console.log(`[Playbooks] Created playbook: ${name} (${data?.id})`);
    return data?.id;
}

/**
 * Toggle playbook active status
 * @param {string} playbookId - Playbook ID
 * @param {boolean} isActive - New active status
 */
export async function togglePlaybook(playbookId, isActive) {
    const { error } = await supaS?.from('orch_playbooks')?.update({
        is_active: isActive,
        updated_at: new Date()?.toISOString()
    })?.eq('id', playbookId);

    if (error) throw error;

    console.log(`[Playbooks] Toggled playbook ${playbookId} to ${isActive ? 'active' : 'inactive'}`);
}

/**
 * Get all active playbooks
 * @returns {Promise<Array>} Active playbooks
 */
export async function getActivePlaybooks() {
    const { data, error } = await supaS?.from('orch_playbooks')?.select('*')?.eq('is_active', true)?.order('name');

    if (error) throw error;
    return data || [];
}

/**
 * Test a trigger condition without executing the playbook
 * @param {Object} triggerSpec - Trigger specification to test
 * @returns {Promise<{triggered: boolean, value: any, error?: string}>} Test result
 */
export async function testTrigger(triggerSpec) {
    try {
        const triggered = await triggerIsTrue(triggerSpec);
        return { triggered, value: triggered };
    } catch (error) {
        return { triggered: false, value: null, error: error?.message };
    }
}

export default {
    playbooksLoop,
    createPlaybook,
    togglePlaybook,
    getActivePlaybooks,
    testTrigger,
    triggerIsTrue
};