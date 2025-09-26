import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BacktestResults = ({ strategy, results, onClose, onApplyStrategy }) => {
  // Mock backtest data
  const performanceData = [
    { date: '01/09', portfolio: 100000, benchmark: 100000 },
    { date: '05/09', portfolio: 102500, benchmark: 101200 },
    { date: '10/09', portfolio: 98800, benchmark: 99800 },
    { date: '15/09', portfolio: 105200, benchmark: 102100 },
    { date: '20/09', portfolio: 108900, benchmark: 103500 },
    { date: '22/09', portfolio: 112400, benchmark: 104200 }
  ];

  const monthlyReturns = [
    { month: 'Jan', returns: 2.4 },
    { month: 'Fév', returns: -1.2 },
    { month: 'Mar', returns: 4.8 },
    { month: 'Avr', returns: 1.9 },
    { month: 'Mai', returns: -0.8 },
    { month: 'Jun', returns: 3.2 },
    { month: 'Jul', returns: 2.1 },
    { month: 'Aoû', returns: -2.1 },
    { month: 'Sep', returns: 5.2 }
  ];

  const tradeHistory = [
    {
      id: 1,
      date: '15/09/2024',
      symbol: 'SPY',
      type: 'Achat',
      quantity: 50,
      price: 425.60,
      pnl: 1250.00,
      duration: '3j 4h'
    },
    {
      id: 2,
      date: '12/09/2024',
      symbol: 'QQQ',
      type: 'Vente',
      quantity: 30,
      price: 378.90,
      pnl: -450.00,
      duration: '1j 12h'
    },
    {
      id: 3,
      date: '08/09/2024',
      symbol: 'STLA',
      type: 'Achat',
      quantity: 200,
      price: 14.25,
      pnl: 890.00,
      duration: '5j 8h'
    },
    {
      id: 4,
      date: '05/09/2024',
      symbol: 'BTC',
      type: 'Vente',
      quantity: 0.5,
      price: 58420.00,
      pnl: 2100.00,
      duration: '2j 16h'
    }
  ];

  const metrics = {
    totalReturn: 12.4,
    annualizedReturn: 18.6,
    volatility: 14.2,
    sharpeRatio: 1.31,
    maxDrawdown: -5.8,
    winRate: 68.5,
    totalTrades: 47,
    avgTradeDuration: '2j 14h',
    profitFactor: 1.85
  };

  const getReturnColor = (value) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
            <Icon name="BarChart3" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-heading">
              Résultats du Backtest - {strategy?.name}
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              Période: 01/01/2024 - 22/09/2024 • Capital initial: 100'000 CHF
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onApplyStrategy(strategy)}
            iconName="Play"
            iconPosition="left"
          >
            Appliquer la Stratégie
          </Button>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="text-xs text-success font-body mb-1">Rendement Total</div>
          <div className="text-xl font-semibold text-success font-data">
            +{metrics?.totalReturn}%
          </div>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="text-xs text-primary font-body mb-1">Rendement Annualisé</div>
          <div className="text-xl font-semibold text-primary font-data">
            +{metrics?.annualizedReturn}%
          </div>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="text-xs text-warning font-body mb-1">Volatilité</div>
          <div className="text-xl font-semibold text-warning font-data">
            {metrics?.volatility}%
          </div>
        </div>
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
          <div className="text-xs text-secondary font-body mb-1">Ratio de Sharpe</div>
          <div className="text-xl font-semibold text-secondary font-data">
            {metrics?.sharpeRatio}
          </div>
        </div>
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <div className="text-xs text-error font-body mb-1">Drawdown Max</div>
          <div className="text-xl font-semibold text-error font-data">
            {metrics?.maxDrawdown}%
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground font-heading">
            Performance vs Benchmark
          </h4>
          <div className="h-64 bg-background/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(30, 41, 59)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '8px',
                    color: 'rgb(248, 250, 252)'
                  }}
                  formatter={(value, name) => [
                    `${value?.toLocaleString()} CHF`,
                    name === 'portfolio' ? 'Stratégie' : 'Benchmark'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="rgb(16, 185, 129)"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="rgb(148, 163, 184)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Returns */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground font-heading">
            Rendements Mensuels
          </h4>
          <div className="h-64 bg-background/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(30, 41, 59)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '8px',
                    color: 'rgb(248, 250, 252)'
                  }}
                  formatter={(value) => [`${value}%`, 'Rendement']}
                />
                <Bar
                  dataKey="returns"
                  fill={(entry) => entry?.returns > 0 ? 'rgb(16, 185, 129)' : 'rgb(220, 38, 38)'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Additional Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Taux de Réussite</div>
          <div className="text-lg font-semibold text-foreground font-data">
            {metrics?.winRate}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Total Trades</div>
          <div className="text-lg font-semibold text-foreground font-data">
            {metrics?.totalTrades}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Durée Moy. Trade</div>
          <div className="text-lg font-semibold text-foreground font-data">
            {metrics?.avgTradeDuration}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Facteur de Profit</div>
          <div className="text-lg font-semibold text-foreground font-data">
            {metrics?.profitFactor}
          </div>
        </div>
      </div>
      {/* Trade History */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground font-heading">
          Historique des Trades (4 derniers)
        </h4>
        <div className="bg-background/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground font-body">
                    Date
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground font-body">
                    Symbole
                  </th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground font-body">
                    Type
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground font-body">
                    Quantité
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground font-body">
                    Prix
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground font-body">
                    P&L
                  </th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground font-body">
                    Durée
                  </th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory?.map((trade) => (
                  <tr key={trade?.id} className="border-t border-border">
                    <td className="p-3 text-sm text-foreground font-data">
                      {trade?.date}
                    </td>
                    <td className="p-3 text-sm font-medium text-foreground font-data">
                      {trade?.symbol}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        trade?.type === 'Achat' ?'bg-success/10 text-success border border-success/20' :'bg-error/10 text-error border border-error/20'
                      }`}>
                        {trade?.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-right text-foreground font-data">
                      {trade?.quantity}
                    </td>
                    <td className="p-3 text-sm text-right text-foreground font-data">
                      {trade?.price?.toLocaleString()} CHF
                    </td>
                    <td className={`p-3 text-sm text-right font-semibold font-data ${
                      getReturnColor(trade?.pnl)
                    }`}>
                      {trade?.pnl > 0 ? '+' : ''}{trade?.pnl?.toLocaleString()} CHF
                    </td>
                    <td className="p-3 text-sm text-right text-muted-foreground font-data">
                      {trade?.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestResults;