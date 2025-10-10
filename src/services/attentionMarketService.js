import { supabase } from '../lib/supabase.js';

/**
 * Attention Market Service - Internal Resource Allocation
 * Manages computational resource allocation through bidding mechanisms
 */

const TOTAL_BUDGET_PER_CYCLE = 1000000; // 1M attention tokens per cycle

// Submit a bid for computational resources
export async function submitBid(agent, taskId, bidAmount, priority = 5, computationalResources = {}) {
  try {
    if (!agent || !taskId || !bidAmount || bidAmount <= 0) {
      throw new Error('Invalid bid parameters');
    }

    const { data, error } = await supabase?.from('attention_market_bids')?.insert({
        agent,
        task_id: taskId,
        bid_amount: bidAmount,
        task_priority: Math.max(1, Math.min(10, priority)),
        computational_resources: computationalResources,
        estimated_duration_minutes: computationalResources?.estimated_duration || 30,
        status: 'pending'
      })?.select()?.single();

    if (error) throw error;

    return {
      success: true,
      bid: data
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

// Resolve all pending bids using auction mechanism
export async function resolveBids(totalBudget = TOTAL_BUDGET_PER_CYCLE) {
  try {
    // Use database function for bid resolution
    const { data, error } = await supabase?.rpc('resolve_attention_market_bids', {
      p_total_budget: totalBudget
    });

    if (error) throw error;

    return {
      success: true,
      resolution: data
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

// Get current market state and active bids
export async function getMarketState() {
  try {
    // Get all current bids
    const { data: allBids, error: bidsError } = await supabase?.from('attention_market_bids')?.select('*')?.order('created_at', { ascending: false })?.limit(100);

    if (bidsError) throw bidsError;

    const bids = allBids || [];
    const pendingBids = bids?.filter(b => b?.status === 'pending');
    const wonBids = bids?.filter(b => b?.status === 'won');
    const lostBids = bids?.filter(b => b?.status === 'lost');

    // Calculate market metrics
    const totalPendingValue = pendingBids?.reduce((sum, b) => sum + b?.bid_amount, 0);
    const totalAllocatedValue = wonBids?.reduce((sum, b) => sum + b?.bid_amount, 0);
    const avgBidAmount = bids?.length > 0 ? bids?.reduce((sum, b) => sum + b?.bid_amount, 0) / bids?.length : 0;

    // Agent activity analysis
    const agentActivity = {};
    bids?.forEach(bid => {
      if (!agentActivity?.[bid?.agent]) {
        agentActivity[bid.agent] = {
          totalBids: 0,
          wonBids: 0,
          lostBids: 0,
          pendingBids: 0,
          totalSpent: 0,
          successRate: 0
        };
      }
      
      const agent = agentActivity?.[bid?.agent];
      agent.totalBids++;
      
      if (bid?.status === 'won') {
        agent.wonBids++;
        agent.totalSpent += bid?.bid_amount;
      } else if (bid?.status === 'lost') {
        agent.lostBids++;
      } else {
        agent.pendingBids++;
      }
      
      agent.successRate = agent?.totalBids > 0 ? (agent?.wonBids / agent?.totalBids * 100) : 0;
    });

    const marketState = {
      totalBids: bids?.length,
      pendingBids: pendingBids?.length,
      wonBids: wonBids?.length,
      lostBids: lostBids?.length,
      totalPendingValue,
      totalAllocatedValue,
      avgBidAmount: Math.round(avgBidAmount),
      budgetUtilization: (totalAllocatedValue / TOTAL_BUDGET_PER_CYCLE * 100)?.toFixed(1),
      agentActivity,
      recentBids: bids?.slice(0, 20),
      highValueBids: pendingBids?.sort((a, b) => b?.bid_amount - a?.bid_amount)?.slice(0, 10)
    };

    return {
      success: true,
      marketState
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      marketState: {
        totalBids: 0,
        pendingBids: 0,
        wonBids: 0,
        lostBids: 0,
        totalPendingValue: 0,
        totalAllocatedValue: 0,
        avgBidAmount: 0,
        budgetUtilization: 0,
        agentActivity: {},
        recentBids: [],
        highValueBids: []
      }
    };
  }
}

// Get resource allocation efficiency metrics
export async function getResourceAllocationMetrics() {
  try {
    const { data, error } = await supabase?.from('attention_market_bids')?.select('*')?.order('created_at', { ascending: false })?.limit(500);

    if (error) throw error;

    const bids = data || [];
    const wonBids = bids?.filter(b => b?.status === 'won');
    const completedBids = wonBids?.filter(b => b?.actual_duration_minutes !== null);

    // Efficiency calculations
    const metrics = {
      totalResourcesAllocated: wonBids?.reduce((sum, b) => sum + b?.bid_amount, 0),
      averageTaskDuration: completedBids?.length > 0 
        ? completedBids?.reduce((sum, b) => sum + (b?.actual_duration_minutes || 0), 0) / completedBids?.length 
        : 0,
      durationAccuracy: completedBids?.length > 0
        ? completedBids?.reduce((sum, b) => {
            const estimated = b?.estimated_duration_minutes || 30;
            const actual = b?.actual_duration_minutes || 30;
            return sum + (1 - Math.abs(estimated - actual) / Math.max(estimated, actual));
          }, 0) / completedBids?.length * 100
        : 0,
      resourceUtilizationRate: (wonBids?.length / Math.max(bids?.length, 1) * 100),
      highPriorityAllocationRate: wonBids?.filter(b => b?.task_priority >= 8)?.length / Math.max(wonBids?.length, 1) * 100,
      agentDiversityIndex: new Set(wonBids.map(b => b.agent))?.size,
      avgBidCompetitiveness: bids?.length > 0 ? bids?.reduce((sum, b) => sum + b?.bid_amount, 0) / bids?.length : 0
    };

    // Resource type analysis
    const resourceTypeAnalysis = {};
    wonBids?.forEach(bid => {
      const resources = bid?.computational_resources || {};
      const cpuCores = resources?.cpu_cores || 1;
      const memoryGb = resources?.memory_gb || 2;
      const gpuRequired = resources?.gpu_required || false;
      
      const resourceSignature = `${cpuCores}C-${memoryGb}G${gpuRequired ? '-GPU' : ''}`;
      resourceTypeAnalysis[resourceSignature] = (resourceTypeAnalysis?.[resourceSignature] || 0) + 1;
    });

    return {
      success: true,
      metrics: {
        ...metrics,
        resourceTypeAnalysis,
        totalBidsAnalyzed: bids?.length,
        completedTasksAnalyzed: completedBids?.length
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      metrics: {}
    };
  }
}

// Get agent performance in attention market
export async function getAgentPerformanceMetrics(agent = null) {
  try {
    let query = supabase?.from('attention_market_bids')?.select('*')?.order('created_at', { ascending: false });

    if (agent) {
      query = query?.eq('agent', agent);
    }

    const { data, error } = await query?.limit(1000);

    if (error) throw error;

    const bids = data || [];
    
    // Group by agent
    const agentMetrics = {};
    
    bids?.forEach(bid => {
      if (!agentMetrics?.[bid?.agent]) {
        agentMetrics[bid.agent] = {
          agent: bid?.agent,
          totalBids: 0,
          wonBids: 0,
          lostBids: 0,
          pendingBids: 0,
          totalSpent: 0,
          avgBidAmount: 0,
          successRate: 0,
          avgTaskDuration: 0,
          preferredResources: {},
          lastActive: null
        };
      }
      
      const metrics = agentMetrics?.[bid?.agent];
      metrics.totalBids++;
      
      if (bid?.status === 'won') {
        metrics.wonBids++;
        metrics.totalSpent += bid?.bid_amount;
        if (bid?.actual_duration_minutes) {
          metrics.avgTaskDuration = (metrics?.avgTaskDuration * (metrics?.wonBids - 1) + bid?.actual_duration_minutes) / metrics?.wonBids;
        }
      } else if (bid?.status === 'lost') {
        metrics.lostBids++;
      } else {
        metrics.pendingBids++;
      }
      
      // Track resource preferences
      const resources = bid?.computational_resources || {};
      Object.keys(resources)?.forEach(resource => {
        metrics.preferredResources[resource] = (metrics?.preferredResources?.[resource] || 0) + 1;
      });
      
      if (!metrics?.lastActive || bid?.created_at > metrics?.lastActive) {
        metrics.lastActive = bid?.created_at;
      }
    });

    // Calculate derived metrics
    Object.values(agentMetrics)?.forEach(metrics => {
      metrics.avgBidAmount = metrics?.totalBids > 0 ? metrics?.totalSpent / metrics?.wonBids || 0 : 0;
      metrics.successRate = metrics?.totalBids > 0 ? (metrics?.wonBids / metrics?.totalBids * 100) : 0;
    });

    const sortedAgents = Object.values(agentMetrics)?.sort((a, b) => b?.successRate - a?.successRate);

    return {
      success: true,
      agentMetrics: agent ? agentMetrics?.[agent] : sortedAgents
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message,
      agentMetrics: agent ? null : []
    };
  }
}

// Create emergency resource reallocation
export async function emergencyResourceReallocation(criticalTasks, emergencyBudget) {
  try {
    const emergencyBids = [];
    
    for (const task of criticalTasks) {
      const bidResult = await submitBid(
        'emergency_controller',
        `emergency:${task?.taskId}`,
        emergencyBudget / criticalTasks?.length,
        10, // Highest priority
        {
          cpu_cores: task?.cpuCores || 8,
          memory_gb: task?.memoryGb || 16,
          gpu_required: task?.gpuRequired || false,
          estimated_duration: task?.estimatedDuration || 15,
          emergency: true
        }
      );
      
      if (bidResult?.success) {
        emergencyBids?.push(bidResult?.bid);
      }
    }

    // Immediately resolve these emergency bids
    const resolutionResult = await resolveBids(emergencyBudget);

    return {
      success: true,
      emergencyBids,
      resolution: resolutionResult?.resolution
    };

  } catch (error) {
    return {
      success: false,
      error: error?.message
    };
  }
}

export default {
  submitBid,
  resolveBids,
  getMarketState,
  getResourceAllocationMetrics,
  getAgentPerformanceMetrics,
  emergencyResourceReallocation,
  TOTAL_BUDGET_PER_CYCLE
};