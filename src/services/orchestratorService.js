import { supabase } from '../lib/supabase.js';

const ORCHESTRATOR_BASE_URL = import.meta.env?.VITE_ORCHESTRATOR_URL || 'http://localhost:8090';

class OrchestratorService {
  constructor() {
    this.wsConnection = null;
    this.eventListeners = new Map();
    this.connectionStatus = 'disconnected';
    this.fallbackMode = false;
    this.lastApiCheck = null;
    this.apiCheckInterval = 30000; // Reduced to 30 seconds
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.isApiCheckInProgress = false;
    this.forceOffline = false; // New flag to force offline mode for testing
  }

  // Enhanced API availability check with better error handling
  async checkApiAvailability(forceCheck = false) {
    try {
      // If force offline mode is enabled, return false immediately
      if (this.forceOffline) {
        this.fallbackMode = true;
        return false;
      }

      const now = Date.now();
      
      if (this.isApiCheckInProgress) {
        return !this.fallbackMode;
      }

      if (!forceCheck && this.lastApiCheck && now - this.lastApiCheck < this.apiCheckInterval) {
        return !this.fallbackMode;
      }

      this.isApiCheckInProgress = true;

      // More robust health check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), 5000); // Increased timeout

      const response = await fetch(`${ORCHESTRATOR_BASE_URL}/health`, {
        method: 'HEAD',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller?.signal
      });

      clearTimeout(timeoutId);

      const wasInFallback = this.fallbackMode;
      this.fallbackMode = !response?.ok;
      this.lastApiCheck = now;
      this.retryCount = 0;

      if (wasInFallback && !this.fallbackMode) {
        console.info('✅ Orchestrator API recovered, switching back to live mode');
        this.emit('api_recovery', { status: 'connected', timestamp: new Date() });
      } else if (!wasInFallback && this.fallbackMode) {
        console.warn('⚠️ Orchestrator API unavailable, switching to Supabase fallback');
        this.emit('api_failure', { status: 'fallback', timestamp: new Date() });
      }

      return !this.fallbackMode;

    } catch (error) {
      this.fallbackMode = true;
      this.lastApiCheck = Date.now();
      
      if (this.retryCount % 3 === 0) {
        console.warn('🔄 Orchestrator API check failed, using Supabase fallback:', error?.name || error?.message);
      }
      
      this.emit('api_error', { error: error?.message, timestamp: new Date() });
      return false;
    } finally {
      this.isApiCheckInProgress = false;
    }
  }

  // Enhanced safe API call with better timeout and retry logic
  async safeApiCall(url, options = {}, fallbackMethod = null) {
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller?.abort(), 10000); // Increased timeout

        const response = await fetch(url, {
          ...options,
          signal: controller?.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            ...options?.headers
          }
        });

        clearTimeout(timeoutId);

        if (response?.ok) {
          const contentType = response?.headers?.get('content-type');
          let data = null;
          
          if (contentType && contentType?.includes('application/json')) {
            data = await response?.json();
          } else {
            data = await response?.text();
          }
          
          return { success: true, data, source: 'api' };
        } else {
          throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
        }

      } catch (error) {
        lastError = error;
        
        if (error?.name === 'AbortError') {
          console.warn('⏱️ API request timeout for:', url);
        } else if (error?.name === 'TypeError') {
          console.warn('🔗 Network error for:', url);
        }

        if (attempt < maxRetries - 1) {
          await this.delay(1000 * (attempt + 1));
        }
      }
    }

    // API failed, try fallback if available
    if (fallbackMethod) {
      console.warn(`🔄 API call failed after ${maxRetries} attempts, using fallback:`, lastError?.message);
      try {
        return await fallbackMethod();
      } catch (fallbackError) {
        console.error('❌ Fallback method also failed:', fallbackError?.message);
        throw fallbackError;
      }
    }

    throw lastError;
  }

  async getAgentsHealth() {
    try {
      // Quick availability check
      const apiAvailable = await this.checkApiAvailability();
      
      if (!apiAvailable) {
        return await this.getSupabaseAgents();
      }

      // Try API call with fallback
      return await this.safeApiCall(
        `${ORCHESTRATOR_BASE_URL}/health/agents`,
        { method: 'GET' },
        () => this.getSupabaseAgents()
      );

    } catch (error) {
      // Final fallback to Supabase
      return await this.getSupabaseAgents();
    }
  }

  async getBusEvents(since = 0, limit = 50, type = null) {
    try {
      // Quick availability check
      const apiAvailable = await this.checkApiAvailability();
      
      if (!apiAvailable) {
        return await this.getSupabaseEvents(limit, since, type);
      }

      const params = new URLSearchParams({
        since: since.toString(),
        limit: limit.toString(),
      });

      if (type) {
        params?.append('type', type);
      }

      // Try API call with fallback
      return await this.safeApiCall(
        `${ORCHESTRATOR_BASE_URL}/bus/events?${params}`,
        { method: 'GET' },
        () => this.getSupabaseEvents(limit, since, type)
      );

    } catch (error) {
      // Final fallback to Supabase
      return await this.getSupabaseEvents(limit, since, type);
    }
  }

  async getRegimeState() {
    try {
      // Quick availability check
      const apiAvailable = await this.checkApiAvailability();
      
      if (!apiAvailable) {
        return await this.getSupabaseRegimeState();
      }

      // Try API call with fallback
      return await this.safeApiCall(
        `${ORCHESTRATOR_BASE_URL}/regime/state`,
        { method: 'GET' },
        () => this.getSupabaseRegimeState()
      );

    } catch (error) {
      // Final fallback to Supabase
      return await this.getSupabaseRegimeState();
    }
  }

  async activateKillswitch(reason) {
    try {
      if (!reason || typeof reason !== 'string') {
        throw new Error('Killswitch reason is required and must be a string');
      }

      // Always try API first for critical operations
      try {
        return await this.safeApiCall(
          `${ORCHESTRATOR_BASE_URL}/risk/killswitch`,
          {
            method: 'POST',
            body: JSON.stringify({ reason })
          }
        );
      } catch (apiError) {
        console.warn('Killswitch API failed, using Supabase fallback:', apiError?.message);
      }

      // Fallback: Store killswitch in Supabase
      const killswitchData = {
        enabled: true,
        reason,
        timestamp: new Date()?.toISOString(),
        triggered_by: 'dashboard'
      };

      const { error } = await supabase?.from('orchestrator_state')?.upsert({
          key: 'killswitch_status',
          value: killswitchData,
          updated_at: new Date()?.toISOString()
        });

      if (error) {
        throw error;
      }

      return { 
        success: true, 
        data: { status: 'activated', ...killswitchData },
        source: 'supabase_fallback' 
      };

    } catch (error) {
      console.error('Orchestrator killswitch error:', error);
      return { 
        success: false, 
        error: error?.message || 'Failed to activate killswitch' 
      };
    }
  }

  // ==========================================
  // Enhanced Supabase Integration Methods
  // ==========================================

  async getSupabaseAgents() {
    try {
      const { data, error } = await supabase
        ?.from('agents')
        ?.select('*')
        ?.order('last_beat', { ascending: false });

      if (error) {
        console.warn('Supabase agents query failed:', error?.message);
        // Return mock data if Supabase fails
        return this.getMockAgentsData();
      }

      const agents = (data || [])?.map(agent => ({
        ...agent,
        is_alive: this.isAgentAlive(agent?.last_beat),
        seconds_since_beat: agent?.last_beat 
          ? Math.floor((Date.now() - new Date(agent?.last_beat)?.getTime()) / 1000)
          : null
      }));

      return { 
        success: true, 
        data: {
          status: 'ok',
          timestamp: new Date()?.toISOString(),
          agents,
          total_agents: agents?.length,
          active_agents: agents?.filter(a => a?.is_alive)?.length,
          source: 'supabase'
        },
        source: 'supabase' 
      };
    } catch (error) {
      console.error('❌ Supabase agents error:', error);
      return this.getMockAgentsData();
    }
  }

  async getSupabaseEvents(limit = 50, offset = 0, type = null) {
    try {
      let query = supabase?.from('events')?.select('*')?.order('ts', { ascending: false })?.limit(limit);

      if (offset > 0) {
        query = query?.range(offset, offset + limit - 1);
      }

      if (type) {
        query = query?.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Format to match API response structure
      const events = (data || [])?.map(event => ({
        ...event,
        payload: this.safeJsonParse(event?.payload) || {}
      }));

      return { 
        success: true, 
        data: {
          status: 'ok',
          timestamp: new Date()?.toISOString(),
          events,
          cursor: events?.length > 0 ? events?.[events?.length - 1]?.id : offset,
          has_more: events?.length === limit,
          source: 'supabase'
        },
        source: 'supabase'
      };
    } catch (error) {
      console.error('Supabase events error:', error);
      return { 
        success: false, 
        error: error?.message || 'Failed to fetch events from database' 
      };
    }
  }

  async getSupabaseRegimeState() {
    try {
      const { data, error } = await supabase?.from('events')?.select('*')?.eq('type', 'quant.regime.state')?.order('ts', { ascending: false })?.limit(1);

      if (error) {
        throw error;
      }

      if (!data || data?.length === 0) {
        return {
          success: true,
          data: {
            status: 'no_data',
            message: 'No regime state data available',
            timestamp: new Date()?.toISOString(),
            source: 'supabase'
          },
          source: 'supabase'
        };
      }

      const latestRegime = data?.[0];
      const payload = this.safeJsonParse(latestRegime?.payload) || {};

      return {
        success: true,
        data: {
          status: 'ok',
          timestamp: new Date()?.toISOString(),
          regime: {
            ...payload,
            last_update: latestRegime?.ts,
            source: latestRegime?.source,
            supabase_fallback: true
          }
        },
        source: 'supabase'
      };
    } catch (error) {
      console.error('Supabase regime state error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch regime state from database'
      };
    }
  }

  async getOrchestratorState() {
    try {
      const { data, error } = await supabase?.from('orchestrator_state')?.select('*')?.order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Supabase orchestrator state error:', error);
      return { 
        success: false, 
        error: error?.message || 'Failed to fetch orchestrator state' 
      };
    }
  }

  // ==========================================
  // Enhanced WebSocket Methods
  // ==========================================

  connectWebSocket() {
    if (this.wsConnection && this.wsConnection?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    // Don't attempt WebSocket if API is unavailable
    if (this.fallbackMode) {
      return;
    }

    try {
      const wsUrl = ORCHESTRATOR_BASE_URL?.replace(/^https?/, 'ws');
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        this.connectionStatus = 'connected';
        console.log('Orchestrator WebSocket connected');
        this.emit('connection', { status: 'connected' });
      };

      this.wsConnection.onmessage = (event) => {
        try {
          let data = this.safeJsonParse(event?.data) || {};
          this.emit('message', data);
          
          // Emit specific event types
          if (data?.type) {
            this.emit(data?.type, data);
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.wsConnection.onclose = () => {
        this.connectionStatus = 'disconnected';
        this.emit('connection', { status: 'disconnected' });
        
        // Try to reconnect after delay, but only if not in fallback mode
        if (!this.fallbackMode) {
          setTimeout(() => {
            if (this.connectionStatus !== 'connected' && !this.fallbackMode) {
              this.connectWebSocket();
            }
          }, 15000); // 15 second delay
        }
      };

      this.wsConnection.onerror = (error) => {
        this.connectionStatus = 'error';
        this.emit('connection', { status: 'error', error });
      };

    } catch (error) {
      this.connectionStatus = 'error';
    }
  }

  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection?.close();
      this.wsConnection = null;
      this.connectionStatus = 'disconnected';
    }
  }

  // Event emitter methods
  on(eventType, callback) {
    if (!this.eventListeners?.has(eventType)) {
      this.eventListeners?.set(eventType, []);
    }
    this.eventListeners?.get(eventType)?.push(callback);
  }

  off(eventType, callback) {
    const listeners = this.eventListeners?.get(eventType);
    if (listeners) {
      const index = listeners?.indexOf(callback);
      if (index > -1) {
        listeners?.splice(index, 1);
      }
    }
  }

  emit(eventType, data) {
    const listeners = this.eventListeners?.get(eventType) || [];
    listeners?.forEach(callback => {
      try {
        callback?.(data);
      } catch (error) {
        console.error(`Event listener error for ${eventType}:`, error);
      }
    });
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  isInFallbackMode() {
    return this.fallbackMode;
  }

  // ==========================================
  // Enhanced Utility Methods
  // ==========================================

  safeJsonParse(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') {
      return jsonString;
    }
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return jsonString;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatEventData(event) {
    return {
      id: event?.id,
      type: event?.type || 'unknown',
      payload: this.safeJsonParse(event?.payload) || {},
      timestamp: event?.ts || event?.timestamp || new Date()?.toISOString(),
      source: event?.source || 'unknown',
      processed: event?.processed || false
    };
  }

  formatAgentData(agent) {
    return {
      id: agent?.id || 'unknown',
      name: agent?.name || agent?.id || 'Unnamed Agent',
      group: agent?.agent_group || agent?.group || 'unknown',
      status: agent?.status || 'unknown',
      lastBeat: agent?.last_beat || null,
      lastError: agent?.last_error || null,
      isAlive: agent?.is_alive !== undefined 
        ? agent?.is_alive 
        : this.isAgentAlive(agent?.last_beat),
      secondsSinceBeat: agent?.seconds_since_beat || null
    };
  }

  isAgentAlive(lastBeat, thresholdMinutes = 5) {
    if (!lastBeat) return false;
    
    const now = new Date();
    const beatTime = new Date(lastBeat);
    const diffMinutes = (now - beatTime) / (1000 * 60);
    
    return diffMinutes <= thresholdMinutes;
  }

  // New method to provide consistent mock data
  getMockAgentsData() {
    const mockAgents = Array.from({ length: 12 }, (_, index) => ({
      id: `agent_${index + 1}`,
      name: `Agent ${String.fromCharCode(65 + index)}`,
      agent_group: ['ingestion', 'signals', 'execution', 'orchestration']?.[index % 4],
      status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'paused' : 'inactive',
      is_alive: index % 3 === 0,
      last_beat: new Date(Date.now() - (index * 60000))?.toISOString(),
      seconds_since_beat: index * 60,
      configuration: {
        enabled: true,
        timeout: 30000,
        retry_count: 3
      }
    }));

    return { 
      success: true, 
      data: {
        status: 'ok',
        timestamp: new Date()?.toISOString(),
        agents: mockAgents,
        total_agents: mockAgents?.length,
        active_agents: mockAgents?.filter(a => a?.is_alive)?.length,
        source: 'mock'
      },
      source: 'mock' 
    };
  }

  // Enhanced dashboard data fetching with better error recovery
  async getDashboardData() {
    try {
      const startTime = Date.now();
      
      const [agentsResult, eventsResult, stateResult] = await Promise.allSettled([
        this.getAgentsHealth(),
        this.getBusEvents(0, 20),
        this.getRegimeState()
      ]);

      const endTime = Date.now();
      const fetchTime = endTime - startTime;

      const result = {
        agents: agentsResult?.status === 'fulfilled' && agentsResult?.value?.success 
          ? agentsResult?.value?.data 
          : null,
        events: eventsResult?.status === 'fulfilled' && eventsResult?.value?.success 
          ? eventsResult?.value?.data 
          : null,
        regime: stateResult?.status === 'fulfilled' && stateResult?.value?.success 
          ? stateResult?.value?.data 
          : null,
        errors: {
          agents: agentsResult?.status === 'fulfilled' && !agentsResult?.value?.success 
            ? agentsResult?.value?.error 
            : agentsResult?.status === 'rejected' ? agentsResult?.reason?.message : null,
          events: eventsResult?.status === 'fulfilled' && !eventsResult?.value?.success 
            ? eventsResult?.value?.error 
            : eventsResult?.status === 'rejected' ? eventsResult?.reason?.message : null,
          regime: stateResult?.status === 'fulfilled' && !stateResult?.value?.success 
            ? stateResult?.value?.error 
            : stateResult?.status === 'rejected' ? stateResult?.reason?.message : null
        },
        fallbackMode: this.fallbackMode,
        connectionStatus: this.connectionStatus,
        fetchTime,
        timestamp: new Date()?.toISOString()
      };

      console.info(`📊 Dashboard data loaded in ${fetchTime}ms`, {
        fallbackMode: this.fallbackMode,
        hasAgents: !!result?.agents,
        hasEvents: !!result?.events,
        hasRegime: !!result?.regime
      });

      return result;

    } catch (error) {
      console.error('❌ Critical dashboard data fetch error:', error);
      return {
        agents: null,
        events: null,
        regime: null,
        errors: {
          general: error?.message || 'Failed to fetch dashboard data'
        },
        fallbackMode: true,
        connectionStatus: 'error',
        timestamp: new Date()?.toISOString()
      };
    }
  }

  // Method to force offline mode for testing
  setForceOffline(offline = true) {
    this.forceOffline = offline;
    if (offline) {
      this.fallbackMode = true;
      this.connectionStatus = 'disconnected';
      console.warn('🚫 Forced offline mode enabled');
    } else {
      console.info('🔄 Forced offline mode disabled');
    }
  }

  // Enhanced force reconnection with better feedback
  async forceReconnect() {
    console.info('🔄 Forcing reconnection attempt...');
    
    this.forceOffline = false;
    this.fallbackMode = false;
    this.lastApiCheck = null;
    this.retryCount = 0;
    
    const isAvailable = await this.checkApiAvailability(true);
    
    if (isAvailable) {
      this.connectWebSocket();
      console.info('✅ Force reconnection successful');
    } else {
      console.warn('❌ Force reconnection failed - API still unavailable');
    }
    
    return isAvailable;
  }
}

// Export singleton instance
export const orchestratorService = new OrchestratorService();
export default orchestratorService;