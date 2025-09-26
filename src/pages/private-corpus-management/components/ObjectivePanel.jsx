import React from 'react';
import { Target, BookOpen, Database, Brain, TrendingUp } from 'lucide-react';

const ObjectivePanel = ({ processingStats, registryStatus }) => {
  const getObjectiveMetrics = () => {
    const totalBooks = processingStats?.totalBooks || 0;
    const strategiesExtracted = processingStats?.strategiesExtracted || 0;
    
    // Calculate progress towards objectives
    const bookProgress = Math.min((totalBooks / 500) * 100, 100);
    const registryProgress = registryStatus ? 
      Math.min((strategiesExtracted / 100) * 100, 100) : 0;
    
    return {
      bookProgress: Math.round(bookProgress),
      registryProgress: Math.round(registryProgress),
      currentBooks: totalBooks,
      targetBooks: 500,
      currentStrategies: strategiesExtracted,
      targetStrategies: 100
    };
  };

  const getObjectives = () => {
    const metrics = getObjectiveMetrics();
    
    return [
      {
        id: 'books',
        icon: BookOpen,
        title: 'Avoir 500+ livres en base',
        description: 'Expansion continue de la bibliothèque privée',
        current: metrics?.currentBooks,
        target: metrics?.targetBooks,
        progress: metrics?.bookProgress,
        color: 'teal',
        unit: 'livres'
      },
      {
        id: 'registry',
        icon: Database,
        title: 'Registry complet, prêt à scorer / select',
        description: 'Base de stratégies validées et optimisées',
        current: metrics?.currentStrategies,
        target: metrics?.targetStrategies,
        progress: metrics?.registryProgress,
        color: 'orange',
        unit: 'stratégies'
      },
      {
        id: 'ai',
        icon: Brain,
        title: 'IA multi-stratégies auto-sélectionneuse',
        description: 'Système intelligent de choix de stratégies',
        current: registryStatus ? 1 : 0,
        target: 1,
        progress: registryStatus ? 100 : 0,
        color: 'purple',
        unit: 'système'
      }
    ];
  };

  const getMilestones = () => {
    const totalBooks = processingStats?.totalBooks || 0;
    
    return [
      {
        target: 50,
        label: 'Base fondamentale',
        completed: totalBooks >= 50,
        description: 'Corpus de base établi'
      },
      {
        target: 100,
        label: 'Corpus diversifié',
        completed: totalBooks >= 100,
        description: 'Couverture multi-domaines'
      },
      {
        target: 250,
        label: 'Collection avancée',
        completed: totalBooks >= 250,
        description: 'Expertise sectorielle'
      },
      {
        target: 500,
        label: 'Bibliothèque complète',
        completed: totalBooks >= 500,
        description: 'Objectif final atteint'
      }
    ];
  };

  const objectives = getObjectives();
  const milestones = getMilestones();
  const completedMilestones = milestones?.filter(m => m?.completed)?.length;

  return (
    <div className="bg-slate-800/30 border border-orange-500/30 rounded-lg backdrop-blur-sm">
      <div className="p-6 border-b border-orange-500/20">
        <h2 className="text-xl font-semibold text-orange-400 flex items-center">
          <Target className="mr-2" size={24} />
          Objectif
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Main Objectives Progress */}
        <div className="space-y-4">
          {objectives?.map((objective) => {
            const colorClasses = {
              teal: {
                text: 'text-teal-400',
                bg: 'bg-teal-600/30',
                progress: 'from-teal-500 to-teal-400'
              },
              orange: {
                text: 'text-orange-400',
                bg: 'bg-orange-600/30',
                progress: 'from-orange-500 to-orange-400'
              },
              purple: {
                text: 'text-purple-400',
                bg: 'bg-purple-600/30',
                progress: 'from-purple-500 to-purple-400'
              }
            };
            
            const colors = colorClasses?.[objective?.color];
            
            return (
              <div key={objective?.id} className="p-4 bg-slate-700/20 rounded-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`p-2 ${colors?.bg} rounded-lg ${colors?.text}`}>
                    <objective.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">
                      {objective?.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {objective?.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">
                      {objective?.current} / {objective?.target} {objective?.unit}
                    </span>
                    <span className={`text-sm font-semibold ${colors?.text}`}>
                      {objective?.progress}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-600/30 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${colors?.progress} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${objective?.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestones Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="mr-2" size={18} />
            Jalons de progression ({completedMilestones}/{milestones?.length})
          </h3>
          
          <div className="space-y-3">
            {milestones?.map((milestone, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                milestone?.completed 
                  ? 'bg-teal-600/20 border border-teal-500/30' :'bg-slate-700/20 border border-slate-600/30'
              }`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  milestone?.completed
                    ? 'border-teal-400 bg-teal-400' :'border-slate-400 bg-transparent'
                }`}>
                  {milestone?.completed && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      milestone?.completed ? 'text-teal-400' : 'text-slate-300'
                    }`}>
                      {milestone?.target} livres
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className={`text-sm ${
                      milestone?.completed ? 'text-white' : 'text-slate-400'
                    }`}>
                      {milestone?.label}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    {milestone?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="p-4 bg-slate-700/20 rounded-lg">
          <h4 className="text-white font-medium mb-3">Métriques de succès</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-teal-400">
                {Math.round(((processingStats?.processedBooks || 0) / Math.max(processingStats?.totalBooks || 1, 1)) * 100)}%
              </div>
              <div className="text-slate-400">Taux de traitement</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">
                {registryStatus ? 'Actif' : 'En attente'}
              </div>
              <div className="text-slate-400">Système IA</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-4 bg-slate-700/20 rounded-lg">
          <h4 className="text-white font-medium mb-3">Prochaines étapes</h4>
          <div className="space-y-2 text-sm">
            {(processingStats?.totalBooks || 0) < 50 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span className="text-slate-300">Uploader plus de livres PDF</span>
              </div>
            )}
            {(processingStats?.pendingBooks || 0) > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-slate-300">Traiter les livres en attente</span>
              </div>
            )}
            {!registryStatus && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-slate-300">Activer le système IA</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectivePanel;