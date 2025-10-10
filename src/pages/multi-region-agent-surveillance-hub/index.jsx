import React, { useState, useEffect } from 'react';
import { Eye, Network, Clock, MessageSquare, Activity } from 'lucide-react';
import AppErrorBoundary from '../../components/AppErrorBoundary';
import RegionalAgentMatrix from './components/RegionalAgentMatrix';
import RegionalActivityPanel from './components/RegionalActivityPanel';
import WebSocketIntegrationSection from './components/WebSocketIntegrationSection';
import TimeSynchronizationController from './components/TimeSynchronizationController';

export default function MultiRegionAgentSurveillanceHub() {
  const [regions] = useState([
    { id: 'EU', name: 'Europe', color: 'blue', timezone: 'Europe/Zurich', agents: 8 },
    { id: 'US', name: 'United States', color: 'green', timezone: 'America/New_York', agents: 8 },
    { id: 'AS', name: 'Asia Pacific', color: 'orange', timezone: 'Asia/Tokyo', agents: 8 }
  ]);

  const [selectedRegion, setSelectedRegion] = useState('EU');
  const [surveillanceMetrics, setSurveillanceMetrics] = useState({
    totalAgents: 24,
    activeConnections: 22,
    messagesThroughput: 3247,
    avgLatency: 45.3
  });

  const [realTimeData, setRealTimeData] = useState({
    agentActions: [],
    communicationFlows: [],
    coordinationPatterns: []
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSurveillanceMetrics(prev => ({
        ...prev,
        messagesThroughput: prev?.messagesThroughput + Math.floor(Math.random() * 100) - 50,
        avgLatency: Math.max(20, Math.min(100, prev?.avgLatency + (Math.random() - 0.5) * 10))
      }));

      // Add new agent action
      setRealTimeData(prev => ({
        ...prev,
        agentActions: [
          {
            id: Date.now(),
            agentId: `${regions?.[Math.floor(Math.random() * 3)]?.id}-${String(Math.floor(Math.random() * 8) + 1)?.padStart(2, '0')}`,
            action: ['Processing order', 'Analyzing market', 'Updating position', 'Monitoring risk']?.[Math.floor(Math.random() * 4)],
            timestamp: new Date(),
            confidence: Math.random() * 30 + 70
          },
          ...prev?.agentActions?.slice(0, 19)
        ]
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [regions]);

  const handleRegionSwitch = (regionId) => {
    setSelectedRegion(regionId);
  };

  const handleEmergencyCoordination = () => {
    console.log('Activating emergency coordination protocols...');
  };

  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
        {/* Header */}
        <div className="border-b border-indigo-500/30 bg-black/40 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-8 h-8 text-indigo-400" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                    Multi-Region Agent Surveillance Hub
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Region Tabs */}
                <div className="flex gap-2">
                  {regions?.map((region) => (
                    <button
                      key={region?.id}
                      onClick={() => handleRegionSwitch(region?.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedRegion === region?.id
                          ? `bg-${region?.color}-600/30 border border-${region?.color}-500/50 text-${region?.color}-300`
                          : 'bg-slate-700/30 border border-slate-600/30 text-slate-400 hover:text-white'
                      }`}
                    >
                      {region?.name}
                    </button>
                  ))}
                </div>

                {/* Surveillance Metrics */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-green-400" />
                    <span>{surveillanceMetrics?.totalAgents} Agents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span>{surveillanceMetrics?.activeConnections} Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span>{surveillanceMetrics?.messagesThroughput}/min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span>{surveillanceMetrics?.avgLatency?.toFixed(1)}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            {/* Left Section - Agent Matrix */}
            <div className="col-span-8">
              <RegionalAgentMatrix
                regions={regions}
                selectedRegion={selectedRegion}
                onRegionSwitch={handleRegionSwitch}
                realTimeData={realTimeData}
              />
            </div>

            {/* Right Section - Controls and Monitoring */}
            <div className="col-span-4 space-y-6">
              <RegionalActivityPanel
                selectedRegion={selectedRegion}
                agentActions={realTimeData?.agentActions}
                regions={regions}
              />
              
              <WebSocketIntegrationSection
                regions={regions}
                selectedRegion={selectedRegion}
              />
              
              <TimeSynchronizationController
                regions={regions}
                onEmergencyCoordination={handleEmergencyCoordination}
              />
            </div>
          </div>
        </div>
      </div>
    </AppErrorBoundary>
  );
}