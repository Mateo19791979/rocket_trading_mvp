import React, { useState } from 'react';
import { Power, AlertTriangle, Users, Shield, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { aiAgentsService } from '../../../services/aiAgentsService';

export default function EmergencyControlPanel({ killswitchActive, onKillswitchToggle, systemOverview }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(false);

  const handleKillswitchClick = () => {
    if (killswitchActive) {
      // Immediate deactivation
      onKillswitchToggle(false);
    } else {
      // Show confirmation for activation
      setShowConfirmation(true);
    }
  };

  const handleConfirmKillswitch = async () => {
    setLoading(true);
    try {
      await onKillswitchToggle(true);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Killswitch activation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentShutdown = async (agentId) => {
    try {
      setLoading(true);
      await aiAgentsService?.updateAgentStatus(agentId, 'inactive');
      await aiAgentsService?.sendLocalNotification(
        '⚠️ Agent Shutdown',
        'Agent has been emergency deactivated'
      );
    } catch (error) {
      console.error('Agent shutdown failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkShutdown = async () => {
    if (selectedAgents?.length === 0) return;
    
    try {
      setLoading(true);
      for (const agentId of selectedAgents) {
        await aiAgentsService?.updateAgentStatus(agentId, 'inactive');
      }
      setSelectedAgents([]);
      await aiAgentsService?.sendLocalNotification(
        '⚠️ Bulk Agent Shutdown',
        `${selectedAgents?.length} agents emergency deactivated`
      );
    } catch (error) {
      console.error('Bulk shutdown failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev?.[group]
    }));
  };

  const getAgentsByGroup = () => {
    if (!systemOverview?.agents?.agents) return {};
    return systemOverview?.agents?.agents;
  };

  return (
    <div className="bg-gray-800 border border-red-600 rounded-lg overflow-hidden">
      <div className="bg-red-900/30 px-6 py-4 border-b border-red-700">
        <div className="flex items-center space-x-3">
          <Power className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-bold text-white">Emergency Control Panel</h2>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* System-wide Killswitch */}
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">System-Wide Killswitch</h3>
                <p className="text-red-300 text-sm">Emergency stop all AI agents</p>
              </div>
            </div>
            
            <button
              onClick={handleKillswitchClick}
              disabled={loading}
              className={`relative inline-flex h-12 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                killswitchActive 
                  ? 'bg-red-600 hover:bg-red-700' :'bg-gray-600 hover:bg-gray-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  killswitchActive ? 'translate-x-8' : 'translate-x-2'
                }`}
              >
                {killswitchActive ? (
                  <Power className="h-5 w-5 text-red-600 m-1.5" />
                ) : (
                  <Shield className="h-5 w-5 text-gray-600 m-1.5" />
                )}
              </span>
            </button>
          </div>

          {killswitchActive && (
            <div className="bg-red-800/50 border border-red-600 rounded p-3">
              <p className="text-red-200 text-sm font-medium">
                ⚠️ EMERGENCY KILLSWITCH ACTIVE - All agents are stopped
              </p>
            </div>
          )}
        </div>

        {/* Individual Agent Controls */}
        <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Individual Agent Controls</h3>
            {selectedAgents?.length > 0 && (
              <button
                onClick={handleBulkShutdown}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Shutdown Selected ({selectedAgents?.length})
              </button>
            )}
          </div>

          <div className="space-y-3">
            {Object.entries(getAgentsByGroup())?.map(([group, agents]) => (
              <div key={group} className="bg-gray-800/50 rounded-lg">
                <button
                  onClick={() => toggleGroupExpansion(group)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-white font-medium capitalize">{group} Group</span>
                    <span className="text-gray-400 text-sm">({agents?.length || 0})</span>
                  </div>
                  {expandedGroups?.[group] ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {expandedGroups?.[group] && (
                  <div className="px-4 pb-4 space-y-2">
                    {agents?.map((agent) => (
                      <div key={agent?.id} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedAgents?.includes(agent?.id)}
                            onChange={(e) => {
                              if (e?.target?.checked) {
                                setSelectedAgents(prev => [...prev, agent?.id]);
                              } else {
                                setSelectedAgents(prev => prev?.filter(id => id !== agent?.id));
                              }
                            }}
                            className="h-4 w-4 text-red-600 rounded border-gray-500 bg-gray-700 focus:ring-red-500"
                          />
                          <div>
                            <p className="text-white font-medium">{agent?.name}</p>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                agent?.agent_status === 'active' ?'bg-green-900 text-green-300'
                                  : agent?.agent_status === 'error' ?'bg-red-900 text-red-300' :'bg-gray-900 text-gray-300'
                              }`}>
                                {agent?.agent_status}
                              </span>
                              <span className="text-gray-400">{agent?.strategy}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAgentShutdown(agent?.id)}
                          disabled={loading || agent?.agent_status === 'inactive'}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          {agent?.agent_status === 'active' ? 'Shutdown' : 'Stopped'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cascading Halt Procedures */}
        <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-6 w-6 text-orange-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Cascading Halt Procedures</h3>
              <p className="text-orange-300 text-sm">Controlled shutdown sequence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button className="bg-orange-700/30 hover:bg-orange-700/50 border border-orange-600 rounded-lg p-3 text-left transition-colors">
              <div className="font-medium text-white">Graceful Shutdown</div>
              <div className="text-orange-300 text-sm">Complete current tasks first</div>
            </button>
            <button className="bg-red-700/30 hover:bg-red-700/50 border border-red-600 rounded-lg p-3 text-left transition-colors">
              <div className="font-medium text-white">Force Stop</div>
              <div className="text-red-300 text-sm">Immediate termination</div>
            </button>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-red-600 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">Confirm Emergency Killswitch</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              This will immediately stop all AI agents and halt all trading activities. 
              This action should only be used in emergency situations.
            </p>
            
            <div className="bg-red-900/30 border border-red-600 rounded p-4 mb-6">
              <h4 className="font-medium text-red-200 mb-2">Impact Assessment:</h4>
              <ul className="text-red-300 text-sm space-y-1">
                <li>• All {systemOverview?.agents?.total || 0} agents will be stopped</li>
                <li>• Active trading positions may be affected</li>
                <li>• Real-time monitoring will be suspended</li>
                <li>• Manual intervention will be required to restart</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmKillswitch}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Activating...' : 'Confirm Killswitch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}