import React from 'react';
import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Import all page components
import Dashboard from './pages/dashboard';
import MarketAnalysis from './pages/market-analysis';
import PortfolioView from './pages/portfolio-view-enhanced';
import PortfolioConsolidatedView from './pages/portfolio-consolidated-view';
import PaperTrading from './pages/paper-trading';
import StrategyManagement from './pages/strategy-management';
import AIAgents from './pages/ai-agents';
import BusMonitor from './pages/bus-monitor';
import SystemStatus from './pages/system-status';
import AISystemStatus from './pages/ai-system-status';
import RealTimeAgentPerformance from './pages/real-time-agent-performance';
import AgentRoster from './pages/agent-roster';
import OrchestratorDashboard from './pages/orchestrator-dashboard';
import RiskControllerDashboard from './pages/risk-controller-dashboard';
import OptionsStrategyAI from './pages/options-strategy-ai';
import CorrelationHunter from './pages/correlation-hunter';
import OpenAccessFeederPipeline from './pages/open-access-feeder-pipeline';
import FusionOaFeederPrivateCorpus from './pages/fusion-oa-feeder-private-corpus';
import PipelineBooksRegistryOrchestrator from './pages/pipeline-books-registry-orchestrator';
import PrivateCorpusManagement from './pages/private-corpus-management';
import RegistryV01StrategyCatalogue from './pages/registry-v0-1-strategy-catalogue';
import WeeklyPdfReports from './pages/weekly-pdf-reports';
import IaStrategiesBrancher from './pages/ia-strategies-brancher';
import TradingMvpLandingPage from './pages/trading-mvp-landing-page';
import RocketNewIntegrationHub from './pages/rocket-new-integration-hub';
import GlobalAiTraderArchitecture from './pages/global-ai-trader-architecture';
import GlobalAiTraderSecurityConfiguration from './pages/global-ai-trader-security-configuration';
import GlobalAiTraderRoadmapChecklist from './pages/global-ai-trader-roadmap-checklist';
import TradingMvpProductionDeploymentChecklist from './pages/trading-mvp-production-deployment-checklist';
import ApiDeploymentWithTraefik from './pages/api-deployment-with-traefik';
import DnsSslManagement from './pages/dns-ssl-management';
import EnvSecurityReference from './pages/env-security-reference';
import SosApiDiagnosticCenter from './pages/sos-api-diagnostic-center';
import AutoDiagnosticAutoFixRocket from './pages/auto-diagnostic-auto-fix-rocket';
import RegistryDualStreamsVsFusion from './pages/registry-dual-streams-vs-fusion';
import AutonomousAiHedgeFundLevel from './pages/autonomous-ai-hedge-fund-level';
import DataminingInRocketTradingMvp from './pages/datamining-in-rocket-trading-mvp';
import MonitoringControlCenter from './pages/monitoring-control-center';
import VisionUltimeLivingHedgeFund from './pages/vision-ultime-the-living-hedge-fund';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResearchInnovationCenter from './pages/research-innovation-center';
import AIChiefsChatInterface from './pages/ai-chiefs-chat-interface';
import SupabaseHardeningExpressPlan from './pages/supabase-hardening-express-plan';

// 404 page
import NotFound from './pages/NotFound';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Dashboard & Trading */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/market-analysis" element={<MarketAnalysis />} />
          <Route path="/portfolio-view" element={<PortfolioView />} />
          <Route path="/portfolio-consolidated-view" element={<PortfolioConsolidatedView />} />
          <Route path="/paper-trading" element={<PaperTrading />} />
          <Route path="/strategy-management" element={<StrategyManagement />} />
          <Route path="/options-strategy-ai" element={<OptionsStrategyAI />} />
          <Route path="/correlation-hunter" element={<CorrelationHunter />} />

          {/* AI & Agents */}
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/bus-monitor" element={<BusMonitor />} />
          <Route path="/system-status" element={<SystemStatus />} />
          <Route path="/ai-system-status" element={<AISystemStatus />} />
          <Route path="/real-time-agent-performance" element={<RealTimeAgentPerformance />} />
          <Route path="/agent-roster" element={<AgentRoster />} />
          <Route path="/orchestrator-dashboard" element={<OrchestratorDashboard />} />
          <Route path="/risk-controller-dashboard" element={<RiskControllerDashboard />} />
          <Route path="/autonomous-ai-hedge-fund-level" element={<AutonomousAiHedgeFundLevel />} />
          <Route path="/research-innovation-center" element={<ResearchInnovationCenter />} />
          <Route path="/vision-ultime-the-living-hedge-fund" element={<VisionUltimeLivingHedgeFund />} />
          <Route path="/ai-chiefs-chat-interface" element={<AIChiefsChatInterface />} />

          {/* Security & Hardening */}
          <Route path="/supabase-hardening-express-plan" element={<SupabaseHardeningExpressPlan />} />

          {/* Data & Pipeline Management */}
          <Route path="/open-access-feeder-pipeline" element={<OpenAccessFeederPipeline />} />
          <Route path="/fusion-oa-feeder-private-corpus" element={<FusionOaFeederPrivateCorpus />} />
          <Route path="/pipeline-books-registry-orchestrator" element={<PipelineBooksRegistryOrchestrator />} />
          <Route path="/private-corpus-management" element={<PrivateCorpusManagement />} />
          <Route path="/registry-v0-1-strategy-catalogue" element={<RegistryV01StrategyCatalogue />} />
          <Route path="/registry-dual-streams-vs-fusion" element={<RegistryDualStreamsVsFusion />} />
          <Route path="/datamining-in-rocket-trading-mvp" element={<DataminingInRocketTradingMvp />} />

          {/* Reports & Monitoring */}
          <Route path="/weekly-pdf-reports" element={<WeeklyPdfReports />} />
          <Route path="/monitoring-control-center" element={<MonitoringControlCenter />} />

          {/* Architecture & Deployment */}
          <Route path="/ia-strategies-brancher" element={<IaStrategiesBrancher />} />
          <Route path="/global-ai-trader-architecture" element={<GlobalAiTraderArchitecture />} />
          <Route path="/global-ai-trader-security-configuration" element={<GlobalAiTraderSecurityConfiguration />} />
          <Route path="/global-ai-trader-roadmap-checklist" element={<GlobalAiTraderRoadmapChecklist />} />
          <Route path="/trading-mvp-production-deployment-checklist" element={<TradingMvpProductionDeploymentChecklist />} />
          <Route path="/api-deployment-with-traefik" element={<ApiDeploymentWithTraefik />} />
          <Route path="/dns-ssl-management" element={<DnsSslManagement />} />

          {/* Development & Integration */}
          <Route path="/trading-mvp-landing-page" element={<TradingMvpLandingPage />} />
          <Route path="/rocket-new-integration-hub" element={<RocketNewIntegrationHub />} />
          <Route path="/env-security-reference" element={<EnvSecurityReference />} />
          <Route path="/sos-api-diagnostic-center" element={<SosApiDiagnosticCenter />} />
          <Route path="/auto-diagnostic-auto-fix-rocket" element={<AutoDiagnosticAutoFixRocket />} />

          {/* Authentication */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;