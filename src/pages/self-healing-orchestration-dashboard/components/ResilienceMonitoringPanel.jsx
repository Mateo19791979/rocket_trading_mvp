import React, { useState, useMemo } from 'react';
import { Monitor, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, Activity, Eye, BarChart3 } from 'lucide-react';

const ResilienceMonitoringPanel = ({ systemHealth = [], providerHealth = [], riskEvents = [] }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('availability');

  // Calculate resilience metrics
  const resilienceMetrics = useMemo(() => {
    const totalAgents = systemHealth?.length || 0;
    const healthyAgents = systemHealth?.filter(h => h?.health_status === 'healthy')?.length || 0;
    const criticalAgents = systemHealth?.filter(h => h?.health_status === 'critical')?.length || 0;
    
    const totalProviders = providerHealth?.length || 0;
    const activeProviders = providerHealth?.filter(p => p?.is_active)?.length || 0;
    
    // Calculate average response times (mock data for demo)
    const avgResponseTime = systemHealth?.reduce((acc, h) => {
      return acc + (h?.metrics?.response_time || Math.random() * 100);
    }, 0) / totalAgents || 0;

    // Calculate recent events by time range
    const getTimeRangeMs = () => {
      switch (timeRange) {
        case '1h': return 60 * 60 * 1000;
        case '6h': return 6 * 60 * 60 * 1000;
        case '24h': return 24 * 60 * 60 * 1000;
        case '7d': return 7 * 24 * 60 * 60 * 1000;
        default: return 24 * 60 * 60 * 1000;
      }
    };

    const cutoffTime = new Date(Date.now() - getTimeRangeMs());
    const recentEvents = riskEvents?.filter(event => 
      new Date(event?.created_at) > cutoffTime
    ) || [];

    return {
      systemAvailability: totalAgents > 0 ? ((healthyAgents / totalAgents) * 100)?.toFixed(1) : '0',
      providerAvailability: totalProviders > 0 ? ((activeProviders / totalProviders) * 100)?.toFixed(1) : '0',
      avgResponseTime: avgResponseTime?.toFixed(0),
      healthyAgents,
      criticalAgents,
      totalAgents,
      activeProviders,
      totalProviders,
      recentEvents: recentEvents?.length || 0,
      criticalEvents: recentEvents?.filter(e => e?.severity === 'critical')?.length || 0,
      resolvedEvents: recentEvents?.filter(e => e?.resolved_at)?.length || 0
    };
  }, [systemHealth, providerHealth, riskEvents, timeRange]);

  // Calculate cascade failure detection
  const cascadeRisks = useMemo(() => {
    const risks = [];
    
    // Check for multiple critical agents
    if (resilienceMetrics?.criticalAgents > 1) {
      risks?.push({
        type: 'Multiple Critical Agents',
        severity: 'high',
        count: resilienceMetrics?.criticalAgents,
        description: 'Multiple agents in critical state may indicate cascade failure'
      });
    }

    // Check for provider failures
    const inactiveProviders = resilienceMetrics?.totalProviders - resilienceMetrics?.activeProviders;
    if (inactiveProviders > 0) {
      risks?.push({
        type: 'Provider Failures',
        severity: inactiveProviders > 1 ? 'high' : 'medium',
        count: inactiveProviders,
        description: 'Provider failures may impact data availability'
      });
    }

    // Check for recent critical events
    if (resilienceMetrics?.criticalEvents > 0) {
      risks?.push({
        type: 'Critical Events',
        severity: 'critical',
        count: resilienceMetrics?.criticalEvents,
        description: `${resilienceMetrics?.criticalEvents} critical events in last ${timeRange}`
      });
    }

    return risks;
  }, [resilienceMetrics, timeRange]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    const diff = Date.now() - new Date(timestamp)?.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Monitor className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Resilience Monitoring</h2>
            <p className="text-sm text-gray-400">Comprehensive health metrics and cascade failure prevention</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>
      {/* System Health Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>System Health Metrics</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">System Availability</span>
              <Activity className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-semibold text-green-400">{resilienceMetrics?.systemAvailability}%</div>
            <div className="text-xs text-gray-400">{resilienceMetrics?.healthyAgents}/{resilienceMetrics?.totalAgents} agents healthy</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Provider Availability</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-semibold text-blue-400">{resilienceMetrics?.providerAvailability}%</div>
            <div className="text-xs text-gray-400">{resilienceMetrics?.activeProviders}/{resilienceMetrics?.totalProviders} providers active</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Response Time</span>
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-semibold text-yellow-400">{resilienceMetrics?.avgResponseTime}ms</div>
            <div className="text-xs text-gray-400">Real-time latency</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Recent Events</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-semibold text-red-400">{resilienceMetrics?.recentEvents}</div>
            <div className="text-xs text-gray-400">{resilienceMetrics?.resolvedEvents} resolved</div>
          </div>
        </div>
      </div>
      {/* Cascade Failure Prevention */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Eye className="w-5 h-5 text-purple-400" />
          <span>Cascade Failure Prevention</span>
        </h3>
        
        {cascadeRisks?.length > 0 ? (
          <div className="space-y-3">
            {cascadeRisks?.map((risk, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(risk?.severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">{risk?.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Count: {risk?.count}</span>
                    <span className={`px-2 py-1 rounded-full text-xs uppercase font-medium ${getSeverityColor(risk?.severity)}`}>
                      {risk?.severity}
                    </span>
                  </div>
                </div>
                <p className="text-sm opacity-90">{risk?.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">No Cascade Risks Detected</span>
            </div>
            <p className="text-sm text-green-400/80 mt-1">System is operating within normal parameters</p>
          </div>
        )}
      </div>
      {/* Predictive Analytics */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-orange-400" />
          <span>Predictive Analytics</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Proactive Intervention Triggers</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Memory Threshold</span>
                <span className="text-white">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CPU Threshold</span>
                <span className="text-white">90%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate Threshold</span>
                <span className="text-white">&gt;5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Response Time Threshold</span>
                <span className="text-white">&gt;500ms</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Recent Interventions</h4>
            <div className="space-y-2">
              {riskEvents?.slice(0, 3)?.map((event) => (
                <div key={event?.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(event?.severity)?.split(' ')?.[0]}`} />
                    <span className="text-gray-300 truncate">{event?.description}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{formatTimeAgo(event?.created_at)}</span>
                </div>
              ))}
              
              {(!riskEvents || riskEvents?.length === 0) && (
                <div className="text-gray-400 text-sm">No recent interventions</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResilienceMonitoringPanel;