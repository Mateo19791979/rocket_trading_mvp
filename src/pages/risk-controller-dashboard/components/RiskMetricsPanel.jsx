import React from 'react';
import { TrendingDown, AlertTriangle, BarChart3, Clock, Zap } from 'lucide-react';

const RiskMetricsPanel = ({ portfolioRisk, riskMetrics, isLoading = false, onForceRecalculation }) => {
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'extreme':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.00%';
    return `${value > 0 ? '+' : ''}${value?.toFixed(2)}%`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date?.toLocaleDateString();
  };

  // Enhanced force recalculation button function
  const handleForceRecalculation = async () => {
    if (typeof onForceRecalculation === 'function') {
      await onForceRecalculation();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pnlPercent = portfolioRisk?.totalValue 
    ? ((portfolioRisk?.totalPnL || 0) / portfolioRisk?.totalValue) * 100 
    : 0;

  const isVarAlertActive = portfolioRisk?.var99Alert || riskMetrics?.alert_triggered;
  const isFreshCalculation = riskMetrics?.is_fresh_calculation;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">Risk Controller — VaR / CVaR</h2>
          {isFreshCalculation && (
            <div className="flex items-center text-green-600 text-sm">
              <Zap className="h-4 w-4 mr-1" />
              Live
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {riskMetrics?.calculated_at && (
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {getTimeAgo(riskMetrics?.calculated_at)}
            </div>
          )}
          <button
            onClick={handleForceRecalculation}
            disabled={isLoading}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium hover:bg-purple-200 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Calcul...' : 'Recalculer'}
          </button>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(portfolioRisk?.riskLevel)}`}>
            {portfolioRisk?.riskLevel?.toUpperCase() || 'LOW'} RISK
          </div>
        </div>
      </div>
      {/* VaR Alert Banner */}
      {isVarAlertActive && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">🚨 Risque critique détecté !</h3>
              <p className="text-sm text-red-700">
                La VaR 99% indique une perte potentielle supérieure à 5% du capital total.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Portfolio Value */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">💰 ÉQUITY TOTALE</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(portfolioRisk?.totalValue || riskMetrics?.total_equity || 0)}
          </div>
          <div className="text-sm text-blue-700">
            {portfolioRisk?.positionCount || 0} positions
          </div>
        </div>

        {/* VaR 95% */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">📊 VaR 95%</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(riskMetrics?.var_95 || 0)}
          </div>
          <div className="text-sm text-purple-700">Perte max journalière</div>
        </div>

        {/* VaR 99% */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="text-xs text-red-600 font-medium">📉 VaR 99%</span>
          </div>
          <div className="text-2xl font-bold text-red-900">
            {formatCurrency(riskMetrics?.var_99 || 0)}
          </div>
          <div className="text-sm text-red-700">Scénario extrême</div>
        </div>

        {/* CVaR 95% (Expected Shortfall) */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">⚠️ CVaR 95%</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {formatCurrency(riskMetrics?.cvar_95 || 0)}
          </div>
          <div className="text-sm text-orange-700">Expected Shortfall</div>
        </div>
      </div>
      {/* Enhanced Risk Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current Portfolio Performance */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Performance Actuelle</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">P&L Non Réalisé</span>
              <span className={`font-semibold ${
                (portfolioRisk?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(portfolioRisk?.totalPnL || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Performance %</span>
              <span className={`font-semibold ${
                pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(pnlPercent)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Niveau de Risque</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(portfolioRisk?.riskLevel)}`}>
                {portfolioRisk?.riskLevel?.toUpperCase() || 'LOW'}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Ratios */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Métriques de Risque Avancées</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">CVaR 99%</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(riskMetrics?.cvar_99 || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Positions Surveillées</span>
              <span className="font-semibold text-gray-900">
                {portfolioRisk?.positionCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dernière Mise à Jour</span>
              <span className="font-semibold text-gray-900 text-xs">
                {getTimeAgo(riskMetrics?.calculated_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced System Status with Test Button */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              <strong>Risk Controller:</strong> Mode continu activé
            </span>
            <span className="text-gray-700">
              <strong>Calculs VaR/CVaR:</strong> {riskMetrics ? '✅ Actifs' : '⚠️ En attente'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${riskMetrics ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-gray-600">
                {riskMetrics ? 'Surveillance active' : 'Initialisation...'}
              </span>
            </div>
            <button
              onClick={() => window.open(`${window.location?.origin}/correlation-hunter`, '_blank')}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
            >
              Test Correlation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMetricsPanel;