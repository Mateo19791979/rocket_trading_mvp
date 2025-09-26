import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import { systemHealthService } from '../../services/systemHealthService';

const AgentStatusGrid = ({ className = '' }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');

  // AI Agent groups according to roadmap
  const agentGroups = {
    ingestion: { 
      name: 'Ingestion', 
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      icon: 'Download'
    },
    signals: { 
      name: 'Signaux', 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      icon: 'Activity'
    },
    execution: { 
      name: 'Exécution', 
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: 'Zap'
    },
    orchestration: { 
      name: 'Orchestration', 
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: 'Settings'
    }
  };

  const loadAgentsHealth = async () => {
    try {
      setLoading(true);
      const healthData = await systemHealthService?.getAgentsHealth();
      setAgents(healthData || []);
    } catch (error) {
      console.error('Failed to load agents health:', error?.message);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentsHealth();
    const interval = setInterval(loadAgentsHealth, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-success/20 text-success border-success/30';
      case 'degraded':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'offline':
        return 'bg-error/20 text-error border-error/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-border';
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

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'En ligne';
      case 'degraded':
        return 'Dégradé';
      case 'offline':
        return 'Hors ligne';
      default:
        return 'Inconnu';
    }
  };

  const filteredAgents = selectedGroup === 'all' 
    ? agents 
    : agents?.filter(agent => agent?.group === selectedGroup);

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const formatLastHeartbeat = (timestamp) => {
    if (!timestamp) return 'Jamais';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffSeconds = Math.floor((now - time) / 1000);
    
    if (diffSeconds < 60) return `Il y a ${diffSeconds}s`;
    if (diffSeconds < 3600) return `Il y a ${Math.floor(diffSeconds / 60)}m`;
    return `Il y a ${Math.floor(diffSeconds / 3600)}h`;
  };

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-2xl p-6 shadow-trading ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-muted-foreground">Chargement des agents IA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-trading ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          Agents IA (24 Autonomes)
        </h2>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${
            agents?.filter(a => a?.status === 'online')?.length === agents?.length
              ? 'bg-success/20 text-success border-success/30' : 'bg-warning/20 text-warning border-warning/30'
          }`}>
            {agents?.filter(a => a?.status === 'online')?.length}/{agents?.length} Actifs
          </span>
          <Icon
            name="RefreshCw"
            size={16}
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={loadAgentsHealth}
          />
        </div>
      </div>
      {/* Group Filter */}
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-sm text-muted-foreground font-body">Groupes:</span>
        <div className="flex space-x-1">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedGroup === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Tous
          </button>
          {Object.entries(agentGroups)?.map(([key, group]) => (
            <button
              key={key}
              onClick={() => setSelectedGroup(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedGroup === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {group?.name}
            </button>
          ))}
        </div>
      </div>
      {/* Agents Grid */}
      {filteredAgents?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Bot" size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aucun agent trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents?.map((agent) => (
            <div
              key={agent?.id}
              className="p-4 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg border ${agentGroups?.[agent?.group]?.color || 'bg-muted/50 text-muted-foreground border-border'}`}>
                    <Icon
                      name={agentGroups?.[agent?.group]?.icon || 'Bot'}
                      size={16}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground font-heading">
                      {agent?.name}
                    </h3>
                    <span className="text-xs text-muted-foreground font-body">
                      {agentGroups?.[agent?.group]?.name || agent?.group}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center px-2 py-1 rounded border ${getStatusColor(agent?.status)}`}>
                  <Icon
                    name={getStatusIcon(agent?.status)}
                    size={12}
                    className="mr-1"
                  />
                  <span className="text-xs font-medium">
                    {getStatusText(agent?.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPU:</span>
                  <span className="font-mono text-foreground">
                    {agent?.cpuUsage ? `${Number(agent?.cpuUsage)?.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RAM:</span>
                  <span className="font-mono text-foreground">
                    {agent?.memoryUsage ? `${Number(agent?.memoryUsage)?.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-mono text-foreground">
                    {formatUptime(agent?.uptime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heartbeat:</span>
                  <span className="font-mono text-foreground">
                    {formatLastHeartbeat(agent?.lastHeartbeat)}
                  </span>
                </div>

                {(agent?.errorCount > 0 || agent?.warningCount > 0) && (
                  <div className="flex justify-between pt-1 border-t border-border">
                    <span className="text-error">Erreurs:</span>
                    <span className="font-mono text-error">{agent?.errorCount || 0}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentStatusGrid;