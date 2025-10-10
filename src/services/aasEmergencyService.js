import { supabase } from '../lib/supabase';

class AASEmergencyService {
  // Multi-Level Kill Switch Operations
  async getKillSwitches() {
    try {
      const { data, error } = await supabase?.from('aas_kill_switches')?.select('*')?.order('module');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch kill switches' };
    }
  }

  async activateKillSwitch(module, level, reason = 'Emergency activation') {
    try {
      const { data, error } = await supabase?.from('aas_kill_switches')?.upsert({
          module,
          is_active: true,
          aas_level: level,
          reason,
          activated_by: (await supabase?.auth?.getUser())?.data?.user?.id,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to activate kill switch' };
    }
  }

  async deactivateKillSwitch(module, reason = 'Manual deactivation') {
    try {
      const { data, error } = await supabase?.from('aas_kill_switches')?.update({
          is_active: false,
          aas_level: 'level_1_monitoring',
          reason,
          updated_at: new Date()?.toISOString()
        })?.eq('module', module)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to deactivate kill switch' };
    }
  }

  // Emergency Incident Management
  async createIncident(incidentData) {
    try {
      const { data, error } = await supabase?.rpc('activate_emergency_response', {
          incident_type_param: incidentData?.type,
          severity_param: incidentData?.severity,
          description_param: incidentData?.description,
          affected_systems_param: incidentData?.affectedSystems || []
        });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to create emergency incident' };
    }
  }

  async getActiveIncidents() {
    try {
      const { data, error } = await supabase?.from('emergency_incidents')?.select(`
          *,
          assigned_user:user_profiles(id, full_name, email)
        `)?.in('status', ['active', 'investigating'])?.order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch active incidents' };
    }
  }

  async updateIncidentStatus(incidentId, status, notes = '') {
    try {
      const updateData = {
        status,
        ...(status === 'resolved' && { resolved_at: new Date()?.toISOString() })
      };

      const { data, error } = await supabase?.from('emergency_incidents')?.update(updateData)?.eq('id', incidentId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to update incident status' };
    }
  }

  // System Health Monitoring
  async getSystemHealth() {
    try {
      const { data, error } = await supabase?.from('aas_system_health')?.select('*')?.order('ts', { ascending: false })?.limit(1)?.single();

      if (error && error?.code !== 'PGRST116') throw error;
      
      // If no data exists, return default
      if (!data) {
        return { 
          data: { 
            dhi_avg: 0.85, 
            mode: 'normal', 
            ts: new Date()?.toISOString() 
          }, 
          error: null 
        };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to fetch system health' };
    }
  }

  async calculateSystemDHI() {
    try {
      const { data, error } = await supabase?.rpc('calculate_system_dhi');

      if (error) throw error;
      return { data: data || 0.0, error: null };
    } catch (error) {
      return { data: 0.0, error: error?.message || 'Failed to calculate DHI' };
    }
  }

  // Market Regime Detection
  async getCurrentRegime() {
    try {
      const { data, error } = await supabase?.from('regime_state')?.select('*')?.order('as_of', { ascending: false })?.limit(1)?.single();

      if (error && error?.code !== 'PGRST116') throw error;

      // Default regime if no data
      if (!data) {
        return { 
          data: { 
            regime: 'sideways', 
            confidence: 0.75, 
            as_of: new Date()?.toISOString() 
          }, 
          error: null 
        };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to fetch current regime' };
    }
  }

  async getRegimeHistory(limit = 24) {
    try {
      const { data, error } = await supabase?.from('regime_state')?.select('*')?.order('as_of', { ascending: false })?.limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch regime history' };
    }
  }

  // Strategy Management
  async getActiveStrategies() {
    try {
      const { data, error } = await supabase?.from('strategy_candidates')?.select('*')?.in('status', ['testing', 'paper', 'canary', 'live'])?.order('iqs', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error?.message || 'Failed to fetch active strategies' };
    }
  }

  async pauseStrategy(strategyId, reason = 'Emergency pause') {
    try {
      const { data, error } = await supabase?.from('strategy_candidates')?.update({
          status: 'rejected',
          notes: `${reason} - ${new Date()?.toISOString()}`
        })?.eq('id', strategyId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error?.message || 'Failed to pause strategy' };
    }
  }

  // Real-time Monitoring
  subscribeToHealthUpdates(callback) {
    const channel = supabase?.channel('aas_health_updates')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aas_system_health'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emergency_incidents'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }

  subscribeToKillSwitchUpdates(callback) {
    const channel = supabase?.channel('kill_switch_updates')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aas_kill_switches'
        },
        (payload) => {
          callback?.(payload);
        }
      )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }
}

export const aasEmergencyService = new AASEmergencyService();