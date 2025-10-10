import React, { useState, useMemo } from 'react';
import { MessageSquare, Send, Filter, Eye, Clock } from 'lucide-react';

const NatsRedisMessagingHub = ({ eventBusData, agents, orchestratorState }) => {
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [messageFilter, setMessageFilter] = useState('');

  // Filter events based on selection
  const filteredEvents = useMemo(() => {
    return eventBusData?.filter(event => {
      const typeMatch = selectedEventType === 'all' || event?.event_type === selectedEventType;
      const priorityMatch = selectedPriority === 'all' || event?.priority === selectedPriority;
      const messageMatch = messageFilter === '' || 
        JSON.stringify(event?.event_data)?.toLowerCase()?.includes(messageFilter?.toLowerCase()) ||
        event?.event_type?.toLowerCase()?.includes(messageFilter?.toLowerCase());
      
      return typeMatch && priorityMatch && messageMatch;
    });
  }, [eventBusData, selectedEventType, selectedPriority, messageFilter]);

  // Get unique event types
  const eventTypes = useMemo(() => {
    const types = [...new Set(eventBusData.map(event => event.event_type))];
    return types?.sort();
  }, [eventBusData]);

  // Get agent name by ID
  const getAgentName = (agentId) => {
    const agent = agents?.find(a => a?.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 bg-red-900/30';
      case 'high':
        return 'text-orange-400 bg-orange-900/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'low':
        return 'text-blue-400 bg-blue-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'trade_signal':
        return '📊';
      case 'order_execution':
        return '⚡';
      case 'risk_alert':
        return '⚠️';
      case 'system_status':
        return '🔧';
      case 'market_data':
        return '📈';
      default:
        return '📝';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString();
  };

  // Calculate message frequency
  const messageFrequency = useMemo(() => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const recentMessages = eventBusData?.filter(event => 
      new Date(event.created_at) > fiveMinutesAgo
    );

    return {
      total: recentMessages?.length,
      rate: (recentMessages?.length / 5)?.toFixed(1) // messages per minute
    };
  }, [eventBusData]);

  // Get strategy publications
  const strategyPublications = useMemo(() => {
    return eventBusData?.filter(event => 
      event?.event_data?.channel === 'strategy.candidate'
    )?.length;
  }, [eventBusData]);

  // Get quant insights
  const quantInsights = useMemo(() => {
    return eventBusData?.filter(event => 
      event?.event_data?.channel === 'quant.insight'
    )?.length;
  }, [eventBusData]);

  return (
    <div className="p-6 bg-gray-800 h-full">
      <h2 className="text-xl font-semibold text-green-400 mb-6">NATS/Redis Messaging Hub</h2>
      {/* Message Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Message Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{messageFrequency?.rate}/min</div>
          <div className="text-xs text-gray-400">{messageFrequency?.total} in last 5min</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Send className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">Publications</span>
          </div>
          <div className="text-2xl font-bold text-white">{strategyPublications + quantInsights}</div>
          <div className="text-xs text-gray-400">Strategy + Insights</div>
        </div>
      </div>
      {/* Channel Status */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Live Channels</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">strategy.candidate</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">{strategyPublications} messages</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">quant.insight</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-400">{quantInsights} messages</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">inter-agent.communication</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-400">{eventBusData?.length} total</span>
            </div>
          </div>
        </div>
      </div>
      {/* Message Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter messages..."
            value={messageFilter}
            onChange={(e) => setMessageFilter(e?.target?.value)}
            className="flex-1 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex space-x-4">
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e?.target?.value)}
            className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            {eventTypes?.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e?.target?.value)}
            className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-96">
        {filteredEvents?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No messages found</p>
          </div>
        ) : (
          filteredEvents?.map((event) => {
            const isExpanded = expandedEvent === event?.id;
            const priorityClasses = getPriorityColor(event?.priority);

            return (
              <div key={event?.id} className="bg-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                  onClick={() => setExpandedEvent(isExpanded ? null : event?.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getEventTypeIcon(event?.event_type)}</span>
                      <span className="font-medium text-white">{event?.event_type}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityClasses}`}>
                        {event?.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{formatTimestamp(event?.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      {event?.source_agent_id && (
                        <span>From: {getAgentName(event?.source_agent_id)}</span>
                      )}
                      {event?.target_agent_id && (
                        <span className="ml-2">To: {getAgentName(event?.target_agent_id)}</span>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {event?.event_data?.message && (
                    <div className="mt-2 text-sm text-gray-300 truncate">
                      {event?.event_data?.message}
                    </div>
                  )}
                </div>
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-600">
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-white mb-2">Event Data:</h4>
                      <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-x-auto">
                        {JSON.stringify(event?.event_data, null, 2)}
                      </pre>
                      
                      <div className="mt-3 flex justify-between text-xs text-gray-400">
                        <span>ID: {event?.id?.substring(0, 8)}...</span>
                        <span>Processed: {event?.is_processed ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Manual Message Publishing */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-white mb-2">Manual Message Publisher</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter message..."
            className="flex-1 px-3 py-1 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default NatsRedisMessagingHub;