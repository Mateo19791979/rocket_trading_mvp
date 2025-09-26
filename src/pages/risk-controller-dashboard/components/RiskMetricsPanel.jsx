import React from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';

const RiskMetricsPanel = ({ portfolioRisk, riskMetrics, isLoading = false }) => {
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
      currency: 'USD'
    })?.format(value);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.00%';
    return `${value > 0 ? '+' : ''}${value?.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pnlPercent = portfolioRisk?.totalValue 
    ? ((portfolioRisk?.totalPnL || 0) / portfolioRisk?.totalValue) * 100 
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Risk Metrics</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(portfolioRisk?.riskLevel)}`}>
          {portfolioRisk?.riskLevel?.toUpperCase() || 'LOW'} RISK
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Portfolio Value */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">PORTFOLIO</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(portfolioRisk?.totalValue)}
          </div>
          <div className="text-sm text-blue-700">
            {portfolioRisk?.positionCount || 0} positions
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className={`border rounded-lg p-4 ${
          (portfolioRisk?.totalPnL || 0) >= 0 
            ? 'bg-green-50 border-green-200' :'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            {(portfolioRisk?.totalPnL || 0) >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-xs font-medium ${
              (portfolioRisk?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              P&L
            </span>
          </div>
          <div className={`text-2xl font-bold ${
            (portfolioRisk?.totalPnL || 0) >= 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            {formatCurrency(portfolioRisk?.totalPnL)}
          </div>
          <div className={`text-sm ${
            (portfolioRisk?.totalPnL || 0) >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatPercentage(pnlPercent)}
          </div>
        </div>

        {/* VaR 95% */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">VaR 95%</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(riskMetrics?.var_95 || 0)}
          </div>
          <div className="text-sm text-purple-700">1-day risk</div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">DRAWDOWN</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {formatPercentage(riskMetrics?.max_drawdown || 0)}
          </div>
          <div className="text-sm text-orange-700">Maximum</div>
        </div>
      </div>

      {/* Risk Ratios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1">Sharpe Ratio</h4>
          <p className="text-2xl font-bold text-gray-900">
            {riskMetrics?.sharpe_ratio?.toFixed(2) || '0.00'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1">Beta</h4>
          <p className="text-2xl font-bold text-gray-900">
            {riskMetrics?.beta?.toFixed(2) || '0.00'}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1">Volatility</h4>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(riskMetrics?.volatility || 0)}
          </p>
        </div>
      </div>

      {portfolioRisk?.riskLevel === 'extreme' && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              Extreme risk detected! Consider activating killswitch or reducing positions.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMetricsPanel;