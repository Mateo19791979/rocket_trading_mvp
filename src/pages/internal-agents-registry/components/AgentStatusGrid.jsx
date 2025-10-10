import React from 'react';
import { Bot, Activity, AlertTriangle, Clock, Zap } from 'lucide-react';

export default function AgentStatusGrid({ agents, onSelectAgent, selectedAgent }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'idle': return <Activity className="w-4 h-4 text-green-500" />;
      case 'busy': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'offline': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Bot className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle': return 'border-l-green-500 bg-green-50';
      case 'busy': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'offline': return 'border-l-gray-400 bg-gray-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const getKindBadge = (kind) => {
    const colors = {
      momentum: 'bg-blue-100 text-blue-800',
      arbitrage: 'bg-green-100 text-green-800',
      scalping: 'bg-purple-100 text-purple-800',
      vol: 'bg-orange-100 text-orange-800',
      macro: 'bg-indigo-100 text-indigo-800',
      crypto: 'bg-yellow-100 text-yellow-800',
      sentiment: 'bg-pink-100 text-pink-800',
      utility: 'bg-gray-100 text-gray-800',
      custom: 'bg-cyan-100 text-cyan-800'
    };
    
    return colors?.[kind] || 'bg-gray-100 text-gray-800';
  };

  const formatLastHeartbeat = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const diff = Date.now() - new Date(timestamp)?.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp)?.toLocaleDateString();
  };

  if (!agents?.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Registered</h3>
        <p className="text-gray-600">Start some internal agents to see them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Agent Status Grid</h2>
        <p className="text-gray-600 text-sm mt-1">Monitor all registered internal agents</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents?.map((agent) => (
            <div
              key={agent?.id}
              onClick={() => onSelectAgent?.(agent)}
              className={`
                border-l-4 p-4 rounded-lg cursor-pointer transition-all
                ${getStatusColor(agent?.status)}
                ${selectedAgent?.id === agent?.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(agent?.status)}
                  <h3 className="font-medium text-gray-900">{agent?.name || 'Unknown'}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKindBadge(agent?.kind)}`}>
                  {agent?.kind || 'unknown'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {agent?.version || '1.0.0'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Capabilities:</span>
                  <span className="text-xs">
                    {agent?.capabilities?.length || 0} functions
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Last heartbeat:</span>
                  <span className="text-xs">
                    {formatLastHeartbeat(agent?.last_heartbeat)}
                  </span>
                </div>
              </div>
              
              {agent?.capabilities?.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    {agent?.capabilities?.slice(0, 3)?.map((capability, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {capability}
                      </span>
                    ))}
                    {agent?.capabilities?.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{agent?.capabilities?.length - 3} more
                      </span>
                    )}
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