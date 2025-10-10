import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, AlertTriangle, Target, Activity } from 'lucide-react';
import { productionRecoveryService } from '../../../services/productionRecoveryService';

const ProgressDashboard = () => {
  const [progressData, setProgressData] = useState({
    current: 94,
    previous: 98,
    target: 100,
    regression: -4,
    estimatedCompletion: null,
    criticalIssues: 0
  });
  const [milestones, setMilestones] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const loadProgressData = async () => {
    try {
      const [recoveryResponse, issuesResponse, metricsResponse] = await Promise.all([
        productionRecoveryService?.getRecoveryProgress(),
        productionRecoveryService?.getCriticalIssues(),
        productionRecoveryService?.getPerformanceMetrics()
      ]);

      if (!recoveryResponse?.error) {
        setProgressData(prev => ({
          ...prev,
          current: recoveryResponse?.overall,
          regression: recoveryResponse?.regression,
          estimatedCompletion: calculateEstimatedCompletion(recoveryResponse?.overall)
        }));
        
        setMilestones(recoveryResponse?.stages?.map((stage, index) => ({
          id: `stage_${index}`,
          title: stage?.name,
          progress: stage?.completion,
          status: stage?.status,
          critical: stage?.critical || false,
          issues: stage?.status === 'critical' ? ['Erreurs RLS critiques détectées'] : []
        })) || []);
      }

      if (!issuesResponse?.error) {
        setProgressData(prev => ({
          ...prev,
          criticalIssues: issuesResponse?.issues?.length
        }));
      }

      if (!metricsResponse?.error) {
        setRealTimeMetrics(metricsResponse?.metrics);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données de progression:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
    const interval = setInterval(loadProgressData, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  const calculateEstimatedCompletion = (currentProgress) => {
    const remainingProgress = 100 - currentProgress;
    const estimatedHours = Math.ceil(remainingProgress * 0.3); // Estimation: 0.3h par % restant
    return new Date(Date.now() + estimatedHours * 60 * 60 * 1000);
  };

  const getProgressColor = (progress) => {
    if (progress >= 95) return 'text-green-600';
    if (progress >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (progress) => {
    if (progress >= 95) return 'bg-green-500';
    if (progress >= 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTimeRemaining = (targetDate) => {
    if (!targetDate) return 'Calcul en cours...';
    const now = new Date();
    const diff = targetDate - now;
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h restantes` : 'Finalisation imminente';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Dashboard de Progression</h3>
            <p className="text-sm text-gray-600">Suivi temps réel de la récupération</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            loading ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
          }`}>
            {loading ? 'Mise à jour...' : 'Live'}
          </div>
        </div>
      </div>

      {/* Progression principale avec régression */}
      <div className="bg-gradient-to-r from-red-50 to-blue-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Readiness Status</h4>
            <p className="text-sm text-gray-600">
              Récupération de régression 98% → 94%
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-3">
              <span className="text-gray-500 line-through text-xl">{progressData?.previous}%</span>
              <TrendingUp className={`h-5 w-5 ${progressData?.regression < 0 ? 'text-red-500' : 'text-green-500'}`} />
              <span className={`text-3xl font-bold ${getProgressColor(progressData?.current)}`}>
                {progressData?.current}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Target: {progressData?.target}%
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
              className={`h-6 rounded-full transition-all duration-1000 ${getProgressBgColor(progressData?.current)} relative`}
              style={{ width: `${progressData?.current}%` }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                Récupération: {progressData?.current}%
              </div>
            </div>
          </div>
          
          {/* Indicateur de régression */}
          {progressData?.regression < 0 && (
            <div 
              className="absolute top-0 bg-red-300 h-6 rounded-full opacity-50"
              style={{ 
                left: `${progressData?.current}%`,
                width: `${Math.abs(progressData?.regression)}%`
              }}
            />
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>Régression: {Math.abs(progressData?.regression)}%</span>
          <span>ETA: {formatTimeRemaining(progressData?.estimatedCompletion)}</span>
        </div>
      </div>

      {/* Métriques en temps réel */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Issues Critiques</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            {progressData?.criticalIssues || 0}
          </p>
          <p className="text-xs text-blue-600">En cours de résolution</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Agents Sains</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {realTimeMetrics?.healthyAgents || 0}
          </p>
          <p className="text-xs text-green-600">IA opérationnelles</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">Performance</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">
            {realTimeMetrics?.avgCpu || 0}%
          </p>
          <p className="text-xs text-yellow-600">CPU moyen</p>
        </div>
      </div>

      {/* Timeline des milestones avec statuts */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Milestones de Récupération</h4>
        {milestones?.map((milestone, index) => (
          <div 
            key={milestone?.id} 
            className={`p-4 rounded-lg border-2 ${
              milestone?.critical ? 'border-red-300 bg-red-50' :
              milestone?.progress >= 95 ? 'border-green-300 bg-green-50' :
              milestone?.progress >= 70 ? 'border-yellow-300 bg-yellow-50': 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h5 className="font-medium text-gray-900">{milestone?.title}</h5>
                  {milestone?.critical && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    milestone?.status === 'completed' ? 'bg-green-100 text-green-800' :
                    milestone?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    milestone?.status === 'critical'? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {milestone?.status}
                  </span>
                </div>
                
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressBgColor(milestone?.progress)}`}
                      style={{ width: `${milestone?.progress}%` }}
                    />
                  </div>
                </div>

                {milestone?.issues && milestone?.issues?.length > 0 && (
                  <div className="mt-2">
                    {milestone?.issues?.map((issue, issueIndex) => (
                      <p key={issueIndex} className="text-xs text-red-600 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{issue}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right ml-4">
                <p className={`text-lg font-bold ${getProgressColor(milestone?.progress)}`}>
                  {milestone?.progress}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé de récupération */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
        <h5 className="font-semibold text-gray-900 mb-2">📊 Résumé de Récupération</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-700">Progression actuelle:</span>
            <span className="font-bold text-blue-900 ml-2">{progressData?.current}%</span>
          </div>
          <div>
            <span className="text-gray-700">Récupération nécessaire:</span>
            <span className="font-bold text-red-700 ml-2">{100 - progressData?.current}%</span>
          </div>
          <div>
            <span className="text-gray-700">Issues résolues:</span>
            <span className="font-bold text-green-700 ml-2">{Math.max(0, 5 - progressData?.criticalIssues)}/5</span>
          </div>
          <div>
            <span className="text-gray-700">ETA Production:</span>
            <span className="font-bold text-blue-900 ml-2">{formatTimeRemaining(progressData?.estimatedCompletion)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;