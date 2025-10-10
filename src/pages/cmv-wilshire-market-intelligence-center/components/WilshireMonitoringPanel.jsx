import React, { useState } from 'react';
import { BarChart3, Activity, Clock, ExternalLink, List } from 'lucide-react';
import { cmvWilshireService } from '../../../services/cmvWilshireService';

export default function WilshireMonitoringPanel({ wilshireData, loading, onRefresh }) {
  const [triggeringWilshire, setTriggeringWilshire] = useState(false);

  const handleTriggerWilshireScan = async () => {
    setTriggeringWilshire(true);
    try {
      const result = await cmvWilshireService?.triggerWilshireScan();
      if (result?.error) {
        console.error('Wilshire scan failed:', result?.error);
      } else {
        console.log('Wilshire scan triggered successfully');
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error triggering Wilshire scan:', error);
    } finally {
      setTriggeringWilshire(false);
    }
  };

  const getPlatformData = () => {
    return wilshireData?.find(item => item?.source === 'wilshire.platform');
  };

  const getIndexesData = () => {
    return wilshireData?.find(item => item?.source === 'wilshire.all-indexes');
  };

  const getMethodologyData = () => {
    return wilshireData?.find(item => item?.source === 'wilshire.methodology.ftw5000');
  };

  const platformData = getPlatformData();
  const indexesData = getIndexesData();
  const methodologyData = getMethodologyData();

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-teal-400" />
          <h2 className="text-xl font-semibold">Wilshire Index Monitoring</h2>
        </div>
        <button
          onClick={handleTriggerWilshireScan}
          disabled={triggeringWilshire || loading}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm flex items-center space-x-2"
        >
          <Activity className={`w-4 h-4 ${triggeringWilshire ? 'animate-spin' : ''}`} />
          <span>{triggeringWilshire ? 'Scanning...' : 'Trigger Scan'}</span>
        </button>
      </div>
      <div className="space-y-4">
        {/* Platform Status */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Platform Status</h3>
            {platformData?.payload?.url && (
              <a
                href={platformData?.payload?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {platformData?.payload ? (
            <div>
              <div className="text-lg font-medium text-teal-400">
                {platformData?.payload?.title || 'Platform Active'}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(platformData.updated_at)?.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No platform data available</div>
          )}
        </div>

        {/* All Indexes */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Index Tracking</h3>
            {indexesData?.payload?.url && (
              <a
                href={indexesData?.payload?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {indexesData?.payload ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <List className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">
                  Tracking {indexesData?.payload?.sample?.length || 0} indexes
                </span>
              </div>
              {indexesData?.payload?.sample && indexesData?.payload?.sample?.length > 0 && (
                <div className="space-y-1">
                  {indexesData?.payload?.sample?.slice(0, 5)?.map((index, i) => (
                    <div key={i} className="text-xs text-gray-400 truncate">
                      • {index}
                    </div>
                  ))}
                  {indexesData?.payload?.sample?.length > 5 && (
                    <div className="text-xs text-gray-500">
                      + {indexesData?.payload?.sample?.length - 5} more...
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(indexesData.updated_at)?.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No index data available</div>
          )}
        </div>

        {/* Methodology */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Methodology</h3>
            {methodologyData?.payload?.url && (
              <a
                href={methodologyData?.payload?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 hover:text-teal-300"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          {methodologyData?.payload ? (
            <div>
              <div className="text-sm font-medium text-gray-300">
                {methodologyData?.payload?.title || 'FT Wilshire 5000 Index Series'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {methodologyData?.payload?.page || 'methodology_ft-w5000'}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(methodologyData.updated_at)?.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No methodology data available</div>
          )}
        </div>
      </div>
      {/* Wilshire 5000 Performance Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-teal-400">5,000+</div>
            <div className="text-xs text-gray-400">Tracked Stocks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-teal-400">100%</div>
            <div className="text-xs text-gray-400">Market Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
}