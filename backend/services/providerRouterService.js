import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';


class ProviderRouterService {
  constructor() {
    this.supabase = createClient(
      process.env?.SUPABASE_URL, 
      process.env?.SUPABASE_SERVICE_KEY
    );
  }

  // Synchronize Supabase providers table with API calls
  async getKeys() {
    // PRIORITY: Environment variables first, then fallback to database
    const envKeys = {
      finnhub_api: process.env?.FINNHUB_API_KEY,
      alpha_api: process.env?.ALPHAVANTAGE_API_KEY,
      twelve_api: process.env?.TWELVEDATA_API_KEY
    };

    // If all environment variables are present, use them
    if (envKeys?.finnhub_api && envKeys?.alpha_api && envKeys?.twelve_api) {
      console.log('🔑 Using provider API keys from environment variables');
      return envKeys;
    }

    // Otherwise, fallback to database
    try {
      const { data, error } = await this.supabase?.from('providers')?.select('finnhub_api, alpha_api, twelve_api')?.eq('id', 'default')?.single();
      
      if (error) throw error;
      
      // Merge environment variables with database values (env takes priority)
      return {
        finnhub_api: envKeys?.finnhub_api || data?.finnhub_api || null,
        alpha_api: envKeys?.alpha_api || data?.alpha_api || null,
        twelve_api: envKeys?.twelve_api || data?.twelve_api || null
      };
    } catch (error) {
      console.warn('⚠️ Database fallback failed, using environment variables only:', error?.message);
      return envKeys;
    }
  }

  async updateKeys(keys) {
    const { error } = await this.supabase?.from('providers')?.upsert({
        id: 'default',
        finnhub_api: keys?.finnhub_api || null,
        alpha_api: keys?.alpha_api || null,
        twelve_api: keys?.twelve_api || null,
        updated_at: new Date()?.toISOString()
      });
    
    if (error) throw error;
    return { success: true };
  }

  // Provider health testing functions 
  async testFinnhub(key) {
    if (!key) return { ok: false, latency: null, name: 'finnhub' };
    
    const startTime = Date.now();
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${encodeURIComponent(key)}`,
        { timeout: 5000 }
      );
      
      const ok = response?.ok;
      if (ok) await response?.json()?.catch(() => {});
      
      return { 
        ok, 
        latency: ok ? Date.now() - startTime : null, 
        name: 'finnhub',
        status: ok ? 'healthy' : 'error'
      };
    } catch (error) {
      return { 
        ok: false, 
        latency: null, 
        name: 'finnhub',
        error: error?.message,
        status: 'error'
      };
    }
  }

  async testAlpha(key) {
    if (!key) return { ok: false, latency: null, name: 'alpha' };
    
    const startTime = Date.now();
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${encodeURIComponent(key)}`,
        { timeout: 5000 }
      );
      
      const json = await response?.json()?.catch(() => ({}));
      const ok = !!json?.['Global Quote'];
      
      return { 
        ok, 
        latency: ok ? Date.now() - startTime : null, 
        name: 'alpha',
        status: ok ? 'healthy' : 'error'
      };
    } catch (error) {
      return { 
        ok: false, 
        latency: null, 
        name: 'alpha',
        error: error?.message,
        status: 'error'
      };
    }
  }

  async testTwelve(key) {
    if (!key) return { ok: false, latency: null, name: 'twelve' };
    
    const startTime = Date.now();
    try {
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=MSFT&apikey=${encodeURIComponent(key)}`,
        { timeout: 5000 }
      );
      
      const json = await response?.json()?.catch(() => ({}));
      const ok = !!json?.price;
      
      return { 
        ok, 
        latency: ok ? Date.now() - startTime : null, 
        name: 'twelve',
        status: ok ? 'healthy' : 'error'
      };
    } catch (error) {
      return { 
        ok: false, 
        latency: null, 
        name: 'twelve',
        error: error?.message,
        status: 'error'
      };
    }
  }

  // Main health check endpoint
  async providersHealth() {
    try {
      const { finnhub_api, alpha_api, twelve_api } = await this.getKeys();
      
      const [fh, av, td] = await Promise.all([
        this.testFinnhub(finnhub_api),
        this.testAlpha(alpha_api),
        this.testTwelve(twelve_api),
      ]);

      const providers = [fh, av, td];
      const healthy = providers?.filter(p => p?.ok);
      const primary = healthy?.sort((a, b) => (a?.latency || 999999) - (b?.latency || 999999))?.[0];

      return {
        success: true,
        ok: healthy?.length >= 1,
        providers,
        healthy_count: healthy?.length,
        primary: primary?.name || null,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        success: false,
        ok: false,
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  // Auto-routing quotes with provider failover
  async getQuotes(symbols) {
    if (!symbols?.length) {
      throw new Error('Symbols parameter is required');
    }

    const { finnhub_api, alpha_api, twelve_api } = await this.getKeys();

    // Provider stack in priority order
    const providerStack = [];
    
    if (finnhub_api) {
      providerStack?.push(async () => {
        const results = await Promise.all(
          symbols?.map(async (symbol) => {
            const response = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(finnhub_api)}`,
              { timeout: 3000 }
            );
            const data = await response?.json();
            return { 
              symbol, 
              price: data?.c, 
              change: data?.d,
              change_percent: data?.dp,
              volume: data?.v || 0,
              provider: 'finnhub',
              timestamp: new Date()?.toISOString()
            };
          })
        );
        return results;
      });
    }

    if (twelve_api) {
      providerStack?.push(async () => {
        const results = await Promise.all(
          symbols?.map(async (symbol) => {
            const response = await fetch(
              `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(twelve_api)}`,
              { timeout: 3000 }
            );
            const data = await response?.json();
            return { 
              symbol, 
              price: parseFloat(data?.price), 
              provider: 'twelve',
              timestamp: new Date()?.toISOString()
            };
          })
        );
        return results;
      });
    }

    if (alpha_api) {
      providerStack?.push(async () => {
        const results = await Promise.all(
          symbols?.map(async (symbol) => {
            const response = await fetch(
              `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(alpha_api)}`,
              { timeout: 3000 }
            );
            const data = await response?.json();
            const quote = data?.['Global Quote'];
            return { 
              symbol, 
              price: parseFloat(quote?.['05. price']), 
              change: parseFloat(quote?.['09. change']),
              change_percent: parseFloat(quote?.['10. change percent']?.replace('%', '')),
              provider: 'alpha',
              timestamp: new Date()?.toISOString()
            };
          })
        );
        return results;
      });
    }

    // Try each provider until one succeeds
    for (const providerFunc of providerStack) {
      try {
        const results = await providerFunc();
        const validResults = results?.filter(r => Number.isFinite(r?.price));
        
        if (validResults?.length === symbols?.length) {
          return {
            success: true,
            ok: true,
            data: validResults,
            provider_used: validResults?.[0]?.provider,
            symbols_requested: symbols?.length,
            symbols_successful: validResults?.length,
            timestamp: new Date()?.toISOString()
          };
        }
      } catch (error) {
        console.warn(`Provider failed: ${error?.message}`);
        continue;
      }
    }

    throw new Error('All providers failed - no valid quotes available');
  }
}

export const providerRouterService = new ProviderRouterService();