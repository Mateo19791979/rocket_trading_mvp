import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemHealthCard = ({ systemHealth }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      case 'offline':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return 'CheckCircle';
      case 'degraded':
        return 'AlertTriangle';
      case 'offline':
        return 'XCircle';
      default:
        return 'HelpCircle';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          État du Système
        </h2>
        <Link to="/system-status">
          <Button variant="ghost" size="sm" iconName="Settings" iconPosition="right">
            Détails
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {/* API Latency */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-foreground font-body">
              Latence API
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-success font-data">
              {systemHealth?.apiLatency}ms
            </div>
            <div className="text-xs text-muted-foreground">
              Excellent
            </div>
          </div>
        </div>

        {/* Data Providers */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground font-body">
            Fournisseurs de Données
          </h3>
          {systemHealth?.dataProviders?.map((provider) => (
            <div key={provider?.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={getStatusIcon(provider?.status)} 
                  size={16} 
                  className={getStatusColor(provider?.status)} 
                />
                <span className="text-sm text-foreground font-body">
                  {provider?.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium font-data ${getStatusColor(provider?.status)}`}>
                  {provider?.status === 'online' ? 'En ligne' : 
                   provider?.status === 'degraded' ? 'Dégradé' : 'Hors ligne'}
                </span>
                <span className="text-xs text-muted-foreground font-data">
                  {provider?.uptime}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground font-data">
              {systemHealth?.activeConnections}
            </div>
            <div className="text-xs text-muted-foreground font-body">
              Connexions Actives
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground font-data">
              {systemHealth?.dataFreshness}s
            </div>
            <div className="text-xs text-muted-foreground font-body">
              Fraîcheur Données
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" iconName="RefreshCw" className="flex-1">
            Actualiser
          </Button>
          <Button variant="ghost" size="sm" iconName="AlertTriangle">
            Mode Dégradé
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCard;