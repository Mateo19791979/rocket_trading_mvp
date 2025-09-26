import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Cpu, HardDrive } from 'lucide-react';

const SystemHealthPanel = ({ healthData }) => {
  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatLastHeartbeat = (timestamp) => {
    const now = new Date();
    const heartbeat = new Date(timestamp);
    const diffInSeconds = Math.floor((now - heartbeat) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    return `${Math.floor(diffInSeconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Santé du Système</h2>
        <div className="text-sm text-gray-400">
          {healthData?.length || 0} agents surveillés
        </div>
      </div>
      <div className="space-y-4">
        {healthData?.map((health) => (
          <div 
            key={health?.id} 
            className={`p-4 rounded-lg border ${getStatusColor(health?.health_status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getHealthIcon(health?.health_status)}
                <div>
                  <h3 className="font-medium">
                    {health?.ai_agents?.name || 'Agent inconnu'}
                  </h3>
                  <div className="text-xs opacity-75">
                    {health?.ai_agents?.agent_group || 'Groupe inconnu'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {health?.health_status || 'unknown'}
                </div>
                <div className="text-xs opacity-75">
                  Status
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 opacity-60" />
                <div>
                  <div className="font-medium">
                    {health?.cpu_usage ? `${parseFloat(health?.cpu_usage)?.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs opacity-60">CPU</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <HardDrive className="w-4 h-4 opacity-60" />
                <div>
                  <div className="font-medium">
                    {health?.memory_usage ? `${parseFloat(health?.memory_usage)?.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs opacity-60">RAM</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 opacity-60" />
                <div>
                  <div className="font-medium">
                    {health?.uptime_seconds ? formatUptime(health?.uptime_seconds) : 'N/A'}
                  </div>
                  <div className="text-xs opacity-60">Uptime</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 opacity-60" />
                <div>
                  <div className="font-medium">
                    {health?.last_heartbeat ? formatLastHeartbeat(health?.last_heartbeat) : 'N/A'}
                  </div>
                  <div className="text-xs opacity-60">Dernière activité</div>
                </div>
              </div>
            </div>

            {/* Error and Warning Indicators */}
            {(health?.error_count > 0 || health?.warning_count > 0) && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/20">
                {health?.error_count > 0 && (
                  <div className="flex items-center space-x-1 text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-xs">{health?.error_count} erreurs</span>
                  </div>
                )}
                {health?.warning_count > 0 && (
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="text-xs">{health?.warning_count} avertissements</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {(!healthData || healthData?.length === 0) && (
        <div className="text-center py-8 text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune donnée de santé disponible</p>
        </div>
      )}
    </div>
  );
};

export default SystemHealthPanel;