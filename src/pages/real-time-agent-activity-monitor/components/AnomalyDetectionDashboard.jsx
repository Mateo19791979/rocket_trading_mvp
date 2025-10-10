import React from 'react';
import { AlertTriangle, TrendingUp, Activity, Shield } from 'lucide-react';

export default function AnomalyDetectionDashboard({ eventBusEvents, systemHealth, agents }) {
  const detectAnomalies = () => {
    const anomalies = [];
    const now = new Date();
    const lastHour = new Date(now - 60 * 60 * 1000);

    // Performance deviations
    systemHealth?.forEach(health => {
      if (health?.cpu_usage > 80) {
        anomalies?.push({
          id: `cpu-${health?.agent_id}`,
          type: 'performance_deviation',
          severity: 'high',
          agent_id: health?.agent_id,
          message: `High CPU usage: ${health?.cpu_usage?.toFixed(1)}%`,
          value: health?.cpu_usage,
          threshold: 80,
          detected_at: now?.toISOString()
        });
      }
      
      if (health?.error_count > 5) {
        anomalies?.push({
          id: `error-${health?.agent_id}`,
          type: 'error_spike',
          severity: 'critical',
          agent_id: health?.agent_id,
          message: `High error count: ${health?.error_count}`,
          value: health?.error_count,
          threshold: 5,
          detected_at: now?.toISOString()
        });
      }
    });

    // Unusual event patterns
    const recentEvents = eventBusEvents?.filter(e => new Date(e?.created_at) > lastHour);
    const highPriorityEvents = recentEvents?.filter(e => e?.priority === 'high' || e?.priority === 'critical');
    
    if (highPriorityEvents?.length > 10) {
      anomalies?.push({
        id: 'event-spike',
        type: 'activity_spike',
        severity: 'medium',
        message: `High priority event spike: ${highPriorityEvents?.length} events in last hour`,
        value: highPriorityEvents?.length,
        threshold: 10,
        detected_at: now?.toISOString()
      });
    }

    // Communication anomalies
    const communicationEvents = recentEvents?.filter(e => e?.source_agent_id && e?.target_agent_id);
    const uniqueAgentPairs = new Set(
      communicationEvents?.map(e => `${e?.source_agent_id}-${e?.target_agent_id}`)
    );
    
    if (uniqueAgentPairs?.size < 3 && communicationEvents?.length > 5) {
      anomalies?.push({
        id: 'comm-isolation',
        type: 'communication_isolation',
        severity: 'medium',
        message: 'Limited inter-agent communication detected',
        value: uniqueAgentPairs?.size,
        threshold: 3,
        detected_at: now?.toISOString()
      });
    }

    return anomalies?.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return severityOrder?.[b?.severity] - severityOrder?.[a?.severity];
    });
  };

  const getAgentName = (agentId) => {
    if (!agentId) return 'System';
    const allAgents = Object.values(agents)?.flat();
    const agent = allAgents?.find(a => a?.id === agentId);
    return agent?.name || `Agent ${agentId?.slice(0, 8)}`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'medium': return <Activity className="w-4 h-4" />;
      case 'low': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const generateEscalationProcedures = (anomaly) => {
    const procedures = {
      'performance_deviation': [
        'Monitor resource allocation',
        'Check for memory leaks',
        'Consider agent restart if persistent'
      ],
      'error_spike': [
        'Review error logs immediately',
        'Activate backup agent if available',
        'Alert system administrator'
      ],
      'activity_spike': [
        'Verify market conditions',
        'Check data feed integrity',
        'Monitor system capacity'
      ],
      'communication_isolation': [
        'Check network connectivity',
        'Verify event bus health',
        'Test inter-agent communication'
      ]
    };
    
    return procedures?.[anomaly?.type] || ['Investigate further', 'Monitor closely'];
  };

  const anomalies = detectAnomalies();

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
          Anomaly Detection
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${anomalies?.length > 0 ? 'bg-red-400' : 'bg-green-400'}`} />
          <span className="text-xs text-gray-400">{anomalies?.length} detected</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {anomalies?.length === 0 ? (
          <div className="text-center text-green-400 py-4">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">No Anomalies Detected</p>
            <p className="text-xs text-gray-400 mt-1">All systems operating normally</p>
          </div>
        ) : (
          anomalies?.map(anomaly => (
            <div key={anomaly?.id} className={`border rounded-lg p-3 ${getSeverityColor(anomaly?.severity)}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(anomaly?.severity)}
                  <span className="text-xs font-medium uppercase">{anomaly?.severity}</span>
                </div>
                <span className="text-xs opacity-75">
                  {new Date(anomaly?.detected_at)?.toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-sm font-medium mb-2">{anomaly?.message}</p>
              
              {anomaly?.agent_id && (
                <p className="text-xs opacity-75 mb-2">
                  Agent: {getAgentName(anomaly?.agent_id)}
                </p>
              )}
              
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="opacity-75">Value: {anomaly?.value}</span>
                <span className="opacity-75">Threshold: {anomaly?.threshold}</span>
              </div>

              {/* Escalation Procedures */}
              <div className="bg-black/20 rounded p-2">
                <div className="text-xs font-medium mb-1">Escalation Steps:</div>
                <ul className="text-xs space-y-1">
                  {generateEscalationProcedures(anomaly)?.map((step, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="opacity-50">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Anomaly Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Critical:</span>
            <span className="text-red-400 font-medium">
              {anomalies?.filter(a => a?.severity === 'critical')?.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">High:</span>
            <span className="text-orange-400 font-medium">
              {anomalies?.filter(a => a?.severity === 'high')?.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Medium:</span>
            <span className="text-yellow-400 font-medium">
              {anomalies?.filter(a => a?.severity === 'medium')?.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Low:</span>
            <span className="text-green-400 font-medium">
              {anomalies?.filter(a => a?.severity === 'low')?.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}