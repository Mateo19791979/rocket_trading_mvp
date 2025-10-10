import React from 'react';
import { CheckCircle, Clock, PlayCircle, AlertCircle, ChevronRight, Server, Shield, Database, TestTube, Globe, Monitor } from 'lucide-react';

const phaseIcons = {
  infrastructure: Server,
  security: Shield,
  deployment: Globe,
  testing: TestTube,
  monitoring: Monitor,
  dns_ssl: Globe,
  compliance: Shield,
  documentation: Database
};

const phaseColors = {
  infrastructure: 'from-blue-600 to-blue-500',
  security: 'from-orange-600 to-orange-500',
  deployment: 'from-green-600 to-green-500',
  testing: 'from-purple-600 to-purple-500',
  monitoring: 'from-teal-600 to-teal-500',
  dns_ssl: 'from-indigo-600 to-indigo-500',
  compliance: 'from-red-600 to-red-500',
  documentation: 'from-gray-600 to-gray-500'
};

const statusIcons = {
  todo: Clock,
  partiel: PlayCircle,
  termine: CheckCircle
};

const statusColors = {
  todo: 'text-gray-400 bg-gray-500/20',
  partiel: 'text-yellow-400 bg-yellow-500/20',
  termine: 'text-green-400 bg-green-500/20'
};

const statusLabels = {
  todo: 'À faire',
  partiel: 'En cours',
  termine: 'Terminé'
};

export default function DeploymentStagesPanel({ stages, onStatusUpdate, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(9)]?.map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const allTasks = Object.values(stages)?.flat() || [];
  const completedTasks = allTasks?.filter(task => task?.status === 'termine')?.length;
  const totalTasks = allTasks?.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Étapes de Déploiement</h2>
          <div className="text-sm text-gray-400">
            {completedTasks}/{totalTasks} étapes complètes
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-300">Progression globale</span>
            <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      {/* Deployment Stages List */}
      <div className="p-6">
        <div className="space-y-4">
          {allTasks?.map((task, index) => {
            const PhaseIcon = phaseIcons?.[task?.phase] || Server;
            const StatusIcon = statusIcons?.[task?.status] || Clock;
            const phaseColorClass = phaseColors?.[task?.phase] || 'from-gray-600 to-gray-500';
            const statusColorClass = statusColors?.[task?.status] || 'text-gray-400 bg-gray-500/20';
            
            return (
              <div 
                key={task?.id} 
                className="group bg-gray-750 hover:bg-gray-700 rounded-lg p-4 transition-all duration-200 border border-gray-600 hover:border-gray-500"
              >
                <div className="flex items-start space-x-4">
                  {/* Stage Number & Phase Icon */}
                  <div className="flex-shrink-0 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${phaseColorClass} flex items-center justify-center`}>
                      <PhaseIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">
                        {task?.task_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {task?.responsible}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {task?.notes}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Status Badge */}
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusLabels?.[task?.status] || task?.status}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {task?.status !== 'termine' && (
                          <button
                            onClick={() => onStatusUpdate?.(task?.id, task?.status === 'todo' ? 'partiel' : 'termine')}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                          >
                            {task?.status === 'todo' ? 'Commencer' : 'Terminer'}
                          </button>
                        )}
                        
                        {task?.status === 'termine' && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Complété</span>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          {task?.deadline_days}j
                        </div>
                      </div>
                    </div>

                    {/* Priority & Timeline */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          task?.priority === 'haute' ?'bg-red-500/20 text-red-300' 
                            : task?.priority === 'moyenne' ?'bg-yellow-500/20 text-yellow-300' :'bg-gray-500/20 text-gray-300'
                        }`}>
                          {task?.priority}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {task?.phase?.replace('_', ' & ')}
                        </span>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {allTasks?.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-gray-400 font-medium">Aucune étape de déploiement</h3>
            <p className="text-gray-500 text-sm mt-2">
              Les étapes de déploiement seront créées automatiquement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}