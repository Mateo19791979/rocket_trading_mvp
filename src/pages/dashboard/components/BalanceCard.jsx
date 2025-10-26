import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import tradingAccountService from '../../../services/tradingAccountService';
import Icon from '../../../components/AppIcon';

const BalanceCard = () => {
  const { tradingAccount, refreshTradingAccount, isMockMode } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load account statistics
  useEffect(() => {
    const loadAccountStats = async () => {
      if (!tradingAccount?.id) {
        setLoading(false);
        return;
      }

      if (isMockMode) {
        // Mock stats for demo
        setStats({
          currentBalance: 10000.00,
          currency: 'EUR',
          netPnL: 0.00,
          pnlPercentage: 0.00,
          totalTrades: 0,
          accountType: 'demo'
        });
        setLoading(false);
        return;
      }

      try {
        const result = await tradingAccountService?.getAccountStats(tradingAccount?.id);
        if (result?.success) {
          setStats(result?.data);
        } else {
          setError(result?.error);
        }
      } catch (err) {
        console.error('Error loading account stats:', err);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccountStats();
  }, [tradingAccount?.id, isMockMode]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (refreshTradingAccount) {
        refreshTradingAccount();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshTradingAccount]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-red-200 rounded-2xl p-6 shadow-trading">
        <div className="text-center text-red-600">
          <Icon name="AlertTriangle" size={24} className="mx-auto mb-2" />
          <p className="text-sm">Erreur de chargement du solde</p>
        </div>
      </div>
    );
  }

  const currentBalance = stats?.currentBalance || tradingAccount?.balance || 0;
  const currency = stats?.currency || tradingAccount?.currency || 'EUR';
  const pnl = stats?.netPnL || 0;
  const pnlPercentage = stats?.pnlPercentage || 0;
  const isProfitable = pnl >= 0;

  // Format currency
  const formatCurrency = (amount, curr = currency) => {
    const currencyCode = curr === 'EUR' ? 'EUR' : curr === 'USD' ? 'USD' : 'CHF';
    const locale = curr === 'EUR' ? 'fr-FR' : curr === 'USD' ? 'en-US' : 'fr-CH';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(amount);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          Solde Trading
        </h2>
        <div className="flex items-center space-x-2">
          <Icon name="Wallet" size={20} className="text-primary" />
          <span className="text-xs text-muted-foreground font-data">{currency}</span>
          {tradingAccount?.account_type === 'demo' && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              DEMO
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-foreground font-heading">
            {formatCurrency(currentBalance)}
          </div>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Solde disponible pour le trading
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Icon 
              name={isProfitable ? "TrendingUp" : "TrendingDown"} 
              size={16} 
              className={isProfitable ? "text-success" : "text-error"} 
            />
            <span className="text-sm font-medium text-muted-foreground font-body">
              P&L Total
            </span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold font-data ${
              isProfitable ? "text-success" : "text-error"
            }`}>
              {isProfitable ? "+" : ""}{formatCurrency(pnl)}
            </div>
            <div className={`text-sm font-data ${
              isProfitable ? "text-success" : "text-error"
            }`}>
              {isProfitable ? "+" : ""}{pnlPercentage?.toFixed(2)}%
            </div>
          </div>
        </div>

        {stats?.totalTrades > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Trades effectués:</span>
            <span className="font-medium">{stats?.totalTrades}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;