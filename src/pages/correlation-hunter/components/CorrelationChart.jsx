import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CorrelationChart = ({ historicalData, selectedAssets }) => {
  if (!historicalData?.length || !selectedAssets?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No historical data available for chart
      </div>
    );
  }

  // Process data for chart
  const processChartData = () => {
    // Group data by date
    const dateGroups = {};
    
    historicalData?.forEach(point => {
      const date = new Date(point?.timestamp)?.toDateString();
      const symbol = point?.assets?.symbol;
      
      if (!dateGroups?.[date]) {
        dateGroups[date] = { date };
      }
      
      dateGroups[date][symbol] = parseFloat(point?.close_price) || 0;
    });

    // Convert to array and sort by date
    const chartData = Object.values(dateGroups)?.sort((a, b) => new Date(a.date) - new Date(b.date))?.map((item, index) => ({
        ...item,
        dayIndex: index
      }));

    // Normalize prices to percentage change from first day
    if (chartData?.length > 0) {
      const baseData = chartData?.[0];
      
      return chartData?.map(item => {
        const normalizedItem = { ...item };
        selectedAssets?.forEach(asset => {
          const symbol = asset?.symbol;
          const currentPrice = item?.[symbol];
          const basePrice = baseData?.[symbol];
          
          if (basePrice && basePrice > 0) {
            normalizedItem[symbol] = ((currentPrice - basePrice) / basePrice) * 100;
          } else {
            normalizedItem[symbol] = 0;
          }
        });
        return normalizedItem;
      });
    }
    
    return [];
  };

  const chartData = processChartData();
  
  // Color palette for lines
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const dataPoint = chartData?.find(d => d?.dayIndex === label);
      const date = dataPoint?.date ? new Date(dataPoint.date)?.toLocaleDateString() : '';
      
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{date}</p>
          {payload?.map((entry, index) => (
            <p key={index} style={{ color: entry?.color }} className="text-sm">
              <span className="font-medium">{entry?.dataKey}:</span> {entry?.value?.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxisTick = (tickItem) => {
    const dataPoint = chartData?.[tickItem];
    if (dataPoint?.date) {
      return new Date(dataPoint.date)?.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        Price movements normalized to percentage change from first day
      </div>
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="dayIndex"
              tickFormatter={formatXAxisTick}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value?.toFixed(1)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {selectedAssets?.map((asset, index) => (
              <Line
                key={asset?.id}
                type="monotone"
                dataKey={asset?.symbol}
                stroke={colors?.[index % colors?.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: colors?.[index % colors?.length], strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Chart Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {selectedAssets?.slice(0, 4)?.map((asset, index) => {
          const symbol = asset?.symbol;
          const values = chartData?.map(d => d?.[symbol])?.filter(v => v !== undefined) || [];
          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);
          const finalValue = values?.[values?.length - 1] || 0;
          
          return (
            <div key={asset?.id} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors?.[index % colors?.length] }}
                ></div>
                <span className="font-medium text-white">{symbol}</span>
              </div>
              <div className="space-y-1 text-xs text-gray-400">
                <div>Current: {finalValue?.toFixed(2)}%</div>
                <div>Range: {minValue?.toFixed(2)}% to {maxValue?.toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CorrelationChart;