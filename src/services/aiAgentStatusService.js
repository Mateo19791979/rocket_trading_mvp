import { supabase } from '../lib/supabase';

/**
 * Service for AI Agent Status operations with Supabase integration
 * Uses existing ai_agents, system_health, and ai_agent_state tables
 */
class AIAgentStatusService {
  
  /**
   * Get all AI agents with their system health data
   * Uses exact column names from schema
   */
  async getAllAgents() {
    try {
      const { data: agents, error: agentsError } = await supabase
        ?.from('ai_agents')
        ?.select(`
          id,
          name,
          description,
          agent_status,
          agent_group,
          agent_category,
          strategy,
          total_trades,
          successful_trades,
          total_pnl,
          win_rate,
          last_active_at,
          last_trade_at,
          created_at,
          updated_at,
          configuration,
          risk_parameters,
          performance_metrics,
          is_autonomous,
          communication_enabled,
          daily_loss_limit,
          monthly_loss_limit,
          max_position_size
        `)
        ?.order('created_at', { ascending: false });

      if (agentsError) {
        throw new Error(`Failed to fetch agents: ${agentsError?.message}`);
      }

      // Get system health data for each agent
      const agentIds = agents?.map(agent => agent?.id) || [];
      let healthData = [];

      if (agentIds?.length > 0) {
        const { data: health, error: healthError } = await supabase
          ?.from('system_health')
          ?.select(`
            agent_id,
            health_status,
            cpu_usage,
            memory_usage,
            error_count,
            warning_count,
            uptime_seconds,
            last_heartbeat,
            metrics
          `)
          ?.in('agent_id', agentIds)
          ?.order('created_at', { ascending: false });

        if (healthError) {
          console.warn('Failed to fetch health data:', healthError?.message);
        } else {
          healthData = health || [];
        }
      }

      // Combine agents with their health data
      const agentsWithHealth = agents?.map(agent => {
        const agentHealth = healthData?.find(health => health?.agent_id === agent?.id);
        return {
          ...agent,
          health_data: agentHealth || {
            health_status: 'unknown',
            cpu_usage: null,
            memory_usage: null,
            error_count: 0,
            warning_count: 0,
            uptime_seconds: 0,
            last_heartbeat: null,
            metrics: null
          }
        };
      });

      return agentsWithHealth || [];

    } catch (error) {
      console.error('AI Agent Status Service Error:', error);
      throw error;
    }
  }

  /**
   * Get system health statistics
   */
  async getSystemHealthStats() {
    try {
      const { data: agents, error: agentsError } = await supabase
        ?.from('ai_agents')
        ?.select('id, agent_status')
        ?.order('created_at', { ascending: false });

      if (agentsError) {
        throw new Error(`Failed to fetch agent stats: ${agentsError?.message}`);
      }

      const { data: healthData, error: healthError } = await supabase
        ?.from('system_health')
        ?.select('health_status, error_count, warning_count, cpu_usage, memory_usage, uptime_seconds')
        ?.order('created_at', { ascending: false });

      if (healthError) {
        console.warn('Failed to fetch health stats:', healthError?.message);
      }

      // Calculate statistics
      const totalAgents = agents?.length || 0;
      
      const statusCounts = {
        active: agents?.filter(a => a?.agent_status === 'active')?.length || 0,
        inactive: agents?.filter(a => a?.agent_status === 'inactive')?.length || 0,
        paused: agents?.filter(a => a?.agent_status === 'paused')?.length || 0,
        error: agents?.filter(a => a?.agent_status === 'error')?.length || 0
      };

      const healthyCounts = {
        healthy: healthData?.filter(h => h?.health_status === 'healthy')?.length || 0,
        degraded: healthData?.filter(h => h?.health_status === 'degraded')?.length || 0,
        unhealthy: healthData?.filter(h => h?.health_status === 'unhealthy')?.length || 0
      };

      const totalErrors = healthData?.reduce((sum, h) => sum + (h?.error_count || 0), 0) || 0;
      const totalWarnings = healthData?.reduce((sum, h) => sum + (h?.warning_count || 0), 0) || 0;

      const avgCpuUsage = healthData?.length > 0 
        ? healthData?.reduce((sum, h) => sum + (h?.cpu_usage || 0), 0) / healthData?.length 
        : 0;

      const avgMemoryUsage = healthData?.length > 0 
        ? healthData?.reduce((sum, h) => sum + (h?.memory_usage || 0), 0) / healthData?.length 
        : 0;

      const maxUptime = Math.max(...(healthData?.map(h => h?.uptime_seconds || 0) || [0]));
      const uptimeDays = Math.floor(maxUptime / 86400);
      const uptimeHours = Math.floor((maxUptime % 86400) / 3600);

      return {
        totalAgents,
        statusCounts,
        healthyCounts,
        totalErrors,
        totalWarnings,
        systemLoad: avgCpuUsage,
        cpuUsage: Number(avgCpuUsage?.toFixed(1)),
        memoryUsage: Number(avgMemoryUsage?.toFixed(1)),
        uptime: `${uptimeDays} days, ${uptimeHours} hours`
      };

    } catch (error) {
      console.error('System Health Stats Error:', error);
      throw error;
    }
  }

