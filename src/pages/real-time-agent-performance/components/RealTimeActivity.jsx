import React, { useState, useEffect } from 'react';
import { Activity, Clock, Brain, TrendingUp, TrendingDown } from 'lucide-react';

const RealTimeActivity = ({ activity }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(value || 0);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const now = currentTime;
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActionColor = (pnl) => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  const getActionIcon = (pnl) => {
    if (pnl > 0) return <TrendingUp className="h-4 w-4" />;
    if (pnl < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    if (confidence >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!activity || activity?.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Real-time Activity
        </h3>
        <div className="text-center text-gray-400 py-12">
          No recent activity
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Real-time Activity
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activity?.map((item, index) => (
          <div 
            key={item?.id || index} 
            className="bg-gray-700/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-700/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-900 rounded-lg">
                  <Brain className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{item?.agentName}</h4>
                  <p className="text-xs text-gray-400 capitalize">{item?.strategy} strategy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeAgo(item?.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">{item?.action}</span>
                <div className={`flex items-center space-x-1 ${getActionColor(item?.pnl)}`}>
                  {getActionIcon(item?.pnl)}
                  <span className="text-sm font-medium">
                    {formatCurrency(item?.pnl)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {item?.quantity > 0 && (
                  <span className="text-xs text-gray-400">
                    {item?.quantity} @ {formatCurrency(item?.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Confidence Level */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Confidence</span>
                <span className="text-xs text-white">{item?.confidence?.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getConfidenceColor(item?.confidence)}`}
                  style={{ width: `${Math.max(item?.confidence, 5)}%` }}
                />
              </div>
            </div>

            {/* Reasoning */}
            {item?.reasoning && (
              <div className="bg-gray-800 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">Reasoning:</p>
                <p className="text-sm text-gray-300 line-clamp-2">
                  {item?.reasoning}
                </p>
              </div>
            )}

            {/* Execution Time */}
            {item?.executionTime > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Execution time: {item?.executionTime}ms
              </div>
            )}
          </div>
        ))}
      </div>
      {activity?.length >= 50 && (
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Showing latest 50 activities
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeActivity;