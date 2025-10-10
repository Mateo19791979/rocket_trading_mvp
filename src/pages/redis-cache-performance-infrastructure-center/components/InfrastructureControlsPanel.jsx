import React, { useState } from 'react';
import { Settings, Power, RefreshCw, Database, Shield, Server, Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

export default function InfrastructureControlsPanel() {
  const [controlState, setControlState] = useState({
    redisCluster: 'running',
    traefikProxy: 'running',
    dockerServices: 'running',
    cacheInvalidation: 'ready',
    securityUpdate: 'ready',
    backupSystem: 'ready'
  });

  const [operationResults, setOperationResults] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const executeOperation = async (operation, description) => {
    setIsExecuting(true);
    
    // Simulate operation execution
    const timestamp = new Date()?.toLocaleTimeString();
    setOperationResults(prev => [
      { timestamp, operation, description, status: 'executing' },
      ...prev?.slice(0, 9)
    ]);

    setTimeout(() => {
      setOperationResults(prev => 
        prev?.map((result, index) => 
          index === 0 
            ? { ...result, status: 'completed' }
            : result
        )
      );
      setIsExecuting(false);
    }, 2000);

    console.log(`Executing ${operation}:`, description);
  };

  const infrastructureControls = [
    {
      category: 'Redis Management',
      icon: Database,
      color: 'red',
      controls: [
        {
          name: 'Restart Redis Cluster',
          action: () => executeOperation('Redis Restart', 'Graceful restart of Redis cluster with zero downtime'),
          description: 'Perform graceful restart with connection pooling',
          risk: 'low'
        },
        {
          name: 'Flush All Cache',
          action: () => executeOperation('Cache Flush', 'Complete cache invalidation and memory cleanup'),
          description: 'Clear all cached data immediately',
          risk: 'medium'
        },
        {
          name: 'Optimize Memory',
          action: () => executeOperation('Memory Optimization', 'Redis memory defragmentation and cleanup'),
          description: 'Run memory defragmentation and cleanup',
          risk: 'low'
        },
        {
          name: 'Backup Cache Data',
          action: () => executeOperation('Cache Backup', 'Create snapshot of current cache state'),
          description: 'Create persistent snapshot of cache state',
          risk: 'low'
        }
      ]
    },
    {
      category: 'Traefik Security',
      icon: Shield,
      color: 'blue',
      controls: [
        {
          name: 'Update Security Headers',
          action: () => executeOperation('Security Update', 'Apply latest security header configurations'),
          description: 'Apply latest HSTS, CSP, and security configurations',
          risk: 'low'
        },
        {
          name: 'Refresh SSL Certificates',
          action: () => executeOperation('SSL Refresh', 'Force renewal of SSL certificates'),
          description: 'Force SSL certificate renewal from Let\'s Encrypt',
          risk: 'low'
        },
        {
          name: 'Reset Rate Limits',
          action: () => executeOperation('Rate Limit Reset', 'Clear rate limiting counters'),
          description: 'Clear all rate limiting counters and blocked IPs',
          risk: 'medium'
        },
        {
          name: 'Emergency Security Mode',
          action: () => executeOperation('Emergency Security', 'Activate maximum security protocols'),
          description: 'Activate maximum security with strict rate limits',
          risk: 'high'
        }
      ]
    },
    {
      category: 'Docker Orchestration',
      icon: Server,
      color: 'green',
      controls: [
        {
          name: 'Recreate All Services',
          action: () => executeOperation('Service Recreate', 'Recreate all Docker services with latest images'),
          description: 'Pull latest images and recreate all services',
          risk: 'high'
        },
        {
          name: 'Scale Services',
          action: () => executeOperation('Service Scaling', 'Auto-scale services based on current load'),
          description: 'Auto-scale services based on current load metrics',
          risk: 'medium'
        },
        {
          name: 'Health Check All',
          action: () => executeOperation('Health Check', 'Run comprehensive health checks on all services'),
          description: 'Run comprehensive health checks on all containers',
          risk: 'low'
        },
        {
          name: 'Update Compose Stack',
          action: () => executeOperation('Stack Update', 'Deploy latest Docker Compose configuration'),
          description: 'Deploy latest Docker Compose configuration',
          risk: 'medium'
        }
      ]
    }
  ];

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low':
        return 'text-green-400 bg-green-900/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'high':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'executing':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const emergencyShutdown = () => {
    executeOperation('Emergency Shutdown', 'Graceful shutdown of all infrastructure services');
  };

  const generateInfrastructureReport = () => {
    executeOperation('Report Generation', 'Generate comprehensive infrastructure audit report');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Infrastructure Controls */}
      <div className="lg:col-span-2 space-y-6">
        {infrastructureControls?.map((category, categoryIndex) => {
          const IconComponent = category?.icon;
          return (
            <div key={categoryIndex} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <IconComponent className={`w-5 h-5 text-${category?.color}-400`} />
                {category?.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category?.controls?.map((control, controlIndex) => (
                  <div key={controlIndex} className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{control?.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getRiskColor(control?.risk)}`}>
                        {control?.risk} risk
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{control?.description}</p>
                    <button
                      onClick={control?.action}
                      disabled={isExecuting}
                      className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center ${
                        control?.risk === 'high' ?'bg-red-600 hover:bg-red-700 text-white' 
                          : control?.risk === 'medium' ?'bg-yellow-600 hover:bg-yellow-700 text-white' :'bg-green-600 hover:bg-green-700 text-white'
                      } ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Settings className="w-4 h-4" />
                      Execute
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Emergency Controls & Operation Results */}
      <div className="space-y-6">
        {/* Emergency Controls */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Emergency Controls
          </h3>

          <div className="space-y-3">
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <Power className="w-4 h-4" />
                Emergency Shutdown
              </h4>
              <p className="text-red-200 text-sm mb-3">
                Gracefully shutdown all infrastructure services in emergency situations
              </p>
              <button
                onClick={emergencyShutdown}
                disabled={isExecuting}
                className={`w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center ${
                  isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Power className="w-4 h-4" />
                Emergency Shutdown
              </button>
            </div>

            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Infrastructure Backup
              </h4>
              <p className="text-blue-200 text-sm mb-3">
                Create complete backup of infrastructure configuration and data
              </p>
              <button
                onClick={() => executeOperation('Infrastructure Backup', 'Create complete infrastructure backup')}
                disabled={isExecuting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center ${
                  isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Download className="w-4 h-4" />
                Create Backup
              </button>
            </div>

            <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
              <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Generate Report
              </h4>
              <p className="text-purple-200 text-sm mb-3">
                Generate comprehensive infrastructure audit and performance report
              </p>
              <button
                onClick={generateInfrastructureReport}
                disabled={isExecuting}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center ${
                  isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Operation Results */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-green-400" />
            Operation Results
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {operationResults?.length === 0 ? (
              <div className="text-center text-gray-400 py-6">
                No operations executed yet
              </div>
            ) : (
              operationResults?.map((result, index) => (
                <div key={index} className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(result?.status)}
                    <span className="text-white font-medium">{result?.operation}</span>
                    <span className="text-xs text-gray-400 ml-auto">{result?.timestamp}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{result?.description}</p>
                  <div className={`text-xs mt-1 px-2 py-1 rounded inline-block ${
                    result?.status === 'executing' ? 'bg-yellow-900/20 text-yellow-400' :
                    result?.status === 'completed'? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                  }`}>
                    {result?.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}