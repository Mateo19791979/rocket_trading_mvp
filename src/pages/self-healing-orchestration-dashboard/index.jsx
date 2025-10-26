import React, { useState, useEffect } from 'react';
import { Activity, Shield, Zap, AlertTriangle, CheckCircle, XCircle, RefreshCw, Clock, EyeOff } from 'lucide-react';
import selfHealingService from '../../services/selfHealingService';
import aiSwarmService from '../../services/aiSwarmService';

// Import components
import SelfHealingControllerPanel from './components/SelfHealingControllerPanel';
import ResilienceMonitoringPanel from './components/ResilienceMonitoringPanel';
import RecoveryOrchestrationPanel from './components/RecoveryOrchestrationPanel';
import SystemStatusOverviewPanel from './components/SystemStatusOverviewPanel';
import ResilienceBannerIntegrationPanel from './components/ResilienceBannerIntegrationPanel';

const SelfHealingOrchestrationDashboard = () => {
  const [systemHealth, setSystemHealth] = useState([]);
  const [recoveryOperations, setRecoveryOperations] = useState([]);
  const [orchestratorState, setOrchestratorState] = useState([]);
  const [systemMode, setSystemMode] = useState({ mode: 'NORMAL', providers_up: 0 });
  const [riskEvents, setRiskEvents] = useState([]);
  const [providerHealth, setProviderHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // UI Flags state
  const [uiFlags, setUIFlags] = useState({ hide_stats_card: true });
  const [flagsLoading, setFlagsLoading] = useState(true);

  // Load UI flags function
  const loadUIFlags = async () => {
    try {
      setFlagsLoading(true);
      const flags = await aiSwarmService?.getUIFlags();
      setUIFlags(flags || { hide_stats_card: true });
    } catch (err) {
      console.warn('Error loading UI flags:', err);
      setUIFlags({ hide_stats_card: true });
    } finally {
      setFlagsLoading(false);
    }
  };

  // Load data function
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        healthData,
        recoveryData, 
        stateData,
        modeData,
        eventsData,
        providerData
      ] = await Promise.all([
        selfHealingService?.getSystemHealthOverview(),
        selfHealingService?.getRecoveryOperations(),
        selfHealingService?.getOrchestratorState(),
        selfHealingService?.getSystemMode(),
        selfHealingService?.getRiskEvents(20),
        selfHealingService?.getProviderHealthStatus()
      ]);

      setSystemHealth(healthData);
      setRecoveryOperations(recoveryData);
      setOrchestratorState(stateData);
      setSystemMode(modeData);
      setRiskEvents(eventsData);
      setProviderHealth(providerData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error loading self-healing dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    loadUIFlags();
    
    loadDashboardData();

    const healthUnsubscribe = selfHealingService?.subscribeToSystemHealth((payload) => {
      loadDashboardData();
    });

    const eventsUnsubscribe = selfHealingService?.subscribeToRiskEvents((payload) => {
      loadDashboardData();
    });

    const stateUnsubscribe = selfHealingService?.subscribeToOrchestratorState((payload) => {
      loadDashboardData();
    });

    const refreshInterval = setInterval(() => {
      loadDashboardData();
      loadUIFlags();
    }, 30000);

    return () => {
      healthUnsubscribe?.();
      eventsUnsubscribe?.();
      stateUnsubscribe?.();
      clearInterval(refreshInterval);
    };
  }, []);

  const systemMetrics = {
    totalAgents: systemHealth?.length || 0,
    healthyAgents: systemHealth?.filter(h => h?.health_status === 'healthy')?.length || 0,
    criticalAgents: systemHealth?.filter(h => h?.health_status === 'critical')?.length || 0,
    activeProviders: providerHealth?.filter(p => p?.is_active)?.length || 0,
    recentEvents: riskEvents?.filter(e => {
      const eventTime = new Date(e?.created_at);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return eventTime > oneDayAgo;
    })?.length || 0
  };

  const hideStats = uiFlags?.hide_stats_card ?? true;

  if (loading && systemHealth?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-gray-400">Loading Self-Healing Orchestration Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-500" />
                <h1 className="text-2xl font-bold text-white">Self-Healing Orchestration Dashboard</h1>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemMode?.mode === 'NORMAL' ?'bg-green-500/20 text-green-400' 
                  : systemMode?.mode === 'PARTIAL' ?'bg-yellow-500/20 text-yellow-400' :'bg-red-500/20 text-red-400'
              }`}>
                Mode: {systemMode?.mode}
              </div>
              {hideStats && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  <EyeOff className="w-3 h-3" />
                  <span>Stats Hidden</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdate && (
                <div className="text-sm text-gray-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {lastUpdate?.toLocaleTimeString()}</span>
                </div>
              )}
              <button
                onClick={() => {
                  loadDashboardData();
                  loadUIFlags();
                }}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {!hideStats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Agents</p>
                    <p className="text-xl font-semibold">{systemMetrics?.totalAgents}</p>
                  </div>
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Healthy</p>
                    <p className="text-xl font-semibold text-green-400">{systemMetrics?.healthyAgents}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Critical</p>
                    <p className="text-xl font-semibold text-red-400">{systemMetrics?.criticalAgents}</p>
                  </div>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Providers</p>
                    <p className="text-xl font-semibold text-blue-400">{systemMetrics?.activeProviders}</p>
                  </div>
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Recent Events</p>
                    <p className="text-xl font-semibold text-yellow-400">{systemMetrics?.recentEvents}</p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-400">
                <EyeOff className="w-5 h-5" />
                <span className="text-sm">
                  Statistiques masquées pour éviter l'erreur PGRST116. 
                  <span className="text-gray-400 ml-1">
                    (Données disponibles dans IBKR)
                  </span>
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Main Content - Two Column Layout */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <SelfHealingControllerPanel 
              systemHealth={systemHealth}
              recoveryOperations={recoveryOperations}
              onTriggerRecovery={loadDashboardData}
            />
            <ResilienceMonitoringPanel 
              systemHealth={systemHealth}
              providerHealth={providerHealth}
              riskEvents={riskEvents}
            />
            <RecoveryOrchestrationPanel 
              orchestratorState={orchestratorState}
              recoveryOperations={recoveryOperations}
              onUpdateThresholds={loadDashboardData}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <SystemStatusOverviewPanel 
              systemMode={systemMode}
              providerHealth={providerHealth}
              riskEvents={riskEvents}
            />
            <ResilienceBannerIntegrationPanel 
              systemMode={systemMode}
              providerHealth={providerHealth}
              lastUpdate={lastUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfHealingOrchestrationDashboard;