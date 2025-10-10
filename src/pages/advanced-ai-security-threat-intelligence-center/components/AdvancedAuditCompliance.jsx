import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, CheckCircle, Download, Clock, Award, Gavel } from 'lucide-react';

export default function AdvancedAuditCompliance({ complianceScore, auditSystemStatus, onComplianceUpdate }) {
  const [auditData, setAuditData] = useState({
    blockchainAudit: {
      immutableRecords: 15847,
      blockHeight: 1284567,
      hashVerification: 100,
      dataIntegrity: 99.98
    },
    complianceAutomation: {
      regulatoryRules: 234,
      automatedChecks: 1456,
      complianceRate: 98.7,
      violationsDetected: 3
    },
    realTimeScoring: {
      currentScore: complianceScore,
      trend: 'IMPROVING',
      lastAssessment: new Date(),
      nextAudit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  const [complianceMetrics, setComplianceMetrics] = useState([
    {
      framework: 'SOC 2 Type II',
      status: 'COMPLIANT',
      score: 98.2,
      lastAudit: '2024-09-15',
      nextReview: '2024-12-15',
      criticalFindings: 0
    },
    {
      framework: 'ISO 27001',
      status: 'COMPLIANT',
      score: 96.8,
      lastAudit: '2024-08-20',
      nextReview: '2025-02-20',
      criticalFindings: 1
    },
    {
      framework: 'PCI DSS',
      status: 'COMPLIANT',
      score: 99.1,
      lastAudit: '2024-10-01',
      nextReview: '2024-12-31',
      criticalFindings: 0
    },
    {
      framework: 'GDPR',
      status: 'COMPLIANT',
      score: 97.5,
      lastAudit: '2024-09-30',
      nextReview: '2025-03-30',
      criticalFindings: 0
    }
  ]);

  const [remediationWorkflows, setRemediationWorkflows] = useState([
    {
      id: 'REM-001',
      issue: 'Password policy deviation detected',
      severity: 'MEDIUM',
      status: 'AUTOMATED_FIX_APPLIED',
      timeToResolution: '2.3 minutes',
      framework: 'ISO 27001'
    },
    {
      id: 'REM-002',
      issue: 'Encryption key rotation required',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      timeToResolution: '15 minutes remaining',
      framework: 'PCI DSS'
    },
    {
      id: 'REM-003',
      issue: 'Access log retention period exceeded',
      severity: 'LOW',
      status: 'SCHEDULED',
      timeToResolution: 'Next maintenance window',
      framework: 'SOC 2'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update audit data
      setAuditData(prev => ({
        ...prev,
        blockchainAudit: {
          ...prev?.blockchainAudit,
          immutableRecords: prev?.blockchainAudit?.immutableRecords + Math.floor(Math.random() * 10),
          blockHeight: prev?.blockchainAudit?.blockHeight + 1
        },
        complianceAutomation: {
          ...prev?.complianceAutomation,
          automatedChecks: prev?.complianceAutomation?.automatedChecks + Math.floor(Math.random() * 15),
          complianceRate: Math.max(97, Math.min(99.5, prev?.complianceAutomation?.complianceRate + (Math.random() * 1 - 0.5)))
        },
        realTimeScoring: {
          ...prev?.realTimeScoring,
          currentScore: Math.max(95, Math.min(100, prev?.realTimeScoring?.currentScore + (Math.random() * 2 - 1))),
          lastAssessment: new Date()
        }
      }));

      // Update compliance score
      const newScore = Math.max(95, Math.min(100, complianceScore + (Math.random() * 2 - 1)));
      if (Math.abs(newScore - complianceScore) > 0.1) {
        onComplianceUpdate?.(newScore);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [complianceScore, onComplianceUpdate]);

  const getComplianceStatusColor = (status) => {
    const colors = {
      'COMPLIANT': 'text-green-400',
      'NON_COMPLIANT': 'text-red-400',
      'PARTIAL': 'text-yellow-400',
      'UNDER_REVIEW': 'text-blue-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'LOW': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'HIGH': 'text-red-400',
      'CRITICAL': 'text-red-500'
    };
    return colors?.[severity] || 'text-gray-400';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'AUTOMATED_FIX_APPLIED': 'bg-green-900/30 text-green-400',
      'IN_PROGRESS': 'bg-yellow-900/30 text-yellow-400',
      'SCHEDULED': 'bg-blue-900/30 text-blue-400',
      'PENDING': 'bg-gray-700/30 text-gray-400'
    };
    return colors?.[status] || 'bg-gray-700/30 text-gray-400';
  };

  const generateAuditReport = async () => {
    // Mock function to generate audit report
    const reportData = {
      timestamp: new Date()?.toISOString(),
      complianceScore: auditData?.realTimeScoring?.currentScore,
      frameworks: complianceMetrics,
      blockchainRecords: auditData?.blockchainAudit?.immutableRecords,
      automatedChecks: auditData?.complianceAutomation?.automatedChecks
    };
    
    console.log('Generating audit report...', reportData);
    // In a real implementation, this would generate and download a PDF report
  };

  return (
    <motion.div
      className="bg-gray-900/50 rounded-lg border border-teal-800/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 border-b border-teal-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-600/20 rounded-lg">
              <FileText className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Advanced Audit & Compliance Center</h3>
              <p className="text-sm text-gray-400">Blockchain-based audit trails and regulatory compliance automation</p>
            </div>
          </div>
          
          <button
            onClick={generateAuditReport}
            className="flex items-center space-x-2 bg-teal-600/20 hover:bg-teal-600/30 px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-teal-400">Export Report</span>
          </button>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Blockchain Audit Trail */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <h4 className="text-sm font-medium text-gray-300">Blockchain-based Immutable Audit Trails</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Immutable Records</span>
                <span className="text-sm font-semibold text-blue-400">{auditData?.blockchainAudit?.immutableRecords?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Block Height</span>
                <span className="text-sm font-semibold text-purple-400">{auditData?.blockchainAudit?.blockHeight?.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Hash Verification</span>
                <span className="text-sm font-semibold text-green-400">{auditData?.blockchainAudit?.hashVerification}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Data Integrity</span>
                <span className="text-sm font-semibold text-teal-400">{auditData?.blockchainAudit?.dataIntegrity}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Compliance Automation */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Gavel className="h-5 w-5 text-orange-400" />
            <h4 className="text-sm font-medium text-gray-300">Regulatory Compliance Automation</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Regulatory Rules</span>
                <span className="text-sm font-semibold text-orange-400">{auditData?.complianceAutomation?.regulatoryRules}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Compliance Rate</span>
                <span className="text-sm font-semibold text-green-400">{auditData?.complianceAutomation?.complianceRate?.toFixed(1)}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Automated Checks</span>
                <span className="text-sm font-semibold text-purple-400">{auditData?.complianceAutomation?.automatedChecks?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Violations Detected</span>
                <span className="text-sm font-semibold text-red-400">{auditData?.complianceAutomation?.violationsDetected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Compliance Scoring */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-teal-400" />
              <h4 className="text-sm font-medium text-gray-300">Real-time Compliance Scoring</h4>
            </div>
            <span className="text-2xl font-bold text-teal-400">
              {auditData?.realTimeScoring?.currentScore?.toFixed(1)}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Trend</p>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">{auditData?.realTimeScoring?.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Next Audit</p>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400">
                  {auditData?.realTimeScoring?.nextAudit?.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Framework Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Compliance Framework Status</h4>
          {complianceMetrics?.map((framework, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{framework?.framework}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getComplianceStatusColor(framework?.status)} bg-gray-700/50`}>
                    {framework?.status}
                  </span>
                  <span className="text-sm font-semibold text-teal-400">
                    {framework?.score?.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Last Audit</p>
                  <p className="text-gray-300 font-semibold">{framework?.lastAudit}</p>
                </div>
                <div>
                  <p className="text-gray-400">Next Review</p>
                  <p className="text-blue-400 font-semibold">{framework?.nextReview}</p>
                </div>
                <div>
                  <p className="text-gray-400">Critical Findings</p>
                  <p className={`font-semibold ${framework?.criticalFindings === 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {framework?.criticalFindings}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Automated Remediation Workflows */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Automated Remediation Workflows</h4>
          {remediationWorkflows?.map((workflow) => (
            <div key={workflow?.id} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-400">{workflow?.id}</span>
                    <span className={`text-xs font-medium ${getSeverityColor(workflow?.severity)}`}>
                      {workflow?.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">{workflow?.issue}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>Framework: {workflow?.framework}</span>
                    <span>ETA: {workflow?.timeToResolution}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(workflow?.status)}`}>
                  {workflow?.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}