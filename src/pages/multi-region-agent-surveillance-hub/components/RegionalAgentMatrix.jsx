import React, { useState, useEffect } from 'react';
import { Bot, Zap, Brain, Activity, Network, CheckCircle } from 'lucide-react';

export default function RegionalAgentMatrix({ regions, selectedRegion, onRegionSwitch, realTimeData }) {
  const [agentDetails, setAgentDetails] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    // Generate detailed agent data
    const generateAgentDetails = () => {
      const details = {};
      let globalAgentId = 1;

      regions?.forEach(region => {
        for (let i = 1; i <= region?.agents; i++) {
          const agentId = `${region?.id}-${String(i)?.padStart(2, '0')}`;
          details[agentId] = {
            id: agentId,
            globalId: globalAgentId,
            region: region?.id,
            name: `Agent ${globalAgentId}`,
            status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'processing' : 'idle',
            taskStatus: ['Analyzing', 'Executing', 'Monitoring', 'Idle']?.[Math.floor(Math.random() * 4)],
            processingLatency: Math.floor(Math.random() * 50) + 20,
            confidenceScore: (Math.random() * 20 + 80)?.toFixed(1),
            resourceConsumption: Math.floor(Math.random() * 40) + 30,
            lastDecision: Date.now() - Math.random() * 300000,
            interRegionComm: Math.random() > 0.3,
            collaborationScore: Math.floor(Math.random() * 30) + 70,
            regionColor: region?.color
          };
          globalAgentId++;
        }
      });

      setAgentDetails(details);
    };

    generateAgentDetails();
    const interval = setInterval(generateAgentDetails, 3000);
    return () => clearInterval(interval);
  }, [regions]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 border-green-400/40 text-green-400';
      case 'processing':
        return 'bg-blue-500/20 border-blue-400/40 text-blue-400';
      case 'idle':
        return 'bg-gray-500/20 border-gray-400/40 text-gray-400';
      default:
        return 'bg-gray-500/20 border-gray-400/40 text-gray-400';
    }
  };

  const getRegionAgents = (regionId) => {
    return Object.values(agentDetails)?.filter(agent => agent?.region === regionId);
  };

  const getRegionBorderClass = (color) => {
    switch (color) {
      case 'blue':
        return 'border-l-blue-400';
      case 'green':
        return 'border-l-green-400';
      case 'orange':
        return 'border-l-orange-400';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 rounded-lg h-full">
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">3x8 Regional Agent Matrix</h3>
          </div>
          <div className="text-xs text-slate-400">
            Showing {Object.keys(agentDetails)?.length} agents across {regions?.length || 0} regions
          </div>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-80px)] overflow-y-auto">
        {/* Regional Sections */}
        {regions?.map(region => (
          <div key={region?.id} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold text-white">{region?.name}</h4>
                <div className={`px-2 py-1 bg-${region?.color}-600/20 border border-${region?.color}-500/40 rounded text-${region?.color}-300 text-xs font-medium`}>
                  {region?.id}
                </div>
              </div>
              <div className="text-xs text-slate-400">
                {getRegionAgents(region?.id)?.filter(a => a?.status === 'active')?.length} Active • 
                {getRegionAgents(region?.id)?.filter(a => a?.interRegionComm)?.length} Inter-Region
              </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {getRegionAgents(region?.id)?.map(agent => (
                <div
                  key={agent?.id}
                  onClick={() => setSelectedAgent(selectedAgent?.id === agent?.id ? null : agent)}
                  className={`relative p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-all duration-200 border-l-4 ${getRegionBorderClass(agent?.regionColor)}`}
                >
                  {/* Inter-region communication indicator */}
                  {agent?.interRegionComm && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    </div>
                  )}

                  {/* Agent Header */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-4 h-4 text-slate-300" />
                      <span className="text-sm font-medium text-white">{agent?.name}</span>
                    </div>
                    <div className="text-xs text-slate-400">{agent?.id}</div>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium mb-2 ${getStatusColor(agent?.status)}`}>
                    {agent?.status === 'active' && <CheckCircle className="w-3 h-3" />}
                    {agent?.status === 'processing' && <Zap className="w-3 h-3 animate-pulse" />}
                    {agent?.status === 'idle' && <Bot className="w-3 h-3" />}
                    <span className="capitalize">{agent?.status}</span>
                  </div>

                  {/* Key Metrics */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Task:</span>
                      <span className="text-white font-medium">{agent?.taskStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Latency:</span>
                      <span className="font-mono text-cyan-400">{agent?.processingLatency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="font-mono text-green-400">{agent?.confidenceScore}%</span>
                    </div>
                  </div>

                  {/* Resource Usage */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Resources:</span>
                      <span className="text-white">{agent?.resourceConsumption}%</span>
                    </div>
                    <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          agent?.resourceConsumption > 80
                            ? 'bg-red-400'
                            : agent?.resourceConsumption > 60
                            ? 'bg-yellow-400' :'bg-green-400'
                        }`}
                        style={{ width: `${agent?.resourceConsumption}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Details Modal */}
                  {selectedAgent?.id === agent?.id && (
                    <div className="absolute top-0 left-full ml-4 z-20 w-80 p-4 bg-slate-800 border border-slate-600/40 rounded-lg shadow-2xl">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-5 h-5 text-indigo-400" />
                          <h4 className="font-semibold text-white">{agent?.name}</h4>
                        </div>
                        <div className="text-xs text-slate-400">{agent?.id} • {region?.name} Region</div>
                      </div>

                      <div className="space-y-4">
                        {/* Performance Metrics */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            <span className="font-medium text-white">Performance</span>
                          </div>
                          <div className="space-y-2 pl-6 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Processing Latency:</span>
                              <span className="font-mono text-cyan-400">{agent?.processingLatency}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Decision Confidence:</span>
                              <span className="font-mono text-green-400">{agent?.confidenceScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Resource Consumption:</span>
                              <span className="font-mono text-blue-400">{agent?.resourceConsumption}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Collaboration Score:</span>
                              <span className="font-mono text-purple-400">{agent?.collaborationScore}</span>
                            </div>
                          </div>
                        </div>

                        {/* Communication */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Network className="w-4 h-4 text-purple-400" />
                            <span className="font-medium text-white">Communication</span>
                          </div>
                          <div className="space-y-2 pl-6 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inter-Region:</span>
                              <span className={`font-mono ${agent?.interRegionComm ? 'text-green-400' : 'text-red-400'}`}>
                                {agent?.interRegionComm ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Last Decision:</span>
                              <span className="font-mono text-slate-300">
                                {Math.floor((Date.now() - agent?.lastDecision) / 1000)}s ago
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Agent Actions */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-white">Recent Actions</span>
                          </div>
                          <div className="pl-6 space-y-1">
                            {realTimeData?.agentActions
                              ?.filter(action => action?.agentId === agent?.id)?.slice(0, 3)?.map((action, index) => (
                                <div key={index} className="text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-300">{action?.action}</span>
                                    <span className="text-slate-400">
                                      {new Date(action.timestamp)?.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="text-slate-500">
                                    Confidence: {action?.confidence?.toFixed(1)}%
                                  </div>
                                </div>
                              ))}
                            {realTimeData?.agentActions?.filter(action => action?.agentId === agent?.id)?.length === 0 && (
                              <div className="text-xs text-slate-500">No recent actions</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-600/40">
                        <div className="grid grid-cols-2 gap-2">
                          <button className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 rounded text-indigo-300 text-xs font-medium transition-colors">
                            Deep Analysis
                          </button>
                          <button className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded text-purple-300 text-xs font-medium transition-colors">
                            Manage Agent
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Network Topology Visualization */}
            <div className="p-3 bg-slate-700/20 border border-slate-600/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Network Topology</span>
                <span className="text-xs text-slate-400">Inter-region flows</span>
              </div>
              <div className="flex justify-center">
                <svg width="200" height="60" className="text-slate-400">
                  {getRegionAgents(region?.id)?.filter(agent => agent?.interRegionComm)?.slice(0, 4)?.map((agent, index) => (
                      <g key={agent?.id}>
                        <circle
                          cx={20 + index * 40}
                          cy={30}
                          r="8"
                          className={`fill-${agent?.regionColor}-400/30 stroke-${agent?.regionColor}-400`}
                          strokeWidth="1"
                        />
                        <line
                          x1={28 + index * 40}
                          y1={30}
                          x2={52 + index * 40}
                          y2={30}
                          className="stroke-purple-400/50 animate-pulse"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      </g>
                    ))}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}