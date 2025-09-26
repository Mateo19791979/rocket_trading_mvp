import { supabase } from '../lib/supabase';

export const aiAgentStatusService = {
  // Get all AI agents with their health status
  async getAllAgents() {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.select(`
          *,
          system_health(*),
          ai_agent_state(*)
        `)?.order('name');

      if (error) throw error;

      return data?.map(agent => ({
        ...agent,
        health_data: agent?.system_health?.[0] || null,
        state_data: agent?.ai_agent_state || []
      })) || [];
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  // Get agent groups with statistics
  async getAgentGroups() {
    try {
      const { data, error } = await supabase?.from('ai_agent_groups')?.select('*')?.order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching agent groups:', error);
      throw error;
    }
  },

  // Get system-wide health statistics
  async getSystemHealthStats() {
    try {
      const [agentsResult, healthResult] = await Promise.all([
        supabase?.from('ai_agents')?.select('agent_status, agent_group'),
        supabase?.from('system_health')?.select('health_status, error_count, warning_count')
      ]);

      if (agentsResult?.error) throw agentsResult?.error;
      if (healthResult?.error) throw healthResult?.error;

      const agents = agentsResult?.data || [];
      const healthData = healthResult?.data || [];

      const statusCounts = {
        active: agents?.filter(a => a?.agent_status === 'active')?.length,
        inactive: agents?.filter(a => a?.agent_status === 'inactive')?.length,
        paused: agents?.filter(a => a?.agent_status === 'paused')?.length,
        error: agents?.filter(a => a?.agent_status === 'error')?.length
      };

      const healthyCounts = {
        healthy: healthData?.filter(h => h?.health_status === 'healthy')?.length,
        degraded: healthData?.filter(h => h?.health_status === 'degraded')?.length,
        unhealthy: healthData?.filter(h => h?.health_status === 'unhealthy')?.length
      };

      const totalErrors = healthData?.reduce((sum, h) => sum + (h?.error_count || 0), 0);
      const totalWarnings = healthData?.reduce((sum, h) => sum + (h?.warning_count || 0), 0);

      return {
        totalAgents: agents?.length,
        statusCounts,
        healthyCounts,
        totalErrors,
        totalWarnings,
        systemLoad: this.calculateSystemLoad(healthData)
      };
    } catch (error) {
      console.error('Error fetching system health stats:', error);
      throw error;
    }
  },

  // Control agent operations
  async controlAgent(agentId, action) {
    try {
      let updateData = {};
      
      switch (action) {
        case 'start':
          updateData = { 
            agent_status: 'active',
            last_active_at: new Date()?.toISOString()
          };
          break;
        case 'pause':
          updateData = { agent_status: 'paused' };
          break;
        case 'stop':
          updateData = { agent_status: 'inactive' };
          break;
        case 'restart':
          updateData = { 
            agent_status: 'active',
            last_active_at: new Date()?.toISOString()
          };
          break;
        default:
          throw new Error('Invalid action');
      }

      const { data, error } = await supabase?.from('ai_agents')?.update(updateData)?.eq('id', agentId)?.select()?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error controlling agent:', error);
      throw error;
    }
  },

  // Activate degraded mode
  async activateDegradedMode(reason = 'Manual activation') {
    try {
      // Update all active agents to paused status
      const { data, error } = await supabase?.from('ai_agents')?.update({ 
          agent_status: 'paused'
        })?.eq('agent_status', 'active')?.select();

      if (error) throw error;

      // Log the degraded mode activation
      await supabase?.from('event_bus')?.insert({
        event_type: 'system_status',
        priority: 'high',
        event_data: {
          action: 'degraded_mode_activated',
          reason,
          affected_agents: data?.length || 0,
          timestamp: new Date()?.toISOString()
        }
      });

      return data;
    } catch (error) {
      console.error('Error activating degraded mode:', error);
      throw error;
    }
  },

  // Subscribe to real-time agent status changes
  subscribeToAgentStatus(callback) {
    try {
      const agentSubscription = supabase?.channel('agents_changes')?.on('postgres_changes',
          {
            event: '*',
            schema: 'public', 
            table: 'ai_agents'
          },
          callback
        );

      const healthSubscription = supabase?.channel('health_changes')?.on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'system_health'  
          },
          callback
        );

      const subscription = supabase?.channel('combined_agent_status')?.subscribe();

      return {
        agentSubscription,
        healthSubscription,
        unsubscribe: () => {
          agentSubscription?.unsubscribe();
          healthSubscription?.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error subscribing to agent status:', error);
      throw error;
    }
  },

  // Export agent status report
  async exportAgentReport() {
    try {
      const agents = await this.getAllAgents();
      
      const csvHeaders = [
        'Agent Name',
        'Status', 
        'Group',
        'Strategy',
        'Health Status',
        'CPU Usage %',
        'Memory Usage %', 
        'Last Active',
        'Total Trades',
        'Win Rate %',
        'Total P&L'
      ];

      const csvRows = agents?.map(agent => [
        agent?.name,
        agent?.agent_status,
        agent?.agent_group || 'N/A',
        agent?.strategy,
        agent?.health_data?.health_status || 'Unknown',
        agent?.health_data?.cpu_usage || 'N/A',
        agent?.health_data?.memory_usage || 'N/A',
        agent?.last_active_at ? new Date(agent.last_active_at)?.toISOString() : 'Never',
        agent?.total_trades || 0,
        agent?.win_rate || 0,
        agent?.total_pnl || 0
      ]);

      const csvContent = [csvHeaders, ...csvRows]?.map(row => row?.map(field => `"${field}"`)?.join(','))?.join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting agent report:', error);
      throw error;
    }
  },

  // Helper methods
  calculateSystemLoad(healthData) {
    if (!healthData?.length) return 0;
    
    const avgCPU = healthData?.reduce((sum, h) => sum + (h?.cpu_usage || 0), 0) / healthData?.length;
    const avgMemory = healthData?.reduce((sum, h) => sum + (h?.memory_usage || 0), 0) / healthData?.length;
    
    return Math.round((avgCPU + avgMemory) / 2);
  },

  getStatusColor(status) {
    const colors = {
      'active': 'bg-green-500',
      'inactive': 'bg-gray-500', 
      'paused': 'bg-yellow-500',
      'error': 'bg-red-500'
    };
    return colors?.[status] || 'bg-gray-500';
  },

  getHealthColor(healthStatus) {
    const colors = {
      'healthy': 'bg-green-500',
      'degraded': 'bg-yellow-500',
      'unhealthy': 'bg-red-500'
    };
    return colors?.[healthStatus] || 'bg-gray-500';
  }
};