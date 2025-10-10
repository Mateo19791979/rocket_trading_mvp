import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProviderDisruptionPanel = ({
  providersHealth,
  selectedProvider,
  setSelectedProvider,
  latencyMs,
  setLatencyMs,
  errorRate,
  setErrorRate,
  duration,
  setDuration,
  onInjectFailure,
  onCutAll,
  onReset,
  isActive,
  activeTest
}) => {
  const providerOptions = providersHealth?.map(provider => ({
    value: provider?.name,
    label: `${provider?.name} (${provider?.status})`
  })) || [];

  const getProviderStatus = (providerName) => {
    const provider = providersHealth?.find(p => p?.name === providerName);
    return provider || null;
  };

  const selectedProviderData = getProviderStatus(selectedProvider);

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-red-600/20">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-red-400">
          🚨 Provider Disruption Controls
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Selective API provider shutdown and network injection
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Provider
          </label>
          <Select
            value={selectedProvider}
            onChange={setSelectedProvider}
            options={providerOptions}
            className="w-full bg-gray-700 border-gray-600 text-white"
          />
          {selectedProviderData && (
            <div className="mt-2 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedProviderData?.enabled && !selectedProviderData?.circuitBreakerOpen
                      ? 'bg-green-500' :'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-300">
                    {selectedProviderData?.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    Health: {(selectedProviderData?.healthScore * 100)?.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400">
                    Errors: {selectedProviderData?.errorCount || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chaos Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Latency (ms)
            </label>
            <Input
              type="number"
              value={latencyMs}
              onChange={(e) => setLatencyMs(Number(e?.target?.value))}
              min="0"
              max="5000"
              step="100"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">0-5000ms delay</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Error Rate (%)
            </label>
            <Input
              type="number"
              value={errorRate}
              onChange={(e) => setErrorRate(Number(e?.target?.value))}
              min="0"
              max="100"
              step="5"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">0-100% failure rate</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration (s)
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e?.target?.value))}
              min="10"
              max="3600"
              step="10"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">10-3600s duration</p>
          </div>
        </div>

        {/* Provider Toggles */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Individual Provider Controls
          </h3>
          <div className="space-y-2">
            {providersHealth?.map((provider) => (
              <div
                key={provider?.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    provider?.enabled && !provider?.circuitBreakerOpen
                      ? 'bg-green-500'
                      : provider?.circuitBreakerOpen
                      ? 'bg-orange-500' :'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {provider?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Priority: {provider?.priority} | Health: {(provider?.healthScore * 100)?.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    provider?.enabled
                      ? 'bg-green-900 text-green-200' :'bg-red-900 text-red-200'
                  }`}>
                    {provider?.enabled ? 'ON' : 'OFF'}
                  </span>
                  {provider?.circuitBreakerOpen && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-orange-900 text-orange-200">
                      CB OPEN
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
          <Button
            onClick={onInjectFailure}
            disabled={isActive || !selectedProvider}
            variant="destructive"
            size="sm"
            iconName="Zap"
            className={activeTest === 'provider_failure' ? 'animate-pulse' : ''}
          >
            {activeTest === 'provider_failure' ? 'Injecting...' : 'Inject Failure'}
          </Button>
          
          <Button
            onClick={onCutAll}
            disabled={isActive}
            variant="destructive"
            size="sm"
            iconName="Scissors"
            className={activeTest === 'cut_all' ? 'animate-pulse' : ''}
          >
            {activeTest === 'cut_all' ? 'Cutting...' : '✂️ Cut All'}
          </Button>
          
          <Button
            onClick={onReset}
            disabled={isActive}
            variant="outline"
            size="sm"
            iconName="RotateCcw"
            className={`border-gray-600 text-gray-300 hover:bg-gray-700 ${
              activeTest === 'reset' ? 'animate-pulse' : ''
            }`}
          >
            {activeTest === 'reset' ? 'Resetting...' : '♻️ Reset All'}
          </Button>
        </div>

        {/* Chaos Scenarios Preview */}
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-300 mb-2">
            Current Chaos Configuration
          </h3>
          <div className="text-xs text-gray-300 space-y-1">
            <p>• Target: {selectedProvider || 'None selected'}</p>
            <p>• Latency injection: {latencyMs}ms</p>
            <p>• Error rate: {errorRate}%</p>
            <p>• Duration: {duration} seconds</p>
            <p>• Expected impact: {
              errorRate > 50 ? 'High - Service degradation' :
              errorRate > 20 ? 'Medium - Some failures': 'Low - Minimal impact'
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDisruptionPanel;