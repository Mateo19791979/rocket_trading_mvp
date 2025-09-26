import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsCard = ({ recentTrades }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground font-heading">
          Actions Rapides
        </h2>
        <Icon name="Zap" size={20} className="text-primary" />
      </div>
      <div className="space-y-4">
        {/* Quick Trade Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/paper-trading">
            <Button variant="default" className="w-full" iconName="TrendingUp" iconPosition="left">
              Nouvel Ordre
            </Button>
          </Link>
          <Link to="/market-analysis">
            <Button variant="outline" className="w-full" iconName="Search" iconPosition="left">
              Rechercher
            </Button>
          </Link>
        </div>

        {/* Strategy Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/strategy-management">
            <Button variant="secondary" className="w-full" iconName="Target" iconPosition="left">
              Stratégies
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" iconName="Download" iconPosition="left">
            Exporter
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground font-body mb-3">
            Activité Récente
          </h3>
          <div className="space-y-2">
            {recentTrades?.slice(0, 3)?.map((trade) => (
              <div key={trade?.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-trading-fast">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    trade?.type === 'buy' ? 'bg-success' : 'bg-error'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-foreground font-body">
                      {trade?.type === 'buy' ? 'Achat' : 'Vente'} {trade?.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground font-data">
                      {trade?.quantity} @ {trade?.price?.toLocaleString('fr-CH', { 
                        style: 'currency', 
                        currency: 'CHF',
                        minimumFractionDigits: 2 
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-data">
                  {new Date(trade.timestamp)?.toLocaleTimeString('fr-CH', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {recentTrades?.length > 3 && (
            <Link to="/paper-trading" className="block mt-3">
              <Button variant="ghost" size="sm" className="w-full" iconName="ArrowRight" iconPosition="right">
                Voir Tout l'Historique
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCard;