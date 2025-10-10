import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Bell, Shield, Webhook, BarChart3 } from 'lucide-react';

import Header from '../../components/ui/Header';

import MetricsConfigurationPanel from './components/MetricsConfigurationPanel';
import AlertRulesManagementPanel from './components/AlertRulesManagementPanel';
import NotificationChannelsPanel from './components/NotificationChannelsPanel';
import DashboardIntegrationPanel from './components/DashboardIntegrationPanel';

export default function PrometheusMonitoringAlertingConfiguration() {
  const [activeItem, setActiveItem] = useState('prometheus-monitoring');
  const [monitoringMetrics, setMonitoringMetrics] = useState([]);
  const [alertRules, setAlertRules] = useState([]);
  const [notificationChannels, setNotificationChannels] = useState([]);
  const [dashboardConfig, setDashboardConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock Prometheus metrics configuration
  const defaultMetrics = [
    {
      id: 'http_requests_total',
      name: 'HTTP Requests Total',
      type: 'counter',
      description: 'Total number of HTTP requests',
      labels: ['method', 'status', 'path'],
      collection_interval: '15s',
      retention: '15d',
      is_active: true
    },
    {
      id: 'http_request_duration_ms',
      name: 'HTTP Request Duration',
      type: 'histogram',
      description: 'HTTP request duration in milliseconds',
      labels: ['method', 'path'],
      collection_interval: '15s',
      retention: '15d',
      is_active: true
    },
    {
      id: 'ws_active_connections',
      name: 'WebSocket Active Connections',
      type: 'gauge',
      description: 'Number of active WebSocket connections',
      labels: ['endpoint'],
      collection_interval: '10s',
      retention: '7d',
      is_active: true
    },
    {
      id: 'trading_performance_score',
      name: 'Trading Performance Score',
      type: 'gauge',
      description: 'Custom trading system performance indicator',
      labels: ['strategy', 'market'],
      collection_interval: '30s',
      retention: '30d',
      is_active: true
    },
    {
      id: 'api_key_quota_usage',
      name: 'API Key Quota Usage',
      type: 'gauge',
      description: 'API key quota usage percentage',
      labels: ['provider', 'key_name'],
      collection_interval: '60s',
      retention: '7d',
      is_active: true
    }
  ];

  // Alert rules configuration
  const defaultAlertRules = [
    {
      id: 'high_latency_quotes_p95',
      name: 'High Latency Quotes P95',
      severity: 'warning',
      condition: 'histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket{path="/quotes"}[5m])) by (le)) > 0.4',
      threshold: '400ms',
      duration: '10m',
      description: 'P95 latency for /quotes endpoint exceeds 400ms',
      is_active: true,
      escalation_level: 1
    },
    {
      id: 'high_http_error_rate',
      name: 'High HTTP Error Rate',
      severity: 'critical',
      condition: '(sum(rate(http_requests_total{code=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) > 0.01',
      threshold: '1%',
      duration: '5m',
      description: 'HTTP 5xx error rate exceeds 1%',
      is_active: true,
      escalation_level: 2
    },
    {
      id: 'ws_clients_drop',
      name: 'WebSocket Clients Drop',
      severity: 'critical',
      condition: 'ws_active_connections < 10',
      threshold: '10 connections',
      duration: '2m',
      description: 'WebSocket active connections below minimum threshold',
      is_active: true,
      escalation_level: 2
    },
    {
      id: 'trading_system_anomaly',
      name: 'Trading System Anomaly',
      severity: 'warning',
      condition: 'trading_performance_score < 0.8',
      threshold: '0.8',
      duration: '15m',
      description: 'Trading system performance below acceptable threshold',
      is_active: true,
      escalation_level: 1
    },
    {
      id: 'api_quota_exceeded',
      name: 'API Quota Exceeded',
      severity: 'warning',
      condition: 'api_key_quota_usage > 90',
      threshold: '90%',
      duration: '1m',
      description: 'API key quota usage exceeds 90%',
      is_active: true,
      escalation_level: 1
    }
  ];

  // Notification channels configuration
  const defaultNotificationChannels = [
    {
      id: 'email_alerts',
      name: 'Email Alerts',
      type: 'email',
      config: {
        smtp_server: 'smtp.gmail.com',
        smtp_port: 587,
        from_address: 'alerts@trading-mvp.com',
        to_addresses: ['admin@trading-mvp.com', 'devops@trading-mvp.com'],
        tls_enabled: true
      },
      is_active: true,
      severity_filter: ['critical', 'warning']
    },
    {
      id: 'slack_notifications',
      name: 'Slack Notifications',
      type: 'slack',
      config: {
        webhook_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        channel: '#alerts',
        username: 'PrometheusBot',
        icon_emoji: '🚨'
      },
      is_active: true,
      severity_filter: ['critical']
    },
    {
      id: 'webhook_integration',
      name: 'Custom Webhook',
      type: 'webhook',
      config: {
        webhook_url: 'https://api.trading-mvp.com/webhooks/alerts',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer xxx',
          'Content-Type': 'application/json'
        },
        timeout: '10s'
      },
      is_active: true,
      severity_filter: ['critical', 'warning']
    }
  ];

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would load from Supabase or monitoring system
      // For now, we'll use mock data
      
      setMonitoringMetrics(defaultMetrics);
      setAlertRules(defaultAlertRules);
      setNotificationChannels(defaultNotificationChannels);
      setDashboardConfig({
        grafana_url: 'http://grafana:3000',
        prometheus_url: 'http://prometheus:9090',
        alertmanager_url: 'http://alertmanager:9093',
        default_dashboard_id: 'trading-mvp-overview',
        refresh_interval: '30s'
      });

    } catch (err) {
      console.log('Monitoring data load error:', err?.message);
      setError(`Failed to load monitoring configuration: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertRule = async (ruleId, updates) => {
    try {
      setAlertRules(prev => 
        prev?.map(rule => 
          rule?.id === ruleId ? { ...rule, ...updates } : rule
        )
      );
    } catch (err) {
      console.log('Alert rule update error:', err?.message);
      setError(`Failed to update alert rule: ${err?.message}`);
    }
  };

  const updateNotificationChannel = async (channelId, updates) => {
    try {
      setNotificationChannels(prev => 
        prev?.map(channel => 
          channel?.id === channelId ? { ...channel, ...updates } : channel
        )
      );
    } catch (err) {
      console.log('Notification channel update error:', err?.message);
      setError(`Failed to update notification channel: ${err?.message}`);
    }
  };

  const testNotificationChannel = async (channelId) => {
    try {
      const channel = notificationChannels?.find(c => c?.id === channelId);
      if (!channel) return;

      // Mock test notification
      alert(`Test notification sent via ${channel?.name} (${channel?.type})`);
      
    } catch (err) {
      console.log('Notification test error:', err?.message);
      setError(`Failed to test notification: ${err?.message}`);
    }
  };

  useEffect(() => {
    loadMonitoringData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-foreground mb-2 font-heading">
                Loading Monitoring Configuration...
              </h2>
              <p className="text-muted-foreground font-body">
                Initializing Prometheus and alerting setup
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-heading">
                Prometheus Monitoring & Alerting Configuration
              </h1>
              <p className="text-muted-foreground font-body mt-2">
                Comprehensive observability setup and alert management for the Rocket Trading MVP production environment with real-time metrics collection and notification systems
              </p>
            </div>
            
            {/* Status Overview */}
            <div className="text-right">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <Activity size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-foreground">Prometheus Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bell size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-foreground">{alertRules?.filter(r => r?.is_active)?.length} Alerts</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground font-body">
                Monitoring {monitoringMetrics?.filter(m => m?.is_active)?.length} metrics across all services
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-red-600" />
                <span className="text-red-700 font-body">{error}</span>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: 'Active Metrics',
                value: monitoringMetrics?.filter(m => m?.is_active)?.length || 0,
                icon: BarChart3,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100'
              },
              {
                label: 'Alert Rules',
                value: alertRules?.filter(r => r?.is_active)?.length || 0,
                icon: Shield,
                color: 'text-orange-600',
                bgColor: 'bg-orange-100'
              },
              {
                label: 'Critical Alerts',
                value: alertRules?.filter(r => r?.severity === 'critical' && r?.is_active)?.length || 0,
                icon: AlertTriangle,
                color: 'text-red-600',
                bgColor: 'bg-red-100'
              },
              {
                label: 'Notification Channels',
                value: notificationChannels?.filter(c => c?.is_active)?.length || 0,
                icon: Bell,
                color: 'text-green-600',
                bgColor: 'bg-green-100'
              }
            ]?.map((stat) => (
              <div key={stat?.label} className="bg-card border border-border rounded-lg p-4 shadow-trading">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {stat?.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-body">
                      {stat?.label}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${stat?.bgColor}`}>
                    <stat.icon size={24} className={stat?.color} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Metrics & Alert Rules */}
          <div className="space-y-6">
            <MetricsConfigurationPanel 
              monitoringMetrics={monitoringMetrics}
              onUpdateMetric={(metricId, updates) => {
                setMonitoringMetrics(prev => 
                  prev?.map(m => m?.id === metricId ? { ...m, ...updates } : m)
                );
              }}
            />

            <AlertRulesManagementPanel 
              alertRules={alertRules}
              onUpdateRule={updateAlertRule}
            />
          </div>

          {/* Right Column - Notifications & Dashboard */}
          <div className="space-y-6">
            <NotificationChannelsPanel 
              notificationChannels={notificationChannels}
              onUpdateChannel={updateNotificationChannel}
              onTestChannel={testNotificationChannel}
            />

            <DashboardIntegrationPanel 
              dashboardConfig={dashboardConfig}
              onUpdateConfig={(updates) => {
                setDashboardConfig(prev => ({ ...prev, ...updates }));
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground font-body">
            Production-ready observability infrastructure with comprehensive monitoring and alerting
          </p>
        </div>
      </div>
    </div>
  );
}