import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { providerConfigurationService } from '../../../services/providerConfigurationService';

const QuotaMonitoringPanel = ({ providers = [], providerStats = [] }) => {
  const [quotaData, setQuotaData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  useEffect(() => {
    loadQuotaData();
  }, [providers, selectedTimeframe]);

  const loadQuotaData = async () => {
    if (!providers?.length) return;

    try {
      setLoading(true);
      const quotaPromises = providers
        ?.filter(p => p?.is_active)
        ?.map(async (provider) => {
          try {
            const usage = await providerConfigurationService?.getQuotaUsage(provider?.api_name);
            return { provider: provider?.api_name, ...usage };
          } catch (error) {
            return { 
              provider: provider?.api_name, 
              totalCalls: 0, 
              successfulCalls: 0, 
              failedCalls: 0, 
              successRate: 0 
            };
          }
        });

      const results = await Promise.all(quotaPromises || []);
      const quotaMap = {};
      results?.forEach(result => {
        if (result?.provider) {
          quotaMap[result?.provider] = result;
        }
      });
      
      setQuotaData(quotaMap);
    } catch (error) {
      console.error('Error loading quota data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuotaUsagePercentage = (provider) => {
    const usage = quotaData?.[provider?.api_name];
    const rateLimit = provider?.rate_limit_per_minute || 60;
    const dailyLimit = rateLimit * 60 * 24; // Estimated daily limit
    
    return usage?.totalCalls ? Math.min((usage?.totalCalls / dailyLimit) * 100, 100) : 0;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-orange-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getUsageBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold">Quota Monitoring Dashboard</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e?.target?.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <button
            onClick={loadQuotaData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded-lg flex items-center gap-2 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {/* Usage Overview */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Daily Usage & Limits
        </h3>

        {providers?.filter(p => p?.is_active)?.map(provider => {
          const usage = quotaData?.[provider?.api_name] || {};
          const usagePercentage = getQuotaUsagePercentage(provider);
          const stat = providerStats?.find(s => s?.provider_name === provider?.api_name);
          
          return (
            <div key={provider?.id} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    stat?.current_status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <h4 className="font-medium">
                    {provider?.api_name?.replace('_', ' ')?.toUpperCase()}
                  </h4>
                </div>
                
                <div className="flex items-center gap-2">
                  {usagePercentage >= 90 ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  <span className={`text-sm font-medium ${getUsageColor(usagePercentage)}`}>
                    {usagePercentage?.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Usage Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(usagePercentage)}`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Calls</p>
                  <p className="font-semibold text-white">{usage?.totalCalls || 0}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Successful</p>
                  <p className="font-semibold text-green-400">{usage?.successfulCalls || 0}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Failed</p>
                  <p className="font-semibold text-red-400">{usage?.failedCalls || 0}</p>
                </div>
                
                <div>
                  <p className="text-gray-400">Success Rate</p>
                  <p className="font-semibold text-blue-400">{(usage?.successRate || 0)?.toFixed(1)}%</p>
                </div>
              </div>

              {/* Rate Limit Info */}
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Rate Limit: {provider?.rate_limit_per_minute} calls/min</span>
                  <span>Est. Daily Limit: {(provider?.rate_limit_per_minute * 60 * 24)?.toLocaleString()}</span>
                </div>
              </div>

              {/* Renewal Date */}
              <div className="mt-2 text-xs text-gray-500">
                Quota resets: Daily at 00:00 UTC
              </div>
            </div>
          );
        })}
      </div>
      {/* Alert Thresholds */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Alert Thresholds
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-300">Warning: 50% usage</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-gray-300">Critical: 70% usage</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-300">Emergency: 90% usage</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaMonitoringPanel;