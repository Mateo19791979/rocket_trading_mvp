import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import Dashboard from './pages/dashboard';

import MarketAnalysis from './pages/market-analysis';
import PortfolioViewEnhanced from './pages/portfolio-view-enhanced';
import StrategyManagement from './pages/strategy-management';
import PaperTrading from './pages/paper-trading';
import AIAgents from './pages/ai-agents';
import SystemStatus from './pages/system-status';
import BusMonitor from './pages/bus-monitor';
import OrchestratorDashboard from './pages/orchestrator-dashboard';

// Import Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// Import specialized pages

// Import pages
import AISystemStatus from './pages/ai-system-status';
import PortfolioConsolidatedView from './pages/portfolio-consolidated-view';
import RealTimeAgentPerformance from './pages/real-time-agent-performance';
import OptionsStrategyAI from './pages/options-strategy-ai';
import RiskControllerDashboard from './pages/risk-controller-dashboard';
import AgentRoster from './pages/agent-roster';
import ResearchInnovationCenter from './pages/research-innovation-center';
import SelfHealingOrchestrationDashboard from './pages/self-healing-orchestration-dashboard';
import UnifiedDashboard from './pages/unified-dashboard';
import MonitoringControlCenter from './pages/monitoring-control-center';
import WeeklyPDFReports from './pages/weekly-pdf-reports';
import ProviderRouterDashboard from './pages/provider-router-dashboard';
import CorrelationHunter from './pages/correlation-hunter';
import GoogleFinanceIntegration from './pages/google-finance-integration';
import ProjectManagementCockpit from './pages/project-management-cockpit';
import PrivateCorpusManagement from './pages/private-corpus-management';
import PipelineBooksRegistryOrchestrator from './pages/pipeline-books-registry-orchestrator';
import OpenAccessFeederPipeline from './pages/open-access-feeder-pipeline';
import FusionOAFeederPrivateCorpus from './pages/fusion-oa-feeder-private-corpus';
import KnowledgePipelineManagementCenter from './pages/knowledge-pipeline-management-center';
import StrategyRegistryBuilder from './pages/strategy-registry-builder';
import RegistryV01StrategyCatalogue from './pages/registry-v0-1-strategy-catalogue';
import RegistryDualStreamsVsFusion from './pages/registry-dual-streams-vs-fusion';
import AIChiefsChatInterface from './pages/ai-chiefs-chat-interface';
import PDFDocumentIngestionInterface from './pages/pdf-document-ingestion-interface';
import AutoDiagnosticAutoFixRocket from './pages/auto-diagnostic-auto-fix-rocket';
import TradingMVPLandingPage from './pages/trading-mvp-landing-page';
import DataminingInRocketTradingMVP from './pages/datamining-in-rocket-trading-mvp';
import AutonomousAIHedgeFundLevel from './pages/autonomous-ai-hedge-fund-level';
import VisionUltimeTheLivingHedgeFund from './pages/vision-ultime-the-living-hedge-fund';
import GlobalAITraderArchitecture from './pages/global-ai-trader-architecture';
import GlobalAITraderSecurityConfiguration from './pages/global-ai-trader-security-configuration';
import GlobalAITraderRoadmapChecklist from './pages/global-ai-trader-roadmap-checklist';
import IAStrategiesBrancher from './pages/ia-strategies-brancher';
import TradingMVPProgressDiagnostic from './pages/trading-mvp-progress-diagnostic';
import TradingMVPCompletionDashboard from './pages/trading-mvp-completion-dashboard';
import TradingMVPProductionDeploymentChecklist from './pages/trading-mvp-production-deployment-checklist';
import MVPDeploymentRoadmapDashboard from './pages/mvp-deployment-roadmap-dashboard';
import RocketTradingMVPLiveReadinessDiagnostic from './pages/rocket-trading-mvp-live-readiness-diagnostic';
import ChaosControlPanel from './pages/chaos-control-panel';
import LiveTradingOrchestrationCenter from './pages/live-trading-orchestration-center';
import WebSocketQuotesBridgeControlCenter from './pages/web-socket-quotes-bridge-control-center';
import ProviderConfigurationManagementCenter from './pages/provider-configuration-management-center';
import ShadowPriceAnomalyDetectionCenter from './pages/shadow-price-anomaly-detection-center';
import FeatureFlagsProviderControlPanel from './pages/feature-flags-provider-control-panel';
import DNSSSLManagement from './pages/dns-ssl-management';
import APIDeploymentWithTraefik from './pages/api-deployment-with-traefik';
import FlutterConfigurationSecurityGuide from './pages/flutter-configuration-security-guide';
import CICDFlutterOptimizedOverview from './pages/ci-cd-flutter-optimized-overview';
import CICDFlutterOptimizedPipeline from './pages/ci-cd-flutter-optimized-pipeline';
import RocketNewCICDPipelineConfiguration from './pages/rocket-new-ci-cd-pipeline-configuration';
import RocketNewIntegrationHub from './pages/rocket-new-integration-hub';
import SupabaseHardeningExpressPlan from './pages/supabase-hardening-express-plan';
import EnvSecurityReference from './pages/env-security-reference';
import GitSecurityCleanupDocumentation from './pages/git-security-cleanup-documentation';
import SOSAPIDiagnosticCenter from './pages/sos-api-diagnostic-center';
import LegacyPagesRedirect from './pages/legacy-pages-redirect';
import DeploymentReadinessTracker from './pages/deployment-readiness-tracker';
import KnowledgePlaybooksHub from './pages/knowledge-playbooks-hub';
import RAGKnowledgeBaseDashboard from './pages/rag-knowledge-base-dashboard';
import PDFIngestionProcessingCenter from './pages/pdf-ingestion-processing-center';
import AgentKnowledgeQueryInterface from './pages/agent-knowledge-query-interface';
import SupabaseRLSSecurityConfigurationCenter from './pages/supabase-rls-security-configuration-center';
import J1J6GoLiveAutomationCenter from './pages/j1-j6-go-live-automation-center';
import PrometheusMonitoringAlertingConfiguration from './pages/prometheus-monitoring-alerting-configuration';
import E2ETestingQAValidationSuite from './pages/e2e-testing-qa-validation-suite';
import RlsDiagnosticExpress from "./pages/rls-diagnostic-express";

// Import AI Agent Orchestration Command Center and Real-time Agent Activity Monitor
import AIAgentOrchestrationCommandCenter from './pages/ai-agent-orchestration-command-center';
import RealTimeAgentActivityMonitor from './pages/real-time-agent-activity-monitor';

// Import CMV Wilshire Market Intelligence Center
import CMVWilshireMarketIntelligenceCenter from './pages/cmv-wilshire-market-intelligence-center';

// Import Production Monitoring Dashboard with Grafana Integration
import ProductionMonitoringDashboard from './pages/production-monitoring-dashboard-with-grafana-integration';

// Import AI Agent Emergency Response Center
import AIAgentEmergencyResponseCenter from './pages/ai-agent-emergency-response-center';

// Import Production Readiness Recovery Center
import ProductionReadinessRecoveryCenter from './pages/production-readiness-recovery-center';

// Import Performance Testing Command Center
import PerformanceTestingCommandCenter from './pages/performance-testing-command-center';

import AIAPIConfigurationCenter from './pages/ai-api-configuration-center';

// Import TGE Alpha Intelligence Center
import TGEAlphaIntelligenceCenter from './pages/tge-alpha-intelligence-center';

import AILearningCritiqueCenter from './pages/ai-learning-critique-center';
import OptionsScreeningIntelligenceHub from './pages/options-screening-intelligence-hub';

// Import TGE Intelligence & Rewards Center
import TGEIntelligenceRewardsCenter from './pages/tge-intelligence-rewards-center';

