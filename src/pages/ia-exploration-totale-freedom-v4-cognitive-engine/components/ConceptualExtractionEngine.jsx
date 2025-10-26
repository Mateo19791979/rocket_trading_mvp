import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Target, CheckCircle, Brain, Network, Eye, Layers, TrendingUp, Lightbulb, GitBranch, BarChart3 } from 'lucide-react';

const ConceptualExtractionEngine = ({ selectedDomain, realTimeMetrics }) => {
  const [extractionProcess, setExtractionProcess] = useState({
    stage: 'idle', // idle, parsing, extracting, validating, storing
    progress: 0,
    currentConcept: '',
    conceptsFound: 0
  });

  const [nlpMetrics, setNlpMetrics] = useState({
    entityRecognition: 87.3,
    relationshipMapping: 92.1,
    semanticUnderstanding: 89.7,
    confidenceScore: 91.2
  });

  // Simulate extraction process stages
  const extractionStages = [
    { id: 'parsing', name: 'Content Parsing', icon: <Layers className="w-4 h-4" />, duration: 2000 },
    { id: 'nlp', name: 'NLP Processing', icon: <Brain className="w-4 h-4" />, duration: 3000 },
    { id: 'extraction', name: 'Concept Extraction', icon: <Target className="w-4 h-4" />, duration: 4000 },
    { id: 'validation', name: 'Semantic Validation', icon: <CheckCircle className="w-4 h-4" />, duration: 2500 },
    { id: 'storage', name: 'Cognitive Storage', icon: <Zap className="w-4 h-4" />, duration: 1500 }
  ];

  // Sample concepts for demonstration
  const sampleConcepts = {
    math: ['Black-Scholes Equation', 'Monte Carlo Simulation', 'Stochastic Calculus'],
    finance: ['Value at Risk', 'Options Greeks', 'Portfolio Optimization'],
    ifrs: ['Fair Value Hierarchy', 'Impairment Testing', 'Revenue Recognition'],
    tax: ['Transfer Pricing', 'Tax Treaties', 'BEPS Action Items'],
    ai: ['Neural Networks', 'Deep Learning', 'Natural Language Processing']
  };

  // Update NLP metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setNlpMetrics(prev => ({
        entityRecognition: Math.min(95, prev?.entityRecognition + (Math.random() - 0.5) * 2),
        relationshipMapping: Math.min(98, prev?.relationshipMapping + (Math.random() - 0.5) * 1.5),
        semanticUnderstanding: Math.min(96, prev?.semanticUnderstanding + (Math.random() - 0.5) * 1.8),
        confidenceScore: Math.min(97, prev?.confidenceScore + (Math.random() - 0.5) * 1.2)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const startExtraction = async () => {
    for (const stage of extractionStages) {
      setExtractionProcess({
        stage: stage?.id,
        progress: 0,
        currentConcept: stage?.name,
        conceptsFound: Math.floor(Math.random() * 5) + 1
      });

      // Animate progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, stage.duration / 20));
        setExtractionProcess(prev => ({ ...prev, progress: i }));
      }
    }

    // Complete extraction
    setExtractionProcess({
      stage: 'completed',
      progress: 100,
      currentConcept: 'Extraction Complete',
      conceptsFound: extractionStages?.reduce((acc, _) => acc + Math.floor(Math.random() * 3) + 1, 0)
    });

    setTimeout(() => {
      setExtractionProcess({
        stage: 'idle',
        progress: 0,
        currentConcept: '',
        conceptsFound: 0
      });
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-lg border border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-green-400" />
            <span>Conceptual Extraction Engine</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Advanced NLP processing with semantic understanding
          </p>
        </div>
        
        <button
          onClick={startExtraction}
          disabled={extractionProcess?.stage !== 'idle'}
          className={`px-4 py-2 rounded-lg transition-all ${
            extractionProcess?.stage !== 'idle' ?'bg-slate-600 text-slate-400 cursor-not-allowed' :'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {extractionProcess?.stage !== 'idle' ? 'Processing...' : 'Start Extraction'}
        </button>
      </div>
      {/* NLP Processing Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Entity Recognition</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-blue-400">{nlpMetrics?.entityRecognition?.toFixed(1)}%</span>
            <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Relationship Mapping</span>
            <Network className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-purple-400">{nlpMetrics?.relationshipMapping?.toFixed(1)}%</span>
            <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Semantic Understanding</span>
            <Brain className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-yellow-400">{nlpMetrics?.semanticUnderstanding?.toFixed(1)}%</span>
            <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
          </div>
        </div>
        
        <div className="bg-slate-900/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm">Confidence Score</span>
            <BarChart3 className="w-4 h-4 text-green-400" />
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-green-400">{nlpMetrics?.confidenceScore?.toFixed(1)}%</span>
            <TrendingUp className="w-4 h-4 text-green-400 mb-1" />
          </div>
        </div>
      </div>
      {/* Processing Pipeline */}
      <div className="mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <span>Processing Pipeline</span>
        </h3>
        
        <div className="space-y-3">
          {extractionStages?.map((stage, index) => {
            const isActive = extractionProcess?.stage === stage?.id;
            const isCompleted = extractionStages?.findIndex(s => s?.id === extractionProcess?.stage) > index;
            
            return (
              <div
                key={stage?.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isActive ? 'bg-cyan-500/20 border border-cyan-400' :
                  isCompleted ? 'bg-green-500/20 border border-green-400': 'bg-slate-900/30 border border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-cyan-500/20 text-cyan-400' :
                    isCompleted ? 'bg-green-500/20 text-green-400': 'bg-slate-700 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : stage?.icon}
                  </div>
                  <span className={`font-medium ${
                    isActive ? 'text-cyan-300' :
                    isCompleted ? 'text-green-300': 'text-slate-400'
                  }`}>
                    {stage?.name}
                  </span>
                </div>
                {isActive && (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${extractionProcess?.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-cyan-300 text-sm">{extractionProcess?.progress}%</span>
                  </div>
                )}
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Current Extraction Status */}
      {extractionProcess?.stage !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 p-4 rounded-lg border border-cyan-400/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-300 font-medium">Current Process</span>
            <div className="flex items-center space-x-2">
              <div className="animate-pulse w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-cyan-300 text-sm">Active</span>
            </div>
          </div>
          <p className="text-white text-lg">{extractionProcess?.currentConcept}</p>
          {extractionProcess?.conceptsFound > 0 && (
            <p className="text-slate-400 text-sm mt-1">
              {extractionProcess?.conceptsFound} concepts identified
            </p>
          )}
        </motion.div>
      )}
      {/* Domain-Specific Concepts Preview */}
      <div className="mt-6">
        <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span>Recently Extracted Concepts</span>
        </h4>
        
        <div className="space-y-2">
          {(sampleConcepts?.[selectedDomain] || sampleConcepts?.math)?.map((concept, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-900/30 rounded-lg">
              <span className="text-slate-300">{concept}</span>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm">
                  {(Math.random() * 0.3 + 0.7)?.toFixed(2)} trust
                </span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ConceptualExtractionEngine;