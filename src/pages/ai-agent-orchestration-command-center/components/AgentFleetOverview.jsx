import React from 'react';
import { Activity, Cpu, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AgentFleetOverview({ agents, systemHealth, onAgentSelect }) {
  const getAgentHealth = (agentId) => {
    return systemHealth?.find(h => h?.agent_id === agentId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'paused': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getGroupColor = (group) => {
    const colors = {
      ingestion: 'border-blue-500 bg-blue-500/10',
      signals: 'border-green-500 bg-green-500/10',
      execution: 'border-orange-500 bg-orange-500/10',
      orchestration: 'border-purple-500 bg-purple-500/10'
    };
    return colors?.[group] || 'border-gray-500 bg-gray-500/10';
  };

  const calculateGroupMetrics = (groupAgents) => {
    const total = groupAgents?.length || 0;
    const active = groupAgents?.filter(a => a?.agent_status === 'active')?.length || 0;
    const avgPerformance = groupAgents?.reduce((sum, agent) => sum + (agent?.win_rate || 0), 0) / (total || 1);
    const totalPnL = groupAgents?.reduce((sum, agent) => sum + (agent?.total_pnl || 0), 0);
    
    return { total, active, avgPerformance, totalPnL };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Agent Fleet Overview</h2>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-400">24 Agents Total</span>
        </div>
      </div>
      {/* Agent Groups */}
      <div className="space-y-4">
        {Object.entries(agents)?.map(([groupName, groupAgents]) => {
          const metrics = calculateGroupMetrics(groupAgents);
          
          return (
            <div key={groupName} className={`border rounded-lg p-4 ${getGroupColor(groupName)}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white capitalize">{groupName} Agents</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-300">{metrics?.active}/{metrics?.total}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    metrics?.active > 0 ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                </div>
              </div>
              {/* Group Metrics */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="text-center">
                  <div className="text-gray-400">Performance</div>
                  <div className="font-medium">{metrics?.avgPerformance?.toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Total P&L</div>
                  <div className={`font-medium ${metrics?.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${metrics?.totalPnL?.toFixed(0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Resource</div>
                  <div className="font-medium text-blue-400">Normal</div>
                </div>
              </div>
              {/* Individual Agents */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {groupAgents?.map(agent => {
                  const health = getAgentHealth(agent?.id);
                  
                  return (
                    <div 
                      key={agent?.id}
                      className="bg-gray-800/50 rounded p-2 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => onAgentSelect?.(agent?.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(agent?.agent_status)}
                          <span className="text-sm font-medium text-white truncate">
                            {agent?.name || `Agent ${agent?.id?.slice(0, 8)}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {agent?.strategy}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">
                            Trades: {agent?.total_trades || 0}
                          </span>
                          <span className={`${(agent?.win_rate || 0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                            Win: {(agent?.win_rate || 0)?.toFixed(1)}%
                          </span>
                        </div>
                        
                        {health && (
                          <div className="flex items-center space-x-1">
                            <Cpu className="w-3 h-3 text-blue-400" />
                            <span className="text-gray-400">
                              {health?.cpu_usage?.toFixed(1) || 0}%
                            </span>
                          </div>
                        )}
                      </div>
                      {agent?.total_pnl && (
                        <div className="mt-1">
                          <div className={`text-xs font-medium ${
                            agent?.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            P&L: ${agent?.total_pnl?.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* Quick Stats */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3">Fleet Performance</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Processing Speed</span>
            <span className="text-green-400">1,847 ops/sec</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Accuracy Rate</span>
            <span className="text-green-400">94.7%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Resource Utilization</span>
            <span className="text-blue-400">67%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Avg Response Time</span>
            <span className="text-yellow-400">124ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}