import React, { useState, useEffect, useRef } from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, XCircle, DollarSign, Activity, Brain, Database, Clock, RefreshCw, BarChart3 } from 'lucide-react';
import dailyIntelligenceReportService from '../../../services/dailyIntelligenceReportService';

const DailyIntelligenceReportCard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const subscriptionRef = useRef(null);

  // Demo data fallback
  const getDemoReport = () => ({
    day: new Date()?.toISOString()?.split('T')?.[0],
    costEur: 3.45,
    calls: 1250,
    avgIqs: 87.3,
    avgDhi: 91.2,
    agentsActive: 4,
    tasksDone: 142,
    tasksFailed: 3,
    agentsFailed: ['Epsilon Swing Master'],
    performance: 'excellente',
    dataQuality: 'stable',
    costLevel: 'normal',
    recommendations: [
      {
        type: 'warning',
        icon: '⚠️',
        message: 'Un agent en mode pause - Vérification recommandée',
        priority: 'medium'
      },
      {
        type: 'info',
        icon: '📊',
        message: 'Performance globale excellente - Maintenir les paramètres actuels',
        priority: 'low'
      }
    ],
    markdown: `# 🚀 AAS Daily Intelligence Report (${new Date()?.toISOString()?.split('T')?.[0]})

| Metric | Value |
|:--|:--|
| 💰 Coût (€) | 3.45 |
| 📞 Appels API | 1,250 |
| 🧠 IQS moyen | 87.3 |
| 📊 DHI moyen | 91.2 |
| 🤖 Agents actifs | 4 |
| ✅ Tâches réussies | 142 |
| ❌ Tâches en échec | 3 |
| ⚠️ Agents en échec | Epsilon Swing Master |

## Synthèse
- **Performance** : excellente
- **Qualité data** : stable
- **Coût** : normal

## Actions recommandées
→ Un agent en mode pause - Vérification recommandée
→ Performance globale excellente - Maintenir les paramètres actuels`
  });

  useEffect(() => {
    loadDailyReport();
    setupRealtimeSubscription();
    
    // Auto-refresh every 15 minutes
    const refreshInterval = setInterval(() => {
      loadDailyReport();
    }, 15 * 60 * 1000);

    return () => {
      if (subscriptionRef?.current) {
        subscriptionRef?.current?.unsubscribe();
      }
      clearInterval(refreshInterval);
    };
  }, []);

  const loadDailyReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const reportData = await dailyIntelligenceReportService?.getLatestReport();
      
      if (reportData) {
        setReport(reportData);
      } else {
        // Use demo data as fallback
        setReport(getDemoReport());
      }
    } catch (err) {
      // Always fall back to demo data for better UX
      setReport(getDemoReport());
      
      if (err?.message?.includes('Cannot connect to database')) {
        setError('Mode démonstration - Données simulées');
      } else {
        setError('Utilisation des données de démonstration');
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    try {
      subscriptionRef.current = dailyIntelligenceReportService?.subscribeToDailyReportUpdates(() => {
        // Reload report when updates are detected
        loadDailyReport();
      });
    } catch (err) {
      console.warn('Real-time subscription failed for daily reports:', err?.message);
    }
  };

  const handleRefresh = () => {
    loadDailyReport();
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = (type) => {
    const colors = {
      excellent: 'text-green-400',
      good: 'text-blue-400', 
      warning: 'text-yellow-400',
      critical: 'text-red-400'
    };
    return colors?.[type] || 'text-gray-400';
  };

  const getRecommendationColor = (priority) => {
    const colors = {
      critical: 'border-red-500 bg-red-900/20',
      high: 'border-orange-500 bg-orange-900/20',
      medium: 'border-yellow-500 bg-yellow-900/20',
      low: 'border-blue-500 bg-blue-900/20'
    };
    return colors?.[priority] || 'border-gray-500 bg-gray-900/20';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Rapport quotidien indisponible</h3>
          <p className="text-gray-400 mb-4">Impossible de charger le rapport d'intelligence quotidien</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-xl font-semibold text-white">Rapport Intelligence Quotidien</h2>
            <p className="text-sm text-gray-400 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(report?.day)?.toLocaleDateString('fr-FR')}</span>
              {error && (
                <span className="text-yellow-400 text-xs ml-2">({error})</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleExpanded}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
          >
            {isExpanded ? (
              <>
                <span>Réduire</span>
              </>
            ) : (
              <>
                <span>Détails</span>
              </>
            )}
          </button>
          <button
            onClick={handleRefresh}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Cost */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className={`text-sm ${report?.costLevel === 'élevé' ? 'text-red-400' : 'text-green-400'}`}>
              {report?.costLevel}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">€{report?.costEur?.toFixed(2)}</div>
          <div className="text-xs text-gray-400">Coût journalier</div>
        </div>

        {/* API Calls */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{report?.calls?.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Appels API</div>
        </div>

        {/* IQS Average */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <span className={`text-sm ${getStatusColor(report?.performance === 'excellente' ? 'excellent' : 'warning')}`}>
              {report?.performance}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{report?.avgIqs?.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">IQS moyen</div>
        </div>

        {/* DHI Average */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Database className="h-5 w-5 text-cyan-400" />
            <span className={`text-sm ${getStatusColor(report?.dataQuality === 'stable' ? 'excellent' : 'warning')}`}>
              {report?.dataQuality}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">{report?.avgDhi?.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">DHI moyen</div>
        </div>
      </div>
      {/* Agent Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Agents Actifs</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{report?.agentsActive}</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">Tâches Réussies</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{report?.tasksDone}</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-white font-medium">Tâches Échouées</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{report?.tasksFailed}</div>
        </div>
      </div>
      {/* Recommendations */}
      {report?.recommendations?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>Actions Recommandées</span>
          </h3>
          <div className="space-y-3">
            {report?.recommendations?.map((rec, index) => (
              <div
                key={index}
                className={`border-l-4 rounded-r-lg p-3 ${getRecommendationColor(rec?.priority)}`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{rec?.icon}</span>
                  <span className="text-white text-sm">{rec?.message}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec?.priority === 'critical' ? 'bg-red-600 text-red-100' :
                    rec?.priority === 'high' ? 'bg-orange-600 text-orange-100' :
                    rec?.priority === 'medium'? 'bg-yellow-600 text-yellow-100' : 'bg-blue-600 text-blue-100'
                  }`}>
                    {rec?.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Failed Agents */}
      {report?.agentsFailed?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span>Agents en Échec</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {report?.agentsFailed?.map((agentName, index) => (
              <span
                key={index}
                className="bg-red-900/30 border border-red-700 text-red-300 px-3 py-1 rounded-full text-sm"
              >
                {agentName}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Expanded Details */}
      {isExpanded && report?.markdown && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Rapport Détaillé</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {report?.markdown}
            </pre>
          </div>
        </div>
      )}
      {/* Last Updated */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Dernière mise à jour: {new Date()?.toLocaleString('fr-FR')}</span>
        </div>
        <div className="text-xs text-gray-500">
          AAS Daily Intelligence v1.0
        </div>
      </div>
    </div>
  );
};

export default DailyIntelligenceReportCard;