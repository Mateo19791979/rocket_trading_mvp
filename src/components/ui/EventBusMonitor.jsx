import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { systemHealthService } from '../../services/systemHealthService';

const EventBusMonitor = ({ className = '', maxEvents = 10 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventData = await systemHealthService?.getEventBusActivity(maxEvents);
      setEvents(eventData || []);
    } catch (error) {
      console.error('Failed to load event bus data:', error?.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    if (autoRefresh) {
      const interval = setInterval(loadEvents, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, maxEvents]);

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'trade_signal':
        return 'bg-success/20 text-success border-success/30';
      case 'risk_alert':
        return 'bg-error/20 text-error border-error/30';
      case 'market_data':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'system_status':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'order_execution':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'trade_signal':
        return 'TrendingUp';
      case 'risk_alert':
        return 'AlertTriangle';
      case 'market_data':
        return 'Activity';
      case 'system_status':
        return 'Monitor';
      case 'order_execution':
        return 'Zap';
      default:
        return 'MessageCircle';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return 'AlertTriangle';
      case 'high':
        return 'ArrowUp';
      case 'medium':
        return 'Minus';
      case 'low':
        return 'ArrowDown';
      default:
        return 'Minus';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-error';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-muted-foreground';
      case 'low':
        return 'text-muted-foreground/60';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatEventData = (data) => {
    if (!data) return '';
    
    // Extract key information from event data
    if (typeof data === 'object') {
      const keys = Object.keys(data)?.slice(0, 3);
      return keys?.map(key => `${key}: ${String(data?.[key])?.slice(0, 20)}`)?.join(', ');
    }
    
    return String(data)?.slice(0, 50);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffSeconds = Math.floor((now - time) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
    return `${Math.floor(diffSeconds / 3600)}h`;
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events?.filter(event => event?.type === filter);

  const eventTypes = [...new Set(events?.map(e => e?.type))];

  return (
    <div className={`bg-card border border-border rounded-2xl p-6 shadow-trading ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          EventBus Monitor
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName={autoRefresh ? 'Pause' : 'Play'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-primary' : ''}
          >
            {autoRefresh ? 'Pause' : 'Reprendre'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            onClick={loadEvents}
            disabled={loading}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm text-muted-foreground font-body">Type:</span>
        <div className="flex space-x-1 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'all' ?'bg-primary text-primary-foreground' :'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            Tous ({events?.length})
          </button>
          {eventTypes?.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {type?.replace(/_/g, ' ')} ({events?.filter(e => e?.type === type)?.length})
            </button>
          ))}
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-muted/20">
          <div className="text-lg font-semibold text-foreground font-data">
            {events?.filter(e => e?.isProcessed)?.length}
          </div>
          <div className="text-xs text-muted-foreground font-body">Traités</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/20">
          <div className="text-lg font-semibold text-foreground font-data">
            {events?.filter(e => !e?.isProcessed)?.length}
          </div>
          <div className="text-xs text-muted-foreground font-body">En attente</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/20">
          <div className="text-lg font-semibold text-foreground font-data">
            {events?.filter(e => e?.priority === 'critical' || e?.priority === 'high')?.length}
          </div>
          <div className="text-xs text-muted-foreground font-body">Priorité haute</div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-muted-foreground">Chargement des événements...</span>
          </div>
        ) : filteredEvents?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="MessageCircle" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucun événement trouvé</p>
          </div>
        ) : (
          filteredEvents?.map((event) => (
            <div
              key={event?.id}
              className={`p-4 rounded-lg border transition-all ${
                event?.isProcessed ? 'border-border bg-muted/20' : 'border-primary/30 bg-primary/5'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded border ${getEventTypeColor(event?.type)}`}>
                    <Icon
                      name={getEventTypeIcon(event?.type)}
                      size={16}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-foreground font-heading">
                        {event?.type?.replace(/_/g, ' ')?.toUpperCase()}
                      </span>
                      <Icon
                        name={getPriorityIcon(event?.priority)}
                        size={12}
                        className={getPriorityColor(event?.priority)}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground font-body">
                      {event?.sourceAgent} → {event?.targetAgent}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground font-data">
                    {formatTimeAgo(event?.createdAt)}
                  </span>
                  {event?.isProcessed ? (
                    <Icon name="CheckCircle" size={16} className="text-success" />
                  ) : (
                    <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>

              {event?.data && (
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground">
                  {formatEventData(event?.data)}
                </div>
              )}

              {event?.processedAt && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Traité il y a {formatTimeAgo(event?.processedAt)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventBusMonitor;