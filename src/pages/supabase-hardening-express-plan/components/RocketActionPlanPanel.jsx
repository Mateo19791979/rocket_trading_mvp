import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Play, Pause, RotateCcw, Clock, Database, Shield, Settings, Zap, Loader2 } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const RocketActionPlanPanel = ({ data, onExecuteAction, executingActions, onRefresh }) => {
  const [autoExecution, setAutoExecution] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const actionSteps = [
    {
      id: 'sql_script',
      step: 1,
      title: 'Appliquer script SQL (supabase_fix_search_path.sql)',
      description: 'Configuration sécurisée des fonctions search_path PostgreSQL',
      icon: Database,
      color: 'green',
      status: 'completed',
      duration: '2 min',
      action: 'apply_sql_script'
    },
    {
      id: 'leaked_password',
      step: 2,
      title: 'Activer leaked password check',
      description: 'Protection contre les mots de passe compromis dans Auth Dashboard',
      icon: Shield,
      color: 'green',
      status: 'pending',
      duration: '1 min',
      action: 'enable_password_protection'
    },
    {
      id: 'mfa_setup',
      step: 3,
      title: 'Activer MFA multi-méthodes',
      description: 'TOTP + WebAuthn obligatoire pour admins/staff',
      icon: Shield,
      color: 'green',
      status: 'pending',
      duration: '3 min',
      action: 'setup_multi_mfa'
    },
    {
      id: 'postgres_upgrade',
      step: 4,
      title: 'Upgrade Postgres (fenêtre maintenance)',
      description: 'Patch de sécurité mineur avec fenêtre de maintenance',
      icon: Settings,
      color: 'green',
      status: 'pending',
      duration: '5 min',
      action: 'schedule_postgres_upgrade'
    },
    {
      id: 'final_checklist',
      step: 5,
      title: 'Vérifier checklist RLS / Index / Policies / Logs',
      description: 'Validation complète de la configuration de sécurité',
      icon: CheckCircle,
      color: 'green',
      status: 'pending',
      duration: '4 min',
      action: 'final_validation'
    }
  ];

  const getStatusIcon = (step) => {
    const isExecuting = executingActions?.[`action_${step?.id}`];
    if (isExecuting) {
      return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
    if (step?.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (step?.step === currentStep) {
      return <Play className="w-5 h-5 text-orange-400" />;
    }
    return <Clock className="w-5 h-5 text-slate-500" />;
  };

  const getStepStatus = (step) => {
    if (executingActions?.[`action_${step?.id}`]) return 'executing';
    if (step?.status === 'completed') return 'completed';
    if (step?.step === currentStep) return 'current';
    if (step?.step < currentStep) return 'completed';
    return 'pending';
  };

  const executeStep = async (step) => {
    await onExecuteAction(`action_${step?.id}`, { type: step?.action });
    if (step?.step === currentStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const startAutoExecution = async () => {
    setAutoExecution(true);
    for (const step of actionSteps?.slice(currentStep - 1)) {
      if (!executingActions?.[`action_${step?.id}`] && step?.status !== 'completed') {
        await executeStep(step);
        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setAutoExecution(false);
  };

  const resetPlan = () => {
    setCurrentStep(1);
    setAutoExecution(false);
    onRefresh?.();
  };

  const getTotalDuration = () => {
    return actionSteps?.reduce((total, step) => {
      const minutes = parseInt(step?.duration);
      return total + minutes;
    }, 0);
  };

  const getCompletedSteps = () => {
    return actionSteps?.filter(step => 
      step?.status === 'completed' || executingActions?.[`action_${step?.id}`]
    )?.length;
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Rocket className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">✅ Plan d'action Rocket</h2>
            <p className="text-sm text-slate-400">Automatisation du durcissement Supabase</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="text-slate-400">Durée estimée</div>
            <div className="text-white font-semibold">{getTotalDuration()} minutes</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetPlan}
              className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all duration-200"
              title="Réinitialiser le plan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={startAutoExecution}
              disabled={autoExecution || getCompletedSteps() === actionSteps?.length}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {autoExecution ? (
                <>
                  <Pause className="w-4 h-4" />
                  Exécution...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Exécution automatique
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Progress Overview */}
      <div className="mb-6 p-4 bg-slate-800/20 rounded-xl border border-green-500/20">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400">Progression globale du plan d'action</span>
          <span className="text-white font-medium">
            {getCompletedSteps()}/{actionSteps?.length} étapes complétées
          </span>
        </div>
        <div className="w-full bg-slate-600/50 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(getCompletedSteps() / actionSteps?.length) * 100}%` }}
          />
        </div>
      </div>
      {/* Action Steps */}
      <div className="space-y-3">
        {actionSteps?.map((step, index) => {
          const Icon = step?.icon;
          const status = getStepStatus(step);
          const isExecuting = executingActions?.[`action_${step?.id}`];
          
          return (
            <motion.div
              key={step?.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                status === 'completed' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : status === 'current' || isExecuting ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800/40 border-green-500/20'
              }`}
            >
              {/* Step Number & Icon */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : status === 'current' || isExecuting ? 'bg-orange-500 text-white' : 'bg-slate-600 text-slate-300'
                }`}>
                  {step?.step}
                </div>
                
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Icon className="w-5 h-5 text-green-400" />
                </div>
              </div>
              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{step?.title}</h3>
                  {getStatusIcon(step)}
                </div>
                <p className="text-sm text-slate-400">{step?.description}</p>
              </div>
              {/* Duration & Action */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Durée</div>
                  <div className="text-sm text-slate-300 font-medium">{step?.duration}</div>
                </div>

                {status !== 'completed' && !isExecuting && (
                  <button
                    onClick={() => executeStep(step)}
                    className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Exécuter
                  </button>
                )}
              </div>
              {/* Progress Line */}
              <div className={`absolute left-4 top-14 w-0.5 h-6 ${
                index < actionSteps?.length - 1 ? 'bg-green-500/30' : 'bg-transparent'
              }`} />
            </motion.div>
          );
        })}
      </div>
      {/* Final Summary */}
      {getCompletedSteps() === actionSteps?.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-white">Plan d'action complété !</h4>
              <p className="text-sm text-slate-300">
                Votre instance Supabase est maintenant durcie et optimisée pour la production.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RocketActionPlanPanel;