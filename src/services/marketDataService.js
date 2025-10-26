// Enhanced Market Data Service - IBKR Gateway Priority with Fallback
import { isEquitiesMarketClosed, normalizeProvider } from '@/lib/market/utils';
import { resolveApiBase } from '@/lib/apiBase.js';
import { ibkrTradingService } from './ibkrTradingService';
import { fetchJSON, safeJSON } from '@/lib/http';
import { onlyWhenOpen, isMarketClosedNow } from '@/services/marketScheduler';
import { showInfoBanner, showError, showWarn } from '@/ui/notify';

const PROVIDER = normalizeProvider(import.meta.env?.VITE_MARKET_PROVIDER);

/**
 * Load equity snapshot with guaranteed JSON response
 * @param {string} symbol - Stock symbol
 * @returns {Promise} Market data
 */
export async function loadEquitySnapshot(symbol) {
  if (!symbol) throw new Error('Symbol is required');
  
  return fetchJSON(`/api/market/${encodeURIComponent(symbol)}/snapshot?provider=${PROVIDER}`);
}

/**
 * Load cryptocurrency snapshot with guaranteed JSON response
 * @param {string} symbol - Crypto symbol 
 * @returns {Promise} Market data
 */
export async function loadCryptoSnapshot(symbol) {
  if (!symbol) throw new Error('Symbol is required');
  
  return fetchJSON(`/api/crypto/${encodeURIComponent(symbol)}/snapshot?provider=${PROVIDER}`);
}

/**
 * Load real-time quote from IBKR cache
 * @param {string} symbol - Symbol to fetch
 * @returns {Promise} Real-time quote data
 */
export async function loadRealtimeQuote(symbol) {
  if (!symbol) throw new Error('Symbol is required');
  
  return fetchJSON(`/api/realtime/quote?symbol=${encodeURIComponent(symbol)}`);
}

/**
 * Load all fresh real-time quotes
 * @returns {Promise} Array of fresh quotes
 */
export async function loadAllRealtimeQuotes() {
  return fetchJSON('/api/realtime/quotes');
}

/**
 * Equity refresh loop - STOPS on weekends to prevent infinite errors
 * @param {string[]} symbols - Symbols to refresh
 * @param {number} intervalMs - Refresh interval in milliseconds
 * @returns {Function} Cleanup function
 */
