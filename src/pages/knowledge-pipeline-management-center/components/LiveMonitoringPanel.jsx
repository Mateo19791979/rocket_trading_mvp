import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, Zap, BarChart3 } from 'lucide-react';
import knowledgePipelineService from '../../../services/knowledgePipelineService';

const LiveMonitoringPanel = ({ pipelineRunning }) => {
  const [metrics, setMetrics] = useState({
    documentsPerHour: 12,
    extractionSuccessRate: 85.7,
    registryUpdateFreq: 'Every 30 min',
    activeConnections: 4,
    memoryUsage: 64.2,
    cpuUsage: 23.8,
    diskUsage: 41.5,
    networkLatency: 45
  });

  const [realTimeData, setRealTimeData] = useState([
    { time: '14:30', processed: 15, extracted: 12, errors: 1 },
    { time: '14:31', processed: 18, extracted: 16, errors: 0 },
    { time: '14:32', processed: 22, extracted: 19, errors: 2 },
    { time: '14:33', processed: 16, extracted: 14, errors: 1 },
    { time: '14:34', processed: 25, extracted: 23, errors: 0 },
    { time: '14:35', processed: 20, extracted: 18, errors: 1 }
  ]);

  const [systemHealth, setSystemHealth] = useState({
    pipelineHealth: 'healthy',
    databaseHealth: 'healthy',
    storageHealth: 'healthy',
    apiHealth: 'healthy'
  });

  useEffect(() => {
    const loadMonitoringData = async () => {
      try {
        const metricsData = await knowledgePipelineService?.getProcessingMetrics();
        if (metricsData?.success && metricsData?.data) {
          setMetrics(prev => ({
            ...prev,
            documentsPerHour: metricsData?.data?.documentsProcessedPerHour || prev?.documentsPerHour,
            extractionSuccessRate: metricsData?.data?.extractionSuccessRate || prev?.extractionSuccessRate,
            registryUpdateFreq: metricsData?.data?.registryUpdateFrequency || prev?.registryUpdateFreq
          }));
        }
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
      }
    };

    loadMonitoringData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (pipelineRunning) {
        setRealTimeData(prev => {
          const now = new Date();
          const newTime = `${now?.getHours()?.toString()?.padStart(2, '0')}:${now?.getMinutes()?.toString()?.padStart(2, '0')}`;
          
          const newEntry = {
            time: newTime,
            processed: Math.floor(Math.random() * 15 + 10),
            extracted: Math.floor(Math.random() * 12 + 8),
            errors: Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 3)
          };

          return [...prev?.slice(1), newEntry];
        });

        setMetrics(prev => ({
          ...prev,
          cpuUsage: Math.max(10, Math.min(90, prev?.cpuUsage + (Math.random() - 0.5) * 10)),
          memoryUsage: Math.max(30, Math.min(95, prev?.memoryUsage + (Math.random() - 0.5) * 5)),
          networkLatency: Math.max(20, Math.min(200, prev?.networkLatency + (Math.random() - 0.5) * 20))
        }));
      }
    }, 30000); // Update every 30 seconds

    // Listen for refresh events
    const handleRefresh = () => {
      loadMonitoringData();
    };

    window.addEventListener('refresh-pipeline-status', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-pipeline-status', handleRefresh);
    };
  }, [pipelineRunning]);

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-400 bg-green-400/10';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'error': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getUsageColor = (usage) => {
    if (usage < 50) return 'text-green-400';
    if (usage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (usage) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-2">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Monitoring</h3>
            <p className="text-sm text-gray-400">Real-time processing metrics and system health</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Documents/Hour</span>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics?.documentsPerHour}</p>
              <p className="text-xs text-green-400">+12% from last hour</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Success Rate</span>
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics?.extractionSuccessRate}%</p>
              <p className="text-xs text-blue-400">Target: 85%+</p>
            </div>
          </div>

          {/* System Resources */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">System Resources</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">CPU Usage</span>
                  <span className={`text-xs font-semibold ${getUsageColor(metrics?.cpuUsage)}`}>
                    {metrics?.cpuUsage?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metrics?.cpuUsage)}`}
                    style={{ width: `${metrics?.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Memory Usage</span>
                  <span className={`text-xs font-semibold ${getUsageColor(metrics?.memoryUsage)}`}>
                    {metrics?.memoryUsage?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metrics?.memoryUsage)}`}
                    style={{ width: `${metrics?.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Disk Usage</span>
                  <span className={`text-xs font-semibold ${getUsageColor(metrics?.diskUsage)}`}>
                    {metrics?.diskUsage?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metrics?.diskUsage)}`}
                    style={{ width: `${metrics?.diskUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Activity */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {realTimeData?.slice(-3)?.reverse()?.map((entry, index) => (
                <div key={entry?.time} className="flex items-center justify-between p-2 rounded border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-mono text-gray-300">{entry?.time}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-400">{entry?.processed} processed</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-400">{entry?.extracted} extracted</span>
                    </div>
                    {entry?.errors > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-gray-400">{entry?.errors} errors</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">System Health</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(systemHealth)?.map(([component, health]) => (
                <div key={component} className="flex items-center justify-between p-2 rounded border border-gray-700/50">
                  <span className="text-sm text-gray-300 capitalize">
                    {component?.replace('Health', '')}
                  </span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getHealthColor(health)}`}>
                    {health}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Network Latency</span>
            </div>
            <span className={`text-sm font-semibold ${getUsageColor(metrics?.networkLatency / 2)}`}>
              {metrics?.networkLatency?.toFixed(0)}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitoringPanel;