import React, { useState, useEffect } from 'react';
import { Search, Plus, X, TrendingUp } from 'lucide-react';

const AssetSelector = ({ availableAssets, selectedAssets, onAssetSelection, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery?.trim()) {
      setFilteredAssets(availableAssets?.slice(0, 10) || []);
      return;
    }

    const filtered = availableAssets?.filter(asset => 
      asset?.symbol?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      asset?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      asset?.sector?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    )?.slice(0, 10) || [];
    
    setFilteredAssets(filtered);
  }, [searchQuery, availableAssets]);

  const handleAssetSelect = (asset) => {
    if (!asset || selectedAssets?.some(selected => selected?.id === asset?.id)) {
      return;
    }

    const newSelectedAssets = [...(selectedAssets || []), asset];
    onAssetSelection?.(newSelectedAssets);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleAssetRemove = (assetToRemove) => {
    const newSelectedAssets = selectedAssets?.filter(asset => asset?.id !== assetToRemove?.id) || [];
    onAssetSelection?.(newSelectedAssets);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <TrendingUp className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold">Asset Selection</h2>
      </div>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets by symbol, name, or sector..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e?.target?.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            disabled={loading}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && searchQuery && (
          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredAssets?.length > 0 ? (
              filteredAssets?.map(asset => (
                <button
                  key={asset?.id}
                  onClick={() => handleAssetSelect(asset)}
                  disabled={selectedAssets?.some(selected => selected?.id === asset?.id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 border-b border-gray-600 last:border-b-0"
                >
                  {asset?.logo_url && (
                    <img 
                      src={asset?.logo_url} 
                      alt={asset?.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{asset?.symbol}</span>
                      <span className="text-sm text-gray-300">{asset?.name}</span>
                    </div>
                    {asset?.sector && (
                      <div className="text-sm text-gray-400">{asset?.sector}</div>
                    )}
                  </div>
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-center">
                No assets found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      {/* Selected Assets */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-300">
          Selected Assets ({selectedAssets?.length || 0})
        </h3>
        
        {selectedAssets?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedAssets?.map(asset => (
              <div
                key={asset?.id}
                className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600"
              >
                {asset?.logo_url && (
                  <img 
                    src={asset?.logo_url} 
                    alt={asset?.name}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{asset?.symbol}</div>
                  <div className="text-sm text-gray-300 truncate">{asset?.name}</div>
                  {asset?.sector && (
                    <div className="text-xs text-gray-400">{asset?.sector}</div>
                  )}
                </div>
                <button
                  onClick={() => handleAssetRemove(asset)}
                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
            <Plus className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p>No assets selected</p>
            <p className="text-sm">Search and select assets to start correlation analysis</p>
          </div>
        )}
      </div>
      {selectedAssets?.length >= 10 && (
        <div className="text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-600">
          <strong>Note:</strong> Consider limiting selection to 10 assets for optimal correlation analysis performance.
        </div>
      )}
    </div>
  );
};

export default AssetSelector;