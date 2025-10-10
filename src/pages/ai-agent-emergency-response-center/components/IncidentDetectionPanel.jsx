import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Zap, Database, Clock, Filter, Search } from 'lucide-react';

import { supabase } from '../../../lib/supabase';

export default function IncidentDetectionPanel({ incidents = [], onIncidentSelect }) {
  const [detectedIncidents, setDetectedIncidents] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadIncidentData = async () => {
    try {
      const [anomaliesData, alertsData, riskEventsData] = await Promise.all([
        loadAnomalies(),
        loadAlerts(),
        loadRiskEvents()
      ]);

      // Combine all incident types
      const combinedIncidents = [
        ...anomaliesData?.map(a => ({ ...a, type: 'anomaly', source: 'system' })),
        ...alertsData?.map(a => ({ ...a, type: 'alert', source: 'monitoring' })),
        ...riskEventsData?.map(r => ({ ...r, type: 'risk_event', source: 'risk_controller' }))
      ];

      setDetectedIncidents(combinedIncidents);
      setAnomalies(anomaliesData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load incident data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidentData();
    
    // Set up real-time monitoring
    const interval = setInterval(loadIncidentData, 30000); // Refresh every 30s
    
    return () => clearInterval(interval);
  }, []);

  const loadAnomalies = async () => {
    try {
      const { data, error } = await supabase
        ?.from('anomaly_detections')
        ?.select(`
          *,
          assets(symbol, name)
        `)
        ?.eq('is_resolved', false)
        ?.order('detected_at', { ascending: false })
        ?.limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to load anomalies:', error);
      return [];
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        ?.from('alerts')
        ?.select(`
          *,
          assets(symbol, name)
        `)
        ?.in('alert_status', ['active', 'triggered'])
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to load alerts:', error);
      return [];
    }
  };

  const loadRiskEvents = async () => {
    try {
      const { data, error } = await supabase
        ?.from('risk_events')
        ?.select(`
          *,
          risk_controller(user_id, configuration),
          user_profiles(full_name, email)
        `)
        ?.is('resolved_at', null)
        ?.order('created_at', { ascending: false })
        ?.limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to load risk events:', error);
      return [];
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-300 border-red-600';
      case 'high': return 'bg-orange-900 text-orange-300 border-orange-600';
      case 'medium': return 'bg-yellow-900 text-yellow-300 border-yellow-600';
      case 'low': return 'bg-blue-900 text-blue-300 border-blue-600';
      default: return 'bg-gray-900 text-gray-300 border-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'anomaly': return <Database className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'risk_event': return <TrendingUp className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getDetectionTypeLabel = (detectionType) => {
    switch (detectionType) {
      case 'price_spike': return 'Price Spike';
      case 'volume_anomaly': return 'Volume Anomaly';
      case 'spread_deviation': return 'Spread Deviation';
      case 'latency_alert': return 'Latency Alert';
      case 'data_quality': return 'Data Quality';
      default: return detectionType?.replace(/_/g, ' ')?.toUpperCase();
    }
  };

  const filteredIncidents = detectedIncidents?.filter(incident => {
    if (filter !== 'all' && incident?.type !== filter) return false;
    if (searchTerm && !JSON.stringify(incident)?.toLowerCase()?.includes(searchTerm?.toLowerCase())) return false;
    return true;
  });

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-gray-800 border border-orange-600 rounded-lg overflow-hidden">
      <div className="bg-orange-900/30 px-6 py-4 border-b border-orange-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Incident Detection</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-orange-300 text-sm">Live Monitoring</span>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e?.target?.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Incidents</option>
              <option value="anomaly">Anomalies</option>
              <option value="alert">Alerts</option>
              <option value="risk_event">Risk Events</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Incident Types Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{anomalies?.length || 0}</div>
            <div className="text-red-300 text-sm">Agent Malfunctions</div>
          </div>
          <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{alerts?.length || 0}</div>
            <div className="text-orange-300 text-sm">System Overloads</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {detectedIncidents?.filter(i => i?.type === 'risk_event')?.length || 0}
            </div>
            <div className="text-yellow-300 text-sm">Risk Events</div>
          </div>
        </div>

        {/* Incident List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading incidents...</p>
            </div>
          ) : filteredIncidents?.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No incidents detected</p>
            </div>
          ) : (
            filteredIncidents?.map((incident) => (
              <div
                key={`${incident?.type}-${incident?.id}`}
                onClick={() => onIncidentSelect?.(incident)}
                className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(incident?.alert_severity || incident?.severity || 'medium')}`}>
                    {getTypeIcon(incident?.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium truncate">
                        {incident?.title || incident?.description || getDetectionTypeLabel(incident?.detection_type)}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(incident?.created_at || incident?.detected_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident?.alert_severity || incident?.severity || 'medium')}`}>
                          {incident?.alert_severity || incident?.severity || 'medium'}
                        </span>
                        <span className="text-gray-400 text-xs capitalize">
                          {incident?.type?.replace('_', ' ')}
                        </span>
                      </div>

                      {incident?.provider_name && (
                        <span className="text-gray-400 text-xs">
                          Provider: {incident?.provider_name}
                        </span>
                      )}
                    </div>

                    {incident?.message && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                        {incident?.message}
                      </p>
                    )}

                    {/* Incident Metrics */}
                    {incident?.type === 'anomaly' && (
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                        {incident?.z_score && (
                          <span>Z-Score: {Number(incident?.z_score)?.toFixed(2)}</span>
                        )}
                        {incident?.confidence_score && (
                          <span>Confidence: {(Number(incident?.confidence_score) * 100)?.toFixed(1)}%</span>
                        )}
                        {incident?.actual_value && incident?.threshold_value && (
                          <span>
                            Actual: {Number(incident?.actual_value)?.toFixed(2)} 
                            (Threshold: {Number(incident?.threshold_value)?.toFixed(2)})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Asset Information */}
                    {incident?.assets && (
                      <div className="mt-2 text-xs text-blue-400">
                        Asset: {incident?.assets?.symbol} - {incident?.assets?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Automated Alert Escalation */}
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <h3 className="text-red-400 font-medium mb-2">Alert Escalation Rules</h3>
          <div className="space-y-2 text-sm text-red-300">
            <div className="flex justify-between">
              <span>Critical incidents:</span>
              <span>Immediate notification</span>
            </div>
            <div className="flex justify-between">
              <span>High severity:</span>
              <span>5 minute escalation</span>
            </div>
            <div className="flex justify-between">
              <span>Multiple failures:</span>
              <span>Auto-killswitch trigger</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}