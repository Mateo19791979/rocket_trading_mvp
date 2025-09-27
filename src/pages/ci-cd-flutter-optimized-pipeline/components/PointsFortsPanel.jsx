import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, GitBranch, Zap, Shield, BarChart3, Bell } from 'lucide-react';

const PointsFortsPanel = () => {
  const pointsForts = [
    {
      icon: GitBranch,
      title: "Triggers propres: push/pr + paths filtrés + schedule + dispatch",
      description: "Déclenchements intelligents avec filtrage des chemins"
    },
    {
      icon: Zap,
      title: "Jobs parallèles: qualité, tests, build-validation",
      description: "Exécution parallèle pour optimiser les temps de build"
    },
    {
      icon: BarChart3,
      title: "Couverture ≥ 80% avec Codecov",
      description: "Intégration continue avec métriques de couverture"
    },
    {
      icon: Shield,
      title: "Build multi-flavors (develop, production)",
      description: "Configurations différenciées par environnement"
    },
    {
      icon: Shield,
      title: "Scan sécurité nocturne (TruffleHog, Snyk)",
      description: "Analyse de sécurité automatisée et programmée"
    },
    {
      icon: Bell,
      title: "Notification finale consolidée",
      description: "Rapports centralisés de l\'état du pipeline"
    }
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-teal-400" />
        <h2 className="text-2xl font-bold text-white">Points forts de ta version</h2>
      </div>
      <div className="space-y-4">
        {pointsForts?.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-start gap-3 p-4 bg-slate-800/30 border border-teal-500/20 rounded-xl hover:bg-slate-800/50 hover:border-teal-400/30 transition-all duration-200"
          >
            <div className="p-2 bg-teal-500/20 rounded-lg group-hover:bg-teal-500/30 transition-colors">
              <point.icon className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <span className="text-teal-400 font-medium">•</span>
                <div>
                  <p className="text-white font-medium text-sm leading-relaxed">
                    {point?.title}
                  </p>
                  {point?.description && (
                    <p className="text-slate-300 text-xs mt-1 opacity-80">
                      {point?.description}
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

export default PointsFortsPanel;