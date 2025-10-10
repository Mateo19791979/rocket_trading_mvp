import React, { useState } from 'react';
import { Gauge, AlertTriangle, Settings, Play, Pause } from 'lucide-react';

const GoLiveProgressionController = ({ deployments, systemHealth, readinessScore }) => {
  const [progressionConfig, setProgressionConfig] = useState({
    scaling_factor: 1.5,
    check_interval_hours: 6,
    auto_scaling_enabled: true,
    max_daily_increase: 50
  });

  const [isProgressing, setIsProgressing] = useState(false);

  const currentScale = 2.0; // Current percentage of capital
  const targetScale = 10.0; // Target for full deployment
  
  const getProgressionSteps = () => {
    const steps = [];
    let current = currentScale;
    let stepCount = 1;
    
    while (current < targetScale && stepCount <= 10) {
      const next = Math.min(current * progressionConfig?.scaling_factor, targetScale);
      steps?.push({
        step: stepCount,
        from: current?.toFixed(1),
        to: next?.toFixed(1),
        estimated_time: stepCount * progressionConfig?.check_interval_hours,
        risk_assessment: next <= 5 ? 'low' : next <= 15 ? 'medium' : 'high'
      });
      current = next;
      stepCount++;
      
      if (next >= targetScale) break;
    }
    
    return steps;
  };

  const progressionSteps = getProgressionSteps();

  const performanceIndicators = [
    {
      name: 'Sharpe Ratio',
      current: 1.42,
      benchmark: 1.35,
      target: '>1.3',
      trend: 'up',
      status: 'good'
    },
    {
      name: 'Fill Rate',
      current: 98.7,
      benchmark: 98.2,
      target: '>95%',
      trend: 'up', 
      status: 'excellent'
    },
    {
      name: 'Max Drawdown',
      current: 2.1,
      benchmark: 2.8,
      target: '<5%',
      trend: 'down',
      status: 'excellent'
    },
    {
      name: 'IS bps (TCA)',
      current: 3.2,
      benchmark: 3.8,
      target: '<5 bps',
      trend: 'down',
      status: 'good'
    }
  ];

  const emergencyConditions = [
    {
      condition: 'Drift live/paper > 10%',
      current_value: '2.1%',
      threshold: '10%',
      status: 'safe',
      action: 'Quarantaine stratégie'
    },
    {
      condition: 'Marché erratique detected',
      current_value: 'Normal',
      threshold: 'High volatility',
      status: 'safe',
      action: 'Freeze + Shadow mode 100%'
    },
    {
      condition: 'IBKR incident',
      current_value: 'Connected',
      threshold: 'Disconnected',
      status: 'safe',
      action: 'Net-flat + Canary only'
    }
  ];

  const handleStartProgression = () => {
    setIsProgressing(true);
    // Simulate progression start
    setTimeout(() => {
      setIsProgressing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Progression Controller */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Gauge className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold">GO-LIVE Progression Controller</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{currentScale}%</div>
              <div className="text-sm text-gray-400">Current Scale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{targetScale}%</div>
              <div className="text-sm text-gray-400">Target Scale</div>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-700 rounded p-4">
            <h3 className="text-lg font-bold text-white mb-4">Algorithme de Scaling</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Facteur d'échelle (x{progressionConfig?.scaling_factor} / jour)
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={progressionConfig?.scaling_factor}
                  onChange={(e) => setProgressionConfig(prev => ({
                    ...prev,
                    scaling_factor: parseFloat(e?.target?.value)
                  }))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Intervalle de vérification ({progressionConfig?.check_interval_hours}h)
                </label>
                <input
                  type="range"
                  min="2"
                  max="24"
                  value={progressionConfig?.check_interval_hours}
                  onChange={(e) => setProgressionConfig(prev => ({
                    ...prev,
                    check_interval_hours: parseInt(e?.target?.value)
                  }))}
                  className="w-full"
                />
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={progressionConfig?.auto_scaling_enabled}
                  onChange={(e) => setProgressionConfig(prev => ({
                    ...prev,
                    auto_scaling_enabled: e?.target?.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Auto-scaling activé</span>
              </label>
            </div>
          </div>

          {/* Performance Monitoring */}
          <div className="bg-gray-700 rounded p-4">
            <h3 className="text-lg font-bold text-white mb-4">Performance vs Benchmark</h3>
            
            <div className="space-y-3">
              {performanceIndicators?.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-300">{indicator?.name}</span>
                    <div className="text-xs text-gray-400">Target: {indicator?.target}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">
                        {indicator?.current}{indicator?.name?.includes('Rate') ? '%' : ''}
                      </span>
                      <span className={`text-xs ${
                        indicator?.trend === 'up' ? 'text-green-400' :
                        indicator?.trend === 'down'? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {indicator?.trend === 'up' ? '↗' : indicator?.trend === 'down' ? '↘' : '→'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">vs {indicator?.benchmark}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progression Steps */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Étapes de Progression Planifiées</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressionSteps?.slice(0, 6)?.map((step, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  step?.risk_assessment === 'low' ? 'border-green-400 bg-green-400/10' :
                  step?.risk_assessment === 'medium'? 'border-yellow-400 bg-yellow-400/10' : 'border-red-400 bg-red-400/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Étape {step?.step}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    step?.risk_assessment === 'low' ? 'bg-green-400/20 text-green-400' :
                    step?.risk_assessment === 'medium'? 'bg-yellow-400/20 text-yellow-400' : 'bg-red-400/20 text-red-400'
                  }`}>
                    {step?.risk_assessment?.toUpperCase()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300">
                  {step?.from}% → {step?.to}%
                </div>
                <div className="text-xs text-gray-400">
                  ~{step?.estimated_time}h
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleStartProgression}
            disabled={isProgressing}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all ${
              !isProgressing
                ? 'bg-green-600 hover:bg-green-700 text-white' :'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProgressing ? (
              <>
                <Settings className="w-5 h-5 animate-spin" />
                <span>Progression en cours...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Démarrer Progression</span>
              </>
            )}
          </button>
          
          <button
            className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold transition-all"
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </button>
        </div>
      </div>
      {/* Emergency Playbooks */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h2 className="text-xl font-bold">Playbooks Rapides d'Urgence</h2>
        </div>

        <div className="space-y-4">
          {emergencyConditions?.map((condition, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                condition?.status === 'safe' ? 'border-green-400 bg-green-400/5' : 'border-red-400 bg-red-400/10'
              }`}
            >
              <div>
                <h3 className="font-bold text-white">{condition?.condition}</h3>
                <p className="text-sm text-gray-300">
                  Current: {condition?.current_value} | Threshold: {condition?.threshold}
                </p>
              </div>
              
              <div className="text-right">
                <div className={`px-3 py-1 rounded text-sm font-bold ${
                  condition?.status === 'safe' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                }`}>
                  {condition?.status?.toUpperCase()}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Action: {condition?.action}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoLiveProgressionController;