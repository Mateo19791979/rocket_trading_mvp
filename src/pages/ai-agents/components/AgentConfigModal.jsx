import React, { useState, useEffect } from 'react';
import { X, Save, Settings } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AgentConfigModal = ({ agent, isOpen, onClose, onSave }) => {
  const [configuration, setConfiguration] = useState({});
  const [riskParameters, setRiskParameters] = useState({});
  const [loading, setSaving] = useState(false);

  useEffect(() => {
    if (agent) {
      setConfiguration(agent?.configuration || {});
      setRiskParameters(agent?.risk_parameters || {});
    }
  }, [agent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(agent?.id, {
        ...configuration,
        risk_parameters: riskParameters
      });
      onClose();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfiguration = (key, value) => {
    setConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateRiskParameters = (key, value) => {
    setRiskParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-white">Configure Agent</h2>
              <p className="text-sm text-gray-400">{agent?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Agent Information */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">Agent Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Group:</span>
                <span className="text-white ml-2 capitalize">{agent?.agent_group}</span>
              </div>
              <div>
                <span className="text-gray-400">Strategy:</span>
                <span className="text-white ml-2 capitalize">{agent?.strategy}</span>
              </div>
              <div>
                <span className="text-gray-400">Category:</span>
                <span className="text-white ml-2">{agent?.agent_category}</span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 capitalize ${
                  agent?.agent_status === 'active' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {agent?.agent_status}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Parameters */}
          <div>
            <h3 className="font-medium text-white mb-4">Configuration Parameters</h3>
            <div className="space-y-4">
              {/* Render configuration fields based on agent type */}
              {agent?.agent_group === 'ingestion' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Refresh Rate (seconds)
                    </label>
                    <Input
                      type="number"
                      value={configuration?.refresh_rate || 60}
                      onChange={(e) => updateConfiguration('refresh_rate', parseInt(e?.target?.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max API Calls per Minute
                    </label>
                    <Input
                      type="number"
                      value={configuration?.max_api_calls || 100}
                      onChange={(e) => updateConfiguration('max_api_calls', parseInt(e?.target?.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </>
              )}

              {agent?.agent_group === 'signals' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Signal Strength Threshold
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={configuration?.signal_threshold || 0.7}
                      onChange={(e) => updateConfiguration('signal_threshold', parseFloat(e?.target?.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Signals per Day
                    </label>
                    <Input
                      type="number"
                      value={configuration?.max_signals_per_day || 50}
                      onChange={(e) => updateConfiguration('max_signals_per_day', parseInt(e?.target?.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </>
              )}

              {agent?.agent_group === 'execution' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Slippage Model
                    </label>
                    <select
                      value={configuration?.slippage_model || 'linear'}
                      onChange={(e) => updateConfiguration('slippage_model', e?.target?.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="linear">Linear</option>
                      <option value="sqrt">Square Root</option>
                      <option value="market_impact">Market Impact</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Order Size
                    </label>
                    <Input
                      type="number"
                      value={configuration?.max_order_size || 10000}
                      onChange={(e) => updateConfiguration('max_order_size', parseInt(e?.target?.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </>
              )}

              {agent?.agent_group === 'orchestration' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Health Check Frequency (seconds)
                    </label>
                    <Input
                      type="number"
                      value={configuration?.health_check_frequency || 30}
                      onChange={(e) => updateConfiguration('health_check_frequency', parseInt(e?.target?.value))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto_restart"
                      checked={configuration?.auto_restart || false}
                      onChange={(e) => updateConfiguration('auto_restart', e?.target?.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="auto_restart" className="text-sm text-gray-300">
                      Enable Auto Restart
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Risk Parameters */}
          <div>
            <h3 className="font-medium text-white mb-4">Risk Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Daily Loss Limit ($)
                </label>
                <Input
                  type="number"
                  value={agent?.daily_loss_limit || 1000}
                  onChange={(e) => updateRiskParameters('daily_loss_limit', parseFloat(e?.target?.value))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Position Size ($)
                </label>
                <Input
                  type="number"
                  value={agent?.max_position_size || 10000}
                  onChange={(e) => updateRiskParameters('max_position_size', parseFloat(e?.target?.value))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Risk Per Trade (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={riskParameters?.risk_per_trade || 2}
                  onChange={(e) => updateRiskParameters('risk_per_trade', parseFloat(e?.target?.value))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigModal;