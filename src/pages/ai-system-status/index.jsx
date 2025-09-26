import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Play, Pause, AlertTriangle, Settings, Power, Wifi, WifiOff, Server, Activity, Database } from 'lucide-react';
import { aiAgentStatusService } from '../../services/aiAgentStatusService';
import AgentGrid from './components/AgentGrid';
import SystemKPIs from './components/SystemKPIs';
import AgentControlModal from './components/AgentControlModal';

const AISystemStatus = () => {
  const [agents, setAgents] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [controlModalOpen, setControlModalOpen] = useState(false);
  const [degradedModeActive, setDegradedModeActive] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    group: '',
    health: ''
  });

  // API Testing states
  const [apiTestResults, setApiTestResults] = useState({});
  const [apiTesting, setApiTesting] = useState({});

  // API Base URL for Trading MVP
  const MVP_API_BASE = 'https://api.trading-mvp.com';

  // Test Trading MVP API endpoints
  const testTradingMvpEndpoint = async (endpoint) => {
    const endpointKey = endpoint?.replace('/', '_');
    setApiTesting(prev => ({ ...prev, [endpointKey]: true }));
    
    try {
      console.log(`Testing endpoint: ${MVP_API_BASE}${endpoint}`);
      
      const response = await fetch(`${MVP_API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response?.json();
      
      const result = {
        status: response?.ok ? 'OK' : 'ERROR',
        statusCode: response?.status,
        data: data,
        timestamp: new Date()?.toLocaleTimeString(),
        endpoint: endpoint
      };

      console.log(`Endpoint ${endpoint} result:`, result);
      
      setApiTestResults(prev => ({
        ...prev,
        [endpointKey]: result
      }));

    } catch (testError) {
      console.error(`Error testing ${endpoint}:`, testError);
      
      setApiTestResults(prev => ({
        ...prev,
        [endpointKey]: {
          status: 'ERROR',
          statusCode: 0,
          error: testError?.message,
          timestamp: new Date()?.toLocaleTimeString(),
          endpoint: endpoint
        }
      }));
    } finally {
      setApiTesting(prev => ({ ...prev, [endpointKey]: false }));
    }
  };

  // Test all endpoints
  const testAllEndpoints = async () => {
    const endpoints = ['/status', '/registry'];
    
    for (const endpoint of endpoints) {
      await testTradingMvpEndpoint(endpoint);
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    console.log('Auto-testing Trading MVP endpoints...');
    testAllEndpoints();
  }, []);

  // Simple mock data generation
  const generateMockData = () => {
    const mockAgents = Array.from({ length: 24 }, (_, index) => ({
      id: `agent_${index + 1}`,
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
      configuration: {
        enabled: true,
        timeout: 30000,
        retry_count: 3
      }
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

    return { mockAgents, mockStats };
  };

  // Initialize with mock data immediately
  useEffect(() => {
    const { mockAgents, mockStats } = generateMockData();
    setAgents(mockAgents);
    setSystemStats(mockStats);
    setLastUpdate(new Date());
    console.log('Initialized with mock data');
  }, []);

  // Try to load real data in background
  const loadRealData = async () => {
    if (!aiAgentStatusService) return;
    
    setLoading(true);
    try {
      const [realAgents, realStats] = await Promise.all([
        aiAgentStatusService?.getAllAgents(),
        aiAgentStatusService?.getSystemHealthStats()
      ]);

      if (realAgents && realAgents?.length > 0) {
        setAgents(realAgents);
        setConnectionStatus('connected');
        setDegradedModeActive(false);
        console.log('Loaded real data');
      }

      if (realStats && Object.keys(realStats)?.length > 0) {
        setSystemStats(realStats);
      }

      setLastUpdate(new Date());

    } catch (serviceError) {
      console.error('Service error, keeping mock data:', serviceError);
      setConnectionStatus('disconnected');
      setDegradedModeActive(true);
      setError(`Service unavailable: ${serviceError?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefresh && connectionStatus !== 'disconnected') {
      const interval = setInterval(loadRealData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, connectionStatus]);

  // Manual retry
  const handleManualRetry = () => {
    setError(null);
    loadRealData();
  };

  // Agent control operations
  const handleAgentControl = async (agentId, action) => {
    try {
      if (aiAgentStatusService && aiAgentStatusService?.controlAgent) {
        await aiAgentStatusService?.controlAgent(agentId, action);
        loadRealData();
      } else {
        throw new Error('Control service unavailable');
      }
    } catch (error) {
      setError(`Failed to ${action} agent: ${error?.message}`);
    }
  };

  // Export functionality
  const handleExport = async () => {
    try {
      if (aiAgentStatusService && aiAgentStatusService?.exportAgentReport) {
        const csvContent = await aiAgentStatusService?.exportAgentReport();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL?.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-agents-status-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
        a?.click();
        window.URL?.revokeObjectURL(url);
      } else {
        throw new Error('Export service unavailable');
      }
    } catch (error) {
      setError(`Export failed: ${error?.message}`);
    }
  };

  // Filter agents
  const filteredAgents = agents?.filter(agent => {
    if (filters?.status && agent?.agent_status !== filters?.status) return false;
    if (filters?.group && agent?.agent_group !== filters?.group) return false;
    if (filters?.health && agent?.health_data && agent?.health_data?.health_status !== filters?.health) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Server className="w-6 h-6 text-blue-400 mr-2" />
              AI System Status + Trading MVP API Tester
              {connectionStatus === 'connected' && <Wifi className="w-5 h-5 text-green-500 ml-2" />}
              {connectionStatus === 'disconnected' && <WifiOff className="w-5 h-5 text-red-500 ml-2" />}
              {loading && <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin ml-2" />}
            </h1>
            <p className="text-gray-400 text-sm">
              Surveillance de {agents?.length} agents IA + Test API Trading MVP
              {lastUpdate && (
                <span className="ml-2">• Dernière mise à jour: {lastUpdate?.toLocaleTimeString()}</span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              connectionStatus === 'connected' ? 'bg-green-600/20 border border-green-600' : 'bg-red-600/20 border border-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Service Connecté' : 'Mode Déconnecté'}
              </span>
            </div>

            {/* API Test Button */}
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
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>

            {/* Emergency Controls */}
            <button
              onClick={() => setControlModalOpen(true)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Power className="w-4 h-4" />
              <span>Contrôles d'urgence</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-600/20 border border-red-600 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300 text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Trading MVP API Test Results */}
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Database className="w-5 h-5 text-blue-400 mr-2" />
            Trading MVP API Test Results
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Endpoint */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">/status</h3>
                <button
                  onClick={() => testTradingMvpEndpoint('/status')}
                  disabled={apiTesting?._status}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:bg-gray-600"
                >
                  {apiTesting?._status ? 'Testing...' : 'Test'}
                </button>
              </div>
              
              {apiTestResults?._status ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      apiTestResults?._status?.status === 'OK' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {apiTestResults?._status?.status} ({apiTestResults?._status?.statusCode})
                    </span>
                    <span className="text-xs text-gray-400">{apiTestResults?._status?.timestamp}</span>
                  </div>
                  
                  <div className="bg-gray-800 rounded p-3 text-xs">
                    <pre className="text-green-300 whitespace-pre-wrap overflow-x-auto">
                      {apiTestResults?._status?.error 
                        ? `Error: ${apiTestResults?._status?.error}`
                        : JSON.stringify(apiTestResults?._status?.data, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Cliquez pour tester l'endpoint /status</div>
              )}
            </div>

            {/* Registry Endpoint */}
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">/registry</h3>
                <button
                  onClick={() => testTradingMvpEndpoint('/registry')}
                  disabled={apiTesting?._registry}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:bg-gray-600"
                >
                  {apiTesting?._registry ? 'Testing...' : 'Test'}
                </button>
              </div>
              
              {apiTestResults?._registry ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      apiTestResults?._registry?.status === 'OK' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {apiTestResults?._registry?.status} ({apiTestResults?._registry?.statusCode})
                    </span>
                    <span className="text-xs text-gray-400">{apiTestResults?._registry?.timestamp}</span>
                  </div>
                  
                  <div className="bg-gray-800 rounded p-3 text-xs">
                    <pre className="text-green-300 whitespace-pre-wrap overflow-x-auto">
                      {apiTestResults?._registry?.error 
                        ? `Error: ${apiTestResults?._registry?.error}`
                        : JSON.stringify(apiTestResults?._registry?.data, null, 2)
                      }
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Cliquez pour tester l'endpoint /registry</div>
              )}
            </div>
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

        {/* Degraded Mode Warning */}
        {degradedModeActive && (
          <div className="mb-6">
            <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <h3 className="font-semibold text-yellow-300">Mode Déconnecté</h3>
                  <p className="text-yellow-200 text-sm">
                    Affichage des données de démonstration. Tentative de connexion aux services en arrière-plan.
                  </p>
                  <button
                    onClick={loadRealData}
                    className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Connexion...' : 'Réessayer la connexion'}
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
                >
                  Démarrer
                </button>
                <button
                  onClick={() => handleAgentControl(selectedAgent?.id, 'pause')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm transition-colors"
                >
                  Suspendre
                </button>
                <button
                  onClick={() => handleAgentControl(selectedAgent?.id, 'stop')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                >
                  Arrêter
                </button>
                <button
                  onClick={() => handleAgentControl(selectedAgent?.id, 'restart')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
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