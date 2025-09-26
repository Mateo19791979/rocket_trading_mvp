import React from 'react';
import { Shield, AlertTriangle, TrendingUp, Target } from 'lucide-react';

const RiskAnalytics = ({ riskMetrics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)]?.map((_, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded mb-3"></div>
            <div className="h-8 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!riskMetrics) {
    return (
      <div className="text-center py-8 text-gray-400">
        No risk analytics available
      </div>
    );
  }

  const getRiskLevel = (concentration) => {
    if (concentration >= 50) return { level: 'High', color: 'text-red-400', bgColor: 'bg-red-900/30' };
    if (concentration >= 30) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' };
    return { level: 'Low', color: 'text-green-400', bgColor: 'bg-green-900/30' };
  };

  const getDiversificationRating = (score) => {
    if (score >= 80) return { rating: 'Excellent', color: 'text-green-400' };
    if (score >= 60) return { rating: 'Good', color: 'text-blue-400' };
    if (score >= 40) return { rating: 'Fair', color: 'text-yellow-400' };
    return { rating: 'Poor', color: 'text-red-400' };
  };

  const assetRisk = getRiskLevel(riskMetrics?.maxAssetConcentration || 0);
  const sectorRisk = getRiskLevel(riskMetrics?.maxSectorConcentration || 0);
  const diversificationRating = getDiversificationRating(riskMetrics?.diversificationScore || 0);

  const riskCards = [
    {
      title: 'Asset Concentration Risk',
      value: `${(riskMetrics?.maxAssetConcentration || 0)?.toFixed(1)}%`,
      description: `Largest single position`,
      risk: assetRisk,
      icon: Target,
      details: `${riskMetrics?.numberOfAssets || 0} total assets`
    },
    {
      title: 'Sector Concentration Risk',
      value: `${(riskMetrics?.maxSectorConcentration || 0)?.toFixed(1)}%`,
      description: `Largest sector allocation`,
      risk: sectorRisk,
      icon: Shield,
      details: `${riskMetrics?.numberOfSectors || 0} sectors represented`
    },
    {
      title: 'Diversification Score',
      value: `${riskMetrics?.diversificationScore || 0}/100`,
      description: `Portfolio diversification`,
      risk: {
        level: diversificationRating?.rating,
        color: diversificationRating?.color,
        bgColor: diversificationRating?.color?.replace('text-', 'bg-')?.replace('-400', '-900/30')
      },
      icon: TrendingUp,
      details: 'Based on asset and sector spread'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {riskCards?.map((card, index) => (
          <div key={index} className={`${card?.risk?.bgColor} rounded-lg p-6 border border-gray-600`}>
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`h-6 w-6 ${card?.risk?.color}`} />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${card?.risk?.bgColor} ${card?.risk?.color} border border-current`}>
                {card?.risk?.level}
              </span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-white">{card?.title}</h4>
              <div className={`text-2xl font-bold ${card?.risk?.color}`}>{card?.value}</div>
              <p className="text-sm text-gray-400">{card?.description}</p>
              <p className="text-xs text-gray-500">{card?.details}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Risk Recommendations */}
      <div className="bg-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          <h4 className="text-lg font-semibold text-white">Risk Management Recommendations</h4>
        </div>
        
        <div className="space-y-4">
          {/* Asset Concentration Recommendations */}
          {(riskMetrics?.maxAssetConcentration || 0) > 25 && (
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-400">High Asset Concentration</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    Your largest position represents {(riskMetrics?.maxAssetConcentration || 0)?.toFixed(1)}% of your portfolio. 
                    Consider reducing concentration to below 20% to minimize single-asset risk.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sector Concentration Recommendations */}
          {(riskMetrics?.maxSectorConcentration || 0) > 30 && (
            <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-orange-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-orange-400">Sector Over-concentration</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    {(riskMetrics?.maxSectorConcentration || 0)?.toFixed(1)}% allocation in your largest sector. 
                    Consider diversifying across more sectors to reduce sector-specific risks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Diversification Recommendations */}
          {(riskMetrics?.diversificationScore || 0) < 60 && (
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-400">Improve Diversification</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    Your diversification score is {riskMetrics?.diversificationScore || 0}/100. 
                    Consider adding positions in different assets and sectors to improve risk-adjusted returns.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Good Portfolio Message */}
          {(riskMetrics?.maxAssetConcentration || 0) <= 25 && 
           (riskMetrics?.maxSectorConcentration || 0) <= 30 && 
           (riskMetrics?.diversificationScore || 0) >= 60 && (
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-400">Well-Diversified Portfolio</h5>
                  <p className="text-sm text-gray-300 mt-1">
                    Your portfolio shows good diversification with balanced asset and sector allocations. 
                    Continue monitoring concentration levels as your portfolio grows.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Risk Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">Total Assets</div>
          <div className="text-lg font-bold text-white">{riskMetrics?.numberOfAssets || 0}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">Sectors</div>
          <div className="text-lg font-bold text-white">{riskMetrics?.numberOfSectors || 0}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">Max Asset %</div>
          <div className="text-lg font-bold text-blue-400">
            {(riskMetrics?.maxAssetConcentration || 0)?.toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-gray-400">Max Sector %</div>
          <div className="text-lg font-bold text-purple-400">
            {(riskMetrics?.maxSectorConcentration || 0)?.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalytics;