import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, AlertCircle, CheckCircle, Zap, Target, RefreshCw } from 'lucide-react';
import { aiLearningService } from '@/services/aiLearningService';
import LearningLoopController from './components/LearningLoopController';
import AICritiqueEngine from './components/AICritiqueEngine';
import DecisionIntelligenceDashboard from './components/DecisionIntelligenceDashboard';
import TelemetryMonitor from './components/TelemetryMonitor';
import DataHealthIndex from './components/DataHealthIndex';
import BanditAlgorithmController from './components/BanditAlgorithmController';

export default function AILearningCritiqueCenter() {
  const [stats, setStats] = useState({
    totalDecisions: 0,
    successRate: '0.0',
    byAgent: {},
    byOutcome: {}
  });
  const [dhiStatus, setDHIStatus] = useState({
    all: [],
    healthy: [],
    unhealthy: [],
    healthyCount: 0,
    totalStreams: 0
  });
  const [sourceStats, setSourceStats] = useState([]);
  const [iqScores, setIQScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [
        statsResult,
        dhiResult, 
        sourcesResult,
        iqResult
      ] = await Promise.all([
        aiLearningService?.getDecisionStats(),
        aiLearningService?.getDHIStatus(),
        aiLearningService?.getSourceStats(),
        aiLearningService?.getIQScores(10)
      ]);

      if (statsResult?.data) setStats(statsResult?.data);
      if (dhiResult?.data) setDHIStatus(dhiResult?.data);
      if (sourcesResult?.data) setSourceStats(sourcesResult?.data);
      if (iqResult?.data) setIQScores(iqResult?.data);
      
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      setError(`Failed to load AI learning data: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadInitialData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadInitialData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading AI Learning Center...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-950 text-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-900/20 to-teal-900/20 border-b border-purple-800/30"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                  AI Learning & Critique Center
                </h1>
                <p className="text-gray-400 mt-1">
                  Autonomous learning orchestration and critique system management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Last Update</p>
                <p className="text-sm text-gray-300">{lastUpdate?.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-purple-400" />
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Decisions</p>
                  <p className="text-2xl font-semibold text-gray-100">{stats?.totalDecisions}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-semibold text-green-400">{stats?.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Data Streams Healthy</p>
                  <p className="text-2xl font-semibold text-teal-400">
                    {dhiStatus?.healthyCount}/{dhiStatus?.totalStreams}
                  </p>
                </div>
                <Target className="h-8 w-8 text-teal-400" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Sources</p>
                  <p className="text-2xl font-semibold text-orange-400">{sourceStats?.length}</p>
                </div>
                <Zap className="h-8 w-8 text-orange-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {error && (
        <motion.div 
          className="bg-red-900/20 border border-red-500 text-red-400 p-4 m-4 rounded-lg"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <LearningLoopController 
              stats={stats}
              onStatsUpdate={setStats}
            />
            <AICritiqueEngine 
              dhiStatus={dhiStatus}
              onDHIUpdate={setDHIStatus}
            />
          </motion.div>

          {/* Center Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <DecisionIntelligenceDashboard 
              iqScores={iqScores}
              stats={stats}
              onUpdate={loadInitialData}
            />
            <TelemetryMonitor 
              lastUpdate={lastUpdate}
              systemStatus="healthy"
            />
          </motion.div>

          {/* Right Column */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <DataHealthIndex 
              dhiData={dhiStatus?.all}
              onUpdate={setDHIStatus}
            />
            <BanditAlgorithmController 
              sourceStats={sourceStats}
              onUpdate={setSourceStats}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}