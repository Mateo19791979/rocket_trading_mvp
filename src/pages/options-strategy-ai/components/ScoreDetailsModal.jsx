import React from 'react';
import { X, BarChart3, TrendingUp, Shield, Activity, Users, Droplets } from 'lucide-react';

export default function ScoreDetailsModal({ scoreDetails, onClose }) {
  
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100)?.toFixed(1)}%`;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const formatNumber = (value, decimals = 1) => {
    if (value === null || value === undefined) return 'N/A';
    return Number(value)?.toFixed(decimals);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-900/30 border-green-700';
    if (score >= 70) return 'bg-yellow-900/30 border-yellow-700';
    if (score >= 60) return 'bg-orange-900/30 border-orange-700';
    return 'bg-red-900/30 border-red-700';
  };

  const ScoreSection = ({ title, score, icon, children }) => (
    <div className={`p-4 rounded-lg border ${getScoreBackground(score)}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {formatNumber(score, 0)}
        </span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Détails du Score - {scoreDetails?.symbol}
            </h2>
            <p className="text-gray-400 mt-1">{scoreDetails?.name}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-400">
                Secteur: <span className="text-white">{scoreDetails?.sector}</span>
              </span>
              <span className="text-gray-400">
                Cap. Marché: <span className="text-white">{formatCurrency(scoreDetails?.market_cap)}</span>
              </span>
            </div>
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
          {/* Overall Score */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 bg-gray-700 rounded-lg p-4">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Score Composite</div>
                <div className={`text-3xl font-bold ${getScoreColor(scoreDetails?.composite_score)}`}>
                  {formatNumber(scoreDetails?.composite_score, 1)}
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Valuation Score */}
            <ScoreSection
              title="Valorisation (35%)"
              score={scoreDetails?.breakdown?.valuation?.score}
              icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">P/E Ratio:</span>
                  <span className="ml-2 text-white">{formatNumber(scoreDetails?.breakdown?.valuation?.pe_ratio, 1)}</span>
                </div>
                <div>
                  <span className="text-gray-400">P/E Z-Score:</span>
                  <span className="ml-2 text-orange-400">{formatNumber(scoreDetails?.breakdown?.valuation?.pe_zscore, 2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">EV/EBITDA:</span>
                  <span className="ml-2 text-white">{formatNumber(scoreDetails?.breakdown?.valuation?.ev_ebitda, 1)}</span>
                </div>
                <div>
                  <span className="text-gray-400">PEG Ratio:</span>
                  <span className="ml-2 text-white">{formatNumber(scoreDetails?.breakdown?.valuation?.peg_ratio, 2)}</span>
                </div>
              </div>
            </ScoreSection>

            {/* Quality Score */}
            <ScoreSection
              title="Qualité (25%)"
              score={scoreDetails?.breakdown?.quality?.score}
              icon={<Shield className="w-5 h-5 text-green-400" />}
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">ROE:</span>
                  <span className="ml-2 text-green-400">{formatPercentage(scoreDetails?.breakdown?.quality?.roe)}</span>
                </div>
                <div>
                  <span className="text-gray-400">ROIC:</span>
                  <span className="ml-2 text-blue-400">{formatPercentage(scoreDetails?.breakdown?.quality?.roic)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Marge Brute:</span>
                  <span className="ml-2 text-white">{formatPercentage(scoreDetails?.breakdown?.quality?.gross_margin)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Cash Flow Op:</span>
                  <span className="ml-2 text-white">{formatCurrency(scoreDetails?.breakdown?.quality?.operating_cash_flow)}</span>
                </div>
              </div>
            </ScoreSection>

            {/* Momentum Score */}
            <ScoreSection
              title="Momentum (20%)"
              score={scoreDetails?.breakdown?.momentum?.score}
              icon={<Activity className="w-5 h-5 text-yellow-400" />}
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Perf 3M:</span>
                  <span className="ml-2 text-white">{formatPercentage(scoreDetails?.breakdown?.momentum?.performance_3m)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Perf 6M:</span>
                  <span className="ml-2 text-white">{formatPercentage(scoreDetails?.breakdown?.momentum?.performance_6m)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Perf 12M:</span>
                  <span className="ml-2 text-white">{formatPercentage(scoreDetails?.breakdown?.momentum?.performance_12m)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Tendance MA:</span>
                  <span className={`ml-2 ${scoreDetails?.breakdown?.momentum?.ma_trend ? 'text-green-400' : 'text-red-400'}`}>
                    {scoreDetails?.breakdown?.momentum?.ma_trend ? '↗ Haussière' : '↘ Baissière'}
                  </span>
                </div>
              </div>
            </ScoreSection>

            {/* Sentiment Score */}
            <ScoreSection
              title="Sentiment (10%)"
              score={scoreDetails?.breakdown?.sentiment?.score}
              icon={<Users className="w-5 h-5 text-blue-400" />}
            >
              <div className="text-sm">
                <div>
                  <span className="text-gray-400">Performance vs Secteur:</span>
                  <span className={`ml-2 font-medium ${
                    scoreDetails?.breakdown?.sentiment?.performance_vs_sector > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercentage(scoreDetails?.breakdown?.sentiment?.performance_vs_sector)}
                  </span>
                </div>
              </div>
            </ScoreSection>

            {/* Liquidity Score */}
            <div className="md:col-span-2">
              <ScoreSection
                title="Liquidité (10%)"
                score={scoreDetails?.breakdown?.liquidity?.score}
                icon={<Droplets className="w-5 h-5 text-cyan-400" />}
              >
                <div className="text-sm">
                  <div>
                    <span className="text-gray-400">IV Rank:</span>
                    <span className="ml-2 text-purple-400">
                      {scoreDetails?.breakdown?.liquidity?.iv_rank ? 
                        `${scoreDetails?.breakdown?.liquidity?.iv_rank?.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </ScoreSection>
            </div>
          </div>

          {/* Recommended Strategy */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-300 mb-2">Stratégie Recommandée</h3>
            <div className="text-white">
              {scoreDetails?.recommended_strategy === 'bull_call_spread' && 'Bull Call Spread'}
              {scoreDetails?.recommended_strategy === 'cash_secured_put' && 'Cash-Secured Put'}
              {scoreDetails?.recommended_strategy === 'covered_call' && 'Covered Call'}
              {scoreDetails?.recommended_strategy === 'long_call' && 'Long Call'}
            </div>
            <p className="text-sm text-blue-200 mt-1">
              Basée sur l'analyse des scores de valorisation, qualité et momentum
            </p>
          </div>

          {/* Score Methodology */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Méthodologie de Scoring</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-purple-400 font-medium mb-2">Valorisation (35%)</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• P/E Z-Score vs historique</li>
                  <li>• EV/EBITDA vs secteur</li>
                  <li>• PEG ratio (croissance/prix)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-green-400 font-medium mb-2">Qualité (25%)</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• ROE ≥ 8% (rentabilité)</li>
                  <li>• ROIC (efficacité capital)</li>
                  <li>• Marges et cash flow</li>
                </ul>
              </div>
              <div>
                <h4 className="text-yellow-400 font-medium mb-2">Momentum (20%)</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• Performances 3M/6M/12M</li>
                  <li>• Tendance MA50 vs MA200</li>
                  <li>• Momentum relatif secteur</li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-400 font-medium mb-2">Sentiment & Liquidité (20%)</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• Performance relative</li>
                  <li>• IV Rank pour options</li>
                  <li>• Volume et liquidité</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {scoreDetails?.last_updated && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              Dernière mise à jour: {new Date(scoreDetails?.last_updated)?.toLocaleString('fr-CH')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}