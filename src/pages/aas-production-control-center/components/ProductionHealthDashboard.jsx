import React from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, BarChart3, Gauge, Zap, Clock, Target } from 'lucide-react';

const TrendIndicator = ({ current, previous }) => {
  if (previous === null || current === previous) return null;
  const isUp = current > previous;
  return (
    <span className={`ml-2 font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      {isUp ? '▲' : '▼'}
    </span>
  );
};

const ProductionHealthDashboard = ({ 
  systemHealth, 
  regimeState, 
  strategyCandidates = [], 
  prevHealth 
}) => {
  const getHealthModeStyle = () => {
    if (!systemHealth) return 'bg-gray-100 border-gray-300 text-gray-800';
    
    switch (systemHealth?.mode) {
      case 'normal':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getHealthIcon = () => {
    if (!systemHealth) return <Activity className="w-6 h-6 text-gray-400" />;
    
    switch (systemHealth?.mode) {
      case 'normal':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'critical':
        return <XCircle className="w-6 h-6 text-red-400" />;
      default:
        return <Activity className="w-6 h-6 text-gray-400" />;
    }
  };

  const calculateRegimeConfidence = () => {
    return regimeState?.confidence ? (regimeState?.confidence * 100)?.toFixed(1) : 'N/A';
  };

  const calculateStrategyMetrics = () => {
    if (!strategyCandidates?.length) {
      return { avgIQS: 0, topPerformers: 0, activePipeline: 0 };
    }

    const avgIQS = strategyCandidates?.reduce((sum, s) => sum + (s?.iqs || 0), 0) / strategyCandidates?.length;
    const topPerformers = strategyCandidates?.filter(s => (s?.iqs || 0) > 0.8)?.length;
    const activePipeline = strategyCandidates?.filter(s => ['testing', 'paper', 'canary', 'live']?.includes(s?.status))?.length;

    return { avgIQS, topPerformers, activePipeline };
  };

  const strategyMetrics = calculateStrategyMetrics();

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <Gauge className="w-5 h-5 mr-2 text-blue-400" />
          Production Health Dashboard
        </h3>
        <div className="flex items-center space-x-2">
          {getHealthIcon()}
          <span className="text-sm text-gray-400">Real-time Monitoring</span>
        </div>
      </div>
      {/* System Health Status */}
      <div className={`rounded-xl border p-4 mb-6 ${getHealthModeStyle()}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-lg">System Health Status</h4>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              {systemHealth ? (systemHealth?.dhi_avg * 100)?.toFixed(1) : '--'}%
            </span>
            <TrendIndicator 
              current={systemHealth?.dhi_avg} 
              previous={prevHealth?.dhi_avg} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Mode: {systemHealth?.mode || 'Unknown'}</p>
            <p className="text-xs opacity-80">
              Active Kill Switches: {systemHealth?.active_switches || 0}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">
              Pipeline: {systemHealth?.strategy_pipeline || 0} strategies
            </p>
            <p className="text-xs opacity-80">
              {new Date()?.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Market Regime */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Market Regime</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-white capitalize">
              {regimeState?.regime?.replace('_', ' ') || 'Detecting...'}
            </p>
            <p className="text-sm text-gray-400">
              Confidence: {calculateRegimeConfidence()}%
            </p>
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Avg Strategy IQS</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {(strategyMetrics?.avgIQS * 100)?.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">
              {strategyMetrics?.topPerformers} top performers
            </p>
          </div>
        </div>

        {/* Active Pipeline */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Active Pipeline</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-white">
              {strategyMetrics?.activePipeline}
            </p>
            <p className="text-sm text-gray-400">
              strategies in testing
            </p>
          </div>
        </div>

        {/* System Uptime */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">System Uptime</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-white">99.7%</p>
            <p className="text-sm text-gray-400">Last 24h</p>
          </div>
        </div>
      </div>
      {/* Performance Indicators */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-gray-300">Performance Indicators</h4>
        
        {/* Data Health Index */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Data Health Index (DHI)</span>
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (systemHealth?.dhi_avg || 0) > 0.8 ? 'bg-green-500' :
                  (systemHealth?.dhi_avg || 0) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(systemHealth?.dhi_avg || 0) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white w-12">
              {systemHealth ? (systemHealth?.dhi_avg * 100)?.toFixed(1) : '--'}%
            </span>
          </div>
        </div>

        {/* Regime Confidence */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Regime Confidence</span>
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-purple-500"
                style={{ width: `${(regimeState?.confidence || 0) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white w-12">
              {calculateRegimeConfidence()}%
            </span>
          </div>
        </div>

        {/* Strategy Success Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Strategy Success Rate</span>
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${strategyMetrics?.avgIQS * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white w-12">
              {(strategyMetrics?.avgIQS * 100)?.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      {/* System Alerts */}
      {systemHealth?.mode !== 'normal' && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className={`p-4 rounded-lg border ${
            systemHealth?.mode === 'critical' ?'bg-red-900/20 border-red-500' :'bg-yellow-900/20 border-yellow-500'
          }`}>
            <div className="flex items-center space-x-3">
              {systemHealth?.mode === 'critical' ? (
                <XCircle className="w-5 h-5 text-red-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <h5 className={`font-semibold ${
                  systemHealth?.mode === 'critical' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {systemHealth?.mode === 'critical' ? 'Critical System State' : 'System Degraded'}
                </h5>
                <p className={`text-sm ${
                  systemHealth?.mode === 'critical' ? 'text-red-300' : 'text-yellow-300'
                }`}>
                  {systemHealth?.mode === 'critical' ?'Immediate attention required. Consider emergency protocols.' :'System performance below optimal levels. Monitor closely.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Market Regime Details */}
      {regimeState?.drivers && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-lg font-medium mb-3 text-gray-300">Market Drivers</h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(regimeState?.drivers)?.map(([key, value]) => (
              <div key={key} className="bg-gray-900/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{key}</p>
                <p className="text-sm font-medium text-white capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionHealthDashboard;