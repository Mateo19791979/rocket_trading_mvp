import React, { useState } from 'react';
import { Shield, Zap, Eye, AlertTriangle, CheckCircle, XCircle, Settings } from 'lucide-react';

const AutonomousGovernanceCenter = ({ killSwitches, systemHealth, onKillSwitchActivation }) => {
  const [governanceConfig, setGovernanceConfig] = useState({
    health_sentinel_enabled: true,
    dhi_threshold: 0.70,
    iqs_threshold: 0.80,
    auto_canary_enabled: true,
    canary_min_percentage: 1.0
  });

  const [showActivationModal, setShowActivationModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');

  const guardrails = [
    {
      id: 'health_sentinel',
      name: 'Health Sentinel',
      status: 'active',
      description: 'Surveillance continue des agents et métriques système',
      last_check: new Date(Date.now() - 2 * 60 * 1000),
      alerts_count: 0
    },
    {
      id: 'slo_compliance',
      name: 'SLO Compliance',
      status: 'active',
      description: 'Vérification des objectifs de niveau de service',
      last_check: new Date(Date.now() - 5 * 60 * 1000),
      alerts_count: 0
    },
    {
      id: 'dhi_monitor',
      name: 'DHI Monitor',
      status: 'active', 
      description: 'Surveillance de la qualité des données (DHI)',
      last_check: new Date(Date.now() - 1 * 60 * 1000),
      alerts_count: 1
    },
    {
      id: 'kill_switch_mgr',
      name: 'Kill Switch Manager',
      status: 'active',
      description: 'Gestion automatique des kill switches',
      last_check: new Date(Date.now() - 30 * 1000),
      alerts_count: 0
    }
  ];

  const sloMetrics = [
    {
      name: 'API Latency P99',
      current: 45,
      target: 100,
      unit: 'ms',
      compliance: 95.2,
      status: 'good'
    },
    {
      name: 'Error Rate 1h',
      current: 0.02,
      target: 0.10,
      unit: '%',
      compliance: 99.8,
      status: 'excellent'
    },
    {
      name: 'Agent Availability',
      current: 98.7,
      target: 95.0,
      unit: '%',
      compliance: 98.7,
      status: 'excellent'
    },
    {
      name: 'Data Freshness',
      current: 15,
      target: 30,
      unit: 's',
      compliance: 97.1,
      status: 'good'
    }
  ];

  const killSwitchModules = [
    'LIVE_TRADING',
    'STRATEGY_GENERATION', 
    'ORDER_EXECUTION',
    'DATA_INGESTION',
    'RISK_CONTROLLER'
  ];

  const handleKillSwitchActivation = async (module, reason) => {
    try {
      await onKillSwitchActivation(module, reason);
      setShowActivationModal(false);
      setSelectedModule('');
    } catch (error) {
      console.error('Error activating kill switch:', error);
    }
  };

  const getHealthStatus = () => {
    const totalHealth = systemHealth?.length || 1;
    const healthyAgents = systemHealth?.filter(h => h?.health_status === 'healthy')?.length || 0;
    return (healthyAgents / totalHealth) * 100;
  };

  const activeKillSwitches = killSwitches?.filter(ks => ks?.is_active) || [];

  return (
    <div className="space-y-6">
      {/* Active Guardrails */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">Garde-fous Actifs</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {guardrails?.map((guardrail) => (
            <div
              key={guardrail?.id}
              className={`p-4 rounded-lg border-l-4 ${
                guardrail?.status === 'active' ? 'border-green-400 bg-green-400/5' : 'border-red-400 bg-red-400/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{guardrail?.name}</h3>
                <div className="flex items-center space-x-2">
                  {guardrail?.alerts_count > 0 && (
                    <span className="bg-red-400/20 text-red-400 text-xs px-2 py-1 rounded">
                      {guardrail?.alerts_count} alerts
                    </span>
                  )}
                  {guardrail?.status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-2">{guardrail?.description}</p>
              
              <div className="text-xs text-gray-400">
                Dernière vérification: {guardrail?.last_check?.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* SLO Compliance Dashboard */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Eye className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">SLO Compliance Tracking</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sloMetrics?.map((metric, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                metric?.status === 'excellent' ? 'border-green-400 bg-green-400/10' :
                metric?.status === 'good'? 'border-blue-400 bg-blue-400/10' : 'border-red-400 bg-red-400/10'
              }`}
            >
              <div className="text-sm text-gray-400 mb-1">{metric?.name}</div>
              <div className="text-xl font-bold text-white mb-1">
                {metric?.current}{metric?.unit}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                Target: {'<'} {metric?.target}{metric?.unit}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${
                  metric?.status === 'excellent' ? 'bg-green-400/20 text-green-400' :
                  metric?.status === 'good'? 'bg-blue-400/20 text-blue-400' : 'bg-red-400/20 text-red-400'
                }`}>
                  {metric?.compliance?.toFixed(1)}% SLO
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Kill Switch Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold">Kill Switch Management</h2>
          </div>

          <div className="space-y-4">
            {killSwitchModules?.map((module) => {
              const isActive = activeKillSwitches?.some(ks => ks?.module === module);
              return (
                <div
                  key={module}
                  className={`flex items-center justify-between p-3 rounded border ${
                    isActive ? 'border-red-400 bg-red-400/10' : 'border-gray-600 bg-gray-700'
                  }`}
                >
                  <div>
                    <span className="font-medium text-white">{module}</span>
                    {isActive && (
                      <div className="text-xs text-red-400 mt-1">
                        Activated: {activeKillSwitches?.find(ks => ks?.module === module)?.reason}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (isActive) {
                        // Deactivate logic would go here
                      } else {
                        setSelectedModule(module);
                        setShowActivationModal(true);
                      }
                    }}
                    className={`px-3 py-1 text-sm font-bold rounded transition-all ${
                      isActive 
                        ? 'bg-green-600 hover:bg-green-700 text-white' :'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isActive ? 'REACTIVATE' : 'KILL SWITCH'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canary Configuration */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold">Canary Perpétuel</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700 rounded p-4">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Configuration</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Budget de risque minimum ({governanceConfig?.canary_min_percentage}%)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    value={governanceConfig?.canary_min_percentage}
                    onChange={(e) => setGovernanceConfig(prev => ({
                      ...prev,
                      canary_min_percentage: parseFloat(e?.target?.value)
                    }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Seuil DHI ({governanceConfig?.dhi_threshold})
                  </label>
                  <input
                    type="range"
                    min="0.50"
                    max="0.90"
                    step="0.05"
                    value={governanceConfig?.dhi_threshold}
                    onChange={(e) => setGovernanceConfig(prev => ({
                      ...prev,
                      dhi_threshold: parseFloat(e?.target?.value)
                    }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Seuil IQS ({governanceConfig?.iqs_threshold})
                  </label>
                  <input
                    type="range"
                    min="0.60"
                    max="0.95"
                    step="0.05"
                    value={governanceConfig?.iqs_threshold}
                    onChange={(e) => setGovernanceConfig(prev => ({
                      ...prev,
                      iqs_threshold: parseFloat(e?.target?.value)
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded p-4">
              <h3 className="text-sm font-bold text-gray-300 mb-3">Status Canary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Budget alloué</span>
                  <span className="text-green-400 font-bold">1.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Détection précoce</span>
                  <span className="text-green-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DHI moyen</span>
                  <span className="text-green-400 font-bold">0.82</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IQS médian</span>
                  <span className="text-green-400 font-bold">0.87</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Emergency Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-white">Activation Kill Switch</h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              Vous êtes sur le point d'activer le kill switch pour le module:
            </p>
            
            <p className="text-red-400 font-bold text-lg mb-4">{selectedModule}</p>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Raison:</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                <option value="manual_intervention">Intervention manuelle</option>
                <option value="performance_degradation">Dégradation performance</option>
                <option value="data_quality_issue">Problème qualité données</option>
                <option value="market_conditions">Conditions de marché</option>
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleKillSwitchActivation(selectedModule, 'Manual intervention')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-bold"
              >
                Confirmer Activation
              </button>
              <button
                onClick={() => setShowActivationModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-bold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousGovernanceCenter;