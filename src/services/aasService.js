import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env?.VITE_API_BASE_URL || '';
const INTERNAL_KEY = import.meta.env?.VITE_INTERNAL_ADMIN_KEY || '';

class AASService {
  // =====================================================================================
  // HEALTH SENTINEL
  // =====================================================================================

  async computeSystemHealth() {
    try {
      const response = await fetch(`${API_BASE}/aas/health/compute`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          "x-internal-key": INTERNAL_KEY 
        }
      });
      
      if (!response?.ok) {
        throw new Error(`Health computation failed: ${response.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      return { 
        ok: false, 
        error: error?.message,
        mode: 'critical',
        dhi_avg: 0,
        errors_1h: 0
      };
    }
  }

  // =====================================================================================
  // REGIME STATE MANAGEMENT
  // =====================================================================================

  async getLatestRegimeState() {
    try {
      const response = await fetch(`${API_BASE}/aas/regime/latest`, {
        method: "GET",
        headers: { "x-internal-key": INTERNAL_KEY }
      });
      
      if (!response?.ok) {
        throw new Error(`Regime fetch failed: ${response.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      return { ok: false, error: error?.message, data: null };
    }
  }

  async setRegimeState(regime, confidence, drivers = {}) {
    try {
      const response = await fetch(`${API_BASE}/aas/regime/set`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          "x-internal-key": INTERNAL_KEY 
        },
        body: JSON.stringify({ regime, confidence, drivers })
      });
      
      if (!response?.ok) {
        throw new Error(`Regime set failed: ${response.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  }

  // =====================================================================================
  // STRATEGY BREEDING
  // =====================================================================================

  async breedStrategies(populationSize = 20) {
    try {
      const response = await fetch(`${API_BASE}/aas/breed`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          "x-internal-key": INTERNAL_KEY 
        },
        body: JSON.stringify({ k: populationSize })
      });
      
      if (!response?.ok) {
        throw new Error(`Breeding failed: ${response.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      return { created: 0, notes: `Breeding failed: ${error?.message}` };
    }
  }

  async runNaturalSelection(minIQS = 0.75) {
    try {
      const response = await fetch(`${API_BASE}/aas/selection`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          "x-internal-key": INTERNAL_KEY 
        },
        body: JSON.stringify({ minIQS })
      });
      
      if (!response?.ok) {
        throw new Error(`Selection failed: ${response.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      return { updated: 0, notes: `Selection failed: ${error?.message}` };
    }
  }

  // =====================================================================================
  // KILL SWITCH MANAGEMENT
  // =====================================================================================

  async toggleKillSwitch(module, reason, forceActive = null) {
    try {
      const is_active = forceActive !== null ? forceActive : true;
      const response = await fetch(`${API_BASE}/aas/kill/toggle`, {
        method: "POST",
        headers: { 
          "content-type": "application/json", 
          "x-internal-key": INTERNAL_KEY 
        },
        body: JSON.stringify({ module, is_active, reason })
      });
      
      if (!response?.ok) {
        throw new Error(`Kill switch toggle failed: ${response.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  }

  // =====================================================================================
  // IQS SUMMARY
  // =====================================================================================

  async getIQSSummary() {
    try {
      const response = await fetch(`${API_BASE}/aas/iqs/summary`, {
        method: "GET",
        headers: { "x-internal-key": INTERNAL_KEY }
      });
      
      if (!response?.ok) {
        throw new Error(`IQS summary failed: ${response.status}`);
      }
      
      return await response?.json();
    } catch (error) {
      return { ok: false, error: error?.message, avg: 0, count: 0 };
    }
  }

  // =====================================================================================
  // SUPABASE DIRECT OPERATIONS (for real-time data)
  // =====================================================================================

  async getStrategyCandidates(limit = 50) {
    try {
      const { data, error } = await supabase?.from('strategy_candidates')?.select('*')?.order('created_at', { ascending: false })?.limit(limit);
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  async getKillSwitches() {
    try {
      const { data, error } = await supabase?.from('kill_switches')?.select('*')?.order('module');
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  async getMetaLearningMetrics(limit = 20) {
    try {
      const { data, error } = await supabase?.from('meta_learning_metrics')?.select('*')?.order('ts', { ascending: false })?.limit(limit);
      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }

  // =====================================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =====================================================================================

  subscribeToStrategyCandidates(callback) {
    return supabase?.channel('strategy_candidates_changes')?.on('postgres_changes', 
        { event: '*', schema: 'public', table: 'strategy_candidates' },
        callback
      )?.subscribe();
  }

  subscribeToKillSwitches(callback) {
    return supabase?.channel('kill_switches_changes')?.on('postgres_changes',
        { event: '*', schema: 'public', table: 'kill_switches' },
        callback
      )?.subscribe();
  }

  subscribeToRegimeState(callback) {
    return supabase?.channel('regime_state_changes')?.on('postgres_changes',
        { event: '*', schema: 'public', table: 'regime_state' },
        callback
      )?.subscribe();
  }

  unsubscribe(subscription) {
    if (subscription) {
      supabase?.removeChannel(subscription);
    }
  }
}

export const aasService = new AASService();
export default aasService;