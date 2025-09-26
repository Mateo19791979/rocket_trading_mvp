import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StrategyCard = ({ 
  strategy, 
  onConfigure, 
  onBacktest, 
  onApply, 
  isActive = false 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10 border-success/20';
      case 'backtesting':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'inactive':
        return 'text-muted-foreground bg-muted/10 border-border';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance > 0) return 'text-success';
    if (performance < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className={`bg-card border rounded-xl p-6 transition-trading ${
      isActive ? 'border-primary shadow-trading-lg' : 'border-border hover:border-primary/50'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Icon name={strategy?.icon} size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-heading">
              {strategy?.name}
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              {strategy?.description}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-medium font-data ${
          getStatusColor(strategy?.status)
        }`}>
          {strategy?.status === 'active' ? 'Actif' : 
           strategy?.status === 'backtesting' ? 'Test en cours' : 'Inactif'}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Performance</div>
          <div className={`text-lg font-semibold font-data ${
            getPerformanceColor(strategy?.performance)
          }`}>
            {strategy?.performance > 0 ? '+' : ''}{strategy?.performance?.toFixed(2)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Trades</div>
          <div className="text-lg font-semibold text-foreground font-data">
            {strategy?.totalTrades}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Taux de réussite</div>
          <div className="text-lg font-semibold text-foreground font-data">
            {strategy?.winRate?.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-body mb-1">Drawdown Max</div>
          <div className="text-lg font-semibold text-error font-data">
            -{strategy?.maxDrawdown?.toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onConfigure(strategy)}
          iconName="Settings"
          iconPosition="left"
          className="flex-1"
        >
          Configurer
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onBacktest(strategy)}
          iconName="BarChart3"
          iconPosition="left"
          className="flex-1"
        >
          Backtest
        </Button>
        <Button
          variant={strategy?.status === 'active' ? 'destructive' : 'default'}
          size="sm"
          onClick={() => onApply(strategy)}
          iconName={strategy?.status === 'active' ? 'Square' : 'Play'}
          iconPosition="left"
          className="flex-1"
        >
          {strategy?.status === 'active' ? 'Arrêter' : 'Appliquer'}
        </Button>
      </div>
    </div>
  );
};

export default StrategyCard;