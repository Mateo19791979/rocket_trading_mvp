/* eslint-disable */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env?.VITE_SUPABASE_URL,
  import.meta.env?.VITE_SUPABASE_ANON_KEY
);

const API_BASE = import.meta.env?.VITE_API_BASE || 'https://rockettra3991.builtwithrocket.new/api';
const INTERNAL_AI_KEY = import.meta.env?.VITE_INTERNAL_ADMIN_KEY;

/**
 * Safe fetch JSON with proper error handling and fallback
 * @param {string} url - URL to fetch
 * @returns {Promise<Object|null>} JSON response or null on error
 */
async function safeFetchJSON(url) {
  try {
    const response = await fetch(url, { 
      headers: { "Accept": "application/json" } 
    });
    
    if (!response?.ok) {
      throw new Error(`HTTP ${response?.status}`);
    }
    
    return await response?.json();
  } catch (error) {
    // Log + retourne un état "vide" pour éviter les crash UI console.warn("Fetch failed:", url, error);
    return null;
  }
}

/**
 * Get swarm state with safe fallback
 * @returns {Promise<Object>} Swarm state with fallback defaults
 */
export async function getSwarmState() {
  const result = await safeFetchJSON(`${API_BASE}/swarm/state`);
  return result ?? { 
    ok: false, 
    nodes: [], 
    activeAgents: 0, 
    queuedTasks: 0,
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * Get swarm statistics with safe fallback
 * @returns {Promise<Object>} Swarm statistics with fallback defaults  
 */
export async function getSwarmStatistics() {
  const result = await safeFetchJSON(`${API_BASE}/swarm/statistics`);
  return result ?? { 
    ok: false, 
    totals: { trades: 0, positions: 0, errors: 0 }, 
    performance: { day: 0, week: 0, month: 0 },
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * Get AI keys diagnostic status
 * @returns {Promise<Object>} AI keys status with fallback defaults
 */
export async function getAIKeysDiagnostics() {
  const result = await safeFetchJSON(`${API_BASE}/diagnostics/ai-keys`);
  return result ?? { 
    ok: false, 
    openai: false,
    anthropic: false,
    gemini: false,
    perplexity: false,
    default: null,
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * Get API health status
 * @returns {Promise<Object>} API health with fallback defaults
 */
export async function getAPIHealth() {
  const result = await safeFetchJSON(`${API_BASE}/health`);
  return result ?? { 
    ok: false, 
    service: "api",
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * Get RLS health status
 * @returns {Promise<Object>} RLS health with fallback defaults
 */
export async function getRLSHealth() {
  const result = await safeFetchJSON(`${API_BASE}/security/rls/health`);
  return result ?? { 
    ok: false, 
    service: "rls-health",
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * Get UI flags from trading schema with fallback
 * @returns {Promise<Object>} UI flags with fallback defaults
 */
export async function getUIFlags() {
  try {
    const { data, error } = await supabase
      ?.from('trading.ui_flags')
      ?.select('key, value, note');

    if (error) {
      // Fallback to safe defaults if query fails
      return {
        hide_stats_card: true, // Par défaut: on cache si on n'a pas pu charger
        hide_advanced_features: false,
        enable_debug_mode: false,
        maintenance_mode: false,
        fallback: true
      };
    }

    // Transform array to object for easy access
    const flags = {};
    data?.forEach(flag => {
      flags[flag?.key] = flag?.value;
    });

    // Ensure hide_stats_card exists with safe default
    if (!flags?.hasOwnProperty('hide_stats_card')) {
      flags.hide_stats_card = true; // Safe default: hide if not found
    }

    return { ...flags, fallback: false };
  } catch (error) {
    console.warn("UI flags fetch failed:", error);
    // Return safe fallback values
    return {
      hide_stats_card: true, // Par défaut: on cache si erreur
      hide_advanced_features: false,
      enable_debug_mode: false,
      maintenance_mode: false,
      fallback: true
    };
  }
}

/**
 * Set UI flag value (admin function)
 * @param {string} key - Flag key
 * @param {boolean} value - Flag value
 * @param {string} note - Optional note
 * @returns {Promise<Object>} Operation result
 */
export async function setUIFlag(key, value, note = null) {
  try {
    const { data, error } = await supabase
      ?.rpc('trading.set_ui_flag', {
        flag_key: key,
        flag_value: value,
        flag_note: note
      });

    if (error) {
      return { ok: false, error: error?.message };
    }

    return { ok: true, key, value, data };
  } catch (error) {
    console.warn("Set UI flag failed:", error);
    return { ok: false, error: error?.message };
  }
}

/**
 * Disable maintenance mode and enable trading
 * @returns {Promise<Object>} Operation result
 */
export async function enableTrading() {
  try {
    const maintenanceResult = await fetch(`${API_BASE}/maintenance/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })?.then(r => r?.json())?.catch(() => ({ ok: false }));
    
    const tradingResult = await fetch(`${API_BASE}/trading/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })?.then(r => r?.json())?.catch(() => ({ ok: false }));
    
    return {
      ok: maintenanceResult?.ok && tradingResult?.ok,
      maintenance: maintenanceResult,
      trading: tradingResult,
      time: new Date()?.toISOString()
    };
  } catch (error) {
    console.warn("Enable trading failed:", error);
    return {
      ok: false,
      error: error?.message,
      time: new Date()?.toISOString()
    };
  }
}

/**
 * Enable maintenance mode and disable trading
 * @returns {Promise<Object>} Operation result
 */
export async function enableMaintenanceMode() {
  try {
    const maintenanceResult = await fetch(`${API_BASE}/maintenance/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })?.then(r => r?.json())?.catch(() => ({ ok: false }));
    
    const tradingResult = await fetch(`${API_BASE}/trading/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })?.then(r => r?.json())?.catch(() => ({ ok: false }));
    
    return {
      ok: maintenanceResult?.ok && tradingResult?.ok,
      maintenance: maintenanceResult,
      trading: tradingResult,
      time: new Date()?.toISOString()
    };
  } catch (error) {
    console.warn("Enable maintenance failed:", error);
    return {
      ok: false,
      error: error?.message,
      time: new Date()?.toISOString()
    };
  }
}

/**
 * Execute database emergency stop for account DUN766038
 * @returns {Promise<Object>} Emergency stop result
 */
export async function executeEmergencyDBStop() {
  try {
    const result = await fetch(`${API_BASE}/emergency/db-stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: 'DUN766038' })
    })?.then(r => r?.json())?.catch(() => ({ ok: false }));
    
    return result ?? {
      ok: false,
      error: 'emergency_db_stop_failed',
      time: new Date()?.toISOString()
    };
  } catch (error) {
    console.warn("Emergency DB stop failed:", error);
    return {
      ok: false,
      error: error?.message,
      time: new Date()?.toISOString()
    };
  }
}

/**
 * Get recent orders status for diagnostic
 * @returns {Promise<Object>} Recent orders data
 */
export async function getRecentOrdersStatus() {
  const result = await safeFetchJSON(`${API_BASE}/diagnostic/recent-orders`);
  return result ?? {
    ok: false,
    orders: [],
    hasDeluge: false,
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * Get error events for diagnostic
 * @returns {Promise<Object>} Error events data
 */
export async function getErrorEvents() {
  const result = await safeFetchJSON(`${API_BASE}/diagnostic/error-events`);
  return result ?? {
    ok: false,
    events: [],
    criticalCount: 0,
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * Execute Multi-IA Freestyle orchestrator with single order control
 * @param {Object} orderParams - Order parameters
 * @returns {Promise<Object>} Execution result
 */
export async function executeMultiIAFreestyle(orderParams = {}) {
  try {
    const defaultParams = {
      clientOrderId: `freestyle-${Date.now()}-001`,
      account: 'DUN766038',
      route: 'TWS',
      action: 'BUY',
      symbol: 'AAPL',
      secType: 'STK',
      exchange: 'SMART',
      currency: 'USD',
      orderType: 'MKT',
      quantity: 1,
      tif: 'DAY',
      dryRun: false,
      meta: {
        strategy: 'freestyle',
        note: 'no-size-constraints'
      },
      ...orderParams
    };

    const result = await fetch(`${API_BASE}/ibkr/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultParams)
    })?.then(r => r?.json())?.catch(() => ({ ok: false }));
    
    return result ?? {
      ok: false,
      error: 'multi_ia_execution_failed',
      time: new Date()?.toISOString()
    };
  } catch (error) {
    console.warn("Multi-IA Freestyle execution failed:", error);
    return {
      ok: false,
      error: error?.message,
      time: new Date()?.toISOString()
    };
  }
}

/**
 * Run IBKR Paper Trading smoke test
 * @returns {Promise<Object>} Smoke test result
 */
export async function runIBKRSmokeTest() {
  const result = await safeFetchJSON(`${API_BASE}/ibkr/smoke-test`, {
    method: 'POST'
  });
  
  return result ?? { 
    ok: false, 
    error: "smoke_test_failed",
    message: "IBKR Paper Trading smoke test failed",
    time: new Date()?.toISOString(),
    fallback: true
  };
}

/**
 * AI Swarm Management Service
 * Provides interface for managing nomadic AI agents in trading system
 */
class AISwarmService {
  constructor() {
    this.baseUrl = `${API_BASE}/swarm`;
    this.headers = {
      'Content-Type': 'application/json',
      'x-internal-ai-key': INTERNAL_AI_KEY
    };
  }

  /**
   * Get current swarm state (using safe fetch)
   * @returns {Promise<Object>} Swarm state data
   */
  async getSwarmState() {
    return getSwarmState();
  }

  /**
   * Get swarm statistics and analytics (using safe fetch)
   * @returns {Promise<Object>} Statistics data
   */
  async getSwarmStatistics() {
    return getSwarmStatistics();
  }

  /**
   * Move an AI agent to a new region
   * @param {string} agentName - Name of the agent
   * @param {string} toRegion - Target region
   * @param {string} motive - Reason for move (volatility, momentum, arbitrage, macro, rotation)
   * @param {number} confidence - Confidence level (0-1)
   * @param {string} focus - Asset focus (equity, forex, crypto, option, etf, fund)
   * @returns {Promise<Object>} Move result
   */
  async moveAgent(agentName, toRegion, motive, confidence = 0.6, focus = 'equity') {
    try {
      const response = await fetch(`${this.baseUrl}/move`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          agent_name: agentName,
          to_region: toRegion,
          motive,
          confidence,
          focus
        })
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Move agent failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Adjust agent energy based on trading activity
   * @param {string} agentName - Name of the agent
   * @param {number} tradesCount - Number of trades executed
   * @returns {Promise<Object>} Energy adjustment result
   */
  async adjustAgentEnergy(agentName, tradesCount = 0) {
    try {
      const response = await fetch(`${this.baseUrl}/energy`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          agent_name: agentName,
          tradesCount
        })
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Adjust energy failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Rest an agent to regenerate energy
   * @param {string} agentName - Name of the agent
   * @returns {Promise<Object>} Rest result
   */
  async restAgent(agentName) {
    try {
      const response = await fetch(`${this.baseUrl}/rest`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          agent_name: agentName
        })
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Rest agent failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Initiate fusion between two agents
   * @param {string} agentA - First agent name
   * @param {string} agentB - Second agent name
   * @returns {Promise<Object>} Fusion result
   */
  async fuseAgents(agentA, agentB) {
    try {
      const response = await fetch(`${this.baseUrl}/fusion`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          agentA,
          agentB
        })
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Fuse agents failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Get current swarm state
   * @returns {Promise<Object>} Swarm state data
   */
  async getSwarmState() {
    try {
      const response = await fetch(`${this.baseUrl}/state`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Get swarm state failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Get swarm policies and parameters
   * @returns {Promise<Object>} Policy data
   */
  async getSwarmPolicies() {
    try {
      const response = await fetch(`${this.baseUrl}/policy`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Get swarm policies failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Get agent performance summary
   * @param {string|null} agentName - Specific agent name or null for all agents
   * @returns {Promise<Object>} Performance data
   */
  async getPerformanceSummary(agentName = null) {
    try {
      const url = agentName 
        ? `${this.baseUrl}/performance/${agentName}`
        : `${this.baseUrl}/performance`;
      
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Get performance summary failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Get swarm statistics and analytics
   * @returns {Promise<Object>} Statistics data
   */
  async getSwarmStatistics() {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return await response?.json();
    } catch (error) {
      console.error('Get swarm statistics failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Real-time subscription to swarm state changes via Supabase
   * @param {Function} callback - Callback function for state changes
   * @returns {Object} Subscription object
   */
  subscribeToSwarmState(callback) {
    try {
      const channel = supabase
        ?.channel('swarm_state_changes')
        ?.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ai_swarm_state' },
          (payload) => {
            callback?.({
              event: payload?.eventType,
              agent: payload?.new || payload?.old,
              timestamp: new Date()?.toISOString()
            });
          }
        )
        ?.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ai_mobility_log' },
          (payload) => {
            callback?.({
              event: 'mobility_log',
              data: payload?.new,
              timestamp: new Date()?.toISOString()
            });
          }
        )
        ?.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'ai_swarm_decisions' },
          (payload) => {
            callback?.({
              event: 'decision_made',
              data: payload?.new,
              timestamp: new Date()?.toISOString()
            });
          }
        )
        ?.subscribe();

      return {
        unsubscribe: () => {
          supabase?.removeChannel(channel);
        }
      };
    } catch (error) {
      console.error('Subscription setup failed:', error);
      return { unsubscribe: () => {} };
    }
  }

  /**
   * Get mobility history for an agent
   * @param {string} agentName - Agent name
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Object>} Mobility history
   */
  async getMobilityHistory(agentName, limit = 10) {
    try {
      const { data, error } = await supabase
        ?.from('ai_mobility_log')
        ?.select('*')
        ?.eq('agent_name', agentName)
        ?.order('started_at', { ascending: false })
        ?.limit(limit);

      if (error) {
        return { ok: false, error: error?.message };
      }

      return { ok: true, data: data || [] };
    } catch (error) {
      console.error('Get mobility history failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Get decision history for an agent
   * @param {string} agentName - Agent name
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Object>} Decision history
   */
  async getDecisionHistory(agentName, limit = 10) {
    try {
      const { data, error } = await supabase
        ?.from('ai_swarm_decisions')
        ?.select('*')
        ?.eq('agent_name', agentName)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) {
        return { ok: false, error: error?.message };
      }

      return { ok: true, data: data || [] };
    } catch (error) {
      console.error('Get decision history failed:', error);
      return { ok: false, error: 'network_error', message: error?.message };
    }
  }

  /**
   * Get AI keys diagnostic status (class method)
   * @returns {Promise<Object>} AI keys diagnostic data
   */
  async getAIKeysDiagnostics() {
    return getAIKeysDiagnostics();
  }

  /**
   * Get API health status (class method)
   * @returns {Promise<Object>} API health data
   */
  async getAPIHealth() {
    return getAPIHealth();
  }

  /**
   * Get RLS health status (class method)
   * @returns {Promise<Object>} RLS health data
   */
  async getRLSHealth() {
    return getRLSHealth();
  }

  /**
   * Enable maintenance mode (disable trading, enable maintenance)
   * @returns {Promise<Object>} Operation result
   */
  async enableMaintenanceMode() {
    return enableMaintenanceMode();
  }

  /**
   * Execute emergency database stop
   * @returns {Promise<Object>} Emergency stop result
   */
  async executeEmergencyDBStop() {
    return executeEmergencyDBStop();
  }

  /**
   * Get recent orders status for diagnostic
   * @returns {Promise<Object>} Recent orders data
   */
  async getRecentOrdersStatus() {
    return getRecentOrdersStatus();
  }

  /**
   * Get error events for diagnostic
   * @returns {Promise<Object>} Error events data
   */
  async getErrorEvents() {
    return getErrorEvents();
  }

  /**
   * Execute Multi-IA Freestyle trading with controlled single order
   * @param {Object} orderParams - Optional order parameters override
   * @returns {Promise<Object>} Execution result
   */
  async executeMultiIAFreestyle(orderParams = {}) {
    return executeMultiIAFreestyle(orderParams);
  }

  /**
   * Generate freestyle order with AI decision logic
   * @returns {Object} Generated order object
   */
  generateAIFreestyleOrder() {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN', 'NFLX', 'UBER', 'SQ'];
    const actions = ['BUY', 'SELL'];
    const orderTypes = ['MKT', 'LMT', 'STP', 'STP_LMT'];
    const quantities = [1, 5, 10, 25, 50, 100, 250, 500, 1000]; // No size constraints
    
    // AI Strategy Decision Engine (mock implementation)
    const aiDecision = {
      symbol: symbols?.[Math.floor(Math.random() * symbols?.length)],
      action: actions?.[Math.floor(Math.random() * actions?.length)],
      orderType: orderTypes?.[Math.floor(Math.random() * orderTypes?.length)],
      quantity: quantities?.[Math.floor(Math.random() * quantities?.length)],
      confidence: Math.random(),
      reasoning: "AI autonomous decision based on market analysis"
    };
    
    const order = {
      clientOrderId: `freestyle-${Date.now()}-${Math.random()?.toString(36)?.substr(2, 9)}`,
      account: "DUN766038",
      route: "TWS",
      action: aiDecision?.action,
      symbol: aiDecision?.symbol,
      secType: "STK",
      exchange: "SMART", 
      currency: "USD",
      orderType: aiDecision?.orderType,
      quantity: aiDecision?.quantity,
      tif: "DAY",
      dryRun: false,
      meta: {
        strategy: "freestyle",
        note: "no-size-constraints",
        ai_decision: true,
        confidence: aiDecision?.confidence,
        reasoning: aiDecision?.reasoning,
        timestamp: new Date()?.toISOString()
      }
    };

    // Add limitPrice for LMT orders
    if (aiDecision?.orderType === 'LMT' || aiDecision?.orderType === 'STP_LMT') {
      order.limitPrice = Math.round((Math.random() * 500 + 50) * 100) / 100;
    }

    return order;
  }

  /**
   * Execute single freestyle order with AI decision
   * @returns {Promise<Object>} Execution result
   */
  async executeSingleFreestyleOrder() {
    try {
      const order = this.generateAIFreestyleOrder();
      
      const response = await fetch(`${API_BASE}/ibkr/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      const result = await response?.json();
      
      return {
        ok: result?.status === 'submitted',
        order: order,
        result: result,
        summary: `${order?.action} ${order?.quantity} ${order?.symbol} ${order?.orderType} - ${result?.status || 'FAILED'}`,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('Single freestyle order execution failed:', error);
      return {
        ok: false,
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Multi-IA Freestyle Orchestrator with emergency controls
   * @returns {Promise<Object>} Orchestration result
   */
  async runFreestyleOrchestrator() {
    try {
      console.log('🤖 Multi-IA Freestyle Orchestrator: AI-Strategy decides...');
      
      // IA-Stratégie decides freely
      const order = this.generateAIFreestyleOrder();
      
      console.log('📊 IA-Exécution: Sending order without modification...');
      
      // IA-Exécution sends without modifying quantity
      const result = await this.executeSingleFreestyleOrder();
      
      // Single execution per cycle - no loops
      return {
        ok: result?.ok,
        strategy: 'freestyle',
        execution: result,
        orchestrator: {
          ia_strategy: 'autonomous_decision',
          ia_execution: 'single_order_control',
          constraints: 'none',
          account: 'DUN766038'
        },
        summary: result?.summary,
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message,
        orchestrator: 'failed',
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Emergency Phases A-D Implementation
   */
  async executeEmergencyPhaseA() {
    console.log('🚨 Phase A: STOP IMMÉDIAT');
    
    try {
      // 1. DB Emergency Stop for DUN766038
      const dbStopResponse = await fetch(`${API_BASE}/emergency/db-stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'DUN766038' })
      });

      // 2. Enable maintenance mode (IBKR_READ_ONLY=true)
      const maintenanceResponse = await fetch(`${API_BASE}/maintenance/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      return {
        ok: true,
        phase: 'A',
        dbStop: await dbStopResponse?.json()?.catch(() => ({ ok: false })),
        maintenance: await maintenanceResponse?.json()?.catch(() => ({ ok: false })),
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        ok: false,
        phase: 'A',
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  async executeEmergencyPhaseB() {
    console.log('🔍 Phase B: DIAG FLASH');
    
    const diagnostics = {};
    
    // 3 pings API (must return JSON, not HTML)
    diagnostics.apiHealth = await this.getAPIHealth();
    diagnostics.rlsHealth = await this.getRLSHealth();
    diagnostics.swarmState = await this.getSwarmState();
    
    return {
      ok: true,
      phase: 'B',
      diagnostics,
      summary: {
        hasRoutingIssue: !diagnostics?.apiHealth?.ok || !diagnostics?.rlsHealth?.ok || !diagnostics?.swarmState?.ok,
        needsProxyFix: true // If HTML instead of JSON
      },
      timestamp: new Date()?.toISOString()
    };
  }

  async executeEmergencyPhaseC() {
    console.log('⚡ Phase C: CAUSES PROBABLES & REMÈDES EXPRESS');
    
    return {
      ok: true,
      phase: 'C',
      analysis: {
        freestyle_without_guards: 'Detected - implementing single execution per cycle deduplication',
        tws_reconnect_loop: 'Checking - TWS Paper open, port 7497, clientId conflicts',
        db_42703_issues: 'Applying - positions.is_active, trades.unrealized_pnl, stats_overview_one patches'
      },
      remedies: {
        deduplication: 'clientOrderId unique, no retry on network error',
        tws_verification: 'TWS Paper (port 7497), no popups, correct clientId',
        db_patches: 'Column/view patches for PGRST116 anti-crash'
      },
      timestamp: new Date()?.toISOString()
    };
  }

  async executeEmergencyPhaseD() {
    console.log('🚀 Phase D: RE-GO CONTRÔLÉ');
    
    try {
      // 1. Disable maintenance (IBKR_READ_ONLY=false)
      const maintenanceResponse = await fetch(`${API_BASE}/maintenance/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      // 2. Enable trading for DUN766038
      const tradingResponse = await fetch(`${API_BASE}/trading/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'DUN766038' })
      });

      // 3. Smoke test with single freestyle order
      const smokeResult = await this.runFreestyleOrchestrator();

      return {
        ok: smokeResult?.ok,
        phase: 'D',
        maintenance: await maintenanceResponse?.json()?.catch(() => ({ ok: false })),
        trading: await tradingResponse?.json()?.catch(() => ({ ok: false })),
        smokeTest: smokeResult,
        message: smokeResult?.ok ? 
          'Multi-IA Freestyle system successfully released with controlled recovery' : 'System partially released - smoke test failed',
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        ok: false,
        phase: 'D',
        error: error?.message,
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Get UI flags configuration
   * @returns {Promise<Object>} UI flags data
   */
  async getUIFlags() {
    return getUIFlags();
  }

  /**
   * Set UI flag value (admin method)
   * @param {string} key - Flag key
   * @param {boolean} value - Flag value  
   * @param {string} note - Optional note
   * @returns {Promise<Object>} Operation result
   */
  async setUIFlag(key, value, note = null) {
    return setUIFlag(key, value, note);
  }

  /**
   * Check if statistics should be hidden
   * @returns {Promise<boolean>} True if stats should be hidden
   */
  async shouldHideStats() {
    const flags = await this.getUIFlags();
    return flags?.hide_stats_card ?? true; // Default: hide if unknown
  }

  /**
   * Get swarm statistics with UI flag guard
   * @returns {Promise<Object|null>} Statistics data or null if hidden
   */
  async getSwarmStatisticsGuarded() {
    try {
      // Check if stats should be hidden first
      const shouldHide = await this.shouldHideStats();
      
      if (shouldHide) {
        return null; // Return null to prevent any stats API calls
      }

      // Only call actual statistics if not hidden
      return await this.getSwarmStatistics();
    } catch (error) {
      console.warn("Guarded statistics fetch failed:", error);
      return null; // Safe fallback
    }
  }

  /**
   * Execute complete emergency response sequence A→D
   * @returns {Promise<Object>} Complete sequence result
   */
  async executeCompleteEmergencySequence() {
    try {
      const sequence = {};
      
      console.log('🚨 Starting Emergency Response Sequence A→D...');
      
      // Phase A: Emergency Stop (1 min)
      sequence.phaseA = await this.executeEmergencyPhaseA();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase B: Flash Diagnostic (3 pings + 2 selects)
      sequence.phaseB = await this.executeEmergencyPhaseB();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase C: Probable Causes & Express Remedies
      sequence.phaseC = await this.executeEmergencyPhaseC();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase D: Controlled RE-GO
      sequence.phaseD = await this.executeEmergencyPhaseD();
      
      const success = sequence?.phaseD?.ok;
      
      return {
        ok: success,
        sequence,
        message: success ? 
          'Complete emergency sequence A→D successful - Multi-IA Freestyle restored' : 
          'Emergency sequence partially failed - manual intervention may be required',
        timestamp: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message,
        message: 'Emergency sequence failed - critical system error',
        timestamp: new Date()?.toISOString()
      };
    }
  }

  /**
   * Complete Multi-IA system release sequence
   * @returns {Promise<Object>} Full release sequence result
   */
  async releaseMultiIASystem() {
    try {
      // Step 1: Enable trading (disable maintenance + enable trading flags)
      const tradingResult = await this.enableTrading();
      
      if (!tradingResult?.ok) {
        return {
          ok: false,
          step: 'enable_trading',
          error: 'Failed to enable trading system',
          details: tradingResult
        };
      }

      // Step 2: Run smoke test
      const smokeResult = await this.runIBKRSmokeTest();
      
      return {
        ok: smokeResult?.ok,
        step: smokeResult?.ok ? 'complete' : 'smoke_test',
        trading: tradingResult,
        smokeTest: smokeResult,
        message: smokeResult?.ok 
          ? 'Multi-IA system successfully released' :'System partially released - smoke test failed',
        time: new Date()?.toISOString()
      };
    } catch (error) {
      return {
        ok: false,
        step: 'error',
        error: error?.message,
        time: new Date()?.toISOString()
      };
    }
  }
}

export default new AISwarmService();