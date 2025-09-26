import React from 'react';
import { BookOpen, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TradeJournal = ({ trades = [], onExportCSV, loading = false }) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleTimeString('fr-CH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTradingSideColor = (side) => {
    return side === 'buy' ? 'text-success' : 'text-destructive';
  };

  const getTradingSideIcon = (side) => {
    return side === 'buy' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-primary" />
          Trade Journal
        </h3>
        
        <Button
          onClick={onExportCSV}
          variant="outline"
          size="sm"
          disabled={!trades?.length || loading}
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading trades...</span>
        </div>
      ) : !trades?.length ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No trades yet</h4>
          <p className="text-muted-foreground">
            Your trade history will appear here after you place your first order
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground pb-2">Date</th>
                    <th className="text-left font-medium text-muted-foreground pb-2">Time</th>
                    <th className="text-left font-medium text-muted-foreground pb-2">Symbol</th>
                    <th className="text-left font-medium text-muted-foreground pb-2">Side</th>
                    <th className="text-right font-medium text-muted-foreground pb-2">Qty</th>
                    <th className="text-right font-medium text-muted-foreground pb-2">Price</th>
                    <th className="text-right font-medium text-muted-foreground pb-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {trades?.map((trade) => {
                    const SideIcon = getTradingSideIcon(trade?.trade_side);
                    
                    return (
                      <tr key={trade?.id} className="border-b border-border/50 hover:bg-muted/25 transition-colors">
                        <td className="py-3 text-foreground">
                          {formatDate(trade?.executed_at)}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {formatTime(trade?.executed_at)}
                        </td>
                        <td className="py-3">
                          <span className="font-medium text-foreground">
                            {trade?.assets?.symbol || trade?.symbol}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className={`flex items-center ${getTradingSideColor(trade?.trade_side)}`}>
                            <SideIcon className="w-4 h-4 mr-1" />
                            <span className="capitalize font-medium">
                              {trade?.trade_side === 'buy' ? 'Buy' : 'Sell'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-medium text-foreground">
                          {trade?.quantity?.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-mono text-foreground">
                          {trade?.price?.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-mono font-medium text-foreground">
                          {trade?.trade_value?.toFixed(2)} CHF
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {trades?.map((trade) => {
              const SideIcon = getTradingSideIcon(trade?.trade_side);
              
              return (
                <div key={trade?.id} className="bg-muted/25 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground">
                        {trade?.assets?.symbol || trade?.symbol}
                      </span>
                      <div className={`flex items-center ${getTradingSideColor(trade?.trade_side)}`}>
                        <SideIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium capitalize">
                          {trade?.trade_side === 'buy' ? 'Buy' : 'Sell'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(trade?.executed_at)} • {formatTime(trade?.executed_at)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Quantity</div>
                      <div className="font-medium text-foreground">
                        {trade?.quantity?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Price</div>
                      <div className="font-mono text-foreground">
                        {trade?.price?.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-mono font-medium text-foreground">
                        {trade?.trade_value?.toFixed(2)} CHF
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          {trades?.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/25 rounded-lg p-4 text-center border border-border/50">
                <div className="text-2xl font-bold text-foreground">
                  {trades?.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Trades</div>
              </div>
              
              <div className="bg-muted/25 rounded-lg p-4 text-center border border-border/50">
                <div className="text-2xl font-bold text-success">
                  {trades?.filter(t => t?.trade_side === 'buy')?.length}
                </div>
                <div className="text-sm text-muted-foreground">Buy Orders</div>
              </div>
              
              <div className="bg-muted/25 rounded-lg p-4 text-center border border-border/50">
                <div className="text-2xl font-bold text-destructive">
                  {trades?.filter(t => t?.trade_side === 'sell')?.length}
                </div>
                <div className="text-sm text-muted-foreground">Sell Orders</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradeJournal;