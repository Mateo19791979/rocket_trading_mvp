import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dna, Activity, Shield, Atom } from 'lucide-react';

// Import components
import StrategyDNASequencer from './components/StrategyDNASequencer';
import PopulationManagement from './components/PopulationManagement';
import AlphaFactorDiscovery from './components/AlphaFactorDiscovery';
import EvolutionSimulationDashboard from './components/EvolutionSimulationDashboard';
import StrategyGenealogyTracker from './components/StrategyGenealogyTracker';
import AutonomousInnovationController from './components/AutonomousInnovationController';

export default function GeneticStrategyEvolutionLaboratory() {
  const [strategies, setStrategies] = useState([]);
  const [geneticPopulation, setGeneticPopulation] = useState([]);
  const [evolutionMetrics, setEvolutionMetrics] = useState({
    generation: 1,
    populationSize: 50,
    fitnessAverage: 0,
    diversityIndex: 0,
    mutationRate: 0.1,
    crossoverRate: 0.7
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGeneration, setActiveGeneration] = useState(1);

  useEffect(() => {
    loadGeneticData();
  }, []);

  const loadGeneticData = async () => {
    try {
      setLoading(true);
      
      // Load strategies with performance metrics
      const { data: strategiesData, error: strategiesError } = await supabase?.from('strategies')?.select(`
          *,
          scores (
            value,
            date
          )
        `)?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (strategiesError) throw strategiesError;

      setStrategies(strategiesData || []);

      // Generate initial genetic population if empty
      if (strategiesData?.length) {
        const population = generateGeneticPopulation(strategiesData);
        setGeneticPopulation(population);
        updateEvolutionMetrics(population);
      }

    } catch (error) {
      console.error('Error loading genetic data:', error);
      setError(`Failed to load genetic data: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateGeneticPopulation = (strategies) => {
    return strategies?.map((strategy, index) => ({
      id: strategy?.id,
      name: strategy?.name,
      dna: extractStrategyDNA(strategy),
      fitness: calculateFitness(strategy),
      generation: 1,
      parents: [],
      mutations: [],
      traits: extractTraits(strategy?.parameters),
      performance: strategy?.performance_metrics || {}
    }));
  };

  const extractStrategyDNA = (strategy) => {
    const params = strategy?.parameters || {};
    return {
      genes: Object.keys(params)?.map(key => ({
        name: key,
        value: params?.[key],
        type: typeof params?.[key],
        dominant: Math.random() > 0.5
      })),
      phenotype: strategy?.name,
      genotype: btoa(JSON.stringify(params))
    };
  };

  const calculateFitness = (strategy) => {
    const metrics = strategy?.performance_metrics || {};
    const scores = strategy?.scores || [];
    
    let fitness = 0;
    if (scores?.length > 0) {
      fitness = scores?.reduce((sum, score) => sum + score?.value, 0) / scores?.length;
    }

    // Add performance bonuses
    if (metrics?.sharpe_ratio) fitness += metrics?.sharpe_ratio * 10;
    if (metrics?.win_rate) fitness += metrics?.win_rate * 50;
    if (metrics?.profit_factor) fitness += metrics?.profit_factor * 20;

    return Math.max(0, fitness);
  };

  const extractTraits = (parameters) => {
    const traits = [];
    Object.entries(parameters || {})?.forEach(([key, value]) => {
      traits?.push({
        name: key,
        value: value,
        strength: Math.random(),
        expression: Math.random() > 0.5 ? 'dominant' : 'recessive'
      });
    });
    return traits;
  };

  const updateEvolutionMetrics = (population) => {
    const fitnessValues = population?.map(p => p?.fitness);
    const avgFitness = fitnessValues?.reduce((a, b) => a + b, 0) / fitnessValues?.length;
    
    setEvolutionMetrics(prev => ({
      ...prev,
      fitnessAverage: avgFitness,
      populationSize: population?.length,
      diversityIndex: calculateDiversityIndex(population)
    }));
  };

  const calculateDiversityIndex = (population) => {
    // Shannon diversity index for genetic diversity
    const geneTypes = {};
    population?.forEach(individual => {
      individual?.dna?.genes?.forEach(gene => {
        const key = `${gene?.name}-${gene?.value}`;
        geneTypes[key] = (geneTypes?.[key] || 0) + 1;
      });
    });

    let diversity = 0;
    const total = Object.values(geneTypes)?.reduce((a, b) => a + b, 0);
    Object.values(geneTypes)?.forEach(count => {
      const p = count / total;
      if (p > 0) diversity -= p * Math.log(p);
    });

    return diversity;
  };

  const evolvePopulation = async () => {
    try {
      setLoading(true);

      // Selection: Choose best performers
      const sorted = [...geneticPopulation]?.sort((a, b) => b?.fitness - a?.fitness);
      const survivors = sorted?.slice(0, Math.floor(geneticPopulation?.length * 0.5));

      // Crossover: Create offspring
      const offspring = [];
      for (let i = 0; i < survivors?.length; i += 2) {
        if (i + 1 < survivors?.length) {
          const [child1, child2] = crossover(survivors?.[i], survivors?.[i + 1]);
          offspring?.push(child1, child2);
        }
      }

      // Mutation: Introduce variations
      const mutated = offspring?.map(child => 
        Math.random() < evolutionMetrics?.mutationRate ? mutate(child) : child
      );

      // New generation
      const newGeneration = [...survivors, ...mutated]?.slice(0, evolutionMetrics?.populationSize);
      
      setGeneticPopulation(newGeneration);
      setActiveGeneration(prev => prev + 1);
      updateEvolutionMetrics(newGeneration);

      // Log evolution event
      await supabase?.from('decisions_log')?.insert({
        agent: 'genetic_evolution_engine',
        task: 'population_evolution',
        input: { generation: activeGeneration, population_size: newGeneration?.length },
        output: { new_generation: activeGeneration + 1, avg_fitness: evolutionMetrics?.fitnessAverage },
        outcome: 'success'
      });

    } catch (error) {
      console.error('Error evolving population:', error);
      setError(`Evolution failed: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const crossover = (parent1, parent2) => {
    const crossoverPoint = Math.floor(parent1?.dna?.genes?.length / 2);
    
    const child1Genes = [
      ...parent1?.dna?.genes?.slice(0, crossoverPoint),
      ...parent2?.dna?.genes?.slice(crossoverPoint)
    ];
    
    const child2Genes = [
      ...parent2?.dna?.genes?.slice(0, crossoverPoint),
      ...parent1?.dna?.genes?.slice(crossoverPoint)
    ];

    return [
      {
        id: `${parent1?.id}_${parent2?.id}_1`,
        name: `${parent1?.name} x ${parent2?.name} #1`,
        dna: { ...parent1?.dna, genes: child1Genes },
        fitness: 0,
        generation: activeGeneration + 1,
        parents: [parent1?.id, parent2?.id],
        mutations: [],
        traits: combineTraits(parent1?.traits, parent2?.traits),
        performance: {}
      },
      {
        id: `${parent1?.id}_${parent2?.id}_2`,
        name: `${parent1?.name} x ${parent2?.name} #2`,
        dna: { ...parent2?.dna, genes: child2Genes },
        fitness: 0,
        generation: activeGeneration + 1,
        parents: [parent1?.id, parent2?.id],
        mutations: [],
        traits: combineTraits(parent2?.traits, parent1?.traits),
        performance: {}
      }
    ];
  };

  const mutate = (individual) => {
    const mutated = { ...individual };
    const geneToMutate = Math.floor(Math.random() * mutated?.dna?.genes?.length);
    
    mutated.dna.genes[geneToMutate] = {
      ...mutated?.dna?.genes?.[geneToMutate],
      value: mutated?.dna?.genes?.[geneToMutate]?.value * (1 + (Math.random() - 0.5) * 0.2),
      dominant: Math.random() > 0.5
    };

    mutated?.mutations?.push({
      gene: mutated?.dna?.genes?.[geneToMutate]?.name,
      type: 'value_mutation',
      timestamp: new Date()?.toISOString()
    });

    return mutated;
  };

  const combineTraits = (traits1, traits2) => {
    const combined = [...traits1];
    traits2?.forEach(trait2 => {
      const existing = combined?.find(t => t?.name === trait2?.name);
      if (existing) {
        existing.strength = (existing?.strength + trait2?.strength) / 2;
      } else {
        combined?.push(trait2);
      }
    });
    return combined;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400"></div>
          <p className="text-green-400 font-medium">Loading Genetic Laboratory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-[98vw] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
              <Dna className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Genetic Strategy Evolution Laboratory
              </h1>
              <p className="text-gray-300 text-lg">
                Level 4-5 AAS • Autonomous Strategy Creation & Genetic Optimization
              </p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-green-400 text-2xl font-bold">{activeGeneration}</div>
                <div className="text-gray-400 text-sm">Generation</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 text-2xl font-bold">{evolutionMetrics?.populationSize}</div>
                <div className="text-gray-400 text-sm">Population</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 text-2xl font-bold">
                  {evolutionMetrics?.fitnessAverage?.toFixed(1)}
                </div>
                <div className="text-gray-400 text-sm">Avg Fitness</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 text-2xl font-bold">
                  {evolutionMetrics?.diversityIndex?.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">Diversity</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 text-2xl font-bold">
                  {(evolutionMetrics?.mutationRate * 100)?.toFixed(0)}%
                </div>
                <div className="text-gray-400 text-sm">Mutation</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 text-2xl font-bold">
                  {(evolutionMetrics?.crossoverRate * 100)?.toFixed(0)}%
                </div>
                <div className="text-gray-400 text-sm">Crossover</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evolution Controls */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={evolvePopulation}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 
                           disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-xl font-semibold 
                           text-white transition-all duration-200 flex items-center space-x-2"
                >
                  <Atom className="w-5 h-5" />
                  <span>{loading ? 'Evolving...' : 'Evolve Population'}</span>
                </button>
                
                <button
                  onClick={loadGeneticData}
                  disabled={loading}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 px-4 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center space-x-2"
                >
                  <Activity className="w-5 h-5" />
                  <span>Refresh Data</span>
                </button>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <label className="text-gray-300 text-sm">Mutation Rate:</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={evolutionMetrics?.mutationRate}
                    onChange={(e) => setEvolutionMetrics(prev => ({
                      ...prev,
                      mutationRate: parseFloat(e?.target?.value)
                    }))}
                    className="w-20"
                  />
                  <span className="text-red-400 text-sm">
                    {(evolutionMetrics?.mutationRate * 100)?.toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-gray-300 text-sm">Crossover Rate:</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={evolutionMetrics?.crossoverRate}
                    onChange={(e) => setEvolutionMetrics(prev => ({
                      ...prev,
                      crossoverRate: parseFloat(e?.target?.value)
                    }))}
                    className="w-20"
                  />
                  <span className="text-orange-400 text-sm">
                    {(evolutionMetrics?.crossoverRate * 100)?.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-red-300 font-medium">Evolution Error</span>
            </div>
            <p className="text-red-200 mt-2">{error}</p>
          </div>
        )}

        {/* Main Laboratory Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[calc(100vh-400px)]">
          {/* Left Column - DNA & Population Management */}
          <div className="space-y-8">
            <StrategyDNASequencer 
              population={geneticPopulation}
              evolutionMetrics={evolutionMetrics}
              onParameterChange={(id, parameter, value) => {
                setGeneticPopulation(prev => prev?.map(p => 
                  p?.id === id ? {
                    ...p,
                    dna: {
                      ...p?.dna,
                      genes: p?.dna?.genes?.map(g => 
                        g?.name === parameter ? { ...g, value } : g
                      )
                    }
                  } : p
                ));
              }}
            />
            
            <PopulationManagement 
              population={geneticPopulation}
              strategies={strategies}
              onPopulationUpdate={setGeneticPopulation}
            />
            
            <AlphaFactorDiscovery 
              strategies={strategies}
              population={geneticPopulation}
            />
          </div>

          {/* Center Column - Evolution Simulation */}
          <div className="space-y-8">
            <EvolutionSimulationDashboard 
              population={geneticPopulation}
              evolutionMetrics={evolutionMetrics}
              generation={activeGeneration}
            />
            
            <StrategyGenealogyTracker 
              population={geneticPopulation}
              generation={activeGeneration}
            />
          </div>

          {/* Right Column - Autonomous Innovation */}
          <div className="space-y-8">
            <AutonomousInnovationController 
              strategies={strategies}
              population={geneticPopulation}
              onInnovationGenerated={(innovation) => {
                setGeneticPopulation(prev => [...prev, innovation]);
                updateEvolutionMetrics([...geneticPopulation, innovation]);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}