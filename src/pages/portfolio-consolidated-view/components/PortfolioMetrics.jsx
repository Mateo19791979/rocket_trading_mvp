import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Shield } from 'lucide-react';

const PortfolioMetrics = ({ portfolio, riskMetrics }) => {
  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(value);
  };

  const formatPercent = (value) => {
    if (!value) return '0.00%';
    return `${parseFloat(value)?.toFixed(2)}%`;
  };

  const getPerformanceColor = (value) => {
    if (!value) return 'text-gray-400';
    return parseFloat(value) >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getPerformanceIcon = (value) => {
    if (!value) return <BarChart3 className="h-5 w-5" />;
    return parseFloat(value) >= 0 ? 
      <TrendingUp className="h-5 w-5" /> : 
      <TrendingDown className="h-5 w-5" />;
  };

  if (!portfolio) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">
          No portfolio data available
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Equity',
      value: formatCurrency(portfolio?.total_value),
      icon: <DollarSign className="h-5 w-5 text-blue-500" />,
      description: `Cash: ${formatCurrency(portfolio?.cash_balance)}`
    },
    {
      title: 'Unrealized P&L',
      value: formatCurrency(portfolio?.unrealized_pnl),
      icon: getPerformanceIcon(portfolio?.unrealized_pnl),
      color: getPerformanceColor(portfolio?.unrealized_pnl),
      description: formatPercent(
        portfolio?.total_cost > 0 ? 
          (portfolio?.unrealized_pnl / portfolio?.total_cost) * 100 : 0
      )
    },
    {
      title: 'Daily Performance',
      value: formatPercent(portfolio?.performance_1d),
      icon: getPerformanceIcon(portfolio?.performance_1d),
      color: getPerformanceColor(portfolio?.performance_1d),
      description: formatCurrency(
        portfolio?.total_value * (portfolio?.performance_1d || 0) / 100
      )
    },
    {
      title: 'Monthly Performance',
      value: formatPercent(portfolio?.performance_1m),
      icon: getPerformanceIcon(portfolio?.performance_1m),
      color: getPerformanceColor(portfolio?.performance_1m),
      description: formatCurrency(
        portfolio?.total_value * (portfolio?.performance_1m || 0) / 100
      )
    }
  ];

  const riskMetricCards = [
    {
      title: 'Sharpe Ratio',
      value: riskMetrics?.sharpe_ratio ? parseFloat(riskMetrics?.sharpe_ratio)?.toFixed(2) : 'N/A',
      icon: <Shield className="h-5 w-5 text-purple-500" />,
      description: 'Risk-adjusted returns'
    },
    {
      title: 'Max Drawdown',
      value: riskMetrics?.max_drawdown ? 
        `${Math.abs(parseFloat(riskMetrics?.max_drawdown))?.toFixed(2)}%` : 'N/A',
      icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      description: 'Maximum peak-to-trough decline'
    },
    {
      title: 'Volatility',
      value: riskMetrics?.volatility ? 
        `${parseFloat(riskMetrics?.volatility)?.toFixed(2)}%` : 'N/A',
      icon: <BarChart3 className="h-5 w-5 text-yellow-500" />,
      description: 'Annualized volatility'
    },
    {
      title: 'Risk Score',
      value: portfolio?.risk_score ? parseFloat(portfolio?.risk_score)?.toFixed(1) : 'N/A',
      icon: <Shield className="h-5 w-5 text-orange-500" />,
      description: 'Overall risk assessment'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics?.map((metric, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 mb-2">
                  {metric?.title}
                </p>
                <p className={`text-2xl font-bold ${metric?.color || 'text-white'}`}>
                  {metric?.value}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {metric?.description}
                </p>
              </div>
              <div className={metric?.color || 'text-gray-400'}>
                {metric?.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Risk Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-500" />
          Risk-Adjusted Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskMetricCards?.map((metric, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-400">
                  {metric?.title}
                </p>
                {metric?.icon}
              </div>
              <p className="text-xl font-bold text-white mb-1">
                {metric?.value}
              </p>
              <p className="text-xs text-gray-500">
                {metric?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioMetrics;