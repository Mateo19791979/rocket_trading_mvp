import { supabase } from '../lib/supabase';

class AgentRosterService {
  // Get all 24 AI agents with their current status and performance
  async getAgentRoster() {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.select(`
          *,
          portfolio:portfolios(*)
        `)?.order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.log('Error fetching agent roster:', error);
      throw error;
    }
  }

  // Get agents by group (orchestration, ingestion, signals, execution)
  async getAgentsByGroup(group) {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.select('*')?.eq('agent_group', group)?.order('name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.log('Error fetching agents by group:', error);
      throw error;
    }
  }

  // Update agent status (active, inactive, paused, error)
  async updateAgentStatus(agentId, status) {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.update({
          agent_status: status,
          last_active_at: status === 'active' ? new Date()?.toISOString() : undefined
        })?.eq('id', agentId)?.select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.log('Error updating agent status:', error);
      throw error;
    }
  }

  // Get agent performance metrics
  async getAgentPerformance(agentId) {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.select(`
          id,
          name,
          total_trades,
          successful_trades,
          total_pnl,
          win_rate,
          performance_metrics,
          risk_parameters
        `)?.eq('id', agentId)?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.log('Error fetching agent performance:', error);
      throw error;
    }
  }

  // Get agent mission objectives and status
  async getAgentMissions() {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.select(`
          id,
          name,
          agent_group,
          agent_status,
          description,
          configuration,
          performance_metrics,
          last_active_at
        `)?.order('agent_group, name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.log('Error fetching agent missions:', error);
      throw error;
    }
  }

  // Update agent configuration for specific missions
  async updateAgentConfiguration(agentId, configuration) {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.update({
          configuration: configuration
        })?.eq('id', agentId)?.select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.log('Error updating agent configuration:', error);
      throw error;
    }
  }

  // Create new agent for a specific mission
  async createMissionAgent(agentData) {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.insert({
          name: agentData?.name,
          description: agentData?.description,
          agent_group: agentData?.group,
          strategy: agentData?.strategy || 'momentum',
          configuration: agentData?.configuration || {},
          risk_parameters: agentData?.risk_parameters || {},
          user_id: agentData?.user_id
        })?.select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.log('Error creating mission agent:', error);
      throw error;
    }
  }

  // Get real-time agent health status
  async getAgentHealthStatus() {
    try {
      const { data, error } = await supabase?.from('system_health')?.select(`
          *,
          agent:ai_agents(id, name, agent_group, agent_status)
        `)?.order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.log('Error fetching agent health status:', error);
      throw error;
    }
  }

  // Get agent event bus activity for missions tracking
  async getAgentActivity(agentId = null, limit = 50) {
    try {
      let query = supabase?.from('event_bus')?.select(`
          *,
          source_agent:ai_agents!source_agent_id(id, name),
          target_agent:ai_agents!target_agent_id(id, name)
        `)?.order('created_at', { ascending: false })?.limit(limit);

      if (agentId) {
        query = query?.or(`source_agent_id.eq.${agentId},target_agent_id.eq.${agentId}`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.log('Error fetching agent activity:', error);
      throw error;
    }
  }
}

export const agentRosterService = new AgentRosterService();