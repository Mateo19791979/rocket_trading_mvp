import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Brain, 
  Library, 
  Award, 
  TrendingUp, 
  Zap,
  Target,
  Globe,
  Cpu,
  Activity,
  Database,
  Star
} from 'lucide-react';

const BeneficesPanel = ({ benefits, immuneSystem, metaLearning }) => {
  
  const benefitsList = [
    {
      title: "Survit à toutes les conditions de marché",
      icon: Shield,
      description: "Adaptabilité crisis-proof dans tous les cycles",
      metrics: {
        survival: benefits?.marketSurvival?.survivalRate || 0,
        resilience: benefits?.marketSurvival?.crisisResilience || 94,
        adaptability: benefits?.marketSurvival?.adaptabilityScore || 96
      },
      subfeatures: [
        "Bull markets → Expansion optimisée",
        "Bear markets → Défense adaptative", 
        "Sideways → Opportunités cachées",
        "Crises → Auto-préservation"
      ],
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Apprend et innove seul",
      icon: Brain,
      description: "Découverte autonome et reconnaissance de patterns",
      metrics: {
        learning: benefits?.autonomousLearning?.learningVelocity || 87,
        discovery: benefits?.autonomousLearning?.discoveryRate || 0,
        innovation: benefits?.autonomousLearning?.innovationScore || 91
      },
      subfeatures: [
        "Pattern mining → Nouveaux signaux",
        "Strategy evolution → Auto-amélioration",
        "Market adaptation → Réactivité temps réel",
        "Knowledge synthesis → Intelligence collective"
      ],
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Construit sa propre bibliothèque de stratégies",
      icon: Library,
      description: "Base de connaissances auto-expansive et taxonomie",
      metrics: {
        library: benefits?.strategyLibrary?.librarySize || 0,
        diversity: benefits?.strategyLibrary?.diversityIndex || 0,
        quality: benefits?.strategyLibrary?.qualityScore || 93
      },
      subfeatures: [
        "Auto-cataloguing → Classification intelligente",
        "Strategy breeding → Hybridation génétique",
        "Performance indexing → Optimisation continue",
        "Knowledge graphs → Relations complexes"
      ],
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Niveau ultime d\'autonomie et de résilience",
      icon: Award,
      description: "Indépendance complète avec capacités d\'auto-guérison",
      metrics: {
        autonomy: benefits?.resilienceLevel?.autonomyLevel || 98,
        resilience: benefits?.resilienceLevel?.resilienceScore || 0,
        healing: benefits?.resilienceLevel?.selfHealingCapacity || 95
      },
      subfeatures: [
        "Zero-intervention → Fonctionnement autonome",
        "Self-diagnosis → Détection précoce",
        "Auto-recovery → Guérison automatique",
        "Evolutionary immunity → Résistance adaptative"
      ],
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {benefitsList?.map((benefit, index) => {
        const IconComponent = benefit?.icon;
        
        return (
          <motion.div
            key={benefit?.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`p-6 rounded-lg ${benefit?.bgColor} border ${benefit?.borderColor} hover:border-opacity-50 transition-all duration-300`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${benefit?.bgColor} border ${benefit?.borderColor}`}>
                <IconComponent className={`w-6 h-6 ${benefit?.color}`} />
              </div>
              
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${benefit?.color} mb-2`}>
                  {benefit?.title}
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  {benefit?.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {benefit?.title === "Survit à toutes les conditions de marché" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Globe className="w-4 h-4 text-green-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.survival}%</p>
                        <p className="text-xs text-slate-400">Survie</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Shield className="w-4 h-4 text-green-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.resilience}%</p>
                        <p className="text-xs text-slate-400">Résilience</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Activity className="w-4 h-4 text-green-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.adaptability}%</p>
                        <p className="text-xs text-slate-400">Adaptabilité</p>
                      </div>
                    </>
                  )}

                  {benefit?.title === "Apprend et innove seul" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.learning}%</p>
                        <p className="text-xs text-slate-400">Vitesse</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="w-4 h-4 text-blue-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.discovery}</p>
                        <p className="text-xs text-slate-400">Découvertes</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="w-4 h-4 text-blue-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.innovation}</p>
                        <p className="text-xs text-slate-400">Innovation</p>
                      </div>
                    </>
                  )}

                  {benefit?.title === "Construit sa propre bibliothèque de stratégies" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Database className="w-4 h-4 text-purple-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.library}</p>
                        <p className="text-xs text-slate-400">Stratégies</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Brain className="w-4 h-4 text-purple-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.diversity}</p>
                        <p className="text-xs text-slate-400">Diversité</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Award className="w-4 h-4 text-purple-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.quality}%</p>
                        <p className="text-xs text-slate-400">Qualité</p>
                      </div>
                    </>
                  )}

                  {benefit?.title === "Niveau ultime d'autonomie et de résilience" && (
                    <>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Cpu className="w-4 h-4 text-orange-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.autonomy}%</p>
                        <p className="text-xs text-slate-400">Autonomie</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Shield className="w-4 h-4 text-orange-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.resilience}%</p>
                        <p className="text-xs text-slate-400">Résilience</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Zap className="w-4 h-4 text-orange-500 mr-1" />
                        </div>
                        <p className="text-xl font-bold text-white">{benefit?.metrics?.healing}%</p>
                        <p className="text-xs text-slate-400">Auto-guérison</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Sub-features List */}
                <div className="space-y-2">
                  {benefit?.subfeatures?.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-center text-sm text-slate-400"
                    >
                      <div className={`w-2 h-2 rounded-full ${benefit?.bgColor?.replace('/10', '')} mr-3 flex-shrink-0`} />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Performance Indicator */}
                <div className="mt-4 flex items-center">
                  <div className="flex-1 bg-slate-700 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0,
                        benefit?.title === "Survit à toutes les conditions de marché" ? benefit?.metrics?.adaptability :
                        benefit?.title === "Apprend et innove seul" ? benefit?.metrics?.innovation :
                        benefit?.title === "Construit sa propre bibliothèque de stratégies" ? benefit?.metrics?.quality :
                        benefit?.metrics?.autonomy
                      ))}%` }}
                      transition={{ duration: 2, delay: index * 0.3 }}
                      className="h-full"
                      style={{
                        background: benefit?.title === "Survit à toutes les conditions de marché" ? 'linear-gradient(to right, #10b981, #6ee7b7)' :
                                   benefit?.title === "Apprend et innove seul" ? 'linear-gradient(to right, #3b82f6, #93c5fd)' :
                                   benefit?.title === "Construit sa propre bibliothèque de stratégies" ? 'linear-gradient(to right, #a855f7, #c084fc)' :
                                   'linear-gradient(to right, #f97316, #fb923c)'
                      }}
                    />
                  </div>
                  <div className="ml-3 flex items-center">
                    <div className={`w-2 h-2 rounded-full animate-pulse mr-2`}
                         style={{
                           background: benefit?.title === "Survit à toutes les conditions de marché" ? '#10b981' :
                                      benefit?.title === "Apprend et innove seul" ? '#3b82f6' :
                                      benefit?.title === "Construit sa propre bibliothèque de stratégies" ? '#a855f7' : '#f97316'
                         }} />
                    <span className="text-sm font-medium text-slate-300">
                      {benefit?.title === "Survit à toutes les conditions de marché" ? `${benefit?.metrics?.adaptability}%` :
                       benefit?.title === "Apprend et innove seul" ? `${benefit?.metrics?.innovation}%` :
                       benefit?.title === "Construit sa propre bibliothèque de stratégies" ? `${benefit?.metrics?.quality}%` :
                       `${benefit?.metrics?.autonomy}%`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BeneficesPanel;