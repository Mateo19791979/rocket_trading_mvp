import React from 'react';
import { PieChart, TrendingUp, TrendingDown, X } from 'lucide-react';
import Button from '../../../components/ui/Button';

const PositionTracker = ({ positions = [], onClosePosition, currentPrices = {}, loading = false }) => {

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00';
    return amount?.toFixed(2);
  };

  const formatPercent = (percent) => {
    if (typeof percent !== 'number') return '0.00';
    return percent?.toFixed(2);
  };

  const getPnLColor = (pnl) => {
    if (typeof pnl !== 'number') return 'text-muted-foreground';
    return pnl >= 0 ? 'text-success' : 'text-destructive';
  };

  const getPnLIcon = (pnl) => {
    if (typeof pnl !== 'number') return TrendingUp;
    return pnl >= 0 ? TrendingUp : TrendingDown;
  };

  const calculateCurrentValue = (position) => {
    const currentPrice = currentPrices?.[position?.assets?.symbol] || position?.current_price || position?.avg_entry_price;
    return position?.quantity * currentPrice;
  };

  const calculateUnrealizedPnL = (position) => {
    const currentPrice = currentPrices?.[position?.assets?.symbol] || position?.current_price || position?.avg_entry_price;
    const currentValue = position?.quantity * currentPrice;
    const costBasis = position?.quantity * position?.avg_entry_price;
    return currentValue - costBasis;
  };

  const calculateUnrealizedPnLPercent = (position) => {
    const currentPrice = currentPrices?.[position?.assets?.symbol] || position?.current_price || position?.avg_entry_price;
    if (!position?.avg_entry_price) return 0;
    return ((currentPrice - position?.avg_entry_price) / position?.avg_entry_price) * 100;
  };

  const getTotalPortfolioValue = () => {
    return positions?.reduce((total, position) => {
      return total + calculateCurrentValue(position);
    }, 0);
  };

  const getTotalUnrealizedPnL = () => {
    return positions?.reduce((total, position) => {
      return total + calculateUnrealizedPnL(position);
    }, 0);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-primary" />
          Positions
        </h3>
        
        {positions?.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {positions?.length} open position{positions?.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading positions...</span>
        </div>
      ) : !positions?.length ? (
        <div className="text-center py-12">
          <PieChart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No open positions</h4>
          <p className="text-muted-foreground text-sm">
            Your portfolio positions will appear here after you execute trades
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Portfolio Summary */}
          <div className="bg-muted/25 rounded-lg p-4 border border-border/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
                <div className="text-lg font-bold text-foreground">
                  {formatCurrency(getTotalPortfolioValue())} CHF
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Unrealized P&L</div>
                <div className={`text-lg font-bold flex items-center ${getPnLColor(getTotalUnrealizedPnL())}`}>
                  {React.createElement(getPnLIcon(getTotalUnrealizedPnL()), { className: 'w-4 h-4 mr-1' })}
                  {getTotalUnrealizedPnL() >= 0 ? '+' : ''}{formatCurrency(getTotalUnrealizedPnL())} CHF
                </div>
              </div>
            </div>
          </div>

          {/* Position Cards */}
          <div className="space-y-3">
            {positions?.map((position) => {
              const currentPrice = currentPrices?.[position?.assets?.symbol] || position?.current_price || position?.avg_entry_price;
              const currentValue = calculateCurrentValue(position);
              const unrealizedPnL = calculateUnrealizedPnL(position);
              const unrealizedPnLPercent = calculateUnrealizedPnLPercent(position);
              const PnLIcon = getPnLIcon(unrealizedPnL);

              return (
                <div key={position?.id} className="bg-muted/25 rounded-lg p-4 border border-border/50">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-foreground">
                        {position?.assets?.symbol}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {position?.assets?.name}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => onClosePosition?.(position?.assets?.symbol)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  </div>

                  {/* Position Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Quantity</div>
                      <div className="font-medium text-foreground">
                        {position?.quantity?.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground mb-1">Avg Price</div>
                      <div className="font-mono text-foreground">
                        {formatCurrency(position?.avg_entry_price)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground mb-1">Current Price</div>
                      <div className="font-mono text-foreground">
                        {formatCurrency(currentPrice)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-muted-foreground mb-1">Market Value</div>
                      <div className="font-mono text-foreground">
                        {formatCurrency(currentValue)} CHF
                      </div>
                    </div>
                  </div>

                  {/* P&L Section */}
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-muted-foreground text-sm mb-1">Unrealized P&L</div>
                        <div className={`flex items-center font-semibold ${getPnLColor(unrealizedPnL)}`}>
                          <PnLIcon className="w-4 h-4 mr-1" />
                          {unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(unrealizedPnL)} CHF
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-muted-foreground text-sm mb-1">Return %</div>
                        <div className={`flex items-center font-semibold ${getPnLColor(unrealizedPnL)}`}>
                          <PnLIcon className="w-4 h-4 mr-1" />
                          {unrealizedPnL >= 0 ? '+' : ''}{formatPercent(unrealizedPnLPercent)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Position Type Indicator */}
                  <div className="mt-2 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      Opened: {new Date(position?.opened_at || position?.created_at)?.toLocaleDateString('fr-CH')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      position?.position_type === 'long' ?'bg-success/10 text-success' :'bg-destructive/10 text-destructive'
                    }`}>
                      {position?.position_type?.toUpperCase() || 'LONG'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground text-center">
              Prices update automatically every 10 seconds
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionTracker;