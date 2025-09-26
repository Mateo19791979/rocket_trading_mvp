import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, Download, Search, Filter, Play, Pause, BarChart3, TrendingUp, Activity, Settings, Copy, ExternalLink } from 'lucide-react';
import Header from '../../components/ui/Header';

export default function RegistryV01StrategyCatalogue() {
  const [strategies, setStrategies] = useState([]);
  const [optionsStrategies, setOptionsStrategies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState('registry');

  useEffect(() => {
    loadStrategiesData();
  }, []);

  const loadStrategiesData = async () => {
    try {
      setLoading(true);
      
      // Load AI agent strategies
      const { data: agentStrategies, error: agentError } = await supabase?.from('ai_agents')?.select(`
          id,
          name,
          strategy,
          description,
          win_rate,
          total_pnl,
          total_trades,
          configuration,
          risk_parameters,
          performance_metrics,
          agent_status,
          agent_category,
          created_at
        `)?.order('created_at', { ascending: false });

      if (agentError) throw agentError;

      // Load options strategies
      const { data: optionsData, error: optionsError } = await supabase?.from('options_strategies')?.select(`
          id,
          strategy_type,
          strategy_legs,
          max_profit,
          max_loss,
          risk_parameters,
          break_even_points,
          entry_date,
          expiration_date,
          created_at,
          assets:asset_id(symbol, name)
        `)?.order('created_at', { ascending: false });

      if (optionsError) throw optionsError;

      setStrategies(agentStrategies || []);
      setOptionsStrategies(optionsData || []);
      
      // Set default selected strategy for YAML display
      if (agentStrategies?.length > 0) {
        setSelectedStrategy(agentStrategies?.[0]);
      }
      
    } catch (err) {
      console.log('Strategy loading error:', err);
      setError('Failed to load strategies. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  const getStrategyCategories = () => {
    const categories = [
      { id: 'all', name: 'All Strategies', count: strategies?.length + optionsStrategies?.length },
      { id: 'technical', name: 'Technical & Options', count: strategies?.filter(s => ['momentum', 'mean_reversion', 'arbitrage']?.includes(s?.strategy))?.length + optionsStrategies?.length },
      { id: 'macro', name: 'Macro & Sentiment', count: strategies?.filter(s => ['scalping', 'swing']?.includes(s?.strategy))?.length },
      { id: 'islamic', name: 'Islamic Finance', count: 0 }
    ];
    return categories;
  };

  const getFilteredStrategies = () => {
    let filtered = [...strategies];
    
    if (selectedCategory === 'technical') {
      filtered = strategies?.filter(s => ['momentum', 'mean_reversion', 'arbitrage']?.includes(s?.strategy));
    } else if (selectedCategory === 'macro') {
      filtered = strategies?.filter(s => ['scalping', 'swing']?.includes(s?.strategy));
    }
    
    if (searchTerm) {
      filtered = filtered?.filter(s => 
        s?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        s?.strategy?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        s?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }
    
    return filtered;
  };

  const generateYAMLContent = (strategy) => {
    if (!strategy) return '';

    const yamlContent = `name: ${strategy?.name?.replace(/\s+/g, '_')}
strategy: ${strategy?.strategy}
description: "${strategy?.description || 'AI trading strategy'}"

rules:
  buy: "${generateBuyRule(strategy?.strategy)}"
  sell: "${generateSellRule(strategy?.strategy)}"

instruments: [${getInstruments(strategy?.strategy)}]
timeframe: daily

risk:
  max_dd: ${strategy?.risk_parameters?.max_drawdown || 0.15}
  vol_target: ${strategy?.risk_parameters?.volatility_target || 0.20}
  position_size: ${strategy?.risk_parameters?.position_size || 0.05}
  max_positions: ${strategy?.configuration?.max_positions || 3}

performance:
  win_rate: ${(strategy?.win_rate || 0) / 100}
  total_trades: ${strategy?.total_trades || 0}
  total_pnl: ${strategy?.total_pnl || 0}

parameters:
  ${generateParameters(strategy)}

status: ${strategy?.agent_status || 'inactive'}
created_at: ${strategy?.created_at}`;

    return yamlContent;
  };

  const generateBuyRule = (strategyType) => {
    const rules = {
      momentum: 'Close > MA(20) AND RSI(14) > 50 AND Volume > AvgVolume(20) * 1.5',
      mean_reversion: 'Close <= LowerBB(20,2) AND RSI(14) < 30',
      arbitrage: 'SpreadRatio > 1.02 AND CorrelationCoeff < 0.8',
      scalping: 'MA(5) > MA(10) AND MACD_Signal = BUY',
      swing: 'Close > Resistance AND RSI(14) > 60'
    };
    return rules?.[strategyType] || 'Custom entry conditions';
  };

  const generateSellRule = (strategyType) => {
    const rules = {
      momentum: 'Close < MA(20) OR RSI(14) < 40 OR StopLoss(2%)',
      mean_reversion: 'Close >= UpperBB(20,2) OR RSI(14) > 70',
      arbitrage: 'SpreadRatio < 1.01 OR TimeToExpiry < 1D',
      scalping: 'ProfitTarget(0.5%) OR StopLoss(0.2%)',
      swing: 'Close < Support OR RSI(14) < 40'
    };
    return rules?.[strategyType] || 'Custom exit conditions';
  };

  const getInstruments = (strategyType) => {
    const instruments = {
      momentum: 'equities, etfs',
      mean_reversion: 'equities, forex',
      arbitrage: 'futures, options',
      scalping: 'forex, crypto',
      swing: 'equities, commodities'
    };
    return instruments?.[strategyType] || 'equities';
  };

  const generateParameters = (strategy) => {
    const config = strategy?.configuration || {};
    let params = '';
    
    if (config?.lookback_period) params += `  lookback_period: ${config?.lookback_period}\n`;
    if (config?.risk_per_trade) params += `  risk_per_trade: ${config?.risk_per_trade}\n`;
    if (config?.max_positions) params += `  max_positions: ${config?.max_positions}\n`;
    if (config?.holding_period) params += `  holding_period: ${config?.holding_period}\n`;
    
    return params || '  # No specific parameters configured';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Registry v0.1 — Strategy Catalogue
              </h1>
              <p className="text-gray-400">
                Extrait ({strategies?.length + optionsStrategies?.length} sur 20 livres) • prêt pour Orchestrateur
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            {new Date()?.toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une stratégie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {getStrategyCategories()?.map(category => (
              <button
                key={category?.id}
                onClick={() => setSelectedCategory(category?.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category?.id
                    ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category?.name} ({category?.count})
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Strategy Categories */}
          <div className="space-y-6">
            {/* Technical & Options Strategies */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  📚 Stratégies techniques &amp; options
                </h3>
              </div>
              
              <div className="space-y-3">
                {getFilteredStrategies()?.filter(s => ['momentum', 'mean_reversion', 'arbitrage']?.includes(s?.strategy))?.map(strategy => (
                  <div 
                    key={strategy?.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedStrategy?.id === strategy?.id
                        ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white flex items-center space-x-2">
                        <span>• {strategy?.name}</span>
                        <span className="text-xs text-gray-400">({strategy?.total_trades || 0}/0)</span>
                      </h4>
                      <div className="flex items-center space-x-2">
                        {strategy?.agent_status === 'active' ? (
                          <Play className="w-4 h-4 text-green-400" />
                        ) : (
                          <Pause className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {strategy?.strategy === 'momentum' ? '— trend following' :
                       strategy?.strategy === 'mean_reversion' ? '— contrarian' :
                       strategy?.strategy === 'arbitrage' ? '— statistical arbitrage' :
                       `— ${strategy?.strategy}`}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Win: {Math.round(strategy?.win_rate || 0)}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>P&L: ${Math.round(strategy?.total_pnl || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Options Strategies */}
                {optionsStrategies?.map(strategy => (
                  <div 
                    key={`option-${strategy?.id}`}
                    className="p-4 rounded-lg border bg-gray-700 border-gray-600 hover:border-gray-500 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">
                        • {strategy?.strategy_type?.replace('_', ' ')?.toUpperCase()}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                        Options
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>Max P: ${Math.round(strategy?.max_profit || 0)}</span>
                      <span>Max L: ${Math.round(Math.abs(strategy?.max_loss || 0))}</span>
                      <span>{strategy?.assets?.symbol || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Macro & Sentiment */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-semibold text-white">
                  🌍 Macro &amp; Sentiment
                </h3>
              </div>
              
              <div className="space-y-3">
                {getFilteredStrategies()?.filter(s => ['scalping', 'swing']?.includes(s?.strategy))?.map(strategy => (
                  <div 
                    key={strategy?.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selectedStrategy?.id === strategy?.id
                        ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">
                        • {strategy?.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {strategy?.agent_status === 'active' ? (
                          <Play className="w-4 h-4 text-green-400" />
                        ) : (
                          <Pause className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      — {strategy?.strategy === 'scalping' ? 'high frequency trading' : 'swing trading'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Win: {Math.round(strategy?.win_rate || 0)}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>P&L: ${Math.round(strategy?.total_pnl || 0)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mock Macro Strategies */}
                <div className="p-4 rounded-lg border bg-gray-700 border-gray-600">
                  <h4 className="font-medium text-white mb-2">• FX Carry Trade — différentiels de taux</h4>
                  <div className="text-xs text-gray-400">Status: Coming Soon</div>
                </div>
                <div className="p-4 rounded-lg border bg-gray-700 border-gray-600">
                  <h4 className="font-medium text-white mb-2">• Sentiment News Scorer — score &gt; 0.7 / &lt; 0.3</h4>
                  <div className="text-xs text-gray-400">Status: Coming Soon</div>
                </div>
                <div className="p-4 rounded-lg border bg-gray-700 border-gray-600">
                  <h4 className="font-medium text-white mb-2">• Risk Parity Portfolio — w ∝ 1/vol</h4>
                  <div className="text-xs text-gray-400">Status: Coming Soon</div>
                </div>
              </div>
            </div>

            {/* Islamic Finance Compliance */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">
                  🕌 Conformité Finance islamique
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg border bg-gray-700 border-gray-600">
                  <h4 className="font-medium text-white mb-2">
                    • Islamic Equity Screen — ratios &amp; exclusions Sharia
                  </h4>
                  <p className="text-sm text-gray-300">
                    • Intégrable comme filtre/overlay
                  </p>
                  <div className="text-xs text-gray-400 mt-2">Status: Available as Filter</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - YAML Metadata */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-semibold text-white">
                    🧾 Métadonnées (exemple YAML)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => copyToClipboard(generateYAMLContent(selectedStrategy))}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Copy YAML"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Export"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600 overflow-hidden">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto">
                  {selectedStrategy ? generateYAMLContent(selectedStrategy) : `name: Bollinger_RSI_Contrarian
strategy: mean_reversion
description: "Bollinger Bands + RSI contrarian strategy"

rules:
  buy: "Close <= LowerBB(20,2) AND RSI(14) < 30"
  sell: "Close >= UpperBB(20,2) OR RSI(14) > 70"

instruments: [equities, forex]
timeframe: daily

risk:
  max_dd: 0.15
  vol_target: 0.20
  position_size: 0.05
  max_positions: 3

performance:
  win_rate: 0.00
  total_trades: 0
  total_pnl: 0

parameters:
  # No specific parameters configured

status: inactive`}
                </pre>
              </div>
            </div>

            {/* Strategy Performance Chart Placeholder */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                📊 Performance Overview
              </h3>
              
              {selectedStrategy ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-xl font-semibold text-white">
                        {Math.round(selectedStrategy?.win_rate || 0)}%
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Total P&L</div>
                      <div className={`text-xl font-semibold ${
                        (selectedStrategy?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${Math.round(selectedStrategy?.total_pnl || 0)}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Total Trades</div>
                      <div className="text-xl font-semibold text-white">
                        {selectedStrategy?.total_trades || 0}
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="text-sm text-gray-400">Status</div>
                      <div className={`text-sm font-medium ${
                        selectedStrategy?.agent_status === 'active' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {selectedStrategy?.agent_status || 'inactive'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">Strategy Description</div>
                    <div className="text-white">
                      {selectedStrategy?.description || 'No description available'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Select a strategy to view performance details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}