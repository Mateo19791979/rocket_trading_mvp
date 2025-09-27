import React from 'react';
import { Activity, Eye, Cpu, Wifi, TrendingUp } from 'lucide-react';

const SurveillancePanel = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20';
      case 'inactive': return 'text-gray-400 bg-gray-700/20';
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'paused': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const agentGroups = data?.agents || { ingestion: [], signals: [], execution: [], orchestration: [] };
  const summary = data?.summary || { total: 0, active: 0, healthy: 0 };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Eye className="w-5 h-5 text-teal-400" />
        <h3 className="text-lg font-semibold text-white">Bus Monitor → statut live des IA</h3>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{summary?.total}</div>
          <div className="text-sm text-gray-400">Total Agents</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">{summary?.active}</div>
          <div className="text-sm text-gray-400">Actifs</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{summary?.healthy}</div>
          <div className="text-sm text-gray-400">Sains</div>
        </div>
      </div>
      {/* Agent Groups */}
      <div className="space-y-4">
        {Object.entries(agentGroups)?.map(([groupName, agents]) => (
          <div key={groupName} className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <h4 className="font-semibold text-white capitalize">
                    {groupName === 'ingestion' ? 'Ingestion' : 
                     groupName === 'signals' ? 'Signaux' :
                     groupName === 'execution' ? 'Exécution' : 'Orchestration'}
                  </h4>
                </div>
                <span className="text-sm text-gray-400">({agents?.length || 0})</span>
              </div>
              
              <div className="flex space-x-1">
                {(agents || [])?.map((agent, idx) => (
                  <div
                    key={agent?.id || idx}
                    className={`w-3 h-3 rounded-full ${
                      agent?.agent_status === 'active' ? 'bg-green-500' :
                      agent?.agent_status === 'error' ? 'bg-red-500' :
                      agent?.agent_status === 'paused'? 'bg-yellow-500' : 'bg-gray-500'
                    }`}
                    title={`${agent?.name}: ${agent?.agent_status}`}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Agent Details */}
            <div className="space-y-2">
              {(agents || [])?.slice(0, 3)?.map((agent, idx) => (
                <div key={agent?.id || idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300">{agent?.name || `Agent ${idx + 1}`}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(agent?.agent_status)}`}>
                      {agent?.agent_status || 'unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {agent?.system_health?.[0] && (
                      <div className="flex items-center space-x-1">
                        <Cpu className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">
                          {Math.round(agent?.system_health?.[0]?.cpu_usage || 0)}%
                        </span>
                      </div>
                    )}
                    <div className={`flex items-center space-x-1 ${getHealthColor(agent?.system_health?.[0]?.health_status)}`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      <span className="text-xs">
                        {agent?.system_health?.[0]?.health_status || 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {(agents?.length || 0) > 3 && (
                <div className="text-xs text-gray-400 text-center">
                  +{agents?.length - 3} autres agents
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Real-time Activity Indicator */}
      <div className="mt-4 flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">Communication Inter-Agents</span>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400">Temps réel actif</span>
        </div>
      </div>
    </div>
  );
};

export default SurveillancePanel;