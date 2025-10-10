import { useState } from 'react';
import { Settings, Target, Sliders, Brain, Zap, Shield, Save, RefreshCw } from 'lucide-react';
import Icon from '@/components/AppIcon';


export default function BiddingStrategyConfiguration({ agentPerformance, onConfigUpdate }) {
  const [strategies, setStrategies] = useState({
    aggressive: {
      name: 'Aggressive Bidding',
      enabled: true,
      baseBidMultiplier: 1.5,
      priorityWeight: 0.8,
      maxBidAmount: 25000,
      description: 'High bids for critical tasks with maximum priority weighting'
    },
    conservative: {
      name: 'Conservative Bidding',
      enabled: true,
      baseBidMultiplier: 0.7,
      priorityWeight: 0.4,
      maxBidAmount: 10000,
      description: 'Lower bids with cost optimization focus'
    },
    adaptive: {
      name: 'Adaptive Bidding',
      enabled: true,
      baseBidMultiplier: 1.0,
      priorityWeight: 0.6,
      maxBidAmount: 15000,
      description: 'Dynamically adjusts based on market conditions'
    },
    fairness: {
      name: 'Fair Allocation',
      enabled: false,
      baseBidMultiplier: 1.0,
      priorityWeight: 0.3,
      maxBidAmount: 12000,
      description: 'Ensures equitable resource distribution across agents'
    }
  });

  const [selectedStrategy, setSelectedStrategy] = useState('adaptive');
  const [customConfig, setCustomConfig] = useState({
    maxConcurrentBids: 5,
    bidTimeoutMinutes: 30,
    emergencyReserve: 100000,
    autoRebalanceEnabled: true,
    performanceThreshold: 0.7
  });

  const handleStrategyToggle = (strategyKey) => {
    setStrategies(prev => ({
      ...prev,
      [strategyKey]: {
        ...prev?.[strategyKey],
        enabled: !prev?.[strategyKey]?.enabled
      }
    }));
  };

  const handleStrategyUpdate = (strategyKey, field, value) => {
    setStrategies(prev => ({
      ...prev,
      [strategyKey]: {
        ...prev?.[strategyKey],
        [field]: value
      }
    }));
  };

  const handleSaveConfiguration = async () => {
    try {
      // In a real implementation, this would save to backend
      console.log('Saving bidding configuration:', { strategies, customConfig });
      if (onConfigUpdate) {
        await onConfigUpdate();
      }
      alert('Configuration saved successfully!');
    } catch (error) {
      alert('Failed to save configuration: ' + error?.message);
    }
  };

  const getStrategyIcon = (strategyKey) => {
    switch (strategyKey) {
      case 'aggressive': return Zap;
      case 'conservative': return Shield;
      case 'adaptive': return Brain;
      case 'fairness': return Target;
      default: return Settings;
    }
  };

  const getStrategyColor = (strategyKey) => {
    switch (strategyKey) {
      case 'aggressive': return 'from-red-500 to-orange-500';
      case 'conservative': return 'from-green-500 to-blue-500';
      case 'adaptive': return 'from-purple-500 to-pink-500';
      case 'fairness': return 'from-blue-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Bidding Strategy Configuration</h3>
              <p className="text-gray-400 text-sm">Optimize resource allocation strategies</p>
            </div>
          </div>
          
          <button
            onClick={handleSaveConfiguration}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Config</span>
          </button>
        </div>

        {/* Strategy Cards */}
        <div className="space-y-4 mb-6">
          {Object.entries(strategies)?.map(([key, strategy]) => {
            const Icon = getStrategyIcon(key);
            const colorClass = getStrategyColor(key);
            
            return (
              <div 
                key={key}
                className={`bg-gray-900/50 rounded-lg border-2 transition-all ${
                  selectedStrategy === key 
                    ? 'border-blue-500 bg-blue-900/20' :'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="p-4">
                  {/* Strategy Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer"
                      onClick={() => setSelectedStrategy(key)}
                    >
                      <div className={`bg-gradient-to-r ${colorClass} p-2 rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{strategy?.name}</h4>
                        <p className="text-gray-400 text-sm">{strategy?.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStrategyToggle(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          strategy?.enabled ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            strategy?.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Strategy Configuration */}
                  {selectedStrategy === key && (
                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Base Bid Multiplier */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Base Bid Multiplier
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0.1"
                              max="2.0"
                              step="0.1"
                              value={strategy?.baseBidMultiplier}
                              onChange={(e) => handleStrategyUpdate(key, 'baseBidMultiplier', parseFloat(e?.target?.value))}
                              className="flex-1"
                            />
                            <span className="text-white text-sm font-semibold w-12">
                              {strategy?.baseBidMultiplier}x
                            </span>
                          </div>
                        </div>

                        {/* Priority Weight */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Priority Weight
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0.0"
                              max="1.0"
                              step="0.1"
                              value={strategy?.priorityWeight}
                              onChange={(e) => handleStrategyUpdate(key, 'priorityWeight', parseFloat(e?.target?.value))}
                              className="flex-1"
                            />
                            <span className="text-white text-sm font-semibold w-12">
                              {(strategy?.priorityWeight * 100)?.toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* Max Bid Amount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Max Bid Amount (Tokens)
                          </label>
                          <input
                            type="number"
                            value={strategy?.maxBidAmount}
                            onChange={(e) => handleStrategyUpdate(key, 'maxBidAmount', parseInt(e?.target?.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                            min="1000"
                            max="50000"
                            step="1000"
                          />
                        </div>

                        {/* Strategy Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={strategy?.description}
                            onChange={(e) => handleStrategyUpdate(key, 'description', e?.target?.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                            rows="2"
                          />
                        </div>
                      </div>

                      {/* Strategy Performance Preview */}
                      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                        <h5 className="text-white font-medium mb-2">Expected Performance</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-400">
                              {Math.round(strategy?.baseBidMultiplier * strategy?.priorityWeight * 100)}%
                            </div>
                            <div className="text-gray-400 text-xs">Win Rate</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-400">
                              {Math.round(strategy?.maxBidAmount * strategy?.baseBidMultiplier)}
                            </div>
                            <div className="text-gray-400 text-xs">Avg Bid</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-400">
                              {(strategy?.priorityWeight * 10)?.toFixed(1)}
                            </div>
                            <div className="text-gray-400 text-xs">Priority Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Configuration */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-5 h-5 text-gray-400" />
            <h4 className="text-white font-semibold">Global Configuration</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Concurrent Bids
              </label>
              <input
                type="number"
                value={customConfig?.maxConcurrentBids}
                onChange={(e) => setCustomConfig(prev => ({
                  ...prev,
                  maxConcurrentBids: parseInt(e?.target?.value)
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bid Timeout (Minutes)
              </label>
              <input
                type="number"
                value={customConfig?.bidTimeoutMinutes}
                onChange={(e) => setCustomConfig(prev => ({
                  ...prev,
                  bidTimeoutMinutes: parseInt(e?.target?.value)
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                min="5"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Emergency Reserve (Tokens)
              </label>
              <input
                type="number"
                value={customConfig?.emergencyReserve}
                onChange={(e) => setCustomConfig(prev => ({
                  ...prev,
                  emergencyReserve: parseInt(e?.target?.value)
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                min="10000"
                max="500000"
                step="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Performance Threshold
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={customConfig?.performanceThreshold}
                  onChange={(e) => setCustomConfig(prev => ({
                    ...prev,
                    performanceThreshold: parseFloat(e?.target?.value)
                  }))}
                  className="flex-1"
                />
                <span className="text-white text-sm font-semibold w-12">
                  {(customConfig?.performanceThreshold * 100)?.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Auto Rebalance Toggle */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <div>
                  <h5 className="text-white font-medium">Auto Rebalance</h5>
                  <p className="text-gray-400 text-sm">Automatically adjust strategies based on performance</p>
                </div>
              </div>
              <button
                onClick={() => setCustomConfig(prev => ({
                  ...prev,
                  autoRebalanceEnabled: !prev?.autoRebalanceEnabled
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  customConfig?.autoRebalanceEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    customConfig?.autoRebalanceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}