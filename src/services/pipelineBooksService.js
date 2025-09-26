import { supabase } from '../lib/supabase';

export class PipelineBooksService {
  // Get book library with processing status
  static async getBookLibrary() {
    try {
      const { data, error } = await supabase?.from('book_library')?.select(`
          *,
          book_processing_jobs:book_processing_jobs(
            id,
            processing_stage,
            status,
            progress_percentage,
            started_at,
            completed_at
          )
        `)?.order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch book library' };
    }
  }

  // Get processing pipeline status
  static async getPipelineStatus() {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.select(`
          *,
          book_library:book_id(id, title, author)
        `)?.order('created_at', { ascending: false })?.limit(10);

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch pipeline status' };
    }
  }

  // Get strategy extractions (registry data)
  static async getStrategyRegistry() {
    try {
      const { data, error } = await supabase?.from('strategy_extractions')?.select(`
          *,
          book_library:book_id(id, title, author)
        `)?.order('confidence_score', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch strategy registry' };
    }
  }

  // Get pipeline registry stats
  static async getPipelineRegistryStats() {
    try {
      const { data, error } = await supabase?.from('pipeline_registry')?.select('*')?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      return { data: data || null, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to fetch pipeline registry stats' };
    }
  }

  // Get book processing agents
  static async getBookProcessingAgents() {
    try {
      const { data, error } = await supabase?.from('book_processing_agents')?.select(`
          *,
          ai_agents:ai_agent_id(
            id,
            name,
            strategy,
            agent_status,
            performance_metrics
          )
        `)?.eq('is_active', true);

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch processing agents' };
    }
  }

  // Start book processing pipeline
  static async startBookProcessing(bookId) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.insert({
          book_id: bookId,
          processing_stage: 'ocr',
          status: 'pending'
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to start book processing' };
    }
  }

  // Update processing job progress
  static async updateProcessingProgress(jobId, progress, stage, status) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.update({
          progress_percentage: progress,
          processing_stage: stage,
          status: status,
          ...(status === 'completed' && { completed_at: new Date()?.toISOString() })
        })?.eq('id', jobId)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to update processing progress' };
    }
  }

  // Get processing statistics
  static async getProcessingStats() {
    try {
      // Get book processing stats
      const { data: bookStats, error: bookError } = await supabase?.from('book_library')?.select('processing_status')?.then(result => ({
          ...result,
          data: result?.data?.reduce((acc, book) => {
            acc[book?.processing_status] = (acc?.[book?.processing_status] || 0) + 1;
            return acc;
          }, {})
        }));

      if (bookError) {
        throw bookError;
      }

      // Get extraction stats
      const { data: extractionStats, error: extractionError } = await supabase?.from('strategy_extractions')?.select('extraction_type')?.then(result => ({
          ...result,
          data: result?.data?.reduce((acc, extraction) => {
            acc[extraction?.extraction_type] = (acc?.[extraction?.extraction_type] || 0) + 1;
            return acc;
          }, {})
        }));

      if (extractionError) {
        throw extractionError;
      }

      return {
        data: {
          bookStats: bookStats || {},
          extractionStats: extractionStats || {},
          totalBooks: Object.values(bookStats || {})?.reduce((sum, count) => sum + count, 0),
          totalExtractions: Object.values(extractionStats || {})?.reduce((sum, count) => sum + count, 0)
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error?.message || 'Failed to fetch processing statistics'
      };
    }
  }

  // Real-time subscription for processing updates
  static subscribeToProcessingUpdates(callback) {
    const channel = supabase?.channel('book_processing_updates')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'book_processing_jobs' },
        (payload) => {
          callback?.(payload);
        }
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'strategy_extractions' },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }
}

export default PipelineBooksService;