import { useState } from 'react';
import { 
  Target, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Zap,
  Shield,
  Clock,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  TrendingUp,
  Activity,
  CheckCircle
} from 'lucide-react';

export default function AdvancedMarketControls({ onEmergencyReallocation, marketState, onRefresh }) {
  const [emergencyConfig, setEmergencyConfig] = useState({
    tasks: [
      { taskId: 'system_monitoring', cpuCores: 2, memoryGb: 4, estimatedDuration: 60 },
      { taskId: 'risk_management', cpuCores: 4, memoryGb: 8, estimatedDuration: 30 },
      { taskId: 'data_backup', cpuCores: 1, memoryGb: 2, estimatedDuration: 120 }
    ],
    emergencyBudget: 150000
  });

  const [marketConfig, setMarketConfig] = useState({
    auctionInterval: 300, // 5 minutes
    maxBidTimeout: 1800, // 30 minutes
    emergencyThreshold: 0.9, // 90% resource utilization
    autoRebalance: true,
    fairnessMode: false
  });

  const [controlState, setControlState] = useState({
    marketPaused: false,
    emergencyMode: false,
    autoResolveEnabled: true,
    lastAction: null
  });

  const [actionLog, setActionLog] = useState([
    { timestamp: new Date(), action: 'System initialized', status: 'success' },
    { timestamp: new Date(Date.now() - 300000), action: 'Market configuration updated', status: 'success' },
    { timestamp: new Date(Date.now() - 600000), action: 'Automatic bid resolution', status: 'success' }
  ]);

  const handleEmergencyReallocation = async () => {
    setControlState(prev => ({ ...prev, emergencyMode: true }));
    
    try {
      const result = await onEmergencyReallocation(
        emergencyConfig?.tasks,
        emergencyConfig?.emergencyBudget
      );

      const logEntry = {
        timestamp: new Date(),
        action: 'Emergency reallocation executed',
        status: result?.success ? 'success' : 'error',
        details: result?.success 
          ? `Allocated ${emergencyConfig?.emergencyBudget?.toLocaleString()} tokens` 
          : result?.message
      };

      setActionLog(prev => [logEntry, ...prev?.slice(0, 9)]);
      setControlState(prev => ({ ...prev, lastAction: logEntry }));

    } catch (error) {
      const logEntry = {
        timestamp: new Date(),
        action: 'Emergency reallocation failed',
        status: 'error',
        details: error?.message
      };
      setActionLog(prev => [logEntry, ...prev?.slice(0, 9)]);
    } finally {
      setTimeout(() => {
        setControlState(prev => ({ ...prev, emergencyMode: false }));
      }, 3000);
    }
  };

  const handleMarketPause = () => {
    const newPauseState = !controlState?.marketPaused;
    setControlState(prev => ({ ...prev, marketPaused: newPauseState }));
    
    const logEntry = {
      timestamp: new Date(),
      action: newPauseState ? 'Market paused' : 'Market resumed',
      status: 'success'
    };
    setActionLog(prev => [logEntry, ...prev?.slice(0, 9)]);
  };

  const handleSystemReset = () => {
    if (window.confirm('Are you sure you want to reset the market system? This will clear all pending bids.')) {
      setControlState({
        marketPaused: false,
        emergencyMode: false,
        autoResolveEnabled: true,
        lastAction: null
      });
      
      const logEntry = {
        timestamp: new Date(),
        action: 'System reset performed',
        status: 'success'
      };
      setActionLog(prev => [logEntry, ...prev?.slice(0, 9)]);
    }
  };

  const handleRefresh = async () => {
    try {
      await onRefresh();
      const logEntry = {
        timestamp: new Date(),
        action: 'Data refresh completed',
        status: 'success'
      };
      setActionLog(prev => [logEntry, ...prev?.slice(0, 9)]);
    } catch (error) {
      const logEntry = {
        timestamp: new Date(),
        action: 'Data refresh failed',
        status: 'error',
        details: error?.message
      };
      setActionLog(prev => [logEntry, ...prev?.slice(0, 9)]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Advanced Market Controls</h3>
              <p className="text-gray-400 text-sm">Emergency reallocation and system management</p>
            </div>
          </div>
          
          {/* System Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              controlState?.emergencyMode ? 'bg-red-400 animate-pulse' : controlState?.marketPaused ?'bg-yellow-400' : 'bg-green-400'
            }`}></div>
            <span className="text-white text-sm font-semibold">
              {controlState?.emergencyMode ? 'Emergency Mode' : controlState?.marketPaused ?'Market Paused' : 'Normal Operation'}
            </span>
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h4 className="text-red-400 font-semibold text-lg">Emergency Resource Reallocation</h4>
          </div>
          
          {/* Emergency Budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Emergency Budget (Tokens)
            </label>
            <input
              type="number"
              value={emergencyConfig?.emergencyBudget}
              onChange={(e) => setEmergencyConfig(prev => ({
                ...prev,
                emergencyBudget: parseInt(e?.target?.value)
              }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
              min="50000"
              max="500000"
              step="10000"
            />
          </div>

          {/* Critical Tasks Configuration */}
          <div className="mb-4">
            <h5 className="text-white font-medium mb-2">Critical Tasks</h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {emergencyConfig?.tasks?.map((task, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded p-2">
                  <div>
                    <span className="text-white text-sm font-medium">{task?.taskId}</span>
                    <div className="text-gray-400 text-xs">
                      {task?.cpuCores}C, {task?.memoryGb}GB, {task?.estimatedDuration}min
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newTasks = emergencyConfig?.tasks?.filter((_, i) => i !== index);
                      setEmergencyConfig(prev => ({ ...prev, tasks: newTasks }));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleEmergencyReallocation}
            disabled={controlState?.emergencyMode}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            {controlState?.emergencyMode ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Executing Emergency Reallocation...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Execute Emergency Reallocation</span>
              </>
            )}
          </button>
        </div>

        {/* Market Controls */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-4">Market Operation Controls</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleMarketPause}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                controlState?.marketPaused
                  ? 'bg-green-600 hover:bg-green-700 text-white' :'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {controlState?.marketPaused ? (
                <>
                  <PlayCircle className="w-5 h-5" />
                  <span>Resume Market</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-5 h-5" />
                  <span>Pause Market</span>
                </>
              )}
            </button>

            <button
              onClick={handleRefresh}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={handleSystemReset}
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>System Reset</span>
            </button>

            <button
              onClick={() => setControlState(prev => ({ 
                ...prev, 
                autoResolveEnabled: !prev?.autoResolveEnabled 
              }))}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                controlState?.autoResolveEnabled
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' :'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Auto-Resolve: {controlState?.autoResolveEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Market Configuration */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-4">Market Parameters</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Auction Interval (seconds)
              </label>
              <input
                type="number"
                value={marketConfig?.auctionInterval}
                onChange={(e) => setMarketConfig(prev => ({
                  ...prev,
                  auctionInterval: parseInt(e?.target?.value)
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                min="60"
                max="3600"
                step="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Bid Timeout (seconds)
              </label>
              <input
                type="number"
                value={marketConfig?.maxBidTimeout}
                onChange={(e) => setMarketConfig(prev => ({
                  ...prev,
                  maxBidTimeout: parseInt(e?.target?.value)
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                min="300"
                max="7200"
                step="300"
              />
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <div>
                  <span className="text-white font-medium">Auto Rebalance</span>
                  <p className="text-gray-400 text-sm">Automatically adjust resource allocation</p>
                </div>
              </div>
              <button
                onClick={() => setMarketConfig(prev => ({
                  ...prev,
                  autoRebalance: !prev?.autoRebalance
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  marketConfig?.autoRebalance ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketConfig?.autoRebalance ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <span className="text-white font-medium">Fairness Mode</span>
                  <p className="text-gray-400 text-sm">Ensure equitable resource distribution</p>
                </div>
              </div>
              <button
                onClick={() => setMarketConfig(prev => ({
                  ...prev,
                  fairnessMode: !prev?.fairnessMode
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  marketConfig?.fairnessMode ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketConfig?.fairnessMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Log */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-semibold">System Activity Log</h4>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {actionLog?.map((log, index) => (
              <div key={index} className="flex items-start justify-between p-2 bg-gray-800/50 rounded">
                <div className="flex items-start space-x-2">
                  <div className={getStatusColor(log?.status)}>
                    {getStatusIcon(log?.status)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{log?.action}</div>
                    {log?.details && (
                      <div className="text-gray-400 text-xs mt-1">{log?.details}</div>
                    )}
                  </div>
                </div>
                <div className="text-gray-400 text-xs">
                  {log?.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}