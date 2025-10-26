import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Globe, BookOpen, Database, FileText, Code, Play, TrendingUp, Clock } from 'lucide-react';
import CognitiveEngineService from '../../../services/cognitiveEngineService';

const UniversalIngestionPipeline = ({ dashboardData, onJobStart }) => {
  const [activeIngestion, setActiveIngestion] = useState(null);
  const [ingestionStats, setIngestionStats] = useState({
    totalProcessed: 0,
    successRate: 95.2,
    avgProcessingTime: 147
  });

  const dataSources = [
    {
      id: 'arxiv',
      name: 'arXiv Research',
      icon: <BookOpen className="w-5 h-5" />,
      type: 'academic',
      domains: ['math', 'physics', 'ai'],
      status: 'active',
      lastSync: '2 min ago',
      count: 1247
    },
    {
      id: 'ifrs',
      name: 'IFRS Standards',
      icon: <FileText className="w-5 h-5" />,
      type: 'regulatory',
      domains: ['ifrs', 'accounting'],
      status: 'active',
      lastSync: '15 min ago',
      count: 423
    },
    {
      id: 'oecd',
      name: 'OECD Tax Database',
      icon: <Database className="w-5 h-5" />,
      type: 'regulatory',
      domains: ['tax', 'law'],
      status: 'active',
      lastSync: '1 hour ago',
      count: 856
    },
    {
      id: 'github',
      name: 'GitHub Repositories',
      icon: <Code className="w-5 h-5" />,
      type: 'code',
      domains: ['ai', 'finance'],
      status: 'processing',
      lastSync: '5 min ago',
      count: 2341
    },
    {
      id: 'bloomberg',
      name: 'Bloomberg API',
      icon: <TrendingUp className="w-5 h-5" />,
      type: 'financial',
      domains: ['finance', 'trading'],
      status: 'active',
      lastSync: '30 sec ago',
      count: 5672
    }
  ];

  const startIngestion = async (sourceId) => {
    try {
      setActiveIngestion(sourceId);
      const source = dataSources?.find(s => s?.id === sourceId);
      
      // Simulate ingestion job
      const result = await CognitiveEngineService?.ingestFromSource({
        jobName: `${source?.name} Cognitive Extraction`,
        sourceType: source?.type,
        domains: source?.domains,
        content: `Sample content from ${source?.name} for cognitive processing`
      });
      
      // Update stats
      setIngestionStats(prev => ({
        ...prev,
        totalProcessed: prev?.totalProcessed + 1
      }));
      
      onJobStart?.();
      
    } catch (error) {
      console.error('Ingestion failed:', error);
    } finally {
      setTimeout(() => setActiveIngestion(null), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-lg border border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Download className="w-6 h-6 text-blue-400" />
            <span>Universal Ingestion Pipeline</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Multi-domain data acquisition with real-time processing
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-green-400">{ingestionStats?.totalProcessed}</p>
          <p className="text-slate-400 text-xs">Sources Processed</p>
        </div>
      </div>
      {/* Ingestion Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-green-400 font-bold">{ingestionStats?.successRate}%</p>
          <p className="text-slate-400 text-xs">Success Rate</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-blue-400 font-bold">{ingestionStats?.avgProcessingTime}s</p>
          <p className="text-slate-400 text-xs">Avg Time</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-purple-400 font-bold">{dashboardData?.activeJobs?.length || 0}</p>
          <p className="text-slate-400 text-xs">Active Jobs</p>
        </div>
      </div>
      {/* Data Sources */}
      <div className="space-y-3">
        <h3 className="text-white font-medium flex items-center space-x-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Multi-Domain Sources</span>
        </h3>
        
        {dataSources?.map((source) => (
          <motion.div
            key={source?.id}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-lg border transition-all ${
              activeIngestion === source?.id
                ? 'bg-purple-500/20 border-purple-400' :'bg-slate-900/30 border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  source?.status === 'active' ?'bg-green-500/20 text-green-400' 
                    : source?.status === 'processing' ?'bg-blue-500/20 text-blue-400' :'bg-slate-500/20 text-slate-400'
                }`}>
                  {source?.icon}
                </div>
                <div>
                  <h4 className="text-white font-medium">{source?.name}</h4>
                  <p className="text-slate-400 text-sm">
                    {source?.domains?.join(', ')} • {source?.count?.toLocaleString()} items
                  </p>
                  <p className="text-slate-500 text-xs flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Last sync: {source?.lastSync}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  source?.status === 'active' ? 'bg-green-400 animate-pulse' :
                  source?.status === 'processing'? 'bg-blue-400 animate-pulse' : 'bg-slate-400'
                }`}></div>
                
                <button
                  onClick={() => startIngestion(source?.id)}
                  disabled={activeIngestion === source?.id}
                  className={`p-2 rounded-lg transition-all ${
                    activeIngestion === source?.id
                      ? 'bg-purple-500/20 text-purple-400 cursor-not-allowed' :'bg-slate-700/50 text-slate-400 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  {activeIngestion === source?.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Processing Status */}
            {activeIngestion === source?.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-slate-600"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">Extracting concepts...</span>
                  <span className="text-purple-300">Processing</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div className="bg-purple-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      {/* Real-time Processing Metrics */}
      <div className="mt-6 p-4 bg-slate-900/30 rounded-lg">
        <h4 className="text-white font-medium mb-3">Real-time Metrics</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Concepts Extracted Today</p>
            <p className="text-2xl font-bold text-blue-400">
              {dashboardData?.todayReport?.new_concepts_discovered || 0}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Data Quality Score</p>
            <p className="text-2xl font-bold text-green-400">94.2%</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UniversalIngestionPipeline;