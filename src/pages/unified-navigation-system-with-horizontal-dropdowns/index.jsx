import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, Search, Bell, User, TrendingUp, Brain, Shield, Settings, Home, BarChart3, Zap, Bot, AlertTriangle, Eye, Command } from 'lucide-react';
import Icon from '@/components/AppIcon';


// Navigation configuration with grouped dropdowns
const NAVIGATION_CONFIG = {
  trading: {
    label: 'Trading',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home, description: 'Vue d\'ensemble trading & positions' },
      { label: 'Market Analysis', href: '/market-analysis', icon: BarChart3, description: 'Analyse des marchés & screening' },
      { label: 'Paper Trading', href: '/paper-trading', icon: Zap, description: 'Simulation de trading papier' },
      { label: 'Portfolio View', href: '/portfolio-view-enhanced', icon: TrendingUp, description: 'Vue détaillée du portefeuille' },
      { label: 'Options Strategy AI', href: '/options-strategy-ai', icon: Brain, description: 'Stratégies options intelligentes' }
    ]
  },
  ia: {
    label: 'IA',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    items: [
      { label: 'AI System Status', href: '/ai-system-status', icon: Bot, description: 'Statut système intelligence artificielle' },
      { label: 'Real-time Agent Performance', href: '/real-time-agent-performance', icon: Eye, description: 'Performance agents en temps réel' },
      { label: 'Bus Monitor', href: '/bus-monitor', icon: Command, description: 'Monitoring bus événements' },
      { label: 'AI Agent Orchestration Command Center', href: '/ai-agent-orchestration-command-center', icon: Command, description: 'Centre de commande orchestration agents' },
      { label: 'Multi-Region Agent Surveillance Hub', href: '/real-time-agent-activity-monitor', icon: Eye, description: 'Hub surveillance agents multi-régions' }
    ]
  },
  risk: {
    label: 'Risk',
    icon: Shield,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    items: [
      { label: 'Risk Controller Dashboard', href: '/risk-controller-dashboard', icon: Shield, description: 'Tableau de bord contrôle des risques' },
      { label: 'System Resilience & Safe Landing Center', href: '/self-healing-orchestration-dashboard', icon: Shield, description: 'Centre résilience & atterrissage sûr' },
      { label: 'Emergency Response Center', href: '/ai-agent-emergency-response-center', icon: AlertTriangle, description: 'Centre de réponse d\'urgence' }
    ]
  },
  config: {
    label: 'Config',
    icon: Settings,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    items: [
      { label: 'Strategy Management', href: '/strategy-management', icon: Settings, description: 'Gestion des stratégies trading' },
      { label: 'System Status', href: '/system-status', icon: Settings, description: 'Statut global du système' },
      { label: 'Configuration Centers', href: '/provider-configuration-management-center', icon: Settings, description: 'Centres de configuration' }
    ]
  }
};

export default function UnifiedNavigationSystemPage() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('/dashboard');
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideAllDropdowns = Object.values(dropdownRefs?.current)?.every(
        ref => ref && !ref?.contains(event?.target)
      );
      if (isOutsideAllDropdowns) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const handleNavigation = (href) => {
    setCurrentPage(href);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    // In real implementation, this would use react-router-dom navigation
    console.log(`Navigating to: ${href}`);
  };

  const getCurrentPageInfo = () => {
    for (const category of Object.values(NAVIGATION_CONFIG)) {
      const item = category?.items?.find(item => item?.href === currentPage);
      if (item) return { ...item, category: category?.label };
    }
    return { label: 'Dashboard', category: 'Trading' };
  };

  const currentPageInfo = getCurrentPageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Fixed Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold text-lg">Rocket Trading MVP</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {Object.entries(NAVIGATION_CONFIG)?.map(([key, config]) => {
                const Icon = config?.icon;
                const isActive = activeDropdown === key;
                
                return (
                  <div key={key} className="relative" ref={el => dropdownRefs.current[key] = el}>
                    <button
                      onClick={() => handleDropdownToggle(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? `${config?.bgColor} ${config?.color}` 
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{config?.label}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Dropdown Menu */}
                    {isActive && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl overflow-hidden">
                        <div className={`px-4 py-3 border-b border-white/10 ${config?.bgColor}`}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config?.color}`} />
                            <span className={`text-sm font-medium ${config?.color}`}>{config?.label}</span>
                          </div>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          {config?.items?.map((item, index) => {
                            const ItemIcon = item?.icon;
                            const isCurrentPage = item?.href === currentPage;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => handleNavigation(item?.href)}
                                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                                  isCurrentPage 
                                    ? 'bg-blue-500/10 text-blue-400' :'text-slate-300 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <ItemIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="text-sm font-medium">{item?.label}</div>
                                  <div className="text-xs text-slate-400 mt-1">{item?.description}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 transition-colors">
                <Search className="w-4 h-4" />
                <span className="text-sm">Rechercher</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 transition-colors">
                <Bell className="w-4 h-4" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* User Profile */}
              <button className="flex items-center gap-2 p-2 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden lg:block text-sm">Profile</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 bg-white/5 text-slate-300 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-800/95 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
              {Object.entries(NAVIGATION_CONFIG)?.map(([key, config]) => {
                const Icon = config?.icon;
                const isExpanded = activeDropdown === key;
                
                return (
                  <div key={key} className="space-y-1">
                    <button
                      onClick={() => handleDropdownToggle(key)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isExpanded 
                          ? `${config?.bgColor} ${config?.color}` 
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{config?.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {config?.items?.map((item, index) => {
                          const ItemIcon = item?.icon;
                          const isCurrentPage = item?.href === currentPage;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => handleNavigation(item?.href)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                                isCurrentPage 
                                  ? 'bg-blue-500/10 text-blue-400' :'text-slate-300 hover:bg-white/5'
                              }`}
                            >
                              <ItemIcon className="w-4 h-4" />
                              <span className="text-sm">{item?.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>
      {/* Main Content */}
      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{currentPageInfo?.category}</span>
            <span>/</span>
            <span className="text-white">{currentPageInfo?.label}</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="space-y-6">
            
            {/* Current Page Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                {currentPageInfo?.icon && <currentPageInfo.icon className="w-8 h-8 text-blue-400" />}
                <div>
                  <h1 className="text-2xl font-bold text-white">{currentPageInfo?.label}</h1>
                  <p className="text-slate-300">{currentPageInfo?.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Catégorie:</span>
                <span className="text-sm px-2 py-1 bg-blue-500/10 text-blue-400 rounded">{currentPageInfo?.category}</span>
              </div>
            </div>

            {/* Navigation Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {Object.entries(NAVIGATION_CONFIG)?.map(([key, config]) => {
                const Icon = config?.icon;
                
                return (
                  <div key={key} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 ${config?.bgColor} rounded-lg`}>
                        <Icon className={`w-5 h-5 ${config?.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{config?.label}</h3>
                        <p className="text-xs text-slate-400">{config?.items?.length} pages</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {config?.items?.slice(0, 3)?.map((item, index) => {
                        const ItemIcon = item?.icon;
                        const isCurrentPage = item?.href === currentPage;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleNavigation(item?.href)}
                            className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                              isCurrentPage 
                                ? 'bg-blue-500/10 text-blue-400' :'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <ItemIcon className="w-3 h-3" />
                            <span className="text-xs">{item?.label}</span>
                          </button>
                        );
                      })}
                      
                      {config?.items?.length > 3 && (
                        <div className="text-xs text-slate-400 px-2">
                          +{config?.items?.length - 3} autres pages
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Access Shortcuts */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Accès Rapide</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-400' },
                  { label: 'Agents IA', href: '/real-time-agent-performance', icon: Bot, color: 'text-purple-400' },
                  { label: 'Risk Controller', href: '/risk-controller-dashboard', icon: Shield, color: 'text-orange-400' },
                  { label: 'System Status', href: '/system-status', icon: Settings, color: 'text-teal-400' }
                ]?.map((shortcut, index) => {
                  const ShortcutIcon = shortcut?.icon;
                  const isActive = shortcut?.href === currentPage;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavigation(shortcut?.href)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-500/10 text-blue-400' :'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <ShortcutIcon className={`w-4 h-4 ${isActive ? 'text-blue-400' : shortcut?.color}`} />
                      <span className="text-sm">{shortcut?.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Integration Status */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Intégration Système</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-green-400">Navigation Active</span>
                  </div>
                  <span className="text-xs text-green-400">✓ 70+ Écrans</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-blue-400">Responsive Design</span>
                  </div>
                  <span className="text-xs text-blue-400">✓ Mobile/Desktop</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-purple-400">Accessibilité</span>
                  </div>
                  <span className="text-xs text-purple-400">✓ Clavier/A11y</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}