import { supabase } from '@/lib/supabase';

// AI Learning & Critique Service
export const aiLearningService = {
  // Decisions Log Operations
  async logDecision({ agent, task, input, tools, output, outcome, error }) {
    try {
      const errorSig = error ? this.generateErrorSignature(error) : null;
      
      const { data, error: insertError } = await supabase?.from('decisions_log')?.insert([{
          agent,
          task,
          input: input || {},
          tools: tools || {},
          output: output || {},
          outcome,
          error_sig: errorSig,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }]);

      if (insertError) {
        throw insertError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async getDecisionsLog(filters = {}) {
    try {
      let query = supabase?.from('decisions_log')?.select('*')?.order('ts', { ascending: false });

      if (filters?.agent) {
        query = query?.eq('agent', filters?.agent);
      }
      if (filters?.outcome) {
        query = query?.eq('outcome', filters?.outcome);
      }
      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  },

  async getDecisionStats() {
    try {
      const { data, error } = await supabase?.from('decisions_log')?.select('agent, outcome, ts')?.gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString());

      if (error) throw error;

      const stats = {
        totalDecisions: data?.length || 0,
        successRate: 0,
        byAgent: {},
        byOutcome: {}
      };

      if (data?.length) {
        const successCount = data?.filter(d => d?.outcome === 'success')?.length;
        stats.successRate = (successCount / data?.length * 100)?.toFixed(1);

        // Group by agent
        data?.forEach(decision => {
          if (!stats?.byAgent?.[decision?.agent]) {
            stats.byAgent[decision.agent] = { total: 0, success: 0 };
          }
          stats.byAgent[decision.agent].total++;
          if (decision?.outcome === 'success') {
            stats.byAgent[decision.agent].success++;
          }
        });

        // Group by outcome
        data?.forEach(decision => {
          stats.byOutcome[decision.outcome] = (stats?.byOutcome?.[decision?.outcome] || 0) + 1;
        });
      }

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // IQ Scores Operations
  async upsertIQS(insightId, breakdown) {
    try {
      const { data: computedData, error: computeError } = await supabase?.rpc('compute_iqs', { breakdown });

      if (computeError) throw computeError;

      const { data, error } = await supabase?.from('iq_scores')?.upsert([{
          insight_id: insightId,
          iqs: computedData,
          breakdown,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }]);

      return { data: { insight_id: insightId, iqs: computedData }, error };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async getIQScores(limit = 20) {
    try {
      const { data, error } = await supabase?.from('iq_scores')?.select('*')?.order('iqs', { ascending: false })?.limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  },

  // Data Health Index Operations
  async updateDHI(stream, parts = {}) {
    try {
      const { data, error } = await supabase?.rpc('update_dhi_score', {
          stream_name: stream,
          timeliness_val: parts?.timeliness || 0.9,
          completeness_val: parts?.completeness || 0.9,
          consistency_val: parts?.consistency || 0.9,
          anomaly_inverse_val: parts?.anomaly_inverse || 0.9,
          coverage_val: parts?.coverage || 0.9,
          license_status_val: parts?.license_status || 1.0
        });

      return { data: { stream, dhi: data }, error };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async getDHIStatus(minDHI = 0.7) {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('*')?.order('dhi', { ascending: false });

      const healthy = data?.filter(d => d?.dhi >= minDHI) || [];
      const unhealthy = data?.filter(d => d?.dhi < minDHI) || [];

      return { 
        data: { 
          all: data || [], 
          healthy, 
          unhealthy,
          healthyCount: healthy?.length,
          totalStreams: data?.length || 0
        }, 
        error 
      };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Source Selection (Bandit Algorithm)
  async pickSource(candidates = []) {
    try {
      const { data, error } = await supabase?.rpc('thompson_sampling', { source_names: candidates });

      return { data: { chosen: data }, error };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async rewardSource(source, success = true) {
    try {
      const field = success ? 'successes' : 'failures';
      
      const { data, error } = await supabase?.from('source_rewards')?.select('*')?.eq('source', source)?.single();

      if (error && error?.code !== 'PGRST116') { // Not found error
        throw error;
      }

      const updateData = {
        source,
        pulls: (data?.pulls || 0) + 1,
        successes: data?.successes || 0,
        failures: data?.failures || 0,
        last_reward: success ? 1 : 0,
        user_id: (await supabase?.auth?.getUser())?.data?.user?.id
      };

      updateData[field] = (data?.[field] || 0) + 1;

      const { data: result, error: upsertError } = await supabase?.from('source_rewards')?.upsert([updateData]);

      return { data: result, error: upsertError };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async getSourceStats() {
    try {
      const { data, error } = await supabase?.from('source_rewards')?.select('*')?.order('last_reward', { ascending: false });

      const stats = data?.map(source => ({
        ...source,
        successRate: source?.pulls > 0 ? ((source?.successes / source?.pulls) * 100)?.toFixed(1) : '0.0'
      })) || [];

      return { data: stats, error };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  },

  // Toxic Vectors (Pattern Memory)
  async addToxicVector(strategyId, embedding, notes) {
    try {
      const { data, error } = await supabase?.from('toxic_vectors')?.insert([{
          strategy_id: strategyId,
          embedding,
          notes,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }]);

      return { data, error };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  async getToxicVectors() {
    try {
      const { data, error } = await supabase?.from('toxic_vectors')?.select('*')?.order('when_bad', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  },

  // Utility Functions
  generateErrorSignature(error) {
    const errorString = typeof error === 'string' ? error : error?.message || JSON.stringify(error);
    return this.simpleHash(errorString);
  },

  simpleHash(str) {
    let hash = 0;
    if (str?.length === 0) return hash?.toString(16);
    for (let i = 0; i < str?.length; i++) {
      const char = str?.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash)?.toString(16);
  },

  // Real-time Subscriptions
  subscribeTo(table, callback, filters = {}) {
    const channel = supabase?.channel(`${table}_changes`)?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          ...filters
        },
        callback
      )?.subscribe();

    return channel;
  }
};

// Options Screening Service
export const optionsScreeningService = {
  // Screen equities for options opportunities
  async screenEquitiesForOptions(criteria = {}) {
    try {
      const {
        minRevenue = 50000000,
        underperfDays = 30,
        minIVRank = 30,
        maxPERatio = 25
      } = criteria;

      // Use existing AI screening results as base
      let query = supabase?.from('ai_screening_results')?.select(`
          *,
          assets (
            id,
            symbol,
            name,
            sector
          )
        `)?.eq('screening_status', 'completed')?.gte('composite_score', 60);

      if (minIVRank) {
        query = query?.gte('iv_rank', minIVRank);
      }

      const { data, error } = await query?.limit(50);

      if (error) throw error;

      // Enhance with options-specific analysis
      const enhancedData = data?.map(result => ({
        ...result,
        optionsRecommendation: this.generateOptionsRecommendation(result),
        riskScore: this.calculateOptionsRiskScore(result),
        potentialReturn: this.estimatePotentialReturn(result)
      })) || [];

      return { data: enhancedData, error: null };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  },

  // Generate options strategies
  async generateOptionsStrategies(ticker, marketData = {}) {
    try {
      const { iv = 0.4, rv = 0.3, currentPrice = 100, trend = 'neutral' } = marketData;
      
      const strategies = [];
      const bias = (iv - rv) > 0.05 ? 'sell_vol' : 'buy_vol';

      if (bias === 'sell_vol') {
        // High IV - sell premium strategies
        strategies?.push({
          type: 'bear_call_spread',
          description: 'Sell call spreads in high IV environment',
          maxProfit: 150,
          maxLoss: -350,
          breakeven: currentPrice + 5,
          probability: 0.65,
          delta: -0.25,
          timeframe: '30-45 days'
        });

        strategies?.push({
          type: 'cash_secured_put',
          description: 'Collect premium while potentially acquiring shares',
          maxProfit: 200,
          maxLoss: -1800,
          breakeven: currentPrice - 2,
          probability: 0.70,
          delta: -0.30,
          timeframe: '30-45 days'
        });
      } else {
        // Low IV - buy premium strategies
        strategies?.push({
          type: 'bull_call_spread',
          description: 'Buy call spreads expecting IV expansion',
          maxProfit: 350,
          maxLoss: -150,
          breakeven: currentPrice + 1.5,
          probability: 0.55,
          delta: 0.25,
          timeframe: '30-60 days'
        });

        strategies?.push({
          type: 'long_call',
          description: 'Buy calls for directional play with vol expansion',
          maxProfit: 'Unlimited',
          maxLoss: -300,
          breakeven: currentPrice + 3,
          probability: 0.45,
          delta: 0.50,
          timeframe: '45-90 days'
        });
      }

      return { data: { ticker, strategies, analysis: { iv, rv, bias } }, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get existing options strategies
  async getOptionsStrategies() {
    try {
      const { data, error } = await supabase?.from('options_strategies')?.select(`
          *,
          assets (
            symbol,
            name
          )
        `)?.order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error: error?.message };
    }
  },

  // Helper functions
  generateOptionsRecommendation(screeningResult) {
    const { iv_rank, pe_zscore, momentum_score, quality_score } = screeningResult;
    
    if (iv_rank > 70 && momentum_score < 50) {
      return 'sell_premium';
    } else if (iv_rank < 30 && momentum_score > 70) {
      return 'buy_premium';
    } else if (pe_zscore < -1 && quality_score > 80) {
      return 'value_plays';
    }
    return 'neutral';
  },

  calculateOptionsRiskScore(result) {
    const { iv_rank, liquidity_score, sentiment_score } = result;
    
    // Higher IV rank and lower liquidity = higher risk
    const riskScore = Math.min(100, Math.max(0,
      (iv_rank || 50) * 0.4 + 
      (100 - (liquidity_score || 50)) * 0.3 +
      Math.abs((sentiment_score || 50) - 50) * 0.3
    ));
    
    return Math.round(riskScore);
  },

  estimatePotentialReturn(result) {
    const { iv_rank, momentum_score, composite_score } = result;
    
    // Basic potential return estimation
    const baseReturn = (composite_score || 50) * 0.001;
    const ivBonus = (iv_rank || 50) > 60 ? 0.02 : 0;
    const momentumBonus = (momentum_score || 50) > 70 ? 0.015 : 0;
    
    return Math.round((baseReturn + ivBonus + momentumBonus) * 10000) / 100; // Percentage
  }
};