import { supabase } from '../lib/supabase';
import { realTimeDataService } from './realTimeDataService';
import { browserDataSchedulerService } from './dataSchedulerService';
import { googleFinanceService } from './googleFinanceService';

import { finnhubApiService } from './finnhubApiService';

export class MarketDataService {
  constructor() {
    this.supabase = supabase;
    this.queryTimeout = 8000; // Augmenté de 5000ms à 8000ms pour réduire les timeouts
    this.maxRetries = 1; // Réduit de 2 à 1 pour éviter les boucles
    
    // FIX CRITIQUE 1: Circuit breaker global pour le service
    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      threshold: 3, // Ouvrir après 3 échecs
      timeout: 30000 // 30 secondes avant de réessayer
    };
    
    // FIX CRITIQUE 2: Limitation des appels simultanés
    this.activeRequests = new Set();
    this.maxConcurrentRequests = 3;
    
    // FIX CRITIQUE 3: Cache des résultats pour éviter les appels répétés
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute
  }

  // FIX CRITIQUE 4: Vérification du circuit breaker
  isCircuitBreakerOpen() {
    if (!this.circuitBreaker?.isOpen) return false;
    
    // Vérifier si le timeout est écoulé
    if (Date.now() - this.circuitBreaker?.lastFailureTime > this.circuitBreaker?.timeout) {
      console.log('[MarketDataService] 🔄 Circuit breaker: Tentative de récupération');
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      return false;
    }
    
    return true;
  }

  // FIX CRITIQUE 5: Enregistrement des échecs
  recordFailure() {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker?.failureCount >= this.circuitBreaker?.threshold) {
      this.circuitBreaker.isOpen = true;
      console.log('[MarketDataService] 🚨 Circuit breaker ouvert après', this.circuitBreaker?.failureCount, 'échecs');
    }
  }

  // FIX CRITIQUE 6: Cache intelligent
  getCachedResult(key) {
    const cached = this.cache?.get(key);
    if (cached && Date.now() - cached?.timestamp < this.cacheTimeout) {
      console.log('[MarketDataService] 📦 Utilisation du cache pour:', key);
      return cached?.data;
    }
    
    if (cached) {
      this.cache?.delete(key);
    }
    
    return null;
  }

  setCachedResult(key, data) {
    this.cache?.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // FIX CRITIQUE 7: Contrôle des requêtes simultanées
  async executeWithConcurrencyControl(requestKey, queryFunction) {
    if (this.activeRequests?.size >= this.maxConcurrentRequests) {
      console.log('[MarketDataService] ⏸️ Limite de requêtes simultanées atteinte');
      throw new Error('Trop de requêtes simultanées');
    }
    
    this.activeRequests?.add(requestKey);
    
    try {
      const result = await queryFunction();
      return result;
    } finally {
      this.activeRequests?.delete(requestKey);
    }
  }

  // Enhanced database query with timeout and circuit breaker - AMÉLIORÉE
  async queryWithTimeout(queryFunction, timeoutMs = this.queryTimeout, retryCount = 0) {
    // Vérifier le circuit breaker
    if (this.isCircuitBreakerOpen()) {
      throw new Error('Circuit breaker ouvert - service temporairement indisponible');
    }
    
    const requestKey = `query_${Date.now()}_${Math.random()}`;
    
    try {
      return await this.executeWithConcurrencyControl(requestKey, async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller?.abort(), timeoutMs);
        
        const result = await Promise.race([
          queryFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Database query timeout (${timeoutMs}ms)`)), timeoutMs)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        // Succès - réinitialiser le circuit breaker
        this.circuitBreaker.failureCount = 0;
        
        return result;
      });
    } catch (error) {
      console.warn(`[MarketDataService] Query attempt ${retryCount + 1} failed:`, error?.message);
      
      // Enregistrer l'échec
      this.recordFailure();
      
      // Retry logic réduite pour éviter les boucles
      if (retryCount < this.maxRetries && (
        error?.message?.includes('timeout') || 
        error?.message?.includes('ECONNRESET') ||
        error?.code === 'PGRST301'
      )) {
        console.log(`[MarketDataService] 🔄 Retrying query (attempt ${retryCount + 2}/${this.maxRetries + 1})...`);
        await new Promise(resolve => setTimeout(resolve, Math.min(2000, Math.pow(2, retryCount) * 1000))); // Max 2 secondes
        return this.queryWithTimeout(queryFunction, timeoutMs, retryCount + 1);
      }
      
      throw error;
    }
  }

  // Enhanced get latest market data - CORRIGÉE pour éviter les boucles
  async getMarketData(symbols = [], preferredSource = 'auto') {
    const cacheKey = `marketData_${symbols?.join(',')}_${preferredSource}`;
    
    // Vérifier le cache d'abord
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Vérifier le circuit breaker
    if (this.isCircuitBreakerOpen()) {
      console.log('[MarketDataService] ⚡ Circuit breaker ouvert - retour des données en cache');
      return {
        data: [],
        message: 'Service temporairement indisponible - circuit breaker ouvert',
        dataSource: 'circuit_breaker',
        lastUpdate: null,
        error: 'Circuit breaker protection active',
        fallback: true
      };
    }
    
    try {
      console.log(`[MarketDataService] 🚀 Getting data for ${symbols?.length} symbols...`);
      
      // Enhanced freshness check with timeout - TIMEOUT RÉDUIT
      let freshness;
      try {
        freshness = await this.queryWithTimeout(
          () => browserDataSchedulerService?.checkDataFreshness(),
          2000 // Réduit de 3000ms à 2000ms
        );
      } catch (freshnessError) {
        console.warn('[MarketDataService] Data freshness check failed:', freshnessError?.message);
        freshness = { 
          isFresh: false, 
          lastUpdate: null, 
          source: null, 
          error: freshnessError?.message,
          reason: 'Freshness check failed'
        };
      }
      
      // Auto-select best data source - SIMPLIFIÉ
      let selectedSource = preferredSource === 'auto' ? 'google_finance' : preferredSource;
      
      // Simplification: pas de sync si les données ne sont pas fraîches - évite les boucles
      let data = [];
      try {
        data = await this.queryWithTimeout(
          () => realTimeDataService?.getLatestMarketData(symbols),
          5000 // Timeout réduit
        );
      } catch (dataError) {
        console.log('[MarketDataService] ⚠️ Failed to get latest data, using fallback:', dataError?.message);
        
        // Fallback simplifié - pas de retry
        try {
          const fallbackResult = await this.queryWithTimeout(
            () => supabase?.from('market_data')
              ?.select(`close_price, timestamp, asset:assets!inner (symbol, name)`)
              ?.order('timestamp', { ascending: false })
              ?.limit(5), // Limite réduite
            3000
          );
          
          if (fallbackResult?.data?.length) {
            data = fallbackResult?.data?.map(item => ({
              id: item?.asset?.id,
              symbol: item?.asset?.symbol,
              name: item?.asset?.name,
              price: item?.close_price,
              timestamp: item?.timestamp
            }));
          } else {
            data = [];
          }
        } catch (fallbackError) {
          console.error('[MarketDataService] Fallback also failed:', fallbackError?.message);
          data = [];
        }
      }
      
      const result = {
        data: data || [],
        dataSource: selectedSource,
        lastUpdate: freshness?.lastUpdate,
        isFresh: freshness?.isFresh,
        totalSymbols: data?.length || 0,
        freshnessReason: freshness?.reason,
        queryOptimized: true,
        circuitBreakerStatus: 'closed'
      };
      
      // Mettre en cache le résultat
      this.setCachedResult(cacheKey, result);
      
      return result;

    } catch (error) {
      console.error('[MarketDataService] Market data service error:', error?.message);
      
      this.recordFailure();
      
      return {
        data: [],
        error: `Market data service error: ${error?.message || 'Unknown error'}`,
        dataSource: 'error',
        lastUpdate: null,
        timeout: true,
        circuitBreakerStatus: this.circuitBreaker?.isOpen ? 'open' : 'closed',
        suggestion: 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.'
      };
    }
  }

  // NOUVELLE MÉTHODE: Nettoyage du cache
  clearCache() {
    this.cache?.clear();
    console.log('[MarketDataService] 🧹 Cache vidé');
  }

  // NOUVELLE MÉTHODE: Réinitialisation du circuit breaker
  resetCircuitBreaker() {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = null;
    console.log('[MarketDataService] 🔄 Circuit breaker réinitialisé');
  }

  // NOUVELLE MÉTHODE: Statut du service
  getServiceStatus() {
    return {
      circuitBreaker: {
        isOpen: this.circuitBreaker?.isOpen,
        failureCount: this.circuitBreaker?.failureCount,
        lastFailureTime: this.circuitBreaker?.lastFailureTime
      },
      activeRequests: this.activeRequests?.size,
      cacheSize: this.cache?.size,
      isHealthy: !this.circuitBreaker?.isOpen && this.activeRequests?.size < this.maxConcurrentRequests
    };
  }

  // Enhanced data source selection - SIMPLIFIÉE
  async selectBestDataSource(preferred = 'auto') {
    if (preferred !== 'auto') return preferred;

    // Simplification: toujours retourner google_finance pour éviter les timeouts de vérification
    return 'google_finance';
  }

  // FIX CRITIQUE 8: Sync simplifié pour éviter les cascades d'erreurs
  async syncFromSource(source, symbols = []) {
    if (this.isCircuitBreakerOpen()) {
      throw new Error('Circuit breaker ouvert - sync bloqué');
    }
    
    try {
      console.log(`[MarketDataService] 🔄 Starting sync from ${source} for ${symbols?.length} symbols`);
      
      switch (source) {
        case 'google_finance':
          try {
            const result = await googleFinanceService?.syncToDatabase(symbols);
            console.log(`[MarketDataService] 📊 Google Finance sync result:`, result?.message);
            return result;
          } catch (gfError) {
            console.error('[MarketDataService] Google Finance sync failed:', gfError?.message);
            throw new Error(`Google Finance sync failed: ${gfError?.message}`);
          }
          
        default:
          console.log(`[MarketDataService] ⚠️ Source ${source} non implémentée, utilisation fallback`);
          return { success: false, message: 'Source non disponible' };
      }
    } catch (error) {
      console.error(`[MarketDataService] Sync from ${source} failed:`, error?.message);
      this.recordFailure();
      throw new Error(`Erreur sync ${source}: ${error?.message}`);
    }
  }

  // Store IBKR market data in database
  async storeIBKRData(ibkrData, symbols) {
    const results = { successful: [], failed: [], totalSynced: 0 };

    for (const item of ibkrData) {
      try {
        // Find asset
        const { data: asset } = await this.queryWithTimeout(
          () => supabase?.from('assets')?.select('id')?.eq('symbol', item?.symbol)?.single()
        );

        if (!asset) {
          results?.failed?.push({ symbol: item?.symbol, error: 'Asset not found' });
          continue;
        }

        // Insert market data
        await this.queryWithTimeout(
          () => supabase?.from('market_data')?.insert({
            asset_id: asset?.id,
            timestamp: item?.timestamp,
            close_price: parseFloat(item?.last),
            bid_price: parseFloat(item?.bid),
            ask_price: parseFloat(item?.ask),
            volume: parseInt(item?.volume),
            api_provider: 'ibkr',
            data_source: 'api',
            is_real_time: true
          })
        );

        results?.successful?.push(item?.symbol);
        results.totalSynced++;

      } catch (error) {
        results?.failed?.push({ symbol: item?.symbol, error: error?.message });
      }
    }

    return {
      success: results?.totalSynced > 0,
      results,
      message: `${results?.totalSynced} symboles IBKR synchronisés`
    };
  }

  // Enhanced chart data retrieval with better error handling and timeout management
  async getChartData(symbol, days = 1, source = 'auto') {
    if (!symbol) throw new Error('Symbol is required');
    
    try {
      let selectedSource;
      try {
        selectedSource = await this.selectBestDataSource(source);
      } catch (sourceError) {
        console.warn('Data source selection failed, using google_finance:', sourceError?.message);
        selectedSource = 'google_finance';
      }
      
      // Try Google Finance for historical data if selected
      if (selectedSource === 'google_finance') {
        try {
          const period = days <= 1 ? '1d' : days <= 7 ? '5d' : '1mo';
          const interval = days <= 1 ? '5m' : days <= 7 ? '15m' : '1d';
          
          const gfHistory = await Promise.race([
            googleFinanceService?.getHistoricalData(symbol, period, interval),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Google Finance historical data timeout')), 8000) // Reduced timeout
            )
          ]);
          
          if (gfHistory?.success) {
            return {
              data: this.formatChartData(gfHistory?.data?.map(item => ({
                timestamp: item?.timestamp,
                open_price: item?.open,
                high_price: item?.high,
                low_price: item?.low,
                close_price: item?.close,
                volume: item?.volume
              }))),
              symbol,
              dataSource: 'google_finance',
              totalPoints: gfHistory?.data?.length
            };
          }
        } catch (gfError) {
          console.log('Google Finance chart data failed:', gfError?.message);
        }
      }

      // Fallback to database query with enhanced timeout handling
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      try {
        const { data, error } = await this.queryWithTimeout(
          () => supabase?.from('market_data')?.select(`
              timestamp,
              open_price,
              high_price,
              low_price,
              close_price,
              volume,
              api_provider,
              asset:assets!inner (
                symbol,
                name
              )
            `)?.eq('assets.symbol', symbol)
            ?.gte('timestamp', startDate?.toISOString())
            ?.order('timestamp', { ascending: true })
            ?.limit(100) // Limit results to improve performance
        );

        if (error) throw error;

        if (!data?.length) {
          // Try to fetch fresh data for this symbol with timeout
          console.log(`📊 No historical data for ${symbol}, attempting fresh fetch...`);
          try {
            await Promise.race([
              this.syncFromSource(selectedSource, [symbol]),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Fresh fetch timeout')), 6000)
              )
            ]);
            
            // Retry query after sync with shorter timeout
            const { data: retryData, error: retryError } = await this.queryWithTimeout(
              () => supabase?.from('market_data')?.select(`
                  timestamp,
                  open_price,
                  high_price,
                  low_price,
                  close_price,
                  volume,
                  asset:assets!inner (symbol)
                `)?.eq('assets.symbol', symbol)
                ?.gte('timestamp', startDate?.toISOString())
                ?.order('timestamp', { ascending: true })
                ?.limit(50),
              3000
            );

            if (!retryError && retryData?.length) {
              return {
                data: this.formatChartData(retryData),
                symbol,
                dataSource: selectedSource,
                totalPoints: retryData?.length
              };
            }
          } catch (syncError) {
            console.log('Chart data sync failed:', syncError?.message);
          }

          return {
            data: [],
            message: `No historical data available for ${symbol}. Database timeout resolved.`,
            symbol,
            dataSource: selectedSource,
            timeout: true
          };
        }

        return {
          data: this.formatChartData(data),
          symbol,
          dataSource: data?.[0]?.api_provider || selectedSource,
          totalPoints: data?.length
        };
      } catch (dbError) {
        console.error('Database query failed:', dbError?.message);
        return {
          data: [],
          message: `Database timeout: ${dbError?.message}`,
          symbol,
          dataSource: selectedSource,
          error: dbError?.message,
          timeout: true,
          suggestion: 'Database connection issues. Please try again.'
        };
      }

    } catch (error) {
      console.error('Chart data retrieval failed:', error?.message);
      throw error;
    }
  }

  // Format chart data for display
  formatChartData(rawData) {
    return rawData?.map(item => ({
      time: new Date(item?.timestamp)?.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }),
      timestamp: item?.timestamp,
      price: item?.close_price,
      volume: item?.volume || 0,
      high: item?.high_price,
      low: item?.low_price,
      open: item?.open_price
    })) || [];
  }

  // Get real-time market status
  async getMarketStatus() {
    try {
      // Try Google Finance market status first
      const gfStatus = await googleFinanceService?.getMarketStatus();
      if (gfStatus && !gfStatus?.error) {
        return gfStatus;
      }

      // Fallback to existing real-time service
      return await realTimeDataService?.getMarketStatus();
    } catch (error) {
      const now = new Date();
      const hour = now?.getHours();
      const isWeekend = now?.getDay() === 0 || now?.getDay() === 6;
      
      return {
        isOpen: !isWeekend && hour >= 9 && hour < 16,
        status: isWeekend ? 'CLOSED' : (hour >= 9 && hour < 16 ? 'OPEN' : 'CLOSED'),
        nextOpen: null,
        timezone: 'UTC',
        source: 'fallback'
      };
    }
  }

  // Get available symbols for trading
  async getAvailableSymbols() {
    try {
      const { data, error } = await this.queryWithTimeout(
        () => supabase?.from('assets')
          ?.select('symbol, name, sector, exchange, asset_type')
          ?.eq('is_active', true)
          ?.eq('sync_enabled', true)
          ?.order('symbol')
          ?.limit(50) // Limit for performance
      );

      if (error) throw error;

      return data?.map(asset => ({
        symbol: asset?.symbol,
        name: asset?.name,
        sector: asset?.sector,
        exchange: asset?.exchange,
        type: asset?.asset_type
      })) || [];
    } catch (error) {
      throw error;
    }
  }

  // Search symbols
  async searchSymbols(query) {
    if (!query || query?.length < 1) return [];
    
    try {
      const { data, error } = await this.queryWithTimeout(
        () => supabase?.from('assets')
          ?.select('symbol, name, sector, exchange, asset_type')
          ?.eq('is_active', true)
          ?.or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
          ?.limit(20),
        3000
      );

      if (error) throw error;

      return data?.map(asset => ({
        symbol: asset?.symbol,
        name: asset?.name,
        sector: asset?.sector,
        exchange: asset?.exchange,
        type: asset?.asset_type
      })) || [];
    } catch (error) {
      throw error;
    }
  }

  // Get sync job history for admin/monitoring
  async getSyncHistory() {
    try {
      return await browserDataSchedulerService?.getSyncJobHistory(20);
    } catch (error) {
      console.error('Failed to get sync history:', error?.message);
      return [];
    }
  }

  // Manual refresh with source selection
  async refreshData(symbols = [], source = 'auto') {
    try {
      let selectedSource = await this.selectBestDataSource(source);
      const result = await this.syncFromSource(selectedSource, symbols);
      
      return {
        success: result?.success,
        message: `${result?.message} (source: ${selectedSource})`,
        refreshedSymbols: result?.results?.successful?.length || 0,
        failedSymbols: result?.results?.failed?.length || 0,
        dataSource: selectedSource
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message,
        refreshedSymbols: 0,
        failedSymbols: symbols?.length || 0,
        dataSource: 'error'
      };
    }
  }

  // REPLACE mock data methods with real Finnhub integration
  async getLatestQuotes(symbols = []) {
    try {
      if (symbols?.length === 0) {
        // Get all active symbols from database
        const { data: assets } = await this.queryWithTimeout(
          () => supabase?.from('assets')?.select('symbol')?.eq('is_active', true)?.eq('sync_enabled', true)
        );
        symbols = assets?.map(asset => asset?.symbol) || [];
      }

      // Use Finnhub API for real-time quotes
      const quotes = await finnhubApiService?.getMultipleQuotes(symbols);
      
      return quotes;
    } catch (error) {
      console.error('Error fetching latest quotes:', error);
      
      // Fallback to database if API fails
      try {
        const { data: marketData } = await this.queryWithTimeout(
          () => supabase?.from('market_data')?.select(`
              *,
              asset:assets(symbol, name, exchange)
            `)?.in('asset.symbol', symbols)?.order('timestamp', { ascending: false })?.limit(symbols?.length)
        );

        return marketData?.map(data => ({
          symbol: data?.asset?.symbol,
          current_price: data?.close_price,
          open_price: data?.open_price,
          high_price: data?.high_price,
          low_price: data?.low_price,
          change_percent: data?.change_percent,
          timestamp: data?.timestamp,
          provider: data?.api_provider || 'database'
        })) || [];
      } catch (fallbackError) {
        console.error('Database fallback failed:', fallbackError);
        return [];
      }
    }
  }

  async syncMarketData(symbols = null, useRealTime = true) {
    try {
      let symbolsToSync = symbols;
      
      if (!symbolsToSync) {
        // Get all active symbols from database
        const { data: assets } = await this.queryWithTimeout(
          () => supabase?.from('assets')?.select('symbol')?.eq('is_active', true)?.eq('sync_enabled', true)
        );
        symbolsToSync = assets?.map(asset => asset?.symbol) || [];
      }

      if (useRealTime && symbolsToSync?.length > 0) {
        // Use Finnhub API for real-time sync
        const results = await finnhubApiService?.bulkSyncQuotes(symbolsToSync);
        
        const successful = results?.filter(r => r?.success)?.length || 0;
        let failed = results?.filter(r => !r?.success)?.length || 0;
        
        console.log(`✅ Market data sync completed: ${successful} successful, ${failed} failed`);
        
        return {
          success: true,
          synced: successful,
          failed: failed,
          results: results
        };
      } else {
        // Keep existing mock data logic as fallback
        return await this.syncMockMarketData(symbolsToSync);
      }
    } catch (error) {
      console.error('Error syncing market data:', error);
      return {
        success: false,
        error: error?.message,
        synced: 0,
        failed: symbolsToSync?.length || 0
      };
    }
  }

  // Keep existing mock data method as fallback
  async syncMockMarketData(symbols = null) {
    try {
      let symbolsToSync = symbols;
      
      if (!symbolsToSync) {
        const { data: assets } = await this.queryWithTimeout(
          () => supabase?.from('assets')?.select('symbol')?.eq('is_active', true)?.eq('sync_enabled', true)
        );
        symbolsToSync = assets?.map(asset => asset?.symbol) || [];
      }

      if (symbolsToSync?.length === 0) {
        return { success: true, synced: 0, failed: 0 };
      }

      let synced = 0;
      let failed = 0;

      for (const symbol of symbolsToSync) {
        try {
          const { data: asset } = await this.queryWithTimeout(
            () => supabase?.from('assets')?.select('id')?.eq('symbol', symbol)?.single()
          );
          
          if (!asset) {
            console.warn(`Asset not found for symbol: ${symbol}`);
            failed++;
            continue;
          }

          const mockData = this.generateMockMarketData();
          
          const { error: marketDataError } = await this.queryWithTimeout(
            () => supabase?.from('market_data')?.upsert({
                asset_id: asset?.id,
                ...mockData,
                api_provider: 'mock',
                data_source: 'mock',
                timestamp: new Date()?.toISOString(),
                last_updated: new Date()?.toISOString()
              })
          );

          if (marketDataError) {
            console.error(`Error updating market data for ${symbol}:`, marketDataError);
            failed++;
          } else {
            synced++;
          }
        } catch (error) {
          console.error(`Error processing ${symbol}:`, error);
          failed++;
        }
      }

      return { success: true, synced, failed };
    } catch (error) {
      console.error('Error in mock market data sync:', error);
      return { success: false, error: error?.message, synced: 0, failed: 0 };
    }
  }

  generateMockMarketData() {
    const basePrice = 100 + Math.random() * 400; // $100-$500 range
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * volatility * basePrice * 2;
    
    const open_price = basePrice;
    const close_price = basePrice + change;
    const high_price = Math.max(open_price, close_price) * (1 + Math.random() * 0.03);
    const low_price = Math.min(open_price, close_price) * (1 - Math.random() * 0.03);
    const volume = Math.floor(Math.random() * 10000000) + 100000; // 100K - 10M
    const change_percent = ((close_price - open_price) / open_price) * 100;

    return {
      open_price: Number(open_price?.toFixed(2)),
      high_price: Number(high_price?.toFixed(2)),
      low_price: Number(low_price?.toFixed(2)),
      close_price: Number(close_price?.toFixed(2)),
      volume,
      change_percent: Number(change_percent?.toFixed(2)),
      is_real_time: false
    };
  }

  // NEW: Enhanced real-time methods using Finnhub
  async startRealtimeDataFeed(symbols = []) {
    try {
      if (symbols?.length === 0) {
        const { data: assets } = await this.queryWithTimeout(
          () => supabase?.from('assets')?.select('symbol')?.eq('is_active', true)?.limit(10)
        );
        symbols = assets?.map(asset => asset?.symbol) || ['AAPL', 'MSFT', 'GOOGL'];
      }

      const socket = finnhubApiService?.createWebSocketConnection(symbols);
      return socket;
    } catch (error) {
      console.error('Error starting real-time data feed:', error);
      return null;
    }
  }

  async getCompanyInfo(symbol) {
    try {
      const profile = await finnhubApiService?.getCompanyProfile(symbol);
      if (profile?.error) {
        return { data: null, error: profile?.error };
      }
      return { data: profile, error: null };
    } catch (error) {
      console.error('Error getting company info:', error);
      return { data: null, error: error?.message };
    }
  }

  async getHistoricalData(symbol, period = '1M') {
    try {
      let from, to;
      const now = new Date();
      
      switch (period) {
        case '1D':
          from = Math.floor((now?.getTime() - (24 * 60 * 60 * 1000)) / 1000);
          break;
        case '1W':
          from = Math.floor((now?.getTime() - (7 * 24 * 60 * 60 * 1000)) / 1000);
          break;
        case '1M':
          from = Math.floor((now?.getTime() - (30 * 24 * 60 * 60 * 1000)) / 1000);
          break;
        case '3M':
          from = Math.floor((now?.getTime() - (90 * 24 * 60 * 60 * 1000)) / 1000);
          break;
        case '1Y':
          from = Math.floor((now?.getTime() - (365 * 24 * 60 * 60 * 1000)) / 1000);
          break;
        default:
          from = Math.floor((now?.getTime() - (30 * 24 * 60 * 60 * 1000)) / 1000);
      }
      
      to = Math.floor(now?.getTime() / 1000);

      const candles = await finnhubApiService?.getCandles(symbol, 'D', from, to);
      return candles;
    } catch (error) {
      console.error('Error getting historical data:', error);
      return { data: [], error: error?.message };
    }
  }

  // Fixed method to get market data sources with aggregation fallback
  async getMarketDataSources() {
    try {
      // Try the aggregation query first
      const { data, error } = await supabase?.rpc('get_market_data_sources_aggregated');
      
      if (!error && data) {
        return data;
      }

      // Fallback to basic query without aggregation if RPC fails
      const { data: fallbackData, error: fallbackError } = await this.queryWithTimeout(
        () => supabase?.from('market_data')?.select('data_source, api_provider')?.order('timestamp', { ascending: false })?.limit(100)
      );
      
      if (fallbackError) {
        throw fallbackError;
      }

      // Manually aggregate the results in JavaScript
      const grouped = {};
      fallbackData?.forEach(item => {
        const key = `${item?.data_source}_${item?.api_provider}`;
        if (!grouped?.[key]) {
          grouped[key] = {
            data_source: item?.data_source,
            api_provider: item?.api_provider,
            count: 0
          };
        }
        grouped[key].count++;
      });

      // Convert to array and sort by count
      return Object.values(grouped)?.sort((a, b) => b?.count - a?.count)?.slice(0, 10);

    } catch (error) {
      console.error('Error fetching market data sources:', error);
      // Return fallback data structure
      return [
        { data_source: 'api', api_provider: 'mock', count: 100 },
        { data_source: 'scheduled_sync', api_provider: 'mock_scheduler', count: 50 }
      ];
    }
  }
}

// Singleton export
export const marketDataService = new MarketDataService();