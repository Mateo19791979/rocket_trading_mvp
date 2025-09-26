import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChartCard = ({ chartData, selectedSymbol }) => {
  const [timeRange, setTimeRange] = useState('1D');
  const timeRanges = ['1D', '5D', '1M', '3M', '1A'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-trading-lg">
          <p className="text-sm font-medium text-foreground font-body">
            {label}
          </p>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between space-x-4">
              <span className="text-xs text-muted-foreground">Prix:</span>
              <span className="text-xs font-semibold text-foreground font-data">
                {payload?.[0]?.value?.toLocaleString('fr-CH', { 
                  style: 'currency', 
                  currency: 'CHF',
                  minimumFractionDigits: 2 
                })}
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-xs text-muted-foreground">Volume:</span>
              <span className="text-xs font-semibold text-foreground font-data">
                {payload?.[0]?.payload?.volume?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-foreground font-heading">
            Graphique Intraday
          </h2>
          <div className="px-3 py-1 bg-primary/10 rounded-lg">
            <span className="text-sm font-semibold text-primary font-data">
              {selectedSymbol}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeRanges?.map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="xs"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value?.toFixed(2)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-body">
              Dernière mise à jour: {new Date()?.toLocaleTimeString('fr-CH')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" iconName="Download">
            Exporter
          </Button>
          <Button variant="ghost" size="sm" iconName="Maximize2">
            Plein écran
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;