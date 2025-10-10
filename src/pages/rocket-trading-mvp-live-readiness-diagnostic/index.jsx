import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Database,
  Key,
  Wifi,
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

const LiveReadinessDiagnostic = () => {
  const [diagnosticData, setDiagnosticData] = useState({
    completion: 67,
    issues: [
      {
        id: 'api_keys',
        title: 'Clés API Providers Manquantes',
        status: 'critical',
        progress: 0,
        impact: 10,
        description: 'Finnhub, Alpha Vantage, TwelveData API keys non configurées',
        solution: 'Configurer via Provider Configuration Management Center',
        estimateHours: 1,
        icon: Key
      },
      {
        id: 'ohlc_data',
        title: 'OHLC Data Vide',
        status: 'critical', 
        progress: 0,
        impact: 15,
        description: 'Table OHLC manquante, pas d\'historique de données',
        solution: 'Créer migration + backfill 7 jours de données',
        estimateHours: 1.5,
        icon: Database
      },
      {
        id: 'websocket',
        title: 'WebSocket Non Branché',
        status: 'critical',
        progress: 0, 
        impact: 8,
        description: 'Agents AI inactifs, pas de streaming temps réel',
        solution: 'Déployer WebSocket service + Redis integration',
        estimateHours: 1,
        icon: Wifi
      }
    ],
    healthChecks: [
      {
        category: 'Infrastructure',
        status: 'healthy',
        score: 100,
        items: ['Supabase DB (71 tables)', 'React Frontend', 'Backend API', 'Authentication']
      },
      {
        category: 'Data Providers',
        status: 'failed',
        score: 0,
        items: ['Finnhub API ❌', 'Alpha Vantage ❌', 'TwelveData ❌']
      },
      {
        category: 'Real-time Systems',
        status: 'degraded',
        score: 30,
        items: ['WebSocket Server ❌', 'Redis Queue ⚠️', 'AI Agents ❌']
      },
      {
        category: 'Data Quality',
        status: 'degraded', 
        score: 25,
        items: ['OHLC Aggregation ❌', 'Market Data ⚠️', 'Historical Backfill ❌']
      }
    ]
  });

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [actionPlan, setActionPlan] = useState([
    {
      phase: 1,
      title: 'Configurer Providers',
      duration: '1h',
      status: 'pending',
      tasks: [
        'Accéder Provider Configuration Management Center',
        'Insérer FINNHUB_API_KEY, ALPHAVANTAGE_API_KEY',
        'Test connectivity avec curl providers/health',
        'Vérifier provider health checks = active'
      ]
    },
    {
      phase: 2, 
      title: 'Créer OHLC Aggregator',
      duration: '1.5h',
      status: 'pending',
      tasks: [
        'Migration CREATE TABLE ohlc (symbol, tf, ts, o,h,l,c,v)',
        'Backfill historique 7 jours via /history endpoint',
        'Configurer live aggregation from ticks',
        'Test curl ohlc/latest?symbol=AAPL'
      ]
    },
    {
      phase: 3,
      title: 'WebSocket Bridge', 
      duration: '1h',
      status: 'pending',
      tasks: [
        'Déployer Node.js WebSocket server port 8088',
        'Redis pub/sub pour data.market.{SYMBOL}.1m',
        'UI React hook useWebSocketQuotes avec fallback HTTP',
        'Test streaming connection'
      ]
    },
    {
      phase: 4,
      title: 'Tests Finaux',
      duration: '30min', 
      status: 'pending',
      tasks: [
        'curl providers/health → 2+ providers active',
        'curl quotes?symbols=AAPL,MSFT&src=auto → live data',
        'curl ohlc?symbol=AAPL&from=2025-09-30 → historical',
        'WebSocket connection test → streaming OK'
      ]
    }
  ]);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'healthy': case'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded': case'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed': case'critical':
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': case'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'degraded': case'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'failed': case'critical':
      default:
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const calculateTotalHours = () => {
    return diagnosticData?.issues?.reduce((total, issue) => total + issue?.estimateHours, 0);
  };

  const calculateFinalCompletion = () => {
    const totalImpact = diagnosticData?.issues?.reduce((total, issue) => total + issue?.impact, 0);
    return Math.min(diagnosticData?.completion + totalImpact, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Helmet>
        <title>🚨 Rocket Trading MVP - Live Readiness Diagnostic | 67% → 100%</title>
        <meta name="description" content="Diagnostic précis des blocages empêchant progression au-delà de 67% et plan d'action pour atteindre 100% opérationnel" />
      </Helmet>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">
                  🚨 Trading MVP Live Readiness Diagnostic
                </h1>
                <p className="text-sm text-gray-600">
                  Diagnostic précis • 67% → 100% en 3-4h
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{diagnosticData?.completion}%</div>
                <div className="text-xs text-gray-500">Actuel</div>
              </div>
              <div className="text-3xl text-gray-300">→</div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{calculateFinalCompletion()}%</div>
                <div className="text-xs text-gray-500">Cible</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Progression System</h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                3 Blocages Critiques
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {calculateTotalHours()}h Estimation
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
            <div className="relative">
              <div 
                className="bg-blue-500 h-6 rounded-full transition-all duration-1000"
                style={{ width: `${diagnosticData?.completion}%` }}
              />
              <div 
                className="absolute top-0 bg-green-500 h-6 rounded-full opacity-30 transition-all duration-1000"
                style={{ width: `${calculateFinalCompletion()}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Infrastructure Solide (67%)</span>
            <span className="text-green-600 font-medium">
              +{calculateFinalCompletion() - diagnosticData?.completion}% Cible
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Critical Issues */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                Blocages Critiques Identifiés
              </h3>
              
              <div className="space-y-4">
                {diagnosticData?.issues?.map((issue) => {
                  const IconComponent = issue?.icon;
                  return (
                    <div
                      key={issue?.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedIssue?.id === issue?.id 
                          ? 'border-blue-500 bg-blue-50' :'border-red-200 bg-red-50 hover:border-red-300'
                      }`}
                      onClick={() => setSelectedIssue(issue)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <IconComponent className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{issue?.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{issue?.description}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="text-xs font-medium text-red-600">
                                Impact: +{issue?.impact}%
                              </span>
                              <span className="text-xs font-medium text-blue-600">
                                Estimation: {issue?.estimateHours}h
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(issue?.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Issue Detail */}
            {selectedIssue && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  🔧 Solution: {selectedIssue?.title}
                </h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Action:</strong> {selectedIssue?.solution}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      Progression: {selectedIssue?.progress}% → 100%
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      +{selectedIssue?.impact}% système
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Health Checks & Action Plan */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                État Système Actuel
              </h3>
              
              <div className="space-y-3">
                {diagnosticData?.healthChecks?.map((check, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${getStatusColor(check?.status)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{check?.category}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-bold mr-2">{check?.score}%</span>
                        {getStatusIcon(check?.status)}
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      {check?.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center">
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Plan */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                Plan d'Action 3-4h
              </h3>
              
              <div className="space-y-4">
                {actionPlan?.map((phase) => (
                  <div key={phase?.phase} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        Phase {phase?.phase}: {phase?.title}
                      </h4>
                      <span className="text-sm font-medium text-blue-600">{phase?.duration}</span>
                    </div>
                    <div className="space-y-1">
                      {phase?.tasks?.map((task, taskIdx) => (
                        <div key={taskIdx} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-blue-300 mr-2 flex-shrink-0"></div>
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Success State */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-2">
              🎯 Objectif: 100% Live-Ready
            </h2>
            <p className="text-xl opacity-90 mb-4">
              Infrastructure solide + 3 corrections = Système opérationnel complet
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="font-bold text-lg">Données Réelles</div>
                <div className="text-sm opacity-90">Providers connectés</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="font-bold text-lg">Historique Complet</div>
                <div className="text-sm opacity-90">OHLC + backfill</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="font-bold text-lg">Temps Réel</div>
                <div className="text-sm opacity-90">WebSocket streaming</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveReadinessDiagnostic;