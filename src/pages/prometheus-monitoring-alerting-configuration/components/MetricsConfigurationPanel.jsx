import React, { useState } from 'react';
import { 
  BarChart3, 
  Settings, 
  Clock, 
  Database, 
  TrendingUp,
  Activity,
  Zap,
  Target
} from 'lucide-react';

export default function MetricsConfigurationPanel({ 
  monitoringMetrics, 
  onUpdateMetric 
}) {
  const [selectedMetric, setSelectedMetric] = useState(null);

  const getMetricTypeIcon = (type) => {
    switch (type) {
      case 'counter': return <TrendingUp size={16} className="text-blue-600" />;
      case 'histogram': return <BarChart3 size={16} className="text-green-600" />;
      case 'gauge': return <Target size={16} className="text-purple-600" />;
      default: return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getMetricTypeColor = (type) => {
    switch (type) {
      case 'counter': return 'bg-blue-100 text-blue-700';
      case 'histogram': return 'bg-green-100 text-green-700';
      case 'gauge': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Metrics Configuration
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body">
          <Database size={16} />
          <span>Prometheus Scrape Targets</span>
        </div>
      </div>
      {/* Metrics List */}
      <div className="space-y-3">
        {monitoringMetrics?.map((metric) => (
          <div 
            key={metric?.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedMetric?.id === metric?.id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => setSelectedMetric(selectedMetric?.id === metric?.id ? null : metric)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getMetricTypeIcon(metric?.type)}
                <div>
                  <div className="font-semibold text-foreground font-heading">
                    {metric?.name}
                  </div>
                  <div className="text-sm text-muted-foreground font-body">
                    {metric?.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricTypeColor(metric?.type)}`}>
                  {metric?.type}
                </span>
                
                <div className={`w-2 h-2 rounded-full ${
                  metric?.is_active ? 'bg-green-600' : 'bg-gray-400'
                }`} />
              </div>
            </div>

            {/* Expanded Details */}
            {selectedMetric?.id === metric?.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Collection Interval:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-muted-foreground font-mono">
                        {metric?.collection_interval}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-foreground">Retention:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <Database size={12} className="text-muted-foreground" />
                      <span className="text-muted-foreground font-mono">
                        {metric?.retention}
                      </span>
                    </div>
                  </div>
                </div>

                {metric?.labels && metric?.labels?.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-foreground">Labels:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metric?.labels?.map((label) => (
                        <span key={label} className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configuration Controls */}
                <div className="mt-4 flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      onUpdateMetric(metric?.id, { is_active: !metric?.is_active });
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      metric?.is_active 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' :'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {metric?.is_active ? 'Disable' : 'Enable'}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      // In a real app, this would open a configuration modal
                      alert(`Configure metric: ${metric?.name}`);
                    }}
                    className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center space-x-1"
                  >
                    <Settings size={12} />
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Custom Business Metrics Section */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-4">
          Custom Business Metrics
        </h3>
        
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap size={16} className="text-blue-600" />
              <span className="font-medium text-foreground">Trading Performance Indicators</span>
            </div>
            <div className="text-sm text-muted-foreground font-body">
              Custom metrics for trading system performance, strategy effectiveness, and market data quality
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target size={16} className="text-green-600" />
              <span className="font-medium text-foreground">System Health Metrics</span>
            </div>
            <div className="text-sm text-muted-foreground font-body">
              CPU/memory/disk monitoring with custom thresholds for trading infrastructure
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity size={16} className="text-purple-600" />
              <span className="font-medium text-foreground">API Response Time Tracking</span>
            </div>
            <div className="text-sm text-muted-foreground font-body">
              Configurable collection intervals and retention policies for all API endpoints
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}