import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Award, Zap, Activity, BarChart3, Users } from 'lucide-react';
 import agentKnowledgeQueryService from'../../../services/agentKnowledgeQueryService';

export default function AgentIntelligenceInsights({ selectedAgent }) {
  const [intelligenceData, setIntelligenceData] = useState(null)
  const [agentActivity, setAgentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('correlation') // 'correlation', 'performance', 'simulation'

  useEffect(() => {
    loadIntelligenceData()
    loadAgentActivity()
  }, [selectedAgent])

  const loadIntelligenceData = async () => {
    try {
      setLoading(true)
      const data = await agentKnowledgeQueryService?.getAgentIntelligenceInsights()
      setIntelligenceData(data)
    } catch (error) {
      console.error('Failed to load intelligence data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAgentActivity = async () => {
    try {
      const activity = agentKnowledgeQueryService?.getAgentActivity()
      let filteredActivity = activity || []
      if (selectedAgent !== 'all') {
        filteredActivity = activity?.filter(agent => agent?.name === selectedAgent) || []
      }
      setAgentActivity(filteredActivity)
    } catch (error) {
      console.error('Failed to load agent activity:', error)
    }
  }

  const getCorrelationColor = (value) => {
    if (value >= 0.8) return 'text-green-400'
    if (value >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getAgentTypeColor = (type) => {
    const colors = {
      'analysis': 'bg-blue-900/20 text-blue-300',
      'execution': 'bg-green-900/20 text-green-300',
      'ingestion': 'bg-purple-900/20 text-purple-300',
      'orchestration': 'bg-yellow-900/20 text-yellow-300',
      'monitoring': 'bg-red-900/20 text-red-300',
      'security': 'bg-orange-900/20 text-orange-300'
    }
    return colors?.[type] || 'bg-gray-900/20 text-gray-300';
  }

  const formatDuration = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Active now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-pink-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Agent Intelligence Insights</h2>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('correlation')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'correlation' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Correlation
          </button>
          <button
            onClick={() => setViewMode('performance')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'performance' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setViewMode('simulation')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              viewMode === 'simulation' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Simulation
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Intelligence Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xl font-bold ${getCorrelationColor(intelligenceData?.overallCorrelation || 0)}`}>
                    {Math.round((intelligenceData?.overallCorrelation || 0) * 100)}%
                  </p>
                  <p className="text-sm text-gray-400">Knowledge Correlation</p>
                </div>
                <TrendingUp className="h-6 w-6 text-pink-400" />
              </div>
              <div className="mt-2">
                <span className="text-green-400 text-xs">+7.8% this week</span>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-white">{agentActivity?.length || 0}</p>
                  <p className="text-sm text-gray-400">Active Agents</p>
                </div>
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="mt-2">
                <span className="text-blue-400 text-xs">24/7 monitoring</span>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-white">18.5%</p>
                  <p className="text-sm text-gray-400">Avg Performance Gain</p>
                </div>
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="mt-2">
                <span className="text-green-400 text-xs">Knowledge-driven</span>
              </div>
            </div>
          </div>

          {/* Knowledge Correlation Analysis */}
          {viewMode === 'correlation' && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-pink-400" />
                Knowledge Application Tracking
              </h3>
              
              <div className="space-y-3">
                {intelligenceData?.topPerformers?.map((agent, index) => (
                  <div key={agent?.agentId} className="bg-gray-600/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-300/20 text-gray-300' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-200">{agent?.name}</h4>
                          <p className="text-xs text-gray-400">Knowledge Correlation</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getCorrelationColor(agent?.knowledgeCorrelation)}`}>
                          {Math.round(agent?.knowledgeCorrelation * 100)}%
                        </p>
                        <p className="text-xs text-gray-400">Decision Accuracy: {Math.round(agent?.decisionAccuracy * 100)}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Knowledge Influence</p>
                        <div className="flex items-center">
                          <div className="bg-gray-600 rounded-full h-2 w-16 mr-2">
                            <div 
                              className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${agent?.knowledgeInfluence}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-300">{Math.round(agent?.knowledgeInfluence)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 mb-1">Performance Gain</p>
                        <span className="text-green-400 font-medium">+{Math.round(agent?.performanceGain)}%</span>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 mb-1">Top Knowledge Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {agent?.topKnowledgeAreas?.slice(0, 2)?.map(area => (
                            <span key={area} className="px-2 py-0.5 bg-pink-900/20 text-pink-300 rounded text-xs">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Performance View */}
          {viewMode === 'performance' && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-400" />
                Real-time Agent Activity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentActivity?.slice(0, 8)?.map(agent => (
                  <div key={agent?.id} className="bg-gray-600/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          agent?.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-200">{agent?.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getAgentTypeColor(agent?.type)}`}>
                            {agent?.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDuration(agent?.lastQuery)}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Queries</span>
                        <span className="text-gray-300 font-medium">{agent?.queryCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Avg Response</span>
                        <span className={`font-medium ${agent?.avgResponseTime < 200 ? 'text-green-400' : agent?.avgResponseTime < 400 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {agent?.avgResponseTime}ms
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Knowledge Hits</span>
                        <span className="text-blue-400 font-medium">{agent?.knowledgeHits}</span>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1">Preferred Domains</p>
                        <div className="flex flex-wrap gap-1">
                          {agent?.preferredDomains?.slice(0, 2)?.map(domain => (
                            <span key={domain} className="px-1.5 py-0.5 bg-blue-900/20 text-blue-300 rounded text-xs">
                              {domain}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query Simulation */}
          {viewMode === 'simulation' && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                Interactive Query Simulation
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-600/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Manual Knowledge Injection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Target Agent</label>
                      <select className="w-full bg-gray-600 border border-gray-500 text-gray-300 text-sm rounded px-3 py-2">
                        <option>QuantOracle</option>
                        <option>StrategyWeaver</option>
                        <option>DataPhoenix</option>
                        <option>Deployer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Knowledge Domain</label>
                      <select className="w-full bg-gray-600 border border-gray-500 text-gray-300 text-sm rounded px-3 py-2">
                        <option>Financial ML</option>
                        <option>System Architecture</option>
                        <option>Risk Management</option>
                        <option>Data Pipeline</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs text-gray-400 mb-2">Knowledge Content</label>
                    <textarea
                      className="w-full bg-gray-600 border border-gray-500 text-gray-300 text-sm rounded px-3 py-2"
                      rows="3"
                      placeholder="Enter knowledge content to inject..."
                    />
                  </div>
                  
                  <button className="mt-3 bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                    Inject Knowledge
                  </button>
                </div>

                <div className="bg-gray-600/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Impact Prediction</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-green-400">+24%</p>
                      <p className="text-xs text-gray-400">Decision Speed</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-blue-400">+18%</p>
                      <p className="text-xs text-gray-400">Accuracy Gain</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-purple-400">+31%</p>
                      <p className="text-xs text-gray-400">Knowledge Utilization</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-600/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Comprehensive Logging</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                      <span className="text-gray-300">Agent-Knowledge Interactions</span>
                      <span className="text-green-400">Enabled</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                      <span className="text-gray-300">Performance Analysis Export</span>
                      <button className="text-blue-400 hover:text-blue-300">Export CSV</button>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                      <span className="text-gray-300">System Optimization Reports</span>
                      <button className="text-purple-400 hover:text-purple-300">Generate</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}