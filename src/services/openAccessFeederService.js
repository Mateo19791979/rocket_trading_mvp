import { supabase } from '../lib/supabase';

export const openAccessFeederService = {
  // Get legal sources status and statistics
  async getLegalSourcesStatus() {
    try {
      const { data: sources, error } = await supabase?.from('book_library')?.select('*')?.eq('document_format', 'pdf')?.order('created_at', { ascending: false });

      if (error) throw error;

      // Categorize by metadata source
      const sourceStats = {
        arxiv: sources?.filter(doc => doc?.metadata?.source === 'arxiv')?.length || 0,
        ssrn: sources?.filter(doc => doc?.metadata?.source === 'ssrn')?.length || 0,
        openalex: sources?.filter(doc => doc?.metadata?.source === 'openalex')?.length || 0,
        doaj: sources?.filter(doc => doc?.metadata?.source === 'doaj')?.length || 0,
        gutenberg: sources?.filter(doc => doc?.metadata?.source === 'gutenberg')?.length || 0,
        total: sources?.length || 0
      };

      return { sources: sourceStats, error: null };
    } catch (error) {
      return { sources: null, error: error?.message };
    }
  },

  // Get pipeline stages status
  async getPipelineStagesStatus() {
    try {
      const { data: jobs, error } = await supabase?.from('book_processing_jobs')?.select('processing_stage, status, progress_percentage')?.order('created_at', { ascending: false })?.limit(100);

      if (error) throw error;

      const stageStats = {
        fetch_openaccess: jobs?.filter(job => job?.processing_stage === 'ocr')?.length || 0,
        ingest_pdf: jobs?.filter(job => job?.processing_stage === 'chunking')?.length || 0,
        embeddings_index: jobs?.filter(job => job?.processing_stage === 'embedding')?.length || 0,
        miner_agent: jobs?.filter(job => job?.processing_stage === 'extraction')?.length || 0,
        normalize_registry: jobs?.filter(job => job?.processing_stage === 'normalization')?.length || 0,
        completed: jobs?.filter(job => job?.status === 'completed')?.length || 0,
        pending: jobs?.filter(job => job?.status === 'pending')?.length || 0,
        failed: jobs?.filter(job => job?.status === 'failed')?.length || 0
      };

      return { stages: stageStats, error: null };
    } catch (error) {
      return { stages: null, error: error?.message };
    }
  },

  // Get product integration status
  async getProductIntegrationStatus() {
    try {
      const { data: registry, error } = await supabase?.from('pipeline_registry')?.select('*')?.order('created_at', { ascending: false })?.limit(1);

      if (error) throw error;

      const integrationData = registry?.[0] || {};

      return {
        integration: {
          registry_auto_fed: integrationData?.total_books_processed > 0,
          orchestrator_consuming: integrationData?.integration_status?.orchestrator_active || false,
          weekly_cron_active: integrationData?.integration_status?.cron_enabled || false,
          last_update: integrationData?.last_processing_date,
          registry_version: integrationData?.registry_version
        },
        error: null
      };
    } catch (error) {
      return { integration: null, error: error?.message };
    }
  },

  // Get KPI metrics
  async getKPIMetrics() {
    try {
      // Get weekly document count
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString();
      
      const { data: weeklyDocs, error: docsError } = await supabase?.from('book_library')?.select('id')?.gte('created_at', weekAgo);

      if (docsError) throw docsError;

      // Get strategy extractions with confidence scores
      const { data: strategies, error: strategiesError } = await supabase?.from('strategy_extractions')?.select('confidence_score')?.gte('confidence_score', 0.7);

      if (strategiesError) throw strategiesError;

      // Get processing time metrics
      const { data: jobs, error: jobsError } = await supabase?.from('book_processing_jobs')?.select('started_at, completed_at, status')?.eq('status', 'completed')?.not('started_at', 'is', null)?.not('completed_at', 'is', null)?.order('completed_at', { ascending: false })?.limit(10);

      if (jobsError) throw jobsError;

      // Calculate average processing time
      const processingTimes = jobs?.map(job => {
        const start = new Date(job.started_at);
        const end = new Date(job.completed_at);
        return (end - start) / (1000 * 60 * 60); // hours
      }) || [];

      const avgProcessingTime = processingTimes?.length > 0 
        ? processingTimes?.reduce((sum, time) => sum + time, 0) / processingTimes?.length 
        : 0;

      return {
        kpis: {
          weekly_docs_integrated: weeklyDocs?.length || 0,
          target_weekly_docs: 200,
          strategies_extracted: strategies?.length || 0,
          avg_confidence_score: strategies?.length > 0 
            ? strategies?.reduce((sum, s) => sum + parseFloat(s?.confidence_score), 0) / strategies?.length 
            : 0,
          avg_ingestion_time_hours: avgProcessingTime,
          target_ingestion_hours: 24
        },
        error: null
      };
    } catch (error) {
      return { kpis: null, error: error?.message };
    }
  },

  // Start manual pipeline execution
  async startManualExecution(sourceType, config = {}) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.insert({
          processing_stage: 'ocr',
          status: 'pending',
          stage_config: {
            source_type: sourceType,
            manual_trigger: true,
            ...config
          },
          started_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;

      return { job: data, error: null };
    } catch (error) {
      return { job: null, error: error?.message };
    }
  },

  // Get processing logs
  async getProcessingLogs(limit = 50) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.select(`
          id,
          processing_stage,
          status,
          progress_percentage,
          error_message,
          started_at,
          completed_at,
          book_id,
          book_library:book_id (title, author)
        `)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) throw error;

      return { logs: data || [], error: null };
    } catch (error) {
      return { logs: [], error: error?.message };
    }
  }
};

export default openAccessFeederService;