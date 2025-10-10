import React, { useState } from 'react';
import { Activity, Plus, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const ExtensionPanel = ({ deployments, onExtend }) => {
  const [extensionConfig, setExtensionConfig] = useState({
    additional_strategies: 2,
    total_capital_percentage: 2.0,
    monitoring_enabled: true,
    alerts_enabled: true
  });

  const [isExtending, setIsExtending] = useState(false);

  const activeDeployment = deployments?.[0];
  
  const getPhaseStatus = () => {
    if (!activeDeployment) return { canExtend: false, reason: 'No active deployment' };
    
    const createdAt = new Date(activeDeployment.created_at);
    const hoursElapsed = (Date.now() - createdAt?.getTime()) / (1000 * 60 * 60);
    
    if (hoursElapsed < 24) {
      return { canExtend: false, reason: 'Must wait 24h after T-0 launch' };
    }
    
    if (hoursElapsed >= 48) {
      return { canExtend: false, reason: 'Extension window closed (48h passed)' };
    }
    
    // Check performance criteria
    return { canExtend: true, reason: 'Ready for extension' };
  };

  const phaseStatus = getPhaseStatus();

  const handleExtend = async () => {
    setIsExtending(true);
    try {
      // Simulate extension logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      onExtend();
    } finally {
      setIsExtending(false);
    }
  };

  const performanceMetrics = [
    {
      label: 'P99 Latence API',
      current: 42,
      threshold: 100,
      unit: 'ms',
      status: 'good'
    },
    {
      label: 'Erreurs 1h',
      current: 0.03,
      threshold: 0.1,
      unit: '%',
      status: 'excellent'
    },
    {
      label: 'Drift Live/Paper',
      current: 1.8,
      threshold: 5,
      unit: '%',
      status: 'excellent'
    }
  ];

  const extensionStrategies = [
    {
      name: 'Mean Reversion Alpha',
      allocation: 0.8,
      backtestSharpe: 1.45,
      riskLevel: 'Medium'
    },
    {
      name: 'Momentum Scalping',
      allocation: 0.7,
      backtestSharpe: 1.62,
      riskLevel: 'High'
    },
    {
      name: 'Volatility Arbitrage',
      allocation: 0.5,
      backtestSharpe: 1.28,
      riskLevel: 'Low'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* T-24h Extension Controls */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold">T-24h Extension Prudente</h2>
        </div>

        {/* Performance Validation */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Validation Performance T-0</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performanceMetrics?.map((metric, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  metric?.status === 'excellent' ? 'border-green-400 bg-green-400/10' :
                  metric?.status === 'good'? 'border-blue-400 bg-blue-400/10' : 'border-red-400 bg-red-400/10'
                }`}
              >
                <div className="text-sm text-gray-400 mb-1">{metric?.label}</div>
                <div className="text-xl font-bold text-white">
                  {metric?.current}{metric?.unit}
                </div>
                <div className="text-xs text-gray-400">
                  Seuil: {'<'} {metric?.threshold}{metric?.unit}
                </div>
                <div className="flex items-center mt-2">
                  {metric?.status === 'excellent' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  ) : metric?.status === 'good' ? (
                    <CheckCircle className="w-4 h-4 text-blue-400 mr-2" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                  )}
                  <span className={`text-xs ${
                    metric?.status === 'excellent' ? 'text-green-400' :
                    metric?.status === 'good'? 'text-blue-400' : 'text-red-400'
                  }`}>
                    {metric?.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extension Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Strategies Additionnelles
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={extensionConfig?.additional_strategies}
                  onChange={(e) => setExtensionConfig(prev => ({
                    ...prev,
                    additional_strategies: parseInt(e?.target?.value)
                  }))}
                  className="flex-1"
                />
                <span className="text-yellow-400 font-bold min-w-[3rem]">
                  {extensionConfig?.additional_strategies}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Capital Total (%)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={extensionConfig?.total_capital_percentage}
                  onChange={(e) => setExtensionConfig(prev => ({
                    ...prev,
                    total_capital_percentage: parseFloat(e?.target?.value)
                  }))}
                  className="flex-1"
                />
                <span className="text-yellow-400 font-bold min-w-[4rem]">
                  {extensionConfig?.total_capital_percentage?.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Limite T-24h: ≤2% du capital total
              </p>
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="bg-gray-700 rounded p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3">Strategies Candidates</h3>
            <div className="space-y-2">
              {extensionStrategies?.slice(0, extensionConfig?.additional_strategies)?.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-600 rounded">
                  <div>
                    <span className="font-medium text-white">{strategy?.name}</span>
                    <div className="text-xs text-gray-400">
                      Sharpe: {strategy?.backtestSharpe} | Risk: {strategy?.riskLevel}
                    </div>
                  </div>
                  <div className="text-sm text-yellow-400 font-bold">
                    {strategy?.allocation}% alloc
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extension Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {phaseStatus?.reason}
            </div>
            <button
              onClick={handleExtend}
              disabled={!phaseStatus?.canExtend || isExtending}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all ${
                phaseStatus?.canExtend && !isExtending
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isExtending ? (
                <>
                  <Activity className="w-5 h-5 animate-spin" />
                  <span>Extension en cours...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Étendre T-24h</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Alert Configuration */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-lg font-bold">Alertes & Surveillance</h2>
        </div>

        <div className="space-y-4">
          {/* Alert Settings */}
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-3">Configuration Alertes</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={extensionConfig?.monitoring_enabled}
                  onChange={(e) => setExtensionConfig(prev => ({
                    ...prev,
                    monitoring_enabled: e?.target?.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Surveillance continue</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={extensionConfig?.alerts_enabled}
                  onChange={(e) => setExtensionConfig(prev => ({
                    ...prev,
                    alerts_enabled: e?.target?.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Alertes Sentry/Slack</span>
              </label>
            </div>
          </div>

          {/* Alert Channels */}
          <div className="bg-gray-700 rounded p-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Canaux d'Alerte</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Mode SAFE/DEGRADED</span>
                <span className="text-green-400 text-xs">ACTIF</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">No-trades 3h</span>
                <span className="text-green-400 text-xs">ACTIF</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email notifications</span>
                <span className="text-green-400 text-xs">ACTIF</span>
              </div>
            </div>
          </div>

          {/* Risk Limits */}
          <div className="bg-gray-700 rounded p-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Limites de Risque</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Capital max</span>
                <span className="text-white font-bold">2.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Drawdown max</span>
                <span className="text-white font-bold">5.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Durée surveillance</span>
                <span className="text-white font-bold">24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPanel;