import { connectionStabilityService } from './connectionStabilityService';
import networkRecoveryService from './networkRecoveryService';
import { googleFinanceService } from './googleFinanceService';
import { providerRouterService } from './providerRouterService';
import { supabase } from '../lib/supabase';

/**
 * Enhanced Market Data Service with robust error handling and fallback mechanisms
 * Integrated with Network Recovery Service to handle systematic "Failed to fetch" errors
 */
class EnhancedMarketDataService {
  constructor() {
    this.providerPriority = [
      'provider_router', // Backend provider router with failover
      'google_finance',  // Direct Google Finance
      'database',        // Database cache
      'mock'             // Last resort mock data
    ];
    
    this.defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    this.maxConcurrentRequests = 5;
    this.requestQueue = [];
    this.processingQueue = false;

    // Integration with network recovery service
    this.setupNetworkRecoveryIntegration();
  }

  setupNetworkRecoveryIntegration() {
    // Listen for network state changes
    window.addEventListener('networkStateChange', (event) => {
      const { state } = event?.detail;
      console.log(`📡 Network state changed to: ${state}`);
      
      if (state === 'online') {
        // Trigger automatic data refresh when network comes back
        this.handleNetworkRecovery();
      }
    });
  }

  async handleNetworkRecovery() {
    try {
      console.log('🔄 Network recovered - refreshing market data...');
      await this.getMarketData(this.defaultSymbols, { 
        enableCaching: false,
        enableFallback: true,
        preferredSource: 'auto'
      });
    } catch (error) {
      console.warn('Network recovery refresh failed:', error?.message);
    }
  }

  /**
   * Enhanced method to get market data with network recovery integration
   */
  async getMarketData(symbols = [], options = {}) {
    const {
      enableFallback = true,
      enableCaching = true,
      timeout = 15000,
      preferredSource = 'auto'
    } = options;

    // Sanitize and validate symbols
    let validSymbols = this.sanitizeSymbols(symbols);
    if (validSymbols?.length === 0) {
      validSymbols = [...this.defaultSymbols];
    }

    console.log(`📊 Enhanced market data request for ${validSymbols?.length} symbols`);

    // Check network state first
    const networkState = networkRecoveryService?.getNetworkState();
    if (networkState === 'offline') {
      console.log('📴 Network offline - using cached data only');
      return await this.handleOfflineDataRequest(validSymbols);
    }

    // Get system health to determine best strategy
    const healthStatus = await connectionStabilityService?.getSystemHealthStatus();
    const selectedProviders = this.selectOptimalProviders(healthStatus, preferredSource, networkState);

    let bestResult = null;
    let lastError = null;

    // Try providers in priority order with network recovery
    for (const provider of selectedProviders) {
      try {
        console.log(`🔄 Attempting data fetch from ${provider}...`);
        
        const result = await networkRecoveryService?.executeNetworkRequest(
          () => this.fetchFromProvider(provider, validSymbols, {
            timeout,
            enableFallback,
            enableCaching
          }),
          {
            maxRetries: provider === 'database' ? 1 : 3,
            enableFallback: true,
            priority: provider === 'provider_router' ? 'high' : 'normal',
            timeout: timeout,
            endpoint: provider
          }
        );

        if (result?.success && result?.data?.length > 0) {
          console.log(`✅ Successfully retrieved ${result?.data?.length} quotes from ${provider}`);
          return this.formatMarketDataResponse(result, provider, validSymbols);
        } else if (result?.data?.length > 0) {
          // Partial success - store as backup
          if (!bestResult || result?.data?.length > bestResult?.data?.length) {
            bestResult = result;
          }
        }

        lastError = result?.error || 'No data returned';
      } catch (error) {
        console.warn(`❌ Provider ${provider} failed:`, error?.message);
        lastError = error?.message;
        continue;
      }
    }

    // Return best partial result if available
    if (bestResult?.data?.length > 0) {
      console.log(`⚠️ Returning partial data from ${bestResult?.source}: ${bestResult?.data?.length} symbols`);
      return this.formatMarketDataResponse(bestResult, bestResult?.source, validSymbols, {
        warning: 'Partial data - some providers unavailable',
        missingSymbols: validSymbols?.length - bestResult?.data?.length
      });
    }

    // All providers failed - return enhanced emergency fallback
    console.error('🚨 All market data providers failed, returning emergency fallback');
    return this.createEnhancedEmergencyFallback(validSymbols, lastError);
  }

  async handleOfflineDataRequest(symbols) {
    console.log('💾 Handling offline data request...');
    
    try {
      // Try database first
      const dbResult = await this.fetchFromDatabase(symbols);
      if (dbResult?.success && dbResult?.data?.length > 0) {
        return this.formatMarketDataResponse(dbResult, 'database', symbols, {
          warning: 'Offline mode - using cached data',
          offlineMode: true
        });
      }
    } catch (error) {
      console.warn('Database fallback failed:', error?.message);
    }

    // Generate mock data for offline mode
    const mockResult = await this.generateMockData(symbols);
    return this.formatMarketDataResponse(mockResult, 'mock', symbols, {
      warning: 'Offline mode - displaying simulated data',
      offlineMode: true
    });
  }

  /**
   * Enhanced fetch from provider with network recovery
   */
  async fetchFromProvider(provider, symbols, options) {
    const fallbackOptions = {
      enableCachedData: true,
      enableMockData: provider === 'mock',
      symbols,
      dataType: 'quotes',
      timeout: options?.timeout
    };

    switch (provider) {
      case 'provider_router':
        return await this.fetchFromProviderRouterWithRecovery(symbols, fallbackOptions);

      case 'google_finance':
        return await this.fetchFromGoogleFinanceWithRecovery(symbols, fallbackOptions);

      case 'database':
        return await this.fetchFromDatabase(symbols);

      case 'mock':
        return await this.generateMockData(symbols);

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async fetchFromProviderRouterWithRecovery(symbols, fallbackOptions) {
    try {
      // Enhanced error handling with network diagnostics
      const networkDiagnostics = await networkRecoveryService?.getNetworkDiagnostics();
      
      if (networkDiagnostics?.networkState === 'critical') {
        console.log('🚨 Network in critical state - skipping provider router');
        throw new Error('Network in critical state');
      }

      const result = await providerRouterService?.getQuotes(symbols, {
        source: 'auto',
        market: 'US',
        asset: 'equity',
        timeout: fallbackOptions?.timeout
      });

      if (result?.success && result?.data?.length > 0) {
        return {
          success: true,
          data: result?.data?.map(quote => this.normalizeQuoteData(quote)),
          source: 'provider_router',
          metadata: { 
            ...result?.metadata, 
            networkState: networkDiagnostics?.networkState,
            networkMetrics: networkDiagnostics?.networkMetrics
          },
          timestamp: new Date()?.toISOString()
        };
      }

      throw new Error(result?.message || 'Provider router returned no data');
    } catch (error) {
      console.error('Provider router fetch failed:', error?.message);
      
      // Enhanced error logging with network context
      const networkState = networkRecoveryService?.getNetworkState();
      console.error('Network context:', { networkState, error: error?.message });
      
      throw new Error(`Provider router error (network: ${networkState}): ${error.message}`);
    }
  }

  async fetchFromGoogleFinanceWithRecovery(symbols, fallbackOptions) {
    try {
      const networkState = networkRecoveryService?.getNetworkState();
      
      if (networkState === 'critical') {
        console.log('🚨 Network critical - limiting Google Finance requests');
        symbols = symbols?.slice(0, 3); // Limit requests in critical state
      }

      const results = await Promise.allSettled(
        symbols?.slice(0, 10)?.map(symbol => // Limit concurrent requests
          networkRecoveryService?.executeNetworkRequest(
            () => googleFinanceService?.getRealTimeQuote(symbol),
            {
              maxRetries: networkState === 'healthy' ? 2 : 1,
              timeout: fallbackOptions?.timeout / 2, // Shorter timeout for individual requests
              endpoint: `google_finance_${symbol}`
            }
          )
        )
      );

      const successfulResults = results?.filter(result => result?.status === 'fulfilled' && result?.value?.success)?.map(result => this.normalizeQuoteData(result?.value?.data || result?.value));

      if (successfulResults?.length === 0) {
        throw new Error('Google Finance returned no successful quotes');
      }

      return {
        success: true,
        data: successfulResults,
        source: 'google_finance',
        timestamp: new Date()?.toISOString(),
        totalRequested: symbols?.length,
        totalReceived: successfulResults?.length,
        networkState: networkState
      };
    } catch (error) {
      console.error('Google Finance fetch failed:', error?.message);
      throw new Error(`Google Finance error: ${error.message}`);
    }
  }

  async fetchFromDatabase(symbols) {
    try {
      console.log('💾 Fetching from database cache...');
      
      const { data, error } = await supabase?.from('market_data')?.select(`
          *,
          asset:assets!inner(symbol, name, exchange, currency)
        `)?.in('asset.symbol', symbols)?.order('timestamp', { ascending: false })?.limit(symbols?.length);

      if (error) throw error;

      const processedData = data?.map(item => ({
        symbol: item?.asset?.symbol,
        current_price: item?.close_price,
        open_price: item?.open_price,
        high_price: item?.high_price,
        low_price: item?.low_price,
        change_percent: item?.change_percent,
        volume: item?.volume,
        timestamp: item?.timestamp,
        exchange: item?.asset?.exchange,
        currency: item?.asset?.currency,
        provider: 'database',
        last_updated: item?.timestamp,
        data_age_minutes: Math.round((Date.now() - new Date(item.timestamp || 0)?.getTime()) / 60000)
      })) || [];

      return {
        success: processedData?.length > 0,
        data: processedData,
        source: 'database',
        timestamp: new Date()?.toISOString(),
        fromCache: true,
        cacheHitRate: Math.round((processedData?.length / symbols?.length) * 100)
      };
    } catch (error) {
      console.error('Database fetch failed:', error?.message);
      throw new Error(`Database error: ${error?.message}`);
    }
  }

  async generateMockData(symbols) {
    console.log('🎭 Generating mock market data as fallback...');
    
    const mockData = symbols?.map(symbol => {
      const basePrice = 50 + Math.random() * 450; // $50-$500
      const dailyChange = (Math.random() - 0.5) * 0.1 * basePrice; // ±10% max change
      const currentPrice = basePrice + dailyChange;
      const changePercent = (dailyChange / basePrice) * 100;

      return {
        symbol,
        current_price: Number(currentPrice?.toFixed(2)),
        open_price: Number(basePrice?.toFixed(2)),
        high_price: Number((currentPrice * 1.03)?.toFixed(2)),
        low_price: Number((currentPrice * 0.97)?.toFixed(2)),
        change_percent: Number(changePercent?.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000) + 500000,
        timestamp: new Date()?.toISOString(),
        provider: 'mock',
        exchange: 'NASDAQ',
        currency: 'USD',
        isMockData: true,
        mockDataWarning: 'This is simulated data for demonstration purposes'
      };
    });

    return {
      success: true,
      data: mockData,
      source: 'mock',
      timestamp: new Date()?.toISOString(),
      isMockData: true
    };
  }

  /**
   * Enhanced provider selection with network state consideration
   */
  selectOptimalProviders(healthStatus, preferredSource, networkState) {
    let providers = [];

    if (preferredSource && preferredSource !== 'auto') {
      providers?.push(preferredSource);
    }

    // Adjust provider priority based on network state
    if (networkState === 'critical') {
      // In critical network state, prefer local/cached sources
      providers?.push('database', 'mock');
      
      // Add only healthy remote providers
      const healthyProviders = healthStatus?.providers
        ?.filter(p => p?.circuit_state !== 'OPEN' && p?.success_rate > 90)
        ?.sort((a, b) => b?.success_rate - a?.success_rate)
        ?.map(p => this.mapProviderName(p?.name));
      
      providers?.push(...healthyProviders);
    } else {
      // Normal provider selection
      const healthyProviders = healthStatus?.providers
        ?.filter(p => p?.circuit_state !== 'OPEN' && p?.success_rate > 70)
        ?.sort((a, b) => b?.success_rate - a?.success_rate)
        ?.map(p => this.mapProviderName(p?.name));

      providers?.push(...healthyProviders);

      // Add degraded providers as backup
      const degradedProviders = healthStatus?.providers
        ?.filter(p => p?.circuit_state !== 'OPEN' && p?.success_rate <= 70 && p?.success_rate > 0)
        ?.map(p => this.mapProviderName(p?.name));

      providers?.push(...degradedProviders);
      providers?.push('database', 'mock');
    }

    // Remove duplicates and filter out invalid providers
    return [...new Set(providers)]?.filter(p => this.providerPriority?.includes(p));
  }

  mapProviderName(healthProviderName) {
    const mapping = {
      'google_finance': 'google_finance',
      'yahoo_finance': 'provider_router',
      'finnhub': 'provider_router',
      'alpha_vantage': 'provider_router'
    };

    return mapping?.[healthProviderName] || 'provider_router';
  }

  normalizeQuoteData(quote) {
    // Handle different data structures from various providers
    return {
      symbol: quote?.symbol || quote?.ticker,
      current_price: Number(quote?.current_price || quote?.regularMarketPrice || quote?.price || 0),
      open_price: Number(quote?.open_price || quote?.open || quote?.regularMarketOpen || 0),
      high_price: Number(quote?.high_price || quote?.high || quote?.regularMarketDayHigh || 0),
      low_price: Number(quote?.low_price || quote?.low || quote?.regularMarketDayLow || 0),
      change_percent: Number(quote?.change_percent || quote?.regularMarketChangePercent || 0),
      volume: Number(quote?.volume || quote?.regularMarketVolume || 0),
      timestamp: quote?.timestamp || new Date()?.toISOString(),
      provider: quote?.provider || quote?.source || 'unknown',
      exchange: quote?.exchange || quote?.exchangeName || 'UNKNOWN',
      currency: quote?.currency || 'USD',
      last_updated: quote?.timestamp || new Date()?.toISOString()
    };
  }

  /**
   * Enhanced format response with network recovery context
   */
  formatMarketDataResponse(result, provider, requestedSymbols, additionalMetadata = {}) {
    const networkState = networkRecoveryService?.getNetworkState();
    
    const response = {
      success: true,
      data: result?.data || [],
      metadata: {
        provider,
        timestamp: new Date()?.toISOString(),
        symbols_requested: requestedSymbols?.length,
        symbols_returned: result?.data?.length || 0,
        data_source: provider,
        response_time_ms: result?.responseTime,
        cache_hit: provider === 'database',
        network_state: networkState,
        ...additionalMetadata
      }
    };

    // Add data quality indicators
    response.metadata.data_quality = this.assessDataQuality(result?.data);
    response.metadata.coverage_percentage = Math.round((response?.metadata?.symbols_returned / response?.metadata?.symbols_requested) * 100);

    // Add network-aware warnings
    if (networkState === 'offline') {
      response.warning = 'Offline mode - data may not be current';
    } else if (networkState === 'critical') {
      response.warning = 'Network issues detected - using best available data sources';
    } else if (result?.isMockData) {
      response.warning = 'Mock data is being displayed. Real market data providers are currently unavailable.';
    } else if (response?.metadata?.coverage_percentage < 100) {
      response.warning = `Partial data available (${response?.metadata?.coverage_percentage}% coverage). Some providers may be experiencing issues.`;
    }

    return response;
  }

  assessDataQuality(data) {
    if (!data?.length) return 'no_data';

    const qualityChecks = {
      hasPrices: data?.filter(d => d?.current_price > 0)?.length,
      hasVolume: data?.filter(d => d?.volume > 0)?.length,
      hasTimestamps: data?.filter(d => d?.timestamp)?.length,
      isFresh: data?.filter(d => {
        const age = Date.now() - new Date(d.timestamp || 0)?.getTime();
        return age < 3600000; // Less than 1 hour old
      })?.length
    };

    const totalItems = data?.length;
    const qualityScore = (
      (qualityChecks?.hasPrices / totalItems) * 0.4 +
      (qualityChecks?.hasVolume / totalItems) * 0.2 +
      (qualityChecks?.hasTimestamps / totalItems) * 0.2 +
      (qualityChecks?.isFresh / totalItems) * 0.2
    );

    if (qualityScore >= 0.9) return 'excellent';
    if (qualityScore >= 0.7) return 'good';
    if (qualityScore >= 0.5) return 'fair';
    return 'poor';
  }

  /**
   * Enhanced emergency fallback with network recovery insights
   */
  createEnhancedEmergencyFallback(symbols, lastError) {
    console.log('🆘 Creating enhanced emergency fallback response');
    
    const networkDiagnostics = networkRecoveryService?.getNetworkDiagnostics();
    
    return {
      success: false,
      data: [],
      error: 'Market data temporarily unavailable',
      metadata: {
        provider: 'emergency',
        timestamp: new Date()?.toISOString(),
        symbols_requested: symbols?.length,
        symbols_returned: 0,
        last_error: lastError,
        coverage_percentage: 0,
        data_quality: 'unavailable',
        network_state: networkDiagnostics?.networkState
      },
      emergency_info: {
        message: 'Market data services are currently experiencing issues',
        network_diagnostics: networkDiagnostics,
        suggested_actions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Services are being automatically monitored and will recover shortly',
          'Historical data may still be available in other sections'
        ],
        retry_in: '5 minutes',
        status_page: '/system-status'
      }
    };
  }

  sanitizeSymbols(symbols) {
    if (!Array.isArray(symbols)) {
      return typeof symbols === 'string' ? [symbols?.toUpperCase()?.trim()] : [];
    }

    return symbols?.filter(symbol => symbol && typeof symbol === 'string')?.map(symbol => symbol?.toUpperCase()?.trim())?.filter(symbol => /^[A-Z]{1,10}$/?.test(symbol)); // Basic symbol validation
  }

  /**
   * Enhanced system health dashboard with network recovery info
   */
  async getSystemHealthDashboard() {
    const healthStatus = await connectionStabilityService?.getSystemHealthStatus();
    const networkDiagnostics = await networkRecoveryService?.getNetworkDiagnostics();
    
    return {
      overall_status: this.determineOverallStatus(healthStatus, networkDiagnostics),
      providers: healthStatus?.providers?.map(provider => ({
        name: provider?.name,
        status: provider?.status,
        availability: provider?.circuit_state !== 'OPEN',
        success_rate: provider?.success_rate,
        last_error: provider?.last_error,
        has_fallback: provider?.has_cache
      })),
      network_status: {
        state: networkDiagnostics?.networkState,
        metrics: networkDiagnostics?.networkMetrics,
        browser_info: networkDiagnostics?.browserInfo
      },
      available_fallbacks: healthStatus?.available_fallbacks,
      degraded_services: healthStatus?.degraded_services,
      recommendations: this.generateEnhancedRecommendations(healthStatus, networkDiagnostics),
      last_updated: healthStatus?.last_updated
    };
  }

  determineOverallStatus(healthStatus, networkDiagnostics) {
    if (networkDiagnostics?.networkState === 'offline') {
      return 'offline';
    } else if (networkDiagnostics?.networkState === 'critical' || healthStatus?.overall_status === 'critical') {
      return 'critical';
    } else if (networkDiagnostics?.networkState === 'degraded' || healthStatus?.overall_status === 'degraded') {
      return 'degraded';
    }
    return 'healthy';
  }

  generateEnhancedRecommendations(healthStatus, networkDiagnostics) {
    const recommendations = [];

    if (networkDiagnostics?.networkState === 'offline') {
      recommendations?.push('You are currently offline. Using cached data where available.');
    } else if (networkDiagnostics?.networkState === 'critical') {
      recommendations?.push('Network connectivity is poor. Data may be limited or delayed.');
    }

    if (healthStatus?.overall_status === 'critical') {
      recommendations?.push('Multiple services are experiencing issues. Using cached data when available.');
    }

    if (healthStatus?.degraded_services?.length > 0) {
      recommendations?.push(`${healthStatus?.degraded_services?.length} services are degraded: ${healthStatus?.degraded_services?.join(', ')}`);
    }

    if (healthStatus?.available_fallbacks?.length > 0) {
      recommendations?.push('Fallback data sources are available to ensure continuity.');
    }

    if (recommendations?.length === 0) {
      recommendations?.push('All systems are operating normally.');
    }

    return recommendations;
  }

  /**
   * Enhanced manual refresh with network recovery
   */
  async refreshMarketData(symbols = [], options = {}) {
    console.log('🔄 Enhanced manual refresh requested for market data');
    
    // Force network health check
    await networkRecoveryService?.forceNetworkCheck();
    
    const result = await this.getMarketData(symbols, {
      ...options,
      enableCaching: false // Force fresh data
    });

    // Log refresh result with network context
    const networkState = networkRecoveryService?.getNetworkState();
    const logData = {
      action: 'manual_refresh',
      symbols_requested: symbols?.length,
      symbols_received: result?.data?.length || 0,
      success: result?.success || false,
      provider: result?.metadata?.provider,
      network_state: networkState,
      timestamp: new Date()?.toISOString()
    };

    console.log('📊 Enhanced manual refresh completed:', logData);

    return result;
  }
}

// Export singleton instance
export const enhancedMarketDataService = new EnhancedMarketDataService();