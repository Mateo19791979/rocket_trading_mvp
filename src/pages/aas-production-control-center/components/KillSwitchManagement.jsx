import React, { useState } from 'react';
import { AlertOctagon, Shield, Power, AlertTriangle, CheckCircle, XCircle, Clock, MessageSquare, Zap, Database, TrendingDown, Settings, Activity } from 'lucide-react';

const KillSwitchManagement = ({ killSwitches = [], onToggle, systemHealth }) => {
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [reason, setReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const switchIcons = {
    'EXECUTION': Zap,
    'STRATEGY_GENERATION': Settings,
    'LIVE_TRADING': TrendingDown,
    'DATA_INGESTION': Database,
    'RISK_MANAGEMENT': Shield
  };

  const switchDescriptions = {
    'EXECUTION': 'Order execution and trade operations',
    'STRATEGY_GENERATION': 'AI strategy creation and breeding',
    'LIVE_TRADING': 'Live market trading operations',
    'DATA_INGESTION': 'Market data feeds and processing',
    'RISK_MANAGEMENT': 'Risk assessment and controls'
  };

  const getSwitchColor = (isActive) => {
    return isActive 
      ? 'text-red-400 bg-red-900/20 border-red-500' :'text-green-400 bg-green-900/20 border-green-500';
  };

  const handleSwitchClick = (switchModule) => {
    setSelectedSwitch(switchModule);
    setReason('');
    setShowConfirmDialog(true);
  };

  const confirmToggle = async () => {
    if (selectedSwitch) {
      await onToggle?.(selectedSwitch, reason);
      setShowConfirmDialog(false);
      setSelectedSwitch(null);
      setReason('');
    }
  };

  const cancelToggle = () => {
    setShowConfirmDialog(false);
    setSelectedSwitch(null);
    setReason('');
  };

  const activeKillSwitches = killSwitches?.filter(s => s?.is_active);
  const systemStatus = activeKillSwitches?.length > 0 ? 'restricted' : 'operational';

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <AlertOctagon className="w-5 h-5 mr-2 text-red-400" />
          Kill Switch Management
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            systemStatus === 'operational' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-sm text-gray-400 capitalize">{systemStatus}</span>
        </div>
      </div>
      {/* System Status Overview */}
      <div className={`rounded-lg border p-4 mb-6 ${
        systemStatus === 'operational' ?'bg-green-900/20 border-green-500 text-green-400' :'bg-red-900/20 border-red-500 text-red-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {systemStatus === 'operational' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            <div>
              <h4 className="font-semibold">
                System Status: {systemStatus === 'operational' ? 'Operational' : 'Restricted'}
              </h4>
              <p className="text-sm opacity-80">
                {activeKillSwitches?.length} of {killSwitches?.length} kill switches active
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {activeKillSwitches?.length}/{killSwitches?.length}
            </div>
            <div className="text-xs opacity-80">Active/Total</div>
          </div>
        </div>
      </div>
      {/* Emergency Actions */}
      {systemHealth?.mode === 'critical' && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <h4 className="font-bold text-red-400">CRITICAL SYSTEM STATE</h4>
                <p className="text-sm text-red-300">
                  System health degraded. Emergency protocols recommended.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSwitchClick('LIVE_TRADING')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
            >
              Emergency Stop
            </button>
          </div>
        </div>
      )}
      {/* Kill Switches Grid */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {killSwitches?.map((switchItem) => {
          const IconComponent = switchIcons?.[switchItem?.module] || Activity;
          const isActive = switchItem?.is_active;
          
          return (
            <div
              key={switchItem?.module}
              className={`border rounded-lg p-4 transition-all cursor-pointer hover:opacity-80 ${
                getSwitchColor(isActive)
              }`}
              onClick={() => handleSwitchClick(switchItem?.module)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-5 h-5" />
                  <div>
                    <h4 className="font-semibold">{switchItem?.module?.replace('_', ' ')}</h4>
                    <p className="text-sm opacity-80">
                      {switchDescriptions?.[switchItem?.module] || 'System module'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded text-xs font-bold ${
                    isActive ? 'bg-red-600' : 'bg-green-600'
                  }`}>
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                  {switchItem?.updated_at && (
                    <div className="text-xs opacity-60 mt-1">
                      {new Date(switchItem.updated_at)?.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
              {isActive && switchItem?.reason && (
                <div className="mt-3 pt-3 border-t border-current opacity-60">
                  <div className="flex items-center space-x-2 text-sm">
                    <MessageSquare className="w-3 h-3" />
                    <span>Reason: {switchItem?.reason}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Master Controls */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            // Emergency stop all
            killSwitches?.forEach(s => {
              if (!s?.is_active) {
                handleSwitchClick(s?.module);
              }
            });
          }}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
        >
          <Power className="w-4 h-4" />
          <span>Emergency Stop All</span>
        </button>

        <button
          onClick={() => {
            // Restore all systems
            killSwitches?.forEach(s => {
              if (s?.is_active) {
                handleSwitchClick(s?.module);
              }
            });
          }}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Restore All Systems</span>
        </button>
      </div>
      {/* Active Kill Switches List */}
      {activeKillSwitches?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-lg font-medium mb-3 text-gray-300">Active Restrictions</h4>
          <div className="space-y-2">
            {activeKillSwitches?.map((switchItem) => {
              const IconComponent = switchIcons?.[switchItem?.module] || Activity;
              
              return (
                <div key={switchItem?.module} className="flex items-center justify-between bg-red-900/20 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-4 h-4 text-red-400" />
                    <div>
                      <span className="text-sm font-medium text-red-400">
                        {switchItem?.module?.replace('_', ' ')}
                      </span>
                      {switchItem?.reason && (
                        <div className="text-xs text-red-300">{switchItem?.reason}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-red-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(switchItem.updated_at)?.toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedSwitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Confirm Kill Switch Action
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                {killSwitches?.find(s => s?.module === selectedSwitch)?.is_active 
                  ? 'Deactivate' : 'Activate'} kill switch for:
              </p>
              <p className="font-semibold text-white">
                {selectedSwitch?.replace('_', ' ')}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e?.target?.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white resize-none"
                rows="3"
                placeholder="Enter reason for this action..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmToggle}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={cancelToggle}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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

export default KillSwitchManagement;