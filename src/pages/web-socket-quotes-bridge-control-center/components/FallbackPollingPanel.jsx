import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const FallbackPollingPanel = ({ isWebSocketConnected, onToggleFallback }) => {
  const [pollingInterval, setPollingInterval] = useState('2500');
  const [maxRetries, setMaxRetries] = useState('5');
  const [isFallbackActive, setIsFallbackActive] = useState(!isWebSocketConnected);

  const intervalOptions = [
    { value: '1000', label: '1 second - High frequency' },
    { value: '2500', label: '2.5 seconds - Standard' },
    { value: '5000', label: '5 seconds - Conservative' },
    { value: '10000', label: '10 seconds - Low bandwidth' }
  ];

  const retryOptions = [
    { value: '3', label: '3 retries' },
    { value: '5', label: '5 retries' },
    { value: '10', label: '10 retries' },
    { value: 'unlimited', label: 'Unlimited' }
  ];

  const handleToggleFallback = () => {
    setIsFallbackActive(!isFallbackActive);
    onToggleFallback?.();
  };

  const getFallbackStatus = () => {
    if (!isWebSocketConnected && isFallbackActive) {
      return { status: 'active', color: 'orange', label: 'Active (WebSocket Down)' };
    }
    if (isWebSocketConnected && !isFallbackActive) {
      return { status: 'standby', color: 'green', label: 'Standby (WebSocket OK)' };
    }
    if (isWebSocketConnected && isFallbackActive) {
      return { status: 'dual', color: 'blue', label: 'Dual Mode Active' };
    }
    return { status: 'disabled', color: 'red', label: 'Disabled' };
  };

  const fallbackStatus = getFallbackStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Fallback HTTP Polling
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            fallbackStatus?.color === 'green' ?'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : fallbackStatus?.color === 'orange' ?'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
              : fallbackStatus?.color === 'blue' ?'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {fallbackStatus?.label}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Automatic degradation when WebSocket connections fail
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Fallback Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Status
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                fallbackStatus?.color === 'green' ? 'bg-green-500' :
                fallbackStatus?.color === 'orange' ? 'bg-orange-500 animate-pulse' :
                fallbackStatus?.color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {fallbackStatus?.status?.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">WebSocket Status</p>
              <p className={`text-sm font-medium ${
                isWebSocketConnected 
                  ? 'text-green-600 dark:text-green-400' :'text-red-600 dark:text-red-400'
              }`}>
                {isWebSocketConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fallback Mode</p>
              <p className={`text-sm font-medium ${
                isFallbackActive 
                  ? 'text-orange-600 dark:text-orange-400' :'text-gray-600 dark:text-gray-400'
              }`}>
                {isFallbackActive ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Polling Interval
            </label>
            <Select
              value={pollingInterval}
              onChange={setPollingInterval}
              options={intervalOptions}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              How frequently to poll when WebSocket is unavailable
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Reconnection Attempts
            </label>
            <Select
              value={maxRetries}
              onChange={setMaxRetries}
              options={retryOptions}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum attempts to reconnect to WebSocket before fallback
            </p>
          </div>
        </div>

        {/* Client Connection Logic */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Client-Side Reconnection Logic
          </h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Exponential backoff: 1s → 2s → 4s → 8s
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Auto-switch to HTTP polling on failure
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Visual status indicators with badges
                </span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Seamless data continuity during switch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Fallback Performance
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {Math.floor(Math.random() * 50) + 150}ms
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Polling Latency</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                97.8%
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {Math.floor(Math.random() * 20) + 5}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Fallback Events</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleToggleFallback}
            variant={isFallbackActive ? "destructive" : "default"}
            size="sm"
            iconName={isFallbackActive ? "Pause" : "Play"}
          >
            {isFallbackActive ? 'Disable Fallback' : 'Enable Fallback'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="TestTube"
          >
            Test Fallback
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="RotateCcw"
          >
            Force Reconnect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FallbackPollingPanel;