import { supabase } from '../lib/supabase';

/**
 * Service to handle systematic connection failures and provide stable fallbacks
 * Addresses: TypeError: Failed to fetch and other network-related errors
 */
class ConnectionStabilityService {
  constructor() {
    this.circuitBreakers = new Map();
    this.providerHealthCache = new Map();
    this.fallbackDataCache = new Map();
    this.retryQueue = [];
    this.maxRetries = 3;
    this.circuitBreakerThreshold = 5; // failures before opening circuit
    this.circuitBreakerTimeout = 300000; // 5 minutes
    this.healthCheckInterval = null;

    // Initialize service
    this.initializeService();
  }

  async initializeService() {
    console.log('🔧 Initializing Connection Stability Service...');
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Load cached fallback data
    await this.loadFallbackCache();
    
    // Initialize circuit breakers for known providers
    const providers = ['google_finance', 'yahoo_finance', 'finnhub', 'alpha_vantage', 'ibkr'];
    providers?.forEach(provider => {
      this.circuitBreakers?.set(provider, {
        state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
        failures: 0,
        lastFailureTime: null,
        successCount: 0,
        totalRequests: 0
      });
    });
  }

  /**
   * Enhanced request wrapper with circuit breaker and fallback logic
   */
  async executeWithStability(providerName, requestFn, fallbackOptions = {}) {
    const circuitBreaker = this.circuitBreakers?.get(providerName) || this.createCircuitBreaker(providerName);
    
    // Check circuit breaker state
    if (circuitBreaker?.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - circuitBreaker?.lastFailureTime;
      
      if (timeSinceLastFailure < this.circuitBreakerTimeout) {
        console.warn(`🚫 Circuit breaker OPEN for ${providerName}, using fallback`);
        return await this.handleCircuitBreakerOpen(providerName, fallbackOptions);
      } else {
        // Transition to HALF_OPEN state
        circuitBreaker.state = 'HALF_OPEN';
        circuitBreaker.successCount = 0;
        console.log(`🔄 Circuit breaker HALF_OPEN for ${providerName}, attempting recovery`);
      }
    }

    // Execute request with enhanced error handling
    try {
      circuitBreaker.totalRequests++;
      
      const result = await Promise.race([
        requestFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), fallbackOptions.timeout || 10000)
        )
      ]);

      // Request successful
      await this.handleRequestSuccess(providerName, result);
      return result;

    } catch (error) {
      // Request failed
      return await this.handleRequestFailure(providerName, error, fallbackOptions, requestFn);
    }
  }

  async handleRequestSuccess(providerName, result) {
    const circuitBreaker = this.circuitBreakers?.get(providerName);
    
    if (circuitBreaker?.state === 'HALF_OPEN') {
      circuitBreaker.successCount++;
      
      // If enough successes, close the circuit
      if (circuitBreaker?.successCount >= 2) {
        circuitBreaker.state = 'CLOSED';
        circuitBreaker.failures = 0;
        console.log(`✅ Circuit breaker CLOSED for ${providerName} - service recovered`);
        
        // Update health status
        await this.updateProviderHealth(providerName, 'healthy', null);
      }
    } else if (circuitBreaker?.state === 'CLOSED') {
      // Reset failure count on success
      circuitBreaker.failures = Math.max(0, circuitBreaker?.failures - 1);
    }

    // Cache successful data for future fallback
    if (result?.data) {
      this.cacheSuccessfulData(providerName, result?.data);
    }
  }

  async handleRequestFailure(providerName, error, fallbackOptions, originalRequestFn) {
    const circuitBreaker = this.circuitBreakers?.get(providerName);
    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = Date.now();

    // Log detailed error information
    console.error(`❌ Request failed for ${providerName}:`, {
      error: error?.message,
      code: error?.code,
      status: error?.response?.status,
      failures: circuitBreaker?.failures,
      circuitState: circuitBreaker?.state
    });

    // Update provider health
    await this.updateProviderHealth(providerName, 'degraded', error?.message);

    // Open circuit breaker if threshold exceeded
    if (circuitBreaker?.failures >= this.circuitBreakerThreshold) {
      circuitBreaker.state = 'OPEN';
      console.warn(`🔴 Circuit breaker OPEN for ${providerName} after ${circuitBreaker?.failures} failures`);
      
      await this.updateProviderHealth(providerName, 'unhealthy', `Circuit breaker opened: ${error?.message}`);
    }

    // Attempt retry with exponential backoff (if configured)
    if (fallbackOptions?.enableRetry && circuitBreaker?.failures <= this.maxRetries) {
      const retryDelay = this.calculateRetryDelay(circuitBreaker?.failures);
      console.log(`🔄 Retrying ${providerName} in ${retryDelay}ms (attempt ${circuitBreaker?.failures}/${this.maxRetries})`);
      
      await this.delay(retryDelay);
      return await this.executeWithStability(providerName, originalRequestFn, { ...fallbackOptions, enableRetry: false });
    }

    // Return fallback data or error
    return await this.provideFallbackResponse(providerName, error, fallbackOptions);
  }

  async handleCircuitBreakerOpen(providerName, fallbackOptions) {
    console.log(`⚠️ Circuit breaker open for ${providerName}, providing fallback response`);
    
    return await this.provideFallbackResponse(providerName, 
      new Error('Service temporarily unavailable'), 
      fallbackOptions
    );
  }

  async provideFallbackResponse(providerName, originalError, fallbackOptions) {
    const { 
      enableCachedData = true, 
      enableMockData = true, 
      symbols = [], 
      dataType = 'quotes' 
    } = fallbackOptions;

    // Try cached data first
    if (enableCachedData) {
      const cachedData = await this.getCachedFallbackData(providerName, dataType, symbols);
      if (cachedData?.length > 0) {
        console.log(`📋 Using cached fallback data for ${providerName}: ${cachedData?.length} items`);
        return {
          success: true,
          data: cachedData,
          source: 'fallback_cache',
          warning: `Using cached data due to ${providerName} unavailability`,
          originalError: originalError?.message
        };
      }
    }

    // Try database fallback
    if (symbols?.length > 0) {
      try {
        const dbData = await this.getDatabaseFallbackData(symbols, dataType);
        if (dbData?.length > 0) {
          console.log(`💾 Using database fallback data: ${dbData?.length} items`);
          return {
            success: true,
            data: dbData,
            source: 'database_fallback',
            warning: `Using database data due to ${providerName} unavailability`,
            originalError: originalError?.message
          };
        }
      } catch (dbError) {
        console.warn('Database fallback failed:', dbError?.message);
      }
    }

    // Generate mock data as last resort
    if (enableMockData && symbols?.length > 0) {
      console.log(`🎭 Generating mock fallback data for ${symbols?.length} symbols`);
      const mockData = this.generateMockFallbackData(symbols, dataType);
      return {
        success: true,
        data: mockData,
        source: 'mock_fallback',
        warning: `Using mock data due to ${providerName} unavailability`,
        originalError: originalError?.message
      };
    }

    // No fallback available - return structured error
    return {
      success: false,
      data: [],
      error: originalError?.message || 'Service unavailable',
      source: 'error',
      circuitBreakerOpen: this.circuitBreakers?.get(providerName)?.state === 'OPEN',
      suggestedActions: [
        'Check internet connection',
        'Try refreshing the page',
        `Service ${providerName} may be temporarily unavailable`,
        'Data will be automatically retried in background'
      ]
    };
  }

  async getCachedFallbackData(providerName, dataType, symbols) {
    const cacheKey = `${providerName}_${dataType}_${symbols?.join(',') || 'all'}`;
    const cached = this.fallbackDataCache?.get(cacheKey);
    
    if (cached && (Date.now() - cached?.timestamp) < 3600000) { // 1 hour cache
      return cached?.data;
    }
    
    return null;
  }

  async getDatabaseFallbackData(symbols, dataType) {
    if (dataType === 'quotes') {
      const { data, error } = await supabase?.from('market_data')?.select(`
          *,
          asset:assets!inner(symbol, name, exchange)
        `)?.in('asset.symbol', symbols)?.order('timestamp', { ascending: false })?.limit(symbols?.length);

      if (error) throw error;

      return data?.map(item => ({
        symbol: item?.asset?.symbol,
        current_price: item?.close_price,
        open_price: item?.open_price,
        high_price: item?.high_price,
        low_price: item?.low_price,
        change_percent: item?.change_percent,
        volume: item?.volume,
        timestamp: item?.timestamp,
        provider: 'database_fallback'
      }));
    }

    return [];
  }

  generateMockFallbackData(symbols, dataType) {
    if (dataType === 'quotes') {
      return symbols?.map(symbol => {
        const basePrice = 100 + Math.random() * 400;
        const change = (Math.random() - 0.5) * 0.05 * basePrice;
        const changePercent = (change / basePrice) * 100;
        
        return {
          symbol,
          current_price: Number((basePrice + change)?.toFixed(2)),
          open_price: Number(basePrice?.toFixed(2)),
          high_price: Number((basePrice * 1.02)?.toFixed(2)),
          low_price: Number((basePrice * 0.98)?.toFixed(2)),
          change_percent: Number(changePercent?.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000) + 100000,
          timestamp: new Date()?.toISOString(),
          provider: 'mock_fallback',
          isMockData: true
        };
      });
    }

    return [];
  }

  cacheSuccessfulData(providerName, data) {
    if (!Array.isArray(data) || data?.length === 0) return;

    // Determine cache key based on data structure
    const symbols = data?.map(item => item?.symbol)?.filter(Boolean) || ['general'];
    const cacheKey = `${providerName}_quotes_${symbols?.join(',')}`;
    
    this.fallbackDataCache?.set(cacheKey, {
      data: data,
      timestamp: Date.now(),
      provider: providerName
    });

    // Limit cache size
    if (this.fallbackDataCache?.size > 100) {
      const oldestKey = Array.from(this.fallbackDataCache?.keys())?.[0];
      this.fallbackDataCache?.delete(oldestKey);
    }
  }

  async updateProviderHealth(providerName, status, errorMessage) {
    try {
      const healthData = {
        provider_name: providerName,
        status,
        last_check: new Date()?.toISOString(),
        error_message: errorMessage,
        circuit_breaker_state: this.circuitBreakers?.get(providerName)?.state,
        failure_count: this.circuitBreakers?.get(providerName)?.failures || 0
      };

      // Cache health status
      this.providerHealthCache?.set(providerName, healthData);

      // Update database if available
      await supabase?.from('provider_health_status')?.upsert(healthData);
    } catch (error) {
      console.warn('Failed to update provider health:', error?.message);
    }
  }

  async getSystemHealthStatus() {
    const healthStatus = {
      overall_status: 'healthy',
      providers: [],
      degraded_services: [],
      available_fallbacks: [],
      last_updated: new Date()?.toISOString()
    };

    // Check each provider
    for (const [providerName, circuitBreaker] of this.circuitBreakers) {
      const health = this.providerHealthCache?.get(providerName) || {
        provider_name: providerName,
        status: 'unknown',
        last_check: null
      };

      const providerHealth = {
        name: providerName,
        status: health?.status,
        circuit_state: circuitBreaker?.state,
        failures: circuitBreaker?.failures,
        success_rate: this.calculateSuccessRate(circuitBreaker),
        last_error: health?.error_message,
        has_cache: this.hasCachedData(providerName)
      };

      healthStatus?.providers?.push(providerHealth);

      // Check overall system health
      if (circuitBreaker?.state === 'OPEN') {
        healthStatus?.degraded_services?.push(providerName);
        if (healthStatus?.overall_status === 'healthy') {
          healthStatus.overall_status = 'degraded';
        }
      }

      if (this.hasCachedData(providerName)) {
        healthStatus?.available_fallbacks?.push(providerName);
      }
    }

    // Determine overall status
    if (healthStatus?.degraded_services?.length >= healthStatus?.providers?.length / 2) {
      healthStatus.overall_status = 'critical';
    }

    return healthStatus;
  }

  calculateSuccessRate(circuitBreaker) {
    const total = circuitBreaker?.totalRequests || 1;
    const successes = total - circuitBreaker?.failures;
    return Math.round((successes / total) * 100);
  }

  hasCachedData(providerName) {
    for (const [key] of this.fallbackDataCache) {
      if (key?.startsWith(providerName)) {
        return true;
      }
    }
    return false;
  }

  async loadFallbackCache() {
    try {
      // Load recent successful data from database to populate cache
      const { data, error } = await supabase?.from('market_data')?.select(`
          *,
          asset:assets!inner(symbol)
        `)?.order('timestamp', { ascending: false })?.limit(50);

      if (!error && data?.length > 0) {
        // Group by provider and cache
        const groupedByProvider = {};
        data?.forEach(item => {
          const provider = item?.api_provider || 'database';
          if (!groupedByProvider?.[provider]) {
            groupedByProvider[provider] = [];
          }
          
          groupedByProvider?.[provider]?.push({
            symbol: item?.asset?.symbol,
            current_price: item?.close_price,
            open_price: item?.open_price,
            high_price: item?.high_price,
            low_price: item?.low_price,
            change_percent: item?.change_percent,
            volume: item?.volume,
            timestamp: item?.timestamp,
            provider: provider
          });
        });

        // Cache the grouped data
        Object.entries(groupedByProvider)?.forEach(([provider, providerData]) => {
          this.cacheSuccessfulData(provider, providerData);
        });

        console.log(`📋 Loaded fallback cache with ${data?.length} records from ${Object.keys(groupedByProvider)?.length} providers`);
      }
    } catch (error) {
      console.warn('Failed to load fallback cache:', error?.message);
    }
  }

  startHealthMonitoring() {
    // Clear existing interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Start monitoring every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        console.warn('Health check failed:', error?.message);
      }
    }, 300000); // 5 minutes

    console.log('🏥 Health monitoring started');
  }

  async performHealthChecks() {
    console.log('🔍 Performing provider health checks...');

    for (const providerName of this.circuitBreakers?.keys()) {
      const circuitBreaker = this.circuitBreakers?.get(providerName);
      
      // Skip if circuit is closed and healthy
      if (circuitBreaker?.state === 'CLOSED' && circuitBreaker?.failures === 0) {
        continue;
      }

      // Attempt lightweight health check for degraded services
      try {
        await this.performLightweightHealthCheck(providerName);
      } catch (error) {
        console.warn(`Health check failed for ${providerName}:`, error?.message);
      }
    }
  }

  async performLightweightHealthCheck(providerName) {
    // Implement lightweight checks based on provider type
    // This is a placeholder - actual implementation would depend on provider APIs
    
    const testSymbol = 'AAPL';
    const timeout = 5000;
    
    try {
      // This would be replaced with actual provider-specific health check
      const response = await fetch(`https://api.example.com/health`, { 
        method: 'GET',
        timeout 
      });
      
      if (response?.ok) {
        await this.updateProviderHealth(providerName, 'healthy', null);
        
        // Reset circuit breaker if health check passes
        const circuitBreaker = this.circuitBreakers?.get(providerName);
        if (circuitBreaker?.state === 'OPEN') {
          circuitBreaker.state = 'HALF_OPEN';
          circuitBreaker.successCount = 0;
        }
      }
    } catch (error) {
      await this.updateProviderHealth(providerName, 'unhealthy', error?.message);
    }
  }

  createCircuitBreaker(providerName) {
    const circuitBreaker = {
      state: 'CLOSED',
      failures: 0,
      lastFailureTime: null,
      successCount: 0,
      totalRequests: 0
    };
    
    this.circuitBreakers?.set(providerName, circuitBreaker);
    return circuitBreaker;
  }

  calculateRetryDelay(attempt) {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const exponential = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const jitter = Math.random() * 0.1 * exponential; // 10% jitter
    
    return Math.floor(exponential + jitter);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for integration with other services
  async executeStableRequest(providerName, requestFn, options = {}) {
    return await this.executeWithStability(providerName, requestFn, options);
  }

  getProviderHealth(providerName) {
    return this.providerHealthCache?.get(providerName);
  }

  isProviderAvailable(providerName) {
    const circuitBreaker = this.circuitBreakers?.get(providerName);
    return circuitBreaker?.state !== 'OPEN';
  }

  // Cleanup method
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.circuitBreakers?.clear();
    this.providerHealthCache?.clear();
    this.fallbackDataCache?.clear();
  }
}

// Singleton export
export const connectionStabilityService = new ConnectionStabilityService();