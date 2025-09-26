import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Search, AlertTriangle, Download, BarChart3 } from 'lucide-react';
import { correlationHunterService } from '../../services/correlationHunterService';
import AssetSelector from './components/AssetSelector';
import CorrelationMatrix from './components/CorrelationMatrix';
import CorrelationChart from './components/CorrelationChart';
import TimeframeSelector from './components/TimeframeSelector';
import CorrelationAlerts from './components/CorrelationAlerts';

const CorrelationHunter = () => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [correlationData, setCorrelationData] = useState(null);
  const [timeframe, setTimeframe] = useState('1M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load available assets on component mount
  useEffect(() => {
    loadAvailableAssets();
  }, []);

  // Recalculate correlation when assets or timeframe changes
  useEffect(() => {
    if (selectedAssets?.length >= 2) {
      calculateCorrelations();
    }
  }, [selectedAssets, timeframe]);

  const loadAvailableAssets = async () => {
    try {
      setLoading(true);
      const assets = await correlationHunterService?.getAvailableAssets();
      setAvailableAssets(assets);
    } catch (err) {
      setError(`Failed to load assets: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateCorrelations = async () => {
    if (!selectedAssets?.length || selectedAssets?.length < 2) return;

    try {
      setLoading(true);
      setError('');

      const assetIds = selectedAssets?.map(asset => asset?.id);
      const data = await correlationHunterService?.getHistoricalData(assetIds, timeframe);
      setHistoricalData(data);

      const correlations = correlationHunterService?.calculateCorrelationMatrix(data);
      setCorrelationData(correlations);
    } catch (err) {
      setError(`Failed to calculate correlations: ${err?.message || 'Unknown error'}`);
      setCorrelationData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetSelection = (assets) => {
    setSelectedAssets(assets || []);
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const exportCorrelationData = () => {
    if (!correlationData) return;

    const dataToExport = {
      selectedAssets: selectedAssets?.map(asset => ({
        symbol: asset?.symbol,
        name: asset?.name
      })),
      timeframe,
      correlationMatrix: correlationData?.matrix,
      exportDate: new Date()?.toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `correlation-analysis-${timeframe}-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Correlation Hunter</h1>
              <p className="text-gray-400">Advanced correlation analysis for trading opportunities</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportCorrelationData}
              disabled={!correlationData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AssetSelector
              availableAssets={availableAssets}
              selectedAssets={selectedAssets}
              onAssetSelection={handleAssetSelection}
              loading={loading}
            />
          </div>
          <div>
            <TimeframeSelector
              selectedTimeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}

        {/* Analysis Results */}
        {selectedAssets?.length >= 2 && !loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Correlation Matrix */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-semibold">Correlation Matrix</h2>
              </div>
              {correlationData ? (
                <CorrelationMatrix 
                  correlationData={correlationData}
                  selectedAssets={selectedAssets}
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Select at least 2 assets to see correlation matrix
                </div>
              )}
            </div>

            {/* Correlation Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Price Correlation Chart</h2>
              </div>
              {historicalData?.length > 0 ? (
                <CorrelationChart 
                  historicalData={historicalData}
                  selectedAssets={selectedAssets}
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Loading correlation chart...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Correlation Alerts */}
        {selectedAssets?.length >= 2 && correlationData && (
          <div className="bg-gray-800 rounded-lg p-6">
            <CorrelationAlerts 
              correlationData={correlationData}
              selectedAssets={selectedAssets}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-gray-300">Analyzing correlations...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedAssets?.length < 2 && !loading && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Start Your Analysis</h3>
            <p className="text-gray-500">Select at least 2 assets to begin correlation analysis</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationHunter;