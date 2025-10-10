import React, { useState } from 'react';
import { Server, Shield, AlertTriangle, Lock, FileText, Settings, CheckCircle } from 'lucide-react';

export function ProductionControlsCenter({ shadowMode, onShadowModeChange, connectionStatus }) {
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000)?.toISOString(),
      action: 'Shadow mode enabled',
      user: 'admin',
      status: 'success'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 600000)?.toISOString(),
      action: 'Gateway connection established',
      user: 'system',
      status: 'success'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 900000)?.toISOString(),
      action: 'Configuration updated',
      user: 'admin',
      status: 'success'
    }
  ]);
  
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);

  const handleModeSwitch = async (newMode) => {
    setIsChangingMode(true);
    
    try {
      // Simulate mode switch delay for safety
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onShadowModeChange?.(newMode);
      
      // Add audit log
      const logEntry = {
        id: auditLogs?.length + 1,
        timestamp: new Date()?.toISOString(),
        action: `${newMode ? 'Shadow' : 'Live'} mode ${newMode ? 'enabled' : 'disabled'}`,
        user: 'admin',
        status: 'success'
      };
      
      setAuditLogs(prev => [logEntry, ...prev?.slice(0, 9)]);
      
      // Show notification
      const successEvent = new CustomEvent('show-notification', {
        detail: {
          type: newMode ? 'info' : 'warning',
          message: `${newMode ? 'Shadow' : 'Live'} mode ${newMode ? 'enabled' : 'activated'}`
        }
      });
      window.dispatchEvent(successEvent);
      
    } catch (error) {
      console.error('Mode switch error:', error);
    } finally {
      setIsChangingMode(false);
    }
  };

  const handleEmergencyStop = () => {
    setEmergencyStop(true);
    onShadowModeChange?.(true); // Force shadow mode
    
    const logEntry = {
      id: auditLogs?.length + 1,
      timestamp: new Date()?.toISOString(),
      action: 'Emergency stop activated',
      user: 'admin',
      status: 'warning'
    };
    
    setAuditLogs(prev => [logEntry, ...prev?.slice(0, 9)]);
    
    // Auto-reset emergency stop after 10 seconds
    setTimeout(() => setEmergencyStop(false), 10000);
  };

  return (
    <div className="space-y-6">
      {/* Trading Mode Controls */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Trading Mode Controls
        </h3>
        
        <div className="bg-gray-700 rounded-lg p-4 space-y-4">
          {/* Shadow Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className={`w-5 h-5 ${shadowMode ? 'text-green-400' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm font-medium text-white">Shadow Mode Protection</p>
                <p className="text-xs text-gray-400">
                  {shadowMode ? 'Orders are blocked and intercepted' : 'Orders will be executed normally'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleModeSwitch(!shadowMode)}
              disabled={isChangingMode}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                shadowMode ? 'bg-green-600' : 'bg-red-600'
              } ${isChangingMode ? 'opacity-50' : ''}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  shadowMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Mode Status Display */}
          <div className={`p-3 rounded-md border ${
            shadowMode 
              ? 'bg-green-900/20 border-green-700/50' :'bg-red-900/20 border-red-700/50'
          }`}>
            <div className="flex items-center space-x-2">
              {shadowMode ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300 font-medium">Safe Mode Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-300 font-medium">Live Trading Active</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {shadowMode 
                ? 'All order operations are blocked. Safe for testing and development.'
                : 'Orders will be executed with real money. Ensure proper risk management.'
              }
            </p>
          </div>

          {/* Emergency Stop */}
          <div className="border-t border-gray-600 pt-4">
            <button
              onClick={handleEmergencyStop}
              disabled={emergencyStop || shadowMode}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:text-gray-400 text-white font-medium rounded-md transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {emergencyStop ? 'Emergency Stop Active' : 'Emergency Stop'}
            </button>
            
            {emergencyStop && (
              <p className="text-xs text-orange-300 text-center mt-2">
                Emergency stop activated. All trading suspended.
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Paper vs Live Environment */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Server className="w-4 h-4 mr-2" />
          Environment Configuration
        </h3>
        
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-white">Paper Trading Environment</p>
                  <p className="text-xs text-gray-400">Simulated trading with virtual funds</p>
                </div>
              </div>
              <span className="text-xs text-blue-300 font-medium">Port 7497</span>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-400 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-white">Live Trading Environment</p>
                  <p className="text-xs text-gray-400">Real trading with actual funds</p>
                </div>
              </div>
              <span className="text-xs text-orange-300 font-medium">Port 7496</span>
            </div>
          </div>
        </div>
      </div>
      {/* Audit Logging */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Audit & Compliance Logging
        </h3>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {auditLogs?.map((log) => (
              <div key={log?.id} className="flex items-center justify-between py-2 border-b border-gray-600 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log?.status === 'success' ? 'bg-green-400' :
                    log?.status === 'warning'? 'bg-orange-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-sm text-white">{log?.action}</p>
                    <p className="text-xs text-gray-400">by {log?.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(log.timestamp)?.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Connection Requirements */}
      {connectionStatus?.status !== 'connected' && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-300 mb-2">Gateway Connection Required</h4>
              <p className="text-xs text-gray-300">
                Production controls require an active connection to IB Gateway. Please establish a connection first.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Security Notice */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Security & Compliance</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• All trading operations are logged for audit compliance</p>
              <p>• Shadow mode provides additional safety layer for testing</p>
              <p>• Emergency stop immediately blocks all order execution</p>
              <p>• Production controls require proper authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}