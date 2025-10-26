import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Database, Award, AlertTriangle, Settings, Target, Bot, Zap, Shield, Rocket } from 'lucide-react';
import TgeEventsPanel from './components/TgeEventsPanel';
import SourceRewardsPanel from './components/SourceRewardsPanel';
import IntelligenceScoring from './components/IntelligenceScoring';
import DataHealthMonitoring from './components/DataHealthMonitoring';
import AutomatedAlerts from './components/AutomatedAlerts';
import RewardOptimization from './components/RewardOptimization';
import { aiOps } from '../../lib/aiOpsClient';
import aiSwarmService from '../../services/aiSwarmService';
import Icon from '@/components/AppIcon';



export default function TGEIntelligenceRewardsCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [multiIAStatus, setMultiIAStatus] = useState({
    active: false,
    lastExecution: null,
    totalExecutions: 0,
    emergencyMode: false
  });
  const [emergencySequence, setEmergencySequence] = useState({
    active: false,
    currentPhase: null,
    results: {}
  });

  useEffect(() => {
    loadSystemMetrics();
    loadMultiIAStatus();
  }, []);

  const loadSystemMetrics = async () => {
    setLoading(true);
    try {
      const [dhiResult, sourceResult, iqsResult, tgeResult, swarmState] = await Promise.all([
        aiOps?.getAllDhiMetrics(),
        aiOps?.getSourceRewards(),
        aiOps?.getIQSScores(10),
        aiOps?.getTgeStatistics(),
        aiSwarmService?.getSwarmState()
      ]);

      setSystemMetrics({
        dhi: dhiResult?.data || [],
        sources: sourceResult?.data || [],
        iqs: iqsResult?.data || [],
        tge: tgeResult?.data || [],
        swarm: swarmState || {}
      });
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMultiIAStatus = async () => {
    try {
      const flags = await aiSwarmService?.getUIFlags();
      const swarmStats = await aiSwarmService?.getSwarmStatisticsGuarded();
      
      setMultiIAStatus({
        active: !flags?.maintenance_mode,
        lastExecution: swarmStats?.time || null,
        totalExecutions: swarmStats?.totals?.trades || 0,
        emergencyMode: flags?.maintenance_mode || false
      });
    } catch (error) {
      console.error('Failed to load Multi-IA status:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'freestyle', label: 'Multi-IA Freestyle', icon: Bot },
    { id: 'emergency', label: 'Emergency Control', icon: Shield },
    { id: 'events', label: 'TGE Events', icon: TrendingUp },
    { id: 'sources', label: 'Source Rewards', icon: Award },
    { id: 'intelligence', label: 'Intelligence Scoring', icon: Target },
    { id: 'health', label: 'Data Health', icon: Database },
    { id: 'alerts', label: 'Automated Alerts', icon: AlertTriangle },
    { id: 'optimization', label: 'Optimization', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Multi-IA System Overview */}
      <div className="lg:col-span-3">
        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Bot className="w-6 h-6 text-purple-400 mr-2" />
            Multi-IA Freestyle Orchestrator - Paper Trading DUN766038
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {multiIAStatus?.active ? 'ACTIVE' : 'STANDBY'}
              </div>
              <div className="text-sm text-gray-300">System Status</div>
              <div className="text-xs text-purple-300">
                Emergency: {multiIAStatus?.emergencyMode ? 'ON' : 'OFF'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {multiIAStatus?.totalExecutions}
              </div>
              <div className="text-sm text-gray-300">Total Executions</div>
              <div className="text-xs text-green-300">
                Account: DUN766038
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">
                {systemMetrics?.swarm?.activeAgents || 0}
              </div>
              <div className="text-sm text-gray-300">Active IA Agents</div>
              <div className="text-xs text-orange-300">
                Queued: {systemMetrics?.swarm?.queuedTasks || 0}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-teal-400">
                PAPER
              </div>
              <div className="text-sm text-gray-300">Trading Mode</div>
              <div className="text-xs text-teal-300">
                No Size Constraints
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Rocket className="w-5 h-5 text-purple-400 mr-2" />
          GO Actions
        </h3>
        <div className="space-y-3">
          <button 
            onClick={() => handleFreestyleExecution()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            disabled={multiIAStatus?.emergencyMode}
          >
            <Bot className="w-4 h-4 mr-2" />
            Execute Freestyle Order
          </button>
          <button 
            onClick={() => handleSystemRelease()}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
            disabled={multiIAStatus?.active}
          >
            <Rocket className="w-4 h-4 mr-2" />
            Release Multi-IA System
          </button>
          <button 
            onClick={() => setActiveTab('emergency')}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            Emergency Controls
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="w-6 h-6 text-purple-400 mr-2" />
            AI Intelligence & Rewards System Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-teal-400">
                {systemMetrics?.dhi?.length || 0}
              </div>
              <div className="text-sm text-gray-300">Data Streams</div>
              <div className="text-xs text-teal-300">
                Avg DHI: {systemMetrics?.dhi?.length > 0 
                  ? (systemMetrics?.dhi?.reduce((acc, d) => acc + (d?.dhi || 0), 0) / systemMetrics?.dhi?.length)?.toFixed(2)
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">
                {systemMetrics?.sources?.length || 0}
              </div>
              <div className="text-sm text-gray-300">Source Providers</div>
              <div className="text-xs text-orange-300">
                Total Pulls: {systemMetrics?.sources?.reduce((acc, s) => acc + (s?.pulls || 0), 0) || 0}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {systemMetrics?.iqs?.length || 0}
              </div>
              <div className="text-sm text-gray-300">Insights Scored</div>
              <div className="text-xs text-purple-300">
                Avg IQS: {systemMetrics?.iqs?.length > 0
                  ? (systemMetrics?.iqs?.reduce((acc, i) => acc + (i?.iqs || 0), 0) / systemMetrics?.iqs?.length)?.toFixed(2)
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {systemMetrics?.tge?.length || 0}
              </div>
              <div className="text-sm text-gray-300">TGE Events</div>
              <div className="text-xs text-green-300">
                Active Monitoring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Multi-IA Activity</h3>
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-purple-400 font-medium">IA-Strategy Decision</span>
              <span className="text-gray-400 text-sm">{multiIAStatus?.lastExecution ? new Date(multiIAStatus?.lastExecution)?.toLocaleTimeString() : 'N/A'}</span>
            </div>
            <p className="text-gray-300 text-sm">Autonomous decision without size constraints - Paper Trading mode</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-medium">IA-Execution Control</span>
              <span className="text-gray-400 text-sm">Real-time</span>
            </div>
            <p className="text-gray-300 text-sm">Single order per cycle, clientOrderId deduplication active</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-orange-400 font-medium">Paper Trading Status</span>
              <span className="text-gray-400 text-sm">DUN766038</span>
            </div>
            <p className="text-gray-300 text-sm">IBKR Paper mode active - TWS port 7497 connected</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMultiIAFreestyle = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Bot className="w-6 h-6 text-purple-400 mr-2" />
          Multi-IA Freestyle Orchestrator - No Size Constraints
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* IA-Strategy Panel */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-purple-400 mb-3">IA-Strategy</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Decides freely: BUY/SELL, symbol, type, quantity, price</li>
              <li>• No plafonds, no reduction, no risk guards</li>
              <li>• Unlimited decision freedom</li>
              <li>• Account: DUN766038 (Paper)</li>
            </ul>
          </div>

          {/* IA-Execution Panel */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-green-400 mb-3">IA-Execution</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Sends order via /api/ibkr/execute</li>
              <li>• Does NOT modify quantity decided by IA-Strategy</li>
              <li>• Single execution per cycle (no loops)</li>
              <li>• ClientOrderId unique (idempotence)</li>
            </ul>
          </div>
        </div>

        {/* Execution Controls */}
        <div className="mt-6 flex space-x-4">
          <button 
            onClick={() => handleFreestyleExecution()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
            disabled={multiIAStatus?.emergencyMode}
          >
            <Bot className="w-5 h-5 mr-2" />
            Execute Single Freestyle Order
          </button>
          <button 
            onClick={() => handleOrchestrator()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
            disabled={multiIAStatus?.emergencyMode}
          >
            <Zap className="w-5 h-5 mr-2" />
            Run Complete Orchestrator
          </button>
        </div>

        {/* Execution Log */}
        <div className="mt-6 bg-gray-900 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Last Execution Summary</h4>
          <div className="text-gray-300 text-sm font-mono">
            {multiIAStatus?.lastExecution ? (
              <div>
                <p>✅ [ACTION] [SYMBOL] [TYPE] qty=[X] prix=[...] — statut=[Submitted] — compte=DUN766038 — IA=[Strategy,Execution]</p>
                <p className="text-gray-500">Last: {new Date(multiIAStatus?.lastExecution)?.toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-gray-500">No recent executions. Click "Execute" to start Multi-IA Freestyle.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmergencyControl = () => (
    <div className="space-y-6">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Shield className="w-6 h-6 text-red-400 mr-2" />
          Emergency Response Center - Phases A→D
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Phase A */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-red-400 font-semibold mb-2">Phase A: STOP IMMÉDIAT</h4>
            <p className="text-gray-300 text-sm">• DB flags: trading_enabled=false</p>
            <p className="text-gray-300 text-sm">• Backend: IBKR_READ_ONLY=true</p>
            <p className="text-gray-300 text-sm">• Account: DUN766038 secured</p>
          </div>

          {/* Phase B */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-orange-400 font-semibold mb-2">Phase B: DIAG FLASH</h4>
            <p className="text-gray-300 text-sm">• 3 pings API (JSON check)</p>
            <p className="text-gray-300 text-sm">• Recent orders verification</p>
            <p className="text-gray-300 text-sm">• Error events analysis</p>
          </div>

          {/* Phase C */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">Phase C: REMÈDES EXPRESS</h4>
            <p className="text-gray-300 text-sm">• Deduplication control</p>
            <p className="text-gray-300 text-sm">• TWS reconnect fix</p>
            <p className="text-gray-300 text-sm">• DB patches application</p>
          </div>

          {/* Phase D */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">Phase D: RE-GO CONTRÔLÉ</h4>
            <p className="text-gray-300 text-sm">• IBKR_READ_ONLY=false</p>
            <p className="text-gray-300 text-sm">• DB flags: trading_enabled=true</p>
            <p className="text-gray-300 text-sm">• Smoke test execution</p>
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => handleEmergencyStop()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            EMERGENCY STOP (Phase A)
          </button>
          <button 
            onClick={() => handleEmergencyDiagnostic()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Activity className="w-4 h-4 mr-2" />
            Flash Diagnostic (Phase B)
          </button>
          <button 
            onClick={() => handleEmergencyRemedies()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Apply Remedies (Phase C)
          </button>
          <button 
            onClick={() => handleControlledRestart()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Controlled Restart (Phase D)
          </button>
          <button 
            onClick={() => handleCompleteSequence()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <Zap className="w-4 h-4 mr-2" />
            Complete Sequence A→D
          </button>
        </div>

        {/* Emergency Status */}
        {emergencySequence?.active && (
          <div className="mt-6 bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Emergency Sequence Status</h4>
            <p className="text-gray-300">Current Phase: <span className="text-yellow-400">{emergencySequence?.currentPhase}</span></p>
            <div className="mt-2 text-sm text-gray-400">
              {Object.entries(emergencySequence?.results || {})?.map(([phase, result]) => (
                <div key={phase} className="flex justify-between">
                  <span>{phase}:</span>
                  <span className={result?.ok ? 'text-green-400' : 'text-red-400'}>
                    {result?.ok ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const handleFreestyleExecution = async () => {
    try {
      const result = await aiSwarmService?.executeSingleFreestyleOrder();
      
      if (result?.ok) {
        alert(`✅ Freestyle Order Executed:\n${result?.summary}\nClientOrderId: ${result?.order?.clientOrderId}`);
        setMultiIAStatus(prev => ({
          ...prev,
          lastExecution: result?.timestamp,
          totalExecutions: prev?.totalExecutions + 1
        }));
      } else {
        alert(`❌ Freestyle Execution Failed:\n${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
  };

  const handleOrchestrator = async () => {
    try {
      const result = await aiSwarmService?.runFreestyleOrchestrator();
      
      if (result?.ok) {
        alert(`🤖 Multi-IA Orchestrator Success:\n${result?.summary}\nStrategy: ${result?.orchestrator?.ia_strategy}\nExecution: ${result?.orchestrator?.ia_execution}`);
        setMultiIAStatus(prev => ({
          ...prev,
          lastExecution: result?.timestamp,
          totalExecutions: prev?.totalExecutions + 1
        }));
      } else {
        alert(`❌ Orchestrator Failed:\n${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
  };

  const handleSystemRelease = async () => {
    try {
      const result = await aiSwarmService?.releaseMultiIASystem();
      
      if (result?.ok) {
        alert(`🚀 Multi-IA System Released Successfully!\n${result?.message}`);
        setMultiIAStatus(prev => ({
          ...prev,
          active: true,
          emergencyMode: false
        }));
      } else {
        alert(`❌ System Release Failed:\n${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
  };

  const handleEmergencyStop = async () => {
    setEmergencySequence({ active: true, currentPhase: 'A', results: {} });
    try {
      const result = await aiSwarmService?.executeEmergencyPhaseA();
      setEmergencySequence(prev => ({
        ...prev,
        results: { ...prev?.results, phaseA: result }
      }));
      
      if (result?.ok) {
        alert('🚨 Phase A Complete: Emergency stop executed');
        setMultiIAStatus(prev => ({ ...prev, emergencyMode: true, active: false }));
      } else {
        alert(`❌ Phase A Failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    } finally {
      setEmergencySequence(prev => ({ ...prev, active: false, currentPhase: null }));
    }
  };

  const handleEmergencyDiagnostic = async () => {
    setEmergencySequence({ active: true, currentPhase: 'B', results: {} });
    try {
      const result = await aiSwarmService?.executeEmergencyPhaseB();
      setEmergencySequence(prev => ({
        ...prev,
        results: { ...prev?.results, phaseB: result }
      }));
      
      alert(`🔍 Phase B Complete: Diagnostic results available\nRouting Issue: ${result?.summary?.hasRoutingIssue ? 'YES' : 'NO'}`);
    } catch (error) {
      alert(`Error: ${error?.message}`);
    } finally {
      setEmergencySequence(prev => ({ ...prev, active: false, currentPhase: null }));
    }
  };

  const handleEmergencyRemedies = async () => {
    setEmergencySequence({ active: true, currentPhase: 'C', results: {} });
    try {
      const result = await aiSwarmService?.executeEmergencyPhaseC();
      setEmergencySequence(prev => ({
        ...prev,
        results: { ...prev?.results, phaseC: result }
      }));
      
      alert('⚡ Phase C Complete: Express remedies applied');
    } catch (error) {
      alert(`Error: ${error?.message}`);
    } finally {
      setEmergencySequence(prev => ({ ...prev, active: false, currentPhase: null }));
    }
  };

  const handleControlledRestart = async () => {
    setEmergencySequence({ active: true, currentPhase: 'D', results: {} });
    try {
      const result = await aiSwarmService?.executeEmergencyPhaseD();
      setEmergencySequence(prev => ({
        ...prev,
        results: { ...prev?.results, phaseD: result }
      }));
      
      if (result?.ok) {
        alert(`🚀 Phase D Complete: ${result?.message}`);
        setMultiIAStatus(prev => ({ ...prev, emergencyMode: false, active: true }));
      } else {
        alert(`❌ Phase D Failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    } finally {
      setEmergencySequence(prev => ({ ...prev, active: false, currentPhase: null }));
    }
  };

  const handleCompleteSequence = async () => {
    setEmergencySequence({ active: true, currentPhase: 'A→D', results: {} });
    try {
      const result = await aiSwarmService?.executeCompleteEmergencySequence();
      setEmergencySequence(prev => ({
        ...prev,
        results: result?.sequence || {}
      }));
      
      if (result?.ok) {
        alert(`✅ Complete Emergency Sequence A→D Success:\n${result?.message}`);
        setMultiIAStatus(prev => ({ ...prev, emergencyMode: false, active: true }));
      } else {
        alert(`❌ Emergency Sequence Failed:\n${result?.message || result?.error}`);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    } finally {
      setEmergencySequence(prev => ({ ...prev, active: false, currentPhase: null }));
    }
  };

  const handleRunCritique = async () => {
    try {
      const result = await aiOps?.runCritique();
      if (result?.ok) {
        alert(`Critique completed. Found ${result?.recurring?.length || 0} recurring issues with ${result?.advice?.length || 0} recommendations.`);
      } else {
        alert(`Critique failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Error running critique: ${error?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading Multi-IA Freestyle System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">GO Final Libération IAs Paper Trading</h1>
              <p className="text-gray-400 mt-1">
                Multi-IA Freestyle Orchestrator - 6 étapes - Aucune contrainte de taille
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                multiIAStatus?.active ? 'bg-green-500' : multiIAStatus?.emergencyMode ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className={`font-medium ${
                multiIAStatus?.active ? 'text-green-400' : multiIAStatus?.emergencyMode ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {multiIAStatus?.active ? 'Multi-IA Active' : multiIAStatus?.emergencyMode ? 'Emergency Mode' : 'Standby Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs?.map((tab) => {
              const Icon = tab?.icon;
              return (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab?.id
                      ? 'border-purple-500 text-purple-400' :'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'freestyle' && renderMultiIAFreestyle()}
        {activeTab === 'emergency' && renderEmergencyControl()}
        {activeTab === 'events' && <TgeEventsPanel />}
        {activeTab === 'sources' && <SourceRewardsPanel />}
        {activeTab === 'intelligence' && <IntelligenceScoring />}
        {activeTab === 'health' && <DataHealthMonitoring />}
        {activeTab === 'alerts' && <AutomatedAlerts />}
        {activeTab === 'optimization' && <RewardOptimization />}
      </div>
    </div>
  );
}