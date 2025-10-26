import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shuffle, 
  Network, 
  Lightbulb, 
  TrendingUp,
  GitMerge,
  Layers,
  Zap,
  Target,
  Brain,
  Link,
  Eye,
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const CognitiveReconstructionDashboard = ({ dashboardData, selectedDomain }) => {
  const [activeReconstruction, setActiveReconstruction] = useState(null);
  const [patternRecognition, setPatternRecognition] = useState({
    crossDomainPatterns: 0,
    conceptualLinks: 0,
    emergentInsights: 0,
    reconstructionAccuracy: 94.7
  });
  const [knowledgeGraph, setKnowledgeGraph] = useState([]);

  // Simulate pattern recognition updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPatternRecognition(prev => ({
        crossDomainPatterns: prev?.crossDomainPatterns + Math.floor(Math.random() * 3),
        conceptualLinks: prev?.conceptualLinks + Math.floor(Math.random() * 5),
        emergentInsights: prev?.emergentInsights + Math.floor(Math.random() * 2),
        reconstructionAccuracy: Math.min(99, prev?.reconstructionAccuracy + (Math.random() - 0.5) * 0.5)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Mock knowledge graph data
  useEffect(() => {
    const mockGraph = [
      { 
        id: 1, 
        concept: 'Black-Scholes Model', 
        domain: 'math', 
        connections: 8, 
        strength: 0.92,
        reconstructed: true 
      },
      { 
        id: 2, 
        concept: 'VaR Calculation', 
        domain: 'finance', 
        connections: 12, 
        strength: 0.87,
        reconstructed: true 
      },
      { 
        id: 3, 
        concept: 'Fair Value Measurement', 
        domain: 'ifrs', 
        connections: 6, 
        strength: 0.95,
        reconstructed: false 
      },
      { 
        id: 4, 
        concept: 'Transfer Pricing Rules', 
        domain: 'tax', 
        connections: 9, 
        strength: 0.89,
        reconstructed: true 
      }
    ];
    setKnowledgeGraph(mockGraph);
  }, [dashboardData]);

  const reconstructionMethods = [
    {
      id: 'synthesis',
      name: 'Autonomous Knowledge Synthesis',
      description: 'Combining concepts from multiple domains into coherent frameworks',
      icon: <Shuffle className="w-5 h-5" />,
      progress: 78,
      status: 'active'
    },
    {
      id: 'pattern',
      name: 'Cross-Domain Pattern Recognition',
      description: 'Identifying recurring patterns across different knowledge domains',
      icon: <Network className="w-5 h-5" />,
      progress: 92,
      status: 'completed'
    },
    {
      id: 'adaptation',
      name: 'Adaptive Learning Algorithms',
      description: 'Self-improving algorithms based on validation feedback',
      icon: <Brain className="w-5 h-5" />,
      progress: 65,
      status: 'processing'
    }
  ];

  const startReconstruction = (methodId) => {
    setActiveReconstruction(methodId);
    setTimeout(() => {
      setActiveReconstruction(null);
      // Update pattern recognition stats
      setPatternRecognition(prev => ({
        ...prev,
        emergentInsights: prev?.emergentInsights + Math.floor(Math.random() * 3) + 1
      }));
    }, 5000);
  };

  const getDomainColor = (domain) => {
    const colors = {
      math: 'text-blue-400 bg-blue-500/20',
      finance: 'text-green-400 bg-green-500/20',
      ifrs: 'text-purple-400 bg-purple-500/20',
      tax: 'text-yellow-400 bg-yellow-500/20',
      ai: 'text-cyan-400 bg-cyan-500/20'
    };
    return colors?.[domain] || 'text-slate-400 bg-slate-500/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-lg border border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <GitMerge className="w-6 h-6 text-purple-400" />
            <span>Cognitive Reconstruction Dashboard</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous knowledge synthesis & pattern recognition
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-400">{patternRecognition?.reconstructionAccuracy?.toFixed(1)}%</p>
          <p className="text-slate-400 text-xs">Accuracy Score</p>
        </div>
      </div>
      {/* Pattern Recognition Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Cross-Domain Patterns</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-400">{patternRecognition?.crossDomainPatterns}</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Conceptual Links</span>
            <Link className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-purple-400">{patternRecognition?.conceptualLinks}</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Emergent Insights</span>
            <Lightbulb className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-yellow-400">{patternRecognition?.emergentInsights}</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Active Connections</span>
            <Network className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-400">
              {dashboardData?.summary?.total_cross_refs || 47}
            </span>
            <Eye className="w-4 h-4 text-green-400" />
          </div>
        </div>
      </div>
      {/* Reconstruction Methods */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Reconstruction Methods</span>
        </h3>
        
        <div className="space-y-3">
          {reconstructionMethods?.map((method) => (
            <div
              key={method?.id}
              className={`p-4 rounded-lg border transition-all ${
                activeReconstruction === method?.id
                  ? 'bg-cyan-500/20 border-cyan-400'
                  : method?.status === 'active' ?'bg-green-500/10 border-green-400/30'
                  : method?.status === 'completed' ?'bg-blue-500/10 border-blue-400/30' :'bg-slate-900/30 border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    method?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    method?.status === 'completed'? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {method?.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{method?.name}</h4>
                    <p className="text-slate-400 text-sm">{method?.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => startReconstruction(method?.id)}
                  disabled={activeReconstruction === method?.id}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    activeReconstruction === method?.id
                      ? 'bg-cyan-500/20 text-cyan-400 cursor-not-allowed' :'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {activeReconstruction === method?.id ? 'Processing...' : 'Execute'}
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      method?.status === 'active' ? 'bg-green-400' :
                      method?.status === 'completed'? 'bg-blue-400' : 'bg-slate-500'
                    }`}
                    style={{ width: `${method?.progress}%` }}
                  ></div>
                </div>
                <span className="text-slate-300 text-sm">{method?.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Knowledge Graph Visualization */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
          <Network className="w-4 h-4 text-purple-400" />
          <span>Knowledge Graph Topology</span>
        </h3>
        
        <div className="bg-slate-900/30 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            {knowledgeGraph?.map((node) => (
              <div
                key={node?.id}
                className={`p-3 rounded-lg border ${
                  node?.reconstructed 
                    ? 'bg-green-500/10 border-green-400/30' :'bg-slate-800/50 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDomainColor(node?.domain)}`}>
                    {node?.domain?.toUpperCase()}
                  </span>
                  {node?.reconstructed && <Zap className="w-4 h-4 text-green-400" />}
                </div>
                
                <h4 className="text-white text-sm font-medium mb-1">{node?.concept}</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400 text-xs">{node?.connections} links</span>
                  </div>
                  <span className="text-green-400 text-xs">{(node?.strength * 100)?.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Cross-Domain Insights */}
      <div>
        <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span>Recent Cross-Domain Insights</span>
        </h3>
        
        <div className="space-y-3">
          {dashboardData?.recentInsights?.slice(0, 2)?.map((insight, index) => (
            <motion.div
              key={insight?.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/30 p-4 rounded-lg border border-slate-600"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDomainColor(insight?.primary_domain)}`}>
                    {insight?.primary_domain?.toUpperCase()}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDomainColor(insight?.secondary_domain)}`}>
                    {insight?.secondary_domain?.toUpperCase()}
                  </span>
                </div>
                <span className="text-green-400 text-sm">
                  {((insight?.strength || 0.8) * 100)?.toFixed(0)}% confidence
                </span>
              </div>
              
              <p className="text-slate-300 text-sm">{insight?.description}</p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-purple-300 text-xs">{insight?.insight_type}</span>
                <span className="text-slate-500 text-xs">
                  {new Date(insight?.created_at)?.toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CognitiveReconstructionDashboard;