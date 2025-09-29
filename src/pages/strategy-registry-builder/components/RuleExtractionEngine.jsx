import React, { useState, useEffect } from 'react';
        import { motion } from 'framer-motion';
        import { Search, Brain, Target, Activity, CheckCircle, AlertCircle, FileText } from 'lucide-react';

        const RuleExtractionEngine = () => {
          const [extractionProgress, setExtractionProgress] = useState(0);
          const [patterns, setPatterns] = useState([
            {
              id: 'option_call_definition',
              type: 'instrument',
              pattern: '/(option\\s+call|call option)\\s*(?:[:\\-–]|est|is)\\s/i',
              confidence: 92,
              matches: 15,
              status: 'active'
            },
            {
              id: 'payoff_rules',
              type: 'payoff',
              pattern: '/(payoff|gain)\\s+(call|put)|max\\(\\s*[SK]\\s*[-+]\\s*[KS]/i',
              confidence: 88,
              matches: 23,
              status: 'active'
            },
            {
              id: 'volatility_concepts',
              type: 'concept',
              pattern: '/(volatilité implicite|implied volatility|smile)/i',
              confidence: 95,
              matches: 8,
              status: 'active'
            },
            {
              id: 'greeks_references',
              type: 'concept',
              pattern: '/\\b(delta|gamma|vega|theta|rho)\\b/i',
              confidence: 87,
              matches: 34,
              status: 'active'
            }
          ]);

          const [extractedRules, setExtractedRules] = useState([
            {
              id: 'rule_001',
              type: 'instrument',
              title: 'Option Call Definition',
              confidence: 92,
              snippet: 'Une option call donne le droit (non l\'obligation) d\'acheter le sous-jacent...',
              source: '3204-2-bases-produits-derives.pdf',
              validated: true
            },
            {
              id: 'rule_002',
              type: 'payoff',
              title: 'Call Option Payoff',
              confidence: 88,
              snippet: 'Le payoff d\'un call est max(S - K, 0) où S est le prix spot...',
              source: 'options-strategies-guide.pdf',
              validated: true
            },
            {
              id: 'rule_003',
              type: 'concept',
              title: 'Implied Volatility Smile',
              confidence: 95,
              snippet: 'La volatilité implicite présente souvent un sourire en fonction du strike...',
              source: 'volatility-trading-handbook.pdf',
              validated: false
            }
          ]);

          useEffect(() => {
            const interval = setInterval(() => {
              setExtractionProgress(prev => Math.min(prev + Math.random() * 2, 100));
            }, 1000);

            return () => clearInterval(interval);
          }, []);

          return (
            <motion.div 
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Search className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Rule Extraction Engine</h3>
                  <p className="text-purple-300 text-sm">NLP-powered pattern matching for derivatives trading rules</p>
                </div>
              </div>
              {/* Extraction Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">Extraction Progress</span>
                  <span className="text-sm text-white font-mono">{Math.round(extractionProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    animate={{ width: `${extractionProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              {/* Pattern Matching */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-400" />
                  Active Patterns
                </h4>
                <div className="space-y-3">
                  {patterns?.map((pattern) => (
                    <div key={pattern?.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-400" />
                          <span className="text-white font-medium">{pattern?.id}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pattern?.type === 'instrument' ? 'bg-green-500/20 text-green-300' :
                            pattern?.type === 'payoff'? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {pattern?.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400">{pattern?.matches} matches</span>
                          <span className="text-xs text-green-300">{pattern?.confidence}%</span>
                        </div>
                      </div>
                      <code className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded block overflow-x-auto">
                        {pattern?.pattern}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
              {/* Extracted Rules */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-purple-400" />
                  Extracted Rules
                  <span className="ml-2 text-sm text-purple-300">({extractedRules?.length})</span>
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {extractedRules?.map((rule) => (
                    <div key={rule?.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {rule?.validated ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                          )}
                          <span className="text-white font-medium">{rule?.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-3 w-3 text-blue-400" />
                          <span className="text-xs text-blue-300">{rule?.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{rule?.snippet}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Source: {rule?.source}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          rule?.type === 'instrument' ? 'bg-green-500/20 text-green-300' :
                          rule?.type === 'payoff'? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {rule?.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        };

        export default RuleExtractionEngine;