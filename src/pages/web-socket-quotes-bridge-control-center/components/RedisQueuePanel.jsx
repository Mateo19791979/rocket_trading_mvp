import React from 'react';
import Button from '../../../components/ui/Button';

const RedisQueuePanel = ({ redisMetrics, onRefresh }) => {
  const formatProcessingTime = (time) => {
    if (!time) return '0ms';
    if (time > 1000) return `${(time / 1000)?.toFixed(1)}s`;
    return `${Math.round(time)}ms`;
  };

  const formatTimestamp = (timestamp) => {
    return timestamp ? new Date(timestamp)?.toLocaleTimeString() : 'N/A';
  };

  const getQueueHealthColor = (queueDepth) => {
    if (queueDepth === 0) return 'text-green-600 dark:text-green-400';
    if (queueDepth < 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQueueHealthStatus = (queueDepth) => {
    if (queueDepth === 0) return 'Healthy';
    if (queueDepth < 10) return 'Moderate';
    return 'High Load';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Redis Queue Management
          </h2>
          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
          >
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pub/sub channel monitoring and queue optimization
        </p>
      </div>
      
      <div className="p-6">
        {/* Queue Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {redisMetrics?.totalEvents || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Events</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {redisMetrics?.processedEvents || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Processed</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className={`text-2xl font-bold ${getQueueHealthColor(redisMetrics?.queueDepth || 0)}`}>
              {redisMetrics?.queueDepth || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Queue Depth</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatProcessingTime(redisMetrics?.averageProcessingTime)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Process Time</p>
          </div>
        </div>

        {/* Queue Health Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Queue Health Status
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              redisMetrics?.queueDepth === 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : redisMetrics?.queueDepth < 10
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {getQueueHealthStatus(redisMetrics?.queueDepth || 0)}
            </span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Processing Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {redisMetrics?.totalEvents > 0 
                  ? `${Math.round((redisMetrics?.processedEvents / redisMetrics?.totalEvents) * 100)}%`
                  : '100%'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: redisMetrics?.totalEvents > 0 
                    ? `${Math.round((redisMetrics?.processedEvents / redisMetrics?.totalEvents) * 100)}%`
                    : '100%'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recent Queue Events ({redisMetrics?.recentEvents?.length || 0})
          </h3>
          
          {!redisMetrics?.recentEvents?.length ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No recent events</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {redisMetrics?.recentEvents?.map((event, index) => (
                <div
                  key={event?.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event?.isProcessed 
                        ? 'bg-green-500' :'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event?.type || 'market_data'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Priority: {event?.priority || 'medium'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xs font-medium ${
                      event?.isProcessed 
                        ? 'text-green-600 dark:text-green-400' :'text-orange-600 dark:text-orange-400'
                    }`}>
                      {event?.isProcessed ? 'Processed' : 'Pending'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(event?.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memory Usage & Controls */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Memory & Performance
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Database"
              >
                Flush Queue
              </Button>
              <Button
                variant="outline"
                size="sm"
                iconName="Zap"
              >
                Optimize
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                2.4MB
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Memory Used</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                150ms
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pub/Sub Latency</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                99.2%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedisQueuePanel;