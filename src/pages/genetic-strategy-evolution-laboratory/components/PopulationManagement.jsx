import React, { useState } from 'react';
import { Users, Heart, Shield, TrendingUp, AlertTriangle, Activity, Target } from 'lucide-react';

export default function PopulationManagement({ population, strategies, onPopulationUpdate }) {
  const [managementMode, setManagementMode] = useState('overview'); // overview, selection, breeding
  const [selectedForBreeding, setSelectedForBreeding] = useState([]);

  const calculatePopulationHealth = () => {
    if (!population?.length) return { overall: 0, diversity: 0, fitness: 0, survival: 0 };

    const fitnessValues = population?.map(p => p?.fitness);
    const avgFitness = fitnessValues?.reduce((a, b) => a + b, 0) / fitnessValues?.length;
    const maxFitness = Math.max(...fitnessValues);

    // Diversity calculation based on genetic variance
    const geneVariance = calculateGeneticVariance();
    
    // Survival rate based on fitness distribution
    const survivalThreshold = avgFitness * 0.8;
    const survivorCount = fitnessValues?.filter(f => f >= survivalThreshold)?.length;
    const survivalRate = survivorCount / population?.length;

    const diversity = Math.min(geneVariance * 100, 100);
    const fitness = (avgFitness / maxFitness) * 100 || 0;
    const survival = survivalRate * 100;
    const overall = (diversity + fitness + survival) / 3;

    return { overall, diversity, fitness, survival };
  };

  const calculateGeneticVariance = () => {
    if (!population?.length) return 0;

    const allGenes = population?.flatMap(p => p?.dna?.genes || []);
    const geneTypes = {};
    
    allGenes?.forEach(gene => {
      const key = `${gene?.name}-${typeof gene?.value}`;
      geneTypes[key] = (geneTypes?.[key] || 0) + 1;
    });

    const total = allGenes?.length;
    let variance = 0;
    
    Object.values(geneTypes)?.forEach(count => {
      const freq = count / total;
      variance += freq * (1 - freq);
    });

    return variance;
  };

  const getSelectionCriteria = () => {
    return [
      { name: 'Elite Selection', description: 'Top 20% performers', count: Math.floor(population?.length * 0.2) },
      { name: 'Tournament Selection', description: 'Random tournament winners', count: Math.floor(population?.length * 0.3) },
      { name: 'Roulette Selection', description: 'Fitness-weighted random', count: Math.floor(population?.length * 0.25) },
      { name: 'Diversity Preservation', description: 'Maintain genetic diversity', count: Math.floor(population?.length * 0.25) }
    ];
  };

  const performSelection = (criteria) => {
    let selected = [];
    const sorted = [...population]?.sort((a, b) => b?.fitness - a?.fitness);

    switch (criteria) {
      case 'Elite Selection':
        selected = sorted?.slice(0, Math.floor(population?.length * 0.2));
        break;
      case 'Tournament Selection':
        for (let i = 0; i < Math.floor(population?.length * 0.3); i++) {
          const tournament = [];
          for (let j = 0; j < 5; j++) {
            tournament?.push(population?.[Math.floor(Math.random() * population?.length)]);
          }
          selected?.push(tournament?.sort((a, b) => b?.fitness - a?.fitness)?.[0]);
        }
        break;
      case 'Roulette Selection':
        const totalFitness = population?.reduce((sum, p) => sum + p?.fitness, 0);
        for (let i = 0; i < Math.floor(population?.length * 0.25); i++) {
          let random = Math.random() * totalFitness;
          for (const individual of population) {
            random -= individual?.fitness;
            if (random <= 0) {
              selected?.push(individual);
              break;
            }
          }
        }
        break;
      case 'Diversity Preservation':
        // Select individuals with most diverse genetic profiles
        const diverse = population?.sort((a, b) => {
          const diversityA = a?.dna?.genes?.length || 0;
          const diversityB = b?.dna?.genes?.length || 0;
          return diversityB - diversityA;
        });
        selected = diverse?.slice(0, Math.floor(population?.length * 0.25));
        break;
    }

    return selected;
  };

  const health = calculatePopulationHealth();

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Population Health Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 font-medium">Overall Health</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{health?.overall?.toFixed(1)}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${health?.overall}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 font-medium">Diversity Index</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{health?.diversity?.toFixed(1)}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${health?.diversity}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 font-medium">Avg Fitness</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{health?.fitness?.toFixed(1)}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${health?.fitness}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 font-medium">Survival Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{health?.survival?.toFixed(1)}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${health?.survival}%` }}
            />
          </div>
        </div>
      </div>

      {/* Population Distribution */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-4">Population Distribution</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-gray-300 font-medium mb-2">By Fitness Level</h5>
            <div className="space-y-2">
              {['Elite (Top 10%)', 'High (11-30%)', 'Medium (31-70%)', 'Low (71-100%)']?.map((level, index) => {
                const ranges = [0.9, 0.7, 0.3, 0];
                const count = population?.filter(p => {
                  const percentile = population?.filter(pp => pp?.fitness > p?.fitness)?.length / population?.length;
                  return index === 0 ? percentile <= 0.1 :
                         index === 1 ? percentile > 0.1 && percentile <= 0.3 :
                         index === 2 ? percentile > 0.3 && percentile <= 0.7 :
                         percentile > 0.7;
                })?.length;
                
                return (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{level}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-yellow-500' :
                            index === 2 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(count / population?.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-sm w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h5 className="text-gray-300 font-medium mb-2">By Generation</h5>
            <div className="space-y-2">
              {Array.from(new Set(population.map(p => p.generation)))?.sort()?.map(gen => {
                const count = population?.filter(p => p?.generation === gen)?.length;
                return (
                  <div key={gen} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Generation {gen}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / population?.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-sm w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSelection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getSelectionCriteria()?.map((criteria) => (
          <div key={criteria?.name} className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">{criteria?.name}</h4>
              <span className="text-green-400 font-bold">{criteria?.count}</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">{criteria?.description}</p>
            <button
              onClick={() => {
                let selected = performSelection(criteria?.name);
                setSelectedForBreeding(selected);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200"
            >
              Apply Selection
            </button>
          </div>
        ))}
      </div>

      {selectedForBreeding?.length > 0 && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">Selected for Breeding</span>
            <span className="bg-green-900/50 px-2 py-1 rounded text-sm text-green-300">
              {selectedForBreeding?.length} individuals
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {selectedForBreeding?.map((individual) => (
              <div key={individual?.id} className="bg-gray-900/50 rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{individual?.name}</span>
                  <span className="text-green-400 font-bold">{individual?.fitness?.toFixed(2)}</span>
                </div>
                <div className="text-gray-400 text-sm">Generation {individual?.generation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBreeding = () => (
    <div className="space-y-6">
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-300 font-semibold">Breeding Configuration</span>
        </div>
        <p className="text-gray-300 mb-4">
          Configure breeding parameters and crossover strategies for the next generation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded p-3">
            <label className="text-gray-300 text-sm font-medium">Crossover Method</label>
            <select className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white">
              <option value="single">Single Point</option>
              <option value="double">Double Point</option>
              <option value="uniform">Uniform</option>
              <option value="arithmetic">Arithmetic</option>
            </select>
          </div>
          
          <div className="bg-gray-900/50 rounded p-3">
            <label className="text-gray-300 text-sm font-medium">Elitism Rate</label>
            <input
              type="range"
              min="0"
              max="50"
              defaultValue="10"
              className="w-full mt-1"
            />
            <div className="text-gray-400 text-xs mt-1">10% elite preservation</div>
          </div>
          
          <div className="bg-gray-900/50 rounded p-3">
            <label className="text-gray-300 text-sm font-medium">Breeding Pool Size</label>
            <input
              type="number"
              min="10"
              max="100"
              defaultValue="50"
              className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Population Management</h3>
        </div>
        <div className="flex space-x-2">
          {['overview', 'selection', 'breeding']?.map((mode) => (
            <button
              key={mode}
              onClick={() => setManagementMode(mode)}
              className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${
                managementMode === mode
                  ? 'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode?.charAt(0)?.toUpperCase() + mode?.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {managementMode === 'overview' && renderOverview()}
      {managementMode === 'selection' && renderSelection()}
      {managementMode === 'breeding' && renderBreeding()}
    </div>
  );
}