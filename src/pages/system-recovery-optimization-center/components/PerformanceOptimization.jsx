import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Activity, 
  Cpu, 
  HardDrive, 
  Network,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Settings,
  BarChart3,
  CheckCircle
} from 'lucide-react';

export default function PerformanceOptimization({ metrics, onOptimizationAction }) {
  const [activeTab, setActiveTab] = useState('realtime');
  const [optimizing, setOptimizing] = useState({});

  const handleOptimization = async (optimizationType) => {
    setOptimizing(prev => ({ ...prev, [optimizationType]: true }));
    
    // Mock optimization process
    setTimeout(() => {
      setOptimizing(prev => ({ ...prev, [optimizationType]: false }));
      if (onOptimizationAction) {
        onOptimizationAction();
      }
    }, 2000);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3 text-red-400" />;
      case 'down':
        return <ArrowDown className="w-3 h-3 text-green-400" />;
      default:
        return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const getPerformanceColor = (value, thresholds) => {
    if (value <= thresholds?.good) return 'text-green-400';
    if (value <= thresholds?.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceBarColor = (value, thresholds) => {
    if (value <= thresholds?.good) return 'bg-green-400';
    if (value <= thresholds?.warning) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center space-x-3">
        <Zap className="w-6 h-6 text-yellow-400" />
        <span>Performance Optimization</span>
      </h2>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-700/30 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'realtime' ?'bg-slate-600 text-white' :'text-slate-400 hover:text-white'
          }`}
        >
          Real-time Metrics
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'recommendations' ?'bg-slate-600 text-white' :'text-slate-400 hover:text-white'
          }`}
        >
          Recommendations
        </button>
      </div>

      {activeTab === 'realtime' && (
        <div className="space-y-6">
          {/* API Response Times */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>API Response Times</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Average</span>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${
                    getPerformanceColor(metrics?.apiResponseTimes?.current, { good: 200, warning: 500 })
                  }`}>
                    {metrics?.apiResponseTimes?.current || 0}ms
                  </span>
                  {getTrendIcon(metrics?.apiResponseTimes?.trend)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Samples</span>
                <span className="text-slate-400 text-sm">
                  {metrics?.apiResponseTimes?.samples || 0} requests analyzed
                </span>
              </div>

              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-full transition-all ${
                    getPerformanceBarColor(metrics?.apiResponseTimes?.current, { good: 200, warning: 500 })
                  }`}
                  style={{ 
                    width: `${Math.min(100, (metrics?.apiResponseTimes?.current || 0) / 10)}%` 
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => handleOptimization('api_cache')}
              disabled={optimizing?.api_cache}
              className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm transition-colors"
            >
              {optimizing?.api_cache ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              <span>Optimize API Caching</span>
            </button>
          </div>

          {/* WebSocket Throughput */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span>WebSocket Throughput</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {metrics?.websocketThroughput?.messagesPerSecond || 0}
                </div>
                <div className="text-xs text-slate-400">Messages/sec</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-400">
                  {Math.round((metrics?.websocketThroughput?.bytesPerSecond || 0) / 1024)}KB
                </div>
                <div className="text-xs text-slate-400">Bytes/sec</div>
              </div>
            </div>

            <div className="text-center text-sm text-slate-400 mb-3">
              {metrics?.websocketThroughput?.connectionCount || 0} active connections
            </div>

            <button
              onClick={() => handleOptimization('websocket_pool')}
              disabled={optimizing?.websocket_pool}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-sm transition-colors"
            >
              {optimizing?.websocket_pool ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              <span>Optimize Connection Pool</span>
            </button>
          </div>

          {/* System Resource Utilization */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <span>System Resources</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        getPerformanceBarColor(metrics?.systemResources?.cpu, { good: 50, warning: 80 })
                      }`}
                      style={{ width: `${Math.min(100, metrics?.systemResources?.cpu || 0)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    getPerformanceColor(metrics?.systemResources?.cpu, { good: 50, warning: 80 })
                  }`}>
                    {metrics?.systemResources?.cpu || 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Memory Usage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        getPerformanceBarColor(metrics?.systemResources?.memory, { good: 60, warning: 85 })
                      }`}
                      style={{ width: `${Math.min(100, metrics?.systemResources?.memory || 0)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    getPerformanceColor(metrics?.systemResources?.memory, { good: 60, warning: 85 })
                  }`}>
                    {metrics?.systemResources?.memory || 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Disk Usage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        getPerformanceBarColor(metrics?.systemResources?.disk, { good: 70, warning: 90 })
                      }`}
                      style={{ width: `${Math.min(100, metrics?.systemResources?.disk || 0)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    getPerformanceColor(metrics?.systemResources?.disk, { good: 70, warning: 90 })
                  }`}>
                    {metrics?.systemResources?.disk || 0}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOptimization('resource_scaling')}
              disabled={optimizing?.resource_scaling}
              className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded text-sm transition-colors"
            >
              {optimizing?.resource_scaling ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span>Auto-Scale Resources</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {metrics?.recommendations?.length > 0 ? (
            metrics?.recommendations?.map((rec, index) => (
              <div 
                key={index}
                className={`bg-slate-700/30 rounded-lg p-4 border-l-4 ${
                  rec?.priority === 'high' ? 'border-red-400' :
                  rec?.priority === 'medium' ? 'border-yellow-400' : 'border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-white mb-1">{rec?.title}</h4>
                    <p className="text-sm text-slate-300 mb-2">{rec?.description}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      rec?.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      rec?.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {rec?.priority?.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <button
                    onClick={() => handleOptimization(rec?.type)}
                    disabled={optimizing?.[rec?.type]}
                    className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs font-medium transition-colors"
                  >
                    {optimizing?.[rec?.type] ? 'Applying...' : 'Apply Fix'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-700/30 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Performance Optimized</h3>
              <p className="text-slate-400">
                No performance issues detected. Your system is running efficiently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}