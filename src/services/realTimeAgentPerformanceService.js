import { supabase } from '../lib/supabase';

class RealTimeAgentPerformanceService {
  async getAgentPerformanceLeaderboard(userId) {
    try {
      if (!userId) {
        return [];
      }

      const { data: agents, error } = await supabase
        ?.from('ai_agents')
        ?.select(`
          id,
          name,
          strategy,
          agent_status,
          win_rate,
          total_pnl,
          total_trades,
          successful_trades,
          last_active_at,
          last_trade_at,
          performance_metrics,
          created_at,
          updated_at,
          agent_group,
          description,
          agent_category,
          is_autonomous,
          communication_enabled,
          configuration,
          risk_parameters,
          daily_loss_limit,
          monthly_loss_limit,
          max_position_size
        `)
        ?.eq('user_id', userId)
        ?.order('total_pnl', { ascending: false });

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        throw error;
      }

      return agents?.map(agent => ({
        id: agent?.id,
        name: agent?.name || 'Unknown Agent',
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
        currentStreak: 0, // Calculate from recent trades if needed
        recentTrades: [], // Will be populated from ai_agent_trades if needed
        // Additional fields for enhanced display
        agentGroup: agent?.agent_group,
        description: agent?.description,
        isAutonomous: agent?.is_autonomous,
        communicationEnabled: agent?.communication_enabled,
        riskParameters: agent?.risk_parameters || {},
        dailyLossLimit: parseFloat(agent?.daily_loss_limit || 0),
        monthlyLossLimit: parseFloat(agent?.monthly_loss_limit || 0),
        maxPositionSize: parseFloat(agent?.max_position_size || 0)
      })) || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to fetch agent performance leaderboard: ${error?.message}`);
    }
  }

  async getAgentComparativeAnalysis(userId) {
    try {
      if (!userId) {
        return [];
      }

      const { data: agents, error } = await supabase
        ?.from('ai_agents')
        ?.select(`
          name,
          strategy,
          win_rate,
          total_pnl,
          total_trades,
          performance_metrics,
          agent_status,
          successful_trades
        `)
        ?.eq('user_id', userId)
        ?.gte('total_trades', 1);

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        throw error;
      }

      return agents?.map(agent => {
        const performanceMetrics = agent?.performance_metrics || {};
        const sharpeRatio = performanceMetrics?.sharpe_ratio || 0;
        const maxDrawdown = performanceMetrics?.max_drawdown || 0;
        
        return {
          name: agent?.name,
          strategy: agent?.strategy,
          status: agent?.agent_status,
          winRate: parseFloat(agent?.win_rate || 0),
          totalPnL: parseFloat(agent?.total_pnl || 0),
          totalTrades: parseInt(agent?.total_trades || 0),
          successfulTrades: parseInt(agent?.successful_trades || 0),
          sharpeRatio: parseFloat(sharpeRatio),
          maxDrawdown: Math.abs(parseFloat(maxDrawdown)),
          riskAdjustedReturn: this.calculateRiskAdjustedReturn(
            parseFloat(agent?.total_pnl || 0),
            parseFloat(sharpeRatio)
          ),
          profitLossRatio: this.calculateProfitLossRatio(agent)
        };
      }) || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to fetch agent comparative analysis: ${error?.message}`);
    }
  }

  async getRealTimeAgentActivity(userId) {
    try {
      if (!userId) {
        return [];
      }

      // First get user's agent IDs
      const { data: userAgents, error: agentError } = await supabase
        ?.from('ai_agents')
        ?.select('id, name, strategy, agent_status')
        ?.eq('user_id', userId);

      if (agentError) {
        if (agentError?.message?.includes('Failed to fetch') || 
            agentError?.message?.includes('NetworkError') ||
            agentError?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        return [];
      }

      if (!userAgents || userAgents?.length === 0) {
        return [];
      }

      const agentIds = userAgents?.map(agent => agent?.id);
      const agentMap = userAgents?.reduce((map, agent) => {
        map[agent?.id] = agent;
        return map;
      }, {});

      // Get recent agent trades with proper error handling
      const { data: recentActivity, error } = await supabase
        ?.from('ai_agent_trades')
        ?.select(`
          id,
          ai_agent_id,
          trade_id,
          created_at,
          confidence_level,
          signal_strength,
          execution_time_ms,
          reasoning
        `)
        ?.in('ai_agent_id', agentIds)
        ?.order('created_at', { ascending: false })
        ?.limit(50);

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        return [];
      }

      // Get trade details for recent activity
      const tradeIds = recentActivity?.map(activity => activity?.trade_id)?.filter(Boolean);
      let trades = [];
      
      if (tradeIds?.length > 0) {
        const { data: tradeData, error: tradeError } = await supabase
          ?.from('trades')
          ?.select(`
            id,
            asset_id,
            order_side,
            quantity,
            price,
            realized_pnl,
            executed_at,
            trade_side
          `)
          ?.in('id', tradeIds);

        if (!tradeError && tradeData) {
          trades = tradeData;
        }
      }

      // Get asset details
      const assetIds = trades?.map(trade => trade?.asset_id)?.filter(Boolean);
      let assets = [];
      
      if (assetIds?.length > 0) {
        const { data: assetData, error: assetError } = await supabase
          ?.from('assets')
          ?.select('id, symbol, name')
          ?.in('id', assetIds);

        if (!assetError && assetData) {
          assets = assetData;
        }
      }

      // Create lookup maps
      const tradeMap = trades?.reduce((map, trade) => {
        map[trade?.id] = trade;
        return map;
      }, {});

      const assetMap = assets?.reduce((map, asset) => {
        map[asset?.id] = asset;
        return map;
      }, {});

      return recentActivity?.map(activity => {
        const agent = agentMap?.[activity?.ai_agent_id];
        const trade = tradeMap?.[activity?.trade_id];
        const asset = trade ? assetMap?.[trade?.asset_id] : null;

        // Use both trade_side and order_side for compatibility
        const tradeSide = trade?.trade_side || trade?.order_side || 'Unknown';
        const pnl = trade?.realized_pnl || trade?.pnl || 0;

        return {
          id: activity?.id || `activity-${activity?.created_at}`,
          agentName: agent?.name || 'Unknown Agent',
          strategy: agent?.strategy || 'Unknown',
          status: agent?.agent_status || 'inactive',
          action: trade && asset ? 
            `${tradeSide?.toUpperCase()} ${asset?.symbol || 'N/A'}` : 
            'System Analysis',
          confidence: parseFloat(activity?.confidence_level || 0),
          signalStrength: parseFloat(activity?.signal_strength || 0),
          reasoning: activity?.reasoning || 'Market analysis and strategy execution',
          pnl: parseFloat(pnl),
          executionTime: parseInt(activity?.execution_time_ms || 0),
          timestamp: activity?.created_at,
          quantity: parseFloat(trade?.quantity || 0),
          price: parseFloat(trade?.price || 0),
          executedAt: trade?.executed_at
        };
      }) || [];
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      throw new Error(`Failed to fetch real-time agent activity: ${error?.message}`);
    }
  }

  async getAgentPerformanceAlerts(userId) {
    try {
      if (!userId) {
        return [];
      }

      const { data: agents, error } = await supabase
        ?.from('ai_agents')
        ?.select(`
          id,
          name,
          agent_status,
          win_rate,
          total_pnl,
          total_trades,
          daily_loss_limit,
          monthly_loss_limit,
          last_active_at,
          performance_metrics
        `)
        ?.eq('user_id', userId);

      if (error) {
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') ||
            error?.name === 'TypeError') {
          throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        }
        return [];
      }

      const alerts = [];
      const now = new Date();
      
      agents?.forEach(agent => {
        const winRate = parseFloat(agent?.win_rate || 0);
        const totalPnL = parseFloat(agent?.total_pnl || 0);
        const dailyLossLimit = parseFloat(agent?.daily_loss_limit || 0);
        const monthlyLossLimit = parseFloat(agent?.monthly_loss_limit || 0);
        const lastActive = agent?.last_active_at ? new Date(agent?.last_active_at) : null;
        
        // Performance threshold alerts
        if (winRate < 30 && agent?.total_trades >= 10) {
          alerts?.push({
            type: 'warning',
            agentId: agent?.id,
            agentName: agent?.name,
            message: `Low win rate: ${winRate?.toFixed(1)}% (${agent?.total_trades} trades)`,
            severity: winRate < 20 ? 'high' : 'medium'
          });
        }
        
        // Daily loss limit alerts
        if (dailyLossLimit > 0 && Math.abs(totalPnL) > dailyLossLimit * 0.8) {
          alerts?.push({
            type: 'risk',
            agentId: agent?.id,
            agentName: agent?.name,
            message: `Approaching daily loss limit: ${Math.abs(totalPnL)?.toFixed(2)} of ${dailyLossLimit?.toFixed(2)}`,
            severity: Math.abs(totalPnL) > dailyLossLimit * 0.9 ? 'critical' : 'high'
          });
        }

        // Monthly loss limit alerts
        if (monthlyLossLimit > 0 && Math.abs(totalPnL) > monthlyLossLimit * 0.8) {
          alerts?.push({
            type: 'risk',
            agentId: agent?.id,
            agentName: agent?.name,
            message: `Approaching monthly loss limit: ${Math.abs(totalPnL)?.toFixed(2)} of ${monthlyLossLimit?.toFixed(2)}`,
            severity: Math.abs(totalPnL) > monthlyLossLimit * 0.9 ? 'critical' : 'high'
          });
        }
        
        // Agent status alerts
        if (agent?.agent_status === 'error') {
          alerts?.push({
            type: 'error',
            agentId: agent?.id,
            agentName: agent?.name,
            message: 'Agent in error state - requires attention',
            severity: 'critical'
          });
        }

        // Inactivity alerts
        if (lastActive && (now - lastActive) > 24 * 60 * 60 * 1000) { // 24 hours
          const hoursInactive = Math.floor((now - lastActive) / (60 * 60 * 1000));
          alerts?.push({
            type: 'warning',
            agentId: agent?.id,
            agentName: agent?.name,
            message: `Agent inactive for ${hoursInactive} hours`,
            severity: hoursInactive > 48 ? 'high' : 'medium'
          });
        }
      });

      // Sort alerts by severity (critical first)
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return alerts?.sort((a, b) => 
        (severityOrder?.[a?.severity] || 3) - (severityOrder?.[b?.severity] || 3)
      );
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError') {
        throw new Error('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
      }
      return [];
    }
  }

  // Helper method to get agent health metrics
  async getAgentHealthMetrics(userId) {
    try {
      if (!userId) {
        return {};
      }

      const { data: healthData, error } = await supabase
        ?.from('system_health')
        ?.select(`
          *,
          ai_agents!inner(user_id, name, agent_status)
        `)
        ?.eq('ai_agents.user_id', userId);

      if (error) {
        return {};
      }

      return healthData?.reduce((metrics, health) => {
        metrics[health?.agent_id] = {
          healthStatus: health?.health_status,
          cpuUsage: parseFloat(health?.cpu_usage || 0),
          memoryUsage: parseFloat(health?.memory_usage || 0),
          errorCount: parseInt(health?.error_count || 0),
          warningCount: parseInt(health?.warning_count || 0),
          lastHeartbeat: health?.last_heartbeat,
          uptimeSeconds: parseInt(health?.uptime_seconds || 0),
          metrics: health?.metrics || {}
        };
        return metrics;
      }, {});
    } catch (error) {
      return {};
    }
  }

  calculateRiskAdjustedReturn(totalReturn, sharpeRatio) {
    if (!sharpeRatio || sharpeRatio <= 0) return totalReturn;
    return totalReturn * Math.min(sharpeRatio / 2, 1);
  }

  calculateProfitLossRatio(agent) {
    const totalTrades = parseInt(agent?.total_trades || 0);
    const successfulTrades = parseInt(agent?.successful_trades || 0);
    const lossTrades = totalTrades - successfulTrades;
    
    if (lossTrades === 0) return totalTrades > 0 ? 10 : 0; // All winners
    if (successfulTrades === 0) return 0; // All losses
    
    return successfulTrades / lossTrades;
  }

  // Real-time subscription for agent updates
  subscribeToAgentUpdates(userId, callback) {
    if (!userId || !callback) {
      return null;
    }

    try {
      const subscription = supabase
        ?.channel(`agent_performance_updates_${userId}`)
        ?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ai_agents',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          callback(payload);
        })
        ?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'ai_agent_trades'
        }, (payload) => {
          // Only notify if this trade belongs to user's agents
          if (payload?.new?.ai_agent_id) {
            callback(payload);
          }
        })
        ?.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'system_health'
        }, (payload) => {
          // Notify for health updates
          if (payload?.new?.agent_id) {
            callback(payload);
          }
        })
        ?.subscribe();

      return subscription;
    } catch (error) {
      return null;
    }
  }
}

export default new RealTimeAgentPerformanceService();