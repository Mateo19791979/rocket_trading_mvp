import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SectorAllocation = ({ allocation, loading }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading allocation...</div>
      </div>
    );
  }

  if (!allocation || Object.keys(allocation)?.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">🥧</div>
          <div>No sector allocation data</div>
        </div>
      </div>
    );
  }

  // Convert allocation object to array for chart
  const chartData = Object.entries(allocation)?.map(([sector, percentage]) => ({
      name: sector,
      value: percentage || 0,
      displayValue: `${(percentage || 0)?.toFixed(1)}%`
    }))?.filter(item => item?.value > 0)?.sort((a, b) => b?.value - a?.value);

  // Color palette for sectors
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data?.payload?.name}</p>
          <p className="text-blue-400">
            {data?.payload?.displayValue}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100)?.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors?.[index % colors?.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend with Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {chartData?.map((item, index) => (
          <div key={item?.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors?.[index % colors?.length] }}
              ></div>
              <span className="text-white font-medium">{item?.name}</span>
            </div>
            <span className="text-gray-300 font-semibold">{item?.displayValue}</span>
          </div>
        ))}
      </div>
      {/* Allocation Summary */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Allocation Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Total Sectors</div>
            <div className="text-lg font-bold text-white">{chartData?.length || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Largest Sector</div>
            <div className="text-lg font-bold text-blue-400">
              {chartData?.[0]?.displayValue || '0%'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Diversification</div>
            <div className="text-lg font-bold text-green-400">
              {chartData?.length >= 5 ? 'Good' : chartData?.length >= 3 ? 'Fair' : 'Poor'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorAllocation;