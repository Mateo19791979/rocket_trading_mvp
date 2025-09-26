import React from 'react';
import { Play, Pause, Settings, Activity, AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const AgentGroupPanel = ({ title, description, agents, color, onStatusToggle, onConfigureAgent }) => {
  const colorClasses = {
    blue: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    green: {
      border: 'border-green-500/30',
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      button: 'bg-green-600 hover:bg-green-700'
    },
    yellow: {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    purple: {
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  const colors = colorClasses?.[color] || colorClasses?.blue;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Pause className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Pause className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeCount = agents?.filter(a => a?.agent_status === 'active')?.length;

  return (
    <div className={`border rounded-lg p-6 ${colors?.border} ${colors?.bg}`}>
      {/* Group Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${colors?.text}`}>{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${colors?.text}`}>
            {activeCount}/{agents?.length}
          </div>
          <div className="text-xs text-gray-400">Active Agents</div>
        </div>
      </div>
      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents?.map(agent => (
          <div
            key={agent?.id}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-white truncate">{agent?.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{agent?.agent_category}</p>
              </div>
              <div className="flex items-center ml-2">
                {getStatusIcon(agent?.agent_status)}
              </div>
            </div>

            {/* Agent Metrics */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Win Rate:</span>
                <span className="text-white">{agent?.win_rate || 0}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Total PnL:</span>
                <span className={`${(agent?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${agent?.total_pnl || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Trades:</span>
                <span className="text-white">{agent?.total_trades || 0}</span>
              </div>
            </div>

            {/* Agent Strategy */}
            <div className="mb-4">
              <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                {agent?.strategy}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={agent?.agent_status === 'active' ? 'secondary' : 'primary'}
                onClick={() => onStatusToggle(agent?.id, agent?.agent_status)}
                className="flex-1"
              >
                {agent?.agent_status === 'active' ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onConfigureAgent(agent)}
                className="px-2"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {agents?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No agents in this group</p>
        </div>
      )}
    </div>
  );
};

export default AgentGroupPanel;