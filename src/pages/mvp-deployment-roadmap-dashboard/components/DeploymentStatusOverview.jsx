import React from 'react';
import { TrendingUp, Server, Shield, Database, Activity, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function DeploymentStatusOverview({ kpis, project, loading }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Préparation Environnement',
      value: `${kpis?.environment_readiness || 0}%`,
      icon: Server,
      color: 'from-blue-600 to-blue-500',
      status: kpis?.environment_readiness >= 100 ? 'success' : kpis?.environment_readiness > 0 ? 'warning' : 'pending'
    },
    {
      title: 'Connectivité Providers',
      value: `${Math.round(kpis?.provider_connectivity || 0)}%`,
      icon: Database,
      color: 'from-green-600 to-green-500',
      status: kpis?.provider_connectivity >= 100 ? 'success' : kpis?.provider_connectivity > 0 ? 'warning' : 'pending'
    },
    {
      title: 'Intégration Couche Données',
      value: kpis?.stages_completed >= 3 ? '100%' : '0%',
      icon: Activity,
      color: 'from-purple-600 to-purple-500',
      status: kpis?.stages_completed >= 3 ? 'success' : 'pending'
    },
    {
      title: 'Système Résilience',
      value: kpis?.resilience_active ? 'Actif' : 'Inactif',
      icon: Shield,
      color: 'from-orange-600 to-orange-500',
      status: kpis?.resilience_active ? 'success' : 'pending'
    }
  ];

  const statusIcons = {
    success: CheckCircle,
    warning: Clock,
    pending: AlertTriangle
  };

  const statusColors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    pending: 'text-gray-400'
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Aperçu du Statut de Déploiement</h2>
        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            kpis?.deployment_status === 'Live' ?'text-green-400 bg-green-500/20'
              : kpis?.deployment_status === 'Staging' ?'text-yellow-400 bg-yellow-500/20' :'text-gray-400 bg-gray-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              kpis?.deployment_status === 'Live' ? 'bg-green-400' : 
              kpis?.deployment_status === 'Staging' ? 'bg-yellow-400' : 'bg-gray-400'
            }`} />
            <span>Statut: {kpis?.deployment_status || 'Development'}</span>
          </div>
          
          <div className="text-sm text-gray-400">
            Étape actuelle: {kpis?.stages_completed || 0}/9
          </div>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {kpiCards?.map((kpi, index) => {
            const IconComponent = kpi?.icon;
            const StatusIcon = statusIcons?.[kpi?.status];
            const statusColorClass = statusColors?.[kpi?.status];
            
            return (
              <div 
                key={index}
                className="bg-gray-750 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${kpi?.color} flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <StatusIcon className={`w-5 h-5 ${statusColorClass}`} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-gray-300 text-sm font-medium">
                    {kpi?.title}
                  </h3>
                  <div className="text-white text-lg font-bold">
                    {kpi?.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Progress */}
        <div className="bg-gray-750 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Progression Détaillée</span>
          </h3>

          <div className="space-y-4">
            {/* Current Stage Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Étapes terminées</span>
                <span className="text-white font-medium">
                  {kpis?.stages_completed || 0} / 9
                </span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((kpis?.stages_completed || 0) / 9) * 100}%` }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">En cours</span>
                <span className="text-yellow-400 font-medium">
                  {kpis?.stages_in_progress || 0}
                </span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((kpis?.stages_in_progress || 0) / 9) * 100}%` }}
                />
              </div>
            </div>

            {/* Remaining */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Restantes</span>
                <span className="text-gray-400 font-medium">
                  {kpis?.stages_remaining || 0}
                </span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-gray-500 to-gray-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((kpis?.stages_remaining || 0) / 9) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Critical Metrics */}
        <div className="mt-6 bg-gray-750 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Indicateurs Critiques</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {kpis?.overall_progress || 0}%
              </div>
              <div className="text-xs text-gray-400">Progression Globale</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {Object.values({})?.filter(p => p?.is_active)?.length || 0}/3
              </div>
              <div className="text-xs text-gray-400">Providers Actifs</div>
            </div>

            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${
                kpis?.deployment_status === 'Live' ? 'text-green-400' : 
                kpis?.deployment_status === 'Staging' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {kpis?.deployment_status === 'Live' ? '🟢' : 
                 kpis?.deployment_status === 'Staging' ? '🟡' : '🔴'}
              </div>
              <div className="text-xs text-gray-400">Status MVP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}