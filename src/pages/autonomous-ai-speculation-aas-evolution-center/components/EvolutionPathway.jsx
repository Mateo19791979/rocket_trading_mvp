import React, { useState } from 'react';
import { Brain, Play, Pause, TrendingUp, Zap, Target, Settings, CheckCircle, Circle } from 'lucide-react';

export default function EvolutionPathway({ evolutionMetrics, onActivateLevel, aiAgents }) {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const evolutionLevels = [
    {
      id: 'level1_copilote',
      name: 'L1: IA "Copilote"',
      description: 'Assistant expert - analyse, filtre, suggère',
      icon: Brain,
      color: 'blue',
      capabilities: [
        'DHI (qualité data)',
        'IQS (qualité des insights)',
        'RAG (recherche augmentée)',
        'Screeners avancés'
      ],
      performance: 'Augmente productivité humaine'
    },
    {
      id: 'level2_apprentie',
      name: 'L2: IA "Apprentie"',
      description: 'Micro-décisions autonomes contrôlées',
      icon: Target,
      color: 'green',
      capabilities: [
        'Gestion source autonome',
        'Allocation budget calcul',
        'Auto-correction prompts',
        'A/B testing stratégies'
      ],
      performance: 'Décisions micro-autonomes'
    },
    {
      id: 'level3_adaptative',
      name: 'L3: IA "Adaptative"',
      description: 'Modification comportement selon marché',
      icon: TrendingUp,
      color: 'yellow',
      capabilities: [
        'Conscience régime marché',
        'Allocation dynamique stratégies',
        'Gestion risque paramétrique',
        'Adaptation temps réel'
      ],
      performance: 'Vraie autonomie contextuelle'
    },
    {
      id: 'level4_generative',
      name: 'L4: IA "Générative"',
      description: 'Création de nouvelles stratégies',
      icon: Zap,
      color: 'purple',
      capabilities: [
        'Algorithmes génétiques',
        'Sélection naturelle virtuelle',
        'Découverte facteurs Alpha',
        'Innovation stratégique'
      ],
      performance: 'Créativité stratégique'
    },
    {
      id: 'level5_speculative',
      name: 'L5: IA "Autonome Spéculative"',
      description: 'Hedge fund entièrement automatisé',
      icon: Settings,
      color: 'red',
      capabilities: [
        'Méta-apprentissage',
        'Gestion portefeuille stratégies',
        'Auto-gouvernance continue',
        'Audit autonome'
      ],
      performance: 'Performance révolutionnaire'
    }
  ];

  const getColorClasses = (color, active = false) => {
    const colors = {
      blue: active ? 'bg-blue-500/30 border-blue-400' : 'bg-blue-500/10 border-blue-500/30',
      green: active ? 'bg-green-500/30 border-green-400' : 'bg-green-500/10 border-green-500/30',
      yellow: active ? 'bg-yellow-500/30 border-yellow-400' : 'bg-yellow-500/10 border-yellow-500/30',
      purple: active ? 'bg-purple-500/30 border-purple-400' : 'bg-purple-500/10 border-purple-500/30',
      red: active ? 'bg-red-500/30 border-red-400' : 'bg-red-500/10 border-red-500/30'
    };
    return colors?.[color] || colors?.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      yellow: 'text-yellow-400',
      purple: 'text-purple-400',
      red: 'text-red-400'
    };
    return colors?.[color] || colors?.blue;
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-purple-500/30">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-2">Evolution Pathway</h2>
        <p className="text-gray-400 text-sm">5 Progressive Levels of AI Autonomy</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {evolutionLevels?.map((level, index) => {
            const metrics = evolutionMetrics?.[level?.id] || { active: 0, performance: 0, progress: 0 };
            const isActive = metrics?.active > 0;
            const IconComponent = level?.icon;

            return (
              <div key={level?.id} className="relative">
                {/* Connection Line */}
                {index < evolutionLevels?.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-600"></div>
                )}
                {/* Level Card */}
                <div
                  className={`rounded-lg border p-4 cursor-pointer transition-all duration-300 ${
                    getColorClasses(level?.color, selectedLevel === level?.id)
                  } ${selectedLevel === level?.id ? 'transform scale-[1.02]' : ''}`}
                  onClick={() => setSelectedLevel(selectedLevel === level?.id ? null : level?.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      {isActive ? (
                        <CheckCircle className={`w-6 h-6 ${getIconColor(level?.color)}`} />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-500" />
                      )}
                    </div>

                    {/* Level Icon */}
                    <div className="flex-shrink-0 p-2 bg-gray-700 rounded-lg">
                      <IconComponent className={`w-6 h-6 ${getIconColor(level?.color)}`} />
                    </div>

                    {/* Level Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{level?.name}</h3>
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            onActivateLevel(level?.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isActive 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{level?.description}</p>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Actifs:</span>
                          <span className="text-white ml-1">{metrics?.active}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Performance:</span>
                          <span className="text-white ml-1">{metrics?.performance}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Progrès:</span>
                          <span className="text-white ml-1">{metrics?.progress}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${
                            level?.color === 'blue' ? 'from-blue-500 to-blue-400' :
                            level?.color === 'green' ? 'from-green-500 to-green-400' :
                            level?.color === 'yellow' ? 'from-yellow-500 to-yellow-400' :
                            level?.color === 'purple'? 'from-purple-500 to-purple-400' : 'from-red-500 to-red-400'
                          }`}
                          style={{ width: `${Math.max(metrics?.progress, 5)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Capabilities */}
                  {selectedLevel === level?.id && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="grid grid-cols-1 gap-2">
                        <h4 className="text-sm font-semibold text-white mb-2">Fonctions Clés:</h4>
                        {level?.capabilities?.map((capability, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              level?.color === 'blue' ? 'bg-blue-400' :
                              level?.color === 'green' ? 'bg-green-400' :
                              level?.color === 'yellow' ? 'bg-yellow-400' :
                              level?.color === 'purple'? 'bg-purple-400' : 'bg-red-400'
                            }`} />
                            <span className="text-gray-300">{capability}</span>
                          </div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <span className="text-xs text-gray-500">Performance: </span>
                          <span className="text-xs text-white">{level?.performance}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}