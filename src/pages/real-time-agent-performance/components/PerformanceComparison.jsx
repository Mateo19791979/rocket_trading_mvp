import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const PerformanceComparison = ({ data }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(value || 0);
  };

  if (!data || data?.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Comparison</h3>
        <div className="text-center text-gray-400 py-12">
          No comparative data available
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload?.length === 0) return null;

    const data = payload?.[0]?.payload;
    
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
        <p className="text-white font-medium">{data?.name}</p>
        <p className="text-gray-400 text-sm capitalize">Strategy: {data?.strategy}</p>
        <div className="mt-2 space-y-1">
          <p className="text-blue-500">
            Total P&L: {formatCurrency(data?.totalPnL)}
          </p>
          <p className="text-green-500">
            Win Rate: {data?.winRate?.toFixed(1)}%
          </p>
          <p className="text-purple-500">
            Sharpe Ratio: {data?.sharpeRatio}
          </p>
          <p className="text-yellow-500">
            Max Drawdown: {data?.maxDrawdown?.toFixed(1)}%
          </p>
          <p className="text-gray-400">
            Total Trades: {data?.totalTrades}
          </p>
        </div>
      </div>
    );
  };

  const ScatterTooltip = ({ active, payload }) => {
    if (!active || !payload || payload?.length === 0) return null;

    const data = payload?.[0]?.payload;
    
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
        <p className="text-white font-medium">{data?.name}</p>
        <div className="mt-2 space-y-1">
          <p className="text-blue-500">
            Win Rate: {data?.winRate?.toFixed(1)}%
          </p>
          <p className="text-green-500">
            Total P&L: {formatCurrency(data?.totalPnL)}
          </p>
          <p className="text-gray-400">
            Risk-Adjusted Return: {data?.riskAdjustedReturn?.toFixed(2)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white">Agent Performance Comparison</h3>
      {/* P&L Comparison Bar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Total P&L by Agent</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalPnL" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Win Rate vs P&L Scatter Plot */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Win Rate vs Total P&L</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number"
                dataKey="winRate" 
                stroke="#9CA3AF" 
                fontSize={12}
                name="Win Rate"
                unit="%"
                domain={[0, 100]}
              />
              <YAxis 
                type="number"
                dataKey="totalPnL"
                stroke="#9CA3AF" 
                fontSize={12}
                name="Total P&L"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter 
                name="Agents" 
                dataKey="totalPnL" 
                fill="#10B981"
                strokeWidth={2}
                stroke="#059669"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Performance Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-400 mb-2">Best Performer</h5>
          {data?.length > 0 && (
            <div>
              <p className="text-white font-semibold">{data?.[0]?.name}</p>
              <p className="text-green-500 text-sm">
                {formatCurrency(data?.[0]?.totalPnL)} • {data?.[0]?.winRate?.toFixed(1)}% win rate
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-400 mb-2">Most Active</h5>
          {data?.length > 0 && (
            <div>
              {(() => {
                const mostActive = data?.reduce((max, agent) => 
                  agent?.totalTrades > max?.totalTrades ? agent : max, data?.[0]);
                return (
                  <>
                    <p className="text-white font-semibold">{mostActive?.name}</p>
                    <p className="text-blue-500 text-sm">
                      {mostActive?.totalTrades} trades • {mostActive?.winRate?.toFixed(1)}% win rate
                    </p>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceComparison;