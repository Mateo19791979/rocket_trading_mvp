import React, { useState, useEffect } from 'react';
import { AlertCircle, Activity, Zap, Database } from 'lucide-react';
import mvpDeploymentService from '../../services/mvpDeploymentService';

// Import components
import DeploymentStagesPanel from './components/DeploymentStagesPanel';
import ProviderConfigurationPanel from './components/ProviderConfigurationPanel';
import DeploymentStatusOverview from './components/DeploymentStatusOverview';
import CriticalPathAnalysis from './components/CriticalPathAnalysis';

export default function MVPDeploymentRoadmapDashboard() {
  const [project, setProject] = useState(null);
  const [stages, setStages] = useState({});
  const [providers, setProviders] = useState({});
  const [kpis, setKPIs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock user ID - in real app this would come from auth context
  const userId = 'current-user-id';

  const handleRealTimeUpdate = (payload) => {
    console.log('Real-time update:', payload);
    // Refresh data when changes occur
    refreshData();
  };

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    let channel = null;
    if (project?.id) {
      channel = mvpDeploymentService?.subscribeToDeploymentUpdates(
        project?.id,
        handleRealTimeUpdate
      );
    }

    return () => {
      if (channel) {
        mvpDeploymentService?.unsubscribeFromUpdates(channel);
      }
    };
  }, [project?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get or create MVP deployment project
      const projectResult = await mvpDeploymentService?.getMVPDeploymentProject(userId);
      if (projectResult?.error) {
        throw new Error(projectResult?.error);
      }

      setProject(projectResult?.data);

      if (projectResult?.data?.id) {
        // Load deployment stages
        const stagesResult = await mvpDeploymentService?.getDeploymentStages(projectResult?.data?.id);
        if (stagesResult?.error) {
          throw new Error(stagesResult?.error);
        }
        setStages(stagesResult?.data || {});

        // Load KPIs
        const kpisResult = await mvpDeploymentService?.getDeploymentKPIs(projectResult?.data?.id);
        if (kpisResult?.error) {
          throw new Error(kpisResult?.error);
        }
        setKPIs(kpisResult?.data || {});
      }

      // Load provider status
      const providerResult = await mvpDeploymentService?.getProviderStatus();
      if (providerResult?.error) {
        throw new Error(providerResult?.error);
      }
      setProviders(providerResult?.data || {});

    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleStageStatusUpdate = async (taskId, newStatus) => {
    try {
      const result = await mvpDeploymentService?.updateStageStatus(taskId, newStatus);
      if (result?.error) {
        throw new Error(result?.error);
      }
      
      // Refresh data to show updated progress
      await loadDashboardData();
    } catch (err) {
      setError(`Erreur mise à jour: ${err?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement du roadmap de déploiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-red-400 font-semibold text-lg mb-2">Erreur de chargement</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-3 rounded-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MVP Deployment Roadmap Dashboard</h1>
                <p className="text-gray-400">Plan de déploiement Rocket Trading en 9 étapes</p>
              </div>
              <div className="ml-6">
                <img 
                  src="/assets/images/image-1759325120802.png" 
                  alt="MVP Deployment Roadmap"
                  className="h-12 w-auto object-contain rounded border border-gray-600"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Progression Globale</div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-700 rounded-full h-2 w-24">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${kpis?.overall_progress || 0}%` }}
                    />
                  </div>
                  <span className="text-lg font-semibold text-white">{kpis?.overall_progress || 0}%</span>
                </div>
              </div>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Activity className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Deployment Stages */}
            <DeploymentStagesPanel
              stages={stages}
              onStatusUpdate={handleStageStatusUpdate}
              loading={loading}
            />

            {/* Provider Configuration */}
            <ProviderConfigurationPanel
              providers={providers}
              loading={loading}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Deployment Status Overview */}
            <DeploymentStatusOverview
              kpis={kpis}
              project={project}
              loading={loading}
            />

            {/* Critical Path Analysis */}
            <CriticalPathAnalysis
              stages={stages}
              kpis={kpis}
              loading={loading}
            />
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${kpis?.deployment_status === 'Live' ? 'bg-green-500' : kpis?.deployment_status === 'Staging' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                <span className="text-sm text-gray-300">
                  Status: <span className="text-white font-medium">{kpis?.deployment_status || 'Development'}</span>
                </span>
              </div>
              <div className="text-sm text-gray-400">
                Étapes complètes: {kpis?.stages_completed || 0}/9
              </div>
              <div className="text-sm text-gray-400">
                Providers actifs: {Object.values(providers)?.filter(p => p?.is_active)?.length || 0}/3
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Database className="w-4 h-4" />
              <span>trading.mvp.com</span>
              <div className={`w-2 h-2 rounded-full ml-2 ${kpis?.deployment_status === 'Live' ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}