  /**
   * Control an AI agent (start, stop, pause, restart)
   */
  async controlAgent(agentId, action) {
    try {
      if (!agentId || !action) {
        throw new Error('Agent ID and action are required');
      }

      let newStatus;
      switch (action) {
        case 'start':
          newStatus = 'active';
          break;
        case 'stop':
          newStatus = 'inactive';
          break;
        case 'pause':
          newStatus = 'paused';
          break;
        case 'restart':
          newStatus = 'active';
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }

      const { data, error } = await supabase
        ?.from('ai_agents')
        ?.update({
          agent_status: newStatus,
          last_active_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', agentId)
        ?.select()
        ?.single();

      if (error) {
        throw new Error(`Failed to ${action} agent: ${error?.message}`);
      }

      return data;

    } catch (error) {
      console.error(`Agent Control Error (${action}):`, error);
      throw error;
    }
  }

  /**
   * Update agent heartbeat and system health
   */
  async updateAgentHeartbeat(agentId, healthMetrics = {}) {
    try {
      if (!agentId) {
        throw new Error('Agent ID is required');
      }

      const { data, error } = await supabase
        ?.from('system_health')
        ?.upsert({
          agent_id: agentId,
          last_heartbeat: new Date()?.toISOString(),
          health_status: healthMetrics?.health_status || 'healthy',
          cpu_usage: healthMetrics?.cpu_usage || null,
          memory_usage: healthMetrics?.memory_usage || null,
          error_count: healthMetrics?.error_count || 0,
          warning_count: healthMetrics?.warning_count || 0,
          uptime_seconds: healthMetrics?.uptime_seconds || 0,
          metrics: healthMetrics?.metrics || null,
          updated_at: new Date()?.toISOString()
        }, {
          onConflict: 'agent_id'
        })
        ?.select()
        ?.single();

      if (error) {
        throw new Error(`Failed to update heartbeat: ${error?.message}`);
      }

      return data;

    } catch (error) {
      console.error('Heartbeat Update Error:', error);
      throw error;
    }
  }

  /**
   * Export agent status report as CSV
   */
  async exportAgentReport() {
    try {
      const agents = await this?.getAllAgents();
      
      if (!agents || agents?.length === 0) {
        throw new Error('No agents found to export');
      }

      // CSV Headers
      const headers = [
        'ID',
        'Name', 
        'Status',
        'Group',
        'Strategy',
        'Health',
        'Total Trades',
        'Win Rate',
        'Total PnL',
        'CPU Usage',
        'Memory Usage',
        'Last Active',
        'Created At'
      ];

      // CSV Rows
      const rows = agents?.map(agent => [
        agent?.id,
        agent?.name,
        agent?.agent_status,
        agent?.agent_group || 'N/A',
        agent?.strategy,
        agent?.health_data?.health_status || 'unknown',
        agent?.total_trades || 0,
        `${agent?.win_rate || 0}%`,
        `$${agent?.total_pnl || 0}`,
        `${agent?.health_data?.cpu_usage || 0}%`,
        `${agent?.health_data?.memory_usage || 0}%`,
        agent?.last_active_at ? new Date(agent?.last_active_at)?.toLocaleString() : 'Never',
        new Date(agent?.created_at)?.toLocaleString()
      ]);

      // Generate CSV content
      const csvContent = [headers, ...rows]
        ?.map(row => row?.map(cell => `"${cell}"`)?.join(','))
        ?.join('\n');

      return csvContent;

    } catch (error) {
      console.error('Export Report Error:', error);
      throw error;
    }
  }

  /**
   * Get agent state data
   */
  async getAgentState(agentId, stateKey = null) {
    try {
      if (!agentId) {
        throw new Error('Agent ID is required');
      }

      let query = supabase
        ?.from('ai_agent_state')
        ?.select('*')
        ?.eq('agent_id', agentId);

      if (stateKey) {
        query = query?.eq('state_key', stateKey);
      }

      const { data, error } = await query?.order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch agent state: ${error?.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Agent State Fetch Error:', error);
      throw error;
    }
  }

  /**
   * Update agent state
   */
  async updateAgentState(agentId, stateKey, stateValue) {
    try {
      if (!agentId || !stateKey) {
        throw new Error('Agent ID and state key are required');
      }

      const { data, error } = await supabase
        ?.from('ai_agent_state')
        ?.upsert({
          agent_id: agentId,
          state_key: stateKey,
          state_value: stateValue,
          updated_at: new Date()?.toISOString(),
          version: 1
        }, {
          onConflict: 'agent_id,state_key'
        })
        ?.select()
        ?.single();

      if (error) {
        throw new Error(`Failed to update agent state: ${error?.message}`);
      }

      return data;

    } catch (error) {
      console.error('Agent State Update Error:', error);
      throw error;
    }
  }

  /**
   * Get real-time subscription for agents table
   */
  subscribeToAgents(callback) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function');
      }

      const channel = supabase
        ?.channel('ai_agents_changes')
        ?.on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'ai_agents' 
          },
          (payload) => {
            callback?.(payload);
          }
        )
        ?.on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'system_health' 
          },
          (payload) => {
            callback?.(payload);
          }
        )
        ?.subscribe();

      return channel;

    } catch (error) {
      console.error('Subscription Error:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromAgents(channel) {
    try {
      if (channel) {
        supabase?.removeChannel(channel);
      }
    } catch (error) {
      console.error('Unsubscribe Error:', error);
    }
  }
}

// Export singleton instance
export const aiAgentStatusService = new AIAgentStatusService();
export default aiAgentStatusService;