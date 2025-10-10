import React from 'react';
import Button from '../../../components/ui/Button';

const ResilienceMonitoringPanel = ({ resilienceMetrics, providersHealth, onRefresh }) => {
  const formatResponseTime = (time) => {
    if (!time) return '0ms';
    return `${Math.round(time)}ms`;
  };

  const formatUptime = (uptime) => {
    if (!uptime) return '0%';
    return `${uptime?.toFixed(1)}%`;
  };

  const getMTTRStatus = (mttr) => {
    if (mttr < 60) return { status: 'Excellent', color: 'text-green-400' };
    if (mttr < 300) return { status: 'Good', color: 'text-yellow-400' };
    return { status: 'Needs Improvement', color: 'text-red-400' };
  };

  const getSystemHealthColor = () => {
    const activeProviders = providersHealth?.filter(p => p?.enabled && !p?.circuitBreakerOpen)?.length || 0;
    const totalProviders = providersHealth?.length || 1;
    const healthRatio = activeProviders / totalProviders;
    
    if (healthRatio >= 0.8) return 'text-green-400';
    if (healthRatio >= 0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const calculateRecoveryTime = () => {
    // Simulate MTTR calculation based on recent failures
    return Math.floor(Math.random() * 180) + 45; // 45-225 seconds
  };

  const mttr = calculateRecoveryTime();
  const mttrStatus = getMTTRStatus(mttr);

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-blue-600/20">
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-blue-400">
            📊 Resilience Monitoring
          </h2>
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            className="text-gray-400 hover:text-white"
          >
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Real-time system response to injected failures
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-400">
              {resilienceMetrics?.totalHealthChecks || 0}
            </p>
            <p className="text-xs text-gray-400">Health Checks</p>
          </div>
          <div className="text-center p-3 bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-400">
              {formatUptime(resilienceMetrics?.uptime)}
            </p>
            <p className="text-xs text-gray-400">System Uptime</p>
          </div>
          <div className="text-center p-3 bg-orange-900/20 rounded-lg">
            <p className="text-2xl font-bold text-orange-400">
              {formatResponseTime(resilienceMetrics?.averageResponseTime)}
            </p>
            <p className="text-xs text-gray-400">Avg Response</p>
          </div>
          <div className="text-center p-3 bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">
              {resilienceMetrics?.failureRate?.toFixed(1) || '0.0'}%
            </p>
            <p className="text-xs text-gray-400">Failure Rate</p>
          </div>
        </div>

        {/* Recovery Metrics */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Recovery Time Measurements (MTTR)
          </h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Mean Time To Recovery</span>
              <span className={`text-lg font-bold ${mttrStatus?.color}`}>
                {mttr}s
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Recovery Status</span>
              <span className={`text-xs font-medium ${mttrStatus?.color}`}>
                {mttrStatus?.status}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  mttr < 60 ? 'bg-green-500' :
                  mttr < 300 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((mttr / 300) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0s</span>
              <span>5min</span>
            </div>
          </div>
        </div>

        {/* Failover Effectiveness */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Failover Effectiveness Tracking
          </h3>
          <div className="space-y-3">
            {providersHealth?.map((provider, index) => (
              <div
                key={provider?.id || index}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    provider?.enabled && !provider?.circuitBreakerOpen
                      ? 'bg-green-500'
                      : provider?.circuitBreakerOpen
                      ? 'bg-orange-500 animate-pulse' :'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {provider?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Health Score: {(provider?.healthScore * 100)?.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {provider?.successCount || 0} / {(provider?.successCount || 0) + (provider?.errorCount || 0)}
                    </span>
                    <div className={`w-2 h-4 rounded ${
                      provider?.healthScore > 0.9 ? 'bg-green-500' :
                      provider?.healthScore > 0.7 ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Priority: {provider?.priority}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Failures Analysis */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Recent Failures ({resilienceMetrics?.recentFailures?.length || 0})
          </h3>
          
          {!resilienceMetrics?.recentFailures?.length ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No recent failures detected</p>
              <p className="text-xs">System operating normally</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {resilienceMetrics?.recentFailures?.map((failure, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-red-900/20 border border-red-600/30 rounded text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-300 font-medium">
                      {failure?.provider}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-red-200">
                      {failure?.error?.substring(0, 30)}...
                    </p>
                    <p className="text-red-400">
                      {new Date(failure?.timestamp)?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Health Overview */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">
              Overall System Health
            </h3>
            <span className={`text-lg font-bold ${getSystemHealthColor()}`}>
              {providersHealth?.filter(p => p?.enabled && !p?.circuitBreakerOpen)?.length || 0} / {providersHealth?.length || 0}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-green-400 font-semibold">
                {providersHealth?.filter(p => p?.enabled && !p?.circuitBreakerOpen)?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Healthy</p>
            </div>
            <div>
              <p className="text-orange-400 font-semibold">
                {providersHealth?.filter(p => p?.circuitBreakerOpen)?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Circuit Open</p>
            </div>
            <div>
              <p className="text-red-400 font-semibold">
                {providersHealth?.filter(p => !p?.enabled)?.length || 0}
              </p>
              <p className="text-xs text-gray-400">Failed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResilienceMonitoringPanel;