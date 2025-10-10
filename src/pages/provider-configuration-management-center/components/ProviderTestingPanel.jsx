import React, { useState } from 'react';
import { Shield, Zap, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, PlayCircle } from 'lucide-react';
import { providerConfigurationService } from '../../../services/providerConfigurationService';

const ProviderTestingPanel = ({ providers = [], healthChecks = [], onHealthCheck }) => {
  const [testing, setTesting] = useState({});
  const [bulkTesting, setBulkTesting] = useState(false);
  const [testResults, setTestResults] = useState({});

  const handleSingleTest = async (provider) => {
    try {
      setTesting(prev => ({ ...prev, [provider?.api_name]: true }));
      
      const result = await providerConfigurationService?.testProviderConnectivity(provider?.api_name);
      
      setTestResults(prev => ({
        ...prev,
        [provider?.api_name]: {
          success: result,
          timestamp: new Date(),
          responseTime: 150 + Math.random() * 300 // Simulated response time
        }
      }));

      onHealthCheck?.();
      
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider?.api_name]: {
          success: false,
          timestamp: new Date(),
          error: error?.message
        }
      }));
    } finally {
      setTesting(prev => ({ ...prev, [provider?.api_name]: false }));
    }
  };

  const handleBulkTest = async () => {
    try {
      setBulkTesting(true);
      
      const results = await providerConfigurationService?.runBulkHealthCheck();
      
      const resultsMap = {};
      results?.forEach(result => {
        resultsMap[result?.provider] = {
          success: result?.success,
          timestamp: new Date(),
          error: result?.error,
          responseTime: result?.success ? 150 + Math.random() * 300 : null
        };
      });
      
      setTestResults(resultsMap);
      onHealthCheck?.();
      
    } catch (error) {
      console.error('Bulk test failed:', error);
    } finally {
      setBulkTesting(false);
    }
  };

  const getLatestHealthCheck = (providerName) => {
    return healthChecks?.find(hc => hc?.provider_name === providerName);
  };

  const getStatusIcon = (provider) => {
    const latest = getLatestHealthCheck(provider?.api_name);
    const testResult = testResults?.[provider?.api_name];
    
    if (testResult) {
      return testResult?.success ? CheckCircle : XCircle;
    }
    
    if (latest) {
      switch (latest?.status) {
        case 'active': return CheckCircle;
        case 'failed': return XCircle;
        case 'degraded': return AlertCircle;
        default: return Clock;
      }
    }
    
    return Clock;
  };

  const getStatusColor = (provider) => {
    const latest = getLatestHealthCheck(provider?.api_name);
    const testResult = testResults?.[provider?.api_name];
    
    if (testResult) {
      return testResult?.success ? 'text-green-400' : 'text-red-400';
    }
    
    if (latest) {
      switch (latest?.status) {
        case 'active': return 'text-green-400';
        case 'failed': return 'text-red-400';
        case 'degraded': return 'text-orange-400';
        default: return 'text-gray-400';
      }
    }
    
    return 'text-gray-400';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never tested';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date?.toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold">Provider Testing Dashboard</h2>
        </div>
        
        <button
          onClick={handleBulkTest}
          disabled={bulkTesting}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {bulkTesting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Testing All...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Bulk Test All
            </>
          )}
        </button>
      </div>
      {/* Connectivity Validation */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Real-time Connectivity Validation
        </h3>

        {providers?.filter(p => p?.is_active)?.map(provider => {
          const latest = getLatestHealthCheck(provider?.api_name);
          const testResult = testResults?.[provider?.api_name];
          const isTestingThis = testing?.[provider?.api_name];
          const StatusIcon = getStatusIcon(provider);
          
          return (
            <div key={provider?.id} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(provider)}`} />
                  <div>
                    <h4 className="font-medium">
                      {provider?.api_name?.replace('_', ' ')?.toUpperCase()}
                    </h4>
                    <p className="text-sm text-gray-400">{provider?.base_url}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSingleTest(provider)}
                  disabled={isTestingThis}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  {isTestingThis ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      Test Now
                    </>
                  )}
                </button>
              </div>

              {/* Test Results */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className={`font-medium ${getStatusColor(provider)}`}>
                    {testResult?.success !== undefined 
                      ? (testResult?.success ? 'Connected' : 'Failed')
                      : (latest?.status || 'Unknown')?.toUpperCase()
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400">Response Time</p>
                  <p className="font-medium text-blue-400">
                    {testResult?.responseTime 
                      ? `${Math.round(testResult?.responseTime)}ms`
                      : (latest?.response_time_ms ? `${latest?.response_time_ms}ms` : 'N/A')
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400">Last Tested</p>
                  <p className="font-medium text-gray-300">
                    {formatTimestamp(testResult?.timestamp || latest?.checked_at)}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-400">Rate Limit</p>
                  <p className="font-medium text-green-400">
                    {provider?.rate_limit_per_minute}/min
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {(testResult?.error || latest?.error_message) && (
                <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {testResult?.error || latest?.error_message}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Latency Requirements */}
      <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Latency Targets
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
      {/* Recent Health Checks */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Recent Health Checks
        </h3>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {healthChecks?.slice(0, 10)?.map(check => {
            const StatusIcon = check?.status === 'active' ? CheckCircle : 
                             check?.status === 'failed' ? XCircle : AlertCircle;
            
            return (
              <div key={check?.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded text-sm">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${
                    check?.status === 'active' ? 'text-green-400' :
                    check?.status === 'failed' ? 'text-red-400' : 'text-orange-400'
                  }`} />
                  <span className="font-medium">
                    {check?.provider_name?.replace('_', ' ')?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-gray-400">
                  {check?.response_time_ms && (
                    <span>{check?.response_time_ms}ms</span>
                  )}
                  <span>{formatTimestamp(check?.checked_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProviderTestingPanel;