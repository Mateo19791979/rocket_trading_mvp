import React, { useState, useEffect } from 'react';
import { Activity, Wifi, AlertTriangle, CheckCircle, XCircle, RefreshCw, Zap, Shield, Server } from 'lucide-react';

export function ConnectionHealthMonitor({ connectionStatus, gatewayHealth }) {
  const [healthMetrics, setHealthMetrics] = useState({
    uptime: '00:00:00',
    totalRequests: 0,
    successRate: 100,
    avgLatency: 0,
    lastHealthCheck: null
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate health metrics updates
    const interval = setInterval(() => {
      setHealthMetrics(prev => ({
        ...prev,
        uptime: generateUptime(),
        totalRequests: prev?.totalRequests + Math.floor(Math.random() * 5),
        successRate: 95 + Math.random() * 5,
        avgLatency: 50 + Math.random() * 100,
        lastHealthCheck: new Date()?.toISOString()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateUptime = () => {
    const now = new Date();
    const hours = String(now?.getHours())?.padStart(2, '0');
    const minutes = String(now?.getMinutes())?.padStart(2, '0');
    const seconds = String(now?.getSeconds())?.padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleRefreshHealth = async () => {
    setIsRefreshing(true);
    
    // Simulate health check
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setHealthMetrics(prev => ({
      ...prev,
      successRate: 95 + Math.random() * 5,
      avgLatency: 50 + Math.random() * 100,
      lastHealthCheck: new Date()?.toISOString()
    }));
    
    setIsRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Gateway Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <Wifi className="w-4 h-4 mr-2" />
            Gateway Connection Status
          </h3>
          <button
            onClick={handleRefreshHealth}
            disabled={isRefreshing}
            className="text-xs text-blue-400 hover:text-blue-300 disabled:text-blue-600 flex items-center"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`${getStatusColor(connectionStatus?.status)} flex items-center`}>
                {getStatusIcon(connectionStatus?.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-white capitalize">
                  {connectionStatus?.status || 'Unknown'}
                </p>
                <p className="text-xs text-gray-400">
                  {connectionStatus?.status === 'connected' ?'Gateway is responding normally'
                    : connectionStatus?.status === 'connecting' ?'Establishing connection...'
                    : connectionStatus?.status === 'error' ?'Connection failed' :'Not connected to gateway'
                  }
                </p>
              </div>
            </div>
            
            {connectionStatus?.latency && (
              <div className="text-right">
                <p className="text-sm font-medium text-green-300">{connectionStatus?.latency}ms</p>
                <p className="text-xs text-gray-400">Latency</p>
              </div>
            )}
          </div>

          {connectionStatus?.error && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-700/50 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-300">
                  <p className="font-medium mb-1">Connection Error</p>
                  <p>{connectionStatus?.error}</p>
                </div>
              </div>
            </div>
          )}

          {connectionStatus?.lastConnected && (
            <div className="mt-3 text-xs text-gray-400">
              Last connected: {new Date(connectionStatus.lastConnected)?.toLocaleString()}
            </div>
          )}
        </div>
      </div>
      {/* Cookie-jar Authentication Tracking */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Authentication & Session
        </h3>
        
        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Cookie-jar Session</span>
            <span className="text-xs text-green-300 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">Auto-reauth</span>
            <span className="text-xs text-blue-300 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Enabled
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">SSL Certificate</span>
            <span className="text-xs text-yellow-300 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Self-signed
            </span>
          </div>
        </div>
      </div>
      {/* Health Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Health Metrics
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Uptime</span>
              <span className="text-sm font-medium text-white">{healthMetrics?.uptime}</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Requests</span>
              <span className="text-sm font-medium text-white">{healthMetrics?.totalRequests}</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Success Rate</span>
              <span className="text-sm font-medium text-green-300">
                {healthMetrics?.successRate?.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Avg Latency</span>
              <span className="text-sm font-medium text-blue-300">
                {Math.round(healthMetrics?.avgLatency)}ms
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Visual Connection Indicators */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Server className="w-4 h-4 mr-2" />
          Connection Indicators
        </h3>
        
        <div className="space-y-3">
          {/* Paper Gateway */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <div>
                <p className="text-xs font-medium text-white">Paper Gateway</p>
                <p className="text-xs text-gray-400">Port 7497</p>
              </div>
            </div>
            <span className="text-xs text-green-300">Connected</span>
          </div>

          {/* Live Gateway */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <div>
                <p className="text-xs font-medium text-white">Live Gateway</p>
                <p className="text-xs text-gray-400">Port 7496</p>
              </div>
            </div>
            <span className="text-xs text-green-300">Available</span>
          </div>
        </div>
      </div>
      {/* Error Reporting */}
      {healthMetrics?.lastHealthCheck && (
        <div className="text-xs text-gray-400 text-center">
          Last health check: {new Date(healthMetrics.lastHealthCheck)?.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}