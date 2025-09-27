import React from 'react';
import { motion } from 'framer-motion';
import { Database, Cpu, GitBranch, CheckCircle, Activity, BarChart3, RefreshCw, Zap } from 'lucide-react';

const EstablishedCapabilitiesPanel = () => {
  const capabilities = [
    {
      icon: <Database className="h-5 w-5" />,
      title: "Registry v0.1",
      subtitle: "stratégies extraites",
      description: "Système d\'indexation et d\'extraction automatique des stratégies de trading",
      status: "active",
      metrics: {
        strategies: 156,
        accuracy: 94.2,
        uptime: 99.1
      },
      features: [
        "Extraction automatique de stratégies",
        "Indexation multi-sources",
        "Classification intelligente",
        "API REST complète"
      ],
      color: "cyan"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Scoring Engine",
      subtitle: "Sharpe, drawdown, régimes",
      description: "Moteur de scoring avancé pour l\'évaluation quantitative des stratégies",
      status: "active",
      metrics: {
        calculations: "45.6k",
        precision: 97.8,
        speed: 23.4
      },
      features: [
        "Calcul Sharpe Ratio automatique",
        "Analyse Maximum Drawdown",
        "Détection de régimes de marché",
        "Métriques personnalisées"
      ],
      color: "teal"
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "Orchestrateur",
      subtitle: "sélection automatique",
      description: "Système intelligent de sélection et d\'allocation automatique des stratégies",
      status: "active",
      metrics: {
        selections: 234,
        performance: 97.3,
        allocations: 89
      },
      features: [
        "Sélection automatique de stratégies",
        "Allocation dynamique",
        "Rééquilibrage intelligent",
        "Gestion des risques intégrée"
      ],
      color: "orange"
    },
    {
      icon: <GitBranch className="h-5 w-5" />,
      title: "Dual Flux",
      subtitle: "Private Corpus + Open Access",
      description: "Architecture à double flux pour données propriétaires et sources ouvertes",
      status: "active",
      metrics: {
        sources: 12,
        volume: "2.1TB",
        sync: 98.5
      },
      features: [
        "Corpus privé sécurisé",
        "Sources Open Access",
        "Synchronisation temps réel",
        "Validation croisée des données"
      ],
      color: "blue"
    }
  ];

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">ACTIF</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-yellow-400 text-xs font-medium">ATTENTION</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-400 text-xs font-medium">INACTIF</span>
          </div>
        );
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="space-y-6">
      {capabilities?.map((capability, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
          className="bg-gray-900/50 rounded-lg p-5 border border-gray-600 hover:border-gray-500 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-${capability?.color}-500/20 text-${capability?.color}-400`}>
              {capability?.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <h3 className="font-semibold text-white">{capability?.title}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{capability?.subtitle}</p>
                </div>
                {getStatusIndicator(capability?.status)}
              </div>
              
              <p className="text-gray-300 text-sm mb-4">
                {capability?.description}
              </p>
              
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-800/50 rounded-lg">
                {Object.entries(capability?.metrics)?.map(([key, value], idx) => (
                  <div key={idx} className="text-center">
                    <div className={`text-lg font-bold text-${capability?.color}-400`}>
                      {typeof value === 'number' && value % 1 === 0 ? value : 
                       typeof value === 'number' ? value?.toFixed(1) + '%' : value}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {key === 'strategies' ? 'Stratégies' :
                       key === 'accuracy' ? 'Précision' :
                       key === 'uptime' ? 'Disponibilité' :
                       key === 'calculations' ? 'Calculs/j' :
                       key === 'precision' ? 'Précision' :
                       key === 'speed' ? 'Vitesse (ms)' :
                       key === 'selections' ? 'Sélections' :
                       key === 'performance' ? 'Performance' :
                       key === 'allocations' ? 'Allocations' :
                       key === 'sources' ? 'Sources' :
                       key === 'volume' ? 'Volume' :
                       key === 'sync' ? 'Sync' : key}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {capability?.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <Activity className="h-3 w-3 text-green-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      {/* System Health Summary */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-lg p-4 border border-green-600/30"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-green-400 font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            État Global du Système
          </h4>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-medium">Opérationnel</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">4/4</div>
            <div className="text-gray-400 text-xs">Composants</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-teal-400">97.8%</div>
            <div className="text-gray-400 text-xs">Santé Globale</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-400">156</div>
            <div className="text-gray-400 text-xs">Stratégies</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">45.6k</div>
            <div className="text-gray-400 text-xs">Ops/Jour</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">0</div>
            <div className="text-gray-400 text-xs">Alertes</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EstablishedCapabilitiesPanel;