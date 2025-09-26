import React, { useState } from 'react';
import { Link2, Server, Monitor, Code, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ProductIntegration = ({ registryData }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const integrationStatus = registryData?.integration_status || {};
  const apiEndpoints = integrationStatus?.api_endpoints || [];

  const rocketIntegrations = [
    {
      name: 'Poster + Kanban + Bus Monitor',
      description: 'Interface unifiée temps réel',
      status: integrationStatus?.rocket_integration ? 'active' : 'inactive',
      features: ['Visualisation pipeline', 'Monitoring live', 'Gestion des tâches'],
      url: '/pipeline-books-registry-orchestrator',
      icon: Monitor,
      color: 'text-blue-400'
    },
    {
      name: 'Strategy Registry Display',
      description: 'Catalogue de stratégies intégré',
      status: 'active',
      features: ['Navigation seamless', 'Export strategies', 'Real-time updates'],
      url: '/registry-v0-1-strategy-catalogue',
      icon: Link2,
      color: 'text-green-400'
    },
    {
      name: 'AI Agents Integration',
      description: 'Connection avec agents existants',
      status: 'active',
      features: ['Agent roster sync', 'Performance monitoring', 'Status updates'],
      url: '/ai-agents',
      icon: Zap,
      color: 'text-purple-400'
    }
  ];

  const backendEndpoints = [
    {
      endpoint: '/registry',
      method: 'GET',
      description: 'Récupère le catalogue complet des stratégies',
      status: 'active',
      responseTime: '85ms',
      usage: 'High'
    },
    {
      endpoint: '/scores',
      method: 'GET',
      description: 'Scores de confiance et métriques qualité',
      status: 'active',
      responseTime: '120ms',
      usage: 'Medium'
    },
    {
      endpoint: '/select',
      method: 'POST',
      description: 'Sélection de stratégies basée sur critères',
      status: 'active',
      responseTime: '200ms',
      usage: 'Medium'
    },
    {
      endpoint: '/allocate',
      method: 'POST',
      description: 'Allocation dynamique des ressources',
      status: 'active',
      responseTime: '150ms',
      usage: 'Low'
    },
    {
      endpoint: '/pipeline/status',
      method: 'GET',
      description: 'État en temps réel du pipeline',
      status: 'active',
      responseTime: '45ms',
      usage: 'High'
    },
    {
      endpoint: '/books/process',
      method: 'POST',
      description: 'Démarre le traitement d\'un nouveau livre',
      status: 'active',
      responseTime: '300ms',
      usage: 'Low'
    }
  ];

  const executionSafeguards = [
    {
      name: 'Rate Limiting',
      description: 'Limite les requêtes par utilisateur',
      status: 'active',
      config: '100 req/min par IP'
    },
    {
      name: 'Input Validation',
      description: 'Validation stricte des données d\'entrée',
      status: 'active',
      config: 'Schema-based validation'
    },
    {
      name: 'Error Handling',
      description: 'Gestion centralisée des erreurs',
      status: 'active',
      config: 'Graceful degradation'
    },
    {
      name: 'Circuit Breaker',
      description: 'Protection contre les surcharges',
      status: 'active',
      config: 'Fail-fast après 5 erreurs'
    },
    {
      name: 'Health Checks',
      description: 'Monitoring automatique des services',
      status: 'active',
      config: 'Check toutes les 30s'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'inactive':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getUsageColor = (usage) => {
    switch (usage) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Integration Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center justify-center">
          <Link2 className="w-5 h-5 mr-2 text-orange-400" />
          🔗 Intégration produit
        </h3>
        <p className="text-gray-400 mt-2">
          Backend Express avec garde-fous et intégration complète Rocket.new
        </p>
      </div>
      {/* Rocket.new Integrations */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-white flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-blue-400" />
          Rocket.new Ecosystem
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rocketIntegrations?.map((integration, index) => {
            const Icon = integration?.icon;
            return (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${integration?.color}`} />
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration?.status)}
                      <span className={`text-xs font-medium ${getStatusColor(integration?.status)} capitalize`}>
                        {integration?.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h5 className="text-sm font-medium text-white mb-2">{integration?.name}</h5>
                <p className="text-xs text-gray-400 mb-3">{integration?.description}</p>
                
                <div className="space-y-1 mb-3">
                  {integration?.features?.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="inline-block px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded mr-1 mb-1"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {integration?.url && (
                  <a
                    href={integration?.url}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Voir l'intégration →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Backend API Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white flex items-center">
            <Server className="w-5 h-5 mr-2 text-green-400" />
            Backend Express Endpoints
          </h4>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {backendEndpoints?.map((endpoint, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedEndpoint === index
                      ? 'bg-blue-600/20 border-blue-500' :'bg-gray-700/30 border-gray-600 hover:bg-gray-600/30'
                  }`}
                  onClick={() => setSelectedEndpoint(index)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        endpoint?.method === 'GET' ? 'bg-blue-500 text-white' :
                        endpoint?.method === 'POST'? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {endpoint?.method}
                      </span>
                      <code className="text-sm text-white font-mono">{endpoint?.endpoint}</code>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${getUsageColor(endpoint?.usage)} text-white`}>
                        {endpoint?.usage}
                      </span>
                      {getStatusIcon(endpoint?.status)}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-1">{endpoint?.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Response: {endpoint?.responseTime}</span>
                    <span className={`${getStatusColor(endpoint?.status)} capitalize`}>
                      {endpoint?.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Safeguards */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white flex items-center">
            <Code className="w-5 h-5 mr-2 text-orange-400" />
            Garde-fous d'Exécution
          </h4>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
            <div className="space-y-3">
              {executionSafeguards?.map((safeguard, index) => (
                <div key={index} className="p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-white">{safeguard?.name}</h5>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(safeguard?.status)}
                      <span className={`text-xs font-medium ${getStatusColor(safeguard?.status)} capitalize`}>
                        {safeguard?.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-1">{safeguard?.description}</p>
                  <code className="text-xs text-green-400 bg-gray-800/50 px-2 py-1 rounded">
                    {safeguard?.config}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Selected Endpoint Details */}
      {selectedEndpoint !== null && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Endpoint Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-3">Request Information</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Method:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    backendEndpoints?.[selectedEndpoint]?.method === 'GET' ? 'bg-blue-500 text-white' :
                    backendEndpoints?.[selectedEndpoint]?.method === 'POST'? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {backendEndpoints?.[selectedEndpoint]?.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Endpoint:</span>
                  <code className="text-white font-mono">{backendEndpoints?.[selectedEndpoint]?.endpoint}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`${getStatusColor(backendEndpoints?.[selectedEndpoint]?.status)} capitalize`}>
                    {backendEndpoints?.[selectedEndpoint]?.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Usage Level:</span>
                  <span className={`px-2 py-1 text-xs rounded ${getUsageColor(backendEndpoints?.[selectedEndpoint]?.usage)} text-white`}>
                    {backendEndpoints?.[selectedEndpoint]?.usage}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-3">Performance Metrics</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Response Time:</span>
                  <span className="text-white">{backendEndpoints?.[selectedEndpoint]?.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate:</span>
                  <span className="text-green-400">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Requests/min:</span>
                  <span className="text-white">
                    {backendEndpoints?.[selectedEndpoint]?.usage === 'High' ? '45-60' :
                     backendEndpoints?.[selectedEndpoint]?.usage === 'Medium' ? '15-30' : '1-10'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Error Rate:</span>
                  <span className="text-yellow-400">0.3%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-400 mb-2">Description</h5>
            <p className="text-sm text-white bg-gray-700/30 p-3 rounded-lg">
              {backendEndpoints?.[selectedEndpoint]?.description}
            </p>
          </div>
        </div>
      )}
      {/* System Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <h4 className="text-md font-medium text-white mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          System Status Overview
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400 mb-1">
              {integrationStatus?.backend_status === 'active' ? 'Online' : 'Offline'}
            </div>
            <p className="text-sm text-gray-400">Backend Status</p>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400 mb-1">
              {integrationStatus?.express_server === 'running' ? 'Running' : 'Stopped'}
            </div>
            <p className="text-sm text-gray-400">Express Server</p>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400 mb-1">
              {apiEndpoints?.length || 0}
            </div>
            <p className="text-sm text-gray-400">API Endpoints</p>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400 mb-1">
              {executionSafeguards?.filter(s => s?.status === 'active')?.length || 0}
            </div>
            <p className="text-sm text-gray-400">Active Safeguards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductIntegration;