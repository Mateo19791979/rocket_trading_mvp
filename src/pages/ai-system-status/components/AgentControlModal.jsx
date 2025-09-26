import React, { useState } from 'react';
import { X, AlertTriangle, Power, Shield } from 'lucide-react';

const AgentControlModal = ({ isOpen, onClose, onDegradedMode, systemStats }) => {
  const [confirmationStep, setConfirmationStep] = useState(null);
  const [degradedReason, setDegradedReason] = useState('');

  if (!isOpen) return null;

  const handleDegradedModeActivation = async () => {
    if (!degradedReason?.trim()) {
      alert('Please provide a reason for activating degraded mode');
      return;
    }

    try {
      await onDegradedMode(degradedReason);
      setConfirmationStep(null);
      setDegradedReason('');
      onClose();
    } catch (error) {
      console.error('Error activating degraded mode:', error);
    }
  };

  const emergencyActions = [
    {
      id: 'degraded_mode',
      title: 'Activate Degraded Mode',
      description: 'Pause all active agents and switch to offline-safe operation',
      icon: Shield,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      impact: 'All trading will be suspended, system switches to read-only mode',
      action: () => setConfirmationStep('degraded_mode')
    },
    {
      id: 'emergency_stop',
      title: 'Emergency System Stop',
      description: 'Immediately stop all agent operations and trading activities',
      icon: Power,
      color: 'bg-red-600 hover:bg-red-700',
      impact: 'Complete system shutdown, all operations will cease',
      action: () => setConfirmationStep('emergency_stop')
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Emergency System Controls</h2>
          <button
            onClick={() => {
              setConfirmationStep(null);
              setDegradedReason('');
              onClose();
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!confirmationStep ? (
          <>
            {/* System Overview */}
            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Current System Status</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {systemStats?.totalAgents || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Agents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {systemStats?.statusCounts?.active || 0}
                  </div>
                  <div className="text-sm text-gray-400">Active Agents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {systemStats?.systemLoad || 0}%
                  </div>
                  <div className="text-sm text-gray-400">System Load</div>
                </div>
              </div>
            </div>

            {/* Emergency Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Emergency Actions</h3>
              
              {emergencyActions?.map((action) => {
                const IconComponent = action?.icon;
                
                return (
                  <div
                    key={action?.id}
                    className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${action?.color}/20`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{action?.title}</h4>
                        <p className="text-gray-400 text-sm mb-2">{action?.description}</p>
                        <p className="text-yellow-300 text-xs mb-3">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Impact: {action?.impact}
                        </p>
                        
                        <button
                          onClick={action?.action}
                          className={`px-4 py-2 rounded text-sm font-medium text-white transition-colors ${action?.color}`}
                        >
                          {action?.title}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-red-600/20 border border-red-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-semibold">Warning</span>
              </div>
              <p className="text-red-200 text-sm mt-2">
                These actions will significantly impact system operations. Use only in emergency situations 
                when normal system operation is compromised.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation Step */}
            {confirmationStep === 'degraded_mode' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Activate Degraded Mode?</h3>
                  <p className="text-gray-400">
                    This will pause all active agents and switch the system to offline-safe operation.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for activation (required)
                  </label>
                  <textarea
                    value={degradedReason}
                    onChange={(e) => setDegradedReason(e?.target?.value)}
                    placeholder="Describe the reason for activating degraded mode..."
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 resize-none"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setConfirmationStep(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDegradedModeActivation}
                    className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white transition-colors"
                  >
                    Confirm Activation
                  </button>
                </div>
              </div>
            )}

            {confirmationStep === 'emergency_stop' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Power className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Emergency System Stop?</h3>
                  <p className="text-gray-400">
                    This will immediately stop all agent operations and trading activities.
                  </p>
                </div>

                <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-semibold">Critical Warning</span>
                  </div>
                  <p className="text-red-200 text-sm">
                    This action will completely shut down the trading system. All active positions 
                    will remain open but no new trades will be executed. Manual intervention will 
                    be required to restart the system.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setConfirmationStep(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Implement emergency stop logic here
                      console.log('Emergency stop activated');
                      setConfirmationStep(null);
                      onClose();
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                  >
                    Confirm Emergency Stop
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgentControlModal;