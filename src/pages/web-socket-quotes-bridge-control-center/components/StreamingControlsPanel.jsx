import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const StreamingControlsPanel = ({
  onServerRestart,
  onConnectionTest,
  onEmergencyFallback,
  isConnected
}) => {
  const [isRestarting, setIsRestarting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState([
    { timestamp: new Date()?.toLocaleTimeString(), level: 'info', message: 'WebSocket bridge initialized' },
    { timestamp: new Date()?.toLocaleTimeString(), level: 'success', message: 'Redis connection established' },
    { timestamp: new Date()?.toLocaleTimeString(), level: 'info', message: 'Client connections monitoring started' }
  ]);

  const handleServerRestart = async () => {
    setIsRestarting(true);
    addLog('warning', 'Server restart initiated...');
    
    // Simulate restart process
    setTimeout(() => {
      addLog('info', 'Stopping active connections...');
    }, 1000);
    
    setTimeout(() => {
      addLog('info', 'Reloading configuration...');
    }, 2000);
    
    setTimeout(() => {
      addLog('success', 'WebSocket server restarted successfully');
      setIsRestarting(false);
      onServerRestart?.();
    }, 3000);
  };

  const handleConnectionTest = async () => {
    setIsTesting(true);
    addLog('info', 'Running connection test...');
    
    // Simulate test process
    setTimeout(() => {
      addLog('info', 'Testing WebSocket handshake...');
    }, 500);
    
    setTimeout(() => {
      addLog('info', 'Testing Redis pub/sub channels...');
    }, 1000);
    
    setTimeout(() => {
      const testResult = Math.random() > 0.2; // 80% success rate
      if (testResult) {
        addLog('success', 'Connection test passed - All systems operational');
      } else {
        addLog('error', 'Connection test failed - Check server status');
      }
      setIsTesting(false);
      onConnectionTest?.();
    }, 2000);
  };

  const handleEmergencyFallback = () => {
    addLog('warning', 'Emergency fallback activated');
    addLog('info', 'Switching to HTTP polling mode');
    addLog('info', 'Client notifications sent');
    onEmergencyFallback?.();
  };

  const addLog = (level, message) => {
    const newLog = {
      timestamp: new Date()?.toLocaleTimeString(),
      level,
      message
    };
    
    setLogs(prev => [newLog, ...prev?.slice(0, 9)]); // Keep only last 10 logs
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getLogTextColor = (level) => {
    switch (level) {
      case 'success':
        return 'text-green-700 dark:text-green-300';
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      default:
        return 'text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Interactive Streaming Controls
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manual server operations and emergency controls
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Control Buttons */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Server Operations
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleServerRestart}
                disabled={isRestarting}
                variant="default"
                size="sm"
                iconName={isRestarting ? "RotateCw" : "RotateCcw"}
                className={isRestarting ? "animate-pulse" : ""}
              >
                {isRestarting ? 'Restarting...' : 'Restart Server'}
              </Button>
              
              <Button
                onClick={handleConnectionTest}
                disabled={isTesting}
                variant="outline"
                size="sm"
                iconName={isTesting ? "Loader" : "Wifi"}
                className={isTesting ? "animate-pulse" : ""}
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              
              <Button
                onClick={handleEmergencyFallback}
                variant="destructive"
                size="sm"
                iconName="AlertTriangle"
              >
                Emergency Fallback
              </Button>
            </div>
          </div>

          {/* Additional Controls */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Advanced Controls
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                iconName="Database"
              >
                Clear Cache
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                iconName="FileText"
              >
                Export Logs
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                iconName="Settings"
              >
                Configuration
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                iconName="BarChart3"
              >
                Performance
              </Button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              System Status
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                isConnected 
                  ? 'text-green-600 dark:text-green-400' :'text-red-600 dark:text-red-400'
              }`}>
                {isConnected ? 'Operational' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 100) + 50}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Clients</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 10) + 5}ms
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Latency</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 1000) + 500}/s
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Messages</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                99.9%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
            </div>
          </div>
        </div>

        {/* Real-time Logs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              System Logs
            </h3>
            <Button
              onClick={() => setLogs([])}
              variant="ghost"
              size="sm"
              iconName="Trash2"
            >
              Clear
            </Button>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
            {logs?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No recent logs
              </p>
            ) : (
              <div className="space-y-2">
                {logs?.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-gray-400 font-mono text-xs mt-0.5 min-w-0 flex-shrink-0">
                      {log?.timestamp}
                    </span>
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log?.level)}
                    </div>
                    <span className={`${getLogTextColor(log?.level)} break-words`}>
                      {log?.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Procedures */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
            Emergency Procedures
          </h3>
          <div className="text-xs text-red-700 dark:text-red-400 space-y-1">
            <p>• Server restart: Graceful shutdown with client notifications</p>
            <p>• Emergency fallback: Immediate switch to HTTP polling</p>
            <p>• Client recovery: Automatic reconnection with exponential backoff</p>
            <p>• Data continuity: No data loss during transitions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingControlsPanel;