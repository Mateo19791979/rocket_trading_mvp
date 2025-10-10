import React, { useState, useEffect } from 'react';
import { providerRouterService } from '../services/providerRouterService';

export default function ProviderKeysConfiguration() {
  const [keys, setKeys] = useState({
    finnhub_api: '',
    alpha_api: '',
    twelve_api: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCurrentKeys();
    checkProviderHealth();
  }, []);

  const loadCurrentKeys = async () => {
    try {
      setLoading(true);
      const result = await providerRouterService?.getProviderKeys?.();
      if (result?.success) {
        setKeys({
          finnhub_api: result?.data?.finnhub_api || '',
          alpha_api: result?.data?.alpha_api || '',
          twelve_api: result?.data?.twelve_api || ''
        });
      }
    } catch (err) {
      setError('Failed to load current keys');
    } finally {
      setLoading(false);
    }
  };

  const checkProviderHealth = async () => {
    try {
      const health = await providerRouterService?.getProviderHealth?.();
      setHealthData(health?.data);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const handleInputChange = (provider, value) => {
    setKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const handleSaveKeys = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const result = await providerRouterService?.updateProviderKeys?.(keys);
      
      if (result?.success) {
        setSuccess('API keys updated successfully');
        // Re-check health after updating keys
        setTimeout(checkProviderHealth, 1000);
      } else {
        setError('Failed to update API keys');
      }
    } catch (err) {
      setError(err?.message || 'Failed to update API keys');
    } finally {
      setSaving(false);
    }
  };

  const testProvider = async (provider) => {
    try {
      const result = await providerRouterService?.testProvider?.(provider, keys?.[`${provider}_api`]);
      
      if (result?.success && result?.data?.test_result === 'success') {
        setSuccess(`${provider} connection test successful`);
      } else {
        setError(`${provider} connection test failed: ${result?.data?.error || 'Unknown error'}`);
      }
      
      checkProviderHealth();
    } catch (err) {
      setError(`${provider} test failed: ${err?.message}`);
    }
  };

  const getProviderStatus = (providerName) => {
    const provider = healthData?.providers?.find(p => p?.name === providerName);
    if (!provider) return { status: 'unknown', color: 'gray' };

    if (provider?.ok && provider?.status === 'healthy') {
      return { status: 'healthy', color: 'green' };
    } else if (provider?.ok) {
      return { status: 'degraded', color: 'yellow' };
    } else {
      return { status: 'error', color: 'red' };
    }
  };

  const renderProviderConfig = (provider, displayName) => {
    const status = getProviderStatus(provider);
    const keyField = `${provider}_api`;

    return (
      <div key={provider} className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-${status?.color}-500`} />
            <span className={`text-sm font-medium text-${status?.color}-700`}>
              {status?.status}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={keys?.[keyField] || ''}
              onChange={(e) => handleInputChange(keyField, e?.target?.value)}
              placeholder={`Enter ${displayName} API key`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={saving}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => testProvider(provider)}
              disabled={!keys?.[keyField] || loading}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Connection
            </button>
          </div>

          {healthData?.providers?.find(p => p?.name === provider) && (
            <div className="text-sm text-gray-600">
              <p>Latency: {healthData?.providers?.find(p => p?.name === provider)?.latency || 'N/A'}ms</p>
              <p>Last Test: {healthData?.timestamp ? new Date(healthData?.timestamp)?.toLocaleString() : 'Never'}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider API Configuration</h2>
        <p className="text-gray-600">
          Configure API keys for financial data providers. Test connections to ensure proper functionality.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="text-green-800 text-sm">{success}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {renderProviderConfig('finnhub', 'Finnhub')}
        {renderProviderConfig('alpha', 'Alpha Vantage')}
        {renderProviderConfig('twelve', 'Twelve Data')}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={checkProviderHealth}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          Refresh Status
        </button>
        
        <button
          onClick={handleSaveKeys}
          disabled={saving || loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Provider Health Summary */}
      {healthData && (
        <div className="mt-8 bg-gray-50 border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Overall Status</div>
              <div className={`text-lg font-semibold ${healthData?.ok ? 'text-green-600' : 'text-red-600'}`}>
                {healthData?.ok ? 'Operational' : 'Degraded'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Healthy Providers</div>
              <div className="text-lg font-semibold text-gray-900">
                {healthData?.healthy_count || 0} / {healthData?.providers?.length || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Primary Provider</div>
              <div className="text-lg font-semibold text-blue-600">
                {healthData?.primary || 'None'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="text-sm text-gray-900">
                {new Date(healthData?.timestamp)?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}