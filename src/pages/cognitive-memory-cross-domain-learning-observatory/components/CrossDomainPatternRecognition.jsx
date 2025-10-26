import React, { useState, useEffect } from 'react';
import { Network, TrendingUp, Lightbulb, Target, GitBranch, Zap, ArrowRight, Brain } from 'lucide-react';

const CrossDomainPatternRecognition = ({ insights, relationships }) => {
  const [patternAnalysis, setPatternAnalysis] = useState({});
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  
  // Analyze cross-domain patterns
  useEffect(() => {
    if (insights?.length > 0 && relationships?.length > 0) {
      // Pattern recognition analysis
      const patterns = {
        mathToFinance: [],
        physicsToTrading: [],
        aiToRegulation: [],
        ifrsToStrategy: []
      };
      
      const domainConnections = {};
      const applicationMetrics = {};
      
      // Analyze insights
      insights?.forEach(insight => {
        const key = `${insight?.primary_domain}_${insight?.secondary_domain}`;
        
        if (!domainConnections?.[key]) {
          domainConnections[key] = {
            primary: insight?.primary_domain,
            secondary: insight?.secondary_domain,
            count: 0,
            avgConfidence: 0,
            totalConfidence: 0,
            applications: insight?.successful_applications || 0
          };
        }
        
        domainConnections[key].count++;
        domainConnections[key].totalConfidence += insight?.confidence_score || 0;
        domainConnections[key].avgConfidence = domainConnections?.[key]?.totalConfidence / domainConnections?.[key]?.count;
        domainConnections[key].applications += insight?.successful_applications || 0;
        
        // Categorize patterns
        if (insight?.primary_domain === 'math' && insight?.secondary_domain === 'finance') {
          patterns?.mathToFinance?.push(insight);
        } else if (insight?.primary_domain === 'physics' && insight?.secondary_domain === 'trading') {
          patterns?.physicsToTrading?.push(insight);
        } else if (insight?.primary_domain === 'ai' && (insight?.secondary_domain === 'law' || insight?.secondary_domain === 'governance')) {
          patterns?.aiToRegulation?.push(insight);
        } else if (insight?.primary_domain === 'ifrs' && (insight?.secondary_domain === 'trading' || insight?.secondary_domain === 'finance')) {
          patterns?.ifrsToStrategy?.push(insight);
        }
      });
      
      // Analyze relationships for strength patterns
      relationships?.forEach(rel => {
        if (rel?.strength >= confidenceThreshold) {
          const type = rel?.relationship_type;
          if (!applicationMetrics?.[type]) {
            applicationMetrics[type] = {
              count: 0,
              avgStrength: 0,
              totalStrength: 0
            };
          }
          
          applicationMetrics[type].count++;
          applicationMetrics[type].totalStrength += rel?.strength || 0;
          applicationMetrics[type].avgStrength = applicationMetrics?.[type]?.totalStrength / applicationMetrics?.[type]?.count;
        }
      });
      
      setPatternAnalysis({
        patterns,
        domainConnections,
        applicationMetrics
      });
    }
  }, [insights, relationships, confidenceThreshold]);

  const getPatternColor = (pattern) => {
    const colors = {
      mathToFinance: 'from-blue-500 to-green-500',
      physicsToTrading: 'from-purple-500 to-yellow-500',
      aiToRegulation: 'from-cyan-500 to-red-500',
      ifrsToStrategy: 'from-orange-500 to-pink-500'
    };
    return colors?.[pattern] || 'from-slate-500 to-slate-600';
  };

  const getPatternIcon = (pattern) => {
    const icons = {
      mathToFinance: TrendingUp,
      physicsToTrading: Zap,
      aiToRegulation: Brain,
      ifrsToStrategy: Target
    };
    return icons?.[pattern] || Network;
  };

  const getPatternTitle = (pattern) => {
    const titles = {
      mathToFinance: 'Mathematics → Finance',
      physicsToTrading: 'Physics → Trading',
      aiToRegulation: 'AI → Regulation',
      ifrsToStrategy: 'IFRS → Strategy'
    };
    return titles?.[pattern] || pattern;
  };

  return (
    <div className="space-y-6">
      {/* Pattern Recognition Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Network className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Cross-Domain Pattern Recognition</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm text-slate-300">Confidence Threshold:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e?.target?.value))}
              className="w-24"
            />
            <span className="text-white font-medium">{(confidenceThreshold * 100)?.toFixed(0)}%</span>
          </div>
        </div>

        {/* Pattern Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(patternAnalysis?.patterns || {})?.map(([patternKey, patternInsights]) => {
            const IconComponent = getPatternIcon(patternKey);
            const confidenceSum = patternInsights?.reduce((sum, insight) => sum + (insight?.confidence_score || 0), 0);
            const avgConfidence = patternInsights?.length > 0 ? confidenceSum / patternInsights?.length : 0;
            
            return (
              <div 
                key={patternKey}
                onClick={() => setSelectedPattern(patternKey)}
                className={`p-4 rounded-lg bg-gradient-to-r ${getPatternColor(patternKey)} bg-opacity-10 border border-opacity-20 cursor-pointer transition-all hover:bg-opacity-20`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <IconComponent className="w-5 h-5 text-white" />
                  <h4 className="font-semibold text-white">{getPatternTitle(patternKey)}</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Insights</span>
                    <span className="text-white font-medium">{patternInsights?.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Confidence</span>
                    <span className="text-white font-medium">{(avgConfidence * 100)?.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getPatternColor(patternKey)}`}
                      style={{ width: `${(avgConfidence || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Detailed Pattern Analysis */}
      {selectedPattern && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">
                {getPatternTitle(selectedPattern)} Analysis
              </h3>
            </div>
            <button
              onClick={() => setSelectedPattern(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {patternAnalysis?.patterns?.[selectedPattern]?.map((insight, index) => (
              <div key={insight?.id || index} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">{insight?.insight_type?.replace('_', ' ')?.toUpperCase()}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-400">
                      {((insight?.confidence_score || 0) * 100)?.toFixed(0)}%
                    </span>
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">{insight?.successful_applications || 0}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-3">{insight?.insight_description}</p>
                
                {insight?.mathematical_expression && (
                  <div className="p-2 bg-slate-800 rounded text-xs font-mono text-cyan-400 mb-2">
                    {insight?.mathematical_expression}
                  </div>
                )}
                
                {insight?.practical_application && (
                  <div className="text-xs text-yellow-400">
                    <strong>Application:</strong> {insight?.practical_application}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Application Metrics */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Application Success Metrics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(patternAnalysis?.applicationMetrics || {})?.map(([type, metrics]) => (
            <div key={type} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <h4 className="font-medium text-white capitalize">{type?.replace('_', ' ')}</h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Count</span>
                  <span className="text-white">{metrics?.count}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Avg Strength</span>
                  <span className="text-white">{(metrics?.avgStrength * 100)?.toFixed(1)}%</span>
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${(metrics?.avgStrength || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Domain Connection Matrix */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Domain Connection Matrix</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(patternAnalysis?.domainConnections || {})?.map(([key, connection]) => (
            <div key={key} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 font-medium capitalize">
                    {connection?.primary}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="text-purple-400 font-medium capitalize">
                    {connection?.secondary}
                  </span>
                </div>
                <span className="text-green-400 font-semibold">
                  {((connection?.avgConfidence || 0) * 100)?.toFixed(0)}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-slate-400">Connections</p>
                  <p className="text-white font-semibold">{connection?.count}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">Applications</p>
                  <p className="text-white font-semibold">{connection?.applications}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">Success Rate</p>
                  <p className="text-white font-semibold">
                    {connection?.count > 0 
                      ? ((connection?.applications / connection?.count) * 100)?.toFixed(0) + '%' :'0%'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossDomainPatternRecognition;