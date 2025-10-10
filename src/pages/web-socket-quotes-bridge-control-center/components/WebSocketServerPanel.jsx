import React from 'react';
import Button from '../../../components/ui/Button';

const WebSocketServerPanel = ({ wsHealth, onRefresh }) => {
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 MB';
    return `${bytes?.toFixed(1)} MB`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            WebSocket Server Management
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
      </div>
      <div className="p-6">
        {wsHealth?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.477-.98-6.02-2.54-.875-.885-1.405-2.098-1.405-3.46 0-1.362.53-2.575 1.405-3.46A7.963 7.963 0 0112 3c2.34 0 4.477.98 6.02 2.54.875.885 1.405 2.098 1.405 3.46 0 1.362-.53 2.575-1.405 3.46z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No WebSocket servers detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wsHealth?.map((server, index) => (
              <div
                key={server?.id || index}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      server?.status === 'healthy' ?'bg-green-500' :'bg-red-500'
                    }`}></div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {server?.agentName || 'WebSocket Server'}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    server?.status === 'healthy' ?'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {server?.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      CPU Usage
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {server?.cpuUsage ? `${server?.cpuUsage?.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Memory
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatBytes(server?.memoryUsage)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uptime
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatUptime(server?.uptime || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Errors
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {server?.errorCount || 0}
                    </p>
                  </div>
                </div>

                {server?.lastHeartbeat && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last heartbeat: {new Date(server.lastHeartbeat)?.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              iconName="Server"
            >
              View Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Activity"
            >
              Performance
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Settings"
            >
              Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketServerPanel;