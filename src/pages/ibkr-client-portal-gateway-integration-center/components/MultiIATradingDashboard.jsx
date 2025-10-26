import React, { useState, useEffect } from 'react';
import { Brain, Shield, CheckCircle, XCircle, Clock, AlertTriangle, Activity, BarChart3, Target, Zap, Users, Eye } from 'lucide-react';
import { multiIATradingOrchestratorService } from '../../../services/multiIATradingOrchestratorService';
import { ibkrMultiIAExecutorService } from '../../../services/ibkrMultiIAExecutorService';
import Icon from '@/components/AppIcon';


const MultiIATradingDashboard = () => {
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [executorHealth, setExecutorHealth] = useState(null);
  const [recentDecisions, setRecentDecisions] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [telemetryEvents, setTelemetryEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);

  // Mock user ID - in production, get from auth context
  const userId = 'mock-user-id';

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const eventSubscription = multiIATradingOrchestratorService?.subscribeToTradingEvents(
      userId, 
      () => loadTelemetryData()
    );
    
    const orderSubscription = multiIATradingOrchestratorService?.subscribeToOrderUpdates(
      userId,
      () => loadOrderData()
    );

    // Cleanup subscriptions
    return () => {
      if (eventSubscription) multiIATradingOrchestratorService?.unsubscribe(eventSubscription);
      if (orderSubscription) multiIATradingOrchestratorService?.unsubscribe(orderSubscription);
    };
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSystemMetrics(),
        loadExecutorHealth(),
        loadRecentData(),
        loadTelemetryData()
      ]);
    } catch (err) {
      setError(`Erreur chargement dashboard: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const metrics = await multiIATradingOrchestratorService?.getSystemMetrics(userId);
      setSystemMetrics(metrics);
    } catch (err) {
      console.error('Failed to load system metrics:', err);
    }
  };

  const loadExecutorHealth = async () => {
    try {
      const health = await ibkrMultiIAExecutorService?.getExecutorHealth();
      setExecutorHealth(health);
    } catch (err) {
      console.error('Failed to load executor health:', err);
    }
  };

  const loadRecentData = async () => {
    try {
      const [orders] = await Promise.all([
        ibkrMultiIAExecutorService?.getOrderHistory(userId, { limit: 10 })
      ]);
      
      setRecentOrders(orders || []);
    } catch (err) {
      console.error('Failed to load recent data:', err);
    }
  };

  const loadOrderData = async () => {
    try {
      const orders = await ibkrMultiIAExecutorService?.getOrderHistory(userId, { limit: 10 });
      setRecentOrders(orders || []);
    } catch (err) {
      console.error('Failed to load order data:', err);
    }
  };

  const loadTelemetryData = async () => {
    try {
      const events = await multiIATradingOrchestratorService?.getTelemetryEvents(userId, { limit: 15 });
      setTelemetryEvents(events || []);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  };

  const testMultiIAWorkflow = async () => {
    try {
      setActiveTest('workflow');
      
      const testOrder = {
        symbol: 'AAPL',
        action: 'BUY',
        quantity: 10,
        orderType: 'LMT',
        limitPrice: 190.00,
        rationale: 'Test ordre Multi-IA - analyse technique positive'
      };
      
      const result = await multiIATradingOrchestratorService?.executeMultiIAWorkflow(userId, testOrder);
      
      if (result?.success) {
        await loadDashboardData(); // Refresh data after test
      }
      
      return result;
    } catch (err) {
      setError(`Erreur test Multi-IA: ${err?.message}`);
      throw err;
    } finally {
      setActiveTest(null);
    }
  };

  const testIBKRConnection = async () => {
    try {
      setActiveTest('connection');
      
      const result = await ibkrMultiIAExecutorService?.testIBKRConnection({
        tradingMode: 'paper'
      });
      
      await loadExecutorHealth(); // Refresh health after test
      return result;
    } catch (err) {
      setError(`Erreur test connexion: ${err?.message}`);
      throw err;
    } finally {
      setActiveTest(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      consensus_reached: 'text-green-400',
      consensus_failed: 'text-red-400',
      pending: 'text-yellow-400',
      filled: 'text-green-400',
      submitted: 'text-blue-400',
      error: 'text-red-400',
      cancelled: 'text-gray-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      consensus_reached: CheckCircle,
      consensus_failed: XCircle,
      pending: Clock,
      filled: CheckCircle,
      submitted: Clock,
      error: AlertTriangle,
      cancelled: XCircle
    };
    const Icon = icons?.[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
          <span className="text-gray-300">Chargement Multi-IA Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Multi-IA Status */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Multi-IA System</p>
              <p className="text-2xl font-bold text-white">
                {systemMetrics?.decisions?.approved || 0}/{systemMetrics?.decisions?.total || 0}
              </p>
              <p className="text-xs text-green-400">Decisions Approved</p>
            </div>
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        {/* Order Execution */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Order Execution</p>
              <p className="text-2xl font-bold text-white">
                {executorHealth?.order_success_rate?.toFixed(1) || '0.0'}%
              </p>
              <p className="text-xs text-blue-400">Success Rate</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Risk Exposure</p>
              <p className="text-2xl font-bold text-white">
                ${systemMetrics?.risk?.total_exposure?.toFixed(0) || '0'}
              </p>
              <p className="text-xs text-orange-400">Total Notional</p>
            </div>
            <Shield className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">System Health</p>
              <p className="text-2xl font-bold text-white">
                {executorHealth?.overall_status === 'operational' ? '100' : '85'}%
              </p>
              <p className="text-xs text-green-400">Operational</p>
            </div>
            <Activity className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>
      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Test Multi-IA Workflow</span>
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Teste le workflow complet : IA-Stratégie → IA-Risque → IA-Validation → Consensus → Exécution
          </p>
          <button
            onClick={testMultiIAWorkflow}
            disabled={activeTest === 'workflow'}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {activeTest === 'workflow' ? (
              <>
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Exécution en cours...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Lancer Test Multi-IA</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span>Test Connexion IBKR</span>
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Teste la connexion au Gateway IBKR Paper Trading (port 7497)
          </p>
          <button
            onClick={testIBKRConnection}
            disabled={activeTest === 'connection'}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {activeTest === 'connection' ? (
              <>
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Test en cours...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Tester Connexion</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <span>Ordres Récents</span>
            </h3>
          </div>
          <div className="p-6">
            {recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {recentOrders?.slice(0, 5)?.map((order) => (
                  <div key={order?.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`${getStatusColor(order?.execution_status)}`}>
                        {getStatusIcon(order?.execution_status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {order?.action} {order?.quantity} {order?.symbol}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order?.order_type} @ ${order?.limit_price}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${getStatusColor(order?.execution_status)}`}>
                        {order?.execution_status?.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order?.created_at)?.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Aucun ordre récent</p>
              </div>
            )}
          </div>
        </div>

        {/* Telemetry Events */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>Événements Système</span>
            </h3>
          </div>
          <div className="p-6">
            {telemetryEvents?.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {telemetryEvents?.slice(0, 8)?.map((event) => (
                  <div key={event?.id} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className={`mt-0.5 ${
                      event?.severity === 'error' ? 'text-red-400' :
                      event?.severity === 'warn' ? 'text-yellow-400' :
                      event?.severity === 'info' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {event?.event_type?.replace(/_/g, ' ')?.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {event?.event_source} • {new Date(event?.created_at)?.toLocaleTimeString()}
                      </p>
                      {event?.latency_ms && (
                        <p className="text-xs text-cyan-400">
                          Latence: {event?.latency_ms}ms
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">Aucun événement récent</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* IBKR Gateway Status */}
      {executorHealth?.ibkr_gateways && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span>Statut Gateways IBKR</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {executorHealth?.ibkr_gateways?.map((gateway, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      gateway?.status === 'available' ? 'bg-green-400' :
                      gateway?.status === 'unavailable' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-white">{gateway?.name}</p>
                      <p className="text-xs text-gray-400">{gateway?.host}:{gateway?.port}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${
                      gateway?.status === 'available' ? 'text-green-400' :
                      gateway?.status === 'unavailable' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {gateway?.status?.toUpperCase()}
                    </p>
                    {gateway?.latency && (
                      <p className="text-xs text-gray-400">
                        {gateway?.latency}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiIATradingDashboard;