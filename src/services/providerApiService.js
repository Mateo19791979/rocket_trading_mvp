import { supabase } from '../lib/supabase';

class ProviderApiService {
  constructor() {
    this.providers = {
      finnhub: {
        baseUrl: 'https://finnhub.io/api/v1',
        apiKey: import.meta.env?.VITE_FINNHUB_API_KEY,
        rateLimitPerMinute: 60
      },
      alphavantage: {
        baseUrl: 'https://www.alphavantage.co/query',
        apiKey: import.meta.env?.VITE_ALPHAVANTAGE_API_KEY,
        rateLimitPerMinute: 5
      },
      twelvedata: {
        baseUrl: 'https://api.twelvedata.com',
        apiKey: import.meta.env?.VITE_TWELVEDATA_API_KEY,
        rateLimitPerMinute: 800
      }
    };
  }

  // Configure provider API keys in database
  async configureProviderKeys() {
    try {
      const updates = [];
      
      if (this.providers?.finnhub?.apiKey) {
        updates?.push({ provider: 'finnhub', key: this.providers?.finnhub?.apiKey });
      }
      
      if (this.providers?.alphavantage?.apiKey) {
        updates?.push({ provider: 'alpha_vantage', key: this.providers?.alphavantage?.apiKey });
      }
      
      if (this.providers?.twelvedata?.apiKey) {
        updates?.push({ provider: 'twelvedata', key: this.providers?.twelvedata?.apiKey });
      }

      // Update providers table
      for (const update of updates) {
        const { error } = await supabase?.from('providers')?.upsert({
            id: 'default',
            [`${update?.provider}_api`]: update?.key,
            updated_at: new Date()?.toISOString()
          })?.eq('id', 'default');

        if (error) {
          console.error(`Failed to update ${update?.provider}:`, error);
        }
      }

      return {
        success: true,
        data: `Configured ${updates?.length} provider API keys`,
        providersConfigured: updates?.map(u => u?.provider)
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to configure provider keys'
      };
    }
  }

  // Test provider connectivity with API keys
  async testProviderConnectivity() {
    const results = { successful: [], failed: [], totalTested: 0 };

    // Test Finnhub
    if (this.providers?.finnhub?.apiKey) {
      try {
        const response = await fetch(`${this.providers?.finnhub?.baseUrl}/quote?symbol=AAPL&token=${this.providers?.finnhub?.apiKey}`);
        
        if (response?.ok) {
          const data = await response?.json();
          if (data?.c) {
            results?.successful?.push({ provider: 'finnhub', price: data?.c, status: 'connected' });
          } else {
            results?.failed?.push({ provider: 'finnhub', error: 'Invalid response format' });
          }
        } else {
          results?.failed?.push({ provider: 'finnhub', error: `HTTP ${response?.status}` });
        }
      } catch (error) {
        results?.failed?.push({ provider: 'finnhub', error: error?.message });
      }
      results.totalTested++;
    }

    // Test Alpha Vantage
    if (this.providers?.alphavantage?.apiKey) {
      try {
        const response = await fetch(`${this.providers?.alphavantage?.baseUrl}?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${this.providers?.alphavantage?.apiKey}`);
        
        if (response?.ok) {
          const data = await response?.json();
          if (data?.['Global Quote']?.['05. price']) {
            results?.successful?.push({ 
              provider: 'alphavantage', 
              price: data?.['Global Quote']?.['05. price'], 
              status: 'connected' 
            });
          } else {
            results?.failed?.push({ provider: 'alphavantage', error: 'Invalid response format' });
          }
        } else {
          results?.failed?.push({ provider: 'alphavantage', error: `HTTP ${response?.status}` });
        }
      } catch (error) {
        results?.failed?.push({ provider: 'alphavantage', error: error?.message });
      }
      results.totalTested++;
    }

    // Test TwelveData
    if (this.providers?.twelvedata?.apiKey) {
      try {
        const response = await fetch(`${this.providers?.twelvedata?.baseUrl}/quote?symbol=AAPL&apikey=${this.providers?.twelvedata?.apiKey}`);
        
        if (response?.ok) {
          const data = await response?.json();
          if (data?.close) {
            results?.successful?.push({ provider: 'twelvedata', price: data?.close, status: 'connected' });
          } else {
            results?.failed?.push({ provider: 'twelvedata', error: 'Invalid response format' });
          }
        } else {
          results?.failed?.push({ provider: 'twelvedata', error: `HTTP ${response?.status}` });
        }
      } catch (error) {
        results?.failed?.push({ provider: 'twelvedata', error: error?.message });
      }
      results.totalTested++;
    }

    return {
      success: true,
      data: {
        ...results,
        successRate: results?.totalTested > 0 ? Math.round((results?.successful?.length / results?.totalTested) * 100) : 0,
        message: `Provider connectivity test: ${results?.successful?.length}/${results?.totalTested} providers connected`
      }
    };
  }

