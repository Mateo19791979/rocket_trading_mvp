import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Activity, Shield, Database, Settings, Brain, FileText, Rocket, Bot, Users, BarChart3, Download, BookOpen, Zap, Target, Search, Layers, Monitor, Play, Check, X, AlertTriangle, Clock, Lightbulb, Lock, Key, Server, GitBranch, Cpu, HardDrive, Network, Wifi, Cloud } from 'lucide-react';

// Import existing components from consolidated pages
import AgentStatusGrid from '../../components/ui/AgentStatusGrid';
import PortfolioMetrics from '../portfolio-view-enhanced/components/PortfolioMetrics';
import RiskMetricsPanel from '../risk-controller-dashboard/components/RiskMetricsPanel';
import MarketFilters from '../market-analysis/components/MarketFilters';
import QuotesTable from '../market-analysis/components/QuotesTable';
import SystemHealthCard from '../dashboard/components/SystemHealthCard';
import WatchlistCard from '../dashboard/components/WatchlistCard';
import ChartCard from '../dashboard/components/ChartCard';
import BalanceCard from '../dashboard/components/BalanceCard';
import QuickActionsCard from '../dashboard/components/QuickActionsCard';

// AI-specific components - preserved functionality
import AgentConfigModal from '../ai-agents/components/AgentConfigModal';
import StrategyPanel from '../options-strategy-ai/components/StrategyPanel';
import ScreeningForm from '../options-strategy-ai/components/ScreeningForm';
import ResultsTable from '../options-strategy-ai/components/ResultsTable';
import AgentLeaderboard from '../real-time-agent-performance/components/AgentLeaderboard';
import PerformanceComparison from '../real-time-agent-performance/components/PerformanceComparison';
import RealTimeActivity from '../real-time-agent-performance/components/RealTimeActivity';
import CorrelationMatrix from '../correlation-hunter/components/CorrelationMatrix';
import CorrelationChart from '../correlation-hunter/components/CorrelationChart';
import ChatWidget from '../ai-chiefs-chat-interface/components/ChatWidget';
import Icon from '../../components/AppIcon';

// Import enhanced services
import { riskControllerService } from '../../services/riskControllerService';
import PipelineBooksService from '../../services/pipelineBooksService';
import RecommendationService from '../../services/recommendationService';
import monitoringControlService from '../../services/monitoringControlService';

import { CheckCircle } from 'lucide-react';

const UnifiedDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeModule, setActiveModule] = useState(searchParams?.get('module') || 'trading');
  const [activeSubview, setActiveSubview] = useState(searchParams?.get('view') || 'overview');
  
  // AI-specific states - preserved from original pages
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [aiStrategies, setAiStrategies] = useState([]);
  const [aiAgents, setAiAgents] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);

  // Pipeline Books states
  const [pipelineStats, setPipelineStats] = useState(null);
  const [registryData, setRegistryData] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  // New Recommendation states
  const [recommendations, setRecommendations] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const [recommendationStats, setRecommendationStats] = useState({});
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // Add monitoring states
  const [monitoringData, setMonitoringData] = useState({
    busMonitor: null,
    alerts: null,
    riskController: null,
    pdfReports: null,
    advantages: null
  });
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    status: 'online',
    uptime: '99.9%',
    connections: 24,
    lastUpdate: new Date()?.toISOString()
  });

  // API Testing states
  const [apiTests, setApiTests] = useState({
    '/status': { status: 'pending', response: null, loading: false },
    '/scores?window=252': { status: 'pending', response: null, loading: false },
    '/select': { status: 'pending', response: null, loading: false }
  });

  // Enhanced Risk & Security states
  const [riskData, setRiskData] = useState({
    controller: null,
    metrics: null,
    events: [],
    portfolioRisk: null
  });
  const [riskLoading, setRiskLoading] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  // Enhanced Data Pipeline states 
  const [dataQuality, setDataQuality] = useState({
    completeness: 94.2,
    accuracy: 98.1,
    timeliness: 96.8,
    consistency: 97.3
  });

  // Enhanced DevOps & Deployment states
  const [deploymentStatus, setDeploymentStatus] = useState({
    frontend: { status: 'healthy', version: 'v2.1.3', uptime: '99.9%' },
    backend: { status: 'healthy', version: 'v1.8.2', uptime: '99.8%' },
    database: { status: 'healthy', version: 'v14.9', uptime: '100%' },
    redis: { status: 'healthy', version: 'v7.0', uptime: '99.7%' }
  });
  const [infrastructureMetrics, setInfrastructureMetrics] = useState({
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 12
  });

  useEffect(() => {
    setSearchParams({ module: activeModule, view: activeSubview });
  }, [activeModule, activeSubview, setSearchParams]);

  // Load pipeline data when pipeline subview is active
  useEffect(() => {
    if (activeModule === 'data' && activeSubview === 'pipeline') {
      loadPipelineData();
    }
  }, [activeModule, activeSubview]);

  // Load recommendations when AI recommendations subview is active
  useEffect(() => {
    if (activeModule === 'ai' && activeSubview === 'recommendations') {
      loadRecommendationsData();
    }
  }, [activeModule, activeSubview]);

  // Add effect to load monitoring data when monitoring module is active
  useEffect(() => {
    if (activeModule === 'monitoring') {
      loadMonitoringData();
    }
  }, [activeModule, activeSubview]);

  // Enhanced Risk & Security loading effect
  useEffect(() => {
    if (activeModule === 'risk') {
      loadRiskSecurityData();
    }
  }, [activeModule, activeSubview]);

  // Enhanced Data Pipeline loading effect  
  useEffect(() => {
    if (activeModule === 'data') {
      loadEnhancedPipelineData();
    }
  }, [activeModule, activeSubview]);

  // Enhanced DevOps loading effect
  useEffect(() => {
    if (activeModule === 'devops') {
      loadDevOpsData();
    }
  }, [activeModule, activeSubview]);

  const loadPipelineData = async () => {
    setPipelineLoading(true);
    try {
      const [statsResponse, registryResponse] = await Promise.all([
        PipelineBooksService?.getProcessingStats(),
        PipelineBooksService?.getPipelineRegistryStats()
      ]);

      if (!statsResponse?.error) {
        setPipelineStats(statsResponse?.data);
      }

      if (!registryResponse?.error) {
        setRegistryData(registryResponse?.data);
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setPipelineLoading(false);
    }
  };

  const loadRecommendationsData = async () => {
    setRecommendationsLoading(true);
    try {
      // Simulate user ID - in real app, get from auth context
      const currentUserId = 'f7b7dbed-d459-4d2c-a21d-0fce13ee257c'; // Using mock user from schema
      
      const [recommendationsResponse, preferencesResponse, statsResponse] = await Promise.all([
        RecommendationService?.getRecommendations(currentUserId, { limit: 20 }),
        RecommendationService?.getUserPreferences(currentUserId),
        RecommendationService?.getUserStats(currentUserId)
      ]);

      if (!recommendationsResponse?.error) {
        setRecommendations(recommendationsResponse?.data || []);
      }

      if (!preferencesResponse?.error) {
        setUserPreferences(preferencesResponse?.data);
      }

      if (!statsResponse?.error) {
        setRecommendationStats(statsResponse?.data || {});
      }
    } catch (error) {
      console.error('Error loading recommendations data:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const loadMonitoringData = async () => {
    setMonitoringLoading(true);
    try {
      const [busMonitor, alerts, riskController, pdfReports, advantages] = await Promise.all([
        monitoringControlService?.getBusMonitorStatus(),
        monitoringControlService?.getAlertManagement(),
        monitoringControlService?.getRiskController(),
        monitoringControlService?.getPdfAutoReports(),
        monitoringControlService?.getMonitoringAdvantages()
      ]);

      setMonitoringData({
        busMonitor: busMonitor?.data,
        alerts: alerts?.data,
        riskController: riskController?.data,
        pdfReports: pdfReports?.data,
        advantages: advantages?.data
      });

      // Update system health based on monitoring data
      const totalAgents = busMonitor?.data?.summary?.total || 0;
      const healthyAgents = busMonitor?.data?.summary?.healthy || 0;
      const systemStatus = healthyAgents === totalAgents ? 'optimal' : healthyAgents > totalAgents * 0.8 ? 'warning' : 'error';
      
      setSystemHealth({
        status: systemStatus === 'optimal' ? 'online' : systemStatus === 'warning' ? 'degraded' : 'offline',
        uptime: advantages?.data?.professional?.uptime || '99.8%',
        connections: totalAgents,
        lastUpdate: new Date()?.toISOString()
      });
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setMonitoringLoading(false);
    }
  };

  const loadRiskSecurityData = async () => {
    setRiskLoading(true);
    try {
      const [controllerResponse, metricsResponse, portfolioRiskResponse] = await Promise.all([
        riskControllerService?.getRiskController(),
        riskControllerService?.getRiskMetrics(),
        riskControllerService?.getPortfolioRisk()
      ]);

      // Load risk events if controller exists
      let events = [];
      if (controllerResponse?.data?.id) {
        const eventsResponse = await riskControllerService?.getRiskEvents(controllerResponse?.data?.id, 20);
        events = eventsResponse?.data || [];
      }

      setRiskData({
        controller: controllerResponse?.data,
        metrics: metricsResponse?.data,
        events,
        portfolioRisk: portfolioRiskResponse?.data
      });

      // Generate security alerts based on risk level
      generateSecurityAlerts(portfolioRiskResponse?.data);

    } catch (error) {
      console.error('Error loading risk & security data:', error);
    } finally {
      setRiskLoading(false);
    }
  };

  const loadEnhancedPipelineData = async () => {
    setPipelineLoading(true);
    try {
      const [statsResponse, registryResponse] = await Promise.all([
        PipelineBooksService?.getProcessingStats(),
        PipelineBooksService?.getPipelineRegistryStats()
      ]);

      if (!statsResponse?.error) {
        setPipelineStats(statsResponse?.data);
      }

      if (!registryResponse?.error) {
        setRegistryData(registryResponse?.data);
      }

      // Simulate enhanced data quality metrics
      setDataQuality({
        completeness: 94.2 + Math.random() * 2,
        accuracy: 98.1 + Math.random() * 1,
        timeliness: 96.8 + Math.random() * 2,
        consistency: 97.3 + Math.random() * 1.5
      });

    } catch (error) {
      console.error('Error loading enhanced pipeline data:', error);
    } finally {
      setPipelineLoading(false);
    }
  };

  const loadDevOpsData = async () => {
    try {
      // Simulate infrastructure metrics updates
      setInfrastructureMetrics({
        cpu: 23 + Math.random() * 15,
        memory: 67 + Math.random() * 10,
        disk: 45 + Math.random() * 5,
        network: 12 + Math.random() * 8
      });

      // Update deployment status
      const statusOptions = ['healthy', 'warning', 'error'];
      setDeploymentStatus(prev => ({
        ...prev,
        frontend: { ...prev?.frontend, status: Math.random() > 0.9 ? 'warning' : 'healthy' },
        backend: { ...prev?.backend, status: Math.random() > 0.95 ? 'warning' : 'healthy' }
      }));

    } catch (error) {
      console.error('Error loading DevOps data:', error);
    }
  };

  const generateSecurityAlerts = (portfolioRisk) => {
    const alerts = [];
    
    if (portfolioRisk?.riskLevel === 'high' || portfolioRisk?.riskLevel === 'extreme') {
      alerts?.push({
        id: 'high-risk',
        title: 'Niveau de risque élevé détecté',
        message: `Portfolio en risque ${portfolioRisk?.riskLevel}. P&L: ${portfolioRisk?.totalPnL?.toFixed(2)}€`,
        severity: 'critical',
        type: 'risk'
      });
    }

    if (portfolioRisk?.positionCount > 50) {
      alerts?.push({
        id: 'position-limit',
        title: 'Limite de positions approchée',
        message: `${portfolioRisk?.positionCount} positions actives. Considérez la consolidation.`,
        severity: 'warning',
        type: 'position'
      });
    }

    setSecurityAlerts(alerts);
  };

  const handleEmergencyKillswitch = async () => {
    try {
      let response = await monitoringControlService?.triggerEmergencyKillswitch('Emergency trigger from unified dashboard');
      if (!response?.error) {
        // Refresh monitoring data after killswitch
        loadMonitoringData();
      }
    } catch (error) {
      console.error('Error triggering emergency killswitch:', error);
    }
  };

  const generateImmediateReport = async () => {
    try {
      let response = await monitoringControlService?.generateImmediateReport('unified_monitoring_summary');
      if (!response?.error) {
        // Refresh PDF reports data
        loadMonitoringData();
      }
    } catch (error) {
      console.error('Error generating immediate report:', error);
    }
  };

  const handleRecommendationAction = async (recommendationId, action, data = {}) => {
    try {
      let response;
      
      switch (action) {
        case 'read':
          response = await RecommendationService?.markAsRead(recommendationId);
          break;
        case 'dismiss':
          response = await RecommendationService?.dismissRecommendation(recommendationId, data?.reason);
          break;
        case 'execute':
          response = await RecommendationService?.executeRecommendation(recommendationId, data);
          break;
        default:
          return;
      }

      if (!response?.error) {
        // Refresh recommendations data
        loadRecommendationsData();
      }
    } catch (error) {
      console.error(`Error handling recommendation action ${action}:`, error);
    }
  };

  const handleExportPipelineReport = () => {
    const reportData = {
      timestamp: new Date()?.toISOString(),
      pipelineStats,
      registryData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-books-report-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // API Testing functionality
  const testApiEndpoint = async (endpoint) => {
    const apiBase = import.meta.env?.VITE_MVP_API_BASE || 'https://api.trading-mvp.com';
    
    setApiTests(prev => ({
      ...prev,
      [endpoint]: { ...prev?.[endpoint], loading: true, status: 'testing' }
    }));

    try {
      let response = await fetch(`${apiBase}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response?.json();
      const success = response?.ok;

      setApiTests(prev => ({
        ...prev,
        [endpoint]: {
          status: success ? 'success' : 'error',
          response: { status: response?.status, data, headers: Object.fromEntries(response?.headers) },
          loading: false
        }
      }));
    } catch (error) {
      setApiTests(prev => ({
        ...prev,
        [endpoint]: {
          status: 'error',
          response: { error: error?.message },
          loading: false
        }
      }));
    }
  };

  const testAllEndpoints = async () => {
    const endpoints = Object.keys(apiTests);
    for (const endpoint of endpoints) {
      await testApiEndpoint(endpoint);
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const renderApiTestingContent = () => {
    const apiBase = import.meta.env?.VITE_MVP_API_BASE || 'https://api.trading-mvp.com';
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              <Monitor className="w-5 h-5 inline mr-2" />
              API Backend Testing - {apiBase}
            </h2>
            <button
              onClick={testAllEndpoints}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Test All Endpoints
            </button>
          </div>
          <p className="text-gray-300">
            Test des endpoints critiques pour vérifier le statut du backend API.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(apiTests)?.map(([endpoint, test]) => {
            const getStatusIcon = () => {
              switch (test?.status) {
                case 'success': return <Check className="w-5 h-5 text-green-500" />;
                case 'error': return <X className="w-5 h-5 text-red-500" />;
                case 'testing': return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
                default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
              }
            };

            const getStatusColor = () => {
              switch (test?.status) {
                case 'success': return 'border-green-500';
                case 'error': return 'border-red-500';
                case 'testing': return 'border-yellow-500';
                default: return 'border-gray-500';
              }
            };

            return (
              <div key={endpoint} className={`bg-gray-800 rounded-lg p-6 border-2 ${getStatusColor()}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">
                    {endpoint}
                  </h3>
                  {getStatusIcon()}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Status:</span>
                    <span className={`text-sm font-medium ${
                      test?.status === 'success' ? 'text-green-400' :
                      test?.status === 'error' ? 'text-red-400' :
                      test?.status === 'testing'? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {test?.status?.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => testApiEndpoint(endpoint)}
                    disabled={test?.loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
                  >
                    {test?.loading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Test Endpoint
                      </>
                    )}
                  </button>

                  {test?.response && (
                    <div className="mt-3">
                      <div className="bg-black/50 rounded p-3 text-xs">
                        <div className="text-gray-300 mb-2">Response:</div>
                        {test?.response?.status && (
                          <div className="text-yellow-300 mb-1">Status: {test?.response?.status}</div>
                        )}
                        <pre className="text-green-300 overflow-x-auto">
                          {JSON.stringify(test?.response?.data || test?.response?.error, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">🔧 Tests équivalents en curl:</h3>
          <div className="space-y-3">
            <div className="bg-black/50 rounded p-4">
              <code className="text-green-300 text-sm">
                curl -s {apiBase}/status
              </code>
            </div>
            <div className="bg-black/50 rounded p-4">
              <code className="text-green-300 text-sm">
                curl -s {apiBase}/scores?window=252
              </code>
            </div>
            <div className="bg-black/50 rounded p-4">
              <code className="text-green-300 text-sm">
                curl -s {apiBase}/select
              </code>
            </div>
          </div>
        </div>
        <div className="bg-blue-900/50 rounded-lg p-6 border border-blue-400/30">
          <h3 className="text-blue-200 font-semibold mb-2">💡 Configuration API</h3>
          <p className="text-blue-100 text-sm">
            API Base URL configurée: <code className="bg-black/30 px-2 py-1 rounded">{apiBase}</code>
            <br />
            Modifiez <code className="bg-black/30 px-2 py-1 rounded">VITE_MVP_API_BASE</code> dans .env pour changer l'URL de base.
          </p>
        </div>
      </div>
    );
  };

  const renderRecommendationsContent = () => {
    if (recommendationsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des recommandations...</p>
          </div>
        </div>
      );
    }

    const getRecommendationIcon = (type) => {
      switch (type) {
        case 'buy': return <TrendingUp className="w-5 h-5 text-green-500" />;
        case 'sell': return <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />;
        case 'hold': return <Shield className="w-5 h-5 text-blue-500" />;
        case 'reduce': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
        case 'increase': return <Target className="w-5 h-5 text-purple-500" />;
        default: return <Lightbulb className="w-5 h-5 text-gray-500" />;
      }
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="space-y-6">
        {/* Header avec statistiques */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              <Lightbulb className="w-6 h-6 inline mr-2" />
              Recommandations Personnalisées IA
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm opacity-80">Total</p>
                <p className="text-xl font-bold">{recommendationStats?.total_recommendations || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-80">Actives</p>
                <p className="text-xl font-bold">{recommendationStats?.active_recommendations || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-80">Confiance moy.</p>
                <p className="text-xl font-bold">{recommendationStats?.avg_confidence_score || 0}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-80">Taux réussite</p>
                <p className="text-xl font-bold">{recommendationStats?.avg_success_rate || 0}%</p>
              </div>
            </div>
          </div>
          <p className="text-purple-100">
            Recommandations générées par nos 24 agents IA basées sur votre profil de risque et vos préférences d'investissement.
          </p>
        </div>

        {/* Grid des recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {recommendations?.map((recommendation) => (
            <div 
              key={recommendation?.id} 
              className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                !recommendation?.is_read ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                {/* En-tête de la recommandation */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getRecommendationIcon(recommendation?.recommendation_type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{recommendation?.title}</h3>
                      <p className="text-sm text-gray-500">
                        {recommendation?.asset?.symbol} - {recommendation?.asset?.name}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(recommendation?.priority)}`}>
                    {recommendation?.priority?.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {recommendation?.description}
                </p>

                {/* Métriques */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">Confiance</p>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${recommendation?.confidence_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{recommendation?.confidence_score || 0}%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">Risque</p>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${recommendation?.risk_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{recommendation?.risk_score || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Prix et retour potentiel */}
                {(recommendation?.target_price || recommendation?.potential_return_percent) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {recommendation?.target_price && (
                      <div>
                        <p className="text-gray-500">Prix cible</p>
                        <p className="font-semibold text-green-600">${recommendation?.target_price}</p>
                      </div>
                    )}
                    {recommendation?.potential_return_percent && (
                      <div>
                        <p className="text-gray-500">Retour potentiel</p>
                        <p className="font-semibold text-blue-600">+{recommendation?.potential_return_percent}%</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {recommendation?.source?.replace('_', ' ')?.toUpperCase()}
                    </span>
                    {!recommendation?.is_read && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!recommendation?.is_read && (
                      <button
                        onClick={() => handleRecommendationAction(recommendation?.id, 'read')}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Marquer lu
                      </button>
                    )}
                    <button
                      onClick={() => handleRecommendationAction(recommendation?.id, 'dismiss', { reason: 'not_interested' })}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Ignorer
                    </button>
                    <button
                      onClick={() => handleRecommendationAction(recommendation?.id, 'execute', { amount: 1000 })}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Exécuter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si pas de recommandations */}
        {recommendations?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune recommandation disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Nos agents IA analysent continuellement le marché pour vous proposer des opportunités personnalisées.
            </p>
            <button 
              onClick={loadRecommendationsData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Actualiser les recommandations
            </button>
          </div>
        )}

        {/* Panel de configuration des préférences */}
        {userPreferences && (
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Settings className="w-5 h-5 inline mr-2" />
              Préférences de recommandation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Style d'investissement</p>
                <p className="font-semibold capitalize">{userPreferences?.investment_style?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Appétit pour le risque</p>
                <p className="font-semibold capitalize">{userPreferences?.risk_appetite?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Montant d'investissement</p>
                <p className="font-semibold">
                  ${userPreferences?.min_investment_amount} - ${userPreferences?.max_investment_amount}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRiskSecurityContent = () => {
    const riskModuleKey = `risk-${activeSubview}`;
    
    if (riskLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données de sécurité...</p>
          </div>
        </div>
      );
    }

    switch (riskModuleKey) {
      case 'risk-overview':
        return (
          <div className="space-y-6">
            {/* Security Status Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  <Shield className="w-6 h-6 inline mr-2" />
                  Sécurité & Gestion des Risques
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm opacity-80">Niveau Risque</p>
                    <p className={`text-xl font-bold ${
                      riskData?.portfolioRisk?.riskLevel === 'low' ? 'text-green-200' :
                      riskData?.portfolioRisk?.riskLevel === 'medium' ? 'text-yellow-200' :
                      riskData?.portfolioRisk?.riskLevel === 'high' ? 'text-orange-200' : 'text-red-200'
                    }`}>
                      {riskData?.portfolioRisk?.riskLevel?.toUpperCase() || 'LOW'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">P&L Total</p>
                    <p className="text-xl font-bold">{riskData?.portfolioRisk?.totalPnL?.toFixed(2) || '0.00'}€</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">Positions</p>
                    <p className="text-xl font-bold">{riskData?.portfolioRisk?.positionCount || 0}</p>
                  </div>
                </div>
              </div>
              <p className="text-red-100">
                Surveillance continue avec kill-switch automatique et alertes en temps réel.
              </p>
            </div>

            {/* Security Alerts */}
            {securityAlerts?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                  Alertes de Sécurité Active
                </h3>
                <div className="space-y-3">
                  {securityAlerts?.map((alert) => (
                    <div key={alert?.id} className={`p-4 rounded-lg border-l-4 ${
                      alert?.severity === 'critical' ? 'bg-red-50 border-red-500' :
                      alert?.severity === 'warning'? 'bg-yellow-50 border-yellow-500' : 'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{alert?.title}</h4>
                          <p className="text-gray-600 text-sm mt-1">{alert?.message}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert?.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert?.severity === 'warning'? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {alert?.severity?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Controller & Kill Switch */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Contrôleur de Risque
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Max Perte Quotidienne</span>
                    <span className="font-semibold">{riskData?.controller?.max_daily_loss || 1000}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Max Drawdown</span>
                    <span className="font-semibold">{riskData?.controller?.max_portfolio_drawdown || 10}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kill-Switch Status</span>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        riskData?.controller?.killswitch_active ? 'bg-red-500' : 'bg-gray-300'
                      }`}></span>
                      <span className="text-sm">
                        {riskData?.controller?.killswitch_active ? 'ACTIF' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => riskControllerService?.activateKillswitch(riskData?.controller?.id, 'Manual activation from dashboard')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    🚨 EMERGENCY KILLSWITCH
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-blue-600" />
                  Sécurité Système
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Chiffrement</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">AES-256</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Authentification</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">2FA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Audit Logs</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">ACTIF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rate Limiting</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">100/min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'risk-compliance':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Key className="w-5 h-5 inline mr-2" />
                Conformité & Sécurité Réglementaire
              </h2>
              <p className="text-gray-300">
                Respect des normes GDPR, SOX, et des réglementations financières.
              </p>
            </div>

            {/* Compliance Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">GDPR Compliance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Data Encryption</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ COMPLIANT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">User Consent</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ COMPLIANT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Data Retention</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">⚠ REVIEW</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Financial Regulations</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">MiFID II</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ COMPLIANT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Risk Disclosure</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ COMPLIANT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Transaction Reporting</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">📊 ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Security Standards</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">ISO 27001</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ CERTIFIED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">SOC 2 Type II</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">🔄 PENDING</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Penetration Testing</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">✓ PASSED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <RiskMetricsPanel portfolioRisk={riskData?.portfolioRisk || {}} riskMetrics={riskData?.metrics || {}} />
          </div>
        );
    }
  };

  const renderEnhancedDataPipelineContent = () => {
    const dataModuleKey = `data-${activeSubview}`;
    
    if (pipelineLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du pipeline de données...</p>
          </div>
        </div>
      );
    }

    switch (dataModuleKey) {
      case 'data-overview':
        return (
          <div className="space-y-6">
            {/* Data Pipeline Status */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  <Database className="w-6 h-6 inline mr-2" />
                  Pipeline de Données - Temps Réel
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm opacity-80">Qualité Globale</p>
                    <p className="text-xl font-bold">{((dataQuality?.completeness + dataQuality?.accuracy + dataQuality?.timeliness + dataQuality?.consistency) / 4)?.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">Débit</p>
                    <p className="text-xl font-bold">2.3M/h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">Latence</p>
                    <p className="text-xl font-bold">45ms</p>
                  </div>
                </div>
              </div>
              <p className="text-cyan-100">
                Ingestion temps réel avec validation, nettoyage et transformation automatique.
              </p>
            </div>
            {/* Data Quality Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Complétude</h3>
                  <CheckCircle className={`w-5 h-5 ${dataQuality?.completeness > 95 ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span>{dataQuality?.completeness?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{width: `${dataQuality?.completeness}%`}}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Données disponibles vs attendues</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Précision</h3>
                  <Target className={`w-5 h-5 ${dataQuality?.accuracy > 97 ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span>{dataQuality?.accuracy?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{width: `${dataQuality?.accuracy}%`}}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Exactitude des valeurs</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Temporalité</h3>
                  <Clock className={`w-5 h-5 ${dataQuality?.timeliness > 95 ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span>{dataQuality?.timeliness?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full" 
                      style={{width: `${dataQuality?.timeliness}%`}}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Fraîcheur des données</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Cohérence</h3>
                  <Layers className={`w-5 h-5 ${dataQuality?.consistency > 96 ? 'text-green-500' : 'text-yellow-500'}`} />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score</span>
                    <span>{dataQuality?.consistency?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full" 
                      style={{width: `${dataQuality?.consistency}%`}}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Uniformité inter-sources</p>
              </div>
            </div>
            {/* Pipeline Stages */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-cyan-600" />
                Étapes du Pipeline de Données
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { name: 'Ingestion', status: 'active', throughput: '2.3M/h', icon: Download },
                  { name: 'Validation', status: 'active', throughput: '2.2M/h', icon: Check },
                  { name: 'Transformation', status: 'active', throughput: '2.1M/h', icon: Settings },
                  { name: 'Enrichissement', status: 'active', throughput: '2.0M/h', icon: Brain },
                  { name: 'Distribution', status: 'active', throughput: '1.9M/h', icon: Network }
                ]?.map((stage) => {
                  const Icon = stage?.icon;
                  return (
                    <div key={stage?.name} className="bg-gray-50 rounded-lg p-4 text-center">
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        stage?.status === 'active' ? 'text-green-500' : 'text-gray-400'
                      }`} />
                      <h4 className="font-medium text-gray-900 text-sm">{stage?.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{stage?.throughput}</p>
                      <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                        stage?.status === 'active' ? 'bg-green-400' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'data-pipeline':
        return renderDataPipelineContent(); // Use existing implementation

      case 'data-sources':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Cloud className="w-5 h-5 inline mr-2" />
                Sources de Données - Intégrations Temps Réel
              </h2>
              <p className="text-gray-300">
                Connexions actives avec fournisseurs de données financières et sources alternatives.
              </p>
            </div>
            {/* Data Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Yahoo Finance', status: 'connected', latency: '23ms', endpoints: 15, cost: '€245/month' },
                { name: 'Alpha Vantage', status: 'connected', latency: '45ms', endpoints: 8, cost: '€89/month' },
                { name: 'Bloomberg API', status: 'connected', latency: '12ms', endpoints: 32, cost: '€1,250/month' },
                { name: 'IEX Cloud', status: 'connected', latency: '67ms', endpoints: 12, cost: '€156/month' },
                { name: 'Quandl', status: 'warning', latency: '234ms', endpoints: 5, cost: '€78/month' },
                { name: 'Custom Sources', status: 'connected', latency: '89ms', endpoints: 6, cost: '€0/month' }
              ]?.map((source) => (
                <div key={source?.name} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{source?.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${
                      source?.status === 'connected' ? 'bg-green-500' :
                      source?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latence</span>
                      <span className="font-medium">{source?.latency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Endpoints</span>
                      <span className="font-medium">{source?.endpoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coût</span>
                      <span className="font-medium">{source?.cost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Module Data - {modules?.data?.subviews?.[activeSubview]}
            </h3>
            <p className="text-gray-600">
              Pipeline de données temps réel avec qualité et monitoring avancés.
            </p>
          </div>
        );
    }
  };

  const renderDevOpsContent = () => {
    const devopsModuleKey = `devops-${activeSubview}`;
    
    switch (devopsModuleKey) {
      case 'devops-overview':
        return (
          <div className="space-y-6">
            {/* DevOps Status Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  <Settings className="w-6 h-6 inline mr-2" />
                  DevOps & Infrastructure - Status Global
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm opacity-80">Services</p>
                    <p className="text-xl font-bold text-green-300">4/4 UP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">Uptime</p>
                    <p className="text-xl font-bold text-blue-300">99.9%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">Deployments</p>
                    <p className="text-xl font-bold text-purple-300">127</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-200">
                Infrastructure cloud avec CI/CD automatisé et monitoring 24/7.
              </p>
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(deploymentStatus)?.map(([service, info]) => (
                <div key={service} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 capitalize">{service}</h3>
                    <span className={`w-3 h-3 rounded-full ${
                      info?.status === 'healthy' ? 'bg-green-500' :
                      info?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">{info?.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium text-green-600">{info?.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        info?.status === 'healthy' ? 'bg-green-100 text-green-800' :
                        info?.status === 'warning'? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {info?.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infrastructure Metrics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Server className="w-5 h-5 mr-2 text-gray-600" />
                Métriques Infrastructure Temps Réel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Cpu className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-2">CPU Usage</h4>
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-full h-full bg-gray-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 bg-blue-500 rounded-full" 
                      style={{
                        background: `conic-gradient(#3b82f6 ${infrastructureMetrics?.cpu * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{Math.round(infrastructureMetrics?.cpu)}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <HardDrive className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-2">Memory</h4>
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-full h-full bg-gray-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 bg-green-500 rounded-full" 
                      style={{
                        background: `conic-gradient(#22c55e ${infrastructureMetrics?.memory * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{Math.round(infrastructureMetrics?.memory)}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Database className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-2">Disk</h4>
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-full h-full bg-gray-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 bg-purple-500 rounded-full" 
                      style={{
                        background: `conic-gradient(#a855f7 ${infrastructureMetrics?.disk * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{Math.round(infrastructureMetrics?.disk)}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Wifi className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-2">Network</h4>
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-full h-full bg-gray-200 rounded-full"></div>
                    <div 
                      className="absolute inset-0 bg-orange-500 rounded-full" 
                      style={{
                        background: `conic-gradient(#f97316 ${infrastructureMetrics?.network * 3.6}deg, #e5e7eb 0deg)`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{Math.round(infrastructureMetrics?.network)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'devops-api':
        return renderApiTestingContent(); // Use existing API testing content

      case 'devops-cicd':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <GitBranch className="w-5 h-5 inline mr-2" />
                CI/CD Pipeline - Déploiement Automatisé
              </h2>
              <p className="text-gray-300">
                Intégration et déploiement continu avec tests automatisés et rollback.
              </p>
            </div>
            {/* Pipeline Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Pipeline Status</h3>
                <div className="space-y-4">
                  {[
                    { stage: 'Build', status: 'success', duration: '2m 34s' },
                    { stage: 'Test', status: 'success', duration: '4m 12s' },
                    { stage: 'Security Scan', status: 'success', duration: '1m 45s' },
                    { stage: 'Deploy Staging', status: 'success', duration: '3m 28s' },
                    { stage: 'Deploy Production', status: 'running', duration: '1m 12s' }
                  ]?.map((stage) => (
                    <div key={stage?.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          stage?.status === 'success' ? 'bg-green-500' :
                          stage?.status === 'running' ? 'bg-blue-500 animate-pulse' :
                          stage?.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="font-medium text-gray-900">{stage?.stage}</span>
                      </div>
                      <span className="text-sm text-gray-500">{stage?.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Deployment History</h3>
                <div className="space-y-3">
                  {[
                    { version: 'v2.1.3', branch: 'main', author: 'dev@trading.ai', time: '2 hours ago', status: 'success' },
                    { version: 'v2.1.2', branch: 'hotfix', author: 'ops@trading.ai', time: '1 day ago', status: 'success' },
                    { version: 'v2.1.1', branch: 'main', author: 'dev@trading.ai', time: '2 days ago', status: 'success' },
                    { version: 'v2.1.0', branch: 'main', author: 'dev@trading.ai', time: '3 days ago', status: 'success' }
                  ]?.map((deployment) => (
                    <div key={deployment?.version} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{deployment?.version}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{deployment?.branch}</span>
                        </div>
                        <p className="text-sm text-gray-500">{deployment?.author} • {deployment?.time}</p>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${
                        deployment?.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'devops-deployment':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Rocket className="w-5 h-5 inline mr-2" />
                Déploiement Production - Environnements
              </h2>
              <p className="text-gray-300">
                Gestion des environnements de déploiement avec stratégies blue/green et canary.
              </p>
            </div>
            {/* Environment Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  name: 'Development', 
                  url: 'https://dev.trading-mvp.com', 
                  status: 'healthy', 
                  version: 'v2.1.4-dev', 
                  traffic: '0%',
                  lastDeploy: '30 min ago'
                },
                { 
                  name: 'Staging', 
                  url: 'https://staging.trading-mvp.com', 
                  status: 'healthy', 
                  version: 'v2.1.3', 
                  traffic: '5%',
                  lastDeploy: '2 hours ago'
                },
                { 
                  name: 'Production', 
                  url: 'https://api.trading-mvp.com', 
                  status: 'healthy', 
                  version: 'v2.1.3', 
                  traffic: '95%',
                  lastDeploy: '2 hours ago'
                }
              ]?.map((env) => (
                <div key={env.name} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{env.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${
                      env.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">URL: </span>
                      <a href={env.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {env.url}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">{env.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Traffic</span>
                      <span className="font-medium">{env.traffic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Deploy</span>
                      <span className="font-medium">{env.lastDeploy}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm">
                    View Logs
                  </button>
                </div>
              ))}
            </div>
            {/* Deployment Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions de Déploiement</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy to Staging
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                  <Check className="w-4 h-4 mr-2" />
                  Promote to Prod
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Rollback
                </button>
                <button className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                  <Monitor className="w-4 h-4 mr-2" />
                  Health Check
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Module DevOps - {modules?.devops?.subviews?.[activeSubview]}
            </h3>
            <p className="text-gray-600">
              Infrastructure et déploiement avec monitoring temps réel.
            </p>
          </div>
        );
    }
  };

  const renderAIContent = () => {
    const aiModuleKey = `ai-${activeSubview}`;
    
    switch (aiModuleKey) {
      case 'ai-recommendations':
        return renderRecommendationsContent();
        
      case 'ai-overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Agents IA Actifs</h3>
                    <p className="text-2xl font-bold">24/24</p>
                  </div>
                  <Bot className="w-8 h-8 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Performance Globale</h3>
                    <p className="text-2xl font-bold">+15.7%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Stratégies Actives</h3>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </div>
            </div>
            <AgentStatusGrid />
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">🚀 Intelligence Artificielle Consolidée</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">
                  <strong>Agents d'Ingestion:</strong> 8 agents collectent les données marché en temps réel
                </div>
                <div className="text-gray-300">
                  <strong>Agents de Signaux:</strong> 6 agents génèrent des signaux de trading 
                </div>
                <div className="text-gray-300">
                  <strong>Agents d'Exécution:</strong> 4 agents optimisent les ordres
                </div>
                <div className="text-gray-300">
                  <strong>Agents d'Orchestration:</strong> 6 agents supervisent le système
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-agents':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  <Users className="w-5 h-5 inline mr-2" />
                  24 Agents IA - Système Complet
                </h2>
                <button 
                  onClick={() => setShowAgentConfig(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Configuration Globale
                </button>
              </div>
              <div className="text-gray-300 mb-4">
                Interface unifiée pour tous vos agents IA spécialisés. Configuration, monitoring et performance en temps réel.
              </div>
            </div>
            <AgentStatusGrid />
            {showAgentConfig && (
              <AgentConfigModal
                agent={selectedAgent}
                isOpen={showAgentConfig}
                onClose={() => setShowAgentConfig(false)}
                onSave={(id, config) => console.log('Save config:', id, config)}
              />
            )}
          </div>
        );

      case 'ai-performance':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Performance Temps Réel des Agents IA
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentLeaderboard agents={aiAgents} />
              <PerformanceComparison data={[]} />
            </div>
            <RealTimeActivity activity={[]} />
          </div>
        );

      case 'ai-strategies':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Brain className="w-5 h-5 inline mr-2" />
                Stratégies d'Options IA - Intelligence Avancée
              </h2>
              <p className="text-gray-300">
                L'IA analyse les marchés et propose des stratégies d'options optimisées avec gestion automatique des risques.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ScreeningForm onScreen={(params) => console.log('AI Screening:', params)} />
                <ResultsTable 
                  results={[]}
                  loading={false}
                  onAssetSelect={setSelectedAsset}
                />
              </div>
              <StrategyPanel
                selectedAsset={selectedAsset}
                strategies={aiStrategies}
                loading={false}
                onSendToPaperTrading={(strategy) => console.log('Paper trading:', strategy)}
              />
            </div>
          </div>
        );

      case 'ai-correlation':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Activity className="w-5 h-5 inline mr-2" />
                Chasseur de Corrélations IA
              </h2>
              <p className="text-gray-300">
                Détection automatique de corrélations cachées entre actifs grâce à l'intelligence artificielle.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CorrelationMatrix data={correlationData} selectedAssets={[]} />
              <CorrelationChart selectedAssets={[]} historicalData={[]} />
            </div>
          </div>
        );

      case 'ai-chat':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                <Brain className="w-5 h-5 inline mr-2" />
                Interface de Chat avec les Chefs IA
              </h2>
              <p className="text-gray-300">
                Communiquez directement avec vos chefs IA spécialisés pour des conseils et analyses personnalisés.
              </p>
            </div>
            <div className="h-96">
              <ChatWidget onClose={() => {}} />
            </div>
          </div>
        );

      case 'ai-vision':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                🧠 Vision Ultime - The Living Hedge Fund
              </h2>
              <p className="text-purple-200 text-lg">
                Système d'IA autonome évolutif qui s'adapte et apprend continuellement des marchés financiers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">🧬 Évolution Autonome</h3>
                <p className="text-gray-300 text-sm">
                  L'IA évolue ses stratégies automatiquement basé sur les performances passées et les conditions de marché.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">🔄 Auto-Adaptation</h3>
                <p className="text-gray-300 text-sm">
                  Adaptation continue aux nouvelles conditions de marché sans intervention humaine.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">📊 Intelligence Collective</h3>
                <p className="text-gray-300 text-sm">
                  Les 24 agents partagent leurs connaissances pour une intelligence collective optimisée.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Module IA - {modules?.ai?.subviews?.[activeSubview]}
            </h3>
            <p className="text-gray-600">
              Fonctionnalité IA préservée avec toutes ses capacités avancées.
            </p>
          </div>
        );
    }
  };

  const renderDataPipelineContent = () => {
    if (pipelineLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Pipeline Data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 bg-gradient-to-br from-slate-800 via-slate-900 to-black min-h-screen p-6 rounded-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <span className="text-white font-medium text-sm">
                {new Date()?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            Pipeline Livres → Registry → Orchestrateur
          </h1>
          <p className="text-xl text-white/95 font-medium drop-shadow-md">
            Ingestion doc, extraction de règles, normalisation YAML
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Ingestion & Indexation */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl mr-4 shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">📥 Ingestion & Indexation</h2>
              </div>
              
              <div className="space-y-4 text-white/95">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <span>PDF → texte (OCR si besoin), chapitres/sections</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <span>Chunking + embeddings → base vectorielle</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Search className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <span>Recherche sémantique avec citations (livre/chapitre/page)</span>
                </div>
              </div>

              {/* Stats Display */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <p className="text-blue-200 text-sm">Livres traités</p>
                  <p className="text-2xl font-bold text-white">{pipelineStats?.books_processed || '20'}</p>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <p className="text-blue-200 text-sm">Pages indexées</p>
                  <p className="text-2xl font-bold text-white">{pipelineStats?.pages_indexed || '4,250'}</p>
                </div>
              </div>
            </div>

            {/* Extraction de stratégies */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-teal-600 to-green-600 rounded-xl mr-4 shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">🧩 Extraction de stratégies (agents)</h2>
              </div>
              
              <div className="space-y-4 text-white/95">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Knowledge Miner</strong> : BUY/SELL/ALLOC/RISK, paramètres</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Layers className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Normalizer</strong> : fiches YAML (schema Registry)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-teal-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Risk-Auditor</strong> : contraintes (DD, vol, taille)</span>
                </div>
              </div>

              {/* Agent Status */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="bg-green-500/30 rounded-lg p-3 text-center border border-green-400/20">
                  <p className="text-green-200 text-xs">Knowledge Miner</p>
                  <p className="text-green-100 font-bold">ACTIVE</p>
                </div>
                <div className="bg-blue-500/30 rounded-lg p-3 text-center border border-blue-400/20">
                  <p className="text-blue-200 text-xs">Normalizer</p>
                  <p className="text-blue-100 font-bold">ACTIVE</p>
                </div>
                <div className="bg-purple-500/30 rounded-lg p-3 text-center border border-purple-400/20">
                  <p className="text-purple-200 text-xs">Risk-Auditor</p>
                  <p className="text-purple-100 font-bold">ACTIVE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Passage à l'échelle */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mr-4 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">🚀 Passage à l'échelle</h2>
              </div>
              
              <div className="space-y-4 text-white/95">
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                  <span>Lot initial : 20 livres → Registry v0.1</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                  <span>Objectif : 500+ livres • dédoublonnage + score confiance</span>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm text-purple-200">
                  <span>Registry v0.1</span>
                  <span>20/500 livres</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3 border border-white/10">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full" style={{width: '4%'}}></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <p className="text-purple-200 text-sm">Score confiance</p>
                    <p className="text-xl font-bold text-white">94.2%</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <p className="text-purple-200 text-sm">Dédoublonnage</p>
                    <p className="text-xl font-bold text-white">96.8%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Intégration produit */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl mr-4 shadow-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">🔗 Intégration produit</h2>
              </div>
              
              <div className="space-y-4 text-white/95">
                <div className="flex items-start space-x-3">
                  <Monitor className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Rocket.new</strong> : Poster + Kanban + Bus Monitor (live)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Backend</strong> : /registry, /scores, /select, /allocate</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-orange-300 mt-0.5 flex-shrink-0" />
                  <span><strong>Exécution</strong> : backend Express + garde-fous</span>
                </div>
              </div>

              {/* API Status */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/10">
                  <span className="text-orange-200">/registry</span>
                  <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-sm border border-green-400/20">LIVE</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/10">
                  <span className="text-orange-200">/scores</span>
                  <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-sm border border-green-400/20">LIVE</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/10">
                  <span className="text-orange-200">/allocate</span>
                  <span className="px-2 py-1 bg-yellow-500/30 text-yellow-200 rounded text-sm border border-yellow-400/20">DEV</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleExportPipelineReport}
            className="flex items-center px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl transition-all duration-300 border border-white/40 hover:border-white/60 shadow-lg"
          >
            <Download className="w-5 h-5 mr-3" />
            <span className="font-semibold">Export Pipeline Report</span>
          </button>
        </div>

        {/* Include the provided image */}
        <div className="mt-12 flex justify-center">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
            <img 
              src="/assets/images/Planche_Pipeline_Livres-1758899086353.jpg" 
              alt="Pipeline Livres → Registry → Orchestrateur"
              className="max-w-full h-auto rounded-lg shadow-2xl"
            />
            <p className="text-white/80 text-sm text-center mt-4">
              Architecture complète du pipeline de traitement des livres financiers
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderMonitoringContent = () => {
    if (monitoringLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données de monitoring...</p>
          </div>
        </div>
      );
    }

    const monitoringModuleKey = `monitoring-${activeSubview}`;

    switch (monitoringModuleKey) {
      case 'monitoring-overview':
        return (
          <div className="space-y-6">
            {/* Monitoring Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  <Activity className="w-6 h-6 inline mr-2" />
                  Monitoring & System Control
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm opacity-80">System Status</p>
                    <p className={`text-xl font-bold ${
                      systemHealth?.status === 'online' ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {systemHealth?.status?.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">Agents Actifs</p>
                    <p className="text-xl font-bold">{systemHealth?.connections || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-80">Uptime</p>
                    <p className="text-xl font-bold">{systemHealth?.uptime}</p>
                  </div>
                </div>
              </div>
              <p className="text-green-100">
                Monitoring temps réel avec alertes automatiques et contrôles d'urgence.
              </p>
            </div>

            {/* Emergency Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Actions d'Urgence
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleEmergencyKillswitch}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center"
                  >
                    🚨 EMERGENCY KILLSWITCH
                  </button>
                  <button
                    onClick={generateImmediateReport}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center"
                  >
                    📊 Generate Immediate Report
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Monitor className="w-5 h-5 mr-2 text-blue-600" />
                  Bus Monitor Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Agents</span>
                    <span className="font-semibold">{monitoringData?.busMonitor?.summary?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Healthy</span>
                    <span className="font-semibold text-green-600">{monitoringData?.busMonitor?.summary?.healthy || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Warnings</span>
                    <span className="font-semibold text-yellow-600">{monitoringData?.busMonitor?.summary?.warnings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Errors</span>
                    <span className="font-semibold text-red-600">{monitoringData?.busMonitor?.summary?.errors || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Advantages */}
            {monitoringData?.advantages && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Avantages du Système
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Professional</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Uptime: {monitoringData?.advantages?.professional?.uptime}</li>
                      <li>• {monitoringData?.advantages?.professional?.monitoring}</li>
                      <li>• {monitoringData?.advantages?.professional?.support}</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Technique</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• {monitoringData?.advantages?.technical?.scalability}</li>
                      <li>• {monitoringData?.advantages?.technical?.performance}</li>
                      <li>• {monitoringData?.advantages?.technical?.reliability}</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Stratégique</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• {monitoringData?.advantages?.strategic?.automation}</li>
                      <li>• {monitoringData?.advantages?.strategic?.intelligence}</li>
                      <li>• {monitoringData?.advantages?.strategic?.competitive}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Module Monitoring - {modules?.monitoring?.subviews?.[activeSubview]}
            </h3>
            <p className="text-gray-600">
              Monitoring système avec contrôles temps réel et alertes automatiques.
            </p>
          </div>
        );
    }
  };

  const modules = {
    trading: {
      icon: TrendingUp,
      title: 'Trading & Portfolio',
      color: 'blue',
      subviews: {
        overview: 'Vue générale',
        portfolio: 'Portfolio',
        positions: 'Positions',
        orders: 'Ordres',
        pnl: 'P&L',
        market: 'Analyse marché'
      }
    },
    ai: {
      icon: Brain,
      title: 'Intelligence Artificielle',
      color: 'purple',
      subviews: {
        overview: 'Vue générale IA',
        agents: 'Agents IA (24 agents)',
        performance: 'Performance temps réel',
        roster: 'Roster & Configuration',
        strategies: 'Stratégies d\'options IA',
        correlation: 'Chasseur de corrélations',
        chat: 'Chat avec les chefs IA',
        recommendations: 'Recommandations personnalisées',
        vision: 'Vision ultime (Hedge Fund)'
      }
    },
    monitoring: {
      icon: Activity,
      title: 'Monitoring & System',
      color: 'green',
      subviews: {
        overview: 'Vue générale',
        health: 'Santé système',
        events: 'Bus événements',
        alerts: 'Alertes',
        logs: 'Logs système',
        metrics: 'Métriques temps réel'
      }
    },
    risk: {
      icon: Shield,
      title: 'Risk & Security',
      color: 'red',
      subviews: {
        overview: 'Vue générale',
        metrics: 'Métriques risque',
        controls: 'Contrôles & Kill-switch',
        limits: 'Limites & Seuils',
        alerts: 'Alertes risque',
        compliance: 'Conformité & Sécurité'
      }
    },
    data: {
      icon: Database,
      title: 'Data & Pipeline',
      color: 'cyan',
      subviews: {
        overview: 'Vue générale',
        pipeline: 'Pipeline Books Registry',
        pipelines: 'Pipelines de données',
        sources: 'Sources ouvertes',
        quality: 'Qualité données',
        registry: 'Registre & Catalogues',
        corpus: 'Corpus privé'
      }
    },
    reports: {
      icon: FileText,
      title: 'Reports & Analysis',
      color: 'orange',
      subviews: {
        overview: 'Vue générale',
        weekly: 'Rapports hebdomadaires',
        research: 'Centre de recherche',
        analytics: 'Analytics avancées',
        exports: 'Exports PDF',
        templates: 'Modèles de rapports'
      }
    },
    devops: {
      icon: Settings,
      title: 'DevOps & Deployment',
      color: 'gray',
      subviews: {
        overview: 'Vue générale',
        api: 'API Testing & Monitoring',
        cicd: 'CI/CD Pipelines',
        security: 'Sécurité & Nettoyage',
        deployment: 'Déploiement production',
        infrastructure: 'Infrastructure & SSL',
        monitoring: 'Monitoring DevOps'
      }
    },
    rocket: {
      icon: Rocket,
      title: 'Rocket Integration',
      color: 'indigo',
      subviews: {
        overview: 'Vue générale',
        hub: 'Hub d\'intégration',
        architecture: 'Architecture globale',
        roadmap: 'Roadmap & Checklist',
        configuration: 'Configuration CI/CD',
        optimization: 'Optimisations'
      }
    }
  };

  const renderModuleContent = () => {
    const moduleKey = `${activeModule}-${activeSubview}`;
    
    // Handle AI module separately with full functionality
    if (activeModule === 'ai') {
      return renderAIContent();
    }

    // Handle Enhanced Risk & Security module
    if (activeModule === 'risk') {
      return renderRiskSecurityContent();
    }

    // Handle Enhanced Data Pipeline module
    if (activeModule === 'data') {
      return renderEnhancedDataPipelineContent();
    }

    // Handle Enhanced DevOps module
    if (activeModule === 'devops') {
      return renderDevOpsContent();
    }

    // Handle Monitoring module - FIXED
    if (activeModule === 'monitoring') {
      return renderMonitoringContent();
    }
    
    switch (moduleKey) {
      case 'trading-overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <BalanceCard balance={0} pnl={0} pnlPercentage={0} />
            <SystemHealthCard systemHealth={systemHealth} />
            <WatchlistCard symbols={['AAPL', 'GOOGL', 'MSFT']} />
            <ChartCard chartData={[]} selectedSymbol="AAPL" />
            <QuickActionsCard recentTrades={[]} />
            <div className="xl:col-span-1">
              <PortfolioMetrics metrics={{}} loading={false} />
            </div>
          </div>
        );
      
      case 'trading-market':
        return (
          <div className="space-y-6">
            <MarketFilters onFiltersChange={() => {}} />
            <QuotesTable 
              searchTerm=""
              filters={{}}
              onSymbolSelect={() => {}}
              onBuyClick={() => {}}
              onSellClick={() => {}}
            />
          </div>
        );
      
      case 'risk-overview':
        return (
          <div className="space-y-6">
            <RiskMetricsPanel portfolioRisk={{}} riskMetrics={{}} />
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Module {modules?.[activeModule]?.title}
            </h3>
            <p className="text-gray-600 mb-4">
              Vue: {modules?.[activeModule]?.subviews?.[activeSubview]}
            </p>
            <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-gray-700">
                Cette vue consolidée remplace <strong>50+ pages spécialisées</strong> en une interface unifiée et dynamique.
                <br />
                <span className="text-purple-600 font-medium">✅ Risk & Security: Contrôleur de risque avancé avec Kill-Switch</span>
                <br />
                <span className="text-cyan-600 font-medium">✅ Data Pipeline: Qualité des données temps réel</span>
                <br />
                <span className="text-gray-600 font-medium">✅ DevOps: Infrastructure monitoring et déploiement</span>
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trading MVP Unifié
              </div>
              <div className="text-sm text-gray-500">
                50+ pages → 1 interface | ✨ Risk, Data & DevOps Améliorés
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Module: <span className="font-medium">{modules?.[activeModule]?.title}</span>
              </div>
              {activeModule === 'risk' && (
                <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  Risk & Security
                </div>
              )}
              {activeModule === 'data' && (
                <div className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full font-medium">
                  Data Pipeline
                </div>
              )}
              {activeModule === 'devops' && (
                <div className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                  DevOps & Deploy
                </div>
              )}
              {activeModule === 'ai' && activeSubview === 'recommendations' && (
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                  Recommandations IA
                </div>
              )}
              {activeModule === 'ai' && (
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                  IA Complète
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Modules
            </h3>
            <div className="space-y-2">
              {Object.entries(modules)?.map(([key, module]) => {
                const Icon = module.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveModule(key);
                      setActiveSubview('overview');
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeModule === key
                        ? `bg-${module.color}-50 text-${module.color}-700 border-r-2 border-${module.color}-500`
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {module.title}
                    {key === 'ai' && (
                      <span className="ml-auto text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded">
                        24
                      </span>
                    )}
                    {(key === 'risk' || key === 'data' || key === 'devops') && (
                      <span className="ml-auto text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sub-navigation */}
            {activeModule && modules?.[activeModule] && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Vues {activeModule === 'ai' ? '🧠' : activeModule === 'data' ? '📊' : activeModule === 'risk' ? '🛡️' : activeModule === 'devops' ? '⚙️' : ''}
                </h3>
                <div className="space-y-1">
                  {Object.entries(modules?.[activeModule]?.subviews)?.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveSubview(key)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeSubview === key
                          ? `bg-${modules?.[activeModule]?.color}-50 text-${modules?.[activeModule]?.color}-700 font-medium`
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                      {key === 'recommendations' && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                          NEW
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderModuleContent()}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;