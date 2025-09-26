import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Download, Filter, Search, RefreshCw } from 'lucide-react';

import { busMonitorService } from '../../services/busMonitorService';
import EventTimelineCard from './components/EventTimelineCard';
import EventFilters from './components/EventFilters';
import EventStatsPanel from './components/EventStatsPanel';

const BusMonitor = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventStats, setEventStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    eventType: '',
    priority: '',
    processed: undefined,
    timeRange: '24h'
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load initial data
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsData, statsData] = await Promise.all([
        busMonitorService?.getEvents({ ...filters, limit: 500 }),
        busMonitorService?.getEventStats(filters?.timeRange)
      ]);
      
      setEvents(eventsData);
      setEventStats(statsData);
      applyFilters(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Apply search and filters
  const applyFilters = useCallback((eventList = events) => {
    let filtered = [...eventList];

    if (searchTerm) {
      filtered = filtered?.filter(event =>
        event?.event_type?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        event?.source_agent?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        JSON.stringify(event?.event_data)?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  // Real-time subscription
  useEffect(() => {
    let subscription = null;
    
    const setupSubscription = async () => {
      try {
        subscription = busMonitorService?.subscribeToEvents((payload) => {
          if (payload?.eventType === 'INSERT') {
            setEvents(prevEvents => [payload?.new, ...prevEvents?.slice(0, 499)]);
          } else if (payload?.eventType === 'UPDATE') {
            setEvents(prevEvents => 
              prevEvents?.map(event => 
                event?.id === payload?.new?.id ? payload?.new : event
              )
            );
          }
        });
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    if (autoRefresh) {
      setupSubscription();
    }

    return () => {
      if (subscription) {
        subscription?.unsubscribe();
      }
    };
  }, [autoRefresh]);

  // Auto-refresh timer
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadEvents, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, loadEvents]);

  // Initial load
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Apply filters when search term changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Export functionality
  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        const csvContent = await busMonitorService?.exportEventsToCSV(filters);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL?.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `events-export-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
        a?.click();
        window.URL?.revokeObjectURL(url);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(filteredEvents, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL?.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `events-export-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
        a?.click();
        window.URL?.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting events:', error);
    }
  };

  const eventTypeColors = {
    'market_data': '#3B82F6',
    'trade_signal': '#10B981', 
    'order_execution': '#F59E0B',
    'risk_alert': '#EF4444',
    'system_status': '#6366F1'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading event stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Bus Monitor</h1>
            <p className="text-gray-400 text-sm">Real-time event stream and inter-agent communications</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Auto-refresh controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-600 hover:bg-green-700 text-white' :'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e?.target?.value))}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            </div>

            {/* Export controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events, agents, or event data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <EventFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>
      {/* Main content */}
      <div className="flex flex-1">
        {/* Event Timeline */}
        <div className="flex-1 p-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 h-full">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Live Event Timeline</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    {filteredEvents?.length || 0} events
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              {filteredEvents?.length > 0 ? (
                <div className="space-y-3">
                  {filteredEvents?.map((event) => (
                    <EventTimelineCard
                      key={event?.id}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                      isSelected={selectedEvent?.id === event?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No events match your current filters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-80 p-6">
          <EventStatsPanel 
            stats={eventStats}
            selectedEvent={selectedEvent}
            onEventClose={() => setSelectedEvent(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default BusMonitor;