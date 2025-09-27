import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Database,
  Layers,
  Search,
  Link,
  BarChart2
} from 'lucide-react';

const StrengthsLimitationsPanel = () => {
  const [activeTab, setActiveTab] = useState('forces');

  const strengths = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Pipeline complet",
      description: "de lecture → stratégie",
      impact: "Automatisation totale",
      color: "green"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Robustesse multi-sources",
      description: "Résilience du système",
      impact: "99.2% disponibilité",
      color: "teal"
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Scoring standardisé",
      description: "Évaluation cohérente",
      impact: "Comparaison fiable",
      color: "cyan"
    }
  ];

  const limitations = [
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Pas encore de clustering",
      description: "Groupement de stratégies manquant",
      priority: "haute",
      impact: "Limitation découverte patterns",
      color: "orange"
    },
    {
      icon: <Link className="h-5 w-5" />,
      title: "Pas encore d\'association rules",
      description: "Mining de règles d\'association absent",
      priority: "moyenne",
      impact: "Corrélations cachées non détectées",
      color: "amber"
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Pas encore de mining cross-asset",
      description: "Analyse multi-instruments manquante",
      priority: "haute",
      impact: "Opportunités inter-marchés ratées",
      color: "red"
    }
  ];

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'haute': return 'red';
      case 'moyenne': return 'yellow';
      case 'basse': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg">
        <button
          onClick={() => setActiveTab('forces')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
            activeTab === 'forces'
              ? 'bg-teal-600 text-white' :'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="h-4 w-4" />
          Forces
        </button>
        <button
          onClick={() => setActiveTab('limites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
            activeTab === 'limites' ?'bg-orange-600 text-white' :'text-gray-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Limites actuelles
        </button>
      </div>
      {/* Strengths Content */}
      {activeTab === 'forces' && (
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
        >
          {strengths?.map((strength, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-teal-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-${strength?.color}-500/20 text-${strength?.color}-400`}>
                  {strength?.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <h3 className="font-semibold text-white">{strength?.title}</h3>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">
                    • {strength?.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Impact:</span>
                    <span className="text-green-400 font-medium">{strength?.impact}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Limitations Content */}
      {activeTab === 'limites' && (
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
        >
          {limitations?.map((limitation, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-${limitation?.color}-500/20 text-${limitation?.color}-400`}>
                  {limitation?.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <h3 className="font-semibold text-white">{limitation?.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs bg-${getPriorityColor(limitation?.priority)}-500/20 text-${getPriorityColor(limitation?.priority)}-400 border border-${getPriorityColor(limitation?.priority)}-500/30`}>
                      {limitation?.priority}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">
                    • {limitation?.description}
                  </p>
                  
                  <div className="text-xs text-gray-400">
                    <span className="text-orange-400">Conséquence:</span> {limitation?.impact}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Enhancement Timeline */}
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30"
          >
            <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Roadmap d'amélioration
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Clustering algorithms:</span>
                <span className="text-blue-400">Q1 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Association rules mining:</span>
                <span className="text-blue-400">Q2 2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Cross-asset mining:</span>
                <span className="text-blue-400">Q3 2024</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default StrengthsLimitationsPanel;