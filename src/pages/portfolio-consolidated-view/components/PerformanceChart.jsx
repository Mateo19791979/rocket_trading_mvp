import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

const PerformanceChart = ({ data, timeframe }) => {
  if (!data || data?.length === 0) {
    return (
      <div className="h-80 bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No performance data available</p>
      </div>
    );
  }

  const formatXAxisTick = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      switch (timeframe) {
        case '1d':
          return format(date, 'HH:mm');
        case '1w': case'1m':
          return format(date, 'MM/dd');
        case '3m': case'1y':
          return format(date, 'MMM dd');
        default:
          return format(date, 'MM/dd');
      }
    } catch {
      return dateStr;
    }
  };

  const formatTooltipLabel = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'PPP p');
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload?.length === 0) return null;

    const data = payload?.[0]?.payload;
    
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
        <p className="text-gray-400 text-sm mb-2">
          {formatTooltipLabel(label)}
        </p>
        <div className="space-y-1">
          <p className="text-white font-medium">
            P&L: <span className={`${data?.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${data?.value?.toFixed(2)}
            </span>
          </p>
          {data?.symbol && (
            <p className="text-gray-400 text-sm">
              Last Trade: {data?.symbol}
            </p>
          )}
          {data?.tradeValue && (
            <p className="text-gray-400 text-sm">
              Trade Value: ${data?.tradeValue?.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Determine if overall performance is positive or negative
  const finalValue = data?.[data?.length - 1]?.value || 0;
  const lineColor = finalValue >= 0 ? '#10B981' : '#EF4444';
  const fillColor = finalValue >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisTick}
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#performanceGradient)"
            dot={false}
            activeDot={{ 
              r: 4, 
              stroke: lineColor, 
              strokeWidth: 2, 
              fill: '#1F2937' 
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;