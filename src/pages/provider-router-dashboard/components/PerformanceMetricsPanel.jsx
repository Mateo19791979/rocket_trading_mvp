import React from 'react';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function PerformanceMetricsPanel({ healthData, systemStatus }) {
  const calculateAverageLatency = () => {
    if (!healthData?.providers?.length) return 0;
    
    const activeProviders = healthData?.providers?.filter(p => p?.enabled && p?.total_requests > 0);
    if (activeProviders?.length === 0) return 0;
    
    const totalLatency = activeProviders?.reduce((sum, p) => sum + (p?.avg_latency_ms || 0), 0);
    return Math.round(totalLatency / activeProviders?.length);
  };

  const calculateOverallSuccessRate = () => {
    if (!healthData?.providers?.length) return 0;
    
    const activeProviders = healthData?.providers?.filter(p => p?.enabled);
    if (activeProviders?.length === 0) return 0;
    
    const totalSuccessRate = activeProviders?.reduce((sum, p) => sum + parseFloat(p?.success_rate || 0), 0);
    return Math.round(totalSuccessRate / activeProviders?.length);
  };

  const getTotalRequests = () => {
    if (!healthData?.providers?.length) return 0;
    return healthData?.providers?.reduce((sum, p) => sum + (p?.total_requests || 0), 0);
  };

  const getActiveCircuitBreakers = () => {
    if (!healthData?.providers?.length) return 0;
    return healthData?.providers?.filter(p => p?.circuit_breaker_state === 'OPEN')?.length;
  };

  const metrics = [
    {
      label: 'Average Latency',
      value: `${calculateAverageLatency()}ms`,
      icon: Clock,
      color: calculateAverageLatency() < 1000 ? 'text-green-400' : 
             calculateAverageLatency() < 2000 ? 'text-yellow-400' : 'text-red-400',
      bgColor: calculateAverageLatency() < 1000 ? 'bg-green-900/30' : 
               calculateAverageLatency() < 2000 ? 'bg-yellow-900/30' : 'bg-red-900/30'
    },
    {
      label: 'Success Rate',
      value: `${calculateOverallSuccessRate()}%`,
      icon: TrendingUp,
      color: calculateOverallSuccessRate() > 90 ? 'text-green-400' : 
             calculateOverallSuccessRate() > 70 ? 'text-yellow-400' : 'text-red-400',
      bgColor: calculateOverallSuccessRate() > 90 ? 'bg-green-900/30' : 
               calculateOverallSuccessRate() > 70 ? 'bg-yellow-900/30' : 'bg-red-900/30'
    },
    {
      label: 'Total Requests',
      value: getTotalRequests()?.toLocaleString(),
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30'
    },
    {
      label: 'Circuit Breakers',
      value: getActiveCircuitBreakers(),
      icon: Zap,
      color: getActiveCircuitBreakers() === 0 ? 'text-green-400' : 'text-red-400',
      bgColor: getActiveCircuitBreakers() === 0 ? 'bg-green-900/30' : 'bg-red-900/30'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-purple-500" />
        Performance Metrics
      </h3>
      <div className="space-y-4">
        {metrics?.map((metric, index) => {
          const Icon = metric?.icon;
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border border-gray-600 ${metric?.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${metric?.color}`} />
                  <span className="text-sm text-gray-300">{metric?.label}</span>
                </div>
                <span className={`text-xl font-bold ${metric?.color}`}>
                  {metric?.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {/* System Performance */}
      {systemStatus && (
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h4 className="text-sm font-medium text-gray-400 mb-3">System Performance</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">Memory Usage</p>
              <p className="text-sm font-medium text-white">
                {Math.round(systemStatus?.memory_usage?.heapUsed / 1024 / 1024)}MB
              </p>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-400 h-1 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (systemStatus?.memory_usage?.heapUsed / systemStatus?.memory_usage?.heapTotal) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">Uptime</p>
              <p className="text-sm font-medium text-white">
                {Math.floor(systemStatus?.uptime / 3600)}h {Math.floor((systemStatus?.uptime % 3600) / 60)}m
              </p>
              <p className="text-xs text-green-400 mt-1">
                {systemStatus?.health_score}/100 Health Score
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Performance Trends */}
      {healthData?.providers && (
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Provider Performance</h4>
          
          <div className="space-y-2">
            {healthData?.providers?.filter(p => p?.enabled)?.sort((a, b) => parseFloat(b?.success_rate) - parseFloat(a?.success_rate))?.slice(0, 3)?.map((provider, index) => (
                <div key={provider?.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-green-500' : 
                      index === 1 ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-300">{provider?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span>{provider?.success_rate}%</span>
                    <span>•</span>
                    <span>{provider?.avg_latency_ms}ms</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}