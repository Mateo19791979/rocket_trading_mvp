import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Zap, FileText, Activity } from 'lucide-react';
import { paranoidSecurityAuditService } from '../../services/paranoidSecurityAuditService';
import ComprehensiveSecurityAudit from './components/ComprehensiveSecurityAudit';
import ComplianceValidation from './components/ComplianceValidation';
import SecurityAssessmentDashboard from './components/SecurityAssessmentDashboard';
import IncidentResponseTesting from './components/IncidentResponseTesting';
import SecurityCertificationPanel from './components/SecurityCertificationPanel';
import Icon from '@/components/AppIcon';


export default function ParanoidSecurityAuditComplianceCenter() {
  const [securityOverview, setSecurityOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('audit');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadSecurityOverview();
  }, []);

  const loadSecurityOverview = async () => {
    try {
      setLoading(true);
      const overview = await paranoidSecurityAuditService?.getSystemSecurityOverview();
      setSecurityOverview(overview);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error('Error loading security overview:', err);
      setError('Failed to load security overview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSecurityOverview();
  };

  const getSecurityStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'text-green-400 bg-green-900/30 border-green-500';
      case 'good': return 'text-blue-400 bg-blue-900/30 border-blue-500';
      case 'fair': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      case 'poor': return 'text-orange-400 bg-orange-900/30 border-orange-500';
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-500';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500';
    }
  };

  const getComplianceStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'compliant': return 'text-green-400 bg-green-900/30 border-green-500';
      case 'partially compliant': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      case 'non-compliant': return 'text-red-400 bg-red-900/30 border-red-500';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Security Assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-orange-900/10">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-red-500/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/30">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Paranoid Security Audit & Compliance Center
                </h1>
                <p className="text-gray-400 mt-1">
                  Institutional-grade security validation and penetration testing for production certification
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-white font-medium">
                  {lastRefresh?.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 px-4 py-2 rounded-lg text-red-300 transition-colors flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-6 py-4">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}
      {/* Security Status Overview */}
      {securityOverview && (
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Security Posture */}
            <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${getSecurityStatusColor(securityOverview?.security_posture?.status)} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Security Posture</h3>
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Score</span>
                  <span className="text-2xl font-bold text-white">
                    {securityOverview?.security_posture?.score || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Grade</span>
                  <span className="text-lg font-semibold text-white">
                    {securityOverview?.security_posture?.grade || 'N/A'}
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {securityOverview?.security_posture?.status || 'Unknown'}
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border ${getComplianceStatusColor(securityOverview?.compliance_status?.status)} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Compliance</h3>
                <FileText className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rate</span>
                  <span className="text-2xl font-bold text-white">
                    {securityOverview?.compliance_status?.percentage || 0}%
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {securityOverview?.compliance_status?.status || 'Unknown'}
                </div>
                <div className="text-xs text-gray-400">
                  {securityOverview?.compliance_status?.compliant_reports || 0} of {securityOverview?.compliance_status?.total_reports || 0} reports
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-red-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Critical Issues</h3>
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total</span>
                  <span className="text-2xl font-bold text-red-400">
                    {securityOverview?.critical_issues?.length || 0}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Require immediate attention
                </div>
              </div>
            </div>

            {/* Kill Switches */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Kill Switches</h3>
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Active</span>
                  <span className="text-2xl font-bold text-orange-400">
                    {securityOverview?.kill_switches?.filter(ks => ks?.is_active)?.length || 0}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Emergency controls engaged
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-800/30 rounded-xl p-1 mb-8">
            {[
              { key: 'audit', label: 'Security Audit', icon: Shield },
              { key: 'compliance', label: 'Compliance', icon: FileText },
              { key: 'dashboard', label: 'Assessment', icon: Activity },
              { key: 'incident', label: 'Incident Response', icon: AlertTriangle },
              { key: 'certification', label: 'Certification', icon: CheckCircle }
            ]?.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === key
                    ? 'bg-red-600/30 text-red-300 border border-red-500/30' :'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'audit' && (
              <ComprehensiveSecurityAudit 
                securityOverview={securityOverview}
                onRefresh={handleRefresh}
              />
            )}

            {activeTab === 'compliance' && (
              <ComplianceValidation 
                securityOverview={securityOverview}
                onRefresh={handleRefresh}
              />
            )}

            {activeTab === 'dashboard' && (
              <SecurityAssessmentDashboard 
                securityOverview={securityOverview}
                onRefresh={handleRefresh}
              />
            )}

            {activeTab === 'incident' && (
              <IncidentResponseTesting 
                securityOverview={securityOverview}
                onRefresh={handleRefresh}
              />
            )}

            {activeTab === 'certification' && (
              <SecurityCertificationPanel 
                securityOverview={securityOverview}
                onRefresh={handleRefresh}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}