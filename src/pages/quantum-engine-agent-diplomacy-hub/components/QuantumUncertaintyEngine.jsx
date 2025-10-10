import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Atom, Zap, Target, Play, Pause, Settings, TrendingUp, Activity, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function QuantumUncertaintyEngine({ quantumState, onQuantumOperation, loading }) {
  const [waveData, setWaveData] = useState([]);
  const [engineActive, setEngineActive] = useState(true);
  const [uncertaintyHistory, setUncertaintyHistory] = useState([]);

  // Generate quantum wave function visualization data
  useEffect(() => {
    if (!quantumState) return;

    const generateWaveData = () => {
      const data = [];
      for (let i = 0; i < 50; i++) {
        const x = (i / 50) * 2 * Math.PI;
        const amplitude = quantumState?.coherence || 0.8;
        const phase = quantumState?.uncertainty * Math.PI;
        const frequency = quantumState?.entanglement || 1;
        
        const waveValue = amplitude * Math.sin(frequency * x + phase) * 
                         Math.cos(0.5 * x + phase) * 
                         (1 - quantumState?.uncertainty);
        
        data?.push({
          x: i,
          wave: waveValue,
          probability: Math.abs(waveValue) ** 2,
          coherence: quantumState?.coherence * Math.cos(x + phase)
        });
      }
      return data;
    };

    setWaveData(generateWaveData());

    // Update uncertainty history
    setUncertaintyHistory(prev => [
      ...prev?.slice(-19),
      {
        time: new Date()?.toLocaleTimeString(),
        uncertainty: quantumState?.uncertainty,
        coherence: quantumState?.coherence,
        entanglement: quantumState?.entanglement
      }
    ]);
  }, [quantumState]);

  const handleWaveCollapse = () => {
    onQuantumOperation?.('collapse_wave');
  };

  const handleEntanglement = () => {
    onQuantumOperation?.('entangle_systems');
  };

  const handleConsciousnessBoost = () => {
    onQuantumOperation?.('consciousness_boost');
  };

  const toggleEngine = () => {
    setEngineActive(!engineActive);
    onQuantumOperation?.(engineActive ? 'pause_engine' : 'activate_engine');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Atom className="w-5 h-5" />
          </div>
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Quantum Uncertainty Engine
          </span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleEngine}
            className={`p-2 rounded-lg transition-colors ${
              engineActive 
                ? 'bg-green-600 text-white hover:bg-green-700' :'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {engineActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            engineActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {engineActive ? 'ACTIVE' : 'PAUSED'}
          </div>
        </div>
      </div>
      {/* Quantum State Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-gray-300">Coherence</span>
          </div>
          <div className="text-lg font-bold text-purple-400">
            {(quantumState?.coherence * 100)?.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className="h-1 bg-purple-400 rounded-full transition-all duration-300"
              style={{ width: `${(quantumState?.coherence || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Entanglement</span>
          </div>
          <div className="text-lg font-bold text-blue-400">
            {(quantumState?.entanglement * 100)?.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className="h-1 bg-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${(quantumState?.entanglement || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-yellow-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-gray-300">Uncertainty</span>
          </div>
          <div className="text-lg font-bold text-yellow-400">
            {(quantumState?.uncertainty * 100)?.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className="h-1 bg-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${(quantumState?.uncertainty || 0) * 100}%` }}
            />
          </div>
        </div>
      </div>
      {/* Wave Function Visualization */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Quantum Wave Function</span>
        </h4>
        
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={waveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="x" tick={false} />
              <YAxis tick={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: '1px solid #4B5563',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Line 
                type="monotone" 
                dataKey="wave" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={false}
                name="Wave Amplitude"
              />
              <Line 
                type="monotone" 
                dataKey="probability" 
                stroke="#60A5FA" 
                strokeWidth={1}
                dot={false}
                name="Probability Density"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Quantum Operation Controls */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Quantum Operations</span>
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleWaveCollapse}
            disabled={loading || !engineActive}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600/20 border border-purple-500 rounded-lg text-purple-400 hover:bg-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <Target className="w-3 h-3" />
            <span>Collapse Wave</span>
          </button>
          
          <button
            onClick={handleEntanglement}
            disabled={loading || !engineActive}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600/20 border border-blue-500 rounded-lg text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <Layers className="w-3 h-3" />
            <span>Entangle Systems</span>
          </button>
        </div>
        
        <button
          onClick={handleConsciousnessBoost}
          disabled={loading || !engineActive}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-lg text-white hover:from-purple-600/30 hover:to-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs"
        >
          <Zap className="w-3 h-3" />
          <span>Consciousness Boost</span>
        </button>
      </div>
      {/* Current Regime Display */}
      <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Current Regime:</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-400 capitalize">
              {quantumState?.regime?.replace('_', ' ') || 'Unknown'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">Wave Function:</span>
          <span className="text-sm text-blue-400">
            {quantumState?.waveFunction?.type} ({quantumState?.waveFunction?.dimensions}D)
          </span>
        </div>
      </div>
    </motion.div>
  );
}