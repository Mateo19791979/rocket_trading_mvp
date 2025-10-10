import React, { useState, useEffect } from 'react';
import { Settings, Activity, Shield, AlertTriangle, CheckCircle, RefreshCw, Database, Clock, TrendingUp, Users, Globe } from 'lucide-react';
import { providerConfigurationService } from '../../services/providerConfigurationService';

// Component imports
import ApiProviderSetupPanel from './components/ApiProviderSetupPanel';
import QuotaMonitoringPanel from './components/QuotaMonitoringPanel';
import ProviderTestingPanel from './components/ProviderTestingPanel';
import GoogleSheetsFallbackPanel from './components/GoogleSheetsFallbackPanel';
import EmergencyFailoverPanel from './components/EmergencyFailoverPanel';
import LatencyValidationPanel from './components/LatencyValidationPanel';
import Icon from '../../components/AppIcon';


const ProviderConfigurationManagementCenter = () => {
  const [providers, setProviders] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [providerStats, setProviderStats] = useState([]);
  const [failoverConfigs, setFailoverConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('setup');

  // Load initial data
  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      const [
        providersData, 
        healthData, 
        statsData, 
        failoverData
      ] = await Promise.all([
        providerConfigurationService?.getAllProviders(),
        providerConfigurationService?.getProviderHealthChecks(),
        providerConfigurationService?.getProviderStatistics(),
        providerConfigurationService?.getFailoverConfigs()
      ]);

      setProviders(providersData || []);
      setHealthChecks(healthData || []);
      setProviderStats(statsData || []);
      setFailoverConfigs(failoverData || []);
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscriptions
  useEffect(() => {
    const healthSubscription = providerConfigurationService?.subscribeToHealthChecks((payload) => {
      if (payload?.eventType === 'INSERT') {
        setHealthChecks(prev => [payload?.new, ...prev?.slice(0, 49)]);
      }
    });

    const configSubscription = providerConfigurationService?.subscribeToProviderConfigs((payload) => {
      if (payload?.eventType === 'UPDATE') {
        setProviders(prev => 
          prev?.map(p => p?.id === payload?.new?.id ? payload?.new : p) || []
        );
      }
    });

    return () => {
      healthSubscription?.unsubscribe?.();
      configSubscription?.unsubscribe?.();
    };
  }, []);

  // Calculate summary metrics
  const summaryMetrics = {
    totalProviders: providers?.length || 0,
    activeProviders: providers?.filter(p => p?.is_active)?.length || 0,
    healthyProviders: providerStats?.filter(s => s?.current_status === 'active')?.length || 0,
    avgResponseTime: providerStats?.length > 0 
      ? Math.round(providerStats?.reduce((acc, s) => acc + (s?.avg_response_time || 0), 0) / providerStats?.length)
      : 0
  };

  const tabs = [
    { id: 'setup', label: 'API Keys Setup', icon: Settings, desc: 'Configure provider API keys' },
    { id: 'monitoring', label: 'Usage & Quotas', icon: Activity, desc: 'Monitor API usage limits' },
    { id: 'testing', label: 'Health Testing', icon: Shield, desc: 'Test provider connections' },
    { id: 'fallback', label: 'Google Sheets', icon: Database, desc: 'Backup data source config' },
    { id: 'failover', label: 'Auto Failover', icon: AlertTriangle, desc: 'Emergency provider switching' },
    { id: 'latency', label: 'Performance', icon: Clock, desc: 'Monitor response times' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading provider configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Globe className="w-8 h-8 text-blue-500" />
                  Financial Providers API Configuration
                </h1>
                <p className="text-gray-400 mt-2">
                  Configure API keys for Finnhub, Alpha Vantage, TwelveData and Google Sheets fallback
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">Ready for use</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-orange-400">Setup needed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-400">Inactive</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={loadProviderData}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Enhanced Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Providers</p>
                    <p className="text-2xl font-bold text-white">{summaryMetrics?.totalProviders}</p>
                    <p className="text-xs text-blue-200 mt-1">Financial data sources</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Active & Ready</p>
                    <p className="text-2xl font-bold text-white">{summaryMetrics?.activeProviders}</p>
                    <p className="text-xs text-green-200 mt-1">With valid API keys</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Health Status</p>
                    <p className="text-2xl font-bold text-white">{summaryMetrics?.healthyProviders}</p>
                    <p className="text-xs text-purple-200 mt-1">Providers online</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Avg Response</p>
                    <p className="text-2xl font-bold text-white">{summaryMetrics?.avgResponseTime}ms</p>
                    <p className="text-xs text-orange-200 mt-1">API latency</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Updated Navigation Tabs with better descriptions */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'setup', label: 'API Keys Setup', icon: Settings, desc: 'Configure provider API keys' },
              { id: 'monitoring', label: 'Usage & Quotas', icon: Activity, desc: 'Monitor API usage limits' },
              { id: 'testing', label: 'Health Testing', icon: Shield, desc: 'Test provider connections' },
              { id: 'fallback', label: 'Google Sheets', icon: Database, desc: 'Backup data source config' },
              { id: 'failover', label: 'Auto Failover', icon: AlertTriangle, desc: 'Emergency provider switching' },
              { id: 'latency', label: 'Performance', icon: Clock, desc: 'Monitor response times' }
            ]?.map(tab => {
              const Icon = tab?.icon;
              return (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex flex-col items-center gap-1 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab?.id
                      ? 'border-blue-500 text-blue-500' :'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  title={tab?.desc}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Start Guide for Setup Tab */}
        {activeTab === 'setup' && (
          <div className="mb-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-indigo-200 mb-2">🚀 Quick Start Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium text-gray-200">Get API Keys</p>
                  <p className="text-gray-400">Visit provider websites to register and get your API keys</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium text-gray-200">Configure Keys</p>
                  <p className="text-gray-400">Select provider → Paste API key → Set rate limits → Save</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium text-gray-200">Test & Monitor</p>
                  <p className="text-gray-400">Test connections and monitor usage from other tabs</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {activeTab === 'setup' && (
              <ApiProviderSetupPanel 
                providers={providers}
                onProviderUpdate={loadProviderData}
              />
            )}
            
            {activeTab === 'monitoring' && (
              <QuotaMonitoringPanel 
                providers={providers}
                providerStats={providerStats}
              />
            )}
            
            {activeTab === 'testing' && (
              <ProviderTestingPanel 
                providers={providers}
                healthChecks={healthChecks}
                onHealthCheck={loadProviderData}
              />
            )}
            
            {activeTab === 'fallback' && (
              <GoogleSheetsFallbackPanel />
            )}
            
            {activeTab === 'failover' && (
              <EmergencyFailoverPanel 
                providers={providers}
                failoverConfigs={failoverConfigs}
                onConfigUpdate={loadProviderData}
              />
            )}
            
            {activeTab === 'latency' && (
              <LatencyValidationPanel 
                providers={providers}
                providerStats={providerStats}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {activeTab === 'setup' && (
              <QuotaMonitoringPanel 
                providers={providers}
                providerStats={providerStats}
              />
            )}
            
            {activeTab === 'monitoring' && (
              <LatencyValidationPanel 
                providers={providers}
                providerStats={providerStats}
              />
            )}
            
            {activeTab === 'testing' && (
              <EmergencyFailoverPanel 
                providers={providers}
                failoverConfigs={failoverConfigs}
                onConfigUpdate={loadProviderData}
              />
            )}
            
            {activeTab === 'fallback' && (
              <ApiProviderSetupPanel 
                providers={providers}
                onProviderUpdate={loadProviderData}
              />
            )}
            
            {activeTab === 'failover' && (
              <LatencyValidationPanel 
                providers={providers}
                providerStats={providerStats}
              />
            )}
            
            {activeTab === 'latency' && (
              <ProviderTestingPanel 
                providers={providers}
                healthChecks={healthChecks}
                onHealthCheck={loadProviderData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderConfigurationManagementCenter;