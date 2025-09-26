import React, { useState, useEffect } from 'react';
import { Shield, Globe, Key, Activity, AlertTriangle, CheckCircle, Plus, Settings, TrendingUp, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { dnsSslService } from '../../services/dnsSslService';
import Icon from '../../components/AppIcon';


const DnsSslManagementPage = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSecrets, setShowSecrets] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setRefreshing(true);
      const data = await dnsSslService?.getDnsSslOverview();
      setOverview(data);
      setError(null);
    } catch (err) {
      setError('Failed to load DNS & SSL overview');
      console.error('DNS SSL overview error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRunHealthCheck = async (checkId) => {
    try {
      await dnsSslService?.runHealthCheck(checkId);
      await loadOverview(); // Refresh data
    } catch (err) {
      setError('Failed to run health check');
    }
  };

  const handleRunSecurityScan = async (certId) => {
    try {
      await dnsSslService?.runSecurityScan(certId);
      await loadOverview(); // Refresh data
    } catch (err) {
      setError('Failed to run security scan');
    }
  };

  const toggleSecretVisibility = (id) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev?.[id] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    // Could show a toast notification here
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-500 bg-green-500/10',
      valid: 'text-green-500 bg-green-500/10',
      expired: 'text-red-500 bg-red-500/10',
      expiring_soon: 'text-yellow-500 bg-yellow-500/10',
      pending: 'text-blue-500 bg-blue-500/10',
      inactive: 'text-gray-500 bg-gray-500/10',
      suspended: 'text-red-500 bg-red-500/10'
    };
    return colors?.[status] || 'text-gray-500 bg-gray-500/10';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-500',
      'A': 'text-green-400',
      'B': 'text-yellow-500',
      'C': 'text-orange-500',
      'D': 'text-red-500',
      'F': 'text-red-600'
    };
    return colors?.[grade] || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[...Array(4)]?.map((_, i) => (
                <div key={i} className="h-32 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              DNS & SSL Management
            </h1>
            <p className="text-slate-300">
              Secure domain configuration and certificate management for your trading platform
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadOverview}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Add Domain
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        {overview?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{overview?.stats?.activeDomains}/{overview?.stats?.totalDomains}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Active Domains</h3>
              <p className="text-slate-400 text-sm">Configured and verified</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Key className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{overview?.stats?.validCertificates}/{overview?.stats?.totalCertificates}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">SSL Certificates</h3>
              <p className="text-slate-400 text-sm">Valid and active</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className={`w-8 h-8 ${overview?.stats?.expiringCertificates > 0 ? 'text-yellow-400' : 'text-green-400'}`} />
                <span className={`text-2xl font-bold ${overview?.stats?.expiringCertificates > 0 ? 'text-yellow-400' : 'text-white'}`}>
                  {overview?.stats?.expiringCertificates}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Expiring Soon</h3>
              <p className="text-slate-400 text-sm">Next 30 days</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {overview?.stats?.averageSecurityScore ? Math.round(overview?.stats?.averageSecurityScore) : 0}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Security Score</h3>
              <p className="text-slate-400 text-sm">Average SSL grade</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-white/10">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'domains', label: 'Domains', icon: Globe },
              { id: 'certificates', label: 'SSL Certificates', icon: Key },
              { id: 'monitoring', label: 'Health Monitoring', icon: Activity },
              { id: 'security', label: 'Security Scans', icon: Shield }
            ]?.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-400' :'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Domains */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Recent Domains
                </h3>
                <div className="space-y-3">
                  {overview?.domains?.slice(0, 5)?.map((domain) => (
                    <div key={domain?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{domain?.domain_name}</div>
                        <div className="text-sm text-slate-400">
                          Provider: {domain?.dns_provider} • Expires: {new Date(domain.expires_at)?.toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(domain?.status)}`}>
                        {domain?.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Certificates */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  SSL Certificates
                </h3>
                <div className="space-y-3">
                  {overview?.recentCertificates?.map((cert) => (
                    <div key={cert?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{cert?.common_name}</div>
                        <div className="text-sm text-slate-400">
                          {cert?.certificate_type} • Expires: {new Date(cert.expires_at)?.toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(cert?.status)}`}>
                        {cert?.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Monitoring */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Health Monitoring
                </h3>
                <div className="space-y-3">
                  {overview?.recentHealthChecks?.map((check) => (
                    <div key={check?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{check?.check_type}</div>
                        <div className="text-sm text-slate-400">
                          {check?.check_url} • {check?.response_time_ms}ms
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {check?.is_healthy ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <button 
                          onClick={() => handleRunHealthCheck(check?.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Run Check
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Scans */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Scans
                </h3>
                <div className="space-y-3">
                  {overview?.recentSecurityScans?.map((scan) => (
                    <div key={scan?.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{scan?.scan_type}</div>
                        <div className="text-sm text-slate-400">
                          Score: {scan?.scan_score}/100 • {new Date(scan.scanned_at)?.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getGradeColor(scan?.overall_grade)}`}>
                          {scan?.overall_grade}
                        </span>
                        {scan?.has_critical_issues && (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Domains Tab */}
          {activeTab === 'domains' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-white">Domain Configuration</h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search domains..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e?.target?.value)}
                      className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e?.target?.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending_verification">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {overview?.domains?.map((domain) => (
                  <div key={domain?.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-white">{domain?.domain_name}</h4>
                          {domain?.is_primary && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Primary</span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(domain?.status)}`}>
                            {domain?.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Provider:</span>
                            <span className="text-white ml-2">{domain?.dns_provider}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Expires:</span>
                            <span className="text-white ml-2">
                              {domain?.expires_at ? new Date(domain.expires_at)?.toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Auto-renew:</span>
                            <span className="text-white ml-2">{domain?.auto_renew ? 'Yes' : 'No'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">WHOIS Protected:</span>
                            <span className="text-white ml-2">{domain?.whois_protection ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs content would be similar... */}
          {activeTab === 'certificates' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">SSL Certificate Management</h3>
              <div className="text-center text-slate-400 py-12">
                <Key className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>SSL Certificate management interface coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Health Monitoring Dashboard</h3>
              <div className="text-center text-slate-400 py-12">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Health monitoring dashboard coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Security Scan Results</h3>
              <div className="text-center text-slate-400 py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Security scanning dashboard coming soon...</p>
              </div>
            </div>
          )}

        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
            <Globe className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">DNS Configuration</h4>
            <p className="text-slate-400 text-sm mb-4">Configure A, CNAME, MX records and more</p>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Manage DNS
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
            <Key className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">SSL Certificate</h4>
            <p className="text-slate-400 text-sm mb-4">Generate and manage SSL certificates</p>
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Request Certificate
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
            <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Security Scan</h4>
            <p className="text-slate-400 text-sm mb-4">Run comprehensive security analysis</p>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Start Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DnsSslManagementPage;