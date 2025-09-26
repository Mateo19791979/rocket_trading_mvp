import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const DataProviderStatus = () => {
  const [providers, setProviders] = useState([
    {
      id: 'market-data',
      name: 'Données de Marché',
      status: 'connected',
      lastUpdate: new Date(Date.now() - 30000),
      errorRate: 0.1,
      endpoint: '/api/market-data',
      responseTime: 45
    },
    {
      id: 'price-feed',
      name: 'Flux de Prix',
      status: 'connected',
      lastUpdate: new Date(Date.now() - 15000),
      errorRate: 0.0,
      endpoint: '/api/prices',
      responseTime: 23
    },
    {
      id: 'news-feed',
      name: 'Flux d\'Actualités',
      status: 'warning',
      lastUpdate: new Date(Date.now() - 120000),
      errorRate: 2.3,
      endpoint: '/api/news',
      responseTime: 156
    },
    {
      id: 'historical-data',
      name: 'Données Historiques',
      status: 'connected',
      lastUpdate: new Date(Date.now() - 60000),
      errorRate: 0.5,
      endpoint: '/api/historical',
      responseTime: 89
    },
    {
      id: 'websocket',
      name: 'WebSocket Temps Réel',
      status: 'connected',
      lastUpdate: new Date(Date.now() - 5000),
      errorRate: 0.0,
      endpoint: 'wss://api/realtime',
      responseTime: 12
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProviders(prev => prev?.map(provider => ({
        ...provider,
        lastUpdate: provider?.status === 'connected' ? new Date() : provider?.lastUpdate,
        responseTime: provider?.status === 'connected' 
          ? Math.floor(Math.random() * 50) + 10 
          : provider?.responseTime
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'disconnected':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'disconnected':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connecté';
      case 'warning':
        return 'Avertissement';
      case 'disconnected':
        return 'Déconnecté';
      default:
        return 'Inconnu';
    }
  };

  const formatTimeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name="Database" size={20} className="text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Fournisseurs de Données
        </h2>
      </div>
      <div className="space-y-4">
        {providers?.map((provider) => (
          <div key={provider?.id} className="border border-border rounded-xl p-4 hover:bg-muted/20 transition-trading">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={getStatusIcon(provider?.status)} 
                  size={16} 
                  className={getStatusColor(provider?.status)}
                />
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {provider?.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-data">
                    {provider?.endpoint}
                  </p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(provider?.status)} bg-current/10`}>
                {getStatusText(provider?.status)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Dernière MAJ:</span>
                <div className="font-medium text-foreground font-data">
                  {formatTimeSince(provider?.lastUpdate)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Taux d'erreur:</span>
                <div className={`font-medium font-data ${
                  provider?.errorRate > 1 ? 'text-warning' : 'text-success'
                }`}>
                  {provider?.errorRate}%
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Temps réponse:</span>
                <div className={`font-medium font-data ${
                  provider?.responseTime > 100 ? 'text-warning' : 'text-success'
                }`}>
                  {provider?.responseTime}ms
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-success font-data">
              {providers?.filter(p => p?.status === 'connected')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Connectés</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning font-data">
              {providers?.filter(p => p?.status === 'warning')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Avertissements</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-error font-data">
              {providers?.filter(p => p?.status === 'disconnected')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Déconnectés</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataProviderStatus;