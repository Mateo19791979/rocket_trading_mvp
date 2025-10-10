// Service layer for Internal Agents management with Supabase integration

import { supabase } from '../lib/supabase.js';

class InternalAgentsService {
  // Get all agents with their current status
  async getAgents() {
    try {
      const { data, error } = await supabase?.from('agents')?.select('*')?.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }
  }

  // Get agent tasks with filtering
  async getAgentTasks(filters = {}) {
    try {
      let query = supabase?.from('agent_tasks')?.select(`
        *,
        agent:agents(name, kind, status)
      `);
      
      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }
      
      if (filters?.agent_name) {
        query = query?.eq('agent_name', filters?.agent_name);
      }
      
      const { data, error } = await query?.order('created_at', { ascending: false })?.limit(100);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch agent tasks: ${error.message}`);
    }
  }

  // Get agent metrics for dashboard
  async getAgentMetrics(agentName, limit = 50) {
    try {
      const { data, error } = await supabase?.from('agent_metrics')?.select('*')?.eq('agent_name', agentName)?.order('ts', { ascending: false })?.limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch agent metrics: ${error.message}`);
    }
  }

  // Get kill switches status
  async getKillSwitches() {
    try {
      const { data, error } = await supabase?.from('kill_switches')?.select('*')?.order('module');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch kill switches: ${error.message}`);
    }
  }

  // Enqueue a new task for an agent
  async enqueueTask(agentName, taskType, payload, priority = 0) {
    try {
      const { data, error } = await supabase?.from('agent_tasks')?.insert({
          agent_name: agentName,
          task_type: taskType,
          payload: payload || {},
          priority
        })?.select()?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to enqueue task: ${error.message}`);
    }
  }

  // Get agent statistics
  async getAgentStats() {
    try {
      // Get agent counts by status
      const { data: agentStats, error: agentError } = await supabase?.from('agents')?.select('status')?.then(({ data, error }) => {
          if (error) throw error;
          const stats = data?.reduce((acc, agent) => {
            acc[agent.status] = (acc?.[agent?.status] || 0) + 1;
            return acc;
          }, {}) || {};
          return { data: stats, error: null };
        });

      if (agentError) throw agentError;

      // Get task counts by status
      const { data: taskStats, error: taskError } = await supabase?.from('agent_tasks')?.select('status')?.then(({ data, error }) => {
          if (error) throw error;
          const stats = data?.reduce((acc, task) => {
            acc[task.status] = (acc?.[task?.status] || 0) + 1;
            return acc;
          }, {}) || {};
          return { data: stats, error: null };
        });

      if (taskError) throw taskError;

      return {
        agents: agentStats,
        tasks: taskStats
      };
    } catch (error) {
      throw new Error(`Failed to fetch agent stats: ${error.message}`);
    }
  }

  // Subscribe to real-time updates
  subscribeToAgentUpdates(callback) {
    const channel = supabase?.channel('agents_updates')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        (payload) => callback?.('agents', payload)
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_tasks' },
        (payload) => callback?.('agent_tasks', payload)
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_metrics' },
        (payload) => callback?.('agent_metrics', payload)
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  // Run maintenance manually
  async runMaintenance() {
    try {
      const { data, error } = await supabase?.rpc('mark_stale_and_timeouts', {
        p_timeout_sec: 900,        // 15 min
        p_queued_stale_sec: 86400  // 24h
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to run maintenance: ${error.message}`);
    }
  }
}

export const internalAgentsService = new InternalAgentsService();