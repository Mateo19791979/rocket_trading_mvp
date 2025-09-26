import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ErrorLogViewer = () => {
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000),
      level: 'error',
      category: 'API',
      message: 'Échec de connexion au service de données de marché',
      details: 'Timeout après 30 secondes lors de la tentative de connexion à l\'endpoint /api/market-data',
      source: 'MarketDataService.js:45'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 180000),
      level: 'warning',
      category: 'WebSocket',
      message: 'Reconnexion WebSocket après déconnexion inattendue',
      details: 'La connexion WebSocket s\'est fermée de manière inattendue. Tentative de reconnexion en cours.',
      source: 'WebSocketManager.js:123'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 120000),
      level: 'info',
      category: 'System',
      message: 'Basculement vers les données mises en cache',
      details: 'Utilisation des données mises en cache en raison de l\'indisponibilité temporaire de l\'API principale',
      source: 'CacheManager.js:67'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 60000),
      level: 'error',
      category: 'Trading',
      message: 'Échec de l\'exécution de l\'ordre #TR-2024-001',
      details: 'L\'ordre d\'achat de 100 actions STLA n\'a pas pu être exécuté en raison d\'un problème de connectivité',
      source: 'OrderExecutor.js:89'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 30000),
      level: 'warning',
      category: 'Performance',
      message: 'Latence API élevée détectée',
      details: 'La latence moyenne de l\'API a dépassé 100ms pendant les 5 dernières minutes',
      source: 'PerformanceMonitor.js:34'
    }
  ]);

  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    let filtered = logs;

    if (selectedLevel !== 'all') {
      filtered = filtered?.filter(log => log?.level === selectedLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(log => log?.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered?.filter(log => 
        log?.message?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        log?.details?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedLevel, selectedCategory, searchTerm]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new log entries
      const newLog = {
        id: Date.now(),
        timestamp: new Date(),
        level: ['info', 'warning', 'error']?.[Math.floor(Math.random() * 3)],
        category: ['API', 'System', 'Trading', 'WebSocket']?.[Math.floor(Math.random() * 4)],
        message: 'Nouvelle entrée de log générée automatiquement',
        details: 'Détails de l\'événement système simulé pour démonstration',
        source: 'SystemMonitor.js:' + Math.floor(Math.random() * 200)
      };

      setLogs(prev => [newLog, ...prev?.slice(0, 19)]); // Keep only 20 most recent
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'text-error bg-error/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'info':
        return 'text-primary bg-primary/10';
      default:
        return 'text-muted-foreground bg-muted/10';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return 'XCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'Circle';
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Level,Category,Message,Details,Source',
      ...filteredLogs?.map(log => 
        `"${log?.timestamp?.toISOString()}","${log?.level}","${log?.category}","${log?.message}","${log?.details}","${log?.source}"`
      )
    ]?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-error" />
          </div>
          <h2 className="text-xl font-semibold text-foreground font-heading">
            Journal des Erreurs
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            iconName={autoRefresh ? "Pause" : "Play"}
            iconPosition="left"
          >
            {autoRefresh ? 'Pause' : 'Reprendre'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
            iconName="Download"
            iconPosition="left"
          >
            Exporter
          </Button>
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Recherche
          </label>
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher dans les logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Niveau
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tous les niveaux</option>
            <option value="error">Erreurs</option>
            <option value="warning">Avertissements</option>
            <option value="info">Informations</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Catégorie
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e?.target?.value)}
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Toutes les catégories</option>
            <option value="API">API</option>
            <option value="System">Système</option>
            <option value="Trading">Trading</option>
            <option value="WebSocket">WebSocket</option>
            <option value="Performance">Performance</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={clearLogs}
            iconName="Trash2"
            iconPosition="left"
            className="w-full"
          >
            Vider
          </Button>
        </div>
      </div>
      {/* Log Entries */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLogs?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucun log trouvé avec les filtres actuels</p>
          </div>
        ) : (
          filteredLogs?.map((log) => (
            <div key={log?.id} className="border border-border rounded-lg p-4 hover:bg-muted/10 transition-trading">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={getLevelIcon(log?.level)} 
                    size={16} 
                    className={getLevelColor(log?.level)?.split(' ')?.[0]}
                  />
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log?.level)}`}>
                    {log?.level?.toUpperCase()}
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-medium bg-muted/20 text-muted-foreground">
                    {log?.category}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-data">
                  {log?.timestamp?.toLocaleString('fr-FR')}
                </div>
              </div>

              <div className="mb-2">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {log?.message}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {log?.details}
                </p>
              </div>

              <div className="text-xs text-muted-foreground font-data">
                Source: {log?.source}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground font-data">
              {filteredLogs?.length}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-error font-data">
              {filteredLogs?.filter(log => log?.level === 'error')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Erreurs</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning font-data">
              {filteredLogs?.filter(log => log?.level === 'warning')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Avertissements</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-primary font-data">
              {filteredLogs?.filter(log => log?.level === 'info')?.length}
            </div>
            <div className="text-xs text-muted-foreground">Infos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogViewer;