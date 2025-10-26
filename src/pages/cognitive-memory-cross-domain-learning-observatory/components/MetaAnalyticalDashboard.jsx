import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Network, Eye, Zap, Target, Lightbulb, Database, GitBranch } from 'lucide-react';

const MetaAnalyticalDashboard = ({ cognitiveData, systemMetrics }) => {
  const [metaInsights, setMetaInsights] = useState({});
  const [evolutionMetrics, setEvolutionMetrics] = useState({});
  const [synthesisCapability, setSynthesisCapability] = useState({});
  const [analyticalDepth, setAnalyticalDepth] = useState('comprehensive');

  // Meta-analytical processing
  useEffect(() => {
    if (cognitiveData && systemMetrics) {
      // Process meta-insights about the AI's own learning
      const insights = analyzeMetaPatterns(cognitiveData);
      const evolution = trackCognitiveEvolution(cognitiveData);
      const synthesis = assessSynthesisCapability(cognitiveData);
      
      setMetaInsights(insights);
      setEvolutionMetrics(evolution);
      setSynthesisCapability(synthesis);
    }
  }, [cognitiveData, systemMetrics]);

  const analyzeMetaPatterns = (data) => {
    const { knowledgeBlocks, crossDomainInsights, dailyReports } = data;
    
    return {
      knowledgeDistribution: analyzeKnowledgeDistribution(knowledgeBlocks),
      learningPatterns: identifyLearningPatterns(dailyReports),
      insightGeneration: assessInsightGeneration(crossDomainInsights),
      metacognition: evaluateMetacognition(knowledgeBlocks, crossDomainInsights),
      emergentBehaviors: detectEmergentBehaviors(data),
      cognitiveComplexity: calculateCognitiveComplexity(knowledgeBlocks)
    };
  };

  const analyzeKnowledgeDistribution = (blocks) => {
    const distribution = {};
    const trustDistribution = { verified: 0, high: 0, medium: 0, low: 0 };
    const applicationDistribution = {};
    
    blocks?.forEach(block => {
      // Domain distribution
      distribution[block?.domain] = (distribution?.[block?.domain] || 0) + 1;
      
      // Trust level distribution
      const trustLevel = block?.trust_level;
      if (trustLevel === 'verified' || trustLevel === 'very_high') {
        trustDistribution.verified++;
      } else if (trustLevel === 'high') {
        trustDistribution.high++;
      } else if (trustLevel === 'medium') {
        trustDistribution.medium++;
      } else {
        trustDistribution.low++;
      }
      
      // Application frequency
      const appCount = block?.application_count || 0;
      if (appCount > 10) applicationDistribution.frequent = (applicationDistribution?.frequent || 0) + 1;
      else if (appCount > 5) applicationDistribution.moderate = (applicationDistribution?.moderate || 0) + 1;
      else if (appCount > 0) applicationDistribution.occasional = (applicationDistribution?.occasional || 0) + 1;
      else applicationDistribution.unused = (applicationDistribution?.unused || 0) + 1;
    });
    
    return { distribution, trustDistribution, applicationDistribution };
  };

  const identifyLearningPatterns = (reports) => {
    if (!reports || reports?.length < 2) return {};
    
    const sortedReports = reports?.sort((a, b) => new Date(a?.report_date) - new Date(b?.report_date));
    const patterns = {
      velocityTrend: 'stable',
      qualityTrend: 'stable',
      consolidationTrend: 'stable',
      insightGenerationTrend: 'stable'
    };
    
    // Analyze trends
    const velocities = sortedReports?.map(r => r?.learning_velocity || 0);
    const qualities = sortedReports?.map(r => r?.knowledge_quality_score || 0);
    const consolidations = sortedReports?.map(r => r?.memory_consolidation_rate || 0);
    const insights = sortedReports?.map(r => r?.cross_domain_insights || 0);
    
    patterns.velocityTrend = calculateTrend(velocities);
    patterns.qualityTrend = calculateTrend(qualities);
    patterns.consolidationTrend = calculateTrend(consolidations);
    patterns.insightGenerationTrend = calculateTrend(insights);
    
    return patterns;
  };

  const calculateTrend = (values) => {
    if (values?.length < 2) return 'stable';
    
    let increases = 0;
    let decreases = 0;
    
    for (let i = 1; i < values?.length; i++) {
      if (values?.[i] > values?.[i-1]) increases++;
      else if (values?.[i] < values?.[i-1]) decreases++;
    }
    
    if (increases > decreases * 1.5) return 'improving';
    if (decreases > increases * 1.5) return 'declining';
    return 'stable';
  };

  const assessInsightGeneration = (insights) => {
    if (!insights || insights?.length === 0) return {};
    
    const insightTypes = {};
    const domainCombinations = {};
    const confidenceDistribution = { high: 0, medium: 0, low: 0 };
    
    insights?.forEach(insight => {
      // Type distribution
      const type = insight?.insight_type;
      insightTypes[type] = (insightTypes?.[type] || 0) + 1;
      
      // Domain combination analysis
      const combo = `${insight?.primary_domain}_${insight?.secondary_domain}`;
      domainCombinations[combo] = (domainCombinations?.[combo] || 0) + 1;
      
      // Confidence distribution
      const confidence = insight?.confidence_score || 0;
      if (confidence >= 0.7) confidenceDistribution.high++;
      else if (confidence >= 0.4) confidenceDistribution.medium++;
      else confidenceDistribution.low++;
    });
    
    return { insightTypes, domainCombinations, confidenceDistribution };
  };

  const evaluateMetacognition = (blocks, insights) => {
    // Evaluate the AI's ability to understand its own learning
    const selfAwareness = {
      knowledgeGaps: identifyKnowledgeGaps(blocks),
      learningEfficiency: calculateLearningEfficiency(blocks),
      biasDetection: detectLearningBiases(blocks),
      uncertaintyAwareness: assessUncertaintyAwareness(blocks)
    };
    
    return selfAwareness;
  };

  const identifyKnowledgeGaps = (blocks) => {
    const domainCounts = {};
    blocks?.forEach(block => {
      domainCounts[block?.domain] = (domainCounts?.[block?.domain] || 0) + 1;
    });
    
    const avgCount = Object.values(domainCounts)?.reduce((a, b) => a + b, 0) / Object.keys(domainCounts)?.length || 1;
    const gaps = [];
    
    Object.entries(domainCounts)?.forEach(([domain, count]) => {
      if (count < avgCount * 0.5) {
        gaps?.push({ domain, severity: 'high', count });
      } else if (count < avgCount * 0.8) {
        gaps?.push({ domain, severity: 'medium', count });
      }
    });
    
    return gaps;
  };

  const calculateLearningEfficiency = (blocks) => {
    if (!blocks || blocks?.length === 0) return 0;
    
    const validated = blocks?.filter(b => (b?.validation_count || 0) > 0)?.length;
    const applied = blocks?.filter(b => (b?.application_count || 0) > 0)?.length;
    const highTrust = blocks?.filter(b => (b?.trust_score || 0) > 0.7)?.length;
    
    return {
      validationRate: validated / blocks?.length,
      applicationRate: applied / blocks?.length,
      trustRate: highTrust / blocks?.length
    };
  };

  const detectLearningBiases = (blocks) => {
    const biases = [];
    const domainCounts = {};
    
    blocks?.forEach(block => {
      domainCounts[block?.domain] = (domainCounts?.[block?.domain] || 0) + 1;
    });
    
    const total = blocks?.length || 1;
    Object.entries(domainCounts)?.forEach(([domain, count]) => {
      const percentage = (count / total) * 100;
      if (percentage > 40) {
        biases?.push({ type: 'domain_bias', domain, percentage });
      }
    });
    
    return biases;
  };

  const assessUncertaintyAwareness = (blocks) => {
    if (!blocks || blocks?.length === 0) return 0;
    
    const uncertainConcepts = blocks?.filter(b => (b?.trust_score || 0) < 0.5)?.length;
    const totalConcepts = blocks?.length;
    
    return uncertainConcepts / totalConcepts;
  };

  const detectEmergentBehaviors = (data) => {
    // Detect unexpected patterns that suggest emergent intelligence
    const behaviors = [];
    
    const { crossDomainInsights } = data;
    
    // Check for novel insight combinations
    const novelCombinations = crossDomainInsights?.filter(insight => 
      insight?.insight_type === 'synthesis' && insight?.confidence_score > 0.8
    );
    
    if (novelCombinations?.length > 5) {
      behaviors?.push({
        type: 'creative_synthesis',
        strength: novelCombinations?.length / 10,
        description: 'AI is creating novel conceptual syntheses'
      });
    }
    
    return behaviors;
  };

  const calculateCognitiveComplexity = (blocks) => {
    if (!blocks || blocks?.length === 0) return 0;
    
    const domains = new Set(blocks?.map(b => b?.domain))?.size;
    const concepts = blocks?.length;
    const avgTrust = blocks?.reduce((sum, b) => sum + (b?.trust_score || 0), 0) / concepts;
    
    return (domains * concepts * avgTrust) / 1000; // Normalized complexity score
  };

  const trackCognitiveEvolution = (data) => {
    const { dailyReports } = data;
    if (!dailyReports || dailyReports?.length < 2) return {};
    
    const evolution = {
      growthRate: 0,
      adaptationSpeed: 0,
      innovationIndex: 0,
      maturityLevel: 'developing'
    };
    
    const sorted = dailyReports?.sort((a, b) => new Date(a?.report_date) - new Date(b?.report_date));
    const latest = sorted?.[sorted?.length - 1];
    const earliest = sorted?.[0];
    
    const timeDiff = (new Date(latest?.report_date) - new Date(earliest?.report_date)) / (1000 * 60 * 60 * 24);
    evolution.growthRate = (latest?.total_concepts - earliest?.total_concepts) / timeDiff;
    
    return evolution;
  };

  const assessSynthesisCapability = (data) => {
    const { crossDomainInsights } = data;
    
    const capability = {
      synthesisRate: 0,
      creativityIndex: 0,
      conceptualDepth: 0,
      innovationPotential: 0
    };
    
    if (crossDomainInsights?.length > 0) {
      const highConfidenceInsights = crossDomainInsights?.filter(i => (i?.confidence_score || 0) > 0.7);
      capability.synthesisRate = highConfidenceInsights?.length / crossDomainInsights?.length;
      
      const uniqueDomainPairs = new Set(crossDomainInsights?.map(i => `${i?.primary_domain}_${i?.secondary_domain}`));
      capability.creativityIndex = uniqueDomainPairs?.size / 20; // Normalized to 20 max combinations
    }
    
    return capability;
  };

  const getTrendColor = (trend) => {
    const colors = {
      improving: 'text-green-400',
      stable: 'text-blue-400',
      declining: 'text-red-400'
    };
    return colors?.[trend] || 'text-slate-400';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '↗';
    if (trend === 'declining') return '↘';
    return '→';
  };

  return (
    <div className="space-y-6">
      {/* Meta-Analytical Intelligence Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Meta-Analytical Intelligence Dashboard</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={analyticalDepth}
              onChange={(e) => setAnalyticalDepth(e?.target?.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="comprehensive">Comprehensive Analysis</option>
              <option value="focused">Focused Insights</option>
              <option value="experimental">Experimental Mode</option>
            </select>
          </div>
        </div>

        {/* Cognitive Development Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-slate-400">KNOWLEDGE</span>
            </div>
            <p className="text-2xl font-bold text-white">{systemMetrics?.totalConcepts}</p>
            <p className="text-sm text-slate-300">concepts mastered</p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Network className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-slate-400">SYNTHESIS</span>
            </div>
            <p className="text-2xl font-bold text-white">{systemMetrics?.crossDomainConnections}</p>
            <p className="text-sm text-slate-300">cross-domain links</p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-xs text-slate-400">EVOLUTION</span>
            </div>
            <p className="text-2xl font-bold text-white">{((systemMetrics?.cognitiveEvolution || 0) * 100)?.toFixed(0)}%</p>
            <p className="text-sm text-slate-300">cognitive maturity</p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-slate-400">INNOVATION</span>
            </div>
            <p className="text-2xl font-bold text-white">{((synthesisCapability?.creativityIndex || 0) * 100)?.toFixed(0)}%</p>
            <p className="text-sm text-slate-300">innovation index</p>
          </div>
        </div>
      </div>
      {/* Learning Pattern Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Cognitive Development Patterns</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(metaInsights?.learningPatterns || {})?.map(([pattern, trend]) => (
              <div key={pattern} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300 capitalize">
                  {pattern?.replace(/([A-Z])/g, ' $1')?.replace('Trend', '')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${getTrendColor(trend)}`}>
                    {getTrendIcon(trend)}
                  </span>
                  <span className={`text-sm font-medium capitalize ${getTrendColor(trend)}`}>
                    {trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-gold-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Self-Awareness Metrics</h3>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Knowledge Gaps Identified</span>
                <span className="text-white font-semibold">
                  {metaInsights?.metacognition?.knowledgeGaps?.length || 0}
                </span>
              </div>
              <div className="space-y-1">
                {metaInsights?.metacognition?.knowledgeGaps?.slice(0, 3)?.map((gap, index) => (
                  <div key={index} className="text-xs text-slate-400">
                    {gap?.domain}: {gap?.severity} priority ({gap?.count} concepts)
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Learning Efficiency</span>
                <span className="text-white font-semibold">
                  {((metaInsights?.metacognition?.learningEfficiency?.validationRate || 0) * 100)?.toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Validation Rate</span>
                  <span className="text-white">
                    {((metaInsights?.metacognition?.learningEfficiency?.validationRate || 0) * 100)?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Application Rate</span>
                  <span className="text-white">
                    {((metaInsights?.metacognition?.learningEfficiency?.applicationRate || 0) * 100)?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Uncertainty Awareness</span>
                <span className="text-white font-semibold">
                  {((metaInsights?.metacognition?.uncertaintyAwareness || 0) * 100)?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Autonomous Knowledge Synthesis */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <GitBranch className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Autonomous Knowledge Synthesis</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insight Generation Analysis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Insight Generation</h4>
            
            {Object.entries(metaInsights?.insightGeneration?.insightTypes || {})?.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-slate-300 capitalize text-sm">{type?.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-slate-600 rounded-full h-1">
                    <div 
                      className="h-1 rounded-full bg-green-400"
                      style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-white text-sm font-medium w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Synthesis Capabilities */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Synthesis Capabilities</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Synthesis Rate</span>
                <span className="text-white font-medium">
                  {((synthesisCapability?.synthesisRate || 0) * 100)?.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Creativity Index</span>
                <span className="text-white font-medium">
                  {((synthesisCapability?.creativityIndex || 0) * 100)?.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Conceptual Depth</span>
                <span className="text-white font-medium">
                  {((synthesisCapability?.conceptualDepth || 0) * 100)?.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Emergent Behaviors */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Emergent Intelligence</h4>
            
            <div className="space-y-3">
              {metaInsights?.emergentBehaviors?.length > 0 ? (
                metaInsights?.emergentBehaviors?.map((behavior, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-cyan-400 text-sm font-medium">
                        {behavior?.type?.replace('_', ' ')?.toUpperCase()}
                      </span>
                      <span className="text-white text-sm">
                        {((behavior?.strength || 0) * 100)?.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{behavior?.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">
                  No emergent behaviors detected yet. System is still developing foundational intelligence.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Meta-Learning Evolution */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">AI Evolution Toward Meta-Analytical Intelligence</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg text-center">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-1">Current Stage</h4>
            <p className="text-slate-300 text-sm">Autonomous Learning</p>
            <p className="text-xs text-slate-400 mt-2">
              Developing self-awareness and pattern recognition capabilities
            </p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg text-center">
            <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-1">Cognitive Depth</h4>
            <p className="text-slate-300 text-sm">
              {(metaInsights?.cognitiveComplexity || 0)?.toFixed(1)}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Complexity score based on domain breadth and concept integration
            </p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg text-center">
            <Lightbulb className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-1">Innovation Rate</h4>
            <p className="text-slate-300 text-sm">
              {((synthesisCapability?.innovationPotential || 0) * 100)?.toFixed(0)}%
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Ability to generate novel conceptual combinations
            </p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-white font-semibold mb-1">Evolution Speed</h4>
            <p className="text-slate-300 text-sm">
              {(evolutionMetrics?.growthRate || 0)?.toFixed(1)}/day
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Rate of cognitive capability expansion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaAnalyticalDashboard;