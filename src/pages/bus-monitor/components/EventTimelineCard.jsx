import React from 'react';
import { Clock, User, Target, AlertCircle, CheckCircle, Circle } from 'lucide-react';

const EventTimelineCard = ({ event, onClick, isSelected }) => {
  const getEventTypeColor = (eventType) => {
    const colors = {
      'market_data': 'border-blue-500 bg-blue-500/10',
      'trade_signal': 'border-green-500 bg-green-500/10',
      'order_execution': 'border-yellow-500 bg-yellow-500/10',
      'risk_alert': 'border-red-500 bg-red-500/10',
      'system_status': 'border-purple-500 bg-purple-500/10'
    };
    return colors?.[eventType] || 'border-gray-500 bg-gray-500/10';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'medium':
        return <Circle className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <Circle className="w-4 h-4 text-gray-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date?.toLocaleDateString();
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text?.length <= maxLength) return text;
    return text?.substring(0, maxLength) + '...';
  };

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
        getEventTypeColor(event?.event_type)
      } ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      }`}
      onClick={() => onClick?.(event)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getPriorityIcon(event?.priority)}
          <span className="font-semibold text-white capitalize">
            {event?.event_type?.replace('_', ' ')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(event?.created_at)}</span>
          {event?.is_processed && (
            <CheckCircle className="w-3 h-3 text-green-500" />
          )}
        </div>
      </div>
      {/* Agent Information */}
      <div className="flex items-center space-x-4 mb-3 text-sm">
        {event?.source_agent && (
          <div className="flex items-center space-x-1 text-gray-300">
            <User className="w-3 h-3" />
            <span className="font-medium">{event?.source_agent?.name}</span>
            {event?.source_agent?.agent_group && (
              <span className="text-gray-500">
                ({event?.source_agent?.agent_group})
              </span>
            )}
          </div>
        )}
        
        {event?.target_agent && (
          <>
            <span className="text-gray-500">→</span>
            <div className="flex items-center space-x-1 text-gray-300">
              <Target className="w-3 h-3" />
              <span className="font-medium">{event?.target_agent?.name}</span>
              {event?.target_agent?.agent_group && (
                <span className="text-gray-500">
                  ({event?.target_agent?.agent_group})
                </span>
              )}
            </div>
          </>
        )}
      </div>
      {/* Event Data Preview */}
      {event?.event_data && (
        <div className="bg-gray-900/50 rounded p-2">
          <div className="text-xs text-gray-400 mb-1">Event Data:</div>
          <div className="text-sm text-gray-300 font-mono">
            {typeof event?.event_data === 'string' 
              ? truncateText(event?.event_data, 80)
              : truncateText(JSON.stringify(event?.event_data), 80)
            }
          </div>
        </div>
      )}
      {/* Status and Priority Tags */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            event?.priority === 'critical' ? 'bg-red-600 text-white' :
            event?.priority === 'high' ? 'bg-yellow-600 text-white' :
            event?.priority === 'medium'? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
          }`}>
            {event?.priority}
          </span>
          
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            event?.is_processed 
              ? 'bg-green-600 text-white' :'bg-gray-600 text-white'
          }`}>
            {event?.is_processed ? 'Processed' : 'Pending'}
          </span>
        </div>

        {event?.expires_at && (
          <div className="text-xs text-gray-500">
            Expires: {formatTimestamp(event?.expires_at)}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTimelineCard;