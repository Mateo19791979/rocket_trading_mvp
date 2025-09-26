import React, { useState } from 'react';
import { Zap, Filter, Clock, ArrowRight } from 'lucide-react';
import Button from '../../../components/ui/Button';

const EventBusPanel = ({ events }) => {
  const [filter, setFilter] = useState('all');
  const [showDetails, setShowDetails] = useState({});

  const eventTypeColors = {
    'market_data': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'trade_signal': 'bg-green-500/20 text-green-400 border-green-500/30',
    'order_execution': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'risk_alert': 'bg-red-500/20 text-red-400 border-red-500/30',
    'system_status': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  const priorityColors = {
    'low': 'text-gray-400',
    'medium': 'text-blue-400',
    'high': 'text-yellow-400',
    'critical': 'text-red-400'
  };

  const filteredEvents = events?.filter(event => {
    if (filter === 'all') return true;
    return event?.event_type === filter;
  }) || [];

  const eventTypes = [...new Set(events?.map(e => e?.event_type) || [])];

  const toggleDetails = (eventId) => {
    setShowDetails(prev => ({
      ...prev,
      [eventId]: !prev?.[eventId]
    }));
  };

  const formatEventData = (data) => {
    if (!data) return 'Aucune donnée';
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - eventTime) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}j`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold">EventBus en Temps Réel</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>
      {/* Event Type Filter */}
      <div className="flex items-center space-x-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Tous ({events?.length || 0})
        </Button>
        {eventTypes?.map(type => (
          <Button
            key={type}
            size="sm"
            variant={filter === type ? 'default' : 'outline'}
            onClick={() => setFilter(type)}
          >
            {type} ({events?.filter(e => e?.event_type === type)?.length || 0})
          </Button>
        ))}
      </div>
      {/* Events List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEvents?.map((event) => (
          <div key={event?.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {/* Priority Indicator */}
                <div className={`w-2 h-2 rounded-full ${
                  event?.priority === 'critical' ? 'bg-red-500' :
                  event?.priority === 'high' ? 'bg-yellow-500' :
                  event?.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
                
                {/* Event Type Badge */}
                <span className={`px-2 py-1 text-xs rounded border ${
                  eventTypeColors?.[event?.event_type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {event?.event_type}
                </span>
                
                {/* Priority */}
                <span className={`text-sm font-medium ${priorityColors?.[event?.priority] || 'text-gray-400'}`}>
                  {event?.priority}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{getTimeSince(event?.created_at)}</span>
                {!event?.is_processed && (
                  <span className="text-yellow-400 text-xs">En attente</span>
                )}
              </div>
            </div>

            {/* Source and Target Agents */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="text-sm">
                  <span className="text-gray-400">De:</span>
                  <span className="ml-2 font-medium">
                    {event?.source_agent?.name || 'Système'}
                  </span>
                  {event?.source_agent?.agent_group && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({event?.source_agent?.agent_group})
                    </span>
                  )}
                </div>
                
                {event?.target_agent && (
                  <>
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <div className="text-sm">
                      <span className="text-gray-400">À:</span>
                      <span className="ml-2 font-medium">
                        {event?.target_agent?.name}
                      </span>
                      {event?.target_agent?.agent_group && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({event?.target_agent?.agent_group})
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Event Data Preview */}
            <div className="mb-3">
              <button
                onClick={() => toggleDetails(event?.id)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showDetails?.[event?.id] ? 'Masquer les détails' : 'Afficher les détails'}
              </button>
              
              {showDetails?.[event?.id] && (
                <div className="mt-2 p-3 bg-gray-900 rounded text-xs">
                  <pre className="whitespace-pre-wrap text-gray-300 overflow-x-auto">
                    {formatEventData(event?.event_data)}
                  </pre>
                </div>
              )}
            </div>

            {/* Processing Status */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div>
                ID: {event?.id?.slice(-8)}
              </div>
              <div>
                {event?.is_processed ? (
                  <span className="text-green-400">Traité</span>
                ) : (
                  <span className="text-yellow-400">En file d'attente</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {(!filteredEvents || filteredEvents?.length === 0) && (
        <div className="text-center py-8 text-gray-400">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun événement {filter !== 'all' ? `de type "${filter}"` : ''} trouvé</p>
        </div>
      )}
      {/* Statistics Footer */}
      {events?.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-400">
                {events?.filter(e => e?.is_processed)?.length || 0}
              </div>
              <div className="text-xs text-gray-400">Traités</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-400">
                {events?.filter(e => !e?.is_processed)?.length || 0}
              </div>
              <div className="text-xs text-gray-400">En attente</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-400">
                {events?.filter(e => e?.priority === 'critical')?.length || 0}
              </div>
              <div className="text-xs text-gray-400">Critiques</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-400">
                {events?.filter(e => e?.event_type === 'trade_signal')?.length || 0}
              </div>
              <div className="text-xs text-gray-400">Signaux de trading</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventBusPanel;