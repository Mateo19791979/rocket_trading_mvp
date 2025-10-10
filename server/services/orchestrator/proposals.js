import { createClient } from '@supabase/supabase-js';

const supaS = createClient(process.env?.SUPABASE_URL, process.env?.SUPABASE_SERVICE_KEY);

// Helper function to create strategic proposals from AI
export async function proposeAction(proposalConfig) {
  try {
    const {
      action,
      payload,
      justification,
      created_by = 'AAS',
      expires_at
    } = proposalConfig;

    if (!action || !payload) {
      throw new Error('Action and payload are required');
    }

    const { data, error } = await supaS?.from('orch_proposals')?.insert({
      action,
      payload,
      justification,
      created_by,
      expires_at: expires_at ? new Date(expires_at)?.toISOString() : null,
      status: 'proposed'
    })?.select('id')?.single();

    if (error) throw error;

    console.log(`[Proposals] New proposal created: ${action} (${data?.id}) by ${created_by}`);
    return data?.id;
  } catch (error) {
    console.error('[Proposals] Create proposal error:', error);
    throw error;
  }
}

// Helper function to approve a proposal and execute it
export async function approveProposal(proposalId, approvedBy = 'system') {
  try {
    const { data: prop, error: e1 } = await supaS?.from('orch_proposals')?.update({
        status: 'approved',
        updated_at: new Date()?.toISOString()
      })?.eq('id', proposalId)?.select('id, action, payload')?.single();

    if (e1) throw e1;

    // Enqueue for execution
    const { error: e2 } = await supaS?.from('orch_inbox')?.insert({
      channel: 'strategy-proposals',
      command: prop?.action,
      payload: prop?.payload,
      status: 'queued',
      issued_by: `proposal:${approvedBy}`,
      created_at: new Date()?.toISOString()
    });

    if (e2) throw e2;

    console.log(`[Proposals] Proposal approved and enqueued: ${prop?.action} (${proposalId})`);
    return true;
  } catch (error) {
    console.error('[Proposals] Approve proposal error:', error);
    throw error;
  }
}

// Helper function to reject a proposal
export async function rejectProposal(proposalId, reason = 'rejected', rejectedBy = 'system') {
  try {
    const { error } = await supaS?.from('orch_proposals')?.update({
      status: 'rejected',
      justification: reason,
      updated_at: new Date()?.toISOString()
    })?.eq('id', proposalId);

    if (error) throw error;

    console.log(`[Proposals] Proposal rejected: ${proposalId} by ${rejectedBy} - ${reason}`);
    return true;
  } catch (error) {
    console.error('[Proposals] Reject proposal error:', error);
    throw error;
  }
}

// Function to clean up expired proposals
export async function cleanupExpiredProposals() {
  try {
    const now = new Date()?.toISOString();

    const { data: expired, error: fetchError } = await supaS?.from('orch_proposals')?.select('id, action')?.eq('status', 'proposed')?.not('expires_at', 'is', null)?.lt('expires_at', now);

    if (fetchError) {
      console.error('[Proposals] Fetch expired proposals error:', fetchError);
      return;
    }

    if (expired && expired?.length > 0) {
      const expiredIds = expired?.map(p => p?.id);

      const { error: updateError } = await supaS?.from('orch_proposals')?.update({
          status: 'rejected',
          justification: 'expired',
          updated_at: now
        })?.in('id', expiredIds);

      if (updateError) {
        console.error('[Proposals] Update expired proposals error:', updateError);
      } else {
        console.log(`[Proposals] Cleaned up ${expired?.length} expired proposals`);
        expired?.forEach(p => console.log(`  - Expired: ${p?.action} (${p?.id})`));
      }
    }
  } catch (error) {
    console.error('[Proposals] Cleanup expired proposals error:', error);
  }
}

// Function to get pending proposals that need attention
export async function getPendingProposals() {
  try {
    const { data, error } = await supaS?.from('orch_proposals')?.select('*')?.eq('status', 'proposed')?.order('created_at', { ascending: false })?.limit(50);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[Proposals] Get pending proposals error:', error);
    return [];
  }
}

// Background service to handle proposal lifecycle
export async function proposalsLoop() {
  console.log('[Proposals] background service started');

  while (true) {
    try {
      // Clean up expired proposals every iteration
      await cleanupExpiredProposals();

      // Log pending proposals count
      const pending = await getPendingProposals();
      if (pending?.length > 0) {
        console.log(`[Proposals] ${pending?.length} proposals pending approval`);
      }

    } catch (e) {
      console.error('[Proposals] background service error', e);
    }

    // Run every 5 minutes
    await new Promise(r => setTimeout(r, 5 * 60 * 1000));
  }
}

// Helper function to get proposal statistics
export async function getProposalStats(daysBack = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate?.setDate(cutoffDate?.getDate() - daysBack);

    const { data, error } = await supaS?.from('orch_proposals')?.select('status, action, created_by, created_at')?.gte('created_at', cutoffDate?.toISOString());

    if (error) throw error;

    const stats = {
      total: data?.length,
      proposed: 0,
      approved: 0,
      rejected: 0,
      executed: 0,
      by_action: {},
      by_creator: {}
    };

    data?.forEach(proposal => {
      stats[proposal.status]++;

      if (!stats?.by_action?.[proposal?.action]) {
        stats.by_action[proposal.action] = 0;
      }
      stats.by_action[proposal.action]++;

      if (!stats?.by_creator?.[proposal?.created_by]) {
        stats.by_creator[proposal.created_by] = 0;
      }
      stats.by_creator[proposal.created_by]++;
    });

    return stats;
  } catch (error) {
    console.error('[Proposals] Get stats error:', error);
    return null;
  }
}

// Pre-built proposal templates for common AI suggestions
export const proposalTemplates = {
  rebalance: (targets, reason) => ({
    action: 'rebalance',
    payload: { targets, tolerance: 0.05 },
    justification: reason || 'Portfolio rebalancing recommended based on market conditions'
  }),

  setRisk: (leverage, reason) => ({
    action: 'set-risk',
    payload: { leverage },
    justification: reason || `Risk adjustment recommended - new leverage: ${leverage}`
  }),

  pauseAgent: (agentName, reason) => ({
    action: 'pause-agent',
    payload: { agent: agentName },
    justification: reason || `Agent performance degraded - temporary pause recommended`
  }),

  deployStrategy: (strategyName, config, reason) => ({
    action: 'deploy-strategy',
    payload: { strategy: strategyName, config },
    justification: reason || `New strategy deployment recommended based on market analysis`
  }),

  setAllocation: (allocations, reason) => ({
    action: 'set-allocation',
    payload: { allocations },
    justification: reason || 'Capital allocation adjustment recommended'
  })
};

// Helper to create common proposal types
export async function createQuickProposal(type, params, reason, expiresInHours = 24) {
  try {
    const template = proposalTemplates?.[type];
    if (!template) {
      throw new Error(`Unknown proposal type: ${type}`);
    }

    const expires_at = new Date();
    expires_at?.setHours(expires_at?.getHours() + expiresInHours);

    const proposalConfig = {
      ...template(...params, reason),
      expires_at: expires_at?.toISOString()
    };

    return await proposeAction(proposalConfig);
  } catch (error) {
    console.error(`[Proposals] Create quick proposal error (${type}):`, error);
    throw error;
  }
}