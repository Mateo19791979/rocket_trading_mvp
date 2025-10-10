import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Zap, Target, TrendingDown, Eye } from 'lucide-react';
import { aiLearningService } from '@/services/aiLearningService';

export default function AICritiqueEngine({ dhiStatus, onDHIUpdate }) {
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const runSystemEvaluation = async () => {
    try {
      setEvaluating(true);
      
      // Simulate comprehensive system evaluation
      const mockEvaluation = {
        timestamp: new Date(),
        overallScore: 87,
        components: {
          strategy_effectiveness: {
            score: 89,
            status: 'good',
            issues: ['Some momentum strategies underperforming in sideways markets'],
            recommendations: ['Consider adding range-bound strategies']
          },
          data_health: {
            score: 92,
            status: 'excellent',
            issues: [],
            recommendations: ['Continue current data quality monitoring']
          },
          toxic_patterns: {
            score: 78,
            status: 'warning',
            issues: ['2 toxic patterns detected in recent decisions'],
            recommendations: ['Review strategy parameters for high volatility conditions']
          },
          learning_progression: {
            score: 85,
            status: 'good',
            issues: ['Learning rate could be optimized'],
            recommendations: ['Implement adaptive learning rates']
          }
        }
      };

      setEvaluation(mockEvaluation);
      
      // Update DHI status
      const dhiResult = await aiLearningService?.getDHIStatus();
      if (dhiResult?.data) {
        onDHIUpdate(dhiResult?.data);
      }
      
    } catch (error) {
      console.error('System evaluation failed:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'good':
        return <Target className="h-5 w-5 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Eye className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-blue-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-600/20 rounded-lg">
            <Shield className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">AI Critique Engine</h3>
            <p className="text-sm text-gray-400">System evaluation and health assessment</p>
          </div>
        </div>
      </div>
      {/* Health Overview */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-300">Data Health Index</h4>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-teal-400" />
              <span className="text-xs text-gray-400">
                {dhiStatus?.healthyCount}/{dhiStatus?.totalStreams} streams healthy
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {dhiStatus?.all?.slice(0, 3)?.map((stream, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{stream?.stream}</span>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${stream?.dhi >= 0.7 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={`text-sm ${stream?.dhi >= 0.7 ? 'text-green-400' : 'text-red-400'}`}>
                    {(stream?.dhi * 100)?.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* System Evaluation */}
      {evaluation && (
        <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-300">System Evaluation</h4>
            <div className="flex items-center space-x-2">
              <div className={`text-lg font-semibold ${
                evaluation?.overallScore >= 90 ? 'text-green-400' :
                evaluation?.overallScore >= 70 ? 'text-blue-400' :
                evaluation?.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {evaluation?.overallScore}/100
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(evaluation?.components)?.map(([component, data]) => (
              <div key={component} className="bg-gray-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(data?.status)}
                    <span className="text-sm text-gray-300 capitalize">
                      {component?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(data?.status)}`}>
                    {data?.score}/100
                  </span>
                </div>

                {data?.issues?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {data?.issues?.map((issue, idx) => (
                      <div key={idx} className="text-xs text-yellow-400 flex items-start space-x-2">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}

                {data?.recommendations?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {data?.recommendations?.slice(0, 1)?.map((rec, idx) => (
                      <div key={idx} className="text-xs text-teal-400 flex items-start space-x-2">
                        <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Toxic Pattern Detection */}
      <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300">Toxic Pattern Detection</h4>
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-xs text-gray-400">2 patterns detected</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between bg-gray-700/30 rounded p-2">
            <span className="text-xs text-gray-400">High volatility trap</span>
            <span className="text-xs text-red-400">Confidence: 87%</span>
          </div>
          <div className="flex items-center justify-between bg-gray-700/30 rounded p-2">
            <span className="text-xs text-gray-400">Correlation breakdown</span>
            <span className="text-xs text-red-400">Confidence: 73%</span>
          </div>
        </div>
      </div>
      {/* Action Button */}
      <motion.button
        onClick={runSystemEvaluation}
        disabled={evaluating}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-teal-600/20 border border-teal-500 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Shield className={`h-5 w-5 ${evaluating ? 'animate-pulse' : ''}`} />
        <span>{evaluating ? 'Evaluating System...' : 'Run Full Evaluation'}</span>
      </motion.button>
    </div>
  );
}