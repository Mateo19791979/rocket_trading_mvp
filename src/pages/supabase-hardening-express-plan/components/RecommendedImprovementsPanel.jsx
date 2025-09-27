import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Database, Shield, Gauge, Loader2, BarChart3 } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const RecommendedImprovementsPanel = ({ data, onExecuteAction, executingActions }) => {
  const improvements = [
    {
      id: 'rls_tables',
      title: 'RLS activé sur toutes les tables exposées',
      status: 'À configurer',
      impact: 'Élevé',
      priority: 'Haute',
      action: 'enable_rls_all_tables',
      icon: Shield,
      color: 'orange',
      description: 'Sécurisation par Row Level Security des accès données'
    },
    {
      id: 'db_indexes',
      title: 'Index sur created_at, user_id, colonnes filtrées',
      status: 'Optimisation requise',
      impact: 'Moyen',
      priority: 'Moyenne',
      action: 'optimize_database_indexes',
      icon: Database,
      color: 'orange',
      description: 'Amélioration des performances des requêtes principales'
    },
    {
      id: 'storage_policies',
      title: 'Policies Storage → buckets privés, accès via auth.uid()',
      status: 'À sécuriser',
      impact: 'Élevé',
      priority: 'Haute',
      action: 'secure_storage_policies',
      icon: Database,
      color: 'orange',
      description: 'Sécurisation des accès aux fichiers stockés'
    },
    {
      id: 'rate_limiting',
      title: 'Rate limiting sur Edge Functions sensibles',
      status: 'Non configuré',
      impact: 'Moyen',
      priority: 'Moyenne',
      action: 'setup_rate_limiting',
      icon: Gauge,
      color: 'orange',
      description: 'Protection contre les abus et attaques DoS'
    },
    {
      id: 'logs_alerts',
      title: 'Logs & Alerts → erreurs 5xx, latence, auth fails',
      status: 'À compléter',
      impact: 'Moyen',
      priority: 'Moyenne',
      action: 'configure_monitoring',
      icon: BarChart3,
      color: 'orange',
      description: 'Surveillance proactive des incidents système'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Haute': return 'text-red-400';
      case 'Moyenne': return 'text-orange-400';
      case 'Basse': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Haute': 'bg-red-500/20 text-red-400',
      'Moyenne': 'bg-orange-500/20 text-orange-400',
      'Basse': 'bg-yellow-500/20 text-yellow-400'
    };
    return colors?.[priority] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <TrendingUp className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Améliorations recommandées</h2>
      </div>
      <div className="space-y-4">
        {improvements?.map((improvement, index) => {
          const Icon = improvement?.icon;
          const isExecuting = executingActions?.[`improvement_${improvement?.id}`];
          
          return (
            <motion.div
              key={improvement?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-orange-500/30 rounded-xl p-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 bg-orange-500/20 rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-orange-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{improvement?.title}</h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-orange-300">{improvement?.status}</span>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-3">{improvement?.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Impact:</span>
                        <span className={`text-xs font-medium ${getPriorityColor(improvement?.impact)}`}>
                          {improvement?.impact}
                        </span>
                      </div>
                      <div className={`px-2 py-0.5 ${getPriorityBadge(improvement?.priority)} text-xs rounded-full`}>
                        {improvement?.priority}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onExecuteAction(`improvement_${improvement?.id}`, { type: improvement?.action })}
                  disabled={isExecuting}
                  className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Configuration...
                    </>
                  ) : (
                    'Configurer'
                  )}
                </button>
              </div>
              {/* Orange indicator line */}
              <div className={`absolute right-0 top-0 w-1 h-full bg-gradient-to-b ${
                improvement?.priority === 'Haute' ? 'from-red-500 to-red-600' : 
                improvement?.priority === 'Moyenne'? 'from-orange-500 to-orange-600' : 'from-yellow-500 to-yellow-600'
              } rounded-r-xl`} />
            </motion.div>
          );
        })}
      </div>
      {/* Recommendations Summary */}
      <div className="mt-6 p-4 bg-slate-800/20 rounded-xl border border-orange-500/20">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Améliorations recommandées</span>
          <span className="text-white font-medium">0/5 configurées</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-slate-400">2 Haute priorité</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-slate-400">3 Moyenne priorité</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedImprovementsPanel;