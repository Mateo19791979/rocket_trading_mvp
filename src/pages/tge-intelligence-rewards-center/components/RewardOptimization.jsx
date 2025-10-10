import React, { useState, useEffect } from 'react';
import { Settings, BarChart3, Target, Play, RefreshCw } from 'lucide-react';
import { aiOps } from '../../../lib/aiOpsClient';

export default function RewardOptimization() {
  const [optimizationData, setOptimizationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testScenario, setTestScenario] = useState({
    sources: 'icoanalytics.com,coinlaunch.io,cryptorank.io',
    iterations: 100,
    learningRate: 0.1
  });

  useEffect(() => {
    loadOptimizationData();
  }, []);

  const loadOptimizationData = async () => {
    setLoading(true);
    try {
      // Simulate optimization analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock optimization data
      setOptimizationData({
        currentPerformance: {
          avgSuccessRate: 0.78,
          totalPulls: 156,
          totalReward: 121.8,
          efficiency: 0.781
        },
        recommendations: [
          {
            type: 'thompson_sampling',
            title: 'Optimize Thompson Sampling Parameters',
            description: 'Adjust beta distribution parameters for better exploration vs exploitation balance',
            expectedImprovement: 0.12,
            confidence: 0.85,
            implementation: 'Update bandit algorithm with alpha=2, beta=1 priors'
          },
          {
            type: 'source_weighting',
            title: 'Dynamic Source Weighting',
            description: 'Implement time-decay weighting for recent performance',
            expectedImprovement: 0.08,
            confidence: 0.72,
            implementation: 'Add exponential decay factor λ=0.95 for historical rewards'
          },
          {
            type: 'contextual_bandits',
            title: 'Context-Aware Selection',
            description: 'Use market conditions and TGE type as context features',
            expectedImprovement: 0.15,
            confidence: 0.68,
            implementation: 'Integrate market volatility and TGE category features'
          }
        ],
        backtest: {
          scenarios: [
            { name: 'Current Strategy', successRate: 0.78, totalReward: 121.8 },
            { name: 'Optimized Thompson', successRate: 0.84, totalReward: 142.3 },
            { name: 'Dynamic Weighting', successRate: 0.81, totalReward: 135.7 },
            { name: 'Contextual Bandits', successRate: 0.87, totalReward: 156.9 }
          ]
        }
      });
    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runOptimizationTest = async () => {
    setLoading(true);
    try {
      const sources = testScenario?.sources?.split(',')?.map(s => s?.trim())?.filter(Boolean);
      const results = [];
      
      // Simulate multiple bandit selections to test optimization
      for (let i = 0; i < testScenario?.iterations; i++) {
        const result = await aiOps?.pickSource(sources);
        if (result?.ok) {
          results?.push(result?.chosen);
        }
        
        // Add small delay to simulate real testing
        if (i % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Analyze results
      const distribution = {};
      results?.forEach(source => {
        distribution[source] = (distribution?.[source] || 0) + 1;
      });
      
      // Calculate success metrics
      const testResults = Object.entries(distribution)?.map(([source, count]) => ({
        source,
        selections: count,
        percentage: ((count / results?.length) * 100)?.toFixed(1)
      }));
      
      alert(`Optimization test completed!\n\nResults (${testScenario?.iterations} iterations):\n${testResults?.map(r => `${r?.source}: ${r?.selections} (${r?.percentage}%)`)?.join('\n')}`);
      
    } catch (error) {
      alert(`Optimization test failed: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !optimizationData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading optimization analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      {optimizationData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {(optimizationData?.currentPerformance?.avgSuccessRate * 100)?.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-300">Average Success Rate</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {optimizationData?.currentPerformance?.totalPulls}
            </div>
            <div className="text-sm text-gray-300">Total Pulls</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">
              {optimizationData?.currentPerformance?.totalReward?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-300">Total Reward</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-400">
              {(optimizationData?.currentPerformance?.efficiency * 100)?.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-300">Efficiency Score</div>
          </div>
        </div>
      )}
      {/* Optimization Test */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Play className="w-5 h-5 text-purple-400 mr-2" />
          Bandit Algorithm Optimization Test
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Sources (comma-separated)
                </label>
                <input
                  type="text"
                  value={testScenario?.sources}
                  onChange={(e) => setTestScenario({ ...testScenario, sources: e?.target?.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="source1.com,source2.com,source3.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Iterations ({testScenario?.iterations})
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={testScenario?.iterations}
                  onChange={(e) => setTestScenario({ ...testScenario, iterations: parseInt(e?.target?.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Learning Rate ({testScenario?.learningRate})
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={testScenario?.learningRate}
                  onChange={(e) => setTestScenario({ ...testScenario, learningRate: parseFloat(e?.target?.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <button
              onClick={runOptimizationTest}
              disabled={loading || !testScenario?.sources?.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center mb-4"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Running Test...' : 'Run Optimization Test'}
            </button>
            
            <div className="text-sm text-gray-400">
              <p>This test will simulate {testScenario?.iterations} source selections using the Thompson Sampling algorithm to analyze optimization opportunities.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Optimization Recommendations */}
      {optimizationData?.recommendations && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 text-teal-400 mr-2" />
            Optimization Recommendations
          </h3>
          
          <div className="space-y-4">
            {optimizationData?.recommendations?.map((rec, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{rec?.title}</h4>
                    <p className="text-gray-300 text-sm mt-1">{rec?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      +{(rec?.expectedImprovement * 100)?.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">Expected improvement</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="text-gray-400 text-sm">Confidence Level:</span>
                    <div className="flex items-center mt-1">
                      <div className="flex-1 bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          className="h-2 bg-blue-400 rounded-full"
                          style={{ width: `${rec?.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">{(rec?.confidence * 100)?.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Implementation:</span>
                    <p className="text-white text-sm mt-1">{rec?.implementation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Backtest Results */}
      {optimizationData?.backtest && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-orange-400 mr-2" />
            Backtest Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-300 font-medium">Strategy</th>
                  <th className="pb-3 text-gray-300 font-medium">Success Rate</th>
                  <th className="pb-3 text-gray-300 font-medium">Total Reward</th>
                  <th className="pb-3 text-gray-300 font-medium">Improvement</th>
                  <th className="pb-3 text-gray-300 font-medium">Performance</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {optimizationData?.backtest?.scenarios?.map((scenario, index) => {
                  const baseline = optimizationData?.backtest?.scenarios?.[0];
                  const improvement = scenario?.totalReward > baseline?.totalReward 
                    ? ((scenario?.totalReward - baseline?.totalReward) / baseline?.totalReward * 100)
                    : 0;
                  
                  return (
                    <tr key={index} className="border-b border-gray-700/50">
                      <td className="py-3">
                        <span className={`font-medium ${index === 0 ? 'text-gray-300' : 'text-white'}`}>
                          {scenario?.name}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-white">{(scenario?.successRate * 100)?.toFixed(1)}%</span>
                      </td>
                      <td className="py-3">
                        <span className="text-white">{scenario?.totalReward?.toFixed(1)}</span>
                      </td>
                      <td className="py-3">
                        <span className={improvement > 0 ? 'text-green-400' : 'text-gray-400'}>
                          {improvement > 0 ? '+' : ''}{improvement?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="w-24 bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-gray-400' :
                              improvement > 10 ? 'bg-green-400' :
                              improvement > 5 ? 'bg-yellow-400' : 'bg-blue-400'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (scenario?.totalReward / Math.max(...optimizationData?.backtest?.scenarios?.map(s => s?.totalReward))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Algorithm Insights */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 text-purple-400 mr-2" />
          Algorithm Insights & Best Practices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Thompson Sampling Advantages</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-green-400 font-medium">✓ Bayesian Approach</div>
                <p className="text-gray-300">Naturally handles uncertainty in source performance</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-green-400 font-medium">✓ Exploration vs Exploitation</div>
                <p className="text-gray-300">Balances trying new sources with using proven ones</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-green-400 font-medium">✓ Adaptive Learning</div>
                <p className="text-gray-300">Performance improves automatically over time</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Optimization Strategies</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-purple-400 font-medium">Time-Based Weighting</div>
                <p className="text-gray-300">Recent performance matters more than historical</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-purple-400 font-medium">Contextual Features</div>
                <p className="text-gray-300">Market conditions affect source reliability</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="text-purple-400 font-medium">Multi-Armed Bandits</div>
                <p className="text-gray-300">Each source is an independent arm to optimize</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}