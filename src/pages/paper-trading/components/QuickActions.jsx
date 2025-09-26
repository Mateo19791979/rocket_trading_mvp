import React, { useState } from 'react';
import { Zap, RefreshCw, Bell, DollarSign, TrendingUp } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const QuickActions = ({ 
  balance = 0, 
  totalValue = 0, 
  onResetPortfolio, 
  onSetAlert, 
  selectedSymbol, 
  currentPrice,
  disabled = false 
}) => {
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertData, setAlertData] = useState({
    symbol: selectedSymbol || 'AAPL',
    targetPrice: currentPrice || 0,
    condition: 'above'
  });
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPortfolio = async () => {
    if (disabled) return;
    
    setIsResetting(true);
    try {
      await onResetPortfolio?.();
    } finally {
      setIsResetting(false);
    }
  };

  const handleSetAlert = (e) => {
    e?.preventDefault();
    if (disabled) return;
    
    onSetAlert?.(alertData);
    setShowAlertForm(false);
    setAlertData({
      symbol: selectedSymbol || 'AAPL',
      targetPrice: currentPrice || 0,
      condition: 'above'
    });
  };

  const getTotalPnL = () => {
    return totalValue - balance;
  };

  const getTotalPnLPercent = () => {
    if (balance <= 0) return 0;
    return ((totalValue - 100000) / 100000) * 100; // Assuming 100k starting balance
  };

  const getPnLColor = (pnl) => {
    return pnl >= 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-primary" />
        Quick Actions
      </h3>
      {disabled && (
        <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            Sign in to access portfolio actions
          </p>
        </div>
      )}
      {/* Portfolio Summary */}
      <div className="bg-muted/25 rounded-lg p-4 mb-6 border border-border/50">
        <h4 className="font-medium text-foreground mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          Portfolio Summary
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cash Balance:</span>
            <span className="font-mono text-foreground">{balance?.toFixed(2)} CHF</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Value:</span>
            <span className="font-mono font-semibold text-foreground">{totalValue?.toFixed(2)} CHF</span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-border/30">
            <span className="text-sm text-muted-foreground">Total Return:</span>
            <div className="text-right">
              <div className={`font-mono font-semibold ${getPnLColor(getTotalPnL())}`}>
                {getTotalPnL() >= 0 ? '+' : ''}{getTotalPnL()?.toFixed(2)} CHF
              </div>
              <div className={`text-xs ${getPnLColor(getTotalPnL())}`}>
                ({getTotalPnL() >= 0 ? '+' : ''}{getTotalPnLPercent()?.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {/* Reset Portfolio */}
        <div className="border border-border/50 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2 flex items-center">
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset Portfolio
          </h5>
          <p className="text-sm text-muted-foreground mb-3">
            Clear all positions and reset balance to 100,000 CHF
          </p>
          <Button
            onClick={handleResetPortfolio}
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive/10"
            disabled={disabled || isResetting}
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Portfolio
              </>
            )}
          </Button>
        </div>

        {/* Price Alerts */}
        <div className="border border-border/50 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2 flex items-center">
            <Bell className="w-4 h-4 mr-1" />
            Price Alerts
          </h5>
          
          {!showAlertForm ? (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                Set price alerts for your watchlist symbols
              </p>
              <Button
                onClick={() => setShowAlertForm(true)}
                variant="outline"
                className="w-full"
                disabled={disabled}
              >
                <Bell className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </>
          ) : (
            <form onSubmit={handleSetAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Symbol
                </label>
                <Input
                  type="text"
                  value={alertData?.symbol}
                  onChange={(e) => setAlertData(prev => ({ ...prev, symbol: e?.target?.value }))}
                  placeholder="e.g., AAPL"
                  className="text-sm"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Target Price (CHF)
                </label>
                <Input
                  type="number"
                  value={alertData?.targetPrice}
                  onChange={(e) => setAlertData(prev => ({ ...prev, targetPrice: parseFloat(e?.target?.value) || 0 }))}
                  step="0.01"
                  min="0"
                  className="text-sm"
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Condition
                </label>
                <select
                  value={alertData?.condition}
                  onChange={(e) => setAlertData(prev => ({ ...prev, condition: e?.target?.value }))}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                  disabled={disabled}
                >
                  <option value="above">Price rises above</option>
                  <option value="below">Price falls below</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" size="sm" className="flex-1" disabled={disabled}>
                  Set Alert
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAlertForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Market Info */}
        <div className="border border-border/50 rounded-lg p-4">
          <h5 className="font-medium text-foreground mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Market Info
          </h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market Status:</span>
              <span className="text-success font-medium">Open</span>
            </div>
            {selectedSymbol && currentPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{selectedSymbol} Price:</span>
                <span className="font-mono text-foreground">{currentPrice?.toFixed(2)} CHF</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Update:</span>
              <span className="text-muted-foreground">{new Date()?.toLocaleTimeString('fr-CH', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;