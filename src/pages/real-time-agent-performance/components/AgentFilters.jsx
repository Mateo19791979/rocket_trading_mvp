import React from 'react';
import { Filter, SortDesc } from 'lucide-react';

const AgentFilters = ({ filters, onFilterChange }) => {
  const strategies = [
    { value: 'all', label: 'All Strategies' },
    { value: 'momentum', label: 'Momentum' },
    { value: 'mean_reversion', label: 'Mean Reversion' },
    { value: 'arbitrage', label: 'Arbitrage' },
    { value: 'scalping', label: 'Scalping' },
    { value: 'swing', label: 'Swing Trading' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'paused', label: 'Paused' },
    { value: 'error', label: 'Error' }
  ];

  const timeframes = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const sortOptions = [
    { value: 'totalPnL', label: 'Total P&L' },
    { value: 'winRate', label: 'Win Rate' },
    { value: 'totalTrades', label: 'Total Trades' },
    { value: 'avgProfitPerTrade', label: 'Avg Profit/Trade' },
    { value: 'lastActiveAt', label: 'Last Active' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-white">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Strategy Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Strategy
          </label>
          <select
            value={filters?.strategy}
            onChange={(e) => handleFilterChange('strategy', e?.target?.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {strategies?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Status
          </label>
          <select
            value={filters?.status}
            onChange={(e) => handleFilterChange('status', e?.target?.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {statuses?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Timeframe
          </label>
          <select
            value={filters?.timeframe}
            onChange={(e) => handleFilterChange('timeframe', e?.target?.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {timeframes?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            <SortDesc className="h-4 w-4 inline mr-1" />
            Sort By
          </label>
          <select
            value={filters?.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e?.target?.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            {sortOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Active Filters Summary */}
      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-700">
        <span className="text-sm text-gray-400">Active filters:</span>
        {filters?.strategy !== 'all' && (
          <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">
            {strategies?.find(s => s?.value === filters?.strategy)?.label}
          </span>
        )}
        {filters?.status !== 'all' && (
          <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">
            {statuses?.find(s => s?.value === filters?.status)?.label}
          </span>
        )}
        <span className="bg-purple-900 text-purple-300 text-xs px-2 py-1 rounded">
          {timeframes?.find(t => t?.value === filters?.timeframe)?.label}
        </span>
        <span className="bg-orange-900 text-orange-300 text-xs px-2 py-1 rounded">
          Sort: {sortOptions?.find(s => s?.value === filters?.sortBy)?.label}
        </span>
        
        {(filters?.strategy !== 'all' || filters?.status !== 'all') && (
          <button
            onClick={() => onFilterChange({ strategy: 'all', status: 'all' })}
            className="text-xs text-gray-400 hover:text-white ml-2"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentFilters;