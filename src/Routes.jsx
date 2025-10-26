import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Fix inconsistent imports - standardize to relative paths
import OfflineRecoveryCenter from './pages/offline-recovery-center';
import Diagnostic6Verifications from './pages/diagnostic-6-verifications';
import DiagnosticFinalChecks from './pages/diagnostic-5-checks-final';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/dashboard'));
const SystemStatus = React.lazy(() => import('./pages/system-status'));
const TradingMVPLandingPage = React.lazy(() => import('./pages/trading-mvp-landing-page'));
const UnifiedDashboard = React.lazy(() => import('./pages/unified-dashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// AI & Agent Management
const AISystemStatus = React.lazy(() => import('./pages/ai-system-status'));
const AIAgents = React.lazy(() => import('./pages/ai-agents'));
const AgentRoster = React.lazy(() => import('./pages/agent-roster'));
const RealTimeAgentPerformance = React.lazy(() => import('./pages/real-time-agent-performance'));
const InternalAgentsRegistry = React.lazy(() => import('./pages/internal-agents-registry'));
const AIAgentOrchestrationCommandCenter = React.lazy(() => import('./pages/ai-agent-orchestration-command-center'));
const AIAgentEmergencyResponseCenter = React.lazy(() => import('./pages/ai-agent-emergency-response-center'));
const RealTimeAgentActivityMonitor = React.lazy(() => import('./pages/real-time-agent-activity-monitor'));
const AISwarmHub = React.lazy(() => import('./pages/ai-swarm-hub'));

// AI Paper Trading Deployment Orchestrator - NEW
const AIPaperTradingDeploymentOrchestrator = React.lazy(() => import('./pages/ai-paper-trading-deployment-orchestrator'));

// IA Exploration Totale Freedom v4 - NEW
const IAExplorationTotaleFreedomV4CognitiveEngine = React.lazy(() => import('./pages/ia-exploration-totale-freedom-v4-cognitive-engine'));
const IFRSFiscalIntelligenceIntegrationCenter = React.lazy(() => import('./pages/ifrs-fiscal-intelligence-integration-center'));

// Trading & Portfolio Management
const MarketAnalysis = React.lazy(() => import('./pages/market-analysis'));
const PortfolioViewEnhanced = React.lazy(() => import('./pages/portfolio-view-enhanced'));
const PortfolioConsolidatedView = React.lazy(() => import('./pages/portfolio-consolidated-view'));
const StrategyManagement = React.lazy(() => import('./pages/strategy-management'));
const PaperTrading = React.lazy(() => import('./pages/paper-trading'));
const OptionsStrategyAI = React.lazy(() => import('./pages/options-strategy-ai'));
const OptionsScreeningIntelligenceHub = React.lazy(() => import('./pages/options-screening-intelligence-hub'));
const CorrelationHunter = React.lazy(() => import('./pages/correlation-hunter'));
const StrategyRegistryBuilder = React.lazy(() => import('./pages/strategy-registry-builder'));
const GeneticStrategyEvolutionLaboratory = React.lazy(() => import('./pages/genetic-strategy-evolution-laboratory'));
const LiveTradingOrchestrationCenter = React.lazy(() => import('./pages/live-trading-orchestration-center'));

// Risk & Security Management
const RiskControllerDashboard = React.lazy(() => import('./pages/risk-controller-dashboard'));
const SupabaseRlsSecurityConfigurationCenter = React.lazy(() => import('./pages/supabase-rls-security-configuration-center'));
const SupabaseHardeningExpressPlan = React.lazy(() => import('./pages/supabase-hardening-express-plan'));
const ParanoidSecurityAuditComplianceCenter = React.lazy(() => import('./pages/paranoid-security-audit-compliance-center'));
const AdvancedAISecurityThreatIntelligenceCenter = React.lazy(() => import('./pages/advanced-ai-security-threat-intelligence-center'));
const GitSecurityCleanupDocumentation = React.lazy(() => import('./pages/git-security-cleanup-documentation'));

// Research & Innovation
const ResearchInnovationCenter = React.lazy(() => import('./pages/research-innovation-center'));
const AILearningCritiqueCenter = React.lazy(() => import('./pages/ai-learning-critique-center'));
const KnowledgePipelineManagementCenter = React.lazy(() => import('./pages/knowledge-pipeline-management-center'));
const AgentKnowledgeQueryInterface = React.lazy(() => import('./pages/agent-knowledge-query-interface'));
const RAGKnowledgeBaseDashboard = React.lazy(() => import('./pages/rag-knowledge-base-dashboard'));
const KnowledgePlaybooksHub = React.lazy(() => import('./pages/knowledge-playbooks-hub'));
const AIKnowledgeVectorManagement = React.lazy(() => import('./pages/ai-knowledge-vector-management'));
const HybridRAGDynamicIntelligenceOrchestrator = React.lazy(() => import('./pages/hybrid-rag-dynamic-intelligence-orchestrator'));

// Monitoring & Control
const MonitoringControlCenter = React.lazy(() => import('./pages/monitoring-control-center'));
const SelfHealingOrchestrationDashboard = React.lazy(() => import('./pages/self-healing-orchestration-dashboard'));
const BusMonitor = React.lazy(() => import('./pages/bus-monitor'));
const OrchestratorDashboard = React.lazy(() => import('./pages/orchestrator-dashboard'));
const SystemRecoveryOptimizationCenter = React.lazy(() => import('./pages/system-recovery-optimization-center'));
const HealthSentinelObservabilityCommand = React.lazy(() => import('./pages/health-sentinel-observability-command'));
const ProductionMonitoringDashboardWithGrafanaIntegration = React.lazy(() => import('./pages/production-monitoring-dashboard-with-grafana-integration'));

// AAS (Autonomous AI Speculation) Systems
const AASProductionControlCenter = React.lazy(() => import('./pages/aas-production-control-center'));
const AASGeniusPackControlCenter = React.lazy(() => import('./pages/aas-genius-pack-control-center'));
const AASEmergencyResponseKillSwitchCenter = React.lazy(() => import('./pages/aas-emergency-response-kill-switch-center'));
const AASLevel5ProductionCertificationCommandCenter = React.lazy(() => import('./pages/aas-level-5-production-certification-command-center'));
const AASRealTimeAIThoughtsObservatory = React.lazy(() => import('./pages/aas-real-time-ai-thoughts-observatory'));
const AutonomousAISpeculationAASEvolutionCenter = React.lazy(() => import('./pages/autonomous-ai-speculation-aas-evolution-center'));
const AutonomousAIHedgeFundLevel = React.lazy(() => import('./pages/autonomous-ai-hedge-fund-level'));

// Data Processing & Intelligence
const GoogleFinanceIntegration = React.lazy(() => import('./pages/google-finance-integration'));
const WeeklyPdfReports = React.lazy(() => import('./pages/weekly-pdf-reports'));
const PDFDocumentIngestionInterface = React.lazy(() => import('./pages/pdf-document-ingestion-interface'));
const PDFIngestionProcessingCenter = React.lazy(() => import('./pages/pdf-ingestion-processing-center'));
const PipelineBooksRegistryOrchestrator = React.lazy(() => import('./pages/pipeline-books-registry-orchestrator'));
const OpenAccessFeederPipeline = React.lazy(() => import('./pages/open-access-feeder-pipeline'));
const FusionOAFeederPrivateCorpus = React.lazy(() => import('./pages/fusion-oa-feeder-private-corpus'));
const PrivateCorpusManagement = React.lazy(() => import('./pages/private-corpus-management'));

// Provider & Integration Management
const ProviderRouterDashboard = React.lazy(() => import('./pages/provider-router-dashboard'));
const ProviderConfigurationManagementCenter = React.lazy(() => import('./pages/provider-configuration-management-center'));
const FeatureFlagsProviderControlPanel = React.lazy(() => import('./pages/feature-flags-provider-control-panel'));
const ChaosControlPanel = React.lazy(() => import('./pages/chaos-control-panel'));
const IBKRClientPortalGatewayIntegrationCenter = React.lazy(() => import('./pages/ibkr-client-portal-gateway-integration-center'));
const CMVWilshireMarketIntelligenceCenter = React.lazy(() => import('./pages/cmv-wilshire-market-intelligence-center'));

// Project & Deployment Management
const ProjectManagementCockpit = React.lazy(() => import('./pages/project-management-cockpit'));
const DeploymentReadinessTracker = React.lazy(() => import('./pages/deployment-readiness-tracker'));
const TradingMVPProductionDeploymentChecklist = React.lazy(() => import('./pages/trading-mvp-production-deployment-checklist'));
const MVPDeploymentRoadmapDashboard = React.lazy(() => import('./pages/mvp-deployment-roadmap-dashboard'));
const UltraFastGoLiveCommandCenter = React.lazy(() => import('./pages/ultra-fast-go-live-command-center'));
const J1J6GoLiveAutomationCenter = React.lazy(() => import('./pages/j1-j6-go-live-automation-center'));
const ProductionReadinessRecoveryCenter = React.lazy(() => import('./pages/production-readiness-recovery-center'));

// Advanced AI & Intelligence Systems
const AIChiefsChatInterface = React.lazy(() => import('./pages/ai-chiefs-chat-interface'));
const CausalAIMarketRegimeIntelligenceHub = React.lazy(() => import('./pages/causal-ai-market-regime-intelligence-hub'));
const TGEAlphaIntelligenceCenter = React.lazy(() => import('./pages/tge-alpha-intelligence-center'));
const TGEIntelligenceRewardsCenter = React.lazy(() => import('./pages/tge-intelligence-rewards-center'));
const AttentionMarketResourceAllocationHub = React.lazy(() => import('./pages/attention-market-resource-allocation-hub'));
const VisionUltimeTheLivingHedgeFund = React.lazy(() => import('./pages/vision-ultime-the-living-hedge-fund'));
const OmegaAIAntagonistLaboratory = React.lazy(() => import('./pages/omega-ai-antagonist-laboratory'));
const QuantumEngineAgentDiplomacyHub = React.lazy(() => import('./pages/quantum-engine-agent-diplomacy-hub'));
const AIConsciousnessDecisionIntelligenceHub = React.lazy(() => import('./pages/ai-consciousness-decision-intelligence-hub'));
const GlobalAIPerformanceAnalyticsCenter = React.lazy(() => import('./pages/global-ai-performance-analytics-center'));

// Freedom v4 Cognitive Memory System - NEW
const CognitiveMemoryObservatory = React.lazy(() => import('./pages/cognitive-memory-cross-domain-learning-observatory'));

// Infrastructure & DevOps
const DockerProductionDeploymentCenter = React.lazy(() => import('./pages/docker-production-deployment-center'));
const RedisCachePerformanceInfrastructureCenter = React.lazy(() => import('./pages/redis-cache-performance-infrastructure-center'));
const DNSSLManagement = React.lazy(() => import('./pages/dns-ssl-management'));
const SSLSecurityFix = React.lazy(() => import('./pages/ssl-security-fix'));
const APIDeploymentWithTraefik = React.lazy(() => import('./pages/api-deployment-with-traefik'));
const WebSocketQuotesBridgeControlCenter = React.lazy(() => import('./pages/web-socket-quotes-bridge-control-center'));
const PrometheusMonitoringAlertingConfiguration = React.lazy(() => import('./pages/prometheus-monitoring-alerting-configuration'));

// Testing & Quality Assurance
const PerformanceTestingCommandCenter = React.lazy(() => import('./pages/performance-testing-command-center'));
const K6LoadTestingPerformanceCertificationCenter = React.lazy(() => import('./pages/k6-load-testing-performance-certification-center'));
const E2ETestingQAValidationSuite = React.lazy(() => import('./pages/e2e-testing-qa-validation-suite'));
const AutoDiagnosticAutoFixRocket = React.lazy(() => import('./pages/auto-diagnostic-auto-fix-rocket'));

// CI/CD & Development
const CICDFlutterOptimizedPipeline = React.lazy(() => import('./pages/ci-cd-flutter-optimized-pipeline'));
const CICDFlutterOptimizedOverview = React.lazy(() => import('./pages/ci-cd-flutter-optimized-overview'));
const RocketNewCICDPipelineConfiguration = React.lazy(() => import('./pages/rocket-new-ci-cd-pipeline-configuration'));
const FlutterConfigurationSecurityGuide = React.lazy(() => import('./pages/flutter-configuration-security-guide'));

// Diagnostic & Debug Tools
const SOSAPIDiagnosticCenter = React.lazy(() => import('./pages/sos-api-diagnostic-center'));
const SystemDiagnosticPost502Fix = React.lazy(() => import('./pages/system-diagnostic-post-502-fix'));
const TradingMVPProgressDiagnostic = React.lazy(() => import('./pages/trading-mvp-progress-diagnostic'));
const TradingMVPCompletionDashboard = React.lazy(() => import('./pages/trading-mvp-completion-dashboard'));
const RocketTradingMVPLiveReadinessDiagnostic = React.lazy(() => import('./pages/rocket-trading-mvp-live-readiness-diagnostic'));
const FrontendDebugLoadingBlocker = React.lazy(() => import('./pages/frontend-debug-loading-blocker'));
const RlsDiagnosticExpress = React.lazy(() => import('./pages/rls-diagnostic-express'));
const APIInfrastructureRecoveryCenter = React.lazy(() => import('./pages/api-infrastructure-recovery-center'));
const DiagnosticPage = React.lazy(() => import('./pages/diagnostic'));

// Configuration & Security
const GlobalAITraderSecurityConfiguration = React.lazy(() => import('./pages/global-ai-trader-security-configuration'));
const GlobalAITraderArchitecture = React.lazy(() => import('./pages/global-ai-trader-architecture'));
const GlobalAITraderRoadmapChecklist = React.lazy(() => import('./pages/global-ai-trader-roadmap-checklist'));
const EnvSecurityReference = React.lazy(() => import('./pages/env-security-reference'));
const AIAPIConfigurationCenter = React.lazy(() => import('./pages/ai-api-configuration-center'));

// Specialized Tools & Analytics
const CaptainSLogDecisionIntelligenceHub = React.lazy(() => import('./pages/captain-s-log-decision-intelligence-hub'));
const DataminingInRocketTradingMVP = React.lazy(() => import('./pages/datamining-in-rocket-trading-mvp'));
const RegistryDualStreamsVsFusion = React.lazy(() => import('./pages/registry-dual-streams-vs-fusion'));
const RegistryV01StrategyCatalogue = React.lazy(() => import('./pages/registry-v0-1-strategy-catalogue'));
const IAStrategiesBrancher = React.lazy(() => import('./pages/ia-strategies-brancher'));
const ShadowPriceAnomalyDetectionCenter = React.lazy(() => import('./pages/shadow-price-anomaly-detection-center'));

// Integration & Extensions
const RocketNewIntegrationHub = React.lazy(() => import('./pages/rocket-new-integration-hub'));
const LegacyPagesRedirect = React.lazy(() => import('./pages/legacy-pages-redirect'));

// Authentication
const Login = React.lazy(() => import('./pages/auth/Login'));
const Signup = React.lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading Trading MVP...</p>
    </div>
  </div>
);

// Offline Detection Component (MOVED INSIDE BrowserRouter)
const OfflineDetectionWrapper = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize offline detection and handle redirects
  useEffect(() => {
    const handleSystemOffline = (event) => {
      const offlineData = event?.detail;
      
      // Don't redirect if already on offline page
      if (location?.pathname === '/offline-recovery-center') {
        return;
      }
      
      console.log('🚨 System offline detected, redirecting to recovery center');
      console.log('Offline reason:', offlineData?.reason);
      
      // Store current page for return after recovery
      localStorage.setItem('preOfflinePage', location?.pathname);
      
      // Redirect to offline recovery center
      navigate('/offline-recovery-center');
    };

    // Listen for system offline events
    window.addEventListener('systemOfflineDetected', handleSystemOffline);

    // Check if we should restore previous page after recovery
    const preOfflinePage = localStorage.getItem('preOfflinePage');
    if (preOfflinePage && location?.pathname === '/offline-recovery-center') {
      // User is on offline page, keep them there until they manually recover
    } else if (preOfflinePage && navigator.onLine) {
      // Connection restored and user not on offline page, can clear the stored page
      localStorage.removeItem('preOfflinePage');
    }

    return () => {
      window.removeEventListener('systemOfflineDetected', handleSystemOffline);
    };
  }, [navigate, location?.pathname]);

  return children;
};

// Register Service Worker
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker?.register('/sw.js', { scope: '/' })?.then((registration) => {
          console.log('SW registered: ', registration);
        })?.catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

function Routes() {
  React.useEffect(() => {
    registerServiceWorker();
  }, []);
  
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <OfflineDetectionWrapper>
          <Suspense fallback={<PageLoader />}>
            <RouterRoutes>
              {/* Home route - redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Main application routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/unified-dashboard" element={<UnifiedDashboard />} />
              <Route path="/unified" element={<Navigate to="/unified-dashboard" replace />} />
              <Route path="/system-status" element={<SystemStatus />} />
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              <Route path="/diagnostic-6-verifications" element={<Diagnostic6Verifications />} />
              <Route path="/rocket-trading-mvp-live-readiness-diagnostic" element={<RocketTradingMVPLiveReadinessDiagnostic />} />
              
              {/* IA Exploration Totale Freedom v4 - NEW ROUTES */}
              <Route path="/ia-exploration-totale-freedom-v4-cognitive-engine" element={<IAExplorationTotaleFreedomV4CognitiveEngine />} />
              <Route path="/ifrs-fiscal-intelligence-integration-center" element={<IFRSFiscalIntelligenceIntegrationCenter />} />
              
              {/* AI & Agent Management */}
              <Route path="/ai-system-status" element={<AISystemStatus />} />
              <Route path="/ai-agents" element={<AIAgents />} />
              <Route path="/agent-roster" element={<AgentRoster />} />
              <Route path="/real-time-agent-performance" element={<RealTimeAgentPerformance />} />
              <Route path="/internal-agents-registry" element={<InternalAgentsRegistry />} />
              <Route path="/ai-agent-orchestration-command-center" element={<AIAgentOrchestrationCommandCenter />} />
              <Route path="/ai-agent-emergency-response-center" element={<AIAgentEmergencyResponseCenter />} />
              <Route path="/real-time-agent-activity-monitor" element={<RealTimeAgentActivityMonitor />} />
              <Route path="/ai-swarm-hub" element={<AISwarmHub />} />
              <Route path="/diagnostic-5-checks-final" element={<DiagnosticFinalChecks />} />
              
              {/* AI Paper Trading Deployment Orchestrator - NEW ROUTE */}
              <Route path="/ai-paper-trading-deployment-orchestrator" element={<AIPaperTradingDeploymentOrchestrator />} />
              
              {/* Trading & Portfolio Management */}
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              <Route path="/portfolio-view-enhanced" element={<PortfolioViewEnhanced />} />
              <Route path="/portfolio-consolidated-view" element={<PortfolioConsolidatedView />} />
              <Route path="/strategy-management" element={<StrategyManagement />} />
              <Route path="/paper-trading" element={<PaperTrading />} />
              <Route path="/options-strategy-ai" element={<OptionsStrategyAI />} />
              <Route path="/options-screening-intelligence-hub" element={<OptionsScreeningIntelligenceHub />} />
              <Route path="/correlation-hunter" element={<CorrelationHunter />} />
              <Route path="/strategy-registry-builder" element={<StrategyRegistryBuilder />} />
              <Route path="/genetic-strategy-evolution-laboratory" element={<GeneticStrategyEvolutionLaboratory />} />
              <Route path="/live-trading-orchestration-center" element={<LiveTradingOrchestrationCenter />} />
              
              {/* Risk & Security Management */}
              <Route path="/risk-controller-dashboard" element={<RiskControllerDashboard />} />
              <Route path="/supabase-rls-security-configuration-center" element={<SupabaseRlsSecurityConfigurationCenter />} />
              <Route path="/supabase-hardening-express-plan" element={<SupabaseHardeningExpressPlan />} />
              <Route path="/paranoid-security-audit-compliance-center" element={<ParanoidSecurityAuditComplianceCenter />} />
              <Route path="/advanced-ai-security-threat-intelligence-center" element={<AdvancedAISecurityThreatIntelligenceCenter />} />
              <Route path="/git-security-cleanup-documentation" element={<GitSecurityCleanupDocumentation />} />
              
              {/* Research & Innovation */}
              <Route path="/research-innovation-center" element={<ResearchInnovationCenter />} />
              <Route path="/ai-learning-critique-center" element={<AILearningCritiqueCenter />} />
              <Route path="/knowledge-pipeline-management-center" element={<KnowledgePipelineManagementCenter />} />
              <Route path="/agent-knowledge-query-interface" element={<AgentKnowledgeQueryInterface />} />
              <Route path="/rag-knowledge-base-dashboard" element={<RAGKnowledgeBaseDashboard />} />
              <Route path="/knowledge-playbooks-hub" element={<KnowledgePlaybooksHub />} />
              <Route path="/ai-knowledge-vector-management" element={<AIKnowledgeVectorManagement />} />
              <Route path="/hybrid-rag-dynamic-intelligence-orchestrator" element={<HybridRAGDynamicIntelligenceOrchestrator />} />
              
              {/* Monitoring & Control */}
              <Route path="/monitoring-control-center" element={<MonitoringControlCenter />} />
              <Route path="/self-healing-orchestration-dashboard" element={<SelfHealingOrchestrationDashboard />} />
              <Route path="/bus-monitor" element={<BusMonitor />} />
              <Route path="/orchestrator-dashboard" element={<OrchestratorDashboard />} />
              <Route path="/system-recovery-optimization-center" element={<SystemRecoveryOptimizationCenter />} />
              <Route path="/health-sentinel-observability-command" element={<HealthSentinelObservabilityCommand />} />
              <Route path="/production-monitoring-dashboard-with-grafana-integration" element={<ProductionMonitoringDashboardWithGrafanaIntegration />} />
              
              {/* AAS (Autonomous AI Speculation) Systems */}
              <Route path="/aas-production-control-center" element={<AASProductionControlCenter />} />
              <Route path="/aas-genius-pack-control-center" element={<AASGeniusPackControlCenter />} />
              <Route path="/aas-emergency-response-kill-switch-center" element={<AASEmergencyResponseKillSwitchCenter />} />
              <Route path="/aas-level-5-production-certification-command-center" element={<AASLevel5ProductionCertificationCommandCenter />} />
              <Route path="/aas-real-time-ai-thoughts-observatory" element={<AASRealTimeAIThoughtsObservatory />} />
              <Route path="/autonomous-ai-speculation-aas-evolution-center" element={<AutonomousAISpeculationAASEvolutionCenter />} />
              <Route path="/autonomous-ai-hedge-fund-level" element={<AutonomousAIHedgeFundLevel />} />
              
              {/* Data Processing & Intelligence */}
              <Route path="/google-finance-integration" element={<GoogleFinanceIntegration />} />
              <Route path="/weekly-pdf-reports" element={<WeeklyPdfReports />} />
              <Route path="/pdf-document-ingestion-interface" element={<PDFDocumentIngestionInterface />} />
              <Route path="/pdf-ingestion-processing-center" element={<PDFIngestionProcessingCenter />} />
              <Route path="/pipeline-books-registry-orchestrator" element={<PipelineBooksRegistryOrchestrator />} />
              <Route path="/open-access-feeder-pipeline" element={<OpenAccessFeederPipeline />} />
              <Route path="/fusion-oa-feeder-private-corpus" element={<FusionOAFeederPrivateCorpus />} />
              <Route path="/private-corpus-management" element={<PrivateCorpusManagement />} />
              
              {/* Provider & Integration Management */}
              <Route path="/provider-router-dashboard" element={<ProviderRouterDashboard />} />
              <Route path="/provider-configuration-management-center" element={<ProviderConfigurationManagementCenter />} />
              <Route path="/feature-flags-provider-control-panel" element={<FeatureFlagsProviderControlPanel />} />
              <Route path="/chaos-control-panel" element={<ChaosControlPanel />} />
              <Route path="/ibkr-client-portal-gateway-integration-center" element={<IBKRClientPortalGatewayIntegrationCenter />} />
              <Route path="/cmv-wilshire-market-intelligence-center" element={<CMVWilshireMarketIntelligenceCenter />} />
              
              {/* Project & Deployment Management */}
              <Route path="/project-management-cockpit" element={<ProjectManagementCockpit />} />
              <Route path="/deployment-readiness-tracker" element={<DeploymentReadinessTracker />} />
              <Route path="/trading-mvp-production-deployment-checklist" element={<TradingMVPProductionDeploymentChecklist />} />
              <Route path="/mvp-deployment-roadmap-dashboard" element={<MVPDeploymentRoadmapDashboard />} />
              <Route path="/ultra-fast-go-live-command-center" element={<UltraFastGoLiveCommandCenter />} />
              <Route path="/j1-j6-go-live-automation-center" element={<J1J6GoLiveAutomationCenter />} />
              <Route path="/production-readiness-recovery-center" element={<ProductionReadinessRecoveryCenter />} />
              
              {/* Advanced AI & Intelligence Systems */}
              <Route path="/ai-chiefs-chat-interface" element={<AIChiefsChatInterface />} />
              <Route path="/causal-ai-market-regime-intelligence-hub" element={<CausalAIMarketRegimeIntelligenceHub />} />
              <Route path="/tge-alpha-intelligence-center" element={<TGEAlphaIntelligenceCenter />} />
              <Route path="/tge-intelligence-rewards-center" element={<TGEIntelligenceRewardsCenter />} />
              <Route path="/attention-market-resource-allocation-hub" element={<AttentionMarketResourceAllocationHub />} />
              <Route path="/vision-ultime-the-living-hedge-fund" element={<VisionUltimeTheLivingHedgeFund />} />
              <Route path="/omega-ai-antagonist-laboratory" element={<OmegaAIAntagonistLaboratory />} />
              <Route path="/quantum-engine-agent-diplomacy-hub" element={<QuantumEngineAgentDiplomacyHub />} />
              <Route path="/ai-consciousness-decision-intelligence-hub" element={<AIConsciousnessDecisionIntelligenceHub />} />
              <Route path="/global-ai-performance-analytics-center" element={<GlobalAIPerformanceAnalyticsCenter />} />
              
              {/* Freedom v4 Cognitive Memory System - NEW ROUTE */}
              <Route path="/cognitive-memory-cross-domain-learning-observatory" element={<CognitiveMemoryObservatory />} />
              
              {/* Infrastructure & DevOps */}
              <Route path="/docker-production-deployment-center" element={<DockerProductionDeploymentCenter />} />
              <Route path="/redis-cache-performance-infrastructure-center" element={<RedisCachePerformanceInfrastructureCenter />} />
              <Route path="/dns-ssl-management" element={<DNSSLManagement />} />
              <Route path="/ssl-security-fix" element={<SSLSecurityFix />} />
              <Route path="/api-deployment-with-traefik" element={<APIDeploymentWithTraefik />} />
              <Route path="/web-socket-quotes-bridge-control-center" element={<WebSocketQuotesBridgeControlCenter />} />
              <Route path="/prometheus-monitoring-alerting-configuration" element={<PrometheusMonitoringAlertingConfiguration />} />
              
              {/* Testing & Quality Assurance */}
              <Route path="/performance-testing-command-center" element={<PerformanceTestingCommandCenter />} />
              <Route path="/k6-load-testing-performance-certification-center" element={<K6LoadTestingPerformanceCertificationCenter />} />
              <Route path="/e2e-testing-qa-validation-suite" element={<E2ETestingQAValidationSuite />} />
              <Route path="/auto-diagnostic-auto-fix-rocket" element={<AutoDiagnosticAutoFixRocket />} />
              
              {/* CI/CD & Development */}
              <Route path="/ci-cd-flutter-optimized-pipeline" element={<CICDFlutterOptimizedPipeline />} />
              <Route path="/ci-cd-flutter-optimized-overview" element={<CICDFlutterOptimizedOverview />} />
              <Route path="/rocket-new-ci-cd-pipeline-configuration" element={<RocketNewCICDPipelineConfiguration />} />
              <Route path="/flutter-configuration-security-guide" element={<FlutterConfigurationSecurityGuide />} />
              
              {/* Diagnostic & Debug Tools */}
              <Route path="/sos-api-diagnostic-center" element={<SOSAPIDiagnosticCenter />} />
              <Route path="/system-diagnostic-post-502-fix" element={<SystemDiagnosticPost502Fix />} />
              <Route path="/trading-mvp-progress-diagnostic" element={<TradingMVPProgressDiagnostic />} />
              <Route path="/trading-mvp-completion-dashboard" element={<TradingMVPCompletionDashboard />} />
              <Route path="/frontend-debug-loading-blocker" element={<FrontendDebugLoadingBlocker />} />
              <Route path="/rls-diagnostic-express" element={<RlsDiagnosticExpress />} />
              <Route path="/api-infrastructure-recovery-center" element={<APIInfrastructureRecoveryCenter />} />
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              
              {/* Configuration & Security */}
              <Route path="/global-ai-trader-security-configuration" element={<GlobalAITraderSecurityConfiguration />} />
              <Route path="/global-ai-trader-architecture" element={<GlobalAITraderArchitecture />} />
              <Route path="/global-ai-trader-roadmap-checklist" element={<GlobalAITraderRoadmapChecklist />} />
              <Route path="/env-security-reference" element={<EnvSecurityReference />} />
              <Route path="/ai-api-configuration-center" element={<AIAPIConfigurationCenter />} />
              
              {/* Specialized Tools & Analytics */}
              <Route path="/captain-s-log-decision-intelligence-hub" element={<CaptainSLogDecisionIntelligenceHub />} />
              <Route path="/datamining-in-rocket-trading-mvp" element={<DataminingInRocketTradingMVP />} />
              <Route path="/registry-dual-streams-vs-fusion" element={<RegistryDualStreamsVsFusion />} />
              <Route path="/registry-v0-1-strategy-catalogue" element={<RegistryV01StrategyCatalogue />} />
              <Route path="/ia-strategies-brancher" element={<IAStrategiesBrancher />} />
              <Route path="/shadow-price-anomaly-detection-center" element={<ShadowPriceAnomalyDetectionCenter />} />
              
              {/* Integration & Extensions */}
              <Route path="/rocket-new-integration-hub" element={<RocketNewIntegrationHub />} />
              <Route path="/legacy-pages-redirect" element={<LegacyPagesRedirect />} />
              <Route path="/offline-recovery-center" element={<OfflineRecoveryCenter />} />
              
              {/* Authentication */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              
              {/* 404 - Keep as last route */}
              <Route path="*" element={<NotFound />} />
            </RouterRoutes>
          </Suspense>
        </OfflineDetectionWrapper>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default Routes;