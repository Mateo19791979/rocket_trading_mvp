import { supabase } from '../lib/supabase.js';

// Service pour gérer le marché interne de l'attention
export class AttentionMarketService {
  constructor() {
    this.TOTAL_BUDGET_PER_CYCLE = 1000000; // 1M tokens par cycle
  }

  // Soumettre une enchère pour une tâche
  async submitBid(agent, taskId, bidAmount, priority = 5) {
    try {
      if (!agent || !taskId || bidAmount < 0) {
        throw new Error('Invalid bid parameters');
      }

      const { data, error } = await supabase?.rpc('submit_attention_bid', {
        p_agent: agent,
        p_task_id: taskId,
        p_bid_amount: parseInt(bidAmount),
        p_priority: parseInt(priority)
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        bid_id: data,
        agent,
        task_id: taskId,
        bid_amount: bidAmount,
        message: 'Bid submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to submit bid'
      };
    }
  }

  // Résoudre toutes les enchères en attente
  async resolveBids() {
    try {
      const { data, error } = await supabase?.rpc('resolve_attention_bids');

      if (error) {
        throw error;
      }

      const result = data?.[0] || {};
      const winners = result?.winners || [];
      const totalSpent = result?.total_spent || 0;
      const bidsResolved = result?.bids_resolved || 0;

      return {
        success: true,
        winners,
        total_spent: totalSpent,
        bids_resolved: bidsResolved,
        remaining_budget: this.TOTAL_BUDGET_PER_CYCLE - totalSpent,
        message: `Resolved ${bidsResolved} bids, ${winners?.length} winners, spent ${totalSpent} tokens`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to resolve bids',
        winners: [],
        total_spent: 0,
        bids_resolved: 0,
        remaining_budget: this.TOTAL_BUDGET_PER_CYCLE
      };
    }
  }

  // Obtenir toutes les enchères avec leur statut
  async getBids(limit = 100) {
    try {
      const { data, error } = await supabase
        ?.from('attention_market_bids')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        bids: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch bids',
        bids: []
      };
    }
  }

  // Obtenir les enchères en cours (pending)
  async getPendingBids() {
    try {
      const { data, error } = await supabase
        ?.from('attention_market_bids')
        ?.select('*')
        ?.eq('status', 'pending')
        ?.order('bid_amount', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        pending_bids: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch pending bids',
        pending_bids: []
      };
    }
  }

  // Obtenir les statistiques du marché de l'attention
  async getMarketStats() {
    try {
      const { data, error } = await supabase
        ?.from('attention_market_bids')
        ?.select('agent, bid_amount, status, task_priority, created_at');

      if (error) {
        throw error;
      }

      const bids = data || [];
      const totalBids = bids?.length;
      const pendingBids = bids?.filter(b => b?.status === 'pending')?.length;
      const wonBids = bids?.filter(b => b?.status === 'won')?.length;
      const lostBids = bids?.filter(b => b?.status === 'lost')?.length;

      // Total des enchères par agent
      const agentStats = bids?.reduce((acc, bid) => {
        if (!acc?.[bid?.agent]) {
          acc[bid.agent] = {
            total_bids: 0,
            total_amount: 0,
            won: 0,
            lost: 0,
            pending: 0,
            avg_bid: 0
          };
        }
        acc[bid.agent].total_bids++;
        acc[bid.agent].total_amount += bid?.bid_amount || 0;
        acc[bid.agent][bid.status]++;
        return acc;
      }, {});

      // Calculer la moyenne pour chaque agent
      Object.keys(agentStats)?.forEach(agent => {
        const stats = agentStats?.[agent];
        stats.avg_bid = stats?.total_bids > 0 ? Math.round(stats?.total_amount / stats?.total_bids) : 0;
        stats.win_rate = stats?.total_bids > 0 ? ((stats?.won / stats?.total_bids) * 100)?.toFixed(1) : 0;
      });

      // Calculs généraux
      const totalBudgetUsed = bids?.filter(b => b?.status === 'won')?.reduce((sum, b) => sum + (b?.bid_amount || 0), 0);

      const avgBidAmount = totalBids > 0 
        ? Math.round(bids?.reduce((sum, b) => sum + (b?.bid_amount || 0), 0) / totalBids)
        : 0;

      return {
        success: true,
        stats: {
          total_bids: totalBids,
          pending_bids: pendingBids,
          won_bids: wonBids,
          lost_bids: lostBids,
          total_budget_used: totalBudgetUsed,
          remaining_budget: Math.max(0, this.TOTAL_BUDGET_PER_CYCLE - totalBudgetUsed),
          avg_bid_amount: avgBidAmount,
          agent_stats: agentStats,
          market_efficiency: totalBids > 0 ? ((wonBids / totalBids) * 100)?.toFixed(1) : 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch market statistics',
        stats: {
          total_bids: 0,
          pending_bids: 0,
          won_bids: 0,
          lost_bids: 0,
          total_budget_used: 0,
          remaining_budget: this.TOTAL_BUDGET_PER_CYCLE,
          avg_bid_amount: 0,
          agent_stats: {},
          market_efficiency: 0
        }
      };
    }
  }

  // Obtenir l'historique des enchères pour un agent spécifique
  async getAgentBidHistory(agent, limit = 50) {
    try {
      if (!agent) {
        throw new Error('Agent name is required');
      }

      const { data, error } = await supabase
        ?.from('attention_market_bids')
        ?.select('*')
        ?.eq('agent', agent)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) {
        throw error;
      }

      const bids = data || [];
      const stats = {
        total_bids: bids?.length,
        total_spent: bids?.filter(b => b?.status === 'won')?.reduce((sum, b) => sum + (b?.bid_amount || 0), 0),
        won_bids: bids?.filter(b => b?.status === 'won')?.length,
        win_rate: bids?.length > 0 ? ((bids?.filter(b => b?.status === 'won')?.length / bids?.length) * 100)?.toFixed(1) : 0,
        avg_bid: bids?.length > 0 ? Math.round(bids?.reduce((sum, b) => sum + (b?.bid_amount || 0), 0) / bids?.length) : 0
      };

      return {
        success: true,
        agent_name: agent,
        bid_history: bids,
        agent_stats: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch agent bid history',
        agent_name: agent,
        bid_history: [],
        agent_stats: {
          total_bids: 0,
          total_spent: 0,
          won_bids: 0,
          win_rate: 0,
          avg_bid: 0
        }
      };
    }
  }

  // Suggérer un montant d'enchère optimal pour une tâche
  async suggestBidAmount(taskType, priority = 5) {
    try {
      // Analyser l'historique des enchères similaires
      const { data, error } = await supabase
        ?.from('attention_market_bids')
        ?.select('bid_amount, status, task_priority')
        ?.ilike('task_id', `%${taskType}%`)
        ?.eq('task_priority', priority)
        ?.eq('status', 'won')
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (error) {
        throw error;
      }

      const similarBids = data || [];
      
      if (similarBids?.length === 0) {
        // Pas d'historique, suggérer basé sur la priorité
        const baseBid = 10000;
        const priorityMultiplier = priority / 5; // Normaliser sur la priorité moyenne de 5
        return {
          success: true,
          suggested_bid: Math.round(baseBid * priorityMultiplier),
          confidence: 'low',
          reason: 'No historical data available, estimate based on priority'
        };
      }

      // Calculer la suggestion basée sur l'historique
      const avgWinningBid = Math.round(
        similarBids?.reduce((sum, bid) => sum + (bid?.bid_amount || 0), 0) / similarBids?.length
      );
      
      const minWinningBid = Math.min(...similarBids?.map(b => b?.bid_amount || 0));
      const maxWinningBid = Math.max(...similarBids?.map(b => b?.bid_amount || 0));

      // Suggérer légèrement au-dessus de la moyenne pour augmenter les chances
      const suggestedBid = Math.round(avgWinningBid * 1.1);

      return {
        success: true,
        suggested_bid: suggestedBid,
        confidence: similarBids?.length >= 10 ? 'high' : 'medium',
        reason: `Based on ${similarBids?.length} similar winning bids`,
        market_data: {
          avg_winning_bid: avgWinningBid,
          min_winning_bid: minWinningBid,
          max_winning_bid: maxWinningBid,
          sample_size: similarBids?.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to suggest bid amount',
        suggested_bid: 15000, // Fallback par défaut
        confidence: 'low',
        reason: 'Error analyzing market data, using default estimate'
      };
    }
  }
}

export const attentionMarketService = new AttentionMarketService();