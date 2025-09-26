import React from 'react';
import { Send, TrendingUp, DollarSign, Shield, Calendar, Target, AlertTriangle } from 'lucide-react';

export default function StrategyPanel({ 
  selectedAsset, 
  strategies, 
  loading, 
  onSendToPaperTrading 
}) {
  
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('fr-CH');
  };

  const getStrategyIcon = (strategyType) => {
    switch (strategyType) {
      case 'bull_call_spread':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'cash_secured_put':
        return <Shield className="w-5 h-5 text-blue-400" />;
      case 'covered_call':
        return <DollarSign className="w-5 h-5 text-purple-400" />;
      default:
        return <Target className="w-5 h-5 text-orange-400" />;
    }
  };

  const getStrategyTitle = (strategyType) => {
    const titles = {
      'bull_call_spread': 'Bull Call Spread',
      'cash_secured_put': 'Cash-Secured Put', 
      'covered_call': 'Covered Call',
      'long_call': 'Long Call'
    };
    return titles?.[strategyType] || strategyType;
  };

  const getStrategyDescription = (strategyType) => {
    const descriptions = {
      'bull_call_spread': 'Stratégie haussière à risque limité, idéale pour les actions sous-valorisées avec potentiel de rebond modéré.',
      'cash_secured_put': 'Collecte de primes avec acquisition potentielle de l\'action à prix réduit. Nécessite liquidités suffisantes.',
      'covered_call': 'Génération de revenus supplémentaires sur positions existantes. Plafonne les gains à la hausse.',
      'long_call': 'Position haussière directionnelle avec levier. Exposition complète au mouvement de l\'action.'
    };
    return descriptions?.[strategyType] || 'Stratégie d\'options personnalisée';
  };

  const getRiskLevel = (maxLoss, maxProfit) => {
    if (!maxLoss || !maxProfit) return { level: 'Moyen', color: 'text-yellow-400' };
    
    const riskRatio = Math.abs(maxLoss) / maxProfit;
    if (riskRatio <= 1) return { level: 'Faible', color: 'text-green-400' };
    if (riskRatio <= 3) return { level: 'Moyen', color: 'text-yellow-400' };
    return { level: 'Élevé', color: 'text-red-400' };
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(2)]?.map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          <Target className="w-5 h-5 inline mr-2" />
          Stratégies Proposées
        </h2>
      </div>

      {!selectedAsset ? (
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Sélectionnez une action</h3>
          <p className="text-gray-500">
            Choisissez une action dans le tableau pour voir les stratégies d'options recommandées par l'IA.
          </p>
        </div>
      ) : loading ? (
        <LoadingSkeleton />
      ) : strategies?.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune stratégie disponible</h3>
          <p className="text-gray-500">
            Aucune stratégie d'options n'a été trouvée pour {selectedAsset?.symbol}. 
            Les données d'options peuvent être limitées.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected Asset Info */}
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-white mb-2">{selectedAsset?.symbol}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Score:</span>
                <span className="ml-2 text-green-400 font-medium">
                  {selectedAsset?.composite_score?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Secteur:</span>
                <span className="ml-2 text-white">{selectedAsset?.sector}</span>
              </div>
            </div>
          </div>

          {/* Strategies List */}
          {strategies?.map((strategy, index) => {
            const risk = getRiskLevel(strategy?.max_loss, strategy?.max_profit);
            
            return (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                {/* Strategy Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStrategyIcon(strategy?.strategy_type)}
                    <h4 className="font-semibold text-white">
                      {getStrategyTitle(strategy?.strategy_type)}
                    </h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    risk?.level === 'Faible' ? 'bg-green-900 text-green-300' :
                    risk?.level === 'Moyen'? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                  }`}>
                    Risque {risk?.level}
                  </span>
                </div>

                {/* Strategy Description */}
                <p className="text-sm text-gray-300 mb-3">
                  {getStrategyDescription(strategy?.strategy_type)}
                </p>

                {/* Strategy Details */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      Expiration
                    </div>
                    <div className="text-white font-medium">
                      {formatDate(strategy?.expiration_date)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <TrendingUp className="w-3 h-3" />
                      Profit Max
                    </div>
                    <div className="text-green-400 font-medium">
                      {formatCurrency(strategy?.max_profit)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Shield className="w-3 h-3" />
                      Perte Max
                    </div>
                    <div className="text-red-400 font-medium">
                      {formatCurrency(strategy?.max_loss)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Target className="w-3 h-3" />
                      Break-Even
                    </div>
                    <div className="text-white font-medium">
                      {formatCurrency(strategy?.break_even)}
                    </div>
                  </div>
                </div>

                {/* Strategy Legs Details */}
                {strategy?.long_leg && (
                  <div className="mb-3 p-3 bg-gray-800 rounded">
                    <h5 className="text-xs font-medium text-gray-400 mb-2">Détails de la stratégie</h5>
                    <div className="space-y-1 text-xs">
                      {strategy?.long_leg && (
                        <div className="flex justify-between">
                          <span className="text-green-400">Long Call Strike {strategy?.long_leg?.strike}:</span>
                          <span className="text-white">{formatCurrency(strategy?.long_leg?.premium)}</span>
                        </div>
                      )}
                      {strategy?.short_leg && (
                        <div className="flex justify-between">
                          <span className="text-red-400">Short Call Strike {strategy?.short_leg?.strike}:</span>
                          <span className="text-white">{formatCurrency(strategy?.short_leg?.premium)}</span>
                        </div>
                      )}
                      {strategy?.cash_required && (
                        <div className="flex justify-between border-t border-gray-600 pt-1">
                          <span className="text-yellow-400">Liquidités requises:</span>
                          <span className="text-white font-medium">{formatCurrency(strategy?.cash_required)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Parameters */}
                {strategy?.risk_parameters && (
                  <div className="mb-3 p-3 bg-gray-800 rounded">
                    <h5 className="text-xs font-medium text-gray-400 mb-2">Gestion des risques</h5>
                    <div className="space-y-1 text-xs text-gray-300">
                      {strategy?.risk_parameters?.max_cap_per_trade && (
                        <div>
                          • Taille max par trade: {(strategy?.risk_parameters?.max_cap_per_trade * 100)?.toFixed(1)}% du capital
                        </div>
                      )}
                      {strategy?.risk_parameters?.avoid_earnings && (
                        <div>• Éviter les publications de résultats</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reason */}
                {strategy?.reason && (
                  <div className="mb-3 p-3 bg-blue-900/20 border border-blue-700 rounded">
                    <div className="text-xs text-blue-200">{strategy?.reason}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onSendToPaperTrading?.(strategy)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer vers Paper-Trading
                  </button>
                </div>
              </div>
            );
          })}

          {/* Educational Note */}
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-300 mb-1">💡 Note Pédagogique</h4>
            <div className="text-xs text-yellow-200 space-y-1">
              <div>• <strong>P/E Ratio:</strong> Prix/Bénéfices. Plus bas = potentiellement sous-valorisé.</div>
              <div>• <strong>PEG:</strong> P/E divisé par croissance. &lt;1.5 = croissance à prix raisonnable.</div>
              <div>• <strong>Delta:</strong> Sensibilité de l'option au mouvement de l'action sous-jacente.</div>
              <div>• <strong>IV Rank:</strong> Volatilité implicite actuelle vs historique sur 1 an.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}