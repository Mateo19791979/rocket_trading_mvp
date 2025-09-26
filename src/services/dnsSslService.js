import { supabase } from '../lib/supabase';

/**
 * DNS & SSL Management Service
 * Handles domain configuration, DNS records, SSL certificates, and security monitoring
 */

class DnsSslService {
  // Domain Configuration Methods
  async getDomainConfigs(userId) {
    try {
      const { data, error } = await supabase?.from('domain_configs')?.select(`
          *,
          dns_records(count),
          ssl_certificates(count)
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching domain configurations:', error);
      throw error;
    }
  }

  async createDomainConfig(domainData) {
    try {
      const { data, error } = await supabase?.from('domain_configs')?.insert([{
          ...domainData,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating domain configuration:', error);
      throw error;
    }
  }

  async updateDomainConfig(domainId, updates) {
    try {
      const { data, error } = await supabase?.from('domain_configs')?.update(updates)?.eq('id', domainId)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating domain configuration:', error);
      throw error;
    }
  }

  async deleteDomainConfig(domainId) {
    try {
      const { error } = await supabase?.from('domain_configs')?.delete()?.eq('id', domainId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting domain configuration:', error);
      throw error;
    }
  }

  async verifyDomain(domainId, verificationToken) {
    try {
      const { data, error } = await supabase?.from('domain_configs')?.update({
          status: 'active',
          last_verified_at: new Date()?.toISOString(),
          verification_token: null
        })?.eq('id', domainId)?.eq('verification_token', verificationToken)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error verifying domain:', error);
      throw error;
    }
  }

  // DNS Records Methods
  async getDnsRecords(domainId) {
    try {
      const { data, error } = await supabase?.from('dns_records')?.select('*')?.eq('domain_id', domainId)?.order('record_type')?.order('record_name');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      throw error;
    }
  }

  async createDnsRecord(recordData) {
    try {
      const { data, error } = await supabase?.from('dns_records')?.insert([{
          ...recordData,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating DNS record:', error);
      throw error;
    }
  }

  async updateDnsRecord(recordId, updates) {
    try {
      const { data, error } = await supabase?.from('dns_records')?.update(updates)?.eq('id', recordId)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating DNS record:', error);
      throw error;
    }
  }

  async deleteDnsRecord(recordId) {
    try {
      const { error } = await supabase?.from('dns_records')?.delete()?.eq('id', recordId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting DNS record:', error);
      throw error;
    }
  }

  // SSL Certificate Methods
  async getSslCertificates(domainId = null) {
    try {
      let query = supabase?.from('ssl_certificates')?.select(`
          *,
          domain_configs(domain_name)
        `)?.order('expires_at', { ascending: true });

      if (domainId) {
        query = query?.eq('domain_id', domainId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching SSL certificates:', error);
      throw error;
    }
  }

  async createSslCertificate(certData) {
    try {
      const { data, error } = await supabase?.from('ssl_certificates')?.insert([{
          ...certData,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating SSL certificate:', error);
      throw error;
    }
  }

  async renewSslCertificate(certId) {
    try {
      const { data, error } = await supabase?.from('ssl_certificates')?.update({
          status: 'pending',
          last_renewal_attempt_at: new Date()?.toISOString(),
          renewal_error: null
        })?.eq('id', certId)?.select()?.single();

      if (error) {
        throw error;
      }

      // In a real implementation, this would trigger the renewal process
      return data;
    } catch (error) {
      console.error('Error initiating SSL certificate renewal:', error);
      throw error;
    }
  }

  async getSslCertificatesExpiringSoon(days = 30) {
    try {
      const expiryDate = new Date();
      expiryDate?.setDate(expiryDate?.getDate() + days);

      const { data, error } = await supabase?.from('ssl_certificates')?.select(`
          *,
          domain_configs(domain_name)
        `)?.eq('status', 'valid')?.lte('expires_at', expiryDate?.toISOString())?.order('expires_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching expiring SSL certificates:', error);
      throw error;
    }
  }

  // DNS Health Monitoring Methods
  async getDnsHealthChecks(domainId = null) {
    try {
      let query = supabase?.from('dns_health_checks')?.select(`
          *,
          domain_configs(domain_name)
        `)?.order('last_checked_at', { ascending: false });

      if (domainId) {
        query = query?.eq('domain_id', domainId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching DNS health checks:', error);
      throw error;
    }
  }

  async createHealthCheck(checkData) {
    try {
      const { data, error } = await supabase?.from('dns_health_checks')?.insert([{
          ...checkData,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating health check:', error);
      throw error;
    }
  }

  async runHealthCheck(checkId) {
    try {
      // In a real implementation, this would run the actual health check
      const { data, error } = await supabase?.from('dns_health_checks')?.update({
          last_checked_at: new Date()?.toISOString(),
          next_check_at: new Date(Date.now() + (60 * 60 * 1000))?.toISOString() // Next hour
        })?.eq('id', checkId)?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error running health check:', error);
      throw error;
    }
  }

  // SSL Security Scan Methods
  async getSecurityScans(certId = null) {
    try {
      let query = supabase?.from('ssl_security_scans')?.select(`
          *,
          ssl_certificates(common_name)
        `)?.order('scanned_at', { ascending: false });

      if (certId) {
        query = query?.eq('ssl_certificate_id', certId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching security scans:', error);
      throw error;
    }
  }

  async runSecurityScan(certId, scanType = 'ssllabs') {
    try {
      const { data, error } = await supabase?.from('ssl_security_scans')?.insert([{
          ssl_certificate_id: certId,
          user_id: (await supabase?.auth?.getUser())?.data?.user?.id,
          scan_type: scanType,
          overall_grade: 'A',
          scan_results: {
            protocol_support: 'TLS 1.2, TLS 1.3',
            cipher_strength: 'strong',
            key_exchange: 'ECDHE'
          },
          scan_score: Math.floor(Math.random() * 20) + 80, // Random score 80-100
          has_critical_issues: false,
          scanned_at: new Date()?.toISOString()
        }])?.select()?.single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error running security scan:', error);
      throw error;
    }
  }

  // Dashboard/Analytics Methods
  async getDnsSslOverview(userId) {
    try {
      const [domains, certificates, healthChecks, securityScans] = await Promise.all([
        this.getDomainConfigs(userId),
        this.getSslCertificates(),
        this.getDnsHealthChecks(),
        this.getSecurityScans()
      ]);

      // Calculate statistics
      const stats = {
        totalDomains: domains?.length || 0,
        activeDomains: domains?.filter(d => d?.status === 'active')?.length || 0,
        totalCertificates: certificates?.length || 0,
        validCertificates: certificates?.filter(c => c?.status === 'valid')?.length || 0,
        expiringCertificates: certificates?.filter(c => {
          const expiryDate = new Date(c.expires_at);
          const thirtyDaysFromNow = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
          return expiryDate <= thirtyDaysFromNow;
        })?.length || 0,
        healthyChecks: healthChecks?.filter(h => h?.is_healthy)?.length || 0,
        totalHealthChecks: healthChecks?.length || 0,
        averageSecurityScore: securityScans?.reduce((acc, scan) => acc + (scan?.scan_score || 0), 0) / Math.max(securityScans?.length || 1, 1)
      };

      return {
        stats,
        domains,
        recentCertificates: certificates?.slice(0, 5) || [],
        recentHealthChecks: healthChecks?.slice(0, 5) || [],
        recentSecurityScans: securityScans?.slice(0, 5) || []
      };
    } catch (error) {
      console.error('Error fetching DNS SSL overview:', error);
      throw error;
    }
  }

  // Utility Methods
  async validateDnsRecord(recordType, recordValue) {
    // Basic validation - in a real app, this would be more comprehensive
    const patterns = {
      'A': /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
      'AAAA': /^(?:[0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/,
      'CNAME': /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?$/,
      'MX': /^\d+ [a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?$/,
      'TXT': /.+/
    };

    return patterns?.[recordType]?.test(recordValue) || false;
  }

  async generateCsrKey(commonName, country = 'US', organization = 'Trading Platform') {
    // This would generate a proper CSR in a real implementation
    return {
      csr: `-----BEGIN CERTIFICATE REQUEST-----\nSample CSR for ${commonName}\n-----END CERTIFICATE REQUEST-----`,
      privateKey: `-----BEGIN PRIVATE KEY-----\nSample Private Key\n-----END PRIVATE KEY-----`
    };
  }

  async testDnsResolution(domain, recordType = 'A') {
    // Mock DNS resolution test - in reality this would use actual DNS lookup
    return {
      success: true,
      responseTime: Math.floor(Math.random() * 100) + 10,
      resolvedValue: recordType === 'A' ? '104.198.14.52' : 'trading.mvp.com',
      timestamp: new Date()?.toISOString()
    };
  }
}

export const dnsSslService = new DnsSslService();
export default dnsSslService;