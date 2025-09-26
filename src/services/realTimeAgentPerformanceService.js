import { supabase } from '../lib/supabase';

class RealTimeAgentPerformanceService {
  async getAgentPerformanceLeaderboard(userId) {
    try {
      const { data: agents, error } = await supabase?.from('ai_agents')?.select(`
          *,
          ai_agent_trades (
            confidence_level,
            signal_strength,
            execution_time_ms,
            created_at
          )
        `)?.eq('user_id', userId)?.order('total_pnl', { ascending: false });

      if (error) throw error;

      return agents?.map(agent => ({
        id: agent?.id,
        name: agent?.name,
        strategy: agent?.strategy,
        status: agent?.agent_status,
        winRate: parseFloat(agent?.win_rate || 0),
        totalPnL: parseFloat(agent?.total_pnl || 0),
        totalTrades: parseInt(agent?.total_trades || 0),
        successfulTrades: parseInt(agent?.successful_trades || 0),
        avgProfitPerTrade: agent?.total_trades > 0 ? 
          parseFloat(agent?.total_pnl || 0) / agent?.total_trades : 0,
        lastActiveAt: agent?.last_active_at,
        lastTradeAt: agent?.last_trade_at,
        performanceMetrics: agent?.performance_metrics || {},
        recentTrades: agent?.ai_agent_trades || [],
        currentStreak: this.calculateCurrentStreak(agent?.ai_agent_trades || [])
      })) || [];
    } catch (error) {
      throw new Error(`Failed to fetch agent performance leaderboard: ${error.message}`);
    }
  }

  async getAgentPerformanceChartData(agentId, timeframe = '7d') {
    try {
      const { data: agentTrades, error } = await supabase?.from('ai_agent_trades')?.select(`
          created_at,
          confidence_level,
          signal_strength,
          trades (
            pnl,
            executed_at,
            trade_value
          )
        `)?.eq('ai_agent_id', agentId)?.order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate cumulative performance over time
      let cumulativePnL = 0;
      const performanceData = agentTrades?.map(trade => {
        const tradePnL = parseFloat(trade?.trades?.pnl || 0);
        cumulativePnL += tradePnL;
        
        return {
          date: trade?.created_at,
          cumulativePnL,
          tradePnL,
          confidenceLevel: parseFloat(trade?.confidence_level || 0),
          signalStrength: parseFloat(trade?.signal_strength || 0),
          tradeValue: parseFloat(trade?.trades?.trade_value || 0)
        };
      }) || [];

      return performanceData;
    } catch (error) {
      throw new Error(`Failed to fetch agent performance chart data: ${error.message}`);
    }
  }

  async getAgentComparativeAnalysis(userId) {
    try {
      const { data: agents, error } = await supabase?.from('ai_agents')?.select(`
          name,
          strategy,
          win_rate,
          total_pnl,
          total_trades,
          risk_parameters,
          performance_metrics
        `)?.eq('user_id', userId)?.gte('total_trades', 1); // Only agents with trading activity

      if (error) throw error;

      return agents?.map(agent => {
        const sharpeRatio = agent?.performance_metrics?.sharpe_ratio || 0;
        const maxDrawdown = agent?.performance_metrics?.max_drawdown || 0;
        
        return {
          name: agent?.name,
          strategy: agent?.strategy,
          winRate: parseFloat(agent?.win_rate || 0),
          totalPnL: parseFloat(agent?.total_pnl || 0),
          totalTrades: parseInt(agent?.total_trades || 0),
          sharpeRatio: parseFloat(sharpeRatio),
          maxDrawdown: Math.abs(parseFloat(maxDrawdown)),
          riskAdjustedReturn: this.calculateRiskAdjustedReturn(
            parseFloat(agent?.total_pnl || 0),
            parseFloat(sharpeRatio)
          )
        };
      }) || [];
    } catch (error) {
      throw new Error(`Failed to fetch agent comparative analysis: ${error.message}`);
    }
  }

  async getRealTimeAgentActivity(userId) {
    try {
      const { data: recentActivity, error } = await supabase?.from('ai_agent_trades')?.select(`
          created_at,
          confidence_level,
          reasoning,
          execution_time_ms,
          ai_agents (
            name,
            strategy,
            agent_status
          ),
          trades (
            pnl,
            trade_side,
            quantity,
            price,
            assets (
              symbol,
              name
            )
          )
        `)?.in('ai_agent_id', 
          supabase?.from('ai_agents')?.select('id')?.eq('user_id', userId)
        )?.order('created_at', { ascending: false })?.limit(50);

      if (error) throw error;

      return recentActivity?.map(activity => ({
        id: `${activity?.ai_agents?.name}-${activity?.created_at}`,
        agentName: activity?.ai_agents?.name,
        strategy: activity?.ai_agents?.strategy,
        status: activity?.ai_agents?.agent_status,
        action: `${activity?.trades?.trade_side || 'Unknown'} ${activity?.trades?.assets?.symbol || 'N/A'}`,
        confidence: parseFloat(activity?.confidence_level || 0),
        reasoning: activity?.reasoning,
        pnl: parseFloat(activity?.trades?.pnl || 0),
        executionTime: parseInt(activity?.execution_time_ms || 0),
        timestamp: activity?.created_at,
        quantity: parseFloat(activity?.trades?.quantity || 0),
        price: parseFloat(activity?.trades?.price || 0)
      })) || [];
    } catch (error) {
      throw new Error(`Failed to fetch real-time agent activity: ${error.message}`);
    }
  }

  async getAgentPerformanceAlerts(userId) {
    try {
      const { data: agents, error } = await supabase?.from('ai_agents')?.select('*')?.eq('user_id', userId);

      if (error) throw error;

      const alerts = [];
      
      agents?.forEach(agent => {
        const winRate = parseFloat(agent?.win_rate || 0);
        const totalPnL = parseFloat(agent?.total_pnl || 0);
        const dailyLossLimit = parseFloat(agent?.daily_loss_limit || 0);
        
        // Performance threshold alerts
        if (winRate < 30 && agent?.total_trades >= 10) {
          alerts?.push({
            type: 'warning',
            agentId: agent?.id,
            agentName: agent?.name,
            message: `Low win rate: ${winRate?.toFixed(1)}%`,
            severity: 'medium'
          });
        }
        
        if (dailyLossLimit > 0 && Math.abs(totalPnL) > dailyLossLimit * 0.8) {
          alerts?.push({
            type: 'risk',
            agentId: agent?.id,
            agentName: agent?.name,
            message: `Approaching daily loss limit`,
            severity: 'high'
          });
        }
        
        if (agent?.agent_status === 'error') {
          alerts?.push({
            type: 'error',
            agentId: agent?.id,
            agentName: agent?.name,
            message: 'Agent in error state',
            severity: 'critical'
          });
        }
      });

      return alerts;
    } catch (error) {
      throw new Error(`Failed to fetch agent performance alerts: ${error.message}`);
    }
  }

  calculateCurrentStreak(trades) {
    if (!trades || trades?.length === 0) return 0;
    
    // Sort trades by date descending
    const sortedTrades = trades?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    let streak = 0;
    let lastResult = null;
    
    for (const trade of sortedTrades) {
      const isProfitable = parseFloat(trade?.trades?.pnl || 0) > 0;
      
      if (lastResult === null) {
        lastResult = isProfitable;
        streak = 1;
      } else if (lastResult === isProfitable) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  calculateRiskAdjustedReturn(totalReturn, sharpeRatio) {
    if (!sharpeRatio || sharpeRatio <= 0) return totalReturn;
    return totalReturn * Math.min(sharpeRatio / 2, 1); // Cap the adjustment
  }

  // Real-time subscription for agent updates
  subscribeToAgentUpdates(userId, callback) {
    const subscription = supabase?.channel('agent_performance')?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ai_agents',
        filter: `user_id=eq.${userId}`
      }, callback)?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ai_agent_trades'
      }, callback)?.subscribe();

    return subscription;
  }
}

export default new RealTimeAgentPerformanceService();