import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { aiOps } from '../../../lib/aiOpsClient';

export default function SourceRewardsPanel() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState('');
  const [banditTest, setBanditTest] = useState({ candidates: '', result: null, loading: false });

  useEffect(() => {
    loadSourceRewards();
  }, []);

  const loadSourceRewards = async () => {
    setLoading(true);
    try {
      const result = await aiOps?.getSourceRewards();
      if (result?.ok) {
        setSources(result?.data);
      }
    } catch (error) {
      console.error('Error loading source rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const testBanditSelection = async () => {
    if (!banditTest?.candidates?.trim()) return;
    
    setBanditTest(prev => ({ ...prev, loading: true }));
    try {
      const candidates = banditTest?.candidates?.split(',')?.map(s => s?.trim())?.filter(Boolean);
      const result = await aiOps?.pickSource(candidates);
      
      setBanditTest(prev => ({ 
        ...prev, 
        result: result?.ok ? result?.chosen : `Error: ${result?.error}`,
        loading: false
      }));
    } catch (error) {
      setBanditTest(prev => ({ 
        ...prev, 
        result: `Error: ${error?.message}`,
        loading: false
      }));
    }
  };

  const rewardSource = async (source, success) => {
    try {
      const result = await aiOps?.rewardSource(source, success);
      if (result?.ok) {
        setTestResult(`✅ Successfully updated ${source} with ${success ? 'success' : 'failure'}`);
        await loadSourceRewards(); // Refresh data
      } else {
        setTestResult(`❌ Failed to update ${source}: ${result?.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error?.message}`);
    }
    setTimeout(() => setTestResult(''), 3000);
  };

  const getReliabilityColor = (rate) => {
    if (rate >= 0.8) return 'text-green-400';
    if (rate >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getReliabilityBadge = (rate) => {
    if (rate >= 0.9) return 'Excellent';
    if (rate >= 0.8) return 'Good';
    if (rate >= 0.6) return 'Fair';
    return 'Poor';
  };

  const calculateSuccessRate = (source) => {
    const total = source?.pulls || 0;
    if (total === 0) return 0;
    return (source?.successes || 0) / total;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{sources?.length}</div>
          <div className="text-sm text-gray-300">Active Sources</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {sources?.reduce((sum, s) => sum + (s?.successes || 0), 0)}
          </div>
          <div className="text-sm text-gray-300">Total Successes</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">
            {sources?.reduce((sum, s) => sum + (s?.failures || 0), 0)}
          </div>
          <div className="text-sm text-gray-300">Total Failures</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {sources?.length > 0 
              ? (sources?.reduce((sum, s) => sum + calculateSuccessRate(s), 0) / sources?.length * 100)?.toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-gray-300">Avg Success Rate</div>
        </div>
      </div>
      {/* Bandit Algorithm Tester */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-orange-400 mr-2" />
          Thompson Sampling Bandit Test
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Candidate Sources (comma-separated)
            </label>
            <input
              type="text"
              value={banditTest?.candidates}
              onChange={(e) => setBanditTest(prev => ({ ...prev, candidates: e?.target?.value }))}
              placeholder="e.g. icoanalytics.com, coinlaunch.io, cryptorank.io"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={testBanditSelection}
              disabled={banditTest?.loading || !banditTest?.candidates?.trim()}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              {banditTest?.loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Award className="w-4 h-4 mr-2" />
              )}
              Pick Best Source
            </button>
            {banditTest?.result && (
              <div className="bg-gray-700 px-4 py-2 rounded-lg">
                <span className="text-gray-300">Selected: </span>
                <span className="text-orange-400 font-medium">{banditTest?.result}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Source Rewards Table */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Award className="w-5 h-5 text-teal-400 mr-2" />
            Source Performance & Rewards
          </h3>
          <button
            onClick={loadSourceRewards}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>

        {testResult && (
          <div className="mb-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-white">{testResult}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading source rewards...</p>
          </div>
        ) : sources?.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No source reward data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-300 font-medium">Source</th>
                  <th className="pb-3 text-gray-300 font-medium">Pulls</th>
                  <th className="pb-3 text-gray-300 font-medium">Successes</th>
                  <th className="pb-3 text-gray-300 font-medium">Failures</th>
                  <th className="pb-3 text-gray-300 font-medium">Success Rate</th>
                  <th className="pb-3 text-gray-300 font-medium">Reliability</th>
                  <th className="pb-3 text-gray-300 font-medium">Last Reward</th>
                  <th className="pb-3 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {sources?.map((source) => {
                  const successRate = calculateSuccessRate(source);
                  return (
                    <tr key={source?.source} className="border-b border-gray-700/50">
                      <td className="py-4">
                        <div className="font-medium text-white">{source?.source}</div>
                        <div className="text-xs text-gray-400">
                          Updated: {new Date(source.updated_at)?.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{source?.pulls || 0}</td>
                      <td className="py-4">
                        <span className="text-green-400 font-medium">{source?.successes || 0}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-red-400 font-medium">{source?.failures || 0}</span>
                      </td>
                      <td className="py-4">
                        <span className={`font-medium ${getReliabilityColor(successRate)}`}>
                          {(successRate * 100)?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          successRate >= 0.8 
                            ? 'bg-green-900/30 text-green-400 border border-green-400/30'
                            : successRate >= 0.6
                            ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-400/30' :'bg-red-900/30 text-red-400 border border-red-400/30'
                        }`}>
                          {getReliabilityBadge(successRate)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-purple-400 font-medium">
                          {source?.last_reward ? source?.last_reward?.toFixed(3) : '0.000'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => rewardSource(source?.source, true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs flex items-center"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Success
                          </button>
                          <button
                            onClick={() => rewardSource(source?.source, false)}
                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs flex items-center"
                          >
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failure
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Performance Insights */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-2">Top Performers</h4>
            <div className="space-y-2">
              {sources?.sort((a, b) => calculateSuccessRate(b) - calculateSuccessRate(a))?.slice(0, 3)?.map((source, index) => (
                  <div key={source?.source} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-500 text-black' : 
                        index === 1 ? 'bg-gray-400 text-black': 'bg-orange-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-white">{source?.source}</span>
                    </div>
                    <span className={`font-medium ${getReliabilityColor(calculateSuccessRate(source))}`}>
                      {(calculateSuccessRate(source) * 100)?.toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Recommendations</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-700 p-3 rounded">
                <div className="flex items-center mb-1">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-white font-medium">High Performers</span>
                </div>
                <p className="text-gray-300">
                  Prioritize sources with 80%+ success rates for critical tasks
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <div className="flex items-center mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-white font-medium">Monitor Low Performers</span>
                </div>
                <p className="text-gray-300">
                  Sources below 60% success rate need attention or replacement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}