import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowRight, Zap, AlertTriangle, ExternalLink } from 'lucide-react';

const LegacyPagesRedirect = () => {
  const navigate = useNavigate();
  const { '*': legacyPath } = useParams();
  const location = useLocation();
  
  // Extract the actual path from either params or pathname
  const actualPath = legacyPath || location?.pathname?.replace('/', '');

  // Enhanced mapping with better categorization and error handling
  const legacyToUnifiedMapping = {
    // Trading & Portfolio - FIXED: Removed dashboard from legacy redirects
    // 'dashboard': { module: 'trading', view: 'overview', status: 'active' }, // ❌ REMOVED
    'market-analysis': { module: 'trading', view: 'market', status: 'active' },
    'portfolio-view': { module: 'trading', view: 'portfolio', status: 'active' },
    'portfolio-consolidated-view': { module: 'trading', view: 'portfolio', status: 'active' },
    'portfolio-view-enhanced': { module: 'trading', view: 'portfolio', status: 'active' },
    'paper-trading': { module: 'trading', view: 'positions', status: 'active' },
    'strategy-management': { module: 'ai', view: 'strategies', status: 'individual', route: '/strategy-management' },
    'options-strategy-ai': { module: 'ai', view: 'strategies', status: 'individual', route: '/options-strategy-ai' },
    'correlation-hunter': { module: 'ai', view: 'correlation', status: 'individual', route: '/correlation-hunter' },

    // AI & Agents (Individual pages - redirect directly)
    'ai-agents': { module: 'ai', view: 'agents', status: 'individual', route: '/ai-agents' },
    'ai-system-status': { module: 'ai', view: 'overview', status: 'individual', route: '/ai-system-status' },
    'real-time-agent-performance': { module: 'ai', view: 'performance', status: 'individual', route: '/real-time-agent-performance' },
    'agent-roster': { module: 'ai', view: 'roster', status: 'individual', route: '/agent-roster' },
    'ai-chiefs-chat-interface': { module: 'ai', view: 'chat', status: 'individual', route: '/ai-chiefs-chat-interface' },
    'autonomous-ai-hedge-fund-level': { module: 'ai', view: 'advanced', status: 'individual', route: '/autonomous-ai-hedge-fund-level' },
    'vision-ultime-the-living-hedge-fund': { module: 'ai', view: 'vision', status: 'individual', route: '/vision-ultime-the-living-hedge-fund' },
    'research-innovation-center': { module: 'reports', view: 'research', status: 'individual', route: '/research-innovation-center' },
    'ia-strategies-brancher': { module: 'ai', view: 'optimization', status: 'individual', route: '/ia-strategies-brancher' },
    'global-ai-trader-architecture': { module: 'ai', view: 'architecture', status: 'individual', route: '/global-ai-trader-architecture' },

    // Knowledge Pipeline (Individual pages)
    'knowledge-pipeline-management-center': { module: 'pipeline', view: 'management', status: 'individual', route: '/knowledge-pipeline-management-center' },
    'pdf-document-ingestion-interface': { module: 'pipeline', view: 'ingestion', status: 'individual', route: '/pdf-document-ingestion-interface' },
    'strategy-registry-builder': { module: 'pipeline', view: 'builder', status: 'individual', route: '/strategy-registry-builder' },

    // Monitoring & System
    'bus-monitor': { module: 'monitoring', view: 'events', status: 'active' },
    'system-status': { module: 'monitoring', view: 'health', status: 'active' },
    'orchestrator-dashboard': { module: 'monitoring', view: 'overview', status: 'active' },
    'monitoring-control-center': { module: 'monitoring', view: 'overview', status: 'active' },
    'sos-api-diagnostic-center': { module: 'monitoring', view: 'alerts', status: 'active' },

    // Risk & Security
    'risk-controller-dashboard': { module: 'risk', view: 'overview', status: 'active' },
    'supabase-hardening-express-plan': { module: 'risk', view: 'controls', status: 'active' },
    'global-ai-trader-security-configuration': { module: 'risk', view: 'compliance', status: 'active' },
    'env-security-reference': { module: 'risk', view: 'compliance', status: 'active' },

    // Data & Pipeline
    'open-access-feeder-pipeline': { module: 'data', view: 'pipelines', status: 'active' },
    'fusion-oa-feeder-private-corpus': { module: 'data', view: 'corpus', status: 'active' },
    'pipeline-books-registry-orchestrator': { module: 'data', view: 'registry', status: 'active' },
    'private-corpus-management': { module: 'data', view: 'corpus', status: 'active' },
    'registry-v0-1-strategy-catalogue': { module: 'data', view: 'registry', status: 'individual', route: '/registry-v0-1-strategy-catalogue' },
    'registry-dual-streams-vs-fusion': { module: 'data', view: 'registry', status: 'active' },
    'datamining-in-rocket-trading-mvp': { module: 'data', view: 'quality', status: 'active' },

    // Reports & Analysis
    'weekly-pdf-reports': { module: 'reports', view: 'weekly', status: 'active' },

    // DevOps & Deployment
    'ci-cd-flutter-optimized-pipeline': { module: 'devops', view: 'cicd', status: 'active' },
    'ci-cd-flutter-optimized-overview': { module: 'devops', view: 'cicd', status: 'active' },
    'git-security-cleanup-documentation': { module: 'devops', view: 'security', status: 'active' },
    'flutter-configuration-security-guide': { module: 'devops', view: 'security', status: 'active' },
    'trading-mvp-production-deployment-checklist': { module: 'devops', view: 'deployment', status: 'active' },
    'api-deployment-with-traefik': { module: 'devops', view: 'infrastructure', status: 'active' },
    'dns-ssl-management': { module: 'devops', view: 'infrastructure', status: 'active' },
    'auto-diagnostic-auto-fix-rocket': { module: 'devops', view: 'monitoring', status: 'active' },

    // Rocket Integration
    'rocket-new-integration-hub': { module: 'rocket', view: 'hub', status: 'active' },
    'global-ai-trader-roadmap-checklist': { module: 'rocket', view: 'roadmap', status: 'active' },
    'trading-mvp-landing-page': { module: 'rocket', view: 'overview', status: 'active' },
    'rocket-new-ci-cd-pipeline-configuration': { module: 'rocket', view: 'configuration', status: 'active' }
  };

  const redirect = legacyToUnifiedMapping?.[actualPath];
  
  useEffect(() => {
    if (redirect) {
      const timer = setTimeout(() => {
        if (redirect?.status === 'individual' && redirect?.route) {
          // Direct route to individual page
          navigate(redirect?.route);
        } else {
          // Route to unified dashboard with module/view parameters
          navigate(`/unified?module=${redirect?.module}&view=${redirect?.view}`);
        }
      }, 2000); // Reduced timeout for better UX
      return () => clearTimeout(timer);
    }
  }, [redirect, navigate]);

  if (!redirect) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Non Trouvée</h1>
          <p className="text-gray-600 mb-6">
            La page "<strong>/{actualPath}</strong>" n'existe plus ou a été renommée dans la version unifiée.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/unified')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              Aller au Tableau de Bord Unifié
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors w-full"
            >
              Retour à l'Accueil
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h3 className="font-medium text-yellow-800 mb-2">Besoin d'aide ?</h3>
            <p className="text-sm text-yellow-700">
              Si vous cherchez une page spécifique, utilisez le sélecteur de pages dans le tableau de bord unifié 
              pour accéder à l'une des 42 pages disponibles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isIndividualPage = redirect?.status === 'individual';
  const targetDestination = isIndividualPage ? redirect?.route : `/unified?module=${redirect?.module}&view=${redirect?.view}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirection Intelligente</h1>
          <p className="text-gray-600">
            {isIndividualPage ? (
              'Cette page reste accessible individuellement'
            ) : (
              'Cette page a été consolidée dans notre interface unifiée'
            )}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mb-6 border border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>Page demandée:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
              /{actualPath}
            </code>
          </div>
          
          <div className="flex items-center justify-center my-4">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Destination:</span>
              <span className={`font-medium ${
                isIndividualPage ? 'text-green-600' : 'text-blue-600'
              }`}>
                {isIndividualPage ? 'Page Individuelle' : 'Module Unifié'}
              </span>
            </div>
            
            {isIndividualPage ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Route:</span>
                <code className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                  {redirect?.route}
                </code>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Module:</span>
                <span className="text-blue-600 font-medium">
                  {redirect?.module} → {redirect?.view}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500">
            {isIndividualPage ? (
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-3 h-3" />
                <span>Page préservée pour fonctionnalités spécialisées</span>
              </div>
            ) : (
              'Intégré dans le tableau de bord unifié pour une meilleure expérience'
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          Redirection automatique dans <span className="font-medium">2 secondes</span>...
        </div>

        <button
          onClick={() => navigate(targetDestination)}
          className={`w-full px-6 py-3 rounded-lg transition-colors text-sm font-medium ${
            isIndividualPage 
              ? 'bg-green-600 text-white hover:bg-green-700' :'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isIndividualPage ? 'Accéder à la Page' : 'Rediriger Maintenant'}
        </button>
        
        <button
          onClick={() => navigate('/unified')}
          className="w-full mt-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          Tableau de Bord Principal
        </button>
      </div>
    </div>
  );
};

export default LegacyPagesRedirect;