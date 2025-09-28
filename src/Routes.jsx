import React from 'react';
import { BrowserRouter, Route, Routes as RouterRoutes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

// Unified Dashboard (consolidates non-AI pages)
import UnifiedDashboard from './pages/unified-dashboard';
import LegacyPagesRedirect from './pages/legacy-pages-redirect';

// Auth pages (kept separate for security)
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// AI Pages - PRESERVED AS INDIVIDUAL ROUTES (12 pages)
import AIAgents from './pages/ai-agents';
import AISystemStatus from './pages/ai-system-status';
import RealTimeAgentPerformance from './pages/real-time-agent-performance';
import AgentRoster from './pages/agent-roster';
import OptionsStrategyAI from './pages/options-strategy-ai';
import CorrelationHunter from './pages/correlation-hunter';
import AiChiefsChatInterface from './pages/ai-chiefs-chat-interface';
import IaStrategiesBrancher from './pages/ia-strategies-brancher';
import GlobalAiTraderArchitecture from './pages/global-ai-trader-architecture';
import AutonomousAiHedgeFundLevel from './pages/autonomous-ai-hedge-fund-level';
import VisionUltimeTheLivingHedgeFund from './pages/vision-ultime-the-living-hedge-fund';
import ResearchInnovationCenter from './pages/research-innovation-center';

// STRATEGY Pages - PRESERVED AS INDIVIDUAL ROUTES (2 additional pages)
import StrategyManagement from './pages/strategy-management';
import RegistryV01StrategyCatalogue from './pages/registry-v0-1-strategy-catalogue';

// 404 page
import NotFound from './pages/NotFound';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Main Unified Dashboard - consolidates non-AI pages */}
          <Route path="/" element={<UnifiedDashboard />} />
          <Route path="/unified" element={<UnifiedDashboard />} />

          {/* Authentication - kept separate for security */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* === AI PAGES PRESERVED INDIVIDUALLY (12 pages) === */}
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/ai-system-status" element={<AISystemStatus />} />
          <Route path="/real-time-agent-performance" element={<RealTimeAgentPerformance />} />
          <Route path="/agent-roster" element={<AgentRoster />} />
          <Route path="/options-strategy-ai" element={<OptionsStrategyAI />} />
          <Route path="/correlation-hunter" element={<CorrelationHunter />} />
          <Route path="/ai-chiefs-chat-interface" element={<AiChiefsChatInterface />} />
          <Route path="/ia-strategies-brancher" element={<IaStrategiesBrancher />} />
          <Route path="/global-ai-trader-architecture" element={<GlobalAiTraderArchitecture />} />
          <Route path="/autonomous-ai-hedge-fund-level" element={<AutonomousAiHedgeFundLevel />} />
          <Route path="/vision-ultime-the-living-hedge-fund" element={<VisionUltimeTheLivingHedgeFund />} />
          <Route path="/research-innovation-center" element={<ResearchInnovationCenter />} />

          {/* === STRATEGY PAGES PRESERVED INDIVIDUALLY (2 pages) === */}
          <Route path="/strategy-management" element={<StrategyManagement />} />
          <Route path="/registry-v0-1-strategy-catalogue" element={<RegistryV01StrategyCatalogue />} />

          {/* Legacy pages redirect - handles all OTHER consolidated routes */}
          <Route path="/legacy/*" element={<LegacyPagesRedirect />} />
          
          {/* Non-AI and Non-Strategy legacy redirects -> send to unified dashboard */}
          <Route path="/dashboard" element={<LegacyPagesRedirect />} />
          <Route path="/market-analysis" element={<LegacyPagesRedirect />} />
          <Route path="/portfolio-view" element={<LegacyPagesRedirect />} />
          <Route path="/portfolio-view-enhanced" element={<LegacyPagesRedirect />} />
          <Route path="/portfolio-consolidated-view" element={<LegacyPagesRedirect />} />
          <Route path="/paper-trading" element={<LegacyPagesRedirect />} />
          <Route path="/bus-monitor" element={<LegacyPagesRedirect />} />
          <Route path="/system-status" element={<LegacyPagesRedirect />} />
          <Route path="/orchestrator-dashboard" element={<LegacyPagesRedirect />} />
          <Route path="/risk-controller-dashboard" element={<LegacyPagesRedirect />} />
          <Route path="/open-access-feeder-pipeline" element={<LegacyPagesRedirect />} />
          <Route path="/fusion-oa-feeder-private-corpus" element={<LegacyPagesRedirect />} />
          <Route path="/pipeline-books-registry-orchestrator" element={<LegacyPagesRedirect />} />
          <Route path="/private-corpus-management" element={<LegacyPagesRedirect />} />
          <Route path="/weekly-pdf-reports" element={<LegacyPagesRedirect />} />
          <Route path="/trading-mvp-landing-page" element={<LegacyPagesRedirect />} />
          <Route path="/rocket-new-integration-hub" element={<LegacyPagesRedirect />} />
          <Route path="/global-ai-trader-security-configuration" element={<LegacyPagesRedirect />} />
          <Route path="/global-ai-trader-roadmap-checklist" element={<LegacyPagesRedirect />} />
          <Route path="/trading-mvp-production-deployment-checklist" element={<LegacyPagesRedirect />} />
          <Route path="/api-deployment-with-traefik" element={<LegacyPagesRedirect />} />
          <Route path="/dns-ssl-management" element={<LegacyPagesRedirect />} />
          <Route path="/env-security-reference" element={<LegacyPagesRedirect />} />
          <Route path="/sos-api-diagnostic-center" element={<LegacyPagesRedirect />} />
          <Route path="/auto-diagnostic-auto-fix-rocket" element={<LegacyPagesRedirect />} />
          <Route path="/registry-dual-streams-vs-fusion" element={<LegacyPagesRedirect />} />
          <Route path="/datamining-in-rocket-trading-mvp" element={<LegacyPagesRedirect />} />
          <Route path="/monitoring-control-center" element={<LegacyPagesRedirect />} />
          <Route path="/rocket-new-ci-cd-pipeline-configuration" element={<LegacyPagesRedirect />} />
          <Route path="/supabase-hardening-express-plan" element={<LegacyPagesRedirect />} />
          <Route path="/ci-cd-flutter-optimized-pipeline" element={<LegacyPagesRedirect />} />
          <Route path="/ci-cd-flutter-optimized-overview" element={<LegacyPagesRedirect />} />
          <Route path="/git-security-cleanup-documentation" element={<LegacyPagesRedirect />} />
          <Route path="/flutter-configuration-security-guide" element={<LegacyPagesRedirect />} />

          {/* 404 - catch all */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;