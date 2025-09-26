import { supabase } from '../lib/supabase';
import { realTimeDataService } from './realTimeDataService';
import { browserDataSchedulerService } from './dataSchedulerService';

export const marketDataService = {
  // Get latest market data with real-time updates
  async getMarketData(symbols = []) {
    try {
      // First, check if we have fresh real-time data
      const freshness = await browserDataSchedulerService?.checkDataFreshness();
      
      // If data is not fresh, try to sync new data
      if (!freshness?.isFresh && symbols?.length > 0) {
        console.log('🔄 Data is stale, attempting fresh sync...');
        try {
          const syncResult = await browserDataSchedulerService?.triggerManualSync(symbols);
          if (syncResult?.success) {
            console.log('✅ Fresh data synced successfully');
          }
        } catch (syncError) {
          console.log('⚠️ Fresh sync failed, using cached data:', syncError?.message);
        }
      }

      // Get latest data from database (now potentially refreshed)
      const data = await realTimeDataService?.getLatestMarketData(symbols);
      
      // If no real-time data available, show helpful message
      if (!data?.length && symbols?.length > 0) {
        return {
          data: [],
          message: 'Real-time data not available. Sync may be in progress.',
          dataSource: 'cache',
          lastUpdate: freshness?.lastUpdate
        };
      }

      return {
        data: data || [],
        dataSource: freshness?.source || 'database',
        lastUpdate: freshness?.lastUpdate,
        isFresh: freshness?.isFresh,
        totalSymbols: data?.length || 0
      };

    } catch (error) {
      // Fallback: return empty data with error info
      console.error('Market data service error:', error?.message);
      return {
        data: [],
        error: error?.message,
        dataSource: 'error',
        lastUpdate: null
      };
    }
  },

  // Get historical chart data for a specific asset
  async getChartData(symbol, days = 1) {
    if (!symbol) throw new Error('Symbol is required');
    
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase?.from('market_data')?.select(`
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
        `)?.eq('assets.symbol', symbol)?.gte('timestamp', startDate?.toISOString())?.order('timestamp', { ascending: true });

      if (error) throw error;

      if (!data?.length) {
        // Try to fetch fresh data for this symbol
        console.log(`📊 No historical data for ${symbol}, attempting to fetch...`);
        try {
          await browserDataSchedulerService?.triggerManualSync([symbol]);
          // Retry the query after sync
          const { data: retryData, error: retryError } = await supabase?.from('market_data')?.select(`
              timestamp,
              open_price,
              high_price,
              low_price,
              close_price,
              volume,
              asset:assets!inner (symbol)
            `)?.eq('assets.symbol', symbol)?.gte('timestamp', startDate?.toISOString())?.order('timestamp', { ascending: true });

          if (!retryError && retryData?.length) {
            return this.formatChartData(retryData);
          }
        } catch (syncError) {
          console.log('Chart data sync failed:', syncError?.message);
        }

        return {
          data: [],
          message: `No historical data available for ${symbol}`,
          symbol
        };
      }

      return {
        data: this.formatChartData(data),
        symbol,
        dataSource: data?.[0]?.api_provider || 'database',
        totalPoints: data?.length
      };

    } catch (error) {
      throw error;
    }
  },

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
  },

  // Get real-time market status
  async getMarketStatus() {
    try {
      return await realTimeDataService?.getMarketStatus();
    } catch (error) {
      // Fallback market status calculation
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
  },

  // Get available symbols for trading
  async getAvailableSymbols() {
    try {
      const { data, error } = await supabase?.from('assets')?.select('symbol, name, sector, exchange, asset_type')?.eq('is_active', true)?.eq('sync_enabled', true)?.order('symbol');

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
  },

  // Search symbols
  async searchSymbols(query) {
    if (!query || query?.length < 1) return [];
    
    try {
      const { data, error } = await supabase?.from('assets')?.select('symbol, name, sector, exchange, asset_type')?.eq('is_active', true)?.or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)?.limit(20);

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
  },

  // Get sync job history for admin/monitoring
  async getSyncHistory() {
    try {
      return await browserDataSchedulerService?.getSyncJobHistory(20);
    } catch (error) {
      console.error('Failed to get sync history:', error?.message);
      return [];
    }
  },

  // Manual refresh trigger
  async refreshData(symbols = []) {
    try {
      const result = await browserDataSchedulerService?.triggerManualSync(symbols);
      return {
        success: result?.success,
        message: result?.message,
        refreshedSymbols: result?.results?.successful?.length || 0,
        failedSymbols: result?.results?.failed?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message,
        refreshedSymbols: 0,
        failedSymbols: symbols?.length || 0
      };
    }
  }
};