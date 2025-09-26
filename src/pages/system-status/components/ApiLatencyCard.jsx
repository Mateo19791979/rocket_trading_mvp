import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Icon from '../../../components/AppIcon';

const ApiLatencyCard = () => {
  const [latencyData, setLatencyData] = useState([
    { time: '07:40', latency: 15 },
    { time: '07:41', latency: 12 },
    { time: '07:42', latency: 18 },
    { time: '07:43', latency: 14 },
    { time: '07:44', latency: 11 },
    { time: '07:45', latency: 16 },
    { time: '07:46', latency: 13 },
    { time: '07:47', latency: 19 },
    { time: '07:48', latency: 12 },
    { time: '07:49', latency: 15 }
  ]);

  const [currentLatency, setCurrentLatency] = useState(12);
  const [averageLatency, setAverageLatency] = useState(14.5);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLatency = Math.floor(Math.random() * 15) + 8;
      const currentTime = new Date()?.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      setCurrentLatency(newLatency);
      setLatencyData(prev => {
        const newData = [...prev?.slice(1), { time: currentTime, latency: newLatency }];
        const avg = newData?.reduce((sum, item) => sum + item?.latency, 0) / newData?.length;
        setAverageLatency(Math.round(avg * 10) / 10);
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLatencyStatus = (latency) => {
    if (latency <= 20) return { color: 'text-success', status: 'Excellent' };
    if (latency <= 50) return { color: 'text-warning', status: 'Bon' };
    return { color: 'text-error', status: 'Lent' };
  };

  const status = getLatencyStatus(currentLatency);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground font-heading">
            Latence API
          </h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${status?.color} bg-current/10`}>
          {status?.status}
        </div>
      </div>
      {/* Current Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground font-data mb-1">
            {currentLatency}ms
          </div>
          <div className="text-sm text-muted-foreground">Actuel</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground font-data mb-1">
            {averageLatency}ms
          </div>
          <div className="text-sm text-muted-foreground">Moyenne</div>
        </div>
      </div>
      {/* Latency Chart */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={latencyData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={(value) => `Heure: ${value}`}
              formatter={(value) => [`${value}ms`, 'Latence']}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Performance Indicators */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium text-success font-data">≤20ms</div>
          <div className="text-xs text-muted-foreground">Excellent</div>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium text-warning font-data">21-50ms</div>
          <div className="text-xs text-muted-foreground">Bon</div>
        </div>
        <div className="text-center p-3 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium text-error font-data">&gt;50ms</div>
          <div className="text-xs text-muted-foreground">Lent</div>
        </div>
      </div>
    </div>
  );
};

export default ApiLatencyCard;