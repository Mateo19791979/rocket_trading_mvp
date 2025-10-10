import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Award, Play, BarChart3 } from 'lucide-react';
import { aiLearningService } from '@/services/aiLearningService';

export default function BanditAlgorithmController({ sourceStats, onUpdate }) {
  const [testing, setTesting] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);
  const [testResult, setTestResult] = useState(null);

  const testBanditSelection = async () => {
    if (selectedSources?.length === 0) {
      console.warn('No sources selected for testing');
      return;
    }

    try {
      setTesting(true);
      
      // Test bandit algorithm with selected sources
      const result = await aiLearningService?.pickSource(selectedSources);
      if (result?.data) {
        setTestResult({
          chosen: result?.data?.chosen,
          timestamp: new Date(),
          candidates: selectedSources,
          algorithm: 'Thompson Sampling'
        });
      }
    } catch (error) {
      console.error('Bandit test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const rewardSource = async (source, success) => {
    try {
      await aiLearningService?.rewardSource(source, success);
      
      // Refresh source stats
      const statsResult = await aiLearningService?.getSourceStats();
      if (statsResult?.data && onUpdate) {
        onUpdate(statsResult?.data);
      }
    } catch (error) {
      console.error('Failed to reward source:', error);
    }
  };

  const toggleSourceSelection = (source) => {
    setSelectedSources(prev => 
      prev?.includes(source) 
        ? prev?.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const getSuccessRateColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return 'text-green-400';
    if (numRate >= 60) return 'text-blue-400';
    if (numRate >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const topPerformer = sourceStats?.reduce((best, current) => 
    parseFloat(current?.successRate) > parseFloat(best?.successRate || 0) ? current : best
  , null);

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-600/20 rounded-lg">
            <Zap className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Bandit Algorithm Controller</h3>
            <p className="text-sm text-gray-400">Multi-armed bandit optimization</p>
          </div>
        </div>
      </div>
      {/* Top Performer Highlight */}
      {topPerformer && (
        <div className="mb-6 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 rounded-lg p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-orange-400" />
              <div>
                <p className="text-sm font-semibold text-orange-400">Top Performer</p>
                <p className="text-lg text-gray-200">{topPerformer?.source}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-orange-400">{topPerformer?.successRate}%</p>
              <p className="text-sm text-gray-400">{topPerformer?.pulls} attempts</p>
            </div>
          </div>
        </div>
      )}
      {/* Bandit Testing Interface */}
      <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300">Thompson Sampling Test</h4>
          <button
            onClick={testBanditSelection}
            disabled={testing || selectedSources?.length === 0}
            className="flex items-center space-x-2 px-3 py-1 bg-orange-600/20 border border-orange-500 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Play className={`h-4 w-4 ${testing ? 'animate-pulse' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Selection'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {sourceStats?.slice(0, 6)?.map((source) => (
            <label
              key={source?.source}
              className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                selectedSources?.includes(source?.source) 
                  ? 'bg-orange-600/20 border border-orange-500' :'bg-gray-700/30 hover:bg-gray-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSources?.includes(source?.source)}
                onChange={() => toggleSourceSelection(source?.source)}
                className="rounded"
              />
              <span className="text-xs text-gray-300">{source?.source}</span>
            </label>
          ))}
        </div>

        {testResult && (
          <div className="mt-3 bg-gray-700/30 rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Selected Source:</p>
                <p className="text-lg font-semibold text-orange-400">{testResult?.chosen}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{testResult?.algorithm}</p>
                <p className="text-xs text-gray-500">{testResult?.timestamp?.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Source Performance Stats */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Source Performance</h4>
        
        {sourceStats?.map((source, index) => (
          <motion.div
            key={source?.source}
            className="bg-gray-800/30 rounded-lg p-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-300">{source?.source}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{source?.pulls} pulls</span>
                  <span>{source?.successes} successes</span>
                  <span>{source?.failures} failures</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-semibold ${getSuccessRateColor(source?.successRate)}`}>
                  {source?.successRate}%
                </p>
                <div className="flex items-center space-x-1">
                  {parseFloat(source?.successRate) > 50 ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className="text-xs text-gray-500">
                    Reward: {source?.last_reward?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Success Rate Bar */}
            <div className="bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  parseFloat(source?.successRate) >= 80 ? 'bg-green-400' :
                  parseFloat(source?.successRate) >= 60 ? 'bg-blue-400' :
                  parseFloat(source?.successRate) >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${source?.successRate}%` }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => rewardSource(source?.source, true)}
                className="flex-1 flex items-center justify-center space-x-1 py-1 px-2 bg-green-600/20 border border-green-500/50 text-green-400 rounded text-xs hover:bg-green-600/30 transition-all"
              >
                <TrendingUp className="h-3 w-3" />
                <span>Success</span>
              </button>
              <button
                onClick={() => rewardSource(source?.source, false)}
                className="flex-1 flex items-center justify-center space-x-1 py-1 px-2 bg-red-600/20 border border-red-500/50 text-red-400 rounded text-xs hover:bg-red-600/30 transition-all"
              >
                <TrendingDown className="h-3 w-3" />
                <span>Failure</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      {sourceStats?.length === 0 && (
        <div className="bg-gray-800/20 rounded-lg p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No source statistics available</p>
          <p className="text-sm text-gray-500 mt-1">
            Start using data sources to see performance metrics
          </p>
        </div>
      )}
    </div>
  );
}