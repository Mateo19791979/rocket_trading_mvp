import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Filter, Search, ExternalLink } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function TgeEventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '30',
    minFunding: '',
    search: ''
  });

  useEffect(() => {
    loadTgeEvents();
  }, [filters]);

  const loadTgeEvents = async () => {
    setLoading(true);
    try {
      let query = supabase?.from('tge_events')?.select('*')?.order('tge_datetime', { ascending: false });

      // Apply filters
      if (filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo?.setDate(daysAgo?.getDate() - parseInt(filters?.dateRange));
        query = query?.gte('created_at', daysAgo?.toISOString());
      }

      if (filters?.minFunding) {
        query = query?.gte('raise_goal_usd', parseFloat(filters?.minFunding));
      }

      if (filters?.search) {
        query = query?.or(`project_name.ilike.%${filters?.search}%,symbol.ilike.%${filters?.search}%`);
      }

      const { data, error } = await query?.limit(50);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading TGE events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-900/30 border-green-400/30';
      case 'active':
        return 'text-blue-400 bg-blue-900/30 border-blue-400/30';
      case 'upcoming':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-400/30';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-400/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{events?.length}</div>
          <div className="text-sm text-gray-300">Total Events</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {events?.filter(e => e?.status === 'upcoming')?.length}
          </div>
          <div className="text-sm text-gray-300">Upcoming</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {events?.filter(e => e?.status === 'active')?.length}
          </div>
          <div className="text-sm text-gray-300">Active</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-teal-400">
            {formatCurrency(events?.reduce((sum, e) => sum + (parseFloat(e?.raise_goal_usd) || 0), 0))}
          </div>
          <div className="text-sm text-gray-300">Total Funding</div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Filter className="w-5 h-5 text-purple-400 mr-2" />
          Filter & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters?.status}
              onChange={(e) => setFilters({ ...filters, status: e?.target?.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
            <select
              value={filters?.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e?.target?.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Min Funding ($)</label>
            <input
              type="number"
              value={filters?.minFunding}
              onChange={(e) => setFilters({ ...filters, minFunding: e?.target?.value })}
              placeholder="e.g. 1000000"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters?.search}
                onChange={(e) => setFilters({ ...filters, search: e?.target?.value })}
                placeholder="Project name or symbol"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Events List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-teal-400 mr-2" />
          TGE Events ({events?.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading events...</p>
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No TGE events found matching your criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events?.map((event) => (
              <div key={event?.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{event?.project_name || 'Unnamed Project'}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-purple-400 font-medium">{event?.symbol || 'TBD'}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{event?.chain || 'TBD'}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{event?.source}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(event?.status)}`}>
                      {event?.status}
                    </span>
                    {event?.source_url && (
                      <a
                        href={event?.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">TGE Date:</span>
                    <div className="text-white font-medium">{formatDate(event?.tge_datetime)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Funding Goal:</span>
                    <div className="text-green-400 font-medium">{formatCurrency(event?.raise_goal_usd)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Token Price:</span>
                    <div className="text-yellow-400 font-medium">
                      {event?.price_usd ? `$${parseFloat(event?.price_usd)?.toFixed(4)}` : 'TBD'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">FDV:</span>
                    <div className="text-blue-400 font-medium">{formatCurrency(event?.fdv_usd)}</div>
                  </div>
                </div>

                {(event?.allocation || event?.vesting) && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {event?.allocation && (
                        <div>
                          <span className="text-gray-400">Allocation:</span>
                          <div className="text-gray-300">{event?.allocation}</div>
                        </div>
                      )}
                      {event?.vesting && (
                        <div>
                          <span className="text-gray-400">Vesting:</span>
                          <div className="text-gray-300">{event?.vesting}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {event?.tags && event?.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event?.tags?.slice(0, 5)?.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-600 text-xs text-gray-300 rounded">
                        {tag}
                      </span>
                    ))}
                    {event?.tags?.length > 5 && (
                      <span className="px-2 py-1 bg-gray-600 text-xs text-gray-400 rounded">
                        +{event?.tags?.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}