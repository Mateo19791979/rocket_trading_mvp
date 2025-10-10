import { supabase } from './supabase';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const ADMIN_KEY = import.meta.env?.VITE_INTERNAL_ADMIN_KEY || '';

export const aiOps = {
  // Decision logging
  async logDecision(payload) {
    try {
      const { data, error } = await supabase?.from('decisions_log')?.insert(payload)?.select()?.single();
      
      if (error) throw error;
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  async getDecisionLogs(filters = {}) {
    try {
      let query = supabase?.from('decisions_log')?.select('*')?.order('ts', { ascending: false });

      if (filters?.agent) {
        query = query?.eq('agent', filters?.agent);
      }
      if (filters?.outcome) {
        query = query?.eq('outcome', filters?.outcome);
      }
      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  // Data Health Index
  async updateDhi(stream, parts) {
    try {
      const {
        timeliness = 0.9, completeness = 0.9, consistency = 0.9,
        anomaly_inverse = 0.9, coverage = 0.9, license_status = 1.0
      } = parts || {};
      
      const dhi = 0.25 * timeliness + 0.20 * completeness + 0.20 * consistency + 
                  0.15 * anomaly_inverse + 0.10 * coverage + 0.10 * license_status;

      const { data, error } = await supabase?.from('data_health_index')?.upsert({
          stream,
          timeliness,
          completeness,
          consistency,
          anomaly_inverse,
          coverage,
          license_status,
          dhi,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;
      return { ok: true, stream, dhi, data };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  async getDhiStatus(stream, minThreshold = 0.7) {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('dhi')?.eq('stream', stream)?.single();

      if (error) throw error;
      const healthy = !data || data?.dhi === null ? true : data?.dhi >= minThreshold;
      return { ok: true, stream, dhi: data?.dhi, healthy, threshold: minThreshold };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  async getAllDhiMetrics() {
    try {
      const { data, error } = await supabase?.from('data_health_index')?.select('*')?.order('dhi', { ascending: false });

      if (error) throw error;
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  // Source Rewards (Bandits)
  async pickSource(candidates) {
    try {
      const { data, error } = await supabase?.from('source_rewards')?.select('*')?.in('source', candidates);

      if (error) throw error;

      const stats = new Map((data || []).map(r => [r.source, r]));
      let best = null, bestScore = -1;
      
      for (const candidate of candidates) {
        const s = stats?.get(candidate) || { successes: 1, failures: 1 };
        // Thompson Sampling approximation
        const sample = (s?.successes + 1) / (s?.successes + s?.failures + 2) * (0.9 + 0.2 * Math.random());
        if (sample > bestScore) {
          bestScore = sample;
          best = candidate;
        }
      }

      return { ok: true, chosen: best || candidates?.[0] };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  async rewardSource(source, success = true) {
    try {
      const field = success ? 'successes' : 'failures';
      const { data, error } = await supabase?.rpc('increment_source_field', {
        p_source: source,
        p_field: field
      });

      if (error) throw error;
      return { ok: true, source, field };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  async getSourceRewards() {
    try {
      const { data, error } = await supabase?.from('source_rewards')?.select('*')?.order('last_reward', { ascending: false });

      if (error) throw error;
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  // IQ Scores
  async upsertIQS(insight_id, breakdown) {
    try {
      // Calculate IQS from breakdown
      const weights = { 
        robustness: 0.25, 
        stability: 0.20, 
        causality: 0.15, 
        transferability: 0.15, 
        cost_efficiency: 0.15, 
        explainability: 0.10 
      };
      
      const iqs = Object.entries(weights)?.reduce((acc, [key, weight]) => {
        return acc + weight * (Number(breakdown?.[key] || 0));
      }, 0);

      const { data, error } = await supabase?.from('iq_scores')?.upsert({
          insight_id,
          iqs: Math.max(0, Math.min(1, iqs)),
          breakdown,
          ts: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;
      return { ok: true, insight_id, iqs, data };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  async getIQSScores(limit = 50) {
    try {
      const { data, error } = await supabase?.from('iq_scores')?.select('*')?.order('iqs', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  // TGE Intelligence integration
  async getTgeStatistics() {
    try {
      const { data, error } = await supabase?.from('tge_events')?.select('source, status, tge_datetime, fdv_usd')?.order('created_at', { ascending: false })?.limit(100);

      if (error) throw error;

      // Calculate source reliability based on TGE data
      const sourceStats = {};
      data?.forEach(event => {
        if (!sourceStats?.[event?.source]) {
          sourceStats[event.source] = { total: 0, completed: 0, total_fdv: 0 };
        }
        sourceStats[event.source].total++;
        if (event?.status === 'completed') {
          sourceStats[event.source].completed++;
        }
        if (event?.fdv_usd) {
          sourceStats[event.source].total_fdv += parseFloat(event?.fdv_usd);
        }
      });

      return { ok: true, data, sourceStats };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  },

  // Nightly critique (simulate backend endpoint)
  async runCritique() {
    try {
      // Get recent errors for analysis
      const since = new Date(Date.now() - 24 * 3600 * 1000)?.toISOString();
      const { data, error } = await supabase?.from('decisions_log')?.select('error_sig')?.gt('ts', since)?.not('error_sig', 'is', null);

      if (error) throw error;

      // Count recurring errors
      const errorCounts = {};
      data?.forEach(log => {
        errorCounts[log.error_sig] = (errorCounts?.[log?.error_sig] || 0) + 1;
      });

      const recurring = Object.entries(errorCounts)?.filter(([, count]) => count >= 3)?.map(([error_sig, count]) => ({ error_sig, count }));

      const advice = recurring?.map(r => ({ 
        error_sig: r?.error_sig, 
        action: 'lower_threshold_or_fix_parser',
        count: r?.count
      }));

      return { ok: true, recurring, advice };
    } catch (error) {
      return { ok: false, error: error?.message };
    }
  }
};