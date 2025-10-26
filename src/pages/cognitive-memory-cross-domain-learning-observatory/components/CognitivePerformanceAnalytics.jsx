import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Zap, Brain, Download, Award, Activity } from 'lucide-react';

const CognitivePerformanceAnalytics = ({ reports, systemMetrics }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [trendAnalysis, setTrendAnalysis] = useState({});
  const [optimizationRecommendations, setOptimizationRecommendations] = useState([]);
  const [timeframe, setTimeframe] = useState('30d');
  const [metricFocus, setMetricFocus] = useState('comprehensive');

  // Calculate performance analytics
  useEffect(() => {
    if (reports?.length > 0) {
      const metrics = calculatePerformanceMetrics(reports, timeframe);
      const trends = analyzeTrends(reports, timeframe);
      const recommendations = generateOptimizationRecommendations(metrics, trends);
      
      setPerformanceMetrics(metrics);
      setTrendAnalysis(trends);
      setOptimizationRecommendations(recommendations);
    }
  }, [reports, timeframe, systemMetrics]);

  const calculatePerformanceMetrics = (reports, period) => {
    const filteredReports = filterReportsByTimeframe(reports, period);
    if (filteredReports?.length === 0) return {};
    
    const latest = filteredReports?.[0];
    const earliest = filteredReports?.[filteredReports?.length - 1];
    const timeSpan = (new Date(latest?.report_date) - new Date(earliest?.report_date)) / (1000 * 60 * 60 * 24) || 1;
    
    return {
      learningEfficiency: {
        current: latest?.learning_velocity || 0,
        average: filteredReports?.reduce((sum, r) => sum + (r?.learning_velocity || 0), 0) / filteredReports?.length,
        peak: Math.max(...filteredReports?.map(r => r?.learning_velocity || 0)),
        trend: calculateTrendDirection(filteredReports?.map(r => r?.learning_velocity || 0))
      },
      knowledgeRetention: {
        current: latest?.memory_consolidation_rate || 0,
        average: filteredReports?.reduce((sum, r) => sum + (r?.memory_consolidation_rate || 0), 0) / filteredReports?.length,
        improvement: latest && earliest ? (latest?.memory_consolidation_rate - earliest?.memory_consolidation_rate) : 0,
        stability: calculateStability(filteredReports?.map(r => r?.memory_consolidation_rate || 0))
      },
      crossDomainSuccess: {
        current: latest?.cross_domain_insights || 0,
        totalGenerated: filteredReports?.reduce((sum, r) => sum + (r?.cross_domain_insights || 0), 0),
        dailyAverage: filteredReports?.reduce((sum, r) => sum + (r?.cross_domain_insights || 0), 0) / timeSpan,
        acceleration: calculateAcceleration(filteredReports?.map(r => r?.cross_domain_insights || 0))
      },
      qualityMetrics: {
        current: latest?.knowledge_quality_score || 0,
        average: filteredReports?.reduce((sum, r) => sum + (r?.knowledge_quality_score || 0), 0) / filteredReports?.length,
        consistency: calculateConsistency(filteredReports?.map(r => r?.knowledge_quality_score || 0)),
        improvement: latest && earliest ? (latest?.knowledge_quality_score - earliest?.knowledge_quality_score) : 0
      },
      cognitiveLoad: {
        conceptsPerDay: (latest?.total_concepts - earliest?.total_concepts) / timeSpan,
        processingEfficiency: latest?.validated_concepts / Math.max(latest?.new_concepts || 1, 1),
        memoryUtilization: latest?.total_concepts / Math.max(latest?.total_concepts + (latest?.new_concepts || 0), 1),
        adaptiveCapacity: calculateAdaptiveCapacity(filteredReports)
      }
    };
  };

  const filterReportsByTimeframe = (reports, timeframe) => {
    const days = parseInt(timeframe?.replace('d', '')) || 30;
    const cutoffDate = new Date();
    cutoffDate?.setDate(cutoffDate?.getDate() - days);
    
    return reports
      ?.filter(report => new Date(report?.report_date) >= cutoffDate)
      ?.sort((a, b) => new Date(b?.report_date) - new Date(a?.report_date));
  };

  const calculateTrendDirection = (values) => {
    if (values?.length < 2) return 'stable';
    
    let upward = 0;
    let downward = 0;
    
    for (let i = 1; i < values?.length; i++) {
      if (values?.[i] > values?.[i-1]) upward++;
      else if (values?.[i] < values?.[i-1]) downward++;
    }
    
    if (upward > downward * 1.2) return 'increasing';
    if (downward > upward * 1.2) return 'decreasing';
    return 'stable';
  };

  const calculateStability = (values) => {
    if (values?.length === 0) return 0;
    
    const mean = values?.reduce((sum, val) => sum + val, 0) / values?.length;
    const variance = values?.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values?.length;
    
    return 1 - Math.min(Math.sqrt(variance), 1); // Normalize to 0-1 scale
  };

  const calculateAcceleration = (values) => {
    if (values?.length < 3) return 0;
    
    const recent = values?.slice(0, Math.floor(values?.length / 2));
    const earlier = values?.slice(Math.floor(values?.length / 2));
    
    const recentAvg = recent?.reduce((sum, val) => sum + val, 0) / recent?.length;
    const earlierAvg = earlier?.reduce((sum, val) => sum + val, 0) / earlier?.length;
    
    return (recentAvg - earlierAvg) / Math.max(earlierAvg, 1);
  };

  const calculateConsistency = (values) => {
    if (values?.length === 0) return 0;
    
    const mean = values?.reduce((sum, val) => sum + val, 0) / values?.length;
    const deviations = values?.map(val => Math.abs(val - mean));
    const avgDeviation = deviations?.reduce((sum, dev) => sum + dev, 0) / deviations?.length;
    
    return Math.max(0, 1 - (avgDeviation / mean)); // Higher consistency = lower relative deviation
  };

  const calculateAdaptiveCapacity = (reports) => {
    if (reports?.length < 2) return 0;
    
    // Measure how quickly the system adapts to new domains and concepts
    const adaptationSpeed = reports?.slice(1)?.map((report, index) => {
      const prevReport = reports?.[index];
      const newConceptsRatio = (report?.new_concepts || 0) / Math.max(report?.total_concepts || 1, 1);
      const qualityMaintenance = Math.abs((report?.knowledge_quality_score || 0) - (prevReport?.knowledge_quality_score || 0));
      
      return newConceptsRatio * (1 - qualityMaintenance); // High adaptation with maintained quality
    });
    
    return adaptationSpeed?.reduce((sum, speed) => sum + speed, 0) / adaptationSpeed?.length;
  };

  const analyzeTrends = (reports, period) => {
    const filteredReports = filterReportsByTimeframe(reports, period);
    if (filteredReports?.length < 3) return {};
    
    return {
      overallTrajectory: determineOverallTrajectory(filteredReports),
      growthPhases: identifyGrowthPhases(filteredReports),
      performancePatterns: identifyPerformancePatterns(filteredReports),
      cyclicalBehavior: detectCyclicalBehavior(filteredReports),
      anomalies: detectPerformanceAnomalies(filteredReports)
    };
  };

  const determineOverallTrajectory = (reports) => {
    const trajectoryMetrics = ['learning_velocity', 'knowledge_quality_score', 'memory_consolidation_rate'];
    const trajectories = {};
    
    trajectoryMetrics?.forEach(metric => {
      const values = reports?.map(r => r?.[metric] || 0);
      trajectories[metric] = calculateTrendDirection(values);
    });
    
    const positive = Object.values(trajectories)?.filter(t => t === 'increasing')?.length;
    const negative = Object.values(trajectories)?.filter(t => t === 'decreasing')?.length;
    
    if (positive > negative) return 'accelerating';
    if (negative > positive) return 'decelerating';
    return 'stable';
  };

  const identifyGrowthPhases = (reports) => {
    const phases = [];
    let currentPhase = { start: 0, type: 'unknown', metrics: {} };
    
    for (let i = 1; i < reports?.length; i++) {
      const curr = reports?.[i];
      const prev = reports?.[i-1];
      
      const velocityChange = (curr?.learning_velocity || 0) - (prev?.learning_velocity || 0);
      const qualityChange = (curr?.knowledge_quality_score || 0) - (prev?.knowledge_quality_score || 0);
      
      let phaseType = 'stable';
      if (velocityChange > 0.1 && qualityChange > 0.05) phaseType = 'rapid_growth';
      else if (velocityChange > 0.05) phaseType = 'expansion';
      else if (qualityChange > 0.1) phaseType = 'optimization';
      else if (velocityChange < -0.1) phaseType = 'slowdown';
      
      if (phaseType !== currentPhase?.type) {
        if (currentPhase?.type !== 'unknown') phases?.push(currentPhase);
        currentPhase = { start: i, type: phaseType, duration: 1 };
      } else {
        currentPhase.duration++;
      }
    }
    
    if (currentPhase?.type !== 'unknown') phases?.push(currentPhase);
    return phases;
  };

  const identifyPerformancePatterns = (reports) => {
    return {
      weeklyPatterns: 'Not enough data', // Would need day-of-week data
      velocityPatterns: analyzeVelocityPatterns(reports),
      qualityPatterns: analyzeQualityPatterns(reports),
      insightPatterns: analyzeInsightPatterns(reports)
    };
  };

  const analyzeVelocityPatterns = (reports) => {
    const velocities = reports?.map(r => r?.learning_velocity || 0);
    const high = velocities?.filter(v => v > 5)?.length;
    const medium = velocities?.filter(v => v >= 2 && v <= 5)?.length;
    const low = velocities?.filter(v => v < 2)?.length;
    
    if (high > medium + low) return 'consistently_high';
    if (low > high + medium) return 'consistently_low';
    return 'variable';
  };

  const analyzeQualityPatterns = (reports) => {
    const qualities = reports?.map(r => r?.knowledge_quality_score || 0);
    const stability = calculateStability(qualities);
    
    if (stability > 0.8) return 'highly_stable';
    if (stability > 0.6) return 'stable';
    return 'variable';
  };

  const analyzeInsightPatterns = (reports) => {
    const insights = reports?.map(r => r?.cross_domain_insights || 0);
    const acceleration = calculateAcceleration(insights);
    
    if (acceleration > 0.2) return 'accelerating';
    if (acceleration < -0.2) return 'decelerating';
    return 'steady';
  };

  const detectCyclicalBehavior = (reports) => {
    // Simple cyclical detection - would need more sophisticated analysis in production
    return {
      detected: false,
      period: null,
      confidence: 0
    };
  };

  const detectPerformanceAnomalies = (reports) => {
    const anomalies = [];
    
    reports?.forEach((report, index) => {
      if (index === 0) return;
      
      const prev = reports?.[index - 1];
      const velocityDrop = (prev?.learning_velocity || 0) - (report?.learning_velocity || 0);
      const qualityDrop = (prev?.knowledge_quality_score || 0) - (report?.knowledge_quality_score || 0);
      
      if (velocityDrop > 2) {
        anomalies?.push({
          date: report?.report_date,
          type: 'velocity_drop',
          severity: velocityDrop > 5 ? 'high' : 'medium',
          description: `Learning velocity dropped by ${velocityDrop?.toFixed(1)} concepts/day`
        });
      }
      
      if (qualityDrop > 0.2) {
        anomalies?.push({
          date: report?.report_date,
          type: 'quality_drop',
          severity: qualityDrop > 0.3 ? 'high' : 'medium',
          description: `Knowledge quality dropped by ${(qualityDrop * 100)?.toFixed(1)}%`
        });
      }
    });
    
    return anomalies;
  };

  const generateOptimizationRecommendations = (metrics, trends) => {
    const recommendations = [];
    
    // Learning efficiency recommendations
    if (metrics?.learningEfficiency?.trend === 'decreasing') {
      recommendations?.push({
        priority: 'high',
        category: 'learning_efficiency',
        title: 'Optimize Learning Rate',
        description: 'Learning velocity is declining. Consider adjusting learning parameters or introducing new knowledge sources.',
        impact: 'high',
        effort: 'medium'
      });
    }
    
    // Knowledge retention recommendations
    if (metrics?.knowledgeRetention?.current < 0.6) {
      recommendations?.push({
        priority: 'medium',
        category: 'memory',
        title: 'Improve Memory Consolidation',
        description: 'Memory consolidation rate is below optimal. Implement spaced repetition or concept reinforcement strategies.',
        impact: 'medium',
        effort: 'low'
      });
    }
    
    // Cross-domain success recommendations
    if (metrics?.crossDomainSuccess?.acceleration < 0) {
      recommendations?.push({
        priority: 'high',
        category: 'synthesis',
        title: 'Enhance Cross-Domain Learning',
        description: 'Cross-domain insight generation is slowing. Introduce more diverse knowledge sources and connection patterns.',
        impact: 'high',
        effort: 'high'
      });
    }
    
    // Quality consistency recommendations
    if (metrics?.qualityMetrics?.consistency < 0.7) {
      recommendations?.push({
        priority: 'medium',
        category: 'quality',
        title: 'Stabilize Knowledge Quality',
        description: 'Knowledge quality shows high variability. Implement better validation mechanisms and source verification.',
        impact: 'medium',
        effort: 'medium'
      });
    }
    
    return recommendations?.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder?.[b?.priority] - priorityOrder?.[a?.priority];
    });
  };

  const getTrendColor = (trend) => {
    const colors = {
      increasing: 'text-green-400',
      stable: 'text-blue-400',
      decreasing: 'text-red-400',
      accelerating: 'text-green-400',
      decelerating: 'text-red-400'
    };
    return colors?.[trend] || 'text-slate-400';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-400 bg-red-400/10 border-red-400/20',
      medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      low: 'text-green-400 bg-green-400/10 border-green-400/20'
    };
    return colors?.[priority] || 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  const exportAnalytics = () => {
    const data = {
      timestamp: new Date()?.toISOString(),
      timeframe,
      performanceMetrics,
      trendAnalysis,
      recommendations: optimizationRecommendations
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitive-performance-analytics-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Performance Analytics Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Cognitive Performance Analytics</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e?.target?.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="365d">Last Year</option>
            </select>
            
            <button
              onClick={exportAnalytics}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className={`text-sm ${getTrendColor(performanceMetrics?.learningEfficiency?.trend)}`}>
                {performanceMetrics?.learningEfficiency?.trend === 'increasing' ? '↗' : 
                 performanceMetrics?.learningEfficiency?.trend === 'decreasing' ? '↘' : '→'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {performanceMetrics?.learningEfficiency?.current?.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-slate-300">concepts/day</p>
            <p className="text-xs text-slate-400 mt-1">
              Peak: {performanceMetrics?.learningEfficiency?.peak?.toFixed(1) || '0.0'}
            </p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-blue-400">
                {((performanceMetrics?.knowledgeRetention?.stability || 0) * 100)?.toFixed(0)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {((performanceMetrics?.knowledgeRetention?.current || 0) * 100)?.toFixed(1)}%
            </p>
            <p className="text-sm text-slate-300">retention rate</p>
            <p className="text-xs text-slate-400 mt-1">
              Improvement: {((performanceMetrics?.knowledgeRetention?.improvement || 0) * 100)?.toFixed(1)}%
            </p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className={`text-sm ${
                (performanceMetrics?.crossDomainSuccess?.acceleration || 0) > 0 ? 'text-green-400' : 
                (performanceMetrics?.crossDomainSuccess?.acceleration || 0) < 0 ? 'text-red-400' : 'text-blue-400'
              }`}>
                {(performanceMetrics?.crossDomainSuccess?.acceleration || 0) > 0 ? '↗' : 
                 (performanceMetrics?.crossDomainSuccess?.acceleration || 0) < 0 ? '↘' : '→'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {performanceMetrics?.crossDomainSuccess?.dailyAverage?.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-slate-300">insights/day</p>
            <p className="text-xs text-slate-400 mt-1">
              Total: {performanceMetrics?.crossDomainSuccess?.totalGenerated || 0}
            </p>
          </div>

          <div className="p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-blue-400">
                {((performanceMetrics?.qualityMetrics?.consistency || 0) * 100)?.toFixed(0)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {((performanceMetrics?.qualityMetrics?.current || 0) * 100)?.toFixed(1)}%
            </p>
            <p className="text-sm text-slate-300">quality score</p>
            <p className="text-xs text-slate-400 mt-1">
              Avg: {((performanceMetrics?.qualityMetrics?.average || 0) * 100)?.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Learning Trajectory Analysis</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Overall Trajectory</span>
                <span className={`font-medium ${getTrendColor(trendAnalysis?.overallTrajectory)}`}>
                  {trendAnalysis?.overallTrajectory?.replace('_', ' ')?.toUpperCase() || 'ANALYZING'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium">Recent Growth Phases</h4>
              {trendAnalysis?.growthPhases?.slice(-3)?.map((phase, index) => (
                <div key={index} className="p-3 bg-slate-800/50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize text-sm">
                      {phase?.type?.replace('_', ' ')}
                    </span>
                    <span className="text-white text-sm">{phase?.duration} days</span>
                  </div>
                </div>
              )) || (
                <p className="text-slate-400 text-sm">Analyzing growth patterns...</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium">Performance Patterns</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-400">Velocity:</span>
                  <span className="text-white ml-1">
                    {trendAnalysis?.performancePatterns?.velocityPatterns?.replace('_', ' ') || 'analyzing'}
                  </span>
                </div>
                <div className="p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-400">Quality:</span>
                  <span className="text-white ml-1">
                    {trendAnalysis?.performancePatterns?.qualityPatterns?.replace('_', ' ') || 'analyzing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Cognitive Load Analysis</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-sm text-slate-400">Processing Load</p>
                <p className="text-xl font-bold text-white">
                  {performanceMetrics?.cognitiveLoad?.conceptsPerDay?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-slate-400">concepts/day</p>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-sm text-slate-400">Efficiency</p>
                <p className="text-xl font-bold text-white">
                  {((performanceMetrics?.cognitiveLoad?.processingEfficiency || 0) * 100)?.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">validation rate</p>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-sm text-slate-400">Memory Utilization</p>
                <p className="text-xl font-bold text-white">
                  {((performanceMetrics?.cognitiveLoad?.memoryUtilization || 0) * 100)?.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">capacity used</p>
              </div>
              
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-sm text-slate-400">Adaptive Capacity</p>
                <p className="text-xl font-bold text-white">
                  {((performanceMetrics?.cognitiveLoad?.adaptiveCapacity || 0) * 100)?.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">flexibility score</p>
              </div>
            </div>

            {/* Performance Anomalies */}
            <div>
              <h4 className="text-white font-medium mb-3">Recent Anomalies</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {trendAnalysis?.anomalies?.length > 0 ? (
                  trendAnalysis?.anomalies?.slice(0, 5)?.map((anomaly, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded text-sm ${
                        anomaly?.severity === 'high' ? 'bg-red-900/20 border-l-2 border-red-500' : 'bg-yellow-900/20 border-l-2 border-yellow-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs">
                          {anomaly?.date ? new Date(anomaly.date)?.toLocaleDateString() : 'Recent'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          anomaly?.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {anomaly?.severity?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mt-1">{anomaly?.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No significant anomalies detected.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Optimization Recommendations */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Optimization Recommendations</h3>
        </div>

        <div className="space-y-4">
          {optimizationRecommendations?.length > 0 ? (
            optimizationRecommendations?.map((rec, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(rec?.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-semibold">{rec?.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(rec?.priority)}`}>
                        {rec?.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">{rec?.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">Impact:</span>
                    <span className={`font-medium ${
                      rec?.impact === 'high' ? 'text-green-400' :
                      rec?.impact === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {rec?.impact}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">Effort:</span>
                    <span className={`font-medium ${
                      rec?.effort === 'high' ? 'text-red-400' :
                      rec?.effort === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {rec?.effort}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-white font-medium">{rec?.category?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400">
                Performance is optimal. No recommendations at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CognitivePerformanceAnalytics;