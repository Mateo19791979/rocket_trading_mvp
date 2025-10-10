import { useState, useEffect } from 'react';
import { TrendingUp, Play, RotateCw, BarChart3, Target, Shield, AlertTriangle } from 'lucide-react';
import { syntheticMarketService } from '../../../services/syntheticMarket.js';
import { supabase } from '../../../lib/supabase.js';

export default function ForwardTestingMarketSimulator({ onLogAdd }) {
  const [forwardTests, setForwardTests] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [totalRuns, setTotalRuns] = useState(1000);
  const [stats, setStats] = useState({
    total_tests: 0,
    total_simulations: 0,
    avg_robustness_score: 0,
    high_risk_count: 0,
    low_risk_count: 0
  });
  const [loading, setLoading] = useState({
    tests: true,
    strategies: true,
    launching: false
  });
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadForwardTests(),
      loadStrategies(),
      loadStats(),
      loadRecommendations()
    ]);
  };

  const loadForwardTests = async () => {
    setLoading(prev => ({ ...prev, tests: true }));
    try {
      const result = await syntheticMarketService?.getForwardTestResults(null, 20);
      if (result?.success) {
        setForwardTests(result?.results || []);
      }
    } catch (error) {
      onLogAdd?.(`Error loading forward tests: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, tests: false }));
    }
  };

  const loadStrategies = async () => {
    setLoading(prev => ({ ...prev, strategies: true }));
    try {
      const { data, error } = await supabase
        ?.from('strategy_candidates')
        ?.select('id, spec_yaml, iqs, status')
        ?.order('iqs', { ascending: false })
        ?.limit(15);

      if (error) throw error;
      setStrategies(data || []);
    } catch (error) {
      onLogAdd?.(`Error loading strategies: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, strategies: false }));
    }
  };

  const loadStats = async () => {
    try {
      const result = await syntheticMarketService?.getSyntheticMarketStats();
      if (result?.success) {
        setStats(result?.stats);
      }
    } catch (error) {
      onLogAdd?.(`Error loading stats: ${error?.message}`, 'error');
    }
  };

  const loadRecommendations = async () => {
    try {
      const result = await syntheticMarketService?.getRecommendations(5);
      if (result?.success) {
        setRecommendations(result?.recommendations || []);
      }
    } catch (error) {
      onLogAdd?.(`Error loading recommendations: ${error?.message}`, 'error');
    }
  };

  const launchForwardTest = async (strategyId = null) => {
    setLoading(prev => ({ ...prev, launching: true }));
    try {
      const targetStrategyId = strategyId || selectedStrategy;
      
      if (!targetStrategyId) {
        onLogAdd?.('Please select a strategy to test', 'error');
        return;
      }

      onLogAdd?.(`Starting forward-test with ${totalRuns} simulations for strategy ${targetStrategyId?.slice(0, 8)}...`, 'info');
      
      const result = await syntheticMarketService?.runForwardTest(targetStrategyId, totalRuns);
      
      if (result?.success) {
        onLogAdd?.(`Forward-test launched successfully! Test ID: ${result?.test_id}`, 'success');
        // Reload data to show new test
        setTimeout(() => {
          loadAllData();
        }, 1500);
      } else {
        onLogAdd?.(`Forward-test failed: ${result?.error}`, 'error');
      }
    } catch (error) {
      onLogAdd?.(`Forward-test launch error: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, launching: false }));
    }
  };

  const getRobustnessColor = (score) => {
    const robustness = parseFloat(score) || 0;
    if (robustness >= 80) return 'text-green-400';
    if (robustness >= 60) return 'text-yellow-400';
    if (robustness >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRobustnessIcon = (score) => {
    const robustness = parseFloat(score) || 0;
    if (robustness >= 80) return Shield;
    if (robustness >= 60) return Target;
    return AlertTriangle;
  };

  const formatPnL = (pnl) => {
    const value = parseFloat(pnl) || 0;
    return value >= 0 ? `+$${value?.toFixed(2)}` : `-$${Math.abs(value)?.toFixed(2)}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Forward-Testing Market Simulator</h2>
            <p className="text-gray-400">1000 Possible Futures Simulation System</p>
          </div>
        </div>
        <button
          onClick={loadAllData}
          disabled={loading?.tests}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RotateCw className={`w-4 h-4 ${loading?.tests ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Total Tests</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total_tests}</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Simulations</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.total_simulations?.toLocaleString()}</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Avg Robustness</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats?.avg_robustness_score}%</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">Low Risk</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats?.low_risk_count}</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 text-sm">High Risk</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats?.high_risk_count}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Forward-Test Launch Panel */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Play className="w-5 h-5 text-blue-400" />
            <span>Launch Forward-Test</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Strategy to Test
              </label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e?.target?.value)}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
                disabled={loading?.strategies}
              >
                <option value="">Select a strategy...</option>
                {strategies?.map((strategy) => (
                  <option key={strategy?.id} value={strategy?.id}>
                    Strategy {strategy?.id?.slice(0, 8)}... (IQS: {strategy?.iqs})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Simulations
              </label>
              <select
                value={totalRuns}
                onChange={(e) => setTotalRuns(parseInt(e?.target?.value))}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
              >
                <option value={100}>100 (Quick Test)</option>
                <option value={500}>500 (Standard)</option>
                <option value={1000}>1,000 (Comprehensive)</option>
                <option value={5000}>5,000 (Ultra Deep)</option>
              </select>
            </div>

            <button
              onClick={() => launchForwardTest()}
              disabled={!selectedStrategy || loading?.launching}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading?.launching ? (
                <span className="flex items-center justify-center space-x-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Running Simulations...</span>
                </span>
              ) : (
                `Run ${totalRuns?.toLocaleString()} Simulations`
              )}
            </button>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-400" />
            <span>Top Recommendations</span>
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recommendations?.length > 0 ? (
              recommendations?.map((rec) => (
                <div
                  key={rec?.strategy_id}
                  className="bg-gray-600 p-3 rounded-lg border border-blue-500/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">
                      Strategy {rec?.strategy_id?.slice(0, 8)}...
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getPriorityColor(rec?.priority)}`}>
                      {rec?.priority?.toUpperCase()}
                    </span>
                  </div>
                  <div className={`text-sm font-medium mb-1 ${getRobustnessColor(rec?.robustness_score)}`}>
                    {rec?.robustness_score}% Robust • {formatPnL(rec?.avg_pnl)}
                  </div>
                  <div className="text-xs text-gray-300 mb-2">
                    {rec?.recommendation}
                  </div>
                  <button
                    onClick={() => launchForwardTest(rec?.strategy_id)}
                    disabled={loading?.launching}
                    className="w-full bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Test Again
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                No recommendations available
              </div>
            )}
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Market Analytics</span>
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-600 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Market Confidence</span>
                <span className="text-white font-semibold">{stats?.avg_robustness_score}%</span>
              </div>
              <div className="w-full bg-gray-500 h-2 rounded">
                <div 
                  className="h-2 bg-blue-400 rounded transition-all duration-500"
                  style={{ width: `${Math.min(100, stats?.avg_robustness_score || 0)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-600 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">Strategy Success Rate</span>
                <span className="text-white font-semibold">
                  {stats?.total_tests > 0 
                    ? Math.round((stats?.low_risk_count / stats?.total_tests) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-600 p-2 rounded text-center text-white">
                  {stats?.low_risk_count} Low Risk
                </div>
                <div className="bg-red-600 p-2 rounded text-center text-white">
                  {stats?.high_risk_count} High Risk
                </div>
              </div>
            </div>

            <div className="bg-gray-600 p-3 rounded">
              <div className="text-gray-300 text-sm mb-2">Total Processing Power</div>
              <div className="text-lg font-bold text-white">
                {(stats?.total_simulations || 0)?.toLocaleString()} simulations
              </div>
              <div className="text-xs text-gray-400">
                Across {stats?.total_tests} forward-tests
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Forward Tests */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Recent Forward-Tests</span>
        </h3>
        
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {loading?.tests ? (
              <div className="text-gray-400 text-center py-8">Loading forward-tests...</div>
            ) : forwardTests?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-600 sticky top-0">
                  <tr>
                    <th className="text-left text-gray-300 p-3 text-sm">Strategy</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Robustness</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Avg PnL</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Worst Case</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Simulations</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Test Date</th>
                  </tr>
                </thead>
                <tbody>
                  {forwardTests?.map((test) => {
                    const RobustnessIcon = getRobustnessIcon(test?.robustness_score);
                    return (
                      <tr key={test?.id} className="border-t border-gray-600 hover:bg-gray-600/50">
                        <td className="p-3 text-white text-sm">
                          {test?.strategy_id?.slice(0, 8)}...
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center space-x-2 ${getRobustnessColor(test?.robustness_score)}`}>
                            <RobustnessIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {Math.round((parseFloat(test?.robustness_score) || 0) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-white text-sm">
                          {formatPnL(test?.avg_pnl)}
                        </td>
                        <td className="p-3 text-red-400 text-sm">
                          {formatPnL(test?.worst_case_pnl)}
                        </td>
                        <td className="p-3 text-gray-300 text-sm">
                          {(test?.total_runs || 0)?.toLocaleString()}
                        </td>
                        <td className="p-3 text-gray-300 text-sm">
                          {new Date(test.created_at)?.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No forward-tests recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}