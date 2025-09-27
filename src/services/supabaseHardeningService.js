import { supabase } from '../lib/supabase';

class SupabaseHardeningService {
  // Get SSL certificate status and security scan results
  async getSSLStatus(userId) {
    try {
      const { data: certificates, error: certError } = await supabase?.from('ssl_certificates')?.select(`
          *,
          ssl_security_scans (
            scan_type,
            scan_score,
            overall_grade,
            has_critical_issues,
            scanned_at,
            recommendations,
            vulnerabilities
          )
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (certError) {
        throw certError;
      }

      return certificates || [];
    } catch (error) {
      console.error('Error fetching SSL status:', error);
      throw error;
    }
  }

  // Get DNS health check status
  async getDNSHealthChecks(userId) {
    try {
      const { data, error } = await supabase?.from('dns_health_checks')?.select(`
          *,
          domain_configs (
            domain_name,
            status,
            dns_provider
          )
        `)?.eq('user_id', userId)?.order('last_checked_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching DNS health checks:', error);
      throw error;
    }
  }

  // Get risk controller configuration
  async getRiskControllerStatus(userId) {
    try {
      const { data, error } = await supabase?.from('risk_controller')?.select('*')?.eq('user_id', userId)?.single();

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching risk controller status:', error);
      throw error;
    }
  }

  // Get system health metrics
  async getSystemHealthMetrics() {
    try {
      const { data, error } = await supabase?.from('system_health')?.select(`
          *,
          ai_agents (
            name,
            status,
            strategy
          )
        `)?.order('last_heartbeat', { ascending: false })?.limit(10);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw error;
    }
  }

  // Get compliance reports
  async getComplianceReports(userId) {
    try {
      const { data, error } = await supabase?.from('compliance_reports')?.select('*')?.eq('user_id', userId)?.order('report_date', { ascending: false })?.limit(5);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
      throw error;
    }
  }

  // Generate hardening status summary
  async getHardeningStatusSummary(userId) {
    try {
      const [sslStatus, dnsHealth, riskController, systemHealth, compliance] = await Promise.all([
        this.getSSLStatus(userId),
        this.getDNSHealthChecks(userId),
        this.getRiskControllerStatus(userId),
        this.getSystemHealthMetrics(),
        this.getComplianceReports(userId)
      ]);

      return {
        ssl: {
          certificates: sslStatus,
          totalCerts: sslStatus?.length || 0,
          validCerts: sslStatus?.filter(cert => cert?.status === 'valid')?.length || 0,
          expiringSoon: sslStatus?.filter(cert => {
            if (!cert?.expires_at) return false;
            const expiryDate = new Date(cert.expires_at);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow?.setDate(thirtyDaysFromNow?.getDate() + 30);
            return expiryDate <= thirtyDaysFromNow;
          })?.length || 0
        },
        dns: {
          checks: dnsHealth,
          totalChecks: dnsHealth?.length || 0,
          healthyChecks: dnsHealth?.filter(check => check?.is_healthy)?.length || 0,
          failingChecks: dnsHealth?.filter(check => !check?.is_healthy)?.length || 0
        },
        risk: {
          controller: riskController,
          killswitchEnabled: riskController?.killswitch_enabled || false,
          killswitchStatus: riskController?.killswitch_status || 'inactive',
          autoRecovery: riskController?.auto_recovery_enabled || false
        },
        system: {
          health: systemHealth,
          healthyAgents: systemHealth?.filter(agent => agent?.health_status === 'healthy')?.length || 0,
          totalAgents: systemHealth?.length || 0,
          averageCpuUsage: systemHealth?.reduce((acc, agent) => acc + (parseFloat(agent?.cpu_usage) || 0), 0) / (systemHealth?.length || 1)
        },
        compliance: {
          reports: compliance,
          totalReports: compliance?.length || 0,
          compliantReports: compliance?.filter(report => report?.compliance_status === 'compliant')?.length || 0,
          violations: compliance?.reduce((acc, report) => acc + (report?.violations_count || 0), 0) || 0
        }
      };
    } catch (error) {
      console.error('Error generating hardening status summary:', error);
      throw error;
    }
  }

  // Execute hardening action (mock implementation)
  async executeHardeningAction(actionType, parameters = {}) {
    try {
      console.log(`Executing hardening action: ${actionType}`, parameters);
      
      // This would normally interface with actual hardening tools
      // For now, we'll simulate the action and return success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        action: actionType,
        timestamp: new Date()?.toISOString(),
        message: `Successfully executed ${actionType} hardening action`
      };
    } catch (error) {
      console.error('Error executing hardening action:', error);
      throw error;
    }
  }

  // Update risk controller settings
  async updateRiskController(userId, settings) {
    try {
      const { data, error } = await supabase?.from('risk_controller')?.upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating risk controller:', error);
      throw error;
    }
  }
}

export default new SupabaseHardeningService();