import React, { useState, useEffect } from 'react';
import { Server, Database, Globe, Activity, Settings, Play, Pause, RefreshCw, AlertTriangle } from 'lucide-react';

export default function DockerOrchestrationPanel({ stats }) {
  const [containers, setContainers] = useState([
    {
      id: 'traefik',
      name: 'MVP Traefik',
      status: 'running',
      uptime: '2d 4h 23m',
      cpu: 2.1,
      memory: 45.3,
      network: '34.2MB/12.8MB',
      restarts: 0,
      ports: ['80:80', '443:443'],
      image: 'traefik:v3.0'
    },
    {
      id: 'redis',
      name: 'MVP Redis',
      status: 'running',
      uptime: '2d 4h 20m',
      cpu: 1.8,
      memory: 32.7,
      network: '18.9MB/25.1MB',
      restarts: 0,
      ports: ['6379:6379'],
      image: 'redis:7-alpine'
    },
    {
      id: 'frontend',
      name: 'MVP Frontend',
      status: 'running',
      uptime: '1d 12h 5m',
      cpu: 0.5,
      memory: 28.9,
      network: '156.3MB/89.7MB',
      restarts: 1,
      ports: ['80:80'],
      image: 'nginx:1.27-alpine'
    },
    {
      id: 'api',
      name: 'MVP API',
      status: 'running',
      uptime: '1d 12h 3m',
      cpu: 3.2,
      memory: 67.4,
      network: '98.4MB/134.2MB',
      restarts: 2,
      ports: ['3000:3000'],
      image: 'node:20-alpine'
    }
  ]);

  const [volumes, setVolumes] = useState([
    {
      name: 'traefik_letsencrypt',
      size: '24.3MB',
      mountPath: '/letsencrypt',
      container: 'traefik',
      type: 'named'
    },
    {
      name: 'redis_data',
      size: '156.7MB',
      mountPath: '/data',
      container: 'redis',
      type: 'named'
    }
  ]);

  const [networkInfo] = useState({
    name: 'web',
    driver: 'bridge',
    containers: 4,
    subnet: '172.18.0.0/16',
    gateway: '172.18.0.1'
  });

  const [composeLogs, setComposeLogs] = useState([
    { timestamp: '2024-10-07 19:04:01', level: 'INFO', service: 'traefik', message: 'Configuration loaded successfully' },
    { timestamp: '2024-10-07 19:03:58', level: 'INFO', service: 'redis', message: 'Redis server started' },
    { timestamp: '2024-10-07 19:03:55', level: 'INFO', service: 'frontend', message: 'Nginx configuration reloaded' },
    { timestamp: '2024-10-07 19:03:52', level: 'INFO', service: 'api', message: 'API server listening on port 3000' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-400';
      case 'stopped':
        return 'text-red-400';
      case 'restarting':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-green-400" />;
      case 'stopped':
        return <Pause className="w-4 h-4 text-red-400" />;
      case 'restarting':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleContainerAction = (containerId, action) => {
    console.log(`${action} container:`, containerId);
    // Here you would make API call to perform container action
  };

  const deployStack = () => {
    console.log('Deploying Docker stack...');
    // Here you would make API call to deploy/update the stack
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Container Status */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-red-400" />
          Container Orchestration
        </h3>

        <div className="space-y-4">
          {containers?.map((container) => (
            <div key={container?.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(container?.status)}
                  <div>
                    <h4 className="text-white font-semibold">{container?.name}</h4>
                    <p className="text-sm text-gray-400">{container?.image}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(container?.status)}`}>
                    {container?.status}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleContainerAction(container?.id, 'restart')}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleContainerAction(container?.id, 'logs')}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Uptime:</span>
                  <div className="text-white">{container?.uptime}</div>
                </div>
                <div>
                  <span className="text-gray-400">CPU:</span>
                  <div className="text-white">{container?.cpu}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Memory:</span>
                  <div className="text-white">{container?.memory}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Network:</span>
                  <div className="text-white text-xs">{container?.network}</div>
                </div>
              </div>

              {container?.restarts > 0 && (
                <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Restarted {container?.restarts} time(s)</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            onClick={deployStack}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Deploy Stack
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Update Services
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Scale Services
          </button>
        </div>
      </div>
      {/* Volume Management & Network Info */}
      <div className="space-y-6">
        {/* Persistent Volumes */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Persistent Volumes
          </h3>

          <div className="space-y-3">
            {volumes?.map((volume, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{volume?.name}</span>
                  <span className="text-gray-400 text-sm">{volume?.size}</span>
                </div>
                <div className="text-sm text-gray-400">
                  <div>Mount: {volume?.mountPath}</div>
                  <div>Container: {volume?.container}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            Network Configuration
          </h3>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-white">{networkInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Driver:</span>
                <span className="text-white">{networkInfo?.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subnet:</span>
                <span className="text-white">{networkInfo?.subnet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gateway:</span>
                <span className="text-white">{networkInfo?.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Containers:</span>
                <span className="text-white">{networkInfo?.containers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Container Logs */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-400" />
            Recent Logs
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {composeLogs?.map((log, index) => (
              <div key={index} className="text-xs font-mono bg-gray-900 rounded p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400">{log?.timestamp}</span>
                  <span className={`px-1 rounded text-xs ${
                    log?.level === 'INFO' ? 'bg-blue-600' : 
                    log?.level === 'WARN' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    {log?.level}
                  </span>
                  <span className="text-blue-400">{log?.service}</span>
                </div>
                <div className="text-gray-300">{log?.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}