import React from 'react';
import { X, Activity, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const EventStatsPanel = ({ stats, selectedEvent, onEventClose }) => {
  const eventTypeColors = {
    'market_data': '#3B82F6',
    'trade_signal': '#10B981', 
    'order_execution': '#F59E0B',
    'risk_alert': '#EF4444',
    'system_status': '#6366F1'
  };

  const priorityColors = {
    'low': '#6B7280',
    'medium': '#3B82F6',
    'high': '#F59E0B', 
    'critical': '#EF4444'
  };

  // Prepare data for charts
  const eventTypeData = stats?.byType ? 
    Object.entries(stats?.byType)?.map(([type, count]) => ({
      name: type?.replace('_', ' '),
      value: count,
      color: eventTypeColors?.[type] || '#6B7280'
    })) : [];

  const priorityData = stats?.byPriority ? 
    Object.entries(stats?.byPriority)?.map(([priority, count]) => ({
      name: priority,
      value: count,
      color: priorityColors?.[priority] || '#6B7280'
    })) : [];

  return (
    <div className="space-y-6">
      {/* Event Statistics */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Event Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded p-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-400">Total Events</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats?.total || 0}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-400">Processed</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {stats?.processed || 0}
            </div>
          </div>
        </div>

        {/* Event Type Distribution */}
        {eventTypeData?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Events by Type</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {eventTypeData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#374151',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-3">
              {eventTypeData?.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item?.color }}
                    ></div>
                    <span className="text-gray-300 capitalize">{item?.name}</span>
                  </div>
                  <span className="text-white font-medium">{item?.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Distribution */}
        {priorityData?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Events by Priority</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#374151',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Message Frequency */}
        {stats?.messageFrequency?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Message Frequency (24h)</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.messageFrequency}>
                  <XAxis 
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#374151',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelFormatter={(value) => `${value}:00`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Event Details</h3>
            <button
              onClick={onEventClose}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Event ID</label>
              <p className="text-white font-mono text-sm">{selectedEvent?.id}</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Type</label>
              <p className="text-white capitalize">{selectedEvent?.event_type?.replace('_', ' ')}</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Priority</label>
              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                selectedEvent?.priority === 'critical' ? 'bg-red-600 text-white' :
                selectedEvent?.priority === 'high' ? 'bg-yellow-600 text-white' :
                selectedEvent?.priority === 'medium'? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
              }`}>
                {selectedEvent?.priority}
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Created</label>
              <p className="text-white">{new Date(selectedEvent.created_at)?.toLocaleString()}</p>
            </div>

            {selectedEvent?.expires_at && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Expires</label>
                <p className="text-white">{new Date(selectedEvent.expires_at)?.toLocaleString()}</p>
              </div>
            )}

            {/* Agent Info */}
            {selectedEvent?.source_agent && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Source Agent</label>
                <p className="text-white">
                  {selectedEvent?.source_agent?.name}
                  {selectedEvent?.source_agent?.agent_group && (
                    <span className="text-gray-400 ml-2">({selectedEvent?.source_agent?.agent_group})</span>
                  )}
                </p>
              </div>
            )}

            {selectedEvent?.target_agent && (
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide">Target Agent</label>
                <p className="text-white">
                  {selectedEvent?.target_agent?.name}
                  {selectedEvent?.target_agent?.agent_group && (
                    <span className="text-gray-400 ml-2">({selectedEvent?.target_agent?.agent_group})</span>
                  )}
                </p>
              </div>
            )}

            {/* Event Data */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Event Data</label>
              <div className="bg-gray-900 rounded p-3 mt-1 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                  {JSON.stringify(selectedEvent?.event_data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">Status</label>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                  selectedEvent?.is_processed 
                    ? 'bg-green-600 text-white' :'bg-gray-600 text-white'
                }`}>
                  {selectedEvent?.is_processed ? 'Processed' : 'Pending'}
                </span>
                {selectedEvent?.processed_at && (
                  <span className="text-xs text-gray-400">
                    at {new Date(selectedEvent.processed_at)?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventStatsPanel;