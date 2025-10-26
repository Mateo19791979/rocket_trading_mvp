import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Settings, Globe, Database, Server, Shield, Wrench, AlertTriangle } from 'lucide-react';
import { checkOnline } from '@/lib/online.js';
import { getApiDiagnostics } from '@/lib/apiBase.js';
import { networkRecovery } from '@/services/networkRecoveryService.js';
import { supabaseDiagnostics } from '@/services/supabaseDiagnosticService.js';

export default function OfflineRecoveryCenter() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [supabaseDiag, setSupabaseDiag] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionState, setConnectionState] = useState('checking');
  const [recoveryLog, setRecoveryLog] = useState([]);
  const [autoFixInProgress, setAutoFixInProgress] = useState(false);

  useEffect(() => {
    runInitialDiagnostics();
    
    // Listen for network events
    const handleNetworkEvent = (event) => {
      addLogEntry(`Network event: ${event?.type}`, event?.detail);
    };
    
    window.addEventListener('network:offline', handleNetworkEvent);
    window.addEventListener('network:recovered', handleNetworkEvent);
    window.addEventListener('network:recovery-failed', handleNetworkEvent);
    
    return () => {
      window.removeEventListener('network:offline', handleNetworkEvent);
      window.removeEventListener('network:recovered', handleNetworkEvent);
      window.removeEventListener('network:recovery-failed', handleNetworkEvent);
    };
  }, []);

  const runInitialDiagnostics = async () => {
    setIsRunning(true);
    addLogEntry('🔍 Starting comprehensive diagnostic scan...');
    
    try {
      // Run parallel diagnostics
      const [apiDiag, connectivityTest, networkDiag, supabaseResult] = await Promise.all([
        getApiDiagnostics(),
        checkOnline(),
        networkRecovery?.runDiagnostics?.() || Promise.resolve({}),
        supabaseDiagnostics?.runCompleteDiagnostics()
      ]);
      
      const combinedDiagnostics = {
        timestamp: new Date()?.toISOString(),
        api: apiDiag,
        connectivity: connectivityTest,
        network: networkDiag,
        browser: {
          userAgent: navigator.userAgent,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          serviceWorker: 'serviceWorker' in navigator
        }
      };
      
      setDiagnostics(combinedDiagnostics);
      setSupabaseDiag(supabaseResult);
      
      // Determine overall connection state
      let overallState = 'online';
      if (supabaseResult?.severity === 'critical') {
        overallState = 'critical-db-errors';
        addLogEntry('❌ CRITICAL: Database schema errors detected', { 
          errors: supabaseResult?.errors?.totalErrors,
          autoFix: supabaseResult?.autoFixAvailable 
        });
      } else if (!connectivityTest?.online) {
        overallState = 'offline';
      }
      
      setConnectionState(overallState);
      
      addLogEntry(
        `✅ Diagnostics complete: ${overallState?.replace('-', ' ')?.toUpperCase()}`,
        { 
          connectivity: connectivityTest?.online,
          dbErrors: supabaseResult?.errors?.totalErrors || 0
        }
      );
      
    } catch (error) {
      addLogEntry('❌ Diagnostic scan failed', { error: error?.message });
      setConnectionState('error');
    } finally {
      setIsRunning(false);
    }
  };

  const addLogEntry = (message, data = null) => {
    const entry = {
      timestamp: new Date()?.toLocaleTimeString(),
      message,
      data
    };
    
    setRecoveryLog(prev => [entry, ...prev?.slice(0, 29)]); // Keep last 30 entries
  };

  const handleForceRecovery = async () => {
    setIsRunning(true);
    addLogEntry('🔄 Force recovery initiated...');
    
    try {
      await networkRecovery?.forceRecovery();
      addLogEntry('✅ Force recovery completed');
      
      // Re-run diagnostics after recovery
      setTimeout(() => runInitialDiagnostics(), 2000);
    } catch (error) {
      addLogEntry('❌ Force recovery failed', { error: error?.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleDatabaseAutoFix = async () => {
    setAutoFixInProgress(true);
    addLogEntry('🔧 Database auto-fix initiated...');
    
    try {
      const fixResult = await supabaseDiagnostics?.attemptAutoFix();
      
      if (fixResult?.success) {
        addLogEntry(`✅ Auto-fix completed: ${fixResult?.appliedFixes?.length} fixes applied`);
        
        for (const fix of fixResult?.appliedFixes || []) {
          addLogEntry(`  ✓ ${fix?.description}`, { status: fix?.status });
        }
        
        if (fixResult?.requiresManualIntervention) {
          addLogEntry('⚠️ Some fixes require manual intervention');
        }
      } else {
        addLogEntry('❌ Auto-fix failed or no fixes available');
        
        for (const error of fixResult?.errors || []) {
          addLogEntry(`  ✗ ${error?.fix}: ${error?.error}`);
        }
      }
      
      // Re-run diagnostics to verify fixes
      setTimeout(() => runInitialDiagnostics(), 3000);
      
    } catch (error) {
      addLogEntry('❌ Auto-fix process failed', { error: error?.message });
    } finally {
      setAutoFixInProgress(false);
    }
  };

  const handleClearCache = async () => {
    addLogEntry('🗑️ Clearing browser cache...');
    
    try {
      // Clear caches if supported
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames?.map(name => caches.delete(name)));
        addLogEntry(`✅ Cleared ${cacheNames?.length} cache(s)`);
      }
      
      // Notify service worker to clear its caches
      if ('serviceWorker' in navigator && navigator.serviceWorker?.controller) {
        navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_CACHE' });
        addLogEntry('📨 Requested service worker cache clear');
      }
      
      // Force page reload after cache clear
      setTimeout(() => {
        addLogEntry('🔄 Reloading page...');
        window.location?.reload();
      }, 1000);
      
    } catch (error) {
      addLogEntry('❌ Cache clear failed', { error: error?.message });
    }
  };

  const getStatusColor = () => {
    switch (connectionState) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      case 'critical-db-errors': return 'text-red-600 bg-red-50 border-red-200';
      case 'checking': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'online': return <CheckCircle className="w-6 h-6" />;
      case 'offline': return <WifiOff className="w-6 h-6" />;
      case 'critical-db-errors': return <AlertTriangle className="w-6 h-6" />;
      case 'checking': return <RefreshCw className="w-6 h-6 animate-spin" />;
      default: return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionState) {
      case 'online': return 'System Online';
      case 'offline': return 'Network Offline';
      case 'critical-db-errors': return 'Critical Database Errors';
      case 'checking': return 'Diagnosing System';
      default: return 'System Status Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 Recovery Center - "Plus Rien" Repair
          </h1>
          <p className="text-xl text-gray-600">
            Diagnostic avancé et réparation des erreurs critiques
          </p>
        </div>

        {/* Critical Status Alert */}
        {connectionState === 'critical-db-errors' && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">
                  🚨 Problème "On a plus rien" détecté !
                </h3>
                <p className="text-red-700">
                  Des colonnes critiques sont manquantes dans la base de données. 
                  Erreurs SQL 42703 détectées. Auto-réparation disponible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status Card */}
        <div className={`mb-8 p-6 rounded-xl border-2 ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h2 className="text-xl font-semibold">
                  Status: {getStatusMessage()}
                </h2>
                <p className="text-sm opacity-75">
                  {diagnostics?.connectivity?.baseUrl || 'Checking...'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={runInitialDiagnostics}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>Re-scan</span>
              </button>
              
              <button
                onClick={handleForceRecovery}
                disabled={isRunning}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Wifi className="w-4 h-4" />
                <span>Force Recovery</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Issues Panel */}
          {supabaseDiag && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-600" />
                Database Issues
              </h2>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${supabaseDiag?.severity === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <h3 className="font-medium flex items-center mb-2">
                    <Database className="w-4 h-4 mr-2" />
                    Schema Status: {supabaseDiag?.severity?.toUpperCase()}
                  </h3>
                  <div className="text-sm space-y-1">
                    <div>Total Errors: <span className="font-medium">{supabaseDiag?.errors?.totalErrors || 0}</span></div>
                    <div>Critical Errors: <span className="font-medium">{supabaseDiag?.errors?.criticalErrors?.length || 0}</span></div>
                    <div>Auto-Fix Available: {supabaseDiag?.autoFixAvailable ? '✅ Yes' : '❌ No'}</div>
                  </div>
                </div>

                {supabaseDiag?.errors?.criticalErrors?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Critical Errors Detected:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {supabaseDiag?.errors?.criticalErrors?.map((error, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>{error?.table}.{error?.column} missing (SQL {error?.sqlState})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {supabaseDiag?.recommendations?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Recommendations:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {supabaseDiag?.recommendations?.slice(0, 3)?.map((rec, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>{rec?.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Diagnostics Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-blue-600" />
              System Diagnostics
            </h2>
            
            {diagnostics ? (
              <div className="space-y-4">
                {/* API Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium flex items-center mb-2">
                    <Server className="w-4 h-4 mr-2" />
                    API Configuration
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Base URL: <code className="bg-gray-200 px-1 rounded">{diagnostics?.api?.baseUrl}</code></div>
                    <div>Environment: <code className="bg-gray-200 px-1 rounded">{diagnostics?.api?.environmentVar || 'auto-detected'}</code></div>
                    <div>Is Production: {diagnostics?.api?.isProduction ? '✅' : '❌'}</div>
                    <div>Is Development: {diagnostics?.api?.isDevelopment ? '✅' : '❌'}</div>
                  </div>
                </div>

                {/* Connectivity Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium flex items-center mb-2">
                    <Globe className="w-4 h-4 mr-2" />
                    Network Connectivity
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Status: <span className={diagnostics?.connectivity?.online ? 'text-green-600' : 'text-red-600'}>
                      {diagnostics?.connectivity?.online ? '✅ Online' : '❌ Offline'}
                    </span></div>
                    {diagnostics?.connectivity?.latency && (
                      <div>Latency: {Math.round(diagnostics?.connectivity?.latency)}ms</div>
                    )}
                    {diagnostics?.connectivity?.error && (
                      <div>Error: <span className="text-red-600">{diagnostics?.connectivity?.error}</span></div>
                    )}
                  </div>
                </div>

                {/* Browser Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium flex items-center mb-2">
                    <Database className="w-4 h-4 mr-2" />
                    Browser Environment
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Navigator Online: {diagnostics?.browser?.onLine ? '✅' : '❌'}</div>
                    <div>Cookies Enabled: {diagnostics?.browser?.cookieEnabled ? '✅' : '❌'}</div>
                    <div>Service Worker: {diagnostics?.browser?.serviceWorker ? '✅' : '❌'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Running diagnostics...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recovery Actions Panel */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Wrench className="w-6 h-6 mr-2 text-green-600" />
            Recovery Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Auto-Fix */}
            {supabaseDiag?.autoFixAvailable && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-medium mb-2">🔧 Auto-Fix Database</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Automatically repair missing database columns and schema issues.
                </p>
                <button
                  onClick={handleDatabaseAutoFix}
                  disabled={autoFixInProgress}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {autoFixInProgress ? 'Fixing...' : 'Fix Database Issues'}
                </button>
              </div>
            )}

            {/* Force Recovery */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">🔄 Force Network Recovery</h3>
              <p className="text-sm text-gray-600 mb-3">
                Attempt to restore network connectivity using multiple recovery strategies.
              </p>
              <button
                onClick={handleForceRecovery}
                disabled={isRunning}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Start Recovery'}
              </button>
            </div>

            {/* Clear Cache */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">🗑️ Clear Browser Cache</h3>
              <p className="text-sm text-gray-600 mb-3">
                Clear all cached data and force fresh requests. Will reload the page.
              </p>
              <button
                onClick={handleClearCache}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear Cache & Reload
              </button>
            </div>

            {/* Return to Dashboard */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium mb-2">🏠 Return to Dashboard</h3>
              <p className="text-sm text-gray-600 mb-3">
                Navigate back to the main application dashboard.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Recovery Log */}
        {recoveryLog?.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">📋 Recovery Log</h2>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-80 overflow-y-auto">
              {recoveryLog?.map((entry, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-400">[{entry?.timestamp}]</span> {entry?.message}
                  {entry?.data && (
                    <div className="text-gray-500 pl-4 text-xs">
                      {JSON.stringify(entry?.data)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}