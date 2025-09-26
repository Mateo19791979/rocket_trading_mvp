import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3 } from 'lucide-react';

function RegimeStatePanel({ regime }) {
  const [expanded, setExpanded] = useState(false);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      return date?.toLocaleTimeString();
    } catch {
      return 'Invalid';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend?.toLowerCase()) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'sideways':
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRegimeColor = (regimeType) => {
    switch (regimeType?.toLowerCase()) {
      case 'stable': case'low_volatility':
        return 'text-green-400';
      case 'volatile': case'high_volatility':
        return 'text-yellow-400';
      case 'neutral':
        return 'text-gray-400';
      default:
        return 'text-blue-400';
    }
  };

  const getVolatilityLevel = (volatility) => {
    if (!volatility || typeof volatility !== 'number') return 'Unknown';
    
    if (volatility < 0.01) return 'Very Low';
    if (volatility < 0.02) return 'Low';
    if (volatility < 0.04) return 'Medium';
    if (volatility < 0.06) return 'High';
    return 'Very High';
  };

  const regimeData = regime?.regime || regime?.data?.regime;

  if (!regime || regime?.status === 'no_data') {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold">Market Regime</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center text-gray-400">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No regime data available</p>
            <p className="text-xs mt-1">Waiting for regime detector...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold">Market Regime</h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Main Regime Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Regime</p>
            <p className={`text-lg font-semibold capitalize ${getRegimeColor(regimeData?.regime)}`}>
              {regimeData?.regime || 'Unknown'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Trend</p>
            <div className="flex items-center justify-end space-x-2">
              {getTrendIcon(regimeData?.trend)}
              <span className="text-lg font-semibold capitalize">
                {regimeData?.trend || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Volatility */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Volatility</span>
            <span className="text-sm font-medium">
              {getVolatilityLevel(regimeData?.volatility)}
            </span>
          </div>
          
          {regimeData?.volatility !== undefined && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  regimeData?.volatility < 0.02 
                    ? 'bg-green-500' 
                    : regimeData?.volatility < 0.04
                    ? 'bg-yellow-500' :'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(regimeData?.volatility * 1000, 100)}%`
                }}
              ></div>
            </div>
          )}
          
          {regimeData?.volatility !== undefined && (
            <p className="text-xs text-gray-400 mt-1">
              {(regimeData?.volatility * 100)?.toFixed(2)}%
            </p>
          )}
        </div>

        {/* Confidence & Update Time */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-400">Confidence: </span>
            <span className="font-medium">
              {regimeData?.confidence 
                ? `${(regimeData?.confidence * 100)?.toFixed(0)}%`
                : 'N/A'
              }
            </span>
          </div>
          <div>
            <span className="text-gray-400">Updated: </span>
            <span className="font-medium">
              {formatTimestamp(regimeData?.last_update || regime?.timestamp)}
            </span>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && regimeData?.symbol_details && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Symbol Analysis</h4>
            <div className="space-y-2">
              {Object.entries(regimeData?.symbol_details)?.map(([symbol, details]) => (
                <div key={symbol} className="bg-gray-700/50 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{symbol}</span>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(details?.trend)}
                      <span className="text-xs capitalize">{details?.trend || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>
                      <span>Regime: </span>
                      <span className={getRegimeColor(details?.regime)}>
                        {details?.regime || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span>Vol: </span>
                      <span>
                        {details?.volatility 
                          ? `${(details?.volatility * 100)?.toFixed(2)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Additional Metrics</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {regimeData?.symbols_analyzed && (
                <div>
                  <p className="text-gray-400">Symbols Analyzed</p>
                  <p className="font-medium">{regimeData?.symbols_analyzed}</p>
                </div>
              )}
              
              {regimeData?.trend_strength !== undefined && (
                <div>
                  <p className="text-gray-400">Trend Strength</p>
                  <p className="font-medium">{regimeData?.trend_strength?.toFixed(4)}</p>
                </div>
              )}
              
              {regimeData?.mean_return !== undefined && (
                <div>
                  <p className="text-gray-400">Mean Return</p>
                  <p className={`font-medium ${
                    regimeData?.mean_return > 0 ? 'text-green-400' : 
                    regimeData?.mean_return < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {(regimeData?.mean_return * 100)?.toFixed(3)}%
                  </p>
                </div>
              )}
              
              {regimeData?.data_points && (
                <div>
                  <p className="text-gray-400">Data Points</p>
                  <p className="font-medium">{regimeData?.data_points}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegimeStatePanel;