import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, BookOpen, FileText } from "lucide-react";
import { BarChart3, Settings, Activity, Bot, Shield, Monitor, Users, DollarSign, PieChart, Zap, Target, Brain, Radio, GitBranch, Server, Globe, CheckSquare, Lock } from 'lucide-react';
import Icon from '../AppIcon';

const Header = ({ activeItem, setActiveItem }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [apiLatency, setApiLatency] = useState(null);
  const location = useLocation();

  const NAVIGATION_ITEMS = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart3
    },
    {
      name: 'Market Analysis',
      href: '/market-analysis',
      icon: TrendingUp
    },
    {
      name: 'Paper Trading',
      href: '/paper-trading',
      icon: DollarSign
    },
    {
      name: 'Portfolio View',
      href: '/portfolio-consolidated-view',
      icon: PieChart
    },
    {
      name: 'Strategy Management',
      href: '/strategy-management',
      icon: Settings
    },
    {
      name: 'AI Agents',
      href: '/ai-agents',
      icon: Bot
    }
  ];

  const navigationItems = [
    // Main
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/',
      icon: BarChart3,
      category: 'main'
    },

    // Trading & Analysis
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      path: '/market-analysis',
      icon: TrendingUp,
      category: 'trading'
    },
    {
      id: 'paper-trading',
      name: 'Paper Trading',
      path: '/paper-trading',
      icon: DollarSign,
      category: 'trading'
    },
    {
      id: 'portfolio-consolidated-view',
      name: 'Portfolio View',
      path: '/portfolio-consolidated-view',
      icon: PieChart,
      category: 'trading'
    },
    {
      id: 'correlation-hunter',
      name: 'Correlation Hunter',
      path: '/correlation-hunter',
      icon: Target,
      category: 'trading'
    },
    {
      id: 'portfolio-view-enhanced',
      name: 'Portfolio Enhanced',
      path: '/portfolio-view-enhanced',
      icon: PieChart,
      category: 'trading'
    },

    // Strategy & AI
    {
      id: 'strategy-management',
      name: 'Strategy Management',
      path: '/strategy-management',
      icon: Settings,
      category: 'strategy'
    },
    {
      id: 'ai-agents',
      name: 'AI Agents',
      path: '/ai-agents',
      icon: Bot,
      category: 'strategy'
    },
    {
      id: 'real-time-agent-performance',
      name: 'Agent Performance',
      path: '/real-time-agent-performance',
      icon: Zap,
      category: 'strategy'
    },
    {
      id: 'ai-system-status',
      name: 'AI System Status',
      path: '/ai-system-status',
      icon: Activity,
      category: 'strategy'
    },
    {
      id: 'agent-roster',
      name: 'Agent Roster',
      path: '/agent-roster',
      icon: Users,
      category: 'strategy'
    },
    {
      id: 'options-strategy-ai',
      name: 'Options Strategy AI',
      path: '/options-strategy-ai',
      icon: Target,
      category: 'strategy'
    },
    {
      id: 'ia-strategies-brancher',
      name: 'IA Stratégies',
      path: '/ia-strategies-brancher',
      icon: Brain,
      category: 'strategy'
    },

    // Architecture & System
    {
      id: 'global-ai-trader-architecture',
      name: 'GlobalAI Architecture',
      path: '/global-ai-trader-architecture',
      icon: Globe,
      category: 'system'
    },
    {
      id: 'global-ai-trader-roadmap-checklist',
      name: 'Roadmap & Checklist',
      path: '/global-ai-trader-roadmap-checklist',
      icon: CheckSquare,
      category: 'system'
    },
    {
      id: 'global-ai-trader-security-configuration',
      name: 'Security & Config',
      path: '/global-ai-trader-security-configuration',
      icon: Lock,
      category: 'system'
    },
    {
      id: 'system-status',
      name: 'System Status',
      path: '/system-status',
      icon: Monitor,
      category: 'system'
    },
    {
      id: 'bus-monitor',
      name: 'Bus Monitor',
      path: '/bus-monitor',
      icon: Radio,
      category: 'system'
    },
    {
      id: 'orchestrator-dashboard',
      name: 'Orchestrator',
      path: '/orchestrator-dashboard',
      icon: GitBranch,
      category: 'system'
    },
    {
      id: 'risk-controller-dashboard',
      name: 'Risk Controller',
      path: '/risk-controller-dashboard',
      icon: Shield,
      category: 'system'
    },
    {
      id: 'dns-ssl-management',
      name: 'DNS & SSL Management',
      path: '/dns-ssl-management',
      icon: Server,
      category: 'system'
    },

    // Reports
    {
      id: 'weekly-pdf-reports',
      name: 'Weekly PDF Reports',
      path: '/weekly-pdf-reports',
      icon: FileText,
      category: 'reports'
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location?.pathname === '/';
    }
    return location?.pathname?.startsWith(path);
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

  const renderNavigation = () => {
    const categories = {
      main: { title: 'Main', items: [] },
      trading: { title: 'Trading & Analysis', items: [] },
      strategy: { title: 'Strategy & AI', items: [] },
      reports: { title: 'Reports', items: [] },
      system: { title: 'System & Architecture', items: [] }
    };

    // Group items by category
    navigationItems?.forEach(item => {
      if (categories?.[item?.category]) {
        categories?.[item?.category]?.items?.push(item);
      }
    });

    return Object.entries(categories)?.map(([key, category]) => {
      if (category?.items?.length === 0) return null;

      return (
        <div key={key} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {category?.title}
          </h3>
          <div className="space-y-1">
            {category?.items?.map(item => {
              const Icon = item?.icon;
              const isActive = activeItem === item?.id;
              
              return (
                <Link
                  key={item?.id}
                  to={item?.path}
                  onClick={() => {
                    setActiveItem(item?.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' :'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item?.name}
                </Link>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Trading AI</h1>
                <p className="text-xs text-gray-400">Professional Trading Platform</p>
              </div>
            </Link>
          </div>

          {/* API Latency Indicator */}
          {apiLatency !== null && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${getLatencyColor(apiLatency)} animate-pulse`}></div>
              <span className="text-xs text-gray-300">
                API: {apiLatency}ms ({getLatencyStatus(apiLatency)})
              </span>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              to="/pipeline-books-registry-orchestrator"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/pipeline-books-registry-orchestrator' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Pipeline Books
            </Link>
            
            <Link
              to="/registry-v0-1-strategy-catalogue"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/registry-v0-1-strategy-catalogue' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Strategy Registry
            </Link>
            
            <Link
              to="/global-ai-trader-architecture"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/global-ai-trader-architecture' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              GlobalAI Architecture
            </Link>
            
            <Link
              to="/global-ai-trader-security-configuration"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/global-ai-trader-security-configuration' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              Security & Config
            </Link>
            
            <Link
              to="/ia-strategies-brancher"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/ia-strategies-brancher' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              IA Stratégies Brancher
            </Link>
            
            {NAVIGATION_ITEMS?.map((item) => {
              const IconComponent = item?.icon;
              return (
                <Link
                  key={item?.name}
                  to={item?.href}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveRoute(item?.href)
                      ? 'bg-blue-600 text-white' :'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item?.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/pipeline-books-registry-orchestrator"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/pipeline-books-registry-orchestrator' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Pipeline Books
            </Link>
            
            <Link
              to="/registry-v0-1-strategy-catalogue"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/registry-v0-1-strategy-catalogue' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Strategy Registry
            </Link>
            
            <Link
              to="/global-ai-trader-architecture"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/global-ai-trader-architecture' ?'bg-blue-600 text-white' :'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              GlobalAI Architecture
            </Link>
            
            <Link
              to="/global-ai-trader-security-configuration"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location?.pathname === '/global-ai-trader-security-configuration' ?'bg-blue-600 text-white' :'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 mr-2" />
              Security & Config
            </Link>
            
            {NAVIGATION_ITEMS?.map((item) => {
              const IconComponent = item?.icon;
              return (
                <Link
                  key={item?.name}
                  to={item?.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActiveRoute(item?.href)
                      ? 'bg-blue-600 text-white' :'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {item?.name}
                </Link>
              );
            })}
            
            {/* Mobile API Latency */}
            {apiLatency !== null && (
              <div className="flex items-center space-x-2 px-4 py-2 text-xs text-gray-400">
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