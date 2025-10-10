import React, { useState, useEffect } from 'react';
import { Database, Globe, TrendingUp, Clock, RefreshCw, Search, Download, Eye, Calendar } from 'lucide-react';
import TgeDataSourcesPanel from './components/TgeDataSourcesPanel';
import TgeEventsPanel from './components/TgeEventsPanel';
import AlphaIntelligencePanel from './components/AlphaIntelligencePanel';
import tgeService from '../../services/tgeService';

export default function TGEAlphaIntelligenceCenter() {
  const [tgeEvents, setTgeEvents] = useState([]);
  const [statistics, setStatistics] = useState({
    total_events: 0,
    upcoming_events: 0,
    live_events: 0,
    sources_count: 0,
    last_updated: null
  });
  const [sourcesStatus, setSourcesStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [sourceFilter, setSourceFilter] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTgeEvents();
  }, [searchQuery, statusFilter, sourceFilter]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTgeEvents(),
        loadStatistics(),
        loadSourcesStatus()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTgeEvents = async () => {
    const filters = {
      search: searchQuery,
      status: statusFilter || null,
      source: sourceFilter || null,
      limit: 100
    };

    const response = await tgeService?.getTgeEvents(filters);
    if (response?.success) {
      setTgeEvents(response?.data || []);
    }
  };

  const loadStatistics = async () => {
    const response = await tgeService?.getTgeStatistics();
    if (response?.success) {
      setStatistics(response?.data || statistics);
    }
  };

  const loadSourcesStatus = async () => {
    const response = await tgeService?.getDataSourcesStatus();
    if (response?.success) {
      setSourcesStatus(response?.data || []);
    }
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await tgeService?.refreshTgeData();
      await loadInitialData();
    } catch (error) {
      console.error('Failed to refresh TGE data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleSourceFilter = (source) => {
    setSourceFilter(source);
  };

  const handleExportData = async () => {
    try {
      const response = await tgeService?.getTgeEvents({ limit: 1000 });
      if (response?.success) {
        const csvContent = convertToCSV(response?.data);
        downloadCSV(csvContent, 'tge-events.csv');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const convertToCSV = (data) => {
    if (!data?.length) return '';
    
    const headers = ['Project Name', 'Symbol', 'Chain', 'Sale Stage', 'TGE Date', 'Status', 'Source', 'Price USD', 'Raise Goal USD'];
    const rows = data?.map(event => [
      event?.project_name || '',
      event?.symbol || '',
      event?.chain || '',
      event?.sale_stage || '',
      event?.tge_datetime ? new Date(event.tge_datetime)?.toISOString()?.split('T')?.[0] : '',
      event?.status || '',
      event?.source || '',
      event?.price_usd || '',
      event?.raise_goal_usd || ''
    ]);
    
    return [headers, ...rows]?.map(row => row?.join(','))?.join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link?.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link?.setAttribute('href', url);
      link?.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading TGE Alpha Intelligence Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                  TGE Alpha Intelligence Center
                </h1>
                <p className="text-gray-400">
                  Token Generation Events • Market Intelligence • Investment Opportunities
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none w-64"
                value={searchQuery}
                onChange={(e) => handleSearch(e?.target?.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <select
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e?.target?.value)}
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="finished">Finished</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                value={sourceFilter}
                onChange={(e) => handleSourceFilter(e?.target?.value)}
              >
                <option value="">All Sources</option>
                <option value="icoanalytics">IcoAnalytics</option>
                <option value="coinlaunch">CoinLaunch</option>
                <option value="cryptorank">CryptoRank</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={handleRefreshData}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-5 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-xl font-bold text-white">{statistics?.total_events}</p>
              </div>
              <Database className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming</p>
                <p className="text-xl font-bold text-teal-400">{statistics?.upcoming_events}</p>
              </div>
              <Calendar className="w-8 h-8 text-teal-400" />
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Events</p>
                <p className="text-xl font-bold text-green-400">{statistics?.live_events}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Data Sources</p>
                <p className="text-xl font-bold text-orange-400">{statistics?.sources_count}</p>
              </div>
              <Globe className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Last Updated</p>
                <p className="text-sm text-gray-300">
                  {statistics?.last_updated 
                    ? new Date(statistics.last_updated)?.toLocaleString() 
                    : 'Never'
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
      {/* Three-column layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* Left Column - TGE Data Sources */}
        <div className="col-span-3 space-y-6">
          <TgeDataSourcesPanel 
            sourcesStatus={sourcesStatus}
            onRefresh={handleRefreshData}
            refreshing={refreshing}
          />
        </div>

        {/* Center Column - TGE Events Dashboard */}
        <div className="col-span-6 space-y-6">
          <TgeEventsPanel 
            events={tgeEvents}
            loading={loading}
            onEventSelect={(event) => console.log('Event selected:', event)}
          />
        </div>

        {/* Right Column - Alpha Intelligence */}
        <div className="col-span-3 space-y-6">
          <AlphaIntelligencePanel 
            events={tgeEvents}
            statistics={statistics}
          />
        </div>
      </div>
    </div>
  );
}