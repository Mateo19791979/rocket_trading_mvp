import React from 'react';
import { Link2, Database, GitBranch, ExternalLink, CheckCircle, Clock } from 'lucide-react';

const IntegrationPanel = ({ registryStatus, strategyExtractions }) => {
  const getRegistryStats = () => {
    if (!registryStatus) {
      return {
        version: 'v0.1',
        strategiesCount: 0,
        lastUpdate: 'Jamais',
        status: 'inactive'
      };
    }

    return {
      version: registryStatus?.registry_version || 'v0.1',
      strategiesCount: registryStatus?.total_strategies_extracted || 0,
      lastUpdate: registryStatus?.last_processing_date 
        ? new Date(registryStatus.last_processing_date)?.toLocaleDateString('fr-FR')
        : 'Jamais',
      status: registryStatus?.integration_status?.meta_orchestrator === 'connected' ? 'active' : 'inactive'
    };
  };

  const getRecentStrategies = () => {
    return strategyExtractions?.slice(0, 5) || [];
  };

  const getIntegrationFeatures = () => {
    return [
      {
        name: 'Registry_v0.1.yaml déjà généré',
        description: '10 stratégies exemples créées automatiquement',
        status: registryStatus ? 'active' : 'pending',
        icon: Database
      },
      {
        name: 'Alimentation directe du Meta-Orchestrateur',
        description: 'Connexion API temps réel etablie',
        status: registryStatus?.integration_status?.meta_orchestrator === 'connected' ? 'active' : 'pending',
        icon: GitBranch
      },
      {
        name: 'Complément aux sources OA',
        description: 'Sources Open Access intégrées en parallèle',
        status: 'active',
        icon: ExternalLink
      }
    ];
  };

  const stats = getRegistryStats();
  const recentStrategies = getRecentStrategies();
  const integrationFeatures = getIntegrationFeatures();

  return (
    <div className="bg-slate-800/30 border border-teal-500/30 rounded-lg backdrop-blur-sm">
      <div className="p-6 border-b border-teal-500/20">
        <h2 className="text-xl font-semibold text-teal-400 flex items-center">
          <Link2 className="mr-2" size={24} />
          Intégration
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Registry Status */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Registry Status</h3>
          <div className="p-4 bg-slate-700/20 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-400">
                  {stats?.version}
                </div>
                <div className="text-sm text-slate-300">Version Registry</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {stats?.strategiesCount}
                </div>
                <div className="text-sm text-slate-300">Stratégies actives</div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-slate-300">Dernière mise à jour:</span>
              <span className="text-white font-medium">{stats?.lastUpdate}</span>
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <span className="text-slate-300">Status Meta-Orchestrateur:</span>
              <div className="flex items-center space-x-2">
                {stats?.status === 'active' ? (
                  <>
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-400 font-medium">Connecté</span>
                  </>
                ) : (
                  <>
                    <Clock className="text-yellow-400" size={16} />
                    <span className="text-yellow-400 font-medium">En attente</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Features */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Fonctionnalités d'intégration</h3>
          <div className="space-y-3">
            {integrationFeatures?.map((feature, index) => (
              <div key={index} className="p-4 bg-slate-700/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    feature?.status === 'active' ?'bg-teal-600/30 text-teal-400' :'bg-yellow-600/30 text-yellow-400'
                  }`}>
                    <feature.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {feature?.name}
                      </span>
                      {feature?.status === 'active' ? (
                        <CheckCircle className="text-green-400" size={16} />
                      ) : (
                        <Clock className="text-yellow-400" size={16} />
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {feature?.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Strategy Extractions */}
        {recentStrategies?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Stratégies récemment extraites</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {recentStrategies?.map((strategy) => (
                <div key={strategy?.id} className="p-3 bg-slate-700/20 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">
                        {strategy?.strategy_name || 'Stratégie sans nom'}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        Type: {strategy?.extraction_type} • 
                        Score: {Math.round((strategy?.confidence_score || 0) * 100)}% •
                        Source: {strategy?.book_library?.title || 'Livre inconnu'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        (strategy?.confidence_score || 0) > 0.8 
                          ? 'bg-green-600/30 text-green-400'
                          : (strategy?.confidence_score || 0) > 0.6
                          ? 'bg-yellow-600/30 text-yellow-400' :'bg-red-600/30 text-red-400'
                      }`}>
                        {Math.round((strategy?.confidence_score || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Endpoints */}
        <div className="p-4 bg-slate-700/20 rounded-lg">
          <h4 className="text-white font-medium mb-3">Points d'accès API</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
              <code className="text-teal-300">/api/registry/strategies</code>
              <span className="text-slate-400">→ Orchestrateur</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <code className="text-orange-300">/api/corpus/sync</code>
              <span className="text-slate-400">→ Sources OA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationPanel;