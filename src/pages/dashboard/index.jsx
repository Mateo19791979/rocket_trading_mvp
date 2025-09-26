import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BalanceCard from './components/BalanceCard';
import SystemHealthCard from './components/SystemHealthCard';
import WatchlistCard from './components/WatchlistCard';
import QuickActionsCard from './components/QuickActionsCard';
import ChartCard from './components/ChartCard';
import MarketStatusBadge from '../../components/ui/MarketStatusBadge';
import NewsPanel from '../../components/ui/NewsPanel';
import IBKRConnectionStatus from '../../components/ui/IBKRConnectionStatus';
import IBKRConfigModal from '../../components/ui/IBKRConfigModal';
import { systemHealthService } from '../../services/systemHealthService';
import { marketDataService } from '../../services/marketDataService';
import { ibkrService } from '../../services/ibkrService';

const DashboardPage = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [systemHealth, setSystemHealth] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIBKRConfig, setShowIBKRConfig] = useState(false);
  const [ibkrConnection, setIBKRConnection] = useState(null);

  // Default symbols for dashboard
  const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [healthData, marketResponse, ibkrStatus] = await Promise.allSettled([
        systemHealthService?.getSystemHealth(),
        marketDataService?.getMarketData(defaultSymbols),
        ibkrService?.getIBKRStatus()
      ]);

      if (healthData?.status === 'fulfilled') {
        setSystemHealth(prev => ({
          ...prev,
          ...healthData?.value,
          // Add IBKR status to system health
          ibkr: ibkrStatus?.status === 'fulfilled' ? ibkrStatus?.value : null
        }));
      }
      
      if (marketResponse?.status === 'fulfilled') {
        setMarketData(marketResponse?.value?.data || []);
      }
    } catch (error) {
      console.log('Dashboard data load error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIBKRConnectionChange = (connection) => {
    setIBKRConnection(connection);
  };

  const handleIBKRConfigSave = (connection) => {
    setIBKRConnection(connection);
    // Refresh dashboard data to update IBKR status
    loadDashboardData();
  };

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
      
      // Auto-refresh dashboard every 30 seconds
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-foreground mb-2 font-heading">
                Chargement du tableau de bord...
              </h2>
              <p className="text-muted-foreground font-body">
                Récupération des données de marché et du système
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-heading">
                Tableau de Bord Trading
              </h1>
              <p className="text-muted-foreground font-body">
                {user ? `Bienvenue, ${userProfile?.full_name || user?.email}` : 'Bienvenue sur votre plateforme de trading'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <MarketStatusBadge showCountdown={true} />
              
              {/* IBKR Connection Status */}
              <div className="flex items-center space-x-2 border-l border-border pl-4">
                <IBKRConnectionStatus 
                  showDetails={false}
                  onConnectionChange={handleIBKRConnectionChange}
                  className="bg-card/80 px-3 py-2 rounded-lg border border-border"
                />
                <button
                  onClick={() => setShowIBKRConfig(true)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Configurer IBKR"
                >
                  <Settings size={18} className="text-muted-foreground" />
                </button>
              </div>

              {systemHealth?.overallStatus && (
                <div className={`flex items-center px-3 py-2 rounded-lg border ${
                  systemHealth?.overallStatus === 'online' ? 'bg-success/20 text-success border-success/30'
                    : systemHealth?.overallStatus === 'degraded' ? 'bg-warning/20 text-warning border-warning/30' : 'bg-error/20 text-error border-error/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    systemHealth?.overallStatus === 'online' ? 'bg-success animate-pulse' : 'bg-current'
                  }`}></div>
                  <span className="text-sm font-medium font-data">
                    Système {systemHealth?.overallStatus === 'online' ? 'Opérationnel' : 
                            systemHealth?.overallStatus === 'degraded' ? 'Dégradé' : 'Hors ligne'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Cards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Row - Balance and System Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BalanceCard 
                userProfile={userProfile} 
                balance={userProfile?.balance || 0}
                pnl={userProfile?.pnl || 0}
                pnlPercentage={userProfile?.pnlPercentage || 0}
              />
              <SystemHealthCard systemHealth={systemHealth} />
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 gap-6">
              <ChartCard 
                title="Aperçu du Marché"
                symbols={defaultSymbols}
                data={marketData}
                chartData={marketData}
                selectedSymbol={defaultSymbols?.[0]}
                height="400px"
              />
            </div>

            {/* News Panel */}
            <NewsPanel 
              symbols={defaultSymbols} 
              maxItems={4}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <QuickActionsCard recentTrades={userProfile?.recentTrades || []} />

            {/* Watchlist */}
            <WatchlistCard 
              symbols={defaultSymbols}
              data={marketData}
            />

            {/* IBKR Connection Details */}
            {ibkrConnection && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
                <h2 className="text-lg font-semibold text-foreground font-heading mb-4">
                  Connexion IBKR
                </h2>
                <IBKRConnectionStatus 
                  showDetails={true}
                  onConnectionChange={handleIBKRConnectionChange}
                />
              </div>
            )}

            {/* Market Overview */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
              <h2 className="text-lg font-semibold text-foreground font-heading mb-4">
                Aperçu Marché
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">API Latence</span>
                  <span className="text-sm font-semibold text-foreground font-data">
                    {systemHealth?.apiLatency}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Connexions Actives</span>
                  <span className="text-sm font-semibold text-foreground font-data">
                    {systemHealth?.activeConnections}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Fraîcheur Données</span>
                  <span className="text-sm font-semibold text-foreground font-data">
                    {systemHealth?.dataFreshness}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Agents IA Actifs</span>
                  <span className="text-sm font-semibold text-foreground font-data">
                    {systemHealth?.agents?.filter(a => a?.status === 'online')?.length || 0}/
                    {systemHealth?.agents?.length || 0}
                  </span>
                </div>
                
                {/* IBKR Status */}
                {systemHealth?.ibkr && (
                  <>
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground font-body">IBKR Paper</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            systemHealth?.ibkr?.gateway_paper?.status === 'available' ? 'bg-success' : 'bg-muted-foreground'
                          }`}></div>
                          <span className="text-xs text-muted-foreground font-data">
                            {systemHealth?.ibkr?.gateway_paper?.endpoint}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-body">IBKR Live</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          systemHealth?.ibkr?.gateway_live?.status === 'available' ? 'bg-success' : 'bg-muted-foreground'
                        }`}></div>
                        <span className="text-xs text-muted-foreground font-data">
                          {systemHealth?.ibkr?.gateway_live?.endpoint}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Data Providers Status */}
              <div className="mt-6 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground font-body mb-3">
                  Fournisseurs de Données
                </h3>
                <div className="space-y-2">
                  {systemHealth?.dataProviders?.slice(0, 3)?.map((provider, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-foreground font-body">
                        {provider?.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          provider?.status === 'online' ? 'bg-success animate-pulse' : 'bg-error'
                        }`}></div>
                        <span className="text-xs text-muted-foreground font-data">
                          {provider?.uptime?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* IBKR Configuration Modal */}
      <IBKRConfigModal
        isOpen={showIBKRConfig}
        onClose={() => setShowIBKRConfig(false)}
        onSave={handleIBKRConfigSave}
      />
    </div>
  );
};

export default DashboardPage;