import React, { useState, useEffect } from 'react';
import { Rocket, Globe, Server, CheckCircle, AlertCircle, Monitor, Play } from 'lucide-react';
import ChatWidget from './ChatWidget';

const DeploymentPanel = () => {
  const [deploymentStatus, setDeploymentStatus] = useState({
    rocketWidget: 'deployed',
    backendChat: 'available',
    lastDeployment: null,
    version: '2.1.4',
    uptime: 99.97
  });
  
  const [systemHealth, setSystemHealth] = useState({
    widgetResponsiveness: 'excellent',
    apiLatency: 45,
    chatEndpoint: 'healthy',
    dataSync: 'synced'
  });

  const [loading, setLoading] = useState(true);
  const [showChatWidget, setShowChatWidget] = useState(false);

  useEffect(() => {
    loadDeploymentData();
    
    // Update system health every 30 seconds
    const interval = setInterval(updateSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateSystemHealth = () => {
    setSystemHealth(prev => ({
      ...prev,
      apiLatency: Math.floor(Math.random() * 50) + 25,
      widgetResponsiveness: Math.random() > 0.1 ? 'excellent' : 'good'
    }));
  };

  const loadDeploymentData = () => {
    try {
      // Mock deployment data
      const mockDeployment = {
        rocketWidget: 'deployed',
        backendChat: 'available',
        lastDeployment: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        version: '2.1.4',
        uptime: 99.97
      };

      const mockHealth = {
        widgetResponsiveness: 'excellent',
        apiLatency: Math.floor(Math.random() * 50) + 25, // 25-75ms
        chatEndpoint: 'healthy',
        dataSync: 'synced'
      };

      setDeploymentStatus(mockDeployment);
      setSystemHealth(mockHealth);
      setLoading(false);
    } catch (error) {
      console.error('Error loading deployment data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      deployed: 'text-green-400',
      available: 'text-green-400', 
      healthy: 'text-green-400',
      excellent: 'text-green-400',
      good: 'text-blue-400',
      synced: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    if (['deployed', 'available', 'healthy', 'excellent', 'synced']?.includes(status)) {
      return CheckCircle;
    }
    return AlertCircle;
  };

  const formatLastDeployment = (date) => {
    if (!date) return 'Inconnue';
    
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
          <Rocket className="w-5 h-5 mr-2" />
          Déploiement
        </h2>
        <div className="text-gray-300">Chargement des informations de déploiement...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-teal-400 mb-4 flex items-center">
        <Rocket className="w-5 h-5 mr-2" />
        Déploiement
      </h2>
      
      {/* Deployment Features */}
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-green-900 bg-opacity-20 rounded-lg border border-green-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-green-400" />
              <span className="font-medium text-green-200">Widget HTML (fourni) dans Rocket</span>
            </div>
            <div className="flex items-center space-x-1">
              {React.createElement(getStatusIcon(deploymentStatus?.rocketWidget), {
                className: `w-4 h-4 ${getStatusColor(deploymentStatus?.rocketWidget)}`
              })}
              <span className={`text-xs ${getStatusColor(deploymentStatus?.rocketWidget)}`}>
                {deploymentStatus?.rocketWidget}
              </span>
            </div>
          </div>
          <p className="text-xs text-green-300 mb-3">
            Interface chat intégrée directement dans l'environnement Rocket. Accès instantané aux chefs d'IA.
          </p>
          
          {/* Widget Actions */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowChatWidget(true)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center space-x-2 text-xs transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>Tester Widget</span>
            </button>
          </div>
          
          {/* Widget Details */}
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-green-600">
            <div>
              <div className="text-xs text-green-400">Version</div>
              <div className="text-sm font-semibold text-white">v{deploymentStatus?.version}</div>
            </div>
            <div>
              <div className="text-xs text-green-400">Uptime</div>
              <div className="text-sm font-semibold text-white">{deploymentStatus?.uptime}%</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-blue-200">(Option) Backend /chat pour réponses enrichies</span>
            </div>
            <div className="flex items-center space-x-1">
              {React.createElement(getStatusIcon(deploymentStatus?.backendChat), {
                className: `w-4 h-4 ${getStatusColor(deploymentStatus?.backendChat)}`
              })}
              <span className={`text-xs ${getStatusColor(deploymentStatus?.backendChat)}`}>
                {deploymentStatus?.backendChat}
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-300">
            Endpoint backend optionnel pour traitement avancé des conversations avec IA contextuelle.
          </p>

          {/* Backend Details */}
          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-blue-600">
            <div>
              <div className="text-xs text-blue-400">Latence API</div>
              <div className="text-sm font-semibold text-white">{systemHealth?.apiLatency}ms</div>
            </div>
            <div>
              <div className="text-xs text-blue-400">Status endpoint</div>
              <div className={`text-sm font-semibold ${getStatusColor(systemHealth?.chatEndpoint)}`}>
                {systemHealth?.chatEndpoint}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Preview */}
      <div className="mb-6">
        <ChatWidget isPreview={true} onClose={() => setShowChatWidget(false)} />
      </div>
      
      {/* System Health Overview */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center">
          <Monitor className="w-4 h-4 mr-2" />
          État du système
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-700 bg-opacity-30 rounded">
            <span className="text-sm text-gray-300">Réactivité widget</span>
            <span className={`text-sm font-medium ${getStatusColor(systemHealth?.widgetResponsiveness)}`}>
              {systemHealth?.widgetResponsiveness}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-700 bg-opacity-30 rounded">
            <span className="text-sm text-gray-300">Sync données</span>
            <span className={`text-sm font-medium ${getStatusColor(systemHealth?.dataSync)}`}>
              {systemHealth?.dataSync}
            </span>
          </div>
        </div>
      </div>
      
      {/* Deployment Info */}
      <div className="space-y-3">
        <div className="p-3 bg-purple-900 bg-opacity-20 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-purple-200 font-medium">Dernier déploiement</span>
            <span className="text-xs text-purple-300">
              {formatLastDeployment(deploymentStatus?.lastDeployment)}
            </span>
          </div>
          <div className="text-xs text-purple-300">
            Déploiement automatique via pipeline CI/CD. Rollback disponible en cas de problème.
          </div>
        </div>

        <div className="p-3 bg-orange-900 bg-opacity-20 rounded-lg">
          <p className="text-xs text-orange-200">
            🚀 <strong>Intégration Rocket :</strong> L'interface est parfaitement intégrée dans votre 
            environnement Rocket existant. Aucune configuration supplémentaire requise.
          </p>
        </div>
      </div>

      {/* Chat Widget Modal */}
      {showChatWidget && (
        <ChatWidget 
          isPreview={false}
          onClose={() => setShowChatWidget(false)}
        />
      )}
    </div>
  );
};

export default DeploymentPanel;