import React, { useState } from 'react';
import { Server, Activity, CheckCircle, Clock, Eye, Database, Wifi, WifiOff, Power, Zap } from 'lucide-react';

const SystemStatusOverviewPanel = ({ systemMode = {}, providerHealth = [], riskEvents = [] }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Calculate provider metrics
  const providerMetrics = {
    total: providerHealth?.length || 0,
    active: providerHealth?.filter(p => p?.is_active)?.length || 0,
    inactive: providerHealth?.filter(p => !p?.is_active)?.length || 0,
    withRecentCalls: providerHealth?.filter(p => {
      if (!p?.last_successful_call) return false;
      const lastCall = new Date(p.last_successful_call);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return lastCall > oneHourAgo;
    })?.length || 0
  };

  const getProviderStatusColor = (provider) => {
    if (!provider?.is_active) return 'text-gray-400 bg-gray-500/20';
    
    const lastCall = provider?.last_successful_call ? new Date(provider.last_successful_call) : null;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (lastCall && lastCall > oneHourAgo) {
      return 'text-green-400 bg-green-500/20';
    } else if (provider?.is_active) {
      return 'text-yellow-400 bg-yellow-500/20';
    }
    
    return 'text-red-400 bg-red-500/20';
  };

  const getProviderStatusText = (provider) => {
    if (!provider?.is_active) return 'Inactive';
    
    const lastCall = provider?.last_successful_call ? new Date(provider.last_successful_call) : null;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (lastCall && lastCall > oneHourAgo) {
      return 'Healthy';
    } else if (provider?.is_active) {
      return 'Stale';
    }
    
    return 'Error';
  };

  const getModeStatusColor = (mode) => {
    switch (mode) {
      case 'NORMAL': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'PARTIAL': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'DEGRADED': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp)?.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatUptime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const diff = Date.now() - new Date(timestamp)?.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Server className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">System Status Overview</h2>
            <p className="text-sm text-gray-400">Real-time operational modes and provider health indicators</p>
          </div>
        </div>
      </div>
      {/* System Mode Status */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span>Operational Mode</span>
        </h3>
        
        <div className={`border rounded-xl p-6 ${getModeStatusColor(systemMode?.mode)}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-2xl font-bold">{systemMode?.mode || 'NORMAL'}</h4>
              <p className="text-sm opacity-80">
                {systemMode?.mode === 'NORMAL' && 'All systems operating normally'}
                {systemMode?.mode === 'PARTIAL' && 'Some providers unavailable, backup systems active'}
                {systemMode?.mode === 'DEGRADED' && 'Limited functionality, shadow/mock data in use'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{systemMode?.providers_up || 0}</div>
              <div className="text-xs opacity-80">Providers Online</div>
            </div>
          </div>
          
          {systemMode?.last_change && (
            <div className="flex items-center space-x-2 text-sm opacity-80">
              <Clock className="w-4 h-4" />
              <span>Last changed: {formatTimeAgo(systemMode?.last_change)}</span>
            </div>
          )}
        </div>
      </div>
      {/* Provider Health Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Database className="w-5 h-5 text-green-400" />
          <span>Provider Health Indicators</span>
        </h3>
        
        {/* Provider Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-semibold text-white">{providerMetrics?.total}</p>
              </div>
              <Server className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-xl font-semibold text-green-400">{providerMetrics?.active}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Inactive</p>
                <p className="text-xl font-semibold text-gray-400">{providerMetrics?.inactive}</p>
              </div>
              <Power className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Healthy</p>
                <p className="text-xl font-semibold text-blue-400">{providerMetrics?.withRecentCalls}</p>
              </div>
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Provider List */}
        <div className="space-y-3">
          {providerHealth?.map((provider) => (
            <div
              key={provider?.id}
              className={`border border-gray-600/50 rounded-lg p-4 transition-all hover:border-gray-500/50 cursor-pointer ${
                selectedProvider === provider?.id ? 'border-blue-500/50 bg-blue-500/5' : ''
              }`}
              onClick={() => setSelectedProvider(selectedProvider === provider?.id ? null : provider?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {provider?.is_active ? (
                      <Wifi className={`w-5 h-5 ${getProviderStatusColor(provider)?.split(' ')?.[0]}`} />
                    ) : (
                      <WifiOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h4 className="font-medium text-white">{provider?.api_name}</h4>
                      <p className="text-sm text-gray-400">{provider?.base_url}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {provider?.total_calls_today || 0} calls today
                    </div>
                    <div className="text-xs text-gray-400">
                      Limit: {provider?.rate_limit_per_minute}/min
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderStatusColor(provider)}`}>
                    {getProviderStatusText(provider)}
                  </span>
                </div>
              </div>
              
              {selectedProvider === provider?.id && (
                <div className="mt-4 pt-4 border-t border-gray-600/30">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Last Success</p>
                      <p className="text-white">{formatTimeAgo(provider?.last_successful_call)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Uptime</p>
                      <p className="text-white">{formatUptime(provider?.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Rate Limit</p>
                      <p className="text-white">{provider?.rate_limit_per_minute}/min</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Status</p>
                      <p className="text-white">{provider?.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {providerHealth?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No providers configured</p>
            <p className="text-sm">Add external API configurations to monitor provider health</p>
          </div>
        )}
      </div>
      {/* Error Recovery Logs */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Eye className="w-5 h-5 text-orange-400" />
          <span>Error Recovery Logs</span>
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {riskEvents?.slice(0, 10)?.map((event) => (
            <div key={event?.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  event?.severity === 'critical' ? 'bg-red-400' :
                  event?.severity === 'high' ? 'bg-red-400' :
                  event?.severity === 'medium'? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-white">{event?.description}</p>
                  <p className="text-xs text-gray-400">
                    {event?.event_type} • {formatTimeAgo(event?.created_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {event?.resolved_at && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event?.severity === 'critical' ? 'text-red-400 bg-red-500/20' :
                  event?.severity === 'high' ? 'text-red-400 bg-red-500/20' :
                  event?.severity === 'medium'? 'text-yellow-400 bg-yellow-500/20' : 'text-green-400 bg-green-500/20'
                }`}>
                  {event?.severity}
                </span>
              </div>
            </div>
          ))}
          
          {(!riskEvents || riskEvents?.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent events</p>
              <p className="text-sm">System recovery logs will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemStatusOverviewPanel;