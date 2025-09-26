import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchBar = ({ onSearch, onSymbolSelect, searchHistory = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Mock symbols data for autocomplete
  const mockSymbols = [
    { symbol: 'STLA', name: 'Stellantis N.V.', market: 'NYSE', sector: 'Automotive' },
    { symbol: 'SMI', name: 'Swiss Market Index', market: 'SIX', sector: 'Index' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', market: 'NYSE', sector: 'ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', market: 'NASDAQ', sector: 'ETF' },
    { symbol: 'BTC-USD', name: 'Bitcoin USD', market: 'CRYPTO', sector: 'Cryptocurrency' },
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'NASDAQ', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ', sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ', sector: 'Automotive' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'NASDAQ', sector: 'Technology' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);

    // Clear previous debounce
    if (debounceRef?.current) {
      clearTimeout(debounceRef?.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      if (value?.trim()) {
        setIsLoading(true);
        // Simulate API call delay
        setTimeout(() => {
          const filtered = mockSymbols?.filter(symbol =>
            symbol?.symbol?.toLowerCase()?.includes(value?.toLowerCase()) ||
            symbol?.name?.toLowerCase()?.includes(value?.toLowerCase())
          )?.slice(0, 8);
          setSuggestions(filtered);
          setShowSuggestions(true);
          setIsLoading(false);
        }, 300);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
      }
      onSearch(value);
    }, 300);
  };

  const handleSymbolSelect = (symbol) => {
    setSearchTerm(symbol?.symbol);
    setShowSuggestions(false);
    onSymbolSelect(symbol);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Input
          type="search"
          placeholder="Rechercher un symbole ou une entreprise..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-12 pr-12"
          onFocus={() => searchTerm && setShowSuggestions(true)}
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Icon name="Search" size={18} className="text-muted-foreground" />
        </div>
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-trading-fast"
          >
            <Icon name="X" size={18} />
          </button>
        )}
      </div>
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-trading-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-muted-foreground">Recherche en cours...</span>
              </div>
            </div>
          ) : suggestions?.length > 0 ? (
            <div className="py-2">
              {suggestions?.map((symbol, index) => (
                <button
                  key={index}
                  onClick={() => handleSymbolSelect(symbol)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-trading-fast flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-foreground font-data">
                        {symbol?.symbol}
                      </span>
                      <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                        {symbol?.market}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {symbol?.name}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {symbol?.sector}
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm && (
            <div className="p-4 text-center text-muted-foreground">
              <Icon name="Search" size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucun résultat trouvé pour "{searchTerm}"</p>
            </div>
          )}

          {/* Recent Searches */}
          {!searchTerm && searchHistory?.length > 0 && (
            <div className="border-t border-border">
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                Recherches récentes
              </div>
              {searchHistory?.slice(0, 5)?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSymbolSelect(item)}
                  className="w-full px-4 py-2 text-left hover:bg-muted transition-trading-fast flex items-center space-x-2"
                >
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span className="text-sm font-data">{item?.symbol}</span>
                  <span className="text-xs text-muted-foreground">{item?.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;