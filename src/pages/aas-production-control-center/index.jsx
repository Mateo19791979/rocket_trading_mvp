import React, { useState, useEffect, useRef } from 'react';

import { Activity, AlertTriangle, Clock, AlertOctagon, RefreshCw, Zap, TrendingUp } from 'lucide-react';
import { aasService } from '../../services/aasService';

// Import components
import GeneticStrategyBreedingEngine from './components/GeneticStrategyBreedingEngine';
import AutonomyLevelController from './components/AutonomyLevelController';
import ProductionHealthDashboard from './components/ProductionHealthDashboard';
import KillSwitchManagement from './components/KillSwitchManagement';
import AdvancedAnalyticsCenter from './components/AdvancedAnalyticsCenter';

const TrendIndicator = ({ current, previous }) => {
  if (previous === null || current === previous) return null;
  const isUp = current > previous;
  return (
    <span className={`ml-2 font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      {isUp ? '▲' : '▼'}
    </span>
  );
};

const AASProductionControlCenter = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [regimeState, setRegimeState] = useState(null);
  const [strategyCandidates, setStrategyCandidates] = useState([]);
  const [killSwitches, setKillSwitches] = useState([]);
  const [metaLearningMetrics, setMetaLearningMetrics] = useState([]);
  const [actionLog, setActionLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autonomyLevel, setAutonomyLevel] = useState(2);
  
  const prevHealthRef = useRef();
  useEffect(() => { 
    prevHealthRef.current = systemHealth; 
  });

  const addToActionLog = (message, type = 'info') => {
    const timestamp = new Date()?.toLocaleTimeString();
    setActionLog(prev => [
      { timestamp, message, type },
      ...prev?.slice(0, 49) // Keep last 50 entries
    ]);
  };

  // Health Sentinel - Level 5 Core Function
  const runHealth = async () => {
    try {
      const result = await aasService?.computeSystemHealth();
      setSystemHealth(result);
      addToActionLog(`[HEALTH] mode=${result?.mode} dhi=${(result?.dhi_avg * 100)?.toFixed(1)}% errors_1h=${result?.errors_1h}`);

      // Auto-activate kill switch if critical
      if (result?.mode === 'safe' || result?.mode === 'critical') {
        await toggleKillSwitch('LIVE_TRADING', 'Health Sentinel: critical system state detected', true);
      }

      return result;
    } catch (err) {
      addToActionLog(`[HEALTH] Failed: ${err?.message}`, 'error');
      setError(`Health calculation failed: ${err?.message}`);
    }
  };

  // Genetic Breeding - Level 5 Core Function
  const runBreed = async () => {
    try {
      const result = await aasService?.breedStrategies(20);
      addToActionLog(`[BREED] created=${result?.created || 0}`);
      await fetchSystemData(); // Refresh data
      return result;
    } catch (err) {
      addToActionLog(`[BREED] Failed: ${err?.message}`, 'error');
    }
  };

  // Kill Switch Management - Level 5 Core Function
  const toggleKillSwitch = async (module, reason, forceActive = null) => {
    try {
      const result = await aasService?.toggleKillSwitch(module, reason, forceActive);
      addToActionLog(`[KILL] ${module} => ${result?.is_active ? "ACTIVE" : "INACTIVE"} (${reason})`);
      await fetchSystemData(); // Refresh data
      return result;
    } catch (err) {
      addToActionLog(`[KILL] Failed: ${err?.message}`, 'error');
    }
  };

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Use service layer for data fetching
      const [
        regimeResult,
        strategiesResult,
        killSwitchResult,
        metricsResult
      ] = await Promise.all([
        aasService?.getLatestRegimeState(),
        aasService?.getStrategyCandidates(10),
        aasService?.getKillSwitches(),
        aasService?.getMetaLearningMetrics(5)
      ]);

      // Update state with results
      if (regimeResult?.ok && regimeResult?.data) {
        setRegimeState(regimeResult?.data);
      }

      if (strategiesResult?.data) {
        setStrategyCandidates(strategiesResult?.data);
      }

      if (killSwitchResult?.data) {
        setKillSwitches(killSwitchResult?.data);
      }

      if (metricsResult?.data) {
        setMetaLearningMetrics(metricsResult?.data);
      }

      // Calculate system health if we have data
      if (regimeResult?.data || strategiesResult?.data || killSwitchResult?.data) {
        const healthScore = calculateSystemHealth(
          regimeResult?.data, 
          strategiesResult?.data, 
          killSwitchResult?.data
        );
        setSystemHealth(healthScore);
      }

    } catch (err) {
      setError(`Failed to fetch system data: ${err?.message}`);
      addToActionLog(`[SYSTEM] Data fetch failed: ${err?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemHealth = (regime, strategies, switches) => {
    let score = 0.5; // Base score
    let mode = 'normal';
    
    // Regime confidence impact
    if (regime?.confidence) {
      score += regime?.confidence * 0.3;
    }
    
    // Strategy performance impact
    const avgIQS = strategies?.reduce((sum, s) => sum + (s?.iqs || 0), 0) / (strategies?.length || 1);
    score += avgIQS * 0.3;
    
    // Kill switch impact
    const activeKillSwitches = switches?.filter(s => s?.is_active)?.length || 0;
    if (activeKillSwitches > 0) {
      score *= 0.7;
      mode = activeKillSwitches > 2 ? 'critical' : 'degraded';
    }
    
    // Determine mode based on score
    if (score < 0.4) mode = 'critical';
    else if (score < 0.6) mode = 'degraded';
    else mode = 'normal';
    
    return {
      dhi_avg: Math.min(score, 1),
      mode,
      active_switches: activeKillSwitches,
      strategy_pipeline: strategies?.length || 0
    };
  };

  const runSelection = async () => {
    try {
      const result = await aasService?.runNaturalSelection(0.75);
      addToActionLog(`Natural selection completed: ${result?.updated || 0} strategies evolved`);
      fetchSystemData(); // Refresh data
    } catch (err) {
      addToActionLog(`Selection failed: ${err?.message}`, 'error');
    }
  };

  useEffect(() => {
    fetchSystemData();
    
    // Set up real-time subscriptions
    const strategiesSubscription = aasService?.subscribeToStrategyCandidates(() => fetchSystemData());
    const killSwitchSubscription = aasService?.subscribeToKillSwitches(() => fetchSystemData());
    const regimeSubscription = aasService?.subscribeToRegimeState(() => fetchSystemData());

    return () => {
      aasService?.unsubscribe(strategiesSubscription);
      aasService?.unsubscribe(killSwitchSubscription);
      aasService?.unsubscribe(regimeSubscription);
    };
  }, []);

  const getHealthModeStyle = () => {
    if (!systemHealth) return 'bg-gray-100 border-gray-300 text-gray-800';
    
    switch (systemHealth?.mode) {
      case 'normal':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'critical': case'safe':
        return 'bg-red-100 border-red-500 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          <span className="text-lg">Loading AAS Control Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text">
              AAS Production Control Center
            </h1>
            <p className="text-gray-400 mt-2">
              Autonomous AI Speculation System - Level {autonomyLevel} Operations
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={runHealth}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span>Health Check</span>
            </button>
            <button
              onClick={fetchSystemData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date()?.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Level 5 Status Indicator */}
        <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-semibold text-purple-400">Level 5 AAS Status</h3>
                <p className="text-sm text-gray-300">
                  Health Sentinel: Active | Auto-breeding: Enabled | Emergency Response: Ready
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthModeStyle()}`}>
              {systemHealth?.mode?.toUpperCase() || 'UNKNOWN'}
              <TrendIndicator current={systemHealth?.dhi_avg} previous={prevHealthRef?.current?.dhi_avg} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Genetic Breeding & Autonomy */}
        <div className="space-y-6">
          <GeneticStrategyBreedingEngine 
            strategyCandidates={strategyCandidates}
            onBreed={runBreed}
            onSelection={runSelection}
            metaLearningMetrics={metaLearningMetrics}
          />
          
          <AutonomyLevelController 
            autonomyLevel={autonomyLevel}
            setAutonomyLevel={setAutonomyLevel}
            systemHealth={systemHealth}
          />
        </div>

        {/* Center Column - Health Dashboard & Kill Switches */}
        <div className="space-y-6">
          <ProductionHealthDashboard 
            systemHealth={systemHealth}
            regimeState={regimeState}
            strategyCandidates={strategyCandidates}
            prevHealth={prevHealthRef?.current}
            onRunHealth={runHealth}
          />
          
          <KillSwitchManagement 
            killSwitches={killSwitches}
            onToggle={toggleKillSwitch}
            systemHealth={systemHealth}
          />
        </div>

        {/* Right Column - Analytics & Logs */}
        <div className="space-y-6">
          <AdvancedAnalyticsCenter 
            metaLearningMetrics={metaLearningMetrics}
            strategyCandidates={strategyCandidates}
            regimeState={regimeState}
          />
          
          {/* Action Log */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              System Action Log
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {actionLog?.length > 0 ? actionLog?.map((log, index) => (
                <div key={index} className={`text-sm p-2 rounded ${
                  log?.type === 'error' ? 'bg-red-900/20 text-red-400' :
                  log?.type === 'warning'? 'bg-yellow-900/20 text-yellow-400' : 'bg-blue-900/20 text-blue-400'
                }`}>
                  <span className="text-gray-500">[{log?.timestamp}]</span> {log?.message}
                </div>
              )) : (
                <div className="text-gray-500 text-center py-4">
                  No actions logged yet. System standby.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner - Enhanced for Level 5 */}
      {(systemHealth?.mode === 'critical' || systemHealth?.mode === 'safe') && (
        <div className="fixed bottom-6 left-6 right-6 p-4 bg-red-900 border border-red-500 rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
              <div>
                <h4 className="font-bold text-red-400">
                  {systemHealth?.mode === 'safe' ? 'SAFE MODE ACTIVATED' : 'CRITICAL SYSTEM STATE'}
                </h4>
                <p className="text-sm text-red-300">
                  {systemHealth?.mode === 'safe' ?'Health Sentinel triggered safety protocols. Trading halted.' :'System health degraded. Manual intervention recommended.'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => runHealth()}
                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors"
              >
                Re-assess
              </button>
              <button
                onClick={() => toggleKillSwitch('LIVE_TRADING', 'Manual emergency stop', true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
              >
                Emergency Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AASProductionControlCenter;