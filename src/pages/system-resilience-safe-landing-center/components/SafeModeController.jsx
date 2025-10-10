import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Power, AlertCircle, CheckCircle2 } from 'lucide-react';

const SafeModeController = () => {
  const [activationLevel, setActivationLevel] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    trading: 'active',
    regions: { EU: 'active', US: 'active', AS: 'active' },
    agents: 24
  });

  const activationLevels = [
    { level: 0, name: 'Normal Operation', color: 'green', risk: 'low' },
    { level: 1, name: 'Caution Mode', color: 'yellow', risk: 'medium' },
    { level: 2, name: 'Warning State', color: 'orange', risk: 'high' },
    { level: 3, name: 'Emergency Mode', color: 'red', risk: 'critical' },
    { level: 4, name: 'Full Safe Mode', color: 'red', risk: 'maximum' }
  ];

  const emergencyActions = [
    { id: 'halt_all_trading', name: 'Halt All Trading', impact: 'Stops all trading operations immediately', confirmation: true },
    { id: 'isolate_region', name: 'Isolate Region', impact: 'Disconnect specific trading region', confirmation: true },
    { id: 'circuit_breaker', name: 'Circuit Breaker', impact: 'Pause trading for cooling period', confirmation: false },
    { id: 'safe_landing', name: 'Initiate Safe Landing', impact: 'Gradual system shutdown sequence', confirmation: true }
  ];

  const executeAction = (actionId) => {
    const action = emergencyActions?.find(a => a?.id === actionId);
    if (action?.confirmation) {
      setSelectedAction(action);
      setShowConfirmation(true);
    } else {
      performAction(action);
    }
  };

  const performAction = (action) => {
    console.log(`Executing emergency action: ${action?.name}`);
    // Simulate action execution
    setTimeout(() => {
      if (action?.id === 'halt_all_trading') {
        setSystemStatus(prev => ({ ...prev, trading: 'halted' }));
      }
      setShowConfirmation(false);
      setSelectedAction(null);
    }, 1500);
  };

  const getLevelColor = (level) => {
    const colors = {
      green: 'bg-green-500 border-green-600',
      yellow: 'bg-yellow-500 border-yellow-600',
      orange: 'bg-orange-500 border-orange-600',
      red: 'bg-red-500 border-red-600'
    };
    return colors?.[activationLevels?.[level]?.color] || colors?.green;
  };

  return (
    <div className="bg-gray-800 border border-red-500 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Shield className="text-red-400 mr-3 h-6 w-6" />
        <h3 className="text-xl font-bold text-white">SAFE MODE Controller</h3>
      </div>
      {/* Activation Level Selector */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4">Emergency Activation Level</h4>
        <div className="space-y-3">
          {activationLevels?.map((level) => (
            <div
              key={level?.level}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                activationLevel === level?.level 
                  ? getLevelColor(level?.level) + 'text-white' :'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
              onClick={() => setActivationLevel(level?.level)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{level?.name}</span>
                <span className="text-sm opacity-75">Risk: {level?.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Emergency Actions */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <AlertTriangle className="text-orange-400 mr-2 h-5 w-5" />
          Emergency Actions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {emergencyActions?.map((action) => (
            <button
              key={action?.id}
              onClick={() => executeAction(action?.id)}
              className={`p-3 rounded-lg border transition-all ${
                action?.confirmation 
                  ? 'bg-red-900/50 border-red-600 text-red-300 hover:bg-red-900/70' :'bg-orange-900/50 border-orange-600 text-orange-300 hover:bg-orange-900/70'
              }`}
            >
              <div className="text-left">
                <div className="font-medium flex items-center">
                  {action?.confirmation && <AlertCircle className="h-4 w-4 mr-2" />}
                  {action?.name}
                </div>
                <div className="text-sm opacity-75 mt-1">{action?.impact}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* System Status Indicators */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">System Status</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              systemStatus?.trading === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300">
              Trading: {systemStatus?.trading === 'active' ? 'Active' : 'Halted'}
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="text-green-400 h-4 w-4 mr-2" />
            <span className="text-gray-300">Agents: {systemStatus?.agents}/24</span>
          </div>
          <div className="flex items-center">
            <Power className="text-blue-400 h-4 w-4 mr-2" />
            <span className="text-gray-300">Regions: 3/3</span>
          </div>
        </div>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-red-500 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-400 h-6 w-6 mr-3" />
              <h3 className="text-xl font-bold text-white">Confirm Emergency Action</h3>
            </div>
            <p className="text-gray-300 mb-2">
              You are about to execute: <strong>{selectedAction?.name}</strong>
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Impact: {selectedAction?.impact}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => performAction(selectedAction)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Execute
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeModeController;