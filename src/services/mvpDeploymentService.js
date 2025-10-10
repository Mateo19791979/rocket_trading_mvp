import { supabase } from '../lib/supabase.js';

class MVPDeploymentService {
  // Get or create the MVP deployment project
  async getMVPDeploymentProject(userId) {
    try {
      // First try to find existing MVP deployment project
      let { data: project, error } = await supabase
        ?.from('projects')
        ?.select(`
          *,
          project_stats(total_tasks, todo_tasks, partiel_tasks, termine_tasks, overdue_tasks)
        `)
        ?.eq('owner_id', userId)
        ?.eq('name', 'MVP Rocket Trading - Déploiement')
        ?.single();

      // If no project exists, create it
      if (!project) {
        const { data: newProject, error: createError } = await supabase
          ?.from('projects')
          ?.insert([{
            name: 'MVP Rocket Trading - Déploiement',
            description: 'Plan de déploiement en 9 étapes pour le MVP Trading avec providers API et résilience',
            owner_id: userId
          }])
          ?.select()
          ?.single();

        if (createError) throw createError;
        
        // Create initial deployment stages as tasks
        await this.createInitialDeploymentTasks(newProject?.id);
        
        // Get the project with stats
        const { data: projectWithStats } = await supabase
          ?.from('projects')
          ?.select(`
            *,
            project_stats(total_tasks, todo_tasks, partiel_tasks, termine_tasks, overdue_tasks)
          `)
          ?.eq('id', newProject?.id)
          ?.single();

        project = projectWithStats;
      }

      return { data: project, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Create the 9 deployment stages from the image specification
  async createInitialDeploymentTasks(projectId) {
    const deploymentStages = [
      {
        phase: 'infrastructure',
        task_name: 'Préparer l\'environnement Rocketnew',
        responsible: 'A',
        status: 'todo',
        priority: 'haute',
        deadline_days: 2,
        notes: 'Charger tous les prompts (Provider Router, OHLC, Fundamentals, Bonus Tools). Vérifier compilation.'
      },
      {
        phase: 'infrastructure', 
        task_name: 'Configurer les providers',
        responsible: 'A',
        status: 'todo',
        priority: 'haute',
        deadline_days: 3,
        notes: 'Entrer clés API (Finnhub, Alpha Vantage, TwelveData). Ajouter Google Sheets fallback. Vérifier quotas & latence.'
      },
      {
        phase: 'infrastructure',
        task_name: 'Brancher la couche de données',
        responsible: 'A',
        status: 'todo',
        priority: 'haute',
        deadline_days: 2,
        notes: 'Router → Timescales/Agregators ou Rollback. Brancher cache 10s. Vérifier topics (data.market, ohlc, fundamentals).'
      },
      {
        phase: 'security',
        task_name: 'Activer la résilience',
        responsible: 'A',
        status: 'todo',
        priority: 'haute',
        deadline_days: 3,
        notes: 'Feature Flags (switch à chaud). Anomaly Sentinel (coupe anomalies). Shadow Price (prix secours). Self-Healing Controller (NORMAL/PARTIAL/DEGRADED).'
      },
      {
        phase: 'deployment',
        task_name: 'Déployer sur domaine trading.mvp.com',
        responsible: 'A',
        status: 'todo',
        priority: 'haute',
        deadline_days: 1,
        notes: 'Pointer DNS (Infomaniak ou Vercel). Vérifier HTTPS/SSL. Connecter Rocketnew front + backend API.'
      },
      {
        phase: 'testing',
        task_name: 'Branchement IBKR (test)',
        responsible: 'A',
        status: 'todo',
        priority: 'moyenne',
        deadline_days: 2,
        notes: 'Connecter IBKR Gateway/TWS en mode test d\'abord. Vérifier cohérence PnL en USD/CHF.'
      },
      {
        phase: 'testing',
        task_name: 'Tests Chaos & fallback',
        responsible: 'A',
        status: 'todo',
        priority: 'haute',
        deadline_days: 2,
        notes: 'Couper provider principal. Vérifier fallback. Simuler spike → Anomaly Sentinel. Vérifier Mode Dégradé UI.'
      },
      {
        phase: 'deployment',
        task_name: 'Go-Live Production',
        responsible: 'A',
        status: 'todo',
        priority: 'haute',
        deadline_days: 1,
        notes: 'Basculer profil en Production. Activer monitoring & alertes (PnL, DD, no-trade 3h).'
      },
      {
        phase: 'monitoring',
        task_name: 'Surveillance & amélioration continue',
        responsible: 'A',
        status: 'todo',
        priority: 'moyenne',
        deadline_days: 7,
        notes: 'Analyser logs, latence, coûts API. Ajuster Feature Flags. Améliorer résilience & scalabilité.'
      }
    ];

    try {
      const tasksWithProjectId = deploymentStages?.map(task => ({
        ...task,
        project_id: projectId
      }));

      const { error } = await supabase
        ?.from('project_tasks')
        ?.insert(tasksWithProjectId);

      if (error) throw error;

      // Update project stats
      await this.updateProjectStats(projectId);

      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  }

  // Get deployment stages with progress tracking
  async getDeploymentStages(projectId) {
    try {
      const { data, error } = await supabase
        ?.from('project_tasks')
        ?.select('*')
        ?.eq('project_id', projectId)
        ?.order('created_at', { ascending: true });

      if (error) throw error;

      // Group stages by phase and calculate progress
      const stagesByPhase = {};
      
      data?.forEach(task => {
        if (!stagesByPhase?.[task?.phase]) {
          stagesByPhase[task?.phase] = [];
        }
        stagesByPhase?.[task?.phase]?.push(task);
      });

      return { data: stagesByPhase, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Get provider configuration status
  async getProviderStatus() {
    try {
      const { data, error } = await supabase
        ?.from('external_api_configs')
        ?.select('*')
        ?.in('api_name', ['finnhub', 'alpha_vantage', 'twelvedata']);

      if (error) throw error;

      const providerStatus = {
        finnhub: data?.find(p => p?.api_name === 'finnhub') || { api_name: 'finnhub', is_active: false },
        alpha_vantage: data?.find(p => p?.api_name === 'alpha_vantage') || { api_name: 'alpha_vantage', is_active: false },
        twelvedata: data?.find(p => p?.api_name === 'twelvedata') || { api_name: 'twelvedata', is_active: false }
      };

      return { data: providerStatus, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Update task stage status
  async updateStageStatus(taskId, newStatus) {
    try {
      const { data, error } = await supabase
        ?.from('project_tasks')
        ?.update({ status: newStatus })
        ?.eq('id', taskId)
        ?.select()
        ?.single();

      if (error) throw error;

      // Update project stats
      if (data?.project_id) {
        await this.updateProjectStats(data?.project_id);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Update project statistics
  async updateProjectStats(projectId) {
    try {
      const { error } = await supabase?.rpc('update_project_stats', { project_uuid: projectId });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error?.message };
    }
  }

  // Get deployment KPIs
  async getDeploymentKPIs(projectId) {
    try {
      const { data: stats } = await supabase
        ?.from('project_stats')
        ?.select('*')
        ?.eq('project_id', projectId)
        ?.single();

      const { data: providerStatus } = await this.getProviderStatus();

      const kpis = {
        overall_progress: stats ? Math.round((stats?.termine_tasks / stats?.total_tasks) * 100) : 0,
        stages_completed: stats?.termine_tasks || 0,
        stages_in_progress: stats?.partiel_tasks || 0,
        stages_remaining: stats?.todo_tasks || 0,
        environment_readiness: stats?.termine_tasks >= 1 ? 100 : 0,
        provider_connectivity: Object.values(providerStatus?.data || {})?.filter(p => p?.is_active)?.length * 33.33,
        deployment_status: stats?.termine_tasks >= 5 ? 'Live' : stats?.termine_tasks >= 3 ? 'Staging' : 'Development',
        resilience_active: stats?.termine_tasks >= 4 ? true : false
      };

      return { data: kpis, error: null };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }

  // Subscribe to real-time updates
  subscribeToDeploymentUpdates(projectId, onUpdate) {
    const channel = supabase
      ?.channel(`mvp_deployment_${projectId}`)
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          onUpdate?.(payload);
        }
      )
      ?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'external_api_configs'
        },
        (payload) => {
          onUpdate?.(payload);
        }
      )
      ?.subscribe();

    return channel;
  }

  unsubscribeFromUpdates(channel) {
    supabase?.removeChannel(channel);
  }
}

const mvpDeploymentService = new MVPDeploymentService();
export default mvpDeploymentService;