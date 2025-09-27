import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, GitBranch, FileJson, Store } from 'lucide-react';

const DéploiementSécuriséPanel = () => {
  const déploiementItems = [
    {
      icon: GitBranch,
      title: "needs: [quality, unit-tests, build-validation]",
      description: "Dépendances requises avant déploiement"
    },
    {
      icon: GitBranch,
      title: "if: push sur main uniquement",
      description: "Déploiement conditionnel sur la branche principale"
    },
    {
      icon: FileJson,
      title: "env.json généré depuis secrets (jamais commit)",
      description: "Configuration sécurisée des variables d'environnement"
    },
    {
      icon: Store,
      title: "Option store: action dédiée (upload-google-play)",
      description: "Déploiement automatisé vers les stores"
    }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Rocket className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Déploiement sécurisé</h2>
      </div>
      
      <div className="space-y-4">
        {déploiementItems?.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-start gap-3 p-4 bg-slate-800/30 border border-green-500/20 rounded-xl hover:bg-slate-800/50 hover:border-green-400/30 transition-all duration-200"
          >
            <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
              <item.icon className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-medium">•</span>
                <div>
                  <p className="text-white font-medium text-sm leading-relaxed">
                    {item?.title}
                  </p>
                  {item?.description && (
                    <p className="text-slate-300 text-xs mt-1 opacity-80">
                      {item?.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Workflow Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 bg-slate-800/40 border border-green-500/10 rounded-xl"
      >
        <h3 className="text-green-400 font-medium text-sm mb-3">Workflow de déploiement</h3>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="px-2 py-1 bg-green-500/20 rounded text-green-400">Quality</div>
          <span>→</span>
          <div className="px-2 py-1 bg-green-500/20 rounded text-green-400">Tests</div>
          <span>→</span>
          <div className="px-2 py-1 bg-green-500/20 rounded text-green-400">Build</div>
          <span>→</span>
          <div className="px-2 py-1 bg-green-500/20 rounded text-green-400">Deploy</div>
        </div>
      </motion.div>
    </div>
  );
};

export default DéploiementSécuriséPanel;