import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Filter, BarChart3, Eye, Target, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import optionsStrategyService from '../../services/optionsStrategyService.js';

export default function IAStrategiesBrancher() {
  const { user } = useAuth();
  const [screeningResults, setScreeningResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minMarketCap: 50000000, // 50M CHF minimum
    maxPEZScore: -0.3, // P/E Z-Score maximum (undervalued)
    minROE: 0.12, // ROE minimum 12%
    maxUnderperformance: -0.03, // Maximum underperformance vs sector
    minScore: 65 // Minimum composite score
  });

  useEffect(() => {
    if (user) {
      loadStrategiesBrancher();
    }
  }, [user]);

  const loadStrategiesBrancher = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Custom query for IA Strategies Brancher criteria
      const results = await optionsStrategyService?.runValueReboundScreening({
        maxPEZScore: filters?.maxPEZScore,
        minROE: filters?.minROE,
        maxUnderperformance: filters?.maxUnderperformance,
        minScore: filters?.minScore,
        minMarketCap: filters?.minMarketCap
      });
      
      // Filter for high market cap stocks (>50M CHF equivalent)
      const filteredResults = results?.filter(result => 
        result?.market_cap && result?.market_cap >= 50000000
      ) || [];
      
      setScreeningResults(filteredResults);
    } catch (err) {
      setError(`Erreur lors du screening: ${err?.message || 'Erreur inconnue'}`);
      setScreeningResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStockSelect = async (stock) => {
    if (!stock?.symbol) return;
    
    setSelectedStock(stock);
    setLoading(true);
    
    try {
      const optionsStrategies = await optionsStrategyService?.getOptionsTrades(
        stock?.symbol, 
        '6m', 
        'rebound'
      );
      setStrategies(optionsStrategies || []);
    } catch (err) {
      console.error('Error loading strategies:', err);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPaperTrading = async (strategy) => {
    try {
      const result = await optionsStrategyService?.sendToPaperTrading(strategy);
      
      if (result?.success) {
        alert(`✅ Stratégie envoyée vers Paper Trading (${result?.orders?.length} ordres)`);
      }
    } catch (err) {
      setError(`Erreur envoi Paper Trading: ${err?.message}`);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    if (value >= 1000000000) return `${(value / 1000000000)?.toFixed(1)}B CHF`;
    if (value >= 1000000) return `${(value / 1000000)?.toFixed(0)}M CHF`;
    return `${value?.toLocaleString()} CHF`;
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100)?.toFixed(1)}%`;
  };

  // Preview mode for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              IA Stratégies Brancher
            </h1>
            <p className="text-gray-400">
              Screening automatique: Actions &gt;50M capitalisation, P/E sous-valorisé, sous-performance temporaire
            </p>
          </div>
          
          {/* Preview Mode Banner */}
          <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-blue-300 font-semibold">Mode Aperçu - IA Stratégies Brancher</h3>
                <p className="text-blue-200 text-sm">
                  Connectez-vous pour accéder au screening IA spécialisé dans les opportunités de rebond sur grandes capitalisations
                </p>
              </div>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <Target className="w-5 h-5 inline mr-2" />
                Critères de Screening
              </h3>
              <div className="space-y-3 opacity-60">
                <div className="flex justify-between">
                  <span className="text-gray-400">Capitalisation Min:</span>
                  <span className="text-white">50M CHF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">P/E Z-Score Max:</span>
                  <span className="text-orange-400">-0.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ROE Minimum:</span>
                  <span className="text-green-400">12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sous-perf Max:</span>
                  <span className="text-red-400">-3%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Opportunités Identifiées
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 text-gray-300">Symbole</th>
                      <th className="text-left py-2 text-gray-300">Cap. Marché</th>
                      <th className="text-left py-2 text-gray-300">P/E Z-Score</th>
                      <th className="text-left py-2 text-gray-300">ROE</th>
                      <th className="text-left py-2 text-gray-300">Score</th>
                    </tr>
                  </thead>
                  <tbody className="opacity-50">
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-white">NESN.SW</td>
                      <td className="py-2 text-blue-400">285B CHF</td>
                      <td className="py-2 text-orange-400">-0.8</td>
                      <td className="py-2 text-green-400">18.5%</td>
                      <td className="py-2 text-green-400">78.2</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 text-white">NOVN.SW</td>
                      <td className="py-2 text-blue-400">198B CHF</td>
                      <td className="py-2 text-orange-400">-0.4</td>
                      <td className="py-2 text-green-400">15.3%</td>
                      <td className="py-2 text-green-400">75.8</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-sm mt-4 text-center">
                Connectez-vous pour accéder au screening complet et aux stratégies d'options
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            IA Stratégies Brancher
          </h1>
          <p className="text-gray-400">
            Screening spécialisé: Grandes capitalisations (&gt;50M CHF) sous-valorisées avec potentiel de rebond
          </p>
        </div>

        {/* Screening Criteria Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Cap. Marché Min</span>
            </div>
            <span className="text-lg font-semibold text-white">50M CHF</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-400">P/E Z-Score</span>
            </div>
            <span className="text-lg font-semibold text-white">{'< -0.3'}</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">ROE Min</span>
            </div>
            <span className="text-lg font-semibold text-white">12%</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Résultats</span>
            </div>
            <span className="text-lg font-semibold text-white">{screeningResults?.length || 0}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={loadStrategiesBrancher}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
              loading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' :'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Search className="w-4 h-4" />
            {loading ? 'Scanning...' : 'Lancer Screening IA'}
          </button>
          
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filtres actifs: 5</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-600 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results Table */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Opportunités Détectées ({screeningResults?.length || 0})
              </h2>
              
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Analyse des marchés en cours...</span>
                </div>
              )}

              {!loading && screeningResults?.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>Aucune opportunité trouvée avec les critères actuels</p>
                  <p className="text-sm mt-2">Essayez d'ajuster les paramètres de screening</p>
                </div>
              )}

              {!loading && screeningResults?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 text-gray-300">Symbole</th>
                        <th className="text-left py-3 text-gray-300">Cap. Marché</th>
                        <th className="text-left py-3 text-gray-300">P/E Z-Score</th>
                        <th className="text-left py-3 text-gray-300">ROE</th>
                        <th className="text-left py-3 text-gray-300">Score IA</th>
                        <th className="text-left py-3 text-gray-300">Stratégie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {screeningResults?.map((result, index) => (
                        <tr 
                          key={index}
                          className={`border-b border-gray-700 hover:bg-gray-750 cursor-pointer ${
                            selectedStock?.symbol === result?.symbol ? 'bg-blue-900/30' : ''
                          }`}
                          onClick={() => handleStockSelect(result)}
                        >
                          <td className="py-3">
                            <div>
                              <div className="font-semibold text-white">{result?.symbol}</div>
                              <div className="text-sm text-gray-400">{result?.name}</div>
                            </div>
                          </td>
                          <td className="py-3 text-blue-400">{formatCurrency(result?.market_cap)}</td>
                          <td className="py-3">
                            <span className={`font-medium ${
                              result?.pe_zscore < -0.5 ? 'text-green-400' : 
                              result?.pe_zscore < 0 ? 'text-orange-400' : 'text-red-400'
                            }`}>
                              {result?.pe_zscore?.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`font-medium ${
                              result?.roe >= 0.15 ? 'text-green-400' : 
                              result?.roe >= 0.10 ? 'text-orange-400' : 'text-red-400'
                            }`}>
                              {formatPercentage(result?.roe)}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                              result?.composite_score >= 80 ? 'bg-green-900 text-green-300' :
                              result?.composite_score >= 70 ? 'bg-blue-900 text-blue-300': 'bg-orange-900 text-orange-300'
                            }`}>
                              {result?.composite_score?.toFixed(1)}
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-blue-400 font-medium">
                              {result?.recommended_strategy?.replace(/_/g, ' ')?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Strategy Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Stratégies d'Options
              </h2>

              {!selectedStock && (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>Sélectionnez une action pour voir les stratégies d'options</p>
                </div>
              )}

              {selectedStock && (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">{selectedStock?.symbol}</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>Cap: {formatCurrency(selectedStock?.market_cap)}</div>
                      <div>ROE: {formatPercentage(selectedStock?.roe)}</div>
                      <div>Score: {selectedStock?.composite_score?.toFixed(1)}</div>
                    </div>
                  </div>

                  {loading && (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-400">Génération stratégies...</span>
                    </div>
                  )}

                  {!loading && strategies?.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <p className="text-sm">Aucune stratégie d'options disponible</p>
                    </div>
                  )}

                  {!loading && strategies?.map((strategy, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-white">
                          {strategy?.strategy_type?.replace(/_/g, ' ')?.toUpperCase()}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {strategy?.expiration_date}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-300 space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span>Max Profit:</span>
                          <span className="text-green-400">
                            ${strategy?.max_profit?.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Loss:</span>
                          <span className="text-red-400">
                            ${Math.abs(strategy?.max_loss)?.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Break Even:</span>
                          <span className="text-blue-400">
                            ${strategy?.break_even?.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mb-3">{strategy?.reason}</p>
                      
                      <button
                        onClick={() => handleSendToPaperTrading(strategy)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Envoyer vers Paper Trading
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}