import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Reference Image Display - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2">
          <img 
            src="/assets/images/Plaquette_Supabase_Hardening-1759009765234.jpg" 
            alt="Supabase Hardening Reference Plan" 
            className="w-32 h-20 object-cover rounded opacity-80 hover:opacity-100 transition-opacity duration-200"
            title="Plan de référence Supabase Hardening"
          />
          <div className="text-xs text-slate-400 text-center mt-1">Référence</div>
        </div>
      </div>
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
              <Clock className="w-5 h-5 text-teal-400" />
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

        {/* Main Grid Layout - Matching Image Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Priority Fixes (Teal Section) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 rounded-2xl p-6"
          >
            <PriorityFixesPanel 
              data={hardeningData} 
              onExecuteAction={executeAction}
              executingActions={executingActions}
            />
          </motion.div>

          {/* Right Column - Recommended Improvements (Orange Section) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-2xl p-6"
          >
            <RecommendedImprovementsPanel 
              data={hardeningData}
              onExecuteAction={executeAction}
              executingActions={executingActions}
            />
          </motion.div>
        </div>

        {/* Bottom - Action Plan (Green Section) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-6"
        >
          <RocketActionPlanPanel 
            data={hardeningData}
            onExecuteAction={executeAction}
            executingActions={executingActions}
            onRefresh={loadHardeningData}
          />
        </motion.div>
      </div>
      {/* Background Elements - Enhanced to match image theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-orange-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-purple-500/4 rounded-full blur-2xl" />
      </div>
      {/* Success Notification */}
      {!loading && !error && hardeningData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-green-500/20 border border-green-500/30 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="text-sm">
              <div className="text-green-400 font-medium">Plan Express activé</div>
              <div className="text-green-300/80">Données sécurité chargées</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SupabaseHardeningExpressPlan;