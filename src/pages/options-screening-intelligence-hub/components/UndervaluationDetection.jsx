import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, DollarSign, Award, Target, AlertTriangle, Star } from 'lucide-react';

export default function UndervaluationDetection({ undervaluedStocks }) {
  const [sortBy, setSortBy] = useState('pe_zscore');
  const [showDetails, setShowDetails] = useState({});

  const sortedStocks = [...(undervaluedStocks || [])]?.sort((a, b) => {
    switch (sortBy) {
      case 'pe_zscore':
        return (a?.pe_zscore || 0) - (b?.pe_zscore || 0);
      case 'composite_score':
        return (b?.composite_score || 0) - (a?.composite_score || 0);
      case 'quality_score':
        return (b?.quality_score || 0) - (a?.quality_score || 0);
      default:
        return 0;
    }
  });

  const toggleDetails = (index) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev?.[index]
    }));
  };

  const getValuationRating = (peZscore) => {
    if (peZscore < -2) return { rating: 'Deep Value', color: 'text-green-400', icon: Star };
    if (peZscore < -1) return { rating: 'Undervalued', color: 'text-blue-400', icon: TrendingDown };
    if (peZscore < 0) return { rating: 'Fair Value', color: 'text-yellow-400', icon: Target };
    return { rating: 'Overvalued', color: 'text-red-400', icon: AlertTriangle };
  };

  const getQualityBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-600/20 text-green-400 border-green-500' };
    if (score >= 80) return { label: 'Good', color: 'bg-blue-600/20 text-blue-400 border-blue-500' };
    if (score >= 70) return { label: 'Average', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500' };
    return { label: 'Poor', color: 'bg-red-600/20 text-red-400 border-red-500' };
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Undervaluation Detection</h3>
            <p className="text-sm text-gray-400">AI-powered value opportunity identification</p>
          </div>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e?.target?.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300"
        >
          <option value="pe_zscore">By P/E Z-Score</option>
          <option value="composite_score">By Quality Score</option>
          <option value="quality_score">By Quality Rating</option>
        </select>
      </div>
      {/* Value Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Deep Value</p>
              <p className="text-2xl font-semibold text-green-400">
                {sortedStocks?.filter(s => s?.pe_zscore < -2)?.length || 0}
              </p>
            </div>
            <Star className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Undervalued</p>
              <p className="text-2xl font-semibold text-blue-400">
                {sortedStocks?.filter(s => s?.pe_zscore >= -2 && s?.pe_zscore < -1)?.length || 0}
              </p>
            </div>
            <TrendingDown className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">High Quality</p>
              <p className="text-2xl font-semibold text-purple-400">
                {sortedStocks?.filter(s => s?.quality_score >= 80)?.length || 0}
              </p>
            </div>
            <Award className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
      {/* Undervalued Stocks List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedStocks?.map((stock, index) => {
          const valuation = getValuationRating(stock?.pe_zscore);
          const quality = getQualityBadge(stock?.quality_score);
          const IconComponent = valuation?.icon;
          const isDetailsOpen = showDetails?.[index];

          return (
            <motion.div
              key={index}
              className="bg-gray-800/30 rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleDetails(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-5 w-5 ${valuation?.color}`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-200">
                        {stock?.assets?.symbol || 'N/A'}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs border ${quality?.color}`}>
                        {quality?.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {stock?.assets?.name || 'Unknown Company'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-semibold ${valuation?.color}`}>
                    {stock?.pe_zscore?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">P/E Z-Score</p>
                </div>
              </div>
              {/* Quick Metrics */}
              <div className="mt-3 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Quality</p>
                  <p className="text-sm font-semibold text-purple-400">
                    {stock?.quality_score || 'N/A'}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ROE</p>
                  <p className="text-sm font-semibold text-green-400">
                    {stock?.roe ? (stock?.roe * 100)?.toFixed(1) + '%' : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">ROIC</p>
                  <p className="text-sm font-semibold text-blue-400">
                    {stock?.roic ? (stock?.roic * 100)?.toFixed(1) + '%' : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Composite</p>
                  <p className="text-sm font-semibold text-orange-400">
                    {stock?.composite_score || 'N/A'}/100
                  </p>
                </div>
              </div>
              {/* Detailed Analysis */}
              {isDetailsOpen && (
                <motion.div
                  className="mt-4 pt-4 border-t border-gray-700"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-gray-300 mb-2">Valuation Metrics</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">P/E Z-Score</span>
                          <span className={`text-xs ${valuation?.color}`}>
                            {stock?.pe_zscore?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Sector Performance</span>
                          <span className="text-xs text-gray-300">
                            {stock?.performance_vs_sector ? (stock?.performance_vs_sector * 100)?.toFixed(1) + '%' : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <h5 className="text-xs font-semibold text-gray-300 mb-2">Quality Metrics</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Momentum Score</span>
                          <span className="text-xs text-blue-400">
                            {stock?.momentum_score || 'N/A'}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">Valuation Score</span>
                          <span className="text-xs text-green-400">
                            {stock?.valuation_score || 'N/A'}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Screening Date: {stock?.screening_date}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-600/20 border border-green-500/50 text-green-400 rounded text-xs hover:bg-green-600/30 transition-all">
                        Add to Watchlist
                      </button>
                      <button className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition-all">
                        View Options
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      {sortedStocks?.length === 0 && (
        <div className="bg-gray-800/20 rounded-lg p-8 text-center">
          <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No undervalued stocks found</p>
          <p className="text-sm text-gray-500 mt-1">
            Adjust screening criteria to find value opportunities
          </p>
        </div>
      )}
    </div>
  );
}