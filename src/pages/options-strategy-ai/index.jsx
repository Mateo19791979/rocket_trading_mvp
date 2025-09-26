import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import optionsStrategyService from '../../services/optionsStrategyService.js';
import ScreeningForm from './components/ScreeningForm.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import StrategyPanel from './components/StrategyPanel.jsx';
import ScoreDetailsModal from './components/ScoreDetailsModal.jsx';
import IVRankModal from './components/IVRankModal.jsx';

export default function OptionsStrategyAI() {
  const { user } = useAuth();
  const [screeningResults, setScreeningResults] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [showIVRank, setShowIVRank] = useState(false);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [ivRankData, setIVRankData] = useState(null);
  const [screeningMode, setScreeningMode] = useState('rebound');
  const [filters, setFilters] = useState({
    minScore: 70,
    minMarketCap: 50000000, // 50M CHF
    sector: '',
    strategy: ''
  });

  // Load initial screening results
  useEffect(() => {
    loadScreeningResults();
  }, []);

  const loadScreeningResults = async (customFilters = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const activeFilters = customFilters || filters;
      let results = [];
      
      if (screeningMode === 'rebound') {
        results = await optionsStrategyService?.runValueReboundScreening({
          maxPEZScore: -0.5,
          minROE: 0.08,
          maxUnderperformance: -0.05,
          minScore: activeFilters?.minScore || 70
        });
      } else if (screeningMode === 'quality-growth') {
        results = await optionsStrategyService?.getBestQualityGrowthStocks({
          minQuality: 80,
          minMomentum: 75,
          minROE: 0.15,
          minScore: activeFilters?.minScore || 75
        });
      } else {
        results = await optionsStrategyService?.getScreeningResults(activeFilters);
      }
      
      setScreeningResults(results || []);
    } catch (err) {
      setError(`Erreur lors du chargement: ${err?.message || 'Erreur inconnue'}`);
      setScreeningResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelect = async (asset) => {
    if (!asset?.symbol) return;
    
    setSelectedAsset(asset);
    setStrategyLoading(true);
    setStrategies([]);
    
    try {
      const optionsStrategies = await optionsStrategyService?.getOptionsTrades(
        asset?.symbol, 
        '6m', 
        screeningMode === 'rebound' ? 'rebound' : 'growth'
      );
      setStrategies(optionsStrategies || []);
    } catch (err) {
      console.error('Error loading strategies:', err);
      setStrategies([]);
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleShowScoreDetails = async (symbol) => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      const details = await optionsStrategyService?.getScoreDetails(symbol);
      setScoreDetails(details);
      setShowScoreDetails(true);
    } catch (err) {
      setError(`Erreur lors du chargement des détails: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleShowIVRank = async (symbol) => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      const ivData = await optionsStrategyService?.getIVRank(symbol);
      setIVRankData(ivData);
      setShowIVRank(true);
    } catch (err) {
      setError(`Erreur lors du chargement IV Rank: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPaperTrading = async (strategy) => {
    try {
      setStrategyLoading(true);
      const result = await optionsStrategyService?.sendToPaperTrading(strategy);
      
      if (result?.success) {
        alert(`✅ Stratégie envoyée vers Paper Trading (${result?.orders?.length} ordres)`);
      }
    } catch (err) {
      setError(`Erreur envoi Paper Trading: ${err?.message}`);
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    loadScreeningResults(newFilters);
  };

  // Preview mode for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Options Strategy AI
            </h1>
            <p className="text-gray-400">
              Stratégies d'options automatiques basées sur l'analyse IA
            </p>
          </div>
          
          {/* Preview Mode Banner */}
          <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-blue-300 font-semibold">Mode Aperçu</h3>
                <p className="text-blue-200 text-sm">
                  Connectez-vous pour accéder au screening IA complet et aux stratégies d'options personnalisées
                </p>
              </div>
            </div>
          </div>

          {/* Demo Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Screening Form Preview */}
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Filter className="w-5 h-5 inline mr-2" />
                Paramètres de Screening
              </h2>
              <div className="space-y-4 opacity-50">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capitalisation Min (CHF)
                  </label>
                  <input 
                    type="number" 
                    disabled
                    placeholder="50,000,000"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Score Composite Min
                  </label>
                  <input 
                    type="number" 
                    disabled
                    placeholder="70"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <button 
                  disabled
                  className="w-full bg-blue-600/50 text-white py-2 px-4 rounded cursor-not-allowed"
                >
                  Lancer le Screening
                </button>
              </div>
            </div>

            {/* Results Preview */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Résultats du Screening
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 text-gray-300">Symbole</th>
                      <th className="text-left py-3 text-gray-300">Score</th>
                      <th className="text-left py-3 text-gray-300">P/E Z-Score</th>
                      <th className="text-left py-3 text-gray-300">ROE</th>
                      <th className="text-left py-3 text-gray-300">Stratégie</th>
                    </tr>
                  </thead>
                  <tbody className="opacity-50">
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white">AAPL</td>
                      <td className="py-3 text-green-400">78.5</td>
                      <td className="py-3 text-orange-400">-0.8</td>
                      <td className="py-3 text-green-400">28%</td>
                      <td className="py-3 text-blue-400">Bull Call Spread</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 text-white">MSFT</td>
                      <td className="py-3 text-green-400">82.3</td>
                      <td className="py-3 text-orange-400">-0.5</td>
                      <td className="py-3 text-green-400">32%</td>
                      <td className="py-3 text-blue-400">Cash-Secured Put</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-sm mt-4 text-center">
                Connectez-vous pour voir les résultats complets et les recommandations personnalisées
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
            Options Strategy AI
          </h1>
          <p className="text-gray-400">
            Identification automatique des actions sous-valorisées et génération de stratégies d'options
          </p>
        </div>

        {/* Screening Mode Selector */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setScreeningMode('rebound')}
            className={`px-4 py-2 rounded-lg font-medium ${
              screeningMode === 'rebound' ?'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Value Rebound
          </button>
          <button
            onClick={() => setScreeningMode('quality-growth')}
            className={`px-4 py-2 rounded-lg font-medium ${
              screeningMode === 'quality-growth' ?'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Quality Growth
          </button>
          <button
            onClick={() => setScreeningMode('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              screeningMode === 'all' ?'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Tous les résultats
          </button>
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

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Screening Form */}
          <div className="lg:col-span-1">
            <ScreeningForm
              filters={filters}
              onApplyFilters={handleApplyFilters}
              loading={loading}
              screeningMode={screeningMode}
            />
          </div>

          {/* Center Panel - Results Table */}
          <div className="lg:col-span-2">
            <ResultsTable
              results={screeningResults}
              loading={loading}
              onAssetSelect={handleAssetSelect}
              selectedAsset={selectedAsset}
              onShowScoreDetails={handleShowScoreDetails}
              onShowIVRank={handleShowIVRank}
            />
          </div>

          {/* Right Panel - Strategy Panel */}
          <div className="lg:col-span-1">
            <StrategyPanel
              selectedAsset={selectedAsset}
              strategies={strategies}
              loading={strategyLoading}
              onSendToPaperTrading={handleSendToPaperTrading}
            />
          </div>
        </div>

        {/* Modals */}
        {showScoreDetails && scoreDetails && (
          <ScoreDetailsModal
            scoreDetails={scoreDetails}
            onClose={() => setShowScoreDetails(false)}
          />
        )}

        {showIVRank && ivRankData && (
          <IVRankModal
            ivRankData={ivRankData}
            onClose={() => setShowIVRank(false)}
          />
        )}
      </div>
    </div>
  );
}