import { supabase } from '../lib/supabase';

export const alertsService = {
  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit = 10) {
    try {
      const { data, error } = await supabase
        ?.from('alerts')
        ?.select(`
          *,
          asset:assets (symbol, name)
        `)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) {
        console.error('Error fetching alerts:', error);
        return this.getMockAlerts();
      }

      return data?.map(alert => ({
        id: alert?.id,
        title: alert?.alert_type || 'System Alert',
        message: alert?.message || 'No details available',
        severity: alert?.alert_severity || 'medium',
        status: alert?.alert_status || 'active',
        asset: alert?.asset?.symbol || 'N/A',
        createdAt: alert?.created_at,
        triggeredAt: alert?.triggered_at
      })) || this.getMockAlerts();
    } catch (error) {
      console.error('Error in getRecentAlerts:', error);
      return this.getMockAlerts();
    }
  },

  /**
   * Get alerts by severity
   */
  async getAlertsBySeverity(severity) {
    try {
      const { data, error } = await supabase
        ?.from('alerts')
        ?.select(`
          *,
          asset:assets (symbol, name)
        `)
        ?.eq('alert_severity', severity)
        ?.eq('alert_status', 'active')
        ?.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts by severity:', error);
        return [];
      }

      return data?.map(alert => ({
        id: alert?.id,
        title: alert?.alert_type || 'System Alert',
        message: alert?.message || 'No details available',
        severity: alert?.alert_severity,
        status: alert?.alert_status,
        asset: alert?.asset?.symbol || 'N/A',
        createdAt: alert?.created_at,
        triggeredAt: alert?.triggered_at
      })) || [];
    } catch (error) {
      console.error('Error in getAlertsBySeverity:', error);
      return [];
    }
  },

  /**
   * Get active alerts count
   */
  async getActiveAlertsCount() {
    try {
      const { count, error } = await supabase
        ?.from('alerts')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('alert_status', 'active');

      if (error) {
        console.error('Error fetching active alerts count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getActiveAlertsCount:', error);
      return 0;
    }
  },

  /**
   * Create new alert
   */
  async createAlert(alertData) {
    try {
      // Get current user
      const { data: { user } } = await supabase?.auth?.getUser();
      
      const { data, error } = await supabase
        ?.from('alerts')
        ?.insert({
          alert_type: alertData?.type || 'system',
          alert_severity: alertData?.severity || 'medium',
          alert_status: 'active',
          message: alertData?.message,
          asset_id: alertData?.assetId,
          user_id: user?.id,
          conditions: alertData?.conditions || {},
          metadata: alertData?.metadata || {}
        })
        ?.select()
        ?.single();

      if (error) {
        console.error('Error creating alert:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createAlert:', error);
      return null;
    }
  },

  /**
   * Update alert status
   */
  async updateAlertStatus(alertId, status) {
    try {
      const { data, error } = await supabase
        ?.from('alerts')
        ?.update({ 
          alert_status: status,
          triggered_at: status === 'triggered' ? new Date()?.toISOString() : null
        })
        ?.eq('id', alertId)
        ?.select()
        ?.single();

      if (error) {
        console.error('Error updating alert status:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in updateAlertStatus:', error);
      return false;
    }
  },

  /**
   * Delete alert
   */
  async deleteAlert(alertId) {
    try {
      const { error } = await supabase
        ?.from('alerts')
        ?.delete()
        ?.eq('id', alertId);

      if (error) {
        console.error('Error deleting alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteAlert:', error);
      return false;
    }
  },

  /**
   * Get alerts summary
   */
  async getAlertsSummary() {
    try {
      const [critical, high, medium, low] = await Promise.all([
        this.getAlertsBySeverity('critical'),
        this.getAlertsBySeverity('high'), 
        this.getAlertsBySeverity('medium'),
        this.getAlertsBySeverity('low')
      ]);

      return {
        total: critical?.length + high?.length + medium?.length + low?.length,
        critical: critical?.length || 0,
        high: high?.length || 0,
        medium: medium?.length || 0,
        low: low?.length || 0,
        mostRecent: [...critical, ...high, ...medium, ...low]
          ?.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt))
          ?.slice(0, 5)
      };
    } catch (error) {
      console.error('Error in getAlertsSummary:', error);
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        mostRecent: []
      };
    }
  },

  /**
   * Mock alerts for fallback
   */
  getMockAlerts() {
    const now = new Date();
    return [
      {
        id: '1',
        title: 'API Latency Alert',
        message: 'API response time exceeded 500ms threshold',
        severity: 'high',
        status: 'active',
        asset: 'SYSTEM',
        createdAt: new Date(now - 300000)?.toISOString(), // 5 minutes ago
        triggeredAt: new Date(now - 300000)?.toISOString()
      },
      {
        id: '2',
        title: 'Data Health Warning',
        message: 'DHI dropped below 80% for Yahoo Finance stream',
        severity: 'medium',
        status: 'active',
        asset: 'DATA',
        createdAt: new Date(now - 900000)?.toISOString(), // 15 minutes ago
        triggeredAt: new Date(now - 900000)?.toISOString()
      },
      {
        id: '3',
        title: 'Agent Status',
        message: 'Strategy Weaver agent showing degraded performance',
        severity: 'medium',
        status: 'active',
        asset: 'AGENT',
        createdAt: new Date(now - 1800000)?.toISOString(), // 30 minutes ago
        triggeredAt: new Date(now - 1800000)?.toISOString()
      }
    ];
  },

  /**
   * Create system alert (for internal use)
   */
  async createSystemAlert(type, severity, message, metadata = {}) {
    return await this.createAlert({
      type,
      severity,
      message,
      metadata: {
        ...metadata,
        source: 'system',
        automated: true
      }
    });
  },

  /**
   * Trigger health-related alert
   */
  async triggerHealthAlert(component, healthStatus, details = '') {
    const severity = healthStatus === 'critical' ? 'critical' : 
                     healthStatus === 'warning' ? 'high' : 'medium';
    
    return await this.createSystemAlert(
      'health',
      severity,
      `Health alert for ${component}: ${healthStatus}${details ? ` - ${details}` : ''}`,
      { component, healthStatus }
    );
  }
};

// Keep backward compatibility with the old placeholder function
export function createAlertsServiceFunction(...args) {
  console.warn('Using deprecated alertsService function. Use alertsService object instead.');
  return alertsService?.getRecentAlerts();
}

export default alertsService;