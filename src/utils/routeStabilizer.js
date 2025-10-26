/**
 * ROUTE STABILIZER - Utilitaires pour stabiliser le routage et éviter les 404
 * Complément React pour la solution anti-404 Nginx
 */

// Cache des routes valides pour éviter les re-vérifications
const validRoutesCache = new Set();
const invalidRoutesCache = new Set();

/**
 * Vérifie si une route existe dans l'application
 * @param {string} path - Chemin à vérifier
 * @returns {boolean} - True si la route existe
 */
export const isValidRoute = (path) => {
  // Nettoyer le path
  const cleanPath = path?.replace(/\/+/g, '/')?.replace(/\/$/, '') || '';
  
  // Vérifier le cache
  if (validRoutesCache?.has(cleanPath)) return true;
  if (invalidRoutesCache?.has(cleanPath)) return false;
  
  // Routes statiques principales
  const staticRoutes = new Set([
    '',
    '/',
    '/dashboard',
    '/home',
    '/tableau',
    '/tableau-de-bord',
    '/unified',
    '/unified-dashboard',
    '/system-status',
    '/ai-system-status',
    '/market-analysis',
    '/portfolio-view-enhanced',
    '/portfolio-consolidated-view',
    '/strategy-management',
    '/paper-trading',
    '/ai-agents',
    '/agent-roster',
    '/real-time-agent-performance',
    '/options-strategy-ai',
    '/risk-controller-dashboard',
    '/research-innovation-center',
    '/monitoring-control-center',
    '/self-healing-orchestration-dashboard',
    '/bus-monitor',
    '/orchestrator-dashboard',
    '/correlation-hunter',
    '/google-finance-integration',
    '/project-management-cockpit',
    '/weekly-pdf-reports',
    '/provider-router-dashboard',
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password'
  ]);
  
  // Vérifier les routes statiques
  if (staticRoutes?.has(cleanPath)) {
    validRoutesCache?.add(cleanPath);
    return true;
  }
  
  // Patterns de routes dynamiques valides
  const validPatterns = [
    /^\/unified(\/[^\/]+)*(\/.*)?$/,
    /^\/trading(\/.*)?$/,
    /^\/system(\/.*)?$/,
    /^\/ai(\/.*)?$/,
    /^\/portfolio(\/.*)?$/,
    /^\/market(\/.*)?$/,
    /^\/strategy(\/.*)?$/,
    /^\/data(\/.*)?$/,
    /^\/auth\/.*$/,
    /^\/agent.*$/,
    /^\/orchestrator.*$/,
    /^\/monitoring.*$/,
    /^\/mvp.*$/,
    /^\/deployment.*$/,
    /^\/production.*$/,
    /^\/rocket.*$/,
    /^\/diagnostic.*$/,
    /^\/sos.*$/,
    /^\/aas.*$/,
    /^\/knowledge.*$/,
    /^\/rag.*$/,
    /^\/pdf.*$/,
    /^\/provider.*$/,
    /^\/feature-flags.*$/,
    /^\/chaos-control.*$/,
    /^\/live-trading.*$/,
    /^\/web-socket.*$/,
    /^\/dns.*$/,
    /^\/ssl.*$/,
    /^\/docker.*$/,
    /^\/redis.*$/,
    /^\/ci-cd.*$/,
    /^\/flutter.*$/,
    /^\/supabase.*$/,
    /^\/env.*$/,
    /^\/git.*$/,
    /^\/paranoid.*$/,
    /^\/k6.*$/,
    /^\/tge.*$/,
    /^\/intelligence.*$/,
    /^\/performance.*$/,
    /^\/e2e.*$/,
    /^\/prometheus.*$/,
    /^\/ibkr.*$/,
    /^\/cmv.*$/,
    /^\/internal.*$/
  ];
  
  // Tester contre les patterns
  const isValid = validPatterns?.some(pattern => pattern?.test(cleanPath));
  
  // Mettre en cache le résultat
  if (isValid) {
    validRoutesCache?.add(cleanPath);
  } else {
    invalidRoutesCache?.add(cleanPath);
  }
  
  return isValid;
};

/**
 * Trouve la route la plus proche d'un chemin invalide
 * @param {string} invalidPath - Chemin invalide
 * @returns {string} - Route suggérée
 */
export const findNearestRoute = (invalidPath) => {
  if (!invalidPath) return '/';
  
  const cleanPath = invalidPath?.toLowerCase();
  
  // Mapping des suggestions basé sur les mots-clés
  const suggestions = [
    { keywords: ['dashboard', 'tableau', 'accueil', 'home'], route: '/' },
    { keywords: ['unified', 'unifie', 'trading'], route: '/unified' },
    { keywords: ['system', 'systeme', 'status', 'etat'], route: '/system-status' },
    { keywords: ['ai', 'ia', 'agent', 'artificial'], route: '/ai-system-status' },
    { keywords: ['market', 'marche', 'analyse', 'analysis'], route: '/market-analysis' },
    { keywords: ['portfolio', 'portefeuille'], route: '/portfolio-view-enhanced' },
    { keywords: ['strategy', 'strategie'], route: '/strategy-management' },
    { keywords: ['paper', 'trading', 'simulation'], route: '/paper-trading' },
    { keywords: ['risk', 'risque', 'controller'], route: '/risk-controller-dashboard' },
    { keywords: ['research', 'recherche', 'innovation'], route: '/research-innovation-center' },
    { keywords: ['monitoring', 'surveillance'], route: '/monitoring-control-center' },
    { keywords: ['orchestrator', 'orchestrateur'], route: '/orchestrator-dashboard' },
    { keywords: ['auth', 'login', 'connexion'], route: '/auth/login' },
    { keywords: ['correlation', 'hunter'], route: '/correlation-hunter' },
    { keywords: ['project', 'projet', 'management'], route: '/project-management-cockpit' }
  ];
  
  // Chercher la meilleure correspondance
  for (const suggestion of suggestions) {
    if (suggestion?.keywords?.some(keyword => cleanPath?.includes(keyword))) {
      return suggestion?.route;
    }
  }
  
  // Fallback par segment
  if (cleanPath?.startsWith('/unified') || cleanPath?.includes('trading')) {
    return '/unified';
  }
  if (cleanPath?.startsWith('/system') || cleanPath?.includes('status')) {
    return '/system-status';
  }
  if (cleanPath?.startsWith('/ai') || cleanPath?.includes('agent')) {
    return '/ai-system-status';
  }
  
  // Fallback ultime
  return '/';
};

/**
 * Normalise une URL pour éviter les variations qui causent des 404
 * @param {string} url - URL à normaliser
 * @returns {string} - URL normalisée
 */
export const normalizeUrl = (url) => {
  if (!url) return '/';
  
  // Supprimer les doubles slashes
  let normalized = url?.replace(/\/+/g, '/');
  
  // Supprimer le trailing slash sauf pour la racine
  if (normalized?.length > 1 && normalized?.endsWith('/')) {
    normalized = normalized?.slice(0, -1);
  }
  
  // Encoder les caractères spéciaux dans les paramètres
  const [path, query] = normalized?.split('?');
  if (query) {
    const params = new URLSearchParams(query);
    normalized = path + '?' + params?.toString();
  }
  
  return normalized;
};

/**
 * Gestionnaire d'erreurs de navigation avec retry automatique
 * @param {Error} error - Erreur de navigation
 * @param {Function} navigate - Fonction de navigation
 * @param {string} attemptedPath - Chemin qui a échoué
 */
export const handleNavigationError = (error, navigate, attemptedPath) => {
  console.warn('Navigation error:', error, 'for path:', attemptedPath);
  
  // Tentative de récupération
  const fallbackRoute = findNearestRoute(attemptedPath);
  
  // Log pour monitoring
  if (window.gtag) {
    window.gtag('event', 'navigation_error', {
      'error_path': attemptedPath,
      'fallback_route': fallbackRoute,
      'error_message': error?.message
    });
  }
  
  // Navigation vers le fallback avec délai pour éviter les boucles
  setTimeout(() => {
    navigate(fallbackRoute, { replace: true });
  }, 100);
};

/**
 * Hook pour la stabilisation des routes
 * @param {string} currentPath - Chemin actuel
 * @returns {Object} - Utilities de stabilisation
 */
export const useRouteStabilizer = (currentPath) => {
  const isCurrentRouteValid = isValidRoute(currentPath);
  const suggestedRoute = !isCurrentRouteValid ? findNearestRoute(currentPath) : null;
  
  return {
    isValid: isCurrentRouteValid,
    suggestedRoute,
    normalizedPath: normalizeUrl(currentPath),
    cacheStats: {
      validCacheSize: validRoutesCache?.size,
      invalidCacheSize: invalidRoutesCache?.size
    }
  };
};

/**
 * Middleware pour intercepter les navigations problématiques
 */
export const navigationMiddleware = (to, from, next) => {
  const normalizedTo = normalizeUrl(to?.path || to);
  
  if (!isValidRoute(normalizedTo)) {
    const fallback = findNearestRoute(normalizedTo);
    console.warn(`Invalid route detected: ${normalizedTo}, redirecting to: ${fallback}`);
    
    if (typeof next === 'function') {
      next(fallback);
    } else {
      return fallback;
    }
  } else {
    if (typeof next === 'function') {
      next();
    } else {
      return normalizedTo;
    }
  }
};

/**
 * Précharge les routes critiques pour améliorer les performances
 */
export const preloadCriticalRoutes = () => {
  const criticalRoutes = [
    '/',
    '/unified',
    '/system-status',
    '/ai-system-status',
    '/market-analysis',
    '/dashboard'
  ];
  
  criticalRoutes?.forEach(route => {
    validRoutesCache?.add(route);
  });
};

// Auto-initialisation
if (typeof window !== 'undefined') {
  // Précharger les routes critiques au chargement
  preloadCriticalRoutes();
  
  // Nettoyer le cache périodiquement (toutes les 5 minutes)
  setInterval(() => {
    if (validRoutesCache?.size > 100) {
      validRoutesCache?.clear();
      preloadCriticalRoutes();
    }
    if (invalidRoutesCache?.size > 50) {
      invalidRoutesCache?.clear();
    }
  }, 5 * 60 * 1000);
}

export default {
  isValidRoute,
  findNearestRoute,
  normalizeUrl,
  handleNavigationError,
  useRouteStabilizer,
  navigationMiddleware,
  preloadCriticalRoutes
};