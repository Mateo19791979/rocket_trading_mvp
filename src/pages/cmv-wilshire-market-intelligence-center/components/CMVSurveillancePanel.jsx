import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Activity, Clock, ExternalLink } from 'lucide-react';
import { cmvWilshireService } from '../../../services/cmvWilshireService';

export default function CMVSurveillancePanel({ cmvData, loading, onRefresh }) {
  const [triggeringCMV, setTriggeringCMV] = useState(false);

  const handleTriggerCMVScan = async () => {
    setTriggeringCMV(true);
    try {
      const result = await cmvWilshireService?.triggerCMVScan();
      if (result?.error) {
        console.error('CMV scan failed:', result?.error);
      } else {
        console.log('CMV scan triggered successfully');
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error triggering CMV scan:', error);
    } finally {
      setTriggeringCMV(false);
    }
  };

  const getBuffettData = () => {
    return cmvData?.find(item => item?.source === 'cmv.buffett');
  };

  const getPE10Data = () => {
    return cmvData?.find(item => item?.source === 'cmv.pe10');
  };

  const getPriceSalesData = () => {
    return cmvData?.find(item => item?.source === 'cmv.pricesales');
  };

  const getValuationColor = (stance) => {
    switch (stance?.toLowerCase()) {
      case 'undervalued': return 'text-green-400';
      case 'fairly valued': return 'text-yellow-400';
      case 'overvalued': return 'text-orange-400';
      case 'strongly overvalued': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRatioColor = (ratio) => {
    if (!ratio) return 'text-gray-400';
    const num = parseFloat(ratio);
    if (num < 80) return 'text-green-400';
    if (num < 120) return 'text-yellow-400';
    if (num < 200) return 'text-orange-400';
    return 'text-red-400';
  };

  const buffettData = getBuffettData();
  const pe10Data = getPE10Data();
  const priceSalesData = getPriceSalesData();

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold">CMV Surveillance</h2>
        </div>
        <button
          onClick={handleTriggerCMVScan}
          disabled={triggeringCMV || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm flex items-center space-x-2"
        >
          <Activity className={`w-4 h-4 ${triggeringCMV ? 'animate-spin' : ''}`} />
          <span>{triggeringCMV ? 'Scanning...' : 'Trigger Scan'}</span>
        </button>
      </div>
      <div className="space-y-4">
        {/* Buffett Indicator */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Buffett Indicator</h3>
            {buffettData?.payload?.url && (
              <a
                href={buffettData?.payload?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {buffettData?.payload ? (
            <div>
              <div className={`text-2xl font-bold ${getRatioColor(buffettData?.payload?.ratio_pct)}`}>
                {buffettData?.payload?.ratio_pct}%
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {buffettData?.payload?.updated_at || 'No date'}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(buffettData.updated_at)?.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No data available</div>
          )}
        </div>

        {/* CAPE / PE10 */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">CAPE / PE10</h3>
            {pe10Data?.payload?.url && (
              <a
                href={pe10Data?.payload?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {pe10Data?.payload ? (
            <div>
              <div className="flex items-center space-x-4">
                <div className="text-xl font-bold text-blue-400">
                  {pe10Data?.payload?.cape || 'N/A'}
                </div>
                <div className={`text-sm font-medium ${getValuationColor(pe10Data?.payload?.stance)}`}>
                  {pe10Data?.payload?.stance || 'Unknown'}
                </div>
              </div>
              {pe10Data?.payload?.zscore_sd && (
                <div className="text-sm text-gray-400 mt-1">
                  Z-Score: {pe10Data?.payload?.zscore_sd} σ
                </div>
              )}
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(pe10Data.updated_at)?.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No data available</div>
          )}
        </div>

        {/* Price to Sales */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Price to Sales</h3>
            {priceSalesData?.payload?.url && (
              <a
                href={priceSalesData?.payload?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {priceSalesData?.payload ? (
            <div>
              <div className={`text-lg font-medium ${getValuationColor(priceSalesData?.payload?.stance)}`}>
                {priceSalesData?.payload?.stance || 'Unknown'}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(priceSalesData.updated_at)?.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No data available</div>
          )}
        </div>
      </div>
      {/* Alert Status */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span>Auto Monitoring Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}