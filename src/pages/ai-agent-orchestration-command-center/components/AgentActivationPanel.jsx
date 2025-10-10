import React, { useState } from 'react';
import { Play, Square, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AgentActivationPanel({ agents, onBatchActivation, emergencyMode }) {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const getGroupStatus = (groupName) => {
    const groupAgents = agents?.[groupName] || [];
    const total = groupAgents?.length;
    const active = groupAgents?.filter(a => a?.agent_status === 'active')?.length;
    const paused = groupAgents?.filter(a => a?.agent_status === 'paused')?.length;
    
    return { total, active, paused, inactive: total - active - paused };
  };

  const handleGroupToggle = (groupName) => {
    setSelectedGroups(prev => 
      prev?.includes(groupName) 
        ? prev?.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  const handleBatchAction = (action) => {
    if (selectedGroups?.length === 0) return;
    
    setPendingAction({ action, groups: [...selectedGroups] });
    setShowConfirm(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    
    try {
      await Promise.all(
        pendingAction?.groups?.map(groupName => 
          onBatchActivation?.(groupName, pendingAction?.action === 'activate')
        )
      );
      
      setSelectedGroups([]);
      setShowConfirm(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Batch action failed:', error);
      setShowConfirm(false);
      setPendingAction(null);
    }
  };

  const groupColors = {
    ingestion: 'border-blue-500',
    signals: 'border-green-500', 
    execution: 'border-orange-500',
    orchestration: 'border-purple-500'
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Agent Activation Panel</h3>
        {emergencyMode && (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400 font-medium">EMERGENCY MODE</span>
          </div>
        )}
      </div>
      {/* Group Selection */}
      <div className="space-y-2">
        {Object.keys(agents)?.map(groupName => {
          const status = getGroupStatus(groupName);
          const isSelected = selectedGroups?.includes(groupName);
          
          return (
            <div key={groupName} className={`border rounded-lg p-3 cursor-pointer transition-all ${
              isSelected 
                ? `${groupColors?.[groupName]} bg-gray-700/50` 
                : 'border-gray-600 hover:border-gray-500'
            }`} onClick={() => handleGroupToggle(groupName)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-white bg-white' : 'border-gray-500'
                  }`}>
                    {isSelected && <CheckCircle className="w-3 h-3 text-gray-900" />}
                  </div>
                  <span className="font-medium text-white capitalize">{groupName}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {status?.active}/{status?.total}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">Active: {status?.active}</span>
                  <span className="text-yellow-400">Paused: {status?.paused}</span>
                  <span className="text-gray-400">Inactive: {status?.inactive}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Batch Controls */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleBatchAction('activate')}
            disabled={selectedGroups?.length === 0 || emergencyMode}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Activate Groups</span>
          </button>
          <button
            onClick={() => handleBatchAction('deactivate')}
            disabled={selectedGroups?.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Square className="w-4 h-4" />
            <span>Deactivate</span>
          </button>
        </div>
        
        <button
          onClick={() => setSelectedGroups(Object.keys(agents))}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Select All Groups</span>
        </button>
      </div>
      {/* Emergency Shutdown */}
      <div className="border-t border-gray-700 pt-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Emergency Controls</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Immediate shutdown with confirmation dialogs for all active agents
          </p>
          <button
            onClick={() => {
              setPendingAction({ action: 'emergency_shutdown' });
              setShowConfirm(true);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
          >
            Emergency Shutdown All
          </button>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Action</h3>
            <p className="text-gray-300 mb-6">
              {pendingAction?.action === 'emergency_shutdown' 
                ? 'This will immediately shutdown ALL active agents. This action cannot be undone.'
                : `This will ${pendingAction?.action} the following agent groups: ${pendingAction?.groups?.join(', ')}`
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmAction}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setPendingAction(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}