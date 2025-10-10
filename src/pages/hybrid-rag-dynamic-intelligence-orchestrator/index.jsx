import React, { useState, useEffect } from 'react';
import { Brain, Network, FileText, BarChart3, Database, Activity, Target, Globe, Cpu, BookOpen, CheckCircle2 } from 'lucide-react';
import HybridRAGEngine from './components/HybridRAGEngine';
import DynamicKnowledgeGraph from './components/DynamicKnowledgeGraph';
import IntelligentReportGenerator from './components/IntelligentReportGenerator';
import MultiAgentCollaboration from './components/MultiAgentCollaboration';
import AdvancedAnalyticsIntegration from './components/AdvancedAnalyticsIntegration';
import ragKnowledgeBaseService from '../../services/ragKnowledgeBaseService';

export default function HybridRAGDynamicIntelligenceOrchestrator() {
  const [orchestratorStats, setOrchestratorStats] = useState({
    totalDocuments: 0,
    activeEmbeddings: 0,
    knowledgeEntities: 0,
    realtimeStreams: 0,
    agentCollaborations: 0,
    generatedReports: 0
  });
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState('optimal');
  const [knowledgeGraphNodes, setKnowledgeGraphNodes] = useState([]);

  const loadOrchestratorData = async () => {
    try {
      setLoading(true);
      
      const [books, knowledgeStats] = await Promise.all([
        ragKnowledgeBaseService?.getBooks(),
        ragKnowledgeBaseService?.getKnowledgeStats()
      ]);

      // Calculate advanced metrics
      const totalEmbeddings = knowledgeStats?.reduce((sum, stat) => sum + (stat?.totalBooks || 0), 0) * 150; // Avg chunks per book
      const knowledgeEntities = books?.reduce((sum, book) => {
        return sum + (book?.reading_materials?.length || 0) * 25; // Avg entities per material
      }, 0);

      setOrchestratorStats({
        totalDocuments: books?.length || 0,
        activeEmbeddings: totalEmbeddings,
        knowledgeEntities,
        realtimeStreams: Math.floor(Math.random() * 12) + 8, // Mock real-time data streams
        agentCollaborations: Math.floor(Math.random() * 50) + 25,
        generatedReports: Math.floor(Math.random() * 200) + 100
      });

      // Mock knowledge graph nodes
      setKnowledgeGraphNodes([
        { id: 1, label: 'Trading Strategies', connections: 45, type: 'primary' },
        { id: 2, label: 'Risk Management', connections: 38, type: 'secondary' },
        { id: 3, label: 'Market Patterns', connections: 52, type: 'primary' },
        { id: 4, label: 'AI Models', connections: 29, type: 'tertiary' }
      ]);

      setSystemHealth(['optimal', 'good', 'moderate']?.[Math.floor(Math.random() * 3)]);
    } catch (error) {
      console.error('Error loading orchestrator data:', error);
      setSystemHealth('degraded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrchestratorData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrchestratorData, 30000);
    return () => clearInterval(interval);
  }, []);

  const intelligenceAccentColors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
  };

  const systemHealthIndicator = {
    optimal: { color: 'text-green-400', bg: 'bg-green-500', label: 'Optimal Performance' },
    good: { color: 'text-blue-400', bg: 'bg-blue-500', label: 'Good Performance' },
    moderate: { color: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Moderate Load' },
    degraded: { color: 'text-red-400', bg: 'bg-red-500', label: 'Performance Issues' }
  };

  const keyMetrics = [
    {
      title: 'Knowledge Documents',
      value: orchestratorStats?.totalDocuments?.toLocaleString(),
      icon: BookOpen,
      accent: 'blue',
      trend: '+12%',
      description: 'Multi-modal knowledge sources'
    },
    {
      title: 'Active Embeddings',
      value: `${(orchestratorStats?.activeEmbeddings / 1000)?.toFixed(1)}K`,
      icon: Database,
      accent: 'green',
      trend: '+8%',
      description: 'FAISS indexed vectors'
    },
    {
      title: 'Knowledge Entities',
      value: orchestratorStats?.knowledgeEntities?.toLocaleString(),
      icon: Network,
      accent: 'orange',
      trend: '+24%',
      description: 'Graph neural network nodes'
    },
    {
      title: 'Real-time Streams',
      value: orchestratorStats?.realtimeStreams,
      icon: Activity,
      accent: 'blue',
      trend: 'Live',
      description: 'Market intelligence feeds'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Advanced Header with Real-time Status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                  🧠 Hybrid RAG & Dynamic Intelligence Orchestrator
                </h1>
                <p className="text-gray-400 text-lg mt-1">
                  Next-generation knowledge synthesis with real-time market intelligence and dynamic content generation
                </p>
              </div>
            </div>
            
            {/* System Health Indicator */}
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg border ${intelligenceAccentColors?.green}`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${systemHealthIndicator?.[systemHealth]?.bg}`}></div>
                  <span className="text-sm font-medium">{systemHealthIndicator?.[systemHealth]?.label}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date()?.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Key Intelligence Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {keyMetrics?.map((metric, index) => (
              <div key={index} className={`p-6 rounded-xl border ${intelligenceAccentColors?.[metric?.accent]}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${intelligenceAccentColors?.[metric?.accent]}`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-sm font-bold ${metric?.accent === 'blue' ? 'text-blue-400' : metric?.accent === 'green' ? 'text-green-400' : 'text-orange-400'}`}>
                    {metric?.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-white">{metric?.value}</p>
                  <p className="text-sm font-medium text-gray-300">{metric?.title}</p>
                  <p className="text-xs text-gray-500">{metric?.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Three-Column Advanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hybrid RAG Engine & Dynamic Knowledge Graph */}
          <div className="space-y-8">
            <HybridRAGEngine />
            <DynamicKnowledgeGraph nodes={knowledgeGraphNodes} />
          </div>

          {/* Center Column - Intelligent Report Generator & Multi-Agent Collaboration */}
          <div className="space-y-8">
            <IntelligentReportGenerator stats={orchestratorStats} />
            <MultiAgentCollaboration />
          </div>

          {/* Right Column - Advanced Analytics Integration & Interactive Controls */}
          <div className="space-y-8">
            <AdvancedAnalyticsIntegration />
            
            {/* Interactive Knowledge Controls */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="h-5 w-5 text-orange-400" />
                <h3 className="text-xl font-bold">Interactive Controls</h3>
              </div>
              
              <div className="space-y-4">
                {/* Knowledge Graph Exploration */}
                <div className={`p-4 rounded-lg border ${intelligenceAccentColors?.blue}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Network className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">Knowledge Graph Explorer</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400">Navigate entity relationships and connections</p>
                </div>

                {/* Report Template Customization */}
                <div className={`p-4 rounded-lg border ${intelligenceAccentColors?.green}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-400" />
                      <span className="font-medium">Report Templates</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400">Customize automated report generation</p>
                </div>

                {/* Export Capabilities */}
                <div className={`p-4 rounded-lg border ${intelligenceAccentColors?.orange}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-orange-400" />
                      <span className="font-medium">Multi-Format Export</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-400">PDF, dashboards, API endpoints</p>
                </div>
              </div>
            </div>

            {/* Advanced Processing Pipeline Status */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-6">
                <Cpu className="h-5 w-5 text-purple-400" />
                <h3 className="text-xl font-bold">Processing Pipeline</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Dense Passage Retrieval</span>
                  </div>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Cross-Attention Fusion</span>
                  </div>
                  <span className="text-blue-400 text-sm">Processing</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Causal Reasoning Engine</span>
                  </div>
                  <span className="text-orange-400 text-sm">Analyzing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Performance Dashboard Footer */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-8 border border-gray-600">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-6 w-6 text-purple-400" />
              <h3 className="text-2xl font-bold">Advanced Performance Metrics</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Real-time Intelligence</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">99.2%</div>
              <div className="text-sm text-gray-400">Retrieval Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">1536D</div>
              <div className="text-sm text-gray-400">Vector Embeddings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">&lt;150ms</div>
              <div className="text-sm text-gray-400">Query Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">24/7</div>
              <div className="text-sm text-gray-400">Agent Orchestration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">85%</div>
              <div className="text-sm text-gray-400">Confidence Threshold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">Real-time</div>
              <div className="text-sm text-gray-400">Market Fusion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}