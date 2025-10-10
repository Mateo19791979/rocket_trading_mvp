import React, { useState } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  Settings, 
  Activity, 
  TrendingUp,
  Monitor,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function DashboardIntegrationPanel({ 
  dashboardConfig,
  onUpdateConfig 
}) {
  const [refreshing, setRefreshing] = useState(false);

  const dashboardTemplates = [
    {
      id: 'trading-mvp-overview',
      name: 'Trading MVP Overview',
      description: 'Comprehensive system health and trading performance metrics',
      panels: 12,
      metrics: ['HTTP requests', 'WebSocket connections', 'Trading performance', 'Error rates'],
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'infrastructure-monitoring',
      name: 'Infrastructure Monitoring',
      description: 'Server resources, database, and network performance',
      panels: 8,
      metrics: ['CPU usage', 'Memory', 'Disk I/O', 'Network traffic'],
      icon: Monitor,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'api-performance',
      name: 'API Performance Dashboard',
      description: 'API latency, throughput, and error tracking',
      panels: 6,
      metrics: ['Response times', 'Request rates', '5xx errors', 'API quotas'],
      icon: Zap,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'business-intelligence',
      name: 'Business Intelligence',
      description: 'Trading strategies, market data, and business KPIs',
      panels: 10,
      metrics: ['Strategy performance', 'Market coverage', 'Revenue metrics', 'User engagement'],
      icon: Activity,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleRefreshDashboards = async () => {
    setRefreshing(true);
    
    // Simulate dashboard refresh
    setTimeout(() => {
      setRefreshing(false);
      alert('Dashboard configurations refreshed successfully!');
    }, 2000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Dashboard Integration
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body">
          <BarChart3 size={16} />
          <span>Grafana Provisioning</span>
        </div>
      </div>
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-foreground font-heading">
              Grafana Integration Status
            </div>
            <div className="text-sm text-muted-foreground font-body">
              Connected to {dashboardConfig?.grafana_url || 'http://grafana:3000'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">Connected</span>
          </div>
        </div>
      </div>
      {/* Service URLs Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Service Configuration
        </h3>
        
        <div className="space-y-3">
          {[
            { label: 'Grafana URL', key: 'grafana_url', value: dashboardConfig?.grafana_url },
            { label: 'Prometheus URL', key: 'prometheus_url', value: dashboardConfig?.prometheus_url },
            { label: 'AlertManager URL', key: 'alertmanager_url', value: dashboardConfig?.alertmanager_url }
          ]?.map((service) => (
            <div key={service?.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-foreground">{service?.label}:</span>
                <div className="text-sm text-muted-foreground font-mono">
                  {service?.value}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(service?.value, '_blank')}
                  className="p-2 bg-white border rounded hover:bg-gray-50"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  onClick={() => {
                    const newUrl = prompt(`Update ${service?.label}:`, service?.value);
                    if (newUrl) {
                      onUpdateConfig({ [service?.key]: newUrl });
                    }
                  }}
                  className="p-2 bg-white border rounded hover:bg-gray-50"
                  title="Edit URL"
                >
                  <Settings size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pre-configured Dashboard Templates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground font-heading">
            Dashboard Templates
          </h3>
          <button
            onClick={handleRefreshDashboards}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {dashboardTemplates?.map((template) => {
            const Icon = template?.icon;
            const isDefault = template?.id === dashboardConfig?.default_dashboard_id;
            
            return (
              <div key={template?.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${template?.color} shadow-md`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground font-heading">
                        {template?.name}
                        {isDefault && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground font-body">
                        {template?.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-body">
                      {template?.panels} panels
                    </span>
                    <button
                      onClick={() => alert(`Opening dashboard: ${template?.name}`)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
                      title="View Dashboard"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Template Metrics */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {template?.metrics?.map((metric) => (
                    <span key={metric} className="px-2 py-1 bg-gray-100 rounded text-xs font-body">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Real-time Visualization Settings */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Visualization Settings
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-foreground">Refresh Interval:</span>
              <div className="text-sm text-muted-foreground font-body">
                Auto-refresh dashboards every {dashboardConfig?.refresh_interval}
              </div>
            </div>
            <select
              value={dashboardConfig?.refresh_interval}
              onChange={(e) => onUpdateConfig({ refresh_interval: e?.target?.value })}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="10s">10 seconds</option>
              <option value="30s">30 seconds</option>
              <option value="1m">1 minute</option>
              <option value="5m">5 minutes</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-foreground">Time Range:</span>
              <div className="text-sm text-muted-foreground font-body">
                Default time window for new dashboards
              </div>
            </div>
            <select className="px-3 py-1 border rounded text-sm">
              <option value="1h">Last 1 hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-foreground">Theme:</span>
              <div className="text-sm text-muted-foreground font-body">
                Dashboard color scheme and styling
              </div>
            </div>
            <select className="px-3 py-1 border rounded text-sm">
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>
      </div>
      {/* Custom Visualization Templates */}
      <div>
        <h3 className="text-lg font-semibold text-foreground font-heading mb-3">
          Custom Templates
        </h3>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 size={16} className="text-blue-600" />
            <span className="font-medium text-foreground">Template Library</span>
          </div>
          <div className="text-sm text-muted-foreground font-body mb-3">
            Access pre-built dashboard templates optimized for trading systems with drag-and-drop customization
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Browse Templates
          </button>
        </div>
      </div>
    </div>
  );
}