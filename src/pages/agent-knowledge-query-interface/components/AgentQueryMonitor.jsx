import React, { useState, useEffect } from 'react';
import { Activity, Search, Clock, Target, Zap, User } from 'lucide-react';
import agentKnowledgeQueryService from '../../../services/agentKnowledgeQueryService';

export default function AgentQueryMonitor({ selectedAgent, timeRange }) {
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadQueryData = async () => {
    try {
      setLoading(true)
      const metrics = await agentKnowledgeQueryService?.getQueryMetrics()
      
      let filteredQueries = metrics?.recentQueries || []
      if (selectedAgent !== 'all') {
        filteredQueries = filteredQueries?.filter(q => q?.agent === selectedAgent)
      }
      
      setQueries(filteredQueries)
      setStats({
        totalQueries: filteredQueries?.length,
        avgResponseTime: filteredQueries?.reduce((sum, q) => sum + q?.responseTime, 0) / (filteredQueries?.length || 1),
        successRate: filteredQueries?.filter(q => q?.status === 'completed')?.length / (filteredQueries?.length || 1),
        avgSimilarity: filteredQueries?.reduce((sum, q) => sum + q?.similarity, 0) / (filteredQueries?.length || 1)
      })
    } catch (error) {
      console.error('Failed to load query data:', error)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    loadQueryData()
    
    // Simulate real-time updates
    const interval = setInterval(loadQueryData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [selectedAgent, timeRange])

  const getAgentColor = (agent) => {
    const colors = {
      'QuantOracle': 'text-blue-400 bg-blue-900/20',
      'StrategyWeaver': 'text-green-400 bg-green-900/20',
      'DataPhoenix': 'text-purple-400 bg-purple-900/20',
      'Deployer': 'text-yellow-400 bg-yellow-900/20',
      'ComplianceGuard': 'text-red-400 bg-red-900/20'
    }
    return colors?.[agent] || 'text-gray-400 bg-gray-900/20';
  }

  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-green-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Agent Query Monitor</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Updates</span>
        </div>
      </div>
      {/* Query Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center">
              <Search className="h-4 w-4 text-blue-400 mr-2" />
              <div>
                <p className="text-lg font-semibold text-white">{stats?.totalQueries}</p>
                <p className="text-xs text-gray-400">Total Queries</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-green-400 mr-2" />
              <div>
                <p className="text-lg font-semibold text-white">{Math.round(stats?.avgResponseTime)}ms</p>
                <p className="text-xs text-gray-400">Avg Response</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-purple-400 mr-2" />
              <div>
                <p className="text-lg font-semibold text-white">{Math.round(stats?.avgSimilarity * 100)}%</p>
                <p className="text-xs text-gray-400">Avg Similarity</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-yellow-400 mr-2" />
              <div>
                <p className="text-lg font-semibold text-white">{Math.round(stats?.successRate * 100)}%</p>
                <p className="text-xs text-gray-400">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Live Query Stream */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Live Query Stream</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          </div>
        ) : queries?.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {queries?.map((query) => (
              <div key={query?.id} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAgentColor(query?.agent)}`}>
                        <User className="h-3 w-3 mr-1" />
                        {query?.agent}
                      </span>
                      <span className="ml-3 text-xs text-gray-400">
                        {formatTime(query?.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      "{query?.query}"
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {Math.round(query?.similarity * 100)}% similarity
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {query?.responseTime}ms
                      </span>
                      <span className="flex items-center">
                        <Search className="h-3 w-3 mr-1" />
                        {query?.chunks_retrieved} chunks
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-3">
                    <div className={`w-2 h-2 rounded-full ${query?.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent queries for the selected agent</p>
          </div>
        )}
      </div>
    </div>
  );
}