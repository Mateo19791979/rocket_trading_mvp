import React, { useState } from 'react';
import { BarChart3, TrendingUp, Brain, Target, Activity, Users, Zap, Award, ArrowUp, ArrowDown, Minus, PieChart } from 'lucide-react';

const AdvancedAnalyticsCenter = ({ 
  metaLearningMetrics = [], 
  strategyCandidates = [], 
  regimeState 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('success_rate');

  const timeframes = [
    { value: '1h', label: '1H' },
    { value: '6h', label: '6H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' }
  ];

  const metrics = [
    { value: 'success_rate', label: 'Success Rate', icon: Target },
    { value: 'cost_efficiency', label: 'Cost Efficiency', icon: TrendingUp },
    { value: 'latency_ms', label: 'Latency', icon: Zap }
  ];

  // Calculate analytics
  const calculateMetaLearningStats = () => {
    if (!metaLearningMetrics?.length) {
      return { avgSuccess: 0, avgCost: 0, avgLatency: 0, topAgent: 'N/A' };
    }

    const avgSuccess = metaLearningMetrics?.reduce((sum, m) => sum + (m?.success_rate || 0), 0) / metaLearningMetrics?.length;
    const avgCost = metaLearningMetrics?.reduce((sum, m) => sum + (m?.cost_efficiency || 0), 0) / metaLearningMetrics?.length;
    const avgLatency = metaLearningMetrics?.reduce((sum, m) => sum + (m?.latency_ms || 0), 0) / metaLearningMetrics?.length;
    
    const topAgent = metaLearningMetrics?.reduce((best, current) => 
      (current?.success_rate || 0) > (best?.success_rate || 0) ? current : best
    );

    return { avgSuccess, avgCost, avgLatency, topAgent: topAgent?.agent || 'N/A' };
  };

  const calculateStrategyDistribution = () => {
    if (!strategyCandidates?.length) return {};

    const distribution = strategyCandidates?.reduce((acc, strategy) => {
      acc[strategy.status] = (acc?.[strategy?.status] || 0) + 1;
      return acc;
    }, {});

    return distribution;
  };

  const calculatePerformanceTrend = () => {
    if (!strategyCandidates?.length) return { direction: 'stable', change: 0 };

    const recent = strategyCandidates?.slice(0, 10);
    const older = strategyCandidates?.slice(10, 20);

    if (recent?.length === 0 || older?.length === 0) {
      return { direction: 'stable', change: 0 };
    }

    const recentAvg = recent?.reduce((sum, s) => sum + (s?.iqs || 0), 0) / recent?.length;
    const olderAvg = older?.reduce((sum, s) => sum + (s?.iqs || 0), 0) / older?.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

    return { direction, change: Math.abs(change) };
  };

  const metaStats = calculateMetaLearningStats();
  const strategyDistribution = calculateStrategyDistribution();
  const performanceTrend = calculatePerformanceTrend();

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-orange-400" />
          Advanced Analytics Center
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e?.target?.value)}
            className="bg-gray-900 border border-gray-600 rounded px-3 py-1 text-white text-sm"
          >
            {timeframes?.map(tf => (
              <option key={tf?.value} value={tf?.value}>{tf?.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Meta-Learning Performance */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-300 flex items-center">
          <Brain className="w-4 h-4 mr-2" />
          Meta-Learning Performance
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Success Rate</span>
              {getTrendIcon(performanceTrend?.direction)}
            </div>
            <div className="text-2xl font-bold text-white">
              {(metaStats?.avgSuccess * 100)?.toFixed(1)}%
            </div>
            <div className={`text-xs ${getTrendColor(performanceTrend?.direction)}`}>
              {performanceTrend?.change?.toFixed(1)}% vs previous period
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Cost Efficiency</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metaStats?.avgCost?.toFixed(2)}x
            </div>
            <div className="text-xs text-gray-400">Target: 1.0x</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Latency</span>
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {metaStats?.avgLatency?.toFixed(0)}ms
            </div>
            <div className="text-xs text-gray-400">Target: &lt;200ms</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Top Performer</span>
              <Award className="w-4 h-4 text-gold-400" />
            </div>
            <div className="text-lg font-bold text-white capitalize">
              {metaStats?.topAgent?.replace('_', ' ')}
            </div>
            <div className="text-xs text-gray-400">Best success rate</div>
          </div>
        </div>
      </div>
      {/* Strategy Pipeline Analysis */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-300 flex items-center">
          <PieChart className="w-4 h-4 mr-2" />
          Strategy Pipeline Analysis
        </h4>
        <div className="space-y-3">
          {['pending', 'testing', 'paper', 'canary', 'live', 'rejected']?.map(status => {
            const count = strategyDistribution?.[status] || 0;
            const total = strategyCandidates?.length || 1;
            const percentage = (count / total) * 100;
            
            const statusColors = {
              pending: 'bg-gray-500',
              testing: 'bg-purple-500',
              paper: 'bg-blue-500',
              canary: 'bg-yellow-500',
              live: 'bg-green-500',
              rejected: 'bg-red-500'
            };

            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors?.[status]}`} />
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {status}
                  </span>
                  <span className="text-sm text-gray-400">({count})</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${statusColors?.[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">
                    {percentage?.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Agent Performance Breakdown */}
      {metaLearningMetrics?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-3 text-gray-300 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Agent Performance Breakdown
          </h4>
          <div className="space-y-2">
            {metaLearningMetrics?.slice(0, 5)?.map((metric, index) => (
              <div key={metric?.id} className="flex items-center justify-between bg-gray-900/30 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-gold-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-600 text-black': 'bg-gray-700 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white capitalize">
                      {metric?.agent?.replace('_', ' ')}
                    </span>
                    <div className="text-xs text-gray-400">
                      {metric?.algo || 'N/A'} • {metric?.latency_ms || 0}ms
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {(metric?.success_rate * 100)?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    Efficiency: {metric?.cost_efficiency?.toFixed(2) || 'N/A'}x
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Real-time Metrics */}
      <div className="pt-4 border-t border-gray-700">
        <h4 className="text-lg font-medium mb-3 text-gray-300 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Real-time Metrics
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {metaLearningMetrics?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {strategyCandidates?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Total Strategies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {strategyCandidates?.filter(s => s?.status === 'live')?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Live Strategies</div>
          </div>
        </div>
      </div>
      {/* Market Regime Impact */}
      {regimeState && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-lg font-medium mb-3 text-gray-300">Market Regime Impact</h4>
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white capitalize">
                  Current Regime: {regimeState?.regime?.replace('_', ' ')}
                </span>
                <div className="text-xs text-gray-400">
                  Confidence: {(regimeState?.confidence * 100)?.toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300">
                  Strategy Adaptation
                </div>
                <div className="text-xs text-gray-400">
                  Optimized for current regime
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAnalyticsCenter;