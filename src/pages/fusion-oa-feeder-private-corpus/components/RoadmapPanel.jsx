import React from 'react';
import { Rocket, CheckCircle, Clock, AlertCircle, Play } from 'lucide-react';

export default function RoadmapPanel({ data }) {
  if (!data) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-purple-300">🚀 Roadmap</h2>
        </div>
        <div className="text-gray-400">Chargement de la roadmap...</div>
      </div>
    );
  }

  const { roadmap } = data;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Play className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-300 bg-green-900/30 border-green-600';
      case 'in-progress':
        return 'text-yellow-300 bg-yellow-900/30 border-yellow-600';
      case 'pending':
        return 'text-gray-300 bg-gray-900/30 border-gray-600';
      default:
        return 'text-red-300 bg-red-900/30 border-red-600';
    }
  };

  const getProgressBarColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
      <div className="flex items-center gap-3 mb-6">
        <Rocket className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-purple-300">🚀 Roadmap</h2>
      </div>
      <div className="space-y-4">
        {roadmap && Object.entries(roadmap)?.map(([stageKey, stage]) => (
          <div key={stageKey} className={`rounded-lg p-4 border transition-all hover:bg-slate-700/30 ${getStatusColor(stage?.status)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(stage?.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">
                    {stageKey?.toUpperCase()}: {stage?.title}
                  </h3>
                  <span className="text-xs font-mono bg-slate-800/50 px-2 py-1 rounded">
                    {stage?.progress}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(stage?.status)}`}
                    style={{ width: `${stage?.progress}%` }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-300 leading-relaxed">
                  {stage?.description}
                </p>
                
                {/* Status Badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(stage?.status)}`}>
                    {stage?.status === 'completed' && 'Terminé'}
                    {stage?.status === 'in-progress' && 'En cours'}
                    {stage?.status === 'pending' && 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Overall Progress */}
      <div className="mt-6 pt-4 border-t border-slate-600">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Progression Globale</span>
          <span className="text-sm font-bold text-purple-300">
            {roadmap ? Math.round(Object.values(roadmap)?.reduce((sum, stage) => sum + stage?.progress, 0) / Object.keys(roadmap)?.length) : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${roadmap ? Math.round(Object.values(roadmap)?.reduce((sum, stage) => sum + stage?.progress, 0) / Object.keys(roadmap)?.length) : 0}%` 
            }}
          ></div>
        </div>
      </div>
      {/* Current Focus */}
      {roadmap && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/20 to-teal-900/20 rounded-lg border border-purple-500/30">
          <div className="text-xs text-purple-300 font-medium mb-1">🎯 Focus Actuel</div>
          <div className="text-sm text-gray-200">
            {(() => {
              const inProgress = Object.values(roadmap)?.find(stage => stage?.status === 'in-progress');
              const nextPending = Object.values(roadmap)?.find(stage => stage?.status === 'pending');
              
              if (inProgress) {
                return `En cours: ${inProgress?.title}`;
              } else if (nextPending) {
                return `Prochaine étape: ${nextPending?.title}`;
              } else {
                return 'Toutes les étapes sont terminées 🎉';
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}