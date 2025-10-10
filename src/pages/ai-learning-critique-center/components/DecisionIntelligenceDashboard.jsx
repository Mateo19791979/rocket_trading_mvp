import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Brain, Target, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DecisionIntelligenceDashboard({ iqScores, stats, onUpdate }) {
  const [timeframe, setTimeframe] = useState('7d');

  // Mock time series data for decision quality over time
  const decisionTrend = [
    { time: '00:00', success: 85, total: 100, iq: 0.78 },
    { time: '04:00', success: 92, total: 105, iq: 0.82 },
    { time: '08:00', success: 88, total: 110, iq: 0.85 },
    { time: '12:00', success: 94, total: 115, iq: 0.89 },
    { time: '16:00', success: 90, total: 108, iq: 0.86 },
    { time: '20:00', success: 87, total: 102, iq: 0.83 }
  ];

  // IQ Score distribution data
  const iqDistribution = [
    { range: '0-20', count: 2, color: '#ef4444' },
    { range: '20-40', count: 5, color: '#f97316' },
    { range: '40-60', count: 12, color: '#eab308' },
    { range: '60-80', count: 18, color: '#22c55e' },
    { range: '80-100', count: 8, color: '#06b6d4' }
  ];

  const averageIQ = iqScores?.length > 0 
    ? (iqScores?.reduce((sum, score) => sum + score?.iqs, 0) / iqScores?.length)?.toFixed(3)
    : '0.000';

  const topPerformingStrategies = iqScores?.slice(0, 3) || [];

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Brain className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Decision Intelligence Dashboard</h3>
            <p className="text-sm text-gray-400">IQ scores and decision quality metrics</p>
          </div>
        </div>
        
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e?.target?.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-gray-300"
        >
          <option value="1d">1 Day</option>
          <option value="7d">7 Days</option>
          <option value="30d">30 Days</option>
        </select>
      </div>
      {/* Key IQ Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Average IQ</p>
              <p className="text-xl font-semibold text-blue-400">{averageIQ}</p>
            </div>
            <Award className="h-6 w-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">High IQ (&gt;0.8)</p>
              <p className="text-xl font-semibold text-green-400">
                {iqScores?.filter(s => s?.iqs > 0.8)?.length || 0}
              </p>
            </div>
            <Target className="h-6 w-6 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Insights</p>
              <p className="text-xl font-semibold text-purple-400">{iqScores?.length || 0}</p>
            </div>
            <Zap className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
      {/* Decision Quality Trend */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Decision Quality Trend</h4>
        <div className="h-48 bg-gray-800/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={decisionTrend}>
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
                dataKey="iq" 
                stroke="#60a5fa" 
                strokeWidth={2}
                dot={{ fill: '#60a5fa', strokeWidth: 0, r: 4 }}
                name="IQ Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* IQ Score Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">IQ Score Distribution</h4>
        <div className="h-40 bg-gray-800/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={iqDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Top Performing Strategies */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Top Performing Insights</h4>
        <div className="space-y-2">
          {topPerformingStrategies?.map((insight, index) => (
            <motion.div
              key={insight?.insight_id}
              className="bg-gray-800/30 rounded-lg p-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">{insight?.insight_id}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <span className="text-xs text-gray-400">
                        Robustness: {((insight?.breakdown?.robustness || 0) * 100)?.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="text-xs text-gray-400">
                        Stability: {((insight?.breakdown?.stability || 0) * 100)?.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-400">{insight?.iqs?.toFixed(3)}</p>
                  <p className="text-xs text-gray-500">IQ Score</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {topPerformingStrategies?.length === 0 && (
          <div className="bg-gray-800/20 rounded-lg p-8 text-center">
            <Brain className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No IQ scores available yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Run some AI strategies to see intelligence metrics
            </p>
          </div>
        )}
      </div>
    </div>
  );
}