import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, TrendingUp, Zap, Play, Pause, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function EvolutionSimulationDashboard({ population, evolutionMetrics, generation }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [fitnessHistory, setFitnessHistory] = useState([]);
  const [diversityHistory, setDiversityHistory] = useState([]);
  const [fitnessLandscape, setFitnessLandscape] = useState([]);

  useEffect(() => {
    updateHistoryData();
    generateFitnessLandscape();
  }, [population, generation]);

  const updateHistoryData = () => {
    const avgFitness = population?.length > 0 
      ? population?.reduce((sum, p) => sum + p?.fitness, 0) / population?.length 
      : 0;
    
    const maxFitness = population?.length > 0 
      ? Math.max(...population?.map(p => p?.fitness)) 
      : 0;

    const newFitnessData = {
      generation,
      avgFitness,
      maxFitness,
      minFitness: population?.length > 0 ? Math.min(...population?.map(p => p?.fitness)) : 0,
      diversity: evolutionMetrics?.diversityIndex || 0
    };

    setFitnessHistory(prev => [...prev?.slice(-19), newFitnessData]);
    setDiversityHistory(prev => [...prev?.slice(-19), newFitnessData]);
  };

  const generateFitnessLandscape = () => {
    const landscape = [];
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        // Generate a realistic fitness landscape with multiple peaks
        const fitness1 = Math.exp(-((x-5)**2 + (y-5)**2) / 20) * 100;
        const fitness2 = Math.exp(-((x-15)**2 + (y-15)**2) / 30) * 80;
        const fitness3 = Math.exp(-((x-10)**2 + (y-2)**2) / 15) * 60;
        const noise = (Math.random() - 0.5) * 10;
        
        landscape?.push({
          x,
          y,
          fitness: fitness1 + fitness2 + fitness3 + noise + 10
        });
      }
    }
    setFitnessLandscape(landscape);
  };

  const calculateEvolutionPressure = () => {
    if (population?.length === 0) return { selection: 0, mutation: 0, drift: 0 };
    
    const fitnessValues = population?.map(p => p?.fitness);
    const mean = fitnessValues?.reduce((a, b) => a + b, 0) / fitnessValues?.length;
    const variance = fitnessValues?.reduce((sum, f) => sum + (f - mean) ** 2, 0) / fitnessValues?.length;
    
    return {
      selection: Math.min(variance / 100, 1) * 100, // Selection pressure from fitness variance
      mutation: evolutionMetrics?.mutationRate * 100,
      drift: Math.random() * 20 // Genetic drift
    };
  };

  const getMarketRegimeAnalysis = () => {
    // Analyze current market conditions affecting evolution
    const regimes = [
      { name: 'Bull Market', probability: 0.35, color: 'green' },
      { name: 'Bear Market', probability: 0.15, color: 'red' },
      { name: 'Sideways', probability: 0.30, color: 'yellow' },
      { name: 'High Volatility', probability: 0.20, color: 'orange' }
    ];
    
    return regimes?.sort((a, b) => b?.probability - a?.probability);
  };

  const evolutionPressure = calculateEvolutionPressure();
  const marketRegimes = getMarketRegimeAnalysis();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Evolution Simulation Dashboard</h3>
        </div>
        
        {/* Simulation Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-gray-400 text-sm">Speed:</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e?.target?.value))}
              className="w-16"
            />
            <span className="text-blue-400 text-sm">{simulationSpeed}x</span>
          </div>
          
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isSimulating 
                ? 'bg-red-600 hover:bg-red-700 text-white' :'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => {
              setFitnessHistory([]);
              setDiversityHistory([]);
            }}
            className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitness Evolution Chart */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h4 className="text-white font-semibold">Fitness Evolution</h4>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fitnessHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="generation" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxFitness" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Max Fitness"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgFitness" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Avg Fitness"
                />
                <Line 
                  type="monotone" 
                  dataKey="minFitness" 
                  stroke="#EF4444" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Min Fitness"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diversity Tracking */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-semibold">Genetic Diversity</h4>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diversityHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="generation" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#F9FAFB'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="diversity" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Diversity Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolution Pressure Analysis */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h4 className="text-white font-semibold">Evolution Pressure</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Selection Pressure</span>
                <span className="text-blue-400">{evolutionPressure?.selection?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${evolutionPressure?.selection}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Mutation Pressure</span>
                <span className="text-red-400">{evolutionPressure?.mutation?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${evolutionPressure?.mutation}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Genetic Drift</span>
                <span className="text-green-400">{evolutionPressure?.drift?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${evolutionPressure?.drift}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Market Regime Analysis */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4">Market Regime Detection</h4>
          
          <div className="space-y-3">
            {marketRegimes?.map((regime, index) => (
              <div key={regime?.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      regime?.color === 'green' ? 'bg-green-500' :
                      regime?.color === 'red' ? 'bg-red-500' :
                      regime?.color === 'yellow'? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                  />
                  <span className="text-gray-300 font-medium">{regime?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        regime?.color === 'green' ? 'bg-green-500' :
                        regime?.color === 'red' ? 'bg-red-500' :
                        regime?.color === 'yellow'? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${regime?.probability * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${
                    regime?.color === 'green' ? 'text-green-400' :
                    regime?.color === 'red' ? 'text-red-400' :
                    regime?.color === 'yellow'? 'text-yellow-400' : 'text-orange-400'
                  }`}>
                    {(regime?.probability * 100)?.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Fitness Landscape Visualization */}
      <div className="mt-6 bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Fitness Landscape</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={fitnessLandscape}>
              <CartesianGrid stroke="#374151" />
              <XAxis type="number" dataKey="x" domain={[0, 20]} stroke="#9CA3AF" />
              <YAxis type="number" dataKey="y" domain={[0, 20]} stroke="#9CA3AF" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#F9FAFB'
                }}
                formatter={(value, name) => [value?.toFixed(2), 'Fitness']}
              />
              <Scatter
                dataKey="fitness"
                fill="#8B5CF6"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center text-gray-400 text-sm mt-2">
          Fitness landscape showing evolutionary peaks and valleys
        </div>
      </div>
    </div>
  );
}