import React, { useState, useEffect } from 'react';
import { Monitor, AlertTriangle, CheckCircle, Clock, Activity, Shield, Database, Network } from 'lucide-react';

export default function ProductionMonitoringCenter({ metrics }) {
  const [monitoringStatus, setMonitoringStatus] = useState({
    apiHealth: 'healthy',
    cacheHealth: 'healthy',
    securityStatus: 'secured',
    systemLoad: 'normal',
    errorRate: 0.02,
    uptime: '99.98%'
  });

  const [endpointMetrics, setEndpointMetrics] = useState([
    {
      endpoint: '/api/quotes',
      status: 'healthy',
      responseTime: 8.3,
      requests: 12847,
      cacheHits: 10923,
      errors: 3,
      ttlValidation: 'passed'
    },
    {
      endpoint: '/api/healthz',
      status: 'healthy',
      responseTime: 2.1,
      requests: 4523,
      cacheHits: 0,
      errors: 0,
      ttlValidation: 'n/a'
    },
    {
      endpoint: '/api/readyz',
      status: 'healthy',
      responseTime: 1.8,
      requests: 2341,
      cacheHits: 0,
      errors: 0,
      ttlValidation: 'n/a'
    }
  ]);

  const [fallbackMechanisms, setFallbackMechanisms] = useState({
    redisFallback: {
      enabled: true,
      status: 'standby',
      lastActivated: null,
      fallbackCount: 0
    },
    gracefulDegradation: {
      enabled: true,
      status: 'ready',
      degradedServices: [],
      performanceImpact: 0
    },
    emergencyMode: {
      enabled: true,
      status: 'inactive',
      activationThreshold: 5.0,
      currentErrorRate: 0.02
    }
  });

  const [productionTests, setProductionTests] = useState([
    {
      name: 'Cache Hit Ratio Test',
      status: 'passed',
      lastRun: '2024-10-07 19:03:45',
      result: '85.2% (Target: >80%)',
      nextRun: '2024-10-07 19:08:45'
    },
    {
      name: 'Response Time SLA',
      status: 'passed',
      lastRun: '2024-10-07 19:03:30',
      result: '8.3ms (Target: <15ms)',
      nextRun: '2024-10-07 19:08:30'
    },
    {
      name: 'Redis Connection Test',
      status: 'passed',
      lastRun: '2024-10-07 19:03:15',
      result: 'Connected (23 connections)',
      nextRun: '2024-10-07 19:08:15'
    },
    {
      name: 'Traefik Security Headers',
      status: 'passed',
      lastRun: '2024-10-07 19:03:00',
      result: 'All headers present',
      nextRun: '2024-10-07 19:08:00'
    }
  ]);

  const [auditLog, setAuditLog] = useState([
    {
      timestamp: '2024-10-07 19:04:01',
      level: 'INFO',
      component: 'Redis',
      event: 'Cache key invalidated',
      details: 'q:BTCUSDT manually invalidated by admin'
    },
    {
      timestamp: '2024-10-07 19:03:45',
      level: 'SUCCESS',
      component: 'Traefik',
      event: 'Security headers updated',
      details: 'HSTS and CSP policies applied successfully'
    },
    {
      timestamp: '2024-10-07 19:03:30',
      level: 'INFO',
      component: 'Docker',
      event: 'Container health check',
      details: 'All containers healthy and running'
    },
    {
      timestamp: '2024-10-07 19:03:15',
      level: 'WARN',
      component: 'API',
      event: 'High response time detected',
      details: 'API endpoint /quotes returned 24ms response (threshold: 20ms)'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': case'passed': case'secured': case'normal':
        return 'text-green-400';
      case 'warning': case'degraded':
        return 'text-yellow-400';
      case 'error': case'failed': case'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': case'passed': case'secured': case'normal':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': case'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': case'failed': case'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const activateEmergencyFallback = () => {
    console.log('Activating emergency fallback mechanisms...');
    // Here you would make API call to activate emergency procedures
  };

  const runProductionTest = (testName) => {
    console.log('Running production test:', testName);
    // Here you would make API call to execute specific test
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Production Health Dashboard */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-red-400" />
          Production Health Dashboard
        </h3>

        {/* System Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(monitoringStatus?.apiHealth)}
              <span className="text-gray-400 text-sm">API Health</span>
            </div>
            <div className={`text-lg font-bold ${getStatusColor(monitoringStatus?.apiHealth)}`}>
              {monitoringStatus?.apiHealth}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">Cache Health</span>
            </div>
            <div className={`text-lg font-bold ${getStatusColor(monitoringStatus?.cacheHealth)}`}>
              {monitoringStatus?.cacheHealth}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm">Security</span>
            </div>
            <div className={`text-lg font-bold ${getStatusColor(monitoringStatus?.securityStatus)}`}>
              {monitoringStatus?.securityStatus}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400 text-sm">System Load</span>
            </div>
            <div className={`text-lg font-bold ${getStatusColor(monitoringStatus?.systemLoad)}`}>
              {monitoringStatus?.systemLoad}
            </div>
          </div>
        </div>

        {/* API Endpoint Metrics */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Network className="w-4 h-4" />
            API Endpoint Performance
          </h4>
          <div className="space-y-3">
            {endpointMetrics?.map((endpoint, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-blue-400 font-mono text-sm">{endpoint?.endpoint}</code>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(endpoint?.status)}
                    <span className={`text-sm ${getStatusColor(endpoint?.status)}`}>
                      {endpoint?.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Response:</span>
                    <div className="text-white font-mono">{endpoint?.responseTime}ms</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Requests:</span>
                    <div className="text-white">{endpoint?.requests?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Cache Hits:</span>
                    <div className="text-green-400">{endpoint?.cacheHits?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Errors:</span>
                    <div className={endpoint?.errors > 0 ? 'text-red-400' : 'text-green-400'}>
                      {endpoint?.errors}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">TTL:</span>
                    <div className={`${
                      endpoint?.ttlValidation === 'passed' ? 'text-green-400' : 
                      endpoint?.ttlValidation === 'n/a' ? 'text-gray-400' : 'text-red-400'
                    }`}>
                      {endpoint?.ttlValidation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Readiness Tests */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Automated Production Tests
          </h4>
          <div className="space-y-3">
            {productionTests?.map((test, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{test?.name}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test?.status)}
                    <button 
                      onClick={() => runProductionTest(test?.name)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Run Now
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Result:</span>
                    <div className="text-white">{test?.result}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Last Run:</span>
                    <div className="text-gray-300">{test?.lastRun}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Next Run:</span>
                    <div className="text-gray-300">{test?.nextRun}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Emergency Controls & Audit Log */}
      <div className="space-y-6">
        {/* Emergency Fallback Controls */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Emergency Controls
          </h3>

          <div className="space-y-4">
            {Object.entries(fallbackMechanisms)?.map(([key, mechanism]) => (
              <div key={key} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium capitalize">
                    {key?.replace(/([A-Z])/g, ' $1')?.trim()}
                  </span>
                  <span className={`text-sm ${getStatusColor(mechanism?.status)}`}>
                    {mechanism?.enabled ? mechanism?.status : 'disabled'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  {mechanism?.fallbackCount !== undefined && (
                    <div>Activations: {mechanism?.fallbackCount}</div>
                  )}
                  {mechanism?.currentErrorRate !== undefined && (
                    <div>Error Rate: {(mechanism?.currentErrorRate * 100)?.toFixed(2)}%</div>
                  )}
                  {mechanism?.performanceImpact !== undefined && (
                    <div>Performance Impact: {mechanism?.performanceImpact}%</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={activateEmergencyFallback}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center"
          >
            <AlertTriangle className="w-4 h-4" />
            Activate Emergency Procedures
          </button>
        </div>

        {/* Audit Log */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Infrastructure Audit Log
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auditLog?.map((log, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{log?.timestamp}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    log?.level === 'SUCCESS' ? 'bg-green-600' :
                    log?.level === 'WARN' ? 'bg-yellow-600' : 
                    log?.level === 'ERROR' ? 'bg-red-600' : 'bg-blue-600'
                  }`}>
                    {log?.level}
                  </span>
                </div>
                <div className="text-sm text-white font-medium mb-1">{log?.event}</div>
                <div className="text-xs text-gray-300">{log?.details}</div>
                <div className="text-xs text-blue-400 mt-1">{log?.component}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}