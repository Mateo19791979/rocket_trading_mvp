import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuotesTable = ({ searchTerm, filters, onSymbolSelect, onBuyClick, onSellClick, onResultCountUpdate }) => {
  const [quotes, setQuotes] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(true);

  // Mock quotes data
  const mockQuotes = [
    {
      symbol: 'STLA',
      name: 'Stellantis N.V.',
      price: 18.45,
      change: 0.32,
      changePercent: 1.76,
      volume: 12450000,
      market: 'NYSE',
      sector: 'Automotive',
      marketCap: 58200000000,
      status: 'open'
    },
    {
      symbol: 'SMI',
      name: 'Swiss Market Index',
      price: 11847.23,
      change: -45.67,
      changePercent: -0.38,
      volume: 0,
      market: 'SIX',
      sector: 'Index',
      marketCap: 0,
      status: 'open'
    },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF',
      price: 428.91,
      change: 2.14,
      changePercent: 0.50,
      volume: 45230000,
      market: 'NYSE',
      sector: 'ETF',
      marketCap: 0,
      status: 'open'
    },
    {
      symbol: 'QQQ',
      name: 'Invesco QQQ Trust',
      price: 367.82,
      change: 4.23,
      changePercent: 1.16,
      volume: 32180000,
      market: 'NASDAQ',
      sector: 'ETF',
      marketCap: 0,
      status: 'open'
    },
    {
      symbol: 'BTC-USD',
      name: 'Bitcoin USD',
      price: 63247.50,
      change: -1234.75,
      changePercent: -1.91,
      volume: 28450000000,
      market: 'CRYPTO',
      sector: 'Cryptocurrency',
      marketCap: 1245000000000,
      status: 'open'
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.84,
      change: 1.23,
      changePercent: 0.70,
      volume: 52340000,
      market: 'NASDAQ',
      sector: 'Technology',
      marketCap: 2750000000000,
      status: 'open'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 378.85,
      change: -2.45,
      changePercent: -0.64,
      volume: 23450000,
      market: 'NASDAQ',
      sector: 'Technology',
      marketCap: 2810000000000,
      status: 'open'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 138.21,
      change: 0.87,
      changePercent: 0.63,
      volume: 18760000,
      market: 'NASDAQ',
      sector: 'Technology',
      marketCap: 1750000000000,
      status: 'open'
    }
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    const timeoutId = setTimeout(() => {
      try {
        let filteredQuotes = mockQuotes;

        // Apply search filter
        if (searchTerm?.trim()) {
          filteredQuotes = filteredQuotes?.filter(quote =>
            quote?.symbol?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            quote?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase())
          );
        }

        // Apply filters
        if (filters?.market && filters?.market !== 'all') {
          filteredQuotes = filteredQuotes?.filter(quote => quote?.market === filters?.market);
        }
        if (filters?.sector && filters?.sector !== 'all') {
          filteredQuotes = filteredQuotes?.filter(quote => quote?.sector === filters?.sector);
        }
        if (filters?.change && filters?.change !== 'all') {
          if (filters?.change === 'gainers') {
            filteredQuotes = filteredQuotes?.filter(quote => quote?.change > 0);
          } else if (filters?.change === 'losers') {
            filteredQuotes = filteredQuotes?.filter(quote => quote?.change < 0);
          } else if (filters?.change === 'unchanged') {
            filteredQuotes = filteredQuotes?.filter(quote => quote?.change === 0);
          }
        }
        if (filters?.volume && filters?.volume !== 'all') {
          if (filters?.volume === 'high') {
            filteredQuotes = filteredQuotes?.filter(quote => quote?.volume > 10000000);
          } else if (filters?.volume === 'medium') {
            filteredQuotes = filteredQuotes?.filter(quote => quote?.volume >= 1000000 && quote?.volume <= 10000000);
          } else if (filters?.volume === 'low') {
            filteredQuotes = filteredQuotes?.filter(quote => quote?.volume < 1000000);
          }
        }
        if (filters?.priceRange && filters?.priceRange !== 'all') {
          const [min, max] = filters?.priceRange === '500+' 
            ? [500, Infinity] 
            : filters?.priceRange?.split('-')?.map(Number);
          if (min !== undefined && max !== undefined) {
            filteredQuotes = filteredQuotes?.filter(quote => 
              quote?.price >= min && (max === Infinity || quote?.price <= max)
            );
          }
        }

        setQuotes(filteredQuotes);
        onResultCountUpdate?.(filteredQuotes?.length);
      } catch (error) {
        console.error('Error filtering quotes:', error);
        setQuotes([]);
        onResultCountUpdate?.(0);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters, onResultCountUpdate]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedQuotes = [...quotes]?.sort((a, b) => {
      const aValue = a?.[key];
      const bValue = b?.[key];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? 1 : -1;
      if (bValue == null) return direction === 'asc' ? -1 : 1;
      
      // Compare values
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setQuotes(sortedQuotes);
  };

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return 'N/A';
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2
    })?.format(price);
  };

  const formatVolume = (volume) => {
    if (volume == null || volume === 0) return '-';
    if (volume >= 1000000000) return `${(volume / 1000000000)?.toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000)?.toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000)?.toFixed(1)}K`;
    return volume?.toLocaleString('fr-CH');
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap == null || marketCap === 0) return '-';
    if (marketCap >= 1000000000000) return `${(marketCap / 1000000000000)?.toFixed(2)}T`;
    if (marketCap >= 1000000000) return `${(marketCap / 1000000000)?.toFixed(1)}B`;
    if (marketCap >= 1000000) return `${(marketCap / 1000000)?.toFixed(1)}M`;
    return marketCap?.toLocaleString('fr-CH');
  };

  const SortIcon = ({ column }) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' ? 
      <Icon name="ArrowUp" size={14} className="text-primary" /> :
      <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            {[...Array(8)]?.map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground font-heading">
            Cotations en temps réel
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground font-data">Live</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {quotes?.length} symboles
            </span>
          </div>
        </div>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('symbol')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-trading-fast"
                >
                  <span>Symbole</span>
                  <SortIcon column="symbol" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('price')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-trading-fast"
                >
                  <span>Prix</span>
                  <SortIcon column="price" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('change')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-trading-fast"
                >
                  <span>Variation</span>
                  <SortIcon column="change" />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort('volume')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-trading-fast"
                >
                  <span>Volume</span>
                  <SortIcon column="volume" />
                </button>
              </th>
              <th className="text-left p-4">
                <span className="text-sm font-medium text-muted-foreground">Cap. Marché</span>
              </th>
              <th className="text-right p-4">
                <span className="text-sm font-medium text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes?.map((quote, index) => (
              <tr
                key={quote?.symbol || index}
                className="border-t border-border hover:bg-muted/20 transition-trading-fast cursor-pointer"
                onClick={() => onSymbolSelect?.(quote)}
              >
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-semibold text-foreground font-data">
                        {quote?.symbol || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-32">
                        {quote?.name || 'N/A'}
                      </div>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {quote?.market || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-foreground font-data">
                    {formatPrice(quote?.price)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Icon
                      name={(quote?.change ?? 0) >= 0 ? "TrendingUp" : "TrendingDown"}
                      size={14}
                      className={(quote?.change ?? 0) >= 0 ? "text-success" : "text-error"}
                    />
                    <span className={`font-semibold font-data ${
                      (quote?.change ?? 0) >= 0 ? "text-success" : "text-error"
                    }`}>
                      {(quote?.change ?? 0) >= 0 ? '+' : ''}{(quote?.change ?? 0)?.toFixed(2)}
                    </span>
                    <span className={`text-sm font-data ${
                      (quote?.changePercent ?? 0) >= 0 ? "text-success" : "text-error"
                    }`}>
                      ({(quote?.changePercent ?? 0) >= 0 ? '+' : ''}{(quote?.changePercent ?? 0)?.toFixed(2)}%)
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-foreground font-data">
                    {formatVolume(quote?.volume)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-foreground font-data">
                    {formatMarketCap(quote?.marketCap)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2 justify-end">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onBuyClick?.(quote);
                      }}
                    >
                      Acheter
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onSellClick?.(quote);
                      }}
                    >
                      Vendre
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {quotes?.map((quote, index) => (
          <div
            key={quote?.symbol || index}
            className="bg-muted/20 rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-trading-fast"
            onClick={() => onSymbolSelect?.(quote)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="font-semibold text-foreground font-data">
                    {quote?.symbol || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quote?.name || 'N/A'}
                  </div>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                  {quote?.market || 'N/A'}
                </span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground font-data">
                  {formatPrice(quote?.price)}
                </div>
                <div className={`text-sm font-data flex items-center space-x-1 ${
                  (quote?.changePercent ?? 0) >= 0 ? "text-success" : "text-error"
                }`}>
                  <Icon
                    name={(quote?.changePercent ?? 0) >= 0 ? "TrendingUp" : "TrendingDown"}
                    size={12}
                  />
                  <span>
                    {(quote?.changePercent ?? 0) >= 0 ? '+' : ''}{(quote?.changePercent ?? 0)?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Volume: {formatVolume(quote?.volume)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onBuyClick?.(quote);
                  }}
                >
                  Acheter
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onSellClick?.(quote);
                  }}
                >
                  Vendre
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {quotes?.length === 0 && !isLoading && (
        <div className="p-12 text-center">
          <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Aucun résultat trouvé
          </h4>
          <p className="text-muted-foreground">
            Essayez de modifier vos critères de recherche ou vos filtres.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuotesTable;