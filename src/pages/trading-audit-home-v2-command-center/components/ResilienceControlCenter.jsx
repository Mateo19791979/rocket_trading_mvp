import React, { useState } from 'react';
import { Shield, AlertTriangle, Power, Settings, RefreshCw, Zap, Lock, Unlock } from 'lucide-react';

export default function ResilienceControlCenter({ onEmergencyProtocol, safeMode, setSafeMode }) {
  const [emergencyProtocols] = useState([
    { id: 'failover', name: 'Multi-Region Failover', status: 'ready', level: 'medium' },
    { id: 'circuit-breaker', name: 'Circuit Breaker', status: 'ready', level: 'high' },
    { id: 'data-isolation', name: 'Data Isolation', status: 'ready', level: 'critical' },
    { id: 'emergency-stop', name: 'Emergency Stop All', status: 'ready', level: 'critical' }
  ]);

  const [systemProtection] = useState({
    autoHeal: true,
    circuitBreaker: true,
    failover: true,
    dataBackup: true
  });

  const [recoveryMetrics] = useState({
    lastRecovery: '2 hours ago',
    mttr: '3.2 min',
    uptime: '99.94%',
    incidents: 2
  });

  const handleSafeModeToggle = () => {
    const newSafeMode = !safeMode;
    setSafeMode(newSafeMode);
    localStorage.setItem('SAFE_MODE', newSafeMode ? '1' : '0');
    
    if (newSafeMode) {
      console.log('SAFE_MODE activated - All heavy operations disabled');
    } else {
      console.log('SAFE_MODE deactivated - Full operations restored');
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-600/20 border-green-500/40 text-green-400';
      case 'medium':
        return 'bg-yellow-600/20 border-yellow-500/40 text-yellow-400';
      case 'high':
        return 'bg-orange-600/20 border-orange-500/40 text-orange-400';
      case 'critical':
        return 'bg-red-600/20 border-red-500/40 text-red-400';
      default:
        return 'bg-gray-600/20 border-gray-500/40 text-gray-400';
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-600/40 rounded-lg h-full">
      <div className="p-4 border-b border-slate-600/40">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Resilience Control</h3>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-80px)] overflow-y-auto space-y-4">
        {/* SAFE MODE Toggle */}
        <div className={`p-4 rounded-lg border-2 ${safeMode ? 'bg-yellow-600/10 border-yellow-500/40' : 'bg-slate-700/30 border-slate-600/30'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {safeMode ? <Lock className="w-5 h-5 text-yellow-400" /> : <Unlock className="w-5 h-5 text-slate-400" />}
              <span className="font-semibold text-white">SAFE MODE</span>
            </div>
            <button
              onClick={handleSafeModeToggle}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                safeMode ? 'bg-yellow-600/50 border border-yellow-500/60' : 'bg-slate-600/50 border border-slate-500/60'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 absolute top-0.5 ${
                safeMode ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>
          <div className="text-xs text-slate-400">
            {safeMode ? 'Heavy operations disabled. System running in safe mode.' : 'Full operations enabled. All systems operational.'}
          </div>
        </div>

        {/* Emergency Protocols */}
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            Emergency Protocols
          </h4>
          <div className="space-y-2">
            {emergencyProtocols?.map((protocol) => (
              <div
                key={protocol?.id}
                className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{protocol?.name}</span>
                  <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getLevelColor(protocol?.level)}`}>
                    {protocol?.level?.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status: {protocol?.status}</span>
                  <button
                    onClick={() => onEmergencyProtocol?.(protocol?.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      protocol?.level === 'critical' ?'bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300' :'bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/40 text-slate-300'
                    }`}
                  >
                    Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Protection */}
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            System Protection
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(systemProtection)?.map(([key, enabled]) => (
              <div
                key={key}
                className="p-2 bg-slate-700/30 border border-slate-600/30 rounded-lg flex items-center justify-between"
              >
                <span className="text-xs text-slate-300 capitalize">
                  {key?.replace(/([A-Z])/g, ' $1')?.trim()}
                </span>
                <div className={`w-6 h-3 rounded-full ${enabled ? 'bg-green-600/50 border border-green-500/60' : 'bg-slate-600/50 border border-slate-500/60'}`}>
                  <div className={`w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all duration-200 absolute ${
                    enabled ? 'translate-x-3' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Metrics */}
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-green-400" />
            Recovery Metrics
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-center">
              <div className="text-xs text-slate-400 mb-1">MTTR</div>
              <div className="font-mono text-sm text-green-400">{recoveryMetrics?.mttr}</div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-center">
              <div className="text-xs text-slate-400 mb-1">Uptime</div>
              <div className="font-mono text-sm text-blue-400">{recoveryMetrics?.uptime}</div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-center">
              <div className="text-xs text-slate-400 mb-1">Last Recovery</div>
              <div className="font-mono text-xs text-slate-300">{recoveryMetrics?.lastRecovery}</div>
            </div>
            <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-center">
              <div className="text-xs text-slate-400 mb-1">Incidents (24h)</div>
              <div className="font-mono text-sm text-yellow-400">{recoveryMetrics?.incidents}</div>
            </div>
          </div>
        </div>

        {/* Master Controls */}
        <div>
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Power className="w-4 h-4 text-purple-400" />
            Master Controls
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <button className="p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              System Health Check
            </button>
            <button className="p-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Force Recovery
            </button>
            <button className="p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 rounded-lg text-red-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Power className="w-4 h-4" />
              Emergency Shutdown
            </button>
          </div>
        </div>

        {/* Degraded Operations */}
        {safeMode && (
          <div className="p-4 bg-yellow-600/10 border border-yellow-500/40 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="font-semibold text-yellow-300">Degraded Operation Mode</span>
            </div>
            <div className="text-xs text-yellow-200 mb-3">
              System is operating with reduced functionality to ensure stability.
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-slate-300">Real-time WebSocket feeds disabled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-slate-300">Heavy chart rendering disabled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">Core trading functions active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">System monitoring active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}