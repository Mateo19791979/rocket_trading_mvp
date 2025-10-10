import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_MVP_API_BASE || 'http://localhost:8082';

class ProviderRouterService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/providers`;
    this.timeout = 10000;
  }

  // Get real-time quotes with automatic provider failover
  async getQuotes(symbols, options = {}) {
    try {
      const {
        asset = 'equity',
        market = 'US',
        source = 'auto'
      } = options;

      const symbolString = Array.isArray(symbols) ? symbols?.join(',') : symbols;
      
      const response = await axios?.get(`${this.baseURL}/quotes`, {
        params: {
          symbols: symbolString,
          asset,
          market,
          src: source
        },
        timeout: this.timeout
      });

      return {
        success: true,
        data: response?.data?.quotes || [],
        metadata: {
          symbols_requested: response?.data?.symbols_requested || 0,
          symbols_successful: response?.data?.symbols_successful || 0,
          timestamp: response?.data?.timestamp,
          provider_sources: this.extractProviderSources(response?.data?.quotes)
        }
      };

    } catch (error) {
      return this.handleError(error, 'Failed to fetch quotes');
    }
  }

  // Get historical data with provider fallback
  async getHistoricalData(symbol, options = {}) {
    try {
      const {
        range = '1d',
        asset = 'equity',
        source = 'auto'
      } = options;

      const response = await axios?.get(`${this.baseURL}/history`, {
        params: {
          symbol,
          range,
          asset,
          src: source
        },
        timeout: this.timeout
      });

      return {
        success: true,
        data: response?.data?.data || [],
        metadata: {
          symbol: response?.data?.symbol,
          range: response?.data?.range,
          provider_used: response?.data?.provider_used,
          latency_ms: response?.data?.latency_ms,
          timestamp: response?.data?.timestamp
        }
      };

    } catch (error) {
      return this.handleError(error, 'Failed to fetch historical data');
    }
  }

  // Get provider health and statistics
  async getProviderHealth() {
    try {
      const response = await axios?.get(`${this.baseURL}/health`, {
        timeout: this.timeout
      });

      return {
        success: true,
        data: {
          overall_status: response?.data?.overall_status,
          providers: response?.data?.providers || [],
          timestamp: response?.data?.timestamp
        }
      };

    } catch (error) {
      return this.handleError(error, 'Failed to fetch provider health');
    }
  }

  // Get provider configuration
  async getProviderConfig() {
    try {
      const response = await axios?.get(`${this.baseURL}/config`, {
        timeout: this.timeout
      });

      return {
        success: true,
        data: {
          providers: response?.data?.providers || [],
          circuit_breaker: response?.data?.circuit_breaker,
          cache: response?.data?.cache,
          timestamp: response?.data?.timestamp
        }
      };

    } catch (error) {
      return this.handleError(error, 'Failed to fetch provider config');
    }
  }

  // Test specific provider
  async testProvider(providerName, symbol = 'AAPL') {
    try {
      const response = await axios?.post(`${this.baseURL}/test`, {
        provider_name: providerName,
        symbol
      }, {
        timeout: this.timeout
      });

      return {
        success: response?.data?.success,
        data: {
          provider_name: response?.data?.provider_name,
          symbol: response?.data?.symbol,
          test_result: response?.data?.test_result,
          response_time_ms: response?.data?.response_time_ms,
          data: response?.data?.data,
          provider_used: response?.data?.provider_used,
          error: response?.data?.error,
          timestamp: response?.data?.timestamp
        }
      };

    } catch (error) {
      return this.handleError(error, 'Failed to test provider');
    }
  }

  // Get system status including provider router
  async getSystemStatus() {
    try {
      const response = await axios?.get(`${API_BASE_URL}/status`, {
        timeout: this.timeout
      });

      return {
        success: true,
        data: response?.data
      };

    } catch (error) {
      return this.handleError(error, 'Failed to fetch system status');
    }
  }

  // Utility: Extract provider sources from quotes response
  extractProviderSources(quotes = []) {
    const sources = quotes?.reduce((acc, quote) => {
      if (quote?.provider_used && quote?.provider_used !== 'none') {
        acc[quote.provider_used] = (acc?.[quote?.provider_used] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(sources)?.map(([provider, count]) => ({
      provider,
      symbols_count: count
    }));
  }

  // Utility: Format provider health data for display
  formatHealthData(healthData) {
    return healthData?.providers?.map(provider => ({
      ...provider,
      status_color: this.getStatusColor(provider),
      performance_score: this.calculatePerformanceScore(provider)
    })) || [];
  }

  // Utility: Get status color based on provider state
  getStatusColor(provider) {
    if (!provider?.enabled) return 'gray';
    if (provider?.circuit_breaker_state === 'OPEN') return 'red';
    if (provider?.circuit_breaker_state === 'HALF_OPEN') return 'yellow';
    if (provider?.health_status === 'healthy' && parseFloat(provider?.success_rate) > 90) return 'green';
    if (parseFloat(provider?.success_rate) > 70) return 'yellow';
    return 'red';
  }

  // Utility: Calculate performance score
  calculatePerformanceScore(provider) {
    if (!provider?.enabled) return 0;
    
    const successRate = parseFloat(provider?.success_rate) || 0;
    const latencyScore = Math.max(0, 100 - (provider?.avg_latency_ms / 50)); // 50ms = 100 points
    const circuitBreakerPenalty = provider?.circuit_breaker_state === 'OPEN' ? -50 : 0;
    
    return Math.max(0, Math.round((successRate + latencyScore) / 2 + circuitBreakerPenalty));
  }

  // Error handling
  handleError(error, defaultMessage) {
    console.error('Provider Router Service Error:', error);
    
    const errorResponse = {
      success: false,
      error: error?.response?.data?.error || 'unknown_error',
      message: error?.response?.data?.message || error?.message || defaultMessage,
      timestamp: new Date()?.toISOString()
    };

    // Add specific error details for debugging
    if (error?.response) {
      errorResponse.status = error?.response?.status;
      errorResponse.statusText = error?.response?.statusText;
    }

    if (error?.code === 'ECONNABORTED') {
      errorResponse.message = 'Request timeout - provider router may be unavailable';
    }

    return errorResponse;
  }
}

export const providerRouterService = new ProviderRouterService();