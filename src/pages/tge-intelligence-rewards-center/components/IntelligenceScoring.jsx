import React, { useState, useEffect } from 'react';
import { Target, BarChart3, Plus, RefreshCw } from 'lucide-react';
import { aiOps } from '../../../lib/aiOpsClient';

export default function IntelligenceScoring() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInsight, setNewInsight] = useState({
    insight_id: '',
    breakdown: {
      robustness: 0.8,
      stability: 0.7,
      causality: 0.7,
      transferability: 0.6,
      cost_efficiency: 0.8,
      explainability: 0.7
    }
  });

  useEffect(() => {
    loadIQSScores();
  }, []);

  const loadIQSScores = async () => {
    setLoading(true);
    try {
      const result = await aiOps?.getIQSScores(50);
      if (result?.ok) {
        setScores(result?.data);
      }
    } catch (error) {
      console.error('Error loading IQS scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInsight = async (e) => {
    e?.preventDefault();
    if (!newInsight?.insight_id?.trim()) return;

    try {
      const result = await aiOps?.upsertIQS(newInsight?.insight_id, newInsight?.breakdown);
      if (result?.ok) {
        await loadIQSScores();
        setShowAddForm(false);
        setNewInsight({
          insight_id: '',
          breakdown: {
            robustness: 0.8,
            stability: 0.7,
            causality: 0.7,
            transferability: 0.6,
            cost_efficiency: 0.8,
            explainability: 0.7
          }
        });
      } else {
        alert(`Failed to add insight: ${result?.error}`);
      }
    } catch (error) {
      alert(`Error adding insight: ${error?.message}`);
    }
  };

  const getIQSColor = (iqs) => {
    if (iqs >= 0.8) return 'text-green-400';
    if (iqs >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getIQSBadge = (iqs) => {
    if (iqs >= 0.9) return { label: 'Excellent', color: 'bg-green-900/30 text-green-400 border-green-400/30' };
    if (iqs >= 0.8) return { label: 'Good', color: 'bg-blue-900/30 text-blue-400 border-blue-400/30' };
    if (iqs >= 0.6) return { label: 'Fair', color: 'bg-yellow-900/30 text-yellow-400 border-yellow-400/30' };
    return { label: 'Poor', color: 'bg-red-900/30 text-red-400 border-red-400/30' };
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{scores?.length}</div>
          <div className="text-sm text-gray-300">Total Insights</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {scores?.filter(s => s?.iqs >= 0.8)?.length}
          </div>
          <div className="text-sm text-gray-300">High Quality (≥0.8)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">
            {scores?.filter(s => s?.iqs >= 0.6 && s?.iqs < 0.8)?.length}
          </div>
          <div className="text-sm text-gray-300">Medium Quality (0.6-0.8)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {scores?.length > 0 ? (scores?.reduce((sum, s) => sum + (s?.iqs || 0), 0) / scores?.length)?.toFixed(3) : '0.000'}
          </div>
          <div className="text-sm text-gray-300">Average IQS</div>
        </div>
      </div>
      {/* Add New Insight */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Plus className="w-5 h-5 text-purple-400 mr-2" />
            Intelligence Quality Scoring (IQS)
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Insight
            </button>
            <button
              onClick={loadIQSScores}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddInsight} className="mb-6 bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Insight ID
                </label>
                <input
                  type="text"
                  value={newInsight?.insight_id}
                  onChange={(e) => setNewInsight({ ...newInsight, insight_id: e?.target?.value })}
                  placeholder="e.g. btc_momentum_signal_003"
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              
              {Object.entries(newInsight?.breakdown)?.map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {key?.charAt(0)?.toUpperCase() + key?.slice(1)?.replace('_', ' ')} ({value?.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={value}
                    onChange={(e) => setNewInsight({
                      ...newInsight,
                      breakdown: {
                        ...newInsight?.breakdown,
                        [key]: parseFloat(e?.target?.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
              ))}
              
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Calculate & Save IQS
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">IQS Components Explanation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-purple-400 font-medium">Robustness (25%)</div>
              <p className="text-gray-300">Resilience to market noise and outliers</p>
            </div>
            <div>
              <div className="text-purple-400 font-medium">Stability (20%)</div>
              <p className="text-gray-300">Consistency of performance over time</p>
            </div>
            <div>
              <div className="text-purple-400 font-medium">Causality (15%)</div>
              <p className="text-gray-300">Clear cause-effect relationships</p>
            </div>
            <div>
              <div className="text-purple-400 font-medium">Transferability (15%)</div>
              <p className="text-gray-300">Applicability across different conditions</p>
            </div>
            <div>
              <div className="text-purple-400 font-medium">Cost Efficiency (15%)</div>
              <p className="text-gray-300">Return vs computational/data costs</p>
            </div>
            <div>
              <div className="text-purple-400 font-medium">Explainability (10%)</div>
              <p className="text-gray-300">Human interpretability and trust</p>
            </div>
          </div>
        </div>
      </div>
      {/* Insights List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 text-teal-400 mr-2" />
          Scored Insights ({scores?.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading IQS scores...</p>
          </div>
        ) : scores?.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No IQS scores available. Add your first insight above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scores?.map((score) => {
              const badge = getIQSBadge(score?.iqs);
              return (
                <div key={score?.insight_id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{score?.insight_id}</h4>
                      <p className="text-gray-400 text-sm">
                        Scored: {formatTimestamp(score?.ts)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getIQSColor(score?.iqs)}`}>
                          {score?.iqs?.toFixed(3)}
                        </div>
                        <div className="text-xs text-gray-400">IQS Score</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full border text-sm font-medium ${badge?.color}`}>
                        {badge?.label}
                      </span>
                    </div>
                  </div>
                  {score?.breakdown && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(score?.breakdown)?.map(([key, value]) => (
                        <div key={key} className="bg-gray-600 rounded p-3">
                          <div className="text-sm text-gray-300 mb-1">
                            {key?.charAt(0)?.toUpperCase() + key?.slice(1)?.replace('_', ' ')}
                          </div>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-500 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  value >= 0.8 ? 'bg-green-400' :
                                  value >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${value * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium">
                              {value?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* IQS Distribution */}
      {scores?.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-400 mr-2" />
            IQS Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">
                  {((scores?.filter(s => s?.iqs >= 0.8)?.length / scores?.length) * 100)?.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">Production Ready</div>
                <div className="text-xs text-gray-400">IQS ≥ 0.80</div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {((scores?.filter(s => s?.iqs >= 0.6 && s?.iqs < 0.8)?.length / scores?.length) * 100)?.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">Paper Trading</div>
                <div className="text-xs text-gray-400">0.60 ≤ IQS &lt; 0.80</div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-2">
                  {((scores?.filter(s => s?.iqs < 0.6)?.length / scores?.length) * 100)?.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">Research Only</div>
                <div className="text-xs text-gray-400">IQS &lt; 0.60</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}