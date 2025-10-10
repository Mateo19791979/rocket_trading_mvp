import { supabase } from '../lib/supabase';

class StrategyBreedingService {
  // Strategy Candidates Management
  async getCandidates(status = null) {
    try {
      let query = supabase?.from('strategy_candidates')?.select('*')?.order('created_at', { ascending: false });

      if (status) {
        query = query?.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch strategy candidates' };
    }
  }

  async createCandidate(strategySpec) {
    try {
      const { data, error } = await supabase?.from('strategy_candidates')?.insert({
          spec_yaml: strategySpec?.yaml,
          parent_ids: strategySpec?.parentIds || [],
          status: 'pending',
          notes: strategySpec?.notes || 'Auto-generated candidate'
        })?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to create strategy candidate' };
    }
  }

  async updateCandidateStatus(candidateId, status, iqs = null, notes = '') {
    try {
      const updateData = {
        status,
        updated_at: new Date()?.toISOString(),
        ...(notes && { notes }),
        ...(iqs !== null && { iqs })
      };

      const { data, error } = await supabase?.from('strategy_candidates')?.update(updateData)?.eq('id', candidateId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to update candidate status' };
    }
  }

  // Genetic Algorithm Operations
  async breedStrategies(parentIds, mutationRate = 0.15) {
    try {
      // Get parent strategies
      const { data: parents, error: parentError } = await supabase?.from('strategy_candidates')?.select('*')?.in('id', parentIds)?.gte('iqs', 0.75);

      if (parentError) throw parentError;

      if (!parents || parents?.length < 2) {
        throw new Error('Need at least 2 high-quality parents for breeding');
      }

      // Simple genetic crossover logic
      const childSpec = this.performGeneticCrossover(parents, mutationRate);

      // Create new candidate
      const { data, error } = await supabase?.from('strategy_candidates')?.insert({
          parent_ids: parentIds,
          spec_yaml: childSpec,
          status: 'pending',
          notes: `Bred from ${parentIds?.length} parents with ${mutationRate} mutation rate`
        })?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to breed strategies' };
    }
  }

  performGeneticCrossover(parents, mutationRate) {
    const features = [
      'RSI(14)', 'BB(20,2)', 'ATR(14)', 'VWAP', 'HMA(50)', 
      'ADX(14)', 'MACD(12,26,9)', 'STOCH(14,3,3)', 'CMF(20)', 'OBV'
    ];

    // Extract features from parents (simplified)
    const parentFeatures = parents?.map(p => {
      const match = p?.spec_yaml?.match(/features:\s*\n([\s\S]*?)\nlogic/);
      return match ? match?.[1]?.split('\n')?.map(f => f?.replace(/^\s*-\s*/, '')?.trim())?.filter(Boolean) : [];
    }) || [];

    // Crossover: combine features from parents
    const allFeatures = [...new Set(parentFeatures?.flat())];
    const selectedFeatures = allFeatures?.slice(0, Math?.floor(Math?.random() * 3) + 2);

    // Mutation: potentially add random features
    if (Math?.random() < mutationRate) {
      const availableFeatures = features?.filter(f => !selectedFeatures?.includes(f));
      if (availableFeatures?.length > 0) {
        selectedFeatures?.push(availableFeatures?.[Math?.floor(Math?.random() * availableFeatures?.length)]);
      }
    }

    // Generate new strategy YAML
    const strategyId = `STR-${Math?.random()?.toString(36)?.substr(2, 6)?.toUpperCase()}`;
    const capitalPct = (Math?.random() * 0.4 + 0.1)?.toFixed(1); // 0.1-0.5
    const maxDrawdown = (Math?.random() * 4 + 2)?.toFixed(0); // 2-6%

    return `strategy_id: ${strategyId}
features:
${selectedFeatures?.map(f => `  - ${f}`)?.join('\n')}
logic:
  entry: "if ${selectedFeatures?.[0]}_signal and vol_z < 2 => long"
  exit: "stop_loss or take_profit or time_limit"
risk:
  capital_pct: ${capitalPct}
  max_dd_pct: ${maxDrawdown}
  position_sizing: "kelly_criterion"
metadata:
  created: "${new Date()?.toISOString()}"
  generation: "bred"
  mutation_rate: ${mutationRate}`;
  }

  // Natural Selection Process
  async performNaturalSelection(minIQS = 0.75) {
    try {
      // Get candidates eligible for promotion/demotion
      const { data: candidates, error: fetchError } = await supabase?.from('strategy_candidates')?.select('*')?.in('status', ['testing', 'paper', 'canary', 'live'])?.not('iqs', 'is', null);

      if (fetchError) throw fetchError;

      const updates = [];

      candidates?.forEach(candidate => {
        const currentStatus = candidate?.status;
        const iqs = candidate?.iqs || 0;

        let newStatus = currentStatus;

        if (iqs >= minIQS) {
          // Promote high-performing strategies
          if (currentStatus === 'paper') newStatus = 'canary';
          else if (currentStatus === 'canary') newStatus = 'live';
        } else {
          // Demote underperforming strategies
          if (currentStatus === 'live') newStatus = 'canary';
          else if (currentStatus === 'canary') newStatus = 'paper';
          else if (currentStatus === 'paper') newStatus = 'rejected';
        }

        if (newStatus !== currentStatus) {
          updates?.push({
            id: candidate?.id,
            status: newStatus,
            notes: `Natural selection: ${currentStatus} → ${newStatus} (IQS: ${iqs})`
          });
        }
      });

      if (updates?.length === 0) {
        return { data: { updated: 0 }, error: null };
      }

      // Batch update
      const { data, error } = await supabase?.from('strategy_candidates')?.upsert(updates, { onConflict: 'id' })?.select();

      if (error) throw error;
      return { data: { updated: data?.length || 0, details: updates }, error: null };
    } catch (error) {
      return { data: { updated: 0 }, error: error?.message || 'Failed to perform natural selection' };
    }
  }

  // Meta Learning Metrics
  async recordMetaLearning(agent, algorithm, metrics) {
    try {
      const { data, error } = await supabase?.from('meta_learning_metrics')?.insert({
          agent,
          algo: algorithm,
          success_rate: metrics?.successRate,
          cost_efficiency: metrics?.costEfficiency,
          latency_ms: metrics?.latencyMs,
          params: metrics?.params || {}
        })?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to record meta learning metrics' };
    }
  }

  async getMetaLearningStats(agent = null, timeframe = '24 hours') {
    try {
      let query = supabase?.from('meta_learning_metrics')?.select('*')?.gte('ts', new Date(Date?.now() - this.parseTimeframe(timeframe))?.toISOString())?.order('ts', { ascending: false });

      if (agent) {
        query = query?.eq('agent', agent);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate aggregated stats
      const stats = this.calculateMetaLearningStats(data || []);
      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to fetch meta learning stats' };
    }
  }

  calculateMetaLearningStats(metrics) {
    if (!metrics || metrics?.length === 0) {
      return {
        totalRecords: 0,
        avgSuccessRate: 0,
        avgCostEfficiency: 0,
        avgLatency: 0,
        agentBreakdown: {}
      };
    }

    const agentBreakdown = {};
    metrics?.forEach(m => {
      if (!agentBreakdown?.[m?.agent]) {
        agentBreakdown[m?.agent] = {
          count: 0,
          avgSuccessRate: 0,
          avgLatency: 0
        };
      }
      agentBreakdown[m?.agent].count++;
      agentBreakdown[m?.agent].avgSuccessRate += m?.success_rate || 0;
      agentBreakdown[m?.agent].avgLatency += m?.latency_ms || 0;
    });

    // Calculate averages
    Object?.keys(agentBreakdown)?.forEach(agent => {
      const breakdown = agentBreakdown?.[agent];
      breakdown.avgSuccessRate /= breakdown?.count;
      breakdown.avgLatency /= breakdown?.count;
    });

    return {
      totalRecords: metrics?.length,
      avgSuccessRate: metrics?.reduce((sum, m) => sum + (m?.success_rate || 0), 0) / metrics?.length,
      avgCostEfficiency: metrics?.reduce((sum, m) => sum + (m?.cost_efficiency || 0), 0) / metrics?.length,
      avgLatency: metrics?.reduce((sum, m) => sum + (m?.latency_ms || 0), 0) / metrics?.length,
      agentBreakdown
    };
  }

  parseTimeframe(timeframe) {
    const timeMap = {
      '1 hour': 3600000,
      '6 hours': 21600000,
      '12 hours': 43200000,
      '24 hours': 86400000,
      '7 days': 604800000,
      '30 days': 2592000000
    };
    return timeMap?.[timeframe] || 86400000; // Default to 24 hours
  }

  // Population Management
  async getPopulationStats() {
    try {
      const { data, error } = await supabase?.from('strategy_candidates')?.select('status')?.not('status', 'eq', 'rejected');

      if (error) throw error;

      const statusCounts = {};
      data?.forEach(item => {
        statusCounts[item?.status] = (statusCounts?.[item?.status] || 0) + 1;
      });

      return {
        data: {
          total: data?.length || 0,
          byStatus: statusCounts,
          diversity: Object?.keys(statusCounts)?.length
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to fetch population stats' };
    }
  }
}

export const strategyBreedingService = new StrategyBreedingService();