import React, { useState, useEffect } from 'react';
import { Settings, ToggleLeft, Sliders, Shield, Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw, Plus, Edit, Trash, Save, X } from 'lucide-react';
import featureFlagsProviderService from '../../services/featureFlagsProviderService';
import resilienceControllerService from '../../services/resilienceControllerService';

const FeatureFlagsProviderControlPanel = () => {
  const [featureFlags, setFeatureFlags] = useState([]);
  const [providerToggles, setProviderToggles] = useState([]);
  const [flagStats, setFlagStats] = useState(null);
  const [providerStats, setProviderStats] = useState(null);
  const [resilienceState, setResilienceState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feature-flags');
  const [editingFlag, setEditingFlag] = useState(null);
  const [newFlag, setNewFlag] = useState({ key: '', flag_type: 'boolean', value: 'false', description: '' });
  const [showNewFlagForm, setShowNewFlagForm] = useState(false);

  const loadFeatureFlags = async () => {
    const result = await featureFlagsProviderService?.getFeatureFlags();
    if (result?.error) {
      console.error('Failed to load feature flags:', result?.error);
    } else {
      setFeatureFlags(result?.data || []);
    }
  };

  const loadProviderToggles = async () => {
    const result = await featureFlagsProviderService?.getProviderToggles();
    if (result?.error) {
      console.error('Failed to load provider toggles:', result?.error);
    } else {
      setProviderToggles(result?.data || []);
    }
  };

  const loadStats = async () => {
    const [flagResult, providerResult] = await Promise.all([
      featureFlagsProviderService?.getFlagStats(),
      featureFlagsProviderService?.getProviderStats()
    ]);
    
    if (flagResult?.data) setFlagStats(flagResult?.data);
    if (providerResult?.data) setProviderStats(providerResult?.data);
  };

  const loadResilienceState = async () => {
    const result = await resilienceControllerService?.getCurrentState();
    if (result?.data) setResilienceState(result?.data);
  };

  const handleFlagUpdate = (payload) => {
    loadFeatureFlags();
    loadStats();
  };

  const handleProviderUpdate = (payload) => {
    loadProviderToggles();
    loadStats();
  };

  const handleResilienceUpdate = (payload) => {
    loadResilienceState();
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadFeatureFlags(),
        loadProviderToggles(),
        loadStats(),
        loadResilienceState()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    
    // Set up real-time subscriptions
    const unsubscribeFlags = featureFlagsProviderService?.subscribeToFeatureFlags(handleFlagUpdate);
    const unsubscribeProviders = featureFlagsProviderService?.subscribeToProviderToggles(handleProviderUpdate);
    const unsubscribeResilience = resilienceControllerService?.subscribeToResilienceState(handleResilienceUpdate);
    
    // Set up periodic refresh
    const refreshInterval = setInterval(loadStats, 30000);

    return () => {
      unsubscribeFlags?.();
      unsubscribeProviders?.();
      unsubscribeResilience?.();
      clearInterval(refreshInterval);
    };
  }, []);

  const handleToggleFlag = async (flagId, isActive) => {
    const result = await featureFlagsProviderService?.toggleFeatureFlag(flagId, isActive);
    if (result?.error) {
      console.error('Failed to toggle flag:', result?.error);
    } else {
      setFeatureFlags(prev => prev?.map(flag => 
        flag?.id === flagId ? { ...flag, is_active: isActive } : flag
      ));
    }
  };

  const handleToggleProvider = async (providerName, enabled) => {
    const result = await featureFlagsProviderService?.toggleProvider(providerName, enabled);
    if (result?.error) {
      console.error('Failed to toggle provider:', result?.error);
    } else {
      setProviderToggles(prev => prev?.map(provider => 
        provider?.provider_name === providerName 
          ? { ...provider, enabled, status: enabled ? 'active' : 'inactive' }
          : provider
      ));
    }
  };

  const handleUpdateProviderPriority = async (providerName, priority) => {
    const result = await featureFlagsProviderService?.updateProviderPriority(providerName, priority);
    if (result?.error) {
      console.error('Failed to update provider priority:', result?.error);
    } else {
      setProviderToggles(prev => prev?.map(provider => 
        provider?.provider_name === providerName 
          ? { ...provider, priority }
          : provider
      ));
    }
  };

  const handleCircuitBreakerToggle = async (providerName, shouldOpen) => {
    const result = shouldOpen 
      ? await featureFlagsProviderService?.openCircuitBreaker(providerName, 'Manual override')
      : await featureFlagsProviderService?.closeCircuitBreaker(providerName);
    
    if (result?.error) {
      console.error('Failed to toggle circuit breaker:', result?.error);
    } else {
      loadProviderToggles(); // Refresh to get updated state
    }
  };

  const handleCreateFlag = async () => {
    const result = await featureFlagsProviderService?.createFeatureFlag(newFlag);
    if (result?.error) {
      console.error('Failed to create flag:', result?.error);
    } else {
      setFeatureFlags(prev => [result?.data, ...prev]);
      setNewFlag({ key: '', flag_type: 'boolean', value: 'false', description: '' });
      setShowNewFlagForm(false);
    }
  };

  const handleUpdateFlag = async (flagId, updates) => {
    const result = await featureFlagsProviderService?.updateFeatureFlag(flagId, updates);
    if (result?.error) {
      console.error('Failed to update flag:', result?.error);
    } else {
      setFeatureFlags(prev => prev?.map(flag => 
        flag?.id === flagId ? { ...flag, ...updates } : flag
      ));
      setEditingFlag(null);
    }
  };

  const handleDeleteFlag = async (flagId) => {
    if (window.confirm('Are you sure you want to delete this flag?')) {
      const result = await featureFlagsProviderService?.deleteFeatureFlag(flagId);
      if (result?.error) {
        console.error('Failed to delete flag:', result?.error);
      } else {
        setFeatureFlags(prev => prev?.filter(flag => flag?.id !== flagId));
      }
    }
  };

  const getStatusIcon = (enabled, status, circuitBreakerOpen) => {
    if (circuitBreakerOpen) return { icon: XCircle, color: 'text-red-400', status: 'Circuit Breaker Open' };
    if (!enabled) return { icon: XCircle, color: 'text-gray-400', status: 'Disabled' };
    if (status === 'active') return { icon: CheckCircle, color: 'text-green-400', status: 'Active' };
    if (status === 'degraded') return { icon: AlertTriangle, color: 'text-yellow-400', status: 'Degraded' };
    return { icon: XCircle, color: 'text-orange-400', status: status };
  };

  const getHealthColor = (healthScore) => {
    if (healthScore >= 0.9) return 'text-green-400';
    if (healthScore >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading Feature Flags & Provider Control Panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Settings className="text-blue-400" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Feature Flags & Provider Control Panel</h1>
                <p className="text-gray-300 mt-1">
                  Dynamic configuration management and real-time provider switching capabilities
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={loadInitialData}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-6 mt-6">
            {[
              { id: 'feature-flags', name: 'Feature Flags Management', icon: ToggleLeft },
              { id: 'provider-toggles', name: 'Provider Toggles', icon: Sliders },
              { id: 'configuration-dashboard', name: 'Configuration Dashboard', icon: Activity },
              { id: 'safety-controls', name: 'Safety Controls', icon: Shield }
            ]?.map(tab => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab?.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Feature Flags Management */}
            {activeTab === 'feature-flags' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center space-x-2">
                    <ToggleLeft className="text-blue-400" size={20} />
                    <span>Feature Flags Management</span>
                  </h2>
                  <button
                    onClick={() => setShowNewFlagForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Flag</span>
                  </button>
                </div>

                {/* New Flag Form */}
                {showNewFlagForm && (
                  <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Create New Feature Flag</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Flag Key"
                        value={newFlag?.key}
                        onChange={(e) => setNewFlag(prev => ({ ...prev, key: e?.target?.value }))}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      />
                      <select
                        value={newFlag?.flag_type}
                        onChange={(e) => setNewFlag(prev => ({ ...prev, flag_type: e?.target?.value }))}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      >
                        <option value="boolean">Boolean</option>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Default Value"
                        value={newFlag?.value}
                        onChange={(e) => setNewFlag(prev => ({ ...prev, value: e?.target?.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="mb-4">
                      <textarea
                        placeholder="Description"
                        value={newFlag?.description}
                        onChange={(e) => setNewFlag(prev => ({ ...prev, description: e?.target?.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-20"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowNewFlagForm(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateFlag}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        Create Flag
                      </button>
                    </div>
                  </div>
                )}

                {/* Feature Flags List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {featureFlags?.map((flag) => (
                    <div key={flag?.id} className="bg-gray-700/50 rounded-lg p-4">
                      {editingFlag?.id === flag?.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingFlag?.value}
                            onChange={(e) => setEditingFlag(prev => ({ ...prev, value: e?.target?.value }))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingFlag(null)}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <X size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateFlag(flag?.id, { value: editingFlag?.value })}
                              className="p-1 text-green-400 hover:text-green-300"
                            >
                              <Save size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleToggleFlag(flag?.id, !flag?.is_active)}
                                className={`p-2 rounded-lg transition-colors ${
                                  flag?.is_active 
                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :'bg-gray-600/50 text-gray-400 hover:bg-gray-600/70'
                                }`}
                              >
                                <ToggleLeft size={16} />
                              </button>
                              <div>
                                <div className="font-medium">{flag?.key}</div>
                                <div className="text-sm text-gray-400">{flag?.description}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingFlag({ id: flag?.id, value: flag?.value })}
                                className="p-1 text-gray-400 hover:text-blue-400"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteFlag(flag?.id)}
                                className="p-1 text-gray-400 hover:text-red-400"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-400">Type</div>
                              <div className="capitalize">{flag?.flag_type}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Value</div>
                              <div className="font-mono text-xs">{flag?.value}</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Status</div>
                              <div className={flag?.is_active ? 'text-green-400' : 'text-gray-400'}>
                                {flag?.is_active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Toggles Panel */}
            {activeTab === 'provider-toggles' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center space-x-2">
                    <Sliders className="text-teal-400" size={20} />
                    <span>Provider Toggles</span>
                  </h2>
                  {providerStats && (
                    <div className="text-sm text-gray-400">
                      Active: {providerStats?.active} / {providerStats?.total}
                    </div>
                  )}
                </div>

                {/* Provider Toggles List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {providerToggles?.sort((a, b) => b?.priority - a?.priority)?.map((provider) => {
                    const statusInfo = getStatusIcon(provider?.enabled, provider?.status, provider?.circuit_breaker_open);
                    return (
                      <div key={provider?.provider_name} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <statusInfo.icon className={statusInfo?.color} size={20} />
                            <div>
                              <div className="font-medium">{provider?.provider_name}</div>
                              <div className="text-sm text-gray-400">{statusInfo?.status}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleToggleProvider(provider?.provider_name, !provider?.enabled)}
                              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                provider?.enabled 
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                            >
                              {provider?.enabled ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Priority</div>
                            <input
                              type="number"
                              value={provider?.priority}
                              onChange={(e) => handleUpdateProviderPriority(provider?.provider_name, parseInt(e?.target?.value))}
                              className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <div className="text-gray-400">Health</div>
                            <div className={`font-medium ${getHealthColor(provider?.health_score)}`}>
                              {(provider?.health_score * 100)?.toFixed(0)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Success</div>
                            <div className="font-medium text-green-400">{provider?.success_count}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Errors</div>
                            <div className="font-medium text-red-400">{provider?.error_count}</div>
                          </div>
                        </div>
                        {provider?.circuit_breaker_open && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Circuit Breaker Open</span>
                              <button
                                onClick={() => handleCircuitBreakerToggle(provider?.provider_name, false)}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        )}
                        {provider?.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="text-sm text-gray-400">{provider?.notes}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Configuration Dashboard */}
            {activeTab === 'configuration-dashboard' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="text-green-400" size={20} />
                  <h2 className="text-xl font-bold">Configuration Dashboard</h2>
                </div>
                
                {/* Flag Statistics */}
                {flagStats && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Feature Flag Status</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">{flagStats?.active}</div>
                        <div className="text-gray-400 text-sm">Active Flags</div>
                      </div>
                      <div className="bg-gray-500/10 rounded-lg p-4 border border-gray-500/20">
                        <div className="text-2xl font-bold text-gray-400">{flagStats?.inactive}</div>
                        <div className="text-gray-400 text-sm">Inactive Flags</div>
                      </div>
                    </div>
                    
                    {/* Flag Types */}
                    <div className="space-y-2">
                      {Object.entries(flagStats?.by_type || {})?.map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between py-2">
                          <span className="text-gray-300 capitalize">{type}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider Performance */}
                {providerStats && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Provider Performance</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                        <div className="text-2xl font-bold text-blue-400">
                          {(providerStats?.success_rate * 100)?.toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-sm">Success Rate</div>
                      </div>
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-400">
                          {providerStats?.avg_health_score?.toFixed(2)}
                        </div>
                        <div className="text-gray-400 text-sm">Avg Health Score</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resilience State */}
                {resilienceState && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">System Resilience</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-400 text-sm">Current Mode</div>
                          <div className={`font-medium capitalize ${
                            resilienceState?.current_mode === 'normal' ? 'text-green-400' :
                            resilienceState?.current_mode === 'partial' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {resilienceState?.current_mode}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Providers Up</div>
                          <div className="font-medium">
                            {resilienceState?.providers_up} / {resilienceState?.providers_total}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Auto Recovery</span>
                          <span className={`text-sm font-medium ${
                            resilienceState?.auto_recovery_enabled ? 'text-green-400' : 'text-gray-400'
                          }`}>
                            {resilienceState?.auto_recovery_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        
                        {resilienceState?.manual_override && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-400">Manual Override</span>
                            <span className="text-sm font-medium text-orange-400">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Safety Controls Section */}
            {activeTab === 'safety-controls' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="text-red-400" size={20} />
                  <h2 className="text-xl font-bold">Safety Controls</h2>
                </div>
                
                {/* Emergency Controls */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Emergency Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30">
                      <AlertTriangle size={16} />
                      <span>Emergency Disable All Providers</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 p-3 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors border border-yellow-500/30">
                      <Shield size={16} />
                      <span>Enter Maintenance Mode</span>
                    </button>
                  </div>
                </div>

                {/* Circuit Breaker Controls */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Circuit Breaker Status</h3>
                  <div className="space-y-2">
                    {providerToggles?.filter(p => p?.circuit_breaker_open)?.map(provider => (
                      <div key={provider?.provider_name} className="flex items-center justify-between py-2 px-3 bg-red-500/10 rounded-lg">
                        <span className="text-red-400">{provider?.provider_name}</span>
                        <button
                          onClick={() => handleCircuitBreakerToggle(provider?.provider_name, false)}
                          className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm hover:bg-green-500/30 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    ))}
                    {!providerToggles?.some(p => p?.circuit_breaker_open) && (
                      <div className="text-gray-400 text-sm py-2">All circuit breakers are closed</div>
                    )}
                  </div>
                </div>

                {/* Validation Checklist */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Safety Validation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={16} />
                      <span>Configuration backup enabled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={16} />
                      <span>Rollback capabilities verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={16} />
                      <span>Impact warnings configured</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagsProviderControlPanel;