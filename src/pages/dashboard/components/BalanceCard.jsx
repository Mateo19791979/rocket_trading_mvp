import React from 'react';
import Icon from '../../../components/AppIcon';

const BalanceCard = ({ balance, pnl, pnlPercentage }) => {
  const isProfitable = pnl >= 0;
  
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          Solde Virtuel
        </h2>
        <div className="flex items-center space-x-2">
          <Icon name="Wallet" size={20} className="text-primary" />
          <span className="text-xs text-muted-foreground font-data">CHF</span>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="text-3xl font-bold text-foreground font-heading">
            {balance?.toLocaleString('fr-CH', { 
              style: 'currency', 
              currency: 'CHF',
              minimumFractionDigits: 2 
            })}
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
              P&L Aujourd'hui
            </span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-semibold font-data ${
              isProfitable ? "text-success" : "text-error"
            }`}>
              {isProfitable ? "+" : ""}{pnl?.toLocaleString('fr-CH', { 
                style: 'currency', 
                currency: 'CHF',
                minimumFractionDigits: 2 
              })}
            </div>
            <div className={`text-sm font-data ${
              isProfitable ? "text-success" : "text-error"
            }`}>
              {isProfitable ? "+" : ""}{pnlPercentage?.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;