import React, { useState } from 'react';
import { Server, Key, Wifi, PlayCircle, AlertCircle, CheckCircle, XCircle, RefreshCw, TestTube } from 'lucide-react';
import { systemRecoveryService } from '../../../services/systemRecoveryService';

export default function CriticalIssuesPanel({ apiServerStatus, providerKeysStatus, webSocketStatus, onActionComplete }) {
  const [actionLoading, setActionLoading] = useState({});
  const [actionResults, setActionResults] = useState({});

  const handleAction = async (actionType, actionData = {}) => {
    setActionLoading(prev => ({ ...prev, [actionType]: true }));
    
    try {
      let result;
      switch (actionType) {
        case 'restart_api':
          result = await systemRecoveryService?.restartApiServer();
          break;
        case 'test_provider':
          result = await systemRecoveryService?.testProviderConnection(actionData?.provider);
          break;
        case 'deploy_websocket':
          result = { success: true, message: 'WebSocket deployment initiated' };
          break;
        default:
          result = { success: false, message: 'Unknown action' };
      }

      setActionResults(prev => ({ ...prev, [actionType]: result }));
      
      if (result?.success && onActionComplete) {
        setTimeout(() => onActionComplete(), 2000);
      }
    } catch (error) {
      setActionResults(prev => ({ 
        ...prev, 
        [actionType]: { success: false, message: error?.message } 
      }));
    } finally {
      setActionLoading(prev => ({ ...prev, [actionType]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': case'online': case'validated':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded': case'configured': case'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'critical': case'offline': case'missing':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': case'online': case'validated':
        return 'text-green-400';
      case 'degraded': case'configured': case'partial':
        return 'text-yellow-400';
      case 'critical': case'offline': case'missing':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <span>Critical Issues Panel</span>
      </h2>

      <div className="space-y-6">
        {/* API Node.js Server Status */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Server className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">API Node.js Server</h3>
            </div>
            {getStatusIcon(apiServerStatus?.status)}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status:</span>
              <span className={getStatusColor(apiServerStatus?.status)}>
                {apiServerStatus?.status?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Health Score:</span>
              <span className="text-white">{apiServerStatus?.healthScore || 0}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Failed Requests:</span>
              <span className="text-white">{apiServerStatus?.failedRequests || 0}</span>
            </div>
          </div>

          {apiServerStatus?.status !== 'healthy' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('restart_api')}
                disabled={actionLoading?.restart_api}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-sm font-medium transition-colors"
              >
                {actionLoading?.restart_api ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                <span>Restart Server</span>
              </button>
            </div>
          )}

          {actionResults?.restart_api && (
            <div className={`mt-2 p-2 rounded text-sm ${
              actionResults?.restart_api?.success 
                ? 'bg-green-500/20 text-green-400' :'bg-red-500/20 text-red-400'
            }`}>
              {actionResults?.restart_api?.message}
            </div>
          )}
        </div>

        {/* Provider Keys Configuration */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">API Provider Keys</h3>
            </div>
            {getStatusIcon(providerKeysStatus?.overallStatus)}
          </div>

          <div className="space-y-3">
            {/* Finnhub */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Finnhub</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  providerKeysStatus?.finnhub?.status === 'validated' ?'bg-green-500/20 text-green-400'
                    : providerKeysStatus?.finnhub?.status === 'configured' ?'bg-yellow-500/20 text-yellow-400' :'bg-red-500/20 text-red-400'
                }`}>
                  {providerKeysStatus?.finnhub?.status || 'missing'}
                </span>
              </div>
              {providerKeysStatus?.finnhub?.configured && (
                <button
                  onClick={() => handleAction('test_provider', { provider: 'finnhub' })}
                  disabled={actionLoading?.test_provider}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs transition-colors"
                >
                  <TestTube className="w-3 h-3" />
                  <span>Test</span>
                </button>
              )}
            </div>

            {/* Alpha Vantage */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Alpha Vantage</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  providerKeysStatus?.alphaVantage?.status === 'validated' ?'bg-green-500/20 text-green-400'
                    : providerKeysStatus?.alphaVantage?.status === 'configured' ?'bg-yellow-500/20 text-yellow-400' :'bg-red-500/20 text-red-400'
                }`}>
                  {providerKeysStatus?.alphaVantage?.status || 'missing'}
                </span>
              </div>
              {providerKeysStatus?.alphaVantage?.configured && (
                <button
                  onClick={() => handleAction('test_provider', { provider: 'alpha_vantage' })}
                  disabled={actionLoading?.test_provider}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs transition-colors"
                >
                  <TestTube className="w-3 h-3" />
                  <span>Test</span>
                </button>
              )}
            </div>

            {/* TwelveData */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">TwelveData</span>
                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                  providerKeysStatus?.twelveData?.status === 'validated' ?'bg-green-500/20 text-green-400'
                    : providerKeysStatus?.twelveData?.status === 'configured' ?'bg-yellow-500/20 text-yellow-400' :'bg-red-500/20 text-red-400'
                }`}>
                  {providerKeysStatus?.twelveData?.status || 'missing'}
                </span>
              </div>
              {providerKeysStatus?.twelveData?.configured && (
                <button
                  onClick={() => handleAction('test_provider', { provider: 'twelve_data' })}
                  disabled={actionLoading?.test_provider}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs transition-colors"
                >
                  <TestTube className="w-3 h-3" />
                  <span>Test</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400">
            {providerKeysStatus?.configuredCount || 0} of {providerKeysStatus?.totalCount || 3} providers configured
          </div>
        </div>

        {/* WebSocket Server */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Wifi className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">WebSocket Server</h3>
            </div>
            {getStatusIcon(webSocketStatus?.status)}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status:</span>
              <span className={getStatusColor(webSocketStatus?.status)}>
                {webSocketStatus?.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Active Connections:</span>
              <span className="text-white">{webSocketStatus?.activeConnections || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Deployment:</span>
              <span className="text-white">{webSocketStatus?.deployment?.status || 'unknown'}</span>
            </div>
          </div>

          {webSocketStatus?.status !== 'online' && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleAction('deploy_websocket')}
                disabled={actionLoading?.deploy_websocket}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-sm font-medium transition-colors"
              >
                {actionLoading?.deploy_websocket ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                <span>Deploy Server</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}