import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu } from 'lucide-react';
import { aiAgentStatusService } from '../../../services/aiAgentStatusService';

const AgentGrid = ({ agents, onAgentClick, onAgentControl }) => {
  const getStatusIcon = (status, healthStatus) => {
    if (status === 'error' || healthStatus === 'unhealthy') {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (status === 'active' && healthStatus === 'healthy') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === 'paused') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date?.toLocaleDateString();
  };

  // Generate 24 agent slots (A-X)
  const agentSlots = Array.from({ length: 24 }, (_, index) => {
    const letter = String.fromCharCode(65 + index); // A-X
    const agent = agents?.find(a => a?.name?.includes(letter) || index < agents?.length) || agents?.[index];
    return {
      slot: letter,
      agent: agent || null
    };
  });

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Agent Status Grid</h2>
        <div className="text-sm text-gray-400">
          24 Agent Slots • {agents?.filter(a => a?.agent_status === 'active')?.length || 0} Active
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {agentSlots?.map(({ slot, agent }) => (
          <div
            key={slot}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
              agent 
                ? `${aiAgentStatusService?.getStatusColor(agent?.agent_status)}/20 border-current hover:scale-105`
                : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => agent && onAgentClick(agent)}
          >
            {/* Agent Slot Letter */}
            <div className="text-center mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold text-sm ${
                agent 
                  ? aiAgentStatusService?.getStatusColor(agent?.agent_status) + 'text-white' :'bg-gray-600 text-gray-300'
              }`}>
                {slot}
              </div>
            </div>

            {agent ? (
              <>
                {/* Agent Name */}
                <div className="text-center mb-2">
                  <h3 className="text-white text-sm font-medium truncate" title={agent?.name}>
                    {agent?.name}
                  </h3>
                  {agent?.agent_group && (
                    <p className="text-gray-400 text-xs capitalize">{agent?.agent_group}</p>
                  )}
                </div>

                {/* Status Icons */}
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getStatusIcon(agent?.agent_status, agent?.health_data?.health_status)}
                  {agent?.health_data?.cpu_usage && (
                    <div className="flex items-center space-x-1">
                      <Cpu className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-300">
                        {agent?.health_data?.cpu_usage?.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="text-center text-xs text-gray-400">
                  <div>Trades: {agent?.total_trades || 0}</div>
                  <div>P&L: ${agent?.total_pnl || 0}</div>
                </div>

                {/* Last Heartbeat */}
                <div className="text-center text-xs text-gray-500 mt-2">
                  {formatLastActive(agent?.health_data?.last_heartbeat || agent?.last_active_at)}
                </div>

                {/* Agent Controls (on hover) */}
                <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onAgentControl(agent?.id, 'start');
                      }}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                      title="Start"
                    >
                      ▶
                    </button>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onAgentControl(agent?.id, 'pause');
                      }}
                      className="p-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                      title="Pause"
                    >
                      ⏸
                    </button>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onAgentControl(agent?.id, 'stop');
                      }}
                      className="p-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      title="Stop"
                    >
                      ⏹
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Empty Slot */}
                <div className="text-center text-gray-500">
                  <p className="text-xs">Not Assigned</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Active & Healthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400">Paused / Degraded</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Error / Unhealthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentGrid;