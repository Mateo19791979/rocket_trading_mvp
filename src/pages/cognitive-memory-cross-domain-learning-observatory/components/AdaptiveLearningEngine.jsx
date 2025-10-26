import React, { useState, useEffect } from 'react';
import { TrendingUp, Brain, Zap, Settings, Target, BarChart3, Lightbulb } from 'lucide-react';

const AdaptiveLearningEngine = ({ reports, knowledgeBlocks }) => {
  const [learningMetrics, setLearningMetrics] = useState({});
  const [learningProgression, setLearningProgression] = useState([]);
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    learningRate: 0.1,
    memoryDecay: 0.05,
    adaptationThreshold: 0.7,
    explorationRate: 0.3
  });
  const [currentCapabilities, setCurrentCapabilities] = useState({});

  // Calculate learning progression and metrics
  useEffect(() => {
    if (reports?.length > 0 && knowledgeBlocks?.length > 0) {
      // Process learning progression over time
      const progression = reports
        ?.slice()
        ?.sort((a, b) => new Date(a?.report_date || 0) - new Date(b?.report_date || 0))
        ?.map((report, index) => ({
          date: report?.report_date,
          totalConcepts: report?.total_concepts || 0,
          newConcepts: report?.new_concepts || 0,
          validatedConcepts: report?.validated_concepts || 0,
          learningVelocity: report?.learning_velocity || 0,
          qualityScore: report?.knowledge_quality_score || 0,
          consolidationRate: report?.memory_consolidation_rate || 0,
          crossDomainInsights: report?.cross_domain_insights || 0,
          cumulativeProgress: index === 0 ? 0 : index / (reports?.length - 1)
        }));
      
      setLearningProgression(progression);
      
      // Calculate current learning metrics
      const latestReport = reports?.[0];
      const previousReport = reports?.[1];
      
      const metrics = {
        currentLearningVelocity: latestReport?.learning_velocity || 0,
        velocityChange: previousReport 
          ? ((latestReport?.learning_velocity || 0) - (previousReport?.learning_velocity || 0)) / (previousReport?.learning_velocity || 1) * 100
          : 0,
        memoryConsolidation: latestReport?.memory_consolidation_rate || 0,
        knowledgeQuality: latestReport?.knowledge_quality_score || 0,
        crossDomainEfficiency: latestReport?.cross_domain_insights / Math.max(latestReport?.new_concepts || 1, 1),
        adaptationIndex: calculateAdaptationIndex(progression),
        learningEfficiency: calculateLearningEfficiency(progression),
        cognitiveGrowth: calculateCognitiveGrowth(progression)
      };
      
      setLearningMetrics(metrics);
      
      // Calculate current capabilities by domain
      const domainCapabilities = {};
      knowledgeBlocks?.forEach(block => {
        if (!domainCapabilities?.[block?.domain]) {
          domainCapabilities[block.domain] = {
            conceptCount: 0,
            avgTrust: 0,
            totalTrust: 0,
            highConfidence: 0,
            applications: 0,
            mastery: 0
          };
        }
        
        domainCapabilities[block.domain].conceptCount++;
        domainCapabilities[block.domain].totalTrust += block?.trust_score || 0;
        domainCapabilities[block.domain].applications += block?.application_count || 0;
        
        if ((block?.trust_score || 0) > 0.7) {
          domainCapabilities[block.domain].highConfidence++;
        }
      });
      
      // Calculate mastery levels
      Object.keys(domainCapabilities)?.forEach(domain => {
        const capability = domainCapabilities?.[domain];
        capability.avgTrust = capability?.totalTrust / capability?.conceptCount;
        capability.mastery = calculateMastery(capability);
      });
      
      setCurrentCapabilities(domainCapabilities);
    }
  }, [reports, knowledgeBlocks]);

  const calculateAdaptationIndex = (progression) => {
    if (progression?.length < 2) return 0;
    
    let adaptationSum = 0;
    for (let i = 1; i < progression?.length; i++) {
      const current = progression?.[i];
      const previous = progression?.[i - 1];
      
      const velocityChange = Math.abs((current?.learningVelocity || 0) - (previous?.learningVelocity || 0));
      const qualityImprovement = (current?.qualityScore || 0) - (previous?.qualityScore || 0);
      const consolidationImprovement = (current?.consolidationRate || 0) - (previous?.consolidationRate || 0);
      
      adaptationSum += (velocityChange + qualityImprovement + consolidationImprovement) / 3;
    }
    
    return adaptationSum / (progression?.length - 1);
  };

  const calculateLearningEfficiency = (progression) => {
    if (progression?.length === 0) return 0;
    
    const latest = progression?.[progression?.length - 1];
    const efficiency = (latest?.validatedConcepts || 0) / Math.max(latest?.totalConcepts || 1, 1);
    
    return efficiency;
  };

  const calculateCognitiveGrowth = (progression) => {
    if (progression?.length < 2) return 0;
    
    const first = progression?.[0];
    const latest = progression?.[progression?.length - 1];
    
    const conceptGrowth = ((latest?.totalConcepts || 0) - (first?.totalConcepts || 0)) / Math.max(first?.totalConcepts || 1, 1);
    const qualityGrowth = (latest?.qualityScore || 0) - (first?.qualityScore || 0);
    const insightGrowth = ((latest?.crossDomainInsights || 0) - (first?.crossDomainInsights || 0)) / Math.max(first?.crossDomainInsights || 1, 1);
    
    return (conceptGrowth + qualityGrowth + insightGrowth) / 3;
  };

  const calculateMastery = (capability) => {
    const conceptWeight = 0.3;
    const trustWeight = 0.4;
    const applicationWeight = 0.3;
    
    const conceptScore = Math.min(capability?.conceptCount / 50, 1); // Normalized to 50 concepts max
    const trustScore = capability?.avgTrust;
    const applicationScore = Math.min(capability?.applications / 20, 1); // Normalized to 20 applications max
    
    return (conceptScore * conceptWeight + trustScore * trustWeight + applicationScore * applicationWeight);
  };

  const getDomainColor = (domain) => {
    const colors = {
      'math': 'text-blue-400',
      'physics': 'text-purple-400',
      'finance': 'text-green-400',
      'trading': 'text-yellow-400',
      'ifrs': 'text-orange-400',
      'ai': 'text-cyan-400'
    };
    return colors?.[domain] || 'text-slate-400';
  };

  const getMasteryLevel = (mastery) => {
    if (mastery >= 0.8) return { level: 'Expert', color: 'text-green-400' };
    if (mastery >= 0.6) return { level: 'Advanced', color: 'text-blue-400' };
    if (mastery >= 0.4) return { level: 'Intermediate', color: 'text-yellow-400' };
    if (mastery >= 0.2) return { level: 'Beginner', color: 'text-orange-400' };
    return { level: 'Novice', color: 'text-red-400' };
  };

  return (
    <div className="space-y-6">
      {/* Learning Engine Status */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Adaptive Learning Engine</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Active Learning</span>
          </div>
        </div>

        {/* Key Learning Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-slate-400">VELOCITY</span>
            </div>
            <p className="text-2xl font-bold text-white">{learningMetrics?.currentLearningVelocity?.toFixed(1)}</p>
            <p className="text-sm text-slate-300">concepts/day</p>
            <div className={`text-xs mt-1 ${learningMetrics?.velocityChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {learningMetrics?.velocityChange >= 0 ? '+' : ''}{learningMetrics?.velocityChange?.toFixed(1)}%
            </div>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-slate-400">CONSOLIDATION</span>
            </div>
            <p className="text-2xl font-bold text-white">{(learningMetrics?.memoryConsolidation * 100)?.toFixed(1)}%</p>
            <p className="text-sm text-slate-300">memory retention</p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-xs text-slate-400">QUALITY</span>
            </div>
            <p className="text-2xl font-bold text-white">{(learningMetrics?.knowledgeQuality * 100)?.toFixed(1)}%</p>
            <p className="text-sm text-slate-300">knowledge accuracy</p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Lightbulb className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-slate-400">ADAPTATION</span>
            </div>
            <p className="text-2xl font-bold text-white">{(learningMetrics?.adaptationIndex * 100)?.toFixed(1)}%</p>
            <p className="text-sm text-slate-300">adaptation index</p>
          </div>
        </div>
      </div>
      {/* Learning Progression Chart */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Learning Progression Timeline</h3>
        </div>

        <div className="space-y-4">
          {learningProgression?.slice(-10)?.map((point, index) => (
            <div key={point?.date || index} className="flex items-center space-x-4">
              <div className="w-24 text-sm text-slate-400">
                {point?.date ? new Date(point.date)?.toLocaleDateString() : 'Unknown'}
              </div>
              
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Concepts</span>
                    <span className="text-white">{point?.totalConcepts}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-blue-400"
                      style={{ width: `${Math.min((point?.totalConcepts || 0) / 100 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Velocity</span>
                    <span className="text-white">{point?.learningVelocity?.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-yellow-400"
                      style={{ width: `${Math.min((point?.learningVelocity || 0) / 10 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Quality</span>
                    <span className="text-white">{(point?.qualityScore * 100)?.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-green-400"
                      style={{ width: `${(point?.qualityScore || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Insights</span>
                    <span className="text-white">{point?.crossDomainInsights}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-purple-400"
                      style={{ width: `${Math.min((point?.crossDomainInsights || 0) / 5 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Capability Expansion */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Cognitive Capability Expansion</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(currentCapabilities)?.map(([domain, capability]) => {
            const masteryInfo = getMasteryLevel(capability?.mastery || 0);
            
            return (
              <div key={domain} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-semibold capitalize ${getDomainColor(domain)}`}>
                    {domain}
                  </h4>
                  <span className={`text-sm font-medium ${masteryInfo?.color}`}>
                    {masteryInfo?.level}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Concepts</span>
                    <span className="text-white">{capability?.conceptCount}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Trust Score</span>
                    <span className="text-white">{((capability?.avgTrust || 0) * 100)?.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Applications</span>
                    <span className="text-white">{capability?.applications}</span>
                  </div>
                  
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        masteryInfo?.level === 'Expert' ? 'from-green-500 to-green-400' :
                        masteryInfo?.level === 'Advanced' ? 'from-blue-500 to-blue-400' :
                        masteryInfo?.level === 'Intermediate' ? 'from-yellow-500 to-yellow-400' :
                        masteryInfo?.level === 'Beginner'? 'from-orange-500 to-orange-400' : 'from-red-500 to-red-400'
                      }`}
                      style={{ width: `${(capability?.mastery || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Adaptive Settings */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Self-Modifying Learning Parameters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(adaptiveSettings)?.map(([setting, value]) => (
            <div key={setting} className="space-y-2">
              <div className="flex justify-between">
                <label className="text-slate-300 capitalize">
                  {setting?.replace(/([A-Z])/g, ' $1')?.trim()}
                </label>
                <span className="text-white font-medium">{value?.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => setAdaptiveSettings(prev => ({
                  ...prev,
                  [setting]: parseFloat(e?.target?.value)
                }))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-slate-500">
                {setting === 'learningRate' && 'Speed of knowledge acquisition'}
                {setting === 'memoryDecay' && 'Rate of forgetting unused concepts'}
                {setting === 'adaptationThreshold' && 'Confidence required for adaptation'}
                {setting === 'explorationRate' && 'Balance between exploration and exploitation'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLearningEngine;