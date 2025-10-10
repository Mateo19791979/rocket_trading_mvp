import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useRouteError } from 'react-router-dom';
import Shell from './components/Shell';
import HardErrorBoundary from './shared/HardErrorBoundary';

function safeLazy(loader, pick) {
  return React.lazy(async () => {
    const m = await loader();
    const comp =
      (m && (m?.default && typeof m?.default === 'function' ? m?.default : null)) ||
      (pick ? pick(m) : Object.values(m)?.find(v => typeof v === 'function'));
    if (!comp) {
      throw new Error('Component not found in module (lazy import returned no React component).');
    }
    return { default: comp };
  });
}

const Home        = lazy(()=>import('./pages/HomeLite'));
const PageRegion  = lazy(()=>import('./pages/PageRegion'));
const Resilience  = lazy(()=>import('./pages/Resilience'));
const Logs        = lazy(()=>import('./pages/Logs'));
const Settings    = lazy(()=>import('./pages/Settings'));
const SafeLanding = lazy(()=>import('./pages/SafeLanding'));

// AI System Status - Using safeLazy to prevent #130 error
const AISystemStatus = safeLazy(() => import('./pages/AISystemStatus'));

// NEW: Regional AI Command Center Pages
const EuropeRegionalCommandCenter = lazy(() => import('./pages/europe-regional-command-center/index.jsx'));
const USRegionalCommandCenter = lazy(() => import('./pages/us-regional-command-center/index.jsx'));
const AsiaRegionalCommandCenter = lazy(() => import('./pages/asia-regional-command-center/index.jsx'));

// ROLLBACK STABLE: Regional Trading Command Centers (Non-intrusive)
const EURegionalTradingCommandCenterRollbackStable = lazy(() => import('./pages/eu-regional-trading-command-center-rollback-stable/index.jsx'));
const USRegionalTradingCommandCenterRollbackStable = lazy(() => import('./pages/us-regional-trading-command-center-rollback-stable/index.jsx'));
const AsiaRegionalTradingCommandCenterRollbackStable = lazy(() => import('./pages/asia-regional-trading-command-center-rollback-stable/index.jsx'));

