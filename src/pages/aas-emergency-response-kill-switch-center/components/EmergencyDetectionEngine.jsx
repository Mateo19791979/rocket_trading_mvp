import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Activity, Zap, Eye, Settings } from 'lucide-react';

export default function EmergencyDetectionEngine({ systemHealth, onAction }) {
  const [detectedAnomalies, setDetectedAnomalies] = useState([]);
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(false);
  const [thresholds, setThresholds] = useState({
    dhi_critical: 0.3,
    error_rate_warning: 5,
    error_rate_critical: 15,
    autonomy_breach: 0.9
  });

  useEffect(() => {
    analyzeSystemForAnomalies();
  }, [systemHealth]);

  const analyzeSystemForAnomalies = () => {
    const anomalies = [];
    
    if (!systemHealth) return;

    // DHI Critical Level Detection
    if (systemHealth?.dhi_avg < thresholds?.dhi_critical) {
      anomalies?.push({
        id: 'dhi_critical',
        type: 'system_degradation',
        severity: 'critical',
        title: 'Critical DHI Level Detected',
        description: `Data Health Index at ${(systemHealth?.dhi_avg * 100)?.toFixed(1)}% - below critical threshold`,
        recommendation: 'Immediate Level 4 kill switch activation recommended',
        autoAction: {
          type: 'activate_killswitch',
          data: {
            module: 'LIVE_TRADING',
            level: 'level_4_breeding_termination',
            reason: 'Automatic response to critical DHI level'
          }
        },
        timestamp: new Date()?.toISOString()
      });
    }

    // System Mode Analysis
    if (systemHealth?.mode === 'safe') {
      anomalies?.push({
        id: 'safe_mode',
        type: 'system_protection',
        severity: 'critical',
        title: 'System in Safe Mode',
        description: 'System has entered protective safe mode due to detected threats',
        recommendation: 'Manual review required before resuming operations',
        timestamp: new Date()?.toISOString()
      });
    }

    // Error Rate Monitoring
    if (systemHealth?.errors_1h > thresholds?.error_rate_critical) {
      anomalies?.push({
        id: 'high_error_rate',
        type: 'error_surge',
        severity: 'high',
        title: 'High Error Rate Detected',
        description: `${systemHealth?.errors_1h} errors in the last hour`,
        recommendation: 'Consider Level 2-3 restrictions to prevent cascade failures',
        autoAction: {
          type: 'activate_killswitch',
          data: {
            module: 'STRATEGY_GENERATION',
            level: 'level_2_strategy_freeze',
            reason: 'High error rate detected - preventive measure'
          }
        },
        timestamp: new Date()?.toISOString()
      });
    } else if (systemHealth?.errors_1h > thresholds?.error_rate_warning) {
      anomalies?.push({
        id: 'elevated_errors',
        type: 'error_increase',
        severity: 'medium',
        title: 'Elevated Error Rate',
        description: `${systemHealth?.errors_1h} errors detected - above normal baseline`,
        recommendation: 'Monitor closely and prepare for intervention',
        timestamp: new Date()?.toISOString()
      });
    }

    // Alpha Decay Detection
    if (systemHealth?.alpha_decay > 0.1) {
      anomalies?.push({
        id: 'alpha_decay',
        type: 'performance_degradation',
        severity: 'medium',
        title: 'Strategy Alpha Decay Detected',
        description: `Alpha decay rate at ${(systemHealth?.alpha_decay * 100)?.toFixed(1)}%`,
        recommendation: 'Review strategy performance and consider breeding new candidates',
        timestamp: new Date()?.toISOString()
      });
    }

    setDetectedAnomalies(anomalies);

    // Auto-response if enabled
    if (autoResponseEnabled && anomalies?.length > 0) {
      anomalies?.forEach(anomaly => {
        if (anomaly?.autoAction && anomaly?.severity === 'critical') {
          setTimeout(() => {
            onAction?.(anomaly?.autoAction?.type, anomaly?.autoAction?.data);
          }, 1000); // 1-second delay for safety
        }
      });
    }
  };

  const handleManualAction = async (anomaly) => {
    if (anomaly?.autoAction) {
      await onAction?.(anomaly?.autoAction?.type, anomaly?.autoAction?.data);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return Zap;
      case 'high': return AlertTriangle;
      case 'medium': return TrendingDown;
      default: return Activity;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-orange-600 shadow-2xl">
      <div className="p-6 border-b border-orange-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="h-6 w-6 text-orange-400" />
            <div>
              <h2 className="text-xl font-bold text-orange-100">Emergency Detection Engine</h2>
              <p className="text-orange-300 text-sm">Real-time anomaly detection and automated response</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm text-white">
              <input
                type="checkbox"
                checked={autoResponseEnabled}
                onChange={(e) => setAutoResponseEnabled(e?.target?.checked)}
                className="rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
              />
              <span>Auto Response</span>
            </label>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Current Detection Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Detection Status</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${detectedAnomalies?.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-300">
                {detectedAnomalies?.length === 0 ? 'All Systems Normal' : `${detectedAnomalies?.length} Anomalies Detected`}
              </span>
            </div>
          </div>

          {/* System Metrics Overview */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Data Health Index</div>
              <div className={`text-xl font-bold ${(systemHealth?.dhi_avg || 0) < 0.5 ? 'text-red-400' : 'text-green-400'}`}>
                {((systemHealth?.dhi_avg || 0) * 100)?.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-400">Errors (1h)</div>
              <div className={`text-xl font-bold ${(systemHealth?.errors_1h || 0) > 5 ? 'text-red-400' : 'text-green-400'}`}>
                {systemHealth?.errors_1h || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Detected Anomalies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Detected Anomalies</h3>
          
          {detectedAnomalies?.length === 0 ? (
            <div className="bg-green-900 border border-green-600 rounded-lg p-4 text-center">
              <Activity className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-200 font-medium">No Anomalies Detected</div>
              <div className="text-green-400 text-sm">All monitoring systems operating within normal parameters</div>
            </div>
          ) : (
            detectedAnomalies?.map((anomaly) => {
              const SeverityIcon = getSeverityIcon(anomaly?.severity);
              return (
                <div
                  key={anomaly?.id}
                  className="bg-gray-700 border-l-4 border-orange-500 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded ${getSeverityColor(anomaly?.severity)}`}>
                        <SeverityIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-semibold text-white">{anomaly?.title}</div>
                          <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(anomaly?.severity)}`}>
                            {anomaly?.severity?.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-gray-300 text-sm mt-1">{anomaly?.description}</div>
                        <div className="text-orange-400 text-sm mt-2 font-medium">
                          💡 {anomaly?.recommendation}
                        </div>
                        <div className="text-gray-500 text-xs mt-2">
                          Detected: {new Date(anomaly?.timestamp)?.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {anomaly?.autoAction && (
                      <button
                        onClick={() => handleManualAction(anomaly)}
                        className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detection Thresholds */}
        <div className="mt-6">
          <button
            onClick={() => setThresholds(prev => ({ ...prev, _showConfig: !prev?._showConfig }))}
            className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Configure Detection Thresholds</span>
          </button>
          
          {thresholds?._showConfig && (
            <div className="mt-3 p-4 bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    DHI Critical Threshold
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={thresholds?.dhi_critical}
                    onChange={(e) => setThresholds(prev => ({ ...prev, dhi_critical: parseFloat(e?.target?.value) }))}
                    className="w-full p-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-orange-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-1">
                    Error Rate Critical
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={thresholds?.error_rate_critical}
                    onChange={(e) => setThresholds(prev => ({ ...prev, error_rate_critical: parseInt(e?.target?.value) }))}
                    className="w-full p-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-orange-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}