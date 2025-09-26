import React from 'react';

const CorrelationMatrix = ({ correlationData, selectedAssets }) => {
  if (!correlationData?.matrix || !selectedAssets?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No correlation data available
      </div>
    );
  }

  const getCorrelationColor = (correlation) => {
    const absCorr = Math.abs(correlation);
    
    if (absCorr >= 0.8) return correlation > 0 ? 'bg-green-600' : 'bg-red-600';
    if (absCorr >= 0.6) return correlation > 0 ? 'bg-green-500' : 'bg-red-500';
    if (absCorr >= 0.4) return correlation > 0 ? 'bg-green-400' : 'bg-red-400';
    if (absCorr >= 0.2) return correlation > 0 ? 'bg-green-300' : 'bg-red-300';
    return 'bg-gray-500';
  };

  const getCorrelationText = (correlation) => {
    if (Math.abs(correlation) >= 0.8) return 'text-white';
    if (Math.abs(correlation) >= 0.4) return 'text-white';
    return 'text-gray-900';
  };

  const formatCorrelation = (correlation) => {
    return correlation?.toFixed(3) || '0.000';
  };

  const getCorrelationInterpretation = (correlation) => {
    const absCorr = Math.abs(correlation);
    if (absCorr >= 0.8) return 'Very Strong';
    if (absCorr >= 0.6) return 'Strong';
    if (absCorr >= 0.4) return 'Moderate';
    if (absCorr >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  return (
    <div className="space-y-6">
      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="flex items-center mb-2">
            <div className="w-20 h-10 flex items-center justify-center text-sm font-medium text-gray-400">
              Assets
            </div>
            {selectedAssets?.map(asset => (
              <div 
                key={asset?.id}
                className="w-20 h-10 flex items-center justify-center text-xs font-medium text-gray-300 px-1"
                title={asset?.name}
              >
                {asset?.symbol}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {selectedAssets?.map(rowAsset => (
            <div key={rowAsset?.id} className="flex items-center mb-1">
              <div 
                className="w-20 h-10 flex items-center justify-center text-xs font-medium text-gray-300 px-1"
                title={rowAsset?.name}
              >
                {rowAsset?.symbol}
              </div>
              {selectedAssets?.map(colAsset => {
                const correlation = correlationData?.matrix?.[rowAsset?.id]?.[colAsset?.id] || 0;
                return (
                  <div
                    key={`${rowAsset?.id}-${colAsset?.id}`}
                    className={`w-20 h-10 flex items-center justify-center text-xs font-bold ${getCorrelationColor(correlation)} ${getCorrelationText(correlation)} border border-gray-600`}
                    title={`${rowAsset?.symbol} vs ${colAsset?.symbol}: ${formatCorrelation(correlation)} (${getCorrelationInterpretation(correlation)})`}
                  >
                    {formatCorrelation(correlation)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Correlation Strength</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span className="text-gray-400">Very Strong (≥0.8)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-400">Strong (0.6-0.8)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-gray-400">Moderate (0.4-0.6)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-300 rounded"></div>
              <span className="text-gray-400">Weak (0.2-0.4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-gray-400">Very Weak (&lt;0.2)</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Direction</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-400">Positive Correlation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-400">Negative Correlation</span>
            </div>
          </div>
        </div>
      </div>
      {/* Summary Statistics */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {(() => {
            const correlations = [];
            selectedAssets?.forEach(asset1 => {
              selectedAssets?.forEach(asset2 => {
                if (asset1?.id !== asset2?.id) {
                  const corr = correlationData?.matrix?.[asset1?.id]?.[asset2?.id];
                  if (corr !== undefined) {
                    correlations?.push({
                      pair: `${asset1?.symbol}-${asset2?.symbol}`,
                      value: corr
                    });
                  }
                }
              });
            });

            correlations?.sort((a, b) => Math.abs(b?.value) - Math.abs(a?.value));
            const strongestPositive = correlations?.find(c => c?.value > 0);
            const strongestNegative = correlations?.find(c => c?.value < 0);
            const averageCorrelation = correlations?.reduce((sum, c) => sum + Math.abs(c?.value), 0) / correlations?.length;

            return (
              <>
                <div>
                  <div className="text-gray-400">Strongest Positive</div>
                  <div className="text-green-400 font-medium">
                    {strongestPositive ? `${strongestPositive?.pair}: ${formatCorrelation(strongestPositive?.value)}` : 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Strongest Negative</div>
                  <div className="text-red-400 font-medium">
                    {strongestNegative ? `${strongestNegative?.pair}: ${formatCorrelation(strongestNegative?.value)}` : 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Average Strength</div>
                  <div className="text-blue-400 font-medium">
                    {formatCorrelation(averageCorrelation || 0)}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;