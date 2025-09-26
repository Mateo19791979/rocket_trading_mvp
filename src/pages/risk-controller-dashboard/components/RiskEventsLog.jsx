import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const RiskEventsLog = ({ events, isLoading = false }) => {
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Events</h2>
        <div className="space-y-4">
          {[...Array(5)]?.map((_, i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Risk Events</h2>
        <span className="text-sm text-gray-500">
          {events?.length || 0} recent events
        </span>
      </div>
      {!events || events?.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <p className="text-gray-600">No risk events recorded</p>
          <p className="text-sm text-gray-500">System is operating normally</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events?.map((event) => (
            <div 
              key={event?.id} 
              className={`border rounded-lg p-4 ${getSeverityColor(event?.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getSeverityIcon(event?.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {event?.description || 'Unknown event'}
                      </h4>
                      <span className="text-xs opacity-75 ml-2">
                        {formatRelativeTime(event?.created_at)}
                      </span>
                    </div>
                    
                    {event?.details && (
                      <div className="mt-2 text-xs space-y-1">
                        {event?.details?.reason && (
                          <p><span className="font-medium">Reason:</span> {event?.details?.reason}</p>
                        )}
                        {event?.details?.agents_affected && (
                          <p><span className="font-medium">Agents affected:</span> {event?.details?.agents_affected}</p>
                        )}
                        {event?.details?.agents_reactivated && (
                          <p><span className="font-medium">Agents reactivated:</span> {event?.details?.agents_reactivated}</p>
                        )}
                      </div>
                    )}

                    {event?.resolved_at && (
                      <div className="mt-2 flex items-center text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-green-700">
                          Resolved {formatRelativeTime(event?.resolved_at)}
                          {event?.resolved_by?.full_name && (
                            <span> by {event?.resolved_by?.full_name}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {events && events?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View all events
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskEventsLog;