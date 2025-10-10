import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function CircuitBreakerPanel({ healthData }) {
  const getCircuitBreakerStats = () => {
    if (!healthData?.providers?.length) {
      return { closed: 0, halfOpen: 0, open: 0 };
    }

    return healthData?.providers?.reduce((stats, provider) => {
      switch (provider?.circuit_breaker_state) {
        case 'CLOSED':
          stats.closed++;
          break;
        case 'HALF_OPEN':
          stats.halfOpen++;
          break;
        case 'OPEN':
          stats.open++;
          break;
      }
      return stats;
    }, { closed: 0, halfOpen: 0, open: 0 });
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'HALF_OPEN':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'OPEN':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStateColor = (state, enabled = true) => {
    if (!enabled) return 'text-gray-500';
    
    switch (state) {
      case 'CLOSED':
        return 'text-green-400';
      case 'HALF_OPEN':
        return 'text-yellow-400';
      case 'OPEN':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatStateDescription = (state) => {
    switch (state) {
      case 'CLOSED':
        return 'Normal operation - all requests allowed';
      case 'HALF_OPEN':
        return 'Testing recovery - limited requests allowed';
      case 'OPEN':
        return 'Failed state - no requests allowed';
      default:
        return 'Unknown state';
    }
  };

  const stats = getCircuitBreakerStats();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-orange-500" />
        Circuit Breaker Status
      </h3>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-900/30 rounded-lg p-4 text-center border border-green-700/50">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-400">{stats?.closed}</p>
          <p className="text-xs text-gray-400">Closed</p>
        </div>

        <div className="bg-yellow-900/30 rounded-lg p-4 text-center border border-yellow-700/50">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats?.halfOpen}</p>
          <p className="text-xs text-gray-400">Half-Open</p>
        </div>

        <div className="bg-red-900/30 rounded-lg p-4 text-center border border-red-700/50">
          <div className="flex items-center justify-center mb-2">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-400">{stats?.open}</p>
          <p className="text-xs text-gray-400">Open</p>
        </div>
      </div>
      {/* Provider Details */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Provider States</h4>
        
        {healthData?.providers?.length > 0 ? (
          healthData?.providers?.map((provider) => (
            <div
              key={provider?.name}
              className="bg-gray-700 rounded-lg p-3 border border-gray-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStateIcon(provider?.circuit_breaker_state)}
                  <div>
                    <h5 className="font-medium text-white">{provider?.name}</h5>
                    <p className={`text-sm ${getStateColor(provider?.circuit_breaker_state, provider?.enabled)}`}>
                      {provider?.enabled ? provider?.circuit_breaker_state : 'DISABLED'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    Success: {provider?.success_rate}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {provider?.total_requests} requests
                  </p>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-400">
                {formatStateDescription(provider?.circuit_breaker_state)}
              </div>

              {/* Progress bar for success rate */}
              <div className="mt-2">
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${
                      parseFloat(provider?.success_rate) > 90 ? 'bg-green-500' :
                      parseFloat(provider?.success_rate) > 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${provider?.success_rate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">No provider data available</p>
        )}
      </div>
      {/* Circuit Breaker Configuration Info */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Configuration</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Error Threshold:</span>{' '}
            <span className="text-white">30%</span>
          </div>
          <div>
            <span className="text-gray-400">Open Timeout:</span>{' '}
            <span className="text-white">60s</span>
          </div>
          <div>
            <span className="text-gray-400">Min Requests:</span>{' '}
            <span className="text-white">20</span>
          </div>
          <div>
            <span className="text-gray-400">Monitor Period:</span>{' '}
            <span className="text-white">5m</span>
          </div>
        </div>
      </div>
      {/* Health Indicator */}
      <div className="mt-4 flex items-center justify-center">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          stats?.open === 0 ? 'bg-green-900/50 text-green-400' : 
          stats?.open < stats?.closed ? 'bg-yellow-900/50 text-yellow-400' : 'bg-red-900/50 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            stats?.open === 0 ? 'bg-green-500' : 
            stats?.open < stats?.closed ? 'bg-yellow-500' : 'bg-red-500'
          } animate-pulse`}></div>
          <span>
            {stats?.open === 0 ? 'All Systems Operational' :
             stats?.open < stats?.closed ? 'Partial Service Degradation' : 'Critical Service Issues'}
          </span>
        </div>
      </div>
    </div>
  );
}