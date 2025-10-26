import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import { findNearestRoute, isValidRoute, normalizeUrl } from 'utils/routeStabilizer';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState({});

  // Auto-redirection intelligente vers la route la plus proche
  useEffect(() => {
    const currentPath = location?.pathname;
    const suggestedRoute = findNearestRoute(currentPath);
    
    // Diagnostic et collecte d'informations
    const diagnostic = {
      attemptedPath: currentPath,
      normalizedPath: normalizeUrl(currentPath),
      isValidPath: isValidRoute(currentPath),
      suggestedRoute,
      userAgent: navigator?.userAgent || 'Unknown',
      referrer: document?.referrer || 'Direct',
      timestamp: new Date()?.toISOString()
    };
    
    setDiagnosticInfo(diagnostic);
    
    // Auto-redirection après 10 secondes si route suggestion disponible
    if (suggestedRoute && suggestedRoute !== '/') {
      let countdown = 10;
      setAutoRedirectCountdown(countdown);
      
      const timer = setInterval(() => {
        countdown -= 1;
        setAutoRedirectCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(timer);
          handleSuggestedRoute(suggestedRoute);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [location?.pathname]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location?.reload();
  };

  const handleSuggestedRoute = (route) => {
    // Annuler l'auto-redirection
    setAutoRedirectCountdown(null);
    navigate(route, { replace: true });
  };

  const handleReportIssue = () => {
    // Log détaillé pour le monitoring
    console.error('404 Error Report:', diagnosticInfo);
    
    // Envoyer vers système de monitoring si disponible
    if (window.gtag) {
      window.gtag('event', '404_error', {
        'error_path': diagnosticInfo?.attemptedPath,
        'suggested_route': diagnosticInfo?.suggestedRoute,
        'normalized_path': diagnosticInfo?.normalizedPath,
        'referrer': diagnosticInfo?.referrer
      });
    }
    
    alert('Erreur signalée. Les développeurs ont été notifiés.');
  };

  // ENHANCED: Provide route suggestions based on the attempted path
  const getRouteSuggestions = (pathname) => {
    const suggestions = [];
    
    // Utiliser le routeStabilizer pour les suggestions intelligentes
    const smartSuggestion = findNearestRoute(pathname);
    if (smartSuggestion && smartSuggestion !== '/') {
      suggestions?.push({ 
        path: smartSuggestion, 
        label: getRouteLabel(smartSuggestion),
        type: 'smart' 
      });
    }
    
    // Suggestions contextuelles basées sur le path
    if (pathname?.includes('dashboard') || pathname?.includes('tableau')) {
      suggestions?.push({ path: '/', label: 'Dashboard Principal', type: 'contextual' });
    }
    
    if (pathname?.includes('unified') || pathname?.includes('trading')) {
      suggestions?.push({ path: '/unified', label: 'Dashboard Unifié', type: 'contextual' });
    }
    
    if (pathname?.includes('system') || pathname?.includes('status')) {
      suggestions?.push({ path: '/system-status', label: 'État du Système', type: 'contextual' });
    }
    
    if (pathname?.includes('ai') || pathname?.includes('agent')) {
      suggestions?.push({ path: '/ai-system-status', label: 'Agents IA', type: 'contextual' });
    }
    
    if (pathname?.includes('market') || pathname?.includes('portfolio')) {
      suggestions?.push({ path: '/market-analysis', label: 'Analyse de Marché', type: 'contextual' });
    }

    // Supprimer les doublons
    const uniqueSuggestions = suggestions?.filter(
      (item, index, arr) => arr?.findIndex(t => t?.path === item?.path) === index
    );

    return uniqueSuggestions?.slice(0, 4); // Limiter à 4 suggestions
  };

  const getRouteLabel = (path) => {
    const labels = {
      '/': 'Accueil',
      '/unified': 'Dashboard Unifié',
      '/system-status': 'État du Système',
      '/ai-system-status': 'Agents IA',
      '/market-analysis': 'Analyse de Marché',
      '/portfolio-view-enhanced': 'Portfolio',
      '/strategy-management': 'Stratégies',
      '/paper-trading': 'Trading Simulé',
      '/risk-controller-dashboard': 'Contrôle des Risques',
      '/research-innovation-center': 'Centre de Recherche',
      '/monitoring-control-center': 'Centre de Monitoring',
      '/orchestrator-dashboard': 'Orchestrateur',
      '/auth/login': 'Connexion'
    };
    
    return labels?.[path] || path?.split('/')?.pop()?.replace(/-/g, ' ') || 'Page';
  };

  const suggestions = getRouteSuggestions(location?.pathname);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
          </div>
        </div>

        <h2 className="text-2xl font-medium text-onBackground mb-2">Page Non Trouvée</h2>
        <p className="text-onBackground/70 mb-4">
          La page demandée n'a pas pu être trouvée. Notre système anti-404 va vous aider à retrouver votre chemin.
        </p>
        
        {/* AUTO-REDIRECTION COUNTDOWN */}
        {autoRedirectCountdown && diagnosticInfo?.suggestedRoute && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Icon name="Navigation" className="mr-2 text-primary" />
              <span className="text-primary font-medium">Redirection Automatique</span>
            </div>
            <p className="text-sm text-onBackground/80 mb-3">
              Redirection vers <strong>{getRouteLabel(diagnosticInfo?.suggestedRoute)}</strong> dans {autoRedirectCountdown} secondes
            </p>
            <Button 
              variant="outline" 
              size="small"
              onClick={() => setAutoRedirectCountdown(null)}
            >
              Annuler
            </Button>
          </div>
        )}

        {/* ENHANCED: Show the attempted path for debugging */}
        {location?.pathname && (
          <div className="bg-surface rounded-lg p-3 mb-6 border border-outline/20">
            <p className="text-sm text-onBackground/60 mb-1">Chemin demandé :</p>
            <code className="text-sm text-primary font-mono break-all">{location?.pathname}</code>
            {diagnosticInfo?.normalizedPath && diagnosticInfo?.normalizedPath !== location?.pathname && (
              <>
                <p className="text-sm text-onBackground/60 mb-1 mt-2">Chemin normalisé :</p>
                <code className="text-sm text-onBackground/80 font-mono break-all">{diagnosticInfo?.normalizedPath}</code>
              </>
            )}
          </div>
        )}

        {/* ENHANCED: Show relevant suggestions if available */}
        {suggestions?.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-onBackground/70 mb-3">
              {diagnosticInfo?.suggestedRoute ? '🎯 Suggestions intelligentes :' : 'Essayez plutôt :'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions?.map((suggestion, index) => (
                <Button
                  key={index}
                  variant={suggestion?.type === 'smart' ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => handleSuggestedRoute(suggestion?.path)}
                  className="justify-start"
                  icon={suggestion?.type === 'smart' ? <Icon name="Zap" /> : <Icon name="ArrowRight" />}
                  iconPosition="left"
                >
                  {suggestion?.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button
            variant="primary"
            icon={<Icon name="RotateCcw" />}
            iconPosition="left"
            onClick={handleRefresh}
          >
            Actualiser
          </Button>

          <Button
            variant="outline"
            icon={<Icon name="ArrowLeft" />}
            iconPosition="left"
            onClick={() => window.history?.back()}
          >
            Retour
          </Button>

          <Button
            variant="outline"
            icon={<Icon name="Home" />}
            iconPosition="left"
            onClick={handleGoHome}
          >
            Accueil
          </Button>

          <Button
            variant="outline"
            icon={<Icon name="AlertTriangle" />}
            iconPosition="left"
            onClick={handleReportIssue}
            size="small"
          >
            Signaler
          </Button>
        </div>

        {/* ENHANCED: Troubleshooting tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Conseils de dépannage */}
          <div className="text-left bg-surface/50 rounded-lg p-4 border border-outline/10">
            <h3 className="text-sm font-medium text-onBackground mb-2 flex items-center">
              <Icon name="HelpCircle" className="mr-2" />
              💡 Conseils de dépannage
            </h3>
            <ul className="text-xs text-onBackground/60 space-y-1">
              <li>• Vérifiez l'URL dans votre barre d'adresse</li>
              <li>• Essayez d'actualiser la page (Ctrl+F5)</li>
              <li>• Vérifiez votre connexion internet</li>
              <li>• Retournez à la page d'accueil et naviguez à nouveau</li>
              <li>• Vérifiez si vous avez les permissions nécessaires</li>
            </ul>
          </div>

          {/* Informations de diagnostic */}
          <div className="text-left bg-surface/50 rounded-lg p-4 border border-outline/10">
            <h3 className="text-sm font-medium text-onBackground mb-2 flex items-center">
              <Icon name="Info" className="mr-2" />
              🔍 Diagnostic
            </h3>
            <ul className="text-xs text-onBackground/60 space-y-1">
              <li>• Système anti-404 : ✅ Actif</li>
              <li>• Route valide : {diagnosticInfo?.isValidPath ? '✅' : '❌'}</li>
              <li>• Suggestion disponible : {diagnosticInfo?.suggestedRoute ? '✅' : '❌'}</li>
              <li>• Timestamp : {new Date()?.toLocaleTimeString()}</li>
              {diagnosticInfo?.referrer && diagnosticInfo?.referrer !== 'Direct' && (
                <li>• Source : {new URL(diagnosticInfo.referrer)?.hostname}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer avec informations système */}
        <div className="mt-6 pt-4 border-t border-outline/20">
          <p className="text-xs text-onBackground/40">
            Système de récupération d'erreur 404 • Version 2.0 • 
            {diagnosticInfo?.timestamp && ` Erreur détectée à ${new Date(diagnosticInfo.timestamp)?.toLocaleTimeString()}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;