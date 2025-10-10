import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Activity, TrendingUp, Clock, Zap, Play } from 'lucide-react';

export default function ProviderHealthPanel({ healthData, onProviderTest }) {
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResults, setTestResults] = useState({});

  const handleProviderTest = async (providerName) => {
    setTestingProvider(providerName);
    try {
      const result = await onProviderTest(providerName);
      setTestResults(prev => ({
        ...prev,
        [providerName]: result
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const getStatusIcon = (provider) => {
    if (!provider?.enabled) {
      return <XCircle className="w-5 h-5 text-gray-500" />;
    }
    
    if (provider?.circuit_breaker_state === 'OPEN') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (provider?.circuit_breaker_state === 'HALF_OPEN') {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    
    if (parseFloat(provider?.success_rate) > 90 && provider?.health_status === 'healthy') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (provider) => {
    if (!provider?.enabled) return 'text-gray-500';
    if (provider?.circuit_breaker_state === 'OPEN') return 'text-red-400';
    if (provider?.circuit_breaker_state === 'HALF_OPEN') return 'text-yellow-400';
    if (parseFloat(provider?.success_rate) > 90 && provider?.health_status === 'healthy') return 'text-green-400';
    return 'text-yellow-400';
  };

  const formatPriority = (priority) => {
    if (priority >= 90) return { text: 'High', color: 'text-green-400' };
    if (priority >= 70) return { text: 'Medium', color: 'text-yellow-400' };
    return { text: 'Low', color: 'text-gray-400' };
  };

  if (!healthData?.providers) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          Provider Health Status
        </h3>
        <p className="text-gray-400">No provider data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          Provider Health Status
        </h3>
        <div className="text-sm text-gray-400">
          {healthData?.providers?.filter(p => p?.enabled)?.length} enabled providers
        </div>
      </div>
      <div className="space-y-4">
        {healthData?.providers?.map((provider) => {
          const priorityInfo = formatPriority(provider?.priority);
          const testResult = testResults?.[provider?.name];
          
          return (
            <div
              key={provider?.name}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(provider)}
                  <div>
                    <h4 className="font-medium text-white">{provider?.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Priority: <span className={priorityInfo?.color}>{priorityInfo?.text}</span></span>
                      <span>Markets: {provider?.markets?.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleProviderTest(provider?.name)}
                  disabled={!provider?.enabled || testingProvider === provider?.name}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    provider?.enabled
                      ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800' :'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {testingProvider === provider?.name ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin inline mr-1" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 inline mr-1" />
                      Test
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className={`text-sm font-medium ${getStatusColor(provider)}`}>
                    {provider?.enabled ? provider?.circuit_breaker_state : 'DISABLED'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Success Rate</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-white">{provider?.success_rate}%</p>
                    <TrendingUp className={`w-3 h-3 ${
                      parseFloat(provider?.success_rate) > 90 ? 'text-green-500' : 
                      parseFloat(provider?.success_rate) > 70 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Avg Latency</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-white">{provider?.avg_latency_ms}ms</p>
                    <Clock className={`w-3 h-3 ${
                      provider?.avg_latency_ms < 1000 ? 'text-green-500' : 
                      provider?.avg_latency_ms < 2000 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Quota</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-white">{provider?.quota_remaining}</p>
                    <Zap className={`w-3 h-3 ${
                      provider?.quota_remaining > 100 ? 'text-green-500' : 
                      provider?.quota_remaining > 10 ? 'text-yellow-500' : 'text-red-500'
                    }`} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {provider?.total_requests} total requests
                </span>
                <span>
                  Last request: {provider?.last_request ? 
                    new Date(provider.last_request)?.toLocaleTimeString() : 'Never'
                  }
                </span>
              </div>
              {/* Test Result Display */}
              {testResult && (
                <div className={`mt-3 p-3 rounded border-l-4 ${
                  testResult?.success 
                    ? 'bg-green-900/30 border-green-500' :'bg-red-900/30 border-red-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${
                      testResult?.success ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Test {testResult?.data?.test_result?.toUpperCase()}
                    </p>
                    <span className="text-xs text-gray-400">
                      {testResult?.data?.response_time_ms}ms
                    </span>
                  </div>
                  {testResult?.data?.error && (
                    <p className="text-xs text-red-300 mt-1">{testResult?.data?.error}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">
              {healthData?.providers?.filter(p => p?.enabled && p?.circuit_breaker_state === 'CLOSED')?.length}
            </p>
            <p className="text-xs text-gray-400">Healthy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">
              {healthData?.providers?.filter(p => p?.circuit_breaker_state === 'HALF_OPEN')?.length}
            </p>
            <p className="text-xs text-gray-400">Recovering</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">
              {healthData?.providers?.filter(p => p?.circuit_breaker_state === 'OPEN')?.length}
            </p>
            <p className="text-xs text-gray-400">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );
}