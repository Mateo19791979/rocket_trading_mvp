import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import NotificationToast from '../../components/ui/NotificationToast';
import SearchBar from './components/SearchBar';
import MarketFilters from './components/MarketFilters';
import QuotesTable from './components/QuotesTable';
import SymbolDetailPanel from './components/SymbolDetailPanel';
import OrderModal from './components/OrderModal';

const MarketAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    market: 'all',
    sector: 'all',
    priceRange: 'all',
    volume: 'all',
    change: 'all'
  });
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [orderModal, setOrderModal] = useState({ isOpen: false, symbol: null, type: null });
  const [searchHistory, setSearchHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resultCount, setResultCount] = useState(0);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('marketSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (symbol) => {
    const newHistory = [symbol, ...searchHistory?.filter(item => item?.symbol !== symbol?.symbol)]?.slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('marketSearchHistory', JSON.stringify(newHistory));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol);
    saveSearchHistory(symbol);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleBuyClick = (symbol) => {
    setOrderModal({ isOpen: true, symbol, type: 'buy' });
  };

  const handleSellClick = (symbol) => {
    setOrderModal({ isOpen: true, symbol, type: 'sell' });
  };

  const handleAddToWatchlist = (symbol) => {
    // Get existing watchlist from localStorage
    const existingWatchlist = JSON.parse(localStorage.getItem('tradingWatchlist') || '[]');
    
    // Check if symbol already exists
    const symbolExists = existingWatchlist?.some(item => item?.symbol === symbol?.symbol);
    
    if (!symbolExists) {
      const newWatchlist = [...existingWatchlist, {
        ...symbol,
        addedAt: new Date()?.toISOString()
      }];
      localStorage.setItem('tradingWatchlist', JSON.stringify(newWatchlist));
      
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Ajouté à la watchlist',
        message: `${symbol?.symbol} a été ajouté à votre watchlist`,
        timestamp: new Date()
      });
    } else {
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Déjà dans la watchlist',
        message: `${symbol?.symbol} est déjà dans votre watchlist`,
        timestamp: new Date()
      });
    }
  };

  const handleOrderSubmit = (orderData) => {
    // Get existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('paperTradingOrders') || '[]');
    
    // Create new order
    const newOrder = {
      id: Date.now(),
      ...orderData,
      status: 'executed',
      executedAt: new Date()?.toISOString()
    };
    
    // Save to localStorage
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('paperTradingOrders', JSON.stringify(updatedOrders));
    
    // Update portfolio balance
    const currentBalance = parseFloat(localStorage.getItem('portfolioBalance') || '100000');
    const orderTotal = orderData?.total;
    const newBalance = orderData?.side === 'buy' 
      ? currentBalance - orderTotal 
      : currentBalance + orderTotal;
    localStorage.setItem('portfolioBalance', newBalance?.toString());
    
    // Close modal and show notification
    setOrderModal({ isOpen: false, symbol: null, type: null });
    setSelectedSymbol(null);
    
    addNotification({
      id: Date.now(),
      type: 'success',
      title: 'Ordre exécuté',
      message: `Ordre ${orderData?.side === 'buy' ? 'd\'achat' : 'de vente'} de ${orderData?.quantity} ${orderData?.symbol} exécuté avec succès`,
      timestamp: new Date()
    });
  };

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  const handleNotificationDismiss = (id) => {
    setNotifications(prev => prev?.filter(notification => notification?.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-heading">
                Analyse de Marché
              </h1>
              <p className="text-muted-foreground mt-2">
                Recherchez et analysez les instruments financiers en temps réel
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground font-data">
                  Données en temps réel
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex justify-center">
            <SearchBar
              onSearch={handleSearch}
              onSymbolSelect={handleSymbolSelect}
              searchHistory={searchHistory}
            />
          </div>

          {/* Filters */}
          <MarketFilters
            onFiltersChange={handleFiltersChange}
            resultCount={resultCount}
          />

          {/* Quotes Table */}
          <QuotesTable
            searchTerm={searchTerm}
            filters={filters}
            onSymbolSelect={handleSymbolSelect}
            onBuyClick={handleBuyClick}
            onSellClick={handleSellClick}
          />
        </div>
      </main>
      {/* Symbol Detail Panel */}
      {selectedSymbol && (
        <SymbolDetailPanel
          symbol={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
          onBuyClick={handleBuyClick}
          onSellClick={handleSellClick}
          onAddToWatchlist={handleAddToWatchlist}
        />
      )}
      {/* Order Modal */}
      {orderModal?.isOpen && (
        <OrderModal
          symbol={orderModal?.symbol}
          orderType={orderModal?.type}
          onClose={() => setOrderModal({ isOpen: false, symbol: null, type: null })}
          onSubmit={handleOrderSubmit}
        />
      )}
      {/* Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
        position="top-right"
        autoHideDuration={5000}
      />
    </div>
  );
};

export default MarketAnalysis;