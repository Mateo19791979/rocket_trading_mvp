import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { aiLearningService } from '@/services/aiLearningService';

export default function DataHealthIndex({ dhiData, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);

  const updateDataHealth = async (stream, customParams = {}) => {
    try {
      setUpdating(true);
      
      const result = await aiLearningService?.updateDHI(stream, customParams);
      if (result?.data) {
        // Refresh the DHI status
        const dhiResult = await aiLearningService?.getDHIStatus();
        if (dhiResult?.data && onUpdate) {
          onUpdate(dhiResult?.data);
        }
      }
    } catch (error) {
      console.error('Failed to update DHI:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getHealthStatus = (dhi) => {
    if (dhi >= 0.9) return { status: 'excellent', color: 'text-green-400', bg: 'bg-green-400' };
    if (dhi >= 0.7) return { status: 'good', color: 'text-blue-400', bg: 'bg-blue-400' };
    if (dhi >= 0.5) return { status: 'warning', color: 'text-yellow-400', bg: 'bg-yellow-400' };
    return { status: 'critical', color: 'text-red-400', bg: 'bg-red-400' };
  };

  const getStatusIcon = (dhi) => {
    if (dhi >= 0.7) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (dhi >= 0.5) return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  const handleStreamClick = (stream) => {
    setSelectedStream(selectedStream?.stream === stream?.stream ? null : stream);
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-600/20 rounded-lg">
            <Database className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Data Health Index</h3>
            <p className="text-sm text-gray-400">Real-time data quality monitoring</p>
          </div>
        </div>
        
        <button
          onClick={() => updateDataHealth('system_refresh')}
          disabled={updating}
          className="p-2 bg-teal-600/20 hover:bg-teal-600/30 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-teal-400 ${updating ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {/* Overall Health Status */}
      <div className="mb-6 bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-300">Overall Health</h4>
          <div className="flex items-center space-x-2">
            {dhiData?.length > 0 ? (
              <>
                <div className="h-2 w-2 rounded-full bg-teal-400" />
                <span className="text-sm text-gray-400">
                  {((dhiData?.filter(d => d?.dhi >= 0.7)?.length || 0) / (dhiData?.length || 1) * 100)?.toFixed(0)}% healthy
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">No data streams</span>
            )}
          </div>
        </div>
        
        {/* Health Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-400">
              {dhiData?.filter(d => d?.dhi >= 0.7)?.length || 0}
            </p>
            <p className="text-xs text-gray-400">Healthy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-yellow-400">
              {dhiData?.filter(d => d?.dhi >= 0.5 && d?.dhi < 0.7)?.length || 0}
            </p>
            <p className="text-xs text-gray-400">Warning</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-red-400">
              {dhiData?.filter(d => d?.dhi < 0.5)?.length || 0}
            </p>
            <p className="text-xs text-gray-400">Critical</p>
          </div>
        </div>
      </div>
      {/* Data Streams List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {dhiData?.map((stream, index) => {
          const health = getHealthStatus(stream?.dhi);
          const isSelected = selectedStream?.stream === stream?.stream;
          
          return (
            <motion.div
              key={stream?.stream}
              className={`bg-gray-800/30 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-800/50 ${
                isSelected ? 'bg-gray-800/70 border border-teal-500' : ''
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleStreamClick(stream)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(stream?.dhi)}
                  <div>
                    <p className="text-sm text-gray-300">{stream?.stream}</p>
                    <p className="text-xs text-gray-500">
                      Updated {new Date(stream.updated_at)?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-semibold ${health?.color}`}>
                    {(stream?.dhi * 100)?.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{health?.status}</p>
                </div>
              </div>
              {/* Detailed Breakdown (when selected) */}
              {isSelected && (
                <motion.div
                  className="mt-4 pt-4 border-t border-gray-700"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <h5 className="text-xs font-semibold text-gray-300 mb-3">Health Breakdown</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700/30 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Timeliness</span>
                        <span className="text-xs text-gray-300">{((stream?.timeliness || 0) * 100)?.toFixed(0)}%</span>
                      </div>
                      <div className="bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full transition-all"
                          style={{ width: `${(stream?.timeliness || 0) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Completeness</span>
                        <span className="text-xs text-gray-300">{((stream?.completeness || 0) * 100)?.toFixed(0)}%</span>
                      </div>
                      <div className="bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-green-400 h-1 rounded-full transition-all"
                          style={{ width: `${(stream?.completeness || 0) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Consistency</span>
                        <span className="text-xs text-gray-300">{((stream?.consistency || 0) * 100)?.toFixed(0)}%</span>
                      </div>
                      <div className="bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-purple-400 h-1 rounded-full transition-all"
                          style={{ width: `${(stream?.consistency || 0) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Coverage</span>
                        <span className="text-xs text-gray-300">{((stream?.coverage || 0) * 100)?.toFixed(0)}%</span>
                      </div>
                      <div className="bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-teal-400 h-1 rounded-full transition-all"
                          style={{ width: `${(stream?.coverage || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      {dhiData?.length === 0 && (
        <div className="bg-gray-800/20 rounded-lg p-8 text-center">
          <Database className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No data streams configured</p>
          <p className="text-sm text-gray-500 mt-1">
            Add data streams to monitor their health
          </p>
        </div>
      )}
    </div>
  );
}