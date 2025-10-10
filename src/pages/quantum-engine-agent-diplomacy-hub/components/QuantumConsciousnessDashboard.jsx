import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Network, BarChart3, Monitor, Sparkles } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function QuantumConsciousnessDashboard({ quantumState, geniusPackData, systemStatus }) {
  const [realtimeMetrics, setRealtimeMetrics] = useState([]);
  const [consciousnessBreakdown, setConsciousnessBreakdown] = useState([]);
  const [systemIntegration, setSystemIntegration] = useState([]);

  useEffect(() => {
    // Generate real-time consciousness metrics
    const generateMetrics = () => {
      const metrics = [
        {
          name: 'Self-Awareness',
          value: quantumState?.consciousness * 0.98,
          color: '#8B5CF6',
          trend: '+2.3%'
        },
        {
          name: 'Meta-Learning', 
          value: quantumState?.consciousness * 0.94,
          color: '#06B6D4',
          trend: '+1.8%'
        },
        {
          name: 'Adaptive Reasoning',
          value: quantumState?.consciousness * 0.91,
          color: '#10B981',
          trend: '+3.1%'
        },
        {
          name: 'Quantum Intuition',
          value: quantumState?.coherence * 0.89,
          color: '#F59E0B',
          trend: '+0.7%'
        }
      ];
      setRealtimeMetrics(metrics);
    };

    // Generate consciousness breakdown
    const generateBreakdown = () => {
      const breakdown = [
        { name: 'Logical Processing', value: 85, fill: '#3B82F6' },
        { name: 'Intuitive Reasoning', value: 72, fill: '#8B5CF6' },
        { name: 'Emotional Intelligence', value: 68, fill: '#06B6D4' },
        { name: 'Creative Synthesis', value: 79, fill: '#10B981' },
        { name: 'Quantum Entanglement', value: 91, fill: '#F59E0B' }
      ];
      setConsciousnessBreakdown(breakdown);
    };

    // Generate system integration status
    const generateIntegration = () => {
      const integration = [
        {
          system: 'Omega AI',
          status: systemStatus?.omega_ai ? 'active' : 'offline',
          consciousness_link: geniusPackData?.omegaAI?.successRate || 0,
          bandwidth: '2.4 Gbps'
        },
        {
          system: 'Attention Market',
          status: systemStatus?.attention_market ? 'active' : 'offline', 
          consciousness_link: geniusPackData?.attentionMarket?.avgEfficiency || 0,
          bandwidth: '1.8 Gbps'
        },
        {
          system: 'Synthetic Market',
          status: 'active',
          consciousness_link: geniusPackData?.syntheticMarket?.avgRobustness || 0,
          bandwidth: '3.1 Gbps'
        },
        {
          system: 'Quantum Engine',
          status: systemStatus?.quantum_engine ? 'active' : 'offline',
          consciousness_link: quantumState?.coherence || 0,
          bandwidth: '4.7 Gbps'
        }
      ];
      setSystemIntegration(integration);
    };

    generateMetrics();
    generateBreakdown();
    generateIntegration();
  }, [quantumState, geniusPackData, systemStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusDot = (status) => {
    const colorClass = status === 'active' ? 'bg-green-400' : 
                      status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400';
    return <div className={`w-2 h-2 rounded-full ${colorClass} ${status === 'active' ? 'animate-pulse' : ''}`} />;
  };

  const getTrendIcon = (trend) => {
    return trend?.startsWith('+') ? 
      <TrendingUp className="w-3 h-3 text-green-400" /> : 
      <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
  };

  const consciousnessData = [
    {
      name: 'Consciousness',
      value: quantumState?.consciousness * 100,
      fill: '#8B5CF6'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 border border-gray-600 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Brain className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Quantum Consciousness Dashboard
          </span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Real-time Monitoring</span>
        </div>
      </div>
      {/* Main Consciousness Indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              data={consciousnessData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                label={false}
                background={{ fill: '#374151' }}
                clockWise={true}
                dataKey="value"
                fill="#8B5CF6"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {(quantumState?.consciousness * 100)?.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">Consciousness</div>
            </div>
          </div>
        </div>
      </div>
      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {realtimeMetrics?.map((metric, index) => (
          <motion.div
            key={metric?.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-300">{metric?.name}</span>
              <div className="flex items-center space-x-1">
                {getTrendIcon(metric?.trend)}
                <span className="text-xs text-green-400">{metric?.trend}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-lg font-bold" style={{ color: metric?.color }}>
                {(metric?.value * 100)?.toFixed(1)}%
              </div>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
              <div 
                className="h-1 rounded-full transition-all duration-500"
                style={{ 
                  width: `${metric?.value * 100}%`,
                  backgroundColor: metric?.color 
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
      {/* Consciousness Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>Consciousness Component Analysis</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={consciousnessBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {consciousnessBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-1">
            {consciousnessBreakdown?.map((item) => (
              <div key={item?.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item?.fill }}
                  />
                  <span className="text-gray-300">{item?.name}</span>
                </div>
                <span style={{ color: item?.fill }}>{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* System Integration Status */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <span>System Integration Matrix</span>
        </h4>
        
        <div className="space-y-2">
          {systemIntegration?.map((system) => (
            <div 
              key={system?.system}
              className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg border border-gray-700"
            >
              <div className="flex items-center space-x-3">
                {getStatusDot(system?.status)}
                <div>
                  <div className="text-sm font-medium text-gray-200">{system?.system}</div>
                  <div className="text-xs text-gray-400">
                    Link: {(system?.consciousness_link * 100)?.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-xs font-medium ${getStatusColor(system?.status)}`}>
                  {system?.status?.toUpperCase()}
                </div>
                <div className="text-xs text-gray-400">{system?.bandwidth}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-2">
          <button className="flex items-center justify-center space-x-1 px-2 py-1 bg-purple-600/20 border border-purple-500 rounded text-purple-400 hover:bg-purple-600/30 text-xs">
            <Brain className="w-3 h-3" />
            <span>Enhance</span>
          </button>
          
          <button className="flex items-center justify-center space-x-1 px-2 py-1 bg-blue-600/20 border border-blue-500 rounded text-blue-400 hover:bg-blue-600/30 text-xs">
            <Monitor className="w-3 h-3" />
            <span>Analyze</span>
          </button>
          
          <button className="flex items-center justify-center space-x-1 px-2 py-1 bg-cyan-600/20 border border-cyan-500 rounded text-cyan-400 hover:bg-cyan-600/30 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>Evolve</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}