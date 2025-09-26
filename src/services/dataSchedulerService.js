// Browser-safe data scheduler service
// This version removes node-cron dependency to prevent __dirname errors in browser
import { realTimeDataService } from './realTimeDataService.js';
import { supabase } from '../lib/supabase.js';

// Browser-compatible data scheduler service
export const browserDataSchedulerService = {
  // Trigger manual sync from the browser
  async triggerManualSync(symbols = []) {
    try {
      console.log('🔧 Manual sync triggered for:', symbols?.length ? symbols?.join(', ') : 'all symbols');
      
      let targetSymbols = symbols;
      
      if (!targetSymbols?.length) {
        // Get all active symbols
        const { data: assets } = await supabase
          ?.from('assets')
          ?.select('symbol')
          ?.eq('sync_enabled', true)
          ?.eq('is_active', true);
        
        targetSymbols = assets?.map(asset => asset?.symbol) || [];
      }

      const results = await realTimeDataService?.syncMultipleSymbols(targetSymbols, true);
      
      await this.logSyncJob('manual', 'yahoo_finance', results?.successful?.length, results?.failed?.length);
      
      return {
        success: true,
        message: `Sync completed: ${results?.successful?.length} successful, ${results?.failed?.length} failed`,
        results
      };
    } catch (error) {
      await this.logSyncJob('manual', 'yahoo_finance', 0, 0, error?.message);
      return {
        success: false,
        message: error?.message,
        results: null
      };
    }
  },

  // Get sync job history
  async getSyncJobHistory(limit = 10) {
    try {
      const { data, error } = await supabase
        ?.from('market_data_sync_jobs')
        ?.select('*')
        ?.order('started_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get sync job history:', error?.message);
      return [];
    }
  },

  // Check if real-time data is available
  async checkDataFreshness() {
    try {
      const { data, error } = await supabase
        ?.from('market_data')
        ?.select('timestamp, api_provider')
        ?.eq('is_real_time', true)
        ?.order('timestamp', { ascending: false })
        ?.limit(1);

      if (error) throw error;

      const latest = data?.[0];
      if (!latest) return { isFresh: false, lastUpdate: null, source: null };

      const lastUpdate = new Date(latest.timestamp);
      const now = new Date();
      const minutesSinceUpdate = (now - lastUpdate) / (1000 * 60);

      return {
        isFresh: minutesSinceUpdate < 10, // Consider fresh if less than 10 minutes old
        lastUpdate,
        source: latest?.api_provider,
        minutesSinceUpdate: Math.round(minutesSinceUpdate)
      };
    } catch (error) {
      console.error('Failed to check data freshness:', error?.message);
      return { isFresh: false, lastUpdate: null, source: null, error: error?.message };
    }
  },

  // Log sync job results
  async logSyncJob(jobType, apiSource, successCount, failCount, errorMessage = null) {
    try {
      await supabase?.from('market_data_sync_jobs')?.insert({
        job_type: jobType,
        asset_symbol: 'BATCH',
        status: errorMessage ? 'failed' : (failCount > 0 ? 'partial' : 'completed'),
        api_source: apiSource,
        completed_at: new Date(),
        error_message: errorMessage,
        data_points_synced: successCount
      });
    } catch (error) {
      console.error('Failed to log sync job:', error?.message);
    }
  },

  // Get market status for display
  async getMarketStatusInfo() {
    try {
      const status = await realTimeDataService?.getMarketStatus();
      return {
        isOpen: status?.is_open || false,
        status: status?.status || 'UNKNOWN',
        nextOpen: status?.next_open,
        nextClose: status?.next_close
      };
    } catch (error) {
      console.error('Failed to get market status:', error?.message);
      return {
        isOpen: false,
        status: 'ERROR',
        nextOpen: null,
        nextClose: null
      };
    }
  },

  // Get sync statistics for dashboard
  async getSyncStatistics() {
    try {
      const { data: syncJobs } = await supabase
        ?.from('market_data_sync_jobs')
        ?.select('status, started_at, data_points_synced, api_source')
        ?.gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000)?.toISOString())
        ?.order('started_at', { ascending: false });

      const { data: assets } = await supabase
        ?.from('assets')
        ?.select('symbol')
        ?.eq('sync_enabled', true)
        ?.eq('is_active', true);

      const totalJobs = syncJobs?.length || 0;
      const successfulJobs = syncJobs?.filter(job => job?.status === 'completed')?.length || 0;
      const totalSymbols = assets?.length || 0;
      const successRate = totalJobs > 0 ? Math.round((successfulJobs / totalJobs) * 100) : 0;
      const apiSources = [...new Set(syncJobs?.map(job => job?.api_source).filter(Boolean))] || [];
      const totalDataPoints = syncJobs?.reduce((sum, job) => sum + (job?.data_points_synced || 0), 0) || 0;

      return {
        totalSymbols,
        totalJobs,
        successfulJobs,
        successRate,
        apiSources,
        totalDataPoints,
        last24h: totalJobs
      };
    } catch (error) {
      console.error('Failed to get sync statistics:', error?.message);
      return {
        totalSymbols: 0,
        totalJobs: 0,
        successfulJobs: 0,
        successRate: 0,
        apiSources: [],
        totalDataPoints: 0,
        last24h: 0
      };
    }
  },

  // Simulate scheduled job status for UI display (since we can't run actual cron jobs in browser)
  getScheduledJobsStatus() {
    return {
      marketSync: {
        name: 'Market Data Sync',
        schedule: 'Every 5 minutes during market hours',
        status: 'simulated',
        nextRun: 'Server-side only',
        enabled: true
      },
      endOfDaySync: {
        name: 'End-of-Day Sync',
        schedule: 'Daily at 5:00 PM EST',
        status: 'simulated',
        nextRun: 'Server-side only',
        enabled: true
      },
      assetRefresh: {
        name: 'Asset List Refresh',
        schedule: 'Weekly on Mondays at 2:00 AM UTC',
        status: 'simulated',
        nextRun: 'Server-side only',
        enabled: true
      }
    };
  }
};

// Export the browser-safe service as the default export
export default browserDataSchedulerService;

// For backwards compatibility, also export as dataSchedulerService
export const dataSchedulerService = browserDataSchedulerService;