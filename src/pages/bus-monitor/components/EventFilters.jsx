import React from 'react';
import { Filter, X } from 'lucide-react';

const EventFilters = ({ filters, onFiltersChange }) => {
  const eventTypes = [
    { value: '', label: 'All Types' },
    { value: 'market_data', label: 'Market Data' },
    { value: 'trade_signal', label: 'Trade Signal' },
    { value: 'order_execution', label: 'Order Execution' },
    { value: 'risk_alert', label: 'Risk Alert' },
    { value: 'system_status', label: 'System Status' }
  ];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' }
  ];

  const processedStates = [
    { value: undefined, label: 'All Events' },
    { value: true, label: 'Processed' },
    { value: false, label: 'Pending' }
  ];

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      eventType: '',
      priority: '',
      processed: undefined,
      timeRange: '24h'
    });
  };

  const hasActiveFilters = filters?.eventType || filters?.priority || filters?.processed !== undefined;

  return (
    <div className="flex items-center space-x-4">
      {/* Event Type Filter */}
      <select
        value={filters?.eventType}
        onChange={(e) => updateFilter('eventType', e?.target?.value)}
        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
      >
        {eventTypes?.map((type) => (
          <option key={type?.value} value={type?.value}>
            {type?.label}
          </option>
        ))}
      </select>
      {/* Priority Filter */}
      <select
        value={filters?.priority}
        onChange={(e) => updateFilter('priority', e?.target?.value)}
        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
      >
        {priorities?.map((priority) => (
          <option key={priority?.value} value={priority?.value}>
            {priority?.label}
          </option>
        ))}
      </select>
      {/* Processed State Filter */}
      <select
        value={filters?.processed === undefined ? 'all' : filters?.processed?.toString()}
        onChange={(e) => {
          const value = e?.target?.value === 'all' ? undefined : e?.target?.value === 'true';
          updateFilter('processed', value);
        }}
        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
      >
        {processedStates?.map((state, index) => (
          <option key={index} value={state?.value === undefined ? 'all' : state?.value?.toString()}>
            {state?.label}
          </option>
        ))}
      </select>
      {/* Time Range Filter */}
      <select
        value={filters?.timeRange}
        onChange={(e) => updateFilter('timeRange', e?.target?.value)}
        className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
      >
        {timeRanges?.map((range) => (
          <option key={range?.value} value={range?.value}>
            {range?.label}
          </option>
        ))}
      </select>
      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm text-white transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Clear</span>
        </button>
      )}
      {/* Filter Icon */}
      <div className="flex items-center text-gray-400">
        <Filter className="w-4 h-4" />
      </div>
    </div>
  );
};

export default EventFilters;