import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import NotificationToast from '../../components/ui/NotificationToast';
import OrderEntry from './components/OrderEntry';
import TradeJournal from './components/TradeJournal';
import PositionTracker from './components/PositionTracker';
import QuickActions from './components/QuickActions';
import * as paperTradingService from '../../services/paperTradingService';
import PaperModeBanner from '../../components/ui/PaperModeBanner';

const PaperTrading = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [portfolio, setPortfolio] = useState(null);
  const [trades, setTrades] = useState([]);
  const [positions, setPositions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('order');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState('paper-trading');

  // Mock current prices - In production, this would come from real market data
  const [currentPrices, setCurrentPrices] = useState({
    'AAPL': 176.80,
    'GOOGL': 142.56,
    'MSFT': 378.85,
    'TSLA': 248.42,
    'NVDA': 875.30,
    'AMZN': 145.86,
    'META': 484.20,
    'NFLX': 487.55
  });

  // Initialize user data when auth is ready
  useEffect(() => {
    if (authLoading || !user) return;
    
    initializePaperTrading();
  }, [user, authLoading]);

  const initializePaperTrading = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get or create default portfolio
      let userPortfolio = await paperTradingService?.getDefaultPortfolio(user?.id);
      if (!userPortfolio) {
        userPortfolio = await paperTradingService?.createDefaultPortfolio(user?.id);
        if (!userPortfolio) {
          throw new Error('Failed to create default portfolio');
        }
      }
      setPortfolio(userPortfolio);

      // Load user data
      const [userTrades, userPositions] = await Promise.all([
        paperTradingService?.getUserTrades(user?.id),
        paperTradingService?.getUserPositions(user?.id)
      ]);

      setTrades(userTrades || []);
      setPositions(userPositions || []);

    } catch (error) {
      setError('Cannot connect to database. Your Supabase project may be paused or inactive. Please check your Supabase dashboard.');
      
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to load trading data. Please check your internet connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulate price updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrices(prev => {
        const updated = { ...prev };
        Object.keys(updated)?.forEach(symbol => {
          const change = (Math.random() - 0.5) * 0.02; // ±1% change
          updated[symbol] = Math.max(0.01, updated?.[symbol] * (1 + change));
        });
        return updated;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Update position prices when market prices change
  useEffect(() => {
    if (!positions?.length || !user) return;

    const updatePrices = async () => {
      const updatedPositions = await paperTradingService?.updatePositionPrices(positions, currentPrices);
      if (updatedPositions?.length > 0) {
        setPositions(updatedPositions);
      }
    };

    updatePrices();
  }, [currentPrices, positions?.length, user]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date()?.toISOString(),
      ...notification
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  const handlePlaceOrder = async (orderData) => {
    if (!user || !portfolio) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to place orders'
      });
      return;
    }

    try {
      const orderValue = orderData?.quantity * orderData?.price;

      // Check sufficient balance for buy orders
      if (orderData?.side === 'buy' && orderValue > portfolio?.cash_balance) {
        addNotification({
          type: 'error',
          title: 'Insufficient Balance',
          message: `Required: ${orderValue?.toFixed(2)} CHF, Available: ${portfolio?.cash_balance?.toFixed(2)} CHF`
        });
        return;
      }

      // Get or create asset
      const asset = await paperTradingService?.createAssetIfNotExists({
        symbol: orderData?.symbol,
        name: `${orderData?.symbol} Inc.`,
        asset_type: 'stock',
        exchange: 'NASDAQ',
        currency: 'USD'
      });

      if (!asset) {
        throw new Error('Failed to create or retrieve asset');
      }

      // Place order
      const order = await paperTradingService?.placeOrder(
        orderData,
        user?.id,
        portfolio?.id,
        asset?.id
      );

      if (!order) {
        throw new Error('Failed to place order');
      }

      // Create trade record
      const trade = await paperTradingService?.createTrade(
        orderData,
        user?.id,
        portfolio?.id,
        asset?.id,
        order?.id
      );

      // Update portfolio balance
      const newBalance = orderData?.side === 'buy' 
        ? portfolio?.cash_balance - orderValue
        : portfolio?.cash_balance + orderValue;

      const updatedPortfolio = await paperTradingService?.updatePortfolioBalance(portfolio?.id, newBalance);
      if (updatedPortfolio) {
        setPortfolio(updatedPortfolio);
      }

      // Update position
      const positionData = {
        quantity: orderData?.side === 'buy' ? orderData?.quantity : -orderData?.quantity,
        entry_price: orderData?.price,
        current_price: orderData?.price
      };

      const position = await paperTradingService?.upsertPosition(
        positionData,
        user?.id,
        portfolio?.id,
        asset?.id
      );

      // Refresh data
      const [updatedTrades, updatedPositions] = await Promise.all([
        paperTradingService?.getUserTrades(user?.id),
        paperTradingService?.getUserPositions(user?.id)
      ]);

      setTrades(updatedTrades || []);
      setPositions(updatedPositions || []);

      addNotification({
        type: 'success',
        title: 'Order Executed',
        message: `${orderData?.side === 'buy' ? 'Bought' : 'Sold'} ${orderData?.quantity} ${orderData?.symbol} at ${orderData?.price?.toFixed(2)} CHF`
      });

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message: error?.message || 'Failed to execute order. Please try again.'
      });
    }
  };

  const handleClosePosition = async (symbol) => {
    if (!user || !portfolio) return;

    const position = positions?.find(p => p?.assets?.symbol === symbol);
    if (!position) return;

    const currentPrice = currentPrices?.[symbol];
    const orderData = {
      symbol,
      side: 'sell',
      quantity: position?.quantity,
      price: currentPrice,
      type: 'market'
    };

    await handlePlaceOrder(orderData);
  };

  const handleExportCSV = async () => {
    if (!user) return;

    try {
      const csvContent = await paperTradingService?.exportTradingHistory(user?.id);
      if (!csvContent) {
        addNotification({
          type: 'info',
          title: 'No Data',
          message: 'No trading history to export'
        });
        return;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link?.setAttribute('href', url);
      link?.setAttribute('download', `trading-history-${new Date()?.toISOString()?.split('T')?.[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);

      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: 'Trading history exported to CSV'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export trading history'
      });
    }
  };

  const handleResetPortfolio = async () => {
    if (!user) return;

    try {
      const success = await paperTradingService?.resetPaperTradingData(user?.id);
      if (success) {
        // Refresh all data
        await initializePaperTrading();
        
        addNotification({
          type: 'success',
          title: 'Portfolio Reset',
          message: 'Your portfolio has been reset to 100,000 CHF'
        });
      } else {
        throw new Error('Reset failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: 'Failed to reset portfolio. Please try again.'
      });
    }
  };

  const handleSetAlert = (alertData) => {
    // This would integrate with the alerts table in production
    addNotification({
      type: 'info',
      title: 'Alert Set',
      message: `Alert created for ${alertData?.symbol} at ${alertData?.targetPrice?.toFixed(2)} CHF (alerts feature coming soon)`
    });
  };

  const getTotalPortfolioValue = () => {
    if (!portfolio) return 0;
    
    const positionsValue = positions?.reduce((total, position) => {
      const currentPrice = currentPrices?.[position?.assets?.symbol] || position?.avg_entry_price;
      return total + (currentPrice * position?.quantity);
    }, 0);
    
    return portfolio?.cash_balance + positionsValue;
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your paper trading portfolio...</p>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="pt-16 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access your paper trading portfolio and start virtual trading.</p>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">Demo Features Available:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Virtual trading with $100,000 starting balance</li>
                <li>• Real-time portfolio tracking</li>
                <li>• Trade journal and history</li>
                <li>• Position management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="pt-16 flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-destructive mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Connection Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location?.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'order', label: 'Order', icon: 'TrendingUp' },
    { id: 'positions', label: 'Positions', icon: 'PieChart' },
    { id: 'journal', label: 'Journal', icon: 'BookOpen' },
    { id: 'actions', label: 'Actions', icon: 'Zap' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <PaperModeBanner />
      </div>

      <Helmet>
        <title>Paper Trading - Rocket Trading MVP</title>
        <meta name="description" content="Virtual trading platform with real-time order execution, position tracking, and trade journaling" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground font-heading mb-2">
                Paper Trading
              </h1>
              <p className="text-muted-foreground font-body">
                Virtual trading platform • Balance: {portfolio?.cash_balance?.toFixed(2)} CHF • 
                Total Value: {getTotalPortfolioValue()?.toFixed(2)} CHF
              </p>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Left Column - Order Entry & Quick Actions */}
              <div className="lg:col-span-3 space-y-6">
                <OrderEntry
                  onPlaceOrder={handlePlaceOrder}
                  selectedSymbol={selectedSymbol}
                  currentPrice={currentPrices?.[selectedSymbol]}
                  availableSymbols={Object.keys(currentPrices)}
                  onSymbolChange={setSelectedSymbol}
                  disabled={!user}
                />
                
                <QuickActions
                  balance={portfolio?.cash_balance || 0}
                  totalValue={getTotalPortfolioValue()}
                  onResetPortfolio={handleResetPortfolio}
                  onSetAlert={handleSetAlert}
                  selectedSymbol={selectedSymbol}
                  currentPrice={currentPrices?.[selectedSymbol]}
                  disabled={!user}
                />
              </div>

              {/* Center Column - Trade Journal */}
              <div className="lg:col-span-6">
                <TradeJournal
                  trades={trades}
                  onExportCSV={handleExportCSV}
                  loading={loading}
                />
              </div>

              {/* Right Column - Position Tracker */}
              <div className="lg:col-span-3">
                <PositionTracker
                  positions={positions}
                  onClosePosition={handleClosePosition}
                  currentPrices={currentPrices}
                  loading={loading}
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
              {/* Mobile Tab Navigation */}
              <div className="flex overflow-x-auto mb-6 bg-card rounded-2xl border border-border">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-3 min-w-0 flex-1 transition-trading-fast ${
                      activeTab === tab?.id
                        ? 'text-primary bg-primary/10 border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-sm font-medium font-body truncate">
                      {tab?.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Mobile Tab Content */}
              <div className="space-y-6">
                {activeTab === 'order' && (
                  <OrderEntry
                    onPlaceOrder={handlePlaceOrder}
                    selectedSymbol={selectedSymbol}
                    currentPrice={currentPrices?.[selectedSymbol]}
                    availableSymbols={Object.keys(currentPrices)}
                    onSymbolChange={setSelectedSymbol}
                    disabled={!user}
                  />
                )}
                
                {activeTab === 'positions' && (
                  <PositionTracker
                    positions={positions}
                    onClosePosition={handleClosePosition}
                    currentPrices={currentPrices}
                    loading={loading}
                  />
                )}
                
                {activeTab === 'journal' && (
                  <TradeJournal
                    trades={trades}
                    onExportCSV={handleExportCSV}
                    loading={loading}
                  />
                )}
                
                {activeTab === 'actions' && (
                  <QuickActions
                    balance={portfolio?.cash_balance || 0}
                    totalValue={getTotalPortfolioValue()}
                    onResetPortfolio={handleResetPortfolio}
                    onSetAlert={handleSetAlert}
                    selectedSymbol={selectedSymbol}
                    currentPrice={currentPrices?.[selectedSymbol]}
                    disabled={!user}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        <NotificationToast
          notifications={notifications}
          onDismiss={dismissNotification}
          position="top-right"
          autoHideDuration={5000}
        />
      </div>
    </div>
  );
};

export default PaperTrading;