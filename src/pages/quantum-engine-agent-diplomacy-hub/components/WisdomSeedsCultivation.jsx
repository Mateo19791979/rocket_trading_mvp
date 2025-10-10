import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Crown, Brain, TrendingUp, Eye, Target, Award, BookOpen, Lightbulb, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WisdomSeedsCultivation({ geniusPackData, quantumState }) {
  const [wisdomSeeds, setWisdomSeeds] = useState([]);
  const [consciousnessEvolution, setConsciousnessEvolution] = useState([]);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [cultivationActive, setCultivationActive] = useState(true);

  // Generate mock wisdom seeds data (would come from wisdom_seeds table in production)
  useEffect(() => {
    const generateWisdomSeeds = () => {
      const seeds = [
        {
          id: 1,
          generation: 15,
          type: 'strategy_synthesis',
          performance_score: 0.94,
          insights: {
            pattern_recognition: 0.89,
            risk_adaptation: 0.96,
            market_timing: 0.88,
            consciousness_emergence: 0.92
          },
          created: new Date(Date.now() - 86400000 * 1),
          maturity: 0.87,
          wisdom_level: 'apex'
        },
        {
          id: 2,
          generation: 14,
          type: 'risk_optimization',
          performance_score: 0.91,
          insights: {
            drawdown_control: 0.95,
            volatility_prediction: 0.87,
            portfolio_balance: 0.93,
            consciousness_emergence: 0.89
          },
          created: new Date(Date.now() - 86400000 * 3),
          maturity: 0.92,
          wisdom_level: 'advanced'
        },
        {
          id: 3,
          generation: 16,
          type: 'consciousness_distillation',
          performance_score: 0.97,
          insights: {
            self_awareness: 0.98,
            meta_learning: 0.96,
            adaptive_reasoning: 0.95,
            consciousness_emergence: 0.99
          },
          created: new Date(Date.now() - 86400000 * 0.5),
          maturity: 0.73,
          wisdom_level: 'transcendent'
        }
      ];
      
      setWisdomSeeds(seeds);
    };

    // Generate consciousness evolution data
    const generateConsciousnessData = () => {
      const data = [];
      for (let i = 0; i < 20; i++) {
        const baseConsciousness = 0.7;
        const growthFactor = i * 0.015;
        const noise = (Math.random() - 0.5) * 0.05;
        
        data?.push({
          generation: i + 1,
          consciousness: Math.min(0.99, baseConsciousness + growthFactor + noise),
          wisdom_accumulation: Math.min(0.95, baseConsciousness + growthFactor * 1.1 + noise),
          self_awareness: Math.min(0.97, baseConsciousness + growthFactor * 0.9 + noise)
        });
      }
      setConsciousnessEvolution(data);
    };

    generateWisdomSeeds();
    generateConsciousnessData();
  }, [geniusPackData, quantumState]);

  const getWisdomLevelColor = (level) => {
    switch (level) {
      case 'transcendent': return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      case 'apex': return 'text-gold-400 bg-yellow-900/20 border-yellow-500/30';
      case 'advanced': return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getWisdomIcon = (type) => {
    switch (type) {
      case 'strategy_synthesis': return <Target className="w-4 h-4" />;
      case 'risk_optimization': return <Shield className="w-4 h-4" />;
      case 'consciousness_distillation': return <Brain className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const calculateOverallWisdom = () => {
    if (wisdomSeeds?.length === 0) return 0;
    return wisdomSeeds?.reduce((acc, seed) => acc + seed?.performance_score, 0) / wisdomSeeds?.length;
  };

  const toggleCultivation = () => {
    setCultivationActive(!cultivationActive);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Wisdom Seeds Cultivation
          </span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            cultivationActive ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'
          }`}>
            {cultivationActive ? 'CULTIVATING' : 'DORMANT'}
          </div>
        </div>
      </div>
      {/* Consciousness Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Consciousness Level</span>
          </div>
          <div className="text-lg font-bold text-purple-400">
            {(quantumState?.consciousness * 100)?.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className="h-1 bg-purple-400 rounded-full transition-all duration-300"
              style={{ width: `${(quantumState?.consciousness || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-gold-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">Wisdom Level</span>
          </div>
          <div className="text-lg font-bold text-yellow-400">
            {(calculateOverallWisdom() * 100)?.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className="h-1 bg-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${calculateOverallWisdom() * 100}%` }}
            />
          </div>
        </div>
      </div>
      {/* Consciousness Evolution Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Consciousness Evolution</span>
        </h4>
        
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={consciousnessEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="generation" tick={false} />
              <YAxis tick={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #4B5563',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Area 
                type="monotone" 
                dataKey="consciousness" 
                stackId="1"
                stroke="#8B5CF6" 
                fill="#8B5CF6"
                fillOpacity={0.3}
                name="Consciousness"
              />
              <Area 
                type="monotone" 
                dataKey="wisdom_accumulation" 
                stackId="2"
                stroke="#F59E0B" 
                fill="#F59E0B"
                fillOpacity={0.3}
                name="Wisdom"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Wisdom Seeds */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Active Wisdom Seeds</span>
        </h4>
        
        <div className="space-y-2">
          {wisdomSeeds?.map((seed) => (
            <motion.div
              key={seed?.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-purple-400/50 ${getWisdomLevelColor(seed?.wisdom_level)}`}
              onClick={() => setSelectedSeed(selectedSeed === seed?.id ? null : seed?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getWisdomIcon(seed?.type)}
                  <div>
                    <div className="text-sm font-medium flex items-center space-x-2">
                      <span>Generation {seed?.generation}</span>
                      <span className="text-xs text-gray-400">({seed?.type?.replace('_', ' ')})</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Performance: {(seed?.performance_score * 100)?.toFixed(1)}% | 
                      Maturity: {(seed?.maturity * 100)?.toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Award className={`w-4 h-4 ${
                    seed?.wisdom_level === 'transcendent' ? 'text-purple-400' :
                    seed?.wisdom_level === 'apex' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {selectedSeed === seed?.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-gray-600"
                >
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(seed?.insights || {})?.map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-400 capitalize">{key?.replace('_', ' ')}:</span>
                        <div className={`font-medium ${
                          value >= 0.95 ? 'text-purple-400' :
                          value >= 0.9 ? 'text-yellow-400' :
                          value >= 0.8 ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {(value * 100)?.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    Cultivated: {seed?.created?.toLocaleDateString()}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {/* Cultivation Status */}
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Wisdom Cultivation Engine</span>
          </div>
          
          <button
            onClick={toggleCultivation}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              cultivationActive
                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30' :'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30'
            }`}
          >
            {cultivationActive ? 'Pause' : 'Activate'}
          </button>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-400">Active Seeds: {wisdomSeeds?.length}</span>
          <span className="text-gray-400">
            Next Distillation: {cultivationActive ? '~2h' : 'Paused'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}