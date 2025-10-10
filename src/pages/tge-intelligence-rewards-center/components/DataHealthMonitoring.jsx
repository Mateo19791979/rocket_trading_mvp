import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, AlertTriangle, CheckCircle, Plus, RefreshCw } from 'lucide-react';
import { aiOps } from '../../../lib/aiOpsClient';

export default function DataHealthMonitoring() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStream, setNewStream] = useState({
    stream: '',
    timeliness: 0.9,
    completeness: 0.9,
    consistency: 0.9,
    anomaly_inverse: 0.9,
    coverage: 0.9,
    license_status: 1.0
  });

  useEffect(() => {
    loadDHIMetrics();
  }, []);

  const loadDHIMetrics = async () => {
    setLoading(true);
    try {
      const result = await aiOps?.getAllDhiMetrics();
      if (result?.ok) {
        setStreams(result?.data);
      }
    } catch (error) {
      console.error('Error loading DHI metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStream = async (e) => {
    e?.preventDefault();
    if (!newStream?.stream?.trim()) return;

    try {
      const { stream, ...parts } = newStream;
      const result = await aiOps?.updateDhi(stream, parts);
      if (result?.ok) {
        await loadDHIMetrics();
        setShowAddForm(false);
        setNewStream({
          stream: '',
          timeliness: 0.9,
          completeness: 0.9,
          consistency: 0.9,
          anomaly_inverse: 0.9,
          coverage: 0.9,
          license_status: 1.0
        });
      } else {
        alert(`Failed to add stream: ${result?.error}`);
      }
    } catch (error) {
      alert(`Error adding stream: ${error?.message}`);
    }
  };

  const getDHIColor = (dhi) => {
    if (dhi >= 0.8) return 'text-green-400';
    if (dhi >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDHIBadge = (dhi) => {
    if (dhi >= 0.9) return { label: 'Excellent', color: 'bg-green-900/30 text-green-400 border-green-400/30' };
    if (dhi >= 0.8) return { label: 'Good', color: 'bg-blue-900/30 text-blue-400 border-blue-400/30' };
    if (dhi >= 0.7) return { label: 'Fair', color: 'bg-yellow-900/30 text-yellow-400 border-yellow-400/30' };
    return { label: 'Poor', color: 'bg-red-900/30 text-red-400 border-red-400/30' };
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const healthyStreams = streams?.filter(s => s?.dhi >= 0.7);
  const unhealthyStreams = streams?.filter(s => s?.dhi < 0.7);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{streams?.length}</div>
          <div className="text-sm text-gray-300">Total Streams</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{healthyStreams?.length}</div>
          <div className="text-sm text-gray-300">Healthy (DHI ≥0.7)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{unhealthyStreams?.length}</div>
          <div className="text-sm text-gray-300">Unhealthy (DHI &lt;0.7)</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {streams?.length > 0 ? (streams?.reduce((sum, s) => sum + (s?.dhi || 0), 0) / streams?.length)?.toFixed(3) : '0.000'}
          </div>
          <div className="text-sm text-gray-300">Average DHI</div>
        </div>
      </div>
      {/* Add New Stream */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Plus className="w-5 h-5 text-orange-400 mr-2" />
            Data Health Index (DHI) Monitoring
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stream
            </button>
            <button
              onClick={loadDHIMetrics}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddStream} className="mb-6 bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stream Name
                </label>
                <input
                  type="text"
                  value={newStream?.stream}
                  onChange={(e) => setNewStream({ ...newStream, stream: e?.target?.value })}
                  placeholder="e.g. data.market.eth.5m"
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
              
              {Object.entries(newStream)?.filter(([key]) => key !== 'stream')?.map(([key, value]) => (
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
                    onChange={(e) => setNewStream({
                      ...newStream,
                      [key]: parseFloat(e?.target?.value)
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
                  Calculate & Save DHI
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
          <h4 className="text-white font-medium mb-3">DHI Components Explanation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-orange-400 font-medium">Timeliness (25%)</div>
              <p className="text-gray-300">Data freshness and update frequency</p>
            </div>
            <div>
              <div className="text-orange-400 font-medium">Completeness (20%)</div>
              <p className="text-gray-300">Percentage of expected data points present</p>
            </div>
            <div>
              <div className="text-orange-400 font-medium">Consistency (20%)</div>
              <p className="text-gray-300">Data format and schema stability</p>
            </div>
            <div>
              <div className="text-orange-400 font-medium">Anomaly Inverse (15%)</div>
              <p className="text-gray-300">1 - (anomaly rate), lower is better</p>
            </div>
            <div>
              <div className="text-orange-400 font-medium">Coverage (10%)</div>
              <p className="text-gray-300">Breadth of data coverage</p>
            </div>
            <div>
              <div className="text-orange-400 font-medium">License Status (10%)</div>
              <p className="text-gray-300">Data usage rights and compliance</p>
            </div>
          </div>
        </div>
      </div>
      {/* Alert Streams */}
      {unhealthyStreams?.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <h3 className="text-lg font-bold text-red-400">Data Health Alerts</h3>
          </div>
          <div className="space-y-2">
            {unhealthyStreams?.map((stream) => (
              <div key={stream?.stream} className="bg-gray-800 rounded p-3 flex items-center justify-between">
                <div>
                  <span className="text-white font-medium">{stream?.stream}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    DHI: <span className="text-red-400 font-medium">{stream?.dhi?.toFixed(3)}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Updated: {formatTimestamp(stream?.updated_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Data Streams List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Database className="w-5 h-5 text-teal-400 mr-2" />
          Data Streams Health ({streams?.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading DHI metrics...</p>
          </div>
        ) : streams?.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No data streams monitored. Add your first stream above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {streams?.map((stream) => {
              const badge = getDHIBadge(stream?.dhi);
              return (
                <div key={stream?.stream} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{stream?.stream}</h4>
                      <p className="text-gray-400 text-sm">
                        Last updated: {formatTimestamp(stream?.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getDHIColor(stream?.dhi)}`}>
                          {stream?.dhi?.toFixed(3)}
                        </div>
                        <div className="text-xs text-gray-400">DHI Score</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full border text-sm font-medium ${badge?.color}`}>
                        {badge?.label}
                      </span>
                      {stream?.dhi >= 0.7 ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'timeliness', label: 'Timeliness', weight: '25%' },
                      { key: 'completeness', label: 'Completeness', weight: '20%' },
                      { key: 'consistency', label: 'Consistency', weight: '20%' },
                      { key: 'anomaly_inverse', label: 'Anomaly Inv.', weight: '15%' },
                      { key: 'coverage', label: 'Coverage', weight: '10%' },
                      { key: 'license_status', label: 'License', weight: '10%' }
                    ]?.map(({ key, label, weight }) => {
                      const value = stream?.[key] || 0;
                      return (
                        <div key={key} className="bg-gray-600 rounded p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300">{label}</span>
                            <span className="text-xs text-gray-400">{weight}</span>
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
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Health Summary */}
      {streams?.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
            Health Summary & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">Stream Categories</h4>
              <div className="space-y-2">
                <div className="bg-gray-700 p-3 rounded flex items-center justify-between">
                  <span className="text-green-400">Excellent (DHI ≥0.9)</span>
                  <span className="text-white font-medium">
                    {streams?.filter(s => s?.dhi >= 0.9)?.length}
                  </span>
                </div>
                <div className="bg-gray-700 p-3 rounded flex items-center justify-between">
                  <span className="text-blue-400">Good (0.8-0.9)</span>
                  <span className="text-white font-medium">
                    {streams?.filter(s => s?.dhi >= 0.8 && s?.dhi < 0.9)?.length}
                  </span>
                </div>
                <div className="bg-gray-700 p-3 rounded flex items-center justify-between">
                  <span className="text-yellow-400">Fair (0.7-0.8)</span>
                  <span className="text-white font-medium">
                    {streams?.filter(s => s?.dhi >= 0.7 && s?.dhi < 0.8)?.length}
                  </span>
                </div>
                <div className="bg-gray-700 p-3 rounded flex items-center justify-between">
                  <span className="text-red-400">Poor (&lt;0.7)</span>
                  <span className="text-white font-medium">
                    {streams?.filter(s => s?.dhi < 0.7)?.length}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Action Items</h4>
              <div className="space-y-2 text-sm">
                {unhealthyStreams?.length > 0 ? (
                  <div className="bg-red-900/30 border border-red-500/30 p-3 rounded">
                    <div className="flex items-center mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-red-400 font-medium">Immediate Attention</span>
                    </div>
                    <p className="text-gray-300">
                      {unhealthyStreams?.length} stream(s) below health threshold (0.7)
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-900/30 border border-green-500/30 p-3 rounded">
                    <div className="flex items-center mb-1">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-green-400 font-medium">All Systems Healthy</span>
                    </div>
                    <p className="text-gray-300">
                      All data streams meet minimum health requirements
                    </p>
                  </div>
                )}
                <div className="bg-gray-700 p-3 rounded">
                  <div className="flex items-center mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-white font-medium">Best Practices</span>
                  </div>
                  <p className="text-gray-300">
                    Monitor DHI daily, set alerts for drops below 0.7, investigate root causes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}