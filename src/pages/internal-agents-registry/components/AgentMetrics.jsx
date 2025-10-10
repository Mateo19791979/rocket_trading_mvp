import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Cpu, HardDrive } from 'lucide-react';
import { internalAgentsService } from '../../../services/internalAgentsService.js';

export default function AgentMetrics({ selectedAgent, agents }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(50);

  const loadMetrics = async () => {
    if (!selectedAgent?.name) return;
    
    setLoading(true);
    try {
      const data = await internalAgentsService?.getAgentMetrics(selectedAgent?.name, timeRange);
      setMetrics(data || []);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [selectedAgent, timeRange]);

  const getLatestMetric = (key) => {
    if (!metrics?.length) return null;
    const latest = metrics?.[0]?.kpi;
    return latest?.[key] ?? null;
  };

  const formatMetricValue = (value, unit = '') => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return `${value?.toFixed(2)}${unit}`;
    }
    return String(value);
  };

  const getMetricTrend = (key) => {
    if (metrics?.length < 2) return 0;
    const current = metrics?.[0]?.kpi?.[key];
    const previous = metrics?.[1]?.kpi?.[key];
    
    if (typeof current !== 'number' || typeof previous !== 'number') return 0;
    return current - previous;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <Activity className="w-4 h-4" />;
  };

  if (!selectedAgent) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Agent Metrics</h2>
          <p className="text-gray-600 text-sm mt-1">Select an agent to view metrics</p>
        </div>
        <div className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Choose an agent from the grid to see performance metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agent Metrics</h2>
            <p className="text-gray-600 text-sm mt-1">{selectedAgent?.name}</p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e?.target?.value))}
            className="border border-gray-200 rounded px-3 py-1 text-sm"
          >
            <option value={20}>Last 20 entries</option>
            <option value={50}>Last 50 entries</option>
            <option value={100}>Last 100 entries</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading metrics...</p>
        </div>
      ) : metrics?.length === 0 ? (
        <div className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Metrics Available</h3>
          <p className="text-gray-600">This agent hasn't reported any metrics yet.</p>
        </div>
      ) : (
        <div className="p-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* CPU Usage */}
            {getLatestMetric('cpu') !== null && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">CPU</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(getMetricTrend('cpu'))}`}>
                    {getTrendIcon(getMetricTrend('cpu'))}
                    <span className="text-xs">
                      {getMetricTrend('cpu')?.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatMetricValue(getLatestMetric('cpu'), '%')}
                </p>
              </div>
            )}

            {/* Memory Usage */}
            {getLatestMetric('mem_mb') !== null && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Memory</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(getMetricTrend('mem_mb'))}`}>
                    {getTrendIcon(getMetricTrend('mem_mb'))}
                    <span className="text-xs">
                      {formatMetricValue(getMetricTrend('mem_mb'), 'MB')}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatMetricValue(getLatestMetric('mem_mb'), ' MB')}
                </p>
              </div>
            )}

            {/* Sharpe Ratio (if available) */}
            {getLatestMetric('sharpe') !== null && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Sharpe</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(getMetricTrend('sharpe'))}`}>
                    {getTrendIcon(getMetricTrend('sharpe'))}
                    <span className="text-xs">
                      {getMetricTrend('sharpe')?.toFixed(3)}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {formatMetricValue(getLatestMetric('sharpe'))}
                </p>
              </div>
            )}
          </div>

          {/* Recent Metrics History */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {metrics?.slice(0, 10)?.map((metric, index) => (
                <div key={metric?.id || index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(metric?.ts)?.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(metric?.ts)?.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(metric?.kpi || {})?.map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-mono text-gray-900">
                          {formatMetricValue(value, key === 'cpu' ? '%' : key === 'mem_mb' ? 'MB' : '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}