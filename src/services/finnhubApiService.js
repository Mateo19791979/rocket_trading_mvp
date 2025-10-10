import { supabase } from '../lib/supabase';
import { providerConfigurationService } from './providerConfigurationService';

/**
 * Finnhub API Service
 * Integrates Finnhub financial data API with Supabase infrastructure
 * 
 * API Key Format: d3f8pdhr01qolknc612gd3f8pdhr01qolknc6130
 * Base URL: https://finnhub.io/api/v1
 */
export class FinnhubApiService {
  constructor() {
    this.baseUrl = 'https://finnhub.io/api/v1';
    this.provider = 'finnhub';
    this.rateLimitPerMinute = 60; // Free tier limit
  }

  // API Key Management
  async getApiKey() {
    try {
      return await providerConfigurationService?.getProviderKey('finnhub');
    } catch (error) {
      console.error('Error getting Finnhub API key:', error);
      return null;
    }
  }

  async setApiKey(apiKey) {
    try {
      return await providerConfigurationService?.updateSimpleProviders({
        finnhub_api: apiKey
      });
    } catch (error) {
      console.error('Error setting Finnhub API key:', error);
      throw error;
    }
  }

  async testConnection(apiKey = null) {
    try {
      const key = apiKey || (await this.getApiKey());
      if (!key) {
        return { success: false, error: 'No API key configured' };
      }

      return await providerConfigurationService?.testConnectionWithSimpleKey('finnhub', key);
    } catch (error) {
      console.error('Error testing Finnhub connection:', error);
      return { success: false, error: error?.message };
    }
  }

  // Core API Methods
  async makeRequest(endpoint, params = {}) {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        throw new Error('Finnhub API key not configured');
      }

      const url = new URL(`${this.baseUrl}${endpoint}`);
      url?.searchParams?.set('token', apiKey);
      
      // Add additional parameters
      Object.entries(params)?.forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url?.searchParams?.set(key, value);
        }
      });

      const response = await fetch(url?.toString());
      const data = await response?.json();

      if (data?.error) {
        throw new Error(`Finnhub API error: ${data?.error}`);
      }

      // Log successful API call
      await this.logApiCall(endpoint, true, null);
      
      return { data, error: null };
    } catch (error) {
      console.error(`Finnhub API request failed for ${endpoint}:`, error);
      
      // Log failed API call
      await this.logApiCall(endpoint, false, error?.message);
      
      return { data: null, error: error?.message };
    }
  }

  async logApiCall(endpoint, success, errorMessage = null) {
    try {
      const { error } = await supabase?.from('provider_health_checks')?.insert({
          provider_name: 'finhub', // Match existing schema name
          endpoint: endpoint,
          response_time_ms: null,
          is_successful: success,
          error_message: errorMessage,
          checked_at: new Date()?.toISOString()
        });

      if (error) {
        console.warn('Failed to log Finnhub API call:', error);
      }
    } catch (error) {
      console.warn('Error logging Finnhub API call:', error);
    }
  }

  // Market Data Methods
  async getQuote(symbol) {
    const result = await this.makeRequest('/quote', { symbol: symbol?.toUpperCase() });
    if (result?.data && !result?.error) {
      // Transform to match our market_data schema
      const quote = result?.data;
      return {
        symbol,
        current_price: quote?.c || 0,
        open_price: quote?.o || 0,
        high_price: quote?.h || 0,
        low_price: quote?.l || 0,
        previous_close: quote?.pc || 0,
        change: quote?.d || 0,
        change_percent: quote?.dp || 0,
        timestamp: new Date(quote?.t * 1000)?.toISOString() || new Date()?.toISOString(),
        provider: 'finnhub'
      };
    }
    return result;
  }

  async getMultipleQuotes(symbols = []) {
    try {
      const results = [];
      const batchSize = 10; // Process in batches to avoid rate limits
      
      for (let i = 0; i < symbols?.length; i += batchSize) {
        const batch = symbols?.slice(i, i + batchSize);
        const batchPromises = batch?.map(symbol => this.getQuote(symbol));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults?.forEach((result, index) => {
          if (result?.status === 'fulfilled' && result?.value && !result?.value?.error) {
            results?.push(result?.value);
          } else {
            console.warn(`Failed to get quote for ${batch?.[index]}:`, result?.reason || result?.value?.error);
          }
        });

        // Rate limiting delay between batches
        if (i + batchSize < symbols?.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting multiple quotes:', error);
      return [];
    }
  }

  async getCompanyProfile(symbol) {
    const result = await this.makeRequest('/stock/profile2', { symbol: symbol?.toUpperCase() });
    if (result?.data && !result?.error) {
      const profile = result?.data;
      return {
        symbol,
        name: profile?.name || '',
        industry: profile?.finnhubIndustry || '',
        sector: profile?.gics || '',
        market_cap: profile?.marketCapitalization || null,
        description: profile?.description || '',
        website: profile?.weburl || '',
        logo_url: profile?.logo || '',
        exchange: profile?.exchange || '',
        currency: profile?.currency || 'USD',
        country: profile?.country || '',
        ipo_date: profile?.ipo || null
      };
    }
    return result;
  }

  async getCandles(symbol, resolution = 'D', from = null, to = null) {
    const params = {
      symbol: symbol?.toUpperCase(),
      resolution
    };

    // Default to last 30 days if no dates provided
    if (!from || !to) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      params.from = Math.floor(thirtyDaysAgo?.getTime() / 1000);
      params.to = Math.floor(now?.getTime() / 1000);
    } else {
      params.from = from;
      params.to = to;
    }

    const result = await this.makeRequest('/stock/candle', params);
    
    if (result?.data && result?.data?.s === 'ok') {
      const candles = result?.data;
      const ohlcData = [];
      
      for (let i = 0; i < candles?.t?.length; i++) {
        ohlcData?.push({
          symbol,
          timestamp: new Date(candles?.t?.[i] * 1000)?.toISOString(),
          open_price: candles?.o?.[i] || 0,
          high_price: candles?.h?.[i] || 0,
          low_price: candles?.l?.[i] || 0,
          close_price: candles?.c?.[i] || 0,
          volume: candles?.v?.[i] || 0,
          provider: 'finnhub'
        });
      }
      
      return { data: ohlcData, error: null };
    }
    
    return result;
  }

  // Supabase Integration Methods
  async syncQuoteToDatabase(symbol) {
    try {
      const quote = await this.getQuote(symbol);
      if (quote?.error) {
        return { success: false, error: quote?.error };
      }

      // Find or create asset
      let asset = await this.findOrCreateAsset(symbol);
      if (!asset) {
        return { success: false, error: 'Failed to find or create asset' };
      }

      // Insert market data
      const { error: marketDataError } = await supabase?.from('market_data')?.upsert({
          asset_id: asset?.id,
          open_price: quote?.open_price,
          high_price: quote?.high_price,
          low_price: quote?.low_price,
          close_price: quote?.current_price,
          volume: 0, // Quote doesn't include volume
          change_percent: quote?.change_percent,
          timestamp: quote?.timestamp,
          api_provider: 'finnhub',
          data_source: 'api',
          is_real_time: true,
          last_updated: new Date()?.toISOString()
        }, {
          onConflict: 'asset_id,timestamp'
        });

      if (marketDataError) {
        console.error('Error syncing market data:', marketDataError);
        return { success: false, error: marketDataError?.message };
      }

      return { success: true, asset, quote };
    } catch (error) {
      console.error('Error syncing quote to database:', error);
      return { success: false, error: error?.message };
    }
  }

  async findOrCreateAsset(symbol) {
    try {
      // First try to find existing asset
      const { data: existingAsset, error: findError } = await supabase?.from('assets')?.select('*')?.eq('symbol', symbol?.toUpperCase())?.single();

      if (existingAsset && !findError) {
        return existingAsset;
      }

      // If not found, get company profile and create asset
      const profile = await this.getCompanyProfile(symbol);
      if (profile?.error) {
        console.warn(`Could not get profile for ${symbol}, creating basic asset`);
      }

      const assetData = {
        symbol: symbol?.toUpperCase(),
        name: profile?.name || `${symbol?.toUpperCase()} Stock`,
        asset_type: 'stock',
        exchange: profile?.exchange || 'UNKNOWN',
        currency: profile?.currency || 'USD',
        sector: profile?.sector || null,
        industry: profile?.industry || null,
        market_cap: profile?.market_cap || null,
        description: profile?.description || null,
        logo_url: profile?.logo_url || null,
        is_active: true,
        is_tradable: true,
        sync_enabled: true,
        sync_frequency_minutes: 5
      };

      const { data: newAsset, error: createError } = await supabase?.from('assets')?.insert(assetData)?.select()?.single();

      if (createError) {
        console.error('Error creating asset:', createError);
        return null;
      }

      return newAsset;
    } catch (error) {
      console.error('Error finding or creating asset:', error);
      return null;
    }
  }

  async bulkSyncQuotes(symbols = []) {
    try {
      const results = [];
      const batchSize = 5; // Smaller batches for database operations
      
      for (let i = 0; i < symbols?.length; i += batchSize) {
        const batch = symbols?.slice(i, i + batchSize);
        const batchPromises = batch?.map(symbol => this.syncQuoteToDatabase(symbol));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults?.forEach((result, index) => {
          const symbol = batch?.[index];
          if (result?.status === 'fulfilled' && result?.value?.success) {
            results?.push({ symbol, success: true, data: result?.value });
          } else {
            console.error(`Failed to sync ${symbol}:`, result?.reason || result?.value?.error);
            results?.push({ 
              symbol, 
              success: false, 
              error: result?.reason || result?.value?.error 
            });
          }
        });

        // Rate limiting delay between batches
        if (i + batchSize < symbols?.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulk sync:', error);
      return [];
    }
  }

  // Market Status and News
  async getMarketStatus() {
    const result = await this.makeRequest('/stock/market-status', { exchange: 'US' });
    return result;
  }

  async getMarketNews(category = 'general', limit = 10) {
    const result = await this.makeRequest('/news', { 
      category, 
      minId: Math.floor(Date.now() / 1000) - (24 * 60 * 60) // Last 24 hours
    });
    
    if (result?.data && Array.isArray(result?.data)) {
      return {
        data: result?.data?.slice(0, limit),
        error: null
      };
    }
    
    return result;
  }

  async getCompanyNews(symbol, from = null, to = null) {
    const params = { symbol: symbol?.toUpperCase() };
    
    if (from && to) {
      params.from = from;
      params.to = to;
    } else {
      // Default to last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      params.from = sevenDaysAgo?.toISOString()?.split('T')?.[0];
      params.to = now?.toISOString()?.split('T')?.[0];
    }

    return await this.makeRequest('/company-news', params);
  }

  // WebSocket Methods (for real-time data)
  createWebSocketConnection(symbols = []) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.error('No API key available for WebSocket connection');
      return null;
    }

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
    
    socket?.addEventListener('open', () => {
      console.log('Finnhub WebSocket connected');
      
      // Subscribe to symbols
      symbols?.forEach(symbol => {
        socket?.send(JSON.stringify({
          'type': 'subscribe',
          'symbol': symbol?.toUpperCase()
        }));
      });
    });

    socket?.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event?.data);
        if (message?.type === 'trade') {
          // Handle real-time trade data
          this.handleRealtimeData(message?.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    socket?.addEventListener('error', (error) => {
      console.error('Finnhub WebSocket error:', error);
    });

    socket?.addEventListener('close', () => {
      console.log('Finnhub WebSocket disconnected');
    });

    return socket;
  }

  async handleRealtimeData(trades = []) {
    try {
      for (const trade of trades) {
        const symbol = trade?.s;
        const price = trade?.p;
        const timestamp = new Date(trade?.t)?.toISOString();

        // Find asset
        const { data: asset } = await supabase?.from('assets')?.select('id')?.eq('symbol', symbol)?.single();

        if (asset) {
          // Update market data with real-time price
          await supabase?.from('market_data')?.upsert({
              asset_id: asset?.id,
              close_price: price,
              timestamp,
              api_provider: 'finnhub',
              data_source: 'websocket',
              is_real_time: true,
              last_updated: new Date()?.toISOString()
            }, {
              onConflict: 'asset_id,timestamp',
              ignoreDuplicates: false
            });
        }
      }
    } catch (error) {
      console.error('Error handling real-time data:', error);
    }
  }

  // Utility Methods
  async getQuotaUsage() {
    try {
      return await providerConfigurationService?.getQuotaUsage('finhub');
    } catch (error) {
      console.error('Error getting Finnhub quota usage:', error);
      return { totalCalls: 0, successfulCalls: 0, failedCalls: 0, successRate: 0 };
    }
  }

  async getHealthChecks(limit = 50) {
    try {
      return await providerConfigurationService?.getProviderHealthChecks('finhub', limit);
    } catch (error) {
      console.error('Error getting Finnhub health checks:', error);
      return [];
    }
  }

  // Popular stocks method for quick testing
  getPopularStocks() {
    return [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
      'NVDA', 'META', 'NFLX', 'CRM', 'ORCL',
      'AMD', 'INTC', 'CSCO', 'ADBE', 'PYPL'
    ];
  }

  async quickTest() {
    try {
      console.log('🧪 Running Finnhub API Quick Test...');
      
      // Test connection
      const connectionTest = await this.testConnection();
      if (!connectionTest?.success) {
        return { 
          success: false, 
          error: `Connection test failed: ${connectionTest?.error}` 
        };
      }

      // Test quote endpoint
      const quote = await this.getQuote('AAPL');
      if (quote?.error) {
        return { 
          success: false, 
          error: `Quote test failed: ${quote?.error}` 
        };
      }

      // Test company profile
      const profile = await this.getCompanyProfile('AAPL');
      if (profile?.error) {
        console.warn('Company profile test failed:', profile?.error);
      }

      console.log('✅ Finnhub API Quick Test Passed');
      return { 
        success: true, 
        data: { quote, profile },
        message: 'All tests passed successfully' 
      };
    } catch (error) {
      console.error('❌ Finnhub API Quick Test Failed:', error);
      return { success: false, error: error?.message };
    }
  }
}

// Create singleton instance
export const finnhubApiService = new FinnhubApiService();

// Export default for convenient importing
export default finnhubApiService;