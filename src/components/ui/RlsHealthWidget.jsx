import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Shield, RefreshCw, Settings, Copy, Server, ExternalLink, Code } from "lucide-react";
import { API } from "@/lib/apiBase";
import { getRlsHealth, postRlsRepair } from "@/lib/jsonFetch";

const RlsHealthWidget = ({ className = "" }) => {
  const [state, setState] = useState({ 
    loading: true, 
    data: null, 
    error: null,
    lastChecked: null
  });
  const [busy, setBusy] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  // Configuration constants
  const maxRetries = 3;
  const retryDelay = 3000;

  // Helper functions to update state
  const setHealthData = (data) => {
    setState(prev => ({ ...prev, data, lastChecked: new Date()?.toLocaleString() }));
  };

  const setError = (error) => {
    setState(prev => ({ ...prev, error }));
  };

  const setLoading = (loading) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setRepairLoading = (loading) => {
    setBusy(loading);
  };

  // Enhanced API base URL resolution with fallback logic
  const getApiBaseUrl = () => {
    return API;
  };

  // Main health check function
  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    await checkRlsHealth();
  };

  const checkRlsHealth = async (attempt = 1) => {
    try {
      console.log(`🔍 [Attempt ${attempt}] Checking RLS health with fallback...`);

      const result = await getRlsHealth();
      
      console.log('✅ RLS health check completed successfully');
      setHealthData(result);
      setError(null);

    } catch (err) {
      console.error(`❌ [Attempt ${attempt}] RLS health check failed:`, err);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        setTimeout(() => checkRlsHealth(attempt + 1), retryDelay);
      } else {
        setError(err?.message);
      }
    } finally {
      if (attempt === maxRetries) {
        setLoading(false);
      }
    }
  };

  const repairRls = async () => {
    setRepairLoading(true);
    setError(null);

    try {
      console.log('🔧 Attempting RLS auto-repair with API-only fallback...');

      const result = await postRlsRepair();
      
      console.log('✅ RLS auto-repair completed successfully');
      // Refresh health data after repair
      checkRlsHealth();

    } catch (err) {
      console.error('❌ RLS repair failed:', err);
      setError(err?.message);
    } finally {
      setRepairLoading(false);
    }
  };

  // Repair helper functions
  const canRepair = import.meta.env?.VITE_INTERNAL_ADMIN_KEY ? true : false;
  const performRepair = repairRls;

  // Enhanced copy error details with more diagnostic info
  async function copyErrorDetails() {
    if (!state?.error) return;
    
    try {
      const errorReport = `RLS Health Monitor Error Report
Generated: ${new Date()?.toISOString()}
Last Checked: ${state?.lastChecked}
Error: ${typeof state?.error === 'object' ? state?.error?.message : state?.error}
Error Type: ${state?.error?.type || 'unknown'}
Retry Count: ${state?.error?.retryCount || 0}

System Info:
- Frontend: ${window.location?.origin}
- Backend API: ${API}
- Health Endpoint: ${API}/security/rls/health
- User Agent: ${navigator.userAgent}

Last Response:
- Status: ${lastResponse?.status || 'N/A'}
- Status Text: ${lastResponse?.statusText || 'N/A'}
- Content-Type: ${lastResponse?.contentType || 'N/A'}
- URL: ${lastResponse?.url || 'N/A'}
- Response Preview: ${lastResponse?.text?.substring(0, 200) || 'N/A'}

Environment Variables:
- VITE_API_BASE_URL: ${import.meta.env?.VITE_API_BASE_URL || 'Not set'}
- VITE_MVP_API_BASE: ${import.meta.env?.VITE_MVP_API_BASE || 'Not set'}
- VITE_INTERNAL_ADMIN_KEY: ${import.meta.env?.VITE_INTERNAL_ADMIN_KEY ? '[SET]' : 'Not set'}
- VITE_API_TIMEOUT: ${import.meta.env?.VITE_API_TIMEOUT || 'Default (10000ms)'}
- VITE_API_RETRY_ATTEMPTS: ${import.meta.env?.VITE_API_RETRY_ATTEMPTS || 'Default (3)'}
- VITE_DEBUG_API: ${import.meta.env?.VITE_DEBUG_API || 'false'}

Backend Diagnostics:
1. Test backend health: curl ${API}/status
2. Test backend direct: curl ${API}/health  
3. Check RLS endpoint: curl ${API}/security/rls/health
4. Verify backend is running on port 8082
5. Check backend logs for errors
6. Ensure CORS allows ${window.location?.origin}

Quick Fixes:
1. Start backend: cd backend && npm start
2. Check backend status at: ${API}
3. Verify environment variables match between frontend and backend
4. Test connectivity: ping api.trading-mvp.com`;

      await navigator.clipboard?.writeText(errorReport);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  }

  // Test backend connectivity
  async function testBackendConnectivity() {
    const testEndpoints = [
      `${API}/health`,
      `${API}/status`,
      `${API}/api/health`
    ];

    console.log("🧪 Testing backend connectivity...");
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint, { 
          method: "GET",
          signal: AbortSignal.timeout(5000)
        });
        console.log(`✅ ${endpoint}: ${response?.status} ${response?.statusText}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error?.message}`);
      }
    }
  }

  // Load on component mount and set up auto-refresh with backoff
  useEffect(() => { 
    loadHealth();
    
    // Auto-refresh with exponential backoff on errors
    const interval = setInterval(() => {
      if (!state?.error || state?.error?.retryCount < 3) {
        loadHealth();
      }
    }, state?.error ? 60000 : 30000); // 1 minute if error, 30 seconds if healthy
    
    return () => clearInterval(interval);
  }, [state?.error?.retryCount]);

  // Calculate issues from data
  const issues = [];
  const tables = state?.data?.tables || [];
  tables?.forEach(t => {
    if (t?.status !== 'OK') {
      issues?.push({
        table: t?.table,
        status: t?.status,
        missing: t?.policies_missing || 0,
        score: t?.health_score || 0
      });
    }
  });

  const summary = state?.data?.summary || {};
  const systemStatus = state?.data?.system_status || 'unknown';
  const errorObj = typeof state?.error === 'object' ? state?.error : { message: state?.error, type: 'unknown' };

  return (
    <div className={`p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-lg text-indigo-600">RLS Health Monitor</h3>
            {state?.lastChecked && (
              <p className="text-xs text-gray-500">Last checked: {state?.lastChecked}</p>
            )}
            <p className="text-xs text-gray-400">API: {getApiBaseUrl()}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {state?.loading ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Checking...</span>
            </div>
          ) : state?.error ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Error</span>
            </div>
          ) : (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              systemStatus === 'healthy' ?'bg-green-100 text-green-700' 
                : systemStatus === 'degraded' ?'bg-yellow-100 text-yellow-700' :'bg-red-100 text-red-700'
            }`}>
              {systemStatus === 'healthy' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="capitalize">{systemStatus}</span>
              {issues?.length > 0 && (
                <span className="ml-1">({issues?.length} issue{issues?.length !== 1 ? 's' : ''})</span>
              )}
            </div>
          )}
          
          <button
            onClick={loadHealth}
            disabled={state?.loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh health check"
          >
            <RefreshCw className={`w-4 h-4 ${state?.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error State with Enhanced Diagnostics */}
      {state?.error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-1">Backend Connection Error</h4>
              <p className="text-sm text-red-700 mb-3">{errorObj?.message}</p>
              
              {/* Error Type-Specific Instructions */}
              {errorObj?.type === 'html_response' && (
                <div className="bg-red-100 p-3 rounded border border-red-200 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">HTML Response Detected</span>
                  </div>
                  <div className="text-xs text-red-700 space-y-1">
                    <p>• Backend server is running but <strong>/security/rls/health</strong> endpoint is missing</p>
                    <p>• Add RLS health route to backend API server</p>
                    <p>• Check backend route definitions for security endpoints</p>
                    <p>• Verify backend server is serving API routes correctly</p>
                  </div>
                </div>
              )}

              {errorObj?.type === 'not_found' && (
                <div className="bg-red-100 p-3 rounded border border-red-200 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">API Endpoint Not Found</span>
                  </div>
                  <div className="text-xs text-red-700 space-y-1">
                    <p>• <strong>Missing route:</strong> /security/rls/health</p>
                    <p>• Backend server needs RLS monitoring implementation</p>
                    <p>• Check if backend has security modules installed</p>
                  </div>
                </div>
              )}

              {errorObj?.type === 'connection' && (
                <div className="bg-red-100 p-3 rounded border border-red-200 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">Backend Server Not Running</span>
                  </div>
                  <div className="text-xs text-red-700 space-y-1">
                    <p>• <strong>Start backend:</strong> <code className="bg-red-200 px-1 rounded">cd backend && npm start</code></p>
                    <p>• <strong>Check port:</strong> <code className="bg-red-200 px-1 rounded">{getApiBaseUrl()}</code></p>
                    <p>• <strong>Test manually:</strong> <code className="bg-red-200 px-1 rounded">curl {getApiBaseUrl()}/health</code></p>
                  </div>
                </div>
              )}

              {/* Debug Information Toggle */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  {debugMode ? 'Hide' : 'Show'} Debug Info
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={testBackendConnectivity}
                    className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-300"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={() => window.open(getApiBaseUrl(), '_blank')}
                    className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open API
                  </button>
                </div>
              </div>

              {/* Debug Information */}
              {debugMode && lastResponse && (
                <div className="bg-gray-100 p-3 rounded border mb-3">
                  <h5 className="font-medium text-gray-800 mb-2">Last Response Debug Info</h5>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p><strong>HTTP Status:</strong> {lastResponse?.status} {lastResponse?.statusText}</p>
                    <p><strong>Content-Type:</strong> {lastResponse?.contentType}</p>
                    <p><strong>URL:</strong> {lastResponse?.url}</p>
                    <div>
                      <strong>Response Preview:</strong>
                      <pre className="mt-1 p-2 bg-gray-200 rounded text-xs overflow-x-auto">
                        {lastResponse?.text || 'No response body'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-red-600">
                <p>• Verify backend server is running and accessible</p>
                <p>• Check VITE_API_BASE_URL environment variable</p>
                <p>• Ensure RLS health endpoint is implemented</p>
                <p>• Review network tab in browser developer tools</p>
              </div>
            </div>
            <button
              onClick={copyErrorDetails}
              className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title={copySuccess ? "Copied!" : "Copy detailed error report"}
            >
              <Copy className={`w-4 h-4 ${copySuccess ? 'text-green-600' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* System Summary */}
      {!state?.loading && !state?.error && state?.data && (
        <div className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{summary?.total_tables || 0}</div>
              <div className="text-xs text-gray-600">Tables Monitored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary?.healthy_tables || 0}</div>
              <div className="text-xs text-gray-600">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary?.tables_with_issues || 0}</div>
              <div className="text-xs text-gray-600">With Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary?.overall_health_score || 0}%</div>
              <div className="text-xs text-gray-600">Health Score</div>
            </div>
          </div>

          {/* Issues List */}
          {issues?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">Issues Found</h4>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {issues?.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-red-800">{issue?.table}</span>
                      <span className="ml-2 text-sm text-red-600">
                        {issue?.status === 'RLS_OFF' ? 'RLS Disabled' : 
                         issue?.status === 'MISSING_POLICIES' ? `${issue?.missing} missing policies` :
                         issue?.status}
                      </span>
                    </div>
                    <div className="text-sm text-red-700">
                      Health: {issue?.score}%
                    </div>
                  </div>
                  
                  {showDetails && (
                    <div className="mt-2 text-xs text-red-600">
                      <p>Status: <span className="font-mono">{issue?.status}</span></p>
                      {issue?.missing > 0 && (
                        <p>Missing Policies: {issue?.missing}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Auto-Repair Button */}
          {canRepair && issues?.length > 0 && (
            <div className="pt-4 border-t">
              <button
                onClick={performRepair}
                disabled={busy}
                className="w-full px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Repairing Policies...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Auto-Repair Missing Policies</span>
                  </>
                )}
              </button>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Secure operation - requires VITE_INTERNAL_ADMIN_KEY environment variable
              </p>
            </div>
          )}

          {/* Success State */}
          {issues?.length === 0 && !state?.loading && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800">All Systems Secure</h4>
              <p className="text-sm text-green-700">All RLS policies are properly configured and active</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RlsHealthWidget;