import axios from 'axios';
import { supabase } from '../lib/supabase';

export const googleFinanceService = {
  // Configuration Google Finance
  config: {
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/', // Proxy endpoint
    timeout: 10000,
    retryAttempts: 3,
    rateLimit: 120 // requests per minute
  },

  // Get real-time quote from Google Finance
  async getRealTimeQuote(symbol) {
    try {
      const response = await this.makeRequest(symbol);
      const data = response?.data?.chart?.result?.[0];
      
      if (!data?.meta) {
        throw new Error(`Pas de données pour ${symbol}`);
      }

      const quote = data?.meta;
      const timestamps = data?.timestamp || [];
      const prices = data?.indicators?.quote?.[0] || {};
      
      // Get latest OHLC values
      const lastIndex = timestamps?.length - 1;
      const latestData = {
        symbol: quote?.symbol || symbol,
        regularMarketPrice: quote?.regularMarketPrice,
        regularMarketChange: quote?.regularMarketChange,
        regularMarketChangePercent: quote?.regularMarketChangePercent,
        regularMarketVolume: quote?.regularMarketVolume,
        previousClose: quote?.previousClose,
        open: prices?.open?.[lastIndex] || quote?.regularMarketOpen,
        high: prices?.high?.[lastIndex] || quote?.regularMarketDayHigh,
        low: prices?.low?.[lastIndex] || quote?.regularMarketDayLow,
        close: prices?.close?.[lastIndex] || quote?.regularMarketPrice,
        volume: prices?.volume?.[lastIndex] || quote?.regularMarketVolume,
        timestamp: new Date(),
        marketState: quote?.marketState,
        currency: quote?.currency || 'USD',
        exchange: quote?.exchangeName
      };

      return {
        success: true,
        data: latestData,
        source: 'google_finance',
        timestamp: new Date()?.toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error?.message,
        symbol,
        source: 'google_finance'
      };
    }
  },

  // Get historical data
  async getHistoricalData(symbol, period = '1d', interval = '5m') {
    try {
      const url = `${this.config?.baseUrl}${symbol}?interval=${interval}&period=${period}`;
      const response = await axios?.get(url, {
        timeout: this.config?.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TradingMVP/1.0)'
        }
      });

      const result = response?.data?.chart?.result?.[0];
      if (!result?.timestamp) {
        throw new Error(`Données historiques indisponibles pour ${symbol}`);
      }

      const timestamps = result?.timestamp;
      const quotes = result?.indicators?.quote?.[0] || {};
      
      const historicalData = timestamps?.map((timestamp, index) => ({
        timestamp: new Date(timestamp * 1000)?.toISOString(),
        open: quotes?.open?.[index],
        high: quotes?.high?.[index],
        low: quotes?.low?.[index],
        close: quotes?.close?.[index],
        volume: quotes?.volume?.[index] || 0,
        symbol
      }))?.filter(item => item?.close !== null);

      return {
        success: true,
        data: historicalData,
        symbol,
        period,
        interval,
        totalPoints: historicalData?.length,
        source: 'google_finance'
      };

    } catch (error) {
      throw new Error(`Erreur données historiques ${symbol}: ${error.message}`);
    }
  },

  // Sync multiple symbols to database
  async syncToDatabase(symbols = []) {
    const results = {
      successful: [],
      failed: [],
      totalSynced: 0
    };

    // Log sync job start
    const { data: syncJob } = await supabase?.from('market_data_sync_jobs')?.insert({
        job_type: 'google_finance_sync',
        api_source: 'google_finance',
        asset_symbol: symbols?.join(','),
        status: 'running'
      })?.select()?.single();

    for (const symbol of symbols) {
      try {
        // Get real-time data
        const quoteResult = await this.getRealTimeQuote(symbol);
        
        if (!quoteResult?.success) {
          results?.failed?.push({ symbol, error: quoteResult?.error });
          continue;
        }

        const quote = quoteResult?.data;

        // Find or create asset
        let { data: asset } = await supabase?.from('assets')?.select('id')?.eq('symbol', symbol)?.single();

        if (!asset) {
          const { data: newAsset, error: assetError } = await supabase?.from('assets')?.insert({
              symbol: quote?.symbol,
              name: quote?.symbol, // Could be enhanced with company name lookup
              asset_type: 'stock',
              exchange: quote?.exchange,
              currency: quote?.currency,
              is_active: true,
              sync_enabled: true
            })?.select('id')?.single();

          if (assetError) throw assetError;
          asset = newAsset;
        }

        // Insert market data
        const { error: marketDataError } = await supabase?.from('market_data')?.insert({
            asset_id: asset?.id,
            timestamp: quote?.timestamp,
            open_price: quote?.open,
            high_price: quote?.high,
            low_price: quote?.low,
            close_price: quote?.close,
            volume: quote?.volume,
            change_percent: quote?.regularMarketChangePercent,
            api_provider: 'google_finance',
            data_source: 'api',
            is_real_time: true
          });

        if (marketDataError) throw marketDataError;

        // Update asset last price update
        await supabase?.from('assets')?.update({ last_price_update: quote?.timestamp })?.eq('id', asset?.id);

        results?.successful?.push(symbol);
        results.totalSynced++;

      } catch (error) {
        results?.failed?.push({ 
          symbol, 
          error: error?.message 
        });
      }
    }

    // Update sync job completion
    if (syncJob?.id) {
      await supabase?.from('market_data_sync_jobs')?.update({
          status: 'completed',
          completed_at: new Date()?.toISOString(),
          data_points_synced: results?.totalSynced,
          error_message: results?.failed?.length > 0 ? 
            `${results?.failed?.length} symboles échoués` : null
        })?.eq('id', syncJob?.id);
    }

    return {
      success: results?.totalSynced > 0,
      results,
      message: `${results?.totalSynced} symboles synchronisés, ${results?.failed?.length} échoués`
    };
  },

  // Make API request with retry logic
  async makeRequest(symbol, retries = 0) {
    try {
      const url = `${this.config?.baseUrl}${symbol}`;
      return await axios?.get(url, {
        timeout: this.config?.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TradingMVP/1.0)',
          'Accept': 'application/json'
        }
      });
    } catch (error) {
      if (retries < this.config?.retryAttempts) {
        await this.delay(1000 * (retries + 1)); // Progressive delay
        return this.makeRequest(symbol, retries + 1);
      }
      throw error;
    }
  },

  // Get market status from Google Finance
  async getMarketStatus() {
    try {
      const response = await this.getRealTimeQuote('SPY'); // Use SPY as market indicator
      
      if (response?.success) {
        const marketState = response?.data?.marketState;
        return {
          isOpen: marketState === 'REGULAR',
          status: marketState,
          source: 'google_finance',
          timestamp: new Date()?.toISOString()
        };
      }

      // Fallback status calculation
      const now = new Date();
      const hour = now?.getHours();
      const isWeekday = now?.getDay() >= 1 && now?.getDay() <= 5;
      
      return {
        isOpen: isWeekday && hour >= 9 && hour < 16,
        status: isWeekday && hour >= 9 && hour < 16 ? 'REGULAR' : 'CLOSED',
        source: 'fallback',
        timestamp: new Date()?.toISOString()
      };

    } catch (error) {
      return {
        isOpen: false,
        status: 'UNKNOWN',
        error: error?.message,
        source: 'google_finance'
      };
    }
  },

  // Setup Google Finance configuration in database
  async setupConfiguration() {
    try {
      const { error } = await supabase?.from('external_api_configs')?.upsert({
          api_name: 'google_finance',
          base_url: 'https://query1.finance.yahoo.com/v8/finance/chart/',
          is_active: true,
          rate_limit_per_minute: 120,
          total_calls_today: 0
        });

      if (error) throw error;
      
      return { success: true, message: 'Configuration Google Finance créée' };
    } catch (error) {
      throw new Error(`Erreur configuration: ${error.message}`);
    }
  },

  // Utility function for delays
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};