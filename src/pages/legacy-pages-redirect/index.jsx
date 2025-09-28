import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

const LegacyPagesRedirect = () => {
  const navigate = useNavigate();
  const { '*': legacyPath } = useParams();

  // Mapping des anciennes pages vers les nouveaux modules
  const legacyToUnifiedMapping = {
    // Trading & Portfolio
    'dashboard': { module: 'trading', view: 'overview' },
    'market-analysis': { module: 'trading', view: 'market' },
    'portfolio-view': { module: 'trading', view: 'portfolio' },
    'portfolio-consolidated-view': { module: 'trading', view: 'portfolio' },
    'paper-trading': { module: 'trading', view: 'positions' },
    'strategy-management': { module: 'trading', view: 'strategies' },
    'options-strategy-ai': { module: 'ai', view: 'strategies' },
    'correlation-hunter': { module: 'ai', view: 'correlation' },

    // AI & Agents
    'ai-agents': { module: 'ai', view: 'agents' },
    'ai-system-status': { module: 'ai', view: 'overview' },
    'real-time-agent-performance': { module: 'ai', view: 'performance' },
    'agent-roster': { module: 'ai', view: 'roster' },
    'ai-chiefs-chat-interface': { module: 'ai', view: 'agents' },
    'autonomous-ai-hedge-fund-level': { module: 'ai', view: 'overview' },
    'vision-ultime-the-living-hedge-fund': { module: 'ai', view: 'overview' },

    // Monitoring & System
    'bus-monitor': { module: 'monitoring', view: 'events' },
    'system-status': { module: 'monitoring', view: 'health' },
    'orchestrator-dashboard': { module: 'monitoring', view: 'overview' },
    'monitoring-control-center': { module: 'monitoring', view: 'overview' },
    'sos-api-diagnostic-center': { module: 'monitoring', view: 'alerts' },

    // Risk & Security
    'risk-controller-dashboard': { module: 'risk', view: 'overview' },
    'supabase-hardening-express-plan': { module: 'risk', view: 'controls' },
    'global-ai-trader-security-configuration': { module: 'risk', view: 'compliance' },
    'env-security-reference': { module: 'risk', view: 'compliance' },

    // Data & Pipeline
    'open-access-feeder-pipeline': { module: 'data', view: 'pipelines' },
    'fusion-oa-feeder-private-corpus': { module: 'data', view: 'corpus' },
    'pipeline-books-registry-orchestrator': { module: 'data', view: 'registry' },
    'private-corpus-management': { module: 'data', view: 'corpus' },
    'registry-v0-1-strategy-catalogue': { module: 'data', view: 'registry' },
    'registry-dual-streams-vs-fusion': { module: 'data', view: 'registry' },
    'datamining-in-rocket-trading-mvp': { module: 'data', view: 'quality' },

    // Reports & Analysis
    'weekly-pdf-reports': { module: 'reports', view: 'weekly' },
    'research-innovation-center': { module: 'reports', view: 'research' },

    // DevOps & Deployment
    'ci-cd-flutter-optimized-pipeline': { module: 'devops', view: 'cicd' },
    'ci-cd-flutter-optimized-overview': { module: 'devops', view: 'cicd' },
    'git-security-cleanup-documentation': { module: 'devops', view: 'security' },
    'flutter-configuration-security-guide': { module: 'devops', view: 'security' },
    'trading-mvp-production-deployment-checklist': { module: 'devops', view: 'deployment' },
    'api-deployment-with-traefik': { module: 'devops', view: 'infrastructure' },
    'dns-ssl-management': { module: 'devops', view: 'infrastructure' },
    'auto-diagnostic-auto-fix-rocket': { module: 'devops', view: 'monitoring' },

    // Rocket Integration
    'rocket-new-integration-hub': { module: 'rocket', view: 'hub' },
    'global-ai-trader-architecture': { module: 'rocket', view: 'architecture' },
    'global-ai-trader-roadmap-checklist': { module: 'rocket', view: 'roadmap' },
    'trading-mvp-landing-page': { module: 'rocket', view: 'overview' },
    'rocket-new-ci-cd-pipeline-configuration': { module: 'rocket', view: 'configuration' },
    'ia-strategies-brancher': { module: 'rocket', view: 'optimization' }
  };

  const redirect = legacyToUnifiedMapping?.[legacyPath];
  
  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        navigate(`/unified?module=${redirect?.module}&view=${redirect?.view}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [redirect, navigate]);

  if (!redirect) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page introuvable</h1>
          <p className="text-gray-600 mb-6">Cette page n'existe plus dans la version unifiée.</p>
          <button
            onClick={() => navigate('/unified')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Aller au tableau de bord unifié
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirection Intelligente</h1>
          <p className="text-gray-600">
            Cette page a été consolidée dans notre nouvelle interface unifiée
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Ancienne page:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">/{legacyPath}</code>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 mx-auto my-2" />
          <div className="flex items-center justify-between text-sm text-blue-600">
            <span>Nouveau module:</span>
            <span className="font-medium">{redirect?.module} → {redirect?.view}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Redirection automatique dans <span className="font-medium">3 secondes</span>...
        </div>

        <button
          onClick={() => navigate(`/unified?module=${redirect?.module}&view=${redirect?.view}`)}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Rediriger maintenant
        </button>
      </div>
    </div>
  );
};

export default LegacyPagesRedirect;