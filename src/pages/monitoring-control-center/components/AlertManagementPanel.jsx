import React from 'react';
import { AlertTriangle, Clock, Zap, TrendingDown, WifiOff, Activity } from 'lucide-react';

const AlertManagementPanel = ({ data }) => {
  const alerts = data?.alerts || [];
  const metrics = data?.metrics || { 
    total: 0, 
    avgLatency: 150, 
    latencyStatus: 'good',
    byType: { price: 0, volume: 0, technical: 0, risk: 0 },
    bySeverity: { low: 0, medium: 0, high: 0, critical: 0 }
  };

  const getLatencyColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-green-900/20';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20';
      case 'critical': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-blue-400 bg-blue-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'critical': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'price': return <TrendingDown className="w-4 h-4" />;
      case 'volume': return <Activity className="w-4 h-4" />;
      case 'technical': return <Zap className="w-4 h-4" />;
      case 'risk': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Alertes → drawdown, latence, anomalies</h3>
      </div>
      {/* Alert Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Alerts */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{metrics?.total}</div>
              <div className="text-sm text-gray-400">Alertes Actives</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        {/* API Latency */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{metrics?.avgLatency}ms</div>
              <div className="text-sm text-gray-400">Latence API</div>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${getLatencyColor(metrics?.latencyStatus)}`}>
              {metrics?.latencyStatus === 'good' ? 'Optimal' : 
               metrics?.latencyStatus === 'warning' ? 'Attention' : 'Critique'}
            </div>
          </div>
        </div>
      </div>
      {/* Alert Categories */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Par Type</h4>
          <div className="space-y-2">
            {Object.entries(metrics?.byType)?.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="text-gray-400">
                    {getAlertTypeIcon(type)}
                  </div>
                  <span className="text-gray-300 capitalize">
                    {type === 'price' ? 'Prix' :
                     type === 'volume' ? 'Volume' :
                     type === 'technical' ? 'Technique' : 'Risque'}
                  </span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Par Sévérité</h4>
          <div className="space-y-2">
            {Object.entries(metrics?.bySeverity)?.map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    severity === 'low' ? 'bg-blue-400' :
                    severity === 'medium' ? 'bg-yellow-400' :
                    severity === 'high' ? 'bg-orange-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-gray-300 capitalize">
                    {severity === 'low' ? 'Bas' :
                     severity === 'medium' ? 'Moyen' :
                     severity === 'high' ? 'Élevé' : 'Critique'}
                  </span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recent Alerts */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Alertes Récentes
        </h4>
        
        {alerts?.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune alerte active</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts?.slice(0, 5)?.map((alert, idx) => (
              <div key={alert?.id || idx} className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="text-gray-400">
                        {getAlertTypeIcon(alert?.alert_type)}
                      </div>
                      <span className="text-white font-medium truncate">
                        {alert?.title || 'Alerte système'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert?.alert_severity)}`}>
                        {alert?.alert_severity === 'low' ? 'Bas' :
                         alert?.alert_severity === 'medium' ? 'Moyen' :
                         alert?.alert_severity === 'high' ? 'Élevé' : 'Critique'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {alert?.message || 'Pas de description disponible'}
                    </p>
                    {alert?.asset?.symbol && (
                      <span className="text-xs text-blue-400">
                        {alert?.asset?.symbol}: ${alert?.target_value || 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Escalation Procedures */}
      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-300">Procédures d'Escalade</span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>• Drawdown &gt; 5%: Alerte automatique</div>
          <div>• Latence &gt; 800ms: Notification équipe technique</div>
          <div>• Anomalies critiques: Arrêt automatique</div>
        </div>
      </div>
    </div>
  );
};

export default AlertManagementPanel;