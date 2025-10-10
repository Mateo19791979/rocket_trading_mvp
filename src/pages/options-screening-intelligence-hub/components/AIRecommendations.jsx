import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Target, CheckCircle, Clock, Star } from 'lucide-react';

export default function AIRecommendations({ screeningData, onRecommendationApplied }) {
  const [recommendations, setRecommendations] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [screeningData]);

  const generateRecommendations = () => {
    if (!screeningData || screeningData?.length === 0) {
      setRecommendations([]);
      return;
    }

    setProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const newRecommendations = [
        {
          id: 1,
          type: 'premium_selling',
          title: 'High IV Premium Selling Opportunity',
          description: 'Multiple stocks showing IV rank > 70% with strong fundamentals',
          confidence: 87,
          priority: 'high',
          action: 'sell_premium',
          symbols: screeningData?.filter(s => s?.iv_rank > 70)?.slice(0, 3)?.map(s => s?.assets?.symbol)?.filter(Boolean),
          reasoning: 'Elevated implied volatility provides attractive premium collection opportunities',
          timeframe: '30-45 days',
          risk_level: 'moderate',
          expected_return: '8-12%'
        },
        {
          id: 2,
          type: 'value_play',
          title: 'Undervalued Quality Stocks',
          description: 'Deep value opportunities with strong quality metrics',
          confidence: 92,
          priority: 'high',
          action: 'buy_value',
          symbols: screeningData?.filter(s => s?.pe_zscore < -1 && s?.quality_score > 80)?.slice(0, 2)?.map(s => s?.assets?.symbol)?.filter(Boolean),
          reasoning: 'Low P/E ratios combined with high-quality fundamentals indicate potential mean reversion',
          timeframe: '3-6 months',
          risk_level: 'low',
          expected_return: '15-25%'
        },
        {
          id: 3,
          type: 'momentum_breakout',
          title: 'Momentum Breakout Candidates',
          description: 'Stocks showing technical breakout patterns with volume confirmation',
          confidence: 73,
          priority: 'medium',
          action: 'buy_momentum',
          symbols: screeningData?.filter(s => s?.momentum_score > 80)?.slice(0, 2)?.map(s => s?.assets?.symbol)?.filter(Boolean),
          reasoning: 'Strong momentum indicators suggest continuation of upward price movement',
          timeframe: '2-4 weeks',
          risk_level: 'high',
          expected_return: '10-20%'
        }
      ];

      setRecommendations(newRecommendations?.filter(r => r?.symbols?.length > 0));
      setProcessing(false);
    }, 1500);
  };

  const applyRecommendation = (recommendation) => {
    // Simulate applying recommendation
    console.log('Applying recommendation:', recommendation);
    if (onRecommendationApplied) {
      onRecommendationApplied();
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'premium_selling':
        return <TrendingDown className="h-5 w-5 text-orange-400" />;
      case 'value_play':
        return <Target className="h-5 w-5 text-green-400" />;
      case 'momentum_breakout':
        return <TrendingUp className="h-5 w-5 text-blue-400" />;
      default:
        return <Brain className="h-5 w-5 text-purple-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 text-red-400';
      case 'medium':
        return 'border-yellow-500 text-yellow-400';
      case 'low':
        return 'border-green-500 text-green-400';
      default:
        return 'border-gray-500 text-gray-400';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 85) return 'text-green-400';
    if (confidence >= 70) return 'text-blue-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-400';
      case 'moderate':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Brain className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">AI Recommendations</h3>
            <p className="text-sm text-gray-400">Intelligent strategy suggestions with confidence scoring</p>
          </div>
        </div>
        
        {processing && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
            <span className="text-sm text-gray-400">Analyzing...</span>
          </div>
        )}
      </div>
      {/* AI Processing Status */}
      <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-300">AI Analysis Status</h4>
          <div className="flex items-center space-x-2">
            {processing ? (
              <>
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">Processing</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-400">Complete</span>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-purple-400">{screeningData?.length || 0}</p>
            <p className="text-xs text-gray-400">Stocks Analyzed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-400">{recommendations?.length}</p>
            <p className="text-xs text-gray-400">Recommendations</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-green-400">
              {recommendations?.length > 0 
                ? Math.round(recommendations?.reduce((sum, r) => sum + r?.confidence, 0) / recommendations?.length)
                : 0
              }%
            </p>
            <p className="text-xs text-gray-400">Avg Confidence</p>
          </div>
        </div>
      </div>
      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations?.map((rec, index) => (
          <motion.div
            key={rec?.id}
            className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                {getRecommendationIcon(rec?.type)}
                <div>
                  <h5 className="text-sm font-semibold text-gray-200">{rec?.title}</h5>
                  <p className="text-xs text-gray-400 mt-1">{rec?.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(rec?.priority)}`}>
                  {rec?.priority}
                </span>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getConfidenceColor(rec?.confidence)}`}>
                    {rec?.confidence}%
                  </p>
                  <p className="text-xs text-gray-500">Confidence</p>
                </div>
              </div>
            </div>

            {/* Symbols */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Target Symbols:</p>
              <div className="flex items-center space-x-2">
                {rec?.symbols?.map((symbol, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400">Expected Return</p>
                <p className="text-sm font-semibold text-green-400">{rec?.expected_return}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Timeframe</p>
                <p className="text-sm font-semibold text-blue-400">{rec?.timeframe}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Risk Level</p>
                <p className={`text-sm font-semibold ${getRiskLevelColor(rec?.risk_level)}`}>
                  {rec?.risk_level}
                </p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="mb-4 bg-gray-700/30 rounded p-3">
              <p className="text-xs text-gray-400 mb-1">AI Reasoning:</p>
              <p className="text-xs text-gray-300">{rec?.reasoning}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <motion.button
                onClick={() => applyRecommendation(rec)}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-purple-600/20 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Star className="h-4 w-4" />
                <span>Apply Strategy</span>
              </motion.button>
              
              <button className="px-3 py-2 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700/70 transition-all text-sm">
                Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {recommendations?.length === 0 && !processing && (
        <div className="bg-gray-800/20 rounded-lg p-8 text-center">
          <Brain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No recommendations available</p>
          <p className="text-sm text-gray-500 mt-1">
            Run the screener to get AI-powered recommendations
          </p>
        </div>
      )}
    </div>
  );
}