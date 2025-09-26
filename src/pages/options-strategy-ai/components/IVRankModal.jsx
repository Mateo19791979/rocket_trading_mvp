import React from 'react';
import { X, Activity, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default function IVRankModal({ ivRankData, onClose }) {
  
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value?.toFixed(2)}%`;
  };

  const formatIV = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100)?.toFixed(2)}%`;
  };

  const getIVRankColor = (rank) => {
    if (rank >= 75) return 'text-red-400';
    if (rank >= 50) return 'text-yellow-400';
    if (rank >= 25) return 'text-green-400';
    return 'text-blue-400';
  };

  const getIVRankBackground = (rank) => {
    if (rank >= 75) return 'bg-red-900/30 border-red-700';
    if (rank >= 50) return 'bg-yellow-900/30 border-yellow-700';
    if (rank >= 25) return 'bg-green-900/30 border-green-700';
    return 'bg-blue-900/30 border-blue-700';
  };

  const getIVRankLabel = (rank) => {
    if (rank >= 75) return 'Très Élevé';
    if (rank >= 50) return 'Élevé';
    if (rank >= 25) return 'Modéré';
    return 'Faible';
  };

  const getSkewColor = (skew) => {
    if (skew > 0.05) return 'text-red-400'; // Put expensive
    if (skew < -0.05) return 'text-green-400'; // Call expensive
    return 'text-gray-300'; // Neutral
  };

  const getSkewLabel = (skew) => {
    if (skew > 0.05) return 'Skew Put (Puts plus chers)';
    if (skew < -0.05) return 'Skew Call (Calls plus chers)';
    return 'Neutre';
  };

  const getRecommendation = (ivRank, skew) => {
    if (ivRank >= 75) {
      return {
        text: 'Excellente opportunité de vente d\'options (collecte de primes)',
        color: 'text-green-400',
        icon: <TrendingDown className="w-5 h-5" />,
        strategies: ['Covered Call', 'Cash-Secured Put', 'Iron Condor']
      };
    }
    if (ivRank <= 25) {
      return {
        text: 'Opportunité d\'achat d\'options (volatilité bon marché)',
        color: 'text-blue-400',
        icon: <TrendingUp className="w-5 h-5" />,
        strategies: ['Long Call', 'Long Put', 'Long Straddle']
      };
    }
    return {
      text: 'Volatilité neutre - stratégies directionnelles ou mixtes',
      color: 'text-yellow-400',
      icon: <Activity className="w-5 h-5" />,
      strategies: ['Bull Call Spread', 'Bear Put Spread', 'Butterfly']
    };
  };

  const recommendation = getRecommendation(ivRankData?.iv_rank, ivRankData?.iv_skew);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              IV Rank & Skew - {ivRankData?.symbol}
            </h2>
            <p className="text-gray-400 mt-1">Analyse de la volatilité implicite</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* IV Rank Main Display */}
          <div className={`p-6 rounded-lg border mb-6 ${getIVRankBackground(ivRankData?.iv_rank)}`}>
            <div className="text-center">
              <Activity className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">IV Rank</h3>
              <div className={`text-4xl font-bold mb-2 ${getIVRankColor(ivRankData?.iv_rank)}`}>
                {formatPercentage(ivRankData?.iv_rank)}
              </div>
              <div className={`text-sm font-medium ${getIVRankColor(ivRankData?.iv_rank)}`}>
                {getIVRankLabel(ivRankData?.iv_rank)}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Current IV */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-white">Volatilité Actuelle</h4>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {formatIV(ivRankData?.current_iv)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Volatilité implicite moyenne actuelle
              </p>
            </div>

            {/* IV Skew */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-orange-400" />
                <h4 className="font-semibold text-white">Skew Put/Call</h4>
              </div>
              <div className={`text-2xl font-bold ${getSkewColor(ivRankData?.iv_skew)}`}>
                {formatIV(ivRankData?.iv_skew)}
              </div>
              <p className={`text-xs mt-1 ${getSkewColor(ivRankData?.iv_skew)}`}>
                {getSkewLabel(ivRankData?.iv_skew)}
              </p>
            </div>
          </div>

          {/* Put/Call Ratio */}
          {ivRankData?.put_call_ratio && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">Ratio Put/Call</h4>
                <span className="text-xl font-bold text-purple-400">
                  {ivRankData?.put_call_ratio?.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div 
                  className="bg-purple-400 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (ivRankData?.put_call_ratio * 50))}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Plus de Calls</span>
                <span>Équilibré</span>
                <span>Plus de Puts</span>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border mb-6 ${
            recommendation?.color?.includes('green') ? 'bg-green-900/30 border-green-700' :
            recommendation?.color?.includes('blue') ? 'bg-blue-900/30 border-blue-700' :
            'bg-yellow-900/30 border-yellow-700'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {recommendation?.icon}
              <h3 className="font-semibold text-white">Recommandation</h3>
            </div>
            <p className={`mb-3 ${recommendation?.color}`}>
              {recommendation?.text}
            </p>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Stratégies suggérées:</h4>
              <div className="flex flex-wrap gap-2">
                {recommendation?.strategies?.map((strategy, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs"
                  >
                    {strategy}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Comprendre l'IV Rank</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <h4 className="text-purple-400 font-medium">IV Rank ≥ 75%:</h4>
                <p>Volatilité très élevée. Moment idéal pour <strong>vendre des options</strong> (collecte de primes). Les options sont "chères".</p>
              </div>
              <div>
                <h4 className="text-blue-400 font-medium">IV Rank ≤ 25%:</h4>
                <p>Volatilité faible. Moment favorable pour <strong>acheter des options</strong>. Les options sont "bon marché".</p>
              </div>
              <div>
                <h4 className="text-orange-400 font-medium">Skew Put/Call:</h4>
                <p>
                  <strong>Positif:</strong> Les puts sont plus chers (peur du marché). <br/>
                  <strong>Négatif:</strong> Les calls sont plus chers (optimisme).
                </p>
              </div>
              <div>
                <h4 className="text-purple-400 font-medium">Ratio Put/Call:</h4>
                <p>
                  <strong>&gt; 1.0:</strong> Plus d'intérêt pour les puts (sentiment baissier). <br/>
                  <strong>&lt; 1.0:</strong> Plus d'intérêt pour les calls (sentiment haussier).
                </p>
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {ivRankData?.message && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mt-4">
              <p className="text-yellow-200">{ivRankData?.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}