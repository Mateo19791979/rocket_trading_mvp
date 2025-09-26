import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Eye, Activity, Info } from 'lucide-react';

export default function ResultsTable({ 
  results, 
  loading, 
  onAssetSelect, 
  selectedAsset, 
  onShowScoreDetails, 
  onShowIVRank 
}) {
  
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100)?.toFixed(1)}%`;
  };

  const formatScore = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value?.toFixed(1);
  };

  const formatZScore = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return value?.toFixed(2);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getZScoreColor = (zscore) => {
    if (zscore <= -1) return 'text-green-400';
    if (zscore <= -0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStrategyBadge = (strategy) => {
    const strategies = {
      'bull_call_spread': { label: 'Bull Call Spread', color: 'bg-green-900 text-green-300' },
      'cash_secured_put': { label: 'Cash-Secured Put', color: 'bg-blue-900 text-blue-300' },
      'covered_call': { label: 'Covered Call', color: 'bg-purple-900 text-purple-300' },
      'long_call': { label: 'Long Call', color: 'bg-orange-900 text-orange-300' }
    };

    const strategyInfo = strategies?.[strategy] || { label: strategy, color: 'bg-gray-700 text-gray-300' };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${strategyInfo?.color}`}>
        {strategyInfo?.label}
      </span>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)]?.map((_, index) => (
        <div key={index} className="flex space-x-4 animate-pulse">
          <div className="h-4 bg-gray-700 rounded flex-1"></div>
          <div className="h-4 bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          <BarChart3 className="w-5 h-5 inline mr-2" />
          Résultats du Screening
        </h2>
        <span className="text-sm text-gray-400">
          {results?.length || 0} résultats trouvés
        </span>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : results?.length === 0 ? (
        <div className="text-center py-8">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Aucun résultat</h3>
          <p className="text-gray-500">
            Essayez d'ajuster vos critères de screening pour obtenir des résultats.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 text-gray-300 font-medium">Symbole</th>
                <th className="text-left py-3 text-gray-300 font-medium">
                  Score
                  <button 
                    className="ml-1 text-gray-500 hover:text-gray-400"
                    title="Détails du score composite"
                  >
                    <Info className="w-3 h-3 inline" />
                  </button>
                </th>
                <th className="text-left py-3 text-gray-300 font-medium">Perf vs Secteur</th>
                <th className="text-left py-3 text-gray-300 font-medium">P/E Z-Score</th>
                <th className="text-left py-3 text-gray-300 font-medium">ROE</th>
                <th className="text-left py-3 text-gray-300 font-medium">ROIC</th>
                <th className="text-left py-3 text-gray-300 font-medium">
                  IV Rank
                  <button 
                    className="ml-1 text-gray-500 hover:text-gray-400"
                    title="Implied Volatility Rank"
                  >
                    <Activity className="w-3 h-3 inline" />
                  </button>
                </th>
                <th className="text-left py-3 text-gray-300 font-medium">Stratégie</th>
                <th className="text-left py-3 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results?.map((result, index) => (
                <tr 
                  key={result?.id || index}
                  className={`border-b border-gray-700 hover:bg-gray-750 cursor-pointer ${
                    selectedAsset?.symbol === result?.symbol ? 'bg-blue-900/30' : ''
                  }`}
                  onClick={() => onAssetSelect?.(result)}
                >
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-white">{result?.symbol}</div>
                      <div className="text-xs text-gray-400">{result?.name}</div>
                      <div className="text-xs text-gray-500">
                        {result?.sector} • {result?.exchange}
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`font-semibold ${getScoreColor(result?.composite_score)}`}>
                      {formatScore(result?.composite_score)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {result?.performance_vs_sector > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={result?.performance_vs_sector > 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPercentage(result?.performance_vs_sector)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={getZScoreColor(result?.pe_zscore)}>
                      {formatZScore(result?.pe_zscore)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-green-400">
                      {formatPercentage(result?.roe)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-blue-400">
                      {formatPercentage(result?.roic)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-purple-400">
                      {result?.iv_rank ? `${result?.iv_rank?.toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3">
                    {getStrategyBadge(result?.recommended_strategy)}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          onShowScoreDetails?.(result?.symbol);
                        }}
                        className="text-gray-400 hover:text-blue-400 p-1"
                        title="Détails du score"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          onShowIVRank?.(result?.symbol);
                        }}
                        className="text-gray-400 hover:text-purple-400 p-1"
                        title="IV Rank détaillé"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          onAssetSelect?.(result);
                        }}
                        className="text-gray-400 hover:text-green-400 p-1"
                        title="Voir les stratégies"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Légende</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
          <div>
            <span className="text-green-400">Score ≥80:</span> Excellent
          </div>
          <div>
            <span className="text-yellow-400">Score 70-79:</span> Bon
          </div>
          <div>
            <span className="text-green-400">P/E Z ≤-1:</span> Très sous-valorisé
          </div>
          <div>
            <span className="text-yellow-400">P/E Z ≤-0.5:</span> Sous-valorisé
          </div>
        </div>
      </div>
    </div>
  );
}