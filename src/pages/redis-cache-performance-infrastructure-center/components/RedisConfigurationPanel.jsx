import React, { useState, useEffect } from 'react';
import { Database, Settings, Monitor, AlertCircle, CheckCircle, Activity, HardDrive } from 'lucide-react';

export default function RedisConfigurationPanel({ stats }) {
  const [redisConfig, setRedisConfig] = useState({
    url: 'redis://redis:6379',
    ttlQuotes: 5,
    ttlOhlc: 60,
    maxMemory: '256mb',
    evictionPolicy: 'allkeys-lru',
    persistence: 'appendonly',
    clusterMode: false
  });

  const [connectionStatus, setConnectionStatus] = useState({
    status: 'connected',
    version: '7.0.11',
    memory: {
      used: '164.2MB',
      peak: '198.7MB',
      fragmentation: 1.12
    },
    stats: {
      totalConnections: 23,
      commandsProcessed: 154892,
      keyspaceHits: 89234,
      keyspaceMisses: 12034
    }
  });

  const [environmentVars, setEnvironmentVars] = useState([
    { key: 'REDIS_URL', value: 'redis://redis:6379', description: 'Redis connection string' },
    { key: 'REDIS_TTL_QUOTES', value: '5', description: 'Cache duration for /quotes endpoint (seconds)' },
    { key: 'REDIS_TTL_OHLC', value: '60', description: 'Cache duration for OHLC data (seconds)' },
    { key: 'REDIS_MAX_MEMORY', value: '256mb', description: 'Maximum memory allocation' },
    { key: 'REDIS_EVICTION_POLICY', value: 'allkeys-lru', description: 'Memory eviction policy' }
  ]);

  const handleConfigUpdate = (key, value) => {
    setRedisConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyConfiguration = () => {
    // Simulate configuration update
    console.log('Applying Redis configuration:', redisConfig);
    // Here you would make API call to update configuration
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Redis Connection Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-red-400" />
          Redis Server Status
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-green-400 font-semibold">Connected</div>
              <div className="text-sm text-gray-400">Redis {connectionStatus?.version}</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Memory Usage
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Used Memory:</span>
                <span className="text-white">{connectionStatus?.memory?.used}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak Memory:</span>
                <span className="text-white">{connectionStatus?.memory?.peak}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fragmentation:</span>
                <span className="text-white">{connectionStatus?.memory?.fragmentation}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Connection Stats
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Connections:</span>
                <span className="text-white">{connectionStatus?.stats?.totalConnections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Commands Processed:</span>
                <span className="text-white">{connectionStatus?.stats?.commandsProcessed?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Keyspace Hits:</span>
                <span className="text-green-400">{connectionStatus?.stats?.keyspaceHits?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Keyspace Misses:</span>
                <span className="text-orange-400">{connectionStatus?.stats?.keyspaceMisses?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Redis Configuration Settings */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Configuration Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Redis URL</label>
            <input
              type="text"
              value={redisConfig?.url}
              onChange={(e) => handleConfigUpdate('url', e?.target?.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TTL Quotes (sec)</label>
              <input
                type="number"
                value={redisConfig?.ttlQuotes}
                onChange={(e) => handleConfigUpdate('ttlQuotes', parseInt(e?.target?.value))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">TTL OHLC (sec)</label>
              <input
                type="number"
                value={redisConfig?.ttlOhlc}
                onChange={(e) => handleConfigUpdate('ttlOhlc', parseInt(e?.target?.value))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Memory</label>
            <select
              value={redisConfig?.maxMemory}
              onChange={(e) => handleConfigUpdate('maxMemory', e?.target?.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="128mb">128MB</option>
              <option value="256mb">256MB</option>
              <option value="512mb">512MB</option>
              <option value="1gb">1GB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Eviction Policy</label>
            <select
              value={redisConfig?.evictionPolicy}
              onChange={(e) => handleConfigUpdate('evictionPolicy', e?.target?.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option value="allkeys-lru">All Keys LRU</option>
              <option value="allkeys-lfu">All Keys LFU</option>
              <option value="volatile-lru">Volatile LRU</option>
              <option value="volatile-lfu">Volatile LFU</option>
            </select>
          </div>

          <button
            onClick={applyConfiguration}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Apply Configuration
          </button>
        </div>
      </div>
      {/* Environment Variables */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-green-400" />
          Environment Variables
        </h3>

        <div className="space-y-3">
          {environmentVars?.map((envVar, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <code className="text-blue-400 font-mono text-sm">{envVar?.key}</code>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="text-white font-mono text-sm mb-1">{envVar?.value}</div>
              <div className="text-gray-400 text-xs">{envVar?.description}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-semibold">Configuration Note</span>
          </div>
          <p className="text-sm text-yellow-200">
            Changes to environment variables require a container restart to take effect. 
            Use the Docker Orchestration panel to manage container lifecycle.
          </p>
        </div>
      </div>
    </div>
  );
}