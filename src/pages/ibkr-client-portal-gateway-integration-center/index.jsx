import React, { useState, useEffect } from 'react';
import { Terminal, Wifi, Shield, Activity, Settings, AlertTriangle, RefreshCw, Server, Database } from 'lucide-react';
import { IBKRConfigurationPanel } from './components/IBKRConfigurationPanel';
import { ConnectionHealthMonitor } from './components/ConnectionHealthMonitor';
import { APIOperationsDashboard } from './components/APIOperationsDashboard';  
import { LiveTestingInterface } from './components/LiveTestingInterface';
import { ProductionControlsCenter } from './components/ProductionControlsCenter';

export default function IBKRClientPortalGatewayIntegrationCenter() {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    status: 'disconnected',
    lastConnected: null,
    latency: null,
    error: null
  });
  const [shadowMode, setShadowMode] = useState(true);
  const [gatewayHealth, setGatewayHealth] = useState({
    paper: { status: 'available', endpoint: '127.0.0.1:7497' },
    live: { status: 'available', endpoint: '127.0.0.1:7496' }
  });

  useEffect(() => {
    // Initialize page
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusChange = (newStatus) => {
    setConnectionStatus(newStatus);
  };

  const handleShadowModeToggle = (enabled) => {
    setShadowMode(enabled);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex items-center space-x-4">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-xl text-gray-300">Loading IBKR Integration Center...</span>
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">IBKR Client Portal Gateway Integration Center</h1>
                  <p className="text-sm text-gray-400">Production-Ready Interactive Brokers Gateway Management</p>
                </div>
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus?.status === 'connected' ? 'bg-green-400' :
                  connectionStatus?.status === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  connectionStatus?.status === 'error'? 'bg-red-400' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-300 capitalize">{connectionStatus?.status || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {shadowMode ? (
                  <>
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-300">Shadow Mode</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-300">Live Mode</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Configuration & Health */}
          <div className="space-y-6">
            {/* IBKR Configuration Panel */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">IBKR Configuration Panel</h2>
                </div>
              </div>
              <div className="p-6">
                <IBKRConfigurationPanel 
                  onStatusChange={handleStatusChange}
                  shadowMode={shadowMode}
                  onShadowModeChange={handleShadowModeToggle}
                />
              </div>
            </div>

            {/* Connection Health Monitor */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Connection Health Monitor</h2>
                </div>
              </div>
              <div className="p-6">
                <ConnectionHealthMonitor 
                  connectionStatus={connectionStatus}
                  gatewayHealth={gatewayHealth}
                />
              </div>
            </div>
          </div>

          {/* Center Column - API Operations & Testing */}
          <div className="space-y-6">
            {/* API Operations Dashboard */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">API Operations Dashboard</h2>
                </div>
              </div>
              <div className="p-6">
                <APIOperationsDashboard 
                  connectionStatus={connectionStatus}
                  shadowMode={shadowMode}
                />
              </div>
            </div>

            {/* Live Testing Interface */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">Live Testing Interface</h2>
                </div>
              </div>
              <div className="p-6">
                <LiveTestingInterface 
                  connectionStatus={connectionStatus}
                  shadowMode={shadowMode}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Production Controls */}
          <div className="space-y-6">
            {/* Production Controls Center */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Server className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-semibold text-white">Production Controls Center</h2>
                </div>
              </div>
              <div className="p-6">
                <ProductionControlsCenter 
                  shadowMode={shadowMode}
                  onShadowModeChange={handleShadowModeToggle}
                  connectionStatus={connectionStatus}
                />
              </div>
            </div>

            {/* Gateway Status Overview */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">Gateway Status Overview</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Paper Trading Gateway */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-white">Paper Trading Gateway</p>
                      <p className="text-xs text-gray-400">{gatewayHealth?.paper?.endpoint}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-300 font-medium">Available</span>
                </div>

                {/* Live Trading Gateway */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-white">Live Trading Gateway</p>
                      <p className="text-xs text-gray-400">{gatewayHealth?.live?.endpoint}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-300 font-medium">Available</span>
                </div>

                {/* Environment Variables Status */}
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-sm font-medium text-white mb-3">Environment Configuration</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">IBKR_BASE</span>
                      <span className="text-green-300">Configured</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">IBKR_SHADOW_MODE</span>
                      <span className={shadowMode ? 'text-green-300' : 'text-orange-300'}>
                        {shadowMode ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">IBKR_ALLOW_SELF_SIGNED</span>
                      <span className="text-green-300">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">INTERNAL_ADMIN_KEY</span>
                      <span className="text-green-300">Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner - Important Notices */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/50 to-green-900/50 border border-blue-700/50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Production Safety Notice</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>• <strong>Shadow Mode Protection:</strong> All orders are blocked when shadow mode is enabled - safe for testing and development.</p>
                <p>• <strong>Gateway Prerequisites:</strong> Ensure IB Gateway or TWS is running with the appropriate ports (7497 for paper, 7496 for live).</p>
                <p>• <strong>Authentication Flow:</strong> Cookie-jar authentication with auto-reauth capabilities ensures persistent connections.</p>
                <p>• <strong>SSL Certificate Handling:</strong> Self-signed certificate support for local Gateway connections.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}