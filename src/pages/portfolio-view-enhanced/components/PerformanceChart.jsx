import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <div>No performance data available</div>
        </div>
      </div>
    );
  }

  // Process data for chart
  const chartData = data?.map(point => ({
    date: new Date(point?.date)?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    value: point?.value || 0,
    fullDate: point?.date
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-1">{label}</p>
          <p className="text-blue-400 font-semibold">
            ${data?.value?.toLocaleString() || '0'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate performance metrics
  const firstValue = chartData?.[0]?.value || 0;
  const lastValue = chartData?.[chartData?.length - 1]?.value || 0;
  const totalChange = lastValue - firstValue;
  const percentChange = firstValue > 0 ? ((totalChange / firstValue) * 100) : 0;
  const isPositive = totalChange >= 0;

  return (
    <div className="space-y-4">
      {/* Performance Summary */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-white">
            ${lastValue?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-gray-400">Current Value</div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}${totalChange?.toLocaleString() || '0'}
          </div>
          <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{percentChange?.toFixed(2) || '0'}%
          </div>
        </div>
      </div>
      {/* Chart */}
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Chart Statistics */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-400">Period Start</div>
          <div className="font-medium text-white">
            ${firstValue?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Period End</div>
          <div className="font-medium text-white">
            ${lastValue?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Data Points</div>
          <div className="font-medium text-white">
            {chartData?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;