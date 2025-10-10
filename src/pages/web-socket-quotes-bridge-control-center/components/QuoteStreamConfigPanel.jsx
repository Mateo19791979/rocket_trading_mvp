import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const QuoteStreamConfigPanel = ({
  selectedProvider,
  setSelectedProvider,
  streamingFrequency,
  setStreamingFrequency,
  selectedSymbols,
  setSelectedSymbols,
  subscriptionConfig,
  onSubscriptionUpdate,
  providerOptions,
  frequencyOptions
}) => {
  const [newSymbol, setNewSymbol] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddSymbol = () => {
    if (newSymbol && !selectedSymbols?.includes(newSymbol?.toUpperCase())) {
      setSelectedSymbols([...selectedSymbols, newSymbol?.toUpperCase()]);
      setNewSymbol('');
    }
  };

  const handleRemoveSymbol = (symbol) => {
    setSelectedSymbols(selectedSymbols?.filter(s => s !== symbol));
  };

  const handleBulkSubscriptionUpdate = async (enabled) => {
    setIsUpdating(true);
    try {
      await onSubscriptionUpdate(selectedSymbols, enabled);
    } finally {
      setIsUpdating(false);
    }
  };

  const getSubscriptionStatus = (symbol) => {
    const config = subscriptionConfig?.find(c => c?.symbol === symbol);
    return config?.isSubscribed || false;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quote Stream Configuration
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure data sources and streaming parameters
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Data Provider
          </label>
          <Select
            value={selectedProvider}
            onChange={setSelectedProvider}
            options={providerOptions}
            className="w-full"
          />
        </div>

        {/* Streaming Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Streaming Frequency
          </label>
          <Select
            value={streamingFrequency}
            onChange={setStreamingFrequency}
            options={frequencyOptions}
            className="w-full"
          />
        </div>

        {/* Symbol Management */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Watched Symbols
          </label>
          
          {/* Add new symbol */}
          <div className="flex gap-2 mb-3">
            <Input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e?.target?.value)}
              placeholder="Add symbol (e.g., TSLA)"
              className="flex-1"
              onKeyPress={(e) => {
                if (e?.key === 'Enter') {
                  handleAddSymbol();
                }
              }}
            />
            <Button
              onClick={handleAddSymbol}
              variant="outline"
              iconName="Plus"
              disabled={!newSymbol}
            >
              Add
            </Button>
          </div>

          {/* Current symbols */}
          {selectedSymbols?.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedSymbols?.map((symbol) => (
                  <div
                    key={symbol}
                    className="flex items-center bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg"
                  >
                    <span className="text-sm font-medium">{symbol}</span>
                    <div className={`w-2 h-2 rounded-full ml-2 mr-1 ${
                      getSubscriptionStatus(symbol) ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <button
                      onClick={() => handleRemoveSymbol(symbol)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Bulk actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => handleBulkSubscriptionUpdate(true)}
                  variant="outline"
                  size="sm"
                  iconName="Play"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Subscribe All'}
                </Button>
                <Button
                  onClick={() => handleBulkSubscriptionUpdate(false)}
                  variant="outline"
                  size="sm"
                  iconName="Pause"
                  disabled={isUpdating}
                >
                  Unsubscribe All
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p>No symbols added yet</p>
            </div>
          )}
        </div>

        {/* Subscription Overview */}
        {subscriptionConfig?.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Current Subscriptions ({subscriptionConfig?.filter(c => c?.isSubscribed)?.length || 0} active)
            </h3>
            <div className="max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {subscriptionConfig?.slice(0, 10)?.map((config) => (
                  <div
                    key={config?.symbol}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-gray-50 dark:bg-gray-700"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {config?.symbol}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        {config?.frequency}m
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        config?.isSubscribed ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                  </div>
                ))}
                {subscriptionConfig?.length > 10 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                    +{subscriptionConfig?.length - 10} more symbols
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteStreamConfigPanel;