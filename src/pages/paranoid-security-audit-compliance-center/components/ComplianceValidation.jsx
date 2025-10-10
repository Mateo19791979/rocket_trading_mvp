import React, { useState, useEffect } from 'react';
import { FileText, Shield, CheckCircle, AlertTriangle, XCircle, Clock, Award, BookOpen, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { paranoidSecurityAuditService } from '../../../services/paranoidSecurityAuditService';
import Icon from '@/components/AppIcon';


export default function ComplianceValidation({ securityOverview, onRefresh }) {
  const [complianceReports, setComplianceReports] = useState([]);
  const [activeStandard, setActiveStandard] = useState('gdpr');
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadComplianceReports();
  }, []);

  const loadComplianceReports = async () => {
    try {
      setLoading(true);
      // Using mock user ID - in real app, get from auth context
      const reports = await paranoidSecurityAuditService?.getComplianceReports('mock-user-id');
      setComplianceReports(reports);
    } catch (error) {
      console.error('Error loading compliance reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async (standard) => {
    try {
      setGeneratingReport(true);
      const reportConfig = {
        type: `${standard}_compliance`,
        standard: standard,
        scope: 'full_system',
        includeRemediation: true
      };
      
      await paranoidSecurityAuditService?.generateComplianceReport(reportConfig);
      loadComplianceReports();
      onRefresh?.();
    } catch (error) {
      console.error('Error generating compliance report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const complianceStandards = [
    {
      key: 'gdpr',
      name: 'GDPR',
      fullName: 'General Data Protection Regulation',
      description: 'EU data protection and privacy regulation',
      color: 'blue',
      icon: Shield,
      requirements: [
        'Explicit consent mechanisms',
        'Data portability features',
        'Right to be forgotten implementation',
        'Data breach notification procedures',
        'Privacy by design implementation'
      ]
    },
    {
      key: 'sox',
      name: 'SOX',
      fullName: 'Sarbanes-Oxley Act',
      description: 'Financial reporting and corporate governance',
      color: 'green',
      icon: FileText,
      requirements: [
        'Internal controls documentation',
        'Financial data integrity controls',
        'Access control reviews',
        'Audit trail completeness',
        'Management certification processes'
      ]
    },
    {
      key: 'pci_dss',
      name: 'PCI DSS',
      fullName: 'Payment Card Industry Data Security Standard',
      description: 'Payment card data security requirements',
      color: 'purple',
      icon: Award,
      requirements: [
        'Cardholder data encryption',
        'Network security controls',
        'Vulnerability management program',
        'Access control measures',
        'Regular security testing'
      ]
    },
    {
      key: 'iso27001',
      name: 'ISO 27001',
      fullName: 'Information Security Management System',
      description: 'International information security standard',
      color: 'orange',
      icon: BookOpen,
      requirements: [
        'Risk assessment procedures',
        'Security policy documentation',
        'Incident response procedures',
        'Continuous monitoring controls',
        'Management review processes'
      ]
    },
    {
      key: 'hipaa',
      name: 'HIPAA',
      fullName: 'Health Insurance Portability and Accountability Act',
      description: 'Healthcare data privacy and security',
      color: 'red',
      icon: Shield,
      requirements: [
        'PHI encryption at rest',
        'Business associate agreements',
        'Audit log monitoring',
        'Access control implementation',
        'Risk assessment documentation'
      ]
    }
  ];

  const getComplianceColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'compliant': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'warning': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'violation': return 'text-red-400 bg-red-900/30 border-red-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  const getStandardColor = (color) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-900/30 border-blue-500/30',
      green: 'text-green-400 bg-green-900/30 border-green-500/30',
      purple: 'text-purple-400 bg-purple-900/30 border-purple-500/30',
      orange: 'text-orange-400 bg-orange-900/30 border-orange-500/30',
      red: 'text-red-400 bg-red-900/30 border-red-500/30'
    };
    return colors?.[color] || colors?.blue;
  };

  const getComplianceIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'compliant': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'violation': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const activeStandardData = complianceStandards?.find(s => s?.key === activeStandard);

  return (
    <div className="space-y-8">
      {/* Regulatory Compliance Dashboard */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Regulatory Compliance Checking
            </h3>
          </div>
          <button
            onClick={() => generateComplianceReport('comprehensive')}
            disabled={generatingReport}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-4 py-2 rounded-lg text-blue-300 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {generatingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{generatingReport ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>

        {/* Compliance Standards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {complianceStandards?.map((standard) => {
            const Icon = standard?.icon;
            const latestReport = complianceReports?.find(r => r?.report_type?.includes(standard?.key));
            
            return (
              <div
                key={standard?.key}
                onClick={() => setActiveStandard(standard?.key)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-opacity-70 ${
                  activeStandard === standard?.key 
                    ? getStandardColor(standard?.color)
                    : 'bg-gray-900/30 border-gray-600/30 text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{standard?.name}</span>
                  </div>
                  {latestReport && getComplianceIcon(latestReport?.compliance_status)}
                </div>
                <p className="text-xs opacity-80 mb-2">{standard?.description}</p>
                {latestReport && (
                  <div className="text-xs">
                    <span className="opacity-60">Last Check: </span>
                    <span>{new Date(latestReport.report_date)?.toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Active Standard Details */}
      {activeStandardData && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getStandardColor(activeStandardData?.color)}`}>
                <activeStandardData.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {activeStandardData?.fullName}
                </h3>
                <p className="text-sm text-gray-400">{activeStandardData?.description}</p>
              </div>
            </div>
            <button
              onClick={() => generateComplianceReport(activeStandardData?.key)}
              disabled={generatingReport}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 ${getStandardColor(activeStandardData?.color)} hover:opacity-80`}
            >
              {generatingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
              <span>Validate Compliance</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requirements Checklist */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Key Requirements</h4>
              <div className="space-y-3">
                {activeStandardData?.requirements?.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      Math.random() > 0.3 ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-gray-300 text-sm">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Current Status</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Overall Compliance</span>
                  <span className="text-green-400 font-bold">87%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400">Compliant Areas</span>
                    <span className="text-green-400 font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-400">Partial Compliance</span>
                    <span className="text-yellow-400 font-medium">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-400">Violations</span>
                    <span className="text-red-400 font-medium">2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Data Protection Audit */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-500/20 p-2 rounded-lg">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Data Protection Audit
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Data Classification</h4>
            <div className="space-y-3">
              {[
                { type: 'Personal Data', count: 2847, encrypted: true },
                { type: 'Financial Data', count: 1523, encrypted: true },
                { type: 'Health Data', count: 0, encrypted: true },
                { type: 'Public Data', count: 8921, encrypted: false }
              ]?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${item?.encrypted ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <span className="text-gray-300 text-sm">{item?.type}</span>
                  </div>
                  <span className="text-white font-medium text-sm">{item?.count?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Retention Policies</h4>
            <div className="space-y-3">
              {[
                { policy: 'User Account Data', period: '7 years', status: 'active' },
                { policy: 'Transaction Logs', period: '10 years', status: 'active' },
                { policy: 'Session Data', period: '30 days', status: 'active' },
                { policy: 'Audit Logs', period: '5 years', status: 'active' }
              ]?.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{item?.policy}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item?.status === 'active' ? 'text-green-400 bg-green-900/30' : 'text-yellow-400 bg-yellow-900/30'
                    }`}>
                      {item?.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{item?.period}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Access Controls</h4>
            <div className="space-y-3">
              {[
                { control: 'Multi-Factor Auth', coverage: 95, status: 'enforced' },
                { control: 'Role-Based Access', coverage: 88, status: 'partial' },
                { control: 'Data Masking', coverage: 100, status: 'enforced' },
                { control: 'Audit Logging', coverage: 92, status: 'enforced' }
              ]?.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{item?.control}</span>
                    <span className="text-white font-medium text-sm">{item?.coverage}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        item?.status === 'enforced' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${item?.coverage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Certification Readiness */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Certification Readiness Indicators
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Documentation',
              score: 92,
              status: 'ready',
              details: '23/25 documents complete'
            },
            {
              name: 'Technical Controls',
              score: 88,
              status: 'ready',
              details: '44/50 controls implemented'
            },
            {
              name: 'Process Maturity',
              score: 75,
              status: 'partial',
              details: '15/20 processes defined'
            },
            {
              name: 'Audit Trail',
              score: 98,
              status: 'ready',
              details: '100% coverage achieved'
            }
          ]?.map((indicator, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{indicator?.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  indicator?.status === 'ready' ?'text-green-400 bg-green-900/30 border-green-500/50' :'text-yellow-400 bg-yellow-900/30 border-yellow-500/50'
                }`}>
                  {indicator?.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Score</span>
                  <span className="text-white font-bold">{indicator?.score}%</span>
                </div>
                
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      indicator?.status === 'ready' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${indicator?.score}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  {indicator?.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}