import React, { useState, useEffect } from 'react';
import { Shield, Database, Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, Zap } from 'lucide-react';

export default function SystemHealthDiagnostic() {
  const [healthStatus, setHealthStatus] = useState({
    api: null,
    market: null,
    audit: null,
    lastCheck: null
  });
  const [auditResults, setAuditResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHealthData = async () => {
    try {
      const [apiRes, marketRes, auditRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/market/health'),
        fetch('/internal/ops/audit-status')
      ]);

      const apiStatus = apiRes?.ok;
      const marketStatus = marketRes?.ok;
      const auditData = await auditRes?.json();

      setHealthStatus({
        api: apiStatus,
        market: marketStatus,
        audit: auditData?.ok || false,
        lastCheck: new Date()?.toISOString()
      });

      if (auditData?.ok) {
        setAuditResults(auditData?.status || []);
      }
    } catch (error) {
      console.log('Health check error:', error?.message);
      setHealthStatus(prev => ({ ...prev, lastCheck: new Date()?.toISOString() }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const runManualAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/internal/ops/audit-run', {
        method: 'POST',
        headers: {
          'x-internal-key': process.env?.VITE_INTERNAL_ADMIN_KEY || 'CHANGE_ME',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response?.json();
      if (result?.ok) {
        console.log('Manual audit completed');
        setTimeout(loadHealthData, 1000);
      }
    } catch (error) {
      console.log('Manual audit error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const repairPositionsColumn = async () => {
    setLoading(true);
    try {
      const response = await fetch('/internal/ops/repair/positions-is_active', {
        method: 'POST',
        headers: {
          'x-internal-key': process.env?.VITE_INTERNAL_ADMIN_KEY || 'CHANGE_ME',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response?.json();
      if (result?.ok) {
        console.log('Repair completed:', result?.result);
        setTimeout(loadHealthData, 1000);
      }
    } catch (error) {
      console.log('Repair error:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === false) return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  const getStatusColor = (status) => {
    if (status === true) return 'text-green-600 bg-green-50';
    if (status === false) return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">System Health Diagnostic</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={runManualAudit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Run Audit</span>
            </button>
          </div>
        </div>

        {/* Health Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">API Health</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(healthStatus?.api)}
                  <span className={`text-sm font-medium ${getStatusColor(healthStatus?.api)?.split(' ')?.[0]}`}>
                    {healthStatus?.api === true ? 'Healthy' : healthStatus?.api === false ? 'Down' : 'Unknown'}
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Market Data</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(healthStatus?.market)}
                  <span className={`text-sm font-medium ${getStatusColor(healthStatus?.market)?.split(' ')?.[0]}`}>
                    {healthStatus?.market === true ? 'Active' : healthStatus?.market === false ? 'Inactive' : 'Unknown'}
                  </span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Database Audit</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(healthStatus?.audit)}
                  <span className={`text-sm font-medium ${getStatusColor(healthStatus?.audit)?.split(' ')?.[0]}`}>
                    {healthStatus?.audit === true ? 'Clean' : healthStatus?.audit === false ? 'Issues' : 'Unknown'}
                  </span>
                </div>
              </div>
              <Database className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Last Check Time */}
        {healthStatus?.lastCheck && (
          <p className="text-sm text-gray-500">
            Last checked: {new Date(healthStatus.lastCheck)?.toLocaleString()}
          </p>
        )}
      </div>
      {/* Audit Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Database Audit Results</h4>
            <button
              onClick={repairPositionsColumn}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <Shield className="w-4 h-4" />
              <span>Repair Positions</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditResults?.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result?.item || 'Unknown Item'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {result?.last_status === 'ok' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : result?.last_status === 'missing' ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        result?.last_status === 'ok' ? 'text-green-600' :
                        result?.last_status === 'missing'? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {result?.last_status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result?.last_run_at ? new Date(result.last_run_at)?.toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {auditResults?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No audit results found. Run a manual audit to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}