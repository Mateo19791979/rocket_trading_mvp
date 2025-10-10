import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Play, RefreshCw, Shield, Database } from 'lucide-react';
import { productionRecoveryService } from '../../../services/productionRecoveryService';

const RecoveryPipelinePanel = () => {
  const [recoveryData, setRecoveryData] = useState({
    stages: [],
    overall: 94,
    target: 100,
    regression: -4
  });
  const [loading, setLoading] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    loadRecoveryData();
    const interval = setInterval(loadRecoveryData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const loadRecoveryData = async () => {
    setLoading(true);
    try {
      const response = await productionRecoveryService?.getRecoveryProgress();
      if (!response?.error) {
        setRecoveryData(response);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de récupération:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeStageAction = async (stageIndex) => {
    setLoading(true);
    try {
      switch (stageIndex) {
        case 0: // RLS Correction
          await productionRecoveryService?.executePolicyFix('ai_agents_rls', 'ai_agents');
          break;
        case 1: // E2E Testing
          await productionRecoveryService?.runE2ETests();
          break;
        case 2: // Performance Tuning
          await productionRecoveryService?.optimizeBrotliCompression();
          break;
        case 3: // Security Hardening
          await productionRecoveryService?.runSecurityScan();
          break;
        case 4: // DNS/SSL
          await productionRecoveryService?.renewSSLCertificates();
          break;
        default:
          break;
      }
      await loadRecoveryData();
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stage, index) => {
    if (loading && activeStage === index) return <RefreshCw className="h-5 w-5 animate-spin" />;
    
    switch (stage?.status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Play className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStageColor = (stage) => {
    switch (stage?.status) {
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'in_progress': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'active': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const stageDetails = [
    {
      title: 'RLS Correction',
      icon: <Database className="h-6 w-6" />,
      description: 'Correction des politiques RLS pour débloquer les agents IA',
      actions: [
        'Validation permissions system_ai',
        'Création politique AI logs insertion', 
        'Test accès données temps réel',
        'Vérification select auth.uid()'
      ]
    },
    {
      title: 'Tests E2E Automatisés',
      icon: <CheckCircle className="h-6 w-6" />,
      description: 'Validation automatisée des flux critiques',
      actions: [
        'Dashboard chargement < 2s',
        'Ingestion AltData < 800ms',
        'API InfoHunter payload CMV',
        'RAG embedding > 3 résultats'
      ]
    },
    {
      title: 'Optimisation Performance',
      icon: <RefreshCw className="h-6 w-6" />,
      description: 'Tuning performance pour cibles production',
      actions: [
        'Activation Brotli compression',
        'CDN Cloudflare configuration',
        'WS Bridge max_clients=1000',
        'Scaling horizontal triggers'
      ]
    },
    {
      title: 'Durcissement Sécurité',
      icon: <Shield className="h-6 w-6" />,
      description: 'Sécurisation finale avant déploiement',
      actions: [
        'Import middlewares Traefik',
        'npm audit fix --production',
        'Scan ZAP sécurité',
        'Vérification certificats SSL'
      ]
    },
    {
      title: 'DNS/SSL Finalisation',
      icon: <CheckCircle className="h-6 w-6" />,
      description: 'Configuration DNS et certificats SSL',
      actions: [
        'Let\'s Encrypt auto-renouvellement',
        'Redirection HTTP → HTTPS',
        'Test ssllabs.com A+',
        'Validation domaines'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Pipeline de Récupération</h3>
            <p className="text-sm text-gray-600">Plan d'action priorisé 5 étapes</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Progression Globale</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-red-600">{recoveryData?.overall || 94}%</span>
              <span className="text-sm text-gray-500">→ {recoveryData?.target || 100}%</span>
            </div>
          </div>
          <button
            onClick={loadRecoveryData}
            disabled={loading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4 relative">
          <div 
            className="bg-red-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${recoveryData?.overall || 94}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            Récupération en cours...
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Régression: {Math.abs(recoveryData?.regression || 4)}%</span>
          <span>Objectif: Production Ready</span>
        </div>
      </div>
      <div className="space-y-4">
        {stageDetails?.map((stage, index) => {
          const stageData = recoveryData?.stages?.[index] || {};
          return (
            <div 
              key={index}
              className={`border-2 rounded-lg p-4 transition-all duration-200 ${getStageColor(stageData)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                    {stage?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-lg">{stage?.title}</h4>
                      {getStageIcon(stageData, index)}
                      <span className="text-sm font-medium">
                        {stageData?.completion || 0}%
                      </span>
                    </div>
                    <p className="text-sm mb-3">{stage?.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {stage?.actions?.map((action, actionIndex) => (
                        <div 
                          key={actionIndex}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            actionIndex < (stageData?.completion || 0) / 25 ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="w-16 bg-white rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stageData?.completion >= 95 ? 'bg-green-500' :
                        stageData?.completion >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stageData?.completion || 0}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveStage(index);
                      executeStageAction(index);
                    }}
                    disabled={loading || stageData?.status === 'completed'}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      stageData?.status === 'completed'
                        ? 'bg-green-200 text-green-800 cursor-not-allowed'
                        : stageData?.status === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {stageData?.status === 'completed' ? 'Terminé' : 
                     stageData?.status === 'critical' ? 'URGENT' : 'Exécuter'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">🎯 Objectif Final</h5>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">RLS:</span>
            <span className="font-bold text-blue-900 ml-2">OK</span>
          </div>
          <div>
            <span className="text-blue-700">E2E:</span>
            <span className="font-bold text-blue-900 ml-2">100% pass</span>
          </div>
          <div>
            <span className="text-blue-700">Performance:</span>
            <span className="font-bold text-blue-900 ml-2">p95 &lt; 700ms</span>
          </div>
          <div>
            <span className="text-blue-700">TLS:</span>
            <span className="font-bold text-blue-900 ml-2">A+</span>
          </div>
          <div>
            <span className="text-blue-700">Monitoring:</span>
            <span className="font-bold text-blue-900 ml-2">Sentry/Grafana OK</span>
          </div>
          <div>
            <span className="text-blue-700">Résultat:</span>
            <span className="font-bold text-green-600 ml-2">100% Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPipelinePanel;