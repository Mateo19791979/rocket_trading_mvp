import React, { useState, useEffect } from 'react';
import { Globe, Database, Shield, ExternalLink, CheckCircle, XCircle, Clock, Wifi, Settings, Link2 } from 'lucide-react';
import knowledgePipelineService from '../../../services/knowledgePipelineService';

const SystemIntegrationPanel = () => {
  const [apiEndpoints] = useState([
    {
      name: 'Status Check',
      endpoint: '/status',
      method: 'GET',
      status: 'active',
      lastResponse: '200ms',
      description: 'Health status and system info'
    },
    {
      name: 'PDF Ingestion',
      endpoint: '/ingest',
      method: 'POST',
      status: 'active',
      lastResponse: '1.2s',
      description: 'Trigger PDF processing pipeline'
    },
    {
      name: 'Rule Extraction',
      endpoint: '/extract',
      method: 'POST',
      status: 'active',
      lastResponse: '850ms',
      description: 'Extract trading rules from documents'
    },
    {
      name: 'Registry Build',
      endpoint: '/build-registry',
      method: 'POST',
      status: 'active',
      lastResponse: '2.1s',
      description: 'Build and update strategy registry'
    },
    {
      name: 'Orchestrator Query',
      endpoint: '/orchestrator/query',
      method: 'POST',
      status: 'active',
      lastResponse: '450ms',
      description: 'Query extracted strategies'
    }
  ]);

  const [schedulingConfig, setSchedulingConfig] = useState({
    autoProcessing: true,
    processingInterval: '30 minutes',
    registryRebuild: '4 hours',
    healthChecks: '5 minutes',
    retryAttempts: 3,
    maxConcurrency: 5
  });

  const [integrationStatus, setIntegrationStatus] = useState({
    reactFrontend: 'connected',
    supabaseDatabase: 'connected',
    nodeJsBackend: 'connected',
    storageSystem: 'connected',
    realTimeUpdates: 'connected'
  });

  useEffect(() => {
    const checkIntegrationStatus = async () => {
      try {
        const status = await knowledgePipelineService?.getPipelineStatus();
        if (status?.success) {
          setIntegrationStatus(prev => ({
            ...prev,
            nodeJsBackend: status?.data?.mode === 'supabase_fallback' ? 'fallback' : 'connected'
          }));
        } else {
          setIntegrationStatus(prev => ({
            ...prev,
            nodeJsBackend: 'fallback'
          }));
        }
      } catch (error) {
        console.error('Failed to check integration status:', error);
        setIntegrationStatus(prev => ({
          ...prev,
          nodeJsBackend: 'error'
        }));
      }
    };

    checkIntegrationStatus();

    // Listen for refresh events
    const handleRefresh = () => {
      checkIntegrationStatus();
    };

    window.addEventListener('refresh-pipeline-status', handleRefresh);
    return () => window.removeEventListener('refresh-pipeline-status', handleRefresh);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': case'connected': return CheckCircle;
      case 'fallback': return Clock;
      case 'error': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case'connected': return 'text-green-400';
      case 'fallback': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-green-400 bg-green-400/10';
      case 'POST': return 'text-blue-400 bg-blue-400/10';
      case 'PUT': return 'text-orange-400 bg-orange-400/10';
      case 'DELETE': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">System Integration</h3>
            <p className="text-sm text-gray-400">API connectivity and automated scheduling</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Integration Status */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Integration Status</h4>
            <div className="space-y-2">
              {Object.entries(integrationStatus)?.map(([component, status]) => {
                const StatusIcon = getStatusIcon(status);
                const statusColor = getStatusColor(status);

                return (
                  <div key={component} className="flex items-center justify-between p-2 rounded border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      <span className="text-sm text-gray-300 capitalize">
                        {component?.replace(/([A-Z])/g, ' $1')?.trim()}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${statusColor} capitalize`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">API Endpoints</h4>
            <div className="space-y-2">
              {apiEndpoints?.map((api) => {
                const StatusIcon = getStatusIcon(api?.status);
                const statusColor = getStatusColor(api?.status);
                const methodColor = getMethodColor(api?.method);

                return (
                  <div key={api?.endpoint} className="p-3 rounded border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-mono ${methodColor}`}>
                          {api?.method}
                        </span>
                        <code className="text-sm text-gray-300">{api?.endpoint}</code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">{api?.lastResponse}</span>
                        <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{api?.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheduling Configuration */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Automated Scheduling</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(schedulingConfig)?.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded border border-gray-700/50">
                  <span className="text-sm text-gray-300 capitalize">
                    {key?.replace(/([A-Z])/g, ' $1')?.trim()}
                  </span>
                  <span className="text-sm font-semibold text-blue-400">
                    {typeof value === 'boolean' ? (value ? 'On' : 'Off') : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Handling */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Error Handling & Retry</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Retry Mechanism</span>
                </div>
                <span className="text-sm text-green-400">Active</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Fallback Mode</span>
                </div>
                <span className="text-sm text-yellow-400">
                  {knowledgePipelineService?.isInFallbackMode() ? 'Enabled' : 'Standby'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Connection Pool</span>
                </div>
                <span className="text-sm text-orange-400">4/10</span>
              </div>
            </div>
          </div>

          {/* Export Capabilities */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Export Capabilities</h4>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 p-2 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                <ExternalLink className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Registry Export</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-2 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                <Settings className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Config Export</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-2 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                <BarChart3 className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-gray-300">Analytics Export</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 p-2 rounded border border-gray-700 hover:border-gray-600 transition-colors">
                <Link2 className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-300">API Docs</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemIntegrationPanel;