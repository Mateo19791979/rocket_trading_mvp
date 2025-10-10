import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  Target,
  Activity,
  TrendingUp,
  Zap,
  Settings,
  Edit
} from 'lucide-react';

export default function AlertRulesManagementPanel({ 
  alertRules, 
  onUpdateRule 
}) {
  const [selectedRule, setSelectedRule] = useState(null);
  const [editingThreshold, setEditingThreshold] = useState(null);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle size={16} className="text-red-600" />;
      case 'warning': return <Shield size={16} className="text-orange-600" />;
      case 'info': return <Activity size={16} className="text-blue-600" />;
      default: return <Target size={16} className="text-gray-600" />;
    }
  };

  const getEscalationLevel = (level) => {
    const levels = {
      1: { label: 'Level 1', color: 'bg-yellow-100 text-yellow-700' },
      2: { label: 'Level 2', color: 'bg-red-100 text-red-700' },
      3: { label: 'Level 3', color: 'bg-purple-100 text-purple-700' }
    };
    return levels?.[level] || levels?.[1];
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Alert Rules Management
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body">
          <Shield size={16} />
          <span>Prometheus Alerting</span>
        </div>
      </div>
      {/* Alert Rules List */}
      <div className="space-y-3">
        {alertRules?.map((rule) => (
          <div 
            key={rule?.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedRule?.id === rule?.id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => setSelectedRule(selectedRule?.id === rule?.id ? null : rule)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(rule?.severity)}
                <div>
                  <div className="font-semibold text-foreground font-heading">
                    {rule?.name}
                  </div>
                  <div className="text-sm text-muted-foreground font-body">
                    {rule?.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded border text-xs font-medium ${getSeverityColor(rule?.severity)}`}>
                  {rule?.severity}
                </span>
                
                <div className={`w-2 h-2 rounded-full ${
                  rule?.is_active ? 'bg-green-600' : 'bg-gray-400'
                }`} />
              </div>
            </div>

            {/* Expanded Details */}
            {selectedRule?.id === rule?.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="space-y-3">
                  {/* Condition & Threshold */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-foreground mb-2">Alert Condition:</div>
                    <code className="text-xs bg-white rounded p-2 block font-mono text-gray-800">
                      {rule?.condition}
                    </code>
                  </div>

                  {/* Configuration Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Threshold:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Target size={12} className="text-muted-foreground" />
                        <span className="text-muted-foreground font-mono">
                          {rule?.threshold}
                        </span>
                        {editingThreshold === rule?.id ? (
                          <input
                            type="text"
                            className="w-20 px-2 py-1 border rounded text-xs"
                            defaultValue={rule?.threshold}
                            onBlur={(e) => {
                              onUpdateRule(rule?.id, { threshold: e?.target?.value });
                              setEditingThreshold(null);
                            }}
                            onKeyPress={(e) => {
                              if (e?.key === 'Enter') {
                                onUpdateRule(rule?.id, { threshold: e?.target?.value });
                                setEditingThreshold(null);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={(e) => {
                              e?.stopPropagation();
                              setEditingThreshold(rule?.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit size={10} className="text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-foreground">Duration:</span>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-muted-foreground font-mono">
                          {rule?.duration}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-foreground">Escalation:</span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEscalationLevel(rule?.escalation_level)?.color}`}>
                          {getEscalationLevel(rule?.escalation_level)?.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-foreground">Status:</span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rule?.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule?.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onUpdateRule(rule?.id, { is_active: !rule?.is_active });
                      }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        rule?.is_active 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' :'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {rule?.is_active ? 'Disable' : 'Enable'}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        // In a real app, this would open a test modal
                        alert(`Testing alert rule: ${rule?.name}`);
                      }}
                      className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Test Alert
                    </button>

                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        // In a real app, this would open configuration modal
                        alert(`Configure rule: ${rule?.name}`);
                      }}
                      className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center space-x-1"
                    >
                      <Settings size={12} />
                      <span>Configure</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Alert Categories */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-4">
          Alert Categories
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle size={14} className="text-red-600" />
                <span className="font-medium text-foreground text-sm">High Latency Warnings</span>
              </div>
              <div className="text-xs text-muted-foreground font-body">
                P95/P99 latency thresholds with escalation procedures
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp size={14} className="text-orange-600" />
                <span className="font-medium text-foreground text-sm">Error Rate Thresholds</span>
              </div>
              <div className="text-xs text-muted-foreground font-body">
                HTTP 5xx error monitoring with severity classification
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Activity size={14} className="text-blue-600" />
                <span className="font-medium text-foreground text-sm">System Resource Alerts</span>
              </div>
              <div className="text-xs text-muted-foreground font-body">
                CPU, memory, disk monitoring with escalation rules
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Zap size={14} className="text-purple-600" />
                <span className="font-medium text-foreground text-sm">Trading System Anomalies</span>
              </div>
              <div className="text-xs text-muted-foreground font-body">
                Custom business logic alerts with notification templates
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}