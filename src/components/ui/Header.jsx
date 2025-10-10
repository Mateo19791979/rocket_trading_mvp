import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, BookOpen, FileText, ChevronDown } from "lucide-react";
import { BarChart3, Settings, Activity, Bot, Shield, Monitor, Users, Zap, Target, Brain, GitBranch, Globe, Database, AlertTriangle, Lock, Search, PieChart, Server, Code, Layers, FileCheck, Compass, Cpu, Terminal, Wifi, LineChart, DollarSign, Calendar, BookOpenCheck, Archive, RefreshCw, ShieldAlert, CheckCircle2, Home } from 'lucide-react';

const Header = ({ activeItem, setActiveItem }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [apiLatency, setApiLatency] = useState(null);
  const location = useLocation();
  const dropdownRefs = useRef({});

  // Menu complet avec toutes les 42 pages organisées
  const MAIN_NAVIGATION = [
    {
      name: 'Accueil',
      href: '/',
      icon: Home,
      isMain: true
    },
    {
      name: 'Tableaux de Bord',
      icon: BarChart3,
      isDropdown: true,
      dropdownId: 'dashboards',
      children: [
        { name: 'Tableau de Bord Principal', href: '/dashboard', icon: BarChart3, category: 'Principal' },
        { name: 'Tableau de Bord Unifié', href: '/unified-dashboard', icon: Monitor, category: 'Principal' },
        { name: 'Orchestrateur Dashboard', href: '/orchestrator-dashboard', icon: Cpu, category: 'Principal' },
        { name: 'Centre de Contrôle & Monitoring', href: '/monitoring-control-center', icon: Shield, category: 'Monitoring' },
        { name: 'Statut du Système', href: '/system-status', icon: Activity, category: 'Monitoring' },
        { name: 'Monitor Bus d\'Événements', href: '/bus-monitor', icon: Wifi, category: 'Monitoring' }
      ]
    },
    {
      name: 'Intelligence Artificielle',
      icon: Brain,
      isDropdown: true,
      dropdownId: 'ai',
      children: [
        { name: 'Agents IA (24 agents)', href: '/ai-agents', icon: Bot, category: 'Agents IA' },
        { name: 'Statut Système IA', href: '/ai-system-status', icon: Activity, category: 'Agents IA' },
        { name: 'Performance Agents Temps Réel', href: '/real-time-agent-performance', icon: Zap, category: 'Agents IA' },
        { name: 'Roster des Agents', href: '/agent-roster', icon: Users, category: 'Agents IA' },
        { name: 'Chat avec Chefs IA', href: '/ai-chiefs-chat-interface', icon: Brain, category: 'Agents IA' },
        { name: 'Stratégies d\'Options IA', href: '/options-strategy-ai', icon: Target, category: 'Stratégies IA' },
        { name: 'IA Stratégies Brancher', href: '/ia-strategies-brancher', icon: GitBranch, category: 'Stratégies IA' },
        { name: 'Chasseur de Corrélations', href: '/correlation-hunter', icon: Search, category: 'Analyses IA' },
        { name: 'Architecture GlobalAI Trader', href: '/global-ai-trader-architecture', icon: Globe, category: 'Architecture' },
        { name: 'Hedge Fund Autonome IA', href: '/autonomous-ai-hedge-fund-level', icon: Shield, category: 'Vision IA' },
        { name: 'Vision Ultime (Living Hedge Fund)', href: '/vision-ultime-the-living-hedge-fund', icon: Brain, category: 'Vision IA' }
      ]
    },
    {
      name: 'Trading & Portfolios',
      icon: TrendingUp,
      isDropdown: true,
      dropdownId: 'trading',
      children: [
        { name: 'Paper Trading', href: '/paper-trading', icon: DollarSign, category: 'Trading' },
        { name: 'Analyse de Marché', href: '/market-analysis', icon: LineChart, category: 'Trading' },
        { name: 'Gestion des Stratégies', href: '/strategy-management', icon: Settings, category: 'Stratégies' },
        { name: 'Portfolio Vue Améliorée', href: '/portfolio-view-enhanced', icon: PieChart, category: 'Portfolio' },
        { name: 'Portfolio Vue Consolidée', href: '/portfolio-consolidated-view', icon: BarChart3, category: 'Portfolio' },
        { name: 'Contrôleur de Risque', href: '/risk-controller-dashboard', icon: ShieldAlert, category: 'Risque' }
      ]
    },
    {
      name: 'Pipeline & Connaissances',
      icon: Database,
      isDropdown: true,
      dropdownId: 'pipeline',
      children: [
        { name: 'Centre de Gestion Pipeline', href: '/knowledge-pipeline-management-center', icon: Monitor, category: 'Pipeline Principal' },
        { name: 'Interface d\'Ingestion PDF', href: '/pdf-document-ingestion-interface', icon: FileText, category: 'Pipeline Principal' },
        { name: 'Constructeur Registre Stratégies', href: '/strategy-registry-builder', icon: Settings, category: 'Pipeline Principal' },
        { name: 'Pipeline Livres Registry Orchestrateur', href: '/pipeline-books-registry-orchestrator', icon: BookOpenCheck, category: 'Orchestration' },
        { name: 'Open Access Feeder Pipeline', href: '/open-access-feeder-pipeline', icon: Archive, category: 'Feeders' },
        { name: 'Fusion OA Feeder Private Corpus', href: '/fusion-oa-feeder-private-corpus', icon: Layers, category: 'Feeders' },
        { name: 'Gestion Corpus Privé', href: '/private-corpus-management', icon: Lock, category: 'Corpus' },
        { name: 'Centre Recherche & Innovation', href: '/research-innovation-center', icon: Target, category: 'Recherche' },
        { name: 'Registry Dual Streams vs Fusion', href: '/registry-dual-streams-vs-fusion', icon: GitBranch, category: 'Architecture' },
        { name: 'Catalogue Stratégies v0.1', href: '/registry-v0-1-strategy-catalogue', icon: BookOpen, category: 'Catalogues' }
      ]
    },
    {
      name: 'DevOps & Déploiement',
      icon: Server,
      isDropdown: true,
      dropdownId: 'devops',
      children: [
        { name: 'Configuration CI/CD Pipeline Rocket', href: '/rocket-new-ci-cd-pipeline-configuration', icon: RefreshCw, category: 'CI/CD' },
        { name: 'Aperçu CI/CD Flutter Optimisé', href: '/ci-cd-flutter-optimized-overview', icon: Code, category: 'CI/CD' },
        { name: 'Pipeline CI/CD Flutter Optimisé', href: '/ci-cd-flutter-optimized-pipeline', icon: Terminal, category: 'CI/CD' },
        { name: 'Guide Config Sécurité Flutter', href: '/flutter-configuration-security-guide', icon: Shield, category: 'Configuration' },
        { name: 'Gestion DNS & SSL', href: '/dns-ssl-management', icon: Globe, category: 'Infrastructure' },
        { name: 'Déploiement API avec Traefik', href: '/api-deployment-with-traefik', icon: Server, category: 'Infrastructure' },
        { name: 'Checklist Déploiement Production', href: '/trading-mvp-production-deployment-checklist', icon: CheckCircle2, category: 'Déploiement' }
      ]
    },
    {
      name: 'Sécurité & Configuration',
      icon: Lock,
      isDropdown: true,
      dropdownId: 'security',
      children: [
        { name: 'Configuration Sécurité GlobalAI', href: '/global-ai-trader-security-configuration', icon: Shield, category: 'Sécurité' },
        { name: 'Plan Express Durcissement Supabase', href: '/supabase-hardening-express-plan', icon: Database, category: 'Sécurité' },
        { name: 'Référence Sécurité ENV', href: '/env-security-reference', icon: Lock, category: 'Configuration' },
        { name: 'Documentation Nettoyage Git Sécurité', href: '/git-security-cleanup-documentation', icon: GitBranch, category: 'Documentation' }
      ]
    },
    {
      name: 'Support & Diagnostics',
      icon: AlertTriangle,
      isDropdown: true,
      dropdownId: 'support',
      children: [
        { name: 'Centre Diagnostic API SOS', href: '/sos-api-diagnostic-center', icon: AlertTriangle, category: 'Diagnostics' },
        { name: 'Auto-Diagnostic Auto-Fix Rocket', href: '/auto-diagnostic-auto-fix-rocket', icon: RefreshCw, category: 'Auto-Fix' },
        { name: 'Hub d\'Intégration Rocket', href: '/rocket-new-integration-hub', icon: Zap, category: 'Intégration' }
      ]
    },
    {
      name: 'Rapports & Data Mining',
      icon: FileCheck,
      isDropdown: true,
      dropdownId: 'reports',
      children: [
        { name: 'Rapports PDF Hebdomadaires', href: '/weekly-pdf-reports', icon: Calendar, category: 'Rapports' },
        { name: 'Data Mining dans Rocket Trading', href: '/datamining-in-rocket-trading-mvp', icon: Database, category: 'Data Mining' }
      ]
    },
    {
      name: 'Roadmaps & Vision',
      icon: Compass,
      isDropdown: true,
      dropdownId: 'roadmaps',
      children: [
        { name: 'Checklist Roadmap GlobalAI Trader', href: '/global-ai-trader-roadmap-checklist', icon: CheckCircle2, category: 'Roadmaps' },
        { name: 'Landing Page Trading MVP', href: '/trading-mvp-landing-page', icon: Home, category: 'Landing' },
        { name: 'Redirections Pages Legacy', href: '/legacy-pages-redirect', icon: RefreshCw, category: 'Maintenance' }
      ]
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location?.pathname === '/';
    }
    return location?.pathname?.startsWith(path);
  };

  const toggleDropdown = (dropdownId) => {
    setOpenDropdowns(prev => {
      const newState = {};
      // Fermer tous les autres dropdowns
      Object.keys(prev)?.forEach(key => {
        if (key !== dropdownId) {
          newState[key] = false;
        }
      });
      // Toggle le dropdown actuel
      newState[dropdownId] = !prev?.[dropdownId];
      return newState;
    });
  };

  const closeAllDropdowns = () => {
    setOpenDropdowns({});
  };

  const getLatencyColor = (latency) => {
    if (!latency) return 'text-gray-400';
    if (latency < 100) return 'text-green-400';
    if (latency < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyStatus = (latency) => {
    if (!latency) return 'Unknown';
    if (latency < 100) return 'Excellent';
    if (latency < 500) return 'Good';
    return 'Poor';
  };

  const renderDropdownItems = (items) => {
    const categories = {};
    items?.forEach(item => {
      if (!categories?.[item?.category]) {
        categories[item.category] = [];
      }
      categories?.[item?.category]?.push(item);
    });

    return Object.entries(categories)?.map(([category, categoryItems]) => (
      <div key={category} className="py-2 border-b border-gray-100 last:border-b-0">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
          {category}
        </div>
        {categoryItems?.map((item) => {
          const IconComponent = item?.icon;
          return (
            <Link
              key={item?.href}
              to={item?.href}
              onClick={() => {
                closeAllDropdowns();
                setIsMenuOpen(false);
              }}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
            >
              <IconComponent className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
              <div className="flex-1">
                <div className="font-medium group-hover:font-semibold">{item?.name}</div>
              </div>
            </Link>
          );
        })}
      </div>
    ));
  };

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ne fermer que si le clic n'est pas sur un dropdown
      let isInsideDropdown = false;
      Object.values(dropdownRefs?.current)?.forEach(ref => {
        if (ref && ref?.contains(event?.target)) {
          isInsideDropdown = true;
        }
      });
      
      if (!isInsideDropdown) {
        closeAllDropdowns();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer les dropdowns lors du changement de route
  useEffect(() => {
    closeAllDropdowns();
  }, [location?.pathname]);

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-[100] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3" onClick={closeAllDropdowns}>
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Rocket Trading AI</h1>
                <p className="text-xs text-gray-400">MVP Plateforme Professionnelle</p>
              </div>
            </Link>
          </div>

          {/* API Latency Indicator */}
          {apiLatency !== null && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${getLatencyColor(apiLatency)} animate-pulse`}></div>
              <span className="text-xs text-gray-300">
                API: {apiLatency}ms ({getLatencyStatus(apiLatency)})
              </span>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {MAIN_NAVIGATION?.slice(0, 5)?.map((item) => {
              const IconComponent = item?.icon;
              
              if (item?.isDropdown) {
                return (
                  <div 
                    key={item?.name} 
                    className="relative"
                    ref={el => dropdownRefs.current[item.dropdownId] = el}
                  >
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        toggleDropdown(item?.dropdownId);
                      }}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        openDropdowns?.[item?.dropdownId] 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {item?.name}
                      <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
                        openDropdowns?.[item?.dropdownId] ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openDropdowns?.[item?.dropdownId] && (
                      <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[200] max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
                        {renderDropdownItems(item?.children)}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item?.name}
                  to={item?.href}
                  onClick={closeAllDropdowns}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item?.href)
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item?.name}
                </Link>
              );
            })}
            
            {/* Menu "Plus" pour les items restants */}
            <div 
              className="relative"
              ref={el => dropdownRefs.current['more'] = el}
            >
              <button
                onClick={(e) => {
                  e?.stopPropagation();
                  toggleDropdown('more');
                }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  openDropdowns?.['more'] 
                    ? 'bg-blue-600 text-white shadow-lg' :'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Menu className="w-4 h-4 mr-2" />
                Plus
                <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
                  openDropdowns?.['more'] ? 'rotate-180' : ''
                }`} />
              </button>
              {openDropdowns?.['more'] && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-[200] max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
                  {MAIN_NAVIGATION?.slice(5)?.map((moreItem) => (
                    <div key={moreItem?.name} className="py-2 border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        <div className="flex items-center">
                          <moreItem.icon className="w-4 h-4 mr-2" />
                          {moreItem?.name}
                        </div>
                      </div>
                      {moreItem?.children?.map((child) => {
                        const ChildIcon = child?.icon;
                        return (
                          <Link
                            key={child?.href}
                            to={child?.href}
                            onClick={() => {
                              closeAllDropdowns();
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                          >
                            <ChildIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500" />
                            <div className="flex-1">
                              <div className="font-medium group-hover:font-semibold">{child?.name}</div>
                              <div className="text-xs text-gray-500">{child?.category}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              closeAllDropdowns();
            }}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-800 border-t border-gray-700 shadow-xl">
          <div className="px-4 py-2 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {MAIN_NAVIGATION?.map((item) => {
              const IconComponent = item?.icon;
              
              if (item?.isDropdown) {
                return (
                  <div key={item?.name} className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(`mobile-${item?.dropdownId}`)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium border-b border-gray-600 transition-all duration-200 ${
                        openDropdowns?.[`mobile-${item?.dropdownId}`] 
                          ? 'bg-blue-600 text-white' :'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <IconComponent className="w-4 h-4 mr-3" />
                        {item?.name}
                      </div>
                      <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${
                        openDropdowns?.[`mobile-${item?.dropdownId}`] ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openDropdowns?.[`mobile-${item?.dropdownId}`] && (
                      <div className="pl-4 space-y-1 bg-gray-700/50 rounded-lg mx-2 py-2">
                        {item?.children?.map((child) => {
                          const ChildIcon = child?.icon;
                          return (
                            <Link
                              key={child?.href}
                              to={child?.href}
                              onClick={() => {
                                setIsMenuOpen(false);
                                closeAllDropdowns();
                              }}
                              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActiveRoute(child?.href)
                                  ? 'bg-blue-600 text-white shadow-lg' 
                                  : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                              }`}
                            >
                              <ChildIcon className="w-4 h-4 mr-3" />
                              <div>
                                <div>{child?.name}</div>
                                <div className="text-xs text-gray-400">{child?.category}</div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item?.name}
                  to={item?.href}
                  onClick={() => {
                    setIsMenuOpen(false);
                    closeAllDropdowns();
                  }}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute(item?.href)
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item?.name}
                </Link>
              );
            })}
            
            {/* Mobile API Latency */}
            {apiLatency !== null && (
              <div className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-400 border-t border-gray-600 mt-4">
                <div className={`w-2 h-2 rounded-full ${getLatencyColor(apiLatency)} animate-pulse`}></div>
                <span>API Latency: {apiLatency}ms ({getLatencyStatus(apiLatency)})</span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;