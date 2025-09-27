import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Brain, 
  Shield, 
  Settings, 
  TrendingUp, 
  Activity,
  Zap,
  Database,
  Eye,
  Cpu
} from 'lucide-react';

const CaracteristiquesPanel = ({ 
  livingStrategies, 
  collectiveMemory, 
  immuneSystem, 
  governance, 
  metaLearning 
}) => {

  const characteristics = [
    {
      title: "Population de stratégies vivantes",
      icon: Users,
      description: "Milliers de stratégies en compétition constante",
      metrics: {
        active: livingStrategies?.activeAgents?.length || 0,
        total: livingStrategies?.totalStrategies || 0,
        evolution: livingStrategies?.evolutionIndicators?.adaptabilityScore || 0
      },
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Mémoire collective (ADN stratégique)",
      icon: Brain,
      description: "Préservation génétique des patterns gagnants",
      metrics: {
        patterns: collectiveMemory?.geneticPatterns?.length || 0,
        depth: collectiveMemory?.historicalPerformance?.memoryDepth || 0,
        retention: collectiveMemory?.adaptiveCapabilities?.knowledgeRetention || 92
      },
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Immune System financier",
      icon: Shield,
      description: "Détection autonome et défense adaptative",
      metrics: {
        threats: immuneSystem?.threats?.length || 0,
        response: immuneSystem?.defenseMetrics?.responseTime || 150,
        strength: immuneSystem?.defenseMetrics?.defenseStrength || 94
      },
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
    {
      title: "Auto-gouvernance (allocation & risk rules)",
      icon: Settings,
      description: "Paramètres auto-modifiants et sizing algorithmes",
      metrics: {
        rules: governance?.allocationRules?.rulesCount || 0,
        efficiency: governance?.allocationRules?.efficiency || 0,
        autonomy: governance?.autonomyLevel || 96
      },
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Meta-apprentissage (orchestrateur évolutif)",
      icon: TrendingUp,
      description: "Apprentissage continu et orchestration des stratégies",
      metrics: {
        progress: metaLearning?.learningProgress?.progressRate || 0,
        innovation: metaLearning?.learningProgress?.innovationIndex || 89,
        coordination: metaLearning?.orchestrationMetrics?.coordination || 0
      },
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {characteristics?.map((characteristic, index) => {
        const IconComponent = characteristic?.icon;
        
        return (
          <motion.div
            key={characteristic?.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`p-6 rounded-lg ${characteristic?.bgColor} border ${characteristic?.borderColor} hover:border-opacity-50 transition-all duration-300`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${characteristic?.bgColor} border ${characteristic?.borderColor}`}>
                <IconComponent className={`w-6 h-6 ${characteristic?.color}`} />
              </div>
              
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${characteristic?.color} mb-2`}>
                  {characteristic?.title}
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  {characteristic?.description}
                </p>
                
                {/* Metrics Display */}
                <div className="grid grid-cols-3 gap-4">
                  {characteristic?.title === "Population de stratégies vivantes" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Activity className="w-4 h-4 text-green-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.active}</p>
                        <p className="text-xs text-slate-400">Actives</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Database className="w-4 h-4 text-green-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.total}</p>
                        <p className="text-xs text-slate-400">Total</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.evolution}%</p>
                        <p className="text-xs text-slate-400">Adaptabilité</p>
                      </div>
                    </>
                  )}

                  {characteristic?.title === "Mémoire collective (ADN stratégique)" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Brain className="w-4 h-4 text-blue-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.patterns}</p>
                        <p className="text-xs text-slate-400">Patterns</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Eye className="w-4 h-4 text-blue-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.depth}</p>
                        <p className="text-xs text-slate-400">Profondeur</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Database className="w-4 h-4 text-blue-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.retention}%</p>
                        <p className="text-xs text-slate-400">Rétention</p>
                      </div>
                    </>
                  )}

                  {characteristic?.title === "Immune System financier" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Shield className="w-4 h-4 text-red-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.threats}</p>
                        <p className="text-xs text-slate-400">Menaces</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Zap className="w-4 h-4 text-red-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.response}ms</p>
                        <p className="text-xs text-slate-400">Réponse</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Activity className="w-4 h-4 text-red-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.strength}%</p>
                        <p className="text-xs text-slate-400">Force</p>
                      </div>
                    </>
                  )}

                  {characteristic?.title === "Auto-gouvernance (allocation & risk rules)" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Settings className="w-4 h-4 text-purple-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.rules}</p>
                        <p className="text-xs text-slate-400">Règles</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.efficiency}%</p>
                        <p className="text-xs text-slate-400">Efficacité</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Cpu className="w-4 h-4 text-purple-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.autonomy}%</p>
                        <p className="text-xs text-slate-400">Autonomie</p>
                      </div>
                    </>
                  )}

                  {characteristic?.title === "Meta-apprentissage (orchestrateur évolutif)" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-teal-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.progress}%</p>
                        <p className="text-xs text-slate-400">Progrès</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Brain className="w-4 h-4 text-teal-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.innovation}</p>
                        <p className="text-xs text-slate-400">Innovation</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="w-4 h-4 text-teal-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{characteristic?.metrics?.coordination}%</p>
                        <p className="text-xs text-slate-400">Coordination</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Evolution Indicator */}
                <div className="mt-4 flex items-center">
                  <div className="flex-1 bg-slate-700 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, 
                        characteristic?.title === "Population de stratégies vivantes" ? characteristic?.metrics?.evolution :
                        characteristic?.title === "Mémoire collective (ADN stratégique)" ? characteristic?.metrics?.retention :
                        characteristic?.title === "Immune System financier" ? characteristic?.metrics?.strength :
                        characteristic?.title === "Auto-gouvernance (allocation & risk rules)" ? characteristic?.metrics?.autonomy :
                        characteristic?.metrics?.innovation
                      ))}%` }}
                      transition={{ duration: 2, delay: index * 0.2 }}
                      className={`h-full bg-gradient-to-r from-${characteristic?.color?.split('-')?.[1]}-500 to-${characteristic?.color?.split('-')?.[1]}-300`}
                      style={{
                        background: characteristic?.title === "Population de stratégies vivantes" ? 'linear-gradient(to right, #10b981, #6ee7b7)' :
                                   characteristic?.title === "Mémoire collective (ADN stratégique)" ? 'linear-gradient(to right, #3b82f6, #93c5fd)' :
                                   characteristic?.title === "Immune System financier" ? 'linear-gradient(to right, #f87171, #fca5a5)' :
                                   characteristic?.title === "Auto-gouvernance (allocation & risk rules)" ? 'linear-gradient(to right, #a855f7, #c084fc)' :
                                   'linear-gradient(to right, #14b8a6, #5eead4)'
                      }}
                    />
                  </div>
                  <span className="ml-3 text-sm font-medium text-slate-300">
                    {characteristic?.title === "Population de stratégies vivantes" ? `${characteristic?.metrics?.evolution}%` :
                     characteristic?.title === "Mémoire collective (ADN stratégique)" ? `${characteristic?.metrics?.retention}%` :
                     characteristic?.title === "Immune System financier" ? `${characteristic?.metrics?.strength}%` :
                     characteristic?.title === "Auto-gouvernance (allocation & risk rules)" ? `${characteristic?.metrics?.autonomy}%` :
                     `${characteristic?.metrics?.innovation}%`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CaracteristiquesPanel;