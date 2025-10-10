import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, BarChart3, Database, Settings, Activity, AlertTriangle, TrendingUp, Clock, Zap, Shield, Eye, Layers } from 'lucide-react';
import { aasObservatoryService } from '../../../services/aasObservatoryService';

export default function MultiSourceObservatory({ isActive, cognitiveMetrics, onSystemAlert }) {
  const [activeTab, setActiveTab] = useState('ui_admin');
  const [uiAdminStatus, setUiAdminStatus] = useState({});
  const [grafanaData, setGrafanaData] = useState({});
  const [supabaseHealth, setSupabaseHealth] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    {
      id: 'ui_admin',
      title: 'UI Admin',
      icon: Monitor,
      description: 'ApexControl & AAS Control Center'
    },
    {
      id: 'grafana',
      title: 'Grafana Dashboard',
      icon: BarChart3,
      description: 'AAS Control Room (Minimal)'
    },
    {
      id: 'supabase',
      title: 'Supabase Monitoring',
      icon: Database,
      description: 'Live database queries'
    }
  ];

  const loadObservatoryData = async () => {
    try {
      setIsLoading(true);
      
      switch (activeTab) {
        case 'ui_admin':
          const uiData = await aasObservatoryService?.getUIAdminStatus();
          setUiAdminStatus(uiData);
          break;
        case 'grafana':
          const grafanaMetrics = await aasObservatoryService?.getGrafanaMetrics();
          setGrafanaData(grafanaMetrics);
          break;
        case 'supabase':
          const dbHealth = await aasObservatoryService?.getSupabaseHealth();
          setSupabaseHealth(dbHealth);
          break;
      }
    } catch (error) {
      console.error('Observatory data loading error:', error);
      if (onSystemAlert) {
        onSystemAlert({
          type: 'error',
          message: `Failed to load ${activeTab} data: ${error?.message || 'Unknown error'}`,
          timestamp: new Date()
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      loadObservatoryData();
      const interval = setInterval(loadObservatoryData, 15000); // Refresh every 15s
      return () => clearInterval(interval);
    }
  }, [isActive, activeTab]);

  const renderUIAdminTab = () => (
    <div className="space-y-4">
      {/* ApexControl Status */}
      <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <h4 className="text-white font-medium">ApexControl Status</h4>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${
            uiAdminStatus?.apexControl?.status === 'active' ?'bg-green-900/30 text-green-300 border border-green-500/30' :'bg-red-900/30 text-red-300 border border-red-500/30'
          }`}>
            {uiAdminStatus?.apexControl?.status || 'Unknown'}
          </div>
        </div>
        
        {/* Omega/Legacy/Quantum/Attention Cards */}
        <div className="grid grid-cols-2 gap-3">
          {['Omega', 'Legacy', 'Quantum', 'Attention']?.map((card) => {
            const cardData = uiAdminStatus?.apexControl?.cards?.[card?.toLowerCase()];
            return (
              <div key={card} className="bg-gray-800/50 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{card}</span>
                  <div className={`h-2 w-2 rounded-full ${
                    cardData?.active ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="text-xs text-gray-400">
                  {cardData?.value || 'No data'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AAS Control Center */}
      <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <h4 className="text-white font-medium">AAS Control Center</h4>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${
            uiAdminStatus?.aasControl?.systemHealth === 'healthy' ?'bg-green-900/30 text-green-300 border border-green-500/30' :'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
          }`}>
            {uiAdminStatus?.aasControl?.systemHealth || 'Unknown'}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">System Health</span>
            <span className="text-sm text-white">{uiAdminStatus?.aasControl?.healthScore || 0}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Active Agents</span>
            <span className="text-sm text-white">{uiAdminStatus?.aasControl?.activeAgents || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Journal Entries</span>
            <span className="text-sm text-white">{uiAdminStatus?.aasControl?.journalEntries || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGrafanaTab = () => (
    <div className="space-y-4">
      {/* System Health Metrics */}
      <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="h-5 w-5 text-green-400" />
          <h4 className="text-white font-medium">System Health (DHI & Mode)</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {grafanaData?.systemHealth?.dhi || 0}%
            </div>
            <div className="text-xs text-gray-400">DHI Score</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              grafanaData?.systemHealth?.mode === 'normal' ? 'text-green-400' : 
              grafanaData?.systemHealth?.mode === 'degraded' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {grafanaData?.systemHealth?.mode || 'Unknown'}
            </div>
            <div className="text-xs text-gray-400">Mode</div>
          </div>
        </div>
      </div>

      {/* Errors & Kill Switches */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h5 className="text-white font-medium text-sm">Errors (1h)</h5>
          </div>
          <div className="text-xl font-bold text-red-400">
            {grafanaData?.errors?.lastHour || 0}
          </div>
        </div>
        
        <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <h5 className="text-white font-medium text-sm">Kill Switches</h5>
          </div>
          <div className="text-xl font-bold text-yellow-400">
            {grafanaData?.killSwitches?.active || 0}
          </div>
        </div>
      </div>

      {/* Top Strategies */}
      <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <h4 className="text-white font-medium">Top Strategies (IQS)</h4>
        </div>
        
        <div className="space-y-2">
          {grafanaData?.topStrategies?.map((strategy, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-300">{strategy?.name || `Strategy ${index + 1}`}</span>
              <span className="text-sm font-medium text-blue-400">{strategy?.iqs || 0}</span>
            </div>
          )) || (
            <div className="text-gray-400 text-sm text-center py-2">No strategies data</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSupabaseTab = () => (
    <div className="space-y-4">
      {/* Database Connection Status */}
      <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-400" />
            <h4 className="text-white font-medium">Database Health</h4>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${
            supabaseHealth?.connection === 'healthy' ?'bg-green-900/30 text-green-300 border border-green-500/30' :'bg-red-900/30 text-red-300 border border-red-500/30'
          }`}>
            {supabaseHealth?.connection || 'Unknown'}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-white">{supabaseHealth?.decisionsCount || 0}</div>
            <div className="text-xs text-gray-400">Decisions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{supabaseHealth?.strategiesCount || 0}</div>
            <div className="text-xs text-gray-400">Strategies</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{supabaseHealth?.healthRecords || 0}</div>
            <div className="text-xs text-gray-400">Health Records</div>
          </div>
        </div>
      </div>

      {/* Live Query Results */}
      <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Eye className="h-5 w-5 text-purple-400" />
          <h4 className="text-white font-medium">Live Database Queries</h4>
        </div>
        
        <div className="space-y-3">
          {/* Recent Decisions */}
          <div className="bg-gray-800/50 rounded p-3">
            <h5 className="text-xs font-medium text-blue-400 mb-2">RECENT DECISIONS (decisions_log)</h5>
            <div className="space-y-1">
              {supabaseHealth?.recentDecisions?.map((decision, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">{decision?.agent || 'Unknown'}</span>
                  <span className={`px-1 py-0.5 rounded ${
                    decision?.outcome === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                  }`}>
                    {decision?.outcome || 'pending'}
                  </span>
                </div>
              )) || (
                <div className="text-gray-400 text-xs">No recent decisions</div>
              )}
            </div>
          </div>

          {/* Strategy Metrics */}
          <div className="bg-gray-800/50 rounded p-3">
            <h5 className="text-xs font-medium text-purple-400 mb-2">STRATEGY METRICS (strategy_candidates)</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Total:</span>
                <span className="text-white">{supabaseHealth?.strategyMetrics?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Testing:</span>
                <span className="text-yellow-300">{supabaseHealth?.strategyMetrics?.testing || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Live:</span>
                <span className="text-green-300">{supabaseHealth?.strategyMetrics?.live || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg IQS:</span>
                <span className="text-blue-300">{supabaseHealth?.strategyMetrics?.avgIqs || 0}</span>
              </div>
            </div>
          </div>

          {/* System Health Summary */}
          <div className="bg-gray-800/50 rounded p-3">
            <h5 className="text-xs font-medium text-green-400 mb-2">SYSTEM HEALTH (system_health)</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Healthy:</span>
                <span className="text-green-300">{supabaseHealth?.systemHealthSummary?.healthy || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Degraded:</span>
                <span className="text-yellow-300">{supabaseHealth?.systemHealthSummary?.degraded || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Errors:</span>
                <span className="text-red-300">{supabaseHealth?.systemHealthSummary?.errors || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg CPU:</span>
                <span className="text-blue-300">{supabaseHealth?.systemHealthSummary?.avgCpu || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 h-[800px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Layers className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Multi-Source Observatory</h3>
            <p className="text-gray-400 text-sm">Synchronized monitoring zones</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">
            Last sync: {new Date()?.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-gray-700/30 rounded-lg p-1">
        {tabs?.map((tab) => {
          const IconComponent = tab?.icon;
          return (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all ${
                activeTab === tab?.id 
                  ? 'bg-blue-600 text-white' :'text-gray-400 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span className="text-sm font-medium">{tab?.title}</span>
            </button>
          );
        })}
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto text-blue-400 animate-spin mb-3" />
                  <p className="text-gray-400">Loading {tabs?.find(t => t?.id === activeTab)?.title}...</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'ui_admin' && renderUIAdminTab()}
                {activeTab === 'grafana' && renderGrafanaTab()}
                {activeTab === 'supabase' && renderSupabaseTab()}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Status Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-600/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {tabs?.map((tab) => (
              <div key={tab?.id} className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  tab?.id === 'ui_admin' && uiAdminStatus?.apexControl?.status === 'active' ? 'bg-green-400' :
                  tab?.id === 'grafana' && grafanaData?.systemHealth?.mode === 'normal' ? 'bg-green-400' :
                  tab?.id === 'supabase'&& supabaseHealth?.connection === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-xs text-gray-400">{tab?.title}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400">
            Observatory sync active
          </div>
        </div>
      </div>
    </div>
  );
}