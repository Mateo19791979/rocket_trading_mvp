import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';

const DeploymentMonitoringPanel = ({ pipelineStatus }) => {
  const [realTimeData, setRealTimeData] = useState({
    deployments: 23,
    successRate: 96.2,
    avgBuildTime: '2m 34s',
    lastDeploy: '23:15:42'
  });

  const [buildLogs, setBuildLogs] = useState([
    { id: 1, time: '23:15:42', status: 'success', message: 'Deployment completed successfully', type: 'deploy' },
    { id: 2, time: '23:13:08', status: 'running', message: 'Building React application...', type: 'build' },
    { id: 3, time: '23:12:45', status: 'success', message: 'All tests passed (78% coverage)', type: 'test' },
    { id: 4, time: '23:12:12', status: 'success', message: 'Dependencies installed successfully', type: 'install' }
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'running':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-slate-500/30 bg-slate-500/10';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Deployment Monitoring</h3>
      </div>
      <div className="space-y-6">
        {/* Real-time Status */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span>Real-time Status</span>
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-300">Success Rate</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">{realTimeData?.successRate}%</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-300">Deployments</span>
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{realTimeData?.deployments}</div>
            </div>
          </div>
        </div>

        {/* Build Logs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Build Logs</h4>
            <button className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {buildLogs?.map((log) => (
              <div key={log?.id} className={`rounded-lg p-3 border ${getStatusColor(log?.status)}`}>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(log?.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">{log?.time}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        log?.type === 'deploy' ? 'bg-green-500/20 text-green-300' :
                        log?.type === 'build' ? 'bg-blue-500/20 text-blue-300' :
                        log?.type === 'test'? 'bg-purple-500/20 text-purple-300' : 'bg-slate-500/20 text-slate-300'
                      }`}>
                        {log?.type}
                      </span>
                    </div>
                    <p className="text-sm text-white mt-1">{log?.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Performance Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Bundle Size</span>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-lg font-bold text-white">2.3 MB</div>
              <div className="text-xs text-green-400">↓ 12% from last build</div>
            </div>
            <div className="bg-slate-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Build Time</span>
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white">{realTimeData?.avgBuildTime}</div>
              <div className="text-xs text-blue-400">Average over 30 builds</div>
            </div>
          </div>
        </div>

        {/* Rollback Capabilities */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
          <h4 className="text-sm font-semibold text-orange-300 mb-2">Rollback Capabilities</h4>
          <ul className="text-xs text-slate-300 space-y-1">
            <li>• One-click rollback to previous stable version</li>
            <li>• Automated health checks post-deployment</li>
            <li>• Database migration rollback support</li>
            <li>• Traffic routing for zero-downtime deployments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeploymentMonitoringPanel;