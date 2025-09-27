import React from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart3, CheckCircle, Activity, BookOpen, Target } from 'lucide-react';

const DataminingFoundationPanel = () => {
  const foundationItems = [
    {
      icon: BookOpen,
      title: 'Registry (livres + open access)',
      description: 'extraction',
      status: 'active',
      metrics: { processed: 1247, accuracy: 94.2 }
    },
    {
      icon: BarChart3,
      title: 'Scoring Engine',
      description: 'Sharpe, MDD, régimes',
      status: 'active',
      metrics: { sharpe: 1.89, mdd: -4.2 }
    },
    {
      icon: Target,
      title: 'Orchestrateur',
      description: 'sélection de stratégie',
      status: 'active',
      metrics: { strategies: 23, selected: 7 }
    }
  ];

  return (
    <motion.div 
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg">
          <Database className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            Datamining & IA déjà en place
          </h3>
          <p className="text-sm text-gray-400">Infrastructure de base opérationnelle</p>
        </div>
      </div>
      <div className="space-y-4">
        {foundationItems?.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-4 p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 hover:border-blue-500/30 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-lg">
              <item.icon className="h-5 w-5 text-blue-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white">• {item?.title}</span>
                <ArrowRight className="h-3 w-3 text-blue-400" />
                <span className="text-sm text-blue-400">{item?.description}</span>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                {Object.entries(item?.metrics)?.map(([key, value], idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span className="text-gray-400 capitalize">{key}:</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center w-6 h-6">
              {item?.status === 'active' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <Activity className="h-5 w-5 text-yellow-400" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Infrastructure Stable</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Uptime:</span>
            <span className="text-green-400 font-medium">99.7%</span>
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

export default DataminingFoundationPanel;