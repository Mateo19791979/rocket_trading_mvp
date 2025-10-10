import { supabase } from '../lib/supabase';

class DataQualityService {
  constructor() {
    this.qualityThresholds = {
      price_spike: 0.15, // 15% price movement threshold
      volume_anomaly: 3.0, // 3x average volume
      stale_data: 15, // 15 minutes without data
      missing_data: 0.05 // 5% missing data tolerance
    };
  }

  // Get data quality overview
  async getQualityOverview() {
    try {
      const { data, error } = await supabase?.from('data_quality_checks')?.select(`
          check_type,
          severity,
          COUNT(*) as issue_count,
          MAX(check_timestamp) as last_check
        `)?.eq('is_resolved', false);

      if (error) {
        throw error;
      }

      // Get overall quality metrics
      const { data: totalAssets } = await supabase?.from('assets')?.select('id', { count: 'exact' })?.eq('is_active', true);

      const totalIssues = data?.reduce((sum, item) => sum + parseInt(item?.issue_count), 0) || 0;
      const criticalIssues = data?.filter(item => item?.severity === 'critical')?.reduce((sum, item) => sum + parseInt(item?.issue_count), 0) || 0;

      return {
        success: true,
        data: {
          totalAssets: totalAssets?.length || 0,
          totalIssues,
          criticalIssues,
          overallHealthScore: this.calculateOverallHealthScore(totalIssues, totalAssets?.length || 1),
          issuesByType: data?.map(item => ({
            type: item?.check_type,
            severity: item?.severity,
            count: parseInt(item?.issue_count),
            lastCheck: item?.last_check
          })) || [],
          lastUpdated: new Date()?.toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch quality overview'
      };
    }
  }

  // Get quality issues for specific asset
  async getAssetQualityIssues(symbol, limit = 50) {
    try {
      const { data, error } = await supabase?.from('data_quality_checks')?.select(`
          *,
          asset:assets!inner(symbol, name)
        `)?.eq('assets.symbol', symbol)?.order('check_timestamp', { ascending: false })?.limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data?.map(issue => ({
          id: issue?.id,
          type: issue?.check_type,
          severity: issue?.severity,
          timestamp: issue?.check_timestamp,
          detectedValue: issue?.detected_value,
          deviation: issue?.deviation_percentage,
          provider: issue?.provider_source,
          isResolved: issue?.is_resolved,
          resolutionAction: issue?.resolution_action,
          metadata: issue?.metadata
        })) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch asset quality issues'
      };
    }
  }

  // Run quality checks for all assets
  async runQualityChecks() {
    try {
      const { data: assets, error } = await supabase?.from('assets')?.select('id, symbol')?.eq('is_active', true)?.eq('sync_enabled', true);

      if (error) {
        throw error;
      }

      const results = { checked: 0, issues: 0, errors: [] };

      // Check each asset
      for (const asset of assets || []) {
        try {
          const assetResult = await this.checkAssetQuality(asset?.symbol);
          results.checked++;
          if (assetResult?.success && assetResult?.data?.issuesFound > 0) {
            results.issues += assetResult?.data?.issuesFound;
          }
        } catch (error) {
          results?.errors?.push({ symbol: asset?.symbol, error: error?.message });
        }
      }

      return {
        success: true,
        data: {
          ...results,
          message: `Quality check completed: ${results?.checked} assets checked, ${results?.issues} issues found`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Quality check run failed'
      };
    }
  }

  // Check quality for specific asset
  async checkAssetQuality(symbol) {
    try {
      // Get asset ID
      const { data: asset, error: assetError } = await supabase?.from('assets')?.select('id')?.eq('symbol', symbol)?.single();

      if (assetError || !asset) {
        throw new Error(`Asset ${symbol} not found`);
      }

      // Run built-in quality check function
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
          lastDataAge: data?.[0]?.last_data_age || '0 seconds',
          dataFreshness: data?.[0]?.data_freshness || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Asset quality check failed'
      };
    }
  }

  // Resolve quality issue
  async resolveQualityIssue(issueId, resolutionAction) {
    try {
      const { data, error } = await supabase?.from('data_quality_checks')?.update({
          is_resolved: true,
          resolution_action: resolutionAction,
          resolved_at: new Date()?.toISOString()
        })?.eq('id', issueId)?.select()?.single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: `Quality issue resolved: ${resolutionAction}`
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to resolve quality issue'
      };
    }
  }

  // Get data freshness metrics
  async getDataFreshnessMetrics() {
    try {
      const { data, error } = await supabase?.from('market_data')?.select(`
          asset:assets!inner(symbol, name),
          MAX(timestamp) as last_update,
          COUNT(*) as total_records
        `)?.eq('assets.is_active', true);

      if (error) {
        throw error;
      }

      const freshnessData = data?.map(item => {
        const lastUpdate = new Date(item?.last_update);
        const ageMinutes = Math.floor((Date.now() - lastUpdate?.getTime()) / (1000 * 60));
        
        return {
          symbol: item?.asset?.symbol,
          name: item?.asset?.name,
          lastUpdate: item?.last_update,
          ageMinutes,
          totalRecords: parseInt(item?.total_records),
          freshness: ageMinutes <= 15 ? 'fresh' : ageMinutes <= 60 ? 'stale' : 'very_stale'
        };
      }) || [];

      return {
        success: true,
        data: {
          assets: freshnessData,
          summary: {
            fresh: freshnessData?.filter(item => item?.freshness === 'fresh')?.length,
            stale: freshnessData?.filter(item => item?.freshness === 'stale')?.length,
            veryStale: freshnessData?.filter(item => item?.freshness === 'very_stale')?.length,
            totalAssets: freshnessData?.length
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get freshness metrics'
      };
    }
  }

  // Monitor data quality in real-time
  subscribeToQualityUpdates(callback) {
    const subscription = supabase?.channel('quality_updates')?.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'data_quality_checks'
      }, callback)?.subscribe();

    return subscription;
  }

  // Calculate overall health score
  calculateOverallHealthScore(totalIssues, totalAssets) {
    if (totalAssets === 0) return 1.0;
    
    const issueRatio = totalIssues / totalAssets;
    if (issueRatio <= 0.05) return 1.0;  // Excellent
    if (issueRatio <= 0.15) return 0.8;  // Good
    if (issueRatio <= 0.30) return 0.6;  // Fair
    if (issueRatio <= 0.50) return 0.4;  // Poor
    return 0.2; // Critical
  }

  // Get quality trend over time
  async getQualityTrend(days = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase?.from('data_quality_checks')?.select(`
          DATE(check_timestamp) as check_date,
          severity,
          COUNT(*) as issue_count
        `)?.gte('check_timestamp', startDate?.toISOString());

      if (error) {
        throw error;
      }

      const trendData = this.groupTrendData(data || []);

      return {
        success: true,
        data: {
          trend: trendData,
          period: `${days} days`,
          totalDataPoints: data?.length || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to get quality trend'
      };
    }
  }

  // Helper to group trend data
  groupTrendData(rawData) {
    const grouped = rawData?.reduce((acc, item) => {
      const date = item?.check_date;
      if (!acc?.[date]) {
        acc[date] = { date, critical: 0, high: 0, medium: 0, low: 0 };
      }
      acc[date][item?.severity] = parseInt(item?.issue_count);
      return acc;
    }, {});

    return Object.values(grouped)?.sort((a, b) => new Date(a?.date) - new Date(b?.date));
  }
}

export const dataQualityService = new DataQualityService();
export default dataQualityService;