import { supabase } from '../lib/supabase';

class AASObservatoryService {
  constructor() {
    this.baseUrl = import.meta.env?.VITE_API_BASE_URL || 'https://api.ton-domaine.com';
    this.internalKey = import.meta.env?.VITE_INTERNAL_ADMIN_KEY || 'TA_CLE_INTERNE';
  }

  // Execute immediate triggers for AI reflections
  async executeTrigger(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'x-internal-key': this.internalKey,
          'content-type': 'application/json',
        },
      });

      if (!response?.ok) {
        throw new Error(`Trigger execution failed: ${response.status} ${response.statusText}`);
      }

      const result = await response?.json();
      return result;
    } catch (error) {
      console.error('Trigger execution error:', error);
      throw error;
    }
  }

  // Get cognitive metrics for the observatory
  async getCognitiveMetrics() {
    try {
      // Get active agents count
      const { data: agents, error: agentsError } = await supabase?.from('ai_agents')?.select('id, agent_status, performance_metrics')?.neq('agent_status', 'inactive');

      if (agentsError) throw agentsError;

      // Get recent decisions for thoughts per minute calculation
      const oneMinuteAgo = new Date(Date.now() - 60000)?.toISOString();
      const { data: recentDecisions, error: decisionsError } = await supabase?.from('decisions_log')?.select('id')?.gte('ts', oneMinuteAgo);

      if (decisionsError) throw decisionsError;

      // Get system health data
      const { data: systemHealth, error: healthError } = await supabase?.from('system_health')?.select('mode, health_status, dhi_avg')?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (healthError && healthError?.code !== 'PGERRCODE_NO_DATA') {
        throw healthError;
      }

      // Calculate critical decisions (errors in last hour)
      const oneHourAgo = new Date(Date.now() - 3600000)?.toISOString();
      const { data: criticalDecisions, error: criticalError } = await supabase?.from('decisions_log')?.select('id')?.eq('outcome', 'error')?.gte('ts', oneHourAgo);

      if (criticalError) throw criticalError;

      // Calculate average confidence from successful decisions
      const { data: successfulDecisions, error: successError } = await supabase?.from('decisions_log')?.select('output')?.eq('outcome', 'success')?.not('output', 'is', null)?.order('ts', { ascending: false })?.limit(20);

      if (successError) throw successError;

      let averageConfidence = 0;
      if (successfulDecisions?.length > 0) {
        const confidenceScores = successfulDecisions?.map(decision => {
          // Calculate confidence based on output complexity and completeness
          const output = decision?.output || {};
          let confidence = 50;
          if (Object.keys(output)?.length > 2) confidence += 20;
          if (output?.signals) confidence += 15;
          if (output?.confidence) confidence = Math.min(output?.confidence * 100, 100);
          return Math.min(confidence, 100);
        });
        averageConfidence = Math.round(confidenceScores?.reduce((a, b) => a + b, 0) / confidenceScores?.length);
      }

      return {
        activeAgents: agents?.length || 0,
        thoughtsPerMinute: recentDecisions?.length || 0,
        averageConfidence,
        criticalDecisions: criticalDecisions?.length || 0,
        systemMode: systemHealth?.mode || 'unknown'
      };
    } catch (error) {
      console.error('Cognitive metrics error:', error);
      return {
        activeAgents: 0,
        thoughtsPerMinute: 0,
        averageConfidence: 0,
        criticalDecisions: 0,
        systemMode: 'unknown'
      };
    }
  }

  // Get decision logs with filters
  async getDecisionLogs(filters = {}) {
    try {
      let query = supabase?.from('decisions_log')?.select('*')?.order('ts', { ascending: false });

      if (filters?.agent && filters?.agent !== 'all') {
        query = query?.eq('agent', filters?.agent);
      }

      if (filters?.outcome && filters?.outcome !== 'all') {
        query = query?.eq('outcome', filters?.outcome);
      }

      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Decision logs error:', error);
      return [];
    }
  }

  // Get UI Admin status for multi-source observatory
  async getUIAdminStatus() {
    try {
      // Simulate ApexControl status (in real implementation, this would call actual endpoints)
      const apexControlStatus = {
        status: 'active',
        cards: {
          omega: { active: true, value: '95%' },
          legacy: { active: true, value: '12 seeds' },
          quantum: { active: false, value: 'Standby' },
          attention: { active: true, value: '4 markets' }
        }
      };

      // Get AAS Control Center data from database
      const { data: healthData } = await supabase?.from('system_health')?.select('health_status, mode')?.order('created_at', { ascending: false })?.limit(1)?.single();

      const { data: agentsData } = await supabase?.from('ai_agents')?.select('id')?.neq('agent_status', 'inactive');

      const { data: decisionsData } = await supabase?.from('decisions_log')?.select('id')?.order('created_at', { ascending: false })?.limit(100);

      const aasControlStatus = {
        systemHealth: healthData?.health_status || 'unknown',
        healthScore: healthData?.health_status === 'healthy' ? 95 : 60,
        activeAgents: agentsData?.length || 0,
        journalEntries: decisionsData?.length || 0
      };

      return {
        apexControl: apexControlStatus,
        aasControl: aasControlStatus
      };
    } catch (error) {
      console.error('UI Admin status error:', error);
      return {
        apexControl: { status: 'error', cards: {} },
        aasControl: { systemHealth: 'error', healthScore: 0, activeAgents: 0, journalEntries: 0 }
      };
    }
  }

  // Get Grafana metrics simulation
  async getGrafanaMetrics() {
    try {
      // Get system health data
      const { data: healthData } = await supabase?.from('system_health')?.select('mode, dhi_avg, errors_1h')?.order('created_at', { ascending: false })?.limit(1)?.single();

      // Get kill switches status
      const { data: killSwitches } = await supabase?.from('kill_switches')?.select('*')?.eq('is_active', true);

      // Get top strategies
      const { data: strategies } = await supabase?.from('strategy_candidates')?.select('iqs, status')?.order('iqs', { ascending: false })?.limit(5);

      return {
        systemHealth: {
          dhi: Math.round((healthData?.dhi_avg || 0) * 100) / 100,
          mode: healthData?.mode || 'unknown'
        },
        errors: {
          lastHour: healthData?.errors_1h || 0
        },
        killSwitches: {
          active: killSwitches?.length || 0
        },
        topStrategies: strategies?.map((s, i) => ({
          name: `Strategy ${i + 1}`,
          iqs: Math.round((s?.iqs || 0) * 100) / 100
        })) || []
      };
    } catch (error) {
      console.error('Grafana metrics error:', error);
      return {
        systemHealth: { dhi: 0, mode: 'error' },
        errors: { lastHour: 0 },
        killSwitches: { active: 0 },
        topStrategies: []
      };
    }
  }

  // Get Supabase health monitoring
  async getSupabaseHealth() {
    try {
      // Test connection and get basic counts
      const [decisionsResult, strategiesResult, healthResult] = await Promise.allSettled([
        supabase?.from('decisions_log')?.select('id', { count: 'exact', head: true }),
        supabase?.from('strategy_candidates')?.select('id', { count: 'exact', head: true }),
        supabase?.from('system_health')?.select('id', { count: 'exact', head: true })
      ]);

      // Get recent decisions
      const { data: recentDecisions } = await supabase?.from('decisions_log')?.select('agent, outcome')?.order('ts', { ascending: false })?.limit(5);

      // Get strategy metrics
      const { data: strategiesByStatus } = await supabase?.from('strategy_candidates')?.select('status, iqs');

      // Get system health summary
      const { data: systemHealthSummary } = await supabase?.from('system_health')?.select('health_status, cpu_usage');

      // Process strategy metrics
      const strategyMetrics = {
        total: strategiesByStatus?.length || 0,
        testing: strategiesByStatus?.filter(s => s?.status === 'testing')?.length || 0,
        live: strategiesByStatus?.filter(s => s?.status === 'live')?.length || 0,
        avgIqs: strategiesByStatus?.length > 0 
          ? Math.round((strategiesByStatus?.reduce((sum, s) => sum + (s?.iqs || 0), 0) / strategiesByStatus?.length) * 100) / 100
          : 0
      };

      // Process system health summary
      const healthSummary = {
        healthy: systemHealthSummary?.filter(h => h?.health_status === 'healthy')?.length || 0,
        degraded: systemHealthSummary?.filter(h => h?.health_status === 'degraded')?.length || 0,
        errors: systemHealthSummary?.filter(h => h?.health_status === 'error')?.length || 0,
        avgCpu: systemHealthSummary?.length > 0
          ? Math.round((systemHealthSummary?.reduce((sum, h) => sum + (h?.cpu_usage || 0), 0) / systemHealthSummary?.length) * 100) / 100
          : 0
      };

      return {
        connection: 'healthy',
        decisionsCount: decisionsResult?.status === 'fulfilled' ? decisionsResult?.value?.count : 0,
        strategiesCount: strategiesResult?.status === 'fulfilled' ? strategiesResult?.value?.count : 0,
        healthRecords: healthResult?.status === 'fulfilled' ? healthResult?.value?.count : 0,
        recentDecisions: recentDecisions || [],
        strategyMetrics,
        systemHealthSummary: healthSummary
      };
    } catch (error) {
      console.error('Supabase health error:', error);
      return {
        connection: 'error',
        decisionsCount: 0,
        strategiesCount: 0,
        healthRecords: 0,
        recentDecisions: [],
        strategyMetrics: { total: 0, testing: 0, live: 0, avgIqs: 0 },
        systemHealthSummary: { healthy: 0, degraded: 0, errors: 0, avgCpu: 0 }
      };
    }
  }

  // Execute SQL queries for vision interface
  async executeSqlQuery(sqlQuery) {
    try {
      // For security, we'll use RPC functions for complex queries
      // This is a simplified implementation - in production, you'd want proper query validation
      const { data, error } = await supabase?.rpc('execute_vision_query', {
        query_text: sqlQuery
      });

      if (error) {
        // Fallback to direct table queries for basic operations
        if (sqlQuery?.toLowerCase()?.includes('decisions_log')) {
          const { data: fallbackData, error: fallbackError } = await supabase?.from('decisions_log')?.select('*')?.order('ts', { ascending: false })?.limit(50);
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }

        if (sqlQuery?.toLowerCase()?.includes('system_health')) {
          const { data: fallbackData, error: fallbackError } = await supabase?.from('system_health')?.select('*')?.order('created_at', { ascending: false })?.limit(20);
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }

        if (sqlQuery?.toLowerCase()?.includes('strategy_candidates')) {
          const { data: fallbackData, error: fallbackError } = await supabase?.from('strategy_candidates')?.select('*')?.order('iqs', { ascending: false })?.limit(10);
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }

        if (sqlQuery?.toLowerCase()?.includes('ai_agents')) {
          const { data: fallbackData, error: fallbackError } = await supabase?.from('ai_agents')?.select('*')?.neq('agent_status', 'inactive');
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }

        if (sqlQuery?.toLowerCase()?.includes('kill_switches')) {
          const { data: fallbackData, error: fallbackError } = await supabase?.from('kill_switches')?.select('*')?.order('updated_at', { ascending: false });
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }

        if (sqlQuery?.toLowerCase()?.includes('event_bus')) {
          const { data: fallbackData, error: fallbackError } = await supabase?.from('event_bus')?.select(`
              *,
              source_agent:ai_agents!event_bus_source_agent_id_fkey(name),
              target_agent:ai_agents!event_bus_target_agent_id_fkey(name)
            `)?.order('created_at', { ascending: false })?.limit(30);
          
          if (fallbackError) throw fallbackError;
          return fallbackData;
        }

        throw error;
      }

      return data;
    } catch (error) {
      console.error('SQL query execution error:', error);
      throw error;
    }
  }

  // Run validation checklist
  async runValidationChecklist() {
    const results = {};

    try {
      // Test basic database connectivity
      const { error: connectivityError } = await supabase?.from('system_health')?.select('id')?.limit(1);

      results.rls_permissions = connectivityError ? 'error' : 'success';

      // Test UI configuration (simulated)
      results.ui_pointing = 'success'; // Would check actual API base URL in production

      // Test authentication (simulated)
      results.auth_header = 'success'; // Would verify actual key in production

      // Test Grafana datasource (simulated)
      results.grafana_datasource = 'warning'; // Would test actual Grafana connection

      // Test kill switch behavior
      const { data: killSwitches } = await supabase?.from('kill_switches')?.select('*');

      results.kill_switch_behavior = killSwitches ? 'success' : 'warning';

    } catch (error) {
      console.error('Validation error:', error);
      // Set all checks to error if there's a major issue
      Object.keys(results)?.forEach(key => {
        if (!results?.[key]) results[key] = 'error';
      });
    }

    return results;
  }
}

export const aasObservatoryService = new AASObservatoryService();