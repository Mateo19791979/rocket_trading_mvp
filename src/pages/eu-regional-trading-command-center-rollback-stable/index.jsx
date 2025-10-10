import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Globe, Users, TrendingUp, Shield, Database, Wifi, Clock, MapPin } from 'lucide-react';

export default function EURegionalTradingCommandCenterRollbackStable() {
  const [agents, setAgents] = useState([]);
  const [marketStatus, setMarketStatus] = useState('loading');
  const [safeMode, setSafeMode] = useState(false);

  useEffect(() => {
    // Initialize 8 EU agents with stable performance data
    const initializeAgents = () => {
      const euAgents = Array.from({ length: 8 }, (_, i) => ({
        id: `EU-${i + 1}`,
        name: `Agent EU-${i + 1}`,
        status: Math.random() > 0.1 ? 'active' : 'standby',
        region: 'Europe',
        performance: {
          pnl: (Math.random() * 2000 - 1000)?.toFixed(2),
          winRate: (60 + Math.random() * 30)?.toFixed(1),
          trades: Math.floor(Math.random() * 50) + 10,
          uptime: (95 + Math.random() * 5)?.toFixed(1)
        },
        specialization: ['European Equities', 'EURO Pairs', 'Commodities']?.[Math.floor(Math.random() * 3)],
        lastUpdate: new Date()?.toLocaleTimeString()
      }));
      setAgents(euAgents);
    };

    // Check for SAFE_MODE
    const checkSafeMode = () => {
      setSafeMode(localStorage.getItem('SAFE_MODE') === '1');
    };

    // Simulate market status
    const updateMarketStatus = () => {
      const statuses = ['healthy', 'warning', 'critical'];
      setMarketStatus(statuses?.[Math.floor(Math.random() * statuses?.length)]);
    };

    initializeAgents();
    checkSafeMode();
    updateMarketStatus();

    // Update every 30 seconds
    const interval = setInterval(() => {
      initializeAgents();
      updateMarketStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'standby': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getMarketStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold">EU Regional Trading Command Center</h1>
            </div>
            <span className="text-sm text-slate-400">Rollback Stable</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4" />
              <span>Frankfurt/London/Zurich</span>
            </div>
            {safeMode && (
              <div className="bg-red-900/30 border border-red-700 px-3 py-1 rounded-full text-sm text-red-400">
                SAFE MODE ACTIVE
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - European Market Status Dashboard */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                European Market Status
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Market Health</span>
                  <span className={`text-sm font-medium ${getMarketStatusColor(marketStatus)}`}>
                    {marketStatus?.toUpperCase() || 'LOADING'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Active EU Agents</span>
                  <span className="text-sm font-medium text-green-400">
                    {agents?.filter(a => a?.status === 'active')?.length || 0}/8
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">EURO Connectivity</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">MiFID II Compliance</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">GDPR Status</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </div>

            {/* European Reports Panel */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                European Reports
              </h2>
              
              <div className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">MiFID II Report</span>
                    <span className="text-xs text-green-400">✓ Generated</span>
                  </div>
                  <span className="text-xs text-slate-400">Daily compliance summary</span>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">EU Trading Session</span>
                    <span className="text-xs text-blue-400">Active</span>
                  </div>
                  <span className="text-xs text-slate-400">09:00-17:30 CET Performance</span>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Risk Assessment</span>
                    <span className="text-xs text-yellow-400">Monitoring</span>
                  </div>
                  <span className="text-xs text-slate-400">European market exposure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - European Agent Grid */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              European Agent Grid
            </h2>
            
            <div className="space-y-4">
              {agents?.map((agent) => (
                <div key={agent?.id} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${agent?.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span className="font-medium">{agent?.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full bg-slate-600 ${getStatusColor(agent?.status)}`}>
                      {agent?.status?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-400 mb-3">
                    {agent?.specialization} • {agent?.region}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">PnL:</span>
                      <span className={`ml-2 font-medium ${parseFloat(agent?.performance?.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        €{agent?.performance?.pnl}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="ml-2 text-blue-400 font-medium">{agent?.performance?.winRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Trades:</span>
                      <span className="ml-2 text-slate-200">{agent?.performance?.trades}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Uptime:</span>
                      <span className="ml-2 text-green-400 font-medium">{agent?.performance?.uptime}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-600">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">Last: {agent?.lastUpdate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - European Resilience Control Center */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                EU Resilience Control
              </h2>
              
              <div className="space-y-4">
                <button 
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    safeMode 
                      ? 'bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/40' :'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                  }`}
                  onClick={() => {
                    if (safeMode) {
                      localStorage.removeItem('SAFE_MODE');
                      setSafeMode(false);
                    } else {
                      localStorage.setItem('SAFE_MODE', '1');
                      setSafeMode(true);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {safeMode ? 'Disable SAFE MODE' : 'Enable SAFE MODE'}
                    </span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-left mt-1 opacity-70">
                    European market emergency controls
                  </div>
                </button>
                
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">EU Market Hours</span>
                    <span className="text-xs text-green-400">09:00-17:30 CET</span>
                  </div>
                  <span className="text-xs text-slate-400">Frankfurt/London enforcement</span>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Emergency Protocols</span>
                    <Wifi className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-xs text-slate-400">EU regulatory fallbacks active</span>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Circuit Breakers</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-xs text-slate-400">European exchange limits</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                EU Performance Metrics
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total EU PnL</span>
                  <span className="text-sm font-medium text-green-400">
                    €{agents?.reduce((sum, agent) => sum + parseFloat(agent?.performance?.pnl || 0), 0)?.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Avg Win Rate</span>
                  <span className="text-sm font-medium text-blue-400">
                    {agents?.length > 0 ? (agents?.reduce((sum, agent) => sum + parseFloat(agent?.performance?.winRate || 0), 0) / agents?.length)?.toFixed(1) : '0.0'}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total Trades</span>
                  <span className="text-sm font-medium text-slate-200">
                    {agents?.reduce((sum, agent) => sum + parseInt(agent?.performance?.trades || 0), 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">System Uptime</span>
                  <span className="text-sm font-medium text-green-400">
                    {agents?.length > 0 ? (agents?.reduce((sum, agent) => sum + parseFloat(agent?.performance?.uptime || 0), 0) / agents?.length)?.toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}