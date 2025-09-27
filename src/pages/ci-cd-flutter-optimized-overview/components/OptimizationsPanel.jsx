import React from 'react';
import { Zap, Shield, Folder, Settings, Key, Smartphone } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const OptimizationsPanel = () => {
  const optimizations = [
    {
      icon: Zap,
      title: 'concurrency: cancel-in-progress',
      description: 'Évite les files d\'attente et conflits de ressources',
      status: 'active',
      impact: 'Temps réduit de 40%',
      color: 'bg-orange-600',
      borderColor: 'border-orange-500'
    },
    {
      icon: Shield,
      title: 'permissions: contents: read',
      description: 'Principe de privilège minimum pour la sécurité',
      status: 'active',
      impact: 'Sécurité renforcée',
      color: 'bg-orange-600',
      borderColor: 'border-orange-500'
    },
    {
      icon: Folder,
      title: 'PUB_CACHE=~/.pub-cache',
      description: 'Configuration optimale du cache des dépendances',
      status: 'active',
      impact: 'Cache efficace',
      color: 'bg-orange-600',
      borderColor: 'border-orange-500'
    },
    {
      icon: Settings,
      title: 'Artefacts .apk retention 7 jours',
      description: 'Gestion automatique du cycle de vie des builds',
      status: 'active',
      impact: 'Stockage optimisé',
      color: 'bg-orange-600',
      borderColor: 'border-orange-500'
    },
    {
      icon: Key,
      title: 'Secrets → env.json (jamais commit)',
      description: 'Gestion sécurisée des variables d\'environnement',
      status: 'active',
      impact: 'Sécurité des secrets',
      color: 'bg-orange-600',
      borderColor: 'border-orange-500'
    },
    {
      icon: Smartphone,
      title: 'Déploiement Play Store via action dédiée',
      description: 'Distribution automatisée avec suivi et rollback',
      status: 'active',
      impact: 'Déploiement automatisé',
      color: 'bg-orange-600',
      borderColor: 'border-orange-500'
    }
  ];

  const deploymentStats = {
    deployments: 15,
    successRate: '100%',
    rollbacks: 0,
    avgDeployTime: '3min 45s'
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-orange-600 p-2 rounded-lg">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">🟧 Optimisations intégrées</h3>
          <p className="text-gray-400 text-sm">Améliorations de performance et sécurité</p>
        </div>
      </div>
      <div className="space-y-4">
        {optimizations?.map((opt, index) => {
          const Icon = opt?.icon;
          
          return (
            <div 
              key={index}
              className={`bg-gray-700 rounded-lg p-4 border-l-4 ${opt?.borderColor} hover:bg-gray-600 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`${opt?.color} p-2 rounded-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">• {opt?.title}</p>
                    <p className="text-gray-400 text-sm">{opt?.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Actif</span>
                  </div>
                  <p className="text-xs text-orange-400 font-medium">{opt?.impact}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Deployment Tracking Section */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <Smartphone className="h-4 w-4 mr-2" />
          Suivi déploiement Play Store
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-600 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Déploiements</span>
              <span className="text-blue-400 font-bold">{deploymentStats?.deployments}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Taux succès</span>
              <span className="text-green-400 font-bold">{deploymentStats?.successRate}</span>
            </div>
          </div>
          
          <div className="bg-gray-600 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Rollbacks</span>
              <span className="text-gray-400 font-bold">{deploymentStats?.rollbacks}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Temps moyen</span>
              <span className="text-orange-400 font-bold">{deploymentStats?.avgDeployTime}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Dernière version déployée</span>
            <div className="flex items-center space-x-2">
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">v1.2.3</span>
              <span className="text-xs text-gray-400">il y a 2h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationsPanel;