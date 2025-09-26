import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const WatchlistCard = ({ symbols }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          Liste de Surveillance
        </h2>
        <Link to="/market-analysis">
          <Button variant="ghost" size="sm" iconName="ExternalLink" iconPosition="right">
            Voir Plus
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {symbols?.map((symbol) => (
          <WatchlistItem key={symbol?.symbol} symbol={symbol} />
        ))}
      </div>
    </div>
  );
};

const WatchlistItem = ({ symbol }) => {
  const isPositive = symbol?.change >= 0;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-trading-fast">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <span className="text-sm font-semibold text-primary font-data">
            {symbol?.symbol?.substring(0, 2)}
          </span>
        </div>
        <div>
          <div className="font-semibold text-foreground font-heading">
            {symbol?.symbol}
          </div>
          <div className="text-sm text-muted-foreground font-body">
            {symbol?.name}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-foreground font-data">
          {symbol?.price?.toLocaleString('fr-CH', { 
            style: 'currency', 
            currency: 'CHF',
            minimumFractionDigits: 2 
          })}
        </div>
        <div className={`text-sm font-data flex items-center justify-end space-x-1 ${
          isPositive ? "text-success" : "text-error"
        }`}>
          <Icon 
            name={isPositive ? "ArrowUp" : "ArrowDown"} 
            size={12} 
          />
          <span>
            {isPositive ? "+" : ""}{symbol?.change?.toFixed(2)} ({isPositive ? "+" : ""}{symbol?.changePercent?.toFixed(2)}%)
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <Link to="/paper-trading">
          <Button variant="outline" size="xs" iconName="ShoppingCart">
            Acheter
          </Button>
        </Link>
        <Button variant="ghost" size="xs" iconName="MoreHorizontal" />
      </div>
    </div>
  );
};

export default WatchlistCard;