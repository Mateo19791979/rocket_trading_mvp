import React, { useState } from 'react';
import { Layers, Shield, Zap, Monitor, CheckCircle, AlertTriangle, XCircle, Settings, RefreshCw, Play, GitBranch, Database } from 'lucide-react';

export default function ArchitectureOptimization({ systemStatus, onArchitectureAction }) {
  const [deploymentLoading, setDeploymentLoading] = useState({});
  const [selectedService, setSelectedService] = useState(null);

  const handleDeploymentAction = async (actionType) => {
    setDeploymentLoading(prev => ({ ...prev, [actionType]: true }));
    
    // Mock deployment process
    setTimeout(() => {
      setDeploymentLoading(prev => ({ ...prev, [actionType]: false }));
      if (onArchitectureAction) {
        onArchitectureAction();
      }
    }, 3000);
  };

  // Mock microservice health data
  const microservices = [
    {
      name: 'API Gateway',
      status: 'healthy',
      instances: 2,
      cpu: 45,
      memory: 62,
      uptime: '99.9%',
      version: '2.1.3',
      lastDeployed: '2025-01-04T10:30:00Z'
    },
    {
      name: 'Data Processing',
      status: 'degraded',
      instances: 1,
      cpu: 78,
      memory: 91,
      uptime: '98.2%',
      version: '1.8.1',
      lastDeployed: '2025-01-03T14:15:00Z'
    },
    {
      name: 'WebSocket Service',
      status: systemStatus?.webSocketStatus?.status === 'online' ? 'healthy' : 'critical',
      instances: systemStatus?.webSocketStatus?.status === 'online' ? 1 : 0,
      cpu: 34,
      memory: 55,
      uptime: '97.8%',
      version: '1.0.0',
      lastDeployed: '2025-01-02T09:20:00Z'
    },
    {
      name: 'Authentication Service',
      status: 'healthy',
      instances: 2,
      cpu: 23,
      memory: 38,
      uptime: '99.8%',
      version: '3.2.1',
      lastDeployed: '2025-01-04T11:45:00Z'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getResourceColor = (usage) => {
    if (usage >= 90) return 'bg-red-400';
    if (usage >= 70) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center space-x-3">
        <Layers className="w-6 h-6 text-purple-400" />
        <span>Architecture Optimization</span>
      </h2>
      <div className="space-y-6">
        {/* Microservice Health Monitoring */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Microservice Health</span>
          </h3>

          <div className="space-y-3">
            {microservices?.map((service, index) => (
              <div 
                key={index}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedService === index 
                    ? 'border-blue-500 bg-blue-500/10' :'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setSelectedService(selectedService === index ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service?.status)}
                    <div>
                      <h4 className="font-medium">{service?.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span>{service?.instances} instances</span>
                        <span>•</span>
                        <span>v{service?.version}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(service?.status)}`}>
                      {service?.uptime}
                    </span>
                    <div className="text-xs text-slate-400">uptime</div>
                  </div>
                </div>

                {selectedService === index && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">CPU</span>
                          <span className="text-xs">{service?.cpu}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-1">
                          <div 
                            className={`h-full rounded-full ${getResourceColor(service?.cpu)}`}
                            style={{ width: `${service?.cpu}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">Memory</span>
                          <span className="text-xs">{service?.memory}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-1">
                          <div 
                            className={`h-full rounded-full ${getResourceColor(service?.memory)}`}
                            style={{ width: `${service?.memory}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Last deployed: {new Date(service?.lastDeployed)?.toLocaleString()}</span>
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          handleDeploymentAction(`restart_${service?.name?.toLowerCase()?.replace(' ', '_')}`);
                        }}
                        disabled={deploymentLoading?.[`restart_${service?.name?.toLowerCase()?.replace(' ', '_')}`]}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs transition-colors"
                      >
                        {deploymentLoading?.[`restart_${service?.name?.toLowerCase()?.replace(' ', '_')}`] ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          'Restart'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Load Balancing Configuration */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-green-400" />
            <span>Load Balancing</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-slate-600/30 rounded">
              <div>
                <div className="font-medium text-sm">API Load Balancer</div>
                <div className="text-xs text-slate-400">Round-robin distribution</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-400">Active</span>
                <button
                  onClick={() => handleDeploymentAction('configure_loadbalancer')}
                  disabled={deploymentLoading?.configure_loadbalancer}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-xs"
                >
                  Configure
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-600/30 rounded">
              <div>
                <div className="font-medium text-sm">WebSocket Load Balancer</div>
                <div className="text-xs text-slate-400">Sticky sessions enabled</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-yellow-400">
                  {systemStatus?.webSocketStatus?.status === 'online' ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleDeploymentAction('configure_ws_loadbalancer')}
                  disabled={deploymentLoading?.configure_ws_loadbalancer}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-xs"
                >
                  Setup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scalability Improvements */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Scalability</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-slate-600/20 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Horizontal Scaling</h4>
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  Auto-scaling enabled
                </span>
              </div>
              <div className="text-xs text-slate-400 mb-2">
                Automatically scale instances based on CPU/memory thresholds
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-blue-400">2-8</div>
                  <div className="text-slate-400">API Instances</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-purple-400">1-4</div>
                  <div className="text-slate-400">WS Instances</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-400">CPU 70%</div>
                  <div className="text-slate-400">Scale Trigger</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeploymentAction('optimize_scaling')}
              disabled={deploymentLoading?.optimize_scaling}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded text-sm transition-colors"
            >
              {deploymentLoading?.optimize_scaling ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              <span>Optimize Scaling Rules</span>
            </button>
          </div>
        </div>

        {/* Deployment Automation Controls */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Play className="w-4 h-4 text-red-400" />
            <span>Deployment Automation</span>
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => handleDeploymentAction('deploy_all_services')}
              disabled={deploymentLoading?.deploy_all_services}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 rounded-lg font-medium transition-all"
            >
              {deploymentLoading?.deploy_all_services ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>Deploy All Services</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDeploymentAction('rollback_deployment')}
                disabled={deploymentLoading?.rollback_deployment}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 rounded text-sm transition-colors"
              >
                {deploymentLoading?.rollback_deployment ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <GitBranch className="w-4 h-4" />
                )}
                <span>Rollback</span>
              </button>

              <button
                onClick={() => handleDeploymentAction('health_check')}
                disabled={deploymentLoading?.health_check}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm transition-colors"
              >
                {deploymentLoading?.health_check ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                <span>Health Check</span>
              </button>
            </div>
          </div>
        </div>

        {/* Production Readiness Validation */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Production Readiness</span>
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-green-500/20">
              <span className="text-sm">Database Connections</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-green-500/20">
              <span className="text-sm">SSL Certificates</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>

            <div className={`flex items-center justify-between p-2 rounded ${
              systemStatus?.providerKeysStatus?.overallStatus === 'validated' ?'bg-green-500/20' :'bg-yellow-500/20'
            }`}>
              <span className="text-sm">API Provider Keys</span>
              {systemStatus?.providerKeysStatus?.overallStatus === 'validated' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-green-500/20">
              <span className="text-sm">Monitoring Setup</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>

            <div className={`flex items-center justify-between p-2 rounded ${
              systemStatus?.webSocketStatus?.status === 'online' ?'bg-green-500/20' :'bg-red-500/20'
            }`}>
              <span className="text-sm">WebSocket Deployment</span>
              {systemStatus?.webSocketStatus?.status === 'online' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}