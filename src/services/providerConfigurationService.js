import { supabase } from '../lib/supabase';

/**
 * Provider Configuration Management Service
 * Handles API provider setup, monitoring, and failover management
 */

export class ProviderConfigurationService {
  
  // Provider Configuration Operations
  async getAllProviders() {
    try {
      const { data, error } = await supabase?.from('external_api_configs')?.select('*')?.order('api_name');

      if (error) {
        throw new Error(`Failed to fetch providers: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  async updateProviderConfig(providerId, updates) {
    try {
      const { data, error } = await supabase?.from('external_api_configs')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', providerId)?.select()?.single();

      if (error) {
        throw new Error(`Failed to update provider: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating provider:', error);
      throw error;
    }
  }

  async saveApiKey(providerId, encryptedKey) {
    try {
      const { data, error } = await supabase?.from('external_api_configs')?.update({
          api_key_encrypted: encryptedKey,
          updated_at: new Date()?.toISOString()
        })?.eq('id', providerId)?.select()?.single();

      if (error) {
        throw new Error(`Failed to save API key: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }

  // Provider Health Monitoring
  async testProviderConnectivity(providerName) {
    try {
      const { data, error } = await supabase?.rpc('test_provider_connectivity', { 
          provider_name_param: providerName 
        });

      if (error) {
        throw new Error(`Connectivity test failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error testing connectivity:', error);
      throw error;
    }
  }

  async getProviderHealthChecks(providerName = null, limit = 50) {
    try {
      let query = supabase?.from('provider_health_checks')?.select(`
          *,
          checked_by_profile:user_profiles(full_name, email)
        `)?.order('checked_at', { ascending: false })?.limit(limit);

      if (providerName) {
        query = query?.eq('provider_name', providerName);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch health checks: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching health checks:', error);
      throw error;
    }
  }

  async getProviderStatistics(daysBack = 7) {
    try {
      const { data, error } = await supabase?.rpc('get_provider_statistics', { days_back: daysBack });

      if (error) {
        throw new Error(`Failed to fetch statistics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching provider statistics:', error);
      throw error;
    }
  }

  // Quota and Performance Monitoring
  async getQuotaUsage(providerName) {
    try {
      const today = new Date()?.toISOString()?.split('T')?.[0];
      
      const { data, error } = await supabase?.from('market_data_sync_jobs')?.select('*')?.eq('api_source', providerName)?.gte('started_at', `${today}T00:00:00.000Z`)?.lte('started_at', `${today}T23:59:59.999Z`);

      if (error) {
        throw new Error(`Failed to fetch quota usage: ${error.message}`);
      }

      const totalCalls = data?.length || 0;
      const successfulCalls = data?.filter(job => job?.status === 'completed')?.length || 0;
      const failedCalls = data?.filter(job => job?.status === 'failed')?.length || 0;

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        successRate: totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching quota usage:', error);
      throw error;
    }
  }

  async getLatencyData(providerName, hours = 24) {
    try {
      const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000)?.toISOString();
      
      const { data, error } = await supabase?.from('provider_health_checks')?.select('checked_at, response_time_ms')?.eq('provider_name', providerName)?.gte('checked_at', hoursAgo)?.not('response_time_ms', 'is', null)?.order('checked_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch latency data: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching latency data:', error);
      throw error;
    }
  }

  // Failover Management
  async getFailoverConfigs() {
    try {
      const { data, error } = await supabase?.from('provider_failover_configs')?.select(`
          *,
          created_by_profile:user_profiles(full_name, email)
        `)?.order('priority_order');

      if (error) {
        throw new Error(`Failed to fetch failover configs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching failover configs:', error);
      throw error;
    }
  }

  async createFailoverConfig(config) {
    try {
      const { data, error } = await supabase?.from('provider_failover_configs')?.insert({
          primary_provider: config?.primary_provider,
          fallback_provider: config?.fallback_provider,
          trigger_type: config?.trigger_type,
          threshold_value: config?.threshold_value,
          priority_order: config?.priority_order || 1,
          is_active: config?.is_active ?? true
        })?.select()?.single();

      if (error) {
        throw new Error(`Failed to create failover config: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating failover config:', error);
      throw error;
    }
  }

  async triggerManualFailover(primaryProvider, reason = 'manual') {
    try {
      const { data, error } = await supabase?.rpc('trigger_provider_failover', {
          primary_provider_name: primaryProvider,
          trigger_reason: reason
        });

      if (error) {
        throw new Error(`Failed to trigger failover: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error triggering failover:', error);
      throw error;
    }
  }

  // Google Sheets Fallback Configuration
  async getGoogleSheetsConfigs() {
    try {
      const { data, error } = await supabase?.from('google_sheets_configs')?.select(`
          *,
          created_by_profile:user_profiles(full_name, email)
        `)?.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch Google Sheets configs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching Google Sheets configs:', error);
      throw error;
    }
  }

  async saveGoogleSheetsConfig(config) {
    try {
      const { data, error } = await supabase?.from('google_sheets_configs')?.upsert({
          id: config?.id,
          spreadsheet_id: config?.spreadsheet_id,
          service_account_email: config?.service_account_email,
          worksheet_name: config?.worksheet_name || 'market_data',
          sync_enabled: config?.sync_enabled ?? false
        })?.select()?.single();

      if (error) {
        throw new Error(`Failed to save Google Sheets config: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error saving Google Sheets config:', error);
      throw error;
    }
  }

  // NEW: Add methods to work with simple providers table
  async getSimpleProviders() {
    try {
      const { data, error } = await supabase?.from('providers')?.select('*')?.eq('id', 'default')?.single();

      if (error) {
        throw new Error(`Failed to fetch simple providers: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching simple providers:', error);
      throw error;
    }
  }

  async updateSimpleProviders(updates) {
    try {
      const { data, error } = await supabase?.from('providers')?.upsert({
          id: 'default',
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) {
        throw new Error(`Failed to update simple providers: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating simple providers:', error);
      throw error;
    }
  }

  // NEW: Test connection using simple providers table
  async testConnectionWithSimpleKey(providerType, apiKey) {
    try {
      let testUrl;
      let testSymbol = 'AAPL';

      switch (providerType) {
        case 'finnhub':
          testUrl = `https://finnhub.io/api/v1/quote?symbol=${testSymbol}&token=${apiKey}`;
          break;
        case 'alpha_vantage':
          testUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${testSymbol}&interval=1min&apikey=${apiKey}`;
          break;
        case 'twelve_data':
          testUrl = `https://api.twelvedata.com/time_series?symbol=${testSymbol}&interval=1min&apikey=${apiKey}`;
          break;
        default:
          throw new Error(`Unsupported provider type: ${providerType}`);
      }

      const response = await fetch(testUrl);
      const data = await response?.json();

      // Check for API-specific error patterns
      if (providerType === 'finnhub' && data?.error) {
        return { success: false, error: data?.error };
      }
      
      if (providerType === 'alpha_vantage' && data?.['Error Message']) {
        return { success: false, error: data?.['Error Message'] };
      }
      
      if (providerType === 'twelve_data' && data?.message) {
        return { success: false, error: data?.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Error testing ${providerType} connection:`, error);
      return { success: false, error: error?.message };
    }
  }

  // NEW: Bulk test all providers from simple table
  async testAllSimpleProviders() {
    try {
      const providers = await this.getSimpleProviders();
      const results = {};

      if (providers?.finnhub_api?.trim()) {
        results.finnhub = await this.testConnectionWithSimpleKey('finnhub', providers?.finnhub_api);
      }

      if (providers?.alpha_api?.trim()) {
        results.alpha_vantage = await this.testConnectionWithSimpleKey('alpha_vantage', providers?.alpha_api);
      }

      if (providers?.twelve_api?.trim()) {
        results.twelve_data = await this.testConnectionWithSimpleKey('twelve_data', providers?.twelve_api);
      }

      return results;
    } catch (error) {
      console.error('Error testing all simple providers:', error);
      throw error;
    }
  }

  // NEW: Get provider key safely from simple table
  async getProviderKey(providerType) {
    try {
      const providers = await this.getSimpleProviders();
      
      switch (providerType) {
        case 'finnhub':
          return providers?.finnhub_api || null;
        case 'alpha_vantage':
          return providers?.alpha_api || null;
        case 'twelve_data':
          return providers?.twelve_api || null;
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error getting ${providerType} key:`, error);
      return null;
    }
  }

  // NEW: Subscribe to simple providers table changes
  subscribeToSimpleProviders(callback) {
    const subscription = supabase?.channel('providers')?.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'providers' 
        },
        callback
      )?.subscribe();

    return subscription;
  }

  // Update the finnhub API key to use the provided key
  async updateApiKeyWithProvidedCredentials() {
    try {
      // Update with the provided API keys
      const result = await this.updateSimpleProviders({
        finnhub_api: 'd3f8pdhr01qolknc612gd3f8pdhr01qolknc6130',
        alpha_api: 'ZQ0MOE2ZTN2AWY8J',
        twelve_api: 'bbab9cf2ad5f4d42bd67e5792ab32d73'
      });
      
      if (result?.success) {
        console.log('✅ Provider API keys updated successfully');
        return { success: true, message: 'API keys configured successfully' };
      } else {
        console.error('❌ Failed to update provider API keys:', result?.error);
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.error('Error updating provided credentials:', error);
      return { success: false, error: error?.message };
    }
  }

  // Bulk Operations
  async runBulkHealthCheck() {
    try {
      const providers = await this.getAllProviders();
      const activeProviders = providers?.filter(p => p?.is_active) || [];
      
      const results = [];
      for (const provider of activeProviders) {
        try {
          const result = await this.testProviderConnectivity(provider?.api_name);
          results?.push({
            provider: provider?.api_name,
            success: result,
            error: null
          });
        } catch (error) {
          results?.push({
            provider: provider?.api_name,
            success: false,
            error: error?.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error running bulk health check:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToHealthChecks(callback) {
    const subscription = supabase?.channel('provider_health_checks')?.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'provider_health_checks' 
        },
        callback
      )?.subscribe();

    return subscription;
  }

  subscribeToProviderConfigs(callback) {
    const subscription = supabase?.channel('external_api_configs')?.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'external_api_configs' 
        },
        callback
      )?.subscribe();

    return subscription;
  }
}

export const providerConfigurationService = new ProviderConfigurationService();