import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  BarChart3,
  Play,
  Settings
} from 'lucide-react';
import { optionsScreeningService } from '@/services/aiLearningService';

export default function OptionsStrategyGenerator({ onStrategyGenerated }) {
  const [ticker, setTicker] = useState('AAPL');
  const [marketData, setMarketData] = useState({
    iv: 0.4,
    rv: 0.3,
    currentPrice: 150,
    trend: 'neutral'
  });
  const [generatingStrategies, setGeneratingStrategies] = useState(false);
  const [strategies, setStrategies] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateStrategies = async () => {
    try {
      setGeneratingStrategies(true);
      
      const result = await optionsScreeningService?.generateOptionsStrategies(ticker, marketData);
      if (result?.data) {
        setStrategies(result?.data?.strategies);
        if (onStrategyGenerated) {
          onStrategyGenerated(result?.data);
        }
      }
    } catch (error) {
      console.error('Strategy generation failed:', error);
    } finally {
      setGeneratingStrategies(false);
    }
  };

  const updateMarketData = (field, value) => {
    setMarketData(prev => ({ ...prev, [field]: value }));
  };

  const presetTickers = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 150, iv: 0.35 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 250, iv: 0.55 },
    { symbol: 'MSFT', name: 'Microsoft', price: 300, iv: 0.30 },
    { symbol: 'NVDA', name: 'NVIDIA', price: 400, iv: 0.45 },
    { symbol: 'SPY', name: 'SPDR S&P 500', price: 420, iv: 0.20 }
  ];

  const selectPresetTicker = (preset) => {
    setTicker(preset?.symbol);
    setMarketData(prev => ({
      ...prev,
      currentPrice: preset?.price,
      iv: preset?.iv,
      rv: preset?.iv * 0.8 // Assume RV is typically lower than IV
    }));
  };

  const getStrategyIcon = (type) => {
    switch (type) {
      case 'bull_call_spread':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'bear_call_spread':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'cash_secured_put':
        return <DollarSign className="h-5 w-5 text-blue-400" />;
      case 'long_call':
        return <Target className="h-5 w-5 text-purple-400" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStrategyColor = (type) => {
    switch (type) {
      case 'bull_call_spread':
        return 'border-green-500 text-green-400';
      case 'bear_call_spread':
        return 'border-red-500 text-red-400';
      case 'cash_secured_put':
        return 'border-blue-500 text-blue-400';
      case 'long_call':
        return 'border-purple-500 text-purple-400';
      default:
        return 'border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Zap className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Options Strategy Generator</h3>
            <p className="text-sm text-gray-400">AI-powered strategy creation and analysis</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      {/* Preset Tickers */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Popular Tickers</h4>
        <div className="grid grid-cols-5 gap-2">
          {presetTickers?.map((preset) => (
            <motion.button
              key={preset?.symbol}
              onClick={() => selectPresetTicker(preset)}
              className={`p-2 rounded-lg border transition-all text-sm ${
                ticker === preset?.symbol 
                  ? 'border-green-500 bg-green-600/20 text-green-400' :'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {preset?.symbol}
            </motion.button>
          ))}
        </div>
      </div>
      {/* Input Parameters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ticker Symbol
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e?.target?.value?.toUpperCase())}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 uppercase"
            placeholder="AAPL"
            maxLength="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Price ($)
          </label>
          <input
            type="number"
            value={marketData?.currentPrice}
            onChange={(e) => updateMarketData('currentPrice', parseFloat(e?.target?.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
            min="1"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Implied Volatility (IV)
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.01"
            value={marketData?.iv}
            onChange={(e) => updateMarketData('iv', parseFloat(e?.target?.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span className="text-blue-400">{(marketData?.iv * 100)?.toFixed(0)}%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Realized Volatility (RV)
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.01"
            value={marketData?.rv}
            onChange={(e) => updateMarketData('rv', parseFloat(e?.target?.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span className="text-purple-400">{(marketData?.rv * 100)?.toFixed(0)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      {/* Advanced Parameters */}
      {showAdvanced && (
        <motion.div 
          className="mb-6 bg-gray-800/30 rounded-lg p-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h4 className="text-sm font-semibold text-gray-300 mb-4">Advanced Parameters</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Market Trend
            </label>
            <select
              value={marketData?.trend}
              onChange={(e) => updateMarketData('trend', e?.target?.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-300"
            >
              <option value="bullish">Bullish</option>
              <option value="neutral">Neutral</option>
              <option value="bearish">Bearish</option>
            </select>
          </div>
        </motion.div>
      )}
      {/* Volatility Analysis */}
      <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Volatility Analysis</h4>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-sm text-gray-400">IV vs RV</p>
            <p className={`text-lg font-semibold ${
              marketData?.iv > marketData?.rv ? 'text-red-400' : 'text-green-400'
            }`}>
              {marketData?.iv > marketData?.rv ? 'Overpriced' : 'Underpriced'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Bias</p>
            <p className={`text-lg font-semibold ${
              marketData?.iv - marketData?.rv > 0.05 ? 'text-orange-400' : 'text-blue-400'
            }`}>
              {marketData?.iv - marketData?.rv > 0.05 ? 'Sell Vol' : 'Buy Vol'}
            </p>
          </div>
        </div>
      </div>
      {/* Generate Button */}
      <motion.button
        onClick={generateStrategies}
        disabled={generatingStrategies || !ticker}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600/20 border border-green-500 text-green-400 rounded-lg hover:bg-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Play className={`h-5 w-5 ${generatingStrategies ? 'animate-pulse' : ''}`} />
        <span>{generatingStrategies ? 'Generating...' : 'Generate Strategies'}</span>
      </motion.button>
      {/* Generated Strategies */}
      {strategies?.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-4">Recommended Strategies</h4>
          <div className="space-y-3">
            {strategies?.map((strategy, index) => (
              <motion.div
                key={index}
                className={`bg-gray-800/30 rounded-lg p-4 border ${getStrategyColor(strategy?.type)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStrategyIcon(strategy?.type)}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-200 capitalize">
                        {strategy?.type?.replace(/_/g, ' ')}
                      </h5>
                      <p className="text-xs text-gray-400">{strategy?.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">
                      {typeof strategy?.probability === 'number' ? (strategy?.probability * 100)?.toFixed(0) : 'N/A'}%
                    </p>
                    <p className="text-xs text-gray-400">Win Prob</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-400">Max Profit</p>
                    <p className="text-sm font-semibold text-green-400">
                      {typeof strategy?.maxProfit === 'number' ? `$${strategy?.maxProfit}` : strategy?.maxProfit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Max Loss</p>
                    <p className="text-sm font-semibold text-red-400">
                      ${Math.abs(strategy?.maxLoss)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Breakeven</p>
                    <p className="text-sm font-semibold text-blue-400">
                      ${strategy?.breakeven}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Delta: {strategy?.delta} | {strategy?.timeframe}
                  </div>
                  <button className="px-3 py-1 bg-green-600/20 border border-green-500/50 text-green-400 rounded text-xs hover:bg-green-600/30 transition-all">
                    Add to Paper Trading
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}