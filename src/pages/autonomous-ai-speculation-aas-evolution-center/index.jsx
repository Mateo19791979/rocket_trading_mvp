import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Lightbulb, Zap, Activity, AlertTriangle } from 'lucide-react';
import EvolutionPathway from './components/EvolutionPathway';
import AIConsciousnessDashboard from './components/AIConsciousnessDashboard';
import MetaLearningController from './components/MetaLearningController';
import { supabase } from '../../lib/supabase';

export default function AutonomousAISpeculationAASEvolutionCenter() {
  const [aiAgents, setAiAgents] = useState([]);
  const [evolutionMetrics, setEvolutionMetrics] = useState({
    level1_copilote: { active: 0, performance: 0, progress: 0 },
    level2_apprentie: { active: 0, performance: 0, progress: 0 },
    level3_adaptative: { active: 0, performance: 0, progress: 0 },
    level4_generative: { active: 0, performance: 0, progress: 0 },
    level5_speculative: { active: 0, performance: 0, progress: 0 }
  });
  const [consciousnessMetrics, setConsciousnessMetrics] = useState({
    awareness_level: 0,
    decision_confidence: 0,
    learning_rate: 0,
    autonomy_index: 0
  });
  const [iqScores, setIqScores] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAASData();
    const interval = setInterval(fetchAASData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAASData = async () => {
    try {
      setLoading(true);

      // Fetch AI Agents data
      const { data: agentsData, error: agentsError } = await supabase?.from('ai_agents')?.select(`
          *,
          ai_agent_state(*),
          portfolios(*)
        `)?.eq('status', 'active')?.order('created_at', { ascending: false });

      if (agentsError) {
        setError(`Failed to load AI agents: ${agentsError?.message}`);
        return;
      }

      // Fetch IQ Scores for consciousness metrics
      const { data: iqData, error: iqError } = await supabase?.from('iq_scores')?.select('*')?.order('updated_at', { ascending: false })?.limit(100);

      if (iqError) {
        setError(`Failed to load IQ scores: ${iqError?.message}`);
        return;
      }

      // Fetch Strategies for genetic algorithm data
      const { data: strategiesData, error: strategiesError } = await supabase?.from('strategies')?.select(`
          *,
          scores(*)
        `)?.order('created_at', { ascending: false })?.limit(50);

      if (strategiesError) {
        setError(`Failed to load strategies: ${strategiesError?.message}`);
        return;
      }

      setAiAgents(agentsData || []);
      setIqScores(iqData || []);
      setStrategies(strategiesData || []);

      // Calculate evolution metrics based on agent performance and strategy
      calculateEvolutionMetrics(agentsData || []);
      calculateConsciousnessMetrics(iqData || [], agentsData || []);

    } catch (err) {
      setError(`System error: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateEvolutionMetrics = (agents) => {
    const metrics = {
      level1_copilote: { active: 0, performance: 0, progress: 0 },
      level2_apprentie: { active: 0, performance: 0, progress: 0 },
      level3_adaptative: { active: 0, performance: 0, progress: 0 },
      level4_generative: { active: 0, performance: 0, progress: 0 },
      level5_speculative: { active: 0, performance: 0, progress: 0 }
    };

    agents?.forEach(agent => {
      // Classify agents by strategy complexity and autonomy
      const autonomyLevel = classifyAgentEvolutionLevel(agent);
      if (metrics?.[autonomyLevel]) {
        metrics[autonomyLevel].active += 1;
        metrics[autonomyLevel].performance += agent?.performance_score || 0;
      }
    });

    // Calculate averages and progress
    Object.keys(metrics)?.forEach(level => {
      const count = metrics?.[level]?.active;
      if (count > 0) {
        metrics[level].performance = Math.round(metrics?.[level]?.performance / count);
        metrics[level].progress = Math.min(count * 20, 100); // Progress based on agent count
      }
    });

    setEvolutionMetrics(metrics);
  };

  const classifyAgentEvolutionLevel = (agent) => {
    // Level classification based on strategy and autonomy
    if (agent?.strategy === 'arbitrage' && agent?.autonomy_level > 80) {
      return 'level5_speculative';
    } else if (agent?.strategy === 'swing' && agent?.autonomy_level > 60) {
      return 'level4_generative';
    } else if (agent?.strategy === 'momentum' && agent?.autonomy_level > 40) {
      return 'level3_adaptative';
    } else if (agent?.autonomy_level > 20) {
      return 'level2_apprentie';
    } else {
      return 'level1_copilote';
    }
  };

  const calculateConsciousnessMetrics = (iqData, agents) => {
    if (iqData?.length === 0 || agents?.length === 0) {
      return;
    }

    const avgIQ = iqData?.reduce((sum, score) => sum + (score?.score || 0), 0) / iqData?.length;
    const avgPerformance = agents?.reduce((sum, agent) => sum + (agent?.performance_score || 0), 0) / agents?.length;
    const highAutonomyAgents = agents?.filter(agent => agent?.autonomy_level > 60)?.length;

    setConsciousnessMetrics({
      awareness_level: Math.round(avgIQ),
      decision_confidence: Math.round(avgPerformance),
      learning_rate: Math.round((iqData?.length / 100) * 100), // Based on recent IQ updates
      autonomy_index: Math.round((highAutonomyAgents / agents?.length) * 100)
    });
  };

  const activateEvolutionLevel = async (level) => {
    try {
      // Log the activation attempt
      await supabase?.from('decisions_log')?.insert({
          decision_type: 'evolution_activation',
          level: level,
          timestamp: new Date()?.toISOString(),
          success: true
        });

      // Refresh data to show changes
      await fetchAASData();
    } catch (err) {
      setError(`Failed to activate ${level}: ${err?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-purple-400">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading AAS Evolution Systems...</p>
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
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Autonomous AI Speculation (AAS) Evolution Center
            </h1>
            <p className="text-gray-400">
              5-Level Progressive AI Autonomy Transformation & Speculative Intelligence
            </p>
          </div>
        </div>

        {/* Global Evolution Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">{aiAgents?.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Consciousness Level</p>
                <p className="text-2xl font-bold text-white">{consciousnessMetrics?.awareness_level}%</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gold-500/30">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Autonomy Index</p>
                <p className="text-2xl font-bold text-white">{consciousnessMetrics?.autonomy_index}%</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Generated Strategies</p>
                <p className="text-2xl font-bold text-white">{strategies?.length}</p>
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
        
        {/* Left Column - Evolution Pathway */}
        <div className="space-y-6">
          <EvolutionPathway 
            evolutionMetrics={evolutionMetrics}
            onActivateLevel={activateEvolutionLevel}
            aiAgents={aiAgents}
          />
        </div>

        {/* Center Column - AI Consciousness Dashboard */}
        <div className="space-y-6">
          <AIConsciousnessDashboard
            consciousnessMetrics={consciousnessMetrics}
            iqScores={iqScores}
            strategies={strategies}
            aiAgents={aiAgents}
          />
        </div>

        {/* Right Column - Meta-Learning Controller */}
        <div className="space-y-6">
          <MetaLearningController
            aiAgents={aiAgents}
            strategies={strategies}
            evolutionMetrics={evolutionMetrics}
            onRefreshData={fetchAASData}
          />
        </div>

      </div>
    </div>
  );
}