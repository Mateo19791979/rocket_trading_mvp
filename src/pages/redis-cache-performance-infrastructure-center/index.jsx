import React, { useState, useEffect } from 'react';
import { Shield, Server, Activity, Settings, Database, Network, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import RedisConfigurationPanel from './components/RedisConfigurationPanel';
import TraefikSecurityPanel from './components/TraefikSecurityPanel';
import DockerOrchestrationPanel from './components/DockerOrchestrationPanel';
import CachePerformanceMonitor from './components/CachePerformanceMonitor';
import ProductionMonitoringCenter from './components/ProductionMonitoringCenter';
import InfrastructureControlsPanel from './components/InfrastructureControlsPanel';
import Icon from '@/components/AppIcon';


export default function RedisCachePerformanceInfrastructureCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [infrastructureStats, setInfrastructureStats] = useState({
    redisStatus: 'connected',
    cacheHitRatio: 85.2,
    responseTime: 12.5,
    memoryUsage: 64.3,
    traefikStatus: 'operational',
    securityLevel: 'high',
    dockerContainers: 4,
    activeConnections: 23
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    requestsPerSecond: 42,
    averageLatency: 8.3,
    errorRate: 0.02,
    uptime: '99.98%'
  });

  // Add error boundary protection
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      const interval = setInterval(() => {
        setRealTimeMetrics(prev => ({
          ...prev,
          requestsPerSecond: Math.floor(Math.random() * 20) + 35,
          averageLatency: Math.random() * 5 + 6,
          errorRate: Math.random() * 0.05,
        }));
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error setting up real-time metrics:', error);
      setHasError(true);
    }
  }, []);

  // Add error recovery
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Server className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Redis Infrastructure Center Unavailable</h2>
          <p className="text-gray-400 mb-4">There was an error loading the infrastructure monitoring.</p>
          <button
            onClick={() => {
              setHasError(false);
              window.location?.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Retry Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusColor = (status) => {
    switch (status) {
      case 'connected': case'operational':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Infrastructure Overview', icon: Activity },
    { id: 'redis', label: 'Redis Configuration', icon: Database },
    { id: 'traefik', label: 'Traefik Security', icon: Shield },
    { id: 'docker', label: 'Docker Orchestration', icon: Server },
    { id: 'performance', label: 'Cache Performance', icon: Clock },
    { id: 'monitoring', label: 'Production Monitoring', icon: Network },
    { id: 'controls', label: 'Infrastructure Controls', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <Server className="w-8 h-8" />
              </div>
              Redis Cache & Performance Infrastructure Center
            </h1>
            <p className="text-gray-400 mt-2">
              High-performance caching layer and production-ready infrastructure management for Rocket Trading MVP
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 ${statusColor(infrastructureStats?.redisStatus)}`}>
              <Database className="w-4 h-4" />
              <span className="text-sm font-medium">Redis: {infrastructureStats?.redisStatus}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 ${statusColor(infrastructureStats?.traefikStatus)}`}>
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Traefik: {infrastructureStats?.traefikStatus}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Real-time Metrics Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">{realTimeMetrics?.requestsPerSecond}</div>
              <div className="text-sm text-gray-400">Requests/sec</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">{realTimeMetrics?.averageLatency?.toFixed(1)}ms</div>
              <div className="text-sm text-gray-400">Avg Latency</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-orange-400">{(realTimeMetrics?.errorRate * 100)?.toFixed(2)}%</div>
              <div className="text-sm text-gray-400">Error Rate</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">{realTimeMetrics?.uptime}</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs?.map((tab) => {
            const Icon = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab?.id
                    ? 'border-red-500 text-red-400 bg-gray-700' :'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab?.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Main Content Area */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Infrastructure Status Overview */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-400" />
                Infrastructure Health Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Cache Hit Ratio</span>
                    <span className="text-green-400 font-bold">{infrastructureStats?.cacheHitRatio}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${infrastructureStats?.cacheHitRatio}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-blue-400 font-bold">{infrastructureStats?.responseTime}ms</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${100 - infrastructureStats?.responseTime}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-orange-400 font-bold">{infrastructureStats?.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-400 h-2 rounded-full" 
                      style={{ width: `${infrastructureStats?.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Active Connections</span>
                    <span className="text-purple-400 font-bold">{infrastructureStats?.activeConnections}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-400 h-2 rounded-full" 
                      style={{ width: `${(infrastructureStats?.activeConnections / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Restart Redis Cluster
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Shield className="w-4 h-4" />
                  Update Security Headers
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Database className="w-4 h-4" />
                  Flush Cache
                </button>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Activity className="w-4 h-4" />
                  Generate Performance Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'redis' && <RedisConfigurationPanel stats={infrastructureStats} />}
        {activeTab === 'traefik' && <TraefikSecurityPanel stats={infrastructureStats} />}
        {activeTab === 'docker' && <DockerOrchestrationPanel stats={infrastructureStats} />}
        {activeTab === 'performance' && <CachePerformanceMonitor metrics={realTimeMetrics} stats={infrastructureStats} />}
        {activeTab === 'monitoring' && <ProductionMonitoringCenter metrics={realTimeMetrics} />}
        {activeTab === 'controls' && <InfrastructureControlsPanel />}
      </div>
    </div>
  );
}