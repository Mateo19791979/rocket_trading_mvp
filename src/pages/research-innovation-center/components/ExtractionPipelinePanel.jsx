import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Brain, 
  Target, 
  BarChart3,
  Play,
  Pause,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { researchInnovationService } from '../../../services/researchInnovationService';

const ExtractionPipelinePanel = () => {
  const [pipelineStats, setPipelineStats] = useState([]);
  const [registryData, setRegistryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [stats, registry] = await Promise.all([
          researchInnovationService?.getBookProcessingStats(),
          researchInnovationService?.getPipelineRegistry()
        ]);
        
        setPipelineStats(stats);
        setRegistryData(registry);
      } catch (err) {
        setError(err?.message || 'Erreur de chargement du pipeline');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pipelineStages = [
    {
      id: 'transformation',
      title: 'Transformation',
      subtitle: 'règles testables',
      icon: Zap,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-700/30',
      description: 'Conversion des données brutes en règles de trading testables'
    },
    {
      id: 'mining',
      title: 'Mining',
      subtitle: 'clustering + association rules',
      icon: Brain,
      color: 'text-teal-400',
      bgColor: 'bg-teal-900/20',
      borderColor: 'border-teal-700/30',
      description: 'Identification de motifs et règles d\'association'
    },
    {
      id: 'evolution',
      title: 'Auto-évolution',
      subtitle: 'Darwinisme des stratégies',
      icon: Target,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-700/30',
      description: 'Sélection naturelle des stratégies les plus performantes'
    }
  ];

  const getStageMetrics = (stageId) => {
    const stageStats = pipelineStats?.filter(stat => 
      stat?.processing_stage?.toLowerCase()?.includes(stageId) ||
      (stageId === 'transformation' && stat?.processing_stage === 'extraction') ||
      (stageId === 'mining' && stat?.processing_stage === 'embedding') ||
      (stageId === 'evolution' && stat?.processing_stage === 'validation')
    ) || [];
    
    const totalJobs = stageStats?.reduce((sum, stat) => sum + (stat?.count || 0), 0);
    const completedJobs = stageStats?.filter(stat => stat?.status === 'completed')?.reduce((sum, stat) => sum + (stat?.count || 0), 0);
    
    return {
      total: totalJobs,
      completed: completedJobs,
      successRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
    };
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 text-red-400">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Stages */}
      <div className="space-y-4">
        {pipelineStages?.map((stage, index) => {
          const metrics = getStageMetrics(stage?.id);
          const StageIcon = stage?.icon;
          
          return (
            <motion.div
              key={stage?.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${stage?.bgColor} ${stage?.borderColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-800/50 ${stage?.color}`}>
                    <StageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{stage?.title}</h3>
                    <p className="text-sm text-gray-400">{stage?.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className={`h-4 w-4 ${stage?.color}`} />
                    <span className="text-sm font-medium text-white">{metrics?.successRate}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {metrics?.completed}/{metrics?.total} tâches
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    stage?.id === 'transformation' ? 'bg-cyan-400' :
                    stage?.id === 'mining' ? 'bg-teal-400' : 'bg-orange-400'
                  }`}
                  style={{ width: `${metrics?.successRate || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{stage?.description}</p>
              {/* Stage Metrics */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">+{Math.floor(Math.random() * 15)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3 text-blue-400" />
                    <span className="text-gray-400">{Math.floor(Math.random() * 100) + 50}/min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                    <Settings className="h-3 w-3 text-gray-400" />
                  </button>
                  <button className="p-1 rounded bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                    {Math.random() > 0.5 ? (
                      <Play className="h-3 w-3 text-green-400" />
                    ) : (
                      <Pause className="h-3 w-3 text-orange-400" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Pipeline Flow Visualization */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center space-x-2 py-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
      >
        {pipelineStages?.map((stage, index) => (
          <React.Fragment key={stage?.id}>
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${
                stage?.id === 'transformation' ? 'bg-cyan-400 animate-pulse' :
                stage?.id === 'mining' ? 'bg-teal-400' : 'bg-orange-400'
              }`} />
              <span className="text-xs text-gray-400 mt-1">{stage?.title}</span>
            </div>
            {index < pipelineStages?.length - 1 && (
              <ArrowRight className="h-4 w-4 text-gray-500" />
            )}
          </React.Fragment>
        ))}
      </motion.div>
      {/* Registry Information */}
      {registryData && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="p-4 bg-gradient-to-r from-gray-800/40 to-gray-700/40 rounded-lg border border-gray-600/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white mb-1">Pipeline Registry {registryData?.registry_version}</h4>
              <p className="text-sm text-gray-400">
                {registryData?.total_books_processed || 0} livres traités • 
                {registryData?.total_strategies_extracted || 0} stratégies extraites
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-teal-400">
                {Math.round((registryData?.deduplication_score || 0) * 100)}% déduplication
              </div>
              <div className="text-xs text-gray-400">
                Seuil: {Math.round((registryData?.confidence_threshold || 0) * 100)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExtractionPipelinePanel;