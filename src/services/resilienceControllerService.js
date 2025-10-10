import { supabase } from '../lib/supabase';

class ResilienceControllerService {
  // Resilience State Operations
  async getCurrentState() {
    try {
      const { data, error } = await supabase?.from('resilience_state')?.select(`
          *,
          override_by_profile:user_profiles!override_by(id, full_name, email)
        `)?.order('updated_at', { ascending: false })?.limit(1)?.single();

      if (error) {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateResilienceState(updates) {
    try {
      // Get current state first
      const currentState = await this.getCurrentState();
      
      if (!currentState?.data) {
        // Create initial state if none exists
        const { data, error } = await supabase?.from('resilience_state')?.insert([{
            current_mode: 'normal',
            providers_up: 0,
            providers_total: 0,
            shadow_mode_active: false,
            auto_recovery_enabled: true,
            manual_override: false,
            ...updates
          }])?.select()?.single();

        if (error) {
          throw error;
        }

        return { data, error: null };
      }

      // Update existing state
      const { data, error } = await supabase?.from('resilience_state')?.update(updates)?.eq('id', currentState?.data?.id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async overrideMode(mode, reason, userId = null) {
    try {
      const updates = {
        current_mode: mode,
        manual_override: true,
        override_reason: reason,
        override_by: userId,
        last_mode_change: new Date()?.toISOString()
      };

      const result = await this.updateResilienceState(updates);
      
      // Log the override event
      if (result?.data) {
        await this.logEvent('manual_override', null, mode, reason, false, userId, {
          override_reason: reason
        });
      }

      return result;
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async clearOverride() {
    try {
      const updates = {
        manual_override: false,
        override_reason: null,
        override_by: null
      };

      const result = await this.updateResilienceState(updates);
      
      // Log the clear override event
      if (result?.data) {
        await this.logEvent('override_cleared', result?.data?.current_mode, result?.data?.current_mode, 
          'Manual override cleared', false, null);
      }

      return result;
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async enableAutoRecovery() {
    try {
      return await this.updateResilienceState({
        auto_recovery_enabled: true
      });
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async disableAutoRecovery() {
    try {
      return await this.updateResilienceState({
        auto_recovery_enabled: false
      });
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Resilience Events Operations
  async getEvents(filters = {}) {
    try {
      let query = supabase?.from('resilience_events')?.select(`
          *,
          triggered_by_profile:user_profiles!triggered_by(id, full_name, email)
        `)?.order('created_at', { ascending: false });

      if (filters?.event_type) {
        query = query?.eq('event_type', filters?.event_type);
      }

      if (filters?.from_mode) {
        query = query?.eq('from_mode', filters?.from_mode);
      }

      if (filters?.to_mode) {
        query = query?.eq('to_mode', filters?.to_mode);
      }

      if (filters?.automatic !== undefined) {
        query = query?.eq('automatic', filters?.automatic);
      }

      if (filters?.days) {
        const dateFilter = new Date();
        dateFilter?.setDate(dateFilter?.getDate() - filters?.days);
        query = query?.gte('created_at', dateFilter?.toISOString());
      }

      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  async logEvent(eventType, fromMode, toMode, triggerReason, automatic = true, triggeredBy = null, eventData = null) {
    try {
      const { data, error } = await supabase?.from('resilience_events')?.insert([{
          event_type: eventType,
          from_mode: fromMode,
          to_mode: toMode,
          trigger_reason: triggerReason,
          automatic,
          triggered_by: triggeredBy,
          event_data: eventData
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // System Health and Recovery
  async checkSystemHealth() {
    try {
      // Get provider statuses
      const { data: providers, error: providerError } = await supabase?.from('provider_toggles')?.select('provider_name, status, enabled, health_score, circuit_breaker_open');

      if (providerError) {
        throw providerError;
      }

      const providersUp = providers?.filter(p => 
        p?.enabled && p?.status === 'active' && !p?.circuit_breaker_open
      )?.length || 0;

      const providersTotal = providers?.length || 0;

      // Calculate system health
      const healthPercentage = providersTotal > 0 ? providersUp / providersTotal : 0;
      
      let recommendedMode = 'normal';
      if (providersUp === 0) {
        recommendedMode = 'degraded';
      } else if (healthPercentage < 0.5) {
        recommendedMode = 'partial';
      }

      // Check if shadow mode should be active
      const shadowModeActive = healthPercentage < 0.7;

      const healthStatus = {
        providers_up: providersUp,
        providers_total: providersTotal,
        health_percentage: healthPercentage,
        recommended_mode: recommendedMode,
        shadow_mode_recommended: shadowModeActive,
        unhealthy_providers: providers?.filter(p => 
          !p?.enabled || p?.status !== 'active' || p?.circuit_breaker_open
        ) || []
      };

      return { data: healthStatus, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async triggerRecovery() {
    try {
      const healthCheck = await this.checkSystemHealth();
      
      if (!healthCheck?.data) {
        throw new Error('Failed to check system health');
      }

      const currentState = await this.getCurrentState();
      
      if (!currentState?.data) {
        throw new Error('Failed to get current resilience state');
      }

      // Don't auto-recover if manual override is active
      if (currentState?.data?.manual_override) {
        return { data: { message: 'Auto recovery skipped - manual override active' }, error: null };
      }

      const updates = {
        providers_up: healthCheck?.data?.providers_up,
        providers_total: healthCheck?.data?.providers_total,
        shadow_mode_active: healthCheck?.data?.shadow_mode_recommended
      };

      // Only change mode if auto recovery is enabled
      if (currentState?.data?.auto_recovery_enabled && 
          currentState?.data?.current_mode !== healthCheck?.data?.recommended_mode) {
        
        updates.current_mode = healthCheck?.data?.recommended_mode;
        updates.last_mode_change = new Date()?.toISOString();

        // Log mode change
        await this.logEvent(
          'auto_recovery',
          currentState?.data?.current_mode,
          healthCheck?.data?.recommended_mode,
          'Automatic recovery based on provider health',
          true,
          null,
          {
            providers_up: healthCheck?.data?.providers_up,
            providers_total: healthCheck?.data?.providers_total,
            health_percentage: healthCheck?.data?.health_percentage
          }
        );
      }

      const result = await this.updateResilienceState(updates);

      return {
        data: {
          ...result?.data,
          recovery_triggered: currentState?.data?.current_mode !== healthCheck?.data?.recommended_mode,
          health_status: healthCheck?.data
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Real-time Subscriptions
  subscribeToResilienceState(callback) {
    const channel = supabase?.channel('resilience_state_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resilience_state'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  subscribeToResilienceEvents(callback) {
    const channel = supabase?.channel('resilience_events_changes')?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'resilience_events'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  // Analytics and Statistics
  async getResilienceStats(filters = {}) {
    try {
      let query = supabase?.from('resilience_events')?.select('event_type, from_mode, to_mode, automatic, created_at');

      if (filters?.days) {
        const dateFilter = new Date();
        dateFilter?.setDate(dateFilter?.getDate() - filters?.days);
        query = query?.gte('created_at', dateFilter?.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const stats = {
        total_events: data?.length || 0,
        mode_changes: 0,
        auto_recoveries: 0,
        manual_overrides: 0,
        mode_distribution: {
          normal: 0,
          partial: 0,
          degraded: 0
        },
        event_types: {}
      };

      data?.forEach(event => {
        if (event?.event_type === 'mode_change') {
          stats.mode_changes++;
        } else if (event?.event_type === 'auto_recovery') {
          stats.auto_recoveries++;
        } else if (event?.event_type === 'manual_override') {
          stats.manual_overrides++;
        }

        if (event?.to_mode) {
          stats.mode_distribution[event.to_mode] = (stats?.mode_distribution?.[event?.to_mode] || 0) + 1;
        }

        stats.event_types[event.event_type] = (stats?.event_types?.[event?.event_type] || 0) + 1;
      });

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async getUptimeStats(days = 30) {
    try {
      const { data: events, error } = await supabase?.from('resilience_events')?.select('from_mode, to_mode, created_at')?.eq('event_type', 'mode_change')?.gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000)?.toISOString())?.order('created_at');

      if (error) {
        throw error;
      }

      const stats = {
        uptime_percentage: 0,
        normal_time: 0,
        partial_time: 0,
        degraded_time: 0,
        total_time: days * 24 * 60 * 60 * 1000, // in milliseconds
        mode_switches: events?.length || 0
      };

      if (!events || events?.length === 0) {
        stats.uptime_percentage = 100; // Assume normal if no events
        stats.normal_time = stats?.total_time;
        return { data: stats, error: null };
      }

      let currentMode = 'normal';
      let lastChangeTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      events?.forEach((event, index) => {
        const changeTime = new Date(event.created_at);
        const duration = changeTime - lastChangeTime;

        switch (currentMode) {
          case 'normal':
            stats.normal_time += duration;
            break;
          case 'partial':
            stats.partial_time += duration;
            break;
          case 'degraded':
            stats.degraded_time += duration;
            break;
        }

        currentMode = event?.to_mode;
        lastChangeTime = changeTime;
      });

      // Add time from last event to now
      const remainingTime = new Date() - lastChangeTime;
      switch (currentMode) {
        case 'normal':
          stats.normal_time += remainingTime;
          break;
        case 'partial':
          stats.partial_time += remainingTime;
          break;
        case 'degraded':
          stats.degraded_time += remainingTime;
          break;
      }

      stats.uptime_percentage = (stats?.normal_time / stats?.total_time) * 100;

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }
}

export default new ResilienceControllerService();