import React, { useState, useEffect } from 'react';
import { Activity, Shield, DollarSign, TrendingUp, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock, Server, Wifi, WifiOff } from 'lucide-react';
import { ibkrHealthService } from '../../services/ibkrHealthService';
import Icon from '@/components/AppIcon';


const IBKRHealthBadges = ({ 
  showReconnectButton = true,
  refreshInterval = 30000,
  className = "",
  compact = false 
}) => {
  const [badges, setBadges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [serviceOffline, setServiceOffline] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  const loadHealthStatus = async (isRetry = false) => {
    try {
      if (isRetry) {
        setError(null);
        setServiceOffline(false);
      }
      
      const result = await ibkrHealthService?.getBadgesData();
      
      if (result?.success) {
        setBadges(result?.badges);
        setLastUpdate(new Date());
        setError(null);
        setServiceOffline(false);
        setRetryAttempt(0);
      } else {
        setBadges(result?.badges);
        const isServiceDown = result?.error?.includes('Failed to fetch') || 
                             result?.error?.includes('Service not available') ||
                             result?.badges?.gateway?.message?.includes('Health Service Offline');
        
        setServiceOffline(isServiceDown);
        setError(result?.error || 'Service unavailable');
        
        if (isServiceDown) {
          console.info('IBKR Health Service detected as offline, using fallback display');
        }
      }
    } catch (err) {
      console.warn('Failed to load IBKR health status:', err);
      const isNetworkError = err?.message?.includes('fetch') || err?.name === 'AbortError';
      
      setError(err?.message);
      setBadges(null);
      setServiceOffline(isNetworkError);
      
      // Increment retry attempt for network errors
      if (isNetworkError) {
        setRetryAttempt(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    if (serviceOffline) {
      // If service is offline, just retry the health check
      setLoading(true);
      await loadHealthStatus(true);
      return;
    }

    try {
      setReconnecting(true);
      const result = await ibkrHealthService?.reconnect();
      
      if (result?.success) {
        // Refresh status after reconnection
        setTimeout(() => loadHealthStatus(true), 2000);
      } else {
        setError(result?.error || 'Reconnection failed');
      }
    } catch (err) {
      console.error('Reconnection failed:', err);
      setError(err?.message);
    } finally {
      setReconnecting(false);
    }
  };

  const handleRetryConnection = () => {
    // Reset service state and retry
    ibkrHealthService?.resetService();
    setLoading(true);
    loadHealthStatus(true);
  };

  const getIconForBadge = (type) => {
    switch (type) {
      case 'gateway': return Activity;
      case 'auth': return Shield;
      case 'account': return DollarSign;
      case 'marketData': return TrendingUp;
      default: return AlertCircle;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return Clock;
      case 'error': return XCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  useEffect(() => {
    loadHealthStatus();
    
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        // Don't auto-refresh if service is offline to avoid spam
        if (!serviceOffline) {
          loadHealthStatus();
        }
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, serviceOffline]);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">IBKR Health Status</h3>
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)]?.map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Service Offline Display - More user-friendly
  if (serviceOffline && !badges) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5 text-orange-600" />
            <h3 className="text-sm font-semibold text-gray-900">IBKR Health Monitor</h3>
          </div>
          <div className="flex items-center space-x-2">
            {retryAttempt > 0 && (
              <span className="text-xs text-gray-500">
                Retry #{retryAttempt}
              </span>
            )}
            <Server className="w-4 h-4 text-orange-500" />
          </div>
        </div>
        
        <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Server className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-orange-900 mb-1">
                Health Service Offline
              </h4>
              <p className="text-xs text-orange-700 mb-3">
                The IBKR health monitoring server is not running. IBKR connections may still work normally.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleRetryConnection}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Checking...' : 'Check Again'}
                </button>
                <button
                  onClick={() => {
                    const serviceStatus = ibkrHealthService?.getServiceStatus();
                    alert(`Service Status:\nURL: ${serviceStatus?.baseUrl}\nFallback: ${serviceStatus?.fallbackMode}\nRetries: ${serviceStatus?.retryCount}/${serviceStatus?.maxRetries}`);
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Debug Info
                </button>
              </div>
              <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
                💡 <strong>To fix:</strong> Start the Python health server: <code className="bg-orange-200 px-1 rounded">python ibkr_health.py</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !badges) {
    return (
      <div className={`p-4 border border-red-200 bg-red-50 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 mb-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-semibold text-red-900">IBKR Service Error</h3>
        </div>
        <p className="text-xs text-red-700 mb-3">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={() => loadHealthStatus(true)}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
          {retryAttempt > 2 && (
            <button
              onClick={handleRetryConnection}
              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset & Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const badgeTypes = ['gateway', 'auth', 'account', 'marketData'];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {serviceOffline ? 
              <WifiOff className="w-4 h-4 text-orange-500" /> : 
              <Wifi className="w-4 h-4 text-green-500" />
            }
            <h3 className="text-sm font-semibold text-gray-900">IBKR Connection Status</h3>
          </div>
          {serviceOffline && (
            <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
              Service Offline
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              {lastUpdate?.toLocaleTimeString()}
            </span>
          )}
          
          {showReconnectButton && (
            <button
              onClick={serviceOffline ? handleRetryConnection : handleReconnect}
              disabled={reconnecting || loading}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${(reconnecting || loading) ? 'animate-spin' : ''}`} />
              <span>
                {loading ? 'Checking...' : reconnecting ?'Reconnecting...': serviceOffline ?'Check Service' : 'Reconnect'}
              </span>
            </button>
          )}
        </div>
      </div>
      
      {/* Status Badges */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {badgeTypes?.map((type) => {
          const badge = badges?.[type];
          if (!badge) return null;

          const Icon = getIconForBadge(type);
          const StatusIcon = getStatusIcon(badge?.status);
          const colorClass = getStatusColor(badge?.status);

          return (
            <div
              key={type}
              className={`relative p-3 border rounded-lg transition-all hover:shadow-md ${colorClass}`}
            >
              {/* Badge Icon */}
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4" />
                <StatusIcon className="w-4 h-4" />
              </div>
              {/* Badge Label */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold">{badge?.label}</h4>
                <p className="text-xs opacity-80">{badge?.message}</p>
                
                {/* Badge Details */}
                {badge?.details && !compact && (
                  <p className="text-xs opacity-60 truncate" title={badge?.details}>
                    {badge?.details}
                  </p>
                )}
              </div>
              
              {/* Service offline indicator */}
              {serviceOffline && badge?.message?.includes('Health Service Offline') && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Error Message */}
      {error && !serviceOffline && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <p className="text-xs text-yellow-800">{error}</p>
          </div>
        </div>
      )}
      
      {/* Additional Info */}
      {badges?.meta && !compact && (
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Mode: {badges?.meta?.mode || 'unknown'}</span>
            <span>Port: {badges?.meta?.port || 'unknown'}</span>
            {badges?.meta?.fallbackActive && (
              <span className="px-1 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">
                Fallback
              </span>
            )}
          </div>
          {badges?.meta?.retryCount > 0 && (
            <div className="mt-1 text-xs text-gray-400">
              Retries: {badges?.meta?.retryCount}
            </div>
          )}
        </div>
      )}
      
      {/* Helpful instructions when service is offline */}
      {serviceOffline && !compact && (
        <div className="pt-3 border-t border-orange-200">
          <div className="text-xs text-gray-600">
            <p className="mb-2">🔧 <strong>Quick Start Guide:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Install dependencies: <code className="bg-gray-100 px-1 rounded">pip install ib-insync fastapi uvicorn</code></li>
              <li>Start health server: <code className="bg-gray-100 px-1 rounded">python ibkr_health.py</code></li>
              <li>Click "Check Service" button above</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default IBKRHealthBadges;