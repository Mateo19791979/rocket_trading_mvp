import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const HealthMonitor = () => {
  const [healthStatus, setHealthStatus] = useState({
    status: 'healthy',
    responseTime: 12,
    lastCheck: new Date(),
    uptime: '99.8%',
    checks: {
      database: 'healthy',
      api: 'healthy',
      cache: 'healthy',
      websocket: 'healthy'
    }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate health check updates
      setHealthStatus(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 20) + 8,
        lastCheck: new Date()
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setHealthStatus(prev => ({
        ...prev,
        responseTime: Math.floor(Math.random() * 20) + 8,
        lastCheck: new Date()
      }));
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${healthStatus?.status === 'healthy' ? 'bg-success' : 'bg-error'} animate-pulse`}></div>
          <h2 className="text-xl font-semibold text-foreground font-heading">
            Surveillance de Santé
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          loading={isRefreshing}
          iconName="RefreshCw"
          iconPosition="left"
        >
          Actualiser
        </Button>
      </div>
      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon 
              name={getStatusIcon(healthStatus?.status)} 
              size={20} 
              className={getStatusColor(healthStatus?.status)}
            />
            <span className="text-sm font-medium text-muted-foreground">Statut Global</span>
          </div>
          <div className={`text-lg font-semibold ${getStatusColor(healthStatus?.status)} capitalize`}>
            {healthStatus?.status === 'healthy' ? 'Opérationnel' : 'Problème'}
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Clock" size={20} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Temps de Réponse</span>
          </div>
          <div className="text-lg font-semibold text-foreground font-data">
            {healthStatus?.responseTime}ms
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Activity" size={20} className="text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Disponibilité</span>
          </div>
          <div className="text-lg font-semibold text-foreground font-data">
            {healthStatus?.uptime}
          </div>
        </div>
      </div>
      {/* Service Checks */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-foreground font-heading mb-4">
          Vérifications des Services
        </h3>
        
        {Object.entries(healthStatus?.checks)?.map(([service, status]) => (
          <div key={service} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon 
                name={getStatusIcon(status)} 
                size={16} 
                className={getStatusColor(status)}
              />
              <span className="text-sm font-medium text-foreground capitalize">
                {service === 'database' ? 'Base de Données' :
                 service === 'api' ? 'API' :
                 service === 'cache' ? 'Cache' :
                 service === 'websocket' ? 'WebSocket' : service}
              </span>
            </div>
            <div className={`text-sm font-medium ${getStatusColor(status)} capitalize`}>
              {status === 'healthy' ? 'Opérationnel' : 'Problème'}
            </div>
          </div>
        ))}
      </div>
      {/* Last Check Info */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Dernière vérification:</span>
          <span className="font-data">
            {healthStatus?.lastCheck?.toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitor;