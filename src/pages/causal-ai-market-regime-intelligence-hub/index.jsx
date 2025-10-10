import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, BarChart3, Activity, RefreshCw, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import CausalDiscoveryEngine from './components/CausalDiscoveryEngine';
import MarketRegimeDetection from './components/MarketRegimeDetection';
import CausalImpactDashboard from './components/CausalImpactDashboard';
import RegimeAwareStrategyOptimization from './components/RegimeAwareStrategyOptimization';
import AdvancedAnalyticsCenter from './components/AdvancedAnalyticsCenter';

export default function CausalAIMarketRegimeIntelligenceHub() {
  const [causalMetrics, setCausalMetrics] = useState({
    discoveredCausalLinks: 47,
    confidenceLevel: 89.3,
    interventionSuccess: 94.7,
    causalGraphComplexity: 156,
    regimeDetectionAccuracy: 96.8,
    strategicAdaptations: 23
  });

  const [regimeStatus, setRegimeStatus] = useState({
    currentRegime: 'BULL_MARKET_LOW_VOLATILITY',
    regimeProbability: 87.4,
    transitionProbability: 12.6,
    avgRegimeDuration: '14.3 days',
    regimeHistory: 8,
    lastTransition: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  const [systemPerformance, setSystemPerformance] = useState({
    causalInferenceEngine: 'OPTIMAL',
    regimeDetectionSystem: 'OPERATIONAL',
    strategicOptimizer: 'ACTIVE',
    analyticsCenter: 'PROCESSING',
    dataIntegrity: 99.7,
    lastUpdate: new Date()
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCausalData = async () => {
    try {
      // Simulate real-time causal analysis updates
      setCausalMetrics(prev => ({
        ...prev,
        discoveredCausalLinks: Math.max(40, prev?.discoveredCausalLinks + Math.floor(Math.random() * 3 - 1)),
        confidenceLevel: Math.max(85, Math.min(95, prev?.confidenceLevel + (Math.random() * 2 - 1))),
        interventionSuccess: Math.max(90, Math.min(98, prev?.interventionSuccess + (Math.random() * 2 - 1))),
        causalGraphComplexity: Math.max(150, prev?.causalGraphComplexity + Math.floor(Math.random() * 6 - 3)),
        regimeDetectionAccuracy: Math.max(94, Math.min(99, prev?.regimeDetectionAccuracy + (Math.random() * 1 - 0.5))),
        strategicAdaptations: prev?.strategicAdaptations + Math.floor(Math.random() * 2)
      }));

      setRegimeStatus(prev => ({
        ...prev,
        regimeProbability: Math.max(80, Math.min(95, prev?.regimeProbability + (Math.random() * 4 - 2))),
        transitionProbability: Math.max(5, Math.min(25, prev?.transitionProbability + (Math.random() * 4 - 2)))
      }));

      setSystemPerformance(prev => ({
        ...prev,
        dataIntegrity: Math.max(99, Math.min(100, prev?.dataIntegrity + (Math.random() * 0.4 - 0.2))),
        lastUpdate: new Date()
      }));

      setError('');
    } catch (err) {
      setError(`Causal AI system error: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCausalData();
    const interval = setInterval(loadCausalData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadCausalData();
  };

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

  const getSystemStatusIcon = (status) => {
    const isHealthy = ['OPTIMAL', 'OPERATIONAL', 'ACTIVE', 'PROCESSING']?.includes(status);
    return isHealthy ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <AlertCircle className="h-4 w-4 text-red-400" />;
  };

  if (loading && causalMetrics?.discoveredCausalLinks === 47) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing Causal AI & Market Regime Intelligence...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-950 text-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-900/20 to-teal-900/20 border-b border-purple-800/30"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                  Causal AI & Market Regime Intelligence Hub
                </h1>
                <p className="text-gray-400 mt-1">
                  Sophisticated causal inference analysis and dynamic market regime detection
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Current Regime</p>
                <p className={`text-lg font-bold ${getRegimeColor(regimeStatus?.currentRegime)}`}>
                  {regimeStatus?.currentRegime?.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Last Update</p>
                <p className="text-sm text-gray-300">{systemPerformance?.lastUpdate?.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-purple-400" />
              </button>
            </div>
          </div>

          {/* Real-time Intelligence Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6">
            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Causal Links</p>
                  <p className="text-2xl font-semibold text-purple-400">{causalMetrics?.discoveredCausalLinks}</p>
                </div>
                <Target className="h-8 w-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Confidence Level</p>
                  <p className="text-2xl font-semibold text-teal-400">{causalMetrics?.confidenceLevel?.toFixed(1)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-teal-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Regime Accuracy</p>
                  <p className="text-2xl font-semibold text-green-400">{causalMetrics?.regimeDetectionAccuracy?.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Interventions</p>
                  <p className="text-2xl font-semibold text-orange-400">{causalMetrics?.interventionSuccess?.toFixed(1)}%</p>
                </div>
                <Zap className="h-8 w-8 text-orange-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Graph Complexity</p>
                  <p className="text-2xl font-semibold text-blue-400">{causalMetrics?.causalGraphComplexity}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Strategic Adaptations</p>
                  <p className="text-2xl font-semibold text-pink-400">{causalMetrics?.strategicAdaptations}</p>
                </div>
                <Activity className="h-8 w-8 text-pink-400" />
              </div>
            </motion.div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Causal Engine</span>
                <div className="flex items-center space-x-1">
                  {getSystemStatusIcon(systemPerformance?.causalInferenceEngine)}
                  <span className="text-xs text-green-400">{systemPerformance?.causalInferenceEngine}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Regime Detection</span>
                <div className="flex items-center space-x-1">
                  {getSystemStatusIcon(systemPerformance?.regimeDetectionSystem)}
                  <span className="text-xs text-green-400">{systemPerformance?.regimeDetectionSystem}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Strategy Optimizer</span>
                <div className="flex items-center space-x-1">
                  {getSystemStatusIcon(systemPerformance?.strategicOptimizer)}
                  <span className="text-xs text-green-400">{systemPerformance?.strategicOptimizer}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Analytics Center</span>
                <div className="flex items-center space-x-1">
                  {getSystemStatusIcon(systemPerformance?.analyticsCenter)}
                  <span className="text-xs text-green-400">{systemPerformance?.analyticsCenter}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {error && (
        <motion.div 
          className="bg-red-900/20 border border-red-500 text-red-400 p-4 m-4 rounded-lg"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <CausalDiscoveryEngine 
              causalMetrics={causalMetrics}
              onMetricsUpdate={setCausalMetrics}
            />
            <MarketRegimeDetection 
              regimeStatus={regimeStatus}
              onRegimeUpdate={setRegimeStatus}
            />
          </motion.div>

          {/* Center Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <CausalImpactDashboard 
              causalMetrics={causalMetrics}
              regimeStatus={regimeStatus}
              onUpdate={loadCausalData}
            />
            <RegimeAwareStrategyOptimization 
              regimeStatus={regimeStatus}
              strategicAdaptations={causalMetrics?.strategicAdaptations}
              onStrategyUpdate={(adaptations) => 
                setCausalMetrics(prev => ({ ...prev, strategicAdaptations: adaptations }))
              }
            />
          </motion.div>

          {/* Right Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <AdvancedAnalyticsCenter 
              systemPerformance={systemPerformance}
              causalMetrics={causalMetrics}
              onSystemUpdate={setSystemPerformance}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}