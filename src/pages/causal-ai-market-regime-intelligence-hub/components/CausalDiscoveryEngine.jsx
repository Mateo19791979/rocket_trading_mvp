import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, GitBranch, Zap, Target, TrendingUp, Activity, Database, CheckCircle } from 'lucide-react';

export default function CausalDiscoveryEngine({ causalMetrics, onMetricsUpdate }) {
  const [discoveryData, setDiscoveryData] = useState({
    pcAlgorithm: {
      status: 'RUNNING',
      discoveredEdges: 89,
      conditionalTests: 1247,
      confidenceThreshold: 0.85,
      executionTime: '2.3s'
    },
    interventionAnalysis: {
      activeInterventions: 7,
      treatmentEffects: 12,
      confoundingFactors: 4,
      causalStrength: 0.76
    },
    counterfactualReasoning: {
      scenarios: 23,
      probabilityDistributions: 15,
      alternativeOutcomes: 156,
      reasoning_accuracy: 91.7
    }
  });

  const [causalNetwork, setCausalNetwork] = useState([
    {
      source: 'Market_Volatility',
      target: 'Trading_Volume',
      strength: 0.83,
      type: 'POSITIVE',
      confidence: 0.91
    },
    {
      source: 'Interest_Rates',
      target: 'Asset_Prices',
      strength: -0.67,
      type: 'NEGATIVE',
      confidence: 0.88
    },
    {
      source: 'News_Sentiment',
      target: 'Market_Movement',
      strength: 0.74,
      type: 'POSITIVE',
      confidence: 0.85
    },
    {
      source: 'Economic_Indicators',
      target: 'Risk_Appetite',
      strength: 0.69,
      type: 'POSITIVE',
      confidence: 0.92
    }
  ]);

  const [discoveryAlgorithms, setDiscoveryAlgorithms] = useState([
    {
      name: 'PC Algorithm',
      status: 'ACTIVE',
      performance: 94.2,
      graphSize: 156,
      lastExecution: 'Running'
    },
    {
      name: 'Constraint-Based Methods',
      status: 'STANDBY',
      performance: 91.8,
      graphSize: 142,
      lastExecution: '2 min ago'
    },
    {
      name: 'Do-Calculus Implementation',
      status: 'ACTIVE',
      performance: 96.7,
      graphSize: 89,
      lastExecution: 'Running'
    },
    {
      name: 'Intervention Analysis',
      status: 'PROCESSING',
      performance: 89.3,
      graphSize: 234,
      lastExecution: '30s ago'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update discovery data
      setDiscoveryData(prev => ({
        ...prev,
        pcAlgorithm: {
          ...prev?.pcAlgorithm,
          discoveredEdges: Math.max(80, prev?.pcAlgorithm?.discoveredEdges + Math.floor(Math.random() * 6 - 3)),
          conditionalTests: prev?.pcAlgorithm?.conditionalTests + Math.floor(Math.random() * 20),
          confidenceThreshold: Math.max(0.8, Math.min(0.9, prev?.pcAlgorithm?.confidenceThreshold + (Math.random() * 0.04 - 0.02)))
        },
        interventionAnalysis: {
          ...prev?.interventionAnalysis,
          activeInterventions: Math.max(5, prev?.interventionAnalysis?.activeInterventions + Math.floor(Math.random() * 3 - 1)),
          treatmentEffects: prev?.interventionAnalysis?.treatmentEffects + Math.floor(Math.random() * 3),
          causalStrength: Math.max(0.7, Math.min(0.85, prev?.interventionAnalysis?.causalStrength + (Math.random() * 0.06 - 0.03)))
        },
        counterfactualReasoning: {
          ...prev?.counterfactualReasoning,
          scenarios: Math.max(20, prev?.counterfactualReasoning?.scenarios + Math.floor(Math.random() * 4 - 2)),
          alternativeOutcomes: prev?.counterfactualReasoning?.alternativeOutcomes + Math.floor(Math.random() * 10),
          reasoning_accuracy: Math.max(90, Math.min(95, prev?.counterfactualReasoning?.reasoning_accuracy + (Math.random() * 2 - 1)))
        }
      }));

      // Update algorithm performance
      setDiscoveryAlgorithms(prev =>
        prev?.map(algo => ({
          ...algo,
          performance: Math.max(85, Math.min(98, algo?.performance + (Math.random() * 2 - 1)))
        }))
      );

      // Update parent metrics
      if (onMetricsUpdate) {
        const newLinks = discoveryData?.pcAlgorithm?.discoveredEdges + Math.floor(Math.random() * 3 - 1);
        const newConfidence = (discoveryData?.pcAlgorithm?.confidenceThreshold * 100) + (Math.random() * 2 - 1);
        
        onMetricsUpdate(prev => ({
          ...prev,
          discoveredCausalLinks: Math.max(40, newLinks),
          confidenceLevel: Math.max(85, Math.min(95, newConfidence))
        }));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [discoveryData, onMetricsUpdate]);

  const getStatusColor = (status) => {
    const colors = {
      'RUNNING': 'text-green-400',
      'ACTIVE': 'text-green-400',
      'PROCESSING': 'text-blue-400',
      'STANDBY': 'text-yellow-400',
      'IDLE': 'text-gray-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'RUNNING': <Activity className="h-4 w-4 text-green-400 animate-pulse" />,
      'ACTIVE': <CheckCircle className="h-4 w-4 text-green-400" />,
      'PROCESSING': <Zap className="h-4 w-4 text-blue-400 animate-pulse" />,
      'STANDBY': <Target className="h-4 w-4 text-yellow-400" />
    };
    return icons?.[status] || <Database className="h-4 w-4 text-gray-400" />;
  };

  const getCausalTypeColor = (type) => {
    return type === 'POSITIVE' ? 'text-green-400' : 'text-red-400';
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 95) return 'text-green-400';
    if (performance >= 90) return 'text-teal-400';
    if (performance >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Causal Discovery Engine */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-purple-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-purple-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Causal Discovery Engine</h3>
              <p className="text-sm text-gray-400">Automated causal graph construction using advanced algorithms</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* PC Algorithm Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <GitBranch className="h-4 w-4 mr-2 text-purple-400" />
                PC Algorithm & Constraint-Based Methods
              </h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(discoveryData?.pcAlgorithm?.status)}
                <span className={`text-xs ${getStatusColor(discoveryData?.pcAlgorithm?.status)}`}>
                  {discoveryData?.pcAlgorithm?.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Discovered Edges</p>
                <p className="text-lg font-semibold text-purple-400">{discoveryData?.pcAlgorithm?.discoveredEdges}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Conditional Tests</p>
                <p className="text-lg font-semibold text-teal-400">{discoveryData?.pcAlgorithm?.conditionalTests}</p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-400">
                Confidence Threshold: {(discoveryData?.pcAlgorithm?.confidenceThreshold * 100)?.toFixed(1)}%
              </span>
              <span className="text-blue-400">
                Execution Time: {discoveryData?.pcAlgorithm?.executionTime}
              </span>
            </div>
          </div>

          {/* Intervention Analysis */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-orange-400" />
                Intervention Analysis & Do-Calculus
              </h4>
              <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
                Strength: {(discoveryData?.interventionAnalysis?.causalStrength * 100)?.toFixed(1)}%
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Active Interventions</p>
                <p className="text-lg font-semibold text-orange-400">{discoveryData?.interventionAnalysis?.activeInterventions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Treatment Effects</p>
                <p className="text-lg font-semibold text-blue-400">{discoveryData?.interventionAnalysis?.treatmentEffects}</p>
              </div>
            </div>
          </div>

          {/* Counterfactual Reasoning */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Target className="h-4 w-4 mr-2 text-teal-400" />
                Counterfactual Reasoning
              </h4>
              <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded">
                {discoveryData?.counterfactualReasoning?.reasoning_accuracy?.toFixed(1)}% Accuracy
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Scenarios Analyzed</p>
                <p className="text-lg font-semibold text-teal-400">{discoveryData?.counterfactualReasoning?.scenarios}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Alternative Outcomes</p>
                <p className="text-lg font-semibold text-green-400">{discoveryData?.counterfactualReasoning?.alternativeOutcomes}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Discovered Causal Network */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <GitBranch className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Visual Causal Network</h3>
              <p className="text-sm text-gray-400">Real-time causal relationships with confidence intervals</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {causalNetwork?.map((link, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-300">{link?.source}</span>
                    <TrendingUp className={`h-4 w-4 ${getCausalTypeColor(link?.type)} ${link?.type === 'NEGATIVE' ? 'transform rotate-180' : ''}`} />
                    <span className="text-sm font-medium text-gray-300">{link?.target}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getCausalTypeColor(link?.type)} bg-gray-700/50`}>
                      {link?.type}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Causal Strength</p>
                    <p className={`font-semibold ${getCausalTypeColor(link?.type)}`}>
                      {Math.abs(link?.strength)?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Confidence</p>
                    <p className="text-teal-400 font-semibold">{(link?.confidence * 100)?.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      {/* Algorithm Performance */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Discovery Algorithm Performance</h3>
              <p className="text-sm text-gray-400">Real-time monitoring of causal discovery algorithms</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {discoveryAlgorithms?.map((algorithm, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(algorithm?.status)}
                    <span className="text-sm font-medium text-gray-300">{algorithm?.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(algorithm?.status)} bg-gray-700/50`}>
                    {algorithm?.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Performance</p>
                    <p className={`font-semibold ${getPerformanceColor(algorithm?.performance)}`}>
                      {algorithm?.performance?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Graph Size</p>
                    <p className="text-blue-400 font-semibold">{algorithm?.graphSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Execution</p>
                    <p className="text-gray-300 font-semibold">{algorithm?.lastExecution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}