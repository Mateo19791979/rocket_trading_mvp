import React, { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, AlertCircle, CheckCircle, XCircle, Cpu, Database, Wifi } from 'lucide-react';

const ResilienceGuardEngine = () => {
  const [systemHealth, setSystemHealth] = useState({
    overall: 92,
    components: {
      api: { status: 'healthy', health: 98, latency: '45ms', errors: 2 },
      database: { status: 'warning', health: 85, latency: '120ms', errors: 15 },
      websocket: { status: 'healthy', health: 94, latency: '12ms', errors: 0 },
      agents: { status: 'healthy', health: 96, active: 23, total: 24 },
      trading: { status: 'healthy', health: 89, pnl: '+2.4%', volume: '1.2M' }
    }
  });

  const [predictions, setPredictions] = useState([
    { 
      id: 1, 
      type: 'warning', 
      component: 'Database', 
      probability: 0.75, 
      timeframe: '15 minutes',
      description: 'Connection pool saturation predicted',
      action: 'Scale connection pool'
    },
    { 
      id: 2, 
      type: 'info', 
      component: 'WebSocket', 
      probability: 0.45, 
      timeframe: '1 hour',
      description: 'High message throughput expected',
      action: 'Monitor buffer usage'
    },
    { 
      id: 3, 
      type: 'critical', 
      component: 'Trading Engine', 
      probability: 0.35, 
      timeframe: '30 minutes',
      description: 'Memory usage approaching limit',
      action: 'Prepare restart sequence'
    }
  ]);

  const [recoveryActions] = useState([
    { id: 1, name: 'Auto-scale Database', status: 'ready', trigger: 'CPU > 85%' },
    { id: 2, name: 'Circuit Breaker', status: 'armed', trigger: 'Error rate > 5%' },
    { id: 3, name: 'Failover Switch', status: 'standby', trigger: 'Response time > 2s' },
    { id: 4, name: 'Agent Restart', status: 'monitoring', trigger: 'Memory > 90%' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time health updates
      setSystemHealth(prev => ({
        ...prev,
        overall: Math.max(85, Math.min(100, prev?.overall + (Math.random() - 0.5) * 4))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'text-green-400',
      warning: 'text-yellow-400',
      critical: 'text-red-400',
      error: 'text-red-500'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      healthy: <CheckCircle className="h-5 w-5" />,
      warning: <AlertCircle className="h-5 w-5" />,
      critical: <XCircle className="h-5 w-5" />,
      error: <XCircle className="h-5 w-5" />
    };
    return icons?.[status] || <AlertCircle className="h-5 w-5" />;
  };

  const getProbabilityColor = (probability) => {
    if (probability > 0.7) return 'text-red-400';
    if (probability > 0.5) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <div className="bg-gray-800 border border-blue-500 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <Activity className="text-blue-400 mr-3 h-6 w-6" />
        <h3 className="text-xl font-bold text-white">Resilience Guard Engine</h3>
        <div className="ml-auto flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-gray-300">Real-time Monitoring</span>
        </div>
      </div>
      {/* System Health Overview */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h4 className="text-white font-semibold">System Health Overview</h4>
          <div className="ml-auto text-2xl font-bold text-green-400">
            {systemHealth?.overall}%
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(systemHealth?.components)?.map(([key, component]) => (
            <div key={key} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {key === 'api' && <Cpu className="h-4 w-4 mr-2 text-blue-400" />}
                  {key === 'database' && <Database className="h-4 w-4 mr-2 text-blue-400" />}
                  {key === 'websocket' && <Wifi className="h-4 w-4 mr-2 text-blue-400" />}
                  {(key === 'agents' || key === 'trading') && <Activity className="h-4 w-4 mr-2 text-blue-400" />}
                  <span className="text-white text-sm font-medium capitalize">{key}</span>
                </div>
                <span className={`${getStatusColor(component?.status)}`}>
                  {getStatusIcon(component?.status)}
                </span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Health:</span>
                  <span className={component?.health > 90 ? 'text-green-400' : component?.health > 75 ? 'text-yellow-400' : 'text-red-400'}>
                    {component?.health}%
                  </span>
                </div>
                {component?.latency && (
                  <div className="flex justify-between text-gray-300">
                    <span>Latency:</span>
                    <span>{component?.latency}</span>
                  </div>
                )}
                {component?.errors !== undefined && (
                  <div className="flex justify-between text-gray-300">
                    <span>Errors:</span>
                    <span className={component?.errors === 0 ? 'text-green-400' : 'text-yellow-400'}>
                      {component?.errors}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Predictive Failure Detection */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <TrendingUp className="text-yellow-400 mr-2 h-5 w-5" />
          Predictive Failure Detection
        </h4>
        
        <div className="space-y-3">
          {predictions?.map((prediction) => (
            <div 
              key={prediction?.id} 
              className={`bg-gray-700 border-l-4 rounded-lg p-4 ${
                prediction?.type === 'critical' ? 'border-red-500' :
                prediction?.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-white font-medium">{prediction?.component}</span>
                    <span className={`ml-2 text-sm ${getProbabilityColor(prediction?.probability)}`}>
                      {Math.round(prediction?.probability * 100)}% probability
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{prediction?.description}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  in {prediction?.timeframe}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                  Suggested: {prediction?.action}
                </span>
                <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors">
                  Apply Fix
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Automated Recovery Protocols */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Zap className="text-green-400 mr-2 h-5 w-5" />
          Automated Recovery Protocols
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recoveryActions?.map((action) => (
            <div key={action?.id} className="bg-gray-600 rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-medium">{action?.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  action?.status === 'ready' ? 'bg-green-900/50 text-green-300' :
                  action?.status === 'armed' ? 'bg-yellow-900/50 text-yellow-300' :
                  action?.status === 'standby'? 'bg-blue-900/50 text-blue-300' : 'bg-gray-900/50 text-gray-300'
                }`}>
                  {action?.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">Trigger: {action?.trigger}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResilienceGuardEngine;