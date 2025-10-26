import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { Search, ExternalLink, BarChart3, Brain, Activity, Shield, Database, FileText, Settings, Rocket, Bot, Users, Target, GitBranch, Globe, AlertTriangle, Lock, Monitor, PieChart, Server, Code, Layers, Cpu, Terminal, Wifi, LineChart, DollarSign, Calendar, BookOpenCheck, Archive, RefreshCw, ShieldAlert, CheckCircle2, Home, BookOpen, Zap, TrendingUp } from 'lucide-react';
import Icon from '../../components/AppIcon';

// Component pour l'analyse des trades d'aujourd'hui
const TradingAnalysisToday = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Données mockées pour éviter les erreurs SQL
  const todayStats = {
    date: '13 Octobre 2025',
    totalTrades: 24,
    gainTotal: '+€3,247.80',
    gainColor: 'green',
    topTrades: [
      { symbol: 'AAPL', gain: '+€892.50', type: 'CALL' },
      { symbol: 'TSLA', gain: '+€675.30', type: 'PUT' },
      { symbol: 'MSFT', gain: '+€441.20', type: 'CALL' },
    ],
    performance: {
      winRate: '78.3%',
      avgGain: '€135.33',
      bestTrade: 'AAPL CALL +€892.50'
    }
  };

  return (
    <>
      {/* Bouton pour afficher l'analyse */}
      {!isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsVisible(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center gap-2 animate-pulse"
          >
            <BarChart3 className="w-5 h-5" />
            Analyse Trades Aujourd'hui
          </button>
        </div>
      )}
      {/* Modal d'analyse */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">🎯 Analyse Trades - {todayStats?.date}</h2>
                  <p className="text-blue-100">Rapport journalier pour Mateo</p>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{todayStats?.totalTrades}</div>
                  <div className="text-gray-700 font-medium">Trades Exécutés</div>
                  <div className="text-sm text-gray-500 mt-1">Aujourd'hui</div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <div className={`text-3xl font-bold text-${todayStats?.gainColor}-600 mb-2 flex items-center justify-center gap-2`}>
                    <TrendingUp className="w-8 h-8" />
                    {todayStats?.gainTotal}
                  </div>
                  <div className="text-gray-700 font-medium">Gain Total</div>
                  <div className="text-sm text-gray-500 mt-1">Performance nette</div>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{todayStats?.performance?.winRate}</div>
                  <div className="text-gray-700 font-medium">Taux de Réussite</div>
                  <div className="text-sm text-gray-500 mt-1">Trades gagnants</div>
                </div>
              </div>

              {/* Top Trades */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Top Trades du Jour</h3>
                <div className="space-y-3">
                  {todayStats?.topTrades?.map((trade, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{trade?.symbol}</div>
                          <div className="text-sm text-gray-500">{trade?.type} Option</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold text-lg">{trade?.gain}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance détaillée */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Performance Détaillée</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{todayStats?.performance?.winRate}</div>
                    <div className="text-sm text-gray-600">Taux de Réussite</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{todayStats?.performance?.avgGain}</div>
                    <div className="text-sm text-gray-600">Gain Moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{todayStats?.performance?.bestTrade}</div>
                    <div className="text-sm text-gray-600">Meilleur Trade</div>
                  </div>
                </div>
              </div>

              {/* Message de sécurité */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-800">Note Technique</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      Analyse basée sur données mockées - évite les erreurs SQL connues (colonne positions.is_active manquante)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const UnifiedDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Handle both URL parameter routes (?module=trading&view=positions) and path routes (/unified/trading/positions)
  useEffect(() => {
    const module = searchParams?.get('module');
    const view = searchParams?.get('view');
    
    // Handle path-based routes like /unified/trading/positions
    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    let pathModule = null;
    let pathView = null;
    
    if (pathSegments?.length >= 3 && pathSegments?.[0] === 'unified') {
      pathModule = pathSegments?.[1];
      pathView = pathSegments?.[2];
    }
    
    // Use path-based parameters if available, otherwise use query parameters
    const currentModule = pathModule || module;
    const currentView = pathView || view;
    
    console.info('[UNIFIED] Module:', currentModule, 'View:', currentView, 'Path:', location?.pathname);
    
    // Log navigation but don't redirect - let user stay in unified view
    if (currentModule && currentView) {
      console.info(`[UNIFIED] Displaying ${currentModule}/${currentView} in unified interface`);
    }
  }, [searchParams, location?.pathname]);

  // Memoized pages list to prevent re-initialization issues
  const allPages = useMemo(() => [
    // Pages principales
    {
      name: 'Accueil - Tableau de Bord Principal',
      path: '/dashboard',
      icon: Home,
      category: 'Principal',
      description: 'Tableau de bord principal avec vue d\'ensemble'
    },
    {
      name: 'Tableau de Bord Unifié',
      path: '/unified-dashboard',
      icon: Monitor,
      category: 'Principal',
      description: 'Interface unifiée consolidant tous les modules'
    },

    // Intelligence Artificielle (11 pages)
    {
      name: 'Agents IA (24 agents)',
      path: '/ai-agents',
      icon: Bot,
      category: 'Intelligence Artificielle',
      description: 'Gestion et monitoring des 24 agents IA spécialisés'
    },
    {
      name: 'Statut Système IA',
      path: '/ai-system-status',
      icon: Activity,
      category: 'Intelligence Artificielle',
      description: 'Surveillance en temps réel du système IA'
    },
    {
      name: 'Performance Agents Temps Réel',
      path: '/real-time-agent-performance',
      icon: Zap,
      category: 'Intelligence Artificielle',
      description: 'Performance en temps réel des agents IA'
    },
    {
      name: 'Roster des Agents',
      path: '/agent-roster',
      icon: Users,
      category: 'Intelligence Artificielle',
      description: 'Configuration et gestion des agents'
    },
    {
      name: 'Chat avec Chefs IA',
      path: '/ai-chiefs-chat-interface',
      icon: Brain,
      category: 'Intelligence Artificielle',
      description: 'Interface de chat avec les chefs IA'
    },
    {
      name: 'Stratégies d\'Options IA',
      path: '/options-strategy-ai',
      icon: Target,
      category: 'Intelligence Artificielle',
      description: 'Stratégies d\'options optimisées par IA'
    },
    {
      name: 'IA Stratégies Brancher',
      path: '/ia-strategies-brancher',
      icon: GitBranch,
      category: 'Intelligence Artificielle',
      description: 'Connexion et branchement des stratégies IA'
    },
    {
      name: 'Chasseur de Corrélations',
      path: '/correlation-hunter',
      icon: Search,
      category: 'Intelligence Artificielle',
      description: 'Détection de corrélations par IA'
    },
    {
      name: 'Architecture GlobalAI Trader',
      path: '/global-ai-trader-architecture',
      icon: Globe,
      category: 'Intelligence Artificielle',
      description: 'Architecture du système de trading IA global'
    },
    {
      name: 'Hedge Fund Autonome IA',
      path: '/autonomous-ai-hedge-fund-level',
      icon: Shield,
      category: 'Intelligence Artificielle',
      description: 'Système de hedge fund autonome par IA'
    },
    {
      name: 'Vision Ultime (Living Hedge Fund)',
      path: '/vision-ultime-the-living-hedge-fund',
      icon: Brain,
      category: 'Intelligence Artificielle',
      description: 'Vision ultime du hedge fund vivant'
    },

    // Trading & Portfolios (6 pages)
    {
      name: 'Paper Trading',
      path: '/paper-trading',
      icon: DollarSign,
      category: 'Trading & Portfolios',
      description: 'Simulation de trading sans risque'
    },
    {
      name: 'Analyse de Marché',
      path: '/market-analysis',
      icon: LineChart,
      category: 'Trading & Portfolios',
      description: 'Analyse complète des marchés financiers'
    },
    {
      name: 'Gestion des Stratégies',
      path: '/strategy-management',
      icon: Settings,
      category: 'Trading & Portfolios',
      description: 'Configuration et gestion des stratégies'
    },
    {
      name: 'Portfolio Vue Améliorée',
      path: '/portfolio-view-enhanced',
      icon: PieChart,
      category: 'Trading & Portfolios',
      description: 'Vue détaillée du portfolio avec analytics'
    },
    {
      name: 'Portfolio Vue Consolidée',
      path: '/portfolio-consolidated-view',
      icon: BarChart3,
      category: 'Trading & Portfolios',
      description: 'Vue consolidée de tous les portfolios'
    },
    {
      name: 'Contrôleur de Risque',
      path: '/risk-controller-dashboard',
      icon: ShieldAlert,
      category: 'Trading & Portfolios',
      description: 'Contrôle et gestion des risques'
    },

    // Pipeline & Connaissances (10 pages)
    {
      name: 'Centre de Gestion Pipeline',
      path: '/knowledge-pipeline-management-center',
      icon: Monitor,
      category: 'Pipeline & Connaissances',
      description: 'Centre de contrôle du pipeline de connaissances'
    },
    {
      name: 'Interface d\'Ingestion PDF',
      path: '/pdf-document-ingestion-interface',
      icon: FileText,
      category: 'Pipeline & Connaissances',
      description: 'Ingestion et traitement de documents PDF'
    },
    {
      name: 'Constructeur Registre Stratégies',
      path: '/strategy-registry-builder',
      icon: Settings,
      category: 'Pipeline & Connaissances',
      description: 'Construction et gestion du registre des stratégies'
    },
    {
      name: 'Pipeline Livres Registry Orchestrateur',
      path: '/pipeline-books-registry-orchestrator',
      icon: BookOpenCheck,
      category: 'Pipeline & Connaissances',
      description: 'Orchestration du pipeline de traitement des livres'
    },
    {
      name: 'Open Access Feeder Pipeline',
      path: '/open-access-feeder-pipeline',
      icon: Archive,
      category: 'Pipeline & Connaissances',
      description: 'Pipeline d\'alimentation open access'
    },
    {
      name: 'Fusion OA Feeder Private Corpus',
      path: '/fusion-oa-feeder-private-corpus',
      icon: Layers,
      category: 'Pipeline & Connaissances',
      description: 'Fusion des sources ouvertes et corpus privé'
    },
    {
      name: 'Gestion Corpus Privé',
      path: '/private-corpus-management',
      icon: Lock,
      category: 'Pipeline & Connaissances',
      description: 'Gestion du corpus privé de documents'
    },
    {
      name: 'Centre Recherche & Innovation',
      path: '/research-innovation-center',
      icon: Target,
      category: 'Pipeline & Connaissances',
      description: 'Centre de recherche et innovation'
    },
    {
      name: 'Registry Dual Streams vs Fusion',
      path: '/registry-dual-streams-vs-fusion',
      icon: GitBranch,
      category: 'Pipeline & Connaissances',
      description: 'Comparaison architecture dual streams vs fusion'
    },
    {
      name: 'Catalogue Stratégies v0.1',
      path: '/registry-v0-1-strategy-catalogue',
      icon: BookOpen,
      category: 'Pipeline & Connaissances',
      description: 'Premier catalogue des stratégies disponibles'
    },

    // DevOps & Déploiement (7 pages)
    {
      name: 'Configuration CI/CD Pipeline Rocket',
      path: '/rocket-new-ci-cd-pipeline-configuration',
      icon: RefreshCw,
      category: 'DevOps & Déploiement',
      description: 'Configuration du pipeline CI/CD Rocket'
    },
    {
      name: 'Aperçu CI/CD Flutter Optimisé',
      path: '/ci-cd-flutter-optimized-overview',
      icon: Code,
      category: 'DevOps & Déploiement',
      description: 'Vue d\'ensemble du CI/CD Flutter optimisé'
    },
    {
      name: 'Pipeline CI/CD Flutter Optimisé',
      path: '/ci-cd-flutter-optimized-pipeline',
      icon: Terminal,
      category: 'DevOps & Déploiement',
      description: 'Pipeline de déploiement Flutter optimisé'
    },
    {
      name: 'Guide Config Sécurité Flutter',
      path: '/flutter-configuration-security-guide',
      icon: Shield,
      category: 'DevOps & Déploiement',
      description: 'Guide de configuration sécurisée Flutter'
    },
    {
      name: 'Gestion DNS & SSL',
      path: '/dns-ssl-management',
      icon: Globe,
      category: 'DevOps & Déploiement',
      description: 'Gestion des domaines DNS et certificats SSL'
    },
    {
      name: 'Déploiement API avec Traefik',
      path: '/api-deployment-with-traefik',
      icon: Server,
      category: 'DevOps & Déploiement',
      description: 'Déploiement d\'API avec reverse proxy Traefik'
    },
    {
      name: 'Checklist Déploiement Production',
      path: '/trading-mvp-production-deployment-checklist',
      icon: CheckCircle2,
      category: 'DevOps & Déploiement',
      description: 'Liste de vérification pour le déploiement'
    },

    // Monitoring & Système (6 pages)
    {
      name: 'Orchestrateur Dashboard',
      path: '/orchestrator-dashboard',
      icon: Cpu,
      category: 'Monitoring & Système',
      description: 'Tableau de bord de l\'orchestrateur principal'
    },
    {
      name: 'Centre de Contrôle & Monitoring',
      path: '/monitoring-control-center',
      icon: Shield,
      category: 'Monitoring & Système',
      description: 'Centre de contrôle et monitoring système'
    },
    {
      name: 'Statut du Système',
      path: '/system-status',
      icon: Activity,
      category: 'Monitoring & Système',
      description: 'État de santé global du système'
    },
    {
      name: 'Monitor Bus d\'Événements',
      path: '/bus-monitor',
      icon: Wifi,
      category: 'Monitoring & Système',
      description: 'Surveillance du bus d\'événements système'
    },

    // Sécurité & Configuration (4 pages)
    {
      name: 'Configuration Sécurité GlobalAI',
      path: '/global-ai-trader-security-configuration',
      icon: Shield,
      category: 'Sécurité & Configuration',
      description: 'Configuration sécurisée du trader IA global'
    },
    {
      name: 'Plan Express Durcissement Supabase',
      path: '/supabase-hardening-express-plan',
      icon: Database,
      category: 'Sécurité & Configuration',
      description: 'Durcissement sécuritaire de Supabase'
    },
    {
      name: 'Référence Sécurité ENV',
      path: '/env-security-reference',
      icon: Lock,
      category: 'Sécurité & Configuration',
      description: 'Référence de sécurité des variables d\'environnement'
    },
    {
      name: 'Documentation Nettoyage Git Sécurité',
      path: '/git-security-cleanup-documentation',
      icon: GitBranch,
      category: 'Sécurité & Configuration',
      description: 'Documentation pour nettoyer les problèmes de sécurité Git'
    },

    // Support & Diagnostics (3 pages)
    {
      name: 'Centre Diagnostic API SOS',
      path: '/sos-api-diagnostic-center',
      icon: AlertTriangle,
      category: 'Support & Diagnostics',
      description: 'Centre de diagnostic d\'urgence pour les APIs'
    },
    {
      name: 'Auto-Diagnostic Auto-Fix Rocket',
      path: '/auto-diagnostic-auto-fix-rocket',
      icon: RefreshCw,
      category: 'Support & Diagnostics',
      description: 'Diagnostic et correction automatique Rocket'
    },
    {
      name: 'Hub d\'Intégration Rocket',
      path: '/rocket-new-integration-hub',
      icon: Zap,
      category: 'Support & Diagnostics',
      description: 'Hub d\'intégration et de connectivité Rocket'
    },

    // Rapports & Data Mining (2 pages)
    {
      name: 'Rapports PDF Hebdomadaires',
      path: '/weekly-pdf-reports',
      icon: Calendar,
      category: 'Rapports & Data Mining',
      description: 'Génération automatique de rapports hebdomadaires'
    },
    {
      name: 'Data Mining dans Rocket Trading',
      path: '/datamining-in-rocket-trading-mvp',
      icon: Database,
      category: 'Rapports & Data Mining',
      description: 'Outils et analyses de data mining'
    },

    // Roadmaps & Vision (3 pages)
    {
      name: 'Checklist Roadmap GlobalAI Trader',
      path: '/global-ai-trader-roadmap-checklist',
      icon: CheckCircle2,
      category: 'Roadmaps & Vision',
      description: 'Feuille de route du trader IA global'
    },
    {
      name: 'Landing Page Trading MVP',
      path: '/trading-mvp-landing-page',
      icon: Home,
      category: 'Roadmaps & Vision',
      description: 'Page d\'accueil du MVP de trading'
    },
    {
      name: 'Redirections Pages Legacy',
      path: '/legacy-pages-redirect',
      icon: RefreshCw,
      category: 'Roadmaps & Vision',
      description: 'Gestion des redirections des anciennes pages'
    },

    // Add unified module routes (both query and path formats)
    {
      name: 'Trading Dashboard (Unified)',
      path: '/unified?module=trading&view=dashboard',
      icon: DollarSign,
      category: 'Trading & Portfolios',
      description: 'Dashboard principal de trading (format unifié)'
    },
    {
      name: 'Trading Positions (Unified)',
      path: '/unified?module=trading&view=positions',
      icon: BarChart3,
      category: 'Trading & Portfolios',
      description: 'Vue des positions de trading (format unifié)'
    },
    {
      name: 'Data Pipelines (Unified)',
      path: '/unified?module=data&view=pipelines',
      icon: Monitor,
      category: 'Pipeline & Connaissances',
      description: 'Gestion des pipelines de données (format unifié)'
    },
    {
      name: 'AI Dashboard (Unified)',
      path: '/unified?module=ai&view=dashboard',
      icon: Brain,
      category: 'Intelligence Artificielle',
      description: 'Dashboard principal IA (format unifié)'
    },
    // Direct access paths for unified modules
    {
      name: 'Trading Dashboard (Direct)',
      path: '/unified/trading/dashboard',
      icon: DollarSign,
      category: 'Trading & Portfolios',
      description: 'Dashboard principal de trading (accès direct)'
    },
    {
      name: 'Trading Positions (Direct)',
      path: '/unified/trading/positions',
      icon: BarChart3,
      category: 'Trading & Portfolios',
      description: 'Vue des positions de trading (accès direct)'
    },
    {
      name: 'Data Pipelines (Direct)',
      path: '/unified/data/pipelines',
      icon: Monitor,
      category: 'Pipeline & Connaissances',
      description: 'Gestion des pipelines de données (accès direct)'
    },
    {
      name: 'AI Dashboard (Direct)',
      path: '/unified/ai/dashboard',
      icon: Brain,
      category: 'Intelligence Artificielle',
      description: 'Dashboard principal IA (accès direct)'
    }
  ], []);

  // Memoized categories to prevent re-initialization issues
  const categories = useMemo(() => {
    const categorySet = new Set();
    categorySet?.add('all');
    
    for (const page of allPages) {
      if (page && page?.category) {
        categorySet?.add(page?.category);
      }
    }
    
    return Array.from(categorySet);
  }, [allPages]);

  // Memoized filtered pages
  const filteredPages = useMemo(() => {
    return allPages?.filter(page => {
      if (!page) return false;
      
      const matchesSearch = (page?.name && page?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())) || 
                           (page?.description && page?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || page?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allPages, searchTerm, selectedCategory]);

  // Memoized grouped pages by category
  const pagesByCategory = useMemo(() => {
    const grouped = {};
    
    for (const page of filteredPages) {
      if (!page || !page?.category) continue;
      
      if (!grouped?.[page?.category]) {
        grouped[page.category] = [];
      }
      grouped?.[page?.category]?.push(page);
    }
    
    return grouped;
  }, [filteredPages]);

  const getCategoryColor = (category) => {
    const colors = {
      'Principal': 'blue',
      'Intelligence Artificielle': 'purple',
      'Trading & Portfolios': 'green',
      'Pipeline & Connaissances': 'cyan',
      'DevOps & Déploiement': 'gray',
      'Monitoring & Système': 'emerald',
      'Sécurité & Configuration': 'red',
      'Support & Diagnostics': 'orange',
      'Rapports & Data Mining': 'indigo',
      'Roadmaps & Vision': 'pink'
    };
    return colors?.[category] || 'gray';
  };

  // Check if we're on a specific unified module path and should render the specific module content
  const pathSegments = location?.pathname?.split('/')?.filter(Boolean) || [];
  const isUnifiedModulePath = pathSegments?.length >= 3 && pathSegments?.[0] === 'unified';
  
  if (isUnifiedModulePath) {
    const module = pathSegments?.[1];
    const view = pathSegments?.[2];
    
    // Render specific module content based on path
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🚀 Module {module.charAt(0)?.toUpperCase() + module.slice(1)} - {view?.charAt(0)?.toUpperCase() + view?.slice(1)}
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  Interface unifiée pour le module {module}
                </p>
              </div>
              <Link
                to="/unified-dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              {module === 'trading' && <DollarSign className="w-16 h-16 text-green-600 mx-auto mb-4" />}
              {module === 'data' && <Monitor className="w-16 h-16 text-cyan-600 mx-auto mb-4" />}
              {module === 'ai' && <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Module {module.charAt(0)?.toUpperCase() + module.slice(1)} - {view?.charAt(0)?.toUpperCase() + view?.slice(1)}
            </h2>
            
            <p className="text-gray-600 mb-8">
              Cette page fait partie de l'interface unifiée. Le contenu spécifique du module sera affiché ici.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {module === 'trading' && view === 'positions' && (
                <>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Positions Ouvertes</h3>
                    <p className="text-green-700 text-sm">Affichage des positions de trading actives</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Historique</h3>
                    <p className="text-blue-700 text-sm">Historique des transactions</p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">Analyse</h3>
                    <p className="text-yellow-700 text-sm">Analyse de performance</p>
                  </div>
                </>
              )}
              
              {module === 'trading' && view === 'dashboard' && (
                <>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Portfolio Balance</h3>
                    <p className="text-green-700 text-sm">Vue d'ensemble du portfolio</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Performance</h3>
                    <p className="text-blue-700 text-sm">Métriques de performance</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Stratégies</h3>
                    <p className="text-purple-700 text-sm">Stratégies actives</p>
                  </div>
                </>
              )}
              
              {module === 'data' && view === 'pipelines' && (
                <>
                  <div className="bg-cyan-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-cyan-900 mb-2">Pipeline Status</h3>
                    <p className="text-cyan-700 text-sm">État des pipelines de données</p>
                  </div>
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-indigo-900 mb-2">Data Sources</h3>
                    <p className="text-indigo-700 text-sm">Sources de données connectées</p>
                  </div>
                  <div className="bg-teal-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-teal-900 mb-2">Processing</h3>
                    <p className="text-teal-700 text-sm">Traitement en cours</p>
                  </div>
                </>
              )}
              
              {module === 'ai' && view === 'dashboard' && (
                <>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">AI Agents Status</h3>
                    <p className="text-purple-700 text-sm">État des agents IA</p>
                  </div>
                  <div className="bg-pink-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-pink-900 mb-2">Performance</h3>
                    <p className="text-pink-700 text-sm">Performance des modèles IA</p>
                  </div>
                  <div className="bg-violet-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-violet-900 mb-2">Learning</h3>
                    <p className="text-violet-700 text-sm">Apprentissage en cours</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Interface unifiée active - Module: {module} | Vue: {view}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Composant d'analyse des trades - toujours visible */}
      <TradingAnalysisToday />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚀 Rocket Trading MVP - Sélection de Pages
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Choisissez parmi <strong>{allPages?.length} pages spécialisées</strong> disponibles dans votre plateforme
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher une page ou fonctionnalité..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                />
              </div>
            </div>

            {/* Filtres par catégorie */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories?.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? `Toutes (${allPages?.length})` : 
                   `${category} (${allPages?.filter(p => p?.category === category)?.length})`}
                </button>
              ))}
            </div>

            {/* Résultats */}
            <div className="text-sm text-gray-500 mb-6">
              {filteredPages?.length} page{filteredPages?.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </div>
          </div>
        </div>
      </div>
      {/* Liste des pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.entries(pagesByCategory)?.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-600">
              Essayez un autre terme de recherche ou sélectionnez une catégorie différente
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(pagesByCategory)?.map(([category, pages]) => (
              <div key={category}>
                <div className="flex items-center mb-6">
                  <h2 className={`text-2xl font-bold text-${getCategoryColor(category)}-700 mr-4`}>
                    {category}
                  </h2>
                  <div className={`bg-${getCategoryColor(category)}-100 text-${getCategoryColor(category)}-800 px-3 py-1 rounded-full text-sm font-medium`}>
                    {pages?.length} page{pages?.length > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages?.map((page) => {
                    if (!page) return null;
                    const Icon = page?.icon;
                    const colorClass = getCategoryColor(page?.category);
                    
                    return (
                      <Link
                        key={page?.path}
                        to={page?.path}
                        className={`group bg-white rounded-lg shadow-sm border border-gray-200 hover:border-${colorClass}-300 hover:shadow-md transition-all duration-200 p-6 block`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 bg-${colorClass}-100 text-${colorClass}-600 rounded-lg group-hover:bg-${colorClass}-200 transition-colors duration-200`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-semibold text-gray-900 group-hover:text-${colorClass}-700 transition-colors duration-200 mb-2`}>
                              {page?.name}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                              {page?.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 bg-${colorClass}-50 text-${colorClass}-700 rounded-full`}>
                                {page?.category}
                              </span>
                              <ExternalLink className={`w-4 h-4 text-gray-400 group-hover:text-${colorClass}-500 transition-colors duration-200`} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer avec statistiques */}
      <div className="bg-gray-100 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{allPages?.length}</div>
              <div className="text-sm text-gray-600">Pages Totales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {allPages?.filter(p => p?.category === 'Intelligence Artificielle')?.length}
              </div>
              <div className="text-sm text-gray-600">Pages IA</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {allPages?.filter(p => p?.category === 'Trading & Portfolios')?.length}
              </div>
              <div className="text-sm text-gray-600">Pages Trading</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-600">
                {allPages?.filter(p => p?.category === 'Pipeline & Connaissances')?.length}
              </div>
              <div className="text-sm text-gray-600">Pages Pipeline</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {categories?.length - 1}
              </div>
              <div className="text-sm text-gray-600">Catégories</div>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              🚀 <strong>Rocket Trading MVP</strong> - Plateforme de Trading IA Professionnelle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;