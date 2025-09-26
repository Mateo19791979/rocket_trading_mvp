import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const MovingAverageConfig = ({ strategy, onSave, onCancel }) => {
  const [config, setConfig] = useState({
    shortPeriod: strategy?.config?.shortPeriod || 10,
    longPeriod: strategy?.config?.longPeriod || 20,
    symbol: strategy?.config?.symbol || 'SPY',
    timeframe: strategy?.config?.timeframe || '1h'
  });

  const timeframeOptions = [
    { value: '5m', label: '5 minutes' },
    { value: '15m', label: '15 minutes' },
    { value: '1h', label: '1 heure' },
    { value: '4h', label: '4 heures' },
    { value: '1d', label: '1 jour' }
  ];

  const symbolOptions = [
    { value: 'SPY', label: 'SPY - S&P 500 ETF' },
    { value: 'QQQ', label: 'QQQ - Nasdaq ETF' },
    { value: 'SMI', label: 'SMI - Swiss Market Index' },
    { value: 'STLA', label: 'STLA - Stellantis' },
    { value: 'BTC', label: 'BTC - Bitcoin' }
  ];

  // Mock chart data for preview
  const mockChartData = [
    { time: '09:00', price: 420.50, shortMA: 418.20, longMA: 415.80 },
    { time: '10:00', price: 422.30, shortMA: 420.10, longMA: 416.50 },
    { time: '11:00', price: 419.80, shortMA: 420.87, longMA: 417.20 },
    { time: '12:00', price: 425.60, shortMA: 422.05, longMA: 418.90 },
    { time: '13:00', price: 428.20, shortMA: 424.23, longMA: 420.60 },
    { time: '14:00', price: 426.90, shortMA: 425.47, longMA: 422.30 },
    { time: '15:00', price: 430.10, shortMA: 427.93, longMA: 424.10 }
  ];

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave({
      ...strategy,
      config: config
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Icon name="TrendingUp" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-heading">
              Configuration Moyennes Mobiles
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              Stratégie de croisement de moyennes mobiles
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            Sauvegarder
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Période Courte"
              type="number"
              value={config?.shortPeriod}
              onChange={(e) => handleConfigChange('shortPeriod', parseInt(e?.target?.value))}
              min="1"
              max="50"
              description="Nombre de périodes pour la MA courte"
            />
            <Input
              label="Période Longue"
              type="number"
              value={config?.longPeriod}
              onChange={(e) => handleConfigChange('longPeriod', parseInt(e?.target?.value))}
              min="2"
              max="200"
              description="Nombre de périodes pour la MA longue"
            />
          </div>

          <Select
            label="Symbole"
            options={symbolOptions}
            value={config?.symbol}
            onChange={(value) => handleConfigChange('symbol', value)}
            description="Actif financier à analyser"
          />

          <Select
            label="Timeframe"
            options={timeframeOptions}
            value={config?.timeframe}
            onChange={(value) => handleConfigChange('timeframe', value)}
            description="Intervalle de temps des données"
          />

          {/* Strategy Rules */}
          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground font-heading mb-3">
              Règles de la Stratégie
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground font-body">
              <div className="flex items-center space-x-2">
                <Icon name="ArrowUp" size={14} className="text-success" />
                <span>Signal d'achat: MA courte croise au-dessus de MA longue</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="ArrowDown" size={14} className="text-error" />
                <span>Signal de vente: MA courte croise en-dessous de MA longue</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={14} className="text-primary" />
                <span>Position fermée automatiquement au signal opposé</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="text-xs text-success font-body mb-1">Signaux d'achat</div>
              <div className="text-lg font-semibold text-success font-data">12</div>
            </div>
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <div className="text-xs text-error font-body mb-1">Signaux de vente</div>
              <div className="text-lg font-semibold text-error font-data">8</div>
            </div>
          </div>
        </div>

        {/* Preview Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground font-heading">
              Aperçu Graphique
            </h4>
            <div className="flex items-center space-x-4 text-xs font-data">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-foreground"></div>
                <span className="text-muted-foreground">Prix</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-primary"></div>
                <span className="text-muted-foreground">MA {config?.shortPeriod}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-secondary"></div>
                <span className="text-muted-foreground">MA {config?.longPeriod}</span>
              </div>
            </div>
          </div>

          <div className="h-64 bg-background/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(30, 41, 59)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '8px',
                    color: 'rgb(248, 250, 252)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="rgb(248, 250, 252)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="shortMA"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="longMA"
                  stroke="rgb(99, 102, 241)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-muted-foreground font-body text-center">
            Aperçu basé sur les dernières données de {config?.symbol} ({config?.timeframe})
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovingAverageConfig;