import React, { useState, useMemo } from 'react';
import { Calendar, ExternalLink, Tag, Globe, Twitter, MessageCircle, SortAsc, SortDesc } from 'lucide-react';

export default function TgeEventsPanel({ events, loading, onEventSelect }) {
  const [sortField, setSortField] = useState('tge_datetime');
  const [sortDirection, setSortDirection] = useState('asc');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const sortedEvents = React.useMemo(() => {
    if (!events?.length) return [];

    return [...events]?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      // Handle dates
      if (sortField === 'tge_datetime') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle numbers
      if (sortField === 'price_usd' || sortField === 'raise_goal_usd') {
        aValue = parseFloat(aValue || 0);
        bValue = parseFloat(bValue || 0);
      }

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = (bValue || '')?.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [events, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'live':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'finished':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSourceColor = (source) => {
    switch (source?.toLowerCase()) {
      case 'icoanalytics':
        return 'text-purple-400';
      case 'coinlaunch':
        return 'text-teal-400';
      case 'cryptorank':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
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

  const getTimeUntilTGE = (dateString) => {
    if (!dateString) return null;
    
    const tgeDate = new Date(dateString);
    const now = new Date();
    const diff = tgeDate?.getTime() - now?.getTime();
    
    if (diff < 0) return 'Past';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading TGE events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">TGE Events Dashboard</h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'cards' ?'bg-purple-600 text-white' :'text-gray-400 hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'table' ?'bg-purple-600 text-white' :'text-gray-400 hover:text-white'
                }`}
              >
                Table
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e?.target?.value)}
                className="bg-gray-700 text-white px-3 py-1 text-sm rounded-lg border border-gray-600"
              >
                <option value="tge_datetime">TGE Date</option>
                <option value="project_name">Project Name</option>
                <option value="price_usd">Price</option>
                <option value="raise_goal_usd">Raise Goal</option>
                <option value="status">Status</option>
                <option value="source">Source</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        {viewMode === 'cards' ? (
          /* Cards View */
          (<div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {sortedEvents?.map((event, index) => (
              <div 
                key={event?.id || index} 
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-purple-500/50 transition-colors cursor-pointer"
                onClick={() => onEventSelect?.(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-lg">
                        {event?.project_name || 'Unknown Project'}
                      </h3>
                      {event?.symbol && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded border border-purple-500/30">
                          {event?.symbol}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      {event?.chain && (
                        <span className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{event?.chain}</span>
                        </span>
                      )}
                      {event?.sale_stage && (
                        <span className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{event?.sale_stage}</span>
                        </span>
                      )}
                      <span className={`flex items-center space-x-1 ${getSourceColor(event?.source)}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        <span>{event?.source}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(event?.status)}`}>
                      {event?.status?.toUpperCase() || 'UNKNOWN'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">TGE Date</div>
                    <div className="text-sm text-white">
                      <div>{formatDate(event?.tge_datetime)}</div>
                      {event?.tge_datetime && (
                        <div className="text-xs text-gray-400">
                          {getTimeUntilTGE(event?.tge_datetime)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-400 mb-1">Price / Raise Goal</div>
                    <div className="text-sm">
                      <div className="text-green-400">{formatCurrency(event?.price_usd)}</div>
                      <div className="text-blue-400 text-xs">{formatCurrency(event?.raise_goal_usd)} goal</div>
                    </div>
                  </div>
                </div>

                {(event?.website || event?.twitter || event?.telegram) && (
                  <div className="flex items-center space-x-3 pt-2 border-t border-gray-600">
                    {event?.website && (
                      <a
                        href={event?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e?.stopPropagation()}
                        className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Website</span>
                      </a>
                    )}
                    {event?.twitter && (
                      <a
                        href={event?.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e?.stopPropagation()}
                        className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <Twitter className="w-3 h-3" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {event?.telegram && (
                      <a
                        href={event?.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e?.stopPropagation()}
                        className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Telegram</span>
                      </a>
                    )}
                  </div>
                )}

                {event?.tags && event?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-600">
                    {event?.tags?.slice(0, 4)?.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {event?.tags?.length > 4 && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded">
                        +{event?.tags?.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {(!sortedEvents || sortedEvents?.length === 0) && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No TGE events found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or refresh the data</p>
              </div>
            )}
          </div>)
        ) : (
          /* Table View */
          (<div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th 
                    className="text-left py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('project_name')}
                  >
                    Project
                  </th>
                  <th 
                    className="text-left py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol
                  </th>
                  <th 
                    className="text-left py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('tge_datetime')}
                  >
                    TGE Date
                  </th>
                  <th 
                    className="text-left py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('price_usd')}
                  >
                    Price
                  </th>
                  <th 
                    className="text-left py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </th>
                  <th 
                    className="text-left py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('source')}
                  >
                    Source
                  </th>
                  <th className="text-left py-2 px-2 text-gray-400">Links</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents?.map((event, index) => (
                  <tr 
                    key={event?.id || index} 
                    className="border-b border-gray-700 hover:bg-gray-700/30 cursor-pointer"
                    onClick={() => onEventSelect?.(event)}
                  >
                    <td className="py-3 px-2">
                      <div className="font-medium text-white">{event?.project_name || 'Unknown'}</div>
                      {event?.chain && (
                        <div className="text-xs text-gray-400">{event?.chain}</div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {event?.symbol && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                          {event?.symbol}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-white">
                      <div>{formatDate(event?.tge_datetime)}</div>
                      {event?.tge_datetime && (
                        <div className="text-xs text-gray-400">{getTimeUntilTGE(event?.tge_datetime)}</div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-green-400">
                      {formatCurrency(event?.price_usd)}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(event?.status)}`}>
                        {event?.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className={`py-3 px-2 ${getSourceColor(event?.source)}`}>
                      {event?.source}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        {event?.source_url && (
                          <a
                            href={event?.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e?.stopPropagation()}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {event?.website && (
                          <a
                            href={event?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e?.stopPropagation()}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Globe className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!sortedEvents || sortedEvents?.length === 0) && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No TGE events found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or refresh the data</p>
              </div>
            )}
          </div>)
        )}
      </div>
    </div>
  );
}