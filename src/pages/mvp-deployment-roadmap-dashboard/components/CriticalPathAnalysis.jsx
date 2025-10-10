import React from 'react';
import { 
  GitBranch, 
  ArrowRight, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  PlayCircle,
  Zap,
  Shield,
  Settings,
  Target,
  Calendar
} from 'lucide-react';

export default function CriticalPathAnalysis({ stages, kpis, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)]?.map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allTasks = Object.values(stages)?.flat() || [];
  
  // Define critical path dependencies
  const criticalPath = [
    { id: 1, name: 'Infrastructure', depends: [], color: 'blue' },
    { id: 2, name: 'Providers', depends: [1], color: 'green' },
    { id: 3, name: 'Couche Données', depends: [2], color: 'purple' },
    { id: 4, name: 'Résilience', depends: [3], color: 'orange' },
    { id: 5, name: 'Déploiement', depends: [4], color: 'teal' }
  ];

  // Calculate estimated timeline
  const totalEstimatedDays = allTasks?.reduce((sum, task) => sum + (task?.deadline_days || 0), 0);
  const completedDays = allTasks?.filter(t => t?.status === 'termine')?.reduce((sum, task) => sum + (task?.deadline_days || 0), 0);
  const remainingDays = totalEstimatedDays - completedDays;

  // Identify bottlenecks and blockers
  const bottlenecks = allTasks?.filter(task => 
    task?.priority === 'haute' && task?.status !== 'termine'
  );

  const upcomingMilestones = [
    {
      name: 'Environnement MVP Ready',
      stage: 1,
      completed: kpis?.stages_completed >= 1,
      estimated_days: 2
    },
    {
      name: 'Providers Configurés',
      stage: 2,
      completed: kpis?.stages_completed >= 2,
      estimated_days: 5
    },
    {
      name: 'Système Résilient',
      stage: 4,
      completed: kpis?.resilience_active,
      estimated_days: 10
    },
    {
      name: 'MVP en Production',
      stage: 8,
      completed: kpis?.deployment_status === 'Live',
      estimated_days: 14
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Analyse du Chemin Critique</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Estimation: {remainingDays} jours restants</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>Objectif: MVP Production</span>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Critical Path Visualization */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <GitBranch className="w-5 h-5" />
            <span>Dépendances et Séquencement</span>
          </h3>

          <div className="space-y-3">
            {criticalPath?.map((step, index) => {
              const isCompleted = kpis?.stages_completed > index;
              const isCurrent = kpis?.stages_completed === index;
              const isBlocked = false; // Could add logic for blocked states

              return (
                <div 
                  key={step?.id}
                  className={`flex items-center space-x-4 p-3 rounded-lg border transition-all ${
                    isCompleted 
                      ? 'border-green-500/30 bg-green-500/5'
                      : isCurrent
                      ? 'border-blue-500/30 bg-blue-500/5' :'border-gray-600 bg-gray-750'
                  }`}
                >
                  {/* Step Status */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white' :'bg-gray-600 text-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isCurrent ? (
                      <PlayCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  {/* Step Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        isCompleted ? 'text-green-300' : isCurrent ?'text-blue-300' : 'text-gray-300'
                      }`}>
                        {step?.name}
                      </span>
                      
                      {step?.depends?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          (Dépend de: Étape {step?.depends?.join(', ')})
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Arrow */}
                  {index < criticalPath?.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottlenecks & Risks */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Goulots d'Étranglement</span>
          </h3>

          {bottlenecks?.length > 0 ? (
            <div className="space-y-2">
              {bottlenecks?.map((task) => (
                <div 
                  key={task?.id}
                  className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <div>
                    <span className="text-yellow-300 font-medium">{task?.task_name}</span>
                    <div className="text-xs text-yellow-400 mt-1">
                      Priorité haute • Phase: {task?.phase}
                    </div>
                  </div>
                  <div className="text-xs text-yellow-400">
                    {task?.deadline_days} jours
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p>Aucun goulot d'étranglement critique détecté</p>
            </div>
          )}
        </div>

        {/* Milestones Timeline */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Jalons Principaux</span>
          </h3>

          <div className="space-y-3">
            {upcomingMilestones?.map((milestone, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  milestone?.completed 
                    ? 'border-green-500/30 bg-green-500/5' :'border-gray-600 bg-gray-750'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    milestone?.completed ? 'bg-green-400' : 'bg-gray-500'
                  }`} />
                  <div>
                    <span className={`font-medium ${
                      milestone?.completed ? 'text-green-300' : 'text-gray-300'
                    }`}>
                      {milestone?.name}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Étape {milestone?.stage}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    milestone?.completed ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {milestone?.completed ? 'Terminé' : `J+${milestone?.estimated_days}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Allocation & Next Actions */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Actions Recommandées</span>
          </h3>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h4 className="text-blue-300 font-medium">Prochaine Action Prioritaire</h4>
                <p className="text-blue-200 text-sm mt-1">
                  {kpis?.stages_completed === 0 && "Commencer la préparation de l'environnement Rocketnew"}
                  {kpis?.stages_completed === 1 && "Configurer les clés API pour les providers (Finnhub, Alpha Vantage, TwelveData)"}
                  {kpis?.stages_completed === 2 && "Implémenter la couche de données avec cache et topics"}
                  {kpis?.stages_completed >= 3 && kpis?.stages_completed < 8 && "Continuer le déploiement selon le roadmap"}
                  {kpis?.stages_completed >= 8 && "Surveiller et optimiser le système en production"}
                </p>
                
                <div className="mt-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300">
                    Estimation: {remainingDays > 0 ? `${remainingDays} jours` : 'Déploiement complet'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}