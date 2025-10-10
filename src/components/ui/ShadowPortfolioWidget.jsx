import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Coins, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { getShadowPortfolios } from "@/lib/jsonFetch";

const ShadowPortfolioWidget = () => {
  const { isMockMode } = useAuth();
  const [shadowPortfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(0);

  useEffect(() => {
    fetchShadowPortfolios();
  }, []);

  const fetchShadowPortfolios = async () => {
    if (loading) return; // Prevent duplicate calls

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching shadow portfolios with fallback...');

      const result = await getShadowPortfolios();
      
      console.log('✅ Shadow portfolios loaded:', result?.length || 0, 'items');
      setPortfolios(result || []);

    } catch (err) {
      console.error('❌ Shadow portfolio fetch failed:', err);
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    })?.format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0) >= 0 ? '+' : ''}${(value || 0)?.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement du portefeuille virtuel...</span>
        </div>
      </div>
    );
  }

  if (error && shadowPortfolios?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32 text-red-600">
          <Activity className="h-8 w-8 mr-2" />
          <div className="text-center">
            <span>{error}</span>
            {isMockMode && (
              <div className="mt-2 text-sm text-orange-600 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Mode démonstration - Données simulées
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (shadowPortfolios?.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <PieChart className="h-8 w-8 mr-2" />
          <div className="text-center">
            <span>Aucun portefeuille virtuel configuré</span>
            {isMockMode && (
              <div className="mt-2 text-sm text-orange-600 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Mode démonstration actif
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const portfolio = shadowPortfolios?.[selectedPortfolio];
  const positions = portfolio?.shadow_positions || [];
  const totalPnL = (portfolio?.shadow_unrealized_pnl || 0) + (portfolio?.shadow_realized_pnl || 0);
  const totalPnLPercentage = portfolio?.shadow_total_value > 0 
    ? (totalPnL / portfolio?.shadow_total_value) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Portefeuille Virtuel (Paper)
              </h3>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {isMockMode ? 'Démonstration' : 'Simulation'}
            </span>
            {isMockMode && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Données simulées
              </span>
            )}
          </div>
          
          {shadowPortfolios?.length > 1 && (
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(parseInt(e?.target?.value))}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {shadowPortfolios?.map((p, index) => (
                <option key={p?.id} value={index}>
                  {p?.portfolios?.name || `Portefeuille ${index + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {/* Portfolio Overview */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Value */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Valeur Totale</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(portfolio?.shadow_total_value)}
                </p>
              </div>
            </div>
          </div>

          {/* Cash Balance */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Liquidités</p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(portfolio?.shadow_cash_balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Unrealized PnL */}
          <div className={`bg-gradient-to-r rounded-lg p-4 ${
            (portfolio?.shadow_unrealized_pnl || 0) >= 0 
              ? 'from-green-50 to-emerald-50' :'from-red-50 to-rose-50'
          }`}>
            <div className="flex items-center">
              {(portfolio?.shadow_unrealized_pnl || 0) >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">P&L Latent</p>
                <p className={`text-lg font-bold ${
                  (portfolio?.shadow_unrealized_pnl || 0) >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {formatCurrency(portfolio?.shadow_unrealized_pnl)}
                </p>
              </div>
            </div>
          </div>

          {/* Total PnL */}
          <div className={`bg-gradient-to-r rounded-lg p-4 ${
            totalPnL >= 0 
              ? 'from-green-50 to-emerald-50' :'from-red-50 to-rose-50'
          }`}>
            <div className="flex items-center">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">P&L Total</p>
                <p className={`text-lg font-bold ${
                  totalPnL >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {formatCurrency(totalPnL)}
                </p>
                <p className={`text-xs ${
                  totalPnL >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {formatPercentage(totalPnLPercentage)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Positions Table */}
        {positions?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Positions (Paper)
              {isMockMode && <span className="text-orange-600 ml-2">- Données simulées</span>}
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbole
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix Moyen
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix Actuel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valeur
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions?.map((position, index) => {
                    const currentValue = position?.quantity * (position?.current_price || position?.avg_price);
                    const pnl = position?.unrealized_pnl || ((position?.current_price || position?.avg_price) - position?.avg_price) * position?.quantity;
                    const pnlPercentage = position?.avg_price > 0 
                      ? (((position?.current_price || position?.avg_price) - position?.avg_price) / position?.avg_price) * 100 
                      : 0;

                    return (
                      <tr key={`${position?.symbol}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {position?.symbol}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {position?.quantity?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(position?.avg_price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(position?.current_price || position?.avg_price)}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                          pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(pnl)}
                          <br />
                          <span className="text-xs">
                            ({formatPercentage(pnlPercentage)})
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(currentValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Dernière mise à jour: {new Date(portfolio?.last_updated || portfolio?.updated_at)?.toLocaleString('fr-FR')}
          {isMockMode && (
            <span className="text-orange-500 ml-2">
              (Mode démonstration - Données simulées)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShadowPortfolioWidget;