// Browser-safe data scheduler service
// This version removes node-cron dependency to prevent __dirname errors in browser
import { realTimeDataService } from './realTimeDataService.js';
import { supabase } from '../lib/supabase.js';

// Browser-compatible data scheduler service
export const browserDataSchedulerService = {
  // Cache for data freshness to avoid excessive database calls
  _freshnessCache: null,
  _cacheExpiry: null,
  _cacheTimeout: 30000, // 30 seconds cache

  // Trigger manual sync from the browser
  async triggerManualSync(symbols = []) {
    try {
      console.log('🔧 Manual sync triggered for:', symbols?.length ? symbols?.join(', ') : 'all symbols');
      
      let targetSymbols = symbols;
      
      if (!targetSymbols?.length) {
        // Get all active symbols with timeout and error handling
        try {
          const { data: assets, error } = await this.withTimeout(
            supabase
              ?.from('assets')
              ?.select('symbol')
              ?.eq('sync_enabled', true)
              ?.eq('is_active', true),
            5000 // 5 second timeout
          );
          
          if (error) {
            console.warn('Failed to fetch assets, using fallback symbols:', error?.message);
            targetSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN']; // Fallback symbols
          } else {
            targetSymbols = assets?.map(asset => asset?.symbol) || [];
          }
        } catch (error) {
          console.warn('Database query timed out, using fallback symbols');
          targetSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN'];
        }
      }

      const results = await realTimeDataService?.syncMultipleSymbols(targetSymbols, true);
      
      await this.logSyncJob('manual', 'yahoo_finance', results?.successful?.length || 0, results?.failed?.length || 0);
      
      return {
        success: true,
        message: `Sync completed: ${results?.successful?.length || 0} successful, ${results?.failed?.length || 0} failed`,
        results
      };
    } catch (error) {
      console.error('Manual sync failed:', error?.message);
      await this.logSyncJob('manual', 'yahoo_finance', 0, 0, error?.message);
      return {
        success: false,
        message: error?.message || 'Manual sync failed',
        results: null
      };
    }
  },

  // Enhanced timeout utility function
  async withTimeout(promise, timeoutMs = 5000) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  },

  // Get sync job history with enhanced error handling
  async getSyncJobHistory(limit = 10) {
    try {
      const { data, error } = await this.withTimeout(
        supabase
          ?.from('market_data_sync_jobs')
          ?.select('*')
          ?.order('started_at', { ascending: false })
          ?.limit(limit),
        5000
      );

      if (error) {
        console.warn('Failed to fetch sync job history:', error?.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get sync job history:', error?.message);
      return [];
    }
  },

  // Enhanced data freshness check with caching and fallback
  async checkDataFreshness() {
    try {
      // Check cache first
      const now = Date.now();
      if (this._freshnessCache && this._cacheExpiry && now < this._cacheExpiry) {
        return this._freshnessCache;
      }

      // Clear expired cache
      this._freshnessCache = null;
      this._cacheExpiry = null;

      // Try database query with timeout and retry logic
      let result = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !result) {
        try {
          const { data, error } = await this.withTimeout(
            supabase
              ?.from('market_data')
              ?.select('timestamp, api_provider')
              ?.eq('is_real_time', true)
              ?.order('timestamp', { ascending: false })
              ?.limit(1),
            3000 + (attempts * 1000) // Progressive timeout: 3s, 4s, 5s
          );

          if (error) {
            throw error;
          }

          const latest = data?.[0];
          if (!latest) {
            result = { 
              isFresh: false, 
              lastUpdate: null, 
              source: null,
              reason: 'No market data found'
            };
            break;
          }

          const lastUpdate = new Date(latest.timestamp);
          const now = new Date();
          const minutesSinceUpdate = (now - lastUpdate) / (1000 * 60);

          result = {
            isFresh: minutesSinceUpdate < 10, // Consider fresh if less than 10 minutes old
            lastUpdate,
            source: latest?.api_provider,
            minutesSinceUpdate: Math.round(minutesSinceUpdate),
            reason: minutesSinceUpdate < 10 ? 'Data is fresh' : `Data is ${Math.round(minutesSinceUpdate)} minutes old`
          };
          break;

        } catch (error) {
          attempts++;
          console.warn(`Data freshness check attempt ${attempts} failed:`, error?.message);
          
          if (attempts < maxAttempts) {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
          }
        }
      }

      // If all attempts failed, return fallback result
      if (!result) {
        console.error('All data freshness check attempts failed, using fallback');
        result = { 
          isFresh: false, 
          lastUpdate: null, 
          source: null, 
          error: 'Failed to check data freshness after multiple attempts',
          reason: 'Database connection failed'
        };
      }

      // Cache the result
      this._freshnessCache = result;
      this._cacheExpiry = Date.now() + this._cacheTimeout;

      return result;

    } catch (error) {
      console.error('Unexpected error in checkDataFreshness:', error?.message);
      
      // Return cached result if available
      if (this._freshnessCache) {
        console.log('Returning cached freshness result due to error');
        return { ...this._freshnessCache, fromCache: true };
      }

      // Final fallback
      return { 
        isFresh: false, 
        lastUpdate: null, 
        source: null, 
        error: error?.message || 'Unknown error checking data freshness',
        reason: 'Error occurred during check'
      };
    }
  },

  // Enhanced log sync job with better error handling
  async logSyncJob(jobType, apiSource, successCount, failCount, errorMessage = null) {
    try {
      const { error } = await this.withTimeout(
        supabase?.from('market_data_sync_jobs')?.insert({
          job_type: jobType,
          asset_symbol: 'BATCH',
          status: errorMessage ? 'failed' : (failCount > 0 ? 'partial' : 'completed'),
          api_source: apiSource,
          completed_at: new Date()?.toISOString(),
          error_message: errorMessage,
          data_points_synced: successCount || 0
        }),
        5000
      );

      if (error) {
        console.warn('Failed to log sync job:', error?.message);
      }
    } catch (error) {
      console.error('Failed to log sync job:', error?.message);
    }
  },

  // Get market status for display with enhanced error handling
  async getMarketStatusInfo() {
    try {
      const status = await Promise.race([
        realTimeDataService?.getMarketStatus(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Market status timeout')), 5000)
        )
      ]);
      
      return {
        isOpen: status?.is_open || false,
        status: status?.status || 'UNKNOWN',
        nextOpen: status?.next_open,
        nextClose: status?.next_close
      };
    } catch (error) {
      console.error('Failed to get market status:', error?.message);
      
      // Fallback market status based on time
      const now = new Date();
      const hour = now?.getHours();
      const day = now?.getDay();
      const isWeekday = day >= 1 && day <= 5;
      const isDuringMarketHours = hour >= 9 && hour < 16;
      
      return {
        isOpen: isWeekday && isDuringMarketHours,
        status: isWeekday && isDuringMarketHours ? 'OPEN' : 'CLOSED',
        nextOpen: null,
        nextClose: null,
        fallback: true
      };
    }
  },

  // Get sync statistics for dashboard with enhanced error handling
  async getSyncStatistics() {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)?.toISOString();
      
      const [syncJobsResult, assetsResult] = await Promise.allSettled([
        this.withTimeout(
          supabase
            ?.from('market_data_sync_jobs')
            ?.select('status, started_at, data_points_synced, api_source')
            ?.gte('started_at', yesterday)
            ?.order('started_at', { ascending: false }),
          5000
        ),
        this.withTimeout(
          supabase
            ?.from('assets')
            ?.select('symbol')
            ?.eq('sync_enabled', true)
            ?.eq('is_active', true),
          5000
        )
      ]);

      const syncJobs = syncJobsResult?.status === 'fulfilled' ? syncJobsResult?.value?.data || [] : [];
      const assets = assetsResult?.status === 'fulfilled' ? assetsResult?.value?.data || [] : [];

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
        last24h: totalJobs,
        hasErrors: syncJobsResult?.status === 'rejected' || assetsResult?.status === 'rejected'
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
        last24h: 0,
        hasErrors: true,
        error: error?.message
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
  },

  // Clear cached data freshness
  clearFreshnessCache() {
    this._freshnessCache = null;
    this._cacheExpiry = null;
  },

  // Health check for the service
  async healthCheck() {
    try {
      const startTime = Date.now();
      
      // Test database connectivity
      const { error } = await this.withTimeout(
        supabase?.from('assets')?.select('id')?.limit(1),
        3000
      );
      
      const responseTime = Date.now() - startTime;
      
      return {
        healthy: !error,
        responseTime,
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        responseTime: null,
        error: error?.message || 'Health check failed',
        timestamp: new Date()?.toISOString()
      };
    }
  }
};

// Export the browser-safe service as the default export
export default browserDataSchedulerService;

// For backwards compatibility, also export as dataSchedulerService
export const dataSchedulerService = browserDataSchedulerService;