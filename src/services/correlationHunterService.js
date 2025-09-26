import { supabase } from '../lib/supabase';

// Service for managing correlation analysis between financial assets
export const correlationHunterService = {
  // Fetch available assets for correlation analysis
  async getAvailableAssets() {
    const { data, error } = await supabase?.from('assets')?.select('id, symbol, name, sector, logo_url, is_active')?.eq('is_active', true)?.eq('is_tradable', true)?.order('symbol');

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  },

  // Get historical market data for correlation calculation
  async getHistoricalData(assetIds, timeframe = '1M') {
    const days = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365
    };

    const daysBack = days?.[timeframe] || 30;
    const startDate = new Date();
    startDate?.setDate(startDate?.getDate() - daysBack);

    const { data, error } = await supabase?.from('market_data')?.select(`
        asset_id,
        close_price,
        timestamp,
        assets!inner(symbol, name)
      `)?.in('asset_id', assetIds)?.gte('timestamp', startDate?.toISOString())?.order('timestamp', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  },

  // Calculate correlation matrix between assets
  calculateCorrelationMatrix(historicalData) {
    // Group data by asset
    const assetData = {};
    historicalData?.forEach(point => {
      const assetId = point?.asset_id;
      if (!assetData?.[assetId]) {
        assetData[assetId] = {
          symbol: point?.assets?.symbol,
          prices: []
        };
      }
      assetData?.[assetId]?.prices?.push({
        date: point?.timestamp,
        price: parseFloat(point?.close_price) || 0
      });
    });

    // Calculate daily returns for each asset
    const returns = {};
    Object.keys(assetData)?.forEach(assetId => {
      const prices = assetData?.[assetId]?.prices || [];
      const dailyReturns = [];
      
      for (let i = 1; i < prices?.length; i++) {
        const prevPrice = prices?.[i - 1]?.price || 0;
        const currentPrice = prices?.[i]?.price || 0;
        if (prevPrice > 0) {
          dailyReturns?.push((currentPrice - prevPrice) / prevPrice);
        }
      }
      
      returns[assetId] = {
        symbol: assetData?.[assetId]?.symbol,
        returns: dailyReturns
      };
    });

    // Calculate correlation coefficients
    const correlationMatrix = {};
    const assetIds = Object.keys(returns);

    assetIds?.forEach(asset1 => {
      correlationMatrix[asset1] = {};
      assetIds?.forEach(asset2 => {
        if (asset1 === asset2) {
          correlationMatrix[asset1][asset2] = 1.0;
        } else {
          const corr = this.calculatePearsonCorrelation(
            returns?.[asset1]?.returns || [],
            returns?.[asset2]?.returns || []
          );
          correlationMatrix[asset1][asset2] = corr;
        }
      });
    });

    return {
      matrix: correlationMatrix,
      assets: returns
    };
  },

  // Calculate Pearson correlation coefficient between two arrays
  calculatePearsonCorrelation(x, y) {
    if (!x?.length || !y?.length || x?.length !== y?.length) return 0;

    const n = x?.length;
    const sumX = x?.reduce((sum, val) => sum + val, 0);
    const sumY = y?.reduce((sum, val) => sum + val, 0);
    const sumXY = x?.reduce((sum, val, i) => sum + val * y?.[i], 0);
    const sumX2 = x?.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y?.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  },

  // Get watchlist assets for quick selection
  async getWatchlistAssets(userId) {
    const { data, error } = await supabase?.from('watchlist_items')?.select(`
        asset_id,
        assets!inner(id, symbol, name, sector, logo_url)
      `)?.eq('watchlists.user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
    return data?.map(item => item?.assets) || [];
  },

  // Save correlation alert threshold
  async saveCorrelationAlert(userId, asset1Id, asset2Id, threshold) {
    const { data, error } = await supabase?.from('alerts')?.insert({
        user_id: userId,
        asset_id: asset1Id,
        alert_type: 'correlation',
        threshold_value: threshold,
        metadata: {
          correlation_asset_id: asset2Id,
          alert_type: 'correlation_threshold'
        }
      });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
};