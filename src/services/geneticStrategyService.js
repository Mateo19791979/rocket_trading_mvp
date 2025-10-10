import { supabase } from '../lib/supabase';

class GeneticStrategyService {
  // Genetic Population Management
  async createGeneticPopulation(strategies) {
    try {
      const population = strategies?.map(strategy => ({
        id: strategy?.id,
        name: strategy?.name,
        dna: this.extractStrategyDNA(strategy),
        fitness: this.calculateFitness(strategy),
        generation: 1,
        parents: [],
        mutations: [],
        traits: this.extractTraits(strategy?.parameters),
        performance: strategy?.performance_metrics || {}
      }));

      return { data: population, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // DNA Extraction and Analysis
  extractStrategyDNA(strategy) {
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
  }

  extractTraits(parameters) {
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
  }

  // Fitness Calculation
  calculateFitness(strategy) {
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
  }

  // Evolution Operations
  async evolvePopulation(population, evolutionConfig = {}) {
    try {
      const {
        selectionRate = 0.5,
        mutationRate = 0.1,
        crossoverRate = 0.7,
        elitismRate = 0.1
      } = evolutionConfig;

      // Selection
      const sorted = [...population]?.sort((a, b) => b?.fitness - a?.fitness);
      const survivors = sorted?.slice(0, Math.floor(population?.length * selectionRate));
      
      // Elitism - preserve top performers
      const elites = sorted?.slice(0, Math.floor(population?.length * elitismRate));
      
      // Crossover - create offspring
      const offspring = [];
      for (let i = 0; i < survivors?.length - 1; i += 2) {
        if (Math.random() < crossoverRate && i + 1 < survivors?.length) {
          const [child1, child2] = this.crossover(survivors?.[i], survivors?.[i + 1]);
          offspring?.push(child1, child2);
        }
      }
      
      // Mutation - introduce variations
      const mutated = offspring?.map(child => 
        Math.random() < mutationRate ? this.mutate(child) : child
      );
      
      // Create new generation
      const newGeneration = [...elites, ...mutated]?.slice(0, population?.length)?.map((individual, index) => ({
          ...individual,
          generation: Math.max(...population?.map(p => p?.generation)) + 1
        }));

      // Log evolution event
      await this.logEvolutionEvent(population?.length, newGeneration?.length);

      return { data: newGeneration, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Genetic Operations
  crossover(parent1, parent2) {
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
        ...parent1,
        id: `${parent1?.id}_${parent2?.id}_1`,
        name: `${parent1?.name} × ${parent2?.name} #1`,
        dna: { ...parent1?.dna, genes: child1Genes },
        parents: [parent1?.id, parent2?.id],
        mutations: [],
        fitness: 0
      },
      {
        ...parent2,
        id: `${parent1?.id}_${parent2?.id}_2`,
        name: `${parent1?.name} × ${parent2?.name} #2`,
        dna: { ...parent2?.dna, genes: child2Genes },
        parents: [parent1?.id, parent2?.id],
        mutations: [],
        fitness: 0
      }
    ];
  }

  mutate(individual) {
    const mutated = { ...individual };
    const geneToMutate = Math.floor(Math.random() * mutated?.dna?.genes?.length);
    
    const originalValue = mutated?.dna?.genes?.[geneToMutate]?.value;
    const mutationStrength = 0.1 + Math.random() * 0.2; // 10-30% mutation
    
    mutated.dna.genes[geneToMutate] = {
      ...mutated?.dna?.genes?.[geneToMutate],
      value: typeof originalValue === 'number' 
        ? originalValue * (1 + (Math.random() - 0.5) * mutationStrength)
        : originalValue,
      dominant: Math.random() > 0.5
    };

    mutated?.mutations?.push({
      gene: mutated?.dna?.genes?.[geneToMutate]?.name,
      type: 'value_mutation',
      originalValue,
      newValue: mutated?.dna?.genes?.[geneToMutate]?.value,
      mutationStrength,
      timestamp: new Date()?.toISOString()
    });

    return mutated;
  }

  // Diversity Analysis
  calculateDiversityIndex(population) {
    const geneTypes = {};
    population?.forEach(individual => {
      individual?.dna?.genes?.forEach(gene => {
        const key = `${gene?.name}-${typeof gene?.value === 'number' ? Math.round(gene?.value) : gene?.value}`;
        geneTypes[key] = (geneTypes?.[key] || 0) + 1;
      });
    });

    // Shannon diversity index
    let diversity = 0;
    const total = Object.values(geneTypes)?.reduce((a, b) => a + b, 0);
    Object.values(geneTypes)?.forEach(count => {
      const p = count / total;
      if (p > 0) diversity -= p * Math.log(p);
    });

    return diversity;
  }

  // Population Health Metrics
  calculatePopulationHealth(population) {
    if (!population?.length) return { overall: 0, diversity: 0, fitness: 0, survival: 0 };

    const fitnessValues = population?.map(p => p?.fitness);
    const avgFitness = fitnessValues?.reduce((a, b) => a + b, 0) / fitnessValues?.length;
    const maxFitness = Math.max(...fitnessValues);

    let diversity = Math.min(this.calculateDiversityIndex(population) * 20, 100);
    let fitness = maxFitness > 0 ? (avgFitness / maxFitness) * 100 : 0;
    
    const survivalThreshold = avgFitness * 0.8;
    const survivorCount = fitnessValues?.filter(f => f >= survivalThreshold)?.length;
    const survival = (survivorCount / population?.length) * 100;
    
    const overall = (diversity + fitness + survival) / 3;

    return { overall, diversity, fitness, survival };
  }

  // Strategy Performance Analysis
  async analyzeStrategyPerformance(strategyId) {
    try {
      const { data: scores, error } = await supabase?.from('scores')?.select('*')?.eq('strategy_id', strategyId)?.order('date', { ascending: true });

      if (error) throw error;

      if (!scores?.length) {
        return { data: null, error: new Error('No performance data found') };
      }

      const returns = scores?.map(s => s?.value);
      const analysis = {
        totalReturn: returns?.[returns?.length - 1] - returns?.[0],
        volatility: this.calculateVolatility(returns),
        sharpeRatio: this.calculateSharpeRatio(returns),
        maxDrawdown: this.calculateMaxDrawdown(returns),
        winRate: this.calculateWinRate(returns)
      };

      return { data: analysis, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Performance Metrics
  calculateVolatility(returns) {
    if (returns?.length < 2) return 0;
    
    const mean = returns?.reduce((a, b) => a + b, 0) / returns?.length;
    const variance = returns?.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns?.length - 1);
    return Math.sqrt(variance);
  }

  calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    const volatility = this.calculateVolatility(returns);
    if (volatility === 0) return 0;
    
    const avgReturn = returns?.reduce((a, b) => a + b, 0) / returns?.length;
    return (avgReturn - riskFreeRate) / volatility;
  }

  calculateMaxDrawdown(returns) {
    let maxDrawdown = 0;
    let peak = returns?.[0];
    
    for (let i = 1; i < returns?.length; i++) {
      if (returns?.[i] > peak) {
        peak = returns?.[i];
      } else {
        const drawdown = (peak - returns?.[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown;
  }

  calculateWinRate(returns) {
    if (returns?.length < 2) return 0;
    
    let wins = 0;
    for (let i = 1; i < returns?.length; i++) {
      if (returns?.[i] > returns?.[i - 1]) wins++;
    }
    
    return wins / (returns?.length - 1);
  }

  // Alpha Factor Discovery
  async discoverAlphaFactors(strategies, population) {
    try {
      const factors = [];
      
      // Analyze existing strategies for patterns
      const patterns = this.analyzeStrategyPatterns(strategies);
      
      // Generate novel factors based on patterns
      patterns?.forEach(pattern => {
        if (pattern?.significance > 0.7) {
          factors?.push(this.generateAlphaFactor(pattern));
        }
      });

      // Cross-validate factors with population performance
      const validatedFactors = factors?.map(factor => ({
        ...factor,
        validation: this.validateFactor(factor, population)
      }));

      return { data: validatedFactors, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  analyzeStrategyPatterns(strategies) {
    const patterns = [];
    
    strategies?.forEach(strategy => {
      const params = strategy?.parameters || {};
      const metrics = strategy?.performance_metrics || {};
      
      // Identify parameter combinations with high performance
      Object.entries(params)?.forEach(([key, value]) => {
        if (metrics?.sharpe_ratio > 1.5) {
          patterns?.push({
            parameter: key,
            value,
            performance: metrics?.sharpe_ratio,
            significance: Math.random() * 0.4 + 0.6 // Simulate significance
          });
        }
      });
    });
    
    return patterns;
  }

  generateAlphaFactor(pattern) {
    return {
      id: `alpha_${pattern?.parameter}_${Date.now()}`,
      name: `${pattern?.parameter?.replace(/_/g, ' ')} Alpha Factor`,
      type: this.classifyFactorType(pattern?.parameter),
      formula: `${pattern?.parameter?.toUpperCase()} = ${pattern?.value}`,
      confidence: pattern?.significance,
      expectedReturn: pattern?.performance * 0.1,
      riskLevel: Math.random() * 0.2 + 0.05
    };
  }

  classifyFactorType(parameter) {
    if (parameter?.includes('rsi') || parameter?.includes('momentum')) return 'momentum';
    if (parameter?.includes('volatility') || parameter?.includes('std')) return 'volatility';
    if (parameter?.includes('correlation') || parameter?.includes('beta')) return 'correlation';
    if (parameter?.includes('sentiment') || parameter?.includes('news')) return 'sentiment';
    return 'technical';
  }

  validateFactor(factor, population) {
    // Simulate factor validation against population
    const relevantIndividuals = population?.filter(individual => 
      individual?.dna?.genes?.some(gene => 
        gene?.name?.toLowerCase()?.includes(factor?.type)
      )
    );

    const avgFitness = relevantIndividuals?.length > 0
      ? relevantIndividuals?.reduce((sum, ind) => sum + ind?.fitness, 0) / relevantIndividuals?.length
      : 0;

    return {
      correlation: Math.random() * 0.6 + 0.2,
      significance: avgFitness > 50 ? 'high' : avgFitness > 20 ? 'medium' : 'low',
      sampleSize: relevantIndividuals?.length
    };
  }

  // Data Quality Assessment
  async assessDataHealthIndex(stream) {
    try {
      const { data: dhi, error } = await supabase?.from('data_health_index')?.select('*')?.eq('stream', stream)?.single();

      if (error) throw error;

      return { data: dhi, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Logging and Monitoring
  async logEvolutionEvent(oldPopulationSize, newPopulationSize) {
    try {
      await supabase?.from('decisions_log')?.insert({
        agent: 'genetic_evolution_engine',
        task: 'population_evolution',
        input: { old_population: oldPopulationSize },
        output: { new_population: newPopulationSize },
        outcome: 'success',
        ts: new Date()?.toISOString()
      });
    } catch (error) {
      console.error('Failed to log evolution event:', error);
    }
  }

  async logInnovation(innovation) {
    try {
      await supabase?.from('decisions_log')?.insert({
        agent: 'autonomous_innovation_controller',
        task: 'strategy_innovation',
        input: { innovation_type: innovation?.type },
        output: { strategy_name: innovation?.name, fitness: innovation?.fitness },
        outcome: 'success',
        ts: new Date()?.toISOString()
      });
    } catch (error) {
      console.error('Failed to log innovation:', error);
    }
  }

  // IQ Scoring Integration
  async calculateStrategyIQS(strategyData) {
    try {
      const breakdown = {
        causality: this.assessCausality(strategyData),
        stability: this.assessStability(strategyData),
        robustness: this.assessRobustness(strategyData),
        adaptability: this.assessAdaptability(strategyData)
      };

      const iqs = Object.values(breakdown)?.reduce((sum, score) => sum + score, 0) / 4;

      const { error } = await supabase?.from('iq_scores')?.insert({
        insight_id: `strategy_${strategyData?.id}`,
        iqs,
        breakdown,
        ts: new Date()?.toISOString()
      });

      if (error) throw error;

      return { data: { iqs, breakdown }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  assessCausality(strategyData) {
    // Assess causal relationships in strategy parameters
    return Math.random() * 0.3 + 0.7; // Simulate 0.7-1.0 range
  }

  assessStability(strategyData) {
    // Assess parameter stability over time
    const metrics = strategyData?.performance_metrics || {};
    return metrics?.volatility ? Math.max(0, 1 - metrics?.volatility / 100) : 0.8;
  }

  assessRobustness(strategyData) {
    // Assess robustness across different market conditions
    return Math.random() * 0.4 + 0.6; // Simulate 0.6-1.0 range
  }

  assessAdaptability(strategyData) {
    // Assess adaptability to changing conditions
    return Math.random() * 0.5 + 0.5; // Simulate 0.5-1.0 range
  }
}

export default new GeneticStrategyService();