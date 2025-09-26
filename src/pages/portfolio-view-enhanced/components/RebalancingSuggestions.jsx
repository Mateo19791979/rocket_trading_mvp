import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { portfolioEnhancedService } from '../../../services/portfolioEnhancedService';

const RebalancingSuggestions = ({ portfolioId, currentAllocation, loading }) => {
  const [targetAllocation, setTargetAllocation] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [customTargets, setCustomTargets] = useState(false);

  // Default target allocations
  const defaultTargets = {
    'Technology': 25,
    'Healthcare': 15,
    'Financial Services': 15,
    'Consumer Cyclical': 10,
    'Industrials': 10,
    'Consumer Defensive': 8,
    'Energy': 7,
    'Real Estate': 5,
    'Materials': 3,
    'Utilities': 2
  };

  useEffect(() => {
    if (currentAllocation && Object.keys(currentAllocation)?.length > 0) {
      // Initialize with current sectors and default targets
      const initialTargets = {};
      Object.keys(currentAllocation)?.forEach(sector => {
        initialTargets[sector] = defaultTargets?.[sector] || 10;
      });
      setTargetAllocation(initialTargets);
    }
  }, [currentAllocation]);

  useEffect(() => {
    if (portfolioId && Object.keys(targetAllocation)?.length > 0) {
      generateSuggestions();
    }
  }, [portfolioId, targetAllocation, currentAllocation]);

  const generateSuggestions = async () => {
    try {
      const rebalancingSuggestions = await portfolioEnhancedService?.getRebalancingSuggestions(
        portfolioId, 
        targetAllocation
      );
      setSuggestions(rebalancingSuggestions);
    } catch (error) {
      console.error('Failed to generate rebalancing suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleTargetChange = (sector, value) => {
    setTargetAllocation(prev => ({
      ...prev,
      [sector]: parseFloat(value) || 0
    }));
  };

  const resetToDefaults = () => {
    const resetTargets = {};
    Object.keys(currentAllocation || {})?.forEach(sector => {
      resetTargets[sector] = defaultTargets?.[sector] || 10;
    });
    setTargetAllocation(resetTargets);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-blue-400 bg-blue-900/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-600 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-600 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!currentAllocation || Object.keys(currentAllocation)?.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Target className="h-12 w-12 mx-auto mb-3 text-gray-600" />
        <div>No allocation data available for rebalancing</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-medium text-white">Target Allocation Setup</h4>
          <p className="text-sm text-gray-400">Set your desired sector allocation percentages</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCustomTargets(!customTargets)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
          >
            <Settings className="h-4 w-4 inline mr-2" />
            {customTargets ? 'Hide' : 'Customize'} Targets
          </button>
          {customTargets && (
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            >
              Reset Defaults
            </button>
          )}
        </div>
      </div>
      {/* Target Allocation Settings */}
      {customTargets && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-white mb-4">Target Sector Allocation (%)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(currentAllocation)?.map(sector => (
              <div key={sector} className="space-y-2">
                <label className="block text-sm text-gray-300">{sector}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={targetAllocation?.[sector] || 0}
                  onChange={(e) => handleTargetChange(sector, e?.target?.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          
          {/* Validation */}
          <div className="mt-4 text-sm">
            {(() => {
              const total = Object.values(targetAllocation)?.reduce((sum, val) => sum + (val || 0), 0);
              const isValid = Math.abs(total - 100) < 0.1;
              return (
                <div className={`px-3 py-2 rounded ${isValid ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>Total: {total?.toFixed(1)}% {isValid ? '✓ Valid' : '⚠ Should equal 100%'}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* Current vs Target Comparison */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h5 className="font-medium text-white mb-4">Current vs Target Allocation</h5>
        <div className="space-y-3">
          {Object.keys(currentAllocation)?.map(sector => {
            const current = currentAllocation?.[sector] || 0;
            const target = targetAllocation?.[sector] || 0;
            const difference = target - current;
            const isOverweight = difference < 0;
            
            return (
              <div key={sector} className="flex items-center justify-between p-3 bg-gray-600 rounded">
                <div className="flex-1">
                  <div className="font-medium text-white">{sector}</div>
                  <div className="text-sm text-gray-400">
                    Current: {current?.toFixed(1)}% | Target: {target?.toFixed(1)}%
                  </div>
                </div>
                <div className={`text-right ${isOverweight ? 'text-red-400' : 'text-green-400'}`}>
                  <div className="flex items-center space-x-1">
                    {isOverweight ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    <span className="font-semibold">
                      {Math.abs(difference)?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs">
                    {isOverweight ? 'Reduce' : 'Increase'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Rebalancing Suggestions */}
      {suggestions?.length > 0 ? (
        <div className="bg-gray-700 rounded-lg p-4">
          <h5 className="font-medium text-white mb-4">
            Rebalancing Actions ({suggestions?.length})
          </h5>
          <div className="space-y-3">
            {suggestions?.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(suggestion?.priority)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-white">{suggestion?.sector}</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(suggestion?.priority)}`}>
                    {suggestion?.priority?.toUpperCase()} PRIORITY
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">Current Allocation</div>
                    <div className="text-white font-medium">{suggestion?.currentAllocation?.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Target Allocation</div>
                    <div className="text-white font-medium">{suggestion?.targetAllocation?.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Action Required</div>
                    <div className={`font-medium ${suggestion?.action === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
                      {suggestion?.action?.toUpperCase()} by {Math.abs(suggestion?.difference || 0)?.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-900/20 border border-green-600 rounded-lg p-6 text-center">
          <Target className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h5 className="font-medium text-green-400 mb-2">Portfolio Well Balanced</h5>
          <p className="text-sm text-gray-300">
            Your current allocation is close to your target. No significant rebalancing needed.
          </p>
        </div>
      )}
      {/* Rebalancing Tips */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h5 className="font-medium text-white mb-3">💡 Rebalancing Tips</h5>
        <div className="space-y-2 text-sm text-gray-300">
          <div>• Consider tax implications when selling positions for rebalancing</div>
          <div>• Use new contributions to adjust allocation without selling</div>
          <div>• Rebalance gradually over time to reduce market timing risk</div>
          <div>• Focus on high-priority changes first to maximize impact</div>
        </div>
      </div>
    </div>
  );
};

export default RebalancingSuggestions;