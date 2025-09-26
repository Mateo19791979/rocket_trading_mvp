import React from 'react';
import { Shield, AlertTriangle, TrendingDown, BarChart3 } from 'lucide-react';

const RiskAnalytics = ({ riskMetrics, portfolio }) => {
  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'extreme': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score <= 3) return 'text-green-500';
    if (score <= 6) return 'text-yellow-500';
    if (score <= 8) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatPercent = (value) => {
    return value ? `${parseFloat(value)?.toFixed(2)}%` : 'N/A';
  };

  const formatRatio = (value) => {
    return value ? parseFloat(value)?.toFixed(2) : 'N/A';
  };

  const riskScore = parseFloat(portfolio?.risk_score || 0);
  const riskLevel = riskMetrics?.risk_level || 'unknown';

  const metrics = [
    {
      title: 'Risk Score',
      value: riskScore?.toFixed(1),
      color: getRiskScoreColor(riskScore),
      icon: <Shield className="h-5 w-5" />,
      description: `${riskLevel?.charAt(0)?.toUpperCase() + riskLevel?.slice(1)} risk level`
    },
    {
      title: 'Value at Risk (95%)',
      value: riskMetrics?.var_95 ? `$${Math.abs(parseFloat(riskMetrics?.var_95))?.toFixed(0)}` : 'N/A',
      color: 'text-red-500',
      icon: <AlertTriangle className="h-5 w-5" />,
      description: '1-day 95% confidence'
    },
    {
      title: 'Expected Shortfall',
      value: riskMetrics?.expected_shortfall ? 
        `$${Math.abs(parseFloat(riskMetrics?.expected_shortfall))?.toFixed(0)}` : 'N/A',
      color: 'text-orange-500',
      icon: <TrendingDown className="h-5 w-5" />,
      description: 'Expected loss beyond VaR'
    },
    {
      title: 'Beta',
      value: riskMetrics?.beta ? formatRatio(riskMetrics?.beta) : 'N/A',
      color: parseFloat(riskMetrics?.beta || 0) > 1 ? 'text-red-500' : 'text-green-500',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Market sensitivity'
    }
  ];

  const ratios = [
    {
      label: 'Sharpe Ratio',
      value: formatRatio(riskMetrics?.sharpe_ratio),
      good: parseFloat(riskMetrics?.sharpe_ratio || 0) > 1
    },
    {
      label: 'Sortino Ratio',
      value: formatRatio(riskMetrics?.sortino_ratio),
      good: parseFloat(riskMetrics?.sortino_ratio || 0) > 1
    },
    {
      label: 'Calmar Ratio',
      value: formatRatio(riskMetrics?.calmar_ratio),
      good: parseFloat(riskMetrics?.calmar_ratio || 0) > 0.5
    }
  ];

  const sectorExposure = riskMetrics?.sector_exposure || {};
  const topSectors = Object.entries(sectorExposure)?.sort(([,a], [,b]) => b - a)?.slice(0, 5);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-blue-500" />
        Risk Analytics
      </h3>
      <div className="space-y-6">
        {/* Risk Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics?.map((metric, index) => (
            <div key={index} className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-400">{metric?.title}</p>
                <div className={metric?.color}>{metric?.icon}</div>
              </div>
              <p className={`text-lg font-bold ${metric?.color}`}>
                {metric?.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metric?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Risk-Adjusted Returns */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Risk-Adjusted Returns
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {ratios?.map((ratio, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-400 mb-1">{ratio?.label}</p>
                <p className={`text-sm font-semibold ${
                  ratio?.good ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {ratio?.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Concentration */}
        {topSectors?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              Sector Exposure
            </h4>
            <div className="space-y-2">
              {topSectors?.map(([sector, percentage], index) => (
                <div key={sector} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 capitalize">
                    {sector || 'Unknown'}
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-white min-w-12 text-right">
                      {percentage?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Level Indicator */}
        <div className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Overall Risk Assessment</p>
              <p className={`text-lg font-semibold ${getRiskLevelColor(riskLevel)}`}>
                {riskLevel?.charAt(0)?.toUpperCase() + riskLevel?.slice(1)} Risk
              </p>
            </div>
            <div className={`text-2xl font-bold ${getRiskScoreColor(riskScore)}`}>
              {riskScore?.toFixed(1)}/10
            </div>
          </div>
          {riskScore > 7 && (
            <p className="text-xs text-yellow-400 mt-2">
              ⚠️ High risk portfolio - consider rebalancing
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskAnalytics;