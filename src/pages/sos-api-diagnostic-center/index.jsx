import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Activity, CheckCircle, XCircle, Clock, RefreshCw, Info, Wifi, WifiOff, AlertCircle, Shield, Gauge } from 'lucide-react';
import ProbableCausesPanel from './components/ProbableCausesPanel';
import AutomatedVerificationPanel from './components/AutomatedVerificationPanel';
import ImmediateFixesPanel from './components/ImmediateFixesPanel';
import DebugWidgetPanel from './components/DebugWidgetPanel';

export default function SOSAPIDiagnosticCenter() {
  const [diagnosticResults, setDiagnosticResults] = useState({
    corsStatus: 'unknown',
    httpsStatus: 'unknown',
    traefikStatus: 'unknown',
    apiStatus: 'unknown',
    schemaStatus: 'unknown'
  });
  
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [lastDiagnosticRun, setLastDiagnosticRun] = useState(null);
  const [apiMode, setApiMode] = useState('production'); // 'production' or 'mock'
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [detailedErrors, setDetailedErrors] = useState({});
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [networkDiagnostics, setNetworkDiagnostics] = useState({
    latency: null,
    successRate: null,
    lastSuccess: null
  });

  const API_BASE = apiMode === 'production' ? "https://api.trading-mvp.com" : "/api/mock";

  // Mock API endpoints for fallback testing
  const MOCK_ENDPOINTS = {
    '/status': { status: 'ok', timestamp: new Date()?.toISOString() },
    '/health': { status: 'healthy', services: ['api', 'database', 'cache'] },
    '/registry': { strategies: [], count: 0 },
    '/scores': { scores: [], window: 252, updated: new Date()?.toISOString() }
  };

  useEffect(() => {
    // Run initial diagnostics on page load
    runComprehensiveDiagnostics();
    
    // Setup auto-retry mechanism for connection failures
    if (autoRetryEnabled && connectionStatus === 'offline') {
      const retryInterval = setInterval(() => {
        if (retryCount < 3) {
          console.log(`🔄 Auto-retry attempt ${retryCount + 1}/3`);
          runComprehensiveDiagnostics();
          setRetryCount(prev => prev + 1);
        } else {
          clearInterval(retryInterval);
          console.log('🛑 Max auto-retry attempts reached. Manual intervention required.');
        }
      }, 10000); // Retry every 10 seconds

      return () => clearInterval(retryInterval);
    }
  }, [apiMode, autoRetryEnabled, connectionStatus, retryCount]);

  const runComprehensiveDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setConnectionStatus('testing');
    const results = { ...diagnosticResults };
    const errors = {};
    let hasAnySuccess = false;
    let latencySum = 0;
    let successfulRequests = 0;
    let totalRequests = 0;

    // Enhanced error handling with timeout and better diagnostics
    const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), timeout);
      
      const startTime = Date.now();
      totalRequests++;
      
      try {
        // Mock API fallback for development
        if (apiMode === 'mock') {
          const path = new URL(url)?.pathname;
          const queryParams = new URL(url)?.searchParams;
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
          
          const mockData = MOCK_ENDPOINTS?.[path] || { 
            error: 'Endpoint not mocked', 
            availableEndpoints: Object.keys(MOCK_ENDPOINTS) 
          };
          
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          latencySum += responseTime;
          successfulRequests++;
          
          return {
            response: {
              ok: true,
              status: 200,
              statusText: 'OK',
              json: async () => mockData
            },
            responseTime,
            success: true
          };
        }

        const response = await fetch(url, {
          ...options,
          signal: controller?.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...options?.headers
          }
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        clearTimeout(timeoutId);
        
        if (response?.ok) {
          latencySum += responseTime;
          successfulRequests++;
        }
        
        return { 
          response, 
          responseTime,
          success: true 
        };
      } catch (error) {
        clearTimeout(timeoutId);
        const endTime = Date.now();
        
        // Enhanced error categorization with network diagnostics
        let errorType = 'NETWORK_ERROR';
        let errorDetails = error?.message || 'Unknown error';
        let diagnosticHint = '';
        
        if (error?.name === 'AbortError') {
          errorType = 'TIMEOUT_ERROR';
          errorDetails = `Request timed out after ${timeout}ms`;
          diagnosticHint = 'Server may be overloaded or network is slow';
        } else if (error?.message?.includes('CORS')) {
          errorType = 'CORS_ERROR';
          diagnosticHint = 'Check Access-Control-Allow-Origin headers on server';
        } else if (error?.message?.includes('DNS')) {
          errorType = 'DNS_ERROR';
          diagnosticHint = 'Domain name resolution failed - check DNS configuration';
        } else if (error?.message?.includes('Failed to fetch')) {
          errorType = 'CONNECTION_REFUSED';
          errorDetails = 'Connection refused - API server may be offline';
          diagnosticHint = 'Server is down, firewall blocking, or incorrect URL';
        } else if (error?.message?.includes('NetworkError')) {
          errorType = 'NETWORK_ERROR';
          diagnosticHint = 'Network connectivity issue or server unreachable';
        }
        
        return { 
          response: null, 
          error: {
            type: errorType,
            message: errorDetails,
            hint: diagnosticHint,
            name: error?.name,
            responseTime: endTime - startTime
          },
          success: false 
        };
      }
    };

    // Test 1: API Connectivity and CORS
    try {
      console.log(`Testing API connectivity: ${API_BASE}/status`);
      const { response: statusTest, error: statusError, responseTime } = await fetchWithTimeout(`${API_BASE}/status`);
      
      if (statusTest?.ok) {
        results.corsStatus = 'success';
        results.apiStatus = 'success';
        hasAnySuccess = true;
        console.log(`✅ API connectivity successful (${responseTime}ms)`);
        setNetworkDiagnostics(prev => ({ ...prev, lastSuccess: new Date()?.toISOString() }));
      } else if (statusTest) {
        results.corsStatus = 'warning';
        results.apiStatus = 'warning';
        errors.api = `HTTP ${statusTest?.status}: ${statusTest?.statusText}`;
        console.warn(`⚠️ API responded with status: ${statusTest?.status} (${responseTime}ms)`);
      } else if (statusError) {
        results.corsStatus = 'error';
        results.apiStatus = 'error';
        errors.api = `${statusError?.type}: ${statusError?.message} (${statusError?.responseTime}ms)`;
        if (statusError?.hint) errors.api += ` - ${statusError?.hint}`;
        console.error('❌ CORS/API test failed:', {
          message: statusError?.message,
          type: statusError?.type,
          hint: statusError?.hint,
          responseTime: statusError?.responseTime
        });
      }
    } catch (error) {
      results.corsStatus = 'error';
      results.apiStatus = 'error';
      errors.api = `Unexpected error: ${error?.message}`;
      console.error('❌ Unexpected API test error:', error);
    }

    // Test 2: HTTPS/DNS Resolution
    try {
      console.log(`Testing HTTPS/DNS: ${API_BASE}/health`);
      const { response: healthTest, error: healthError, responseTime } = await fetchWithTimeout(`${API_BASE}/health`);
      
      if (healthTest?.ok) {
        results.httpsStatus = 'success';
        hasAnySuccess = true;
        console.log(`✅ HTTPS/DNS resolution successful (${responseTime}ms)`);
      } else if (healthError) {
        results.httpsStatus = 'error';
        errors.https = `${healthError?.type}: ${healthError?.message}`;
        if (healthError?.hint) errors.https += ` - ${healthError?.hint}`;
        console.error(`❌ HTTPS/DNS test failed: ${healthError?.message} (${healthError?.responseTime}ms)`);
      } else {
        results.httpsStatus = 'warning';
        errors.https = `HTTP ${healthTest?.status}: ${healthTest?.statusText}`;
      }
    } catch (error) {
      results.httpsStatus = 'error';
      errors.https = `Unexpected error: ${error?.message}`;
      console.error('❌ Unexpected HTTPS test error:', error);
    }

    // Test 3: Traefik Routing
    try {
      console.log(`Testing Traefik routing: ${API_BASE}/registry`);
      const { response: registryTest, error: registryError, responseTime } = await fetchWithTimeout(`${API_BASE}/registry`);
      
      if (registryTest?.ok) {
        results.traefikStatus = 'success';
        hasAnySuccess = true;
        console.log(`✅ Traefik routing successful (${responseTime}ms)`);
      } else if (registryError) {
        results.traefikStatus = 'error';
        errors.traefik = `${registryError?.type}: ${registryError?.message}`;
        if (registryError?.hint) errors.traefik += ` - ${registryError?.hint}`;
        console.error(`❌ Traefik routing test failed: ${registryError?.message} (${registryError?.responseTime}ms)`);
      } else {
        results.traefikStatus = 'warning';
        errors.traefik = `HTTP ${registryTest?.status}: ${registryTest?.statusText}`;
      }
    } catch (error) {
      results.traefikStatus = 'error';
      errors.traefik = `Unexpected error: ${error?.message}`;
      console.error('❌ Unexpected Traefik test error:', error);
    }

    // Test 4: Schema Validation
    try {
      console.log(`Testing schema validation: ${API_BASE}/scores?window=252`);
      const { response: scoresTest, error: scoresError, responseTime } = await fetchWithTimeout(`${API_BASE}/scores?window=252`);
      
      if (scoresTest?.ok) {
        const data = await scoresTest?.json();
        const hasValidSchema = data && (data?.scores !== undefined || Array.isArray(data));
        results.schemaStatus = hasValidSchema ? 'success' : 'warning';
        if (hasValidSchema) {
          hasAnySuccess = true;
          console.log(`✅ Schema validation successful (${responseTime}ms)`, { keys: Object.keys(data || {}) });
        } else {
          errors.schema = 'Invalid response schema - missing expected fields';
          console.warn(`⚠️ Schema validation warning: Invalid structure (${responseTime}ms)`);
        }
      } else if (scoresError) {
        results.schemaStatus = 'error';
        errors.schema = `${scoresError?.type}: ${scoresError?.message}`;
        if (scoresError?.hint) errors.schema += ` - ${scoresError?.hint}`;
        console.error(`❌ Schema validation test failed: ${scoresError?.message} (${scoresError?.responseTime}ms)`);
      } else {
        results.schemaStatus = 'error';
        errors.schema = `HTTP ${scoresTest?.status}: ${scoresTest?.statusText}`;
        console.warn(`⚠️ Schema test responded with status: ${scoresTest?.status} (${responseTime}ms)`);
      }
    } catch (error) {
      results.schemaStatus = 'error';
      errors.schema = `Unexpected error: ${error?.message}`;
      console.error('❌ Unexpected Schema test error:', error);
    }

    // Calculate network diagnostics
    const avgLatency = successfulRequests > 0 ? Math.round(latencySum / successfulRequests) : null;
    const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : null;
    
    setNetworkDiagnostics(prev => ({
      ...prev,
      latency: avgLatency,
      successRate: successRate
    }));

    // Determine connection status
    if (hasAnySuccess) {
      setConnectionStatus('partial');
      setRetryCount(0); // Reset retry count on success
    } else {
      setConnectionStatus('offline');
      // Auto-suggest mock mode if production API is completely unreachable
      if (apiMode === 'production') {
        console.log('🔄 API appears completely unreachable. Consider switching to mock mode for development.');
      }
    }

    setDiagnosticResults(results);
    setDetailedErrors(errors);
    setLastDiagnosticRun(new Date()?.toLocaleTimeString('fr-FR'));
    setIsRunningDiagnostics(false);

    // Enhanced summary logging
    const successCount = Object.values(results)?.filter(status => status === 'success')?.length;
    const warningCount = Object.values(results)?.filter(status => status === 'warning')?.length;
    const errorCount = Object.values(results)?.filter(status => status === 'error')?.length;
    const totalTests = Object.keys(results)?.length;
    
    console.log(`📊 Diagnostic Summary: ${successCount}/${totalTests} passed, ${warningCount} warnings, ${errorCount} errors`);
    console.log(`🌐 Network: ${avgLatency}ms avg latency, ${successRate}% success rate`);
    
    // Log detailed error summary
    if (Object.keys(errors)?.length > 0) {
      console.log('🔍 Error Details:', errors);
    }
  };

  const getOverallStatus = () => {
    const statuses = Object.values(diagnosticResults);
    if (statuses?.includes('error') && statuses?.filter(s => s === 'error')?.length >= 3) return 'critical';
    if (statuses?.includes('error')) return 'warning';
    if (statuses?.every(status => status === 'success')) return 'healthy';
    if (statuses?.some(status => status === 'success')) return 'partial';
    return 'unknown';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'testing': return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      case 'partial': return <Wifi className="w-5 h-5 text-yellow-400" />;
      case 'offline': return <WifiOff className="w-5 h-5 text-red-400" />;
      default: return <Wifi className="w-5 h-5 text-green-400" />;
    }
  };

  const handleApiModeSwitch = (newMode) => {
    setApiMode(newMode);
    setDetailedErrors({});
    setRetryCount(0);
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    runComprehensiveDiagnostics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-800 text-white">
      {/* Emergency Header */}
      <div className="bg-red-900/50 backdrop-blur-sm border-b border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-600 p-3 rounded-full">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SOS API Diagnostic Center</h1>
                <p className="text-red-200 mt-1">Centre de diagnostic d'urgence pour résolution de crise API</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Network Diagnostics */}
              {networkDiagnostics?.latency && (
                <div className="flex items-center space-x-2 text-sm text-red-200">
                  <Gauge className="w-4 h-4" />
                  <span>{networkDiagnostics?.latency}ms</span>
                  <span className="opacity-60">|</span>
                  <span>{networkDiagnostics?.successRate}% réussite</span>
                </div>
              )}

              {/* Auto-retry toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-retry"
                  checked={autoRetryEnabled}
                  onChange={(e) => setAutoRetryEnabled(e?.target?.checked)}
                  className="rounded bg-red-700 border-red-600"
                />
                <label htmlFor="auto-retry" className="text-sm text-red-200">
                  Auto-retry
                </label>
              </div>

              {/* API Mode Switcher */}
              <div className="flex items-center space-x-2">
                <select
                  value={apiMode}
                  onChange={(e) => handleApiModeSwitch(e?.target?.value)}
                  className="bg-red-700 text-white px-3 py-2 rounded-lg border border-red-600 text-sm"
                >
                  <option value="production">Production API</option>
                  <option value="mock">Mode Développement</option>
                </select>
              </div>

              <button
                onClick={handleManualRetry}
                disabled={isRunningDiagnostics}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
                <span>Diagnostic complet</span>
              </button>
              
              {lastDiagnosticRun && (
                <div className="text-sm text-red-200">
                  Dernier test: {lastDiagnosticRun}
                </div>
              )}
            </div>
          </div>

          {/* Overall Status Banner */}
          <div className={`mt-6 p-4 rounded-lg border ${
            getOverallStatus() === 'critical' ? 'bg-red-800/50 border-red-600' :
            getOverallStatus() === 'warning' ? 'bg-yellow-800/50 border-yellow-600' :
            getOverallStatus() === 'partial' ? 'bg-orange-800/50 border-orange-600' :
            getOverallStatus() === 'healthy' ? 'bg-green-800/50 border-green-600' : 'bg-gray-800/50 border-gray-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">État global du système</h3>
                    {getConnectionIcon()}
                    <span className="text-sm opacity-75">
                      ({apiMode === 'production' ? 'api.trading-mvp.com' : 'Mode développement'})
                    </span>
                    {retryCount > 0 && (
                      <span className="text-xs bg-orange-600/50 px-2 py-0.5 rounded">
                        Retry {retryCount}/3
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    {getOverallStatus() === 'critical' && "CRITIQUE - Action immédiate requise"}
                    {getOverallStatus() === 'warning' && "ATTENTION - Problèmes partiels détectés"}
                    {getOverallStatus() === 'partial' && "PARTIEL - Certains services répondent"}
                    {getOverallStatus() === 'healthy' && "OPÉRATIONNEL - Tous systèmes OK"}
                    {getOverallStatus() === 'unknown' && "EN COURS - Tests de diagnostic"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {Object.entries(diagnosticResults)?.map(([key, status]) => (
                  <div key={key} className="flex items-center" title={key}>
                    {getStatusIcon(status)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Error Details Panel */}
          {Object.keys(detailedErrors)?.length > 0 && (
            <div className="mt-4 p-3 bg-red-950/50 border border-red-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-200 mb-2">Erreurs détectées:</p>
                  <div className="space-y-2 text-red-300">
                    {Object.entries(detailedErrors)?.map(([key, error]) => (
                      <div key={key} className="bg-red-900/30 p-2 rounded border-l-2 border-red-500">
                        <div className="flex items-start space-x-2">
                          <span className="font-mono text-xs bg-red-800/50 px-2 py-0.5 rounded uppercase flex-shrink-0">
                            {key}
                          </span>
                          <div className="text-xs space-y-1">
                            <div>{error}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Development Mode Notice */}
          {connectionStatus === 'offline' && apiMode === 'production' && (
            <div className="mt-4 p-3 bg-blue-900/50 border border-blue-600 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-200">Mode Développement Recommandé</p>
                  <p className="text-blue-300 mt-1">
                    L'API de production n'est pas accessible. Basculez en "Mode Développement" 
                    pour tester l'interface avec des données simulées.
                  </p>
                  <button
                    onClick={() => handleApiModeSwitch('mock')}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Basculer en mode développement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mock Mode Success Notice */}
          {apiMode === 'mock' && getOverallStatus() === 'healthy' && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-600 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-200">Mode Développement Actif</p>
                  <p className="text-green-300 mt-1">
                    Tests réussis avec l'API simulée. L'interface fonctionne correctement 
                    avec des données de test. Prêt pour le développement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Three-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Probable Causes */}
          <div className="space-y-6">
            <ProbableCausesPanel diagnosticResults={diagnosticResults} />
          </div>

          {/* Center Column - Automated Verification */}
          <div className="space-y-6">
            <AutomatedVerificationPanel apiBase={API_BASE} />
          </div>

          {/* Right Column - Immediate Fixes */}
          <div className="space-y-6">
            <ImmediateFixesPanel />
          </div>
        </div>

        {/* Full Width - Debug Widget */}
        <div className="mt-8">
          <DebugWidgetPanel apiBase={API_BASE} />
        </div>
      </div>
    </div>
  );
}