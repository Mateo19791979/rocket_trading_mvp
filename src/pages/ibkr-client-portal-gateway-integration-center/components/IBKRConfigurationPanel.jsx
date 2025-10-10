import React, { useState, useEffect } from 'react';
import { Save, TestTube, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Settings2, Key } from 'lucide-react';

export function IBKRConfigurationPanel({ onStatusChange, shadowMode, onShadowModeChange }) {
  const [config, setConfig] = useState({
    baseUrl: 'https://localhost:5000/v1/api',
    shadowMode: true,
    allowSelfSigned: true,
    adminKey: 'change_me_strong_key',
    tradingMode: 'paper',
    host: '127.0.0.1',
    port: 7497,
    clientId: 42,
    timeout: 10,
    retryAttempts: 3
  });
  
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);

  useEffect(() => {
    // Update external shadow mode state
    onShadowModeChange?.(config?.shadowMode);
  }, [config?.shadowMode]);

  const handleConfigChange = (field, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      
      // Auto-update port based on trading mode
      if (field === 'tradingMode') {
        newConfig.port = value === 'live' ? 7496 : 7497;
      }
      
      return newConfig;
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setLastTestResult(null);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
      
      // Mock test result
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      const result = {
        success,
        timestamp: new Date()?.toISOString(),
        latency: success ? Math.floor(50 + Math.random() * 200) : null,
        error: success ? null : 'Connection timeout - Gateway may not be running',
        tradingMode: config?.tradingMode
      };
      
      setLastTestResult(result);
      
      // Update parent component
      onStatusChange?.({
        status: success ? 'connected' : 'error',
        lastConnected: success ? new Date()?.toISOString() : null,
        latency: result?.latency,
        error: result?.error
      });
      
    } catch (error) {
      const result = {
        success: false,
        timestamp: new Date()?.toISOString(),
        error: error?.message || 'Unknown connection error'
      };
      
      setLastTestResult(result);
      onStatusChange?.({
        status: 'error',
        error: result?.error
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveConfiguration = () => {
    // In a real implementation, this would save to environment variables or configuration store
    console.log('Saving IBKR configuration:', config);
    
    // Show success feedback
    const successEvent = new CustomEvent('show-notification', {
      detail: {
        type: 'success',
        message: 'IBKR configuration saved successfully'
      }
    });
    window.dispatchEvent(successEvent);
  };

  return (
    <div className="space-y-6">
      {/* Environment Variables Configuration */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Settings2 className="w-4 h-4 mr-2" />
          Environment Variables
        </h3>
        
        <div className="space-y-4">
          {/* IBKR Base URL */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              IBKR_BASE (Gateway URL)
            </label>
            <input
              type="text"
              value={config?.baseUrl || ''}
              onChange={(e) => handleConfigChange('baseUrl', e?.target?.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://localhost:5000/v1/api"
            />
            <p className="text-xs text-gray-400 mt-1">Client Portal API Gateway endpoint</p>
          </div>

          {/* Shadow Mode Toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              IBKR_SHADOW_MODE (Order Protection)
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleConfigChange('shadowMode', !config?.shadowMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config?.shadowMode ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config?.shadowMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${config?.shadowMode ? 'text-green-300' : 'text-gray-400'}`}>
                {config?.shadowMode ? 'Enabled (Orders Blocked)' : 'Disabled (Orders Allowed)'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              When enabled, prevents actual order execution for safe testing
            </p>
          </div>

          {/* Self-Signed Certificates */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              IBKR_ALLOW_SELF_SIGNED (SSL Verification)
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleConfigChange('allowSelfSigned', !config?.allowSelfSigned)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config?.allowSelfSigned ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config?.allowSelfSigned ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${config?.allowSelfSigned ? 'text-blue-300' : 'text-gray-400'}`}>
                {config?.allowSelfSigned ? 'Allowed' : 'Strict Verification'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Allow self-signed certificates for local Gateway connections
            </p>
          </div>

          {/* Internal Admin Key */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              INTERNAL_ADMIN_KEY (Route Protection)
            </label>
            <div className="relative">
              <input
                type={showAdminKey ? 'text' : 'password'}
                value={config?.adminKey || ''}
                onChange={(e) => handleConfigChange('adminKey', e?.target?.value)}
                className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Strong authentication key"
              />
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showAdminKey ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Security key for protecting IBKR API routes
            </p>
          </div>
        </div>
      </div>
      {/* Connection Settings */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Connection Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Trading Mode */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Trading Mode</label>
            <select
              value={config?.tradingMode || 'paper'}
              onChange={(e) => handleConfigChange('tradingMode', e?.target?.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="paper">Paper Trading</option>
              <option value="live">Live Trading</option>
            </select>
          </div>

          {/* Port */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Port</label>
            <input
              type="number"
              value={config?.port || 7497}
              onChange={(e) => handleConfigChange('port', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1000"
              max="65535"
            />
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Client ID</label>
            <input
              type="number"
              value={config?.clientId || 42}
              onChange={(e) => handleConfigChange('clientId', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="999"
            />
          </div>

          {/* Timeout */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Timeout (seconds)</label>
            <input
              type="number"
              value={config?.timeout || 10}
              onChange={(e) => handleConfigChange('timeout', parseInt(e?.target?.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="5"
              max="60"
            />
          </div>
        </div>
      </div>
      {/* Test Results */}
      {lastTestResult && (
        <div className={`p-4 rounded-lg border ${
          lastTestResult?.success 
            ? 'bg-green-900/20 border-green-700/50' :'bg-red-900/20 border-red-700/50'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {lastTestResult?.success ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              lastTestResult?.success ? 'text-green-300' : 'text-red-300'
            }`}>
              Connection Test {lastTestResult?.success ? 'Successful' : 'Failed'}
            </span>
          </div>
          
          {lastTestResult?.success ? (
            <div className="text-xs text-gray-300 space-y-1">
              <p>• Latency: {lastTestResult?.latency}ms</p>
              <p>• Mode: {lastTestResult?.tradingMode} trading</p>
              <p>• Timestamp: {new Date(lastTestResult?.timestamp)?.toLocaleTimeString()}</p>
            </div>
          ) : (
            <div className="text-xs text-red-300">
              <p>Error: {lastTestResult?.error}</p>
              <p className="text-gray-400 mt-1">
                Ensure IB Gateway/TWS is running on port {config?.port}
              </p>
            </div>
          )}
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleTestConnection}
          disabled={isTestingConnection}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-md transition-colors"
        >
          {isTestingConnection ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Testing...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </>
          )}
        </button>
        
        <button
          onClick={handleSaveConfiguration}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Config
        </button>
      </div>
      {/* Security Warning */}
      {!config?.shadowMode && (
        <div className="flex items-start space-x-3 p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-orange-300">
            <p className="font-semibold mb-1">Shadow Mode Disabled</p>
            <p>Orders will be executed when shadow mode is disabled. Ensure proper risk management and account funding before proceeding.</p>
          </div>
        </div>
      )}
    </div>
  );
}