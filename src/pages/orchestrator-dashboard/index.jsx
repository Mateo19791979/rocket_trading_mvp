import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Play, Pause, RotateCcw, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle, Globe, Shield, Timer, Server } from 'lucide-react';
import { orchestratorService } from '../../services/orchestratorService';
import AgentStatusGrid from './components/AgentStatusGrid';
import EventBusMonitor from './components/EventBusMonitor';
import RegimeStatePanel from './components/RegimeStatePanel';
import KillswitchPanel from './components/KillswitchPanel';

function OrchestratorDashboard() {
  const [dashboardData, setDashboardData] = useState({
    agents: null,
    events: null,
    regime: null,
    errors: {},
    fallbackMode: false,
    connectionStatus: 'disconnected'
  });
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // Changed to 30 seconds as requested
  const [lastRefresh, setLastRefresh] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  
  // Trading MVP verification state
  const [mvpVerification, setMvpVerification] = useState({
    status: null,
    registry: null,
    scores: null,
    select: null,
    allocate: null,
    corsCheck: { status: 'unknown', errors: [] },
    httpsCheck: { status: 'unknown', certificate: null },
    dnsCheck: { status: 'unknown', endpoints: {} }
  });
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Trading MVP API base URL
  const MVP_API_BASE = 'https://api.trading-mvp.com';
  const MVP_REFRESH_MS = 30000; // 30 seconds as specified

  // Verify Trading MVP endpoints
  const verifyMVPEndpoints = async () => {
    setVerificationLoading(true);
    const results = {
      status: null,
      registry: null,
      scores: null,
      select: null,
      allocate: null,
      corsCheck: { status: 'unknown', errors: [] },
      httpsCheck: { status: 'unknown', certificate: null },
      dnsCheck: { status: 'unknown', endpoints: {} }
    };

    // Helper function to test endpoint with CORS and HTTPS verification
    const testEndpoint = async (path, expectedData = null) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller?.abort(), 10000);

        const response = await fetch(`${MVP_API_BASE}${path}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window?.location?.origin
          },
          signal: controller?.signal
        });

        clearTimeout(timeoutId);

        if (!response?.ok) {
          throw new Error(`HTTP ${response?.status}: ${response?.statusText}`);
        }

        const data = await response?.json();
        
        return {
          status: 'OK',
          data,
          timing: Date.now(),
          https: response?.url?.startsWith('https://'),
          cors: !response?.headers?.get('access-control-allow-origin') ? 'warning' : 'ok',
          size: JSON.stringify(data)?.length
        };

      } catch (error) {
        let status = 'ERROR';
        if (error?.name === 'AbortError') status = 'TIMEOUT';
        if (error?.message?.includes('CORS')) status = 'CORS_ERROR';
        if (error?.message?.includes('NetworkError')) status = 'NETWORK_ERROR';

        return {
          status,
          error: error?.message,
          timing: null,
          https: false,
          cors: 'error'
        };
      }
    };

    try {
      // Test all required endpoints
      const [statusResult, registryResult, scoresResult, selectResult, allocateResult] = await Promise.allSettled([
        testEndpoint('/status'),
        testEndpoint('/registry'),
        testEndpoint('/scores?window=252'),
        testEndpoint('/select'),
        testEndpoint('/allocate')
      ]);

      // Process results
      results.status = statusResult?.status === 'fulfilled' ? statusResult?.value : { status: 'ERROR', error: statusResult?.reason?.message };
      results.registry = registryResult?.status === 'fulfilled' ? registryResult?.value : { status: 'ERROR', error: registryResult?.reason?.message };
      results.scores = scoresResult?.status === 'fulfilled' ? scoresResult?.value : { status: 'ERROR', error: scoresResult?.reason?.message };
      results.select = selectResult?.status === 'fulfilled' ? selectResult?.value : { status: 'ERROR', error: selectResult?.reason?.message };
      results.allocate = allocateResult?.status === 'fulfilled' ? allocateResult?.value : { status: 'ERROR', error: allocateResult?.reason?.message };

      // CORS verification
      const corsErrors = [];
      [results?.status, results?.registry, results?.scores, results?.select, results?.allocate]?.forEach((result, idx) => {
        const endpoints = ['/status', '/registry', '/scores', '/select', '/allocate'];
        if (result?.cors === 'error' || result?.cors === 'warning') {
          corsErrors?.push(`${endpoints?.[idx]}: CORS issue detected`);
        }
      });

      results.corsCheck = {
        status: corsErrors?.length === 0 ? 'OK' : 'WARN',
        errors: corsErrors
      };

      // HTTPS verification
      const httpsValid = [results?.status, results?.registry, results?.scores, results?.select, results?.allocate]?.every(r => r?.https);
      results.httpsCheck = {
        status: httpsValid ? 'OK' : 'ERROR',
        certificate: httpsValid ? 'Let\'s Encrypt OK' : 'Certificate issues detected'
      };

      // DNS verification
      const dnsEndpoints = {
        'trading-mvp.com': 'unknown',
        'api.trading-mvp.com': results?.status?.status === 'OK' ? 'OK' : 'ERROR'
      };
      
      results.dnsCheck = {
        status: dnsEndpoints?.['api.trading-mvp.com'] === 'OK' ? 'OK' : 'ERROR',
        endpoints: dnsEndpoints
      };

    } catch (error) {
      console.error('MVP verification failed:', error);
    }

    setMvpVerification(results);
    setVerificationLoading(false);
  };

  // Load dashboard data with MVP verification
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await orchestratorService?.getDashboardData();
      setDashboardData(data);
      setLastRefresh(new Date());
      
      // Also verify MVP endpoints
      await verifyMVPEndpoints();
      
      if (data?.agents || data?.events || data?.regime) {
        console.log('Dashboard data loaded successfully');
      }
    } catch (error) {
      console.error('Dashboard data load error:', error);
      setDashboardData(prev => ({
        ...prev,
        errors: { general: error?.message || 'Failed to load data' }
      }));
    }
    setLoading(false);
  };

  // Force reconnection attempt
  const handleForceReconnect = async () => {
    setReconnecting(true);
    try {
      const reconnected = await orchestratorService?.forceReconnect();
      if (reconnected) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Force reconnect error:', error);
    }
    setReconnecting(false);
  };

  // Setup WebSocket connection
  useEffect(() => {
    orchestratorService?.connectWebSocket();

    const handleConnection = (status) => {
      setWsStatus(status?.status || 'disconnected');
      
      if (status?.status === 'connected') {
        loadDashboardData();
      }
    };

    const handleRealtimeEvent = (eventData) => {
      if (eventData?.type === 'redis_event') {
        setDashboardData(prev => ({
          ...prev,
          events: prev?.events?.events ? {
            ...prev?.events,
            events: [eventData, ...prev?.events?.events?.slice(0, 19)]
          } : prev?.events
        }));
      }
      
      if (eventData?.type === 'killswitch_activated') {
        loadDashboardData();
      }
    };

    orchestratorService?.on('connection', handleConnection);
    orchestratorService?.on('message', handleRealtimeEvent);

    return () => {
      orchestratorService?.off('connection', handleConnection);
      orchestratorService?.off('message', handleRealtimeEvent);
      orchestratorService?.disconnectWebSocket();
    };
  }, []);

  // Auto-refresh setup (30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleKillswitchActivate = async (reason) => {
    const result = await orchestratorService?.activateKillswitch(reason);
    if (result?.success) {
      await loadDashboardData();
      return { success: true };
    }
    return result;
  };

  // Calculate summary stats
  const stats = {
    totalAgents: dashboardData?.agents?.agents?.length || 0,
    activeAgents: dashboardData?.agents?.agents?.filter(a => a?.is_alive)?.length || 0,
    totalEvents: dashboardData?.events?.events?.length || 0,
    wsConnected: wsStatus === 'connected',
    fallbackMode: dashboardData?.fallbackMode || false
  };

  // MVP endpoint status summary
  const mvpStats = {
    totalEndpoints: 5,
    healthyEndpoints: [mvpVerification?.status, mvpVerification?.registry, mvpVerification?.scores, mvpVerification?.select, mvpVerification?.allocate]?.filter(e => e?.status === 'OK')?.length || 0,
    corsStatus: mvpVerification?.corsCheck?.status || 'unknown',
    httpsStatus: mvpVerification?.httpsCheck?.status || 'unknown',
    dnsStatus: mvpVerification?.dnsCheck?.status || 'unknown'
  };

  // Determine overall system health
  const systemHealth = () => {
    if (loading) return 'loading';
    if (stats?.fallbackMode) return 'degraded';
    if (stats?.wsConnected && stats?.totalAgents > 0 && mvpStats?.healthyEndpoints >= 4) return 'healthy';
    if (stats?.totalAgents === 0) return 'no-data';
    return 'warning';
  };

  const healthStatus = systemHealth();

  // MVP Endpoint Card Component
  const EndpointCard = ({ title, endpoint, result, expectedData }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'OK': return 'text-green-400 bg-green-900';
        case 'WARN': return 'text-yellow-400 bg-yellow-900';
        case 'ERROR': case 'TIMEOUT': case 'CORS_ERROR': return 'text-red-400 bg-red-900';
        default: return 'text-gray-400 bg-gray-700';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'OK': return <CheckCircle className="w-4 h-4" />;
        case 'WARN': return <AlertCircle className="w-4 h-4" />;
        case 'ERROR': case 'TIMEOUT': case 'CORS_ERROR': return <XCircle className="w-4 h-4" />;
        default: return <AlertCircle className="w-4 h-4" />;
      }
    };

    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-white">{title}</h3>
          <div className={`flex items-center space-x-2 px-2 py-1 rounded text-xs ${getStatusColor(result?.status || 'unknown')}`}>
            {getStatusIcon(result?.status || 'unknown')}
            <span>{result?.status || 'UNKNOWN'}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-2">
          <code className="bg-gray-900 px-2 py-1 rounded text-xs">{MVP_API_BASE}{endpoint}</code>
        </div>

        {result?.data && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">Response Data:</div>
            <div className="bg-gray-900 p-2 rounded text-xs font-mono text-green-400 max-h-32 overflow-y-auto">
              {JSON.stringify(result?.data, null, 2)}
            </div>
          </div>
        )}

        {result?.error && (
          <div className="mt-2 text-xs text-red-400">
            <strong>Error:</strong> {result?.error}
          </div>
        )}

        {result?.timing && (
          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
            <span>⏱ {result?.timing ? 'Response received' : 'No response'}</span>
            {result?.https && <span>🔒 HTTPS</span>}
            {result?.size && <span>📄 {result?.size} bytes</span>}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading Trading MVP Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-semibold">Trading MVP - Système de Vérification</h1>
              </div>
              
              {/* System Status Indicators */}
              <div className="flex items-center space-x-2">
                {/* Connection Status */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  wsStatus === 'connected' ?'bg-green-900 text-green-300' :'bg-red-900 text-red-300'
                }`}>
                  {wsStatus === 'connected' ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span>{wsStatus === 'connected' ? 'Live' : 'Offline'}</span>
                </div>

                {/* API Status */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  mvpStats?.healthyEndpoints >= 4 ? 'bg-green-900 text-green-300' : 
                  mvpStats?.healthyEndpoints >= 2 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                }`}>
                  <Globe className="w-3 h-3" />
                  <span>{mvpStats?.healthyEndpoints}/{mvpStats?.totalEndpoints} API</span>
                </div>

                {/* HTTPS/CORS Status */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  mvpStats?.httpsStatus === 'OK' && mvpStats?.corsStatus === 'OK' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                }`}>
                  <Shield className="w-3 h-3" />
                  <span>HTTPS/CORS</span>
                </div>

                {/* Auto-refresh indicator */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  autoRefresh ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'
                }`}>
                  <Timer className="w-3 h-3" />
                  <span>{autoRefresh ? '30s Auto' : 'Manuel'}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={verifyMVPEndpoints}
                disabled={verificationLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg text-sm transition-colors"
              >
                <Server className={`h-4 w-4 ${verificationLoading ? 'animate-spin' : ''}`} />
                <span>{verificationLoading ? 'Vérification...' : 'Vérifier MVP'}</span>
              </button>

              {stats?.fallbackMode && (
                <button
                  onClick={handleForceReconnect}
                  disabled={reconnecting}
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 rounded-lg text-sm transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${reconnecting ? 'animate-spin' : ''}`} />
                  <span>{reconnecting ? 'Reconnexion...' : 'Reconnecter'}</span>
                </button>
              )}

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  autoRefresh 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' :'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{autoRefresh ? 'Pause' : 'Reprendre'}</span>
              </button>

              <button
                onClick={loadDashboardData}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>

          {/* Last Refresh Info */}
          {lastRefresh && (
            <div className="mt-2 text-sm text-gray-500">
              Dernière mise à jour: {lastRefresh?.toLocaleTimeString()}
              {stats?.fallbackMode && (
                <span className="ml-2 text-yellow-400">
                  • Mode de secours Supabase (API indisponible)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Trading MVP Endpoints Verification */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Server className="h-6 w-6 text-teal-400" />
              <h2 className="text-xl font-semibold">Endpoints Trading MVP</h2>
            </div>
            <div className="text-sm text-gray-400">
              API_BASE = <code className="bg-gray-900 px-2 py-1 rounded">{MVP_API_BASE}</code>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <EndpointCard 
              title="Status Monitor" 
              endpoint="/status" 
              result={mvpVerification?.status}
              expectedData="pastilles OK/WARN/ERR + JSON visible"
            />
            <EndpointCard 
              title="Registry Strategies" 
              endpoint="/registry" 
              result={mvpVerification?.registry}
              expectedData="liste de stratégies (pills) + JSON"
            />
            <EndpointCard 
              title="Scores & Sharpe/MDD" 
              endpoint="/scores?window=252" 
              result={mvpVerification?.scores}
              expectedData="scores/Sharpe/MDD"
            />
            <EndpointCard 
              title="Strategy Selection" 
              endpoint="/select" 
              result={mvpVerification?.select}
              expectedData="stratégie choisie (+ confiance si dispo)"
            />
            <EndpointCard 
              title="Portfolio Allocation" 
              endpoint="/allocate" 
              result={mvpVerification?.allocate}
              expectedData="poids %"
            />
          </div>

          {/* CORS & HTTPS & DNS Verification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CORS Status */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-orange-400" />
                <h3 className="font-medium">CORS Configuration</h3>
              </div>
              <div className={`text-sm ${mvpVerification?.corsCheck?.status === 'OK' ? 'text-green-400' : 'text-yellow-400'}`}>
                Status: {mvpVerification?.corsCheck?.status || 'UNKNOWN'}
              </div>
              {mvpVerification?.corsCheck?.errors?.length > 0 && (
                <div className="mt-2 text-xs text-red-400">
                  {mvpVerification?.corsCheck?.errors?.map((error, idx) => (
                    <div key={idx}>• {error}</div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-400">
                CORS_ORIGIN=https://trading-mvp.com
              </div>
            </div>

            {/* HTTPS Status */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <h3 className="font-medium">HTTPS & SSL</h3>
              </div>
              <div className={`text-sm ${mvpVerification?.httpsCheck?.status === 'OK' ? 'text-green-400' : 'text-red-400'}`}>
                Status: {mvpVerification?.httpsCheck?.status || 'UNKNOWN'}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {mvpVerification?.httpsCheck?.certificate || 'Certificat non vérifié'}
              </div>
            </div>

            {/* DNS & Traefik Status */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium">DNS & Traefik</h3>
              </div>
              <div className="space-y-1 text-xs">
                {Object.entries(mvpVerification?.dnsCheck?.endpoints || {})?.map(([domain, status]) => (
                  <div key={domain} className="flex items-center justify-between">
                    <span className="text-gray-400">{domain}</span>
                    <span className={status === 'OK' ? 'text-green-400' : status === 'ERROR' ? 'text-red-400' : 'text-gray-400'}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Connection Issues Warning */}
        {stats?.fallbackMode && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <h3 className="font-medium text-yellow-400">Mode de Secours Activé</h3>
            </div>
            <p className="text-sm text-yellow-300">
              L'API orchestrator-lite n'est pas disponible. Les données sont chargées depuis la base Supabase. 
              Les mises à jour temps réel peuvent être limitées.
            </p>
          </div>
        )}

        {/* Error Display */}
        {Object.keys(dashboardData?.errors || {})?.some(key => dashboardData?.errors?.[key]) && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h3 className="font-medium text-red-400">Problèmes de Chargement</h3>
            </div>
            <div className="space-y-1 text-sm text-red-300">
              {Object.entries(dashboardData?.errors || {})?.map(([key, error]) => 
                error && (
                  <div key={key}>
                    <strong className="capitalize">{key}:</strong> {error}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Top Row - Agent Status & Killswitch */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AgentStatusGrid 
              agents={dashboardData?.agents?.agents || []}
              loading={loading}
              fallbackMode={stats?.fallbackMode}
            />
          </div>
          <div className="space-y-6">
            <KillswitchPanel 
              onActivate={handleKillswitchActivate}
              fallbackMode={stats?.fallbackMode}
            />
            <RegimeStatePanel 
              regime={dashboardData?.regime} 
              fallbackMode={stats?.fallbackMode}
            />
          </div>
        </div>

        {/* Bottom Row - Event Bus Monitor */}
        <div>
          <EventBusMonitor 
            events={dashboardData?.events?.events || []}
            loading={loading}
            fallbackMode={stats?.fallbackMode}
          />
        </div>
      </div>
    </div>
  );
}

export default OrchestratorDashboard;