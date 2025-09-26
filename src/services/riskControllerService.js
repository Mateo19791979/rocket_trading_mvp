import { supabase } from '../lib/supabase';

export const riskControllerService = {
  // Get risk controller for current user
  async getRiskController() {
    try {
      const { data, error } = await supabase?.from('risk_controller')?.select('*')?.single();

      if (error) {
        if (error?.code === 'PGRST116') {
          // No risk controller exists, create default
          return await this.createDefaultRiskController();
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create default risk controller
  async createDefaultRiskController() {
    try {
      const { data, error } = await supabase?.from('risk_controller')?.insert({
          max_daily_loss: 1000.00,
          max_portfolio_drawdown: 10.00,
          configuration: {
            market_hours_only: true,
            validate_orders: true,
            max_position_size: 50000
          }
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Activate emergency killswitch
  async activateKillswitch(controllerId, reason = 'Manual activation') {
    try {
      const { data, error } = await supabase?.rpc('activate_killswitch', {
        controller_id: controllerId,
        reason: reason
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Deactivate killswitch
  async deactivateKillswitch(controllerId, reason = 'Manual deactivation') {
    try {
      const { data, error } = await supabase?.rpc('deactivate_killswitch', {
        controller_id: controllerId,
        recovery_reason: reason
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update risk controller settings
  async updateRiskController(controllerId, updates) {
    try {
      const { data, error } = await supabase?.from('risk_controller')?.update(updates)?.eq('id', controllerId)?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get risk events with pagination
  async getRiskEvents(controllerId, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase?.from('risk_events')?.select(`
          *,
          resolved_by:resolved_by(full_name, email)
        `)?.eq('risk_controller_id', controllerId)?.order('created_at', { ascending: false })?.range(offset, offset + limit - 1);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get real-time risk metrics
  async getRiskMetrics() {
    try {
      const { data, error } = await supabase?.from('risk_metrics')?.select('*')?.order('calculated_at', { ascending: false })?.limit(1);

      return { 
        data: data?.[0] || null, 
        error 
      };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get portfolio positions for risk calculation
  async getPortfolioRisk() {
    try {
      const { data: positions, error } = await supabase?.from('positions')?.select(`
          *,
          asset:assets(symbol, name, sector),
          portfolio:portfolios(*)
        `)?.eq('position_status', 'open');

      if (error) throw error;

      const totalValue = positions?.reduce((sum, pos) => sum + (pos?.market_value || 0), 0) || 0;
      const totalPnL = positions?.reduce((sum, pos) => sum + (pos?.unrealized_pnl || 0), 0) || 0;
      const positionCount = positions?.length || 0;

      return {
        data: {
          positions: positions || [],
          totalValue,
          totalPnL,
          positionCount,
          riskLevel: this.calculateRiskLevel(totalPnL, totalValue)
        },
        error: null
      };
    } catch (error) {
      return { 
        data: { 
          positions: [], 
          totalValue: 0, 
          totalPnL: 0, 
          positionCount: 0,
          riskLevel: 'low'
        }, 
        error 
      };
    }
  },

  // Calculate risk level based on P&L
  calculateRiskLevel(pnl, totalValue) {
    if (!totalValue) return 'low';
    
    const pnlPercent = (pnl / totalValue) * 100;
    
    if (pnlPercent < -10) return 'extreme';
    if (pnlPercent < -5) return 'high';
    if (pnlPercent < -2) return 'medium';
    return 'low';
  },

  // Subscribe to risk events
  subscribeToRiskEvents(controllerId, callback) {
    const subscription = supabase?.channel('risk_events')?.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'risk_events',
          filter: `risk_controller_id=eq.${controllerId}`
        },
        callback
      )?.subscribe();

    return subscription;
  },

  // Subscribe to risk controller changes
  subscribeToRiskController(controllerId, callback) {
    const subscription = supabase?.channel('risk_controller')?.on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'risk_controller',
          filter: `id=eq.${controllerId}`
        },
        callback
      )?.subscribe();

    return subscription;
  }
};