import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function WebSocketIntegrationSection({ regions, selectedRegion }) {
  const [connectionHealth, setConnectionHealth] = useState({});
  const [messageThroughput, setMessageThroughput] = useState({});
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    // Simulate WebSocket connection health monitoring
    const updateConnectionHealth = () => {
      const health = {};
      const throughput = {};
      const sync = {};
      
      regions?.forEach(region => {
        const isConnected = Math.random() > 0.05; // 95% connection rate
        health[region.id] = {
          connected: isConnected,
          latency: isConnected ? Math.floor(Math.random() * 50) + 20 : 0,
          lastPing: Date.now() - Math.random() * 5000,
          reconnectAttempts: isConnected ? 0 : Math.floor(Math.random() * 3),
          quality: isConnected ? (Math.random() > 0.2 ? 'excellent' : 'good') : 'poor'
        };
        
        throughput[region.id] = {
          incoming: isConnected ? Math.floor(Math.random() * 100) + 50 : 0,
          outgoing: isConnected ? Math.floor(Math.random() * 80) + 30 : 0,
          processed: isConnected ? Math.floor(Math.random() * 90) + 40 : 0,
          queued: isConnected ? Math.floor(Math.random() * 10) : 0
        };
        
        sync[region.id] = {
          synchronized: isConnected && Math.random() > 0.1,
          drift: Math.floor(Math.random() * 10),
          lastSync: Date.now() - Math.random() * 60000
        };
      });
      
      setConnectionHealth(health);
      setMessageThroughput(throughput);
      setSyncStatus(sync);
    };

    updateConnectionHealth();
    const interval = setInterval(updateConnectionHealth, 3000);
    return () => clearInterval(interval);
  }, [regions]);

  const getConnectionIcon = (health) => {
    if (!health || !health?.connected) {
      return <WifiOff className="w-4 h-4 text-red-400" />;
    }
    
    switch (health?.quality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-yellow-400" />;
      default:
        return <Wifi className="w-4 h-4 text-red-400" />;
    }
  };

  const getConnectionColor = (health) => {
    if (!health || !health?.connected) {
      return 'border-red-400/40 bg-red-600/10';
    }
    
    switch (health?.quality) {
      case 'excellent':
        return 'border-green-400/40 bg-green-600/10';
      case 'good':
        return 'border-yellow-400/40 bg-yellow-600/10';
      default:
        return 'border-red-400/40 bg-red-600/10';
    }
  };

  const handleReconnect = (regionId) => {
    console.log(`Attempting to reconnect WebSocket for region: ${regionId}`);
    // Simulate reconnection logic
  };

  const handleFallbackActivation = (regionId) => {
    console.log(`Activating fallback mechanism for region: ${regionId}`);
    // Simulate fallback activation
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 rounded-lg">
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">WebSocket Integration</h3>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Connection Health Overview */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            Connection Health
          </h4>
          <div className="space-y-2">
            {regions?.map(region => {
              const health = connectionHealth?.[region?.id];
              const isSelected = region?.id === selectedRegion;
              
              return (
                <div
                  key={region?.id}
                  className={`p-3 border rounded-lg ${getConnectionColor(health)} ${
                    isSelected ? 'ring-2 ring-indigo-400/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getConnectionIcon(health)}
                      <span className="text-sm font-medium text-white">{region?.name}</span>
                      <span className="text-xs text-slate-400">({region?.id})</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      health?.connected
                        ? 'bg-green-600/20 text-green-400 border border-green-500/40' :'bg-red-600/20 text-red-400 border border-red-500/40'
                    }`}>
                      {health?.connected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  {health?.connected ? (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-slate-400 mb-1">Latency</div>
                        <div className="font-mono text-white">{health?.latency}ms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400 mb-1">Quality</div>
                        <div className={`font-medium capitalize ${
                          health?.quality === 'excellent' ? 'text-green-400' : 
                          health?.quality === 'good' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {health?.quality}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400 mb-1">Uptime</div>
                        <div className="font-mono text-blue-400">99.8%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-red-400">
                        Reconnect attempts: {health?.reconnectAttempts || 0}
                      </div>
                      <button
                        onClick={() => handleReconnect(region?.id)}
                        className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded text-blue-300 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reconnect
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Throughput */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Message Throughput
          </h4>
          <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            {regions?.map(region => {
              const throughput = messageThroughput?.[region?.id];
              const isSelected = region?.id === selectedRegion;
              
              return (
                <div
                  key={region?.id}
                  className={`${isSelected ? 'mb-2' : 'mb-1'} ${
                    isSelected ? 'p-2 bg-slate-600/30 border border-slate-500/40 rounded' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm ${isSelected ? 'font-medium text-white' : 'text-slate-300'}`}>
                      {region?.name}
                    </span>
                    <span className="text-xs text-slate-400">{region?.id}</span>
                  </div>
                  {throughput && (
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-slate-500 mb-1">In</div>
                        <div className="font-mono text-blue-400">{throughput?.incoming}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-500 mb-1">Out</div>
                        <div className="font-mono text-green-400">{throughput?.outgoing}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-500 mb-1">Proc</div>
                        <div className="font-mono text-purple-400">{throughput?.processed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-500 mb-1">Queue</div>
                        <div className={`font-mono ${throughput?.queued > 5 ? 'text-yellow-400' : 'text-slate-400'}`}>
                          {throughput?.queued}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Synchronization */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            Regional Synchronization
          </h4>
          <div className="space-y-2">
            {regions?.map(region => {
              const sync = syncStatus?.[region?.id];
              
              return (
                <div
                  key={region?.id}
                  className="p-2 bg-slate-700/20 border border-slate-600/20 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {sync?.synchronized ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      )}
                      <span className="text-sm text-white">{region?.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Drift: {sync?.drift || 0}ms
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fallback Mechanisms */}
        <div className="p-3 bg-slate-700/20 border border-slate-600/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-white text-sm">Automatic Fallback</h4>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mb-2">
            HTTP polling activated when WebSocket fails
          </div>
          <button
            onClick={() => handleFallbackActivation(selectedRegion)}
            className="w-full px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/40 rounded text-yellow-300 text-xs font-medium transition-colors"
          >
            Test Fallback Mechanism
          </button>
        </div>
      </div>
    </div>
  );
}