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
      const { data, error } = await supabase?.from('market_data')?.select('data_source, api_provider, count(*)')?.group('data_source, api_provider')?.order('count', { ascending: false })?.limit(10);
      
      if (error) {
        throw new Error(`Failed to fetch market data sources: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching market data sources:', error);
      throw error;
    }
  },

  // Research Pipeline Operations
  async getBookProcessingStats() {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.select('status, processing_stage, count(*)')?.group('status, processing_stage')?.order('count', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch book processing stats: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching book processing stats:', error);
      throw error;
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
      const { data, error } = await supabase?.from('strategy_extractions')?.select('extraction_type, count(*)')?.group('extraction_type')?.order('count', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch extraction stats: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching extraction stats:', error);
      throw error;
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
        supabase?.from('ai_agents')?.select('agent_status, agent_group, count(*)')?.group('agent_status, agent_group'),
        
        supabase?.from('strategy_extractions')?.select('created_at')?.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)?.toISOString()),
        
        supabase?.from('book_processing_jobs')?.select('status, count(*)')?.group('status')
      ]);

      return {
        agents: agentStats?.data || [],
        recentStrategies: strategyStats?.data?.length || 0,
        processingJobs: pipelineStats?.data || []
      };
    } catch (error) {
      console.error('Error fetching innovation metrics:', error);
      throw error;
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