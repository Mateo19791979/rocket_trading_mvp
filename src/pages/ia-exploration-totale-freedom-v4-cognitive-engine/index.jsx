import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, Network, CheckCircle, Activity, Lightbulb } from 'lucide-react';
import CognitiveEngineService from '../../services/cognitiveEngineService';
import UniversalIngestionPipeline from './components/UniversalIngestionPipeline';
import ConceptualExtractionEngine from './components/ConceptualExtractionEngine';
import CognitiveReconstructionDashboard from './components/CognitiveReconstructionDashboard';
import ValidationStorageSection from './components/ValidationStorageSection';
import MetaLearningAnalytics from './components/MetaLearningAnalytics';
import CognitiveControls from './components/CognitiveControls';

const IAExplorationTotaleFreedomV4CognitiveEngine = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    recentInsights: [],
    activeJobs: [],
    todayReport: null
  });
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState('active');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    conceptsPerMinute: 0,
    crossDomainConnections: 0,
    trustScoreAverage: 0,
    learningVelocity: 0
  });

  // Load cognitive dashboard data
  useEffect(() => {
    loadCognitiveData();
    const interval = setInterval(loadCognitiveData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Simulate real-time metrics
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        conceptsPerMinute: Math.floor(Math.random() * 15) + 5,
        crossDomainConnections: prev?.crossDomainConnections + Math.floor(Math.random() * 3),
        trustScoreAverage: (Math.random() * 0.3 + 0.7)?.toFixed(3),
        learningVelocity: (Math.random() * 2 + 1)?.toFixed(2)
      }));
    }, 5000);
    return () => clearInterval(metricsInterval);
  }, []);

  const loadCognitiveData = async () => {
    try {
      setLoading(true);
      const data = await CognitiveEngineService?.getDashboardSummary();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load cognitive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const domains = [
    { key: 'math', label: 'Mathematics & Physics', icon: '📐', count: dashboardData?.summary?.math_concepts || 0 },
    { key: 'finance', label: 'Finance & Trading', icon: '📈', count: dashboardData?.summary?.finance_concepts || 0 },
    { key: 'ifrs', label: 'IFRS & Accounting', icon: '📊', count: dashboardData?.summary?.ifrs_concepts || 0 },
    { key: 'tax', label: 'Fiscal & Tax Rules', icon: '🏛️', count: dashboardData?.summary?.tax_concepts || 0 },
    { key: 'ai', label: 'AI & Computing', icon: '🤖', count: dashboardData?.summary?.ai_concepts || 0 }
  ];

  if (loading && !dashboardData?.summary?.math_concepts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Cognitive Engine...</p>
          <p className="text-purple-300 text-sm mt-2">Initializing Freedom v4 Neural Networks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">IA Exploration Totale</h1>
              <p className="text-purple-300 text-lg">Freedom v4 Cognitive Engine</p>
              <p className="text-slate-400 text-sm">Apprentissage illimité • Auto-mémoire cognitive • Cross-domain learning</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-400">
                <Activity className="w-5 h-5" />
                <span className="text-sm font-medium">System Status: {systemStatus?.toUpperCase()}</span>
              </div>
            </div>
            
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e?.target?.value)}
              className="bg-slate-800/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-400 focus:outline-none"
            >
              <option value="all">All Domains</option>
              {domains?.map(domain => (
                <option key={domain?.key} value={domain?.key}>
                  {domain?.label} ({domain?.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Concepts/min</p>
                <p className="text-2xl font-bold text-blue-400">{realTimeMetrics?.conceptsPerMinute}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Cross-Domain Links</p>
                <p className="text-2xl font-bold text-purple-400">{realTimeMetrics?.crossDomainConnections}</p>
              </div>
              <Network className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Trust Score</p>
                <p className="text-2xl font-bold text-green-400">{realTimeMetrics?.trustScoreAverage}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-800/40 backdrop-blur-sm p-4 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Learning Velocity</p>
                <p className="text-2xl font-bold text-yellow-400">{realTimeMetrics?.learningVelocity}x</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Main Layout - Three Columns */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="col-span-4 space-y-6">
          <UniversalIngestionPipeline 
            dashboardData={dashboardData} 
            onJobStart={loadCognitiveData}
          />
          <ConceptualExtractionEngine 
            selectedDomain={selectedDomain}
            realTimeMetrics={realTimeMetrics}
          />
        </div>

        {/* Center Column */}
        <div className="col-span-4 space-y-6">
          <CognitiveReconstructionDashboard 
            dashboardData={dashboardData}
            selectedDomain={selectedDomain}
          />
          <ValidationStorageSection 
            dashboardData={dashboardData}
            onDataUpdate={loadCognitiveData}
          />
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-6">
          <MetaLearningAnalytics 
            dashboardData={dashboardData}
            realTimeMetrics={realTimeMetrics}
          />
          <CognitiveControls 
            systemStatus={systemStatus}
            onStatusChange={setSystemStatus}
            onGenerateReport={async () => {
              const report = await CognitiveEngineService?.generateDailyReport();
              await loadCognitiveData();
              return report;
            }}
          />
        </div>
      </div>
      {/* Floating Domain Insights */}
      <AnimatePresence>
        {dashboardData?.recentInsights?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 max-w-md"
          >
            <div className="bg-slate-800/90 backdrop-blur-sm p-4 rounded-lg border border-purple-500/30">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Latest Cross-Domain Insight</span>
              </div>
              <p className="text-slate-300 text-sm">
                {dashboardData?.recentInsights?.[0]?.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-purple-300 text-xs">
                  {dashboardData?.recentInsights?.[0]?.primary_domain} → {dashboardData?.recentInsights?.[0]?.secondary_domain}
                </span>
                <span className="text-green-400 text-xs">
                  Strength: {(dashboardData?.recentInsights?.[0]?.strength * 100)?.toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IAExplorationTotaleFreedomV4CognitiveEngine;