import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertCircle, Brain, Target, Database } from 'lucide-react';
import PipelineBooksService from '../../../services/pipelineBooksService';

const SwissMarketVolatilityPanel = () => {
  const [volatilityData, setVolatilityData] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSwissMarketData();
  }, []);

  const loadSwissMarketData = async () => {
    try {
      const [volatilityResponse, patternsResponse, strategiesResponse, aiResponse] = await Promise.all([
        PipelineBooksService?.getSwissMarketVolatilityData(),
        PipelineBooksService?.getSwissMarketPatterns(), 
        PipelineBooksService?.getVolatilityCorrelationStrategies(),
        PipelineBooksService?.getSwissMarketAiAnalysis()
      ]);

      if (!volatilityResponse?.error) {
        // Transform data for chart visualization
        const chartData = volatilityResponse?.data?.reduce((acc, item) => {
          const date = new Date(item?.timestamp)?.toISOString()?.split('T')?.[0];
          const existing = acc?.find(d => d?.date === date);
          
          if (existing) {
            if (item?.metric_type === 'vsmi') existing.vsmi = item?.volatility_value;
            if (item?.metric_type === 'smi') existing.smi = item?.volatility_value;
            if (item?.metric_type === 'correlation') existing.correlation = item?.correlation_value;
          } else {
            acc?.push({
              date,
              timestamp: item?.timestamp,
              vsmi: item?.metric_type === 'vsmi' ? item?.volatility_value : null,
              smi: item?.metric_type === 'smi' ? item?.volatility_value : null,
              correlation: item?.metric_type === 'correlation' ? item?.correlation_value : null,
              data_source: item?.data_source
            });
          }
          return acc;
        }, [])?.sort((a, b) => new Date(a?.timestamp) - new Date(b?.timestamp));

        setVolatilityData(chartData);
      }

      if (!patternsResponse?.error) {
        setPatterns(patternsResponse?.data);
      }

      if (!strategiesResponse?.error) {
        setStrategies(strategiesResponse?.data);
      }

      if (!aiResponse?.error && aiResponse?.data) {
        setAiAnalysis(aiResponse?.data);
      }
    } catch (error) {
      console.error('Error loading Swiss market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr)?.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' });
  };

  const getPeriodColor = (periodName) => {
    switch (periodName) {
      case 'Crisis Period 2001-2002': return 'bg-red-500/20 border-red-400/30';
      case 'Bull Market 2003-2007': return 'bg-green-500/20 border-green-400/30';
      case 'Financial Crisis 2008-2009': return 'bg-orange-500/20 border-orange-400/30';
      case 'Recovery Period 2010-2013': return 'bg-blue-500/20 border-blue-400/30';
      default: return 'bg-gray-500/20 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl mr-4 shadow-lg">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Données Marché Suisse VSMI/SMI</h2>
          <p className="text-white/80">Analyse de volatilité et corrélation pour IA (2000-2013)</p>
        </div>
      </div>
      {/* Include the provided image */}
      <div className="mb-8">
        <div className="bg-white/20 rounded-xl p-4 border border-white/20">
          <img 
            src="/assets/images/image-1759050211493.png" 
            alt="Comparatif historique entre VSMI et SMI" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <p className="text-white/90 text-sm mt-3 text-center font-medium">
            🔍 Graphique de référence : Corrélation inverse VSMI (volatilité) vs SMI (performance) • Source: Finance-elearning.ch
          </p>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-white/20 pb-4">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Database },
          { id: 'patterns', label: 'Patterns IA', icon: Brain },
          { id: 'strategies', label: 'Stratégies', icon: Target }
        ]?.map(tab => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab?.id
                ? 'bg-white/30 text-white border border-white/40' :'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab?.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* AI Analysis Summary */}
          {aiAnalysis && (
            <div className="bg-black/30 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-300" />
                Résumé IA - Pipeline Livres
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white/70 text-sm">Points de données</p>
                  <p className="text-2xl font-bold text-white">{aiAnalysis?.total_data_points || 0}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white/70 text-sm">Stratégies extraites</p>
                  <p className="text-2xl font-bold text-white">{aiAnalysis?.extracted_strategies || 0}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white/70 text-sm">Corrélation moyenne</p>
                  <p className="text-2xl font-bold text-white">
                    {aiAnalysis?.avg_correlation_strength ? 
                      `${(aiAnalysis?.avg_correlation_strength * 100)?.toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
              </div>
              
              {aiAnalysis?.ai_insights && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/5">
                  <p className="text-white/90 text-sm">
                    <strong>Insight Principal:</strong> {aiAnalysis?.ai_insights?.primary_insight}
                  </p>
                  <p className="text-white/70 text-xs mt-2">
                    Période: {aiAnalysis?.ai_insights?.data_period} • 
                    Corrélation: {aiAnalysis?.ai_insights?.correlation_range?.min} à {aiAnalysis?.ai_insights?.correlation_range?.max}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Volatility Chart */}
          <div className="bg-black/30 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Évolution VSMI vs SMI (Pipeline Data)</h3>
            {volatilityData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={volatilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#ffffff70"
                  />
                  <YAxis yAxisId="vsmi" orientation="left" stroke="#ff6b35" />
                  <YAxis yAxisId="smi" orientation="right" stroke="#3b82f6" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value, name) => [
                      value?.toFixed(2), 
                      name === 'vsmi' ? 'VSMI (Volatilité)' : name === 'smi' ? 'SMI (Index)' : name
                    ]}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  />
                  <Line
                    yAxisId="vsmi"
                    type="monotone"
                    dataKey="vsmi"
                    stroke="#ff6b35"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#ff6b35' }}
                    name="vsmi"
                  />
                  <Line
                    yAxisId="smi"
                    type="monotone"
                    dataKey="smi"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    name="smi"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-white/60">
                <AlertCircle className="w-8 h-8 mr-3" />
                Aucune donnée de volatilité disponible
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patterns?.map((pattern, index) => (
              <div key={index} className={`${getPeriodColor(pattern?.period_name)} rounded-xl p-6 border`}>
                <h3 className="text-lg font-semibold text-white mb-3">{pattern?.period_name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Volatilité moyenne</span>
                    <span className="text-white font-semibold">
                      {pattern?.avg_volatility ? `${pattern?.avg_volatility?.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Niveau marché moyen</span>
                    <span className="text-white font-semibold">
                      {pattern?.avg_market_level ? pattern?.avg_market_level?.toFixed(0) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">Force corrélation</span>
                    <span className="text-white font-semibold">
                      {pattern?.correlation_strength ? `${(pattern?.correlation_strength * 100)?.toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/20">
                    <span className="text-white/60 text-xs">
                      {pattern?.data_points_count} points de données analysés
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          {strategies?.length > 0 ? strategies?.map((strategy, index) => (
            <div key={index} className="bg-black/30 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{strategy?.strategy_name}</h3>
                  <p className="text-white/70 text-sm">{strategy?.book_library?.title}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-orange-500/30 text-orange-200 text-xs rounded-full border border-orange-400/30">
                    Volatilité
                  </span>
                  <span className="px-3 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full border border-blue-400/30">
                    {strategy?.confidence_score?.toFixed(1)}% confiance
                  </span>
                </div>
              </div>
              
              <p className="text-white/90 mb-4">{strategy?.strategy_description}</p>
              
              {strategy?.parameters && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Paramètres clés:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {Object?.entries(strategy?.parameters)?.map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-white/60 capitalize">{key?.replace(/_/g, ' ')}</span>
                        <span className="text-white">
                          {typeof value === 'object' ? JSON.stringify(value) : value?.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {strategy?.source_chapter && (
                <p className="text-white/50 text-xs mt-3">
                  Source: {strategy?.source_chapter}
                </p>
              )}
            </div>
          )) : (
            <div className="flex items-center justify-center h-32 text-white/60">
              <Target className="w-8 h-8 mr-3" />
              Aucune stratégie de volatilité extraite
            </div>
          )}
        </div>
      )}
      {/* Status Footer */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="flex items-center justify-between text-white/70 text-sm">
          <span>Données intégrées dans le pipeline livres pour utilisation par les IA</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Pipeline actif</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwissMarketVolatilityPanel;