import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, TrendingUp, Shield, Bot, Cpu, Activity } from 'lucide-react';

const AutonomousAIPanel = () => {
  const aiComponents = [
    {
      icon: Brain,
      title: 'IA Génératrice',
      description: 'crée de nouvelles règles (LLMs + Genetic Prog.)',
      status: 'generating',
      color: 'cyan',
      metrics: { generated: 47, tested: 32, deployed: 8 }
    },
    {
      icon: Activity,
      title: 'IA Backtester',
      description: 'walk-forward, Monte Carlo, stress test',
      status: 'testing',
      color: 'teal',
      metrics: { tests: 1247, passed: 892, confidence: 94.2 }
    },
    {
      icon: Target,
      title: 'IA Optimiseur',
      description: 'combine stratégies, Risk Parity++ dynamique',
      status: 'optimizing',
      color: 'blue',
      metrics: { combinations: 156, optimal: 12, sharpe: 2.34 }
    },
    {
      icon: TrendingUp,
      title: 'IA Sentiment & Macro',
      description: 'ajuste exposition selon news',
      status: 'monitoring',
      color: 'orange',
      metrics: { signals: 89, adjustments: 23, accuracy: 87.5 }
    },
    {
      icon: Shield,
      title: 'IA Risk Controller',
      description: 'coupe en cas de drawdown excessif',
      status: 'protecting',
      color: 'green',
      metrics: { alerts: 3, cuts: 1, saved: '2.4M' }
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
      teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500/30' },
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
    };
    return colorMap?.[color] || colorMap?.blue;
  };

  return (
    <motion.div 
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-lg">
          <Bot className="h-5 w-5 text-cyan-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
            <Zap className="h-2 w-2 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            Niveau supérieur : IA autonomes
          </h3>
          <p className="text-sm text-gray-400">Systèmes auto-apprenants avancés</p>
        </div>
      </div>
      <div className="space-y-4">
        {aiComponents?.map((component, index) => {
          const colors = getColorClasses(component?.color);
          
          return (
            <motion.div
              key={index}
              className={`p-4 bg-gray-900/40 rounded-lg border ${colors?.border} hover:border-opacity-60 transition-all duration-300`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-10 h-10 ${colors?.bg} rounded-lg`}>
                  <component.icon className={`h-5 w-5 ${colors?.text}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white">• {component?.title}</span>
                    <ArrowRight className={`h-3 w-3 ${colors?.text}`} />
                  </div>
                  
                  <p className={`text-sm ${colors?.text} mb-3`}>
                    {component?.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {Object.entries(component?.metrics)?.map(([key, value], idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-gray-400 uppercase tracking-wide mb-1">{key}</span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className={`w-3 h-3 ${colors?.bg} rounded-full animate-pulse`}></div>
                  <span className={`text-xs ${colors?.text} font-medium capitalize`}>
                    {component?.status}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-gray-400">Niveau d'autonomie</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="w-4/5 h-full bg-gradient-to-r from-cyan-400 to-orange-400 rounded-full"></div>
            </div>
            <span className="text-sm text-white font-medium">89%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default AutonomousAIPanel;