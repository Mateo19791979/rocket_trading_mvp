import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Settings, Download, Brain, Zap, Target, BarChart3, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { researchInnovationService } from '../../../services/researchInnovationService';

const ResearchControlsPanel = () => {
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [innovationMetrics, setInnovationMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadInnovationMetrics();
    
    // Set up real-time updates
    const unsubscribe = researchInnovationService?.subscribeToResearchUpdates((update) => {
      handleRealTimeUpdate(update);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadInnovationMetrics = async () => {
    try {
      const metrics = await researchInnovationService?.getInnovationMetrics();
      setInnovationMetrics(metrics);
    } catch (error) {
      showNotification('Erreur lors du chargement des métriques', 'error');
    }
  };

  const handleRealTimeUpdate = (update) => {
    const { type, payload } = update;
    
    switch (type) {
      case 'strategy_extraction':
        if (payload?.eventType === 'INSERT') {
          showNotification('Nouvelle stratégie extraite', 'success');
          loadInnovationMetrics();
        }
        break;
      case 'book_processing':
        if (payload?.eventType === 'UPDATE') {
          setProcessingStatus(payload?.new?.status || 'processing');
        }
        break;
      case 'ai_agent_update':
        showNotification('Agent IA mis à jour', 'info');
        break;
      default:
        break;
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTriggerPipeline = async () => {
    try {
      setLoading(true);
      setProcessingStatus('processing');
      
      // Simulate pipeline trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProcessingStatus('completed');
      showNotification('Pipeline de recherche démarré avec succès', 'success');
      loadInnovationMetrics();
    } catch (error) {
      setProcessingStatus('error');
      showNotification('Erreur lors du démarrage du pipeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleParameterAdjustment = () => {
    showNotification('Panneau de configuration des paramètres ouvert', 'info');
  };

  const handleExportData = () => {
    showNotification('Export des données de recherche initié', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'text-orange-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Pause className="h-4 w-4" />;
    }
  };

  const controls = [
    {
      id: 'trigger',
      title: 'Déclenchement Manuel',
      description: 'Lancer le pipeline de recherche',
      icon: Play,
      action: handleTriggerPipeline,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      disabled: loading || processingStatus === 'processing'
    },
    {
      id: 'parameters',
      title: 'Ajustement Paramètres',
      description: 'Configurer les seuils et critères',
      icon: Settings,
      action: handleParameterAdjustment,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      disabled: false
    },
    {
      id: 'monitor',
      title: 'Surveillance Temps Réel',
      description: 'Dashboard de monitoring actif',
      icon: BarChart3,
      action: () => showNotification('Dashboard de surveillance ouvert', 'info'),
      color: 'text-teal-400',
      bgColor: 'bg-teal-900/20',
      disabled: false
    },
    {
      id: 'export',
      title: 'Export Documentation',
      description: 'Télécharger rapports et analyses',
      icon: Download,
      action: handleExportData,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      disabled: false
    }
  ];

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Contrôles Interactifs de Recherche</h2>
          </div>
          <p className="text-gray-400">
            Surveillance et contrôle du processus d'innovation en temps réel
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 ${getStatusColor(processingStatus)}`}>
          {getStatusIcon(processingStatus)}
          <span className="text-sm font-medium capitalize">
            {processingStatus === 'idle' ? 'En attente' :
             processingStatus === 'processing' ? 'En cours' :
             processingStatus === 'completed' ? 'Terminé' :
             processingStatus === 'error' ? 'Erreur' : 'Inconnu'}
          </span>
        </div>
      </div>
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-4 p-3 rounded-lg border ${
            notification?.type === 'success' ? 'bg-green-900/20 border-green-700/30 text-green-400' :
            notification?.type === 'error'? 'bg-red-900/20 border-red-700/30 text-red-400' : 'bg-blue-900/20 border-blue-700/30 text-blue-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification?.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
             notification?.type === 'error' ? <AlertCircle className="h-4 w-4" /> :
             <Target className="h-4 w-4" />}
            <span className="text-sm">{notification?.message}</span>
          </div>
        </motion.div>
      )}
      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {controls?.map((control, index) => {
          const ControlIcon = control?.icon;
          
          return (
            <motion.button
              key={control?.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              onClick={control?.action}
              disabled={control?.disabled}
              className={`p-4 rounded-lg border border-gray-700/30 ${control?.bgColor} 
                hover:border-gray-600/50 transition-all duration-200 text-left
                ${control?.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gray-800/50 ${control?.color}`}>
                  <ControlIcon className="h-5 w-5" />
                </div>
                {control?.id === 'trigger' && loading && (
                  <RefreshCw className="h-4 w-4 text-orange-400 animate-spin" />
                )}
              </div>
              <h3 className="font-medium text-white mb-1">{control?.title}</h3>
              <p className="text-xs text-gray-400">{control?.description}</p>
            </motion.button>
          );
        })}
      </div>
      {/* Innovation Analytics Dashboard */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="p-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg border border-indigo-700/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <span className="font-medium text-white">Analytics en Temps Réel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {innovationMetrics?.agents?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Agents IA</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-400">
              {innovationMetrics?.recentStrategies || 0}
            </div>
            <div className="text-xs text-gray-400">Nouvelles stratégies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {innovationMetrics?.processingJobs?.reduce((sum, job) => sum + (job?.count || 0), 0) || 0}
            </div>
            <div className="text-xs text-gray-400">Tâches actives</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">98%</div>
            <div className="text-xs text-gray-400">Efficacité</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResearchControlsPanel;