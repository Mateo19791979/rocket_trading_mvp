import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const RSIConfig = ({ strategy, onSave, onCancel }) => {
  const [config, setConfig] = useState({
    period: strategy?.config?.period || 14,
    overboughtLevel: strategy?.config?.overboughtLevel || 70,
    oversoldLevel: strategy?.config?.oversoldLevel || 30,
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

  // Mock RSI data for preview
  const mockRSIData = [
    { time: '09:00', rsi: 45.2, price: 420.50 },
    { time: '10:00', rsi: 52.8, price: 422.30 },
    { time: '11:00', rsi: 38.4, price: 419.80 },
    { time: '12:00', rsi: 65.7, price: 425.60 },
    { time: '13:00', rsi: 72.3, price: 428.20 },
    { time: '14:00', rsi: 68.9, price: 426.90 },
    { time: '15:00', rsi: 75.1, price: 430.10 },
    { time: '16:00', rsi: 28.6, price: 425.40 }
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

  const getRSIColor = (rsi) => {
    if (rsi >= config?.overboughtLevel) return 'rgb(220, 38, 38)';
    if (rsi <= config?.oversoldLevel) return 'rgb(5, 150, 105)';
    return 'rgb(59, 130, 246)';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg">
            <Icon name="Activity" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-heading">
              Configuration RSI
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              Stratégie basée sur l'indice de force relative
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
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Période RSI"
              type="number"
              value={config?.period}
              onChange={(e) => handleConfigChange('period', parseInt(e?.target?.value))}
              min="2"
              max="50"
              description="Nombre de périodes pour le calcul RSI"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Niveau Survente"
                type="number"
                value={config?.oversoldLevel}
                onChange={(e) => handleConfigChange('oversoldLevel', parseInt(e?.target?.value))}
                min="10"
                max="40"
                description="Seuil d'achat (généralement 30)"
              />
              <Input
                label="Niveau Surachat"
                type="number"
                value={config?.overboughtLevel}
                onChange={(e) => handleConfigChange('overboughtLevel', parseInt(e?.target?.value))}
                min="60"
                max="90"
                description="Seuil de vente (généralement 70)"
              />
            </div>
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
                <span>Signal d'achat: RSI &lt; {config?.oversoldLevel} (survente)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="ArrowDown" size={14} className="text-error" />
                <span>Signal de vente: RSI &gt; {config?.overboughtLevel} (surachat)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={14} className="text-primary" />
                <span>Position fermée au signal opposé ou stop-loss</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-success/10 border border-success/20 rounded-lg p-3">
              <div className="text-xs text-success font-body mb-1">Survente</div>
              <div className="text-lg font-semibold text-success font-data">3</div>
            </div>
            <div className="bg-error/10 border border-error/20 rounded-lg p-3">
              <div className="text-xs text-error font-body mb-1">Surachat</div>
              <div className="text-lg font-semibold text-error font-data">5</div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="text-xs text-primary font-body mb-1">RSI Actuel</div>
              <div className="text-lg font-semibold text-primary font-data">58.4</div>
            </div>
          </div>
        </div>

        {/* Preview Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground font-heading">
              Aperçu RSI
            </h4>
            <div className="flex items-center space-x-4 text-xs font-data">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-primary"></div>
                <span className="text-muted-foreground">RSI ({config?.period})</span>
              </div>
            </div>
          </div>

          <div className="h-64 bg-background/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRSIData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgb(148, 163, 184)"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(30, 41, 59)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: '8px',
                    color: 'rgb(248, 250, 252)'
                  }}
                />
                <ReferenceLine 
                  y={config?.overboughtLevel} 
                  stroke="rgb(220, 38, 38)" 
                  strokeDasharray="5 5"
                  label={{ value: "Surachat", position: "insideTopRight" }}
                />
                <ReferenceLine 
                  y={config?.oversoldLevel} 
                  stroke="rgb(5, 150, 105)" 
                  strokeDasharray="5 5"
                  label={{ value: "Survente", position: "insideBottomRight" }}
                />
                <ReferenceLine 
                  y={50} 
                  stroke="rgba(148, 163, 184, 0.3)" 
                  strokeDasharray="2 2"
                />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={getRSIColor(payload?.rsi)}
                        stroke={getRSIColor(payload?.rsi)}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-muted-foreground font-body text-center">
            RSI calculé sur {config?.period} périodes pour {config?.symbol} ({config?.timeframe})
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSIConfig;