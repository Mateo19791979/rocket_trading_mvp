import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart3, Eye, Filter, Star, TrendingUp } from 'lucide-react';
 import agentKnowledgeQueryService from'../../../services/agentKnowledgeQueryService';

export default function KnowledgeRetrieval({ knowledgeStats }) {
  const [utilizationData, setUtilizationData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('books') // 'books' or 'chunks'
  const [filterAgent, setFilterAgent] = useState('all')

  useEffect(() => {
    loadUtilizationData()
  }, [])

  const loadUtilizationData = async () => {
    try {
      setLoading(true)
      const data = await agentKnowledgeQueryService?.getKnowledgeUtilization()
      setUtilizationData(data)
    } catch (error) {
      console.error('Failed to load utilization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAccessIntensity = (count, maxCount) => {
    const intensity = count / maxCount
    if (intensity >= 0.8) return 'bg-green-500'
    if (intensity >= 0.6) return 'bg-yellow-500'
    if (intensity >= 0.3) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const formatLastAccessed = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BookOpen className="h-6 w-6 text-green-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Knowledge Retrieval Analysis</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={filterAgent}
            onChange={(e) => setFilterAgent(e?.target?.value)}
            className="bg-gray-700 border border-gray-600 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Agents</option>
            <option value="QuantOracle">QuantOracle</option>
            <option value="DataPhoenix">DataPhoenix</option>
            <option value="StrategyWeaver">StrategyWeaver</option>
            <option value="Deployer">Deployer</option>
          </select>
          
          <div className="bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('books')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'books' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Books
            </button>
            <button
              onClick={() => setViewMode('chunks')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'chunks' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Chunks
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Access Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-xl font-bold text-white">{utilizationData?.totalAccesses || 0}</p>
                  <p className="text-sm text-gray-400">Total Accesses</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <p className="text-xl font-bold text-white">{utilizationData?.bookAccess?.length || 0}</p>
                  <p className="text-sm text-gray-400">Active Books</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <p className="text-xl font-bold text-white">87%</p>
                  <p className="text-sm text-gray-400">Utilization Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Book Access Analysis */}
          {viewMode === 'books' && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-400" />
                Most Accessed Books
              </h3>
              <div className="space-y-3">
                {utilizationData?.bookAccess?.map((book, index) => {
                  const maxAccess = Math.max(...(utilizationData?.bookAccess?.map(b => b?.access_count) || [1]))
                  return (
                    <div key={book?.title} className="bg-gray-600/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-200 mb-1">{book?.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">Last accessed: {formatLastAccessed(book?.last_accessed)}</p>
                          
                          <div className="flex items-center mb-2">
                            <div className="bg-gray-600 rounded-full h-2 w-32 mr-3">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${getAccessIntensity(book?.access_count, maxAccess)}`}
                                style={{ width: `${(book?.access_count / maxAccess) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-300">{book?.access_count} accesses</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {book?.top_agents?.map(agent => (
                              <span key={agent} className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs">
                                {agent}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className={`w-3 h-3 rounded-full mb-1 ${getAccessIntensity(book?.access_count, maxAccess)}`}></div>
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chunk Popularity Analysis */}
          {viewMode === 'chunks' && (
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-purple-400" />
                Most Popular Chunks
              </h3>
              <div className="space-y-3">
                {utilizationData?.chunkPopularity?.map((chunk, index) => {
                  const maxAccess = Math.max(...(utilizationData?.chunkPopularity?.map(c => c?.access_count) || [1]))
                  return (
                    <div key={index} className="bg-gray-600/30 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium mr-3">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-300">{chunk?.access_count} accesses</span>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                            {chunk?.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">From: {chunk?.book}</span>
                            <div className="bg-gray-600 rounded-full h-1.5 w-20">
                              <div 
                                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${(chunk?.access_count / maxAccess) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Access Pattern Insights */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Access Pattern Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Peak Access Times</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">9:00 AM - 11:00 AM</span>
                    <span className="text-sm font-medium text-green-400">High Activity</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">2:00 PM - 4:00 PM</span>
                    <span className="text-sm font-medium text-yellow-400">Moderate Activity</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">11:00 PM - 2:00 AM</span>
                    <span className="text-sm font-medium text-red-400">Low Activity</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Domain Preferences</h4>
                <div className="space-y-2">
                  {knowledgeStats?.topDomains?.map(domain => (
                    <div key={domain} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{domain}</span>
                      <div className="w-16 bg-gray-600 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}