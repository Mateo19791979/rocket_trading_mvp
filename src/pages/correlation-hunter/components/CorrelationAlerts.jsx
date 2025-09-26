import React, { useState } from 'react';
import { Bell, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const CorrelationAlerts = ({ correlationData, selectedAssets }) => {
  const [alertThreshold, setAlertThreshold] = useState(0.8);
  const [alertType, setAlertType] = useState('threshold');

  if (!correlationData?.matrix || !selectedAssets?.length) {
    return null;
  }

  // Find correlation opportunities and risks
  const analyzeCorrelations = () => {
    const opportunities = [];
    const risks = [];
    const strongCorrelations = [];

    selectedAssets?.forEach(asset1 => {
      selectedAssets?.forEach(asset2 => {
        if (asset1?.id !== asset2?.id) {
          const correlation = correlationData?.matrix?.[asset1?.id]?.[asset2?.id];
          
          if (correlation !== undefined && Math.abs(correlation) >= alertThreshold) {
            const item = {
              asset1: asset1?.symbol,
              asset2: asset2?.symbol,
              correlation: correlation,
              strength: Math.abs(correlation)
            };

            strongCorrelations?.push(item);

            if (correlation > alertThreshold) {
              // High positive correlation could be diversification risk
              risks?.push({
                ...item,
                type: 'diversification_risk',
                message: `High positive correlation may reduce diversification benefits`
              });
            } else if (correlation < -alertThreshold) {
              // Strong negative correlation could be hedging opportunity
              opportunities?.push({
                ...item,
                type: 'hedging_opportunity',
                message: `Strong negative correlation suggests potential hedging relationship`
              });
            }
          }
        }
      });
    });

    return { opportunities, risks, strongCorrelations };
  };

  const { opportunities, risks, strongCorrelations } = analyzeCorrelations();

  const getCorrelationIcon = (correlation) => {
    if (correlation > 0.5) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (correlation < -0.5) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold">Correlation Insights & Alerts</h2>
      </div>
      {/* Alert Configuration */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Alert Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correlation Threshold
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseFloat(e?.target?.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.1</span>
              <span className="text-white font-medium">{alertThreshold}</span>
              <span>1.0</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alert Type
            </label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e?.target?.value)}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="threshold">Threshold Breach</option>
              <option value="change">Correlation Change</option>
              <option value="divergence">Price Divergence</option>
            </select>
          </div>
        </div>
      </div>
      {/* Opportunities */}
      {opportunities?.length > 0 && (
        <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-400 mb-4 flex items-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Hedging Opportunities ({opportunities?.length})</span>
          </h3>
          <div className="space-y-3">
            {opportunities?.slice(0, 5)?.map((opportunity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getCorrelationIcon(opportunity?.correlation)}
                  <div>
                    <div className="font-medium text-white">
                      {opportunity?.asset1} ↔ {opportunity?.asset2}
                    </div>
                    <div className="text-sm text-green-300">
                      {opportunity?.message}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    {opportunity?.correlation?.toFixed(3)}
                  </div>
                  <div className="text-xs text-green-300">
                    {(opportunity?.strength * 100)?.toFixed(1)}% strength
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Risks */}
      {risks?.length > 0 && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-400 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Diversification Risks ({risks?.length})</span>
          </h3>
          <div className="space-y-3">
            {risks?.slice(0, 5)?.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getCorrelationIcon(risk?.correlation)}
                  <div>
                    <div className="font-medium text-white">
                      {risk?.asset1} ↔ {risk?.asset2}
                    </div>
                    <div className="text-sm text-red-300">
                      {risk?.message}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-400">
                    {risk?.correlation?.toFixed(3)}
                  </div>
                  <div className="text-xs text-red-300">
                    {(risk?.strength * 100)?.toFixed(1)}% strength
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* All Strong Correlations */}
      {strongCorrelations?.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-300 mb-4">
            All Strong Correlations (≥{alertThreshold})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strongCorrelations?.slice(0, 10)?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getCorrelationIcon(item?.correlation)}
                  <span className="font-medium text-white">
                    {item?.asset1} ↔ {item?.asset2}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    item?.correlation > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item?.correlation?.toFixed(3)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* No Alerts */}
      {opportunities?.length === 0 && risks?.length === 0 && strongCorrelations?.length === 0 && (
        <div className="text-center py-8 text-gray-400 bg-gray-700/50 rounded-lg">
          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-600" />
          <p>No correlation alerts at current threshold ({alertThreshold})</p>
          <p className="text-sm">Try lowering the threshold to see more correlations</p>
        </div>
      )}
    </div>
  );
};

export default CorrelationAlerts;