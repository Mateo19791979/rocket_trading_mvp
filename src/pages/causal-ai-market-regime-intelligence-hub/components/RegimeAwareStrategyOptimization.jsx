import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Settings, TrendingUp, BarChart3, Zap, Activity, CheckCircle } from 'lucide-react';

export default function RegimeAwareStrategyOptimization({ regimeStatus, strategicAdaptations, onStrategyUpdate }) {
  const [strategyParams, setStrategyParams] = useState({
    adaptiveParameters: {
      currentRegime: regimeStatus?.currentRegime || 'BULL_MARKET_LOW_VOLATILITY',
      parameterSets: 4,
      adaptationSpeed: 0.73,
      optimizationScore: 94.6
    },
    regimeSpecificBacktesting: {
      backtestingScenarios: 156,
      avgPerformanceImprovement: 23.4,
      sharpeRatioGain: 0.45,
      maxDrawdownReduction: 18.7
    },
    dynamicAllocation: {
      allocationModels: 8,
      rebalancingFrequency: '2.3 hours',
      allocationEfficiency: 96.2,
      riskAdjustment: 'ACTIVE'
    }
  });

  const [strategyPerformance, setStrategyPerformance] = useState([
    {
      strategy: 'Mean Reversion',
      regime: 'BULL_MARKET_LOW_VOLATILITY',
      performance: 94.7,
      sharpeRatio: 2.34,
      maxDrawdown: -8.2,
      status: 'ACTIVE',
      adaptationLevel: 'HIGH'
    },
    {
      strategy: 'Momentum',
      regime: 'BULL_MARKET_HIGH_VOLATILITY',
      performance: 89.3,
      sharpeRatio: 1.87,
      maxDrawdown: -12.5,
      status: 'STANDBY',
      adaptationLevel: 'MEDIUM'
    },
    {
      strategy: 'Volatility Breakout',
      regime: 'BEAR_MARKET_HIGH_VOLATILITY',
      performance: 76.2,
      sharpeRatio: 1.23,
      maxDrawdown: -18.9,
      status: 'INACTIVE',
      adaptationLevel: 'LOW'
    },
    {
      strategy: 'Statistical Arbitrage',
      regime: 'SIDEWAYS_MARKET',
      performance: 91.8,
      sharpeRatio: 2.01,
      maxDrawdown: -6.3,
      status: 'ACTIVE',
      adaptationLevel: 'HIGH'
    }
  ]);

  const [allocationMetrics, setAllocationMetrics] = useState({
    currentAllocation: [
      { asset: 'Equities', allocation: 45.2, regime_weight: 0.87, performance: 'OUTPERFORMING' },
      { asset: 'Bonds', allocation: 18.3, regime_weight: 0.34, performance: 'UNDERPERFORMING' },
      { asset: 'Commodities', allocation: 12.7, regime_weight: 0.52, performance: 'NEUTRAL' },
      { asset: 'Cash', allocation: 23.8, regime_weight: 0.91, performance: 'DEFENSIVE' }
    ],
    riskMetrics: {
      portfolioVaR: -4.2,
      expectedShortfall: -6.7,
      regimeConsistency: 93.4,
      diversificationRatio: 0.78
    }
  });

  const [performanceAttribution, setPerformanceAttribution] = useState([
    {
      regime: 'BULL_MARKET_LOW_VOLATILITY',
      duration: '47 days',
      totalReturn: 12.8,
      contribution: 8.7,
      strategiesActive: 3,
      efficiency: 94.2
    },
    {
      regime: 'BULL_MARKET_HIGH_VOLATILITY',
      duration: '23 days',
      totalReturn: 6.4,
      contribution: 2.1,
      strategiesActive: 2,
      efficiency: 87.6
    },
    {
      regime: 'SIDEWAYS_MARKET',
      duration: '31 days',
      totalReturn: 3.2,
      contribution: 1.8,
      strategiesActive: 4,
      efficiency: 91.3
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update strategy parameters
      setStrategyParams(prev => ({
        ...prev,
        adaptiveParameters: {
          ...prev?.adaptiveParameters,
          adaptationSpeed: Math.max(0.6, Math.min(0.85, prev?.adaptiveParameters?.adaptationSpeed + (Math.random() * 0.06 - 0.03))),
          optimizationScore: Math.max(90, Math.min(98, prev?.adaptiveParameters?.optimizationScore + (Math.random() * 2 - 1)))
        },
        regimeSpecificBacktesting: {
          ...prev?.regimeSpecificBacktesting,
          backtestingScenarios: prev?.regimeSpecificBacktesting?.backtestingScenarios + Math.floor(Math.random() * 5),
          avgPerformanceImprovement: Math.max(20, Math.min(30, prev?.regimeSpecificBacktesting?.avgPerformanceImprovement + (Math.random() * 2 - 1)))
        },
        dynamicAllocation: {
          ...prev?.dynamicAllocation,
          allocationEfficiency: Math.max(94, Math.min(98, prev?.dynamicAllocation?.allocationEfficiency + (Math.random() * 2 - 1)))
        }
      }));

      // Update strategy performance
      setStrategyPerformance(prev =>
        prev?.map(strategy => ({
          ...strategy,
          performance: Math.max(70, Math.min(98, strategy?.performance + (Math.random() * 4 - 2))),
          sharpeRatio: Math.max(1, Math.min(3, strategy?.sharpeRatio + (Math.random() * 0.2 - 0.1)))
        }))
      );

      // Update allocation metrics
      setAllocationMetrics(prev => ({
        ...prev,
        riskMetrics: {
          ...prev?.riskMetrics,
          portfolioVaR: Math.max(-8, Math.min(-2, prev?.riskMetrics?.portfolioVaR + (Math.random() * 1 - 0.5))),
          regimeConsistency: Math.max(90, Math.min(97, prev?.riskMetrics?.regimeConsistency + (Math.random() * 2 - 1)))
        }
      }));

      // Trigger strategy updates
      if (onStrategyUpdate && Math.random() > 0.6) {
        const newAdaptations = strategicAdaptations + Math.floor(Math.random() * 2);
        onStrategyUpdate(newAdaptations);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [strategicAdaptations, onStrategyUpdate]);

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

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'text-green-400',
      'STANDBY': 'text-yellow-400',
      'INACTIVE': 'text-gray-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getPerformanceColor = (performance) => {
    const colors = {
      'OUTPERFORMING': 'text-green-400',
      'UNDERPERFORMING': 'text-red-400',
      'NEUTRAL': 'text-yellow-400',
      'DEFENSIVE': 'text-blue-400'
    };
    return colors?.[performance] || 'text-gray-400';
  };

  const getAdaptationLevelColor = (level) => {
    const colors = {
      'HIGH': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'LOW': 'text-red-400'
    };
    return colors?.[level] || 'text-gray-400';
  };

  const getPerformanceBarColor = (performance) => {
    if (performance >= 90) return 'bg-green-400';
    if (performance >= 80) return 'bg-teal-400';
    if (performance >= 70) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Regime-Aware Strategy Optimization */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-blue-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-blue-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Regime-Aware Strategy Optimization</h3>
              <p className="text-sm text-gray-400">Adaptive strategy parameters based on detected market regimes</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Adaptive Parameters */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Settings className="h-4 w-4 mr-2 text-blue-400" />
                Adaptive Strategy Parameters
              </h4>
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                {strategyParams?.adaptiveParameters?.parameterSets} Parameter Sets
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Adaptation Speed</p>
                <p className="text-lg font-semibold text-blue-400">
                  {(strategyParams?.adaptiveParameters?.adaptationSpeed * 100)?.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Optimization Score</p>
                <p className="text-lg font-semibold text-green-400">
                  {strategyParams?.adaptiveParameters?.optimizationScore?.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-400">
              Current Regime: <span className={`font-semibold ${getRegimeColor(strategyParams?.adaptiveParameters?.currentRegime)}`}>
                {strategyParams?.adaptiveParameters?.currentRegime?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Regime-Specific Backtesting */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-teal-400" />
                Regime-Specific Backtesting Results
              </h4>
              <span className="text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded">
                +{strategyParams?.regimeSpecificBacktesting?.avgPerformanceImprovement?.toFixed(1)}% Improvement
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Sharpe Ratio Gain</p>
                <p className="text-lg font-semibold text-green-400">
                  +{strategyParams?.regimeSpecificBacktesting?.sharpeRatioGain?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Drawdown Reduction</p>
                <p className="text-lg font-semibold text-teal-400">
                  -{strategyParams?.regimeSpecificBacktesting?.maxDrawdownReduction?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Allocation Models */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-purple-400" />
                Dynamic Allocation Models
              </h4>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs text-purple-400">{strategyParams?.dynamicAllocation?.riskAdjustment}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Rebalancing Frequency</p>
                <p className="text-lg font-semibold text-purple-400">
                  {strategyParams?.dynamicAllocation?.rebalancingFrequency}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Allocation Efficiency</p>
                <p className="text-lg font-semibold text-green-400">
                  {strategyParams?.dynamicAllocation?.allocationEfficiency?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Strategy Performance Matrix */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Strategy Performance by Regime</h3>
              <p className="text-sm text-gray-400">Performance attribution and regime-specific optimization</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {strategyPerformance?.map((strategy, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-300">{strategy?.strategy}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(strategy?.status)} bg-gray-700/50`}>
                    {strategy?.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getAdaptationLevelColor(strategy?.adaptationLevel)} bg-gray-700/50`}>
                    {strategy?.adaptationLevel} ADAPTATION
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <p className={`text-xs ${getRegimeColor(strategy?.regime)}`}>
                  Optimized for: {strategy?.regime?.replace(/_/g, ' ')}
                </p>
              </div>
              
              {/* Performance Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${getPerformanceBarColor(strategy?.performance)}`}
                  style={{ width: `${Math.min(100, strategy?.performance)}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Performance</p>
                  <p className="text-green-400 font-semibold">{strategy?.performance?.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Sharpe Ratio</p>
                  <p className="text-teal-400 font-semibold">{strategy?.sharpeRatio?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Max Drawdown</p>
                  <p className="text-red-400 font-semibold">{strategy?.maxDrawdown?.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Current Allocation & Performance Attribution */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Zap className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Performance Attribution by Regime State</h3>
              <p className="text-sm text-gray-400">Dynamic allocation and risk-adjusted performance tracking</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Allocation */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Current Regime-Adjusted Allocation</h4>
            <div className="grid grid-cols-2 gap-3">
              {allocationMetrics?.currentAllocation?.map((asset, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{asset?.asset}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getPerformanceColor(asset?.performance)} bg-gray-700/50`}>
                      {asset?.performance}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal-400 font-semibold">{asset?.allocation?.toFixed(1)}%</span>
                    <span className="text-gray-400">Weight: {asset?.regime_weight?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Attribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Attribution by Regime</h4>
            <div className="space-y-2">
              {performanceAttribution?.map((perf, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${getRegimeColor(perf?.regime)}`}>
                      {perf?.regime?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-semibold text-green-400">
                      +{perf?.totalReturn?.toFixed(1)}% Return
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-blue-400 font-semibold">{perf?.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Contribution</p>
                      <p className="text-green-400 font-semibold">+{perf?.contribution?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Active Strategies</p>
                      <p className="text-purple-400 font-semibold">{perf?.strategiesActive}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Efficiency</p>
                      <p className="text-teal-400 font-semibold">{perf?.efficiency?.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Risk Management Metrics</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Portfolio VaR (95%)</span>
                  <span className="text-red-400 font-semibold">{allocationMetrics?.riskMetrics?.portfolioVaR?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Expected Shortfall</span>
                  <span className="text-red-400 font-semibold">{allocationMetrics?.riskMetrics?.expectedShortfall?.toFixed(1)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Regime Consistency</span>
                  <span className="text-green-400 font-semibold">{allocationMetrics?.riskMetrics?.regimeConsistency?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Diversification Ratio</span>
                  <span className="text-teal-400 font-semibold">{allocationMetrics?.riskMetrics?.diversificationRatio?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}