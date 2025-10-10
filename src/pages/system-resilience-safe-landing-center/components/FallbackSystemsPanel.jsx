import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, RefreshCw, AlertCircle, CheckCircle, Clock, RotateCcw } from 'lucide-react';

const FallbackSystemsPanel = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    websocket: 'connected',
    http: 'active',
    database: 'synced',
    cache: 'active'
  });

  const [fallbackModes, setFallbackModes] = useState({
    websocketToHttp: false,
    offlineMode: false,
    cacheOnly: false,
    readOnly: false
  });

  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const fallbackOptions = [
    {
      id: 'websocketToHttp',
      name: 'WebSocket → HTTP Polling',
      description: 'Switch to HTTP polling when WebSocket connection fails',
      impact: 'Increased latency (~500ms)',
      auto: true,
      status: fallbackModes?.websocketToHttp ? 'active' : 'standby'
    },
    {
      id: 'offlineMode',
      name: 'Offline Operation',
      description: 'Use cached data and queue operations for sync',
      impact: 'Limited functionality, delayed updates',
      auto: false,
      status: fallbackModes?.offlineMode ? 'active' : 'standby'
    },
    {
      id: 'cacheOnly',
      name: 'Cache-Only Mode',
      description: 'Serve data from cache, disable writes',
      impact: 'Read-only access, stale data possible',
      auto: true,
      status: fallbackModes?.cacheOnly ? 'active' : 'standby'
    },
    {
      id: 'readOnly',
      name: 'Read-Only Mode',
      description: 'Disable all write operations, preserve data integrity',
      impact: 'No trading, configuration changes blocked',
      auto: false,
      status: fallbackModes?.readOnly ? 'active' : 'standby'
    }
  ];

  const backupSystems = [
    {
      name: 'Primary Database',
      status: 'healthy',
      uptime: '99.98%',
      lastBackup: '2 hours ago',
      replicationLag: '< 1ms'
    },
    {
      name: 'Secondary Database',
      status: 'standby',
      uptime: '99.95%',
      lastBackup: '1 hour ago',
      replicationLag: '15ms'
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      uptime: '99.99%',
      lastBackup: '30 minutes ago',
      replicationLag: 'N/A'
    },
    {
      name: 'Message Queue',
      status: 'healthy',
      uptime: '99.97%',
      lastBackup: '1 hour ago',
      replicationLag: '< 1ms'
    }
  ];

  useEffect(() => {
    // Simulate connection monitoring
    const interval = setInterval(() => {
      // Randomly simulate connection issues for demo
      if (Math.random() < 0.1) {
        setConnectionStatus(prev => ({
          ...prev,
          websocket: prev?.websocket === 'connected' ? 'disconnected' : 'connected'
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-activate WebSocket fallback when connection is lost
    if (connectionStatus?.websocket === 'disconnected') {
      setFallbackModes(prev => ({ ...prev, websocketToHttp: true }));
    } else {
      setFallbackModes(prev => ({ ...prev, websocketToHttp: false }));
    }
  }, [connectionStatus?.websocket]);

  const toggleFallbackMode = (mode) => {
    setFallbackModes(prev => ({
      ...prev,
      [mode]: !prev?.[mode]
    }));
  };

  const startDataSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setLastSync(new Date());
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status) => {
    const colors = {
      connected: 'text-green-400',
      disconnected: 'text-red-400',
      active: 'text-blue-400',
      synced: 'text-green-400',
      healthy: 'text-green-400',
      standby: 'text-yellow-400',
      error: 'text-red-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      connected: <Wifi className="h-4 w-4" />,
      disconnected: <WifiOff className="h-4 w-4" />,
      active: <CheckCircle className="h-4 w-4" />,
      synced: <RefreshCw className="h-4 w-4" />,
      healthy: <CheckCircle className="h-4 w-4" />,
      standby: <Clock className="h-4 w-4" />,
      error: <AlertCircle className="h-4 w-4" />
    };
    return icons?.[status] || <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="bg-gray-800 border border-purple-500 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <RotateCcw className="text-purple-400 mr-3 h-6 w-6" />
        <h3 className="text-xl font-bold text-white">Fallback Systems Panel</h3>
      </div>
      {/* Connection Status */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Wifi className="text-blue-400 mr-2 h-5 w-5" />
          Connection Status
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(connectionStatus)?.map(([service, status]) => (
            <div key={service} className="bg-gray-700 rounded-lg p-3 text-center">
              <div className={`flex items-center justify-center mb-2 ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="ml-2 text-sm font-medium capitalize">{service}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                status === 'connected' || status === 'active' || status === 'synced' || status === 'healthy' ?'bg-green-900/50 text-green-300' :'bg-red-900/50 text-red-300'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Fallback Mode Controls */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <AlertCircle className="text-orange-400 mr-2 h-5 w-5" />
          Fallback Mode Controls
        </h4>
        
        <div className="space-y-4">
          {fallbackOptions?.map((option) => (
            <div key={option?.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="text-white font-medium mr-3">{option?.name}</span>
                    {option?.auto && (
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                        AUTO
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm px-2 py-1 rounded ${
                    option?.status === 'active' ?'bg-green-900/50 text-green-300' :'bg-gray-900/50 text-gray-300'
                  }`}>
                    {option?.status}
                  </span>
                  {!option?.auto && (
                    <button
                      onClick={() => toggleFallbackMode(option?.id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        fallbackModes?.[option?.id]
                          ? 'bg-red-600 hover:bg-red-700 text-white' :'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {fallbackModes?.[option?.id] ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-2">{option?.description}</p>
              <p className="text-yellow-400 text-xs">Impact: {option?.impact}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Data Synchronization Recovery */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center">
            <RefreshCw className="text-green-400 mr-2 h-5 w-5" />
            Data Synchronization Recovery
          </h4>
          <button
            onClick={startDataSync}
            disabled={isSyncing}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isSyncing ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>

        {isSyncing && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <span className="text-green-300">Synchronization in progress</span>
              <span className="ml-auto text-green-300 font-bold">{syncProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-200"
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-300 mb-4">
          Last successful sync: {lastSync?.toLocaleTimeString()}
        </div>
      </div>
      {/* Backup System Activation */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Database className="text-blue-400 mr-2 h-5 w-5" />
          Backup System Status
        </h4>
        
        <div className="space-y-3">
          {backupSystems?.map((system, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-600 rounded">
              <div className="flex items-center">
                <span className={getStatusColor(system?.status)}>
                  {getStatusIcon(system?.status)}
                </span>
                <span className="text-white font-medium ml-3">{system?.name}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-300">
                <span>Uptime: {system?.uptime}</span>
                <span>Backup: {system?.lastBackup}</span>
                <span>Lag: {system?.replicationLag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FallbackSystemsPanel;