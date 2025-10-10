import React, { useState, useEffect } from 'react';
import { Clock, BarChart3, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { providerConfigurationService } from '../../../services/providerConfigurationService';

const LatencyValidationPanel = ({ providers = [], providerStats = [] }) => {
  const [latencyData, setLatencyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(24);

  useEffect(() => {
    loadLatencyData();
  }, [providers, timeRange]);

  const loadLatencyData = async () => {
    if (!providers?.length) return;

    try {
      setLoading(true);
      const latencyPromises = providers
        ?.filter(p => p?.is_active)
        ?.map(async (provider) => {
          try {
            const data = await providerConfigurationService?.getLatencyData(provider?.api_name, timeRange);
            return { provider: provider?.api_name, data };
          } catch (error) {
            return { provider: provider?.api_name, data: [] };
          }
        });

      const results = await Promise.all(latencyPromises || []);
      const latencyMap = {};
      results?.forEach(result => {
        if (result?.provider) {
          latencyMap[result?.provider] = result?.data || [];
        }
      });
      
      setLatencyData(latencyMap);
    } catch (error) {
      console.error('Error loading latency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLatencyStats = (provider) => {
    const data = latencyData?.[provider?.api_name] || [];
    if (!data?.length) return null;

    const responseTimes = data?.map(d => d?.response_time_ms)?.filter(rt => rt != null);
    if (!responseTimes?.length) return null;

    const avg = responseTimes?.reduce((sum, rt) => sum + rt, 0) / responseTimes?.length;
    const min = Math.min(...responseTimes);
    const max = Math.max(...responseTimes);
    
    return { avg, min, max, count: responseTimes?.length };
  };

  const getLatencyColor = (avgLatency) => {
    if (avgLatency < 200) return 'text-green-400';
    if (avgLatency < 400) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyIcon = (avgLatency) => {
    if (avgLatency < 200) return CheckCircle;
    if (avgLatency < 400) return AlertTriangle;
    return XCircle;
  };

  const getLatencyBadgeColor = (avgLatency) => {
    if (avgLatency < 200) return 'bg-green-900/50 text-green-400';
    if (avgLatency < 400) return 'bg-yellow-900/50 text-yellow-400';
    return 'bg-red-900/50 text-red-400';
  };

  const formatLatency = (ms) => {
    return ms ? `${Math.round(ms)}ms` : 'N/A';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold">Latency Validation & Monitoring</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e?.target?.value))}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Last Hour</option>
            <option value={6}>Last 6 Hours</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last Week</option>
          </select>
          
          <button
            onClick={loadLatencyData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded-lg flex items-center gap-2 text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      {/* Latency Target Guidelines */}
      <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Response Time Targets (&lt;400ms Goal)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-300">Excellent: &lt; 200ms</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-300">Good: 200-400ms</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-300">Poor: &gt; 400ms</span>
          </div>
        </div>
      </div>
      {/* Provider Latency Cards */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Historical Performance Charts
        </h3>

        {providers?.filter(p => p?.is_active)?.map(provider => {
          const stats = calculateLatencyStats(provider);
          const providerStat = providerStats?.find(s => s?.provider_name === provider?.api_name);
          const avgLatency = stats?.avg || providerStat?.avg_response_time || 0;
          const LatencyIcon = getLatencyIcon(avgLatency);
          
          return (
            <div key={provider?.id} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <LatencyIcon className={`w-5 h-5 ${getLatencyColor(avgLatency)}`} />
                  <h4 className="font-medium">
                    {provider?.api_name?.replace('_', ' ')?.toUpperCase()}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLatencyBadgeColor(avgLatency)}`}>
                    {avgLatency < 200 ? 'Excellent' : avgLatency < 400 ? 'Good' : 'Poor'}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${getLatencyColor(avgLatency)}`}>
                    {formatLatency(avgLatency)}
                  </div>
                  <div className="text-xs text-gray-400">Average</div>
                </div>
              </div>

              {/* Latency Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Min Response</p>
                  <p className="font-semibold text-green-400">
                    {formatLatency(stats?.min)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400">Max Response</p>
                  <p className="font-semibold text-red-400">
                    {formatLatency(stats?.max)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400">Total Checks</p>
                  <p className="font-semibold text-blue-400">
                    {stats?.count || 0}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400">Target Compliance</p>
                  <p className={`font-semibold ${avgLatency <= 400 ? 'text-green-400' : 'text-red-400'}`}>
                    {avgLatency <= 400 ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              </div>

              {/* Simple Performance Indicator */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>0ms</span>
                  <span>400ms target</span>
                  <span>800ms+</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      avgLatency < 200 ? 'bg-green-500' :
                      avgLatency < 400 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min((avgLatency / 800) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Automated Health Checks */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="font-medium">Automated Health Checks</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Check Frequency</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Connectivity tests every 5 minutes</li>
              <li>• Latency measurements on each call</li>
              <li>• Automatic failover on 3 consecutive failures</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Alert Conditions</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Response time &gt; 400ms</li>
              <li>• Connection timeout (&gt; 10s)</li>
              <li>• HTTP errors (4xx, 5xx)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatencyValidationPanel;