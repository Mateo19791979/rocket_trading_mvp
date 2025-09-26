import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Existing page imports
import Dashboard from './pages/dashboard';
import MarketAnalysis from './pages/market-analysis';
import PaperTrading from './pages/paper-trading';
import StrategyManagement from './pages/strategy-management';
import AIAgents from './pages/ai-agents';
import SystemStatus from './pages/system-status';
import BusMonitor from './pages/bus-monitor';
import PortfolioConsolidatedView from './pages/portfolio-consolidated-view';
import RealTimeAgentPerformance from './pages/real-time-agent-performance';
import AISystemStatus from './pages/ai-system-status';
import RiskControllerDashboard from './pages/risk-controller-dashboard';
import AgentRoster from './pages/agent-roster';
import OptionsStrategyAI from './pages/options-strategy-ai';
import OrchestratorDashboard from './pages/orchestrator-dashboard';
import DNSSSLManagement from './pages/dns-ssl-management';
import IAStrategiesBrancher from './pages/ia-strategies-brancher';
import CorrelationHunter from './pages/correlation-hunter';
import PortfolioViewEnhanced from './pages/portfolio-view-enhanced';
import WeeklyPDFReports from './pages/weekly-pdf-reports';

// New import for GlobalAI Trader Architecture
import GlobalAITraderArchitecture from './pages/global-ai-trader-architecture';

// New import for GlobalAI Trader Roadmap Checklist
import GlobalAITraderRoadmapChecklist from './pages/global-ai-trader-roadmap-checklist';

// New import for GlobalAI Trader Security Configuration
import GlobalAITraderSecurityConfiguration from './pages/global-ai-trader-security-configuration';

// New import for Registry v0.1 Strategy Catalogue
import RegistryV01StrategyCatalogue from './pages/registry-v0-1-strategy-catalogue';

// New import for Pipeline Books Registry Orchestrator
import PipelineBooksRegistryOrchestrator from './pages/pipeline-books-registry-orchestrator';

// New import for Open-Access Feeder Pipeline
import OpenAccessFeederPipeline from './pages/open-access-feeder-pipeline';

// New import for Private Corpus Management
import PrivateCorpusManagement from './pages/private-corpus-management';

// New import for Fusion — OA Feeder + Private Corpus
import FusionOaFeederPrivateCorpus from './pages/fusion-oa-feeder-private-corpus';

// New import for Trading MVP Landing Page
import TradingMVPLandingPage from './pages/trading-mvp-landing-page';

// New import for Trading-MVP Production Deployment Checklist
import TradingMVPProductionDeploymentChecklist from './pages/trading-mvp-production-deployment-checklist';

// New import for API Deployment with Traefik
import APIDeploymentWithTraefik from './pages/api-deployment-with-traefik';

// New import for .env & Security Reference
import EnvSecurityReference from './pages/env-security-reference';

// New import for Rocket.new Integration Hub
import RocketNewIntegrationHub from './pages/rocket-new-integration-hub';

// New import for SOS API Diagnostic Center
import SOSAPIDiagnosticCenter from './pages/sos-api-diagnostic-center';

// New import for Registry Dual Streams vs Fusion
import RegistryDualStreamsVsFusion from './pages/registry-dual-streams-vs-fusion';

// New import for Auto-Diagnostic & Auto-Fix (Rocket)
import AutoDiagnosticAutoFixRocket from './pages/auto-diagnostic-auto-fix-rocket';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// 404 page
import NotFound from './pages/NotFound';

export default function Routes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Main Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Emergency/Diagnostic Tools */}
          <Route path="/sos-api-diagnostic-center" element={<SOSAPIDiagnosticCenter />} />
          <Route path="/auto-diagnostic-auto-fix-rocket" element={<AutoDiagnosticAutoFixRocket />} />
          
          {/* Trading MVP Pages */}
          <Route path="/trading-mvp-landing-page" element={<TradingMVPLandingPage />} />
          <Route path="/trading-mvp-production-deployment-checklist" element={<TradingMVPProductionDeploymentChecklist />} />
          <Route path="/api-deployment-with-traefik" element={<APIDeploymentWithTraefik />} />
          <Route path="/env-security-reference" element={<EnvSecurityReference />} />
          <Route path="/rocket-new-integration-hub" element={<RocketNewIntegrationHub />} />
          
          {/* Trading & Market */}
          <Route path="/market-analysis" element={<MarketAnalysis />} />
          <Route path="/paper-trading" element={<PaperTrading />} />
          <Route path="/portfolio-consolidated-view" element={<PortfolioConsolidatedView />} />
          <Route path="/portfolio-view-enhanced" element={<PortfolioViewEnhanced />} />
          <Route path="/correlation-hunter" element={<CorrelationHunter />} />
          
          {/* Strategy & AI */}
          <Route path="/strategy-management" element={<StrategyManagement />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/real-time-agent-performance" element={<RealTimeAgentPerformance />} />
          <Route path="/ai-system-status" element={<AISystemStatus />} />
          <Route path="/agent-roster" element={<AgentRoster />} />
          <Route path="/options-strategy-ai" element={<OptionsStrategyAI />} />
          <Route path="/ia-strategies-brancher" element={<IAStrategiesBrancher />} />
          <Route path="/registry-v0-1-strategy-catalogue" element={<RegistryV01StrategyCatalogue />} />
          <Route path="/registry-dual-streams-vs-fusion" element={<RegistryDualStreamsVsFusion />} />
          
          {/* Pipeline Pages */}
          <Route path="/pipeline-books-registry-orchestrator" element={<PipelineBooksRegistryOrchestrator />} />
          <Route path="/open-access-feeder-pipeline" element={<OpenAccessFeederPipeline />} />
          <Route path="/private-corpus-management" element={<PrivateCorpusManagement />} />
          <Route path="/fusion-oa-feeder-private-corpus" element={<FusionOaFeederPrivateCorpus />} />
          
          {/* Architecture & System */}
          <Route path="/global-ai-trader-architecture" element={<GlobalAITraderArchitecture />} />
          <Route path="/global-ai-trader-roadmap-checklist" element={<GlobalAITraderRoadmapChecklist />} />
          <Route path="/global-ai-trader-security-configuration" element={<GlobalAITraderSecurityConfiguration />} />
          <Route path="/system-status" element={<SystemStatus />} />
          <Route path="/bus-monitor" element={<BusMonitor />} />
          <Route path="/orchestrator-dashboard" element={<OrchestratorDashboard />} />
          <Route path="/risk-controller-dashboard" element={<RiskControllerDashboard />} />
          <Route path="/dns-ssl-management" element={<DNSSSLManagement />} />
          
          {/* Reports */}
          <Route path="/weekly-pdf-reports" element={<WeeklyPDFReports />} />
          
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}