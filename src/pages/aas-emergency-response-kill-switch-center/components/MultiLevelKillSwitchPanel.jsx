import { useState } from 'react';
import { Power, AlertTriangle, Zap, Pause, Monitor, ShieldX } from 'lucide-react';
import Icon from '@/components/AppIcon';


const KILL_SWITCH_LEVELS = {
  level_1_monitoring: {
    label: 'Level 1 - Monitoring Only',
    icon: Monitor,
    color: 'bg-blue-500',
    description: 'Enhanced monitoring, no trading restrictions'
  },
  level_2_strategy_freeze: {
    label: 'Level 2 - Strategy Freeze',
    icon: Pause,
    color: 'bg-yellow-500',
    description: 'Pause new strategy deployment, continue existing'
  },
  level_3_autonomy_reduction: {
    label: 'Level 3 - Autonomy Reduction',
    icon: ShieldX,
    color: 'bg-orange-500',
    description: 'Reduce AI autonomy, require manual approval'
  },
  level_4_breeding_termination: {
    label: 'Level 4 - Breeding Termination',
    icon: AlertTriangle,
    color: 'bg-red-500',
    description: 'Stop strategy breeding, maintain current positions'
  },
  level_5_complete_halt: {
    label: 'Level 5 - Complete System Halt',
    icon: Zap,
    color: 'bg-red-700',
    description: 'Emergency halt of all AI trading activities'
  }
};

export default function MultiLevelKillSwitchPanel({ killSwitches = [], onAction }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('level_2_strategy_freeze');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleActivateKillSwitch = (module) => {
    setSelectedModule(module);
    setConfirmationOpen(true);
  };

  const confirmActivation = async () => {
    if (!selectedModule || !reason?.trim()) return;

    await onAction?.('activate_killswitch', {
      module: selectedModule,
      level: selectedLevel,
      reason: reason?.trim()
    });

    setConfirmationOpen(false);
    setSelectedModule(null);
    setReason('');
  };

  const handleDeactivate = async (module) => {
    await onAction?.('deactivate_killswitch', {
      module,
      reason: 'Manual deactivation via emergency panel'
    });
  };

  const getLevelBadgeColor = (level) => {
    return KILL_SWITCH_LEVELS?.[level]?.color || 'bg-gray-500';
  };

  const getModuleStatusColor = (killSwitch) => {
    if (!killSwitch?.is_active) return 'bg-green-100 border-green-300 text-green-800';
    
    const level = killSwitch?.aas_level;
    if (level?.includes('level_5') || level?.includes('level_4')) {
      return 'bg-red-100 border-red-500 text-red-800';
    }
    if (level?.includes('level_3')) {
      return 'bg-orange-100 border-orange-500 text-orange-800';
    }
    return 'bg-yellow-100 border-yellow-500 text-yellow-800';
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-red-600 shadow-2xl">
      <div className="p-6 border-b border-red-600">
        <div className="flex items-center space-x-3">
          <Power className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-bold text-red-100">Multi-Level Kill Switch Panel</h2>
        </div>
        <p className="text-red-300 text-sm mt-1">
          Graduated emergency controls for systematic risk management
        </p>
      </div>
      <div className="p-6">
        {/* Kill Switch Levels Overview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Emergency Response Levels</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object?.entries(KILL_SWITCH_LEVELS)?.map(([level, config]) => {
              const Icon = config?.icon;
              return (
                <div key={level} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-700">
                  <div className={`p-2 rounded ${config?.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{config?.label}</div>
                    <div className="text-gray-400 text-xs">{config?.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Kill Switches */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">System Modules</h3>
          {killSwitches?.map((killSwitch) => (
            <div
              key={killSwitch?.module}
              className={`p-4 rounded-lg border ${getModuleStatusColor(killSwitch)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Power
                    className={`h-5 w-5 ${killSwitch?.is_active ? 'text-red-600' : 'text-green-600'}`}
                  />
                  <div>
                    <div className="font-semibold">{killSwitch?.module}</div>
                    <div className="text-sm opacity-75">
                      Status: {killSwitch?.is_active ? 'ACTIVE' : 'INACTIVE'} •
                      Level: {killSwitch?.aas_level?.replace('level_', 'L')?.replace('_', ' ')?.toUpperCase()}
                    </div>
                    {killSwitch?.reason && (
                      <div className="text-xs opacity-60 mt-1">
                        Reason: {killSwitch?.reason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {killSwitch?.is_active && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadgeColor(killSwitch?.aas_level)} text-white`}>
                      {killSwitch?.aas_level?.replace('level_', 'L')?.replace('_', ' ')?.toUpperCase()}
                    </span>
                  )}
                  
                  {killSwitch?.is_active ? (
                    <button
                      onClick={() => handleDeactivate(killSwitch?.module)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      DEACTIVATE
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateKillSwitch(killSwitch?.module)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      ACTIVATE
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Actions */}
        <div className="mt-6 p-4 bg-red-900 rounded-lg border border-red-600">
          <h4 className="text-red-100 font-semibold mb-2">⚡ Emergency Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => {
                setSelectedModule('LIVE_TRADING');
                setSelectedLevel('level_5_complete_halt');
                setConfirmationOpen(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors text-sm"
            >
              🚨 EMERGENCY HALT ALL TRADING
            </button>
            <button
              onClick={() => {
                setSelectedModule('STRATEGY_GENERATION');
                setSelectedLevel('level_4_breeding_termination');
                setConfirmationOpen(true);
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold transition-colors text-sm"
            >
              🛑 STOP STRATEGY BREEDING
            </button>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-red-500 p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-red-100">Confirm Kill Switch Activation</h3>
              <p className="text-red-300 text-sm">
                You are about to activate kill switch for: <strong>{selectedModule}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Emergency Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e?.target?.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none"
                >
                  {Object?.entries(KILL_SWITCH_LEVELS)?.map(([level, config]) => (
                    <option key={level} value={level}>
                      {config?.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Reason (Required)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e?.target?.value)}
                  placeholder="Describe the emergency situation..."
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={confirmActivation}
                  disabled={!reason?.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded font-bold transition-colors"
                >
                  CONFIRM ACTIVATION
                </button>
                <button
                  onClick={() => {
                    setConfirmationOpen(false);
                    setSelectedModule(null);
                    setReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}