import React, { useState, useEffect } from 'react';
import { Bot, Zap, Cpu, Network, CheckCircle, XCircle } from 'lucide-react';

export default function GlobalAgentGrid({ regions, safeMode }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  useEffect(() => {
    // Generate 24 agents distributed across regions
    const generateAgents = () => {
      const agentList = [];
      let agentId = 1;
      
      regions?.forEach((region, regionIndex) => {
        for (let i = 0; i < 8; i++) {
          agentList?.push({
            id: `${region?.id}-${String(agentId)?.padStart(2, '0')}`,
            region: region?.id,
            name: `Agent ${agentId}`,
            status: safeMode ? 'idle' : (Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'processing' : 'idle'),
            processingSpeed: Math.floor(Math.random() * 100) + 50,
            accuracy: (Math.random() * 10 + 90)?.toFixed(1),
            resourceUsage: Math.floor(Math.random() * 40) + 30,
            wsConnected: !safeMode && Math.random() > 0.05,
            lastAction: new Date(Date.now() - Math.random() * 60000)?.toLocaleTimeString(),
            tasksCompleted: Math.floor(Math.random() * 500) + 100,
            regionColor: region?.color
          });
          agentId++;
        }
      });
      
      setAgents(agentList);
    };

    generateAgents();
    const interval = setInterval(generateAgents, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [regions, safeMode]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-400/20 border-green-400/40 text-green-400';
      case 'processing':
        return 'bg-blue-400/20 border-blue-400/40 text-blue-400';
      case 'idle':
        return 'bg-gray-400/20 border-gray-400/40 text-gray-400';
      case 'error':
        return 'bg-red-400/20 border-red-400/40 text-red-400';
      default:
        return 'bg-gray-400/20 border-gray-400/40 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3" />;
      case 'processing':
        return <Zap className="w-3 h-3 animate-pulse" />;
      case 'idle':
        return <Bot className="w-3 h-3" />;
      case 'error':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Bot className="w-3 h-3" />;
    }
  };

  const getRegionBorderColor = (regionColor) => {
    switch (regionColor) {
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
            <Network className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Global Agent Grid</h3>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{agents?.filter(a => a?.status === 'active')?.length} Active</span>
            <span>{agents?.filter(a => a?.status === 'processing')?.length} Processing</span>
            <span>{agents?.filter(a => a?.wsConnected)?.length} Connected</span>
          </div>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-80px)] overflow-y-auto">
        <div className="grid grid-cols-4 gap-3">
          {agents?.map((agent) => (
            <div
              key={agent?.id}
              onClick={() => setSelectedAgent(selectedAgent?.id === agent?.id ? null : agent)}
              className={`relative p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-all duration-200 border-l-4 ${getRegionBorderColor(agent?.regionColor)}`}
            >
              {/* WebSocket Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${agent?.wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              </div>

              {/* Agent Header */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-4 h-4 text-slate-300" />
                  <span className="text-sm font-medium text-white">{agent?.name}</span>
                </div>
                <div className="text-xs text-slate-400">{agent?.region} • {agent?.id}</div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium mb-2 ${getStatusColor(agent?.status)}`}>
                {getStatusIcon(agent?.status)}
                <span className="capitalize">{agent?.status}</span>
              </div>

              {/* Quick Metrics */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Speed:</span>
                  <span className="font-mono text-white">{agent?.processingSpeed}/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accuracy:</span>
                  <span className="font-mono text-green-400">{agent?.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CPU:</span>
                  <span className="font-mono text-blue-400">{agent?.resourceUsage}%</span>
                </div>
              </div>

              {/* Resource Usage Bar */}
              <div className="mt-2">
                <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      agent?.resourceUsage > 80
                        ? 'bg-red-400'
                        : agent?.resourceUsage > 60
                        ? 'bg-yellow-400' :'bg-green-400'
                    }`}
                    style={{ width: `${agent?.resourceUsage}%` }}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              {selectedAgent?.id === agent?.id && (
                <div className="absolute top-0 left-full ml-2 z-10 w-64 p-4 bg-slate-800 border border-slate-600/40 rounded-lg shadow-xl">
                  <div className="mb-3">
                    <h4 className="font-semibold text-white mb-1">{agent?.name}</h4>
                    <div className="text-xs text-slate-400">{agent?.id} • {agent?.region} Region</div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-white">Performance</span>
                      </div>
                      <div className="space-y-1 pl-6">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Processing Speed:</span>
                          <span className="font-mono text-white">{agent?.processingSpeed} ops/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Decision Accuracy:</span>
                          <span className="font-mono text-green-400">{agent?.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Resource Usage:</span>
                          <span className="font-mono text-blue-400">{agent?.resourceUsage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tasks Completed:</span>
                          <span className="font-mono text-white">{agent?.tasksCompleted}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Network className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-white">Connection</span>
                      </div>
                      <div className="space-y-1 pl-6">
                        <div className="flex justify-between">
                          <span className="text-slate-400">WebSocket:</span>
                          <span className={`font-mono ${agent?.wsConnected ? 'text-green-400' : 'text-red-400'}`}>
                            {agent?.wsConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Last Action:</span>
                          <span className="font-mono text-slate-300">{agent?.lastAction}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-600/40">
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded text-blue-300 text-xs font-medium transition-colors">
                        Analyze
                      </button>
                      <button className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/40 rounded text-yellow-300 text-xs font-medium transition-colors">
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}