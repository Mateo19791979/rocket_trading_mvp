import React, { useState, useEffect } from 'react';
import { Server, Wifi, AlertTriangle, CheckCircle, XCircle, Settings, RefreshCw, Shield, Clock, Target } from 'lucide-react';

// Import components
import CriticalIssuesPanel from './components/CriticalIssuesPanel';
import SystemHealthDiagnostics from './components/SystemHealthDiagnostics';
import RecoveryProgressDashboard from './components/RecoveryProgressDashboard';
import PerformanceOptimization from './components/PerformanceOptimization';
import ArchitectureOptimization from './components/ArchitectureOptimization';

// Import service
import { systemRecoveryService } from '../../services/systemRecoveryService';

export default function SystemRecoveryOptimizationCenter() {
  const [systemStatus, setSystemStatus] = useState({
    deploymentProgress: null,
    apiServerStatus: null,
    providerKeysStatus: null,
    webSocketStatus: null,
    systemDiagnostics: null,
    performanceMetrics: null,
    loading: true
  });

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadSystemStatus = async () => {
    setRefreshing(true);
    try {
      const [
        deploymentProgress,
        apiServerStatus,
        providerKeysStatus,
        webSocketStatus,
        systemDiagnostics,
        performanceMetrics
      ] = await Promise.allSettled([
        systemRecoveryService?.getDeploymentProgress(),
        systemRecoveryService?.getApiServerStatus(),
        systemRecoveryService?.getProviderKeysStatus(),
        systemRecoveryService?.getWebSocketStatus(),
        systemRecoveryService?.getSystemDiagnostics(),
        systemRecoveryService?.getPerformanceMetrics()
      ]);

      setSystemStatus({
        deploymentProgress: deploymentProgress?.status === 'fulfilled' ? deploymentProgress?.value : null,
        apiServerStatus: apiServerStatus?.status === 'fulfilled' ? apiServerStatus?.value : null,
        providerKeysStatus: providerKeysStatus?.status === 'fulfilled' ? providerKeysStatus?.value : null,
        webSocketStatus: webSocketStatus?.status === 'fulfilled' ? webSocketStatus?.value : null,
        systemDiagnostics: systemDiagnostics?.status === 'fulfilled' ? systemDiagnostics?.value : null,
        performanceMetrics: performanceMetrics?.status === 'fulfilled' ? performanceMetrics?.value : null,
        loading: false
      });

      setLastUpdate(new Date()?.toLocaleTimeString());
    } catch (error) {
      console.error('Failed to load system status:', error?.message);
      setSystemStatus(prev => ({ ...prev, loading: false }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getOverallSystemHealth = () => {
    const { apiServerStatus, providerKeysStatus, webSocketStatus } = systemStatus;
    
    let healthyComponents = 0;
    let totalComponents = 0;

    if (apiServerStatus) {
      totalComponents++;
      if (apiServerStatus?.status === 'healthy') healthyComponents++;
    }

    if (providerKeysStatus) {
      totalComponents++;
      if (providerKeysStatus?.overallStatus === 'validated') healthyComponents++;
    }

    if (webSocketStatus) {
      totalComponents++;
      if (webSocketStatus?.status === 'online') healthyComponents++;
    }

    if (totalComponents === 0) return { status: 'unknown', percentage: 0 };

    const percentage = Math.round((healthyComponents / totalComponents) * 100);
    
    if (percentage >= 90) return { status: 'healthy', percentage };
    if (percentage >= 70) return { status: 'degraded', percentage };
    return { status: 'critical', percentage };
  };

  const overallHealth = getOverallSystemHealth();

  if (systemStatus?.loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading System Recovery Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">System Recovery & Optimization Center</h1>
                <p className="text-slate-400">
                  Comprehensive diagnostic and repair capabilities for Rocket Trading MVP infrastructure
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Overall Health Status */}
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700/50">
                {overallHealth?.status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-400" />}
                {overallHealth?.status === 'degraded' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                {overallHealth?.status === 'critical' && <XCircle className="w-5 h-5 text-red-400" />}
                <span className="text-sm font-medium">
                  System Health: {overallHealth?.percentage}%
                </span>
              </div>

              <button
                onClick={loadSystemStatus}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Status Summary Bar */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            {/* Deployment Progress */}
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <p className="text-lg font-bold text-blue-400">
                {systemStatus?.deploymentProgress?.completionPercentage || 57}%
              </p>
            </div>

            {/* API Status */}
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">API Status</span>
              </div>
              <p className="text-lg font-bold text-green-400 capitalize">
                {systemStatus?.apiServerStatus?.status || 'Loading...'}
              </p>
            </div>

            {/* Provider Keys */}
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Providers</span>
              </div>
              <p className="text-lg font-bold text-yellow-400">
                {systemStatus?.providerKeysStatus?.configuredCount || 0}/3 Keys
              </p>
            </div>

            {/* WebSocket Status */}
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium">WebSocket</span>
              </div>
              <p className="text-lg font-bold text-purple-400">
                {systemStatus?.webSocketStatus?.activeConnections || 0} Clients
              </p>
            </div>
          </div>

          {lastUpdate && (
            <div className="mt-3 text-xs text-slate-500 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Last updated: {lastUpdate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Critical Issues Panel */}
          <div className="col-span-4 space-y-6">
            <CriticalIssuesPanel 
              apiServerStatus={systemStatus?.apiServerStatus}
              providerKeysStatus={systemStatus?.providerKeysStatus}
              webSocketStatus={systemStatus?.webSocketStatus}
              onActionComplete={loadSystemStatus}
            />

            <SystemHealthDiagnostics 
              diagnostics={systemStatus?.systemDiagnostics}
              onRunDiagnostic={loadSystemStatus}
            />
          </div>

          {/* Center Column - Recovery Progress Dashboard */}
          <div className="col-span-4 space-y-6">
            <RecoveryProgressDashboard 
              deploymentProgress={systemStatus?.deploymentProgress}
              onStageAction={loadSystemStatus}
            />

            <PerformanceOptimization 
              metrics={systemStatus?.performanceMetrics}
              onOptimizationAction={loadSystemStatus}
            />
          </div>

          {/* Right Column - Architecture Optimization */}
          <div className="col-span-4 space-y-6">
            <ArchitectureOptimization 
              systemStatus={systemStatus}
              onArchitectureAction={loadSystemStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}