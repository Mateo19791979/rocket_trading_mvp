import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertTriangle } from 'lucide-react';
import PriorityFixesPanel from './components/PriorityFixesPanel';
import RecommendedImprovementsPanel from './components/RecommendedImprovementsPanel';
import RocketActionPlanPanel from './components/RocketActionPlanPanel';
import SecurityMetricsPanel from './components/SecurityMetricsPanel';
import supabaseHardeningService from '../../services/supabaseHardeningService';
import { useAuth } from '../../contexts/AuthContext';

const SupabaseHardeningExpressPlan = () => {
  const { user } = useAuth();
  const [hardeningData, setHardeningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executingActions, setExecutingActions] = useState({});

  useEffect(() => {
    loadHardeningData();
  }, [user]);

  const loadHardeningData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const summary = await supabaseHardeningService?.getHardeningStatusSummary(user?.id);
      setHardeningData(summary);
      setError(null);
    } catch (err) {
      console.error('Error loading hardening data:', err);
      setError('Impossible de charger les données de sécurité');
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (actionType, parameters = {}) => {
    try {
      setExecutingActions(prev => ({ ...prev, [actionType]: true }));
      await supabaseHardeningService?.executeHardeningAction(actionType, parameters);
      await loadHardeningData(); // Refresh data after action
    } catch (err) {
      console.error('Error executing action:', err);
      setError(`Erreur lors de l'exécution de l'action: ${actionType}`);
    } finally {
      setExecutingActions(prev => ({ ...prev, [actionType]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                Supabase Hardening — Plan Express
              </h1>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-lg">Sécurité & performance en 15 minutes</span>
            </div>
            <div className="mt-3 text-sm text-slate-400">
              {new Date()?.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </motion.div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Security Metrics Overview */}
        <SecurityMetricsPanel data={hardeningData} className="mb-8" />

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Priority Fixes */}
          <PriorityFixesPanel 
            data={hardeningData} 
            onExecuteAction={executeAction}
            executingActions={executingActions}
          />

          {/* Right Column - Recommended Improvements */}
          <RecommendedImprovementsPanel 
            data={hardeningData}
            onExecuteAction={executeAction}
            executingActions={executingActions}
          />
        </div>

        {/* Bottom - Action Plan */}
        <RocketActionPlanPanel 
          data={hardeningData}
          onExecuteAction={executeAction}
          executingActions={executingActions}
          onRefresh={loadHardeningData}
        />
      </div>
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-orange-500/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default SupabaseHardeningExpressPlan;