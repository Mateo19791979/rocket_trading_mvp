import React from 'react';
import { Brain, Target, TrendingUp, Zap, Activity } from 'lucide-react';

export default function MetaOrchestratorPanel({ data }) {
  if (!data) {
    return (
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-purple-300">🧠 Meta-Orchestrateur</h2>
        </div>
        <div className="text-gray-400">Chargement des données orchestrateur...</div>
      </div>
    );
  }

  const { orchestrator, scoring } = data;

  const getStatusColor = (active) => active ? 'text-green-400' : 'text-red-400';
  const getStatusText = (active) => active ? 'Actif' : 'Inactif';

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-xl p-6 border border-slate-600">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h2 className="text-xl font-bold text-purple-300">🧠 Meta-Orchestrateur</h2>
      </div>
      {/* Registry Consumption */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-orange-300">Consomme Registry</h3>
        </div>
        <div className="ml-7 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">• Toutes stratégies disponibles</span>
            <span className="text-orange-300 font-medium">{orchestrator?.total_strategies_available || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">• Registry en consommation:</span>
            <span className={getStatusColor(orchestrator?.registry_consuming)}>
              {getStatusText(orchestrator?.registry_consuming)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">• Version registry:</span>
            <span className="text-teal-300">{orchestrator?.registry_version}</span>
          </div>
          <div className="text-xs text-gray-400">
            Dernière MAJ: {orchestrator?.last_registry_update ? 
              new Date(orchestrator.last_registry_update)?.toLocaleString('fr-FR') : 
              'Aucune'
            }
          </div>
        </div>
      </div>
      {/* Multi-Strategy Scoring */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-teal-400" />
          <h3 className="font-semibold text-teal-300">Scoring Multi-Stratégies</h3>
        </div>
        <div className="ml-7 space-y-2 text-sm">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-teal-200 font-medium">{scoring?.sharpe_scores || 0}</div>
              <div className="text-gray-400">Sharpe</div>
            </div>
            <div className="text-center">
              <div className="text-teal-200 font-medium">{scoring?.mdd_scores || 0}</div>
              <div className="text-gray-400">MDD</div>
            </div>
            <div className="text-center">
              <div className="text-teal-200 font-medium">{scoring?.stability_scores || 0}</div>
              <div className="text-gray-400">Stabilité</div>
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-600">
            <span className="text-gray-400 text-xs">Score multi-stratégies:</span>
            <span className={getStatusColor(orchestrator?.multi_strategy_scoring)}>
              {getStatusText(orchestrator?.multi_strategy_scoring)}
            </span>
          </div>
        </div>
      </div>
      {/* Automatic Selection & Allocation */}
      <div className="bg-gradient-to-r from-purple-900/30 to-teal-900/30 rounded-lg p-4 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-purple-400" />
          <span className="text-purple-300 font-medium">Sélection / Allocation Automatique</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">• Auto-sélection:</span>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-300" />
              <span className={getStatusColor(orchestrator?.auto_selection_active)}>
                {getStatusText(orchestrator?.auto_selection_active)}
              </span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">• Auto-allocation:</span>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-purple-300" />
              <span className={getStatusColor(orchestrator?.auto_allocation_active)}>
                {getStatusText(orchestrator?.auto_allocation_active)}
              </span>
            </div>
          </div>
          
          {/* Confidence Breakdown */}
          <div className="mt-3 pt-2 border-t border-slate-600">
            <div className="text-xs text-gray-400 mb-1">Confiance des stratégies:</div>
            <div className="flex justify-between">
              <span className="text-green-300">Haute (&gt;80%):</span>
              <span className="text-green-200">{scoring?.high_confidence || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-300">Moyenne (60-80%):</span>
              <span className="text-yellow-200">{scoring?.medium_confidence || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}