import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  Zap,
  Eye,
  Settings,
  Clock,
  Server,
  Cpu,
  HardDrive,
  Network,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
  Play,
  StopCircle
} from 'lucide-react';

// Import service functions (you'll need to implement these based on your backend)
import { systemHealthService } from '../../services/systemHealthService';
import { dataHealthService } from '../../services/dataHealthService';
import { alertsService } from '../../services/alertsService';
import { captainsLogService } from '../../services/captainsLogService';

const HealthSentinelObservabilityCommand = () => {
  // Health monitoring states
  const [systemHealth, setSystemHealth] = useState({
    overallHealth: 'healthy',
    agents: [],
    sloMetrics: {
      apiLatency: { current: 125, target: 400, status: 'good' },
      uptime: { current: 99.97, target: 99.9, status: 'good' },
      errorRate: { current: 0.03, target: 0.1, status: 'good' },
      tradingSuccess: { current: 98.5, target: 95, status: 'good' }
    },
    loading: true
  });

  const [dataHealth, setDataHealth] = useState({
    dhi: 0.92,
    streams: [],
    loading: true
  });

  const [alerts, setAlerts] = useState([]);
  const [captainsLog, setCaptainsLog] = useState([]);
  const [operationMode, setOperationMode] = useState('normal'); // normal, safe, degraded, frozen

  // Emergency controls state
  const [emergencyControls, setEmergencyControls] = useState({
    killSwitches: {
      LIVE_TRADING: false,
      STRATEGY_GENERATION: false,
      DATA_INGESTION: false,
      RISK_MANAGEMENT: false
    },
    canaryMode: false,
    shadowMode: false,
    frozenMode: false
  });

  // Load data on component mount
  useEffect(() => {
    loadHealthData();
    loadDataHealth();
    loadAlerts();
    loadCaptainsLog();
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      loadHealthData();
      loadDataHealth();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadHealthData = async () => {
    try {
      const health = await systemHealthService?.getOverallHealth();
      setSystemHealth(prev => ({ ...prev, ...health, loading: false }));
    } catch (error) {
      console.error('Failed to load system health:', error);
      setSystemHealth(prev => ({ ...prev, loading: false }));
    }
  };

  const loadDataHealth = async () => {
    try {
      const health = await dataHealthService?.getDataHealthIndex();
      setDataHealth(prev => ({ ...prev, ...health, loading: false }));
    } catch (error) {
      console.error('Failed to load data health:', error);
      setDataHealth(prev => ({ ...prev, loading: false }));
    }
  };

  const loadAlerts = async () => {
    try {
      const alertsData = await alertsService?.getRecentAlerts();
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadCaptainsLog = async () => {
    try {
      const logData = await captainsLogService?.getRecentEntries();
      setCaptainsLog(logData || []);
    } catch (error) {
      console.error('Failed to load captain\'s log:', error);
    }
  };

  // Emergency control functions
  const toggleKillSwitch = async (switchName) => {
    try {
      const newState = !emergencyControls?.killSwitches?.[switchName];
      await systemHealthService?.toggleKillSwitch(switchName, newState);
      
      setEmergencyControls(prev => ({
        ...prev,
        killSwitches: {
          ...prev?.killSwitches,
          [switchName]: newState
        }
      }));

      // Log the action
      await captainsLogService?.addEntry({
        author: 'Matthieu',
        entry: `${newState ? 'Activation' : 'Désactivation'} du Kill Switch ${switchName}`,
        tags: ['manual', 'kill_switch', switchName?.toLowerCase()]
      });

      loadCaptainsLog();
    } catch (error) {
      console.error('Failed to toggle kill switch:', error);
    }
  };

  const toggleSystemMode = async (mode) => {
    try {
      await systemHealthService?.setOperationMode(mode);
      setOperationMode(mode);

      await captainsLogService?.addEntry({
        author: 'Matthieu',
        entry: `Changement de mode opérationnel vers : ${mode}`,
        tags: ['manual', 'mode_change', mode]
      });

      loadCaptainsLog();
    } catch (error) {
      console.error('Failed to change operation mode:', error);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': case'good':
        return 'text-green-400';
      case 'warning': case'degraded':
        return 'text-yellow-400';
      case 'critical': case'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'healthy': case'good':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': case'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'critical': case'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Health Sentinel & Observability Command
          </h1>
          <p className="text-gray-400">
            Surveillance en temps réel et contrôle opérationnel du système autonome de trading
          </p>
        </div>

        {/* Operation Mode Banner */}
        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
          operationMode === 'normal' ? 'bg-green-900/20 border-green-500' :
          operationMode === 'safe' ? 'bg-yellow-900/20 border-yellow-500' :
          operationMode === 'degraded'? 'bg-orange-900/20 border-orange-500' : 'bg-red-900/20 border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <div>
                <h3 className="font-semibold text-white">
                  Mode Opérationnel: {operationMode?.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-400">
                  {operationMode === 'normal' && 'Système opérationnel - Toutes fonctionnalités actives'}
                  {operationMode === 'safe' && 'Mode sécurisé - Trading limité, surveillance renforcée'}
                  {operationMode === 'degraded' && 'Mode dégradé - Fonctionnalités réduites'}
                  {operationMode === 'frozen' && 'Mode gelé - Toutes opérations suspendues'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleSystemMode('normal')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  operationMode === 'normal' ?'bg-green-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => toggleSystemMode('safe')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  operationMode === 'safe' ?'bg-yellow-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Safe
              </button>
              <button
                onClick={() => toggleSystemMode('frozen')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  operationMode === 'frozen' ?'bg-red-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Freeze
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Health Sentinel Engine */}
          <div className="space-y-6">
            {/* Health Sentinel Engine */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-green-400" />
                  Health Sentinel Engine
                </h2>
                {getHealthStatusIcon(systemHealth?.overallHealth)}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-3 rounded">
                    <div className="text-sm text-gray-400">System Status</div>
                    <div className={`font-semibold ${getHealthStatusColor(systemHealth?.overallHealth)}`}>
                      {systemHealth?.overallHealth?.toUpperCase() || 'UNKNOWN'}
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded">
                    <div className="text-sm text-gray-400">Active Agents</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.agents?.filter(a => a?.status === 'active')?.length || 0}/{systemHealth?.agents?.length || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-white">Agents en cours</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {systemHealth?.agents?.slice(0, 5)?.map((agent, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{agent?.name || `Agent ${index + 1}`}</span>
                        <div className="flex items-center space-x-2">
                          {getHealthStatusIcon(agent?.status)}
                          <span className="text-xs text-gray-500">
                            {agent?.cpu_usage?.toFixed(1) || 0}% CPU
                          </span>
                        </div>
                      </div>
                    )) || [
                      <div key="no-agents" className="text-sm text-gray-500">Aucun agent actif</div>
                    ]}
                  </div>
                </div>
              </div>
            </div>

            {/* SLO Compliance Dashboard */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                SLO Compliance Dashboard
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                  <div>
                    <div className="text-sm text-gray-400">API Latency</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.apiLatency?.current || 0}ms
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Target: &lt;400ms</div>
                    {getHealthStatusIcon(systemHealth?.sloMetrics?.apiLatency?.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                  <div>
                    <div className="text-sm text-gray-400">System Uptime</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.uptime?.current || 0}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Target: &gt;99.9%</div>
                    {getHealthStatusIcon(systemHealth?.sloMetrics?.uptime?.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                  <div>
                    <div className="text-sm text-gray-400">Error Rate</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.errorRate?.current || 0}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Target: &lt;0.1%</div>
                    {getHealthStatusIcon(systemHealth?.sloMetrics?.errorRate?.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                  <div>
                    <div className="text-sm text-gray-400">Trading Success</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.tradingSuccess?.current || 0}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Target: &gt;95%</div>
                    {getHealthStatusIcon(systemHealth?.sloMetrics?.tradingSuccess?.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* DHI Monitoring */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-400" />
                Data Health Index (DHI)
              </h3>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">DHI Global</span>
                  <span className={`font-semibold ${
                    dataHealth?.dhi >= 0.8 ? 'text-green-400' : 
                    dataHealth?.dhi >= 0.6 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(dataHealth?.dhi * 100)?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      dataHealth?.dhi >= 0.8 ? 'bg-green-500' : 
                      dataHealth?.dhi >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(dataHealth?.dhi * 100) || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-white">Top Data Streams</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {dataHealth?.streams?.slice(0, 4)?.map((stream, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">{stream?.name || `Stream ${index + 1}`}</span>
                      <span className={`font-semibold ${
                        stream?.dhi >= 0.8 ? 'text-green-400' : 
                        stream?.dhi >= 0.6 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {(stream?.dhi * 100)?.toFixed(0) || 0}%
                      </span>
                    </div>
                  )) || [
                    <div key="no-streams" className="text-sm text-gray-500">Aucun stream détecté</div>
                  ]}
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Observability Control Center */}
          <div className="space-y-6">
            {/* Observability Control Center */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-400" />
                Observability Control Center
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-900/50 p-3 rounded text-center">
                    <Cpu className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-gray-400">CPU Usage</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.cpu || 12}%
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded text-center">
                    <HardDrive className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-gray-400">Memory</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.memory || 8}GB
                    </div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded text-center">
                    <Network className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-gray-400">Network</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.network || 42}MB/s
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded">
                  <div className="text-sm font-medium text-white mb-2">Alertes Actives</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {alerts?.slice(0, 3)?.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                          alert?.severity === 'critical' ? 'text-red-400' :
                          alert?.severity === 'high' ? 'text-orange-400' :
                          alert?.severity === 'medium'? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm text-white">{alert?.title || 'Alert'}</div>
                          <div className="text-xs text-gray-400">{alert?.message || 'No details available'}</div>
                        </div>
                      </div>
                    )) || [
                      <div key="no-alerts" className="text-sm text-gray-500">Aucune alerte active</div>
                    ]}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Response Orchestrator */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-red-400" />
                Emergency Response Orchestrator
              </h3>

              <div className="space-y-4">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="text-sm font-medium text-white mb-3">Kill Switches</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(emergencyControls?.killSwitches || {})?.map(([switchName, isActive]) => (
                      <button
                        key={switchName}
                        onClick={() => toggleKillSwitch(switchName)}
                        className={`flex items-center justify-between p-2 rounded text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-red-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <span>{switchName?.replace('_', ' ')}</span>
                        {isActive ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button 
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      emergencyControls?.canaryMode 
                        ? 'bg-yellow-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Canary Mode
                  </button>
                  <button 
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      emergencyControls?.shadowMode 
                        ? 'bg-blue-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Shadow Mode
                  </button>
                  <button 
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      emergencyControls?.frozenMode 
                        ? 'bg-red-600 text-white' :'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Freeze All
                  </button>
                </div>
              </div>
            </div>

            {/* Captain's Log */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-400" />
                Captain's Log
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {captainsLog?.map((entry, index) => (
                  <div key={index} className="bg-gray-900/50 p-3 rounded">
                    <div className="flex items-start justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        entry?.author === 'AAS_Sentinel' ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {entry?.author || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry?.ts || entry?.created_at)?.toLocaleTimeString() || 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {entry?.entry || 'No entry content'}
                    </p>
                    {entry?.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry?.tags?.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )) || [
                  <div key="no-log" className="text-sm text-gray-500">Aucune entrée dans le journal</div>
                ]}
              </div>
            </div>
          </div>

          {/* Right Column - Operations Security Center */}
          <div className="space-y-6">
            {/* Operations Security Center */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-orange-400" />
                Operations Security Center
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded">
                  <div className="text-sm font-medium text-white mb-3">Freeze/Unfreeze Scripts</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center space-x-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium">
                      <Pause className="w-4 h-4" />
                      <span>Freeze System</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">
                      <Play className="w-4 h-4" />
                      <span>Unfreeze System</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded">
                  <div className="text-sm font-medium text-white mb-3">Canary Deployment</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Canary Traffic</span>
                      <span className="text-white">0.5%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0.5%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Min: 0.1%</span>
                      <span>Max: 2%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded">
                  <div className="text-sm font-medium text-white mb-3">Shadow Trading</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Mode Shadow</span>
                      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer ${
                        emergencyControls?.shadowMode ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          emergencyControls?.shadowMode ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {emergencyControls?.shadowMode 
                        ? 'Toutes opérations en mode simulation' :'Trading live actif'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-4 rounded">
                  <div className="text-sm font-medium text-white mb-3">Operational Safeguards</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Auto-Recovery</span>
                      <span className="text-green-400">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Risk Limits</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Market Hours</span>
                      <span className="text-green-400">Enforced</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Position Limits</span>
                      <span className="text-green-400">$50k Max</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-cyan-400" />
                Real-time System Metrics
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-3 rounded">
                    <div className="text-sm text-gray-400">P99 Latency</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.p99Latency || 145}ms
                    </div>
                    <div className="text-xs text-gray-500">Target: &lt;400ms</div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded">
                    <div className="text-sm text-gray-400">Errors/Hour</div>
                    <div className="font-semibold text-white">
                      {systemHealth?.sloMetrics?.errorsPerHour || 2}
                    </div>
                    <div className="text-xs text-gray-500">Target: &lt;5/h</div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-3 rounded">
                  <div className="text-sm text-gray-400 mb-2">Live vs Paper Drift</div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">2.3%</span>
                    <span className="text-xs text-gray-500">Target: &lt;5%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '46%' }}></div>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-3 rounded">
                  <div className="text-sm text-gray-400 mb-2">Trading Success Rate</div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">98.2%</span>
                    <span className="text-xs text-gray-500">Target: &gt;95%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.2%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium text-white">
                  Health Check
                </button>
                <button className="p-3 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium text-white">
                  Generate Report
                </button>
                <button className="p-3 bg-green-600 hover:bg-green-700 rounded text-sm font-medium text-white">
                  Audit System
                </button>
                <button className="p-3 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium text-white">
                  Test Failover
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthSentinelObservabilityCommand;