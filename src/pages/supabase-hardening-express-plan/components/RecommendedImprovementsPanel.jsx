import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Database, Search, Shield, Zap, BarChart3, Loader2, CheckCircle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const RecommendedImprovementsPanel = ({ data, onExecuteAction, executingActions }) => {
  const improvements = [
    {
      id: 'rls_policies',
      title: 'RLS sur toutes les tables exposées',
      status: data?.compliance?.compliantReports || 0,
      total: data?.compliance?.totalReports || 0,
      impact: 'Élevé',
      performance: '+25% sécurité',
      action: 'implement_comprehensive_rls',
      icon: Shield,
      color: 'blue',
      description: 'Protection Row Level Security sur toutes les tables publiques'
    },
    {
      id: 'database_indexes',
      title: 'Index sur created_at, user_id, colonnes filtrées',
      status: Math.floor(Math.random() * 15) + 5, // Mock data
      total: 23,
      impact: 'Moyen',
      performance: '+40% requêtes',
      action: 'optimize_database_indexes',
      icon: Search,
      color: 'green',
      description: 'Optimisation des performances des requêtes fréquentes'
    },
    {
      id: 'storage_policies',
      title: 'Policies Storage → buckets privés, auth.uid()',
      status: 2,
      total: 4,
      impact: 'Élevé',
      performance: '+95% sécurité',
      action: 'secure_storage_policies',
      icon: Database,
      color: 'purple',
      description: 'Sécurisation complète des buckets de stockage'
    },
    {
      id: 'rate_limiting',
      title: 'Rate limiting sur Edge Functions sensibles',
      status: data?.system?.healthyAgents || 0,
      total: data?.system?.totalAgents || 1,
      impact: 'Moyen',
      performance: '+60% protection',
      action: 'implement_rate_limiting',
      icon: Zap,
      color: 'orange',
      description: 'Protection contre les abus et attaques DDoS'
    },
    {
      id: 'monitoring_alerts',
      title: 'Logs & Alerts → erreurs 5xx, latence, auth fails',
      status: data?.dns?.healthyChecks || 0,
      total: data?.dns?.totalChecks || 1,
      impact: 'Moyen',
      performance: '+80% visibilité',
      action: 'setup_comprehensive_monitoring',
      icon: BarChart3,
      color: 'teal',
      description: 'Surveillance proactive des métriques critiques'
    }
  ];

  const getCompletionPercentage = (status, total) => {
    if (total === 0) return 0;
    return Math.round((status / total) * 100);
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Élevé': return 'text-orange-400';
      case 'Moyen': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Améliorations recommandées</h2>
      </div>
      <div className="space-y-4">
        {improvements?.map((improvement, index) => {
          const Icon = improvement?.icon;
          const isExecuting = executingActions?.[`improvement_${improvement?.id}`];
          const completionPercentage = getCompletionPercentage(improvement?.status, improvement?.total);
          
          return (
            <motion.div
              key={improvement?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2.5 bg-${improvement?.color}-500/20 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${improvement?.color}-400`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{improvement?.title}</h3>
                    
                    <p className="text-sm text-slate-400 mb-3">{improvement?.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Progression</span>
                        <span>{improvement?.status}/{improvement?.total} ({completionPercentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-600/50 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getCompletionColor(completionPercentage)} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Impact:</span>
                        <span className={`text-xs font-medium ${getImpactColor(improvement?.impact)}`}>
                          {improvement?.impact}
                        </span>
                      </div>
                      <div className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                        {improvement?.performance}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onExecuteAction(`improvement_${improvement?.id}`, { type: improvement?.action })}
                  disabled={isExecuting || completionPercentage === 100}
                  className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Optimisation...
                    </>
                  ) : completionPercentage === 100 ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Terminé
                    </>
                  ) : (
                    'Optimiser'
                  )}
                </button>
              </div>
              {/* Completion indicator */}
              <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${getCompletionColor(completionPercentage)} rounded-l-xl`} />
            </motion.div>
          );
        })}
      </div>
      {/* Performance Summary */}
      <div className="mt-6 p-4 bg-slate-700/20 rounded-xl">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-slate-400">Performance moyenne</div>
            <div className="text-xl font-bold text-green-400">+52%</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">Sécurité renforcée</div>
            <div className="text-xl font-bold text-blue-400">+68%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendedImprovementsPanel;