import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  PauseCircle, 
  RotateCcw, 
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { aiLearningService } from '@/services/aiLearningService';

export default function LearningLoopController({ stats, onStatsUpdate }) {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCritique, setLastCritique] = useState(null);

  const runCritique = async () => {
    try {
      setLoading(true);
      
      // Simulate critique execution
      const mockCritique = {
        timestamp: new Date(),
        recurring: [
          { error_sig: 'timeout_error_001', count: 5, action: 'increase_timeout_threshold' },
          { error_sig: 'parse_error_002', count: 3, action: 'improve_data_validation' }
        ],
        advice: [
          'Consider implementing exponential backoff for API calls',
          'Add more robust error handling for data parsing',
          'Implement circuit breaker pattern for external services'
        ],
        improvements: 7,
        status: 'completed'
      };
      
      setLastCritique(mockCritique);
      
      // Refresh stats
      const statsResult = await aiLearningService?.getDecisionStats();
      if (statsResult?.data) {
        onStatsUpdate(statsResult?.data);
      }
      
    } catch (error) {
      console.error('Critique execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLearning = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <RotateCcw className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Learning Loop Controller</h3>
            <p className="text-sm text-gray-400">Autonomous learning system management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-400">{isRunning ? 'Active' : 'Paused'}</span>
        </div>
      </div>
      {/* Learning Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-xl font-semibold text-green-400">{stats?.successRate}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-400" />
          </div>
          <div className="mt-2">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats?.successRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Decisions</p>
              <p className="text-xl font-semibold text-blue-400">{stats?.totalDecisions}</p>
            </div>
            <Activity className="h-6 w-6 text-blue-400" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Last 7 days
          </div>
        </div>
      </div>
      {/* Decision Breakdown by Agent */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Performance by Agent</h4>
        <div className="space-y-2">
          {Object.entries(stats?.byAgent || {})?.map(([agent, data]) => (
            <div key={agent} className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-purple-400" />
                <span className="text-sm text-gray-300">{agent}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">{data?.total} decisions</span>
                <span className="text-sm text-green-400">
                  {data?.total > 0 ? Math.round((data?.success / data?.total) * 100) : 0}% success
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Control Buttons */}
      <div className="flex space-x-3">
        <motion.button
          onClick={toggleLearning}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-all ${
            isRunning 
              ? 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30' :'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRunning ? (
            <>
              <PauseCircle className="h-5 w-5" />
              <span>Pause Learning</span>
            </>
          ) : (
            <>
              <PlayCircle className="h-5 w-5" />
              <span>Start Learning</span>
            </>
          )}
        </motion.button>

        <motion.button
          onClick={runCritique}
          disabled={loading}
          className="flex items-center justify-center space-x-2 py-3 px-6 bg-purple-600/20 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Run Critique</span>
        </motion.button>
      </div>
      {/* Last Critique Results */}
      {lastCritique && (
        <div className="mt-6 bg-gray-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-300">Last Critique</h4>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-400">
                {lastCritique?.timestamp?.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">
                {lastCritique?.improvements} improvements identified
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-gray-300">
                {lastCritique?.recurring?.length} recurring issues found
              </span>
            </div>
          </div>

          {lastCritique?.advice?.length > 0 && (
            <div className="mt-3 space-y-1">
              {lastCritique?.advice?.slice(0, 2)?.map((advice, index) => (
                <div key={index} className="text-xs text-gray-400 flex items-start space-x-2">
                  <span className="text-purple-400">•</span>
                  <span>{advice}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}