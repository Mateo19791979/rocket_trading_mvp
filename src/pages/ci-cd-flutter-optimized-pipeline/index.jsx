import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Clock, CheckCircle } from 'lucide-react';
import PointsFortsPanel from './components/PointsFortsPanel';
import AjustementsRecommandésPanel from './components/AjustementsRecommandésPanel';
import SnippetsCollerPanel from './components/SnippetsCollerPanel';
import DéploiementSécuriséPanel from './components/DéploiementSécuriséPanel';

const CiCdFlutterOptimizedPipeline = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900">
      {/* Reference Image Display - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-2">
          <img 
            src="/assets/images/Plaquette_CICD_Flutter_Optimise-1759011685402.jpg" 
            alt="CI/CD Flutter Pipeline Optimisé Reference" 
            className="w-32 h-20 object-cover rounded opacity-80 hover:opacity-100 transition-opacity duration-200"
            title="Plan de référence CI/CD Flutter Pipeline"
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
                <GitBranch className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">
                CI/CD Flutter — Pipeline Optimisé
              </h1>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <Clock className="w-5 h-5 text-teal-400" />
              <span className="text-lg">Déclencheurs filtrés • Cache efficace • Sécurité & Déploiement maîtrisés</span>
            </div>
            <div className="mt-3 text-sm text-slate-400">
              {new Date()?.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>
          </motion.div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Grid Layout - Two Column Layout Matching Image */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Points forts de ta version - Teal Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 rounded-2xl p-6"
            >
              <PointsFortsPanel />
            </motion.div>

            {/* Ajustements recommandés - Orange Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-2xl p-6"
            >
              <AjustementsRecommandésPanel />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Snippets à coller - Blue Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-6"
            >
              <SnippetsCollerPanel />
            </motion.div>

            {/* Déploiement sécurisé - Green Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-2xl p-6"
            >
              <DéploiementSécuriséPanel />
            </motion.div>
          </div>
        </div>
      </div>
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-orange-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-violet-500/4 rounded-full blur-2xl" />
      </div>
      {/* Success Notification */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-green-500/20 border border-green-500/30 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div className="text-sm">
            <div className="text-green-400 font-medium">Pipeline Optimisé</div>
            <div className="text-green-300/80">Configuration CI/CD chargée</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CiCdFlutterOptimizedPipeline;