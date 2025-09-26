import { useState } from 'react';
import { Zap, Filter, Clock, User, Eye, Search } from 'lucide-react';

function EventBusMonitor({ events = [], loading = false }) {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get unique event types for filter dropdown
  const eventTypes = [...new Set(events?.map(e => e?.eventType || e?.type)?.filter(Boolean))] || [];

  // Filter events
  const filteredEvents = events?.filter(event => {
    const matchesSearch = !filter || 
      JSON.stringify(event)?.toLowerCase()?.includes(filter?.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
      (event?.eventType || event?.type) === typeFilter;
    
    return matchesSearch && matchesType;
  }) || [];

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      return date?.toLocaleTimeString() + '.' + date?.getMilliseconds()?.toString()?.padStart(3, '0');
    } catch {
      return 'Invalid';
    }
  };

  const getEventTypeColor = (type) => {
    if (!type) return 'bg-gray-600 text-gray-200';
    
    if (type?.includes('heartbeat')) return 'bg-green-600 text-green-100';
    if (type?.includes('data.market')) return 'bg-blue-600 text-blue-100';
    if (type?.includes('strategy')) return 'bg-purple-600 text-purple-100';
    if (type?.includes('risk')) return 'bg-red-600 text-red-100';
    if (type?.includes('regime')) return 'bg-yellow-600 text-yellow-100';
    if (type?.includes('news')) return 'bg-indigo-600 text-indigo-100';
    
    return 'bg-gray-600 text-gray-200';
  };

  const formatEventPayload = (payload) => {
    if (!payload) return {};
    
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload);
      } catch {
        return { raw: payload };
      }
    }
    
    return payload;
  };

  const getEventPreview = (event) => {
    const data = event?.data || formatEventPayload(event?.payload);
    
    // Create a preview based on event type
    if (event?.eventType?.includes('data.market')) {
      return `${data?.symbol || 'N/A'}: $${data?.price || 'N/A'} (Vol: ${data?.volume || 'N/A'})`;
    }
    
    if (event?.eventType?.includes('heartbeat')) {
      return `${data?.name || data?.agent_id || 'Agent'}: ${data?.status || 'unknown'}`;
    }
    
    if (event?.eventType?.includes('strategy')) {
      return `${data?.symbol || 'N/A'}: ${data?.strategy || 'unknown'} (Score: ${data?.score || 'N/A'})`;
    }
    
    if (event?.eventType?.includes('regime')) {
      return `Regime: ${data?.regime || 'unknown'}, Trend: ${data?.trend || 'unknown'}`;
    }
    
    if (event?.eventType?.includes('risk')) {
      return `${data?.enabled ? 'ACTIVATED' : 'DEACTIVATED'}: ${data?.reason || 'No reason'}`;
    }
    
    // Generic preview
    const keys = Object.keys(data || {});
    if (keys?.length === 0) return 'No data';
    
    const preview = keys?.slice(0, 2)?.map(key => `${key}: ${data?.[key]}`)?.join(', ');
    return keys?.length > 2 ? preview + '...' : preview;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Event Bus Monitor</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)]?.map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Event Bus Monitor</h2>
          </div>
          <div className="text-sm text-gray-400">
            {filteredEvents?.length || 0} events
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={filter}
              onChange={(e) => setFilter(e?.target?.value || '')}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e?.target?.value || 'all')}
              className="pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              {eventTypes?.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredEvents?.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events found</p>
            <p className="text-sm mt-2">
              {filter || typeFilter !== 'all' ?'Try adjusting your filters' :'Events will appear here in real-time'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredEvents?.map((event, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getEventTypeColor(event?.eventType || event?.type)
                    }`}>
                      {event?.eventType || event?.type || 'unknown'}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimestamp(event?.timestamp)}</span>
                        
                        {(event?.source || event?.data?.source || event?.data?.agent_id) && (
                          <>
                            <User className="h-4 w-4" />
                            <span>{event?.source || event?.data?.source || event?.data?.agent_id}</span>
                          </>
                        )}
                      </div>
                      
                      <button className="text-gray-400 hover:text-gray-200">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-200">
                      {getEventPreview(event)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e?.stopPropagation()}>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Type</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                    getEventTypeColor(selectedEvent?.eventType || selectedEvent?.type)
                  }`}>
                    {selectedEvent?.eventType || selectedEvent?.type || 'unknown'}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Timestamp</label>
                  <p className="text-sm font-mono bg-gray-700 p-2 rounded mt-1">
                    {selectedEvent?.timestamp || 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Source</label>
                  <p className="text-sm font-mono bg-gray-700 p-2 rounded mt-1">
                    {selectedEvent?.source || selectedEvent?.data?.source || selectedEvent?.data?.agent_id || 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Channel</label>
                  <p className="text-sm font-mono bg-gray-700 p-2 rounded mt-1">
                    {selectedEvent?.channel || 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Data</label>
                  <pre className="text-xs bg-gray-900 p-3 rounded mt-1 overflow-auto">
                    {JSON.stringify(
                      selectedEvent?.data || formatEventPayload(selectedEvent?.payload), 
                      null, 
                      2
                    )}
                  </pre>
                </div>
                
                {selectedEvent?.processed !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Processed</label>
                    <p className="text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedEvent?.processed ? 'bg-green-600 text-green-100' : 'bg-yellow-600 text-yellow-100'
                      }`}>
                        {selectedEvent?.processed ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventBusMonitor;