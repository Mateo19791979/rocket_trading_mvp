import React, { useState, useEffect } from 'react';



import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, WifiOff, Database, Zap } from 'lucide-react';
import { enhancedMarketDataService } from '../../../services/enhancedMarketDataService';
import NetworkStabilityBanner from '../../../components/ui/NetworkStabilityBanner';

const SystemHealthCard = () => {
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadHealthData = async () => {
    try {
      const data = await enhancedMarketDataService?.getSystemHealthDashboard();
      setHealthData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load health data:', error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadHealthData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    await loadHealthData();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <WifiOff className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'healthy': return `${baseClasses} bg-green-100 text-green-800`;
      case 'degraded': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'critical': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading && !healthData) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold">System Health</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-center py-4">
          <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Unable to load system health</p>
          <button 
            onClick={handleManualRefresh}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Network Stability Banner */}
      <NetworkStabilityBanner />
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-500" />
            <h3 className="text-lg font-semibold">System Health</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e?.target?.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-600">Auto-refresh</span>
            </label>
            
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Updating...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(healthData?.overall_status)}
              <span className="text-lg font-medium">
                Overall Status: {healthData?.overall_status?.toUpperCase()}
              </span>
            </div>
            <span className={getStatusBadge(healthData?.overall_status)}>
              {healthData?.overall_status}
            </span>
          </div>
          
          {lastUpdate && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate?.toLocaleString()}
            </p>
          )}
        </div>

        {/* Provider Status Grid */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3">Data Providers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {healthData?.providers?.map((provider) => (
              <div
                key={provider?.name}
                className={`p-3 rounded-lg border transition-colors ${
                  provider?.availability 
                    ? 'border-green-200 bg-green-50' :'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">
                    {provider?.name?.replace(/_/g, ' ') || 'Unknown'}
                  </span>
                  <div className={`flex items-center space-x-1 ${
                    provider?.availability ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {provider?.availability ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <WifiOff className="h-3 w-3" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className={`font-medium ${
                      provider?.success_rate >= 90 ? 'text-green-600' :
                      provider?.success_rate >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {provider?.success_rate}%
                    </span>
                  </div>
                  
                  {provider?.has_fallback && (
                    <div className="flex items-center text-blue-600">
                      <Database className="h-3 w-3 mr-1" />
                      <span>Fallback Ready</span>
                    </div>
                  )}
                  
                  {provider?.last_error && (
                    <div className="text-red-600 truncate" title={provider?.last_error}>
                      Error: {provider?.last_error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {healthData?.providers?.filter(p => p?.availability)?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Services Online</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {healthData?.degraded_services?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Services Degraded</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {healthData?.available_fallbacks?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Fallbacks Available</div>
          </div>
        </div>

        {/* Recommendations */}
        {healthData?.recommendations?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Status & Recommendations
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <ul className="space-y-1 text-sm text-blue-800">
                {healthData?.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 text-sm">
            <a 
              href="/system-status" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Detailed Status
            </a>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => enhancedMarketDataService?.refreshMarketData()}
              className="text-green-600 hover:text-green-800 underline"
            >
              Force Data Refresh
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => window.location?.reload()} 
              className="text-orange-600 hover:text-orange-800 underline"
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCard;