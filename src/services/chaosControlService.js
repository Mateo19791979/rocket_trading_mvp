import { supabase } from '../lib/supabase';

class ChaosControlService {
  constructor() {
    this.chaosScenarios = [
      'provider_shutdown',
      'latency_injection', 
      'quota_exhaustion',
      'network_failure',
      'database_timeout'
    ];
  }

  // Get provider health overview
  async getProvidersHealth() {
    try {
      const { data, error } = await supabase?.from('provider_toggles')?.select('*')?.order('priority', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(provider => ({
          id: provider?.id,
          name: provider?.provider_name,
          enabled: provider?.enabled,
          status: provider?.status,
          healthScore: provider?.health_score,
          priority: provider?.priority,
          errorCount: provider?.error_count,
          successCount: provider?.success_count,
          circuitBreakerOpen: provider?.circuit_breaker_open,
          lastHealthCheck: provider?.last_health_check,
          notes: provider?.notes
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch providers health'
      };
    }
  }

  // Inject provider failure
  async injectProviderFailure(providerName, options = {}) {
    try {
      const { latencyMs = 0, errorRate = 0, duration = 300 } = options;
      
      // Update provider toggle to simulate failure
      const { data, error } = await supabase?.from('provider_toggles')?.update({
          enabled: false,
          status: 'degraded',
          circuit_breaker_open: true,
          circuit_breaker_opens_at: new Date()?.toISOString(),
          error_count: Math.floor(errorRate),
          notes: `Chaos test: ${latencyMs}ms latency, ${errorRate}% error rate, ${duration}s duration`,
          updated_at: new Date()?.toISOString()
        })?.eq('provider_name', providerName)?.select()?.single();

      if (error) {
        throw error;
      }

      // Log the chaos event
      await this.logChaosEvent('provider_failure', {
        provider: providerName,
        latencyMs,
        errorRate,
        duration,
        timestamp: new Date()?.toISOString()
      });

      return {
        success: true,
        data: `Chaos injected for ${providerName}`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to inject provider failure'
      };
    }
  }

  // Cut all providers
  async cutAllProviders() {
    try {
      const { data, error } = await supabase?.from('provider_toggles')?.update({
          enabled: false,
          status: 'failed',
          circuit_breaker_open: true,
          circuit_breaker_opens_at: new Date()?.toISOString(),
          notes: 'Chaos test: All providers disabled',
          updated_at: new Date()?.toISOString()
        })?.neq('provider_name', '')?.select();

      if (error) {
        throw error;
      }

      // Log the chaos event
      await this.logChaosEvent('all_providers_cut', {
        affectedProviders: data?.map(p => p?.provider_name) || [],
        timestamp: new Date()?.toISOString()
      });

      return {
        success: true,
        data: `All providers disabled - ${data?.length || 0} providers affected`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to cut all providers'
      };
    }
  }

  // Reset all providers
  async resetAllProviders() {
    try {
      const { data, error } = await supabase?.from('provider_toggles')?.update({
          enabled: true,
          status: 'active',
          circuit_breaker_open: false,
          circuit_breaker_opens_at: null,
          error_count: 0,
          health_score: 1.0,
          notes: 'Chaos test reset - All providers restored',
          updated_at: new Date()?.toISOString()
        })?.neq('provider_name', '')?.select();

      if (error) {
        throw error;
      }

      // Log the reset event
      await this.logChaosEvent('reset_all_providers', {
        restoredProviders: data?.map(p => p?.provider_name) || [],
        timestamp: new Date()?.toISOString()
      });

      return {
        success: true,
        data: `All providers reset - ${data?.length || 0} providers restored`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to reset providers'
      };
    }
  }

  // Get feature flags for chaos testing
  async getChaosFeatureFlags() {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.select('*')?.in('key', [
          'chaos_mode_enabled',
          'provider_failover_enabled', 
          'circuit_breaker_enabled',
          'shadow_price_enabled'
        ])?.eq('is_active', true);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(flag => ({
          key: flag?.key,
          value: flag?.value,
          type: flag?.flag_type,
          environment: flag?.environment,
          description: flag?.description,
          isActive: flag?.is_active
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch chaos feature flags'
      };
    }
  }

  // Toggle feature flag
  async toggleFeatureFlag(key, enabled) {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.update({
          value: enabled?.toString(),
          updated_at: new Date()?.toISOString()
        })?.eq('key', key)?.select()?.single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: `Feature flag ${key} ${enabled ? 'enabled' : 'disabled'}`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to toggle feature flag'
      };
    }
  }

  // Get system resilience metrics
  async getResilienceMetrics() {
    try {
      // Get recent health checks
      const { data: healthChecks, error: healthError } = await supabase?.from('provider_health_checks')?.select('*')?.order('checked_at', { ascending: false })?.limit(100);

      if (healthError) {
        throw healthError;
      }

      // Calculate metrics
      const totalChecks = healthChecks?.length || 0;
      const successfulChecks = healthChecks?.filter(check => 
        check?.status === 'active' && !check?.error_message
      )?.length || 0;
      
      const averageResponseTime = healthChecks?.reduce((sum, check) => 
        sum + (check?.response_time_ms || 0), 0
      ) / totalChecks || 0;

      const failureRate = totalChecks > 0 ? 
        ((totalChecks - successfulChecks) / totalChecks) * 100 : 0;

      return {
        success: true,
        data: {
          totalHealthChecks: totalChecks,
          successfulChecks,
          failureRate: Math.round(failureRate * 100) / 100,
          averageResponseTime: Math.round(averageResponseTime),
          uptime: totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
          lastCheckTime: healthChecks?.[0]?.checked_at,
          recentFailures: healthChecks?.filter(check => 
            check?.error_message
          )?.slice(0, 5)?.map(check => ({
            provider: check?.provider_name,
            error: check?.error_message,
            timestamp: check?.checked_at
          })) || []
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch resilience metrics'
      };
    }
  }

  // Log chaos events
  async logChaosEvent(eventType, eventData) {
    try {
      const { data, error } = await supabase?.from('event_bus')?.insert({
          event_type: 'system_status',
          priority: 'high',
          event_data: {
            chaos_event: true,
            event_type: eventType,
            ...eventData
          }
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error) {
      console.log('Failed to log chaos event:', error);
      return { success: false, error: error?.message };
    }
  }

  // Get chaos test history
  async getChaosTestHistory() {
    try {
      const { data, error } = await supabase?.from('event_bus')?.select('*')?.eq('event_type', 'system_status')?.contains('event_data', { chaos_event: true })?.order('created_at', { ascending: false })?.limit(50);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(event => ({
          id: event?.id,
          type: event?.event_data?.event_type,
          timestamp: event?.created_at,
          details: event?.event_data,
          priority: event?.priority,
          isProcessed: event?.is_processed
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch chaos test history'
      };
    }
  }

  // Real-time subscriptions
  subscribeToProviderChanges(callback) {
    const subscription = supabase?.channel('provider_toggles_channel')?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'provider_toggles'
      }, callback)?.subscribe();

    return subscription;
  }

  subscribeToHealthChecks(callback) {
    const subscription = supabase?.channel('health_checks_channel')?.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'provider_health_checks'
      }, callback)?.subscribe();

    return subscription;
  }
}

export const chaosControlService = new ChaosControlService();
export default chaosControlService;