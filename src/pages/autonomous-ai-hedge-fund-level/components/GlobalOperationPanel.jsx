import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  TestTube, 
  Target, 
  Eye,
  ArrowRight,
  Activity,
  CheckCircle,
  Clock
} from 'lucide-react';

const GlobalOperationPanel = () => {
  const operationStages = [
    {
      id: 1,
      icon: Search,
      title: 'Mining',
      description: 'extraction patterns',
      status: 'completed',
      progress: 100,
      color: 'blue',
      details: { processed: '2.4M docs', patterns: 1247, efficiency: '94%' }
    },
    {
      id: 2,
      icon: Sparkles,
      title: 'Generation',
      description: 'création de nouvelles stratégies',
      status: 'active',
      progress: 78,
      color: 'cyan',
      details: { strategies: 156, validated: 89, novel: 23 }
    },
    {
      id: 3,
      icon: TestTube,
      title: 'Testing',
      description: 'backtests massifs Darwinien',
      status: 'active',
      progress: 65,
      color: 'teal',
      details: { tests: 89432, passed: 34521, survivors: 127 }
    },
    {
      id: 4,
      icon: Target,
      title: 'Allocation',
      description: 'portefeuille multi-stratégies',
      status: 'pending',
      progress: 34,
      color: 'orange',
      details: { strategies: 12, allocation: '2.4M', diversification: 87 }
    },
    {
      id: 5,
      icon: Eye,
      title: 'Surveillance',
      description: 'contrôle risk manager',
      status: 'monitoring',
      progress: 92,
      color: 'green',
      details: { monitoring: '24/7', alerts: 3, interventions: 1 }
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', progress: 'from-blue-500 to-blue-600' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', progress: 'from-cyan-500 to-cyan-600' },
      teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', progress: 'from-teal-500 to-teal-600' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', progress: 'from-orange-500 to-orange-600' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', progress: 'from-green-500 to-green-600' }
    };
    return colorMap?.[color] || colorMap?.blue;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'active':
        return <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />;
      case 'monitoring':
        return <Eye className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <motion.div 
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500/20 to-orange-500/20 rounded-lg">
          <Activity className="h-5 w-5 text-teal-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            Fonctionnement global
          </h3>
          <p className="text-sm text-gray-400">Pipeline de traitement autonome</p>
        </div>
      </div>
      <div className="space-y-6">
        {operationStages?.map((stage, index) => {
          const colors = getColorClasses(stage?.color);
          
          return (
            <motion.div
              key={stage?.id}
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <div className="flex items-center gap-4 p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full font-bold text-white">
                    {stage?.id}
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                </div>

                <div className={`flex items-center justify-center w-10 h-10 ${colors?.bg} rounded-lg`}>
                  <stage.icon className={`h-5 w-5 ${colors?.text}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">{stage?.title}</h4>
                    {getStatusIcon(stage?.status)}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{stage?.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colors?.progress} transition-all duration-1000`}
                        style={{ width: `${stage?.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white font-medium">{stage?.progress}%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {Object.entries(stage?.details)?.map(([key, value], idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-gray-400 capitalize">{key}</span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Connection line to next stage */}
              {index < operationStages?.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="w-px h-4 bg-gradient-to-b from-gray-600 to-gray-700"></div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400">Pipeline Global</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Efficacité:</span>
            <span className="text-cyan-400 font-semibold">91.7%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalOperationPanel;