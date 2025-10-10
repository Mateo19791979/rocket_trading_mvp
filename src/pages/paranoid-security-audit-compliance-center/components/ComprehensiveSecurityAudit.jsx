import React, { useState, useEffect } from 'react';
import { Shield, Search, AlertTriangle, CheckCircle, Clock, Target, Eye, Play, Pause, Download } from 'lucide-react';
import { paranoidSecurityAuditService } from '../../../services/paranoidSecurityAuditService';

export default function ComprehensiveSecurityAudit({ securityOverview, onRefresh }) {
  const [scanResults, setScanResults] = useState([]);
  const [activeScan, setActiveScan] = useState(null);
  const [scanConfig, setScanConfig] = useState({
    type: 'comprehensive',
    url: 'https://api.trading-mvp.com',
    depth: 'paranoid',
    includes: {
      owasp_zap: true,
      penetration_testing: true,
      code_analysis: true,
      infrastructure_hardening: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      setLoading(true);
      // Using a mock user ID - in real app, get from auth context
      const scans = await paranoidSecurityAuditService?.getSecurityScans('mock-user-id');
      setScanResults(scans);
    } catch (error) {
      console.error('Error loading scan history:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSecurityScan = async () => {
    try {
      setLoading(true);
      setScanProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const result = await paranoidSecurityAuditService?.initiateSecurityScan(scanConfig);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setActiveScan(result);
      loadScanHistory();
      onRefresh?.();
    } catch (error) {
      console.error('Error starting security scan:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'low': return 'text-green-400 bg-green-900/30 border-green-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'text-green-400';
    if (grade?.startsWith('B')) return 'text-blue-400';
    if (grade?.startsWith('C')) return 'text-yellow-400';
    if (grade?.startsWith('D')) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* OWASP ZAP Integration Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-red-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <Search className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Automated Vulnerability Scanning with OWASP ZAP
            </h3>
          </div>
          <button
            onClick={startSecurityScan}
            disabled={loading}
            className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 px-4 py-2 rounded-lg text-red-300 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{loading ? 'Scanning...' : 'Start Paranoid Scan'}</span>
          </button>
        </div>

        {/* Scan Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target URL
              </label>
              <input
                type="text"
                value={scanConfig?.url}
                onChange={(e) => setScanConfig({ ...scanConfig, url: e?.target?.value })}
                className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-red-500/50 focus:outline-none"
                placeholder="https://api.trading-mvp.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scan Depth
              </label>
              <select
                value={scanConfig?.depth}
                onChange={(e) => setScanConfig({ ...scanConfig, depth: e?.target?.value })}
                className="w-full bg-gray-900/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-red-500/50 focus:outline-none"
              >
                <option value="basic">Basic Scan</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="paranoid">Paranoid Level</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scan Components
            </label>
            <div className="space-y-2">
              {[
                { key: 'owasp_zap', label: 'OWASP ZAP Integration' },
                { key: 'penetration_testing', label: 'Penetration Testing' },
                { key: 'code_analysis', label: 'Static Code Analysis' },
                { key: 'infrastructure_hardening', label: 'Infrastructure Validation' }
              ]?.map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={scanConfig?.includes?.[key]}
                    onChange={(e) => setScanConfig({
                      ...scanConfig,
                      includes: { ...scanConfig?.includes, [key]: e?.target?.checked }
                    })}
                    className="rounded bg-gray-900/50 border-gray-600/50 text-red-500 focus:ring-red-500/50"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Progress */}
        {scanProgress > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Scan Progress</span>
              <span className="text-sm text-red-400">{Math.round(scanProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Running comprehensive security validation...
            </div>
          </div>
        )}

        {/* Real-time Security Scoring */}
        <div className="bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Real-time Security Scoring</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {securityOverview?.security_posture?.score || 0}
              </div>
              <div className="text-xs text-gray-400">Overall Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getGradeColor(securityOverview?.security_posture?.grade)}`}>
                {securityOverview?.security_posture?.grade || 'N/A'}
              </div>
              <div className="text-xs text-gray-400">Security Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {securityOverview?.critical_issues?.length || 0}
              </div>
              <div className="text-xs text-gray-400">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {scanResults?.filter(s => s?.has_critical_issues)?.length || 0}
              </div>
              <div className="text-xs text-gray-400">Failed Scans</div>
            </div>
          </div>
        </div>
      </div>
      {/* Penetration Testing Orchestration */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Target className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Penetration Testing Orchestration
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Attack Vectors</h4>
              <div className="space-y-2">
                {[
                  { name: 'SQL Injection', status: 'complete', severity: 'critical' },
                  { name: 'XSS Vulnerabilities', status: 'running', severity: 'high' },
                  { name: 'CSRF Protection', status: 'pending', severity: 'medium' },
                  { name: 'Authentication Bypass', status: 'complete', severity: 'critical' },
                  { name: 'Authorization Flaws', status: 'running', severity: 'high' }
                ]?.map((vector, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        vector?.status === 'complete' ? 'bg-green-400' :
                        vector?.status === 'running'? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-300 text-sm">{vector?.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(vector?.severity)}`}>
                      {vector?.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Infrastructure Testing</h4>
              <div className="space-y-2">
                {[
                  { name: 'Port Scanning', progress: 100, status: 'complete' },
                  { name: 'SSL/TLS Analysis', progress: 75, status: 'running' },
                  { name: 'Network Topology', progress: 45, status: 'running' },
                  { name: 'Service Enumeration', progress: 0, status: 'pending' }
                ]?.map((test, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{test?.name}</span>
                      <span className="text-xs text-gray-400">{test?.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          test?.status === 'complete' ? 'bg-green-400' :
                          test?.status === 'running'? 'bg-orange-400' : 'bg-gray-600'
                        }`}
                        style={{ width: `${test?.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Code Security Analysis */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Code Security Analysis (Static & Dynamic)
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Static Analysis</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Security Patterns</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Input Validation</span>
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Crypto Usage</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Error Handling</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Dynamic Analysis</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Runtime Behavior</span>
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Memory Safety</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">API Security</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Data Flow</span>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Vulnerability Summary</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-sm">Critical</span>
                <span className="text-red-400 font-bold">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-400 text-sm">High</span>
                <span className="text-orange-400 font-bold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 text-sm">Medium</span>
                <span className="text-yellow-400 font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-sm">Low</span>
                <span className="text-green-400 font-bold">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Infrastructure Hardening Validation */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Infrastructure Hardening Validation
            </h3>
          </div>
          <button className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 px-4 py-2 rounded-lg text-purple-300 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">System Hardening</h4>
              <div className="space-y-2">
                {[
                  { check: 'OS Security Updates', status: 'pass', score: 95 },
                  { check: 'Service Configuration', status: 'pass', score: 88 },
                  { check: 'Network Security', status: 'warning', score: 75 },
                  { check: 'Access Controls', status: 'pass', score: 92 },
                  { check: 'Logging & Monitoring', status: 'fail', score: 45 }
                ]?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item?.status === 'pass' ? 'bg-green-400' :
                        item?.status === 'warning'? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-gray-300 text-sm">{item?.check}</span>
                    </div>
                    <span className="text-white font-medium text-sm">{item?.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Compliance Checks</h4>
              <div className="space-y-2">
                {[
                  { standard: 'CIS Benchmarks', compliance: 'compliant', score: 94 },
                  { standard: 'NIST Framework', compliance: 'partial', score: 78 },
                  { standard: 'ISO 27001', compliance: 'compliant', score: 91 },
                  { standard: 'PCI DSS', compliance: 'non-compliant', score: 52 }
                ]?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item?.compliance === 'compliant' ? 'bg-green-400' :
                        item?.compliance === 'partial'? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-gray-300 text-sm">{item?.standard}</span>
                    </div>
                    <span className="text-white font-medium text-sm">{item?.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}