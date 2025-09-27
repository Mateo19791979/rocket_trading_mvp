import React from 'react';
import { CheckCircle, TestTube, Package, Rocket, Shield, Bell } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const MainJobsPanel = () => {
  const jobs = [
    {
      icon: CheckCircle,
      title: 'Qualité & Analyse Statique',
      description: 'Linting, formatage et contrôle qualité du code',
      status: 'success',
      duration: '2min 15s',
      coverage: null,
      color: 'bg-green-600',
      borderColor: 'border-green-500'
    },
    {
      icon: TestTube,
      title: 'Tests Unitaires & Couverture (≥ 80% Codecov)',
      description: 'Exécution des tests avec rapport de couverture',
      status: 'success',
      duration: '4min 32s',
      coverage: '85%',
      color: 'bg-green-600',
      borderColor: 'border-green-500'
    },
    {
      icon: Package,
      title: 'Validation Build (matrix flavors)',
      description: 'Build multi-environnements (dev, staging, prod)',
      status: 'success',
      duration: '8min 45s',
      coverage: null,
      color: 'bg-green-600',
      borderColor: 'border-green-500'
    },
    {
      icon: Rocket,
      title: 'Déploiement Production (push main)',
      description: 'Déploiement automatisé sur push main uniquement',
      status: 'idle',
      duration: '-',
      coverage: null,
      color: 'bg-green-600',
      borderColor: 'border-green-500'
    },
    {
      icon: Shield,
      title: 'Scan Sécurité Nocturne (TruffleHog + Snyk)',
      description: 'Analyse de sécurité complète automatisée',
      status: 'scheduled',
      duration: '12min 20s',
      coverage: null,
      color: 'bg-green-600',
      borderColor: 'border-green-500'
    },
    {
      icon: Bell,
      title: 'Notification finale (résumé global)',
      description: 'Synthèse consolidée de tous les jobs',
      status: 'success',
      duration: '30s',
      coverage: null,
      color: 'bg-green-600',
      borderColor: 'border-green-500'
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      success: { bg: 'bg-green-500', text: 'Réussi' },
      running: { bg: 'bg-blue-500', text: 'En cours' },
      failed: { bg: 'bg-red-500', text: 'Échec' },
      idle: { bg: 'bg-gray-500', text: 'En attente' },
      scheduled: { bg: 'bg-yellow-500', text: 'Programmé' }
    };
    
    const badge = badges?.[status] || badges?.idle;
    return (
      <span className={`${badge?.bg} text-white text-xs px-2 py-1 rounded-full`}>
        {badge?.text}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-600 p-2 rounded-lg">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">🟩 Jobs principaux</h3>
          <p className="text-gray-400 text-sm">Pipeline de build et déploiement</p>
        </div>
      </div>
      <div className="space-y-4">
        {jobs?.map((job, index) => {
          const Icon = job?.icon;
          
          return (
            <div 
              key={index}
              className={`bg-gray-700 rounded-lg p-4 border-l-4 ${job?.borderColor} hover:bg-gray-600 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`${job?.color} p-2 rounded-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">• {job?.title}</p>
                    <p className="text-gray-400 text-sm">{job?.description}</p>
                    {job?.coverage && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Couverture:</span>
                          <div className="bg-gray-600 rounded-full h-2 w-20">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: job?.coverage}}></div>
                          </div>
                          <span className="text-xs text-green-400 font-medium">{job?.coverage}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(job?.status)}
                  <p className="text-xs text-gray-500">{job?.duration}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">98.5%</p>
            <p className="text-xs text-gray-400">Taux de réussite</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">16min</p>
            <p className="text-xs text-gray-400">Durée moyenne</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainJobsPanel;