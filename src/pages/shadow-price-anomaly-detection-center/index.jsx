import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, Shield, BarChart3, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import shadowPriceAnomalyService from '../../services/shadowPriceAnomalyService';

const ShadowPriceAnomalyDetectionCenter = () => {
  const [shadowPrices, setShadowPrices] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [shadowStats, setShadowStats] = useState(null);
  const [anomalyStats, setAnomalyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shadow-prices');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [filters, setFilters] = useState({
    shadow: { is_stale: null, min_confidence: null },
    anomaly: { is_resolved: false, detection_type: null, min_z_score: 3.0 }
  });

  const loadShadowPrices = async () => {
    const result = await shadowPriceAnomalyService?.getShadowPrices({ 
      ...filters?.shadow, 
      limit: 50 
    });
    
    if (result?.error) {
      console.error('Failed to load shadow prices:', result?.error);
    } else {
      setShadowPrices(result?.data || []);
    }
  };

  const loadAnomalies = async () => {
    const result = await shadowPriceAnomalyService?.getAnomalies({ 
      ...filters?.anomaly, 
      limit: 100 
    });
    
    if (result?.error) {
      console.error('Failed to load anomalies:', result?.error);
    } else {
      setAnomalies(result?.data || []);
    }
  };

  const loadStats = async () => {
    const [shadowResult, anomalyResult] = await Promise.all([
      shadowPriceAnomalyService?.getShadowPriceStats({ days: 7 }),
      shadowPriceAnomalyService?.getAnomalyStats({ days: 7 })
    ]);
    
    if (shadowResult?.data) setShadowStats(shadowResult?.data);
    if (anomalyResult?.data) setAnomalyStats(anomalyResult?.data);
  };

  const handleShadowPriceUpdate = (payload) => {
    if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
      loadShadowPrices();
      loadStats();
    }
  };

  const handleAnomalyUpdate = (payload) => {
    if (payload?.eventType === 'INSERT' || payload?.eventType === 'UPDATE') {
      loadAnomalies();
      loadStats();
    }
  };

  useEffect(() => {
    loadInitialData();
    
    // Set up real-time subscriptions
    const unsubscribeShadow = shadowPriceAnomalyService?.subscribeToShadowPrices(handleShadowPriceUpdate);
    const unsubscribeAnomaly = shadowPriceAnomalyService?.subscribeToAnomalies(handleAnomalyUpdate);
    
    // Set up periodic refresh for stats
    const statsInterval = setInterval(loadStats, 30000); // Every 30 seconds

    return () => {
      unsubscribeShadow?.();
      unsubscribeAnomaly?.();
      clearInterval(statsInterval);
    };
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadShadowPrices(),
        loadAnomalies(),
        loadStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAnomaly = async (anomalyId) => {
    const result = await shadowPriceAnomalyService?.resolveAnomaly(anomalyId, 'Resolved by user');
    
    if (result?.error) {
      console.error('Failed to resolve anomaly:', result?.error);
    } else {
      setAnomalies(prev => prev?.map(anomaly => 
        anomaly?.id === anomalyId 
          ? { ...anomaly, is_resolved: true, resolved_at: new Date()?.toISOString() }
          : anomaly
      ));
      setSelectedAnomaly(null);
    }
  };

  const getSeverityColor = (zScore, confidence) => {
    if (zScore >= 5 || confidence >= 0.9) return 'text-red-400 bg-red-500/20';
    if (zScore >= 3.5 || confidence >= 0.75) return 'text-orange-400 bg-orange-500/20';
    return 'text-yellow-400 bg-yellow-500/20';
  };

  const getHealthStatus = (isStale, confidence) => {
    if (isStale || confidence < 0.5) return { icon: XCircle, color: 'text-red-400', status: 'Unhealthy' };
    if (confidence < 0.8) return { icon: AlertCircle, color: 'text-yellow-400', status: 'Warning' };
    return { icon: CheckCircle, color: 'text-green-400', status: 'Healthy' };
  };

  const formatPrice = (price) => {
    return price ? `$${parseFloat(price)?.toFixed(2)}` : 'N/A';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading Shadow Price & Anomaly Detection Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Shield className="text-red-400" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Shadow Price & Anomaly Detection Center</h1>
                <p className="text-gray-300 mt-1">
                  Comprehensive backup pricing infrastructure and market anomaly surveillance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={loadInitialData}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-6 mt-6">
            {[
              { id: 'shadow-prices', name: 'Shadow Price Server', icon: TrendingUp },
              { id: 'anomaly-sentinel', name: 'Anomaly Sentinel', icon: AlertTriangle },
              { id: 'detection-dashboard', name: 'Detection Dashboard', icon: Activity },
              { id: 'system-integration', name: 'System Integration', icon: BarChart3 }
            ]?.map(tab => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' :'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab?.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Shadow Price Server Section */}
            {activeTab === 'shadow-prices' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center space-x-2">
                    <TrendingUp className="text-blue-400" size={20} />
                    <span>Shadow Price Server</span>
                  </h2>
                  {shadowStats && (
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Accuracy: {(shadowStats?.price_accuracy * 100)?.toFixed(1)}%</span>
                      <span>Fresh: {shadowStats?.fresh_count}/{shadowStats?.total}</span>
                    </div>
                  )}
                </div>
                
                {/* Shadow Price Stats */}
                {shadowStats && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">{shadowStats?.fresh_count}</div>
                      <div className="text-gray-400 text-sm">Fresh Prices</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-400">{shadowStats?.stale_count}</div>
                      <div className="text-gray-400 text-sm">Stale Prices</div>
                    </div>
                  </div>
                )}

                {/* Shadow Prices List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {shadowPrices?.map((price) => {
                    const health = getHealthStatus(price?.is_stale, price?.confidence_score);
                    return (
                      <div key={price?.id} className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <health.icon className={health?.color} size={16} />
                            <span className="font-medium">{price?.asset?.symbol || 'Unknown'}</span>
                            <span className="text-gray-400 text-sm">{price?.asset?.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{formatPrice(price?.shadow_price)}</div>
                            <div className="text-sm text-gray-400">
                              Conf: {(price?.confidence_score * 100)?.toFixed(0)}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <div className="text-gray-400">VWAP 60s</div>
                            <div>{formatPrice(price?.vwap_60s)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Last Trade</div>
                            <div>{formatPrice(price?.last_trade)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Updated</div>
                            <div>{formatTime(price?.updated_at)}</div>
                          </div>
                        </div>
                        {/* Sources */}
                        {price?.shadow_price_sources?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <div className="flex items-center space-x-4 text-xs">
                              {price?.shadow_price_sources?.map((source, idx) => (
                                <span key={idx} className="flex items-center space-x-1">
                                  <span className="text-gray-400">{source?.source_provider}:</span>
                                  <span className="text-green-400">{(source?.weight * 100)?.toFixed(0)}%</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anomaly Sentinel Panel */}
            {activeTab === 'anomaly-sentinel' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center space-x-2">
                    <AlertTriangle className="text-orange-400" size={20} />
                    <span>Anomaly Sentinel</span>
                  </h2>
                  {anomalyStats && (
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Unresolved: {anomalyStats?.unresolved_count}</span>
                      <span>Avg Z-Score: {anomalyStats?.avg_z_score?.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Anomaly Detection Controls */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <select 
                      value={filters?.anomaly?.detection_type || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        anomaly: { ...prev?.anomaly, detection_type: e?.target?.value || null }
                      }))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="spike">Price Spike</option>
                      <option value="wash_trading">Wash Trading</option>
                      <option value="volume_anomaly">Volume Anomaly</option>
                      <option value="price_anomaly">Price Anomaly</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Min Z-Score"
                      value={filters?.anomaly?.min_z_score || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        anomaly: { ...prev?.anomaly, min_z_score: parseFloat(e?.target?.value) || null }
                      }))}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm w-32"
                      step="0.1"
                    />
                    <button 
                      onClick={loadAnomalies}
                      className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* Anomalies List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {anomalies?.map((anomaly) => (
                    <div 
                      key={anomaly?.id} 
                      className={`rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAnomaly?.id === anomaly?.id 
                          ? 'bg-orange-500/20 border border-orange-500/30' :'bg-gray-700/50 hover:bg-gray-700/70'
                      }`}
                      onClick={() => setSelectedAnomaly(anomaly)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly?.z_score, anomaly?.confidence_score)}`}>
                            {anomaly?.detection_type?.replace('_', ' ')?.toUpperCase()}
                          </div>
                          <span className="font-medium">{anomaly?.asset?.symbol}</span>
                          {anomaly?.provider_name && (
                            <span className="text-gray-400 text-sm">via {anomaly?.provider_name}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {!anomaly?.is_resolved && (
                            <button
                              onClick={(e) => {
                                e?.stopPropagation();
                                handleResolveAnomaly(anomaly?.id);
                              }}
                              className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          <div className="text-right">
                            <div className="text-sm font-medium">Z-Score: {anomaly?.z_score?.toFixed(1)}</div>
                            <div className="text-xs text-gray-400">
                              {formatTime(anomaly?.detected_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Metric</div>
                          <div>{anomaly?.metric_name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Confidence</div>
                          <div>{(anomaly?.confidence_score * 100)?.toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Detection Dashboard */}
            {activeTab === 'detection-dashboard' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="text-green-400" size={20} />
                  <h2 className="text-xl font-bold">Detection Dashboard</h2>
                </div>
                
                {/* Real-time Alert Stats */}
                {anomalyStats && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                      <div className="text-2xl font-bold text-red-400">{anomalyStats?.unresolved_count}</div>
                      <div className="text-gray-400 text-sm">Active Alerts</div>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <div className="text-2xl font-bold text-green-400">{anomalyStats?.resolved_count}</div>
                      <div className="text-gray-400 text-sm">Resolved</div>
                    </div>
                  </div>
                )}

                {/* Detection Type Breakdown */}
                {anomalyStats?.by_type && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Detection Types</h3>
                    <div className="space-y-2">
                      {Object.entries(anomalyStats?.by_type)?.map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between py-2">
                          <span className="text-gray-300 capitalize">
                            {type?.replace('_', ' ')}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider Performance */}
                {anomalyStats?.by_provider && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Provider Issues</h3>
                    <div className="space-y-2">
                      {Object.entries(anomalyStats?.by_provider)?.map(([provider, count]) => (
                        <div key={provider} className="flex items-center justify-between py-2">
                          <span className="text-gray-300">{provider}</span>
                          <span className="font-medium text-orange-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* System Integration Section */}
            {activeTab === 'system-integration' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <BarChart3 className="text-purple-400" size={20} />
                  <h2 className="text-xl font-bold">System Integration</h2>
                </div>
                
                {/* API Endpoints */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Shadow Price Endpoints</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="bg-gray-700/50 rounded p-2">
                      <span className="text-green-400">GET</span> /shadow/price?symbol=STLA
                    </div>
                    <div className="bg-gray-700/50 rounded p-2">
                      <span className="text-blue-400">GET</span> /shadow/health
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Anomaly Detection</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="bg-gray-700/50 rounded p-2">
                      <span className="text-green-400">GET</span> /anomaly/last?symbol=STLA
                    </div>
                    <div className="bg-gray-700/50 rounded p-2">
                      <span className="text-green-400">GET</span> /anomaly/provider-status
                    </div>
                  </div>
                </div>

                {/* System Health Indicators */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-300">Shadow Price Accuracy</span>
                      <span className="text-green-400 font-medium">
                        {shadowStats ? `${(shadowStats?.price_accuracy * 100)?.toFixed(1)}%` : 'Loading...'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-300">Detection Latency</span>
                      <span className="text-green-400 font-medium">&lt; 50ms</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-300">False Positive Rate</span>
                      <span className="text-yellow-400 font-medium">&lt; 1%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Anomaly Details Modal */}
        {selectedAnomaly && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Anomaly Details</h3>
                <button 
                  onClick={() => setSelectedAnomaly(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Asset</label>
                    <div className="font-medium">{selectedAnomaly?.asset?.symbol} - {selectedAnomaly?.asset?.name}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Detection Type</label>
                    <div className="font-medium capitalize">{selectedAnomaly?.detection_type?.replace('_', ' ')}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Z-Score</label>
                    <div className="font-medium">{selectedAnomaly?.z_score?.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Confidence</label>
                    <div className="font-medium">{(selectedAnomaly?.confidence_score * 100)?.toFixed(0)}%</div>
                  </div>
                </div>
                
                {selectedAnomaly?.details && (
                  <div>
                    <label className="text-gray-400 text-sm">Details</label>
                    <pre className="bg-gray-900 rounded p-3 text-sm overflow-x-auto">
                      {JSON.stringify(selectedAnomaly?.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setSelectedAnomaly(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  {!selectedAnomaly?.is_resolved && (
                    <button 
                      onClick={() => handleResolveAnomaly(selectedAnomaly?.id)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadowPriceAnomalyDetectionCenter;