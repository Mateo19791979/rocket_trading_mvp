import React from 'react';

const ActionPlan = ({ verifications }) => {
  const analyzeResults = () => {
    const analysis = {
      tablesAreViews: false,
      missingColumns: [],
      cacheEmpty: false,
      ibkrOffline: false,
      errors42703Confirmed: false
    };

    Object.entries(verifications)?.forEach(([id, verification]) => {
      if (!verification?.result || verification?.error) return;

      if (id === 'v1' || id === 'v2') {
        // Analyse type de tables
        if (Array.isArray(verification?.result) && verification?.result?.length > 0) {
          if (verification?.result?.[0]?.table_type === 'VIEW') {
            analysis.tablesAreViews = true;
          }
        }
      } else if (id === 'v3' || id === 'v4') {
        // Analyse colonnes manquantes
        if (!Array.isArray(verification?.result) || verification?.result?.length === 0) {
          const columnName = id === 'v3' ? 'positions.is_active' : 'trades.unrealized_pnl';
          analysis?.missingColumns?.push(columnName);
          analysis.errors42703Confirmed = true;
        }
      } else if (id === 'v5') {
        // Analyse cache
        if (Array.isArray(verification?.result) && verification?.result?.length > 0) {
          if (verification?.result?.[0]?.rows === 0) {
            analysis.cacheEmpty = true;
          }
        }
      }
    });

    return analysis;
  };

  const analysis = analyzeResults();

  const getRecommendations = () => {
    const recommendations = [];

    if (analysis?.errors42703Confirmed) {
      recommendations?.push({
        priority: 'CRITIQUE',
        icon: '🚨',
        title: 'Erreurs 42703 confirmées',
        action: 'Appliquer immédiatement la migration de fix schema (overlay + vues finales)',
        technical: 'Utiliser positions_final et trades_pnl_view au lieu des tables directes'
      });
    }

    if (analysis?.tablesAreViews) {
      recommendations?.push({
        priority: 'HAUTE',
        icon: '🔍',
        title: 'Tables détectées comme vues',
        action: 'Ne jamais utiliser ALTER TABLE, seulement des overlays',
        technical: 'Créer positions_active_overlay et trades_unrealized_overlay'
      });
    }

    if (analysis?.cacheEmpty) {
      recommendations?.push({
        priority: 'MOYENNE',
        icon: '📊',
        title: 'Cache marché vide',
        action: 'Redémarrer les services de collecte de données marché',
        technical: 'Vérifier providers, websockets et schedulers'
      });
    }

    if (analysis?.missingColumns?.length === 0 && !analysis?.errors42703Confirmed) {
      recommendations?.push({
        priority: 'INFO',
        icon: '✅',
        title: 'Schema correct détecté',
        action: 'Système opérationnel - vérifier autres causes',
        technical: 'Analyser logs application et connexions IBKR'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITIQUE': return 'bg-red-50 border-red-200 text-red-700';
      case 'HAUTE': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'MOYENNE': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default: return 'bg-green-50 border-green-200 text-green-700';
    }
  };

  if (Object.keys(verifications)?.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        🎯 Plan d'action basé sur les résultats
      </h2>
      <div className="space-y-4">
        {recommendations?.map((rec, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec?.priority)}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{rec?.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-white bg-opacity-50">
                    {rec?.priority}
                  </span>
                  <h3 className="font-semibold">{rec?.title}</h3>
                </div>
                <p className="mb-2">{rec?.action}</p>
                <div className="text-sm font-mono bg-white bg-opacity-50 p-2 rounded">
                  💡 {rec?.technical}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Ordre d'exécution recommandé</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Appliquer les migrations de fix schema (si colonnes manquantes)</li>
          <li>Redémarrer les services de données marché</li>
          <li>Vérifier la connectivité IBKR Gateway</li>
          <li>Tester les endpoints d'API analytics</li>
          <li>Valider les cartes du dashboard</li>
        </ol>
      </div>
    </div>
  );
};

export default ActionPlan;