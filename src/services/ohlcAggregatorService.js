import { supabase } from '../lib/supabase';

class OHLCAggregatorService {
  constructor() {
    this.supportedTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];
    this.isAggregating = false;
  }

  // Get OHLC aggregated data for a symbol
  async getOHLCData(symbol, timeframe = '1h', limit = 100) {
    try {
      const { data, error } = await supabase?.from('ohlc_aggregated_data')?.select(`
          *,
          asset:assets!inner(symbol, name, exchange)
        `)?.eq('assets.symbol', symbol)?.eq('timeframe', timeframe)?.order('interval_start', { ascending: false })?.limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(item => ({
          timestamp: item?.interval_start,
          open: parseFloat(item?.open_price),
          high: parseFloat(item?.high_price),
          low: parseFloat(item?.low_price),
          close: parseFloat(item?.close_price),
          volume: parseInt(item?.volume || 0),
          trades: item?.trades_count || 0,
          vwap: parseFloat(item?.vwap || 0),
          timeframe: item?.timeframe,
          quality: item?.quality_score || 1.0
        })) || [],
        timeframe,
        totalBars: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch OHLC data',
        data: []
      };
    }
  }

  // Trigger aggregation for specific asset and timeframe
  async aggregateOHLCData(symbol, timeframe, startTime, endTime) {
    try {
      // Get asset ID
      const { data: asset, error: assetError } = await supabase?.from('assets')?.select('id')?.eq('symbol', symbol)?.single();

      if (assetError || !asset) {
        throw new Error(`Asset ${symbol} not found`);
      }

      // Call aggregation function
      const { data, error } = await supabase?.rpc('aggregate_ohlc_data', {
        p_asset_id: asset?.id,
        p_timeframe: timeframe,
        p_start_time: startTime,
        p_end_time: endTime
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: `OHLC aggregation completed for ${symbol} ${timeframe}`,
        aggregationId: data
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'OHLC aggregation failed'
      };
    }
  }

  // Backfill missing OHLC data for all active assets
  async backfillOHLCData(timeframe = '1h', days = 7) {
    if (this.isAggregating) {
      return {
        success: false,
        error: 'Aggregation already in progress'
      };
    }

    this.isAggregating = true;
    const results = { successful: [], failed: [], totalProcessed: 0 };

    try {
      // Get all active assets that need backfill
      const { data: assets, error } = await supabase?.from('assets')?.select('id, symbol, name')?.eq('is_active', true)?.eq('sync_enabled', true);

      if (error) {
        throw error;
      }

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);

      // Process each asset
      for (const asset of assets || []) {
        try {
          const result = await this.aggregateOHLCData(
            asset?.symbol,
            timeframe,
            startTime?.toISOString(),
            endTime?.toISOString()
          );

          if (result?.success) {
            results?.successful?.push(asset?.symbol);
          } else {
            results?.failed?.push({ symbol: asset?.symbol, error: result?.error });
          }
        } catch (error) {
          results?.failed?.push({ symbol: asset?.symbol, error: error?.message });
        }

        results.totalProcessed++;
      }

      return {
        success: true,
        results,
        message: `Backfill completed: ${results?.successful?.length} successful, ${results?.failed?.length} failed`
      };

    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Backfill process failed',
        results
      };
    } finally {
      this.isAggregating = false;
    }
  }

  // Get available timeframes and data coverage
  async getDataCoverage(symbol) {
    try {
      const { data, error } = await supabase?.from('ohlc_aggregated_data')?.select(`
          timeframe,
          MIN(interval_start) as earliest_data,
          MAX(interval_start) as latest_data,
          COUNT(*) as total_bars
        `)?.eq('assets.symbol', symbol)?.single();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      const coverage = data ? {
        symbol,
        timeframes: [{
          timeframe: data?.timeframe,
          earliestData: data?.earliest_data,
          latestData: data?.latest_data,
          totalBars: parseInt(data?.total_bars)
        }]
      } : {
        symbol,
        timeframes: [],
        message: 'No OHLC data available'
      };

      return {
        success: true,
        data: coverage
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get data coverage'
      };
    }
  }

  // Check data quality for a symbol
  async checkDataQuality(symbol) {
    try {
      // Get asset ID
      const { data: asset, error: assetError } = await supabase?.from('assets')?.select('id')?.eq('symbol', symbol)?.single();

      if (assetError || !asset) {
        throw new Error(`Asset ${symbol} not found`);
      }

      // Call quality check function
      const { data, error } = await supabase?.rpc('check_market_data_quality', {
        p_asset_id: asset?.id
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          symbol,
          qualityScore: data?.[0]?.quality_score || 0,
          issuesFound: data?.[0]?.issues_found || 0,
          lastDataAge: data?.[0]?.last_data_age || '0',
          dataFreshness: data?.[0]?.data_freshness || 0,
          status: data?.[0]?.quality_score >= 0.8 ? 'good' : 
                  data?.[0]?.quality_score >= 0.5 ? 'fair' : 'poor'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Quality check failed'
      };
    }
  }

  // Get aggregation status
  async getAggregationStatus() {
    try {
      const { data, error } = await supabase?.from('ohlc_aggregated_data')?.select(`
          timeframe,
          COUNT(*) as total_bars,
          MAX(updated_at) as last_update
        `);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          isAggregating: this.isAggregating,
          totalBars: data?.reduce((sum, item) => sum + parseInt(item?.total_bars || 0), 0) || 0,
          timeframes: data?.map(item => ({
            timeframe: item?.timeframe,
            bars: parseInt(item?.total_bars),
            lastUpdate: item?.last_update
          })) || [],
          lastUpdate: data?.length > 0 ? Math.max(...data?.map(item => new Date(item?.last_update))) : null
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get aggregation status'
      };
    }
  }

  // Real-time subscription to OHLC updates
  subscribeToOHLCUpdates(callback) {
    const subscription = supabase?.channel('ohlc_updates')?.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ohlc_aggregated_data'
      }, callback)?.subscribe();

    return subscription;
  }

  // Format OHLC data for charting
  formatForChart(ohlcData) {
    return ohlcData?.map(bar => ({
      x: new Date(bar?.timestamp),
      y: [bar?.open, bar?.high, bar?.low, bar?.close],
      volume: bar?.volume,
      trades: bar?.trades
    })) || [];
  }

  // Get supported timeframes
  getSupportedTimeframes() {
    return this.supportedTimeframes?.map(tf => ({
      value: tf,
      label: this.getTimeframeLabel(tf)
    }));
  }

  // Helper to get timeframe label
  getTimeframeLabel(timeframe) {
    const labels = {
      '1m': '1 Minute',
      '5m': '5 Minutes', 
      '15m': '15 Minutes',
      '30m': '30 Minutes',
      '1h': '1 Hour',
      '4h': '4 Hours',
      '1d': '1 Day',
      '1w': '1 Week',
      '1M': '1 Month'
    };
    return labels?.[timeframe] || timeframe;
  }
}

export const ohlcAggregatorService = new OHLCAggregatorService();
export default ohlcAggregatorService;