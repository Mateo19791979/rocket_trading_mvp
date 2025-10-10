import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Clock, Target, Users, BookOpen } from 'lucide-react';
 import agentKnowledgeQueryService from'../../../services/agentKnowledgeQueryService';

export default function QueryPerformanceAnalytics({ timeRange }) {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const data = await agentKnowledgeQueryService?.getQueryMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (value, threshold) => {
    if (value >= threshold * 0.9) return 'text-green-400'
    if (value >= threshold * 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatResponseTime = (time) => {
    return time > 1000 ? `${(time / 1000)?.toFixed(1)}s` : `${time}ms`;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart className="h-6 w-6 text-blue-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Query Performance Analytics</h2>
        </div>
        <div className="text-sm text-gray-400">
          Last {timeRange === '5m' ? '5 minutes' : timeRange === '1h' ? 'hour' : timeRange === '24h' ? '24 hours' : '7 days'}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{metrics?.totalQueries || 0}</p>
                  <p className="text-sm text-gray-400">Total Queries</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <div className="mt-2">
                <span className="text-green-400 text-sm">+12.5%</span>
                <span className="text-gray-500 text-sm ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${getPerformanceColor(metrics?.avgResponseTime || 0, 200)}`}>
                    {formatResponseTime(metrics?.avgResponseTime || 0)}
                  </p>
                  <p className="text-sm text-gray-400">Avg Response Time</p>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
              <div className="mt-2">
                <span className="text-green-400 text-sm">-8.2%</span>
                <span className="text-gray-500 text-sm ml-1">improvement</span>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${getPerformanceColor(metrics?.avgSimilarity || 0, 0.8)}`}>
                    {Math.round((metrics?.avgSimilarity || 0) * 100)}%
                  </p>
                  <p className="text-sm text-gray-400">Avg Similarity</p>
                </div>
                <Target className="h-8 w-8 text-purple-400" />
              </div>
              <div className="mt-2">
                <span className="text-green-400 text-sm">+3.1%</span>
                <span className="text-gray-500 text-sm ml-1">quality gain</span>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${getPerformanceColor(metrics?.successRate || 0, 0.95)}`}>
                    {Math.round((metrics?.successRate || 0) * 100)}%
                  </p>
                  <p className="text-sm text-gray-400">Success Rate</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="mt-2">
                <span className="text-green-400 text-sm">+1.2%</span>
                <span className="text-gray-500 text-sm ml-1">reliability</span>
              </div>
            </div>
          </div>

          {/* Agent Frequency */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              Most Active Agents
            </h3>
            <div className="space-y-3">
              {Object.entries(metrics?.agentFrequency || {})?.sort(([,a], [,b]) => b - a)?.slice(0, 5)?.map(([agent, count], index) => (
                  <div key={agent} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-yellow-400' : 
                        index === 1 ? 'bg-gray-300' : 
                        index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                      }`}></div>
                      <span className="text-gray-300">{agent}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-gray-600 rounded-full h-2 w-20 mr-3">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(count / Math.max(...Object.values(metrics?.agentFrequency || {}))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400 w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Queried Topics */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-purple-400" />
              Most Queried Topics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics?.topTopics?.map((topic, index) => (
                <div key={topic} className="flex items-center p-3 bg-gray-600/30 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 font-medium text-sm">{index + 1}</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-300">{topic}</p>
                    <p className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 10} queries</p>
                  </div>
                </div>
              )) || []}
            </div>
          </div>

          {/* Performance Trend Indicator */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Performance Trend</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">+15.2%</p>
                <p className="text-sm text-gray-400">Query Efficiency</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">+8.7%</p>
                <p className="text-sm text-gray-400">Knowledge Utilization</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">+12.3%</p>
                <p className="text-sm text-gray-400">Agent Performance</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}