// Existing application pages - Lazy loaded for performance
const Dashboard = lazy(() => import('./pages/dashboard/index.jsx'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Trading & Portfolio
const MarketAnalysis = lazy(() => import('./pages/market-analysis/index.jsx'));
const PaperTrading = lazy(() => import('./pages/paper-trading/index.jsx'));
const PortfolioViewEnhanced = lazy(() => import('./pages/portfolio-view-enhanced/index.jsx'));
const PortfolioConsolidatedView = lazy(() => import('./pages/portfolio-consolidated-view/index.jsx'));
const StrategyManagement = lazy(() => import('./pages/strategy-management/index.jsx'));

// AI & Agents
const AIAgents = lazy(() => import('./pages/ai-agents/index.jsx'));
const AgentRoster = lazy(() => import('./pages/agent-roster/index.jsx'));
const InternalAgentsRegistry = lazy(() => import('./pages/internal-agents-registry/index.jsx'));
const RealTimeAgentPerformance = lazy(() => import('./pages/real-time-agent-performance/index.jsx'));
const RealTimeAgentActivityMonitor = lazy(() => import('./pages/real-time-agent-activity-monitor/index.jsx'));

// AI Advanced Features
const AIAgentEmergencyResponseCenter = lazy(() => import('./pages/ai-agent-emergency-response-center/index.jsx'));
const AIAgentOrchestrationCommandCenter = lazy(() => import('./pages/ai-agent-orchestration-command-center/index.jsx'));
const AIConsciousnessDecisionIntelligenceHub = lazy(() => import('./pages/ai-consciousness-decision-intelligence-hub/index.jsx'));
const AIChiefsChatInterface = lazy(() => import('./pages/ai-chiefs-chat-interface/index.jsx'));
const AILearningCritiqueCenter = lazy(() => import('./pages/ai-learning-critique-center/index.jsx'));

// System & Infrastructure
const SystemStatus = lazy(() => import('./pages/system-status/index.jsx'));
const SystemRecoveryOptimizationCenter = lazy(() => import('./pages/system-recovery-optimization-center/index.jsx'));
const SystemDiagnosticPost502Fix = lazy(() => import('./pages/system-diagnostic-post-502-fix/index.jsx'));
const SelfHealingOrchestrationDashboard = lazy(() => import('./pages/self-healing-orchestration-dashboard/index.jsx'));

// Monitoring & Observability
const MonitoringControlCenter = lazy(() => import('./pages/monitoring-control-center/index.jsx'));
const BusMonitor = lazy(() => import('./pages/bus-monitor/index.jsx'));
const OrchestratorDashboard = lazy(() => import('./pages/orchestrator-dashboard/index.jsx'));
const ProductionMonitoringDashboardWithGrafanaIntegration = lazy(() => import('./pages/production-monitoring-dashboard-with-grafana-integration/index.jsx'));
const HealthSentinelObservabilityCommand = lazy(() => import('./pages/health-sentinel-observability-command/index.jsx'));

// Security & RLS
const SupabaseRlsSecurityConfigurationCenter = lazy(() => import('./pages/supabase-rls-security-configuration-center/index.jsx'));
const SupabaseHardeningExpressPlan = lazy(() => import('./pages/supabase-hardening-express-plan/index.jsx'));
const ParanoidSecurityAuditComplianceCenter = lazy(() => import('./pages/paranoid-security-audit-compliance-center/index.jsx'));
const AdvancedAiSecurityThreatIntelligenceCenter = lazy(() => import('./pages/advanced-ai-security-threat-intelligence-center/index.jsx'));
const RlsDiagnosticExpress = lazy(() => import('./pages/rls-diagnostic-express/index.jsx'));
const GlobalAiTraderSecurityConfiguration = lazy(() => import('./pages/global-ai-trader-security-configuration/index.jsx'));

// Research & Innovation
const ResearchInnovationCenter = lazy(() => import('./pages/research-innovation-center/index.jsx'));
const KnowledgePipelineManagementCenter = lazy(() => import('./pages/knowledge-pipeline-management-center/index.jsx'));
const KnowledgePlaybooksHub = lazy(() => import('./pages/knowledge-playbooks-hub/index.jsx'));
const AgentKnowledgeQueryInterface = lazy(() => import('./pages/agent-knowledge-query-interface/index.jsx'));

// Data & Analytics
const TgeAlphaIntelligenceCenter = lazy(() => import('./pages/tge-alpha-intelligence-center/index.jsx'));
const TgeIntelligenceRewardsCenter = lazy(() => import('./pages/tge-intelligence-rewards-center/index.jsx'));
const CorrelationHunter = lazy(() => import('./pages/correlation-hunter/index.jsx'));
const RagKnowledgeBaseDashboard = lazy(() => import('./pages/rag-knowledge-base-dashboard/index.jsx'));
const AIKnowledgeVectorManagement = lazy(() => import('./pages/ai-knowledge-vector-management/index.jsx'));

// Options & Strategies
const OptionsStrategyAi = lazy(() => import('./pages/options-strategy-ai/index.jsx'));
const OptionsScreeningIntelligenceHub = lazy(() => import('./pages/options-screening-intelligence-hub/index.jsx'));
const GeneticStrategyEvolutionLaboratory = lazy(() => import('./pages/genetic-strategy-evolution-laboratory/index.jsx'));
const StrategyRegistryBuilder = lazy(() => import('./pages/strategy-registry-builder/index.jsx'));

// Trading Infrastructure
const IBKRClientPortalGatewayIntegrationCenter = lazy(() => import('./pages/ibkr-client-portal-gateway-integration-center/index.jsx'));
const ProviderRouterDashboard = lazy(() => import('./pages/provider-router-dashboard/index.jsx'));
const ProviderConfigurationManagementCenter = lazy(() => import('./pages/provider-configuration-management-center/index.jsx'));
const GoogleFinanceIntegration = lazy(() => import('./pages/google-finance-integration/index.jsx'));

// Risk Management
const RiskControllerDashboard = lazy(() => import('./pages/risk-controller-dashboard/index.jsx'));
const ShadowPriceAnomalyDetectionCenter = lazy(() => import('./pages/shadow-price-anomaly-detection-center/index.jsx'));

// Deployment & DevOps
const DeploymentReadinessTracker = lazy(() => import('./pages/deployment-readiness-tracker/index.jsx'));
const ProductionReadinessRecoveryCenter = lazy(() => import('./pages/production-readiness-recovery-center/index.jsx'));
const TradingMvpProductionDeploymentChecklist = lazy(() => import('./pages/trading-mvp-production-deployment-checklist/index.jsx'));
const TradingMvpProgressDiagnostic = lazy(() => import('./pages/trading-mvp-progress-diagnostic/index.jsx'));
const MvpDeploymentRoadmapDashboard = lazy(() => import('./pages/mvp-deployment-roadmap-dashboard/index.jsx'));

// Project Management
const ProjectManagementCockpit = lazy(() => import('./pages/project-management-cockpit/index.jsx'));
const GlobalAiTraderRoadmapChecklist = lazy(() => import('./pages/global-ai-trader-roadmap-checklist/index.jsx'));
const TradingMvpCompletionDashboard = lazy(() => import('./pages/trading-mvp-completion-dashboard/index.jsx'));

// Captain's Log & Decision Intelligence
const CaptainSLogDecisionIntelligenceHub = lazy(() => import('./pages/captain-s-log-decision-intelligence-hub/index.jsx'));

// Advanced Trading Features
const LiveTradingOrchestrationCenter = lazy(() => import('./pages/live-trading-orchestration-center/index.jsx'));
const UltraFastGoLiveCommandCenter = lazy(() => import('./pages/ultra-fast-go-live-command-center/index.jsx'));
const J1J6GoLiveAutomationCenter = lazy(() => import('./pages/j1-j6-go-live-automation-center/index.jsx'));

// Data Processing
const PDFDocumentIngestionInterface = lazy(() => import('./pages/pdf-document-ingestion-interface/index.jsx'));
const PDFIngestionProcessingCenter = lazy(() => import('./pages/pdf-ingestion-processing-center/index.jsx'));
const OpenAccessFeederPipeline = lazy(() => import('./pages/open-access-feeder-pipeline/index.jsx'));
const PipelineBooksRegistryOrchestrator = lazy(() => import('./pages/pipeline-books-registry-orchestrator/index.jsx'));

// Specialized Features
const WeeklyPdfReports = lazy(() => import('./pages/weekly-pdf-reports/index.jsx'));
const ChaosControlPanel = lazy(() => import('./pages/chaos-control-panel/index.jsx'));
const FeatureFlagsProviderControlPanel = lazy(() => import('./pages/feature-flags-provider-control-panel/index.jsx'));
const PrivateCorpusManagement = lazy(() => import('./pages/private-corpus-management/index.jsx'));

// AAS (Autonomous AI Speculation) Features
const AasProductionControlCenter = lazy(() => import('./pages/aas-production-control-center/index.jsx'));
const AasGeniusPackControlCenter = lazy(() => import('./pages/aas-genius-pack-control-center/index.jsx'));
const AasEmergencyResponseKillSwitchCenter = lazy(() => import('./pages/aas-emergency-response-kill-switch-center/index.jsx'));
const AasRealTimeAiThoughtsObservatory = lazy(() => import('./pages/aas-real-time-ai-thoughts-observatory/index.jsx'));
const AasLevel5ProductionCertificationCommandCenter = lazy(() => import('./pages/aas-level-5-production-certification-command-center/index.jsx'));
const AutonomousAiHedgeFundLevel = lazy(() => import('./pages/autonomous-ai-hedge-fund-level/index.jsx'));
const AutonomousAiSpeculationAasEvolutionCenter = lazy(() => import('./pages/autonomous-ai-speculation-aas-evolution-center/index.jsx'));

// Vision & Advanced Concepts
const VisionUltimeTheLivingHedgeFund = lazy(() => import('./pages/vision-ultime-the-living-hedge-fund/index.jsx'));
const QuantumEngineAgentDiplomacyHub = lazy(() => import('./pages/quantum-engine-agent-diplomacy-hub/index.jsx'));
const OmegaAiAntagonistLaboratory = lazy(() => import('./pages/omega-ai-antagonist-laboratory/index.jsx'));
const AttentionMarketResourceAllocationHub = lazy(() => import('./pages/attention-market-resource-allocation-hub/index.jsx'));

// Infrastructure & Architecture
const GlobalAiTraderArchitecture = lazy(() => import('./pages/global-ai-trader-architecture/index.jsx'));
const DockerProductionDeploymentCenter = lazy(() => import('./pages/docker-production-deployment-center/index.jsx'));
const RedisCachePerformanceInfrastructureCenter = lazy(() => import('./pages/redis-cache-performance-infrastructure-center/index.jsx'));
const ApiDeploymentWithTraefik = lazy(() => import('./pages/api-deployment-with-traefik/index.jsx'));
const DnsSslManagement = lazy(() => import('./pages/dns-ssl-management/index.jsx'));

// Testing & QA
const PerformanceTestingCommandCenter = lazy(() => import('./pages/performance-testing-command-center/index.jsx'));
const K6LoadTestingPerformanceCertificationCenter = lazy(() => import('./pages/k6-load-testing-performance-certification-center/index.jsx'));
const E2eTestingQaValidationSuite = lazy(() => import('./pages/e2e-testing-qa-validation-suite/index.jsx'));

// Specialized Dashboards
const UnifiedDashboard = lazy(() => import('./pages/unified-dashboard/index.jsx'));
const TradingMvpLandingPage = lazy(() => import('./pages/trading-mvp-landing-page/index.jsx'));
const DataminingInRocketTradingMvp = lazy(() => import('./pages/datamining-in-rocket-trading-mvp/index.jsx'));

// More Advanced Features
const HybridRagDynamicIntelligenceOrchestrator = lazy(() => import('./pages/hybrid-rag-dynamic-intelligence-orchestrator/index.jsx'));
const CausalAiMarketRegimeIntelligenceHub = lazy(() => import('./pages/causal-ai-market-regime-intelligence-hub/index.jsx'));
const FusionOaFeederPrivateCorpus = lazy(() => import('./pages/fusion-oa-feeder-private-corpus/index.jsx'));
const CmvWilshireMarketIntelligenceCenter = lazy(() => import('./pages/cmv-wilshire-market-intelligence-center/index.jsx'));
const WebSocketQuotesBridgeControlCenter = lazy(() => import('./pages/web-socket-quotes-bridge-control-center/index.jsx'));

// Configuration & Setup
const AIApiConfigurationCenter = lazy(() => import('./pages/ai-api-configuration-center/index.jsx'));
const EnvSecurityReference = lazy(() => import('./pages/env-security-reference/index.jsx'));
const FlutterConfigurationSecurityGuide = lazy(() => import('./pages/flutter-configuration-security-guide/index.jsx'));

// Diagnostic & Troubleshooting
const SOSApiDiagnosticCenter = lazy(() => import('./pages/sos-api-diagnostic-center/index.jsx'));
const FrontendDebugLoadingBlocker = lazy(() => import('./pages/frontend-debug-loading-blocker/index.jsx'));
const AutoDiagnosticAutoFixRocket = lazy(() => import('./pages/auto-diagnostic-auto-fix-rocket/index.jsx'));

// CI/CD & Integration
const CiCdFlutterOptimizedOverview = lazy(() => import('./pages/ci-cd-flutter-optimized-overview/index.jsx'));
const CiCdFlutterOptimizedPipeline = lazy(() => import('./pages/ci-cd-flutter-optimized-pipeline/index.jsx'));
const RocketNewCiCdPipelineConfiguration = lazy(() => import('./pages/rocket-new-ci-cd-pipeline-configuration/index.jsx'));
const RocketNewIntegrationHub = lazy(() => import('./pages/rocket-new-integration-hub/index.jsx'));

// Documentation & Security
const GitSecurityCleanupDocumentation = lazy(() => import('./pages/git-security-cleanup-documentation/index.jsx'));
const SslSecurityFix = lazy(() => import('./pages/ssl-security-fix/index.jsx'));

// Monitoring Configurations
const PrometheusMonitoringAlertingConfiguration = lazy(() => import('./pages/prometheus-monitoring-alerting-configuration/index.jsx'));

// Registry & Strategy Features
const RegistryV01StrategyCatalogue = lazy(() => import('./pages/registry-v0-1-strategy-catalogue/index.jsx'));
const RegistryDualStreamsVsFusion = lazy(() => import('./pages/registry-dual-streams-vs-fusion/index.jsx'));
const IaStrategiesBrancher = lazy(() => import('./pages/ia-strategies-brancher/index.jsx'));

// Rocket MVP & Diagnostic Features
const RocketTradingMvpLiveReadinessDiagnostic = lazy(() => import('./pages/rocket-trading-mvp-live-readiness-diagnostic/index.jsx'));

// Legacy & Redirect
const LegacyPagesRedirect = lazy(() => import('./pages/legacy-pages-redirect/index.jsx'));

// Special surveillance pages
const MultiRegionAgentSurveillanceHub = lazy(() => import('./pages/multi-region-agent-surveillance-hub/index.jsx'));
const TradingAuditHomeV2CommandCenter = lazy(() => import('./pages/trading-audit-home-v2-command-center/index.jsx'));
const SystemResilienceSafeLandingCenter = lazy(() => import('./pages/system-resilience-safe-landing-center/index.jsx'));

function RouteErrorBoundary(){
  const err = useRouteError();
  return (
    <div style={{padding:24,color:'#eee'}}>
      <h2>Erreur d'itinéraire interceptée</h2>
      <p style={{opacity:.85}}>{String(err?.message||err||'Unknown')}</p>
      <button onClick={()=>location.reload()}>Recharger</button>
      <button onClick={()=>{localStorage.setItem('SAFE_MODE','1'); location.reload();}} style={{marginLeft:8}}>Activer SAFE_MODE</button>
    </div>
  );
}

const SAFE = (typeof window!=='undefined') && localStorage.getItem('SAFE_MODE')==='1';

export default function AppRouter(){
  return (
    <BrowserRouter>
      <HardErrorBoundary>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Suspense fallback={null}>{SAFE? <SafeLanding/> : <Home/>}</Suspense>} />
            <Route path="/region/eu" element={<Suspense fallback={null}><PageRegion region="EU"/></Suspense>} />
            <Route path="/region/us" element={<Suspense fallback={null}><PageRegion region="US"/></Suspense>} />
            <Route path="/region/as" element={<Suspense fallback={null}><PageRegion region="AS"/></Suspense>} />
            <Route path="/resilience" element={<Suspense fallback={null}>&lt;Resilience/&gt;</Suspense>} />
            <Route path="/logs" element={<Suspense fallback={null}>&lt;Logs/&gt;</Suspense>} />
            <Route path="/settings" element={<Suspense fallback={null}>&lt;Settings/&gt;</Suspense>} />
            
            {/* AI System Status with safeLazy to prevent #130 error */}
            <Route path="/ai-system-status" element={<Suspense fallback={null}>&lt;AISystemStatus/&gt;</Suspense>} />
            
            {/* NEW ROUTES: Regional AI Command Centers */}
            <Route path="/europe-regional-command-center" element={<Suspense fallback={null}>&lt;EuropeRegionalCommandCenter/&gt;</Suspense>} />
            <Route path="/us-regional-command-center" element={<Suspense fallback={null}>&lt;USRegionalCommandCenter/&gt;</Suspense>} />
            <Route path="/asia-regional-command-center" element={<Suspense fallback={null}>&lt;AsiaRegionalCommandCenter/&gt;</Suspense>} />
            
            {/* ROLLBACK STABLE ROUTES: Non-intrusive Regional Trading Centers */}
            <Route path="/eu-regional-trading-command-center-rollback-stable" element={<Suspense fallback={null}>&lt;EURegionalTradingCommandCenterRollbackStable/&gt;</Suspense>} />
            <Route path="/us-regional-trading-command-center-rollback-stable" element={<Suspense fallback={null}>&lt;USRegionalTradingCommandCenterRollbackStable/&gt;</Suspense>} />
            <Route path="/asia-regional-trading-command-center-rollback-stable" element={<Suspense fallback={null}>&lt;AsiaRegionalTradingCommandCenterRollbackStable/&gt;</Suspense>} />
            
            <Route path="/auth/login" element={<Suspense fallback={null}>&lt;Login/&gt;</Suspense>} />
            <Route path="/auth/signup" element={<Suspense fallback={null}>&lt;Signup/&gt;</Suspense>} />
            <Route path="/auth/forgot-password" element={<Suspense fallback={null}>&lt;ForgotPassword/&gt;</Suspense>} />
            
            <Route path="/dashboard" element={<Suspense fallback={null}>&lt;Dashboard/&gt;</Suspense>} />
            <Route path="/market-analysis" element={<Suspense fallback={null}>&lt;MarketAnalysis/&gt;</Suspense>} />
            <Route path="/paper-trading" element={<Suspense fallback={null}>&lt;PaperTrading/&gt;</Suspense>} />
            <Route path="/portfolio-view-enhanced" element={<Suspense fallback={null}>&lt;PortfolioViewEnhanced/&gt;</Suspense>} />
            <Route path="/portfolio-consolidated-view" element={<Suspense fallback={null}>&lt;PortfolioConsolidatedView/&gt;</Suspense>} />
            <Route path="/strategy-management" element={<Suspense fallback={null}>&lt;StrategyManagement/&gt;</Suspense>} />
            
            <Route path="/ai-agents" element={<Suspense fallback={null}>&lt;AIAgents/&gt;</Suspense>} />
            <Route path="/agent-roster" element={<Suspense fallback={null}>&lt;AgentRoster/&gt;</Suspense>} />
            <Route path="/internal-agents-registry" element={<Suspense fallback={null}>&lt;InternalAgentsRegistry/&gt;</Suspense>} />
            <Route path="/real-time-agent-performance" element={<Suspense fallback={null}>&lt;RealTimeAgentPerformance/&gt;</Suspense>} />
            <Route path="/real-time-agent-activity-monitor" element={<Suspense fallback={null}>&lt;RealTimeAgentActivityMonitor/&gt;</Suspense>} />
            
            <Route path="/ai-agent-emergency-response-center" element={<Suspense fallback={null}>&lt;AIAgentEmergencyResponseCenter/&gt;</Suspense>} />
            <Route path="/ai-agent-orchestration-command-center" element={<Suspense fallback={null}>&lt;AIAgentOrchestrationCommandCenter/&gt;</Suspense>} />
            <Route path="/ai-consciousness-decision-intelligence-hub" element={<Suspense fallback={null}>&lt;AIConsciousnessDecisionIntelligenceHub/&gt;</Suspense>} />
            <Route path="/ai-chiefs-chat-interface" element={<Suspense fallback={null}>&lt;AIChiefsChatInterface/&gt;</Suspense>} />
            <Route path="/ai-learning-critique-center" element={<Suspense fallback={null}>&lt;AILearningCritiqueCenter/&gt;</Suspense>} />
            
            <Route path="/system-status" element={<Suspense fallback={null}>&lt;SystemStatus/&gt;</Suspense>} />
            <Route path="/system-recovery-optimization-center" element={<Suspense fallback={null}>&lt;SystemRecoveryOptimizationCenter/&gt;</Suspense>} />
            <Route path="/system-diagnostic-post-502-fix" element={<Suspense fallback={null}>&lt;SystemDiagnosticPost502Fix/&gt;</Suspense>} />
            <Route path="/self-healing-orchestration-dashboard" element={<Suspense fallback={null}>&lt;SelfHealingOrchestrationDashboard/&gt;</Suspense>} />
            
            <Route path="/monitoring-control-center" element={<Suspense fallback={null}>&lt;MonitoringControlCenter/&gt;</Suspense>} />
            <Route path="/bus-monitor" element={<Suspense fallback={null}>&lt;BusMonitor/&gt;</Suspense>} />
            <Route path="/orchestrator-dashboard" element={<Suspense fallback={null}>&lt;OrchestratorDashboard/&gt;</Suspense>} />
            <Route path="/production-monitoring-dashboard-with-grafana-integration" element={<Suspense fallback={null}>&lt;ProductionMonitoringDashboardWithGrafanaIntegration/&gt;</Suspense>} />
            <Route path="/health-sentinel-observability-command" element={<Suspense fallback={null}>&lt;HealthSentinelObservabilityCommand/&gt;</Suspense>} />
            
            <Route path="/supabase-rls-security-configuration-center" element={<Suspense fallback={null}>&lt;SupabaseRlsSecurityConfigurationCenter/&gt;</Suspense>} />
            <Route path="/supabase-hardening-express-plan" element={<Suspense fallback={null}>&lt;SupabaseHardeningExpressPlan/&gt;</Suspense>} />
            <Route path="/paranoid-security-audit-compliance-center" element={<Suspense fallback={null}>&lt;ParanoidSecurityAuditComplianceCenter/&gt;</Suspense>} />
            <Route path="/advanced-ai-security-threat-intelligence-center" element={<Suspense fallback={null}>&lt;AdvancedAiSecurityThreatIntelligenceCenter/&gt;</Suspense>} />
            <Route path="/rls-diagnostic-express" element={<Suspense fallback={null}>&lt;RlsDiagnosticExpress/&gt;</Suspense>} />
            <Route path="/global-ai-trader-security-configuration" element={<Suspense fallback={null}>&lt;GlobalAiTraderSecurityConfiguration/&gt;</Suspense>} />
            
            <Route path="/research-innovation-center" element={<Suspense fallback={null}>&lt;ResearchInnovationCenter/&gt;</Suspense>} />
            <Route path="/knowledge-pipeline-management-center" element={<Suspense fallback={null}>&lt;KnowledgePipelineManagementCenter/&gt;</Suspense>} />
            <Route path="/knowledge-playbooks-hub" element={<Suspense fallback={null}>&lt;KnowledgePlaybooksHub/&gt;</Suspense>} />
            <Route path="/agent-knowledge-query-interface" element={<Suspense fallback={null}>&lt;AgentKnowledgeQueryInterface/&gt;</Suspense>} />
            
            <Route path="/tge-alpha-intelligence-center" element={<Suspense fallback={null}>&lt;TgeAlphaIntelligenceCenter/&gt;</Suspense>} />
            <Route path="/tge-intelligence-rewards-center" element={<Suspense fallback={null}>&lt;TgeIntelligenceRewardsCenter/&gt;</Suspense>} />
            <Route path="/correlation-hunter" element={<Suspense fallback={null}>&lt;CorrelationHunter/&gt;</Suspense>} />
            <Route path="/rag-knowledge-base-dashboard" element={<Suspense fallback={null}>&lt;RagKnowledgeBaseDashboard/&gt;</Suspense>} />
            <Route path="/ai-knowledge-vector-management" element={<Suspense fallback={null}>&lt;AIKnowledgeVectorManagement/&gt;</Suspense>} />
            
            <Route path="/options-strategy-ai" element={<Suspense fallback={null}>&lt;OptionsStrategyAi/&gt;</Suspense>} />
            <Route path="/options-screening-intelligence-hub" element={<Suspense fallback={null}>&lt;OptionsScreeningIntelligenceHub/&gt;</Suspense>} />
            <Route path="/genetic-strategy-evolution-laboratory" element={<Suspense fallback={null}>&lt;GeneticStrategyEvolutionLaboratory/&gt;</Suspense>} />
            <Route path="/strategy-registry-builder" element={<Suspense fallback={null}>&lt;StrategyRegistryBuilder/&gt;</Suspense>} />
            
            <Route path="/ibkr-client-portal-gateway-integration-center" element={<Suspense fallback={null}>&lt;IBKRClientPortalGatewayIntegrationCenter/&gt;</Suspense>} />
            <Route path="/provider-router-dashboard" element={<Suspense fallback={null}>&lt;ProviderRouterDashboard/&gt;</Suspense>} />
            <Route path="/provider-configuration-management-center" element={<Suspense fallback={null}>&lt;ProviderConfigurationManagementCenter/&gt;</Suspense>} />
            <Route path="/google-finance-integration" element={<Suspense fallback={null}>&lt;GoogleFinanceIntegration/&gt;</Suspense>} />
            
            <Route path="/risk-controller-dashboard" element={<Suspense fallback={null}>&lt;RiskControllerDashboard/&gt;</Suspense>} />
            <Route path="/shadow-price-anomaly-detection-center" element={<Suspense fallback={null}>&lt;ShadowPriceAnomalyDetectionCenter/&gt;</Suspense>} />
            
            <Route path="/deployment-readiness-tracker" element={<Suspense fallback={null}>&lt;DeploymentReadinessTracker/&gt;</Suspense>} />
            <Route path="/production-readiness-recovery-center" element={<Suspense fallback={null}>&lt;ProductionReadinessRecoveryCenter/&gt;</Suspense>} />
            <Route path="/trading-mvp-production-deployment-checklist" element={<Suspense fallback={null}>&lt;TradingMvpProductionDeploymentChecklist/&gt;</Suspense>} />
            <Route path="/trading-mvp-progress-diagnostic" element={<Suspense fallback={null}>&lt;TradingMvpProgressDiagnostic/&gt;</Suspense>} />
            <Route path="/mvp-deployment-roadmap-dashboard" element={<Suspense fallback={null}>&lt;MvpDeploymentRoadmapDashboard/&gt;</Suspense>} />
            
            <Route path="/project-management-cockpit" element={<Suspense fallback={null}>&lt;ProjectManagementCockpit/&gt;</Suspense>} />
            <Route path="/global-ai-trader-roadmap-checklist" element={<Suspense fallback={null}>&lt;GlobalAiTraderRoadmapChecklist/&gt;</Suspense>} />
            <Route path="/trading-mvp-completion-dashboard" element={<Suspense fallback={null}>&lt;TradingMvpCompletionDashboard/&gt;</Suspense>} />
            
            <Route path="/captain-s-log-decision-intelligence-hub" element={<Suspense fallback={null}>&lt;CaptainSLogDecisionIntelligenceHub/&gt;</Suspense>} />
            
            <Route path="/live-trading-orchestration-center" element={<Suspense fallback={null}>&lt;LiveTradingOrchestrationCenter/&gt;</Suspense>} />
            <Route path="/ultra-fast-go-live-command-center" element={<Suspense fallback={null}>&lt;UltraFastGoLiveCommandCenter/&gt;</Suspense>} />
            <Route path="/j1-j6-go-live-automation-center" element={<Suspense fallback={null}>&lt;J1J6GoLiveAutomationCenter/&gt;</Suspense>} />
            
            <Route path="/pdf-document-ingestion-interface" element={<Suspense fallback={null}>&lt;PDFDocumentIngestionInterface/&gt;</Suspense>} />
            <Route path="/pdf-ingestion-processing-center" element={<Suspense fallback={null}>&lt;PDFIngestionProcessingCenter/&gt;</Suspense>} />
            <Route path="/open-access-feeder-pipeline" element={<Suspense fallback={null}>&lt;OpenAccessFeederPipeline/&gt;</Suspense>} />
            <Route path="/pipeline-books-registry-orchestrator" element={<Suspense fallback={null}>&lt;PipelineBooksRegistryOrchestrator/&gt;</Suspense>} />
            
            <Route path="/weekly-pdf-reports" element={<Suspense fallback={null}>&lt;WeeklyPdfReports/&gt;</Suspense>} />
            <Route path="/chaos-control-panel" element={<Suspense fallback={null}>&lt;ChaosControlPanel/&gt;</Suspense>} />
            <Route path="/feature-flags-provider-control-panel" element={<Suspense fallback={null}>&lt;FeatureFlagsProviderControlPanel/&gt;</Suspense>} />
            <Route path="/private-corpus-management" element={<Suspense fallback={null}>&lt;PrivateCorpusManagement/&gt;</Suspense>} />
            
            <Route path="/aas-production-control-center" element={<Suspense fallback={null}>&lt;AasProductionControlCenter/&gt;</Suspense>} />
            <Route path="/aas-genius-pack-control-center" element={<Suspense fallback={null}>&lt;AasGeniusPackControlCenter/&gt;</Suspense>} />
            <Route path="/aas-emergency-response-kill-switch-center" element={<Suspense fallback={null}>&lt;AasEmergencyResponseKillSwitchCenter/&gt;</Suspense>} />
            <Route path="/aas-real-time-ai-thoughts-observatory" element={<Suspense fallback={null}>&lt;AasRealTimeAiThoughtsObservatory/&gt;</Suspense>} />
            <Route path="/aas-level-5-production-certification-command-center" element={<Suspense fallback={null}>&lt;AasLevel5ProductionCertificationCommandCenter/&gt;</Suspense>} />
            <Route path="/autonomous-ai-hedge-fund-level" element={<Suspense fallback={null}>&lt;AutonomousAiHedgeFundLevel/&gt;</Suspense>} />
            <Route path="/autonomous-ai-speculation-aas-evolution-center" element={<Suspense fallback={null}>&lt;AutonomousAiSpeculationAasEvolutionCenter/&gt;</Suspense>} />
            
            <Route path="/vision-ultime-the-living-hedge-fund" element={<Suspense fallback={null}>&lt;VisionUltimeTheLivingHedgeFund/&gt;</Suspense>} />
            <Route path="/quantum-engine-agent-diplomacy-hub" element={<Suspense fallback={null}>&lt;QuantumEngineAgentDiplomacyHub/&gt;</Suspense>} />
            <Route path="/omega-ai-antagonist-laboratory" element={<Suspense fallback={null}>&lt;OmegaAiAntagonistLaboratory/&gt;</Suspense>} />
            <Route path="/attention-market-resource-allocation-hub" element={<Suspense fallback={null}>&lt;AttentionMarketResourceAllocationHub/&gt;</Suspense>} />
            
            <Route path="/global-ai-trader-architecture" element={<Suspense fallback={null}>&lt;GlobalAiTraderArchitecture/&gt;</Suspense>} />
            <Route path="/docker-production-deployment-center" element={<Suspense fallback={null}>&lt;DockerProductionDeploymentCenter/&gt;</Suspense>} />
            <Route path="/redis-cache-performance-infrastructure-center" element={<Suspense fallback={null}>&lt;RedisCachePerformanceInfrastructureCenter/&gt;</Suspense>} />
            <Route path="/api-deployment-with-traefik" element={<Suspense fallback={null}>&lt;ApiDeploymentWithTraefik/&gt;</Suspense>} />
            <Route path="/dns-ssl-management" element={<Suspense fallback={null}>&lt;DnsSslManagement/&gt;</Suspense>} />
            
            <Route path="/performance-testing-command-center" element={<Suspense fallback={null}>&lt;PerformanceTestingCommandCenter/&gt;</Suspense>} />
            <Route path="/k6-load-testing-performance-certification-center" element={<Suspense fallback={null}>&lt;K6LoadTestingPerformanceCertificationCenter/&gt;</Suspense>} />
            <Route path="/e2e-testing-qa-validation-suite" element={<Suspense fallback={null}>&lt;E2eTestingQaValidationSuite/&gt;</Suspense>} />
            
            <Route path="/unified-dashboard" element={<Suspense fallback={null}>&lt;UnifiedDashboard/&gt;</Suspense>} />
            <Route path="/trading-mvp-landing-page" element={<Suspense fallback={null}>&lt;TradingMvpLandingPage/&gt;</Suspense>} />
            <Route path="/datamining-in-rocket-trading-mvp" element={<Suspense fallback={null}>&lt;DataminingInRocketTradingMvp/&gt;</Suspense>} />
            
            <Route path="/hybrid-rag-dynamic-intelligence-orchestrator" element={<Suspense fallback={null}>&lt;HybridRagDynamicIntelligenceOrchestrator/&gt;</Suspense>} />
            <Route path="/causal-ai-market-regime-intelligence-hub" element={<Suspense fallback={null}>&lt;CausalAiMarketRegimeIntelligenceHub/&gt;</Suspense>} />
            <Route path="/fusion-oa-feeder-private-corpus" element={<Suspense fallback={null}>&lt;FusionOaFeederPrivateCorpus/&gt;</Suspense>} />
            <Route path="/cmv-wilshire-market-intelligence-center" element={<Suspense fallback={null}>&lt;CmvWilshireMarketIntelligenceCenter/&gt;</Suspense>} />
            <Route path="/web-socket-quotes-bridge-control-center" element={<Suspense fallback={null}>&lt;WebSocketQuotesBridgeControlCenter/&gt;</Suspense>} />
            
            <Route path="/ai-api-configuration-center" element={<Suspense fallback={null}>&lt;AIApiConfigurationCenter/&gt;</Suspense>} />
            <Route path="/env-security-reference" element={<Suspense fallback={null}>&lt;EnvSecurityReference/&gt;</Suspense>} />
            <Route path="/flutter-configuration-security-guide" element={<Suspense fallback={null}>&lt;FlutterConfigurationSecurityGuide/&gt;</Suspense>} />
            
            <Route path="/sos-api-diagnostic-center" element={<Suspense fallback={null}>&lt;SOSApiDiagnosticCenter/&gt;</Suspense>} />
            <Route path="/frontend-debug-loading-blocker" element={<Suspense fallback={null}>&lt;FrontendDebugLoadingBlocker/&gt;</Suspense>} />
            <Route path="/auto-diagnostic-auto-fix-rocket" element={<Suspense fallback={null}>&lt;AutoDiagnosticAutoFixRocket/&gt;</Suspense>} />
            
            <Route path="/ci-cd-flutter-optimized-overview" element={<Suspense fallback={null}>&lt;CiCdFlutterOptimizedOverview/&gt;</Suspense>} />
            <Route path="/ci-cd-flutter-optimized-pipeline" element={<Suspense fallback={null}>&lt;CiCdFlutterOptimizedPipeline/&gt;</Suspense>} />
            <Route path="/rocket-new-ci-cd-pipeline-configuration" element={<Suspense fallback={null}>&lt;RocketNewCiCdPipelineConfiguration/&gt;</Suspense>} />
            <Route path="/rocket-new-integration-hub" element={<Suspense fallback={null}>&lt;RocketNewIntegrationHub/&gt;</Suspense>} />
            
            <Route path="/git-security-cleanup-documentation" element={<Suspense fallback={null}>&lt;GitSecurityCleanupDocumentation/&gt;</Suspense>} />
            <Route path="/ssl-security-fix" element={<Suspense fallback={null}>&lt;SslSecurityFix/&gt;</Suspense>} />
            
            <Route path="/prometheus-monitoring-alerting-configuration" element={<Suspense fallback={null}>&lt;PrometheusMonitoringAlertingConfiguration/&gt;</Suspense>} />
            
            <Route path="/registry-v0-1-strategy-catalogue" element={<Suspense fallback={null}>&lt;RegistryV01StrategyCatalogue/&gt;</Suspense>} />
            <Route path="/registry-dual-streams-vs-fusion" element={<Suspense fallback={null}>&lt;RegistryDualStreamsVsFusion/&gt;</Suspense>} />
            <Route path="/ia-strategies-brancher" element={<Suspense fallback={null}>&lt;IaStrategiesBrancher/&gt;</Suspense>} />
            
            <Route path="/rocket-trading-mvp-live-readiness-diagnostic" element={<Suspense fallback={null}>&lt;RocketTradingMvpLiveReadinessDiagnostic/&gt;</Suspense>} />

            {/* Special surveillance routes that were broken */}
            <Route path="/multi-region-agent-surveillance-hub" element={<Suspense fallback={null}>&lt;MultiRegionAgentSurveillanceHub/&gt;</Suspense>} />
            <Route path="/trading-audit-home-v2-command-center" element={<Suspense fallback={null}>&lt;TradingAuditHomeV2CommandCenter/&gt;</Suspense>} />
            <Route path="/system-resilience-safe-landing-center" element={<Suspense fallback={null}>&lt;SystemResilienceSafeLandingCenter/&gt;</Suspense>} />
            
            <Route path="/legacy-pages-redirect" element={<Suspense fallback={null}>&lt;LegacyPagesRedirect/&gt;</Suspense>} />
            
            <Route path="*" element={<Suspense fallback={null}>&lt;NotFound/&gt;</Suspense>} />
          </Route>
        </Routes>
      </HardErrorBoundary>
    </BrowserRouter>
  );
}

const Regioni = [
  { name: 'EU', route: '/eu-regional-command-center' },
  { name: 'US', route: '/us-regional-command-center' },
  { name: 'AS', route: '/asia-regional-command-center' },
];

window.RegionPages = Regioni;
window.RegionHash = {};

export { Regioni };