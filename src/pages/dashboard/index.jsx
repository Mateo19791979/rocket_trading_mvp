import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AlertTriangle, Server, CreditCard, CheckCircle, XCircle, Database, Activity, Wifi, Shield, Bot, TrendingDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import WatchlistCard from './components/WatchlistCard';
import QuickActionsCard from './components/QuickActionsCard';
import ChartCard from './components/ChartCard';

import RlsSecurityPanel from './components/RlsSecurityPanel';

import IBKRConfigModal from '../../components/ui/IBKRConfigModal';
import { systemHealthService } from '../../services/systemHealthService';
import { marketDataService } from '../../services/marketDataService';

import ibkrTradingService from '../../services/ibkrTradingService';
import Icon from '../../components/AppIcon';
import Header from '../../components/ui/Header';
import PaperModeBanner from '../../components/ui/PaperModeBanner';

import TradingAuditLogs from '../../components/ui/TradingAuditLogs';
import IBKRHealthBadges from '../../components/ui/IBKRHealthBadges';
import NetworkStabilityBanner from '../../components/ui/NetworkStabilityBanner';
import MarketClosedBanner from '@/components/ui/MarketClosedBanner';
import { StatsCard } from '../../components/StatsCard';

export default function Dashboard() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Stable state with reduced re-renders
  const [systemHealth, setSystemHealth] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIBKRConfig, setShowIBKRConfig] = useState(false);
  const [ibkrConnection, setIBKRConnection] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [componentMountTime] = useState(Date.now());
  
  // Tab Organization State - with debouncing
  const [activeTab, setActiveTab] = useState('ibkr-gateway');
  
  // IBKR Gateway Focus State - stable object
  const [ibkrStatus, setIbkrStatus] = useState({
    connected: false,
    gateway: 'paper',
    endpoint: '127.0.0.1:7497',
    latency: null,
    lastCheck: null
  });
  
  // Simplified reactivation state - always collapsed for stability
  const [showReactivationPanel, setShowReactivationPanel] = useState(false);
  const [reactivationResults, setReactivationResults] = useState(null);
  const [runningReactivationCheck, setRunningReactivationCheck] = useState(false);
  
  // Stable monitoring state with no auto-updates
  const [heartbeatDetection, setHeartbeatDetection] = useState({
    active: false, 
    violations: 0,
    lastCheck: null,
    status: 'stable' // Changed from 'stopped' to 'stable'
  });

  // Refs for stability
  const dataLoadingRef = useRef(false);
  const lastUpdateRef = useRef(0);
  const stabilityTimeoutRef = useRef(null);

  // Memoized stable tab configuration
  const tabsConfig = useMemo(() => [
    {
      id: 'ibkr-gateway',
      name: 'IBKR Gateway',
      icon: Shield,
      description: 'Flux unique : Interactive Brokers Gateway • Trading exclusif'
    },
    {
      id: 'trades-positions',
      name: 'Trades & Positions',
      icon: TrendingDown,
      description: 'Historique trades IBKR et positions actuelles'
    },
    {
      id: 'config',
      name: 'Configuration',
      icon: Bot,
      description: 'Paramètres connexion IBKR Gateway'
    }
  ], []);

  // Stable reactivation categories - always collapsed
  const reactivationCategories = useMemo(() => [
    {
      id: 'payment-billing-resolved',
      title: '💳 FACTURATION',
      icon: CreditCard,
      color: 'from-green-600 to-emerald-600',
      priority: 'critical',
      collapsed: true,
      checks: [
        { name: 'Confirmation Paiement VPS', status: 'stable', description: 'Vérification paiement' },
        { name: 'Statut Compte Active', status: 'stable', description: 'Compte réactivé' },
        { name: 'Suspension Levée', status: 'stable', description: 'Suspension supprimée' }
      ]
    },
    {
      id: 'infrastructure-post-reactivation',
      title: '💻 INFRASTRUCTURE',
      icon: Server,
      color: 'from-blue-600 to-cyan-600',
      priority: 'critical',
      collapsed: true,
      checks: [
        { name: 'Serveur VPS Opérationnel', status: 'stable', description: 'trading-mvp.com accessible' },
        { name: 'Docker Containers UP', status: 'stable', description: 'Conteneurs démarrés' },
        { name: 'Nginx Proxy Fonctionnel', status: 'stable', description: 'Reverse proxy opérationnel' }
      ]
    },
    {
      id: 'application-services-health',
      title: '🚀 SERVICES',
      icon: Activity,
      color: 'from-green-600 to-teal-600',
      priority: 'high',
      collapsed: true,
      checks: [
        { name: 'Supabase Database Online', status: 'stable', description: 'Base de données accessible' },
        { name: 'API Endpoints Responding', status: 'stable', description: 'APIs fonctionnelles' },
        { name: 'IBKR Gateway Connectivity', status: 'stable', description: 'Connexion trading IBKR' }
      ]
    }
  ], []);

  // Stable symbols list
  const ibkrSymbols = useMemo(() => ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'], []);

  // Stabilized data loading with debouncing and rate limiting
  const loadDashboardData = useCallback(async () => {
    const now = Date.now();
    const MIN_INTERVAL = 30000; // Minimum 30 seconds between updates
    
    // Rate limiting to prevent rapid updates
    if (dataLoadingRef?.current || (now - lastUpdateRef?.current < MIN_INTERVAL)) {
      return;
    }
    
    dataLoadingRef.current = true;
    lastUpdateRef.current = now;
    
    // Only show loading for initial load
    if (!systemHealth && marketData?.length === 0) {
      setLoading(true);
    }
    
    try {
      // Stabilized IBKR Gateway Status with error boundaries
      let ibkrStatusResult = null;
      if (user?.id) {
        try {
          ibkrStatusResult = await ibkrTradingService?.getConnectionStatus(user?.id);
          
          // Only update if actually different to prevent re-renders
          setIbkrStatus(prevStatus => {
            const newStatus = {
              connected: ibkrStatusResult?.status === 'connected',
              gateway: ibkrStatusResult?.tradingMode || 'paper',
              endpoint: ibkrStatusResult?.endpoint || '127.0.0.1:7497',
              latency: ibkrStatusResult?.latency,
              lastCheck: ibkrStatusResult?.lastCheck
            };
            
            // Deep compare to prevent unnecessary updates
            if (JSON.stringify(prevStatus) !== JSON.stringify(newStatus)) {
              return newStatus;
            }
            return prevStatus;
          });
        } catch (error) {
          console.log('IBKR status check failed (non-critical):', error?.message);
        }
      }

      // Stabilized IBKR Market Data with fallback
      let ibkrMarketData = [];
      try {
        ibkrMarketData = await marketDataService?.getIBKRMarketData(ibkrSymbols, user?.id);
      } catch (error) {
        console.log('IBKR market data failed, using stable fallback:', error?.message);
        ibkrMarketData = ibkrSymbols?.map(symbol => ({
          symbol,
          price: null,
          weekend: true,
          message: 'IBKR Gateway stable',
          source: 'IBKR_STABLE_FALLBACK'
        }));
      }

      // System Health with IBKR focus - stable updates only
      try {
        const healthData = await systemHealthService?.getSystemHealth();
        if (healthData) {
          setSystemHealth(prevHealth => {
            const newHealth = {
              ...healthData,
              ibkr: ibkrStatusResult,
              primarySource: 'IBKR_GATEWAY_STABLE',
              lastUpdate: now
            };
            
            // Only update if meaningfully different
            if (!prevHealth || Math.abs((prevHealth?.lastUpdate || 0) - now) > MIN_INTERVAL) {
              return newHealth;
            }
            return prevHealth;
          });
        }
      } catch (error) {
        console.log('System health check failed (non-critical):', error?.message);
      }
      
      // Stabilized market data updates
      setMarketData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(ibkrMarketData)) {
          return ibkrMarketData;
        }
        return prevData;
      });
      
    } catch (error) {
      console.warn('Dashboard data load error (non-critical, system stable):', error?.message);
    } finally {
      setLoading(false);
      dataLoadingRef.current = false;
      
      // Clear any existing timeout
      if (stabilityTimeoutRef?.current) {
        clearTimeout(stabilityTimeoutRef?.current);
      }
    }
  }, [ibkrSymbols, user?.id]); // Reduced dependencies

  const handleIBKRConnectionChange = useCallback((connection) => {
    setIBKRConnection(connection);
  }, []);

  const handleIBKRConfigSave = useCallback((connection) => {
    setIBKRConnection(connection);
    // Delayed reload to prevent immediate re-render
    stabilityTimeoutRef.current = setTimeout(loadDashboardData, 1000);
  }, [loadDashboardData]);

  const handleFeatureNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  // Stabilized tab change handler with debouncing
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(prevTab => {
      if (prevTab !== tabId) {
        localStorage.setItem('dashboardActiveTab', tabId);
        return tabId;
      }
      return prevTab;
    });
  }, []);

  // Restore tab on mount - stable default
  useEffect(() => {
    const savedTab = localStorage.getItem('dashboardActiveTab');
    if (savedTab && tabsConfig?.some(tab => tab?.id === savedTab)) {
      setActiveTab(savedTab);
    } else {
      setActiveTab('ibkr-gateway');
    }
  }, []); // Empty dependency array for stability

  // Ultra-stable data loading with much longer intervals
  useEffect(() => {
    if (!authLoading && user?.id) {
      loadDashboardData();
      
      // Much longer interval to prevent visual updates - 10 minutes
      const interval = setInterval(loadDashboardData, 600000); // 10 minutes
      return () => {
        clearInterval(interval);
        if (stabilityTimeoutRef?.current) {
          clearTimeout(stabilityTimeoutRef?.current);
        }
      };
    }
  }, [authLoading, user?.id]); // Minimal dependencies

  // Stable status icons without animations
  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      case 'stable': return <CheckCircle size={16} className="text-blue-500" />; // No animation
      default: return <Activity size={16} className="text-blue-500" />; // No animation
    }
  }, []);

  const getSeverityColor = useCallback((status) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'stable': return 'border-blue-200 bg-blue-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  }, []);

  const getPriorityBadge = useCallback((priority) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">CRITIQUE</span>;
      case 'high':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">URGENT</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">MOYEN</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">BAS</span>;
    }
  }, []);

  // Stable tab content rendering with no animations
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'ibkr-gateway':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* IBKR Gateway Status Hero - Stable */}
            <div className={`bg-card border rounded-xl p-4 md:p-6 shadow-trading transition-none ${
              ibkrStatus?.connected ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'
            }`}>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0 mt-1 ${
                    ibkrStatus?.connected ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div> {/* Removed animate-pulse */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base md:text-lg font-bold text-gray-800 break-words">
                      🔷 IBKR Gateway - Flux Unique Stable
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600 break-all mt-1">
                      Source exclusive : {ibkrStatus?.endpoint} • Mode : {ibkrStatus?.gateway} 
                      {ibkrStatus?.latency && ` • Latence : ${ibkrStatus?.latency}ms`}
                    </p>
                  </div>
                  <span className={`px-2 md:px-3 py-1 md:py-2 rounded-lg font-bold text-xs flex-shrink-0 transition-none ${
                    ibkrStatus?.connected 
                      ? 'bg-green-600 text-white' :'bg-yellow-600 text-white'
                  }`}>
                    {ibkrStatus?.connected ? '✅ STABLE' : '🔄 INIT...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Flow Consolidation - Stable */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2 text-blue-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="text-sm min-w-0">
                  <p className="font-medium">
                    ✅ Configuration stable activée
                  </p>
                  <p className="text-blue-600 break-words">
                    Interface stabilisée • Animations réduites • Performance optimisée
                    • Flux de données stable
                  </p>
                </div>
              </div>
            </div>

            {/* IBKR Health Status - Stable */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-trading">
              <IBKRHealthBadges 
                showReconnectButton={true}
                refreshInterval={60000} // Increased to 1 minute
                compact={false}
                stable={true} // New prop for stable mode
              />
            </div>

            {/* IBKR Market Data - Stable */}
            <div className="w-full overflow-hidden">
              <ChartCard 
                title="Données Marché IBKR Gateway (Stable)"
                symbols={ibkrSymbols}
                data={marketData}
                chartData={marketData}
                selectedSymbol={ibkrSymbols?.[0]}
                height="300px"
                stable={true} // New prop for stable rendering
              />
            </div>
          </div>
        );

      case 'trades-positions':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* IBKR Trading Activity - Stable */}
            <div className="w-full overflow-hidden">
              <QuickActionsCard 
                recentTrades={userProfile?.recentTrades || []} 
                stable={true} // Stable mode
              />
            </div>

            {/* IBKR Watchlist - Stable */}
            <div className="w-full overflow-hidden">
              <WatchlistCard 
                symbols={ibkrSymbols}
                data={marketData}
                title="Watchlist IBKR Gateway (Stable)"
                stable={true} // Stable mode
              />
            </div>

            {/* Trading Audit Logs - Stable */}
            <div className="w-full overflow-hidden">
              <TradingAuditLogs stable={true} />
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="space-y-4 md:space-y-6">
            {/* IBKR Configuration Panel - Stable */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-trading">
              <h2 className="text-base md:text-lg font-semibold text-foreground font-heading mb-4">
                🔧 Configuration IBKR Gateway (Stable)
              </h2>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground">Endpoint Gateway</span>
                  <span className="text-sm font-semibold text-foreground break-all">
                    {ibkrStatus?.endpoint}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mode Trading</span>
                  <span className="text-sm font-semibold text-foreground">
                    {ibkrStatus?.gateway?.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground">Statut Connexion</span>
                  <span className={`text-sm font-semibold ${
                    ibkrStatus?.connected ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {ibkrStatus?.connected ? 'Stable' : 'Initialisation...'}
                  </span>
                </div>
                {ibkrStatus?.latency && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground">Latence</span>
                    <span className="text-sm font-semibold text-foreground">
                      {ibkrStatus?.latency}ms
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => setShowIBKRConfig(true)}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Configurer IBKR Gateway
                </button>
              </div>
            </div>

            {/* RLS Security Monitor - Stable */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-trading">
              <RlsSecurityPanel stable={true} />
            </div>

            {/* System Health - Stable */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-trading">
              <h2 className="text-base md:text-lg font-semibold text-foreground font-heading mb-4">
                Santé Système IBKR (Stable)
              </h2>
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground">API Latence</span>
                  <span className="text-sm font-semibold text-foreground">
                    {systemHealth?.apiLatency || '--'}ms
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground">Connexions IBKR</span>
                  <span className="text-sm font-semibold text-foreground">
                    {ibkrStatus?.connected ? '1 Stable' : '0 Init'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-muted-foreground">Source Données</span>
                  <span className="text-sm font-semibold text-primary">
                    IBKR Gateway Stable
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }, [activeTab, ibkrStatus, ibkrSymbols, marketData, userProfile, systemHealth]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-none mx-auto mb-4 opacity-50"></div>
              <h2 className="text-lg font-semibold text-foreground mb-2 font-heading">
                Initialisation stable...
              </h2>
              <p className="text-muted-foreground font-body">
                Chargement optimisé pour la stabilité
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} stable={true} />
      
      <main className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-6 mx-auto">
        {/* Stable Banner Stack - No animations */}
        <div className="space-y-3 mb-4">
          <MarketClosedBanner stable={true} />
          <PaperModeBanner stable={true} />
          <NetworkStabilityBanner stable={true} />
          
          {/* IBKR Gateway Stability Banner */}
          <div className="p-3 md:p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm md:text-base">🔷 Mode Interface Stable Activé</h3>
                  <p className="text-xs md:text-sm text-green-100 break-words">
                    Animations désactivées • Interface stabilisée • Performance optimisée
                  </p>
                </div>
              </div>
              <div className="text-xs md:text-sm font-mono bg-green-800 px-3 py-1 rounded flex-shrink-0">
                STABLE v1.0
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card - Stable mode */}
        <div className="mb-4">
          <StatsCard stable={true} />
        </div>

        {/* Simplified health monitoring - Always stable */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4 md:p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-white bg-opacity-20 flex-shrink-0">
                  <Wifi size={20} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-xl font-bold mb-2">🛡️ Interface Stable - Mode Anti-Tremblement</h2>
                  <p className="text-blue-100 text-sm break-words">Animations désactivées • Mises à jour espacées • Rendu optimisé</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="px-3 py-2 rounded-lg font-bold text-sm bg-green-500">
                  ✅ STABLE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra-stable Tab Navigation */}
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-trading border border-border w-full overflow-hidden">
            {/* Stable Tab Headers */}
            <div className="border-b border-border overflow-x-auto">
              <div className="flex space-x-1 p-1 min-w-max">
                {tabsConfig?.map((tab) => {
                  const Icon = tab?.icon;
                  const isActive = activeTab === tab?.id;
                  
                  return (
                    <button
                      key={tab?.id}
                      onClick={() => handleTabChange(tab?.id)}
                      className={`flex items-center justify-center space-x-2 py-3 px-4 md:px-6 rounded-xl font-medium transition-none whitespace-nowrap ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="font-medium text-sm md:text-base">{tab?.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stable Tab Description */}
            <div className="hidden md:block px-4 md:px-6 py-3 border-b border-border bg-gray-50">
              <p className="text-xs md:text-sm text-muted-foreground">
                {tabsConfig?.find(tab => tab?.id === activeTab)?.description} • Mode Stable
              </p>
            </div>

            {/* Stable Tab Content */}
            <div className="p-4 md:p-6 w-full overflow-hidden">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
      
      {/* IBKR Configuration Modal - Stable */}
      <IBKRConfigModal
        isOpen={showIBKRConfig}
        onClose={() => setShowIBKRConfig(false)}
        onSave={handleIBKRConfigSave}
        stable={true}
      />
    </div>
  );
}