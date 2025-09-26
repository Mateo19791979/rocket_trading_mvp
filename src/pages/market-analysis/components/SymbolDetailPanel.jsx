import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SymbolDetailPanel = ({ symbol, onClose, onBuyClick, onSellClick, onAddToWatchlist }) => {
  const [chartData, setChartData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(true);

  // Mock chart data generation
  useEffect(() => {
    if (!symbol) return;

    setIsLoading(true);
    
    // Generate mock OHLCV data
    const generateMockData = () => {
      const data = [];
      const volumeData = [];
      const basePrice = symbol?.price;
      const dataPoints = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : 30;
      
      for (let i = 0; i < dataPoints; i++) {
        const variation = (Math.random() - 0.5) * 0.1;
        const price = basePrice * (1 + variation);
        const volume = Math.floor(Math.random() * 1000000) + 100000;
        
        const date = new Date();
        if (timeframe === '1D') {
          date?.setHours(date?.getHours() - (dataPoints - i));
        } else if (timeframe === '1W') {
          date?.setDate(date?.getDate() - (dataPoints - i));
        } else {
          date?.setDate(date?.getDate() - (dataPoints - i));
        }

        data?.push({
          time: timeframe === '1D' ? date?.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) : 
                date?.toLocaleDateString('fr-CH', { month: 'short', day: 'numeric' }),
          price: price,
          volume: volume
        });

        volumeData?.push({
          time: timeframe === '1D' ? date?.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' }) : 
                date?.toLocaleDateString('fr-CH', { month: 'short', day: 'numeric' }),
          volume: volume
        });
      }
      
      return { data, volumeData };
    };

    setTimeout(() => {
      const { data, volumeData: volData } = generateMockData();
      setChartData(data);
      setVolumeData(volData);
      setIsLoading(false);
    }, 500);
  }, [symbol, timeframe]);

  if (!symbol) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2
    })?.format(price);
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000000) return `${(volume / 1000000000)?.toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000)?.toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000)?.toFixed(1)}K`;
    return volume?.toLocaleString('fr-CH');
  };

  const timeframes = [
    { key: '1D', label: '1J' },
    { key: '1W', label: '1S' },
    { key: '1M', label: '1M' }
  ];

  const technicalIndicators = [
    { name: 'RSI (14)', value: '67.8', status: 'neutral' },
    { name: 'MACD', value: '0.45', status: 'bullish' },
    { name: 'MA 20', value: formatPrice(symbol?.price * 0.98), status: 'bullish' },
    { name: 'MA 50', value: formatPrice(symbol?.price * 0.95), status: 'bearish' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'bullish': return 'text-success';
      case 'bearish': return 'text-error';
      default: return 'text-warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'bullish': return 'TrendingUp';
      case 'bearish': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-trading-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-foreground font-data">
                  {symbol?.symbol}
                </h2>
                <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                  {symbol?.market}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{symbol?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground font-data">
                {formatPrice(symbol?.price)}
              </div>
              <div className={`flex items-center space-x-1 ${
                symbol?.change >= 0 ? "text-success" : "text-error"
              }`}>
                <Icon
                  name={symbol?.change >= 0 ? "TrendingUp" : "TrendingDown"}
                  size={16}
                />
                <span className="font-semibold font-data">
                  {symbol?.change >= 0 ? '+' : ''}{symbol?.change?.toFixed(2)} 
                  ({symbol?.changePercent >= 0 ? '+' : ''}{symbol?.changePercent?.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onAddToWatchlist(symbol)}
              iconName="Plus"
              iconPosition="left"
            >
              Watchlist
            </Button>
            <Button
              variant="success"
              onClick={() => onBuyClick(symbol)}
            >
              Acheter
            </Button>
            <Button
              variant="danger"
              onClick={() => onSellClick(symbol)}
            >
              Vendre
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Timeframe Selector */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground font-heading">
                  Graphique des prix
                </h3>
                <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                  {timeframes?.map((tf) => (
                    <button
                      key={tf?.key}
                      onClick={() => setTimeframe(tf?.key)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-trading-fast ${
                        timeframe === tf?.key
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tf?.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-muted/20 rounded-xl p-4">
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-muted-foreground">Chargement du graphique...</span>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis 
                        dataKey="time" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        tickFormatter={(value) => formatPrice(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-popover)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-foreground)'
                        }}
                        formatter={(value) => [formatPrice(value), 'Prix']}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="var(--color-primary)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: 'var(--color-primary)' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Volume Chart */}
              <div className="bg-muted/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-foreground mb-4 font-heading">
                  Volume des échanges
                </h4>
                {isLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-pulse bg-muted rounded w-full h-full"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis 
                        dataKey="time" 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        tickFormatter={(value) => formatVolume(value)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-popover)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '8px',
                          color: 'var(--color-foreground)'
                        }}
                        formatter={(value) => [formatVolume(value), 'Volume']}
                      />
                      <Bar
                        dataKey="volume"
                        fill="var(--color-secondary)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-6">
              {/* Key Stats */}
              <div className="bg-muted/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-foreground mb-4 font-heading">
                  Statistiques clés
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-data text-foreground">
                      {formatVolume(symbol?.volume)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cap. Marché</span>
                    <span className="font-data text-foreground">
                      {symbol?.marketCap > 0 ? formatVolume(symbol?.marketCap) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Secteur</span>
                    <span className="text-foreground">{symbol?.sector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marché</span>
                    <span className="text-foreground">{symbol?.market}</span>
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="bg-muted/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-foreground mb-4 font-heading">
                  Indicateurs techniques
                </h4>
                <div className="space-y-3">
                  {technicalIndicators?.map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{indicator?.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-data text-foreground">{indicator?.value}</span>
                        <Icon
                          name={getStatusIcon(indicator?.status)}
                          size={14}
                          className={getStatusColor(indicator?.status)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-muted/20 rounded-xl p-4">
                <h4 className="text-md font-semibold text-foreground mb-4 font-heading">
                  Actions rapides
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="success"
                    fullWidth
                    onClick={() => onBuyClick(symbol)}
                    iconName="TrendingUp"
                    iconPosition="left"
                  >
                    Ordre d'achat
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => onSellClick(symbol)}
                    iconName="TrendingDown"
                    iconPosition="left"
                  >
                    Ordre de vente
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => onAddToWatchlist(symbol)}
                    iconName="Eye"
                    iconPosition="left"
                  >
                    Ajouter à la watchlist
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolDetailPanel;