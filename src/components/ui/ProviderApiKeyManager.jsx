import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertTriangle, Settings, TestTube } from 'lucide-react';
import { providerApiService } from '../../services/providerApiService';

export default function ProviderApiKeyManager() {
  const [configuration, setConfiguration] = useState({ loading: true, data: null });
  const [testResults, setTestResults] = useState({ loading: false, data: null });
  const [statistics, setStatistics] = useState({ loading: true, data: null });

  const loadConfiguration = async () => {
    try {
      const configResult = await providerApiService?.checkProviderConfiguration();
      setConfiguration({ loading: false, data: configResult?.data, error: configResult?.error });
    } catch (error) {
      setConfiguration({ loading: false, error: error?.message });
    }
  };

  const loadStatistics = async () => {
    try {
      const statsResult = await providerApiService?.getProviderStatistics();
      setStatistics({ loading: false, data: statsResult?.data, error: statsResult?.error });
    } catch (error) {
      setStatistics({ loading: false, error: error?.message });
    }
  };

  const handleConfigureKeys = async () => {
    setConfiguration({ ...configuration, loading: true });
    try {
      const result = await providerApiService?.configureProviderKeys();
      if (result?.success) {
        alert(`API keys configured successfully: ${result?.providersConfigured?.join(', ')}`);
        await loadConfiguration();
      } else {
        alert(`Configuration failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Configuration error: ${error?.message}`);
    }
    setConfiguration({ ...configuration, loading: false });
  };

  const handleTestConnectivity = async () => {
    setTestResults({ loading: true, data: null });
    try {
      const result = await providerApiService?.testProviderConnectivity();
      setTestResults({ loading: false, data: result?.data, error: result?.error });
      
      if (result?.success) {
        const { successful, failed, successRate } = result?.data;
        alert(`Connectivity test completed:\n✅ Success: ${successful?.length}\n❌ Failed: ${failed?.length}\nSuccess rate: ${successRate}%`);
      }
    } catch (error) {
      alert(`Test error: ${error?.message}`);
      setTestResults({ loading: false, error: error?.message });
    }
  };

  useEffect(() => {
    loadConfiguration();
    loadStatistics();
    
    const interval = setInterval(() => {
      loadConfiguration();
      loadStatistics();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getProviderStatus = (providerKey) => {
    const isConfigured = configuration?.data?.providers?.[providerKey];
    const stats = statistics?.data?.[providerKey === 'alphavantage' ? 'alpha_vantage' : providerKey];
    
    if (!isConfigured) return { status: 'not_configured', color: 'text-gray-500', icon: AlertTriangle };
    if (stats?.status === 'active') return { status: 'active', color: 'text-green-600', icon: CheckCircle };
    if (stats?.status === 'failed') return { status: 'failed', color: 'text-red-600', icon: AlertTriangle };
    return { status: 'configured', color: 'text-yellow-600', icon: Settings };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Key className="w-6 h-6 mr-2 text-blue-600" />
          Provider API Key Management
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleConfigureKeys}
            disabled={configuration?.loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure Keys
          </button>
          <button
            onClick={handleTestConnectivity}
            disabled={testResults?.loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {testResults?.loading ? 'Testing...' : 'Test Connectivity'}
          </button>
        </div>
      </div>

      {/* Configuration Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Configuration Status</h4>
          {!configuration?.loading && (
            <div className="text-2xl font-bold text-blue-600">
              {configuration?.data?.completionPercentage || 0}%
            </div>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${configuration?.data?.completionPercentage || 0}%` }}
          ></div>
        </div>

        <div className="text-sm text-gray-600">
          {configuration?.data?.configuredCount || 0} of {configuration?.data?.totalProviders || 3} providers configured
          {configuration?.data?.missingProviders?.length > 0 && (
            <span className="ml-2 text-orange-600">
              Missing: {configuration?.data?.missingProviders?.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['finnhub', 'alphavantage', 'twelvedata']?.map((provider) => {
          const status = getProviderStatus(provider);
          const stats = statistics?.data?.[provider === 'alphavantage' ? 'alpha_vantage' : provider];
          const testResult = testResults?.data?.successful?.find(s => s?.provider === provider) || 
                           testResults?.data?.failed?.find(s => s?.provider === provider);

          return (
            <div key={provider} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-gray-800 capitalize">
                  {provider === 'alphavantage' ? 'Alpha Vantage' : provider}
                </h5>
                <div className={`flex items-center ${status?.color}`}>
                  {React.createElement(status?.icon, { className: "w-5 h-5" })}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${status?.color}`}>
                    {status?.status?.replace('_', ' ')}
                  </span>
                </div>

                {stats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className={`font-medium ${stats?.successRate > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {stats?.successRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response:</span>
                      <span className="font-medium">
                        {Math.round(stats?.avgResponseTime)}ms
                      </span>
                    </div>
                  </>
                )}

                {testResult && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Test:</span>
                    <span className={`font-medium ${testResult?.price ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult?.price ? `$${testResult?.price}` : 'Failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Test Results */}
      {testResults?.data && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Latest Connectivity Test Results</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Success Rate:</span>
              <span className={`font-bold ${testResults?.data?.successRate > 50 ? 'text-green-600' : 'text-red-600'}`}>
                {testResults?.data?.successRate}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Providers Tested:</span>
              <span className="font-medium">{testResults?.data?.totalTested}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Successful:</span>
              <span className="font-medium text-green-600">{testResults?.data?.successful?.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Failed:</span>
              <span className="font-medium text-red-600">{testResults?.data?.failed?.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>1. Add your API keys to the .env file:</p>
          <ul className="ml-4 space-y-1 list-disc">
            <li><code>VITE_FINNHUB_API_KEY=your_finnhub_key</code></li>
            <li><code>VITE_ALPHAVANTAGE_API_KEY=your_alphavantage_key</code></li>
            <li><code>VITE_TWELVEDATA_API_KEY=your_twelvedata_key</code></li>
          </ul>
          <p>2. Click "Configure Keys" to save them to the database</p>
          <p>3. Click "Test Connectivity" to verify the APIs are working</p>
        </div>
      </div>
    </div>
  );
}