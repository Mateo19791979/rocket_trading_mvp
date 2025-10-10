import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, Target, DollarSign, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { optionsScreeningService } from '@/services/aiLearningService';
import IntelligentScreener from './components/IntelligentScreener';
import OptionsStrategyGenerator from './components/OptionsStrategyGenerator';
import UndervaluationDetection from './components/UndervaluationDetection';
import StrategyAnalyticsDashboard from './components/StrategyAnalyticsDashboard';
import AIRecommendations from './components/AIRecommendations';

export default function OptionsScreeningIntelligenceHub() {
  const [screeningResults, setScreeningResults] = useState([]);
  const [optionsStrategies, setOptionsStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('screener');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [screeningResult, strategiesResult] = await Promise.all([
        optionsScreeningService?.screenEquitiesForOptions(),
        optionsScreeningService?.getOptionsStrategies()
      ]);

      if (screeningResult?.data) setScreeningResults(screeningResult?.data);
      if (strategiesResult?.data) setOptionsStrategies(strategiesResult?.data);
      
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      setError(`Failed to load options data: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Options Intelligence Hub...</p>
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

  // Calculate key metrics
  const highIVOpportunities = screeningResults?.filter(r => r?.iv_rank > 70)?.length || 0;
  const undervaluedStocks = screeningResults?.filter(r => r?.pe_zscore < -1)?.length || 0;
  const totalOpportunities = screeningResults?.length || 0;
  const avgCompositeScore = screeningResults?.length > 0 
    ? (screeningResults?.reduce((sum, r) => sum + r?.composite_score, 0) / screeningResults?.length)?.toFixed(1)
    : '0.0';

  return (
    <motion.div 
      className="min-h-screen bg-gray-950 text-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border-b border-blue-800/30"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  Options Screening Intelligence Hub
                </h1>
                <p className="text-gray-400 mt-1">
                  AI-powered options strategy discovery and undervalued stock identification
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Last Scan</p>
                <p className="text-sm text-gray-300">{lastUpdate?.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Opportunities</p>
                  <p className="text-2xl font-semibold text-gray-100">{totalOpportunities}</p>
                </div>
                <Search className="h-8 w-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">High IV Opportunities</p>
                  <p className="text-2xl font-semibold text-orange-400">{highIVOpportunities}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Undervalued Stocks</p>
                  <p className="text-2xl font-semibold text-green-400">{undervaluedStocks}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Quality Score</p>
                  <p className="text-2xl font-semibold text-purple-400">{avgCompositeScore}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </motion.div>
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <IntelligentScreener 
              screeningResults={screeningResults}
              onScreeningUpdate={setScreeningResults}
            />
            <OptionsStrategyGenerator 
              onStrategyGenerated={(strategy) => {
                setOptionsStrategies(prev => [strategy, ...prev]);
              }}
            />
            <UndervaluationDetection 
              undervaluedStocks={screeningResults?.filter(r => r?.pe_zscore < -0.5) || []}
            />
          </motion.div>

          {/* Right Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <StrategyAnalyticsDashboard 
              strategies={optionsStrategies}
              screeningResults={screeningResults}
            />
            <AIRecommendations 
              screeningData={screeningResults}
              onRecommendationApplied={loadInitialData}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}