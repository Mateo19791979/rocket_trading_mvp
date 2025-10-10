import React, { useState, useEffect } from 'react';
import { Clock, Globe, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

export default function TimeSynchronizationController({ regions, onEmergencyCoordination }) {
  const [timeData, setTimeData] = useState({});
  const [globalSync, setGlobalSync] = useState({
    synchronized: true,
    maxDrift: 12,
    lastSync: Date.now() - 30000,
    nextSync: Date.now() + 30000
  });

  useEffect(() => {
    // Simulate time synchronization data
    const updateTimeData = () => {
      const data = {};
      const now = Date.now();
      
      regions?.forEach(region => {
        const drift = Math.floor(Math.random() * 20) - 10; // -10 to +10ms drift
        const localTime = new Date()?.toLocaleString('en-US', {
          timeZone: region?.timezone || 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        
        data[region.id] = {
          localTime,
          drift,
          lastCorrection: now - Math.random() * 120000, // Within last 2 minutes
          syncStatus: Math.abs(drift) < 15 ? 'synced' : 'drifting',
          ntpServer: `ntp.${region?.id?.toLowerCase()}.pool.org`,
          accuracy: Math.random() * 5 + 95 // 95-100% accuracy
        };
      });
      
      setTimeData(data);
      
      // Update global sync status
      const maxDrift = Math.max(...Object.values(data)?.map(d => Math.abs(d?.drift)));
      setGlobalSync(prev => ({
        ...prev,
        synchronized: maxDrift < 20,
        maxDrift: maxDrift,
        lastSync: now - Math.random() * 60000
      }));
    };

    updateTimeData();
    const interval = setInterval(updateTimeData, 5000);
    return () => clearInterval(interval);
  }, [regions]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString();
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'synced':
        return 'text-green-400 bg-green-600/20 border-green-500/40';
      case 'drifting':
        return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/40';
      case 'desync':
        return 'text-red-400 bg-red-600/20 border-red-500/40';
      default:
        return 'text-gray-400 bg-gray-600/20 border-gray-500/40';
    }
  };

  const getDriftIndicator = (drift) => {
    const absDrift = Math.abs(drift);
    if (absDrift < 5) return { color: 'text-green-400', status: 'Excellent' };
    if (absDrift < 15) return { color: 'text-yellow-400', status: 'Good' };
    return { color: 'text-red-400', status: 'Poor' };
  };

  const handleForceSync = () => {
    console.log('Forcing global time synchronization...');
    setGlobalSync(prev => ({
      ...prev,
      lastSync: Date.now(),
      nextSync: Date.now() + 60000
    }));
  };

  const handleDriftCorrection = (regionId) => {
    console.log(`Correcting time drift for region: ${regionId}`);
    setTimeData(prev => ({
      ...prev,
      [regionId]: {
        ...prev?.[regionId],
        drift: 0,
        lastCorrection: Date.now(),
        syncStatus: 'synced'
      }
    }));
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 rounded-lg">
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Time Sync Controller</h3>
          </div>
          <div className={`px-2 py-1 rounded-full border text-xs font-medium ${
            globalSync?.synchronized
              ? 'bg-green-600/20 text-green-400 border-green-500/40' :'bg-red-600/20 text-red-400 border-red-500/40'
          }`}>
            {globalSync?.synchronized ? 'Synchronized' : 'Drift Detected'}
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {/* Global Sync Status */}
        <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-white">Global Synchronization</span>
            </div>
            <button
              onClick={handleForceSync}
              className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded text-blue-300 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Force Sync
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <div className="text-slate-400 mb-1">Max Drift</div>
              <div className={`font-mono ${getDriftIndicator(globalSync?.maxDrift)?.color}`}>
                {globalSync?.maxDrift}ms
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 mb-1">Last Sync</div>
              <div className="font-mono text-white">
                {formatTimestamp(globalSync?.lastSync)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 mb-1">Status</div>
              <div className={getDriftIndicator(globalSync?.maxDrift)?.color}>
                {getDriftIndicator(globalSync?.maxDrift)?.status}
              </div>
            </div>
          </div>
        </div>

        {/* Regional Time Status */}
        <div>
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Regional Time Monitoring
          </h4>
          <div className="space-y-2">
            {regions?.map(region => {
              const data = timeData?.[region?.id];
              const driftIndicator = data ? getDriftIndicator(data?.drift) : { color: 'text-gray-400', status: 'Unknown' };
              
              return (
                <div
                  key={region?.id}
                  className="p-3 bg-slate-700/20 border border-slate-600/20 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 bg-${region?.color}-400 rounded-full`} />
                      <div>
                        <span className="text-sm font-medium text-white">{region?.name}</span>
                        <div className="text-xs text-slate-400">{region?.timezone || 'UTC'}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full border text-xs font-medium ${
                      data ? getSyncStatusColor(data?.syncStatus) : 'text-gray-400 bg-gray-600/20 border-gray-500/40'
                    }`}>
                      {data?.syncStatus || 'Unknown'}
                    </div>
                  </div>
                  {data && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-2 text-xs">
                        <div>
                          <div className="text-slate-400 mb-1">Local Time</div>
                          <div className="font-mono text-white">{data?.localTime}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1">Drift</div>
                          <div className={`font-mono ${driftIndicator?.color}`}>
                            {data?.drift > 0 ? '+' : ''}{data?.drift}ms
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-slate-400 mb-1">NTP Server</div>
                          <div className="font-mono text-slate-300 text-xs">{data?.ntpServer}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 mb-1">Accuracy</div>
                          <div className="font-mono text-green-400">{data?.accuracy?.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {Math.abs(data?.drift) > 10 && (
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={() => handleDriftCorrection(region?.id)}
                            className="px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/40 rounded text-yellow-300 text-xs font-medium transition-colors"
                          >
                            Correct Drift
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Coordination */}
        <div className="p-3 bg-slate-700/20 border border-slate-600/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="font-medium text-white">Emergency Coordination</span>
            </div>
            {!globalSync?.synchronized && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">Sync Issue</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-slate-400 mb-2">
              Activate emergency protocols when time drift exceeds acceptable limits
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onEmergencyCoordination}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 rounded text-red-300 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                Emergency Sync
              </button>
              <button
                className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 rounded text-orange-300 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Clock className="w-3 h-3" />
                Halt Operations
              </button>
            </div>
          </div>
        </div>

        {/* Drift Monitoring Chart */}
        <div className="p-3 bg-slate-700/20 border border-slate-600/20 rounded-lg">
          <h4 className="font-medium text-white mb-3 text-sm">Drift Monitoring</h4>
          <div className="h-12 relative bg-slate-600/30 rounded overflow-hidden">
            {/* Simulated drift visualization */}
            <svg width="100%" height="48" className="absolute inset-0">
              <defs>
                <linearGradient id="driftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="rgb(245 158 11)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="rgb(239 68 68)" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="20" height="12" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 12" fill="none" stroke="rgb(71 85 105)" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Drift line */}
              <polyline
                fill="none"
                stroke="url(#driftGradient)"
                strokeWidth="2"
                points="0,24 25,20 50,28 75,22 100,26 125,30 150,24 175,26 200,24"
              />
              
              {/* Current drift indicator */}
              <circle cx="90%" cy="24" r="3" fill="rgb(245 158 11)" className="animate-pulse" />
            </svg>
            
            <div className="absolute bottom-1 left-2 text-xs text-slate-400">
              -20ms
            </div>
            <div className="absolute bottom-1 right-2 text-xs text-slate-400">
              +20ms
            </div>
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-slate-400">
              0ms
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}