import React, { useState, useEffect } from 'react';
import { Activity, Shield, TrendingUp, Users, Globe } from 'lucide-react';
import AppErrorBoundary from '../../components/AppErrorBoundary';
import RegionalStatusDashboard from './components/RegionalStatusDashboard';
import DailyReportsPanel from './components/DailyReportsPanel';
import GlobalAgentGrid from './components/GlobalAgentGrid';
import ResilienceControlCenter from './components/ResilienceControlCenter';

export default function TradingAuditHomeV2CommandCenter() {
  const [systemMetrics, setSystemMetrics] = useState({
    globalAgents: 24,
    activeRegions: 3,
    systemHealth: 96.8,
    totalPnL: '+$47,392.21'
  });

  const [regions, setRegions] = useState([
    {
      id: 'EU',
      name: 'Europe',
      status: 'operational',
      agents: 8,
      latency: 23,
      throughput: 1247,
      errorRate: 0.02,
      color: 'blue'
    },
    {
      id: 'US',
      name: 'United States',
      status: 'operational',
      agents: 8,
      latency: 45,
      throughput: 2156,
      errorRate: 0.01,
      color: 'green'
    },
    {
      id: 'AS',
      name: 'Asia Pacific',
      status: 'degraded',
      agents: 8,
      latency: 89,
      throughput: 856,
      errorRate: 0.12,
      color: 'orange'
    }
  ]);

  const [safeMode, setSafeMode] = useState(false);

  useEffect(() => {
    const checkSafeMode = () => {
      const isSafe = localStorage.getItem('SAFE_MODE') === '1';
      setSafeMode(isSafe);
    };

    checkSafeMode();
    const interval = setInterval(checkSafeMode, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyProtocol = (protocol) => {
    console.log(`Activating emergency protocol: ${protocol}`);
    // Emergency protocol implementation would go here
  };

  const handleRegionSwitch = (regionId) => {
    console.log(`Switching focus to region: ${regionId}`);
    // Region switching logic would go here
  };

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        {/* HUD Header */}
        <div className="border-b border-blue-500/30 bg-black/40 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Trading Audit Command Center v2
                  </h1>
                </div>
                {safeMode && (
                  <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                    <span className="text-yellow-300 text-sm font-medium">SAFE MODE</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-6">
                {/* System Metrics */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <span>{systemMetrics?.globalAgents} Agents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>{systemMetrics?.activeRegions} Regions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>{systemMetrics?.systemHealth}% Health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-mono">{systemMetrics?.totalPnL}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="p-6">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
            {/* Left Column - Regional Status */}
            <div className="col-span-3 space-y-6">
              <RegionalStatusDashboard 
                regions={regions}
                onRegionSwitch={handleRegionSwitch}
              />
              <DailyReportsPanel />
            </div>

            {/* Center Column - Global Agent Grid */}
            <div className="col-span-6">
              <GlobalAgentGrid 
                regions={regions}
                safeMode={safeMode}
              />
            </div>

            {/* Right Column - Resilience Control */}
            <div className="col-span-3">
              <ResilienceControlCenter 
                onEmergencyProtocol={handleEmergencyProtocol}
                safeMode={safeMode}
                setSafeMode={setSafeMode}
              />
            </div>
          </div>
        </div>
      </div>
    </AppErrorBoundary>
  );
}