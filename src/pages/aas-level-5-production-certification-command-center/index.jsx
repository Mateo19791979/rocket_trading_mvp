import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle, Play, Square, BarChart3, Settings, Clock, Target, Zap, Brain } from 'lucide-react';
import aasCertificationService from '../../services/aasCertificationService.js';
import deploymentProgressService from '../../services/deploymentProgressService.js';

// Phase 1 - Controlled Freeze Panel
const Phase1ControlledFreezePanel = ({ phase1Data, onKillSwitchToggle }) => {
  const [activatingSwitch, setActivatingSwitch] = useState(null);

  const handleKillSwitchToggle = async (module, currentStatus) => {
    setActivatingSwitch(module);
    try {
      if (currentStatus) {
        await onKillSwitchToggle('deactivate', module, `Manual deactivation at ${new Date()?.toISOString()}`);
      } else {
        await onKillSwitchToggle('activate', module, `Phase 1 freeze activation at ${new Date()?.toISOString()}`);
      }
    } finally {
      setActivatingSwitch(null);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-red-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Phase 1 - Gel Contrôlé (Shadow Mode)
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-300">{phase1Data?.duration}</span>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            phase1Data?.status === 'completed' 
              ? 'bg-green-900/50 text-green-300 border border-green-500/30' :'bg-red-900/50 text-red-300 border border-red-500/30'
          }`}>
            {phase1Data?.status === 'completed' ? 'Complété' : 'En Cours'}
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Progression Phase 1</span>
          <span className="text-sm font-medium text-red-300">{phase1Data?.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${phase1Data?.progress}%` }}
          ></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Kill Switches Critiques
          </h4>
          <div className="space-y-3">
            {['LIVE_TRADING', 'EXECUTION', 'STRATEGY_GENERATION']?.map(module => {
              const isActive = phase1Data?.details?.some(d => 
                d?.item?.includes(module) && d?.status === 'completed'
              );
              return (
                <div key={module} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{module}</span>
                  <button
                    onClick={() => handleKillSwitchToggle(module, isActive)}
                    disabled={activatingSwitch === module}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-red-500 hover:bg-red-600 text-white' :'bg-gray-700 hover:bg-red-500 text-gray-300 hover:text-white'
                    } ${activatingSwitch === module ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {activatingSwitch === module ? (
                      <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                    ) : isActive ? 'ACTIF' : 'INACTIF'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-300 mb-2">Shadow Monitoring</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Health Sentinel actif</div>
              <div>• Anomaly Sentinel en garde</div>
              <div>• DHI &gt; 0.7 monitoring</div>
              <div>• Erreurs/h &lt; 5 alertes</div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">Infrastructure Freeze</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div>• Versions Docker verrouillées</div>
              <div>• Package.json figé</div>
              <div>• Clés API rotées</div>
              <div>• RLS service role only</div>
            </div>
          </div>
        </div>

        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="font-medium text-amber-300">Objectif Phase 1</span>
          </div>
          <p className="text-sm text-amber-200">
            {phase1Data?.objective || 'Geler tout ordre live ou exécution réelle. Les agents continuent apprentissage, auto-évaluation et paper-trading seulement.'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Phase 2 - Certification Panel
const Phase2CertificationPanel = ({ phase2Data }) => {
  const [selectedTest, setSelectedTest] = useState(null);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-orange-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">
          <Target className="h-6 w-6" />
          Phase 2 - Certification & Go Live
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-orange-300">{phase2Data?.duration}</span>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            phase2Data?.status === 'completed' 
              ? 'bg-green-900/50 text-green-300 border border-green-500/30' :'bg-orange-900/50 text-orange-300 border border-orange-500/30'
          }`}>
            {phase2Data?.status === 'completed' ? 'Complété' : 'En Cours'}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Progression Certification</span>
          <span className="text-sm font-medium text-orange-300">{phase2Data?.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${phase2Data?.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Certification Technique */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Étape 1 - Certification Technique (10-12h)
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">K6 Test Brutal</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-green-300">10k req/min</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 ml-4">
              Target: P99 latency &lt; 1500ms, Mémoire stable &lt; +10%
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Audit Sécurité Paranoïaque</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                <span className="text-xs text-amber-300">En cours</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 ml-4">
              Tests: VITE_API_KEY→401, Kill Switch→503, Agent Error→Sentry
            </div>
          </div>
        </div>

        {/* Validation Opérationnelle */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Étape 2 - Validation Opérationnelle (8-10h)
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Control Room Setup</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                <span className="text-xs text-blue-300">Grafana+Prometheus</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Documentation Génération</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-green-300">PDF généré</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 ml-4">
              Manuel AAS, Diagrammes, Procédures Kill-Switch, RLS Logic
            </div>
          </div>
        </div>

        {/* Déploiement Canary */}
        <div className="bg-gray-800/50 rounded-lg p-4 md:col-span-2">
          <h4 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Étape 3 - Déploiement Canary (48h)
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Paper Trading 48h</span>
                <span className="text-xs text-green-300">Mode NORMAL</span>
              </div>
              <div className="text-xs text-gray-400">
                Validation: PnL simulé cohérent, aucun blocage
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Première Stratégie Live</span>
                <span className="text-xs text-amber-300">0.1% portfolio</span>
              </div>
              <div className="text-xs text-gray-400">
                24h: PnL réel ≈ PnL papier ±5%, Santé NORMAL
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {phase2Data?.details?.map((detail, index) => (
          <div key={index} className="bg-gray-800/30 rounded-lg p-3">
            <div className={`h-2 w-2 rounded-full mx-auto mb-2 ${
              detail?.status === 'completed' ? 'bg-green-400' :
              detail?.status === 'pending' ? 'bg-amber-400' : 'bg-gray-500'
            }`}></div>
            <div className="text-xs text-gray-300">{detail?.item}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Certification Progress Dashboard
const CertificationProgressDashboard = ({ certificationData, deploymentData }) => {
  const currentProgress = certificationData?.overallProgress || 87;
  const targetProgress = 100;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Certification Progress Dashboard
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{currentProgress}%</div>
          <div className="text-xs text-gray-400">Target: {targetProgress}%</div>
        </div>
      </div>
      {/* Progress Visualization */}
      <div className="relative mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">87% Pré-Production</span>
          <span className="text-sm text-green-300">100% Certifié Production</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-green-500 h-4 rounded-full transition-all duration-1000 relative"
            style={{ width: `${currentProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
          {/* Milestone markers */}
          <div className="absolute top-0 left-0 w-full h-full flex items-center">
            {[87, 92, 95, 100]?.map(milestone => (
              <div 
                key={milestone}
                className="absolute flex flex-col items-center"
                style={{ left: `${milestone}%` }}
              >
                <div className="w-0.5 h-4 bg-gray-400"></div>
                <span className="text-xs text-gray-400 mt-1">{milestone}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Niveau Actuel</span>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-lg font-bold text-green-400">
            {certificationData?.currentStatus?.level || 'Pré-Production Sécurisée'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {certificationData?.currentStatus?.description}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Certification</span>
            <Target className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-blue-400">
            {certificationData?.certificationLevel?.level || 'AAS-4'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {certificationData?.certificationLevel?.status}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Temps Estimé</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-400">48-102h</div>
          <div className="text-xs text-gray-400 mt-1">2 phases synchronisées</div>
        </div>
      </div>
      {/* Next Milestones */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h4 className="font-semibold text-gray-300 mb-3">Prochaines Étapes</h4>
        <div className="space-y-2">
          {certificationData?.nextMilestones?.map((milestone, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              <span className="text-sm text-gray-300">{milestone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Canary Deployment Controller
const CanaryDeploymentController = ({ canaryData }) => {
  const [trafficSplit, setTrafficSplit] = useState(1); // 1% initially
  const [isDeploying, setIsDeploying] = useState(false);

  const handleTrafficSplit = (percentage) => {
    setTrafficSplit(percentage);
    // Implement traffic splitting logic
  };

  const handleRollback = () => {
    setIsDeploying(true);
    // Implement rollback logic
    setTimeout(() => setIsDeploying(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Canary Deployment Controller
        </h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm text-green-300">Live</span>
        </div>
      </div>
      {/* Traffic Split Control */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-300">Traffic Split</span>
          <span className="text-sm font-medium text-purple-300">{trafficSplit}% Canary</span>
        </div>
        <div className="space-y-2">
          {[0.1, 1, 5, 10, 25, 50]?.map(percentage => (
            <button
              key={percentage}
              onClick={() => handleTrafficSplit(percentage)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                trafficSplit === percentage
                  ? 'bg-purple-500 text-white' :'bg-gray-800 text-gray-300 hover:bg-purple-500/20'
              }`}
            >
              {percentage}% Traffic → Canary, {100-percentage}% Traffic → Stable
            </button>
          ))}
        </div>
      </div>
      {/* Deployment Status */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-green-300 mb-3">Stable Version</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Version:</span>
              <span className="text-green-300">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Traffic:</span>
              <span className="text-green-300">{100 - trafficSplit}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Health:</span>
              <span className="text-green-300">Healthy</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-300 mb-3">Canary Version</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Version:</span>
              <span className="text-purple-300">v2.2.0-canary</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Traffic:</span>
              <span className="text-purple-300">{trafficSplit}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Health:</span>
              <span className="text-purple-300">Monitoring</span>
            </div>
          </div>
        </div>
      </div>
      {/* Emergency Controls */}
      <div className="flex gap-4">
        <button
          onClick={handleRollback}
          disabled={isDeploying}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          {isDeploying ? (
            <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full"></div>
          ) : (
            <Square className="h-4 w-4" />
          )}
          Emergency Rollback
        </button>
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
          <Play className="h-4 w-4" />
          Promote to Production
        </button>
      </div>
    </div>
  );
};

// Phase 3 - Future Vision N6
const Phase3FutureVisionPanel = ({ phase3Data }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-blue-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Phase 3 - Vision N6 Future
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-300">Ongoing</span>
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-500/30">
            Developing
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Évolution N6</span>
          <span className="text-sm font-medium text-blue-300">{phase3Data?.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${phase3Data?.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-cyan-300 mb-3">Meta-Gouvernance</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div>• IA ajuste ses propres seuils</div>
            <div>• IQS, DHI, risk auto-optimisation</div>
            <div>• Apprentissage de l'apprentissage</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-indigo-300 mb-3">Apprentissage Fédéré</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div>• Partage inter-serveurs</div>
            <div>• Multi-AAS collaboration</div>
            <div>• Collective intelligence</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-purple-300 mb-3">Régulation IA-IA</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div>• Vote croisé de signaux</div>
            <div>• Consensus décisionnel</div>
            <div>• Auto-régulation système</div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-pink-300 mb-3">Raisonnement Causal</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div>• Graphe macro + micro</div>
            <div>• Alt-data intégration</div>
            <div>• Cause-effect mapping</div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-blue-400" />
          <span className="font-medium text-blue-300">Vision AAS N6</span>
        </div>
        <p className="text-sm text-blue-200">
          {phase3Data?.vision || 'Next Generation Autonomous Intelligence - L\'entité IA devient capable de créer ses propres stratégies d\'évolution et d\'optimisation, dépassant les capacités de programmation initiale.'}
        </p>
      </div>
    </div>
  );
};

// Main Component
export default function AASLevel5ProductionCertificationCommandCenter() {
  const [certificationData, setCertificationData] = useState(null);
  const [deploymentData, setDeploymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCertificationData();
  }, []);

  const loadCertificationData = async () => {
    try {
      setLoading(true);
      const [certResponse, deploymentResponse] = await Promise.allSettled([
        aasCertificationService?.getCertificationProgress(),
        deploymentProgressService?.getComprehensiveProgress('system')
      ]);

      if (certResponse?.status === 'fulfilled' && !certResponse?.value?.error) {
        setCertificationData(certResponse?.value?.data);
      }

      if (deploymentResponse?.status === 'fulfilled' && !deploymentResponse?.value?.error) {
        setDeploymentData(deploymentResponse?.value?.data);
      }
    } catch (err) {
      setError(`Erreur de chargement: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKillSwitchToggle = async (action, module, reason) => {
    try {
      const userId = 'system'; // In real implementation, get from auth context
      if (action === 'activate') {
        await aasCertificationService?.activateKillSwitch(module, reason, userId);
      } else {
        await aasCertificationService?.deactivateKillSwitch(module, reason, userId);
      }
      // Reload data to reflect changes
      await loadCertificationData();
    } catch (err) {
      setError(`Erreur Kill Switch: ${err?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-300">Chargement du Centre de Certification AAS Level 5...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-green-400 bg-clip-text text-transparent mb-2">
            AAS Level 5 Production Certification Command Center
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Orchestration complète du plan de certification production en 3 phases synchronisées : 
            Gel contrôlé + Shadow Mode → Certification technique → Vision N6 Future
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>
      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Phase 1 */}
          <div className="space-y-6">
            <Phase1ControlledFreezePanel 
              phase1Data={certificationData?.phases?.phase1}
              onKillSwitchToggle={handleKillSwitchToggle}
            />
            <Phase2CertificationPanel 
              phase2Data={certificationData?.phases?.phase2}
            />
          </div>

          {/* Center Column - Progress Dashboard */}
          <div className="space-y-6">
            <CertificationProgressDashboard 
              certificationData={certificationData}
              deploymentData={deploymentData}
            />
            <CanaryDeploymentController 
              canaryData={{}}
            />
          </div>

          {/* Right Column - Phase 3 */}
          <div className="space-y-6">
            <Phase3FutureVisionPanel 
              phase3Data={certificationData?.phases?.phase3}
            />

            {/* Critical Systems Status */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-500/20">
              <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Systèmes Critiques
              </h3>
              <div className="space-y-3">
                {Object.entries(certificationData?.criticalSystems || {})?.map(([system, data]) => (
                  <div key={system} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 capitalize">{system}</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      data?.status === 'operational' || data?.status === 'active' || data?.status === 'secured' ?'bg-green-900/50 text-green-300'
                        : data?.status === 'degraded'|| data?.status === 'vulnerable' ?'bg-red-900/50 text-red-300' :'bg-amber-900/50 text-amber-300'
                    }`}>
                      {data?.status || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Timeline */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-500/20">
              <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Timeline Certification
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-300">Phase 1 - Gel Contrôlé</span>
                  <span className="text-gray-400">24-72h</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-orange-300">Phase 2 - Certification</span>
                  <span className="text-gray-400">24-30h</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-300">Phase 3 - Vision N6</span>
                  <span className="text-gray-400">Ongoing</span>
                </div>
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-green-300">Total Estimation</span>
                    <span className="text-green-300">48-102h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}