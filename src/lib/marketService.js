import { api, apiClient } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Market data service with tolerance for provider failures
export async function latest(symbol, provider = 'polygon_io') {
  try {
    const response = await api(`/market/latest?symbol=${encodeURIComponent(symbol)}&provider=${provider}`);
    
    if (!response?.ok) {
      return { 
        ok: false, 
        reason: response?.code || 'unknown', 
        detail: response?.msg || response,
        symbol,
        provider,
        timestamp: new Date()?.toISOString()
      };
    }
    
    return { 
      ok: true, 
      data: response?.data,
      symbol,
      provider,
      timestamp: new Date()?.toISOString()
    };
  } catch (error) {
    return { 
      ok: false, 
      reason: 'network', 
      detail: String(error?.message || error),
      symbol,
      provider,
      timestamp: new Date()?.toISOString()
    };
  }
}

// Enhanced market data service with multiple provider support
export class MarketDataService {
  constructor() {
    this.providers = ['polygon_io', 'alpha_vantage', 'yahoo_finance'];
    this.fallbackChain = ['polygon_io', 'alpha_vantage', 'yahoo_finance'];
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  // Get latest market data with automatic provider fallback
  async getLatestData(symbol, preferredProvider = 'polygon_io') {
    // Check cache first
    const cacheKey = `${symbol}-${preferredProvider}`;
    const cached = this.cache?.get(cacheKey);
    
    if (cached && (Date.now() - cached?.timestamp) < this.cacheTimeout) {
      return { ...cached?.data, cached: true };
    }

    // Try preferred provider first
    const preferredResult = await latest(symbol, preferredProvider);
    
    if (preferredResult?.ok) {
      this.cache?.set(cacheKey, { data: preferredResult, timestamp: Date.now() });
      return preferredResult;
    }

    // Fall back to other providers
    for (const provider of this.fallbackChain) {
      if (provider === preferredProvider) continue;
      
      console.warn(`Trying fallback provider: ${provider} for ${symbol}`);
      const fallbackResult = await latest(symbol, provider);
      
      if (fallbackResult?.ok) {
        this.cache?.set(cacheKey, { data: fallbackResult, timestamp: Date.now() });
        return { 
          ...fallbackResult, 
          fallback_used: true, 
          original_provider: preferredProvider 
        };
      }
    }

    // All providers failed - return structured error
    return {
      ok: false,
      reason: 'all_providers_failed',
      detail: 'All market data providers are currently unavailable',
      symbol,
      attempted_providers: [preferredProvider, ...this.fallbackChain],
      timestamp: new Date()?.toISOString()
    };
  }

  // Database ping function for diagnostics
  async dbPing() {
    try {
      if (!supabase) {
        return { 
          ok: false, 
          error: 'Supabase client not initialized - check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY' 
        };
      }

      // Try to ping a simple table - using a table that should exist
      const { error } = await supabase?.from('ai_agents')?.select('id')?.limit(1);

      if (error) {
        return { 
          ok: false, 
          error: String(error?.message || error),
          code: error?.code,
          details: error?.details
        };
      }

      return { ok: true, timestamp: new Date()?.toISOString() };
    } catch (error) {
      // Network/connection failures
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          ok: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.',
          network_error: true
        };
      }
      
      return { 
        ok: false, 
        error: `Database connection failed: ${String(error?.message || error)}`
      };
    }
  }

  // Enhanced diagnostic function
  async runFullDiagnostics() {
    const results = {
      timestamp: new Date()?.toISOString(),
      tests: []
    };

    // Test API connectivity
    try {
      const apiDiagnostics = await apiClient?.runDiagnostics();
      results?.tests?.push({
        name: 'API Connectivity',
        status: apiDiagnostics?.summary?.successful > 0 ? 'pass' : 'fail',
        details: apiDiagnostics
      });
    } catch (error) {
      results?.tests?.push({
        name: 'API Connectivity',
        status: 'fail',
        error: error?.message
      });
    }

    // Test database connectivity
    const dbTest = await this.dbPing();
    results?.tests?.push({
      name: 'Database Connectivity',
      status: dbTest?.ok ? 'pass' : 'fail',
      details: dbTest
    });

    // Test market data providers
    const testSymbol = 'AAPL';
    for (const provider of this.providers) {
      const providerTest = await latest(testSymbol, provider);
      results?.tests?.push({
        name: `Market Data Provider: ${provider}`,
        status: providerTest?.ok ? 'pass' : 'fail',
        details: providerTest
      });
    }

    // Calculate overall status
    const passedTests = results?.tests?.filter(t => t?.status === 'pass')?.length;
    const totalTests = results?.tests?.length;
    
    results.summary = {
      overall_status: passedTests === totalTests ? 'all_pass' : 
                     passedTests > 0 ? 'partial_pass' : 'all_fail',
      passed: passedTests,
      total: totalTests,
      pass_rate: Math.round((passedTests / totalTests) * 100)
    };

    return results;
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();

// Legacy compatibility exports
export { latest as getLatestMarketData };
export const marketData = {
  latest,
  service: marketDataService,
  dbPing: () => marketDataService?.dbPing(),
  runDiagnostics: () => marketDataService?.runFullDiagnostics()
};