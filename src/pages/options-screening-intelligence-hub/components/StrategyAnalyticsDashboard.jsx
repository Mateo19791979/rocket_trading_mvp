import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, PieChart, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

export default function StrategyAnalyticsDashboard({ strategies, screeningResults }) {
  const [timeframe, setTimeframe] = useState('1M');
  
  // Mock options chain data
  const optionsChainData = [
    { strike: 140, call_iv: 0.35, put_iv: 0.33, call_volume: 1250, put_volume: 890 },
    { strike: 145, call_iv: 0.32, put_iv: 0.31, call_volume: 1850, put_volume: 1200 },
    { strike: 150, call_iv: 0.30, put_iv: 0.29, call_volume: 2500, put_volume: 1800 },
    { strike: 155, call_iv: 0.31, put_iv: 0.30, call_volume: 1900, put_volume: 1400 },
    { strike: 160, call_iv: 0.33, put_iv: 0.32, call_volume: 1100, put_volume: 950 }
  ];

  // Mock IV tracking data
  const ivTrackingData = [
    { time: '9:30', iv_rank: 45, hv: 28, iv: 35 },
    { time: '10:00', iv_rank: 48, hv: 29, iv: 36 },
    { time: '10:30', iv_rank: 52, hv: 30, iv: 38 },
    { time: '11:00', iv_rank: 49, hv: 28, iv: 37 },
    { time: '11:30', iv_rank: 55, hv: 31, iv: 40 },
    { time: '12:00', iv_rank: 58, hv: 32, iv: 42 }
  ];

  // Strategy type distribution
  const strategyDistribution = [
    { name: 'Bull Call Spreads', value: 35, color: '#10b981' },
    { name: 'Cash Secured Puts', value: 28, color: '#3b82f6' },
    { name: 'Bear Call Spreads', value: 22, color: '#ef4444' },
    { name: 'Long Calls', value: 15, color: '#8b5cf6' }
  ];

  // Greeks summary data
  const greeksData = [
    { metric: 'Delta', value: 0.25, change: '+0.03', color: 'text-green-400' },
    { metric: 'Gamma', value: 0.08, change: '-0.01', color: 'text-red-400' },
    { metric: 'Theta', value: -0.12, change: '-0.02', color: 'text-orange-400' },
    { metric: 'Vega', value: 0.35, change: '+0.05', color: 'text-blue-400' }
  ];

  const totalStrategies = strategies?.length || 0;
  const avgProbability = strategies?.length > 0
    ? (strategies?.reduce((sum, s) => sum + (s?.probability || 0.5), 0) / strategies?.length * 100)?.toFixed(1)
    : '0.0';

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Strategy Analytics Dashboard</h3>
            <p className="text-sm text-gray-400">Real-time options analysis and Greeks calculations</p>
          </div>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e?.target?.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300"
        >
          <option value="1D">1 Day</option>
          <option value="1W">1 Week</option>
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
        </select>
      </div>
      {/* Strategy Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Strategies</p>
              <p className="text-2xl font-semibold text-blue-400">{totalStrategies}</p>
            </div>
            <Target className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Win Prob</p>
              <p className="text-2xl font-semibold text-green-400">{avgProbability}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Opportunities</p>
              <p className="text-2xl font-semibold text-purple-400">{screeningResults?.length || 0}</p>
            </div>
            <Activity className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
      {/* IV Tracking Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Implied Volatility Tracking</h4>
        <div className="h-48 bg-gray-800/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ivTrackingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="iv_rank" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={{ fill: '#60a5fa', strokeWidth: 0, r: 3 }}
                name="IV Rank"
              />
              <Line 
                type="monotone" 
                dataKey="iv" 
                stroke="#34d399" 
                strokeWidth={2}
                dot={{ fill: '#34d399', strokeWidth: 0, r: 3 }}
                name="IV %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Options Chain Analysis */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Options Chain Analysis</h4>
        <div className="h-40 bg-gray-800/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={optionsChainData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="strike" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="call_volume" fill="#10b981" name="Call Volume" radius={[2, 2, 0, 0]} />
              <Bar dataKey="put_volume" fill="#ef4444" name="Put Volume" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Strategy Distribution */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Strategy Distribution</h4>
          <div className="h-32 bg-gray-800/30 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Tooltip />
                <RechartsPieChart data={strategyDistribution}>
                  {strategyDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Greeks Overview</h4>
          <div className="space-y-2">
            {greeksData?.map((greek, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-800/20 rounded p-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{greek?.metric}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-300">{greek?.value}</span>
                  <span className={`text-xs ${greek?.color}`}>{greek?.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Real-time Options Opportunities */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Real-time Opportunities</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {screeningResults?.slice(0, 4)?.map((result, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/20 rounded-lg p-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">
                    {result?.assets?.symbol || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {result?.optionsRecommendation?.replace(/_/g, ' ') || 'neutral'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-400">
                    IV: {result?.iv_rank || 'N/A'}%
                  </p>
                  <p className="text-xs text-gray-400">
                    Score: {result?.composite_score || 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {(!screeningResults || screeningResults?.length === 0) && (
          <div className="bg-gray-800/20 rounded-lg p-6 text-center">
            <PieChart className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No opportunities available</p>
            <p className="text-gray-500 text-xs mt-1">Run screening to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}