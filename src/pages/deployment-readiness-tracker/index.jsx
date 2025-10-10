import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Server, Wifi, Bot, Activity, Timer, Shield, Zap, Eye } from 'lucide-react';

import ApiKeysConfigurationPanel from './components/ApiKeysConfigurationPanel';
import WebSocketMonitoringPanel from './components/WebSocketMonitoringPanel';
import AgentOrchestrationPanel from './components/AgentOrchestrationPanel';
import DeploymentProgressPanel from './components/DeploymentProgressPanel';
import ValidationDashboardPanel from './components/ValidationDashboardPanel';

export default function DeploymentReadinessTracker() {
  const [currentStage, setCurrentStage] = useState(1);
  const [stageProgress, setStageProgress] = useState({
    stage1: { status: 'pending', progress: 0, timeSpent: 0 },
    stage2: { status: 'pending', progress: 0, timeSpent: 0 },
    stage3: { status: 'pending', progress: 0, timeSpent: 0 },
    stage4: { status: 'pending', progress: 0, timeSpent: 0 }
  });

  const [globalProgress, setGlobalProgress] = useState(78); // Starting at 78%
  const [systemStatus, setSystemStatus] = useState({
    providers: { count: 0, healthy: 0 },
    websocket: { status: 'disconnected', connections: 0 },
    agents: { total: 24, active: 0, groups: ['Data Phoenix', 'Quant Oracle', 'Strategy Weaver'] },
    ohlc: { lastBar: new Date(), delay: 0 }
  });

  const deploymentStages = [
    {
      id: 1,
      title: "API Provider Keys",
      subtitle: "Configuration des clés Finnhub, Alpha Vantage, TwelveData",
      duration: "30 min",
      icon: <Server className="w-6 h-6" />,
      color: "blue",
      blockers: "Bloqueur #1 - Clés API manquantes",
      tasks: [
        "Ouvrir le ProviderConfigCenter.jsx",
        "Coller les 3 clés API providers",
        "Cliquer Save puis Test → status Healthy (≥2)",
        "Vérifier /providers/health → JSON avec 'ok': true"
      ]
    },
    {
      id: 2, 
      title: "WebSocket Temps Réel",
      subtitle: "WSQuotesBridge Node.js + Redis pub/sub",
      duration: "45 min",
      icon: <Wifi className="w-6 h-6" />,
      color: "green",
      blockers: "Service WSQuotesBridge inactif",
      tasks: [
        "Démarrer service WSQuotesBridge (Node + Redis)",
        "Écouter sur /ws/quotes",
        "Tester wscat -c 'wss://api.trading-mvp.com/ws/quotes?symbols=AAPL,MSFT&tf=1m'",
        "Fallback HTTP (/quotes) prêt si WS coupe"
      ]
    },
    {
      id: 3,
      title: "Agents IA Actifs",
      subtitle: "Activation des 3 groupes prioritaires sur NATS/Redis",
      duration: "1h30",
      icon: <Bot className="w-6 h-6" />,
      color: "purple",
      blockers: "24 agents configurés mais inactifs",
      tasks: [
        "Activer Data Phoenix (ingestion marché + alt-data)",
        "Activer Quant Oracle (backtest & validation)",
        "Activer Strategy Weaver (génère stratégie RSI+ATR)",
        "Vérifier messages sur strategy.candidate et quant.insight"
      ]
    },
    {
      id: 4,
      title: "Validation Finale",
      subtitle: "Health Dashboard & métriques de production",
      duration: "Variable",
      icon: <Shield className="w-6 h-6" />,
      color: "emerald",
      blockers: "Tests end-to-end requis",
      tasks: [
        "UI Health Dashboard → 3 statuts verts",
        "Sentry: 1 erreur test volontaire",
        "Grafana/Prometheus: métriques visibles",
        "Déploiement 78% → 92% → 100%"
      ]
    }
  ];

  const handleStageProgress = (stageId, progress, status) => {
    setStageProgress(prev => ({
      ...prev,
      [`stage${stageId}`]: {
        ...prev?.[`stage${stageId}`],
        progress,
        status
      }
    }));
    
    // Calculate global progress
    const totalProgress = Object.values({
      ...stageProgress,
      [`stage${stageId}`]: { ...stageProgress?.[`stage${stageId}`], progress }
    })?.reduce((sum, stage) => sum + (stage?.progress * 0.055), 78); // Each stage adds ~5.5% to reach 100%
    
    setGlobalProgress(Math.min(100, totalProgress));
  };

  const getStageStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'pending': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getProgressColor = () => {
    if (globalProgress >= 100) return 'from-emerald-400 to-green-500';
    if (globalProgress >= 92) return 'from-blue-400 to-emerald-400';
    return 'from-orange-400 to-blue-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header with Progress Overview */}
      <div className="border-b border-gray-700 bg-gray-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-400" />
                Deployment Readiness Tracker
              </h1>
              <p className="text-gray-300 mt-2">
                22% restants → 100% Live Ready | Feuille de route immédiate
              </p>
            </div>
            
            {/* Global Progress */}
            <div className="text-right">
              <div className="text-4xl font-bold text-white mb-2">
                {globalProgress?.toFixed(0)}%
              </div>
              <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-out`}
                  style={{ width: `${globalProgress}%` }}
                />
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {globalProgress >= 100 ? '🎉 Production Ready!' : 
                 globalProgress >= 92 ? '⚡ Final Validation': '🚧 Configuration Phase'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: 4-Stage Execution Pipeline */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Stage Selection Tabs */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-400" />
                Pipeline d'Exécution 4-Stages
              </h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {deploymentStages?.map((stage) => (
                  <button
                    key={stage?.id}
                    onClick={() => setCurrentStage(stage?.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      currentStage === stage?.id 
                        ? `border-${stage?.color}-400 bg-${stage?.color}-400/10` 
                        : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {stage?.icon}
                    </div>
                    <div className="text-sm font-medium text-white text-center">
                      {stage?.title}
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-1">
                      {stage?.duration}
                    </div>
                    
                    {/* Stage Progress Indicator */}
                    <div className="mt-2">
                      <div className={`px-2 py-1 rounded text-xs text-center border ${
                        getStageStatusColor(stageProgress?.[`stage${stage?.id}`]?.status)
                      }`}>
                        {stageProgress?.[`stage${stage?.id}`]?.progress || 0}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Current Stage Details */}
              {deploymentStages?.find(s => s?.id === currentStage) && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-600">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Stage {currentStage}: {deploymentStages?.[currentStage-1]?.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {deploymentStages?.[currentStage-1]?.subtitle}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-orange-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {deploymentStages?.[currentStage-1]?.blockers}
                        </span>
                        <span className="text-sm text-blue-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Durée: {deploymentStages?.[currentStage-1]?.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Task Checklist */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Actions à effectuer:</h4>
                    {deploymentStages?.[currentStage-1]?.tasks?.map((task, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-gray-300">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stage-Specific Configuration Panels */}
            {currentStage === 1 && (
              <ApiKeysConfigurationPanel 
                onProgressUpdate={(progress, status) => handleStageProgress(1, progress, status)}
                onSystemStatusUpdate={setSystemStatus}
              />
            )}

            {currentStage === 2 && (
              <WebSocketMonitoringPanel 
                onProgressUpdate={(progress, status) => handleStageProgress(2, progress, status)}
                onSystemStatusUpdate={setSystemStatus}
              />
            )}

            {currentStage === 3 && (
              <AgentOrchestrationPanel 
                onProgressUpdate={(progress, status) => handleStageProgress(3, progress, status)}
                onSystemStatusUpdate={setSystemStatus}
              />
            )}

            {currentStage === 4 && (
              <ValidationDashboardPanel 
                onProgressUpdate={(progress, status) => handleStageProgress(4, progress, status)}
                systemStatus={systemStatus}
              />
            )}

          </div>

          {/* Right Column: Deployment Readiness Panel */}
          <div className="space-y-6">
            <DeploymentProgressPanel 
              globalProgress={globalProgress}
              systemStatus={systemStatus}
              stageProgress={stageProgress}
            />

            {/* Quick Commands Reference */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Check Commands
              </h3>
              
              <div className="space-y-3">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-xs text-gray-400 mb-1"># Providers</div>
                  <code className="text-xs text-green-400">
                    curl -s https://api.trading-mvp.com/providers/health | jq .
                  </code>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-xs text-gray-400 mb-1"># WebSocket Direct</div>
                  <code className="text-xs text-green-400">
                    wscat -c "wss://api.trading-mvp.com/ws/quotes?symbols=AAPL,MSFT&tf=1m"
                  </code>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-xs text-gray-400 mb-1"># OHLC Latest</div>
                  <code className="text-xs text-green-400">
                    curl -s "https://api.trading-mvp.com/ohlc/latest?symbol=AAPL&tf=1m" | jq .
                  </code>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
                  <div className="text-xs text-gray-400 mb-1"># NATS Messages</div>
                  <code className="text-xs text-green-400">
                    nats sub "strategy.*" && nats sub "quant.*"
                  </code>
                </div>
              </div>
            </div>

            {/* System Health Summary */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Status Système
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Providers Status</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    systemStatus?.providers?.healthy >= 2 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {systemStatus?.providers?.healthy}/3 Healthy
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">WebSocket</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    systemStatus?.websocket?.status === 'connected' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {systemStatus?.websocket?.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">AI Agents</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    systemStatus?.agents?.active >= 3 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {systemStatus?.agents?.active}/24 Active
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">OHLC Latency</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    systemStatus?.ohlc?.delay < 60 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                  }`}>
                    {systemStatus?.ohlc?.delay}s delay
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}