import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

const PortfolioMetrics = ({ metrics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)]?.map((_, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-6 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-400">
        No metrics available
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value || 0);
  };

  const formatPercentage = (value) => {
    const isPositive = (value || 0) >= 0;
    return {
      value: `${isPositive ? '+' : ''}${(value || 0)?.toFixed(2)}%`,
      isPositive
    };
  };

  const metricsData = [
    {
      label: 'Total Value',
      value: formatCurrency(metrics?.totalValue),
      icon: DollarSign,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30'
    },
    {
      label: 'Total Return',
      value: formatPercentage(metrics?.totalReturn)?.value,
      icon: formatPercentage(metrics?.totalReturn)?.isPositive ? TrendingUp : TrendingDown,
      color: formatPercentage(metrics?.totalReturn)?.isPositive ? 'text-green-400' : 'text-red-400',
      bgColor: formatPercentage(metrics?.totalReturn)?.isPositive ? 'bg-green-900/30' : 'bg-red-900/30'
    },
    {
      label: 'Unrealized P&L',
      value: formatCurrency(metrics?.totalUnrealizedPnL),
      icon: (metrics?.totalUnrealizedPnL || 0) >= 0 ? TrendingUp : TrendingDown,
      color: (metrics?.totalUnrealizedPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: (metrics?.totalUnrealizedPnL || 0) >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'
    },
    {
      label: 'Positions',
      value: metrics?.positionCount?.toString() || '0',
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricsData?.map((metric, index) => (
        <div key={index} className={`${metric?.bgColor} rounded-lg p-4 border border-gray-700`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{metric?.label}</span>
            <metric.icon className={`h-5 w-5 ${metric?.color}`} />
          </div>
          <div className={`text-xl font-bold ${metric?.color}`}>
            {metric?.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioMetrics;