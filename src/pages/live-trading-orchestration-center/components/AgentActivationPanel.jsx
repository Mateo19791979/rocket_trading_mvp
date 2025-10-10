import React, { useState } from 'react';
import { Activity, Database, TrendingUp, Zap, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const AgentActivationPanel = ({ agents, agentStates, systemHealth, providersStatus, onAgentToggle }) => {
  const [expandedAgent, setExpandedAgent] = useState(null);

  const getAgentIcon = (agentName) => {
    switch (agentName) {
      case 'Data Phoenix':
        return Database;
      case 'Quant Oracle':
        return TrendingUp;
      case 'Strategy Weaver':
        return Zap;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'inactive':
        return 'text-gray-400';
      case 'paused':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
        return XCircle;
      case 'paused':
        return AlertCircle;
      case 'error':
        return AlertCircle;
      default:
        return XCircle;
    }
  };

  const getHealthStatus = (agentId) => {
    const health = systemHealth?.[agentId];
    if (!health) return { status: 'unknown', color: 'text-gray-400' };

    if (health?.health_status === 'healthy' && health?.error_count === 0) {
      return { status: 'healthy', color: 'text-green-400' };
    } else if (health?.error_count > 0 || health?.warning_count > 0) {
      return { status: 'warning', color: 'text-yellow-400' };
    } else {
      return { status: 'error', color: 'text-red-400' };
    }
  };

  const getProviderHealth = () => {
    const { providers, apiConfigs } = providersStatus;
    const activeProviders = apiConfigs?.filter(config => config?.is_active)?.length || 0;
    const hasApiKeys = providers && (providers?.finnhub_api || providers?.alpha_api || providers?.twelve_api);
    
    if (activeProviders >= 2 && hasApiKeys) {
      return { status: 'healthy', count: activeProviders, color: 'text-green-400' };
    } else if (activeProviders >= 1) {
      return { status: 'warning', count: activeProviders, color: 'text-yellow-400' };
    } else {
      return { status: 'error', count: activeProviders, color: 'text-red-400' };
    }
  };

  const getIngestionRate = (agentId) => {
    const state = agentStates?.[agentId];
    return state?.ingestion_rate?.current_rate || 0;
  };

  const getProcessingQueue = (agentId) => {
    const state = agentStates?.[agentId];
    return {
      current: state?.processing_queue?.current || 0,
      max: state?.processing_queue?.max || 100
    };
  };

  const getStrategyGeneration = (agentId) => {
    const state = agentStates?.[agentId];
    return {
      active_strategies: state?.active_strategies || 0,
      candidates_published: state?.candidates_published || 0,
      optimization_progress: state?.optimization_progress || 0
    };
  };

  const providerHealth = getProviderHealth();

  return (
    <div className="p-6 bg-gray-800 h-full">
      <h2 className="text-xl font-semibold text-green-400 mb-6">Agent Activation Panel</h2>
      {/* Provider Status Overview */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Data Providers Status</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Active Providers</span>
          <span className={`font-bold ${providerHealth?.color}`}>
            {providerHealth?.count}/3 {providerHealth?.status}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-400">
          Finnhub • Alpha Vantage • TwelveData
        </div>
      </div>
      {/* Agents */}
      <div className="space-y-4">
        {agents?.map((agent) => {
          const IconComponent = getAgentIcon(agent?.name);
          const StatusIcon = getStatusIcon(agent?.agent_status);
          const health = getHealthStatus(agent?.id);
          const isExpanded = expandedAgent === agent?.id;

          return (
            <div key={agent?.id} className="bg-gray-700 rounded-lg overflow-hidden">
              {/* Agent Header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-medium text-white">{agent?.name}</h3>
                      <p className="text-sm text-gray-400">{agent?.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent?.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>

                {/* Status and Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <StatusIcon className={`w-4 h-4 ${getStatusColor(agent?.agent_status)}`} />
                      <span className={`text-sm font-medium ${getStatusColor(agent?.agent_status)}`}>
                        {agent?.agent_status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${health?.color?.replace('text-', 'bg-')}`}></div>
                      <span className={`text-sm ${health?.color}`}>
                        {health?.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAgentToggle(agent?.id, agent?.agent_status === 'active' ? 'inactive' : 'active')}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      agent?.agent_status === 'active' ?'bg-red-600 hover:bg-red-700 text-white' :'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {agent?.agent_status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-600">
                  <div className="mt-3 space-y-3">
                    {/* Data Phoenix Specific Metrics */}
                    {agent?.name === 'Data Phoenix' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Ingestion Rate</span>
                          <span className="text-green-400 font-mono">
                            {getIngestionRate(agent?.id)} ticks/min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Target Rate</span>
                          <span className="text-blue-400 font-mono">&gt;1000 ticks/min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Connection Health</span>
                          <span className={providerHealth?.color}>
                            {providerHealth?.status}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Quant Oracle Specific Metrics */}
                    {agent?.name === 'Quant Oracle' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Processing Queue</span>
                          <span className="text-blue-400 font-mono">
                            {getProcessingQueue(agent?.id)?.current}/{getProcessingQueue(agent?.id)?.max}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Validation Pipeline</span>
                          <span className="text-green-400">Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Performance Score</span>
                          <span className="text-yellow-400 font-mono">
                            {agent?.win_rate?.toFixed(2)}%
                          </span>
                        </div>
                      </>
                    )}

                    {/* Strategy Weaver Specific Metrics */}
                    {agent?.name === 'Strategy Weaver' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Active Strategies</span>
                          <span className="text-blue-400 font-mono">
                            {getStrategyGeneration(agent?.id)?.active_strategies}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Candidates Published</span>
                          <span className="text-green-400 font-mono">
                            {getStrategyGeneration(agent?.id)?.candidates_published}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Optimization Progress</span>
                          <span className="text-yellow-400 font-mono">
                            {getStrategyGeneration(agent?.id)?.optimization_progress}%
                          </span>
                        </div>
                      </>
                    )}

                    {/* Common Metrics */}
                    <div className="mt-4 pt-3 border-t border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last Active</span>
                        <span className="text-gray-300">
                          {agent?.last_active_at 
                            ? new Date(agent.last_active_at)?.toLocaleString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">Total Trades</span>
                        <span className="text-gray-300">{agent?.total_trades || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">Win Rate</span>
                        <span className="text-gray-300">{(agent?.win_rate || 0)?.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentActivationPanel;