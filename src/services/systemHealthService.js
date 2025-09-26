import { supabase } from '../lib/supabase';

export const systemHealthService = {
  // Get overall system health overview
  async getSystemHealth() {
    try {
      const [agentsHealth, apiStatus, marketStatus] = await Promise.allSettled([
        this.getAgentsHealth(),
        this.getApiProvidersStatus(),
        this.getMarketStatus()
      ]);

      // Calculate API latency (mock for now)
      const apiLatency = Math.floor(Math.random() * 100) + 50;
      
      // Count active connections (mock)
      const activeConnections = Math.floor(Math.random() * 50) + 20;
      
      // Data freshness in seconds
      const dataFreshness = await this.getDataFreshness();

      return {
        apiLatency,
        activeConnections,
        dataFreshness,
        agents: agentsHealth?.status === 'fulfilled' ? agentsHealth?.value : [],
        dataProviders: apiStatus?.status === 'fulfilled' ? apiStatus?.value : [],
        marketStatus: marketStatus?.status === 'fulfilled' ? marketStatus?.value : null,
        overallStatus: this.calculateOverallStatus(agentsHealth?.value, apiStatus?.value),
        lastUpdate: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('System health check failed:', error?.message);
      return {
        apiLatency: 999,
        activeConnections: 0,
        dataFreshness: 999,
        agents: [],
        dataProviders: [],
        marketStatus: null,
        overallStatus: 'offline',
        error: error?.message,
        lastUpdate: new Date()?.toISOString()
      };
    }
  },

  // Get health status of all AI agents
  async getAgentsHealth() {
    try {
      const { data, error } = await supabase
        ?.from('system_health')
        ?.select(`
          *,
          agent:ai_agents!inner (
            id,
            name,
            agent_group,
            agent_status
          )
        `)
        ?.order('last_heartbeat', { ascending: false });

      if (error) throw error;

      return data?.map(health => ({
        id: health?.agent?.id,
        name: health?.agent?.name,
        group: health?.agent?.agent_group,
        status: this.mapHealthStatus(health?.health_status),
        lastHeartbeat: health?.last_heartbeat,
        cpuUsage: health?.cpu_usage,
        memoryUsage: health?.memory_usage,
        errorCount: health?.error_count,
        warningCount: health?.warning_count,
        uptime: health?.uptime_seconds
      })) || [];
    } catch (error) {
      throw error;
    }
  },

  // Get API providers status
  async getApiProvidersStatus() {
    try {
      const { data, error } = await supabase
        ?.from('external_api_configs')
        ?.select('*')
        ?.eq('is_active', true);

      if (error) throw error;

      return data?.map(provider => ({
        name: this.formatApiName(provider?.api_name),
        status: provider?.is_active ? 'online' : 'offline',
        lastCall: provider?.last_successful_call,
        rateLimitPerMinute: provider?.rate_limit_per_minute,
        callsToday: provider?.total_calls_today,
        uptime: this.calculateUptime(provider?.last_successful_call)
      })) || [];
    } catch (error) {
      throw error;
    }
  },

  // Get market status
  async getMarketStatus() {
    try {
      const { data, error } = await supabase
        ?.rpc('get_market_status');

      if (error) throw error;

      return {
        isOpen: data?.[0]?.is_open || false,
        status: data?.[0]?.is_open ? 'OPEN' : 'CLOSED',
        nextEvent: data?.[0]?.next_event,
        timezone: 'America/New_York'
      };
    } catch (error) {
      // Fallback market status
      const now = new Date();
      const hour = now?.getHours();
      const isWeekend = now?.getDay() === 0 || now?.getDay() === 6;
      
      return {
        isOpen: !isWeekend && hour >= 9 && hour < 16,
        status: isWeekend ? 'CLOSED' : (hour >= 9 && hour < 16 ? 'OPEN' : 'CLOSED'),
        nextEvent: null,
        timezone: 'UTC',
        source: 'fallback'
      };
    }
  },

  // Get data freshness in seconds
  async getDataFreshness() {
    try {
      const { data, error } = await supabase
        ?.from('market_data')
        ?.select('last_updated')
        ?.order('last_updated', { ascending: false })
        ?.limit(1)
        ?.single();

      if (error || !data) return 300; // 5 minutes default

      const lastUpdate = new Date(data?.last_updated);
      const now = new Date();
      const diffInSeconds = Math.floor((now - lastUpdate) / 1000);

      return Math.max(0, diffInSeconds);
    } catch (error) {
      return 300; // 5 minutes fallback
    }
  },

  // Get event bus activity
  async getEventBusActivity(limit = 50) {
    try {
      const { data, error } = await supabase
        ?.from('event_bus')
        ?.select(`
          *,
          source_agent:ai_agents!source_agent_id (name),
          target_agent:ai_agents!target_agent_id (name)
        `)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;

      return data?.map(event => ({
        id: event?.id,
        type: event?.event_type,
        priority: event?.priority,
        sourceAgent: event?.source_agent?.name || 'System',
        targetAgent: event?.target_agent?.name || 'Broadcast',
        data: event?.event_data,
        isProcessed: event?.is_processed,
        createdAt: event?.created_at,
        processedAt: event?.processed_at
      })) || [];
    } catch (error) {
      throw error;
    }
  },

  // Update agent health
  async updateAgentHealth(agentId, healthData) {
    try {
      const { data, error } = await supabase
        ?.from('system_health')
        ?.upsert({
          agent_id: agentId,
          health_status: healthData?.status || 'healthy',
          cpu_usage: healthData?.cpuUsage,
          memory_usage: healthData?.memoryUsage,
          error_count: healthData?.errorCount || 0,
          warning_count: healthData?.warningCount || 0,
          last_heartbeat: new Date()?.toISOString(),
          metrics: healthData?.metrics || {}
        })
        ?.select()
        ?.single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Helper methods
  mapHealthStatus(status) {
    switch (status) {
      case 'healthy':
        return 'online';
      case 'warning':
        return 'degraded';
      case 'error':
        return 'offline';
      default:
        return 'unknown';
    }
  },

  formatApiName(apiName) {
    switch (apiName) {
      case 'yahoo_finance':
        return 'Yahoo Finance';
      case 'alpha_vantage':
        return 'Alpha Vantage';
      case 'polygon':
        return 'Polygon.io';
      default:
        return apiName?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase());
    }
  },

  calculateUptime(lastSuccessfulCall) {
    if (!lastSuccessfulCall) return 0;
    
    const lastCall = new Date(lastSuccessfulCall);
    const now = new Date();
    const daysSince = (now - lastCall) / (1000 * 60 * 60 * 24);
    
    // Simple uptime calculation - could be more sophisticated
    return Math.max(0, Math.min(100, 100 - daysSince * 5));
  },

  calculateOverallStatus(agents, providers) {
    if (!agents?.length && !providers?.length) return 'offline';
    
    const allSystems = [...(agents || []), ...(providers || [])];
    const onlineCount = allSystems?.filter(s => s?.status === 'online')?.length;
    const totalCount = allSystems?.length;
    
    if (onlineCount === totalCount) return 'online';
    if (onlineCount > totalCount * 0.7) return 'degraded';
    return 'offline';
  }
};