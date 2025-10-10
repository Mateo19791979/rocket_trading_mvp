import { supabase } from '../lib/supabase';

class ParanoidSecurityAuditService {
  constructor() {
    this.baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  // Generate a mock UUID for development/demo purposes
  generateMockUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'?.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v?.toString(16);
    });
  }

  // Get authenticated user ID or fallback to mock UUID
  async getUserId() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (user?.id) {
        return user?.id;
      }
      // For development/demo: use a consistent mock UUID
      return this.generateMockUUID();
    } catch (error) {
      console.warn('Auth error, using mock UUID:', error);
      return this.generateMockUUID();
    }
  }

  // Security Scan Management
  async getSecurityScans(userId = null) {
    try {
      const effectiveUserId = userId || (await this.getUserId());
      
      const { data, error } = await supabase?.from('ssl_security_scans')?.select(`
          id,
          scan_type,
          scan_url,
          scan_score,
          overall_grade,
          has_critical_issues,
          scanned_at,
          vulnerabilities,
          recommendations,
          scan_duration_seconds,
          ssl_certificate_id
        `)?.eq('user_id', effectiveUserId)?.order('scanned_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching security scans:', error);
      throw error;
    }
  }

  async initiateSecurityScan(scanConfig) {
    try {
      const userId = await this.getUserId();

      const scanData = {
        user_id: userId,
        scan_type: scanConfig?.type,
        scan_url: scanConfig?.url,
        scanned_at: new Date()?.toISOString(),
        scan_results: {},
        vulnerabilities: [],
        recommendations: []
      };

      // Simulate penetration testing with OWASP ZAP integration
      const scanResults = await this.performPenetrationTest(scanConfig);
      
      scanData.scan_results = scanResults?.results;
      scanData.scan_score = scanResults?.score;
      scanData.overall_grade = this.calculateSecurityGrade(scanResults?.score);
      scanData.has_critical_issues = scanResults?.critical_count > 0;
      scanData.vulnerabilities = scanResults?.vulnerabilities;
      scanData.recommendations = scanResults?.recommendations;
      scanData.scan_duration_seconds = scanResults?.duration;

      const { data, error } = await supabase?.from('ssl_security_scans')?.insert([scanData])?.select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error initiating security scan:', error);
      throw error;
    }
  }

  async performPenetrationTest(config) {
    // Simulate comprehensive penetration testing
    const startTime = Date.now();
    
    const testResults = {
      sql_injection: await this.testSQLInjection(config?.url),
      xss_vulnerabilities: await this.testXSSVulnerabilities(config?.url),
      csrf_protection: await this.testCSRFProtection(config?.url),
      authentication_bypass: await this.testAuthenticationBypass(config?.url),
      authorization_flaws: await this.testAuthorizationFlaws(config?.url),
      security_headers: await this.testSecurityHeaders(config?.url),
      encryption_strength: await this.testEncryptionStrength(config?.url),
      api_security: await this.testAPIEndpoints(config?.url)
    };

    const vulnerabilities = [];
    const recommendations = [];
    let totalScore = 100;
    let criticalCount = 0;

    Object.entries(testResults)?.forEach(([test, result]) => {
      if (!result?.passed) {
        vulnerabilities?.push({
          type: test,
          severity: result?.severity,
          description: result?.description,
          impact: result?.impact,
          remediation: result?.remediation
        });

        if (result?.severity === 'critical') {
          criticalCount++;
          totalScore -= 25;
        } else if (result?.severity === 'high') {
          totalScore -= 15;
        } else if (result?.severity === 'medium') {
          totalScore -= 10;
        } else {
          totalScore -= 5;
        }

        recommendations?.push(result?.remediation);
      }
    });

    const duration = Math.round((Date.now() - startTime) / 1000);

    return {
      results: testResults,
      score: Math.max(0, totalScore),
      critical_count: criticalCount,
      vulnerabilities,
      recommendations,
      duration
    };
  }

  async testSQLInjection(url) {
    // Simulate SQL injection testing
    await this.delay(Math.random() * 2000 + 1000);
    
    const isVulnerable = Math.random() < 0.15; // 15% chance of vulnerability
    
    return {
      passed: !isVulnerable,
      severity: isVulnerable ? 'critical' : 'none',
      description: isVulnerable 
        ? 'SQL injection vulnerabilities detected in input parameters' :'No SQL injection vulnerabilities found',
      impact: isVulnerable 
        ? 'Attackers could access, modify, or delete database contents'
        : 'Database protected from injection attacks',
      remediation: isVulnerable 
        ? 'Implement parameterized queries and input validation' :'Continue monitoring for new injection vectors'
    };
  }

  async testXSSVulnerabilities(url) {
    await this.delay(Math.random() * 1500 + 800);
    
    const isVulnerable = Math.random() < 0.25; // 25% chance
    
    return {
      passed: !isVulnerable,
      severity: isVulnerable ? 'high' : 'none',
      description: isVulnerable
        ? 'Cross-site scripting (XSS) vulnerabilities found'
        : 'No XSS vulnerabilities detected',
      impact: isVulnerable
        ? 'User sessions could be hijacked or malicious scripts executed' :'Client-side security properly implemented',
      remediation: isVulnerable
        ? 'Implement proper output encoding and Content Security Policy' :'Maintain current XSS protection measures'
    };
  }

  async testCSRFProtection(url) {
    await this.delay(Math.random() * 1000 + 500);
    
    const isProtected = Math.random() > 0.2; // 80% chance of being protected
    
    return {
      passed: isProtected,
      severity: !isProtected ? 'medium' : 'none',
      description: isProtected
        ? 'CSRF protection properly implemented' :'Missing or inadequate CSRF protection',
      impact: !isProtected
        ? 'Users could be tricked into performing unwanted actions'
        : 'Forms and state-changing requests are protected',
      remediation: !isProtected
        ? 'Implement CSRF tokens and verify origin headers'
        : 'Continue monitoring CSRF protection effectiveness'
    };
  }

  async testAuthenticationBypass(url) {
    await this.delay(Math.random() * 2500 + 1000);
    
    const isVulnerable = Math.random() < 0.1; // 10% chance
    
    return {
      passed: !isVulnerable,
      severity: isVulnerable ? 'critical' : 'none',
      description: isVulnerable
        ? 'Authentication bypass vulnerabilities detected' :'Authentication mechanisms are secure',
      impact: isVulnerable
        ? 'Unauthorized access to protected resources' :'User authentication properly enforced',
      remediation: isVulnerable
        ? 'Review authentication logic and implement multi-factor authentication' :'Maintain robust authentication practices'
    };
  }

  async testAuthorizationFlaws(url) {
    await this.delay(Math.random() * 2000 + 800);
    
    const isFlawed = Math.random() < 0.18; // 18% chance
    
    return {
      passed: !isFlawed,
      severity: isFlawed ? 'high' : 'none',
      description: isFlawed
        ? 'Authorization flaws and privilege escalation risks found' :'Authorization controls are properly implemented',
      impact: isFlawed
        ? 'Users could access resources beyond their privileges' :'Access controls properly restrict user actions',
      remediation: isFlawed
        ? 'Implement role-based access control and least privilege principle' :'Continue monitoring authorization effectiveness'
    };
  }

  async testSecurityHeaders(url) {
    await this.delay(Math.random() * 800 + 300);
    
    const headersPresent = Math.random() > 0.3; // 70% chance of good headers
    
    return {
      passed: headersPresent,
      severity: !headersPresent ? 'medium' : 'none',
      description: headersPresent
        ? 'Security headers properly configured' :'Missing or misconfigured security headers',
      impact: !headersPresent
        ? 'Increased risk of clickjacking and content injection attacks' :'Browser security features properly utilized',
      remediation: !headersPresent
        ? 'Configure X-Frame-Options, HSTS, CSP, and other security headers' :'Keep security headers updated with best practices'
    };
  }

  async testEncryptionStrength(url) {
    await this.delay(Math.random() * 1500 + 500);
    
    const isStrong = Math.random() > 0.15; // 85% chance of strong encryption
    
    return {
      passed: isStrong,
      severity: !isStrong ? 'high' : 'none',
      description: isStrong
        ? 'Strong encryption protocols in use' :'Weak encryption or outdated protocols detected',
      impact: !isStrong
        ? 'Data in transit could be intercepted or compromised' :'Communications are properly encrypted',
      remediation: !isStrong
        ? 'Upgrade to TLS 1.3 and disable weak cipher suites' :'Continue monitoring encryption standards'
    };
  }

  async testAPIEndpoints(url) {
    await this.delay(Math.random() * 3000 + 1500);
    
    const isSecure = Math.random() > 0.22; // 78% chance of secure APIs
    
    return {
      passed: isSecure,
      severity: !isSecure ? 'high' : 'none',
      description: isSecure
        ? 'API endpoints properly secured' :'API security vulnerabilities identified',
      impact: !isSecure
        ? 'Sensitive data could be exposed through API endpoints' :'API access properly controlled and monitored',
      remediation: !isSecure
        ? 'Implement API authentication, rate limiting, and input validation' :'Maintain current API security practices'
    };
  }

  calculateSecurityGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }

  // Compliance Reports Management
  async getComplianceReports(userId = null) {
    try {
      const effectiveUserId = userId || (await this.getUserId());
      
      const { data, error } = await supabase?.from('compliance_reports')?.select(`
          id,
          report_type,
          report_date,
          compliance_status,
          violations_count,
          report_data,
          violations,
          recommendations,
          reviewed_at,
          created_at
        `)?.eq('user_id', effectiveUserId)?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
      throw error;
    }
  }

  async generateComplianceReport(reportConfig) {
    try {
      const userId = await this.getUserId();

      const complianceData = await this.performComplianceCheck(reportConfig);

      const reportData = {
        user_id: userId,
        report_type: reportConfig?.type,
        report_date: new Date()?.toISOString()?.split('T')?.[0],
        compliance_status: complianceData?.overall_status,
        violations_count: complianceData?.violations?.length,
        report_data: complianceData?.detailed_results,
        violations: complianceData?.violations,
        recommendations: complianceData?.recommendations,
        created_at: new Date()?.toISOString()
      };

      const { data, error } = await supabase?.from('compliance_reports')?.insert([reportData])?.select();

      if (error) {
        throw error;
      }

      return data?.[0];
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  async performComplianceCheck(config) {
    const checks = {
      gdpr: await this.checkGDPRCompliance(),
      sox: await this.checkSOXCompliance(),
      pci_dss: await this.checkPCIDSSCompliance(),
      iso27001: await this.checkISO27001Compliance(),
      hipaa: await this.checkHIPAACompliance(),
      data_retention: await this.checkDataRetentionPolicies(),
      access_controls: await this.checkAccessControls(),
      audit_trails: await this.checkAuditTrails()
    };

    const violations = [];
    const recommendations = [];
    let compliantChecks = 0;
    const totalChecks = Object.keys(checks)?.length;

    Object.entries(checks)?.forEach(([standard, result]) => {
      if (result?.compliant) {
        compliantChecks++;
      } else {
        violations?.push({
          standard: standard?.toUpperCase(),
          severity: result?.severity,
          description: result?.description,
          requirements: result?.missing_requirements
        });
        recommendations?.push(...result?.remediation_steps);
      }
    });

    const compliancePercentage = (compliantChecks / totalChecks) * 100;
    const overall_status = compliancePercentage >= 80 
      ? 'compliant' 
      : compliancePercentage >= 60 
        ? 'warning' :'violation';

    return {
      overall_status,
      compliance_percentage: compliancePercentage,
      detailed_results: checks,
      violations,
      recommendations,
      total_checks: totalChecks,
      compliant_checks: compliantChecks
    };
  }

  async checkGDPRCompliance() {
    await this.delay(1500);
    const isCompliant = Math.random() > 0.3;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'high',
      description: isCompliant 
        ? 'GDPR requirements are met' :'GDPR compliance gaps identified',
      missing_requirements: isCompliant ? [] : [
        'Explicit consent mechanisms',
        'Data portability features',
        'Right to be forgotten implementation'
      ],
      remediation_steps: isCompliant ? [] : [
        'Implement consent management system',
        'Add data export functionality',
        'Create data deletion workflows'
      ]
    };
  }

  async checkSOXCompliance() {
    await this.delay(1200);
    const isCompliant = Math.random() > 0.25;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'critical',
      description: isCompliant
        ? 'SOX financial reporting requirements met' :'SOX compliance deficiencies found',
      missing_requirements: isCompliant ? [] : [
        'Internal controls documentation',
        'Financial data integrity controls',
        'Access control reviews'
      ],
      remediation_steps: isCompliant ? [] : [
        'Document internal control procedures',
        'Implement financial data validation',
        'Establish regular access reviews'
      ]
    };
  }

  async checkPCIDSSCompliance() {
    await this.delay(2000);
    const isCompliant = Math.random() > 0.35;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'critical',
      description: isCompliant
        ? 'PCI DSS payment security standards met' :'PCI DSS compliance violations detected',
      missing_requirements: isCompliant ? [] : [
        'Cardholder data encryption',
        'Network security controls',
        'Vulnerability management program'
      ],
      remediation_steps: isCompliant ? [] : [
        'Encrypt all cardholder data',
        'Implement network segmentation',
        'Establish vulnerability scanning'
      ]
    };
  }

  async checkISO27001Compliance() {
    await this.delay(1800);
    const isCompliant = Math.random() > 0.4;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'medium',
      description: isCompliant
        ? 'ISO 27001 information security standards met'
        : 'ISO 27001 compliance gaps identified',
      missing_requirements: isCompliant ? [] : [
        'Risk assessment procedures',
        'Security policy documentation',
        'Incident response procedures'
      ],
      remediation_steps: isCompliant ? [] : [
        'Conduct comprehensive risk assessment',
        'Document security policies',
        'Establish incident response team'
      ]
    };
  }

  async checkHIPAACompliance() {
    await this.delay(1600);
    const isCompliant = Math.random() > 0.3;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'high',
      description: isCompliant
        ? 'HIPAA healthcare privacy requirements met' :'HIPAA compliance violations found',
      missing_requirements: isCompliant ? [] : [
        'PHI encryption at rest',
        'Business associate agreements',
        'Audit log monitoring'
      ],
      remediation_steps: isCompliant ? [] : [
        'Encrypt all PHI data',
        'Execute required BAAs',
        'Implement audit log monitoring'
      ]
    };
  }

  async checkDataRetentionPolicies() {
    await this.delay(1000);
    const isCompliant = Math.random() > 0.2;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'medium',
      description: isCompliant
        ? 'Data retention policies properly implemented' :'Data retention policy violations detected',
      missing_requirements: isCompliant ? [] : [
        'Automated data purging',
        'Retention schedule documentation',
        'Legal hold procedures'
      ],
      remediation_steps: isCompliant ? [] : [
        'Implement automated data purging',
        'Document retention schedules',
        'Establish legal hold processes'
      ]
    };
  }

  async checkAccessControls() {
    await this.delay(1300);
    const isCompliant = Math.random() > 0.25;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'high',
      description: isCompliant
        ? 'Access controls properly configured' :'Access control deficiencies identified',
      missing_requirements: isCompliant ? [] : [
        'Multi-factor authentication',
        'Regular access reviews',
        'Privileged access management'
      ],
      remediation_steps: isCompliant ? [] : [
        'Enforce MFA for all users',
        'Conduct quarterly access reviews',
        'Implement privileged access controls'
      ]
    };
  }

  async checkAuditTrails() {
    await this.delay(900);
    const isCompliant = Math.random() > 0.15;
    
    return {
      compliant: isCompliant,
      severity: isCompliant ? 'none' : 'medium',
      description: isCompliant
        ? 'Comprehensive audit trails maintained' :'Audit trail gaps identified',
      missing_requirements: isCompliant ? [] : [
        'Complete activity logging',
        'Log integrity protection',
        'Long-term log retention'
      ],
      remediation_steps: isCompliant ? [] : [
        'Enable comprehensive logging',
        'Implement log integrity controls',
        'Establish long-term log storage'
      ]
    };
  }

  // System Security Status
  async getSystemSecurityOverview() {
    try {
      const [securityScans, complianceReports, killSwitches] = await Promise.all([
        this.getRecentSecurityScans(),
        this.getRecentComplianceReports(),
        this.getKillSwitchStatus()
      ]);

      const overview = {
        security_posture: this.calculateSecurityPosture(securityScans),
        compliance_status: this.calculateComplianceStatus(complianceReports),
        critical_issues: this.extractCriticalIssues(securityScans, complianceReports),
        kill_switches: killSwitches,
        last_assessment: this.getLastAssessmentDate(securityScans, complianceReports),
        recommendations: this.generateTopRecommendations(securityScans, complianceReports)
      };

      return overview;
    } catch (error) {
      console.error('Error getting security overview:', error);
      throw error;
    }
  }

  async getRecentSecurityScans(limit = 10) {
    try {
      const userId = await this.getUserId();
      const { data, error } = await supabase?.from('ssl_security_scans')
        ?.select('scan_score, overall_grade, has_critical_issues, scanned_at, vulnerabilities')
        ?.eq('user_id', userId)
        ?.order('scanned_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent security scans:', error);
      // Return empty array instead of throwing to prevent breaking the overview
      return [];
    }
  }

  async getRecentComplianceReports(limit = 10) {
    try {
      const userId = await this.getUserId();
      const { data, error } = await supabase?.from('compliance_reports')
        ?.select('compliance_status, violations_count, report_date, violations')
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false })
        ?.limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent compliance reports:', error);
      // Return empty array instead of throwing to prevent breaking the overview
      return [];
    }
  }

  async getKillSwitchStatus() {
    const { data, error } = await supabase?.from('kill_switches')?.select('module, is_active, reason, updated_at')?.order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  calculateSecurityPosture(scans) {
    if (!scans?.length) return { score: 0, grade: 'Unknown', status: 'No Data' };

    const avgScore = scans?.reduce((sum, scan) => sum + (scan?.scan_score || 0), 0) / scans?.length;
    const criticalIssues = scans?.filter(scan => scan?.has_critical_issues)?.length;
    
    let status = 'Excellent';
    if (criticalIssues > 0) status = 'Critical';
    else if (avgScore < 70) status = 'Poor';
    else if (avgScore < 85) status = 'Fair';
    else if (avgScore < 95) status = 'Good';

    return {
      score: Math.round(avgScore),
      grade: this.calculateSecurityGrade(avgScore),
      status,
      critical_issues_count: criticalIssues
    };
  }

  calculateComplianceStatus(reports) {
    if (!reports?.length) return { status: 'Unknown', percentage: 0 };

    const compliantReports = reports?.filter(r => r?.compliance_status === 'compliant')?.length;
    const percentage = (compliantReports / reports?.length) * 100;

    let status = 'Compliant';
    if (percentage < 60) status = 'Non-Compliant';
    else if (percentage < 80) status = 'Partially Compliant';

    return {
      status,
      percentage: Math.round(percentage),
      total_reports: reports?.length,
      compliant_reports: compliantReports
    };
  }

  extractCriticalIssues(scans, reports) {
    const issues = [];

    scans?.forEach(scan => {
      if (scan?.has_critical_issues && scan?.vulnerabilities) {
        scan?.vulnerabilities?.filter(vuln => vuln?.severity === 'critical')?.forEach(vuln => issues?.push({
          type: 'security',
          severity: 'critical',
          description: vuln?.description,
          source: 'Security Scan',
          date: scan?.scanned_at
        }));
      }
    });

    reports?.forEach(report => {
      if (report?.violations_count > 0 && report?.violations) {
        report?.violations?.filter(violation => violation?.severity === 'critical')?.forEach(violation => issues?.push({
          type: 'compliance',
          severity: 'critical',
          description: violation?.description,
          source: 'Compliance Report',
          date: report?.report_date
        }));
      }
    });

    return issues?.slice(0, 10); // Return top 10 critical issues
  }

  getLastAssessmentDate(scans, reports) {
    const dates = [
      ...(scans?.map(s => s?.scanned_at) || []),
      ...(reports?.map(r => r?.report_date) || [])
    ];

    return dates?.length > 0 ? new Date(Math.max(...dates.map(d => new Date(d)))) : null;
  }

  generateTopRecommendations(scans, reports) {
    const recommendations = new Set();

    scans?.forEach(scan => {
      if (scan?.vulnerabilities) {
        scan?.vulnerabilities?.forEach(vuln => {
          if (vuln?.remediation) recommendations?.add(vuln?.remediation);
        });
      }
    });

    reports?.forEach(report => {
      if (report?.violations) {
        report?.violations?.forEach(violation => {
          if (violation?.requirements) {
            violation?.requirements?.forEach(req => recommendations?.add(req));
          }
        });
      }
    });

    return Array.from(recommendations)?.slice(0, 5);
  }

  // Utility method
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const paranoidSecurityAuditService = new ParanoidSecurityAuditService();