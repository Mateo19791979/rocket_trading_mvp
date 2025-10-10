import React, { useState } from 'react';
import { AlertTriangle, Zap, Plus, RefreshCw, ArrowRight, Shield } from 'lucide-react';
import { providerConfigurationService } from '../../../services/providerConfigurationService';

const EmergencyFailoverPanel = ({ providers = [], failoverConfigs = [], onConfigUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [triggering, setTriggering] = useState({});
  const [newConfig, setNewConfig] = useState({
    primary_provider: '',
    fallback_provider: '',
    trigger_type: 'latency_exceeded',
    threshold_value: 400,
    priority_order: 1
  });

  const triggerTypes = [
    { value: 'latency_exceeded', label: 'Latency Exceeded', description: 'Trigger when response time exceeds threshold' },
    { value: 'quota_exceeded', label: 'Quota Exceeded', description: 'Trigger when usage exceeds percentage' },
    { value: 'connection_failed', label: 'Connection Failed', description: 'Trigger on connection failures' },
    { value: 'manual', label: 'Manual Override', description: 'Manually triggered failover' }
  ];

  const handleCreateConfig = async () => {
    try {
      await providerConfigurationService?.createFailoverConfig(newConfig);
      setNewConfig({
        primary_provider: '',
        fallback_provider: '',
        trigger_type: 'latency_exceeded',
        threshold_value: 400,
        priority_order: 1
      });
      setShowAddForm(false);
      onConfigUpdate?.();
    } catch (error) {
      console.error('Error creating failover config:', error);
    }
  };

  const handleManualFailover = async (primaryProvider) => {
    try {
      setTriggering(prev => ({ ...prev, [primaryProvider]: true }));
      
      const result = await providerConfigurationService?.triggerManualFailover(primaryProvider, 'manual');
      
      if (result?.success) {
        // Success notification would go here
        onConfigUpdate?.();
      } else {
        // Error notification would go here
        console.error('Failover failed:', result?.message);
      }
    } catch (error) {
      console.error('Error triggering failover:', error);
    } finally {
      setTriggering(prev => ({ ...prev, [primaryProvider]: false }));
    }
  };

  const getProviderName = (apiName) => {
    return apiName?.replace('_', ' ')?.toUpperCase();
  };

  const getThresholdDisplay = (config) => {
    switch (config?.trigger_type) {
      case 'latency_exceeded':
        return `${config?.threshold_value}ms`;
      case 'quota_exceeded':
        return `${config?.threshold_value}%`;
      default:
        return 'N/A';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Emergency Failover Controls</h2>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Failover Rule
        </button>
      </div>
      {/* Automated Switching Logic */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
          Automated Switching Logic
        </h3>
        
        <div className="space-y-3">
          {failoverConfigs?.map(config => (
            <div key={config?.id} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-400">
                      {getProviderName(config?.primary_provider)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-green-400">
                      {getProviderName(config?.fallback_provider)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    when {config?.trigger_type?.replace('_', ' ')} {getThresholdDisplay(config)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    config?.is_active ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-xs text-gray-400">
                    Priority {config?.priority_order}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {failoverConfigs?.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p>No failover configurations set up</p>
              <p className="text-sm">Add failover rules to ensure continuous data availability</p>
            </div>
          )}
        </div>
      </div>
      {/* Manual Provider Priority */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
          Manual Provider Priority Override
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers?.filter(p => p?.is_active)?.map(provider => {
            const isTriggering = triggering?.[provider?.api_name];
            
            return (
              <div key={provider?.id} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    {getProviderName(provider?.api_name)}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      provider?.is_active ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleManualFailover(provider?.api_name)}
                    disabled={isTriggering}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {isTriggering ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Trigger Failover
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-400 text-center">
                    Switches to next priority provider
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Add Failover Configuration Form */}
      {showAddForm && (
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-medium mb-4">Add Failover Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Provider
              </label>
              <select
                value={newConfig?.primary_provider}
                onChange={(e) => setNewConfig(prev => ({ ...prev, primary_provider: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select primary provider</option>
                {providers?.filter(p => p?.is_active)?.map(provider => (
                  <option key={provider?.id} value={provider?.api_name}>
                    {getProviderName(provider?.api_name)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fallback Provider
              </label>
              <select
                value={newConfig?.fallback_provider}
                onChange={(e) => setNewConfig(prev => ({ ...prev, fallback_provider: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select fallback provider</option>
                {providers?.filter(p => p?.is_active && p?.api_name !== newConfig?.primary_provider)?.map(provider => (
                  <option key={provider?.id} value={provider?.api_name}>
                    {getProviderName(provider?.api_name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trigger Type
              </label>
              <select
                value={newConfig?.trigger_type}
                onChange={(e) => setNewConfig(prev => ({ ...prev, trigger_type: e?.target?.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {triggerTypes?.map(type => (
                  <option key={type?.value} value={type?.value}>
                    {type?.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Threshold Value
              </label>
              <input
                type="number"
                value={newConfig?.threshold_value || ''}
                onChange={(e) => setNewConfig(prev => ({ ...prev, threshold_value: parseInt(e?.target?.value) || 0 }))}
                placeholder={newConfig?.trigger_type === 'latency_exceeded' ? '400' : '95'}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                {newConfig?.trigger_type === 'latency_exceeded' && 'Milliseconds'}
                {newConfig?.trigger_type === 'quota_exceeded' && 'Percentage (0-100)'}
                {newConfig?.trigger_type === 'connection_failed' && 'Not applicable'}
                {newConfig?.trigger_type === 'manual' && 'Not applicable'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreateConfig}
              disabled={!newConfig?.primary_provider || !newConfig?.fallback_provider}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              Create Rule
            </button>
          </div>
        </div>
      )}
      {/* Audit Logging Info */}
      <div className="bg-gray-700/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h4 className="font-medium">Audit Logging</h4>
        </div>
        <p className="text-sm text-gray-400">
          All failover events are automatically logged with timestamps, triggers, and target providers for comprehensive audit trails and system reliability analysis.
        </p>
      </div>
    </div>
  );
};

export default EmergencyFailoverPanel;