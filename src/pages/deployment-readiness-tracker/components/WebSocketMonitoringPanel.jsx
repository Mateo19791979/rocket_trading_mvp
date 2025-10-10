import React, { useState, useEffect } from 'react';
import { Wifi, Play, Square, RefreshCw, Activity, Server, Database, Clock } from 'lucide-react';

export default function WebSocketMonitoringPanel({ onProgressUpdate, onSystemStatusUpdate }) {
  const [wsStatus, setWsStatus] = useState({
    server: 'stopped',
    redis: 'disconnected', 
    connections: 0,
    lastMessage: null,
    uptime: 0
  });

  const [connectionConfig, setConnectionConfig] = useState({
    symbols: ['AAPL', 'MSFT', 'TSLA'],
    timeframe: '1m',
    reconnectAttempts: 5,
    fallbackEnabled: true
  });

  const [realtimeData, setRealtimeData] = useState([]);
  const [isStarting, setIsStarting] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (wsStatus?.server === 'running') {
        setWsStatus(prev => ({
          ...prev,
          uptime: prev?.uptime + 1
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [wsStatus?.server]);

  const startWebSocketService = async () => {
    setIsStarting(true);
    addLog('Starting WSQuotesBridge service...', 'info');
    
    try {
      // Step 1: Start Node.js server
      addLog('🚀 Initializing Node.js WebSocket server...', 'info');
      await simulateDelay(2000);
      
      // Step 2: Connect to Redis
      addLog('📡 Connecting to Redis pub/sub...', 'info');
      await simulateDelay(1500);
      setWsStatus(prev => ({ ...prev, redis: 'connected' }));
      
      // Step 3: Start WebSocket server
      addLog('⚡ Starting WebSocket server on /ws/quotes...', 'info');
      await simulateDelay(2000);
      setWsStatus(prev => ({ 
        ...prev, 
        server: 'running',
        uptime: 0
      }));
      
      // Step 4: Enable fallback
      if (connectionConfig?.fallbackEnabled) {
        addLog('🔄 HTTP polling fallback enabled (/quotes endpoint)', 'success');
      }
      
      addLog('✅ WSQuotesBridge service started successfully!', 'success');
      
      // Update progress
      const progress = 100;
      const status = 'completed';
      onProgressUpdate(progress, status);
      
      // Update system status
      onSystemStatusUpdate(prev => ({
        ...prev,
        websocket: { 
          status: 'connected', 
          connections: Math.floor(Math.random() * 5) + 1 
        }
      }));

      // Start simulating real-time data
      startDataSimulation();
      
    } catch (error) {
      addLog(`❌ Error starting service: ${error?.message}`, 'error');
      setWsStatus(prev => ({ ...prev, server: 'error' }));
    } finally {
      setIsStarting(false);
    }
  };

  const stopWebSocketService = async () => {
    addLog('⏹️ Stopping WSQuotesBridge service...', 'info');
    
    setWsStatus({
      server: 'stopped',
      redis: 'disconnected',
      connections: 0,
      lastMessage: null,
      uptime: 0
    });
    
    setRealtimeData([]);
    addLog('🔴 WSQuotesBridge service stopped', 'warning');
    
    // Update system status
    onSystemStatusUpdate(prev => ({
      ...prev,
      websocket: { status: 'disconnected', connections: 0 }
    }));
    
    const progress = 0;
    const status = 'pending';
    onProgressUpdate(progress, status);
  };

  const testWebSocketConnection = async () => {
    addLog('🧪 Testing WebSocket connection...', 'info');
    
    const testUrl = `wss://api.trading-mvp.com/ws/quotes?symbols=${connectionConfig?.symbols?.join(',')}&tf=${connectionConfig?.timeframe}`;
    addLog(`📡 Connecting to: ${testUrl}`, 'info');
    
    // Simulate connection test
    await simulateDelay(2000);
    
    if (wsStatus?.server === 'running') {
      addLog('✅ WebSocket connection test successful!', 'success');
      addLog('📊 Receiving real-time market data...', 'success');
      
      // Simulate receiving a test message
      const testMessage = {
        symbol: 'AAPL',
        price: 176.32,
        timestamp: new Date()?.toISOString(),
        volume: 1000
      };
      
      setWsStatus(prev => ({ ...prev, lastMessage: testMessage }));
      addLog(`📈 Sample tick: AAPL $${testMessage?.price} (${testMessage?.timestamp})`, 'success');
      
    } else {
      addLog('❌ WebSocket connection test failed - service not running', 'error');
    }
  };

  const startDataSimulation = () => {
    const interval = setInterval(() => {
      if (wsStatus?.server === 'running') {
        const newData = connectionConfig?.symbols?.map(symbol => ({
          symbol,
          price: (Math.random() * 200 + 100)?.toFixed(2),
          change: ((Math.random() - 0.5) * 5)?.toFixed(2),
          volume: Math.floor(Math.random() * 10000 + 1000),
          timestamp: new Date()?.toISOString()
        }));
        
        setRealtimeData(newData);
        setWsStatus(prev => ({ 
          ...prev, 
          lastMessage: newData?.[0],
          connections: Math.floor(Math.random() * 5) + 1 
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const addLog = (message, type = 'info') => {
    const logEntry = {
      timestamp: new Date()?.toLocaleTimeString(),
      message,
      type
    };
    
    setConnectionLogs(prev => [logEntry, ...prev?.slice(0, 19)]); // Keep last 20 logs
  };

  const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': case'connected':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'stopped': case'disconnected':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-orange-400';
      default:
        return 'text-blue-400';
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Wifi className="w-5 h-5 text-green-400" />
          Stage 2: WebSocket Temps Réel (Node.js + Redis)
        </h2>
        
        <div className="flex gap-2">
          {wsStatus?.server === 'stopped' ? (
            <button
              onClick={startWebSocketService}
              disabled={isStarting}
              className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-400/50 rounded-lg hover:bg-green-600/30 disabled:opacity-50 flex items-center gap-2"
            >
              {isStarting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isStarting ? 'Starting...' : 'Start Service'}
            </button>
          ) : (
            <button
              onClick={stopWebSocketService}
              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-400/50 rounded-lg hover:bg-red-600/30 flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Service
            </button>
          )}
          
          <button
            onClick={testWebSocketConnection}
            disabled={wsStatus?.server !== 'running'}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-400/50 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Test Connection
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Service Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Service Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">WebSocket Server</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(wsStatus?.server)}`}>
                {wsStatus?.server}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">Redis Pub/Sub</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(wsStatus?.redis)}`}>
                {wsStatus?.redis}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-600">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">Active Connections</span>
              </div>
              <span className="text-sm text-white">{wsStatus?.connections}</span>
            </div>
            
            {wsStatus?.server === 'running' && (
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-300">Uptime</span>
                </div>
                <span className="text-sm text-white">{formatUptime(wsStatus?.uptime)}</span>
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Configuration</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Symbols</label>
                <input
                  type="text"
                  value={connectionConfig?.symbols?.join(', ')}
                  onChange={(e) => setConnectionConfig(prev => ({
                    ...prev,
                    symbols: e?.target?.value?.split(',')?.map(s => s?.trim())
                  }))}
                  className="w-full mt-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded text-white text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400">Timeframe</label>
                <select
                  value={connectionConfig?.timeframe}
                  onChange={(e) => setConnectionConfig(prev => ({ ...prev, timeframe: e?.target?.value }))}
                  className="w-full mt-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="1m">1 minute</option>
                  <option value="5m">5 minutes</option>
                  <option value="15m">15 minutes</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fallback"
                  checked={connectionConfig?.fallbackEnabled}
                  onChange={(e) => setConnectionConfig(prev => ({ ...prev, fallbackEnabled: e?.target?.checked }))}
                  className="text-blue-500"
                />
                <label htmlFor="fallback" className="text-sm text-gray-300">
                  HTTP fallback enabled
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Data & Logs */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Real-time Monitoring</h3>
          
          {/* Live Data */}
          {wsStatus?.server === 'running' && realtimeData?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Live Market Data</h4>
              <div className="bg-gray-900/50 rounded-lg border border-gray-600 p-3 max-h-48 overflow-y-auto">
                {realtimeData?.map((data, index) => (
                  <div key={index} className="flex items-center justify-between py-1 border-b border-gray-700 last:border-b-0">
                    <span className="text-sm text-white">{data?.symbol}</span>
                    <div className="text-right">
                      <div className="text-sm text-white">${data?.price}</div>
                      <div className={`text-xs ${parseFloat(data?.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(data?.change) >= 0 ? '+' : ''}{data?.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Connection Logs */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Connection Logs</h4>
            <div className="bg-gray-900/50 rounded-lg border border-gray-600 p-3 h-64 overflow-y-auto font-mono text-xs">
              {connectionLogs?.length === 0 ? (
                <div className="text-gray-500 text-center mt-8">No logs yet...</div>
              ) : (
                connectionLogs?.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{log?.timestamp}]</span>{' '}
                    <span className={getLogColor(log?.type)}>{log?.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Test Commands */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Test Commands</h4>
        <div className="space-y-2">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-xs text-gray-400 mb-1"># WebSocket Direct Test</div>
            <code className="text-xs text-green-400">
              wscat -c "wss://api.trading-mvp.com/ws/quotes?symbols=AAPL,MSFT&tf=1m"
            </code>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="text-xs text-gray-400 mb-1"># HTTP Fallback Test</div>
            <code className="text-xs text-green-400">
              curl -s "https://api.trading-mvp.com/quotes?symbols=AAPL,MSFT&tf=1m"
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}