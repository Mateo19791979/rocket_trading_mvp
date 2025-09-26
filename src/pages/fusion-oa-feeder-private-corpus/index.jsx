import React, { useState, useEffect } from 'react';
import AppImage from '../../components/AppImage';
import { RefreshCw, Play, Pause } from 'lucide-react';
import DualFluxPanel from './components/DualFluxPanel';
import MetaOrchestratorPanel from './components/MetaOrchestratorPanel';
import DashboardRocketPanel from './components/DashboardRocketPanel';
import RoadmapPanel from './components/RoadmapPanel';
import fusionOaFeederPrivateCorpusService from '../../services/fusionOaFeederPrivateCorpusService';

export default function FusionOaFeederPrivateCorpus() {
  const [fusionData, setFusionData] = useState({
    dualFlux: null,
    metaOrchestrator: null,
    dashboard: null,
    roadmap: null,
    metrics: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadFusionData = async () => {
    try {
      const [dualFluxRes, orchestratorRes, dashboardRes, roadmapRes, metricsRes] = await Promise.all([
        fusionOaFeederPrivateCorpusService?.getDualFluxStatus(),
        fusionOaFeederPrivateCorpusService?.getMetaOrchestratorStatus(),
        fusionOaFeederPrivateCorpusService?.getDashboardRocketIntegration(),
        fusionOaFeederPrivateCorpusService?.getRoadmapProgress(),
        fusionOaFeederPrivateCorpusService?.getFusionMetrics()
      ]);

      if (dualFluxRes?.error || orchestratorRes?.error || dashboardRes?.error || roadmapRes?.error || metricsRes?.error) {
        throw new Error('Erreur lors du chargement des données');
      }

      setFusionData({
        dualFlux: dualFluxRes,
        metaOrchestrator: orchestratorRes,
        dashboard: dashboardRes,
        roadmap: roadmapRes,
        metrics: metricsRes
      });
      
    } catch (error) {
      setError(`Erreur lors du chargement: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFusion = async () => {
    setIsProcessing(true);
    try {
      const { error } = await fusionOaFeederPrivateCorpusService?.startFusionPipeline({
        includeOA: true,
        includePrivate: true,
        priority: 'high'
      });

      if (error) {
        throw new Error(error);
      }

      // Refresh data after starting
      setTimeout(() => {
        loadFusionData();
      }, 2000);
      
    } catch (error) {
      setError(`Erreur démarrage fusion: ${error?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadFusionData();

    // Auto-refresh setup
    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(loadFusionData, 30000); // 30 seconds
    }

    // Real-time subscription
    const unsubscribe = fusionOaFeederPrivateCorpusService?.subscribeToFusionUpdates((update) => {
      console.log('Fusion update:', update);
      // Refresh data on real-time updates
      loadFusionData();
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
      unsubscribe?.();
    };
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          Chargement du système de fusion...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white">
      {/* Header avec image de référence */}
      <div className="relative h-64 mb-8">
        <AppImage
          src="/assets/images/Planche_Fusion_Feeder_Corpus-1758900803644.jpg"
          alt="Fusion — OA Feeder + Private Corpus"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/50 to-teal-900/50" />
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-orange-300">
              Fusion — OA Feeder + Private Corpus
            </h1>
            <p className="text-xl text-teal-300 mb-4">
              Deux flux pour alimenter le Meta-Orchestrateur
            </p>
            <div className="text-sm text-gray-300">
              {new Date()?.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                autoRefresh
                  ? 'border-teal-500 bg-teal-500/20 text-teal-300' :'border-gray-500 bg-gray-500/20 text-gray-300'
              }`}
            >
              {autoRefresh ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            <button
              onClick={handleStartFusion}
              disabled={isProcessing}
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-teal-600 rounded-lg border-2 border-orange-500 hover:from-orange-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Démarrage...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Démarrer Fusion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Error Display */}
      {error && (
        <div className="mx-8 mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-200">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-400 hover:text-red-300 underline"
          >
            Fermer
          </button>
        </div>
      )}
      {/* Main Content - Two Column Layout */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Colonne Gauche */}
          <div className="space-y-8">
            {/* Double Flux */}
            <DualFluxPanel data={fusionData?.dualFlux} />
            
            {/* Meta-Orchestrateur */}
            <MetaOrchestratorPanel data={fusionData?.metaOrchestrator} />
          </div>

          {/* Colonne Droite */}
          <div className="space-y-8">
            {/* Dashboard Rocket.new */}
            <DashboardRocketPanel data={fusionData?.dashboard} />
            
            {/* Roadmap */}
            <RoadmapPanel data={fusionData?.roadmap} />
          </div>
        </div>

        {/* Metrics Bar at Bottom */}
        {fusionData?.metrics && (
          <div className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-slate-600">
            <h3 className="text-xl font-bold text-orange-300 mb-4">📊 Métriques de Fusion Live</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-300">{fusionData?.metrics?.metrics?.weekly_documents_processed || 0}</div>
                <div className="text-sm text-gray-400">Docs/semaine</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-300">{fusionData?.metrics?.metrics?.oa_documents || 0}</div>
                <div className="text-sm text-gray-400">OA Flux</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">{fusionData?.metrics?.metrics?.private_documents || 0}</div>
                <div className="text-sm text-gray-400">Private Flux</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{fusionData?.metrics?.metrics?.avg_processing_hours || 0}h</div>
                <div className="text-sm text-gray-400">Temps moy.</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">{fusionData?.metrics?.metrics?.fusion_efficiency || 0}%</div>
                <div className="text-sm text-gray-400">Efficacité</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}