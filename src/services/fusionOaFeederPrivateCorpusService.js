import { supabase } from '../lib/supabase';

export const fusionOaFeederPrivateCorpusService = {
  // Get dual flux statistics and status
  async getDualFluxStatus() {
    try {
      // Get Open-Access Feeder data (Flux 1)
      const { data: oaBooks, error: oaError } = await supabase?.from('book_library')?.select('*')?.eq('metadata->>source', 'open_access')?.order('created_at', { ascending: false });

      if (oaError) throw oaError;

      // Get Private Corpus data (Flux 2)  
      const { data: privateBooks, error: privateError } = await supabase?.from('book_library')?.select('*')?.eq('metadata->>source', 'private_upload')?.order('created_at', { ascending: false });

      if (privateError) throw privateError;

      // Calculate flux statistics
      const flux1Stats = {
        total: oaBooks?.length || 0,
        articles: oaBooks?.filter(book => book?.metadata?.type === 'article')?.length || 0,
        preprints: oaBooks?.filter(book => book?.metadata?.type === 'preprint')?.length || 0,
        oa_books: oaBooks?.filter(book => book?.metadata?.type === 'book')?.length || 0,
        processing: oaBooks?.filter(book => book?.processing_status !== 'completed')?.length || 0,
        enriching_vectordb: oaBooks?.filter(book => book?.processing_status === 'completed')?.length || 0
      };

      const flux2Stats = {
        total: privateBooks?.length || 0,
        pdf_books: privateBooks?.filter(book => book?.document_format === 'pdf')?.length || 0,
        categories: {
          trading: privateBooks?.filter(book => book?.metadata?.category === 'trading')?.length || 0,
          finance: privateBooks?.filter(book => book?.metadata?.category === 'finance')?.length || 0,
          ai: privateBooks?.filter(book => book?.metadata?.category === 'ai')?.length || 0,
          islamic: privateBooks?.filter(book => book?.metadata?.category === 'islamic')?.length || 0,
          corporate: privateBooks?.filter(book => book?.metadata?.category === 'corporate')?.length || 0
        },
        processing: privateBooks?.filter(book => book?.processing_status !== 'completed')?.length || 0,
        enriching_vectordb: privateBooks?.filter(book => book?.processing_status === 'completed')?.length || 0
      };

      return { 
        flux1: flux1Stats, 
        flux2: flux2Stats, 
        totalEnrichment: flux1Stats?.enriching_vectordb + flux2Stats?.enriching_vectordb,
        error: null 
      };
    } catch (error) {
      return { flux1: null, flux2: null, totalEnrichment: 0, error: error?.message };
    }
  },

  // Get Meta-Orchestrateur status and performance
  async getMetaOrchestratorStatus() {
    try {
      // Get registry consumption data
      const { data: registry, error: registryError } = await supabase?.from('pipeline_registry')?.select('*')?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (registryError && registryError?.code !== 'PGRST116') {
        throw registryError;
      }

      // Get all strategies (from both sources)
      const { data: strategies, error: strategiesError } = await supabase?.from('strategy_extractions')?.select('*')?.order('confidence_score', { ascending: false });

      if (strategiesError) throw strategiesError;

      // Get orchestrator state
      const { data: orchestratorState, error: orchestratorError } = await supabase?.from('orchestrator_state')?.select('*')?.in('key', ['scoring_strategies', 'allocation_status', 'auto_selection']);

      if (orchestratorError) throw orchestratorError;

      // Calculate scoring metrics
      const scoringData = {
        total_strategies: strategies?.length || 0,
        sharpe_scores: strategies?.filter(s => s?.parameters?.metrics?.sharpe_ratio)?.length || 0,
        mdd_scores: strategies?.filter(s => s?.parameters?.metrics?.max_drawdown)?.length || 0,
        stability_scores: strategies?.filter(s => s?.parameters?.metrics?.stability_score)?.length || 0,
        high_confidence: strategies?.filter(s => s?.confidence_score > 0.8)?.length || 0,
        medium_confidence: strategies?.filter(s => s?.confidence_score > 0.6 && s?.confidence_score <= 0.8)?.length || 0
      };

      const orchestratorData = {
        registry_consuming: registry?.total_strategies_extracted > 0,
        total_strategies_available: scoringData?.total_strategies,
        multi_strategy_scoring: orchestratorState?.find(state => state?.key === 'scoring_strategies')?.value?.active || false,
        auto_selection_active: orchestratorState?.find(state => state?.key === 'auto_selection')?.value?.enabled || false,
        auto_allocation_active: orchestratorState?.find(state => state?.key === 'allocation_status')?.value?.enabled || false,
        last_registry_update: registry?.updated_at,
        registry_version: registry?.registry_version || 'v0.1'
      };

      return { orchestrator: orchestratorData, scoring: scoringData, error: null };
    } catch (error) {
      return { orchestrator: null, scoring: null, error: error?.message };
    }
  },

  // Get Dashboard Rocket.new integration status
  async getDashboardRocketIntegration() {
    try {
      // Get event bus data for live monitoring
      const { data: events, error: eventsError } = await supabase?.from('event_bus')?.select('*')?.order('created_at', { ascending: false })?.limit(20);

      if (eventsError) throw eventsError;

      // Get processing jobs for Kanban status
      const { data: jobs, error: jobsError } = await supabase?.from('book_processing_jobs')?.select('*')?.order('created_at', { ascending: false })?.limit(10);

      if (jobsError) throw jobsError;

      const dashboardData = {
        poster_vision_active: true, // Assuming this is always active
        registry_status: 'live',
        kanban_deployment: {
          pending: jobs?.filter(job => job?.status === 'pending')?.length || 0,
          processing: jobs?.filter(job => job?.status === 'ingesting')?.length || 0,
          completed: jobs?.filter(job => job?.status === 'completed')?.length || 0,
          failed: jobs?.filter(job => job?.status === 'failed')?.length || 0
        },
        bus_monitor_live: {
          registry_endpoint: events?.filter(event => event?.event_data?.endpoint?.includes('/registry'))?.length || 0,
          scores_endpoint: events?.filter(event => event?.event_data?.endpoint?.includes('/scores'))?.length || 0,
          select_endpoint: events?.filter(event => event?.event_data?.endpoint?.includes('/select'))?.length || 0,
          recent_activity: events?.slice(0, 5) || []
        }
      };

      return { dashboard: dashboardData, error: null };
    } catch (error) {
      return { dashboard: null, error: error?.message };
    }
  },

  // Get roadmap progress and milestones
  async getRoadmapProgress() {
    try {
      // Get processing statistics to determine stage completion
      const { data: jobs, error: jobsError } = await supabase?.from('book_processing_jobs')?.select('processing_stage, status')?.eq('status', 'completed');

      if (jobsError) throw jobsError;

      const { data: registry, error: registryError } = await supabase?.from('pipeline_registry')?.select('*')?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (registryError && registryError?.code !== 'PGRST116') {
        throw registryError;
      }

      // Determine stage completion based on data
      const roadmapStages = {
        s1_oa_feeder: {
          title: 'Mettre en place Feeder OA (fetch+ingest)',
          status: jobs?.filter(job => job?.processing_stage === 'ocr')?.length > 0 ? 'completed' : 'in-progress',
          progress: 75,
          description: 'Configuration des sources OA et pipeline d\'ingestion'
        },
        s2_private_corpus: {
          title: 'Intégrer Private Corpus complet',
          status: registry?.total_books_processed > 10 ? 'completed' : 'in-progress',
          progress: 60,
          description: 'Intégration complète des livres PDF privés'
        },
        s3_auto_registry: {
          title: 'Générer Registry auto enrichi',
          status: registry?.registry_version === 'v0.1' ? 'completed' : 'pending',
          progress: registry?.total_strategies_extracted > 0 ? 85 : 25,
          description: 'Génération automatique du registry avec stratégies'
        },
        s4_live_selector: {
          title: 'Meta-Orchestrateur → sélecteur live',
          status: 'pending',
          progress: 20,
          description: 'Activation du sélecteur automatique en temps réel'
        }
      };

      return { roadmap: roadmapStages, error: null };
    } catch (error) {
      return { roadmap: null, error: error?.message };
    }
  },

  // Get real-time fusion metrics
  async getFusionMetrics() {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString();
      
      // Weekly ingestion rate
      const { data: weeklyBooks, error: booksError } = await supabase?.from('book_library')?.select('id, metadata')?.gte('created_at', weekAgo);

      if (booksError) throw booksError;

      // Processing efficiency
      const { data: completedJobs, error: jobsError } = await supabase?.from('book_processing_jobs')?.select('started_at, completed_at')?.eq('status', 'completed')?.not('started_at', 'is', null)?.not('completed_at', 'is', null)?.order('completed_at', { ascending: false })?.limit(10);

      if (jobsError) throw jobsError;

      // Calculate average processing time
      const avgProcessingTime = completedJobs?.length > 0 
        ? completedJobs?.reduce((sum, job) => {
            const start = new Date(job.started_at);
            const end = new Date(job.completed_at);
            return sum + ((end - start) / (1000 * 60 * 60)); // hours
          }, 0) / completedJobs?.length 
        : 0;

      const metrics = {
        weekly_documents_processed: weeklyBooks?.length || 0,
        oa_documents: weeklyBooks?.filter(book => book?.metadata?.source === 'open_access')?.length || 0,
        private_documents: weeklyBooks?.filter(book => book?.metadata?.source === 'private_upload')?.length || 0,
        avg_processing_hours: Math.round(avgProcessingTime * 100) / 100,
        fusion_efficiency: weeklyBooks?.length > 0 ? Math.min(((weeklyBooks?.length / 50) * 100), 100) : 0 // Target: 50/week
      };

      return { metrics, error: null };
    } catch (error) {
      return { metrics: null, error: error?.message };
    }
  },

  // Start fusion pipeline manually
  async startFusionPipeline(config = {}) {
    try {
      const { data, error } = await supabase?.from('book_processing_jobs')?.insert({
          processing_stage: 'ocr',
          status: 'pending',
          stage_config: {
            fusion_mode: true,
            include_oa_feeder: config?.includeOA ?? true,
            include_private_corpus: config?.includePrivate ?? true,
            priority: config?.priority || 'high',
            manual_trigger: true
          },
          started_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;

      return { job: data, error: null };
    } catch (error) {
      return { job: null, error: error?.message };
    }
  },

  // Real-time subscription for fusion updates
  subscribeToFusionUpdates(callback) {
    const channel = supabase?.channel('fusion-updates')?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'book_processing_jobs' },
        (payload) => callback?.({ type: 'processing', ...payload })
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'strategy_extractions' },
        (payload) => callback?.({ type: 'strategy', ...payload })
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pipeline_registry' },
        (payload) => callback?.({ type: 'registry', ...payload })
      )?.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_bus' },
        (payload) => callback?.({ type: 'event', ...payload })
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  }
};

export default fusionOaFeederPrivateCorpusService;