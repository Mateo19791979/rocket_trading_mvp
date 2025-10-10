import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Zap, Eye } from 'lucide-react';

export default function MarketRegimeDetection({ regimeStatus, onRegimeUpdate }) {
  const [regimeData, setRegimeData] = useState({
    hiddenMarkovModels: {
      states: 5,
      transitionMatrix: 'STABLE',
      emissionProbabilities: 0.89,
      viterbiAccuracy: 94.2
    },
    bayesianChangePoint: {
      changePoints: 12,
      detectionLatency: '0.3s',
      falsePositiveRate: 2.1,
      sensitivity: 97.8
    },
    dynamicFactorModels: {
      factors: 8,
      loadingStability: 0.92,
      factorContribution: 0.76,
      modelFit: 96.1
    }
  });

  const [regimeProbabilities, setRegimeProbabilities] = useState([
    {
      regime: 'BULL_MARKET_LOW_VOLATILITY',
      probability: 87.4,
      duration: '14.3 days',
      characteristics: ['Rising prices', 'Low volatility', 'High volume'],
      trend: 'STABLE'
    },
    {
      regime: 'BULL_MARKET_HIGH_VOLATILITY',
      probability: 8.2,
      duration: '6.7 days',
      characteristics: ['Rising prices', 'High volatility', 'Erratic volume'],
      trend: 'DECREASING'
    },
    {
      regime: 'BEAR_MARKET_LOW_VOLATILITY',
      probability: 3.1,
      duration: '21.2 days',
      characteristics: ['Falling prices', 'Low volatility', 'Declining volume'],
      trend: 'STABLE'
    },
    {
      regime: 'SIDEWAYS_MARKET',
      probability: 1.3,
      duration: '9.8 days',
      characteristics: ['Range-bound', 'Mixed signals', 'Low momentum'],
      trend: 'INCREASING'
    }
  ]);

  const [transitionMatrix, setTransitionMatrix] = useState([
    { from: 'BULL_LOW_VOL', to: 'BULL_HIGH_VOL', probability: 0.15, strength: 'MEDIUM' },
    { from: 'BULL_LOW_VOL', to: 'SIDEWAYS', probability: 0.08, strength: 'LOW' },
    { from: 'BULL_HIGH_VOL', to: 'BEAR_LOW_VOL', probability: 0.23, strength: 'HIGH' },
    { from: 'BEAR_LOW_VOL', to: 'SIDEWAYS', probability: 0.18, strength: 'MEDIUM' },
    { from: 'SIDEWAYS', to: 'BULL_LOW_VOL', probability: 0.31, strength: 'HIGH' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update regime detection data
      setRegimeData(prev => ({
        ...prev,
        hiddenMarkovModels: {
          ...prev?.hiddenMarkovModels,
          emissionProbabilities: Math.max(0.85, Math.min(0.95, prev?.hiddenMarkovModels?.emissionProbabilities + (Math.random() * 0.04 - 0.02))),
          viterbiAccuracy: Math.max(92, Math.min(97, prev?.hiddenMarkovModels?.viterbiAccuracy + (Math.random() * 2 - 1)))
        },
        bayesianChangePoint: {
          ...prev?.bayesianChangePoint,
          changePoints: Math.max(10, prev?.bayesianChangePoint?.changePoints + Math.floor(Math.random() * 3 - 1)),
          falsePositiveRate: Math.max(1.5, Math.min(3, prev?.bayesianChangePoint?.falsePositiveRate + (Math.random() * 0.4 - 0.2))),
          sensitivity: Math.max(95, Math.min(99, prev?.bayesianChangePoint?.sensitivity + (Math.random() * 2 - 1)))
        },
        dynamicFactorModels: {
          ...prev?.dynamicFactorModels,
          loadingStability: Math.max(0.88, Math.min(0.96, prev?.dynamicFactorModels?.loadingStability + (Math.random() * 0.04 - 0.02))),
          modelFit: Math.max(94, Math.min(98, prev?.dynamicFactorModels?.modelFit + (Math.random() * 2 - 1)))
        }
      }));

      // Update regime probabilities with small random variations
      setRegimeProbabilities(prev => 
        prev?.map(regime => ({
          ...regime,
          probability: Math.max(0.1, regime?.probability + (Math.random() * 2 - 1))
        }))
      );

      // Update parent regime status
      if (onRegimeUpdate) {
        const currentRegimeProb = regimeProbabilities?.find(r => 
          r?.regime === regimeStatus?.currentRegime
        )?.probability || regimeStatus?.regimeProbability;

        const transitionProb = Math.max(5, Math.min(25, regimeStatus?.transitionProbability + (Math.random() * 4 - 2)));

        onRegimeUpdate(prev => ({
          ...prev,
          regimeProbability: Math.max(80, Math.min(95, currentRegimeProb + (Math.random() * 2 - 1))),
          transitionProbability: transitionProb
        }));
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [regimeProbabilities, regimeStatus, onRegimeUpdate]);

  const getRegimeColor = (regime) => {
    const colors = {
      'BULL_MARKET_LOW_VOLATILITY': 'text-green-400',
      'BULL_MARKET_HIGH_VOLATILITY': 'text-teal-400',
      'BEAR_MARKET_LOW_VOLATILITY': 'text-red-400',
      'BEAR_MARKET_HIGH_VOLATILITY': 'text-orange-400',
      'SIDEWAYS_MARKET': 'text-yellow-400'
    };
    return colors?.[regime] || 'text-gray-400';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'INCREASING') return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (trend === 'DECREASING') return <TrendingUp className="h-4 w-4 text-red-400 transform rotate-180" />;
    return <Activity className="h-4 w-4 text-yellow-400" />;
  };

  const getTransitionStrengthColor = (strength) => {
    const colors = {
      'HIGH': 'text-red-400',
      'MEDIUM': 'text-yellow-400',
      'LOW': 'text-green-400'
    };
    return colors?.[strength] || 'text-gray-400';
  };

  const getProbabilityBarColor = (probability) => {
    if (probability > 80) return 'bg-green-400';
    if (probability > 60) return 'bg-teal-400';
    if (probability > 40) return 'bg-yellow-400';
    if (probability > 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Market Regime Detection */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-teal-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-teal-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-600/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Market Regime Detection</h3>
              <p className="text-sm text-gray-400">Hidden Markov models and Bayesian change-point detection</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Hidden Markov Models */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Eye className="h-4 w-4 mr-2 text-teal-400" />
                Hidden Markov Models
              </h4>
              <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded">
                {regimeData?.hiddenMarkovModels?.states} States
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Emission Probability</p>
                <p className="text-lg font-semibold text-teal-400">
                  {(regimeData?.hiddenMarkovModels?.emissionProbabilities * 100)?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Viterbi Accuracy</p>
                <p className="text-lg font-semibold text-green-400">
                  {regimeData?.hiddenMarkovModels?.viterbiAccuracy?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Bayesian Change-Point Detection */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-orange-400" />
                Bayesian Change-Point Detection
              </h4>
              <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
                {regimeData?.bayesianChangePoint?.detectionLatency} Latency
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Change Points</p>
                <p className="text-lg font-semibold text-orange-400">{regimeData?.bayesianChangePoint?.changePoints}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Sensitivity</p>
                <p className="text-lg font-semibold text-green-400">
                  {regimeData?.bayesianChangePoint?.sensitivity?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Factor Models */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-purple-400" />
                Dynamic Factor Models
              </h4>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                {regimeData?.dynamicFactorModels?.factors} Factors
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Loading Stability</p>
                <p className="text-lg font-semibold text-purple-400">
                  {(regimeData?.dynamicFactorModels?.loadingStability * 100)?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Model Fit</p>
                <p className="text-lg font-semibold text-green-400">
                  {regimeData?.dynamicFactorModels?.modelFit?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Real-time Regime Probability Distributions */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Regime Probability Distribution</h3>
              <p className="text-sm text-gray-400">Real-time probability distributions and transition matrices</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {regimeProbabilities?.map((regime, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getRegimeColor(regime?.regime)}`}>
                    {regime?.regime?.replace(/_/g, ' ')}
                  </span>
                  {getTrendIcon(regime?.trend)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-100">
                    {regime?.probability?.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Probability Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${getProbabilityBarColor(regime?.probability)}`}
                  style={{ width: `${Math.min(100, regime?.probability)}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Avg Duration</p>
                  <p className="text-teal-400 font-semibold">{regime?.duration}</p>
                </div>
                <div>
                  <p className="text-gray-400">Trend</p>
                  <p className={`font-semibold ${
                    regime?.trend === 'INCREASING' ? 'text-green-400' :
                    regime?.trend === 'DECREASING' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {regime?.trend}
                  </p>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Characteristics:</p>
                <div className="flex flex-wrap gap-1">
                  {regime?.characteristics?.map((char, charIndex) => (
                    <span
                      key={charIndex}
                      className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Transition Matrix */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Transition Matrix</h3>
              <p className="text-sm text-gray-400">Regime transition probabilities and strengths</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {transitionMatrix?.map((transition, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-300">{transition?.from}</span>
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">{transition?.to}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-blue-400">
                      {(transition?.probability * 100)?.toFixed(1)}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getTransitionStrengthColor(transition?.strength)} bg-gray-700/50`}>
                      {transition?.strength}
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className="h-1 rounded-full bg-blue-400"
                    style={{ width: `${transition?.probability * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}