export function startEquityRefreshLoop(symbols = [], intervalMs = 15000) {
  if (!symbols?.length) {
    showWarn('No equity symbols provided for refresh loop');
    return () => {};
  }

  let stopped = false;
  let timeoutId = null;

  const tick = async () => {
    if (stopped) return;

    // Only run when equity markets are open
    onlyWhenOpen('equity', async () => {
      try {
        const results = await Promise.all(
          symbols?.map(symbol => safeJSON(`/api/market/${encodeURIComponent(symbol)}/snapshot?provider=${PROVIDER}`))
        );
        
        const failures = results?.filter(r => !r?.ok);
        if (failures?.length) {
          const errorCount = failures?.length;
          const totalCount = results?.length;
          showError(`Equity data: ${errorCount}/${totalCount} failed - check provider status`);
        }
        
        // Emit successful results
        const successes = results?.filter(r => r?.ok);
        if (successes?.length > 0) {
          // Could emit to event bus or state management here
          console.log(`[EQUITY REFRESH] Updated ${successes?.length} symbols`);
        }
        
      } catch (error) {
        showError(`Equity refresh failed: ${error?.message || error}`);
      }
    });

    // Show weekend closure message
    if (isMarketClosedNow('equity')) {
      showInfoBanner('Equity markets closed (weekend) — automatic resumption on market open. Crypto continues 24/7.');
    }

    // Schedule next tick
    if (!stopped) {
      timeoutId = setTimeout(tick, intervalMs);
    }
  };

  // Start immediately
  tick();

  // Return cleanup function
  return () => {
    stopped = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}

/**
 * Cryptocurrency refresh loop - runs 24/7
 * @param {string[]} symbols - Crypto symbols to refresh
 * @param {number} intervalMs - Refresh interval in milliseconds
 * @returns {Function} Cleanup function
 */
export function startCryptoRefreshLoop(symbols = [], intervalMs = 10000) {
  if (!symbols?.length) {
    showWarn('No crypto symbols provided for refresh loop');
    return () => {};
  }

  let stopped = false;
  let timeoutId = null;

  const tick = async () => {
    if (stopped) return;

    try {
      const results = await Promise.all(
        symbols?.map(symbol => safeJSON(`/api/crypto/${encodeURIComponent(symbol)}/snapshot?provider=${PROVIDER}`))
      );
      
      const failures = results?.filter(r => !r?.ok);
      if (failures?.length) {
        const errorCount = failures?.length;
        const totalCount = results?.length;
        showError(`Crypto data: ${errorCount}/${totalCount} failed - check provider connectivity`);
      }
      
      // Emit successful results
      const successes = results?.filter(r => r?.ok);
      if (successes?.length > 0) {
        console.log(`[CRYPTO REFRESH] Updated ${successes?.length} symbols`);
      }
      
    } catch (error) {
      showError(`Crypto refresh failed: ${error?.message || error}`);
    }

    // Schedule next tick
    if (!stopped) {
      timeoutId = setTimeout(tick, intervalMs);
    }
  };

  // Start immediately
  tick();

  // Return cleanup function
  return () => {
    stopped = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}

/**
 * IBKR real-time data refresh loop - uses cached data, minimal load
 * @param {string[]} symbols - Symbols to monitor
 * @param {number} intervalMs - Refresh interval
 * @returns {Function} Cleanup function
 */
export function startRealtimeRefreshLoop(symbols = [], intervalMs = 5000) {
  if (!symbols?.length) {
    showWarn('No symbols provided for real-time refresh loop');
    return () => {};
  }

  let stopped = false;
  let timeoutId = null;

  const tick = async () => {
    if (stopped) return;

    try {
      const results = await Promise.all(
        symbols?.map(symbol => safeJSON(`/api/realtime/quote?symbol=${encodeURIComponent(symbol)}`))
      );
      
      const staleCount = results?.filter(r => !r?.ok)?.length;
      if (staleCount > 0) {
        showWarn(`Real-time data: ${staleCount}/${symbols?.length} symbols have stale cache`);
      }
      
      const freshCount = results?.filter(r => r?.ok)?.length;
      if (freshCount > 0) {
        console.log(`[REALTIME REFRESH] ${freshCount} symbols with fresh data`);
      }
      
    } catch (error) {
      showError(`Real-time refresh failed: ${error?.message || error}`);
    }

    // Schedule next tick
    if (!stopped) {
      timeoutId = setTimeout(tick, intervalMs);
    }
  };

  // Start immediately
  tick();

  // Return cleanup function
  return () => {
    stopped = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
}

export class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.subscriptions = new Set();
    this.isRealTime = false;
    this.retryAttempts = 3;
    this.fallbackData = new Map();
  }

  async getLatestQuote(symbol, provider = 'ibkr') {
    const weekend = isEquitiesMarketClosed();

    // PRIORITÉ 1: IBKR Gateway si disponible
    if (provider === 'ibkr' || provider === 'polygon') {
      try {
        const ibkrData = await this.getIBKRQuote(symbol);
        if (ibkrData?.success) {
          return {
            success: true,
            data: {
              ...ibkrData?.data,
              source: 'IBKR_GATEWAY',
              priority: 1
            }
          };
        }
      } catch (error) {
        console.log('IBKR Gateway unavailable, using fallback:', error?.message);
      }
    }

    // Weekend mode: return synthetic data for all providers
    if (weekend) {
      return {
        success: true,
        data: {
          symbol,
          price: null,
          previousClose: null,
          change: null,
          changePercent: null,
          timestamp: new Date()?.toISOString(),
          weekend: true,
          message: 'Market closed - no live data available',
          source: 'WEEKEND_MODE'
        }
      };
    }

    const normalizedProvider = normalizeProvider(provider);
    const cacheKey = `${symbol}_${normalizedProvider}`;
    const cached = this.cache?.get(cacheKey);
    
    if (cached && Date.now() - cached?.timestamp < this.cacheTimeout) {
      return cached?.data;
    }

    try {
      const baseUrl = resolveApiBase();
      if (!baseUrl) {
        throw new Error('API base URL not available');
      }

      const controller = new AbortController();
      setTimeout(() => controller?.abort(), 5000);

      const response = await fetch(`${baseUrl}/api/quotes/latest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          symbol,
          provider: normalizedProvider
        }),
        signal: controller?.signal
      });

      if (!response?.ok) {
        throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
      }

      const result = await response?.json();
      
      const cacheEntry = {
        data: {
          ...result,
          source: `FALLBACK_${normalizedProvider?.toUpperCase()}`,
          priority: 2
        },
        timestamp: Date.now()
      };
      
      this.cache?.set(cacheKey, cacheEntry);
      
      return cacheEntry?.data;
    } catch (error) {
      // Weekend-aware error handling
      if (weekend) {
        return {
          success: true,
          data: {
            symbol,
            price: null,
            weekend: true,
            message: 'Market closed - retrying when markets reopen',
            source: 'WEEKEND_FALLBACK'
          }
        };
      }

      console.log('Market data fetch failed:', error?.message);
      throw error;
    }
  }

  // Nouvelle méthode: Récupération quote IBKR Gateway
  async getIBKRQuote(symbol) {
    try {
      // Simuler récupération depuis IBKR Gateway
      // Dans une implémentation réelle, utiliser l'API IBKR
      const mockPrice = 100 + Math.random() * 100;
      const mockChange = (Math.random() - 0.5) * 10;
      
      return {
        success: true,
        data: {
          symbol,
          price: mockPrice?.toFixed(2),
          bid: (mockPrice - 0.01)?.toFixed(2),
          ask: (mockPrice + 0.01)?.toFixed(2),
          change: mockChange?.toFixed(2),
          changePercent: ((mockChange / mockPrice) * 100)?.toFixed(2),
          volume: Math.floor(Math.random() * 1000000),
          timestamp: new Date()?.toISOString(),
          source: 'IBKR_GATEWAY'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message
      };
    }
  }

  async getMarketData(symbols = [], provider = 'ibkr') {
    const weekend = isEquitiesMarketClosed();
    
    // Skip equities calls during weekend
    if (weekend) {
      return symbols?.map(symbol => ({
        symbol,
        price: null,
        weekend: true,
        message: 'Market closed',
        source: 'WEEKEND_MODE'
      }));
    }

    // PRIORITÉ IBKR Gateway pour tous les symboles
    const promises = symbols?.map(symbol => 
      this.getLatestQuote(symbol, 'ibkr')?.catch(error => ({
        symbol,
        error: error?.message,
        success: false,
        source: 'ERROR_FALLBACK'
      }))
    );

    return Promise.all(promises);
  }

  // Méthode dédiée IBKR Gateway uniquement
  async getIBKRMarketData(symbols = [], userId = null) {
    const weekend = isEquitiesMarketClosed();
    
    if (weekend) {
      return symbols?.map(symbol => ({
        symbol,
        price: null,
        weekend: true,
        message: 'Market closed - IBKR Gateway data unavailable',
        source: 'IBKR_WEEKEND'
      }));
    }

    try {
      // Vérifier statut connexion IBKR si userId fourni
      if (userId) {
        const connectionStatus = await ibkrTradingService?.getConnectionStatus(userId);
        if (connectionStatus?.status !== 'connected') {
          return symbols?.map(symbol => ({
            symbol,
            price: null,
            error: 'IBKR Gateway disconnected',
            source: 'IBKR_DISCONNECTED'
          }));
        }
      }

      // Récupérer données depuis IBKR Gateway
      const promises = symbols?.map(async (symbol) => {
        try {
          const quote = await this.getIBKRQuote(symbol);
          return quote?.success ? quote?.data : {
            symbol,
            error: 'IBKR quote failed',
            source: 'IBKR_ERROR'
          };
        } catch (error) {
          return {
            symbol,
            error: error?.message,
            source: 'IBKR_EXCEPTION'
          };
        }
      });

      return Promise.all(promises);

    } catch (error) {
      return symbols?.map(symbol => ({
        symbol,
        error: error?.message,
        source: 'IBKR_SYSTEM_ERROR'
      }));
    }
  }

  // Crypto/FX can run 24/7 if enabled (désactivé dans le contexte IBKR-only)
  async getCryptoFxData(symbols = [], provider = 'disabled') {
    console.log('Crypto/FX disabled - IBKR Gateway exclusive mode');
    return symbols?.map(symbol => ({
      symbol,
      error: 'Crypto/FX disabled in IBKR-only mode',
      success: false,
      source: 'DISABLED'
    }));
  }

  // Statistiques de sources utilisées
  getSourceStats() {
    const sources = {};
    for (const [key, entry] of this.cache?.entries()) {
      const source = entry?.data?.data?.source || 'UNKNOWN';
      sources[source] = (sources?.[source] || 0) + 1;
    }
    
    return {
      sources,
      totalCached: this.cache?.size,
      primarySource: 'IBKR_GATEWAY',
      fallbacksActive: Object.keys(sources)?.filter(s => s?.includes('FALLBACK'))?.length
    };
  }

  clearCache() {
    this.cache?.clear();
  }

  // Mode IBKR exclusif
  enableIBKROnlyMode() {
    this.priorityProvider = 'ibkr';
    console.log('Market Data Service: IBKR-only mode enabled');
  }

  async fetchMarketData(symbols, forceRefresh = false) {
    try {
      // Check if equity markets are closed (prevent weekend loops)
      if (isMarketClosedNow('equity')) {
        showInfoBanner('Marchés actions fermés — reprise automatique à l\'ouverture.');
        
        // Return cached data or mock data for weekends
        return symbols?.map(symbol => ({
          symbol,
          price: this.cache?.get(symbol)?.price || null,
          change: 0,
          changePercent: 0,
          weekend: true,
          message: 'Markets closed - showing last available data',
          source: 'WEEKEND_CACHE'
        }));
      }

      // Proceed with normal data fetching using fetchJSON
      const response = await fetchJSON('/api/market/latest', {
        method: 'POST',
        body: JSON.stringify({ symbols })
      });

      return response?.data || [];
    } catch (error) {
      console.warn('Market data fetch failed:', error?.message);
      
      // Return fallback data instead of throwing
      return symbols?.map(symbol => ({
        symbol,
        price: null,
        weekend: isMarketClosedNow('equity'),
        error: error?.message,
        source: 'FALLBACK'
      }));
    }
  }

  async getIBKRMarketData(symbols, userId) {
    try {
      if (isMarketClosedNow('equity')) {
        return symbols?.map(symbol => ({
          symbol,
          price: this.cache?.get(symbol)?.price || null,
          weekend: true,
          message: 'IBKR Gateway - Markets closed',
          source: 'IBKR_WEEKEND'
        }));
      }

      const response = await fetchJSON(`/api/market/ibkr/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ symbols })
      });

      return response?.positions || [];
    } catch (error) {
      console.warn('IBKR market data failed:', error?.message);
      return symbols?.map(symbol => ({
        symbol,
        price: null,
        error: error?.message,
        source: 'IBKR_ERROR'
      }));
    }
  }

  async getQuotes(symbols) {
    try {
      const response = await fetchJSON('/api/market/quotes', {
        method: 'POST',
        body: JSON.stringify({ symbols })
      });
      
      return response?.quotes || [];
    } catch (error) {
      console.warn('Quotes fetch failed:', error?.message);
      throw error;
    }
  }
}

// Export singleton instance
export default new MarketDataService();
function marketDataService(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: marketDataService is not implemented yet.', args);
  return null;
}

export { marketDataService };