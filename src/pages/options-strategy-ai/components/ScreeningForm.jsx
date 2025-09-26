import React, { useState } from 'react';
import { Filter, Play, Info } from 'lucide-react';

export default function ScreeningForm({ filters, onApplyFilters, loading, screeningMode }) {
  const [formData, setFormData] = useState(filters);
  const [showTooltip, setShowTooltip] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onApplyFilters?.(formData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const sectors = [
    { value: '', label: 'Tous les secteurs' },
    { value: 'Technology', label: 'Technologie' },
    { value: 'Healthcare', label: 'Santé' },
    { value: 'Financial Services', label: 'Services Financiers' },
    { value: 'Consumer Cyclical', label: 'Consommation Cyclique' },
    { value: 'Industrials', label: 'Industriels' },
    { value: 'Energy', label: 'Énergie' },
    { value: 'Utilities', label: 'Services Publics' }
  ];

  const strategies = [
    { value: '', label: 'Toutes les stratégies' },
    { value: 'bull_call_spread', label: 'Bull Call Spread' },
    { value: 'cash_secured_put', label: 'Cash-Secured Put' },
    { value: 'covered_call', label: 'Covered Call' },
    { value: 'long_call', label: 'Long Call' }
  ];

  const tooltips = {
    marketCap: 'Capitalisation boursière minimale. Recommandé: 50M CHF pour assurer une liquidité suffisante.',
    score: 'Score composite basé sur la valorisation (35%), qualité (25%), momentum (20%), sentiment (10%), liquidité (10%).',
    sector: 'Filtrer par secteur d\'activité spécifique.',
    strategy: 'Type de stratégie d\'options recommandée par l\'IA.'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          <Filter className="w-5 h-5 inline mr-2" />
          Paramètres de Screening
        </h2>
      </div>
      {/* Mode Description */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          {screeningMode === 'rebound' && 'Recherche d\'actions sous-performantes mais sous-valorisées avec potentiel de rebond'}
          {screeningMode === 'quality-growth' && 'Recherche d\'actions de qualité avec forte croissance et momentum'}
          {screeningMode === 'all' && 'Analyse complète de tous les résultats disponibles'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Market Cap Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              Capitalisation Min (CHF)
              <button
                type="button"
                onMouseEnter={() => setShowTooltip('marketCap')}
                onMouseLeave={() => setShowTooltip('')}
                className="text-gray-400 hover:text-gray-300"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </label>
          {showTooltip === 'marketCap' && (
            <div className="absolute top-full left-0 z-10 mt-1 p-2 bg-gray-900 border border-gray-600 rounded text-xs text-gray-300 max-w-xs">
              {tooltips?.marketCap}
            </div>
          )}
          <input
            type="number"
            value={formData?.minMarketCap || ''}
            onChange={(e) => handleInputChange('minMarketCap', parseInt(e?.target?.value) || 0)}
            placeholder="50000000"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData?.minMarketCap ? formatCurrency(formData?.minMarketCap) : 'Aucune limite'}
          </div>
        </div>

        {/* Score Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              Score Composite Min
              <button
                type="button"
                onMouseEnter={() => setShowTooltip('score')}
                onMouseLeave={() => setShowTooltip('')}
                className="text-gray-400 hover:text-gray-300"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </label>
          {showTooltip === 'score' && (
            <div className="absolute top-full left-0 z-10 mt-1 p-2 bg-gray-900 border border-gray-600 rounded text-xs text-gray-300 max-w-xs">
              {tooltips?.score}
            </div>
          )}
          <input
            type="range"
            min="0"
            max="100"
            value={formData?.minScore || 70}
            onChange={(e) => handleInputChange('minScore', parseInt(e?.target?.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span className="text-white font-medium">{formData?.minScore || 70}</span>
            <span>100</span>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              Secteur
              <button
                type="button"
                onMouseEnter={() => setShowTooltip('sector')}
                onMouseLeave={() => setShowTooltip('')}
                className="text-gray-400 hover:text-gray-300"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </label>
          {showTooltip === 'sector' && (
            <div className="absolute top-full left-0 z-10 mt-1 p-2 bg-gray-900 border border-gray-600 rounded text-xs text-gray-300 max-w-xs">
              {tooltips?.sector}
            </div>
          )}
          <select
            value={formData?.sector || ''}
            onChange={(e) => handleInputChange('sector', e?.target?.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {sectors?.map((sector) => (
              <option key={sector?.value} value={sector?.value}>
                {sector?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Strategy Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              Stratégie Recommandée
              <button
                type="button"
                onMouseEnter={() => setShowTooltip('strategy')}
                onMouseLeave={() => setShowTooltip('')}
                className="text-gray-400 hover:text-gray-300"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </label>
          {showTooltip === 'strategy' && (
            <div className="absolute top-full left-0 z-10 mt-1 p-2 bg-gray-900 border border-gray-600 rounded text-xs text-gray-300 max-w-xs">
              {tooltips?.strategy}
            </div>
          )}
          <select
            value={formData?.strategy || ''}
            onChange={(e) => handleInputChange('strategy', e?.target?.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {strategies?.map((strategy) => (
              <option key={strategy?.value} value={strategy?.value}>
                {strategy?.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Filters for specific modes */}
        {screeningMode === 'rebound' && (
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Filtres Value Rebound</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• P/E Z-Score ≤ -0.5</div>
              <div>• ROE ≥ 8%</div>
              <div>• Performance vs secteur ≤ -5%</div>
            </div>
          </div>
        )}

        {screeningMode === 'quality-growth' && (
          <div className="p-3 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Filtres Quality Growth</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <div>• Score Qualité ≥ 80</div>
              <div>• Score Momentum ≥ 75</div>
              <div>• ROE ≥ 15%</div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Screening en cours...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Lancer le Screening
            </div>
          )}
        </button>
      </form>
      {/* Info Box */}
      <div className="mt-6 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
        <h3 className="text-sm font-medium text-blue-300 mb-1">Pipeline IA en 6 étapes</h3>
        <div className="text-xs text-blue-200 space-y-1">
          <div>1. Univers CA≥50M + liquidité</div>
          <div>2. Détection sous-performance 6-12m</div>
          <div>3. Valorisation PER z-score</div>
          <div>4. Qualité ROE≥8% + marges</div>
          <div>5. Momentum MA50&gt;MA200</div>
          <div>6. Score composite final</div>
        </div>
      </div>
    </div>
  );
}