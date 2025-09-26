import React from 'react';
import { Clock } from 'lucide-react';

const TimeframeSelector = ({ selectedTimeframe, onTimeframeChange }) => {
  const timeframes = [
    { value: '1D', label: '1 Day', description: 'Intraday correlation' },
    { value: '1W', label: '1 Week', description: 'Short-term patterns' },
    { value: '1M', label: '1 Month', description: 'Medium-term trends' },
    { value: '3M', label: '3 Months', description: 'Quarterly analysis' },
    { value: '1Y', label: '1 Year', description: 'Long-term relationships' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <Clock className="h-6 w-6 text-purple-500" />
        <h2 className="text-xl font-semibold">Analysis Period</h2>
      </div>
      <div className="space-y-3">
        {timeframes?.map(timeframe => (
          <button
            key={timeframe?.value}
            onClick={() => onTimeframeChange?.(timeframe?.value)}
            className={`w-full p-4 rounded-lg border transition-all ${
              selectedTimeframe === timeframe?.value
                ? 'bg-purple-600 border-purple-500 text-white' :'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="text-left">
              <div className="font-semibold">{timeframe?.label}</div>
              <div className="text-sm opacity-75">{timeframe?.description}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-400 bg-gray-700/50 p-3 rounded-lg">
        <strong>Note:</strong> Different timeframes reveal different correlation patterns. 
        Short periods show tactical relationships while longer periods reveal strategic correlations.
      </div>
    </div>
  );
};

export default TimeframeSelector;