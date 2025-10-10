import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, CheckCircle, XCircle, AlertTriangle, Monitor, Database, Server, Shield, RefreshCw, Download, Play, Settings, TrendingUp, Clock, Users, MessageSquare } from 'lucide-react';

// Mock data for demonstration
const mockGrafanaData = {
  httpP95: 425,
  httpP99: 780,
  requestsPerSecond: 1250,
  wsActiveClients: 850,
  wsMessagesPerSecond: 4200,
  ragP95: 340,
  errorRate: 0.8,
  cpuUsage: 45.2,
  memoryUsage: 62.8
};

const mockPreflightResults = {
  status: 'GO',
  checks: [
    { name: 'HTTP p95 Latency', status: 'pass', value: '425ms', threshold: '700ms' },
    { name: 'HTTP p99 Latency', status: 'pass', value: '780ms', threshold: '1200ms' },
    { name: 'Error Rate', status: 'pass', value: '0.8%', threshold: '2%' },
    { name: 'Readyz Endpoint', status: 'pass', value: '200 OK', threshold: '200' },
    { name: 'Sentry Connection', status: 'pass', value: 'Connected', threshold: 'Active' },
    { name: 'TLS Certificate', status: 'warning', value: 'Expires in 45 days', threshold: '30+ days' }
  ]
};

const ProductionMonitoringDashboard = () => {
  const [grafanaData, setGrafanaData] = useState(mockGrafanaData);
  const [preflightResults, setPreflightResults] = useState(mockPreflightResults);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState('6h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Simulate API calls with slight variations
      const variation = () => (Math.random() - 0.5) * 0.2 + 1;
      
      setGrafanaData(prev => ({
        httpP95: Math.round(prev?.httpP95 * variation()),
        httpP99: Math.round(prev?.httpP99 * variation()),
        requestsPerSecond: Math.round(prev?.requestsPerSecond * variation()),
        wsActiveClients: Math.round(prev?.wsActiveClients * variation()),
        wsMessagesPerSecond: Math.round(prev?.wsMessagesPerSecond * variation()),
        ragP95: Math.round(prev?.ragP95 * variation()),
        errorRate: +(prev?.errorRate * variation())?.toFixed(1),
        cpuUsage: +(prev?.cpuUsage * variation())?.toFixed(1),
        memoryUsage: +(prev?.memoryUsage * variation())?.toFixed(1)
      }));
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPreflightCheck = async () => {
    setLoading(true);
    try {
      // Simulate running preflight script
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update results with current data validation
      const updatedChecks = mockPreflightResults?.checks?.map(check => {
        if (check?.name === 'HTTP p95 Latency') {
          return { 
            ...check, 
            status: grafanaData?.httpP95 <= 700 ? 'pass' : 'fail',
            value: `${grafanaData?.httpP95}ms`
          };
        }
        if (check?.name === 'HTTP p99 Latency') {
          return { 
            ...check, 
            status: grafanaData?.httpP99 <= 1200 ? 'pass' : 'fail',
            value: `${grafanaData?.httpP99}ms`
          };
        }
        if (check?.name === 'Error Rate') {
          return { 
            ...check, 
            status: grafanaData?.errorRate <= 2 ? 'pass' : 'fail',
            value: `${grafanaData?.errorRate}%`
          };
        }
        return check;
      });
      
      const hasFailures = updatedChecks?.some(check => check?.status === 'fail');
      const hasWarnings = updatedChecks?.some(check => check?.status === 'warning');
      
      setPreflightResults({
        status: hasFailures ? 'NO-GO' : hasWarnings ? 'CAUTION' : 'GO',
        checks: updatedChecks
      });
    } catch (error) {
      console.error('Preflight check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadGrafanaJSON = () => {
    const grafanaConfig = {
      "title": "🚀 Rocket Trading MVP — Production Readiness",
      "schemaVersion": 38,
      "version": 1,
      "panels": [
        {
          "type": "stat",
          "title": "HTTP p95 latency (ms) /quotes",
          "id": 1,
          "datasource": {"type":"prometheus","uid":"__PROM__"},
          "targets": [
            {
              "expr": "1000 * histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{path=\"/quotes\"}[5m])) by (le))",
              "refId": "A"
            }
          ],
          "options": {"reduceOptions":{"calcs":["lastNotNull"]},"colorMode":"value"},
          "thresholds": {"mode":"absolute","steps":[{"color":"green","value":null},{"color":"yellow","value":700},{"color":"red","value":1200}]}
        },
        {
          "type": "stat",
          "title": "HTTP p99 latency (ms) /quotes",
          "id": 2,
          "datasource": {"type":"prometheus","uid":"__PROM__"},
          "targets": [
            {"expr":"1000 * histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket{path=\"/quotes\"}[5m])) by (le))","refId":"A"}
          ],
          "options":{"reduceOptions":{"calcs":["lastNotNull"]},"colorMode":"value"},
          "thresholds":{"mode":"absolute","steps":[{"color":"green"},{"color":"yellow","value":1000},{"color":"red","value":1500}]}
        }
      ],
      "time": {"from":"now-6h","to":"now"}
    };

    const blob = new Blob([JSON.stringify(grafanaConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rocket-trading-grafana-dashboard.json';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPreflightScript = () => {
    const script = `#!/usr/bin/env bash
set -euo pipefail

# ---- Config ----
PROM="\${PROMETHEUS_URL:-http://prometheus:9090}"
API="\${API_BASE_URL:-https://api.trading-mvp.com}"
APP="\${APP_BASE_URL:-https://trading-mvp.com}"
SENTRY_TEST="\${SENTRY_TEST_URL:-$API/debug/sentry-test}"
THRESH_P95=700        # ms
THRESH_P99=1200       # ms
THRESH_ERR=2          # %

jq_ok() { command -v jq >/dev/null 2>&1; }
if ! jq_ok; then echo "❌ jq manquant (apt-get install -y jq)"; exit 2; fi

# ---- Helpers ----
q() { curl -sS --fail "$PROM/api/v1/query" --data-urlencode "query=$1"; }
val() { jq -r '.data.result[0].value[1]' 2>/dev/null || echo "NaN"; }

ok=true

echo "🔎 Checking HTTP p95 /quotes..."
P95=$(q "1000 * histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{path=\\"/quotes\\"}[5m])) by (le))" | val)
echo "  p95=\${P95}ms (threshold \${THRESH_P95}ms)" awk"BEGIN{exit !($P95 <= $THRESH_P95)}" || { echo "  ❌ p95 too high"; ok=false; }

echo "🔎 Checking HTTP p99 /quotes..."
P99=$(q "1000 * histogram_quantile(0.99, sum(rate(http_request_duration_ms_bucket{path=\\"/quotes\\"}[5m])) by (le))" | val)
echo "  p99=\${P99}ms (threshold \${THRESH_P99}ms)" awk"BEGIN{exit !($P99 <= $THRESH_P99)}" || { echo "  ❌ p99 too high"; ok=false; }

echo "🔎 Checking HTTP error rate (5xx %)..."
ERR=$(q "100 * (sum(rate(http_requests_total{code=~\\"5..\\"}[5m])) / sum(rate(http_requests_total[5m])))" | val)
echo "  5xx=\${ERR}% (threshold \${THRESH_ERR}%)" awk"BEGIN{exit !($ERR <= $THRESH_ERR)}" || { echo "  ❌ error rate too high"; ok=false; }

echo "🔎 /readyz..." curl -sS -o /dev/null -w"%{http_code}" "$API/readyz" | grep -qE "200" || { echo "  ❌ /readyz not 200"; ok=false; }

echo "🔎 Sentry test..." curl -sS -o /dev/null -w"%{http_code}" "$SENTRY_TEST" | grep -qE "200|204" || { echo "  ❌ Sentry test failed"; ok=false; }

echo ""
if $ok; then
  echo "✅ GO — Production Ready SLOs are green."
  exit 0
else
  echo "❌ NO-GO — Corrige les points rouges ci-dessus."
  exit 1
fi`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'preflight.sh';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Production Monitoring Dashboard
                </h1>
                <p className="text-slate-600">
                  Grafana Integration & GO/NO-GO Assessment for Rocket Trading MVP
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e?.target?.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="1h">Last 1 Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
              
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 border border-green-200' :'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span>Auto Refresh</span>
              </button>
              
              {/* Manual Refresh */}
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              {/* Last Updated */}
              <div className="text-sm text-slate-500">
                Updated {lastUpdated?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        {/* Three Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column - Grafana Dashboard Integration */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Grafana Dashboard Integration
                      </h2>
                      <p className="text-sm text-slate-600">
                        Production metrics with Prometheus data source
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={downloadGrafanaJSON}
                    className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* HTTP Performance Metrics */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">HTTP Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">p95 Latency</span>
                        <Clock className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className={`text-xl font-bold mt-2 ${
                        grafanaData?.httpP95 <= 700 ? 'text-green-600' : 
                        grafanaData?.httpP95 <= 1200 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {grafanaData?.httpP95}ms
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Target: &lt;400ms</div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">p99 Latency</span>
                        <Clock className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className={`text-xl font-bold mt-2 ${
                        grafanaData?.httpP99 <= 1000 ? 'text-green-600' : 
                        grafanaData?.httpP99 <= 1500 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {grafanaData?.httpP99}ms
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Target: &lt;600ms</div>
                    </div>
                  </div>
                </div>
                
                {/* Throughput */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Request Throughput</h3>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Requests/Second</span>
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className={`text-xl font-bold mt-2 ${
                      grafanaData?.requestsPerSecond >= 1000 ? 'text-green-600' : 
                      grafanaData?.requestsPerSecond >= 500 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {grafanaData?.requestsPerSecond?.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Capacity: &gt;1000 req/s</div>
                  </div>
                </div>

                {/* WebSocket Metrics */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">WebSocket Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Active Clients</span>
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="text-xl font-bold text-blue-600 mt-2">
                        {grafanaData?.wsActiveClients}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Real-time connections</div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Messages/Sec</span>
                        <MessageSquare className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="text-xl font-bold text-blue-600 mt-2">
                        {grafanaData?.wsMessagesPerSecond?.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Message throughput</div>
                    </div>
                  </div>
                </div>

                {/* RAG Performance */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">RAG Query Performance</h3>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">p95 KB Search</span>
                      <Database className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className={`text-xl font-bold mt-2 ${
                      grafanaData?.ragP95 <= 200 ? 'text-green-600' : 
                      grafanaData?.ragP95 <= 500 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {grafanaData?.ragP95}ms
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Target: &lt;200ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - System Health Metrics */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-teal-500 to-green-600 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      System Health Metrics
                    </h2>
                    <p className="text-sm text-slate-600">
                      Real-time system performance indicators
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Error Rate */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Error Rate (5xx)</span>
                    <AlertTriangle className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${
                    grafanaData?.errorRate <= 0.1 ? 'text-green-600' : 
                    grafanaData?.errorRate <= 1.0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {grafanaData?.errorRate}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Target: &lt;0.1%</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full ${
                        grafanaData?.errorRate <= 0.1 ? 'bg-green-500' : 
                        grafanaData?.errorRate <= 1.0 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(grafanaData?.errorRate * 50, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* CPU & Memory Usage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">CPU Usage</span>
                      <Server className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className={`text-xl font-bold mt-2 ${
                      grafanaData?.cpuUsage <= 70 ? 'text-green-600' : 
                      grafanaData?.cpuUsage <= 85 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {grafanaData?.cpuUsage}%
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          grafanaData?.cpuUsage <= 70 ? 'bg-green-500' : 
                          grafanaData?.cpuUsage <= 85 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${grafanaData?.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Memory</span>
                      <Database className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className={`text-xl font-bold mt-2 ${
                      grafanaData?.memoryUsage <= 75 ? 'text-green-600' : 
                      grafanaData?.memoryUsage <= 90 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {grafanaData?.memoryUsage}%
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          grafanaData?.memoryUsage <= 75 ? 'bg-green-500' : 
                          grafanaData?.memoryUsage <= 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${grafanaData?.memoryUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Health Score Visualization */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Health Score</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {((grafanaData?.httpP95 <= 700 ? 25 : 0) + 
                        (grafanaData?.errorRate <= 1 ? 25 : 0) + 
                        (grafanaData?.cpuUsage <= 70 ? 25 : 0) + 
                        (grafanaData?.memoryUsage <= 75 ? 25 : 0))}%
                    </div>
                    <div className="text-sm text-slate-600 mb-4">Production Readiness</div>
                    
                    {/* Health indicators */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className={`flex items-center space-x-2 ${
                        grafanaData?.httpP95 <= 700 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {grafanaData?.httpP95 <= 700 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>Latency</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        grafanaData?.errorRate <= 1 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {grafanaData?.errorRate <= 1 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>Errors</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        grafanaData?.cpuUsage <= 70 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {grafanaData?.cpuUsage <= 70 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>CPU</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        grafanaData?.memoryUsage <= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {grafanaData?.memoryUsage <= 75 ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>Memory</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - GO/NO-GO Assessment Widget */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      preflightResults?.status === 'GO' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      preflightResults?.status === 'CAUTION'? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                      {preflightResults?.status === 'GO' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : preflightResults?.status === 'CAUTION' ? (
                        <AlertTriangle className="h-5 w-5 text-white" />
                      ) : (
                        <XCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        GO/NO-GO Assessment
                      </h2>
                      <p className="text-sm text-slate-600">
                        Automated production readiness validation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Overall Status */}
                <div className={`rounded-xl p-6 mb-6 text-center ${
                  preflightResults?.status === 'GO' ? 'bg-green-50 border border-green-200' :
                  preflightResults?.status === 'CAUTION'? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`text-3xl font-bold mb-2 ${
                    preflightResults?.status === 'GO' ? 'text-green-600' :
                    preflightResults?.status === 'CAUTION'? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {preflightResults?.status}
                  </div>
                  <div className="text-sm text-slate-600">
                    {preflightResults?.status === 'GO' ? 'Production Ready - All Systems Green' :
                     preflightResults?.status === 'CAUTION'? 'Proceed with Caution - Minor Issues' : 'Production Blocked - Critical Issues Found'}
                  </div>
                </div>

                {/* Run Preflight Check Button */}
                <div className="mb-6">
                  <button
                    onClick={runPreflightCheck}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Play className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Run Preflight Check</span>
                  </button>
                  
                  <button
                    onClick={downloadPreflightScript}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-medium transition-colors mt-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download preflight.sh</span>
                  </button>
                </div>

                {/* Detailed Check Results */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">Validation Results</h3>
                  {preflightResults?.checks?.map((check, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {check?.status === 'pass' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : check?.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">{check?.name}</div>
                          <div className="text-xs text-slate-500">Threshold: {check?.threshold}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        check?.status === 'pass' ? 'text-green-600' :
                        check?.status === 'warning'? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {check?.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SLO/SLA Compliance */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    SLO/SLA Compliance
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Uptime Target:</span>
                      <span className="font-medium text-blue-900">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Response Time SLA:</span>
                      <span className="font-medium text-blue-900">&lt; 500ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Error Rate SLA:</span>
                      <span className="font-medium text-blue-900">&lt; 1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">TLS Certificate:</span>
                      <span className="font-medium text-blue-900">Valid</span>
                    </div>
                  </div>
                </div>

                {/* Integration Settings */}
                <div className="mt-6">
                  <button className="w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Configure Monitoring</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Instructions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Setup Instructions</h2>
            <p className="text-sm text-slate-600">Quick start guide for Grafana and monitoring integration</p>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">1. Grafana Dashboard Setup</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Download the JSON configuration above</p>
                <p>• In Grafana → "+ Import" → paste JSON</p>
                <p>• Select your Prometheus datasource</p>
                <p>• Configure panels for your metrics</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">2. Preflight Script Usage</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>• Download preflight.sh script</p>
                <p>• Make executable: chmod +x preflight.sh</p>
                <p>• Set environment variables (PROMETHEUS_URL, API_BASE_URL)</p>
                <p>• Run ./preflight.sh for GO/NO-GO decision</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionMonitoringDashboard;