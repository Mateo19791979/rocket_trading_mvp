import React, { useState } from 'react';
import { Rocket, Zap, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const CanaryLaunchPanel = ({ onLaunch, systemHealth, killSwitches }) => {
  const [canaryConfig, setCanaryConfig] = useState({
    canary_percentage: 0.1,
    monitoring_duration_hours: 24,
    max_latency_p99: 100,
    max_error_rate: 0.1,
    max_drift_percentage: 5
  });

  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      await onLaunch(canaryConfig);
    } finally {
      setIsLaunching(false);
    }
  };

  const getSystemReadiness = () => {
    const activeKillSwitches = killSwitches?.filter(ks => ks?.is_active)?.length || 0;
    const healthyAgents = systemHealth?.filter(h => h?.health_status === 'healthy')?.length || 0;
    const totalAgents = systemHealth?.length || 1;
    const healthRatio = healthyAgents / totalAgents;

    return {
      isReady: activeKillSwitches === 0 && healthRatio >= 0.8,
      activeKillSwitches,
      healthRatio
    };
  };

  const readiness = getSystemReadiness();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* T-0 Canary Launch Controls */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Rocket className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold">T-0 Canary Launch Controls</h2>
        </div>

        <div className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notional Exposure (%)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={canaryConfig?.canary_percentage}
                  onChange={(e) => setCanaryConfig(prev => ({
                    ...prev,
                    canary_percentage: parseFloat(e?.target?.value)
                  }))}
                  className="flex-1"
                />
                <span className="text-red-400 font-bold min-w-[4rem]">
                  {canaryConfig?.canary_percentage?.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Recommandé: 0.1-0.5% pour T-0
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Surveillance (heures)
              </label>
              <select
                value={canaryConfig?.monitoring_duration_hours}
                onChange={(e) => setCanaryConfig(prev => ({
                  ...prev,
                  monitoring_duration_hours: parseInt(e?.target?.value)
                }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value={12}>12h</option>
                <option value={24}>24h</option>
                <option value={48}>48h</option>
              </select>
            </div>
          </div>

          {/* Performance Thresholds */}
          <div className="bg-gray-700 rounded p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Seuils de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-gray-400 mb-1">P99 Latence API (ms)</label>
                <input
                  type="number"
                  value={canaryConfig?.max_latency_p99}
                  onChange={(e) => setCanaryConfig(prev => ({
                    ...prev,
                    max_latency_p99: parseInt(e?.target?.value)
                  }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Erreurs max (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={canaryConfig?.max_error_rate}
                  onChange={(e) => setCanaryConfig(prev => ({
                    ...prev,
                    max_error_rate: parseFloat(e?.target?.value)
                  }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Drift live/paper (%)</label>
                <input
                  type="number"
                  value={canaryConfig?.max_drift_percentage}
                  onChange={(e) => setCanaryConfig(prev => ({
                    ...prev,
                    max_drift_percentage: parseInt(e?.target?.value)
                  }))}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Une fois lancé, surveillance automatique active
            </div>
            <button
              onClick={handleLaunch}
              disabled={!readiness?.isReady || isLaunching}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all ${
                readiness?.isReady && !isLaunching
                  ? 'bg-red-600 hover:bg-red-700 text-white' :'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLaunching ? (
                <>
                  <Zap className="w-5 h-5 animate-spin" />
                  <span>Lancement en cours...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Lancer Canary T-0</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* System Readiness */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-green-400" />
          <h2 className="text-lg font-bold">System Readiness</h2>
        </div>

        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span className="font-medium">Status Global</span>
            <div className="flex items-center space-x-2">
              {readiness?.isReady ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-bold">READY</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-bold">NOT READY</span>
                </>
              )}
            </div>
          </div>

          {/* Health Ratio */}
          <div className="p-3 bg-gray-700 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Health Agents</span>
              <span className="text-sm font-bold">
                {Math.round(readiness?.healthRatio * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  readiness?.healthRatio >= 0.9 ? 'bg-green-400' :
                  readiness?.healthRatio >= 0.7 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${readiness?.healthRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Kill Switches */}
          <div className="p-3 bg-gray-700 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Kill Switches Actifs</span>
              <span className={`text-sm font-bold ${
                readiness?.activeKillSwitches > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {readiness?.activeKillSwitches}
              </span>
            </div>
          </div>

          {/* Pre-flight Checklist */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Pre-flight Checklist</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Health Sentinel opérationnel', status: readiness?.healthRatio >= 0.8 },
                { label: 'Aucun Kill Switch actif', status: readiness?.activeKillSwitches === 0 },
                { label: 'Shadow trading validé', status: true },
                { label: 'Unfreeze canary script prêt', status: true }
              ]?.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {item?.status ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={item?.status ? 'text-gray-300' : 'text-red-400'}>
                    {item?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanaryLaunchPanel;