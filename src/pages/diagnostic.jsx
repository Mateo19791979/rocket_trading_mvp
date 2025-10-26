import { useEffect, useState } from 'react';
import { ping, getPositions, getMarket, getOps, tlsHealth, apiClient } from '@/lib/api';
import { marketData } from '@/lib/marketService';
import { networkRecovery } from '@/services/networkRecoveryService';
import { AlertCircle, CheckCircle, Clock, Wifi, Database, TrendingUp, RefreshCcw, Activity, Shield, Server } from 'lucide-react';

export default function Diagnostic() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [marketDiagnostics, setMarketDiagnostics] = useState(null);
  const [networkDiagnostics, setNetworkDiagnostics] = useState(null);
  const [connectionState, setConnectionState] = useState(null);

  useEffect(() => {
    runDiagnostics();
    
    // Listen to network events
    const handleNetworkOffline = (event) => {
      console.warn('Network offline event received:', event?.detail);
      setConnectionState({ status: 'offline', ...event?.detail });
    };
    
    const handleNetworkRecovered = (event) => {
      console.log('Network recovered event received:', event?.detail);
      setConnectionState({ status: 'online', ...event?.detail });
      runDiagnostics(); // Re-run diagnostics on recovery
    };
    
    const handleRecoveryFailed = (event) => {
      console.error('Network recovery failed:', event?.detail);
      setConnectionState({ status: 'failed', ...event?.detail });
    };

    window?.addEventListener('network:offline', handleNetworkOffline);
    window?.addEventListener('network:recovered', handleNetworkRecovered);
    window?.addEventListener('network:recovery-failed', handleRecoveryFailed);

    // Cleanup listeners
    return () => {
      window?.removeEventListener('network:offline', handleNetworkOffline);
      window?.removeEventListener('network:recovered', handleNetworkRecovered);
      window?.removeEventListener('network:recovery-failed', handleRecoveryFailed);
    };
  }, []);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const logs = [];

    const wrap = async (label, fn, icon = CheckCircle) => {
      const startTime = performance.now();
      try {
        const result = await fn();
        const duration = Math.round(performance.now() - startTime);
        
        logs?.push({ 
          label, 
          ok: true, 
          result, 
          duration,
          icon: CheckCircle,
          timestamp: new Date()?.toISOString()
        });
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const errorMessage = String(error?.message || error);
        
        logs?.push({ 
          label, 
          ok: false, 
          error: errorMessage, 
          duration,
          icon: AlertCircle,
          timestamp: new Date()?.toISOString(),
          troubleshooting: getTroubleshootingInfo(label, errorMessage)
        });
      }
    };

    // Network Recovery System Test
    await wrap('Network Recovery System', async () => {
      const state = networkRecovery?.getConnectionState();
      const isOnline = networkRecovery?.isOnline();
      return {
        online: isOnline,
        consecutiveFailures: state?.consecutiveFailures,
        lastConnection: state?.lastSuccessfulConnection,
        uptime: state?.uptime
      };
    }, Activity);

    // Core API tests with enhanced error handling
    await wrap('API Health Check', ping, Wifi);
    await wrap('Portfolio Positions', getPositions, TrendingUp);
    await wrap('Market Data', getMarket, TrendingUp);
    await wrap('Operations Status', getOps, CheckCircle);
    await wrap('TLS Security', tlsHealth, Shield);
    
    // Database connectivity
    await wrap('Database Ping', marketData?.dbPing, Database);
    
    // Provider tests with fallback handling
    await wrap('Polygon.io Provider', () => 
      marketData?.service?.getLatestData('AAPL', 'polygon_io'), TrendingUp);
    await wrap('Alpha Vantage Provider', () => 
      marketData?.service?.getLatestData('AAPL', 'alpha_vantage'), TrendingUp);
    await wrap('Yahoo Finance Provider', () => 
      marketData?.service?.getLatestData('AAPL', 'yahoo_finance'), TrendingUp);

    // Enhanced API Client Test
    await wrap('API Infrastructure Client', async () => {
      return apiClient?.runDiagnostics();
    }, Server);

    setResults(logs);
    
    // Run comprehensive market diagnostics
    try {
      const fullDiagnostics = await marketData?.service?.runFullDiagnostics();
      setMarketDiagnostics(fullDiagnostics);
    } catch (error) {
      console.warn('Failed to run full market diagnostics:', error);
    }
    
    // Run network recovery diagnostics
    try {
      const networkDiag = await networkRecovery?.runDiagnostics();
      setNetworkDiagnostics(networkDiag);
    } catch (error) {
      console.warn('Failed to run network diagnostics:', error);
    }
    
    setIsLoading(false);
  };

  const getTroubleshootingInfo = (testName, errorMessage) => {
    if (errorMessage?.includes('Failed to fetch') || errorMessage?.includes('NetworkError') || errorMessage?.includes('TypeError')) {
      return {
        cause: 'Network connectivity or API endpoint failure',
        solutions: [
          '1. Check if backend server is running: curl http://localhost:8001/health',
          '2. Verify environment variables: VITE_API_BASE_URL in .env',
          '3. Test production API: curl https://trading-mvp.com/api/health',
          '4. Check Nginx proxy configuration and routing',
          '5. Verify CORS settings allow your domain',
          '6. Check firewall and network connectivity',
          '7. Run network recovery: Click "Force Network Recovery" below'
        ],
        severity: 'high'
      };
    }
    
    if (testName?.includes('Database') && errorMessage?.includes('Supabase')) {
      return {
        cause: 'Supabase database connection issue',
        solutions: [
          'Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
          'Verify Supabase project is not paused',
          'Check RLS policies and permissions',
          'Test connection: https://your-project.supabase.co/rest/v1/',
          'Verify internet connectivity to Supabase'
        ],
        severity: 'medium'
      };
    }
    
    if (testName?.includes('Provider')) {
      return {
        cause: 'Market data provider API issue',
        solutions: [
          'Check provider API key configuration in .env',
          'Verify provider service status and rate limits',
          'Test provider endpoint directly',
          'Try alternative providers (Yahoo Finance fallback)',
          'Check quotas and billing status'
        ],
        severity: 'low'
      };
    }
    
    return {
      cause: 'Unknown error',
      solutions: ['Check browser console for more details', 'Try refreshing the page'],
      severity: 'medium'
    };
  };

  const handleForceRecovery = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Manual network recovery initiated...');
      await networkRecovery?.forceRecovery();
      setTimeout(() => runDiagnostics(), 2000); // Re-run diagnostics after recovery
    } catch (error) {
      console.error('Force recovery failed:', error);
    }
  };

  const getStatusColor = (ok) => ok ? 'text-green-600' : 'text-red-600';
  const getStatusBg = (ok) => ok ? 'bg-green-50' : 'bg-red-50';
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };
  
  const successCount = results?.filter(r => r?.ok)?.length;
  const totalCount = results?.length;
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
  const criticalErrors = results?.filter(r => !r?.ok && r?.troubleshooting?.severity === 'high')?.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Trading MVP Infrastructure Diagnostic & Recovery Center
          </h1>
          <p className="text-gray-600">
            Advanced system health monitoring with automatic error recovery
          </p>
        </div>

        {/* Connection Status Banner */}
        {connectionState && (
          <div className={`mb-6 p-4 rounded-lg border ${
            connectionState?.status === 'online' ? 'bg-green-50 border-green-200' :
            connectionState?.status === 'offline'? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${
                  connectionState?.status === 'online' ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className="font-medium">
                  Network Status: {connectionState?.status?.toUpperCase()}
                </span>
              </div>
              {connectionState?.status !== 'online' && (
                <button
                  onClick={handleForceRecovery}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Force Recovery
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Health</p>
                <p className={`text-2xl font-bold ${successRate >= 80 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {successRate}%
                </p>
              </div>
              <div className={`p-2 rounded-full ${successRate >= 80 ? 'bg-green-100' : successRate >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                {successRate >= 80 ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful Tests</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Tests</p>
                <p className="text-2xl font-bold text-red-600">{totalCount - successCount}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Errors</p>
                <p className="text-2xl font-bold text-red-600">{criticalErrors}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-700">{totalCount}</p>
              </div>
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Network Diagnostics Summary */}
        {networkDiagnostics && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Network Infrastructure Status
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Network Health</p>
                  <p className={`text-lg font-bold ${
                    networkDiagnostics?.overall?.averageSuccessRate >= 80 ? 'text-green-600' :
                    networkDiagnostics?.overall?.averageSuccessRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {networkDiagnostics?.overall?.averageSuccessRate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Browser Online</p>
                  <p className={`text-lg font-bold ${networkDiagnostics?.browserOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {networkDiagnostics?.browserOnline ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-lg font-bold ${
                    networkDiagnostics?.overall?.recommendation?.status === 'healthy' ? 'text-green-600' :
                    networkDiagnostics?.overall?.recommendation?.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {networkDiagnostics?.overall?.recommendation?.status?.toUpperCase()}
                  </p>
                </div>
              </div>
              
              {networkDiagnostics?.overall?.recommendation?.actions?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Network Recommendations:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {networkDiagnostics?.overall?.recommendation?.actions?.map((action, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Diagnostic Results */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Diagnostic Results</h2>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <RefreshCcw className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Running diagnostics...</span>
              </div>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {results?.map((test, index) => (
              <div key={index} className={`p-6 ${getStatusBg(test?.ok)}`}>
                <div className="flex items-start space-x-3">
                  <test.icon className={`w-5 h-5 mt-0.5 ${getStatusColor(test?.ok)}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{test?.label}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{test?.duration}ms</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          test?.ok 
                            ? 'bg-green-100 text-green-800' :'bg-red-100 text-red-800'
                        }`}>
                          {test?.ok ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                    
                    {test?.ok ? (
                      <div className="text-xs text-gray-600">
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(test?.result, null, 2)?.slice(0, 500)}
                          {JSON.stringify(test?.result, null, 2)?.length > 500 && '...'}
                        </pre>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-red-600 font-medium">Error: {test?.error}</p>
                        
                        {test?.troubleshooting && (
                          <div className={`border rounded-md p-3 ${getSeverityColor(test?.troubleshooting?.severity)}`}>
                            <h4 className="text-sm font-medium mb-2">
                              🔧 {test?.troubleshooting?.cause}
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                test?.troubleshooting?.severity === 'high' ? 'bg-red-200 text-red-800' :
                                test?.troubleshooting?.severity === 'medium'? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                              }`}>
                                {test?.troubleshooting?.severity?.toUpperCase()} PRIORITY
                              </span>
                            </h4>
                            <ul className="text-sm space-y-1">
                              {test?.troubleshooting?.solutions?.map((solution, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-gray-600 font-mono">•</span>
                                  <span>{solution}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Diagnostics Summary */}
        {marketDiagnostics && (
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Market Data Provider Status</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Overall Status</p>
                  <p className={`text-lg font-bold ${
                    marketDiagnostics?.summary?.overall_status === 'all_pass' ? 'text-green-600' :
                    marketDiagnostics?.summary?.overall_status === 'partial_pass'? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {marketDiagnostics?.summary?.overall_status?.replace('_', ' ')?.toUpperCase()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-lg font-bold text-blue-600">{marketDiagnostics?.summary?.pass_rate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tests</p>
                  <p className="text-lg font-bold text-gray-700">
                    {marketDiagnostics?.summary?.passed}/{marketDiagnostics?.summary?.total}
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Last updated: {new Date(marketDiagnostics?.timestamp)?.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Running...' : 'Re-run Diagnostics'}</span>
          </button>
          
          <button
            onClick={() => window.open('https://trading-mvp.com/api/health', '_blank')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <Wifi className="w-4 h-4" />
            <span>Test Production API</span>
          </button>
          
          <button
            onClick={handleForceRecovery}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>Force Network Recovery</span>
          </button>
          
          <button
            onClick={() => window.open('/api-infrastructure-recovery-center', '_blank')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center space-x-2"
          >
            <Server className="w-4 h-4" />
            <span>Open Recovery Center</span>
          </button>
        </div>
      </div>
    </div>
  );
}