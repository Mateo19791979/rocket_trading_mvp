import React, { useState, useEffect } from 'react';
import { Brain, Network, TrendingUp, Database, Eye, BarChart3, Zap, Lightbulb, Target, RefreshCw } from 'lucide-react';
import CognitiveMemoryArchitecture from './components/CognitiveMemoryArchitecture';
import CrossDomainPatternRecognition from './components/CrossDomainPatternRecognition';
import AdaptiveLearningEngine from './components/AdaptiveLearningEngine';
import MetaAnalyticalDashboard from './components/MetaAnalyticalDashboard';
import KnowledgeGraphVisualization from './components/KnowledgeGraphVisualization';
import CognitivePerformanceAnalytics from './components/CognitivePerformanceAnalytics';
import { supabase } from '../../lib/supabase';

const CognitiveMemoryObservatory = () => {
  const [cognitiveData, setCognitiveData] = useState({
    knowledgeBlocks: [],
    conceptRelationships: [],
    crossDomainInsights: [],
    dailyReports: [],
    memoryUpdates: []
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('architecture');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState({
    totalConcepts: 0,
    crossDomainConnections: 0,
    learningVelocity: 0,
    memoryConsolidation: 0,
    cognitiveEvolution: 0
  });

  // Load cognitive memory data
  const loadCognitiveData = async () => {
    try {
      setLoading(true);
      
      // Load knowledge blocks
      const { data: knowledgeBlocks, error: kbError } = await supabase
        ?.from('knowledge_blocks')
        ?.select(`
          id, domain, concept, equation, description, source, 
          trust_score, trust_level, discovered_at, validation_count, 
          application_count, metadata
        `)
        ?.order('discovered_at', { ascending: false })
        ?.limit(100);

      if (kbError) throw kbError;

      // Load concept relationships
      const { data: relationships, error: relError } = await supabase
        ?.from('concept_relationships')
        ?.select(`
          id, source_concept_id, target_concept_id, relationship_type,
          strength, discovered_by, validation_score, created_at,
          source_concept:source_concept_id(concept, domain),
          target_concept:target_concept_id(concept, domain)
        `)
        ?.order('created_at', { ascending: false })
        ?.limit(50);

      if (relError) throw relError;

      // Load cross-domain insights
      const { data: insights, error: insightError } = await supabase
        ?.from('cross_domain_insights')
        ?.select('*')
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (insightError) throw insightError;

      // Load daily reports
      const { data: reports, error: reportError } = await supabase
        ?.from('daily_knowledge_reports')
        ?.select('*')
        ?.order('report_date', { ascending: false })
        ?.limit(30);

      if (reportError) throw reportError;

      // Calculate system metrics
      const totalConcepts = knowledgeBlocks?.length || 0;
      const connections = relationships?.length || 0;
      const latestReport = reports?.[0];
      
      setCognitiveData({
        knowledgeBlocks: knowledgeBlocks || [],
        conceptRelationships: relationships || [],
        crossDomainInsights: insights || [],
        dailyReports: reports || [],
        memoryUpdates: []
      });

      setSystemMetrics({
        totalConcepts,
        crossDomainConnections: connections,
        learningVelocity: latestReport?.learning_velocity || 0,
        memoryConsolidation: latestReport?.memory_consolidation_rate || 0,
        cognitiveEvolution: latestReport?.knowledge_quality_score || 0
      });

    } catch (error) {
      console.error('Error loading cognitive data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription for cognitive updates
  useEffect(() => {
    loadCognitiveData();

    if (realTimeUpdates) {
      const subscription = supabase
        ?.channel('cognitive-memory-updates')
        ?.on('postgres_changes', 
          { event: '*', schema: 'public', table: 'knowledge_blocks' },
          (payload) => {
            console.log('Knowledge block update:', payload);
            loadCognitiveData(); // Refresh data on changes
          }
        )
        ?.on('postgres_changes',
          { event: '*', schema: 'public', table: 'cross_domain_insights' },
          (payload) => {
            console.log('Cross-domain insight update:', payload);
            loadCognitiveData();
          }
        )
        ?.subscribe();

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [realTimeUpdates]);

  const tabs = [
    { id: 'architecture', label: 'Memory Architecture', icon: Brain },
    { id: 'patterns', label: 'Pattern Recognition', icon: Network },
    { id: 'learning', label: 'Adaptive Learning', icon: TrendingUp },
    { id: 'analytics', label: 'Meta-Analytics', icon: BarChart3 },
    { id: 'graph', label: 'Knowledge Graph', icon: Eye },
    { id: 'performance', label: 'Performance', icon: Target }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Cognitive Observatory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Cognitive Memory & Cross-Domain Learning Observatory
                </h1>
                <p className="text-slate-300 mt-1">
                  Freedom v4 - Autonomous AI Memory Formation & Interdisciplinary Intelligence
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  realTimeUpdates 
                    ? 'bg-green-600 border-green-500 text-white' :'bg-slate-700 border-slate-600 text-slate-300'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Real-time</span>
              </button>
              
              <button
                onClick={loadCognitiveData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Concepts</p>
                <p className="text-2xl font-bold text-blue-400">{systemMetrics?.totalConcepts?.toLocaleString()}</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Cross-Domain Links</p>
                <p className="text-2xl font-bold text-purple-400">{systemMetrics?.crossDomainConnections?.toLocaleString()}</p>
              </div>
              <Network className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Learning Velocity</p>
                <p className="text-2xl font-bold text-yellow-400">{systemMetrics?.learningVelocity?.toFixed(1)}/day</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Memory Consolidation</p>
                <p className="text-2xl font-bold text-green-400">{((systemMetrics?.memoryConsolidation || 0) * 100)?.toFixed(1)}%</p>
              </div>
              <Brain className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Cognitive Evolution</p>
                <p className="text-2xl font-bold text-orange-400">{((systemMetrics?.cognitiveEvolution || 0) * 100)?.toFixed(1)}%</p>
              </div>
              <Lightbulb className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs?.map((tab) => {
            const IconComponent = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab?.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab?.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panels */}
        <div className="space-y-6">
          {activeTab === 'architecture' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <CognitiveMemoryArchitecture 
                  knowledgeBlocks={cognitiveData?.knowledgeBlocks}
                  systemMetrics={systemMetrics}
                />
              </div>
              <div className="lg:col-span-2">
                <CrossDomainPatternRecognition 
                  insights={cognitiveData?.crossDomainInsights}
                  relationships={cognitiveData?.conceptRelationships}
                />
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CrossDomainPatternRecognition 
                insights={cognitiveData?.crossDomainInsights}
                relationships={cognitiveData?.conceptRelationships}
              />
              <AdaptiveLearningEngine 
                reports={cognitiveData?.dailyReports}
                knowledgeBlocks={cognitiveData?.knowledgeBlocks}
              />
            </div>
          )}

          {activeTab === 'learning' && (
            <AdaptiveLearningEngine 
              reports={cognitiveData?.dailyReports}
              knowledgeBlocks={cognitiveData?.knowledgeBlocks}
            />
          )}

          {activeTab === 'analytics' && (
            <MetaAnalyticalDashboard 
              cognitiveData={cognitiveData}
              systemMetrics={systemMetrics}
            />
          )}

          {activeTab === 'graph' && (
            <KnowledgeGraphVisualization 
              knowledgeBlocks={cognitiveData?.knowledgeBlocks}
              relationships={cognitiveData?.conceptRelationships}
            />
          )}

          {activeTab === 'performance' && (
            <CognitivePerformanceAnalytics 
              reports={cognitiveData?.dailyReports}
              systemMetrics={systemMetrics}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CognitiveMemoryObservatory;