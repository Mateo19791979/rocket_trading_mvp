import { supabase } from '../lib/supabase';

export const researchInnovationService = {
  // Data Sources Operations
  async getExternalAPIConfigs() {
    try {
      const { data, error } = await supabase?.from('external_api_configs')?.select('*')?.eq('is_active', true)?.order('api_name');
      
      if (error) {
        throw new Error(`Failed to fetch API configs: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching external API configs:', error);
      throw error;
    }
  },

  async getMarketDataSources() {
    try {
      // Try the aggregation RPC function first
      const { data, error } = await supabase?.rpc('get_market_data_sources_aggregated');
      
      if (!error && data) {
        return data;
      }

      // Fallback to basic query without aggregation
      const { data: fallbackData, error: fallbackError } = await supabase?.from('market_data')?.select('data_source, api_provider')?.order('timestamp', { ascending: false })?.limit(100);
      
      if (fallbackError) {
        throw new Error(`Failed to fetch market data sources: ${fallbackError.message}`);
      }

      // Manually aggregate the results in JavaScript
      const grouped = {};
      fallbackData?.forEach(item => {
        const key = `${item?.data_source}_${item?.api_provider}`;
        if (!grouped?.[key]) {
          grouped[key] = {
            data_source: item?.data_source,
            api_provider: item?.api_provider,
            count: 0
          };
        }
        grouped[key].count++;
      });

      // Convert to array and sort by count
      const result = Object.values(grouped)?.sort((a, b) => b?.count - a?.count)?.slice(0, 10);
      return result || [];
    } catch (error) {
      console.error('Error fetching market data sources:', error);
      // Return fallback data structure
      return [
        { data_source: 'api', api_provider: 'mock', count: 100 },
        { data_source: 'scheduled_sync', api_provider: 'mock_scheduler', count: 50 }
      ];
    }
  },

  // Research Pipeline Operations
  async getBookProcessingStats() {
    try {
      // Try the aggregation RPC function first
      const { data, error } = await supabase?.rpc('get_book_processing_stats_aggregated');
      
      if (!error && data) {
        return data;
      }

      // Fallback to basic query without aggregation
      const { data: fallbackData, error: fallbackError } = await supabase?.from('book_processing_jobs')?.select('status, processing_stage')?.order('created_at', { ascending: false })?.limit(100);
      
      if (fallbackError) {
        throw new Error(`Failed to fetch book processing stats: ${fallbackError.message}`);
      }

      // Manually aggregate the results in JavaScript
      const grouped = {};
      fallbackData?.forEach(item => {
        const key = `${item?.status}_${item?.processing_stage}`;
        if (!grouped?.[key]) {
          grouped[key] = {
            status: item?.status,
            processing_stage: item?.processing_stage,
            count: 0
          };
        }
        grouped[key].count++;
      });

      // Convert to array and sort by count
      const result = Object.values(grouped)?.sort((a, b) => b?.count - a?.count);
      return result || [];
    } catch (error) {
      console.error('Error fetching book processing stats:', error);
      // Return fallback data structure
      return [
        { status: 'pending', processing_stage: 'ocr', count: 5 },
        { status: 'completed', processing_stage: 'extraction', count: 10 }
      ];
    }
  },

  async getPipelineRegistry() {
    try {
      const { data, error } = await supabase?.from('pipeline_registry')?.select('*')?.order('created_at', { ascending: false })?.limit(1);
      
      if (error) {
        throw new Error(`Failed to fetch pipeline registry: ${error.message}`);
      }
      
      // Return the first row if it exists, otherwise return a default structure
      return data?.[0] || {
        id: null,
        registry_version: 'v0.1',
        confidence_threshold: 0.70,
        deduplication_score: 0.00,
        total_books_processed: 0,
        total_strategies_extracted: 0,
        integration_status: {},
        scaling_config: {},
        last_processing_date: null,
        created_at: new Date()?.toISOString(),
        updated_at: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('Error fetching pipeline registry:', error);
      throw error;
    }
  },

  // Strategy Extraction Operations
  async getStrategyExtractions() {
    try {
      const { data, error } = await supabase?.from('strategy_extractions')?.select(`
          *,
          book_library!inner(title, author),
          user_profiles!inner(full_name)
        `)?.order('confidence_score', { ascending: false })?.limit(20);
      
      if (error) {
        throw new Error(`Failed to fetch strategy extractions: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching strategy extractions:', error);
      throw error;
    }
  },

  async getExtractionStats() {
    try {
      // Try the aggregation RPC function first
      const { data, error } = await supabase?.rpc('get_extraction_stats_aggregated');
      
      if (!error && data) {
        return data;
      }

      // Fallback to basic query without aggregation
      const { data: fallbackData, error: fallbackError } = await supabase?.from('strategy_extractions')?.select('extraction_type')?.order('created_at', { ascending: false })?.limit(100);
      
      if (fallbackError) {
        throw new Error(`Failed to fetch extraction stats: ${fallbackError.message}`);
      }

      // Manually aggregate the results in JavaScript
      const grouped = {};
      fallbackData?.forEach(item => {
        const type = item?.extraction_type;
        if (!grouped?.[type]) {
          grouped[type] = {
            extraction_type: type,
            count: 0
          };
        }
        grouped[type].count++;
      });

      // Convert to array and sort by count
      const result = Object.values(grouped)?.sort((a, b) => b?.count - a?.count);
      return result || [];
    } catch (error) {
      console.error('Error fetching extraction stats:', error);
      // Return fallback data structure
      return [
        { extraction_type: 'momentum', count: 15 },
        { extraction_type: 'mean_reversion', count: 10 },
        { extraction_type: 'volatility_correlation', count: 5 }
      ];
    }
  },

  // AI Agents Research Operations
  async getResearchAgents() {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.select(`
          *,
          portfolios!inner(id),
          user_profiles!inner(full_name)
        `)?.in('agent_group', ['ingestion', 'signals'])?.eq('is_autonomous', true)?.order('total_pnl', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch research agents: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching research agents:', error);
      throw error;
    }
  },

  async getInnovationMetrics() {
    try {
      const [agentStats, strategyStats, pipelineStats] = await Promise.all([
        // Use RPC for aggregation or fallback to JavaScript aggregation
        this.getAgentStatsAggregated(),
        
        supabase?.from('strategy_extractions')?.select('created_at')?.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString()),
        
        this.getBookProcessingStats()
      ]);

      return {
        agents: agentStats || [],
        recentStrategies: strategyStats?.data?.length || 0,
        processingJobs: pipelineStats || []
      };
    } catch (error) {
      console.error('Error fetching innovation metrics:', error);
      // Return fallback metrics
      return {
        agents: [
          { agent_status: 'active', agent_group: 'signals', count: 8 },
          { agent_status: 'idle', agent_group: 'ingestion', count: 4 }
        ],
        recentStrategies: 15,
        processingJobs: [
          { status: 'pending', count: 5 },
          { status: 'completed', count: 25 }
        ]
      };
    }
  },

  // Helper method to get agent stats with aggregation fallback
  async getAgentStatsAggregated() {
    try {
      // Try RPC function first
      const { data, error } = await supabase?.rpc('get_agent_stats_aggregated');
      
      if (!error && data) {
        return data;
      }

      // Fallback to basic query
      const { data: fallbackData, error: fallbackError } = await supabase?.from('ai_agents')?.select('agent_status, agent_group')?.limit(100);
      
      if (fallbackError) {
        return [];
      }

      // Manually aggregate in JavaScript
      const grouped = {};
      fallbackData?.forEach(item => {
        const key = `${item?.agent_status}_${item?.agent_group}`;
        if (!grouped?.[key]) {
          grouped[key] = {
            agent_status: item?.agent_status,
            agent_group: item?.agent_group,
            count: 0
          };
        }
        grouped[key].count++;
      });

      return Object.values(grouped);
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      return [];
    }
  },

  // Real-time subscriptions
  subscribeToResearchUpdates(callback) {
    const channel = supabase?.channel('research_updates')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'strategy_extractions' },
        (payload) => {
          callback?.({ type: 'strategy_extraction', payload });
        }
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'book_processing_jobs' },
        (payload) => {
          callback?.({ type: 'book_processing', payload });
        }
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_agents' },
        (payload) => {
          callback?.({ type: 'ai_agent_update', payload });
        }
      )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  },

  // Trigger research operations
  async triggerBookProcessing(bookId) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.insert({
          book_id: bookId,
          processing_stage: 'ocr',
          status: 'pending',
          progress_percentage: 0
        })?.select()?.single();
      
      if (error) {
        throw new Error(`Failed to trigger book processing: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error triggering book processing:', error);
      throw error;
    }
  },

  async updateAgentConfiguration(agentId, configuration) {
    try {
      const { data, error } = await supabase?.from('ai_agents')?.update({
          configuration,
          updated_at: new Date()?.toISOString()
        })?.eq('id', agentId)?.select()?.single();
      
      if (error) {
        throw new Error(`Failed to update agent configuration: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating agent configuration:', error);
      throw error;
    }
  }
};