// Import System Recovery & Optimization Center
import SystemRecoveryOptimizationCenter from './pages/system-recovery-optimization-center';

// Import new pages
import AdvancedAISecurityThreatIntelligenceCenter from './pages/advanced-ai-security-threat-intelligence-center';
import CausalAIMarketRegimeIntelligenceHub from './pages/causal-ai-market-regime-intelligence-hub';

// Import Hybrid RAG & Dynamic Intelligence Orchestrator
import HybridRAGDynamicIntelligenceOrchestrator from './pages/hybrid-rag-dynamic-intelligence-orchestrator';

// Import new AAS Evolution pages
import AutonomousAISpeculationAASEvolutionCenter from './pages/autonomous-ai-speculation-aas-evolution-center';
import AIConsciousnessDecisionIntelligenceHub from './pages/ai-consciousness-decision-intelligence-hub';

// Import Genetic Strategy Evolution Laboratory
import GeneticStrategyEvolutionLaboratory from './pages/genetic-strategy-evolution-laboratory';

// Import new AAS pages
import AASProductionControlCenter from './pages/aas-production-control-center';

// Import new AAS Level 5 Production Certification pages
import AASLevel5ProductionCertificationCommandCenter from './pages/aas-level-5-production-certification-command-center';
import K6LoadTestingPerformanceCertificationCenter from './pages/k6-load-testing-performance-certification-center';

// Import new page
import ParanoidSecurityAuditComplianceCenter from './pages/paranoid-security-audit-compliance-center';

// Import new AAS Genius Pack pages
import AASGeniusPackControlCenter from './pages/aas-genius-pack-control-center';
import OmegaAIAntagonistLaboratory from './pages/omega-ai-antagonist-laboratory';

import InternalAgentsRegistry from './pages/internal-agents-registry/index.jsx';

import AttentionMarketResourceAllocationHub from "./pages/attention-market-resource-allocation-hub";

// Import Quantum Engine & Agent Diplomacy Hub
import QuantumEngineAgentDiplomacyHub from "./pages/quantum-engine-agent-diplomacy-hub";

// Import Ultra-Fast GO-LIVE Command Center and Captain's Log Decision Intelligence Hub import UltraFastGoLiveCommandCenter from'./pages/ultra-fast-go-live-command-center';
import CaptainsLogDecisionIntelligenceHub from './pages/captain-s-log-decision-intelligence-hub';

// Import new Health Sentinel page
import HealthSentinelObservabilityCommand from './pages/health-sentinel-observability-command';

// Import new AAS Real-Time AI Thoughts Observatory
import AASRealTimeAIThoughtsObservatory from './pages/aas-real-time-ai-thoughts-observatory';

// Import new Docker Production Deployment Center
import DockerProductionDeploymentCenter from './pages/docker-production-deployment-center';

// Import new Redis Cache & Performance Infrastructure Center
import RedisCachePerformanceInfrastructureCenter from './pages/redis-cache-performance-infrastructure-center';

// Import FIXED PAGES - CRITICAL ROUTING ISSUE RESOLUTION
import AASEmergencyResponseKillSwitchCenter from './pages/aas-emergency-response-kill-switch-center';
import SSLSecurityFix from './pages/ssl-security-fix';

// Import IBKR Client Portal Gateway Integration Center
import IBKRClientPortalGatewayIntegrationCenter from './pages/ibkr-client-portal-gateway-integration-center';

// Import Frontend Debug Loading Blocker
import FrontendDebugLoadingBlocker from './pages/frontend-debug-loading-blocker';

// Import MISSING System Diagnostic Post-502 Fix page
import SystemDiagnosticPost502Fix from './pages/system-diagnostic-post-502-fix';

// Import AI Knowledge Vector Management
import AIKnowledgeVectorManagement from "./pages/ai-knowledge-vector-management";

export default function Routes() {
  // ENHANCED: Add route error boundary and diagnostics
  const [routeError, setRouteError] = useState(null);
  
  useEffect(() => {
    const handleRouteError = (event) => {
      console.error('🚨 Route Error:', event?.error);
      setRouteError(event?.error);
      
      // Auto-recovery attempt
      setTimeout(() => {
        setRouteError(null);
        console.log('🔄 Route: Attempting auto-recovery');
      }, 3000);
    };
    
    window.addEventListener('error', handleRouteError);
    return () => window.removeEventListener('error', handleRouteError);
  }, []);

  // ENHANCED: Add route diagnostics component
  const RouteDiagnostics = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-100 border border-green-300 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <CheckCircle size={16} className="text-green-600" />
          <span className="text-xs text-green-800 font-bold">
            Routage: {window.location?.pathname} ✅
          </span>
        </div>
      </div>
    </div>
  );

  if (routeError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertTriangle size={64} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Erreur de Navigation Détectée</h2>
          <p className="text-gray-600 mb-6">
            Une erreur temporaire de routage s'est produite. Récupération automatique en cours...
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* ENHANCED: More robust main route with error handling */}
          <Route 
            path="/" 
            element={
              <ErrorBoundary fallback={<div>Erreur Dashboard - <a href="/">Recharger</a></div>}>
                <Dashboard />
              </ErrorBoundary>
            } 
          />

          {/* CRITICAL FIX: Add missing system-diagnostic-post-502-fix route - Was causing 404 errors */}
          <Route path="/system-diagnostic-post-502-fix" element={<SystemDiagnosticPost502Fix />} />

          {/* Unified dashboard with module support - FIXED ROUTING */}
          <Route path="/unified" element={<UnifiedDashboard />} />
          
          {/* ENHANCED: Add more specific unified routes to prevent 404s */}
          <Route path="/unified/:module" element={<UnifiedDashboard />} />
          <Route path="/unified/:module/:view" element={<UnifiedDashboard />} />
          <Route path="/unified/:module/:view/:id" element={<UnifiedDashboard />} />

          {/* ENHANCED: Add dashboard aliases to prevent 404s */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/tableau" element={<Dashboard />} />
          <Route path="/tableau-de-bord" element={<Dashboard />} />

          {/* Legacy unified routes - redirect to path-based format for consistency */}
          <Route path="/unified-dashboard" element={<UnifiedDashboard />} />

          {/* Trading Dashboard - direct route without automatic redirects */}
          <Route path="/unified/trading/dashboard" element={<UnifiedDashboard />} />
          <Route path="/unified/trading/positions" element={<UnifiedDashboard />} />

          {/* Data Pipeline views - direct routes */}
          <Route path="/unified/data/pipelines" element={<UnifiedDashboard />} />

          {/* AI Dashboard - direct route */}
          <Route path="/unified/ai/dashboard" element={<UnifiedDashboard />} />

          {/* NEW: IBKR Client Portal Gateway Integration Center Route */}
          <Route path="/ibkr-client-portal-gateway-integration-center" element={<IBKRClientPortalGatewayIntegrationCenter />} />

          {/* NEW: Frontend Debug Loading Blocker Route */}
          <Route path="/frontend-debug-loading-blocker" element={<FrontendDebugLoadingBlocker />} />

          {/* CRITICAL FIX: AAS Emergency Response & Kill Switch Center Route - Was causing 404 errors */}
          <Route path="/aas-emergency-response-kill-switch-center" element={<AASEmergencyResponseKillSwitchCenter />} />

          {/* CRITICAL FIX: SSL Security Fix Route - Was causing 404 errors */}
          <Route path="/ssl-security-fix" element={<SSLSecurityFix />} />

          {/* RESOLVED: Redis Cache & Performance Infrastructure Center Route */}
          <Route path="/redis-cache-performance-infrastructure-center" element={<RedisCachePerformanceInfrastructureCenter />} />

          {/* RESOLVED: Docker Production Deployment Center Route */}
          <Route path="/docker-production-deployment-center" element={<DockerProductionDeploymentCenter />} />

          {/* RESOLVED: AAS Real-Time AI Thoughts Observatory Route */}
          <Route path="/aas-real-time-ai-thoughts-observatory" element={<AASRealTimeAIThoughtsObservatory />} />

          {/* RESOLVED: Health Sentinel & Observability Command Route */}
          <Route path="/health-sentinel-observability-command" element={<HealthSentinelObservabilityCommand />} />

          {/* RESOLVED: Ultra-Fast GO-LIVE and Captain's Log Routes */}
          <Route path="/captain-s-log-decision-intelligence-hub" element={<CaptainsLogDecisionIntelligenceHub />} />

          {/* RESOLVED: Quantum Engine & Agent Diplomacy Hub Route */}
          <Route path="/quantum-engine-agent-diplomacy-hub" element={<QuantumEngineAgentDiplomacyHub />} />

          {/* RESOLVED: AAS Genius Pack Routes */}
          <Route path="/aas-genius-pack-control-center" element={<AASGeniusPackControlCenter />} />
          <Route path="/omega-ai-antagonist-laboratory" element={<OmegaAIAntagonistLaboratory />} />

          {/* RESOLVED: Paranoid Security Audit & Compliance Center */}
          <Route path="/paranoid-security-audit-compliance-center" element={<ParanoidSecurityAuditComplianceCenter />} />

          {/* RESOLVED: AAS Level 5 Production Certification Routes */}
          <Route path="/aas-level-5-production-certification-command-center" element={<AASLevel5ProductionCertificationCommandCenter />} />
          <Route path="/k6-load-testing-performance-certification-center" element={<K6LoadTestingPerformanceCertificationCenter />} />

          {/* RESOLVED: AAS Production Control Center */}
          <Route path="/aas-production-control-center" element={<AASProductionControlCenter />} />

          {/* RESOLVED: AAS Evolution Routes */}
          <Route path="/autonomous-ai-speculation-aas-evolution-center" element={<AutonomousAISpeculationAASEvolutionCenter />} />
          <Route path="/ai-consciousness-decision-intelligence-hub" element={<AIConsciousnessDecisionIntelligenceHub />} />

          {/* Genetic Strategy Evolution Laboratory */}
          <Route path="/genetic-strategy-evolution-laboratory" element={<GeneticStrategyEvolutionLaboratory />} />

          {/* Hybrid RAG & Dynamic Intelligence Orchestrator */}
          <Route path="/hybrid-rag-dynamic-intelligence-orchestrator" element={<HybridRAGDynamicIntelligenceOrchestrator />} />

          {/* Advanced AI Security & Threat Intelligence Center */}
          <Route path="/advanced-ai-security-threat-intelligence-center" element={<AdvancedAISecurityThreatIntelligenceCenter />} />

          {/* Causal AI & Market Regime Intelligence Hub */}
          <Route path="/causal-ai-market-regime-intelligence-hub" element={<CausalAIMarketRegimeIntelligenceHub />} />

          {/* System Recovery & Optimization Center */}
          <Route path="/system-recovery-optimization-center" element={<SystemRecoveryOptimizationCenter />} />

          {/* AI Learning & Critique Center */}
          <Route path="/ai-learning-critique-center" element={<AILearningCritiqueCenter />} />

          {/* Options Screening Intelligence Hub */}
          <Route path="/options-screening-intelligence-hub" element={<OptionsScreeningIntelligenceHub />} />

          {/* TGE Alpha Intelligence Center */}
          <Route path="/tge-alpha-intelligence-center" element={<TGEAlphaIntelligenceCenter />} />

          {/* TGE Intelligence & Rewards Center */}
          <Route path="/tge-intelligence-rewards-center" element={<TGEIntelligenceRewardsCenter />} />

          {/* AI API Configuration Center */}
          <Route path="/ai-api-configuration-center" element={<AIAPIConfigurationCenter />} />

          {/* E2E Testing & QA Validation Suite */}
          <Route path="/e2e-testing-qa-validation-suite" element={<E2ETestingQAValidationSuite />} />

          {/* J1-J6 Go-Live Automation Center */}
          <Route path="/j1-j6-go-live-automation-center" element={<J1J6GoLiveAutomationCenter />} />

          {/* Prometheus Monitoring & Alerting Configuration */}
          <Route path="/prometheus-monitoring-alerting-configuration" element={<PrometheusMonitoringAlertingConfiguration />} />

          {/* Security Configuration */}
          <Route path="/supabase-rls-security-configuration-center" element={<SupabaseRLSSecurityConfigurationCenter />} />

          {/* Production Readiness Recovery Center */}
          <Route path="/production-readiness-recovery-center" element={<ProductionReadinessRecoveryCenter />} />

          {/* AI Agent Orchestration and Monitoring */}
          <Route path="/ai-agent-orchestration-command-center" element={<AIAgentOrchestrationCommandCenter />} />
          <Route path="/real-time-agent-activity-monitor" element={<RealTimeAgentActivityMonitor />} />
          
          {/* AI Agent Emergency Response Center */}
          <Route path="/ai-agent-emergency-response-center" element={<AIAgentEmergencyResponseCenter />} />
          
          {/* Authentication routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Add Knowledge Playbooks Hub route */}
          <Route path="/knowledge-playbooks-hub" element={<KnowledgePlaybooksHub />} />

          {/* Add new RAG Knowledge Base routes */}
          <Route path="/rag-knowledge-base-dashboard" element={<RAGKnowledgeBaseDashboard />} />
          <Route path="/pdf-ingestion-processing-center" element={<PDFIngestionProcessingCenter />} />
          <Route path="/agent-knowledge-query-interface" element={<AgentKnowledgeQueryInterface />} />

          {/* AI Knowledge Vector Management */}
          <Route path="/ai-knowledge-vector-management" element={<AIKnowledgeVectorManagement />} />
          <Route path="/rag-system" element={<AIKnowledgeVectorManagement />} />
          <Route path="/vectorisation-ia" element={<AIKnowledgeVectorManagement />} />
          <Route path="/base-connaissances-ai" element={<AIKnowledgeVectorManagement />} />

          {/* CMV & Wilshire Market Intelligence Center */}
          <Route path="/cmv-wilshire-market-intelligence-center" element={<CMVWilshireMarketIntelligenceCenter />} />

          {/* Production Monitoring Dashboard with Grafana Integration */}
          <Route path="/production-monitoring-dashboard-with-grafana-integration" element={<ProductionMonitoringDashboard />} />

          {/* Performance Testing */}
          <Route path="/performance-testing-command-center" element={<PerformanceTestingCommandCenter />} />

          {/* Trading and Portfolio Management */}
          <Route path="/market-analysis" element={<MarketAnalysis />} />
          <Route path="/portfolio-view-enhanced" element={<PortfolioViewEnhanced />} />
          <Route path="/portfolio-consolidated-view" element={<PortfolioConsolidatedView />} />
          <Route path="/strategy-management" element={<StrategyManagement />} />
          <Route path="/paper-trading" element={<PaperTrading />} />
          <Route path="/correlation-hunter" element={<CorrelationHunter />} />

          {/* AI and Agents */}
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/ai-system-status" element={<AISystemStatus />} />
          <Route path="/agent-roster" element={<AgentRoster />} />
          <Route path="/real-time-agent-performance" element={<RealTimeAgentPerformance />} />
          <Route path="/options-strategy-ai" element={<OptionsStrategyAI />} />

          {/* System Monitoring */}
          <Route path="/system-status" element={<SystemStatus />} />
          <Route path="/bus-monitor" element={<BusMonitor />} />
          <Route path="/orchestrator-dashboard" element={<OrchestratorDashboard />} />
          <Route path="/monitoring-control-center" element={<MonitoringControlCenter />} />
          <Route path="/self-healing-orchestration-dashboard" element={<SelfHealingOrchestrationDashboard />} />

          {/* Risk Management */}
          <Route path="/risk-controller-dashboard" element={<RiskControllerDashboard />} />

          {/* Research and Innovation */}
          <Route path="/research-innovation-center" element={<ResearchInnovationCenter />} />
          <Route path="/knowledge-pipeline-management-center" element={<KnowledgePipelineManagementCenter />} />

          {/* Data Management */}
          <Route path="/provider-router-dashboard" element={<ProviderRouterDashboard />} />
          <Route path="/google-finance-integration" element={<GoogleFinanceIntegration />} />
          <Route path="/weekly-pdf-reports" element={<WeeklyPDFReports />} />

          {/* Project Management */}
          <Route path="/project-management-cockpit" element={<ProjectManagementCockpit />} />
          <Route path="/unified-dashboard" element={<UnifiedDashboard />} />

          {/* Content Management */}
          <Route path="/private-corpus-management" element={<PrivateCorpusManagement />} />
          <Route path="/pipeline-books-registry-orchestrator" element={<PipelineBooksRegistryOrchestrator />} />
          <Route path="/open-access-feeder-pipeline" element={<OpenAccessFeederPipeline />} />
          <Route path="/fusion-oa-feeder-private-corpus" element={<FusionOAFeederPrivateCorpus />} />
          <Route path="/pdf-document-ingestion-interface" element={<PDFDocumentIngestionInterface />} />

          {/* Strategy Management */}
          <Route path="/strategy-registry-builder" element={<StrategyRegistryBuilder />} />
          <Route path="/registry-v0-1-strategy-catalogue" element={<RegistryV01StrategyCatalogue />} />
          <Route path="/registry-dual-streams-vs-fusion" element={<RegistryDualStreamsVsFusion />} />
          <Route path="/ia-strategies-brancher" element={<IAStrategiesBrancher />} />

          {/* AI Chat and Communication */}
          <Route path="/ai-chiefs-chat-interface" element={<AIChiefsChatInterface />} />

          {/* Diagnostics and Automation */}
          <Route path="/auto-diagnostic-auto-fix-rocket" element={<AutoDiagnosticAutoFixRocket />} />

          {/* MVP and Deployment */}
          <Route path="/trading-mvp-landing-page" element={<TradingMVPLandingPage />} />
          <Route path="/datamining-in-rocket-trading-mvp" element={<DataminingInRocketTradingMVP />} />
          <Route path="/autonomous-ai-hedge-fund-level" element={<AutonomousAIHedgeFundLevel />} />
          <Route path="/vision-ultime-the-living-hedge-fund" element={<VisionUltimeTheLivingHedgeFund />} />
          <Route path="/global-ai-trader-architecture" element={<GlobalAITraderArchitecture />} />
          <Route path="/global-ai-trader-security-configuration" element={<GlobalAITraderSecurityConfiguration />} />
          <Route path="/global-ai-trader-roadmap-checklist" element={<GlobalAITraderRoadmapChecklist />} />
          <Route path="/trading-mvp-progress-diagnostic" element={<TradingMVPProgressDiagnostic />} />
          <Route path="/trading-mvp-completion-dashboard" element={<TradingMVPCompletionDashboard />} />
          <Route path="/trading-mvp-production-deployment-checklist" element={<TradingMVPProductionDeploymentChecklist />} />
          <Route path="/mvp-deployment-roadmap-dashboard" element={<MVPDeploymentRoadmapDashboard />} />
          <Route path="/rocket-trading-mvp-live-readiness-diagnostic" element={<RocketTradingMVPLiveReadinessDiagnostic />} />

          {/* Chaos Engineering and Control */}
          <Route path="/chaos-control-panel" element={<ChaosControlPanel />} />
          <Route path="/live-trading-orchestration-center" element={<LiveTradingOrchestrationCenter />} />

          {/* Real-time Systems */}
          <Route path="/web-socket-quotes-bridge-control-center" element={<WebSocketQuotesBridgeControlCenter />} />

          {/* Configuration Management */}
          <Route path="/provider-configuration-management-center" element={<ProviderConfigurationManagementCenter />} />
          <Route path="/shadow-price-anomaly-detection-center" element={<ShadowPriceAnomalyDetectionCenter />} />
          <Route path="/feature-flags-provider-control-panel" element={<FeatureFlagsProviderControlPanel />} />

          {/* Infrastructure and DevOps */}
          <Route path="/dns-ssl-management" element={<DNSSSLManagement />} />
          <Route path="/api-deployment-with-traefik" element={<APIDeploymentWithTraefik />} />
          <Route path="/flutter-configuration-security-guide" element={<FlutterConfigurationSecurityGuide />} />
          <Route path="/ci-cd-flutter-optimized-overview" element={<CICDFlutterOptimizedOverview />} />
          <Route path="/ci-cd-flutter-optimized-pipeline" element={<CICDFlutterOptimizedPipeline />} />
          <Route path="/rocket-new-ci-cd-pipeline-configuration" element={<RocketNewCICDPipelineConfiguration />} />
          <Route path="/rocket-new-integration-hub" element={<RocketNewIntegrationHub />} />

          {/* Security and Hardening */}
          <Route path="/supabase-hardening-express-plan" element={<SupabaseHardeningExpressPlan />} />
          <Route path="/env-security-reference" element={<EnvSecurityReference />} />
          <Route path="/git-security-cleanup-documentation" element={<GitSecurityCleanupDocumentation />} />

          {/* Diagnostics and Troubleshooting */}
          <Route path="/sos-api-diagnostic-center" element={<SOSAPIDiagnosticCenter />} />

          {/* New Routes */}
          <Route path="/deployment-readiness-tracker" element={<DeploymentReadinessTracker />} />

          {/* Legacy and Redirects */}
          <Route path="/legacy-pages-redirect" element={<LegacyPagesRedirect />} />

          {/* Add RLS Diagnostic Express route - for debugging RLS health issues */}
          <Route path="/rls-diagnostic-express" element={<RlsDiagnosticExpress />} />
          <Route path="/diagnostic-rls" element={<RlsDiagnosticExpress />} />

          {/* AAS Genius Pack Extension */}
          <Route path="/attention-market-resource-allocation-hub" element={<AttentionMarketResourceAllocationHub />} />

          <Route path="/internal-agents-registry" element={<InternalAgentsRegistry />} />

          {/* ENHANCED: Better 404 handling with navigation options */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                  <div className="text-8xl mb-4">🔍</div>
                  <h2 className="text-2xl font-semibold mb-4">Page Non Trouvée</h2>
                  <p className="text-gray-600 mb-6">
                    La page demandée n'existe pas dans le système Rocket Trading MVP.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      🏠 Retour au Dashboard
                    </button>
                    <button
                      onClick={() => window.history?.back()}
                      className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      ↶ Page Précédente
                    </button>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-2">🗺️ Navigation Rapide:</h3>
                    <div className="text-sm space-y-1">
                      <a href="/market-analysis" className="block text-blue-600 hover:underline">📊 Analyse Marché</a>
                      <a href="/ai-agents" className="block text-blue-600 hover:underline">🤖 Agents IA</a>
                      <a href="/paper-trading" className="block text-blue-600 hover:underline">📈 Paper Trading</a>
                      <a href="/system-status" className="block text-blue-600 hover:underline">🔧 Statut Système</a>
                    </div>
                  </div>
                </div>
              </div>
            } 
          />
        </RouterRoutes>
        
        {/* ENHANCED: Add route diagnostics in development */}
        {process.env?.NODE_ENV === 'development' && <RouteDiagnostics />}
      </ErrorBoundary>
    </BrowserRouter>
  );
}