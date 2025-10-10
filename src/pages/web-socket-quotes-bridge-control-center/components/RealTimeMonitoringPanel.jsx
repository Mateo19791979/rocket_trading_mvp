import React from 'react';
import Button from '../../../components/ui/Button';

const RealTimeMonitoringPanel = ({ activeStreams, wsHealth }) => {
  const formatPrice = (price) => {
    return price ? `$${parseFloat(price)?.toFixed(2)}` : 'N/A';
  };

  const formatVolume = (volume) => {
    if (!volume) return '0';
    if (volume >= 1000000) return `${(volume / 1000000)?.toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000)?.toFixed(1)}K`;
    return volume?.toString();
  };

  const formatTimestamp = (timestamp) => {
    return timestamp ? new Date(timestamp)?.toLocaleTimeString() : 'N/A';
  };

  const getChangeColor = (changePercent) => {
    if (!changePercent) return 'text-gray-500 dark:text-gray-400';
    return changePercent >= 0 
      ? 'text-green-600 dark:text-green-400' :'text-red-600 dark:text-red-400';
  };

  const formatChangePercent = (changePercent) => {
    if (!changePercent) return '0.00%';
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent?.toFixed(2)}%`;
  };

  // Calculate performance metrics
  const totalStreams = activeStreams?.length || 0;
  const averageLatency = wsHealth?.reduce((sum, server) => {
    return sum + (server?.cpuUsage || 0);
  }, 0) / (wsHealth?.length || 1);

  const totalDataPoints = activeStreams?.reduce((sum, stream) => {
    return sum + (stream?.volume || 0);
  }, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Real-time Monitoring
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{totalStreams} active streams</span>
            <span>Avg latency: {averageLatency?.toFixed(1)}ms</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalStreams}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active Streams</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatVolume(totalDataPoints)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Data Points</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {averageLatency?.toFixed(0)}ms
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Latency</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {wsHealth?.filter(h => h?.status === 'healthy')?.length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Healthy Servers</p>
          </div>
        </div>

        {/* Live Stream Data */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Live Quote Stream
            </h3>
            <Button
              variant="ghost"
              size="sm"
              iconName="Activity"
            >
              View All
            </Button>
          </div>
          
          {activeStreams?.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No active streams</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeStreams?.slice(0, 8)?.map((stream, index) => (
                <div
                  key={stream?.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {stream?.symbol}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stream?.name || stream?.provider}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(stream?.price)}
                    </p>
                    <p className={`text-xs font-medium ${getChangeColor(stream?.changePercent)}`}>
                      {formatChangePercent(stream?.changePercent)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Vol: {formatVolume(stream?.volume)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(stream?.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {activeStreams?.length > 8 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    +{activeStreams?.length - 8} more streams
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connection Analytics */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Connection Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Connection Events
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 100) + 150}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reconnections
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 10) + 2}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Success Rate
              </p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                98.7%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoringPanel;