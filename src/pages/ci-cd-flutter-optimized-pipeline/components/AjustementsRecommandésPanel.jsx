import React from 'react';
import { motion } from 'framer-motion';
import { Settings, StopCircle, Lock, Database, Shield, Archive } from 'lucide-react';

const AjustementsRecommandésPanel = () => {
  const ajustements = [
    {
      icon: StopCircle,
      title: "concurrency: cancel-in-progress pour éviter files d\'attente",
      description: "Annulation automatique des builds en cours"
    },
    {
      icon: Lock,
      title: "permissions: least-privilege (contents: read)",
      description: "Sécurité renforcée avec permissions minimales"
    },
    {
      icon: Database,
      title: "PUB_CACHE: définir la variable (sinon cache vide)",
      description: "Configuration du cache Pub pour Flutter"
    },
    {
      icon: Archive,
      title: "Utiliser cache Flutter + actions/cache (pas de doublon)",
      description: "Optimisation du système de cache"
    },
    {
      icon: Shield,
      title: "Codecov v4: token → secrets.CODECOV_TOKEN",
      description: "Configuration sécurisée des tokens"
    },
    {
      icon: Archive,
      title: "Artefacts: retention 7j & path *.apk",
      description: "Gestion optimisée des artefacts de build"
    }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-white">Ajustements recommandés</h2>
      </div>
      <div className="space-y-4">
        {ajustements?.map((ajustement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-start gap-3 p-4 bg-slate-800/30 border border-orange-500/20 rounded-xl hover:bg-slate-800/50 hover:border-orange-400/30 transition-all duration-200"
          >
            <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
              <ajustement.icon className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-medium">•</span>
                <div>
                  <p className="text-white font-medium text-sm leading-relaxed">
                    {ajustement?.title}
                  </p>
                  {ajustement?.description && (
                    <p className="text-slate-300 text-xs mt-1 opacity-80">
                      {ajustement?.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AjustementsRecommandésPanel;