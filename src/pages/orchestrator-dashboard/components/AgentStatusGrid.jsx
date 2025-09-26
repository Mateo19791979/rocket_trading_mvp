import { useState } from 'react';
import { Users, Activity, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

function AgentStatusGrid({ agents = [], loading = false }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const getStatusIcon = (agent) => {
    if (agent?.is_alive) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    } else if (agent?.status === 'error') {
      return <XCircle className="h-4 w-4 text-red-400" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (agent) => {
    if (agent?.is_alive) {
      return 'border-green-500 bg-green-900/20';
    } else if (agent?.status === 'error') {
      return 'border-red-500 bg-red-900/20';
    } else {
      return 'border-yellow-500 bg-yellow-900/20';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      return date?.toLocaleTimeString();
    } catch {
      return 'Invalid';
    }
  };

  const formatUptime = (lastBeat) => {
    if (!lastBeat) return 'Unknown';
    
    try {
      const now = new Date();
      const beat = new Date(lastBeat);
      const diffMs = now - beat;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  const groupedAgents = agents?.reduce((groups, agent) => {
    const group = agent?.agent_group || agent?.group || 'unknown';
    if (!groups?.[group]) {
      groups[group] = [];
    }
    groups?.[group]?.push(agent);
    return groups;
  }, {}) || {};

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Agent Status</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)]?.map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agents || agents?.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Agent Status</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No agents found</p>
            <p className="text-sm mt-2">Agents will appear here once they start sending heartbeats</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Agent Status</h2>
          </div>
          <div className="text-sm text-gray-400">
            {agents?.filter(a => a?.is_alive)?.length || 0} of {agents?.length || 0} active
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {Object.entries(groupedAgents)?.map(([groupName, groupAgents]) => (
          <div key={groupName}>
            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
              {groupName} ({groupAgents?.length || 0})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groupAgents?.map((agent) => (
                <div
                  key={agent?.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-700/50 ${
                    getStatusColor(agent)
                  }`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(agent)}
                        <h4 className="font-medium text-sm truncate">
                          {agent?.name || agent?.id || 'Unnamed Agent'}
                        </h4>
                      </div>
                      
                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-3 w-3" />
                          <span>Status: {agent?.status || 'unknown'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>Last beat: {formatUptime(agent?.last_beat)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      agent?.is_alive ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                  </div>

                  {agent?.last_error && (
                    <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300">
                      <strong>Error:</strong> {agent?.last_error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedAgent(null)}>
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full mx-4" onClick={e => e?.stopPropagation()}>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Agent Details</h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-400">ID</label>
                <p className="text-sm font-mono bg-gray-700 p-2 rounded">{selectedAgent?.id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Name</label>
                <p className="text-sm">{selectedAgent?.name || 'Unnamed'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Group</label>
                <p className="text-sm">{selectedAgent?.agent_group || selectedAgent?.group || 'unknown'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Status</label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedAgent)}
                  <span className="text-sm">{selectedAgent?.status || 'unknown'}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Last Heartbeat</label>
                <p className="text-sm">{formatTimestamp(selectedAgent?.last_beat)}</p>
              </div>
              
              {selectedAgent?.seconds_since_beat !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Seconds Since Beat</label>
                  <p className="text-sm">{selectedAgent?.seconds_since_beat}</p>
                </div>
              )}
              
              {selectedAgent?.last_error && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Last Error</label>
                  <p className="text-sm text-red-300 bg-red-900/20 p-2 rounded">
                    {selectedAgent?.last_error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentStatusGrid;