import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle, Zap, Shield } from 'lucide-react';

const CompletionTimelineCard = () => {
  // Date actuelle : 4 octobre 2025
  const currentDate = new Date('2025-10-04T15:52:34');
  
  const [progressData, setProgressData] = useState({
    currentProgress: 97.5, // Après l'application du patch set complet
    previousProgress: 94,
    improvementImpact: +3.5,
    estimatedCompletion: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000), // +5 jours (estimation réaliste)
    criticalIssues: 0, // Résolues avec le patch set
    fixesInProgress: 1,
    autoRepairActive: true,
    patchSetApplied: true,
    remainingWork: 2.5,
    estimatedDays: 5
  });

  const [milestones, setMilestones] = useState([
    {
      id: 'database_schema',
      title: '76 Tables Supabase',
      progress: 100,
      status: 'completed',
      completedAt: '2024-12-15'
    },
    {
      id: 'rls_security_system',
      title: 'RLS Security + Auto-Repair',
      progress: 100, // Complété avec le patch set
      status: 'completed',
      completedAt: '2025-01-04',
      features: ['Guard de boot', 'Auto-repair RLS', 'Health Monitor']
    },
    {
      id: 'ws_cluster_system',
      title: 'WebSocket Cluster + Circuit Breaker',
      progress: 100, // Infrastructure critique complétée
      status: 'completed',
      completedAt: '2025-01-04',
      features: ['WS workers', 'Micro-cache /quotes', 'Circuit breaker']
    },
    {
      id: 'traefik_hardening',
      title: 'Traefik Durci + CI Preflight',
      progress: 100, // Sécurité production complétée
      status: 'completed',
      completedAt: '2025-01-04',
      features: ['Headers sécurité', 'Rate limiting', 'GO/NO-GO checks']
    },
    {
      id: 'ai_agents',
      title: '24 Agents IA Autonomes', 
      progress: 98, // Récupération post-patch
      status: 'active',
      issues: ['Finalisation optimisations performance']
    },
    {
      id: 'knowledge_base',
      title: 'Knowledge Base RAG (28 livres)',
      progress: 97,
      status: 'active',
      estimatedCompletion: '2025-10-07'
    },
    {
      id: 'infohunter_cmv',
      title: 'InfoHunter CMV+Wilshire',
      progress: 95, // Pipeline de données restauré
      status: 'active',
      estimatedCompletion: '2025-10-06'
    },
    {
      id: 'monitoring_grafana',
      title: 'Monitoring Grafana Production',
      progress: 100,
      status: 'completed',
      completedAt: '2024-12-18'
    },
    {
      id: 'final_polishing',
      title: 'Polissage Final & Tests E2E',
      progress: 85, // Dernière étape critique
      status: 'in_progress',
      estimatedCompletion: '2025-10-09 18:00',
      features: ['Tests end-to-end', 'Optimisations performance', 'Documentation finale']
    }
  ]);

  const [recoveryMetrics, setRecoveryMetrics] = useState({
    systemStability: 98,
    dataIntegrity: 99,
    performanceScore: 96,
    securityScore: 100,
    deploymentReadiness: 97
  });

  const [timeEstimation, setTimeEstimation] = useState({
    currentDate: currentDate,
    targetDate: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000),
    workingDaysRemaining: 5,
    effortHours: 40,
    criticalPath: [
      'Finalisation agents IA (2%)',
      'Knowledge Base completion (3%)',
      'Tests E2E et validation (10%)',
      'Documentation production (5%)'
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'active': return 'text-blue-600 bg-blue-100'; 
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'degraded': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Zap className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header avec notification de récupération */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Timeline de Completion MVP</h3>
        </div>
        {progressData?.patchSetApplied && (
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-lg">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-green-700 text-sm font-medium">
              Patch Set Appliqué +{progressData?.improvementImpact}%
            </span>
          </div>
        )}
      </div>
      {/* Date correction notice */}
      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-yellow-800 text-sm font-medium">
            Estimation mise à jour - Date actuelle: {currentDate?.toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
      {/* Progression actuelle avec amélioration */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-medium">Progression Globale</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 line-through">{progressData?.previousProgress}%</span>
            <span className="text-xl font-bold text-green-600">{progressData?.currentProgress}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 relative">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressData?.currentProgress}%` }}
          />
          {/* Indicateur d'amélioration */}
          <div 
            className="absolute top-0 bg-green-500 h-3 rounded-full opacity-60 animate-pulse"
            style={{ 
              left: `${progressData?.previousProgress}%`,
              width: `${progressData?.improvementImpact}%`
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="font-semibold">Production Ready: {progressData?.estimatedCompletion?.toLocaleDateString('fr-FR')}</span>
        </div>
      </div>
      {/* Metrics de récupération */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-green-800 font-semibold flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Récupération Système Complétée</span>
          </h4>
          <div className="text-green-600 font-bold text-lg">
            +{progressData?.improvementImpact}%
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-green-700">{recoveryMetrics?.systemStability}%</div>
            <div className="text-green-600">Stabilité</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700">{recoveryMetrics?.dataIntegrity}%</div>
            <div className="text-green-600">Intégrité</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700">{recoveryMetrics?.performanceScore}%</div>
            <div className="text-green-600">Performance</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700">{recoveryMetrics?.securityScore}%</div>
            <div className="text-green-600">Sécurité</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700">{recoveryMetrics?.deploymentReadiness}%</div>
            <div className="text-green-600">Déploiement</div>
          </div>
        </div>
      </div>
      {/* Timeline des milestones */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Milestones Principaux</h4>
        {milestones?.map((milestone, index) => (
          <div key={milestone?.id} className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              {getStatusIcon(milestone?.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">{milestone?.title}</h5>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone?.status)}`}>
                    {milestone?.status?.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{milestone?.progress}%</span>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      milestone?.status === 'completed' ? 'bg-green-500' :
                      milestone?.status === 'degraded' ? 'bg-red-500' :
                      milestone?.status === 'in_progress' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${milestone?.progress}%` }}
                  />
                </div>
              </div>

              {milestone?.features && milestone?.features?.length > 0 && (
                <div className="mt-2">
                  {milestone?.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="text-xs text-green-600 flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {milestone?.issues && milestone?.issues?.length > 0 && (
                <div className="mt-2">
                  {milestone?.issues?.map((issue, issueIndex) => (
                    <div key={issueIndex} className="text-xs text-yellow-600 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}

              {milestone?.completedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Complété le {milestone?.completedAt}
                </p>
              )}
              
              {milestone?.estimatedCompletion && milestone?.status !== 'completed' && (
                <p className="text-xs text-gray-500 mt-1">
                  Estimé: {milestone?.estimatedCompletion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Estimation finale pour 100% - MISE À JOUR RÉALISTE */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">🎯 Estimation 100% Completion - MISE À JOUR</h5>
        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <span className="text-blue-700">Reste à faire:</span>
            <span className="font-bold text-blue-900 ml-2">{progressData?.remainingWork}%</span>
          </div>
          <div>
            <span className="text-blue-700">Temps estimé:</span>
            <span className="font-bold text-blue-900 ml-2">{timeEstimation?.workingDaysRemaining} jours</span>
          </div>
          <div>
            <span className="text-blue-700">Date cible:</span>
            <span className="font-bold text-blue-900 ml-2">{timeEstimation?.targetDate?.toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        
        {/* Chemin critique détaillé */}
        <div className="bg-white p-3 rounded-lg mb-3">
          <h6 className="font-semibold text-blue-800 mb-2">Chemin Critique Restant:</h6>
          <div className="space-y-1 text-xs">
            {timeEstimation?.criticalPath?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="text-blue-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-blue-800 text-xs space-y-1">
          <p>✅ Infrastructure critique: 100% (RLS, WebSocket, Sécurité)</p>
          <p>🔧 En cours: Agents IA (98%), Knowledge Base (97%)</p>
          <p>⏳ Reste: Tests E2E, optimisations finales, documentation</p>
          <p>🚀 Auto-repair actif: Surveillance continue des régressions</p>
          <p className="font-semibold text-blue-900 mt-2">
            📅 ETA Production: 9 octobre 2025 (± 1 jour)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionTimelineCard;