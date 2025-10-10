import React, { useState, useEffect } from 'react';
import { Settings, Target, Sliders, PlayCircle, AlertCircle, CheckCircle } from 'lucide-react';
 import agentKnowledgeQueryService from'../../../services/agentKnowledgeQueryService';

export default function QueryOptimization() {
  const [optimizationData, setOptimizationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testQuery, setTestQuery] = useState('financial machine learning backtesting strategies')
  const [similarityThreshold, setSimilarityThreshold] = useState(0.75)
  const [chunkRanking, setChunkRanking] = useState('cosine')
  const [maxResults, setMaxResults] = useState(8)
  const [testResults, setTestResults] = useState(null)

  useEffect(() => {
    // Initialize with mock optimization data
    setOptimizationData({
      currentThreshold: 0.75,
      avgSimilarity: 0.84,
      optimalRange: [0.70, 0.85],
      performanceScore: 87
    })
  }, [])

  const runOptimizationTest = async () => {
    try {
      setLoading(true)
      const results = await agentKnowledgeQueryService?.testSearchOptimization(testQuery, similarityThreshold)
      setTestResults(results)
    } catch (error) {
      console.error('Optimization test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getThresholdColor = (value) => {
    if (value >= 0.8) return 'text-green-400'
    if (value >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPerformanceGrade = (score) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-400 bg-green-900/20' }
    if (score >= 80) return { grade: 'B', color: 'text-blue-400 bg-blue-900/20' }
    if (score >= 70) return { grade: 'C', color: 'text-yellow-400 bg-yellow-900/20' }
    return { grade: 'D', color: 'text-red-400 bg-red-900/20' }
  }

  const performanceGrade = getPerformanceGrade(optimizationData?.performanceScore || 0)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Settings className="h-6 w-6 text-orange-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">Query Optimization Dashboard</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${performanceGrade?.color}`}>
          Grade: {performanceGrade?.grade}
        </div>
      </div>
      <div className="space-y-6">
        {/* Current Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xl font-bold ${getThresholdColor(optimizationData?.currentThreshold || 0)}`}>
                  {Math.round((optimizationData?.currentThreshold || 0) * 100)}%
                </p>
                <p className="text-sm text-gray-400">Similarity Threshold</p>
              </div>
              <Target className="h-6 w-6 text-orange-400" />
            </div>
            <div className="mt-2">
              <div className="bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(optimizationData?.currentThreshold || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xl font-bold ${getThresholdColor(optimizationData?.avgSimilarity || 0)}`}>
                  {Math.round((optimizationData?.avgSimilarity || 0) * 100)}%
                </p>
                <p className="text-sm text-gray-400">Avg Similarity</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="mt-2">
              <span className="text-green-400 text-xs">+5.2% this week</span>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-white">{optimizationData?.performanceScore || 0}</p>
                <p className="text-sm text-gray-400">Performance Score</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${performanceGrade?.color}`}>
                {performanceGrade?.grade}
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Controls */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <Sliders className="h-5 w-5 mr-2 text-purple-400" />
            Semantic Search Tuning
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Similarity Threshold: {similarityThreshold}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e?.target?.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.5 (Broad)</span>
                  <span>0.95 (Precise)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chunk Ranking Algorithm
                </label>
                <select
                  value={chunkRanking}
                  onChange={(e) => setChunkRanking(e?.target?.value)}
                  className="w-full bg-gray-600 border border-gray-500 text-gray-300 text-sm rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="cosine">Cosine Similarity</option>
                  <option value="euclidean">Euclidean Distance</option>
                  <option value="manhattan">Manhattan Distance</option>
                  <option value="hybrid">Hybrid Scoring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Results: {maxResults}
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="1"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e?.target?.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Query
                </label>
                <textarea
                  value={testQuery}
                  onChange={(e) => setTestQuery(e?.target?.value)}
                  className="w-full bg-gray-600 border border-gray-500 text-gray-300 text-sm rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  rows="3"
                  placeholder="Enter a test query to optimize..."
                />
              </div>

              <button
                onClick={runOptimizationTest}
                disabled={loading || !testQuery?.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Running Test...' : 'Run Optimization Test'}
              </button>

              {/* Optimal Range Indicator */}
              <div className="bg-gray-600/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Optimal Range</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">
                    {Math.round((optimizationData?.optimalRange?.[0] || 0.7) * 100)}% - {Math.round((optimizationData?.optimalRange?.[1] || 0.85) * 100)}%
                  </span>
                  <span className="text-gray-400">Recommended</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Optimization Test Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-600/50 rounded-lg p-3">
                <p className="text-lg font-bold text-white">{testResults?.totalResults}</p>
                <p className="text-sm text-gray-400">Total Results</p>
              </div>
              
              <div className="bg-gray-600/50 rounded-lg p-3">
                <p className="text-lg font-bold text-green-400">{testResults?.aboveThreshold}</p>
                <p className="text-sm text-gray-400">Above Threshold</p>
              </div>
              
              <div className="bg-gray-600/50 rounded-lg p-3">
                <p className={`text-lg font-bold ${getThresholdColor(testResults?.avgSimilarity)}`}>
                  {Math.round(testResults?.avgSimilarity * 100)}%
                </p>
                <p className="text-sm text-gray-400">Avg Similarity</p>
              </div>
            </div>

            {/* Recommendations */}
            {testResults?.recommendations?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
                  Optimization Recommendations
                </h4>
                {testResults?.recommendations?.map((recommendation, index) => (
                  <div key={index} className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                    <p className="text-sm text-yellow-200">{recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Real-time Impact Assessment */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Real-time Impact Assessment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Query Speed</span>
                  <span className="text-sm font-medium text-green-400">+15.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Result Quality</span>
                  <span className="text-sm font-medium text-blue-400">+8.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Agent Satisfaction</span>
                  <span className="text-sm font-medium text-purple-400">+12.1%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">System Load</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">CPU Usage</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                    </div>
                    <span className="text-sm text-gray-300">34%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Memory</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                    <span className="text-sm text-gray-300">67%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Vector DB</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-600 rounded-full h-2 mr-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-sm text-gray-300">45%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}