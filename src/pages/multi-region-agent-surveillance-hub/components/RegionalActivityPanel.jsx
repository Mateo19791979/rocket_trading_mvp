import React, { useState } from 'react';
import { Activity, MessageCircle, Users, TrendingUp, Eye } from 'lucide-react';

export default function RegionalActivityPanel({ selectedRegion, agentActions, regions }) {
  const [activityFilter, setActivityFilter] = useState('all');
  
  const getCurrentRegion = () => {
    return regions?.find(r => r?.id === selectedRegion);
  };

  const getRegionActions = () => {
    if (!agentActions) return [];
    
    if (activityFilter === 'all') {
      return agentActions?.slice(0, 10);
    }
    
    return agentActions?.filter(action => action?.agentId?.startsWith(selectedRegion))?.slice(0, 10);
  };

  const getRegionColor = (regionId) => {
    const region = regions?.find(r => r?.id === regionId);
    return region?.color || 'gray';
  };

  const getActionTypeIcon = (action) => {
    if (action?.includes('order')) return <TrendingUp className="w-3 h-3" />;
    if (action?.includes('market')) return <Activity className="w-3 h-3" />;
    if (action?.includes('position')) return <Users className="w-3 h-3" />;
    return <MessageCircle className="w-3 h-3" />;
  };

  const getActionTypeColor = (action) => {
    if (action?.includes('order')) return 'text-green-400';
    if (action?.includes('market')) return 'text-blue-400';
    if (action?.includes('position')) return 'text-purple-400';
    return 'text-yellow-400';
  };

  const simulateCoordinationPatterns = () => {
    return [
      { type: 'sync', agents: 3, efficiency: 94.2 },
      { type: 'async', agents: 5, efficiency: 87.8 },
      { type: 'broadcast', agents: 8, efficiency: 91.5 }
    ];
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 rounded-lg">
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Live Activity</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActivityFilter('all')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activityFilter === 'all' ?'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' :'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActivityFilter('region')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                activityFilter === 'region' ?'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' :'bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:text-white'
              }`}
            >
              {selectedRegion}
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Region Summary */}
        <div className="mb-4 p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 bg-${getRegionColor(selectedRegion)}-400 rounded-full`} />
            <span className="font-medium text-white">{getCurrentRegion()?.name || 'Unknown Region'}</span>
            <span className="text-xs text-slate-400">({selectedRegion})</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-slate-400 mb-1">Active Agents</div>
              <div className="font-mono text-green-400">
                {agentActions?.filter(a => a?.agentId?.startsWith(selectedRegion))?.length || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 mb-1">Actions/Min</div>
              <div className="font-mono text-blue-400">47</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 mb-1">Efficiency</div>
              <div className="font-mono text-purple-400">92.3%</div>
            </div>
          </div>
        </div>

        {/* Live Actions Stream */}
        <div className="mb-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            Live Agent Actions
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getRegionActions()?.map((action, index) => (
              <div
                key={action?.id || index}
                className="p-2 bg-slate-700/20 border border-slate-600/20 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={getActionTypeColor(action?.action)}>
                        {getActionTypeIcon(action?.action)}
                      </div>
                      <span className="text-sm font-medium text-white">{action?.action}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{action?.agentId}</span>
                      <span>•</span>
                      <span>Confidence: {action?.confidence?.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 ml-2">
                    {action?.timestamp ? new Date(action.timestamp)?.toLocaleTimeString() : 'Now'}
                  </div>
                </div>
              </div>
            ))}
            {getRegionActions()?.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-sm">
                No recent activity in this region
              </div>
            )}
          </div>
        </div>

        {/* Coordination Patterns */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Coordination Patterns
          </h4>
          <div className="space-y-2">
            {simulateCoordinationPatterns()?.map((pattern, index) => (
              <div
                key={index}
                className="p-3 bg-slate-700/20 border border-slate-600/20 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-white capitalize">{pattern?.type}</span>
                  </div>
                  <div className="text-xs text-slate-400">{pattern?.agents} agents</div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Efficiency:</span>
                  <span className="font-mono text-green-400">{pattern?.efficiency}%</span>
                </div>
                <div className="mt-1">
                  <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                      style={{ width: `${pattern?.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Flows */}
        <div className="mt-4 p-3 bg-slate-700/20 border border-slate-600/20 rounded-lg">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            Message Throughput
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Inbound</div>
              <div className="font-mono text-blue-400">1.2k/min</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Outbound</div>
              <div className="font-mono text-green-400">0.8k/min</div>
            </div>
          </div>
          
          {/* Visual Message Flow */}
          <div className="mt-3">
            <svg width="100%" height="30" className="text-slate-400">
              <defs>
                <linearGradient id="messageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <rect
                x="0"
                y="12"
                width="100%"
                height="6"
                fill="url(#messageGradient)"
                rx="3"
              />
              <circle cx="20%" cy="15" r="3" fill="rgb(59 130 246)" className="animate-pulse" />
              <circle cx="80%" cy="15" r="3" fill="rgb(34 197 94)" className="animate-pulse" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}