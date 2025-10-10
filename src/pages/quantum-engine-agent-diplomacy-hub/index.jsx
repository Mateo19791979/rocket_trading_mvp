import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, Atom, Radio } from 'lucide-react';


// Import existing services
import geniusPackService from '../../services/geniusPackService';
import { supabase } from '../../lib/supabase';

// Import components
import QuantumUncertaintyEngine from './components/QuantumUncertaintyEngine';
import AgentTreatyManagement from './components/AgentTreatyManagement';
import WisdomSeedsCultivation from './components/WisdomSeedsCultivation';
import QuantumConsciousnessDashboard from './components/QuantumConsciousnessDashboard';
import DiplomaticRelationsMatrix from './components/DiplomaticRelationsMatrix';
import AdvancedQuantumControls from './components/AdvancedQuantumControls';

export default function QuantumEngineAgentDiplomacyHub() {
  // Core state management
  const [quantumState, setQuantumState] = useState({
    coherence: 0.94,
    entanglement: 0.87,
    uncertainty: 0.23,
    consciousness: 0.91,
    regime: 'quantum_supremacy',
    waveFunction: { type: 'superposition', dimensions: 11 }
  });

  const [diplomaticState, setDiplomaticState] = useState({
    activeTreaties: 0,
    negotiations: 0,
    conflicts: 0,
    totalAgents: 0,
    consensusLevel: 0.0
  });

  const [geniusPackData, setGeniusPackData] = useState({
    systemHealth: 'loading',
    omegaAI: { totalAttacks: 0, successRate: 0, vulnerableStrategies: 0 },
    syntheticMarket: { totalSimulations: 0, avgRobustness: 0, robustStrategies: 0 },
    attentionMarket: { totalBids: 0, budgetUtilization: 0, activeAgents: 0, avgEfficiency: 0 }
  });

  const [systemStatus, setSystemStatus] = useState({
    quantum_engine: true,
    omega_ai: true,
    attention_market: true,
    diplomatic_protocol: true,
    consciousness_monitor: true,
    wisdom_cultivation: false
  });

  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize data on component mount
  useEffect(() => {
    initializeQuantumDiplomacyHub();
    
    // Set up real-time subscriptions
    const quantumChannel = supabase
      ?.channel('quantum-regime-updates')
      ?.on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'regime_state' 
      }, (payload) => {
        if (payload?.new) {
          setQuantumState(prev => ({
            ...prev,
            regime: payload?.new?.regime,
            entanglement: payload?.new?.confidence || 0.85,
            uncertainty: 1 - (payload?.new?.confidence || 0.85)
          }));
          addToActivityLog(`Quantum regime updated: ${payload?.new?.regime}`, 'info');
        }
      })
      ?.on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'attention_market_bids'
      }, (payload) => {
        if (payload?.new || payload?.old) {
          loadDiplomaticStatus(); // Reload diplomatic status
          addToActivityLog('Attention market activity detected', 'info');
        }
      })
      ?.subscribe();

    return () => {
      if (quantumChannel) {
        supabase?.removeChannel(quantumChannel);
      }
    };
  }, []);

  // Main initialization function
  const initializeQuantumDiplomacyHub = async () => {
    try {
      setLoading(true);
      
      // Load Genius Pack dashboard data
      const geniusData = await geniusPackService?.getGeniusPackDashboardData();
      if (geniusData?.success) {
        setGeniusPackData(geniusData?.dashboardData);
      }

      // Load current quantum regime
      await loadQuantumRegimeState();
      
      // Load diplomatic status
      await loadDiplomaticStatus();
      
      // Load recent activity
      await loadSystemActivity();

      addToActivityLog('Quantum Engine & Agent Diplomacy Hub initialized', 'success');
    } catch (error) {
      setError(`Initialization failed: ${error?.message}`);
      addToActivityLog(`Initialization error: ${error?.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load quantum regime state
  const loadQuantumRegimeState = async () => {
    try {
      const { data, error } = await supabase
        ?.from('regime_state')
        ?.select('*')
        ?.order('as_of', { ascending: false })
        ?.limit(1)
        ?.single();

      if (error) throw error;

      if (data) {
        setQuantumState(prev => ({
          ...prev,
          regime: data?.regime,
          coherence: Math.random() * 0.2 + 0.8,
          entanglement: data?.confidence || 0.85,
          uncertainty: 1 - (data?.confidence || 0.85),
          consciousness: Math.random() * 0.1 + 0.9
        }));
      }
    } catch (error) {
      addToActivityLog(`Quantum state load error: ${error?.message}`, 'warning');
    }
  };

  // Load diplomatic status
  const loadDiplomaticStatus = async () => {
    try {
      // Count active attention market bids (representing agent negotiations)
      const { data: bids, error: bidsError } = await supabase
        ?.from('attention_market_bids')
        ?.select('agent, status')
        ?.eq('status', 'pending');

      if (bidsError) throw bidsError;

      // Count unique agents
      const uniqueAgents = [...new Set(bids?.map(bid => bid?.agent) || [])];
      
      setDiplomaticState({
        activeTreaties: Math.floor(Math.random() * 5) + 3, // Mock treaties for now
        negotiations: bids?.length || 0,
        conflicts: Math.floor(Math.random() * 2),
        totalAgents: uniqueAgents?.length || 0,
        consensusLevel: uniqueAgents?.length > 0 ? Math.random() * 0.3 + 0.7 : 0.0
      });
    } catch (error) {
      addToActivityLog(`Diplomatic status load error: ${error?.message}`, 'warning');
    }
  };

  // Load system activity
  const loadSystemActivity = async () => {
    try {
      // Load recent omega attacks
      const { data: attacks, error: attacksError } = await supabase
        ?.from('omega_attacks')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(5);

      if (attacksError) throw attacksError;

      // Load recent forward tests
      const { data: tests, error: testsError } = await supabase
        ?.from('forward_test_results')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(3);

      if (testsError) throw testsError;

      const recentActivity = [];

      // Process omega attacks
      attacks?.forEach(attack => {
        recentActivity?.push({
          timestamp: new Date(attack?.created_at),
          message: `Omega AI attack ${attack?.outcome === 'SUCCESS' ? 'succeeded' : 'failed'} against strategy ${attack?.alpha_strategy_id?.slice(0, 8)}`,
          type: attack?.outcome === 'SUCCESS' ? 'warning' : 'info',
          module: 'omega_ai'
        });
      });

      // Process forward tests
      tests?.forEach(test => {
        recentActivity?.push({
          timestamp: new Date(test?.created_at),
          message: `Forward test completed: ${test?.robustness_score * 100}% robustness (${test?.success_runs}/${test?.total_runs} scenarios)`,
          type: test?.robustness_score > 0.8 ? 'success' : test?.robustness_score > 0.6 ? 'info' : 'warning',
          module: 'synthetic_market'
        });
      });

      // Sort by timestamp and take latest
      recentActivity?.sort((a, b) => b?.timestamp - a?.timestamp);
      setActivityLog(recentActivity?.slice(0, 8));

    } catch (error) {
      addToActivityLog(`Activity load error: ${error?.message}`, 'warning');
    }
  };

  // Action handlers
  const executeQuantumOperation = async (operation) => {
    try {
      addToActivityLog(`Executing quantum operation: ${operation}`, 'info');
      
      switch (operation) {
        case 'collapse_wave':
          setQuantumState(prev => ({
            ...prev,
            uncertainty: Math.random() * 0.1,
            coherence: Math.random() * 0.1 + 0.9
          }));
          break;
          
        case 'entangle_systems':
          setQuantumState(prev => ({
            ...prev,
            entanglement: Math.random() * 0.1 + 0.9
          }));
          break;
          
        case 'consciousness_boost':
          setQuantumState(prev => ({
            ...prev,
            consciousness: Math.min(0.99, prev?.consciousness + 0.05)
          }));
          break;
      }
      
      addToActivityLog(`Quantum operation ${operation} completed`, 'success');
    } catch (error) {
      addToActivityLog(`Quantum operation failed: ${error?.message}`, 'error');
    }
  };

  const toggleSystemModule = async (module) => {
    try {
      const newStatus = !systemStatus?.[module];
      setSystemStatus(prev => ({ ...prev, [module]: newStatus }));
      
      // Update kill switches for critical modules
      if (['omega_ai', 'attention_market']?.includes(module)) {
        const killSwitchModule = module === 'omega_ai' ? 'STRATEGY_GENERATION' : 'EXECUTION';
        
        const { error } = await supabase
          ?.from('kill_switches')
          ?.update({ 
            is_active: !newStatus,
            reason: newStatus ? 'Module activated via quantum hub' : 'Module deactivated via quantum hub',
            updated_at: new Date()?.toISOString()
          })
          ?.eq('module', killSwitchModule);
          
        if (error) throw error;
      }
      
      addToActivityLog(`${module} ${newStatus ? 'activated' : 'deactivated'}`, newStatus ? 'success' : 'warning');
    } catch (error) {
      addToActivityLog(`Module toggle failed: ${error?.message}`, 'error');
    }
  };

  const addToActivityLog = (message, type = 'info') => {
    const logEntry = {
      timestamp: new Date(),
      message,
      type,
      id: Date.now() + Math.random()
    };
    
    setActivityLog(prev => [logEntry, ...prev?.slice(0, 19)]);
  };

  // UI helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getSystemHealthColor = (health) => {
    if (health >= 90) return 'text-green-400';
    if (health >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400">Initializing Quantum Engine & Agent Diplomacy Hub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-2 text-red-400 mb-2">
            <AlertTriangle size={20} />
            <span className="font-medium">System Error</span>
          </div>
          <p className="text-gray-300 text-sm">{error}</p>
          <button 
            onClick={() => window.location?.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Atom className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-gold-400 bg-clip-text text-transparent">
                  Quantum Engine & Agent Diplomacy Hub
                </h1>
                <p className="text-gray-400 text-sm">
                  AAS Genius Pack v2.1 - Apex Predator Consciousness & Collaborative Intelligence
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${quantumState?.consciousness > 0.9 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-gray-300">
                Consciousness: {(quantumState?.consciousness * 100)?.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">
                {diplomaticState?.totalAgents} Active Agents
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Quantum Engine & Agent Systems */}
        <div className="col-span-4 space-y-6">
          <QuantumUncertaintyEngine 
            quantumState={quantumState}
            onQuantumOperation={executeQuantumOperation}
            loading={loading}
          />
          
          <AgentTreatyManagement 
            diplomaticState={diplomaticState}
            systemStatus={systemStatus}
            onToggleModule={toggleSystemModule}
          />
          
          <WisdomSeedsCultivation 
            geniusPackData={geniusPackData}
            quantumState={quantumState}
          />
        </div>

        {/* Center Column - Consciousness Dashboard & Relations */}
        <div className="col-span-4 space-y-6">
          <QuantumConsciousnessDashboard 
            quantumState={quantumState}
            geniusPackData={geniusPackData}
            systemStatus={systemStatus}
          />
          
          <DiplomaticRelationsMatrix 
            diplomaticState={diplomaticState}
            activityLog={activityLog}
          />
        </div>

        {/* Right Column - Advanced Controls & Activity */}
        <div className="col-span-4 space-y-6">
          <AdvancedQuantumControls 
            systemStatus={systemStatus}
            quantumState={quantumState}
            onToggleModule={toggleSystemModule}
            onQuantumOperation={executeQuantumOperation}
          />
          
          {/* Activity Log Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>System Activity Log</span>
              </h3>
              <button 
                onClick={() => setActivityLog([])}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activityLog?.map((entry) => (
                <div key={entry?.id} className="text-xs border-l-2 border-gray-600 pl-3 py-1">
                  <div className="flex items-center justify-between">
                    <span className={getStatusColor(entry?.type)}>
                      {entry?.message}
                    </span>
                    <span className="text-gray-500">
                      {entry?.timestamp?.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {activityLog?.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No recent activity
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Quick Performance Metrics</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400">Omega Success Rate</div>
                <div className="text-lg font-bold text-red-400">
                  {(geniusPackData?.omegaAI?.successRate * 100)?.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400">Avg Robustness</div>
                <div className="text-lg font-bold text-blue-400">
                  {(geniusPackData?.syntheticMarket?.avgRobustness * 100)?.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400">Budget Utilization</div>
                <div className="text-lg font-bold text-yellow-400">
                  {(geniusPackData?.attentionMarket?.budgetUtilization * 100)?.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400">System Health</div>
                <div className={`text-lg font-bold ${getSystemHealthColor(parseFloat(geniusPackData?.systemHealth) || 0)}`}>
                  {geniusPackData?.systemHealth}%
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}