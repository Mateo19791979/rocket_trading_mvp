import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const MarketFilters = ({ onFiltersChange, resultCount = 0 }) => {
  const [filters, setFilters] = useState({
    market: 'all',
    sector: 'all',
    priceRange: 'all',
    volume: 'all',
    change: 'all'
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const marketOptions = [
    { value: 'all', label: 'Tous les marchés' },
    { value: 'NYSE', label: 'NYSE' },
    { value: 'NASDAQ', label: 'NASDAQ' },
    { value: 'SIX', label: 'SIX Swiss Exchange' },
    { value: 'CRYPTO', label: 'Crypto' },
    { value: 'FOREX', label: 'Forex' }
  ];

  const sectorOptions = [
    { value: 'all', label: 'Tous les secteurs' },
    { value: 'Technology', label: 'Technologie' },
    { value: 'Healthcare', label: 'Santé' },
    { value: 'Financial', label: 'Finance' },
    { value: 'Energy', label: 'Énergie' },
    { value: 'Consumer', label: 'Consommation' },
    { value: 'Industrial', label: 'Industrie' },
    { value: 'Automotive', label: 'Automobile' },
    { value: 'ETF', label: 'ETF' },
    { value: 'Index', label: 'Index' },
    { value: 'Cryptocurrency', label: 'Cryptomonnaie' }
  ];

  const priceRangeOptions = [
    { value: 'all', label: 'Toutes les gammes' },
    { value: '0-10', label: '0 - 10 CHF' },
    { value: '10-50', label: '10 - 50 CHF' },
    { value: '50-100', label: '50 - 100 CHF' },
    { value: '100-500', label: '100 - 500 CHF' },
    { value: '500+', label: '500+ CHF' }
  ];

  const volumeOptions = [
    { value: 'all', label: 'Tous les volumes' },
    { value: 'high', label: 'Volume élevé (>10M)' },
    { value: 'medium', label: 'Volume moyen (1M-10M)' },
    { value: 'low', label: 'Volume faible (<1M)' }
  ];

  const changeOptions = [
    { value: 'all', label: 'Toutes les variations' },
    { value: 'gainers', label: 'Hausses (+)' },
    { value: 'losers', label: 'Baisses (-)' },
    { value: 'unchanged', label: 'Inchangé (0%)' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      market: 'all',
      sector: 'all',
      priceRange: 'all',
      volume: 'all',
      change: 'all'
    };
    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters)?.filter(value => value !== 'all')?.length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground font-heading">
            Filtres de marché
          </h3>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {resultCount?.toLocaleString('fr-CH')} résultats
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
          >
            {isExpanded ? 'Réduire' : 'Étendre'}
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filters?.change === 'gainers' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('change', filters?.change === 'gainers' ? 'all' : 'gainers')}
          iconName="TrendingUp"
          iconPosition="left"
        >
          Hausses
        </Button>
        <Button
          variant={filters?.change === 'losers' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('change', filters?.change === 'losers' ? 'all' : 'losers')}
          iconName="TrendingDown"
          iconPosition="left"
        >
          Baisses
        </Button>
        <Button
          variant={filters?.volume === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('volume', filters?.volume === 'high' ? 'all' : 'high')}
          iconName="BarChart3"
          iconPosition="left"
        >
          Volume élevé
        </Button>
        <Button
          variant={filters?.sector === 'Technology' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('sector', filters?.sector === 'Technology' ? 'all' : 'Technology')}
          iconName="Cpu"
          iconPosition="left"
        >
          Tech
        </Button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border">
          <Select
            label="Marché"
            options={marketOptions}
            value={filters?.market}
            onChange={(value) => handleFilterChange('market', value)}
            placeholder="Sélectionner un marché"
          />
          <Select
            label="Secteur"
            options={sectorOptions}
            value={filters?.sector}
            onChange={(value) => handleFilterChange('sector', value)}
            searchable
            placeholder="Sélectionner un secteur"
          />
          <Select
            label="Gamme de prix"
            options={priceRangeOptions}
            value={filters?.priceRange}
            onChange={(value) => handleFilterChange('priceRange', value)}
            placeholder="Sélectionner une gamme"
          />
          <Select
            label="Volume"
            options={volumeOptions}
            value={filters?.volume}
            onChange={(value) => handleFilterChange('volume', value)}
            placeholder="Sélectionner un volume"
          />
          <Select
            label="Variation"
            options={changeOptions}
            value={filters?.change}
            onChange={(value) => handleFilterChange('change', value)}
            placeholder="Sélectionner une variation"
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
              iconName="RotateCcw"
              iconPosition="left"
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      )}

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground mr-2">Filtres rapides:</span>
        <button
          onClick={() => handleFilterChange('change', filters?.change === 'gainers' ? 'all' : 'gainers')}
          className={`px-3 py-1 text-xs rounded-full transition-trading-fast flex items-center space-x-1 ${
            filters?.change === 'gainers' ?'bg-success/10 text-success border border-success/20' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Icon name="TrendingUp" size={12} />
          <span>Top Gainers</span>
        </button>
        <button
          onClick={() => handleFilterChange('change', filters?.change === 'losers' ? 'all' : 'losers')}
          className={`px-3 py-1 text-xs rounded-full transition-trading-fast flex items-center space-x-1 ${
            filters?.change === 'losers' ?'bg-error/10 text-error border border-error/20' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Icon name="TrendingDown" size={12} />
          <span>Top Losers</span>
        </button>
        <button
          onClick={() => handleFilterChange('volume', filters?.volume === 'high' ? 'all' : 'high')}
          className={`px-3 py-1 text-xs rounded-full transition-trading-fast flex items-center space-x-1 ${
            filters?.volume === 'high' ?'bg-primary/10 text-primary border border-primary/20' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Icon name="Activity" size={12} />
          <span>Volume élevé</span>
        </button>
        <button
          onClick={() => handleFilterChange('sector', filters?.sector === 'Technology' ? 'all' : 'Technology')}
          className={`px-3 py-1 text-xs rounded-full transition-trading-fast flex items-center space-x-1 ${
            filters?.sector === 'Technology' ?'bg-info/10 text-info border border-info/20' :'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Icon name="Cpu" size={12} />
          <span>Tech</span>
        </button>
      </div>
    </div>
  );
};

export default MarketFilters;