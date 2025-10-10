import { supabase } from '../lib/supabase';

class GoLiveService {
  async getDeploymentPipelines(userId = null) {
    try {
      let query = supabase?.from('deployment_pipelines')?.select(`
          *,
          stage_executions(*),
          deployment_metrics(*),
          emergency_controls(*)
        `)?.order('created_at', { ascending: false });

      if (userId) {
        query = query?.eq('created_by', userId);
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching deployment pipelines:', error);
      throw error;
    }
  }

  async createCanaryDeployment(pipelineName, configuration, userId) {
    try {
      const { data, error } = await supabase?.from('deployment_pipelines')?.insert([
          {
            pipeline_name: pipelineName,
            current_stage: 'j1_boot_guard',
            overall_status: 'pending',
            configuration: {
              ...configuration,
              canary_percentage: 0.1,
              deployment_type: 'canary',
              monitoring_duration_hours: 24
            },
            created_by: userId,
            target_date: new Date(Date.now() + 48 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0] // 48 hours from now
          }
        ])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating canary deployment:', error);
      throw error;
    }
  }

  async updateCanaryPercentage(pipelineId, percentage) {
    try {
      const { data, error } = await supabase?.from('deployment_pipelines')?.update({
          configuration: supabase?.rpc('jsonb_set', {
            target: 'configuration',
            path: '{canary_percentage}',
            new_value: percentage
          })
        })?.eq('id', pipelineId)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating canary percentage:', error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const { data, error } = await supabase?.from('system_health')?.select('*')?.order('created_at', { ascending: false })?.limit(20);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  async getKillSwitches() {
    try {
      const { data, error } = await supabase?.from('kill_switches')?.select('*')?.order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching kill switches:', error);
      throw error;
    }
  }

  async activateKillSwitch(module, reason, userId) {
    try {
      const { data, error } = await supabase?.from('kill_switches')?.upsert([
          {
            module,
            is_active: true,
            reason,
            activated_by: userId
          }
        ])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error activating kill switch:', error);
      throw error;
    }
  }

  async deactivateKillSwitch(module) {
    try {
      const { data, error } = await supabase?.from('kill_switches')?.update({
          is_active: false,
          reason: null
        })?.eq('module', module)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error deactivating kill switch:', error);
      throw error;
    }
  }

  async getDeploymentMetrics(pipelineId) {
    try {
      const { data, error } = await supabase?.from('deployment_metrics')?.select('*')?.eq('pipeline_id', pipelineId)?.order('measured_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching deployment metrics:', error);
      throw error;
    }
  }

  async logDeploymentMetric(pipelineId, metricName, metricValue, metricType = 'performance', thresholds = {}) {
    try {
      const { data, error } = await supabase?.from('deployment_metrics')?.insert([
          {
            pipeline_id: pipelineId,
            metric_name: metricName,
            metric_value: metricValue,
            metric_type: metricType,
            threshold_min: thresholds?.min || null,
            threshold_max: thresholds?.max || null,
            is_within_threshold: thresholds?.min !== undefined || thresholds?.max !== undefined 
              ? (metricValue >= (thresholds?.min || 0) && metricValue <= (thresholds?.max || Infinity))
              : null
          }
        ])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error logging deployment metric:', error);
      throw error;
    }
  }

  // Calculate GO-LIVE readiness score
  async calculateReadinessScore(pipelineId) {
    try {
      const [metrics, health, killSwitches] = await Promise.all([
        this.getDeploymentMetrics(pipelineId),
        this.getSystemHealth(),
        this.getKillSwitches()
      ]);

      let score = 100;
      const factors = [];

      // Check system health
      const recentHealth = health?.slice(0, 5);
      const healthyAgents = recentHealth?.filter(h => h?.health_status === 'healthy')?.length || 0;
      const totalAgents = recentHealth?.length || 1;
      const healthRatio = healthyAgents / totalAgents;
      
      if (healthRatio < 0.9) {
        score -= 20;
        factors?.push(`System health: ${Math.round(healthRatio * 100)}%`);
      }

      // Check active kill switches
      const activeKillSwitches = killSwitches?.filter(ks => ks?.is_active)?.length || 0;
      if (activeKillSwitches > 0) {
        score -= activeKillSwitches * 15;
        factors?.push(`${activeKillSwitches} active kill switches`);
      }

      // Check deployment metrics
      const recentMetrics = metrics?.slice(0, 10);
      const failedMetrics = recentMetrics?.filter(m => m?.is_within_threshold === false)?.length || 0;
      if (failedMetrics > 0) {
        score -= failedMetrics * 10;
        factors?.push(`${failedMetrics} metrics out of threshold`);
      }

      return {
        score: Math.max(0, score),
        factors,
        status: score >= 80 ? 'ready' : score >= 60 ? 'caution' : 'not_ready'
      };
    } catch (error) {
      console.error('Error calculating readiness score:', error);
      return { score: 0, factors: ['Error calculating score'], status: 'not_ready' };
    }
  }

  // Real-time subscription for GO-LIVE updates
  subscribeToUpdates(callback, pipelineId = null) {
    const channels = [];

    // Subscribe to deployment pipeline changes
    const pipelineChannel = supabase?.channel('deployment_updates')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deployment_pipelines',
          filter: pipelineId ? `id=eq.${pipelineId}` : undefined
        },
        callback
      );

    channels?.push(pipelineChannel?.subscribe());

    // Subscribe to system health changes
    const healthChannel = supabase?.channel('health_updates')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_health'
        },
        callback
      );

    channels?.push(healthChannel?.subscribe());

    return channels;
  }

  unsubscribeFromUpdates(subscriptions) {
    subscriptions?.forEach(sub => {
      if (sub) {
        supabase?.removeChannel(sub);
      }
    });
  }
}

export const goLiveService = new GoLiveService();
export default goLiveService;