  // Update provider health status
  async updateProviderHealth(providerName, status, responseTimeMs = null, errorMessage = null) {
    try {
      const { error } = await supabase?.from('provider_health_checks')?.insert({
          provider_name: providerName,
          status: status,
          response_time_ms: responseTimeMs,
          error_message: errorMessage,
          checked_at: new Date()?.toISOString(),
          metadata: {
            environment: 'production',
            version: '1.0.0',
            check_type: 'api_connectivity'
          }
        });

      if (error) {
        console.error(`Failed to update health for ${providerName}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Provider health update error:', error);
      return false;
    }
  }

  // Get provider statistics
  async getProviderStatistics() {
    try {
      const { data, error } = await supabase?.from('provider_health_checks')?.select(`
          provider_name,
          status,
          response_time_ms,
          checked_at
        `)?.order('checked_at', { ascending: false })?.limit(100);

      if (error) {
        throw error;
      }

      const stats = data?.reduce((acc, check) => {
        const provider = check?.provider_name;
        if (!acc?.[provider]) {
          acc[provider] = {
            totalChecks: 0,
            successfulChecks: 0,
            avgResponseTime: 0,
            lastCheckTime: null,
            status: 'unknown'
          };
        }

        acc[provider].totalChecks++;
        if (check?.status === 'active') {
          acc[provider].successfulChecks++;
        }
        
        if (check?.response_time_ms) {
          acc[provider].avgResponseTime = 
            (acc?.[provider]?.avgResponseTime + check?.response_time_ms) / 2;
        }

        if (!acc?.[provider]?.lastCheckTime || check?.checked_at > acc?.[provider]?.lastCheckTime) {
          acc[provider].lastCheckTime = check?.checked_at;
          acc[provider].status = check?.status;
        }

        return acc;
      }, {});

      // Calculate success rates
      Object.keys(stats)?.forEach(provider => {
        stats[provider].successRate = stats?.[provider]?.totalChecks > 0 
          ? Math.round((stats?.[provider]?.successfulChecks / stats?.[provider]?.totalChecks) * 100)
          : 0;
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get provider statistics'
      };
    }
  }

  // Check if providers are properly configured
  async checkProviderConfiguration() {
    const config = {
      finnhub: !!this.providers?.finnhub?.apiKey,
      alphavantage: !!this.providers?.alphavantage?.apiKey,
      twelvedata: !!this.providers?.twelvedata?.apiKey
    };

    const configuredCount = Object.values(config)?.filter(Boolean)?.length;
    const totalProviders = Object.keys(config)?.length;

    return {
      success: true,
      data: {
        providers: config,
        configuredCount,
        totalProviders,
        completionPercentage: Math.round((configuredCount / totalProviders) * 100),
        isFullyConfigured: configuredCount === totalProviders,
        missingProviders: Object.keys(config)?.filter(key => !config?.[key])
      }
    };
  }
}

export const providerApiService = new ProviderApiService();
export default providerApiService;