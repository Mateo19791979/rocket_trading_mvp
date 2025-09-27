import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Zap, Target } from 'lucide-react';

const EvolutionVisualization = ({ data }) => {
  const [animationData, setAnimationData] = useState([]);
  const [currentGeneration, setCurrentGeneration] = useState(0);

  useEffect(() => {
    // Generate evolution animation data
    const generateEvolutionData = () => {
      const generations = [];
      for (let i = 0; i < 20; i++) {
        const generation = {
          id: i,
          strategies: Math.floor(Math.random() * 50) + 20,
          fitness: Math.random() * 100,
          diversity: Math.random() * 80 + 20,
          innovation: Math.random() * 60 + 40
        };
        generations?.push(generation);
      }
      return generations;
    };

    setAnimationData(generateEvolutionData());

    // Animation cycle
    const interval = setInterval(() => {
      setCurrentGeneration(prev => (prev + 1) % 20);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentData = animationData?.[currentGeneration] || {
    strategies: 0,
    fitness: 0,
    diversity: 0,
    innovation: 0
  };

  return (
    <div className="space-y-6">
      {/* Evolution Progress Display */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-teal-400">Génération #{currentGeneration + 1}</h4>
          <div className="flex items-center text-sm text-slate-400">
            <Activity className="w-4 h-4 mr-1" />
            <span>Évolution en cours</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/20">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 font-semibold">Stratégies</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentData?.strategies}</p>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
              <motion.div
                className="h-1 bg-green-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentData?.strategies / 70) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/20">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-400 font-semibold">Fitness</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(currentData?.fitness)}%</p>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
              <motion.div
                className="h-1 bg-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${currentData?.fitness}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/20">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-400 font-semibold">Diversité</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(currentData?.diversity)}%</p>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
              <motion.div
                className="h-1 bg-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${currentData?.diversity}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600/20">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-orange-400 mr-2" />
              <span className="text-orange-400 font-semibold">Innovation</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(currentData?.innovation)}%</p>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2">
              <motion.div
                className="h-1 bg-orange-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${currentData?.innovation}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Evolution Timeline */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
        <h4 className="text-lg font-semibold text-teal-400 mb-4">Évolution Temporelle</h4>
        
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0">
            {/* Background grid */}
            <div className="absolute inset-0 grid grid-cols-20 opacity-20">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="border-r border-slate-600" />
              ))}
            </div>
            
            {/* Evolution curve */}
            <svg className="w-full h-full" viewBox="0 0 400 120">
              <motion.path
                d={`M 0 ${120 - (animationData?.[0]?.fitness || 0) * 1.2} ${animationData?.map((point, index) => 
                  `L ${index * 20} ${120 - point?.fitness * 1.2}`
                )?.join(' ')}`}
                stroke="#14b8a6"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              
              {/* Current position indicator */}
              <motion.circle
                cx={currentGeneration * 20}
                cy={120 - currentData?.fitness * 1.2}
                r="4"
                fill="#f97316"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          </div>
        </div>

        {/* Timeline labels */}
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>T-19</span>
          <span>T-10</span>
          <span className="text-orange-400 font-semibold">Maintenant</span>
        </div>
      </div>
      {/* Live Evolution Stats */}
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
        <h4 className="text-lg font-semibold text-teal-400 mb-4">Statistiques Évolutives</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Taux de mutation</span>
            <div className="flex items-center">
              <div className="w-20 bg-slate-700 h-2 rounded-full mr-2">
                <div className="w-3/4 bg-green-400 h-2 rounded-full" />
              </div>
              <span className="text-green-400 font-semibold">7.2%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Pression sélective</span>
            <div className="flex items-center">
              <div className="w-20 bg-slate-700 h-2 rounded-full mr-2">
                <div className="w-4/5 bg-blue-400 h-2 rounded-full" />
              </div>
              <span className="text-blue-400 font-semibold">85%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Vitesse d'adaptation</span>
            <div className="flex items-center">
              <div className="w-20 bg-slate-700 h-2 rounded-full mr-2">
                <div className="w-full bg-orange-400 h-2 rounded-full" />
              </div>
              <span className="text-orange-400 font-semibold">98%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Robustesse génétique</span>
            <div className="flex items-center">
              <div className="w-20 bg-slate-700 h-2 rounded-full mr-2">
                <div className="w-5/6 bg-purple-400 h-2 rounded-full" />
              </div>
              <span className="text-purple-400 font-semibold">91%</span>
            </div>
          </div>
        </div>
      </div>
      {/* Evolution Status */}
      <div className="text-center p-4 bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-lg border border-teal-500/20">
        <div className="flex items-center justify-center mb-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full mr-3"
          />
          <span className="text-teal-400 font-semibold">Évolution Active</span>
        </div>
        <p className="text-slate-300 text-sm">
          L'organisme s'adapte en temps réel aux conditions de marché
        </p>
      </div>
    </div>
  );
};

export default EvolutionVisualization;