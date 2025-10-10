import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Play, Pause, AlertTriangle, Target, Shield } from 'lucide-react';
import ImmediateTriggerPanel from './components/ImmediateTriggerPanel';
import AIThoughtsStream from './components/AIThoughtsStream';
import MultiSourceObservatory from './components/MultiSourceObservatory';
import SqlVisionInterface from './components/SqlVisionInterface';
import { aasObservatoryService } from '../../services/aasObservatoryService';

export default function AASRealTimeAIThoughtsObservatory() {
  const [observatoryStatus, setObservatoryStatus] = useState('active');
  const [cognitiveMetrics, setCognitiveMetrics] = useState({
    activeAgents: 0,
    thoughtsPerMinute: 0,
    averageConfidence: 0,
    criticalDecisions: 0,
    systemMode: 'normal'
  });
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeObservatory();
    const interval = setInterval(refreshMetrics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const refreshMetrics = async () => {
    try {
      const metrics = await aasObservatoryService?.getCognitiveMetrics();
      setCognitiveMetrics(metrics);
    } catch (error) {
      console.error('Metrics refresh error:', error);
    }
  };

  const initializeObservatory = async () => {
    try {
      const metrics = await aasObservatoryService?.getCognitiveMetrics();
      setCognitiveMetrics(metrics);
      setIsLoading(false);
    } catch (error) {
      console.error('Observatory initialization error:', error);
      setIsLoading(false);
    }
  };

  const toggleObservatoryStatus = () => {
    setObservatoryStatus(prev => prev === 'active' ? 'monitoring' : 'active');
  };

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-400 animate-pulse" />
          <p className="text-gray-300 text-lg">Initializing AI Observatory...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="bg-gray-800/80 backdrop-blur-sm border-b border-blue-500/30 p-4 sticky top-0 z-10"
        variants={cardVariants}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-400" />
              <div className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${
                observatoryStatus === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              }`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AAS Real-Time AI Thoughts Observatory</h1>
              <p className="text-gray-400 text-sm">
                Monitoring {cognitiveMetrics?.activeAgents || 0} agents · {cognitiveMetrics?.thoughtsPerMinute || 0} thoughts/min
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* System Status Indicators */}
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${
                cognitiveMetrics?.systemMode === 'normal' ? 'bg-green-400' :
                cognitiveMetrics?.systemMode === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
              } animate-pulse`} />
              <span className="text-gray-300 text-sm capitalize">
                {cognitiveMetrics?.systemMode || 'Unknown'}
              </span>
            </div>
            
            <button
              onClick={toggleObservatoryStatus}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                observatoryStatus === 'active' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
              }`}
            >
              {observatoryStatus === 'active' ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {observatoryStatus === 'active' ? 'Pause Observatory' : 'Resume Observatory'}
            </button>
          </div>
        </div>
      </motion.div>
      {/* Alert Banner */}
      <AnimatePresence>
        {alerts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/80 border-b border-red-500/30 p-3"
          >
            <div className="max-w-7xl mx-auto flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-200 text-sm">
                {alerts?.[0]?.message || 'System alert detected'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-120px)]">
        
        {/* Left Column - Immediate Trigger Panel & AI Thoughts Stream */}
        <motion.div 
          className="lg:col-span-1 space-y-6"
          variants={cardVariants}
        >
          <ImmediateTriggerPanel 
            onTriggerExecuted={refreshMetrics}
            systemStatus={observatoryStatus}
          />
          
          <AIThoughtsStream 
            isActive={observatoryStatus === 'active'}
            cognitiveMetrics={cognitiveMetrics}
          />
        </motion.div>

        {/* Center Column - Multi-Source Observatory Dashboard */}
        <motion.div 
          className="lg:col-span-1"
          variants={cardVariants}
        >
          <MultiSourceObservatory 
            isActive={observatoryStatus === 'active'}
            cognitiveMetrics={cognitiveMetrics}
            onSystemAlert={(alert) => setAlerts(prev => [...prev?.slice(-4), alert])}
          />
        </motion.div>

        {/* Right Column - SQL Vision Interface */}
        <motion.div 
          className="lg:col-span-1"
          variants={cardVariants}
        >
          <SqlVisionInterface 
            isActive={observatoryStatus === 'active'}
            cognitiveMetrics={cognitiveMetrics}
          />
        </motion.div>
      </div>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
          title="Neural Network View"
        >
          <Activity className="h-5 w-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg"
          title="Cognitive Patterns"
        >
          <Target className="h-5 w-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg"
          title="System Health"
        >
          <Shield className="h-5 w-5" />
        </motion.button>
      </div>
      {/* Background Neural Network Animation */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-green-400/10" />
        <div className="neural-network-bg" />
      </div>
    </motion.div>
  );
}