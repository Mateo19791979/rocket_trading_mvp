import React from 'react';
import { Link, CheckCircle, XCircle, Clock, Calendar, Settings, Database, Zap } from 'lucide-react';

export default function ProductIntegrationPanel({ integration, loading }) {
  const getStatusIcon = (status) => {
    if (status) return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' };
    return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const integrationItems = [
    {
      key: 'registry_auto_fed',
      name: 'Registry_auto.yaml alimenté automatiquement',
      description: 'Génération automatique du registre des stratégies',
      icon: Database,
      status: integration?.registry_auto_fed || false
    },
    {
      key: 'orchestrator_consuming',
      name: 'Orchestrateur consomme /registry',
      description: 'API endpoint actif pour l\'orchestrateur',
      icon: Zap,
      status: integration?.orchestrator_consuming || false
    },
    {
      key: 'weekly_cron_active',
      name: 'Mise à jour hebdo possible (cron)',
      description: 'Planificateur automatique configuré',
      icon: Calendar,
      status: integration?.weekly_cron_active || false
    }
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur rounded-xl border border-slate-700/50 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Link className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">🔗 Intégration produit</h2>
      </div>
      <div className="space-y-4">
        {integrationItems?.map((item) => {
          const statusInfo = getStatusIcon(item?.status);
          const StatusIcon = statusInfo?.icon;
          const ItemIcon = item?.icon;

          return (
            <div
              key={item?.key}
              className={`${statusInfo?.bg} border ${item?.status ? 'border-green-500/30' : 'border-red-500/30'} rounded-lg p-4 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <ItemIcon className="w-5 h-5 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {item?.name}
                    </h3>
                    <p className="text-slate-300 text-xs mt-1">
                      {item?.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <StatusIcon className={`w-5 h-5 ${statusInfo?.color}`} />
                  <span className={`text-sm font-medium ${statusInfo?.color}`}>
                    {item?.status ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Integration Summary */}
        <div className="bg-slate-700/50 border border-slate-600/30 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">Statut d'intégration</h3>
              <p className="text-slate-300 text-sm">Version du registre & dernière mise à jour</p>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300 font-mono text-sm">
                {integration?.registry_version || 'v0.1'}
              </span>
            </div>
          </div>

          {integration?.last_update && (
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>
                Dernière mise à jour: {' '}
                {new Date(integration.last_update)?.toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}