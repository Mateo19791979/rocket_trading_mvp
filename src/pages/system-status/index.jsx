import { useState, useEffect, useCallback } from 'react';
import { Activity, Cpu, Wifi, AlertTriangle, TrendingUp } from 'lucide-react';
import Header from '../../components/ui/Header';
import HealthMonitor from './components/HealthMonitor';
import ApiLatencyCard from './components/ApiLatencyCard';
import DegradedModeControl from './components/DegradedModeControl';
import DataProviderStatus from './components/DataProviderStatus';
import ErrorLogViewer from './components/ErrorLogViewer';
import { RealTimeDataPanel } from './components/RealTimeDataPanel';
import { systemHealthService } from '../../services/systemHealthService';
import { aiAgentsService } from '../../services/aiAgentsService';

export default function SystemStatus() {
  const [systemMetrics, setSystemMetrics] = useState({
    overallHealth: 95,
    activeAgents: 24,
    dataLatency: 120,
    errorRate: 0.02
  });
  const [agentStats, setAgentStats] = useState({
    total: 24,
    active: 22,
    inactive: 2,
    errors: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchSystemStatus = useCallback(async () => {
    try {
      const [healthData, agentsData] = await Promise.all([
        systemHealthService?.getSystemHealth(),
        aiAgentsService?.getAgentsOverview()
      ]);

      setSystemMetrics({
        overallHealth: healthData?.overall_health || 95,
        activeAgents: agentsData?.totalActive || 22,
        dataLatency: healthData?.avg_response_time || 120,
        errorRate: healthData?.error_rate || 0.02
      });

      setAgentStats(agentsData || {
        total: 24,
        active: 22,
        inactive: 2,
        errors: 0
      });
    } catch (error) {
      console.error('Failed to fetch system status:', error?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchSystemStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <p className="text-gray-600 mt-1">
                Real-time monitoring of trading system health and AI agents
              </p>
            </div>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Health</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '--' : `${systemMetrics?.overallHealth}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '--' : `${systemMetrics?.activeAgents}/24`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wifi className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Data Latency</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '--' : `${systemMetrics?.dataLatency}ms`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '--' : `${(systemMetrics?.errorRate * 100)?.toFixed(2)}%`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Health Monitor */}
          <HealthMonitor />

          {/* Real-Time Data Panel */}
          <RealTimeDataPanel />
        </div>

        {/* Additional Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* API Latency */}
          <ApiLatencyCard />

          {/* Data Provider Status */}
          <DataProviderStatus />

          {/* System Controls */}
          <DegradedModeControl />
        </div>

        {/* Error Log Viewer */}
        <div className="mb-8">
          <ErrorLogViewer />
        </div>
      </div>
    </div>
  );
}