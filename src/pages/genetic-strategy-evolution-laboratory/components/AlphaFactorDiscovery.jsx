import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Eye, Brain, Sparkles, Target, Activity } from 'lucide-react';

export default function AlphaFactorDiscovery({ strategies, population }) {
  const [discoveredFactors, setDiscoveredFactors] = useState([]);
  const [miningProgress, setMiningProgress] = useState(0);
  const [activeSearch, setActiveSearch] = useState(false);
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);

  useEffect(() => {
    if (strategies?.length > 0) {
      mineAlphaFactors();
    }
  }, [strategies, population]);

  const mineAlphaFactors = async () => {
    setActiveSearch(true);
    setMiningProgress(0);

    try {
      // Simulate progressive alpha factor discovery
      const factors = [];
      const progressSteps = 10;

      for (let step = 0; step < progressSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (step === 2) factors?.push(generateMomentumFactor());
        if (step === 4) factors?.push(generateVolatilityFactor());
        if (step === 6) factors?.push(generateCorrelationFactor());
        if (step === 8) factors?.push(generateSentimentFactor());
        
        setMiningProgress((step + 1) * 10);
        setDiscoveredFactors([...factors]);
      }

      // Generate correlation matrix
      generateCorrelationMatrix(factors);

    } catch (error) {
      console.error('Alpha factor mining failed:', error);
    } finally {
      setActiveSearch(false);
    }
  };

  const generateMomentumFactor = () => ({
    id: 'momentum_adaptive',
    name: 'Adaptive Momentum Convergence',
    type: 'momentum',
    description: 'Novel momentum factor that adapts to market regime changes',
    confidence: 0.85,
    alphaContribution: 0.12,
    correlationStrength: 0.73,
    discoveredAt: Date.now(),
    formula: 'AMC = (EMA12 - EMA26) * RSI_adaptive_period',
    backtestResults: {
      sharpeRatio: 1.87,
      maxDrawdown: -8.3,
      winRate: 67.4,
      totalReturn: 23.6
    },
    riskMetrics: {
      volatility: 12.4,
      beta: 0.89,
      trackingError: 3.2
    }
  });

  const generateVolatilityFactor = () => ({
    id: 'volatility_clustering',
    name: 'Volatility Clustering Predictor',
    type: 'volatility',
    description: 'Identifies periods of sustained volatility using GARCH-like clustering',
    confidence: 0.78,
    alphaContribution: 0.09,
    correlationStrength: 0.65,
    discoveredAt: Date.now(),
    formula: 'VCP = σt * exp(α * σt-1 + β * εt-1²)',
    backtestResults: {
      sharpeRatio: 1.54,
      maxDrawdown: -11.7,
      winRate: 62.1,
      totalReturn: 18.9
    },
    riskMetrics: {
      volatility: 15.8,
      beta: 1.12,
      trackingError: 4.6
    }
  });

  const generateCorrelationFactor = () => ({
    id: 'cross_asset_flow',
    name: 'Cross-Asset Flow Momentum',
    type: 'correlation',
    description: 'Captures momentum spillovers between asset classes',
    confidence: 0.91,
    alphaContribution: 0.15,
    correlationStrength: 0.82,
    discoveredAt: Date.now(),
    formula: 'CAFM = Σ(wi * ρi,j * Mj)',
    backtestResults: {
      sharpeRatio: 2.13,
      maxDrawdown: -6.8,
      winRate: 71.2,
      totalReturn: 28.4
    },
    riskMetrics: {
      volatility: 10.9,
      beta: 0.76,
      trackingError: 2.8
    }
  });

  const generateSentimentFactor = () => ({
    id: 'sentiment_regime',
    name: 'Sentiment Regime Detector',
    type: 'sentiment',
    description: 'Advanced sentiment analysis with regime-dependent weights',
    confidence: 0.72,
    alphaContribution: 0.08,
    correlationStrength: 0.58,
    discoveredAt: Date.now(),
    formula: 'SRD = tanh(λ * sentiment_score) * regime_weight',
    backtestResults: {
      sharpeRatio: 1.31,
      maxDrawdown: -13.2,
      winRate: 59.8,
      totalReturn: 16.7
    },
    riskMetrics: {
      volatility: 17.3,
      beta: 1.24,
      trackingError: 5.1
    }
  });

  const generateCorrelationMatrix = (factors) => {
    const matrix = factors?.map((factor1, i) => 
      factors?.map((factor2, j) => {
        if (i === j) return 1;
        // Generate realistic correlation values
        const baseCorr = 0.1 + Math.random() * 0.4;
        return factor1?.type === factor2?.type ? baseCorr + 0.3 : baseCorr;
      })
    );
    setCorrelationMatrix(matrix);
  };

  const getFactorTypeIcon = (type) => {
    switch (type) {
      case 'momentum': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'volatility': return <Activity className="w-5 h-5 text-red-400" />;
      case 'correlation': return <Target className="w-5 h-5 text-green-400" />;
      case 'sentiment': return <Brain className="w-5 h-5 text-purple-400" />;
      default: return <Sparkles className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getFactorTypeColor = (type) => {
    switch (type) {
      case 'momentum': return 'blue';
      case 'volatility': return 'red';
      case 'correlation': return 'green';
      case 'sentiment': return 'purple';
      default: return 'yellow';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Search className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Alpha Factor Discovery</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Confidence:</span>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e?.target?.value))}
              className="w-20"
            />
            <span className="text-yellow-400 text-sm">{(confidenceThreshold * 100)?.toFixed(0)}%</span>
          </div>
          <button
            onClick={mineAlphaFactors}
            disabled={activeSearch}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200"
          >
            {activeSearch ? 'Mining...' : 'Discover Factors'}
          </button>
        </div>
      </div>
      {/* Mining Progress */}
      {activeSearch && (
        <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Eye className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-300 font-medium">Alpha Factor Mining in Progress</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${miningProgress}%` }}
            />
          </div>
          <div className="text-yellow-300 text-sm mt-2">{miningProgress}% Complete</div>
        </div>
      )}
      {/* Discovered Factors */}
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {discoveredFactors?.filter(factor => factor?.confidence >= confidenceThreshold)?.map((factor) => (
          <div
            key={factor?.id}
            className={`bg-gray-900/50 rounded-lg p-4 border-l-4 border-${getFactorTypeColor(factor?.type)}-500`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getFactorTypeIcon(factor?.type)}
                <div>
                  <h4 className="text-white font-semibold">{factor?.name}</h4>
                  <p className="text-gray-400 text-sm">{factor?.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-green-400 font-bold">+{(factor?.alphaContribution * 100)?.toFixed(1)}%</div>
                  <div className="text-gray-400 text-xs">Alpha Contribution</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                  factor?.confidence >= 0.8 ? 'bg-green-900/50 text-green-300' :
                  factor?.confidence >= 0.6 ? 'bg-yellow-900/50 text-yellow-300': 'bg-red-900/50 text-red-300'
                }`}>
                  {(factor?.confidence * 100)?.toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-blue-400 font-bold">{factor?.backtestResults?.sharpeRatio}</div>
                <div className="text-gray-400 text-xs">Sharpe Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">{factor?.backtestResults?.totalReturn}%</div>
                <div className="text-gray-400 text-xs">Return</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold">{factor?.backtestResults?.winRate}%</div>
                <div className="text-gray-400 text-xs">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold">{factor?.backtestResults?.maxDrawdown}%</div>
                <div className="text-gray-400 text-xs">Max DD</div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded p-3 mb-3">
              <div className="text-gray-400 text-xs mb-1">Formula:</div>
              <code className="text-green-300 text-sm font-mono">{factor?.formula}</code>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Correlation: <span className="text-blue-400">{factor?.correlationStrength?.toFixed(2)}</span>
                </span>
                <span className="text-gray-400">
                  Volatility: <span className="text-orange-400">{factor?.riskMetrics?.volatility}%</span>
                </span>
                <span className="text-gray-400">
                  Beta: <span className="text-purple-400">{factor?.riskMetrics?.beta}</span>
                </span>
              </div>
              <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                Integrate →
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Correlation Matrix */}
      {correlationMatrix?.length > 0 && (
        <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Factor Correlation Matrix</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 p-2"></th>
                  {discoveredFactors?.map((factor, i) => (
                    <th key={i} className="text-center text-gray-400 p-2 min-w-16">
                      {factor?.name?.split(' ')?.[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {discoveredFactors?.map((factor, i) => (
                  <tr key={i}>
                    <td className="text-gray-400 p-2 font-medium">
                      {factor?.name?.split(' ')?.[0]}
                    </td>
                    {correlationMatrix?.[i]?.map((corr, j) => (
                      <td key={j} className="text-center p-2">
                        <div
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            corr === 1 ? 'bg-white/20 text-white' :
                            corr > 0.7 ? 'bg-red-900/50 text-red-300' :
                            corr > 0.3 ? 'bg-yellow-900/50 text-yellow-300': 'bg-green-900/50 text-green-300'
                          }`}
                        >
                          {corr?.toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* No Factors Found */}
      {!activeSearch && discoveredFactors?.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No Alpha Factors Discovered</p>
          <p className="text-sm">Click "Discover Factors" to begin automated factor mining</p>
        </div>
      )}
    </div>
  );
}