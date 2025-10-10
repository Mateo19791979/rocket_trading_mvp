import { supabase } from '../lib/supabase';

class FeatureFlagsProviderService {
  // Feature Flags Operations
  async getFeatureFlags(filters = {}) {
    try {
      let query = supabase?.from('feature_flags')?.select(`
          *,
          created_by_profile:user_profiles!created_by(id, full_name, email)
        `)?.order('updated_at', { ascending: false });

      if (filters?.is_active !== undefined) {
        query = query?.eq('is_active', filters?.is_active);
      }

      if (filters?.environment) {
        query = query?.eq('environment', filters?.environment);
      }

      if (filters?.flag_type) {
        query = query?.eq('flag_type', filters?.flag_type);
      }

      if (filters?.search) {
        query = query?.or(`key.ilike.%${filters?.search}%,description.ilike.%${filters?.search}%`);
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

  async getFeatureFlagByKey(key) {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.select(`
          *,
          created_by_profile:user_profiles!created_by(id, full_name, email)
        `)?.eq('key', key)?.single();

      if (error) {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async createFeatureFlag(flagData) {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.insert([flagData])?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateFeatureFlag(id, updates) {
    try {
      // Handle TTL expiration
      if (updates?.ttl_seconds) {
        const expiresAt = new Date();
        expiresAt?.setSeconds(expiresAt?.getSeconds() + updates?.ttl_seconds);
        updates.expires_at = expiresAt?.toISOString();
      }

      const { data, error } = await supabase?.from('feature_flags')?.update(updates)?.eq('id', id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async deleteFeatureFlag(id) {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.delete()?.eq('id', id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async toggleFeatureFlag(id, isActive) {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.update({ is_active: isActive })?.eq('id', id)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Provider Toggle Operations
  async getProviderToggles(filters = {}) {
    try {
      let query = supabase?.from('provider_toggles')?.select('*')?.order('priority', { ascending: false });

      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.enabled !== undefined) {
        query = query?.eq('enabled', filters?.enabled);
      }

      if (filters?.circuit_breaker_open !== undefined) {
        query = query?.eq('circuit_breaker_open', filters?.circuit_breaker_open);
      }

      if (filters?.search) {
        query = query?.or(`provider_name.ilike.%${filters?.search}%,notes.ilike.%${filters?.search}%`);
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

  async getProviderToggle(providerName) {
    try {
      const { data, error } = await supabase?.from('provider_toggles')?.select('*')?.eq('provider_name', providerName)?.single();

      if (error) {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateProviderToggle(providerName, updates) {
    try {
      // Update health score if success/error counts provided
      if (updates?.success_count !== undefined || updates?.error_count !== undefined) {
        const current = await this.getProviderToggle(providerName);
        if (current?.data) {
          const successCount = updates?.success_count ?? current?.data?.success_count;
          const errorCount = updates?.error_count ?? current?.data?.error_count;
          const totalRequests = successCount + errorCount;
          
          if (totalRequests > 0) {
            updates.health_score = Math.max(0, Math.min(1, successCount / totalRequests));
          }
        }
      }

      const { data, error } = await supabase?.from('provider_toggles')?.update(updates)?.eq('provider_name', providerName)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async toggleProvider(providerName, enabled) {
    try {
      const updates = {
        enabled,
        status: enabled ? 'active' : 'inactive'
      };

      // Clear circuit breaker if enabling
      if (enabled) {
        updates.circuit_breaker_open = false;
        updates.circuit_breaker_opens_at = null;
      }

      const { data, error } = await supabase?.from('provider_toggles')?.update(updates)?.eq('provider_name', providerName)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async updateProviderPriority(providerName, priority) {
    try {
      const { data, error } = await supabase?.from('provider_toggles')?.update({ priority })?.eq('provider_name', providerName)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async openCircuitBreaker(providerName, reason = null) {
    try {
      const updates = {
        circuit_breaker_open: true,
        circuit_breaker_opens_at: new Date()?.toISOString(),
        status: 'degraded',
        enabled: false
      };

      if (reason) {
        updates.notes = `Circuit breaker opened: ${reason}`;
      }

      const { data, error } = await supabase?.from('provider_toggles')?.update(updates)?.eq('provider_name', providerName)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async closeCircuitBreaker(providerName) {
    try {
      const updates = {
        circuit_breaker_open: false,
        circuit_breaker_opens_at: null,
        status: 'active',
        enabled: true,
        error_count: 0
      };

      const { data, error } = await supabase?.from('provider_toggles')?.update(updates)?.eq('provider_name', providerName)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Real-time Subscriptions
  subscribeToFeatureFlags(callback) {
    const channel = supabase?.channel('feature_flags_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  subscribeToProviderToggles(callback) {
    const channel = supabase?.channel('provider_toggles_changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'provider_toggles'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }

  // Bulk Operations
  async bulkUpdateProviders(updates) {
    try {
      const promises = updates?.map(({ provider_name, ...updateData }) =>
        this.updateProviderToggle(provider_name, updateData)
      );

      const results = await Promise.allSettled(promises);
      
      const successes = results?.filter(r => r?.status === 'fulfilled')?.map(r => r?.value?.data);
      const failures = results?.filter(r => r?.status === 'rejected')?.map(r => r?.reason);

      return {
        data: { successes, failures },
        error: failures?.length > 0 ? `${failures?.length} operations failed` : null
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async bulkToggleFlags(flagIds, isActive) {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.update({ is_active: isActive })?.in('id', flagIds)?.select();

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  }

  // Statistics and Analytics
  async getProviderStats() {
    try {
      const { data, error } = await supabase?.from('provider_toggles')?.select('status, enabled, health_score, circuit_breaker_open, success_count, error_count');

      if (error) {
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        active: 0,
        inactive: 0,
        degraded: 0,
        maintenance: 0,
        circuit_breakers_open: 0,
        avg_health_score: 0,
        total_requests: 0,
        success_rate: 0
      };

      let totalSuccesses = 0;
      let totalErrors = 0;

      data?.forEach(provider => {
        stats[provider.status] = (stats?.[provider?.status] || 0) + 1;
        
        if (provider?.circuit_breaker_open) {
          stats.circuit_breakers_open++;
        }
        
        stats.avg_health_score += provider?.health_score || 0;
        
        totalSuccesses += provider?.success_count || 0;
        totalErrors += provider?.error_count || 0;
      });

      stats.total_requests = totalSuccesses + totalErrors;
      stats.success_rate = stats?.total_requests > 0 ? totalSuccesses / stats?.total_requests : 0;
      
      if (stats?.total > 0) {
        stats.avg_health_score = stats?.avg_health_score / stats?.total;
      }

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  async getFlagStats() {
    try {
      const { data, error } = await supabase?.from('feature_flags')?.select('flag_type, is_active, environment');

      if (error) {
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        active: 0,
        inactive: 0,
        by_type: {},
        by_environment: {}
      };

      data?.forEach(flag => {
        if (flag?.is_active) {
          stats.active++;
        } else {
          stats.inactive++;
        }
        
        stats.by_type[flag.flag_type] = (stats?.by_type?.[flag?.flag_type] || 0) + 1;
        stats.by_environment[flag.environment] = (stats?.by_environment?.[flag?.environment] || 0) + 1;
      });

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }
}

export default new FeatureFlagsProviderService();