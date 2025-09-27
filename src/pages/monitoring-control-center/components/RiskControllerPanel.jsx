import React from 'react';
import { Shield, AlertTriangle, TrendingDown, Zap, Power, Activity, Lock, Unlock } from 'lucide-react';

const RiskControllerPanel = ({ data }) => {
  const controller = data?.controller || {};
  const metrics = data?.metrics || { 
    var95: 0, 
    var99: 0, 
    maxDrawdown: 0, 
    sharpeRatio: 0, 
    riskLevel: 'low',
    riskScore: 0
  };
  const events = data?.events || [];
  const status = data?.status || { 
    killswitchActive: false, 
    emergencyStop: false, 
    riskLevel: 'low' 
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'extreme': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-700/20';
    }
  };

  const getEventSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Risk Controller → VaR, CVaR, maxDD</h3>
      </div>
      {/* Risk Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">${metrics?.var95?.toFixed(2) || '0.00'}</div>
              <div className="text-sm text-gray-400">VaR 95%</div>
            </div>
            <TrendingDown className="w-6 h-6 text-orange-400" />
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">{metrics?.maxDrawdown?.toFixed(2) || '0.00'}%</div>
              <div className="text-sm text-gray-400">Max DD</div>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
        </div>
      </div>
      {/* Additional Risk Metrics */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Métriques Avancées
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">VaR 99%:</span>
            <span className="text-white font-medium">${metrics?.var99?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Ratio Sharpe:</span>
            <span className="text-white font-medium">{metrics?.sharpeRatio?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">CVaR:</span>
            <span className="text-white font-medium">${metrics?.expectedShortfall?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Score Risque:</span>
            <span className="text-white font-medium">{Math.round(metrics?.riskScore || 0)}/100</span>
          </div>
        </div>
      </div>
      {/* Risk Level & Killswitch Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Niveau de Risque</div>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskLevelColor(metrics?.riskLevel)}`}>
                {metrics?.riskLevel === 'low' ? 'Faible' :
                 metrics?.riskLevel === 'medium' ? 'Moyen' :
                 metrics?.riskLevel === 'high' ? 'Élevé' : 'Extrême'}
              </span>
            </div>
            <div className={`w-4 h-4 rounded-full ${
              metrics?.riskLevel === 'low' ? 'bg-green-400' :
              metrics?.riskLevel === 'medium' ? 'bg-yellow-400' :
              metrics?.riskLevel === 'high' ? 'bg-orange-400' : 'bg-red-400'
            } animate-pulse`}></div>
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Killswitch</div>
              <div className="flex items-center space-x-2">
                {status?.killswitchActive ? (
                  <Lock className="w-4 h-4 text-red-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-400" />
                )}
                <span className={`text-sm font-medium ${
                  status?.killswitchActive ? 'text-red-400' : 'text-green-400'
                }`}>
                  {status?.killswitchActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
            {status?.emergencyStop && (
              <Power className="w-4 h-4 text-red-400 animate-pulse" />
            )}
          </div>
        </div>
      </div>
      {/* Recent Risk Events */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Événements Récents
        </h4>
        
        {events?.length === 0 ? (
          <div className="text-center py-3 text-gray-400">
            <Shield className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun événement de risque récent</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {events?.slice(0, 3)?.map((event, idx) => (
              <div key={event?.id || idx} className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        event?.severity === 'critical' ? 'bg-red-400' :
                        event?.severity === 'high' ? 'bg-orange-400' :
                        event?.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}></div>
                      <span className="text-white text-sm font-medium">
                        {event?.event_type === 'risk_alert' ? 'Alerte Risque' :
                         event?.event_type === 'system_status'? 'État Système' : event?.event_type ||'Événement'}
                      </span>
                      <span className={`text-xs ${getEventSeverityColor(event?.severity)}`}>
                        {event?.severity || 'normal'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {event?.description || 'Aucune description disponible'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {event?.resolved_at ? (
                      <div className="w-2 h-2 rounded-full bg-green-400" title="Résolu"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" title="En cours"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Risk Limits Configuration */}
      <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-gray-300">Limites Configurées</span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Perte journalière max:</span>
            <span className="text-white">${controller?.max_daily_loss || 1000}</span>
          </div>
          <div className="flex justify-between">
            <span>Drawdown max:</span>
            <span className="text-white">{controller?.max_portfolio_drawdown || 10}%</span>
          </div>
          <div className="flex justify-between">
            <span>Récupération auto:</span>
            <span className={controller?.auto_recovery_enabled ? 'text-green-400' : 'text-red-400'}>
              {controller?.auto_recovery_enabled ? 'Activée' : 'Désactivée'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskControllerPanel;