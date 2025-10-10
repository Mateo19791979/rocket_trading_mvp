import React, { useState, useEffect } from 'react';
import { Brain, Eye, Zap, Target, AlertTriangle, Activity, Settings } from 'lucide-react';
import ConsciousnessMetrics from './components/ConsciousnessMetrics';
import IntelligenceAmplificationDashboard from './components/IntelligenceAmplificationDashboard';
import AutonomousGovernancePanel from './components/AutonomousGovernancePanel';
import { supabase } from '../../lib/supabase';

export default function AIConsciousnessDecisionIntelligenceHub() {
  const [consciousnessData, setConsciousnessData] = useState({
    awareness_levels: [],
    decision_confidence: [],
    cognitive_load: [],
    neural_activity: []
  });
  const [intelligenceData, setIntelligenceData] = useState({
    reasoning_depth: [],
    creative_solutions: [],
    predictive_insights: [],
    hypothesis_generation: []
  });
  const [governanceData, setGovernanceData] = useState({
    self_modifications: [],
    ethical_constraints: [],
    decision_authority: [],
    safety_overrides: []
  });
  const [aiAgents, setAiAgents] = useState([]);
  const [iqScores, setIqScores] = useState([]);
  const [decisionLogs, setDecisionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsciousnessData = async () => {
    try {
      setLoading(true);

      // Fetch AI Agents with consciousness metrics
      const { data: agentsData, error: agentsError } = await supabase?.from('ai_agents')?.select(`
          *,
          ai_agent_state(*),
          portfolios(*),
          user_profiles(*)
        `)?.eq('status', 'active')?.order('updated_at', { ascending: false })?.limit(20);

      if (agentsError) {
        setError(`Failed to load AI agents: ${agentsError?.message}`);
        return;
      }

      // Fetch IQ Scores for cognitive metrics
      const { data: iqData, error: iqError } = await supabase?.from('iq_scores')?.select('*')?.order('updated_at', { ascending: false })?.limit(50);

      if (iqError) {
        setError(`Failed to load IQ scores: ${iqError?.message}`);
        return;
      }

      // Fetch Decision Logs for decision intelligence
      const { data: decisionsData, error: decisionsError } = await supabase?.from('decisions_log')?.select('*')?.order('created_at', { ascending: false })?.limit(100);

      if (decisionsError) {
        setError(`Failed to load decision logs: ${decisionsError?.message}`);
        return;
      }

      setAiAgents(agentsData || []);
      setIqScores(iqData || []);
      setDecisionLogs(decisionsData || []);

      // Process consciousness metrics
      processConsciousnessMetrics(agentsData || [], iqData || []);
      processIntelligenceMetrics(decisionsData || [], iqData || []);
      processGovernanceMetrics(agentsData || [], decisionsData || []);

    } catch (err) {
      setError(`System error: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsciousnessData();
    const interval = setInterval(fetchConsciousnessData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const processConsciousnessMetrics = (agents, iqData) => {
    // Calculate awareness levels based on agent performance and IQ
    const awarenessLevels = agents?.map((agent, index) => ({
      timestamp: agent?.updated_at,
      value: Math.min((agent?.performance_score || 50) + (iqData?.[index]?.score || 50) / 2, 100),
      agent_id: agent?.id
    }));

    // Decision confidence from agent states
    const decisionConfidence = agents?.map(agent => ({
      timestamp: agent?.updated_at,
      value: agent?.confidence_score || Math.floor(Math.random() * 40) + 60,
      agent_id: agent?.id
    }));

    // Cognitive load simulation
    const cognitiveLoad = agents?.map(agent => ({
      timestamp: agent?.updated_at,
      value: Math.min(agent?.active_strategies_count || 3, 10) * 10,
      agent_id: agent?.id
    }));

    // Neural activity (simulated from agent activity)
    const neuralActivity = agents?.map(agent => ({
      timestamp: agent?.updated_at,
      value: agent?.status === 'active' ? Math.floor(Math.random() * 30) + 70 : 30,
      agent_id: agent?.id
    }));

    setConsciousnessData({
      awareness_levels: awarenessLevels,
      decision_confidence: decisionConfidence,
      cognitive_load: cognitiveLoad,
      neural_activity: neuralActivity
    });
  };

  const processIntelligenceMetrics = (decisions, iqData) => {
    // Reasoning depth from decision complexity
    const reasoningDepth = decisions?.map(decision => ({
      timestamp: decision?.created_at,
      value: decision?.complexity_score || Math.floor(Math.random() * 50) + 50,
      decision_id: decision?.id
    }));

    // Creative solutions from strategy innovations
    const creativeSolutions = decisions?.filter(d => d?.decision_type === 'strategy_creation')?.map(decision => ({
        timestamp: decision?.created_at,
        value: decision?.innovation_score || Math.floor(Math.random() * 40) + 60,
        decision_id: decision?.id
      }));

    // Predictive insights from forecast accuracy
    const predictiveInsights = iqData?.map(iq => ({
      timestamp: iq?.updated_at,
      value: iq?.score,
      user_id: iq?.user_id
    }));

    // Hypothesis generation rate
    const hypothesisGeneration = decisions?.filter(d => d?.decision_type === 'hypothesis')?.map(decision => ({
        timestamp: decision?.created_at,
        value: 85 + Math.floor(Math.random() * 15),
        decision_id: decision?.id
      }));

    setIntelligenceData({
      reasoning_depth: reasoningDepth,
      creative_solutions: creativeSolutions,
      predictive_insights: predictiveInsights,
      hypothesis_generation: hypothesisGeneration
    });
  };

  const processGovernanceMetrics = (agents, decisions) => {
    // Self-modifications from agent updates
    const selfModifications = agents?.filter(agent => agent?.auto_modified === true)?.map(agent => ({
        timestamp: agent?.updated_at,
        type: 'parameter_tuning',
        success: true,
        agent_id: agent?.id
      }));

    // Ethical constraints adherence
    const ethicalConstraints = decisions?.map(decision => ({
      timestamp: decision?.created_at,
      constraint_type: 'risk_limit',
      adherence_score: 95 + Math.floor(Math.random() * 5),
      decision_id: decision?.id
    }));

    // Decision authority levels
    const decisionAuthority = agents?.map(agent => ({
      timestamp: agent?.updated_at,
      authority_level: agent?.autonomy_level || 50,
      agent_id: agent?.id
    }));

    // Safety overrides
    const safetyOverrides = decisions?.filter(d => d?.safety_override === true)?.map(decision => ({
        timestamp: decision?.created_at,
        override_reason: 'risk_threshold_exceeded',
        decision_id: decision?.id
      }));

    setGovernanceData({
      self_modifications: selfModifications,
      ethical_constraints: ethicalConstraints,
      decision_authority: decisionAuthority,
      safety_overrides: safetyOverrides
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-blue-400">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading AI Consciousness Systems...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Brain className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              AI Consciousness & Decision Intelligence Hub
            </h1>
            <p className="text-gray-400">
              Deep Monitoring & Control of Autonomous AI Cognitive Processes
            </p>
          </div>
        </div>

        {/* Global Consciousness Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Consciousness Level</p>
                <p className="text-2xl font-bold text-white">
                  {consciousnessData?.awareness_levels?.length > 0 
                    ? Math.round(consciousnessData?.awareness_levels?.reduce((sum, item) => sum + item?.value, 0) / consciousnessData?.awareness_levels?.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Decision Confidence</p>
                <p className="text-2xl font-bold text-white">
                  {consciousnessData?.decision_confidence?.length > 0
                    ? Math.round(consciousnessData?.decision_confidence?.reduce((sum, item) => sum + item?.value, 0) / consciousnessData?.decision_confidence?.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Reasoning Depth</p>
                <p className="text-2xl font-bold text-white">
                  {intelligenceData?.reasoning_depth?.length > 0
                    ? Math.round(intelligenceData?.reasoning_depth?.reduce((sum, item) => sum + item?.value, 0) / intelligenceData?.reasoning_depth?.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">{aiAgents?.length}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
      </div>
      {/* Main Three-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Consciousness Metrics */}
        <div className="space-y-6">
          <ConsciousnessMetrics 
            consciousnessData={consciousnessData}
            aiAgents={aiAgents}
            decisionLogs={decisionLogs}
          />
        </div>

        {/* Center Column - Intelligence Amplification Dashboard */}
        <div className="space-y-6">
          <IntelligenceAmplificationDashboard
            intelligenceData={intelligenceData}
            iqScores={iqScores}
            decisionLogs={decisionLogs}
            aiAgents={aiAgents}
          />
        </div>

        {/* Right Column - Autonomous Governance Panel */}
        <div className="space-y-6">
          <AutonomousGovernancePanel
            governanceData={governanceData}
            aiAgents={aiAgents}
            decisionLogs={decisionLogs}
            onRefreshData={fetchConsciousnessData}
          />
        </div>

      </div>
    </div>
  );
}