import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Play, Pause, AlertTriangle, Settings, Power, Wifi, WifiOff, Server, Activity, Database } from 'lucide-react';
import { aiAgentStatusService } from '../../services/aiAgentStatusService';
import { useAuth } from '../../contexts/AuthContext';
import AgentGrid from './components/AgentGrid';
import SystemKPIs from './components/SystemKPIs';
import AgentControlModal from './components/AgentControlModal';

const AISystemStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [controlModalOpen, setControlModalOpen] = useState(false);
  const [degradedModeActive, setDegradedModeActive] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    group: '',
    health: ''
  });
  const [realtimeChannel, setRealtimeChannel] = useState(null);

  // API Testing states for Trading MVP compatibility
  const [apiTestResults, setApiTestResults] = useState({});
  const [apiTesting, setApiTesting] = useState({});

  // Enhanced API Base URL with environment variable support
  const MVP_API_BASE = import.meta.env?.VITE_MVP_API_BASE || 'https://rockettra3991.builtwithrocket.new';
  const API_TIMEOUT = parseInt(import.meta.env?.VITE_API_TIMEOUT) || 5000;
  const DEBUG_API = import.meta.env?.VITE_DEBUG_API === 'true';

  // Load real data from Supabase
  const loadAgentData = async () => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load agents and system stats in parallel
      const [agentsData, statsData] = await Promise.all([
        aiAgentStatusService?.getAllAgents(),
        aiAgentStatusService?.getSystemHealthStats()
      ]);

      setAgents(agentsData || []);
      setSystemStats(statsData);
      setConnectionStatus('connected');
      setDegradedModeActive(false);
      setLastUpdate(new Date());

      if (DEBUG_API) {
        console.log('Loaded agents:', agentsData?.length);
        console.log('System stats:', statsData);
      }

    } catch (loadError) {
      console.error('Failed to load agent data:', loadError);
      setError(`Service unavailable: ${loadError?.message}`);
      setConnectionStatus('degraded');
      setDegradedModeActive(true);
      
      // Generate fallback mock data for development
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback data when Supabase is not available
  const generateFallbackData = () => {
    const mockAgents = Array.from({ length: 24 }, (_, index) => ({
      id: `fallback_agent_${index + 1}`,
      name: `Agent ${String.fromCharCode(65 + index)}`,
      agent_status: ['active', 'paused', 'inactive', 'error']?.[index % 4],
      agent_group: ['ingestion', 'signals', 'execution', 'orchestration']?.[index % 4],
      strategy: `Strategy-${index + 1}`,
      total_trades: Math.floor(Math.random() * 100),
      win_rate: Math.floor(Math.random() * 100),
      total_pnl: Math.floor(Math.random() * 10000) - 5000,
      health_data: {
        health_status: ['healthy', 'degraded', 'unhealthy']?.[index % 3],
        cpu_usage: Math.floor(Math.random() * 100),
        memory_usage: Math.floor(Math.random() * 100),
        last_heartbeat: new Date()?.toISOString()
      },
      last_active_at: new Date(Date.now() - Math.random() * 86400000)?.toISOString(),
      created_at: new Date()?.toISOString()
    }));

    const mockStats = {
      totalAgents: 24,
      statusCounts: {
        active: 6,
        paused: 6,
        inactive: 6,
        error: 6
      },
      healthyCounts: {
        healthy: 8,
        degraded: 8,
        unhealthy: 8
      },
      totalErrors: 12,
      totalWarnings: 8,
      systemLoad: 65,
      uptime: '2 days, 4 hours',
      memoryUsage: 68.5,
      cpuUsage: 42.1
    };

    setAgents(mockAgents);
    setSystemStats(mockStats);
    setLastUpdate(new Date());
  };

  // Setup realtime subscriptions
  const setupRealtimeSubscription = () => {
    if (!user || realtimeChannel) return;

    try {
      const channel = aiAgentStatusService?.subscribeToAgents((payload) => {
        if (DEBUG_API) {
          console.log('Realtime update:', payload);
        }
        
        // Refresh data when changes occur
        loadAgentData();
      });

      setRealtimeChannel(channel);
    } catch (subscriptionError) {
      console.warn('Failed to setup realtime subscription:', subscriptionError);
    }
  };

  // Initial load and auth handling
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadAgentData();
        setupRealtimeSubscription();
      } else {
        setError('Please sign in to view AI system status');
        setConnectionStatus('disconnected');
        setDegradedModeActive(true);
      }
    }

    return () => {
      if (realtimeChannel) {
        aiAgentStatusService?.unsubscribeFromAgents(realtimeChannel);
      }
    };
  }, [user, authLoading]);

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefresh && user && connectionStatus !== 'disconnected') {
      const interval = setInterval(loadAgentData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, user, connectionStatus]);

  // Manual retry
  const handleManualRetry = () => {
    setError(null);
    loadAgentData();
  };

  // Agent control operations
  const handleAgentControl = async (agentId, action) => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    try {
      await aiAgentStatusService?.controlAgent(agentId, action);
      // Refresh data after control action
      loadAgentData();
    } catch (controlError) {
      setError(`Failed to ${action} agent: ${controlError?.message}`);
    }
  };

  // Export functionality
  const handleExport = async () => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    try {
      const csvContent = await aiAgentStatusService?.exportAgentReport();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL?.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-agents-status-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
      a?.click();
      window.URL?.revokeObjectURL(url);
    } catch (exportError) {
      setError(`Export failed: ${exportError?.message}`);
    }
  };

  // Filter agents
  const filteredAgents = agents?.filter(agent => {
    if (filters?.status && agent?.agent_status !== filters?.status) return false;
    if (filters?.group && agent?.agent_group !== filters?.group) return false;
    if (filters?.health && agent?.health_data && agent?.health_data?.health_status !== filters?.health) return false;
    return true;
  });

  // Trading MVP API testing (preserved for compatibility)
  const testTradingMvpEndpoint = async (endpoint, retryCount = 0) => {
    const endpointKey = endpoint?.replace('/', '_');
    const maxRetries = parseInt(import.meta.env?.VITE_API_RETRY_ATTEMPTS) || 3;
    
    setApiTesting(prev => ({ ...prev, [endpointKey]: true }));
    
    try {
      if (DEBUG_API) {
        console.log(`Testing endpoint: ${MVP_API_BASE}${endpoint} (attempt ${retryCount + 1})`);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), API_TIMEOUT);
      
      let response;
      try {
        response = await fetch(`${MVP_API_BASE}${endpoint}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller?.signal
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return testTradingMvpEndpoint(endpoint, retryCount + 1);
        }
        throw fetchError;
      }

      let data;
      const contentType = response?.headers?.get('content-type');
      
      try {
        if (contentType && contentType?.includes('application/json')) {
          data = await response?.json();
        } else {
          data = await response?.text();
        }
      } catch (parseError) {
        data = { error: 'Response parsing failed', raw: await response?.text() };
      }
      
      const result = {
        status: response?.ok ? 'OK' : 'ERROR',
        statusCode: response?.status,
        data: data,
        timestamp: new Date()?.toLocaleTimeString(),
        endpoint: endpoint,
        source: 'live',
        attempts: retryCount + 1
      };

      if (DEBUG_API) {
        console.log(`Endpoint ${endpoint} result:`, result);
      }
      
      setApiTestResults(prev => ({
        ...prev,
        [endpointKey]: result
      }));

    } catch (testError) {
      if (DEBUG_API) {
        console.warn(`API test failed after ${retryCount + 1} attempts for ${endpoint}:`, testError?.message);
      }
      
      const mockData = getMockApiResponse(endpoint);
      
      setApiTestResults(prev => ({
        ...prev,
        [endpointKey]: {
          status: 'MOCK',
          statusCode: 200,
          data: {
            ...mockData,
            _fallback_reason: `Live API unavailable after ${retryCount + 1} attempts`,
            _error_details: testError?.message
          },
          error: `Connection failed: ${testError?.message}`,
          timestamp: new Date()?.toLocaleTimeString(),
          endpoint: endpoint,
          source: 'mock',
          attempts: retryCount + 1
        }
      }));
    } finally {
      setApiTesting(prev => ({ ...prev, [endpointKey]: false }));
    }
  };

  const getMockApiResponse = (endpoint) => {
    const timestamp = new Date()?.toISOString();
    const mockResponses = {
      '/status': {
        status: 'OK',
        version: '1.2.0',
        uptime: '2d 4h 15m',
        timestamp: timestamp,
        environment: 'production',
        services: {
          database: 'healthy',
          trading_engine: 'healthy',
          data_feeds: 'degraded',
          risk_controller: 'healthy'
        },
        last_trade: '2025-09-29T15:30:00Z',
        active_agents: agents?.length || 18,
        total_trades_today: 247
      },
      '/registry': {
        agents: agents?.slice(0, 3)?.map(agent => ({
          id: agent?.id,
          name: agent?.name,
          status: agent?.agent_status,
          last_heartbeat: timestamp
        })) || [],
        strategies: ['momentum', 'arbitrage', 'mean_reversion', 'volatility_capture'],
        endpoints: ['/status', '/registry', '/agents', '/strategies', '/health'],
        registry_version: '1.1.0',
        last_updated: timestamp
      }
    };
    return mockResponses?.[endpoint] || { 
      message: 'Mock response for ' + endpoint,
      timestamp: timestamp,
      endpoint: endpoint
    };
  };

  const testAllEndpoints = async () => {
    const endpoints = ['/status', '/registry'];
    for (const endpoint of endpoints) {
      await testTradingMvpEndpoint(endpoint);
    }
  };

  // Loading state for authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Server className="w-6 h-6 text-blue-400 mr-2" />
              AI System Status + Trading MVP Diagnostics
              {connectionStatus === 'connected' && <Wifi className="w-5 h-5 text-green-500 ml-2" />}
              {connectionStatus === 'degraded' && <WifiOff className="w-5 h-5 text-yellow-500 ml-2" />}
              {connectionStatus === 'disconnected' && <WifiOff className="w-5 h-5 text-red-500 ml-2" />}
              {loading && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin ml-2" />}
            </h1>
            <p className="text-gray-400 text-sm">
              Surveillance avancée de {agents?.length} agents IA avec intégration Supabase temps réel
              {lastUpdate && (
                <span className="ml-2">• Dernière mise à jour: {lastUpdate?.toLocaleTimeString()}</span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Enhanced Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              connectionStatus === 'connected' ? 'bg-green-600/20 border border-green-600' : 
              connectionStatus === 'degraded'? 'bg-yellow-600/20 border border-yellow-600' : 'bg-red-600/20 border border-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                connectionStatus === 'degraded'? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Supabase Connecté' : 
                 connectionStatus === 'degraded' ? 'Mode Dégradé' : 'Non Connecté'}
              </span>
            </div>

            {/* API Test Button for Trading MVP compatibility */}
            <button
              onClick={testAllEndpoints}
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
              disabled={Object.values(apiTesting)?.some(Boolean)}
            >
              <Activity className="w-4 h-4" />
              <span>{Object.values(apiTesting)?.some(Boolean) ? 'Testing...' : 'Test Trading MVP API'}</span>
            </button>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={autoRefresh ? 'Désactiver auto-refresh' : 'Activer auto-refresh'}
              >
                {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleManualRetry}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                title="Actualiser manuellement"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              disabled={!user}
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>

            {/* Emergency Controls */}
            <button
              onClick={() => setControlModalOpen(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              disabled={!user}
            >
              <Power className="w-4 h-4" />
              <span>Contrôles d'urgence</span>
            </button>
          </div>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-600/20 border border-red-600 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-300 font-medium">Erreur de Service</h3>
                <p className="text-red-200 text-sm mt-1">{error}</p>
                <div className="flex items-center space-x-3 mt-3">
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Ignorer
                  </button>
                  <button
                    onClick={handleManualRetry}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Reconnexion...' : 'Réessayer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Trading MVP API Test Results */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Database className="w-5 h-5 text-blue-400 mr-2" />
              Trading MVP API - Diagnostics Avancés
            </h2>
            <div className="text-xs text-gray-400">
              API Base: {MVP_API_BASE}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Endpoint - Enhanced */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">/status</h3>
                <div className="flex items-center space-x-2">
                  {apiTestResults?._status?.source && (
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      apiTestResults?._status?.source === 'live' ? 'bg-green-600 text-white' :
                      apiTestResults?._status?.source === 'mock' ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {apiTestResults?._status?.source?.toUpperCase()}
                    </span>
                  )}
                  {apiTestResults?._status?.attempts > 1 && (
                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                      {apiTestResults?._status?.attempts} tentatives
                    </span>
                  )}
                  <button
                    onClick={() => testTradingMvpEndpoint('/status')}
                    disabled={apiTesting?._status}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {apiTesting?._status ? 'Test en cours...' : 'Tester'}
                  </button>
                </div>
              </div>
              
              {apiTestResults?._status ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      apiTestResults?._status?.status === 'OK' ? 'bg-green-500' :
                      apiTestResults?._status?.status === 'MOCK' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {apiTestResults?._status?.status} ({apiTestResults?._status?.statusCode})
                    </span>
                    <span className="text-xs text-gray-400">{apiTestResults?._status?.timestamp}</span>
                  </div>
                  
                  {apiTestResults?._status?.error && (
                    <div className="p-2 bg-yellow-900/50 border border-yellow-700 rounded text-xs text-yellow-300">
                      <strong>Erreur:</strong> {apiTestResults?._status?.error}
                    </div>
                  )}
                  
                  <div className="bg-gray-800 rounded p-3 text-xs">
                    <pre className="text-green-300 whitespace-pre-wrap overflow-x-auto max-h-40">
                      {JSON.stringify(apiTestResults?._status?.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-sm mb-2">Aucun test effectué</div>
                  <button
                    onClick={() => testTradingMvpEndpoint('/status')}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Lancer le premier test
                  </button>
                </div>
              )}
            </div>

            {/* Registry Endpoint - Enhanced */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">/registry</h3>
                <div className="flex items-center space-x-2">
                  {apiTestResults?._registry?.source && (
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      apiTestResults?._registry?.source === 'live' ? 'bg-green-600 text-white' :
                      apiTestResults?._registry?.source === 'mock' ? 'bg-orange-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {apiTestResults?._registry?.source?.toUpperCase()}
                    </span>
                  )}
                  {apiTestResults?._registry?.attempts > 1 && (
                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                      {apiTestResults?._registry?.attempts} tentatives
                    </span>
                  )}
                  <button
                    onClick={() => testTradingMvpEndpoint('/registry')}
                    disabled={apiTesting?._registry}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {apiTesting?._registry ? 'Test en cours...' : 'Tester'}
                  </button>
                </div>
              </div>
              
              {apiTestResults?._registry ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      apiTestResults?._registry?.status === 'OK' ? 'bg-green-500' :
                      apiTestResults?._registry?.status === 'MOCK' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {apiTestResults?._registry?.status} ({apiTestResults?._registry?.statusCode})
                    </span>
                    <span className="text-xs text-gray-400">{apiTestResults?._registry?.timestamp}</span>
                  </div>
                  
                  {apiTestResults?._registry?.error && (
                    <div className="p-2 bg-yellow-900/50 border border-yellow-700 rounded text-xs text-yellow-300">
                      <strong>Erreur:</strong> {apiTestResults?._registry?.error}
                    </div>
                  )}
                  
                  <div className="bg-gray-800 rounded p-3 text-xs">
                    <pre className="text-green-300 whitespace-pre-wrap overflow-x-auto max-h-40">
                      {JSON.stringify(apiTestResults?._registry?.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-sm mb-2">Aucun test effectué</div>
                  <button
                    onClick={() => testTradingMvpEndpoint('/registry')}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Lancer le premier test
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced API Testing Legend and Troubleshooting */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h4 className="text-sm font-semibold text-white mb-3">Diagnostic API & Dépannage</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-xs font-medium text-gray-300 mb-2">Statuts API</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-300">OK - API Live opérationnelle</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-300">MOCK - Mode démonstration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">ERROR - Connexion échouée</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-gray-300 mb-2">Actions de Dépannage</h5>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>• Vérifier la connexion Supabase</div>
                  <div>• Contrôler les paramètres RLS</div>
                  <div>• Valider l'authentification utilisateur</div>
                  <div>• Tester manuellement les requêtes</div>
                </div>
              </div>
            </div>
            
            {DEBUG_API && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-blue-300">
                  <strong>Mode Debug:</strong> Timeout API: {API_TIMEOUT}ms • Base URL: {MVP_API_BASE} • Auth: {user ? '✅' : '❌'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <select
            value={filters?.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e?.target?.value }))}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="paused">Suspendu</option>
            <option value="error">Erreur</option>
          </select>

          <select
            value={filters?.group}
            onChange={(e) => setFilters(prev => ({ ...prev, group: e?.target?.value }))}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Tous les groupes</option>
            <option value="ingestion">Ingestion</option>
            <option value="signals">Signaux</option>
            <option value="execution">Exécution</option>
            <option value="orchestration">Orchestration</option>
          </select>

          <select
            value={filters?.health}
            onChange={(e) => setFilters(prev => ({ ...prev, health: e?.target?.value }))}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="">Tous les états de santé</option>
            <option value="healthy">Sain</option>
            <option value="degraded">Dégradé</option>
            <option value="unhealthy">Défaillant</option>
          </select>

          {(filters?.status || filters?.group || filters?.health) && (
            <button
              onClick={() => setFilters({ status: '', group: '', health: '' })}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
            >
              Effacer les filtres
            </button>
          )}

          <div className="text-sm text-gray-400">
            Affichage {filteredAgents?.length} sur {agents?.length} agents
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-6">
        {/* System KPIs */}
        {systemStats && (
          <div className="mb-6">
            <SystemKPIs stats={systemStats} />
          </div>
        )}

        {/* Authentication Required Warning */}
        {!user && (
          <div className="mb-6">
            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-blue-300">Authentification Requise</h3>
                  <p className="text-blue-200 text-sm">
                    Connectez-vous pour accéder aux données en temps réel des agents IA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Degraded Mode Warning */}
        {degradedModeActive && user && (
          <div className="mb-6">
            <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <h3 className="font-semibold text-yellow-300">Mode Dégradé</h3>
                  <p className="text-yellow-200 text-sm">
                    Connexion à Supabase interrompue. Affichage des données de substitution. 
                    Tentative de reconnexion automatique en cours.
                  </p>
                  <button
                    onClick={loadAgentData}
                    className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Reconnexion...' : 'Réessayer la connexion'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Grid */}
        {agents?.length > 0 && (
          <AgentGrid
            agents={filteredAgents}
            onAgentClick={setSelectedAgent}
            onAgentControl={handleAgentControl}
          />
        )}
      </div>
      {/* Modals */}
      {controlModalOpen && (
        <AgentControlModal
          isOpen={controlModalOpen}
          onClose={() => setControlModalOpen(false)}
          systemStats={systemStats}
          onDegradedMode={setDegradedModeActive}
        />
      )}
      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{selectedAgent?.name}</h2>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Agent Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Statut</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ${
                      selectedAgent?.agent_status === 'active' ? 'bg-green-500' :
                      selectedAgent?.agent_status === 'paused' ? 'bg-yellow-500' :
                      selectedAgent?.agent_status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`}>
                      {selectedAgent?.agent_status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Santé</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ${
                      selectedAgent?.health_data && selectedAgent?.health_data?.health_status === 'healthy' ? 'bg-green-500' :
                      selectedAgent?.health_data && selectedAgent?.health_data?.health_status === 'degraded' ? 'bg-yellow-500' :
                      selectedAgent?.health_data && selectedAgent?.health_data?.health_status === 'unhealthy' ? 'bg-red-500' : 'bg-gray-500'
                    }`}>
                      {selectedAgent?.health_data ? selectedAgent?.health_data?.health_status : 'Inconnu'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Total Trades</label>
                  <p className="text-white text-lg font-semibold">{selectedAgent?.total_trades || 0}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">Taux de réussite</label>
                  <p className="text-white text-lg font-semibold">{selectedAgent?.win_rate || 0}%</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide">P&L Total</label>
                  <p className={`text-lg font-semibold ${
                    (selectedAgent?.total_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${selectedAgent?.total_pnl || 0}
                  </p>
                </div>
              </div>

              {/* System Health */}
              {selectedAgent?.health_data && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Usage CPU</label>
                    <p className="text-white">{selectedAgent?.health_data?.cpu_usage || 'N/A'}%</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Usage Mémoire</label>
                    <p className="text-white">{selectedAgent?.health_data?.memory_usage || 'N/A'}%</p>
                  </div>
                </div>
              )}

              {/* Agent Controls */}
              <div className="flex space-x-2 pt-4 border-t border-gray-600">
                <button
                  onClick={() => handleAgentControl(selectedAgent?.id, 'start')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                  disabled={!user}
                >
                  Démarrer
                </button>
                <button
                  onClick={() => handleAgentControl(selectedAgent?.id, 'pause')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
                  disabled={!user}
                >
                  Suspendre
                </button>
                <button
                  onClick={() => handleAgentControl(selectedAgent?.id, 'stop')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                  disabled={!user}
                >
                  Arrêter
                </button>
                <button
                  onClick={() => handleAgentControl(selectedAgent?.id, 'restart')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  disabled={!user}
                >
                  Redémarrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISystemStatus;