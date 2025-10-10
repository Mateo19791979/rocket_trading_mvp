import React, { useState, useEffect } from 'react';
import { Search, Activity, Brain, TrendingUp, Database, Users } from 'lucide-react';
import AgentQueryMonitor from './components/AgentQueryMonitor';
import QueryPerformanceAnalytics from './components/QueryPerformanceAnalytics';
import KnowledgeRetrieval from './components/KnowledgeRetrieval';
import QueryOptimization from './components/QueryOptimization';
import AgentIntelligenceInsights from './components/AgentIntelligenceInsights';
import agentKnowledgeQueryService from '../../services/agentKnowledgeQueryService';

export default function AgentKnowledgeQueryInterface() {
  const [loading, setLoading] = useState(true);
  const [knowledgeStats, setKnowledgeStats] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [timeRange, setTimeRange] = useState('1h');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const stats = await agentKnowledgeQueryService?.getKnowledgeBaseStats()
      setKnowledgeStats(stats)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadDashboardData()
    
    // Set up auto-refresh
    const interval = setInterval(loadDashboardData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const handleRefresh = () => {
    loadDashboardData()
  }

  if (loading && !knowledgeStats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Agent Knowledge Query Interface...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-white">Agent Knowledge Query Interface</h1>
                <p className="text-sm text-gray-400">RAG System Monitoring & Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Agent Filter */}
              <select 
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e?.target?.value)}
                className="bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Agents</option>
                <option value="QuantOracle">QuantOracle</option>
                <option value="StrategyWeaver">StrategyWeaver</option>
                <option value="DataPhoenix">DataPhoenix</option>
                <option value="Deployer">Deployer</option>
                <option value="ComplianceGuard">ComplianceGuard</option>
              </select>
              
              {/* Time Range */}
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e?.target?.value)}
                className="bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="5m">Last 5 minutes</option>
                <option value="1h">Last hour</option>
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
              </select>
              
              {/* Refresh Button */}
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <Activity className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Knowledge Base Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{knowledgeStats?.totalBooks || 0}</p>
                <p className="text-gray-400 text-sm">Knowledge Books</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{knowledgeStats?.totalChunks || 0}</p>
                <p className="text-gray-400 text-sm">Indexed Chunks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-gray-400 text-sm">Active Agents</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{knowledgeStats?.avgChunksPerBook || 0}</p>
                <p className="text-gray-400 text-sm">Avg Chunks/Book</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <AgentQueryMonitor 
              selectedAgent={selectedAgent}
              timeRange={timeRange}
            />
            
            <QueryPerformanceAnalytics 
              timeRange={timeRange}
            />
            
            <KnowledgeRetrieval 
              knowledgeStats={knowledgeStats}
            />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            <QueryOptimization />
            
            <AgentIntelligenceInsights 
              selectedAgent={selectedAgent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}