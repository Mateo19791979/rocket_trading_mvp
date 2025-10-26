import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Target, Clock, CheckCircle, AlertCircle, TrendingUp, Brain, Layers, Link, Calendar, Users, Zap } from 'lucide-react';

const InteractiveRoadmapPanel = () => {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [activeTimeframe, setActiveTimeframe] = useState('all');

  const roadmapItems = [
    {
      id: 1,
      phase: "Phase 1",
      title: "Étendre Registry avec IA Stratégie Générative",
      description: "Intégration d'un moteur génératif pour créer automatiquement de nouvelles stratégies",
      status: "planned",
      priority: "haute",
      timeline: "Q1 2025",
      effort: "8 semaines",
      team: "AI/ML",
      icon: <Brain className="h-5 w-5" />,
      dependencies: ["Registry v0.1"],
      deliverables: [
        "Générateur de stratégies LLM",
        "Validation automatique",
        "Interface d\'évaluation"
      ],
      risks: ["Complexité algorithmique", "Performance temps réel"],
      color: "cyan"
    },
    {
      id: 2,
      phase: "Phase 2", 
      title: "Ajouter Backtester autonome (FastAPI)",
      description: "Développement d\'un système de backtesting massivement parallèle",
      status: "planned",
      priority: "haute",
      timeline: "Q1-Q2 2025",
      effort: "10 semaines",
      team: "Backend",
      icon: <TrendingUp className="h-5 w-5" />,
      dependencies: ["Phase 1"],
      deliverables: [
        "API FastAPI haute performance",
        "Backtesting parallèle",
        "Métriques avancées"
      ],
      risks: ["Charge serveur", "Qualité données historiques"],
      color: "teal"
    },
    {
      id: 3,
      phase: "Phase 3",
      title: "Brancher Optimiseur de portefeuille ML",
      description: "Machine learning pour l\'allocation dynamique et l\'optimisation de portefeuille",
      status: "planned", 
      priority: "moyenne",
      timeline: "Q2 2025",
      effort: "12 semaines",
      team: "AI/ML + Quant",
      icon: <Layers className="h-5 w-5" />,
      dependencies: ["Phase 2"],
      deliverables: [
        "Modèles ML d\'allocation",
        "Risk Parity dynamique",
        "Rébalancement automatique"
      ],
      risks: ["Overfitting", "Robustesse modèles"],
      color: "blue"
    },
    {
      id: 4,
      phase: "Phase 4",
      title: "Activer Risk Controller (VaR / CVaR)",
      description: "Système de contrôle des risques avec métriques avancées et kill-switch automatique",
      status: "planned",
      priority: "haute", 
      timeline: "Q2-Q3 2025",
      effort: "6 semaines",
      team: "Risk + Backend",
      icon: <AlertCircle className="h-5 w-5" />,
      dependencies: ["Phase 3"],
      deliverables: [
        "Calculs VaR/CVaR temps réel",
        "Kill-switch automatique",
        "Alertes intelligentes"
      ],
      risks: ["Faux positifs", "Latence critique"],
      color: "orange"
    },
    {
      id: 5,
      phase: "Phase 5",
      title: "Monitoring via Rocket + rapports PDF",
      description: "Interface utilisateur complète avec génération automatique de rapports",
      status: "planned",
      priority: "moyenne",
      timeline: "Q3 2025", 
      effort: "4 semaines",
      team: "Frontend + DevOps",
      icon: <Target className="h-5 w-5" />,
      dependencies: ["Phase 4"],
      deliverables: [
        "Dashboard temps réel",
        "Rapports PDF automatisés",
        "Notifications push"
      ],
      risks: ["UX complexity", "Performance frontend"],
      color: "green"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'planned': return 'gray';
      default: return 'gray';
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

  const timeframes = [
    { id: 'all', label: 'Tout' },
    { id: 'q1', label: 'Q1 2025' },
    { id: 'q2', label: 'Q2 2025' },
    { id: 'q3', label: 'Q3 2025' }
  ];

  const filteredItems = activeTimeframe === 'all' 
    ? roadmapItems 
    : roadmapItems?.filter(item => item?.timeline?.includes(activeTimeframe?.toUpperCase()));

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Roadmap Interactive</h2>
      </div>
      {/* Timeframe Filter */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-900/50 rounded-lg">
        {timeframes?.map((timeframe) => (
          <button
            key={timeframe?.id}
            onClick={() => setActiveTimeframe(timeframe?.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTimeframe === timeframe?.id
                ? 'bg-blue-600 text-white' :'text-gray-400 hover:text-white'
            }`}
          >
            {timeframe?.label}
          </button>
        ))}
      </div>
      {/* Roadmap Items */}
      <div className="space-y-4">
        {filteredItems?.map((item, index) => (
          <motion.div
            key={item?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-900/50 rounded-lg p-4 border border-gray-600 cursor-pointer transition-all hover:border-${item?.color}-500/50 ${
              selectedPhase === item?.id ? `border-${item?.color}-500 bg-${item?.color}-900/10` : ''
            }`}
            onClick={() => setSelectedPhase(selectedPhase === item?.id ? null : item?.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-2 rounded-lg bg-${item?.color}-500/20 text-${item?.color}-400`}>
                  {item?.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {item?.phase}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs bg-${getPriorityColor(item?.priority)}-500/20 text-${getPriorityColor(item?.priority)}-400`}>
                      {item?.priority}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs bg-${getStatusColor(item?.status)}-500/20 text-${getStatusColor(item?.status)}-400`}>
                      {item?.status}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-2">{item?.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{item?.description}</p>
                  
                  <div className="flex items-center gap-6 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{item?.timeline}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{item?.effort}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{item?.team}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                animate={{ rotate: selectedPhase === item?.id ? 180 : 0 }}
                className="text-gray-400"
              >
                <Zap className="h-4 w-4" />
              </motion.div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {selectedPhase === item?.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-white mb-2">Livrables</h4>
                      <ul className="space-y-1">
                        {item?.deliverables?.map((deliverable, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-300">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Dépendances</h4>
                      <ul className="space-y-1">
                        {item?.dependencies?.map((dep, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-300">
                            <Link className="h-3 w-3 text-blue-400" />
                            {dep}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Risques</h4>
                      <ul className="space-y-1">
                        {item?.risks?.map((risk, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-300">
                            <AlertCircle className="h-3 w-3 text-orange-400" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">5</div>
          <div className="text-xs text-gray-400">Phases Total</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-teal-400">40</div>
          <div className="text-xs text-gray-400">Semaines Effort</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">3</div>
          <div className="text-xs text-gray-400">Priorité Haute</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">Q4 2025</div>
          <div className="text-xs text-gray-400">Fin Prévue</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveRoadmapPanel;