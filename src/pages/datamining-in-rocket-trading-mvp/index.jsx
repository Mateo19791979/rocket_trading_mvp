import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Brain, TrendingUp, Shield, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Import components
import EstablishedCapabilitiesPanel from './components/EstablishedCapabilitiesPanel';
import StrengthsLimitationsPanel from './components/StrengthsLimitationsPanel';
import InteractiveRoadmapPanel from './components/InteractiveRoadmapPanel';
import TechnicalMetricsPanel from './components/TechnicalMetricsPanel';

const DataminingInRocketTradingMVP = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <motion.div 
        className="max-w-7xl mx-auto p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Database className="h-10 w-10 text-cyan-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <Brain className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-cyan-400 to-orange-500"></div>
            <TrendingUp className="h-10 w-10 text-teal-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Datamining dans Rocket Trading MVP
          </h1>
          
          <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Registry & Scoring — la base d'un système vivant
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{currentTime?.toLocaleDateString('fr-FR')} - {currentTime?.toLocaleTimeString('fr-FR')}</span>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Déjà en place */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">Déjà en place</h2>
              </div>
              <EstablishedCapabilitiesPanel />
            </div>
          </motion.div>

          {/* Right Column - Forces et Limites */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <Shield className="h-6 w-6 text-teal-400" />
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Forces & Limites</h2>
              </div>
              <StrengthsLimitationsPanel />
            </div>
          </motion.div>
        </div>

        {/* Technical Metrics Panel */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <TechnicalMetricsPanel />
        </motion.div>

        {/* Interactive Roadmap */}
        <motion.div variants={itemVariants}>
          <InteractiveRoadmapPanel />
        </motion.div>

        {/* Status Indicators */}
        <motion.div 
          className="mt-8 flex justify-center"
          variants={itemVariants}
        >
          <div className="flex items-center gap-6 px-6 py-3 bg-gray-800/50 rounded-full border border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Registry Actif</span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Scoring Engine ON</span>
            </div>
            <div className="h-4 w-px bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-gray-300">Orchestrateur Ready</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DataminingInRocketTradingMVP;