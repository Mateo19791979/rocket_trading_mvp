import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AssetAllocation = ({ data }) => {
  const COLORS = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
    '#6366F1'  // indigo
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(value || 0);
  };

  if (!data || data?.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
        <div className="text-center text-gray-400 py-12">
          No allocation data available
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload?.length === 0) return null;

    const data = payload?.[0]?.payload;
    
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
        <p className="text-white font-medium">{data?.symbol}</p>
        <p className="text-gray-400 text-sm">{data?.name}</p>
        <p className="text-blue-500 font-medium">
          {formatCurrency(data?.value)} ({data?.percentage?.toFixed(1)}%)
        </p>
        <p className="text-gray-400 text-sm">
          Qty: {data?.quantity?.toLocaleString()}
        </p>
      </div>
    );
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for slices less than 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100)?.toFixed(0)}%`}
      </text>
    );
  };

  // Group small positions (< 2%) into "Others"
  const threshold = 2;
  const significantData = data?.filter(item => item?.percentage >= threshold);
  const smallData = data?.filter(item => item?.percentage < threshold);
  
  let chartData = [...significantData];
  
  if (smallData?.length > 0) {
    const othersValue = smallData?.reduce((sum, item) => sum + item?.value, 0);
    const othersPercentage = smallData?.reduce((sum, item) => sum + item?.percentage, 0);
    
    chartData?.push({
      symbol: 'Others',
      name: `${smallData?.length} positions`,
      value: othersValue,
      percentage: othersPercentage,
      quantity: smallData?.length
    });
  }

  const totalValue = data?.reduce((sum, item) => sum + item?.value, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {chartData?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS?.[index % COLORS?.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Details */}
        <div className="space-y-3">
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-white">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-gray-400 text-sm">Total Portfolio Value</p>
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-2">
            {chartData?.map((item, index) => (
              <div key={item?.symbol} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-3"
                    style={{ backgroundColor: COLORS?.[index % COLORS?.length] }}
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{item?.symbol}</p>
                    {item?.symbol !== 'Others' && (
                      <p className="text-gray-400 text-xs truncate max-w-24">
                        {item?.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">
                    {item?.percentage?.toFixed(1)}%
                  </p>
                  <p className="text-gray-400 text-xs">
                    {formatCurrency(item?.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation;