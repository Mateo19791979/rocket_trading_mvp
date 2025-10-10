import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Zap, RefreshCw, Settings } from 'lucide-react';
import { providerRouterService } from '../../services/providerRouterService';

// Component imports
import ProviderHealthPanel from './components/ProviderHealthPanel';
import RealTimeQuotesPanel from './components/RealTimeQuotesPanel';
import PerformanceMetricsPanel from './components/PerformanceMetricsPanel';
import CircuitBreakerPanel from './components/CircuitBreakerPanel';

export default function ProviderRouterDashboard() {
  const [healthData, setHealthData] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [quotesData, setQuotesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load all data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [healthResponse, configResponse, statusResponse] = await Promise.all([
        providerRouterService?.getProviderHealth(),
        providerRouterService?.getProviderConfig(),
        providerRouterService?.getSystemStatus()
      ]);

      if (healthResponse?.success) {
        setHealthData(healthResponse?.data);
      }

      if (configResponse?.success) {
        setConfigData(configResponse?.data);
      }

      if (statusResponse?.success) {
        setSystemStatus(statusResponse?.data);
      }

      setLastUpdate(new Date());

    } catch (err) {
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load sample quotes
  const loadSampleQuotes = async () => {
    try {
      const response = await providerRouterService?.getQuotes(['AAPL', 'GOOGL', 'MSFT', 'STLA'], {
        asset: 'equity',
        market: 'US'
      });

      if (response?.success) {
        setQuotesData(response?.data);
      }
    } catch (err) {
      console.error('Failed to load sample quotes:', err);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    loadDashboardData();
    loadSampleQuotes();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData();
        loadSampleQuotes();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = () => {
    loadDashboardData();
    loadSampleQuotes();
  };

  const getOverallSystemStatus = () => {
    if (!healthData?.providers) return { status: 'unknown', color: 'gray' };

    const enabledProviders = healthData?.providers?.filter(p => p?.enabled);
    const healthyProviders = enabledProviders?.filter(p => 
      p?.circuit_breaker_state === 'CLOSED' && 
      p?.health_status === 'healthy' &&
      parseFloat(p?.success_rate) > 80
    );

    if (healthyProviders?.length === 0) {
      return { status: 'critical', color: 'red' };
    } else if (healthyProviders?.length < enabledProviders?.length / 2) {
      return { status: 'degraded', color: 'yellow' };
    } else {
      return { status: 'operational', color: 'green' };
    }
  };

  const systemStatusInfo = getOverallSystemStatus();

  if (loading && !healthData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading Provider Router Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Activity className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold">Provider Router Dashboard</h1>
                <p className="text-sm text-gray-400">Multi-Provider Financial Data Router</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-2">
                {systemStatusInfo?.color === 'green' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {systemStatusInfo?.color === 'yellow' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                {systemStatusInfo?.color === 'red' && <AlertCircle className="w-5 h-5 text-red-500" />}
                <span className={`text-sm font-medium ${
                  systemStatusInfo?.color === 'green' ? 'text-green-400' :
                  systemStatusInfo?.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {systemStatusInfo?.status?.toUpperCase()}
                </span>
              </div>

              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' :'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Auto Refresh
              </button>

              {/* Manual Refresh */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Last Update */}
              {lastUpdate && (
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {lastUpdate?.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-300">Dashboard Error</h3>
              <p className="text-sm text-red-200">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Provider Health Panel */}
          <div className="xl:col-span-2">
            <ProviderHealthPanel 
              healthData={healthData}
              onProviderTest={async (providerName) => {
                const result = await providerRouterService?.testProvider(providerName);
                return result;
              }}
            />
          </div>

          {/* Performance Metrics Panel */}
          <div>
            <PerformanceMetricsPanel 
              healthData={healthData}
              systemStatus={systemStatus}
            />
          </div>

          {/* Circuit Breaker Panel */}
          <div>
            <CircuitBreakerPanel healthData={healthData} />
          </div>

          {/* Real-time Quotes Panel */}
          <div className="lg:col-span-2">
            <RealTimeQuotesPanel 
              quotesData={quotesData}
              onRefreshQuotes={loadSampleQuotes}
            />
          </div>

        </div>

        {/* System Information Footer */}
        {systemStatus && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-400" />
              System Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Service Version</p>
                <p className="font-mono text-green-400">{systemStatus?.version}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Uptime</p>
                <p className="font-mono text-blue-400">
                  {Math.floor(systemStatus?.uptime / 3600)}h {Math.floor((systemStatus?.uptime % 3600) / 60)}m
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Memory Usage</p>
                <p className="font-mono text-yellow-400">
                  {Math.round(systemStatus?.memory_usage?.heapUsed / 1024 / 1024)}MB
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Database</p>
                <p className={`font-mono ${systemStatus?.database?.status === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                  {systemStatus?.database?.status?.toUpperCase()}
                </p>
              </div>
            </div>

            {configData && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Provider Router Configuration</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Circuit Breaker Threshold:</span>{' '}
                    <span className="text-yellow-400">{configData?.circuit_breaker?.errorThresholdPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cache TTL:</span>{' '}
                    <span className="text-blue-400">{configData?.cache?.defaultTTLSeconds}s</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Active Providers:</span>{' '}
                    <span className="text-green-400">{configData?.providers?.filter(p => p?.enabled)?.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}