import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Target, Zap, Activity, BarChart3, Shield } from 'lucide-react';

export default function PredictiveSecurityDashboard({ securityStatus, systemHealth, onPredictionUpdate }) {
  const [predictions, setPredictions] = useState({
    threatForecasting: {
      nextHourProbability: 12.3,
      next24HoursProbability: 34.7,
      predictedAttackVectors: ['Phishing', 'DDoS', 'Social Engineering'],
      confidenceLevel: 89.2
    },
    attackVectorAnalysis: {
      mostLikely: 'API Exploitation',
      probability: 43.2,
      mitigationStrategies: 3,
      responseTime: '2.3 minutes'
    },
    incidentResponse: {
      automatedResponses: 15,
      manualInterventions: 2,
      responseSuccess: 94.7,
      averageResolutionTime: '4.2 minutes'
    }
  });

  const [riskAssessment, setRiskAssessment] = useState([
    {
      category: 'Authentication Systems',
      currentRisk: 15,
      trendDirection: 'down',
      prediction: 'Low risk maintained',
      confidence: 92.1
    },
    {
      category: 'Data Transmission',
      currentRisk: 23,
      trendDirection: 'stable',
      prediction: 'Stable security posture',
      confidence: 87.4
    },
    {
      category: 'Trading Infrastructure',
      currentRisk: 18,
      trendDirection: 'down',
      prediction: 'Improving security',
      confidence: 91.8
    },
    {
      category: 'User Behavior Patterns',
      currentRisk: 31,
      trendDirection: 'up',
      prediction: 'Increased monitoring needed',
      confidence: 85.3
    }
  ]);

  const [orchestrationMetrics, setOrchestrationMetrics] = useState({
    activePlaybooks: 8,
    automatedDecisions: 156,
    manualOverrides: 3,
    decisionAccuracy: 96.8,
    responseEfficiency: 98.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Update predictions
      setPredictions(prev => ({
        ...prev,
        threatForecasting: {
          ...prev?.threatForecasting,
          nextHourProbability: Math.max(0, Math.min(50, prev?.threatForecasting?.nextHourProbability + (Math.random() * 4 - 2))),
          next24HoursProbability: Math.max(0, Math.min(80, prev?.threatForecasting?.next24HoursProbability + (Math.random() * 6 - 3))),
          confidenceLevel: Math.max(85, Math.min(95, prev?.threatForecasting?.confidenceLevel + (Math.random() * 2 - 1)))
        },
        attackVectorAnalysis: {
          ...prev?.attackVectorAnalysis,
          probability: Math.max(20, Math.min(60, prev?.attackVectorAnalysis?.probability + (Math.random() * 4 - 2)))
        },
        incidentResponse: {
          ...prev?.incidentResponse,
          automatedResponses: prev?.incidentResponse?.automatedResponses + Math.floor(Math.random() * 3),
          responseSuccess: Math.max(90, Math.min(99, prev?.incidentResponse?.responseSuccess + (Math.random() * 2 - 1)))
        }
      }));

      // Update orchestration metrics
      setOrchestrationMetrics(prev => ({
        ...prev,
        automatedDecisions: prev?.automatedDecisions + Math.floor(Math.random() * 5),
        decisionAccuracy: Math.max(95, Math.min(99, prev?.decisionAccuracy + (Math.random() * 1 - 0.5))),
        responseEfficiency: Math.max(95, Math.min(99, prev?.responseEfficiency + (Math.random() * 1 - 0.5)))
      }));

      // Notify parent of prediction updates
      onPredictionUpdate?.(predictions?.threatForecasting?.confidenceLevel);
    }, 8000);

    return () => clearInterval(interval);
  }, [predictions?.threatForecasting?.confidenceLevel, onPredictionUpdate]);

  const getRiskColor = (risk) => {
    if (risk < 20) return 'text-green-400';
    if (risk < 40) return 'text-yellow-400';
    if (risk < 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrendIcon = (direction) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-red-400" />;
    if (direction === 'down') return <TrendingUp className="h-4 w-4 text-green-400 transform rotate-180" />;
    return <Activity className="h-4 w-4 text-yellow-400" />;
  };

  const getProbabilityColor = (probability) => {
    if (probability < 25) return 'text-green-400';
    if (probability < 50) return 'text-yellow-400';
    if (probability < 75) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* AI-Powered Threat Forecasting */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-blue-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-blue-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Brain className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Predictive Security Dashboard</h3>
              <p className="text-sm text-gray-400">AI-powered threat forecasting and attack vector analysis</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Threat Forecasting */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-blue-400" />
                AI Threat Forecasting
              </h4>
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                {predictions?.threatForecasting?.confidenceLevel?.toFixed(1)}% Confidence
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-400">Next Hour Risk</p>
                <p className={`text-lg font-semibold ${getProbabilityColor(predictions?.threatForecasting?.nextHourProbability)}`}>
                  {predictions?.threatForecasting?.nextHourProbability?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Next 24 Hours</p>
                <p className={`text-lg font-semibold ${getProbabilityColor(predictions?.threatForecasting?.next24HoursProbability)}`}>
                  {predictions?.threatForecasting?.next24HoursProbability?.toFixed(1)}%
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">Predicted Attack Vectors</p>
              <div className="flex flex-wrap gap-1">
                {predictions?.threatForecasting?.predictedAttackVectors?.map((vector, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded"
                  >
                    {vector}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Attack Vector Analysis */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Target className="h-4 w-4 mr-2 text-orange-400" />
                Attack Vector Probability Analysis
              </h4>
              <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
                {predictions?.attackVectorAnalysis?.mitigationStrategies} Strategies Ready
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Most Likely Vector</span>
                <span className="text-sm font-semibold text-orange-400">
                  {predictions?.attackVectorAnalysis?.mostLikely}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Probability</span>
                <span className={`text-sm font-semibold ${getProbabilityColor(predictions?.attackVectorAnalysis?.probability)}`}>
                  {predictions?.attackVectorAnalysis?.probability?.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Response Time</span>
                <span className="text-sm font-semibold text-green-400">
                  {predictions?.attackVectorAnalysis?.responseTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Automated Incident Response Orchestration */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Automated Incident Response</h3>
              <p className="text-sm text-gray-400">Advanced decision trees and risk-based prioritization</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Response Metrics */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Automated Responses</p>
                <p className="text-xl font-semibold text-purple-400">{predictions?.incidentResponse?.automatedResponses}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Manual Interventions</p>
                <p className="text-xl font-semibold text-yellow-400">{predictions?.incidentResponse?.manualInterventions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Success Rate</p>
                <p className="text-xl font-semibold text-green-400">{predictions?.incidentResponse?.responseSuccess?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Avg Resolution</p>
                <p className="text-xl font-semibold text-teal-400">{predictions?.incidentResponse?.averageResolutionTime}</p>
              </div>
            </div>
          </div>

          {/* Orchestration Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-teal-400" />
              Orchestration Metrics
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Active Playbooks</span>
                <span className="text-sm font-semibold text-teal-400">{orchestrationMetrics?.activePlaybooks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Automated Decisions</span>
                <span className="text-sm font-semibold text-purple-400">{orchestrationMetrics?.automatedDecisions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Decision Accuracy</span>
                <span className="text-sm font-semibold text-green-400">{orchestrationMetrics?.decisionAccuracy?.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Response Efficiency</span>
                <span className="text-sm font-semibold text-blue-400">{orchestrationMetrics?.responseEfficiency?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Risk Assessment Matrix */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Shield className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Risk Assessment Matrix</h3>
              <p className="text-sm text-gray-400">Real-time security posture evaluation</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {riskAssessment?.map((item, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{item?.category}</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(item?.trendDirection)}
                    <span className={`text-sm font-semibold ${getRiskColor(item?.currentRisk)}`}>
                      {item?.currentRisk}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{item?.prediction}</span>
                  <span className="text-blue-400">Confidence: {item?.confidence?.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}