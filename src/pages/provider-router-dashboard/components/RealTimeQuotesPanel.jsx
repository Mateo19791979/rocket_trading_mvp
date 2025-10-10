import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, BarChart3 } from 'lucide-react';

export default function RealTimeQuotesPanel({ quotesData = [], onRefreshQuotes }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshQuotes();
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(price || 0);
  };

  const formatChange = (change, changePercent) => {
    const isPositive = (change || 0) >= 0;
    const icon = isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        {icon}
        <span className="font-medium">
          {(change || 0) >= 0 ? '+' : ''}{(change || 0)?.toFixed(2)}
        </span>
        <span className="text-sm">
          ({(changePercent || 0) >= 0 ? '+' : ''}{(changePercent || 0)?.toFixed(2)}%)
        </span>
      </div>
    );
  };

  const formatVolume = (volume) => {
    if ((volume || 0) >= 1000000) {
      return `${((volume || 0) / 1000000)?.toFixed(1)}M`;
    } else if ((volume || 0) >= 1000) {
      return `${((volume || 0) / 1000)?.toFixed(1)}K`;
    }
    return (volume || 0)?.toString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
          Real-Time Market Data
        </h3>
        
        <div className="flex items-center space-x-3">
          {quotesData?.length > 0 && (
            <div className="text-sm text-gray-400">
              Last updated: {new Date()?.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:bg-blue-800"
          >
            <RefreshCw className={`w-4 h-4 inline mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      {quotesData?.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No market data available</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            Load sample quotes
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quotesData?.map((quote, index) => (
            <div
              key={quote?.symbol || index}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              {quote?.error ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-white">{quote?.symbol}</h4>
                      <p className="text-sm text-red-400">Error: {quote?.error}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Provider: {quote?.provider_used}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <h4 className="font-medium text-white text-lg">{quote?.symbol}</h4>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(quote?.price)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    {formatChange(quote?.change, quote?.change_percent)}
                    <div className="text-xs text-gray-400 flex items-center space-x-2">
                      <span>Vol: {formatVolume(quote?.volume)}</span>
                      <span>•</span>
                      <span>via {quote?.provider_used}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Provider Attribution Summary */}
      {quotesData?.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-600">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Provider Attribution</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              quotesData?.filter(q => !q?.error && q?.provider_used !== 'none')?.reduce((acc, quote) => {
                  acc[quote.provider_used] = (acc?.[quote?.provider_used] || 0) + 1;
                  return acc;
                }, {})
            )?.map(([provider, count]) => (
              <span
                key={provider}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300 border border-gray-600"
              >
                {provider}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}