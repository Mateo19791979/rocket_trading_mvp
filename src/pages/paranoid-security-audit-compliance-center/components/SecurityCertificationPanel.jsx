import React, { useState, useEffect } from 'react';
import { Award, FileText, CheckCircle, AlertTriangle, Download, Eye, Users, Shield, Calendar, Target } from 'lucide-react';

export default function SecurityCertificationPanel({ securityOverview, onRefresh }) {
  const [certificationData, setCertificationData] = useState({});
  const [auditReports, setAuditReports] = useState([]);
  const [executiveSummary, setExecutiveSummary] = useState({});
  const [productionReadiness, setProductionReadiness] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCertificationData();
  }, []);

  const loadCertificationData = () => {
    // Generate certification data based on security overview
    setCertificationData({
      overall_score: securityOverview?.security_posture?.score || 85,
      compliance_percentage: securityOverview?.compliance_status?.percentage || 87,
      critical_issues: securityOverview?.critical_issues?.length || 2,
      certification_status: 'production_ready',
      last_assessment: new Date()?.toISOString(),
      next_review: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)?.toISOString(),
      certifications: [
        { name: 'SOC 2 Type II', status: 'certified', expiry: '2024-12-31', score: 92 },
        { name: 'ISO 27001', status: 'in_progress', expiry: null, score: 78 },
        { name: 'PCI DSS Level 1', status: 'certified', expiry: '2024-06-30', score: 88 },
        { name: 'GDPR Compliance', status: 'certified', expiry: null, score: 91 },
        { name: 'HIPAA', status: 'not_applicable', expiry: null, score: 0 }
      ]
    });

    setAuditReports([
      {
        id: 1,
        title: 'Comprehensive Security Assessment Report',
        type: 'security_audit',
        date: '2025-10-06T15:58:00Z',
        status: 'final',
        pages: 47,
        findings: {
          critical: 2,
          high: 5,
          medium: 12,
          low: 8
        },
        recommendations: 15,
        file_size: '2.3 MB'
      },
      {
        id: 2,
        title: 'Penetration Testing Executive Summary',
        type: 'pentest',
        date: '2025-10-05T14:30:00Z',
        status: 'final',
        pages: 23,
        findings: {
          critical: 1,
          high: 3,
          medium: 8,
          low: 12
        },
        recommendations: 8,
        file_size: '1.8 MB'
      },
      {
        id: 3,
        title: 'Compliance Validation Report',
        type: 'compliance',
        date: '2025-10-04T11:20:00Z',
        status: 'final',
        pages: 31,
        findings: {
          critical: 0,
          high: 2,
          medium: 6,
          low: 4
        },
        recommendations: 10,
        file_size: '1.5 MB'
      },
      {
        id: 4,
        title: 'Infrastructure Security Analysis',
        type: 'infrastructure',
        date: '2025-10-03T09:15:00Z',
        status: 'draft',
        pages: 19,
        findings: {
          critical: 1,
          high: 4,
          medium: 9,
          low: 7
        },
        recommendations: 12,
        file_size: '1.1 MB'
      }
    ]);

    setExecutiveSummary({
      overall_security_posture: 'Strong',
      key_strengths: [
        'Robust authentication and authorization controls',
        'Comprehensive logging and monitoring',
        'Regular security assessments and updates',
        'Strong incident response capabilities'
      ],
      areas_for_improvement: [
        'Enhanced API rate limiting implementation',
        'Improved security awareness training program',
        'Automated vulnerability management process'
      ],
      business_impact: {
        risk_reduction: 78,
        compliance_improvement: 23,
        operational_efficiency: 15
      },
      investment_recommendations: [
        'Advanced threat detection platform - $50K',
        'Security orchestration automation - $75K',
        'Enhanced monitoring infrastructure - $30K'
      ]
    });

    setProductionReadiness({
      security_clearance: 'approved',
      deployment_risk: 'low',
      readiness_score: 92,
      prerequisites_met: 24,
      total_prerequisites: 26,
      blocking_issues: 0,
      warning_items: 2,
      go_live_approval: 'conditional',
      conditions: [
        'Complete remaining API security hardening',
        'Finalize incident response documentation'
      ],
      approved_environments: ['staging', 'production'],
      approval_date: '2025-10-06T15:58:00Z',
      valid_until: '2026-01-06T15:58:00Z'
    });
  };

  const getCertificationStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'certified': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'in_progress': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'expired': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'not_applicable': return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  const getReportStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'final': return 'text-green-400 bg-green-900/30';
      case 'draft': return 'text-yellow-400 bg-yellow-900/30';
      case 'review': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getSeverityIcon = (severity, count) => {
    const iconClass = "w-4 h-4";
    if (count === 0) return <span className="text-gray-500">-</span>;
    
    switch (severity?.toLowerCase()) {
      case 'critical': return <AlertTriangle className={`${iconClass} text-red-400`} />;
      case 'high': return <AlertTriangle className={`${iconClass} text-orange-400`} />;
      case 'medium': return <AlertTriangle className={`${iconClass} text-yellow-400`} />;
      case 'low': return <AlertTriangle className={`${iconClass} text-green-400`} />;
      default: return <span className="text-gray-500">-</span>;
    }
  };

  const downloadReport = (report) => {
    // Simulate report download
    console.log('Downloading report:', report?.title);
  };

  const generateExecutiveReport = () => {
    // Simulate executive report generation
    console.log('Generating executive security report...');
  };

  return (
    <div className="space-y-8">
      {/* Comprehensive Security Reports */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Comprehensive Security Reports
            </h3>
          </div>
          <button
            onClick={generateExecutiveReport}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-4 py-2 rounded-lg text-blue-300 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Generate Executive Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {auditReports?.map((report) => (
            <div key={report?.id} className="bg-gray-900/50 rounded-lg border border-gray-600/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">{report?.title}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getReportStatusColor(report?.status)}`}>
                  {report?.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-400">Date</div>
                  <div className="text-white">{new Date(report.date)?.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Pages</div>
                  <div className="text-white">{report?.pages}</div>
                </div>
                <div>
                  <div className="text-gray-400">Size</div>
                  <div className="text-white">{report?.file_size}</div>
                </div>
                <div>
                  <div className="text-gray-400">Recommendations</div>
                  <div className="text-white">{report?.recommendations}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {getSeverityIcon('critical', report?.findings?.critical)}
                    <span className="text-red-400">{report?.findings?.critical}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getSeverityIcon('high', report?.findings?.high)}
                    <span className="text-orange-400">{report?.findings?.high}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getSeverityIcon('medium', report?.findings?.medium)}
                    <span className="text-yellow-400">{report?.findings?.medium}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getSeverityIcon('low', report?.findings?.low)}
                    <span className="text-green-400">{report?.findings?.low}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadReport(report)}
                  className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-3 py-2 rounded text-blue-300 transition-colors flex items-center justify-center space-x-1 text-sm"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 px-3 py-2 rounded text-gray-300 transition-colors flex items-center justify-center space-x-1 text-sm">
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Executive Security Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-500/20 p-2 rounded-lg">
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Executive Security Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Key Strengths</span>
              </h4>
              <ul className="space-y-2">
                {executiveSummary?.key_strengths?.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span>Areas for Improvement</span>
              </h4>
              <ul className="space-y-2">
                {executiveSummary?.areas_for_improvement?.map((area, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Business Impact</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Risk Reduction</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700/50 rounded-full h-1.5">
                      <div
                        className="bg-green-400 h-1.5 rounded-full"
                        style={{ width: `${executiveSummary?.business_impact?.risk_reduction}%` }}
                      ></div>
                    </div>
                    <span className="text-green-400 text-sm font-medium">
                      {executiveSummary?.business_impact?.risk_reduction}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Compliance Improvement</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700/50 rounded-full h-1.5">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full"
                        style={{ width: `${executiveSummary?.business_impact?.compliance_improvement}%` }}
                      ></div>
                    </div>
                    <span className="text-blue-400 text-sm font-medium">
                      {executiveSummary?.business_impact?.compliance_improvement}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Operational Efficiency</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700/50 rounded-full h-1.5">
                      <div
                        className="bg-purple-400 h-1.5 rounded-full"
                        style={{ width: `${executiveSummary?.business_impact?.operational_efficiency}%` }}
                      ></div>
                    </div>
                    <span className="text-purple-400 text-sm font-medium">
                      {executiveSummary?.business_impact?.operational_efficiency}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Investment Recommendations</h4>
              <div className="space-y-2">
                {executiveSummary?.investment_recommendations?.map((recommendation, index) => (
                  <div key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Production Security Clearance Assessment */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Production Security Clearance Assessment
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              productionReadiness?.security_clearance === 'approved' ?'text-green-400 bg-green-900/30 border border-green-500/50' :'text-yellow-400 bg-yellow-900/30 border border-yellow-500/50'
            }`}>
              {productionReadiness?.security_clearance?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Readiness Assessment</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Overall Score</span>
                    <span className="text-2xl font-bold text-green-400">
                      {productionReadiness?.readiness_score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3">
                    <div
                      className="bg-green-400 h-3 rounded-full"
                      style={{ width: `${productionReadiness?.readiness_score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Prerequisites Met</span>
                    <span className="text-white">
                      {productionReadiness?.prerequisites_met}/{productionReadiness?.total_prerequisites}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Blocking Issues</span>
                    <span className="text-red-400 font-medium">{productionReadiness?.blocking_issues}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Warning Items</span>
                    <span className="text-yellow-400 font-medium">{productionReadiness?.warning_items}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Deployment Risk</span>
                    <span className={`font-medium ${
                      productionReadiness?.deployment_risk === 'low' ? 'text-green-400' :
                      productionReadiness?.deployment_risk === 'medium'? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {productionReadiness?.deployment_risk?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Go-Live Conditions</h4>
              {productionReadiness?.conditions?.length > 0 ? (
                <ul className="space-y-2">
                  {productionReadiness?.conditions?.map((condition, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{condition}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">All conditions have been satisfied</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Certification Status</h4>
              <div className="space-y-3">
                {certificationData?.certifications?.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{cert?.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getCertificationStatusColor(cert?.status)}`}>
                      {cert?.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Approval Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Approval Date</span>
                  <span className="text-white">
                    {new Date(productionReadiness.approval_date)?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Valid Until</span>
                  <span className="text-white">
                    {new Date(productionReadiness.valid_until)?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Environments</span>
                  <div className="flex space-x-1">
                    {productionReadiness?.approved_environments?.map((env, index) => (
                      <span key={index} className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs">
                        {env}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Next Actions</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Schedule quarterly review</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">Address remaining conditions</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Maintain security posture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}