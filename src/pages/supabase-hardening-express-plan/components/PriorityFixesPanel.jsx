import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Database, Shield, Lock, Settings, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const PriorityFixesPanel = ({ data, onExecuteAction, executingActions }) => {
  const priorityFixes = [
    {
      id: 'search_path',
      title: 'Fonctions search_path (37)',
      status: '→ appliquer script SQL fourni',
      impact: 'Critique',
      complexity: 'Moyen',
      action: 'apply_search_path_fix',
      icon: Database,
      color: 'teal',
      description: 'Configuration sécurisée des chemins de recherche PostgreSQL'
    },
    {
      id: 'leaked_password',
      title: 'Leaked Password Protection',
      status: '→ activer Dashboard Auth',
      impact: 'Élevé',
      complexity: 'Facile',
      action: 'enable_leaked_password_protection',
      icon: Shield,
      color: 'teal',
      description: 'Protection contre les mots de passe compromis'
    },
    {
      id: 'mfa_advanced',
      title: 'MFA avancée',
      status: '→ TOTP + WebAuthn, obligatoire admins/staff',
      impact: 'Élevé',
      complexity: 'Moyen',
      action: 'setup_advanced_mfa',
      icon: Lock,
      color: 'teal',
      description: 'Authentification multi-facteurs pour rôles sensibles'
    },
    {
      id: 'postgres_upgrade',
      title: 'Upgrade Postgres',
      status: '→ patch sécurité mineur',
      impact: 'Moyen',
      complexity: 'Élevé',
      action: 'upgrade_postgres',
      icon: Settings,
      color: 'teal',
      description: 'Mise à jour des correctifs de sécurité PostgreSQL'
    }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Critique': return 'text-red-400';
      case 'Élevé': return 'text-orange-400';
      case 'Moyen': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getComplexityBadge = (complexity) => {
    const colors = {
      'Facile': 'bg-green-500/20 text-green-400',
      'Moyen': 'bg-orange-500/20 text-orange-400',
      'Élevé': 'bg-red-500/20 text-red-400'
    };
    return colors?.[complexity] || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusIcon = (fixId) => {
    if (executingActions?.[`priority_${fixId}`]) {
      return <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />;
    }
    if (fixId === 'search_path') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    return <Clock className="w-4 h-4 text-teal-400" />;
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-500/20 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Correctifs prioritaires</h2>
      </div>
      <div className="space-y-4">
        {priorityFixes?.map((fix, index) => {
          const Icon = fix?.icon;
          const isExecuting = executingActions?.[`priority_${fix?.id}`];
          
          return (
            <motion.div
              key={fix?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-teal-500/30 rounded-xl p-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 bg-teal-500/20 rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-teal-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{fix?.title}</h3>
                      {getStatusIcon(fix?.id)}
                    </div>
                    
                    <div className="text-sm text-teal-300 mb-2">{fix?.status}</div>
                    
                    <p className="text-sm text-slate-400 mb-3">{fix?.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Impact:</span>
                        <span className={`text-xs font-medium ${getImpactColor(fix?.impact)}`}>
                          {fix?.impact}
                        </span>
                      </div>
                      <div className={`px-2 py-0.5 ${getComplexityBadge(fix?.complexity)} text-xs rounded-full`}>
                        {fix?.complexity}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onExecuteAction(`priority_${fix?.id}`, { type: fix?.action })}
                  disabled={isExecuting}
                  className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Exécution...
                    </>
                  ) : (
                    'Appliquer'
                  )}
                </button>
              </div>
              {/* Teal indicator line */}
              <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${
                fix?.id === 'search_path' ? 'from-green-500 to-green-600' : 'from-teal-500 to-teal-600'
              } rounded-l-xl`} />
            </motion.div>
          );
        })}
      </div>
      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-slate-800/20 rounded-xl border border-teal-500/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Progression des correctifs prioritaires</span>
          <span className="text-white font-medium">1/4 complétés</span>
        </div>
        <div className="mt-2 w-full bg-slate-600/50 rounded-full h-2">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full w-1/4" />
        </div>
      </div>
    </div>
  );
};

export default PriorityFixesPanel;