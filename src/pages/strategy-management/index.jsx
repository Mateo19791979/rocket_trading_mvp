import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';

const StrategyManagement = () => {
  const [filters, setFilters] = useState({
    strategy: 'All Strategies',
    status: 'All Statuses',
    timeframe: 'Last Hour',
    sortBy: 'Total P&L'
  });

  // 7 trading agents exactly as described
  const tradingAgents = [
    {
      id: 1,
      name: "Execution Master",
      status: "Active",
      trades: 0,
      winRate: 0.0,
      totalPnL: 0.00,
      avgTrade: 0.00,
      number: "#1"
    },
    {
      id: 2,
      name: "Quant Master",
      status: "Active", 
      trades: 0,
      winRate: 0.0,
      totalPnL: 0.00,
      avgTrade: 0.00,
      number: "#2"
    },
    {
      id: 3,
      name: "Pairs Trading AI",
      status: "Active",
      trades: 0,
      winRate: 0.0,
      totalPnL: 0.00,
      avgTrade: 0.00,
      number: "#3"
    },
    {
      id: 4,
      name: "Epsilon Risk Manager",
      status: "Active",
      trades: 0,
      winRate: 0.0,
      totalPnL: 0.00,
      avgTrade: 0.00,
      number: "#4"
    },
    {
      id: 5,
      name: "Alpha Momentum Pro",
      status: "Active",
      trades: 0,
      winRate: 0.0,
      totalPnL: 0.00,
      avgTrade: 0.00,
      number: "#5"
    },
    {
      id: 6,
      name: "Correlation Engine",
      status: "Active",
      trades: 0,
      winRate: 0.0,
      totalPnL: 0.00,
      avgTrade: 0.00,
      number: "#6"
    },
    {
      id: 7,
      name: "Volatility Surfer",
      status: "Active",
      trades: 0,
      winRate: 0.0,
      totalPnL: 0.00,
      avgTrade: 0.00,
      number: "#7"
    }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      strategy: 'All Strategies',
      status: 'All Statuses',
      timeframe: 'Last Hour',
      sortBy: 'Total P&L'
    });
  };

  return (
    <>
      <Helmet>
        <title>Strategy Management - Trading Command Center</title>
        <meta name="description" content="Strategy management interface with trading agents and intelligence reports" />
      </Helmet>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Filters Section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-6">Filters</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Strategy</label>
                  <select 
                    value={filters?.strategy}
                    onChange={(e) => handleFilterChange('strategy', e?.target?.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option>All Strategies</option>
                    <option>Momentum</option>
                    <option>Mean Reversion</option>
                    <option>Arbitrage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select 
                    value={filters?.status}
                    onChange={(e) => handleFilterChange('status', e?.target?.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Paused</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Timeframe</label>
                  <select 
                    value={filters?.timeframe}
                    onChange={(e) => handleFilterChange('timeframe', e?.target?.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option>Last Hour</option>
                    <option>Last 24h</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <select 
                    value={filters?.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e?.target?.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option>Total P&amp;L</option>
                    <option>Win Rate</option>
                    <option>Total Trades</option>
                    <option>Avg Trade</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">Active filters</span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">Sort</button>
                </div>
                <button 
                  onClick={clearFilters}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* Trading Agents List */}
            <div className="mb-8">
              <div className="space-y-4">
                {tradingAgents?.map((agent) => (
                  <div key={agent?.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Icon name="Bot" size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{agent?.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              agent?.status === 'Active' ?'bg-green-900 text-green-300 border border-green-700' :'bg-red-900 text-red-300 border border-red-700'
                            }`}>
                              {agent?.status}
                            </span>
                            <span className="text-gray-400 text-sm">{agent?.number}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Trades</div>
                          <div className="text-lg font-semibold">{agent?.trades}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Win Rate: {agent?.winRate}%</div>
                          <div className="text-lg font-semibold">${agent?.totalPnL?.toFixed(2)} Total P&amp;L</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">${agent?.avgTrade?.toFixed(2)} Avg Trade</div>
                          <div className="text-lg font-semibold">{agent?.winRate}% Win Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Activity */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Real-time Activity</h2>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="text-center py-8">
                  <Icon name="Activity" size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              </div>
            </div>

            {/* Daily Intelligence Report */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Rapport Intelligence Quotidien</h2>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">10/10/2025 (Utilisation des données de démonstration)</h3>
                  <button className="text-blue-400 hover:text-blue-300">Détails</button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">normal</div>
                    <div className="text-2xl font-bold text-green-400">€3.45</div>
                    <div className="text-xs text-gray-500">Coût journalier</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">1 250</div>
                    <div className="text-lg font-semibold">Appels API</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">excellente</div>
                    <div className="text-2xl font-bold text-green-400">87.3%</div>
                    <div className="text-xs text-gray-500">IQS moyen</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">stable</div>
                    <div className="text-2xl font-bold text-blue-400">91.2%</div>
                    <div className="text-xs text-gray-500">DFI moyen</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Counters */}
            <div className="mb-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">4</div>
                  <div className="text-sm text-gray-400">Agents Actifs</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">142</div>
                  <div className="text-sm text-gray-400">Tâches Réussies</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">3</div>
                  <div className="text-sm text-gray-400">Tâches Échouées</div>
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Actions Recommendées</h2>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="CheckCircle" size={20} className="text-green-400" />
                    <span className="text-gray-300">Optimiser les paramètres de l'agent Quant Master</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="AlertTriangle" size={20} className="text-yellow-400" />
                    <span className="text-gray-300">Surveiller la corrélation des paires de trading</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Icon name="TrendingUp" size={20} className="text-blue-400" />
                    <span className="text-gray-300">Augmenter l'allocation pour Alpha Momentum Pro</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default StrategyManagement;