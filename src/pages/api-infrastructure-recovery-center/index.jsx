import React, { useState, useEffect } from 'react';
import { Play, Activity, Server, Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Terminal, Monitor } from 'lucide-react';
import BackendConfigPanel from './components/BackendConfigPanel';
import NginxConfigPanel from './components/NginxConfigPanel';
import DiagnosticTestingPanel from './components/DiagnosticTestingPanel';
import DeploymentChecklistPanel from './components/DeploymentChecklistPanel';
import { apiClient } from '../../lib/api';

export default function APIInfrastructureRecoveryCenter() {
  const [selectedBackend, setSelectedBackend] = useState('nodejs');
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsResults, setDiagnosticsResults] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    backend: 'unknown',
    nginx: 'unknown', 
    api_client: 'unknown',
    overall: 'unknown'
  });

  // Real-time system monitoring
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const result = await apiClient?.runDiagnostics();
        const healthStatus = result?.summary?.successful >= 4 ? 'healthy' : 
                           result?.summary?.successful >= 2 ? 'degraded' : 'critical';
        
        setSystemHealth({
          backend: result?.summary?.successful >= 1 ? 'healthy' : 'critical',
          nginx: result?.results?.find(r => r?.name === 'Health Check')?.status === 'success' ? 'healthy' : 'critical',
          api_client: 'healthy',
          overall: healthStatus
        });
      } catch (error) {
        setSystemHealth({
          backend: 'critical',
          nginx: 'critical',
          api_client: 'critical',
          overall: 'critical'
        });
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const runComprehensiveDiagnostics = async () => {
    setDiagnosticsRunning(true);
    try {
      const results = await apiClient?.runDiagnostics();
      setDiagnosticsResults(results);
    } catch (error) {
      setDiagnosticsResults({
        error: true,
        message: error?.message,
        timestamp: new Date()?.toISOString()
      });
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const getHealthBadge = (status) => {
    const badges = {
      healthy: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Healthy</span>,
      degraded: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Degraded</span>,
      critical: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Critical</span>,
      unknown: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><Monitor className="w-3 h-3 mr-1" />Unknown</span>
    };
    return badges?.[status] || badges?.unknown;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">API Infrastructure Recovery Center</h1>
                <p className="text-gray-400">Comprehensive backend API restoration and endpoint management</p>
              </div>
            </div>
            
            {/* System Status Overview */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Overall Status</div>
                {getHealthBadge(systemHealth?.overall)}
              </div>
              <button
                onClick={runComprehensiveDiagnostics}
                disabled={diagnosticsRunning}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {diagnosticsRunning ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4 mr-2" />
                )}
                {diagnosticsRunning ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Health Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Backend Service</p>
                <p className="text-2xl font-bold text-white">Node.js API</p>
              </div>
              {getHealthBadge(systemHealth?.backend)}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Port 8001</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Reverse Proxy</p>
                <p className="text-2xl font-bold text-white">Nginx</p>
              </div>
              {getHealthBadge(systemHealth?.nginx)}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">SSL Termination</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">API Client</p>
                <p className="text-2xl font-bold text-white">Resilient</p>
              </div>
              {getHealthBadge(systemHealth?.api_client)}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-400">Auto Fallback</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Endpoints</p>
                <p className="text-2xl font-bold text-white">5 Active</p>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Play className="w-3 h-3 mr-1" />
                Online
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-400">
                /health, /positions, /market, /ops/status, /security/tls/health
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Backend & Nginx */}
          <div className="space-y-8">
            <BackendConfigPanel 
              selectedBackend={selectedBackend}
              onBackendChange={setSelectedBackend}
            />
            <NginxConfigPanel />
          </div>

          {/* Center Column - Diagnostics */}
          <div className="space-y-8">
            <DiagnosticTestingPanel 
              diagnosticsResults={diagnosticsResults}
              diagnosticsRunning={diagnosticsRunning}
              onRunDiagnostics={runComprehensiveDiagnostics}
            />
          </div>

          {/* Right Column - Deployment */}
          <div className="space-y-8">
            <DeploymentChecklistPanel systemHealth={systemHealth} />
          </div>
        </div>

        {/* API Recovery Instructions */}
        <div className="mt-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recovery Instructions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Quick Recovery Steps:</h4>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Launch backend service: <code className="bg-gray-800 px-1 rounded">pm2 start server/index.js --name api-core</code></li>
                  <li>Test local endpoint: <code className="bg-gray-800 px-1 rounded">curl http://127.0.0.1:8001/health</code></li>
                  <li>Update Nginx config and reload: <code className="bg-gray-800 px-1 rounded">nginx -t && systemctl reload nginx</code></li>
                  <li>Verify production: <code className="bg-gray-800 px-1 rounded">curl -I https://trading-mvp.com/api/health</code></li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Troubleshooting:</h4>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Check if port 8001 is available</li>
                  <li>Verify environment variables in .env</li>
                  <li>Ensure Nginx has correct upstream configuration</li>
                  <li>Check firewall rules for API access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}