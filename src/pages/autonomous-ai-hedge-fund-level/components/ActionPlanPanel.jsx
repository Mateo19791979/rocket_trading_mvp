import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Database, Zap, Target, Shield, BarChart3, Clock, PlayCircle } from 'lucide-react';

const ActionPlanPanel = () => {
  const actionItems = [
    {
      id: 1,
      title: 'Étendre Registry avec IA Stratégie Générative',
      status: 'in-progress',
      priority: 'high',
      progress: 67,
      icon: Database,
      details: {
        estimate: '2-3 semaines',
        resources: 'DevOps + ML Team',
        dependencies: 'Registry v0.1'
      }
    },
    {
      id: 2,
      title: 'Ajouter Backtester autonome (FastAPI)',
      status: 'planning',
      priority: 'high',
      progress: 23,
      icon: Zap,
      details: {
        estimate: '3-4 semaines',
        resources: 'Backend Team',
        dependencies: 'Container Infrastructure'
      }
    },
    {
      id: 3,
      title: 'Brancher Optimiseur de portefeuille ML',
      status: 'pending',
      priority: 'medium',
      progress: 8,
      icon: Target,
      details: {
        estimate: '4-5 semaines',
        resources: 'ML + Quant Team',
        dependencies: 'Backtester API'
      }
    },
    {
      id: 4,
      title: 'Activer Risk Controller (VaR / CVaR)',
      status: 'pending',
      priority: 'critical',
      progress: 0,
      icon: Shield,
      details: {
        estimate: '2-3 semaines',
        resources: 'Risk Team',
        dependencies: 'Position Tracking'
      }
    },
    {
      id: 5,
      title: 'Monitoring via Rocket + rapports PDF',
      status: 'ready',
      priority: 'medium',
      progress: 89,
      icon: BarChart3,
      details: {
        estimate: '1-2 semaines',
        resources: 'Frontend Team',
        dependencies: 'Dashboard API'
      }
    }
  ];

  const getStatusInfo = (status) => {
    const statusMap = {
      'completed': { 
        color: 'text-green-400', 
        bg: 'bg-green-500/20', 
        icon: CheckCircle,
        label: 'Terminé'
      },
      'in-progress': { 
        color: 'text-cyan-400', 
        bg: 'bg-cyan-500/20', 
        icon: PlayCircle,
        label: 'En cours'
      },
      'ready': { 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/20', 
        icon: PlayCircle,
        label: 'Prêt'
      },
      'planning': { 
        color: 'text-yellow-400', 
        bg: 'bg-yellow-500/20', 
        icon: Clock,
        label: 'Planifié'
      },
      'pending': { 
        color: 'text-gray-400', 
        bg: 'bg-gray-500/20', 
        icon: Clock,
        label: 'En attente'
      }
    };
    return statusMap?.[status] || statusMap?.pending;
  };

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      'critical': { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Critique' },
      'high': { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Élevée' },
      'medium': { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Moyenne' },
      'low': { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Faible' }
    };
    return priorityMap?.[priority] || priorityMap?.medium;
  };

  return (
    <motion.div 
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            ✅ Plan d'action
          </h3>
          <p className="text-sm text-gray-400">Roadmap de déploiement des IA autonomes</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Progression globale</div>
          <div className="text-xl font-bold text-cyan-400">37.4%</div>
        </div>
      </div>
      <div className="space-y-4">
        {actionItems?.map((item, index) => {
          const statusInfo = getStatusInfo(item?.status);
          const priorityInfo = getPriorityInfo(item?.priority);
          const StatusIcon = statusInfo?.icon;
          
          return (
            <motion.div
              key={item?.id}
              className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.7 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full font-bold text-white text-sm">
                  {item?.id}
                </div>

                <div className={`flex items-center justify-center w-10 h-10 ${statusInfo?.bg} rounded-lg`}>
                  <item.icon className={`h-5 w-5 ${statusInfo?.color}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white leading-tight">{item?.title}</h4>
                    <div className="flex items-center gap-2 ml-4">
                      <div className={`px-2 py-1 ${priorityInfo?.bg} rounded-full`}>
                        <span className={`text-xs font-medium ${priorityInfo?.color}`}>
                          {priorityInfo?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center gap-1 px-2 py-1 ${statusInfo?.bg} rounded-full`}>
                      <StatusIcon className={`h-3 w-3 ${statusInfo?.color}`} />
                      <span className={`text-xs font-medium ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${statusInfo?.color === 'text-cyan-400' ? 'from-cyan-500 to-cyan-600' : statusInfo?.color === 'text-green-400' ? 'from-green-500 to-green-600' : 'from-gray-500 to-gray-600'} transition-all duration-1000`}
                          style={{ width: `${item?.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white font-medium">{item?.progress}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {Object.entries(item?.details)?.map(([key, value], idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-gray-400 capitalize mb-1">{key === 'estimate' ? 'Durée' : key === 'resources' ? 'Équipe' : 'Dépendance'}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">1</div>
            <div className="text-sm text-gray-400">Terminé</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400 mb-1">2</div>
            <div className="text-sm text-gray-400">En cours</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">2</div>
            <div className="text-sm text-gray-400">À démarrer</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActionPlanPanel;