import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, HardDrive, Network, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function TelemetryMonitor({ lastUpdate, systemStatus }) {
  const [metrics, setMetrics] = useState({
    cpu: 24.5,
    memory: 68.2,
    disk: 45.8,
    network: 156.4,
    uptime: 45.2,
    errors: 2,
    warnings: 7
  });

  const [logs, setLogs] = useState([
    {
      timestamp: new Date(Date.now() - 300000),
      level: 'INFO',
      message: 'AI agent newsminer completed task successfully',
      component: 'newsminer'
    },
    {
      timestamp: new Date(Date.now() - 600000),
      level: 'WARN',
      message: 'Data source latency exceeded 2s threshold',
      component: 'data_collector'
    },
    {
      timestamp: new Date(Date.now() - 900000),
      level: 'INFO',
      message: 'Learning loop iteration completed',
      component: 'learning_controller'
    },
    {
      timestamp: new Date(Date.now() - 1200000),
      level: 'ERROR',
      message: 'Strategy execution timeout after 30s',
      component: 'execution_guru'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate metric updates
      setMetrics(prev => ({
        cpu: Math.max(10, Math.min(90, prev?.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, prev?.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(20, Math.min(80, prev?.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(50, Math.min(500, prev?.network + (Math.random() - 0.5) * 50)),
        uptime: prev?.uptime + 0.1,
        errors: prev?.errors + (Math.random() > 0.95 ? 1 : 0),
        warnings: prev?.warnings + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (value, type = 'percentage') => {
    if (type === 'percentage') {
      if (value < 50) return 'text-green-400';
      if (value < 80) return 'text-yellow-400';
      return 'text-red-400';
    }
    return 'text-blue-400';
  };

  const getLogIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'WARN':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'INFO':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatUptime = (hours) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Activity className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Telemetry Monitor</h3>
            <p className="text-sm text-gray-400">Real-time system health and performance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${systemStatus === 'healthy' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm text-gray-400 capitalize">{systemStatus}</span>
        </div>
      </div>
      {/* System Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">CPU</span>
            </div>
            <span className={`text-sm font-semibold ${getMetricColor(metrics?.cpu)}`}>
              {metrics?.cpu?.toFixed(1)}%
            </span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                metrics?.cpu < 50 ? 'bg-green-400' :
                metrics?.cpu < 80 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${metrics?.cpu}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Memory</span>
            </div>
            <span className={`text-sm font-semibold ${getMetricColor(metrics?.memory)}`}>
              {metrics?.memory?.toFixed(1)}%
            </span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                metrics?.memory < 50 ? 'bg-green-400' :
                metrics?.memory < 80 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${metrics?.memory}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Network className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-gray-400">Network</span>
            </div>
            <span className="text-sm font-semibold text-teal-400">
              {metrics?.network?.toFixed(0)} KB/s
            </span>
          </div>
          <div className="text-xs text-gray-500">I/O throughput</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-400">Uptime</span>
            </div>
            <span className="text-sm font-semibold text-orange-400">
              {formatUptime(metrics?.uptime)}
            </span>
          </div>
          <div className="text-xs text-gray-500">System availability</div>
        </div>
      </div>
      {/* Error Summary */}
      <div className="mb-6 bg-gray-800/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300">Error Summary</h4>
          <span className="text-xs text-gray-400">Last 24 hours</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Errors</span>
            <span className="text-sm font-semibold text-red-400">{metrics?.errors}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Warnings</span>
            <span className="text-sm font-semibold text-yellow-400">{metrics?.warnings}</span>
          </div>
        </div>
      </div>
      {/* Recent Logs */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Activity</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {logs?.map((log, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/20 rounded-lg p-3 flex items-start space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {getLogIcon(log?.level)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{log?.component}</span>
                  <span className="text-xs text-gray-500">
                    {log?.timestamp?.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 truncate">{log?.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}