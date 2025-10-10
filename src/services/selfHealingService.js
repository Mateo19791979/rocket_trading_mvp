import { supabase } from '../lib/supabase';

class SelfHealingService {
  // System Health Operations
  async getSystemHealthOverview() {
    try {
      const { data, error } = await supabase?.from('system_health')?.select(`
          id,
          health_status,
          cpu_usage,
          memory_usage,
          error_count,
          warning_count,
          last_heartbeat,
          uptime_seconds,
          metrics,
          agent_id,
          ai_agents!inner(
            id,
            name,
            agent_status,
            agent_group,
            last_active_at
          )
        `)?.order('last_heartbeat', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching system health overview:', error);
      return [];
    }
  }

  // Recovery Operations
  async getRecoveryOperations() {
    try {
      const { data, error } = await supabase?.from('risk_controller')?.select(`
          id,
          killswitch_status,
          killswitch_enabled,
          emergency_stop_all,
          auto_recovery_enabled,
          recovery_delay_minutes,
          risk_level,
          max_daily_loss,
          max_portfolio_drawdown,
          last_health_check,
          configuration,
          trigger_reason,
          triggered_at
        `)?.order('last_health_check', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recovery operations:', error);
      return [];
    }
  }

  // Orchestrator State
  async getOrchestratorState() {
    try {
      const { data, error } = await supabase?.from('orchestrator_state')?.select('*')?.order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching orchestrator state:', error);
      return [];
    }
  }

  // Risk Events and Recovery Logs
  async getRiskEvents(limit = 50) {
    try {
      const { data, error } = await supabase?.from('risk_events')?.select(`
          id,
          description,
          severity,
          event_type,
          details,
          created_at,
          resolved_at,
          resolved_by,
          risk_controller_id
        `)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching risk events:', error);
      return [];
    }
  }

  // Provider Health Status
  async getProviderHealthStatus() {
    try {
      const { data, error } = await supabase?.from('external_api_configs')?.select(`
          id,
          api_name,
          base_url,
          is_active,
          last_successful_call,
          total_calls_today,
          rate_limit_per_minute,
          created_at,
          updated_at
        `)?.order('last_successful_call', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching provider health status:', error);
      return [];
    }
  }

  // System Mode Management
  async getSystemMode() {
    try {
      const { data, error } = await supabase?.from('orchestrator_state')?.select('*')?.eq('key', 'system_mode')?.single();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      return data?.value || { mode: 'NORMAL', providers_up: 0, last_change: null };
    } catch (error) {
      console.error('Error fetching system mode:', error);
      return { mode: 'NORMAL', providers_up: 0, last_change: null };
    }
  }

  // Manual Recovery Actions
  async triggerManualRecovery(agentId, recoveryType = 'restart') {
    try {
      const { data, error } = await supabase?.rpc('log_orchestrator_event', {
        event_type: 'manual_recovery',
        event_data: {
          agent_id: agentId,
          recovery_type: recoveryType,
          triggered_by: 'manual',
          timestamp: new Date()?.toISOString()
        },
        priority: 'high'
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error triggering manual recovery:', error);
      throw error;
    }
  }

  // Killswitch Operations  
  async activateKillswitch(reason = 'Manual activation') {
    try {
      const { data, error } = await supabase?.rpc('activate_killswitch', {
        trigger_reason: reason
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error activating killswitch:', error);
      throw error;
    }
  }

  async deactivateKillswitch() {
    try {
      const { data, error } = await supabase?.rpc('deactivate_killswitch');

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error deactivating killswitch:', error);
      throw error;
    }
  }

  // Recovery Threshold Management
  async updateRecoveryThresholds(thresholds) {
    try {
      const { data, error } = await supabase?.from('risk_controller')?.update({
          max_daily_loss: thresholds?.max_daily_loss,
          max_portfolio_drawdown: thresholds?.max_portfolio_drawdown,
          recovery_delay_minutes: thresholds?.recovery_delay_minutes,
          configuration: thresholds?.configuration,
          updated_at: new Date()?.toISOString()
        })?.eq('user_id', (await supabase?.auth?.getUser())?.data?.user?.id);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating recovery thresholds:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToSystemHealth(callback) {
    const channel = supabase?.channel('system-health-changes')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_health' },
        callback
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  subscribeToRiskEvents(callback) {
    const channel = supabase?.channel('risk-events-changes')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'risk_events' },
        callback
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  subscribeToOrchestratorState(callback) {
    const channel = supabase?.channel('orchestrator-state-changes')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orchestrator_state' },
        callback
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }
}

export default new SelfHealingService();