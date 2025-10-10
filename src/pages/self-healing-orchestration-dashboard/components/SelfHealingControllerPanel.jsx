import React, { useState } from 'react';
import { Shield, Activity, Play, Pause, RotateCcw, Cpu, MemoryStick, Heart, Zap, Settings } from 'lucide-react';
import selfHealingService from '../../../services/selfHealingService';

const SelfHealingControllerPanel = ({ systemHealth = [], recoveryOperations = [], onTriggerRecovery }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState(null);

  const handleTriggerRecovery = async (agentId, recoveryType = 'restart') => {
    try {
      setRecoveryLoading(true);
      await selfHealingService?.triggerManualRecovery(agentId, recoveryType);
      onTriggerRecovery?.();
    } catch (error) {
      console.error('Recovery trigger failed:', error);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20'; 
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'inactive': return 'text-gray-400 bg-gray-500/20';
      case 'paused': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatLastHeartbeat = (timestamp) => {
    if (!timestamp) return 'N/A';
    const diff = Date.now() - new Date(timestamp)?.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Self-Healing Controller</h2>
            <p className="text-sm text-gray-400">Autonomous recovery algorithms and health management</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {systemHealth?.length || 0} Agents Monitored
        </div>
      </div>
      {/* Health Assessment Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-400" />
          <span>Real-time Health Assessment</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemHealth?.map((health) => (
            <div
              key={health?.id}
              className={`border border-gray-600/50 rounded-lg p-4 transition-all hover:border-blue-500/50 cursor-pointer ${
                expandedAgent === health?.id ? 'border-blue-500/50 bg-blue-500/5' : ''
              }`}
              onClick={() => setExpandedAgent(expandedAgent === health?.id ? null : health?.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{health?.ai_agents?.name || 'Unknown Agent'}</h4>
                  <p className="text-sm text-gray-400">{health?.ai_agents?.agent_group || 'No Group'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(health?.health_status)}`}>
                    {health?.health_status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAgentStatusColor(health?.ai_agents?.agent_status)}`}>
                    {health?.ai_agents?.agent_status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Cpu className="w-4 h-4" />
                    <span>CPU</span>
                  </span>
                  <span className="text-white">{health?.cpu_usage ? `${health?.cpu_usage?.toFixed(1)}%` : 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <MemoryStick className="w-4 h-4" />
                    <span>Memory</span>
                  </span>
                  <span className="text-white">{health?.memory_usage ? `${health?.memory_usage?.toFixed(1)}%` : 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>Heartbeat</span>
                  </span>
                  <span className="text-white">{formatLastHeartbeat(health?.last_heartbeat)}</span>
                </div>
              </div>

              {expandedAgent === health?.id && (
                <div className="mt-4 pt-4 border-t border-gray-600/30">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Uptime</p>
                      <p className="text-white">{formatUptime(health?.uptime_seconds)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Errors</p>
                      <p className="text-white">{health?.error_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Warnings</p>
                      <p className="text-white">{health?.warning_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Active</p>
                      <p className="text-white">{formatLastHeartbeat(health?.ai_agents?.last_active_at)}</p>
                    </div>
                  </div>

                  {/* Recovery Actions */}
                  <div className="mt-4 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleTriggerRecovery(health?.agent_id, 'restart');
                      }}
                      disabled={recoveryLoading}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-lg flex items-center space-x-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restart</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleTriggerRecovery(health?.agent_id, 'pause');
                      }}
                      disabled={recoveryLoading}
                      className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white text-sm rounded-lg flex items-center space-x-1 transition-colors"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleTriggerRecovery(health?.agent_id, 'resume');
                      }}
                      disabled={recoveryLoading}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-sm rounded-lg flex items-center space-x-1 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {systemHealth?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No system health data available</p>
            <p className="text-sm">Agents will appear here once they start reporting health metrics</p>
          </div>
        )}
      </div>
      {/* Automated Recovery Capabilities */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>Automated Recovery Capabilities</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recoveryOperations?.map((operation) => (
            <div key={operation?.id} className="border border-gray-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">Recovery Controller</h4>
                  <p className="text-sm text-gray-400">Auto-recovery: {operation?.auto_recovery_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    operation?.killswitch_status === 'active' ? 'text-green-400 bg-green-500/20' :
                    operation?.killswitch_status === 'triggered'? 'text-red-400 bg-red-500/20' : 'text-gray-400 bg-gray-500/20'
                  }`}>
                    {operation?.killswitch_status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Level</span>
                  <span className="text-white capitalize">{operation?.risk_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recovery Delay</span>
                  <span className="text-white">{operation?.recovery_delay_minutes}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Daily Loss</span>
                  <span className="text-white">${operation?.max_daily_loss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown</span>
                  <span className="text-white">{operation?.max_portfolio_drawdown}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Health Check</span>
                  <span className="text-white">{formatLastHeartbeat(operation?.last_health_check)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recoveryOperations?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recovery operations configured</p>
            <p className="text-sm">Set up automated recovery policies to enhance system resilience</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfHealingControllerPanel;