import React from 'react';
import { TrendingUp, Target, Zap, Database, BarChart3, Users } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const ScalingVisualization = ({ registryData, pipelineStats }) => {
  const currentCapacity = registryData?.scaling_config?.current_capacity || 20;
  const targetCapacity = registryData?.scaling_config?.target_capacity || 500;
  const scalingProgress = (currentCapacity / targetCapacity) * 100;

  const scalingMetrics = [
    {
      label: 'Lot initial',
      current: `${currentCapacity} livres`,
      target: 'Registry v0.1',
      progress: 100,
      color: 'bg-green-500',
      icon: Database
    },
    {
      label: 'Objectif final',
      current: `${currentCapacity}/${targetCapacity}`,
      target: '500+ livres',
      progress: scalingProgress,
      color: 'bg-blue-500',
      icon: TrendingUp
    },
    {
      label: 'Dédoublonnage',
      current: `${registryData?.deduplication_score?.toFixed(1) || 0}%`,
      target: 'Score confiance',
      progress: registryData?.deduplication_score || 0,
      color: 'bg-purple-500',
      icon: Target
    },
    {
      label: 'Processing Threads',
      current: `${registryData?.scaling_config?.processing_threads || 4} threads`,
      target: 'Auto-scaling enabled',
      progress: 75,
      color: 'bg-orange-500',
      icon: Zap
    }
  ];

  const roadmapPhases = [
    {
      phase: 'Phase 1: Foundation',
      status: 'completed',
      description: 'Basic pipeline infrastructure',
      books: '0-20 books',
      features: ['PDF ingestion', 'OCR processing', 'Basic extraction']
    },
    {
      phase: 'Phase 2: Scale Up',
      status: 'in_progress',
      description: 'Enhanced processing capabilities',
      books: '20-100 books',
      features: ['Parallel processing', 'Advanced AI agents', 'Quality scoring']
    },
    {
      phase: 'Phase 3: Production',
      status: 'planned',
      description: 'Full-scale deployment',
      books: '100-500+ books',
      features: ['Auto-scaling', 'Real-time processing', 'Enterprise features']
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'planned':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Scaling Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center justify-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          🚀 Passage à l'échelle
        </h3>
        <p className="text-gray-400 mt-2">Évolution de 20 livres vers 500+ avec dédoublonnage et scoring automatique</p>
      </div>
      {/* Scaling Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scalingMetrics?.map((metric, index) => {
          const Icon = metric?.icon;
          return (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500">{metric?.progress?.toFixed(1)}%</span>
              </div>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium text-white mb-1">{metric?.label}</h4>
                <p className="text-lg font-bold text-white">{metric?.current}</p>
                <p className="text-xs text-gray-400">{metric?.target}</p>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${metric?.color}`}
                  style={{ width: `${Math.min(metric?.progress, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Scaling Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Timeline */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h4 className="text-md font-medium text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Roadmap de Passage à l'Échelle
          </h4>
          
          <div className="space-y-4">
            {roadmapPhases?.map((phase, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(phase?.status)}`}></div>
                  {index < roadmapPhases?.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-600 mt-2"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-medium text-white">{phase?.phase}</h5>
                    <span className="text-xs text-gray-400">{phase?.books}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{phase?.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {phase?.features?.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-700/50 text-xs text-gray-300 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deduplication & Confidence Scoring */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
          <h4 className="text-md font-medium text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Dédoublonnage & Score de Confiance
          </h4>
          
          <div className="space-y-4">
            {/* Deduplication Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Score Dédoublonnage</span>
                <span className="text-lg font-bold text-purple-400">
                  {registryData?.deduplication_score?.toFixed(1) || '0.0'}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: `${registryData?.deduplication_score || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Détection automatique des stratégies similaires
              </p>
            </div>

            {/* Confidence Threshold */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Seuil de Confiance</span>
                <span className="text-lg font-bold text-green-400">
                  {(registryData?.confidence_threshold * 100)?.toFixed(0) || '70'}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${(registryData?.confidence_threshold || 0.7) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Niveau minimum pour validation automatique
              </p>
            </div>

            {/* Processing Capacity */}
            <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
              <h5 className="text-sm font-medium text-white mb-2">Capacité de Traitement</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Livres traités</p>
                  <p className="text-white font-medium">{currentCapacity}</p>
                </div>
                <div>
                  <p className="text-gray-400">Objectif cible</p>
                  <p className="text-white font-medium">{targetCapacity}+</p>
                </div>
                <div>
                  <p className="text-gray-400">Threads actifs</p>
                  <p className="text-white font-medium">
                    {registryData?.scaling_config?.processing_threads || 4}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Auto-scaling</p>
                  <p className={`font-medium ${registryData?.scaling_config?.auto_scaling ? 'text-green-400' : 'text-gray-400'}`}>
                    {registryData?.scaling_config?.auto_scaling ? 'Activé' : 'Désactivé'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Scaling Statistics */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
        <h4 className="text-md font-medium text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-400" />
          Performance & Scaling Metrics
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {registryData?.total_books_processed || 0}
            </div>
            <p className="text-sm text-gray-400">Livres Traités</p>
            <p className="text-xs text-gray-500 mt-1">
              +{Math.floor((registryData?.total_books_processed || 0) * 0.15)} cette semaine
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {registryData?.total_strategies_extracted || 0}
            </div>
            <p className="text-sm text-gray-400">Stratégies Extraites</p>
            <p className="text-xs text-gray-500 mt-1">
              Ratio: {registryData?.total_books_processed > 0 ? 
                (registryData?.total_strategies_extracted / registryData?.total_books_processed)?.toFixed(1) : '0'} par livre
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {((registryData?.deduplication_score || 0) * (registryData?.confidence_threshold || 0.7))?.toFixed(0)}
            </div>
            <p className="text-sm text-gray-400">Score Qualité</p>
            <p className="text-xs text-gray-500 mt-1">
              Combiné dédoublonnage × confiance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScalingVisualization;