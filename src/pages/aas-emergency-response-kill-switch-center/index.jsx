import { useState, useEffect } from 'react';
import { AlertTriangle, Power, Activity, TrendingUp, Shield, Zap, Brain } from 'lucide-react';
import MultiLevelKillSwitchPanel from './components/MultiLevelKillSwitchPanel';
import EmergencyDetectionEngine from './components/EmergencyDetectionEngine';
import CrisisResponseDashboard from './components/CrisisResponseDashboard';
import SystemRecoveryTools from './components/SystemRecoveryTools';
import EmergencyCommunicationCenter from './components/EmergencyCommunicationCenter';
import PostIncidentAnalysis from './components/PostIncidentAnalysis';
import { aasEmergencyService } from '../../services/aasEmergencyService';

export default function AASEmergencyResponseKillSwitchCenter() {
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [killSwitches, setKillSwitches] = useState([]);
  const [currentRegime, setCurrentRegime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLog, setActionLog] = useState([]);

  useEffect(() => {
    loadDashboardData();
    setupRealtimeSubscriptions();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load system health
      const healthResult = await aasEmergencyService?.getSystemHealth();
      if (healthResult?.data) {
        setSystemHealth(healthResult?.data);
      }

      // Load active incidents
      const incidentsResult = await aasEmergencyService?.getActiveIncidents();
      if (incidentsResult?.data) {
        setActiveIncidents(incidentsResult?.data);
      }

      // Load kill switches
      const killSwitchesResult = await aasEmergencyService?.getKillSwitches();
      if (killSwitchesResult?.data) {
        setKillSwitches(killSwitchesResult?.data);
      }

      // Load current regime
      const regimeResult = await aasEmergencyService?.getCurrentRegime();
      if (regimeResult?.data) {
        setCurrentRegime(regimeResult?.data);
      }

      setActionLog(prev => [...prev, {
        timestamp: new Date()?.toISOString(),
        action: 'Dashboard loaded',
        status: 'success'
      }]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setActionLog(prev => [...prev, {
        timestamp: new Date()?.toISOString(),
        action: 'Dashboard load failed',
        status: 'error',
        details: error?.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to health and incident updates
    const unsubscribeHealth = aasEmergencyService?.subscribeToHealthUpdates((payload) => {
      if (payload?.table === 'aas_system_health' && payload?.new) {
        setSystemHealth(payload?.new);
      }
      if (payload?.table === 'emergency_incidents') {
        loadDashboardData(); // Refresh incidents
      }
    });

    // Subscribe to kill switch updates
    const unsubscribeKillSwitches = aasEmergencyService?.subscribeToKillSwitchUpdates((payload) => {
      if (payload?.new) {
        setKillSwitches(prev => {
          const updated = [...prev];
          const index = updated?.findIndex(ks => ks?.module === payload?.new?.module);
          if (index >= 0) {
            updated[index] = payload?.new;
          } else {
            updated?.push(payload?.new);
          }
          return updated;
        });

        setActionLog(prev => [...prev, {
          timestamp: new Date()?.toISOString(),
          action: `Kill switch ${payload?.new?.is_active ? 'activated' : 'deactivated'}: ${payload?.new?.module}`,
          status: payload?.new?.is_active ? 'warning' : 'success'
        }]);
      }
    });

    return () => {
      unsubscribeHealth?.();
      unsubscribeKillSwitches?.();
    };
  };

  const handleEmergencyAction = async (action, data) => {
    try {
      let result;

      switch (action) {
        case 'activate_killswitch':
          result = await aasEmergencyService?.activateKillSwitch(
            data?.module,
            data?.level,
            data?.reason
          );
          break;
        case 'deactivate_killswitch':
          result = await aasEmergencyService?.deactivateKillSwitch(
            data?.module,
            data?.reason
          );
          break;
        case 'create_incident':
          result = await aasEmergencyService?.createIncident(data);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      if (result?.error) {
        throw new Error(result?.error);
      }

      setActionLog(prev => [...prev, {
        timestamp: new Date()?.toISOString(),
        action: `${action?.replace('_', ' ')} completed`,
        status: 'success',
        details: JSON.stringify(data)
      }]);

      // Refresh data
      await loadDashboardData();

    } catch (error) {
      console.error(`Emergency action failed:`, error);
      setActionLog(prev => [...prev, {
        timestamp: new Date()?.toISOString(),
        action: `${action} failed`,
        status: 'error',
        details: error?.message
      }]);
    }
  };

  const getHealthModeColor = (mode) => {
    switch (mode) {
      case 'normal': return 'bg-green-100 border-green-500 text-green-800';
      case 'degraded': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'safe': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getRegimeBadgeColor = (regime) => {
    switch (regime) {
      case 'bull': return 'bg-green-500 text-white';
      case 'bear': return 'bg-red-500 text-white';
      case 'volatile': return 'bg-orange-500 text-white';
      case 'quiet': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading AAS Emergency Response Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header with Critical Status */}
      <div className="bg-red-900 border-b border-red-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="h-8 w-8 text-red-400 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-red-100">
                AAS Emergency Response & Kill Switch Center
              </h1>
              <p className="text-red-300">
                Multi-Level Emergency Control • Crisis Management • System Protection
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* System Health Status */}
            <div className={`px-4 py-2 rounded-lg border ${getHealthModeColor(systemHealth?.mode)}`}>
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <div>
                  <div className="font-semibold">System Mode: {systemHealth?.mode?.toUpperCase()}</div>
                  <div className="text-sm">DHI: {((systemHealth?.dhi_avg || 0) * 100)?.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Market Regime */}
            <div className={`px-4 py-2 rounded-lg ${getRegimeBadgeColor(currentRegime?.regime)}`}>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <div>
                  <div className="font-semibold">{currentRegime?.regime?.toUpperCase()}</div>
                  <div className="text-sm">Conf: {((currentRegime?.confidence || 0) * 100)?.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* Active Incidents Count */}
            <div className="px-4 py-2 rounded-lg bg-orange-600 text-white">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <div>
                  <div className="font-semibold">Active Incidents</div>
                  <div className="text-sm">{activeIncidents?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {systemHealth?.mode === 'safe' && (
        <div className="bg-red-800 border-b border-red-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Zap className="h-6 w-6 text-yellow-300 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold text-red-100">🚨 CRITICAL SYSTEM ALERT</h2>
                <p className="text-red-200">
                  System is in SAFE MODE. Immediate intervention required. Consider activating Level 4-5 kill switches.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEmergencyAction('activate_killswitch', {
                module: 'LIVE_TRADING',
                level: 'level_5_complete_halt',
                reason: 'Critical system mode detected'
              })}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
            >
              EMERGENCY HALT ALL TRADING
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Kill Switch Panel */}
        <div className="space-y-6">
          <MultiLevelKillSwitchPanel
            killSwitches={killSwitches}
            onAction={handleEmergencyAction}
          />
          <EmergencyDetectionEngine
            systemHealth={systemHealth}
            onAction={handleEmergencyAction}
          />
        </div>

        {/* Center Column - Crisis Response */}
        <div className="space-y-6">
          <CrisisResponseDashboard
            activeIncidents={activeIncidents}
            onAction={handleEmergencyAction}
          />
          <SystemRecoveryTools
            systemHealth={systemHealth}
            killSwitches={killSwitches}
            onAction={handleEmergencyAction}
          />
        </div>

        {/* Right Column - Communication & Analysis */}
        <div className="space-y-6">
          <EmergencyCommunicationCenter
            actionLog={actionLog}
            activeIncidents={activeIncidents}
          />
          <PostIncidentAnalysis
            systemHealth={systemHealth}
            currentRegime={currentRegime}
          />
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Power className={`h-4 w-4 ${killSwitches?.some(ks => ks?.is_active) ? 'text-red-400' : 'text-green-400'}`} />
              <span>Kill Switches: {killSwitches?.filter(ks => ks?.is_active)?.length}/{killSwitches?.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-400" />
              <span>AAS Level 5 Operational</span>
            </div>
          </div>
          <div className="text-gray-400">
            Last Updated: {new Date()?.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}