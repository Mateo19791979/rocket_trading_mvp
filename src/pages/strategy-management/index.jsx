import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import NotificationToast from '../../components/ui/NotificationToast';
import StrategyCard from './components/StrategyCard';
import MovingAverageConfig from './components/MovingAverageConfig';
import RSIConfig from './components/RSIConfig';
import BacktestResults from './components/BacktestResults';
import StrategySuggestions from './components/StrategySuggestions';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const StrategyManagement = () => {
  const [activeTab, setActiveTab] = useState('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [configMode, setConfigMode] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Mock strategies data
  const strategies = [
    {
      id: 1,
      name: "Croisement MA",
      description: "Stratégie basée sur le croisement de moyennes mobiles courtes et longues",
      icon: "TrendingUp",
      status: "active",
      performance: 8.5,
      totalTrades: 23,
      winRate: 65.2,
      maxDrawdown: 4.2,
      config: {
        shortPeriod: 10,
        longPeriod: 20,
        symbol: 'SPY',
        timeframe: '1h'
      }
    },
    {
      id: 2,
      name: "RSI Contrarian",
      description: "Stratégie de retour à la moyenne utilisant l\'indice RSI",
      icon: "Activity",
      status: "inactive",
      performance: 12.3,
      totalTrades: 45,
      winRate: 71.1,
      maxDrawdown: 6.8,
      config: {
        period: 14,
        overboughtLevel: 70,
        oversoldLevel: 30,
        symbol: 'QQQ',
        timeframe: '4h'
      }
    },
    {
      id: 3,
      name: "Breakout Volume",
      description: "Stratégie de cassure avec confirmation de volume",
      icon: "BarChart3",
      status: "backtesting",
      performance: -2.1,
      totalTrades: 12,
      winRate: 41.7,
      maxDrawdown: 8.5,
      config: {
        volumeThreshold: 1.5,
        breakoutPeriod: 20,
        symbol: 'STLA',
        timeframe: '1d'
      }
    }
  ];

  const tabs = [
    { id: 'strategies', label: 'Mes Stratégies', icon: 'Target' },
    { id: 'suggestions', label: 'Suggestions', icon: 'Lightbulb' },
    { id: 'backtest', label: 'Backtesting', icon: 'BarChart3' }
  ];

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev?.filter(notification => notification?.id !== id));
  };

  const handleConfigureStrategy = (strategy) => {
    setSelectedStrategy(strategy);
    if (strategy?.name?.includes('MA')) {
      setConfigMode('ma');
    } else if (strategy?.name?.includes('RSI')) {
      setConfigMode('rsi');
    }
  };

  const handleBacktestStrategy = (strategy) => {
    setSelectedStrategy(strategy);
    setBacktestResults({
      strategy: strategy,
      startDate: '2024-01-01',
      endDate: '2024-09-22',
      initialCapital: 100000
    });
    addNotification({
      type: 'info',
      title: 'Backtest lancé',
      message: `Analyse de la stratégie ${strategy?.name} en cours...`
    });
  };

  const handleApplyStrategy = (strategy) => {
    const updatedStrategies = strategies?.map(s => 
      s?.id === strategy?.id 
        ? { ...s, status: s?.status === 'active' ? 'inactive' : 'active' }
        : { ...s, status: 'inactive' }
    );
    
    addNotification({
      type: 'success',
      title: 'Stratégie appliquée',
      message: `La stratégie ${strategy?.name} est maintenant ${strategy?.status === 'active' ? 'arrêtée' : 'active'}.`
    });
  };

  const handleSaveConfig = (updatedStrategy) => {
    addNotification({
      type: 'success',
      title: 'Configuration sauvegardée',
      message: `Les paramètres de ${updatedStrategy?.name} ont été mis à jour.`
    });
    setConfigMode(null);
    setSelectedStrategy(null);
  };

  const handleCancelConfig = () => {
    setConfigMode(null);
    setSelectedStrategy(null);
  };

  const handleApplySuggestion = (suggestion) => {
    addNotification({
      type: 'info',
      title: 'Suggestion appliquée',
      message: `Configuration de la stratégie ${suggestion?.name} en cours...`
    });
  };

  const renderTabContent = () => {
    if (configMode === 'ma') {
      return (
        <MovingAverageConfig
          strategy={selectedStrategy}
          onSave={handleSaveConfig}
          onCancel={handleCancelConfig}
        />
      );
    }

    if (configMode === 'rsi') {
      return (
        <RSIConfig
          strategy={selectedStrategy}
          onSave={handleSaveConfig}
          onCancel={handleCancelConfig}
        />
      );
    }

    if (backtestResults) {
      return (
        <BacktestResults
          strategy={selectedStrategy}
          results={backtestResults}
          onClose={() => {
            setBacktestResults(null);
            setSelectedStrategy(null);
          }}
          onApplyStrategy={handleApplyStrategy}
        />
      );
    }

    switch (activeTab) {
      case 'strategies':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground font-heading">
                  Mes Stratégies de Trading
                </h2>
                <p className="text-sm text-muted-foreground font-body">
                  Gérez et configurez vos stratégies automatisées
                </p>
              </div>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
              >
                Nouvelle Stratégie
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {strategies?.map((strategy) => (
                <StrategyCard
                  key={strategy?.id}
                  strategy={strategy}
                  onConfigure={handleConfigureStrategy}
                  onBacktest={handleBacktestStrategy}
                  onApply={handleApplyStrategy}
                  isActive={strategy?.status === 'active'}
                />
              ))}
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Target" size={16} className="text-primary" />
                  <span className="text-xs text-muted-foreground font-body">
                    Stratégies Actives
                  </span>
                </div>
                <div className="text-2xl font-semibold text-foreground font-data">1</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="TrendingUp" size={16} className="text-success" />
                  <span className="text-xs text-muted-foreground font-body">
                    Performance Moy.
                  </span>
                </div>
                <div className="text-2xl font-semibold text-success font-data">+6.2%</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="BarChart3" size={16} className="text-warning" />
                  <span className="text-xs text-muted-foreground font-body">
                    Total Trades
                  </span>
                </div>
                <div className="text-2xl font-semibold text-foreground font-data">80</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Percent" size={16} className="text-secondary" />
                  <span className="text-xs text-muted-foreground font-body">
                    Taux de Réussite
                  </span>
                </div>
                <div className="text-2xl font-semibold text-foreground font-data">59.2%</div>
              </div>
            </div>
          </div>
        );

      case 'suggestions':
        return <StrategySuggestions onApplySuggestion={handleApplySuggestion} />;

      case 'backtest':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground font-heading">
                Centre de Backtesting
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                Testez vos stratégies sur des données historiques
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-center py-12">
                <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground font-heading mb-2">
                  Sélectionnez une stratégie à tester
                </h3>
                <p className="text-sm text-muted-foreground font-body mb-6">
                  Choisissez une stratégie depuis l'onglet "Mes Stratégies" pour lancer un backtest
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('strategies')}
                  iconName="ArrowLeft"
                  iconPosition="left"
                >
                  Retour aux Stratégies
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Stratégies - Rocket Trading MVP</title>
        <meta name="description" content="Configurez, testez et appliquez vos stratégies de trading automatisées" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Tab Navigation */}
            {!configMode && !backtestResults && (
              <div className="flex items-center space-x-1 mb-8 bg-card border border-border rounded-xl p-1">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-trading-fast font-medium text-sm ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground shadow-trading'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span className="font-body">{tab?.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>

        <NotificationToast
          notifications={notifications}
          onDismiss={handleDismissNotification}
          position="top-right"
        />
      </div>
    </>
  );
};

export default StrategyManagement;