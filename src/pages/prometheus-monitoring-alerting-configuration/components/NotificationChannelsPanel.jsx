import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Webhook, 
  Settings, 
  TestTube,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function NotificationChannelsPanel({ 
  notificationChannels, 
  onUpdateChannel,
  onTestChannel 
}) {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [testingChannel, setTestingChannel] = useState(null);

  const getChannelIcon = (type) => {
    switch (type) {
      case 'email': return <Mail size={16} className="text-blue-600" />;
      case 'slack': return <MessageSquare size={16} className="text-green-600" />;
      case 'webhook': return <Webhook size={16} className="text-purple-600" />;
      default: return <Bell size={16} className="text-gray-600" />;
    }
  };

  const getChannelTypeColor = (type) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-700';
      case 'slack': return 'bg-green-100 text-green-700';
      case 'webhook': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityFilterBadges = (severityFilter) => {
    return severityFilter?.map(severity => (
      <span 
        key={severity}
        className={`px-2 py-1 rounded text-xs font-medium ${
          severity === 'critical' ? 'bg-red-100 text-red-700' :
          severity === 'warning'? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
        }`}
      >
        {severity}
      </span>
    ));
  };

  const handleTestChannel = async (channelId) => {
    setTestingChannel(channelId);
    try {
      await onTestChannel(channelId);
      // Success feedback handled by parent component
    } catch (err) {
      // Error handling in parent
    } finally {
      setTimeout(() => setTestingChannel(null), 2000);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-trading">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-heading">
          Notification Channels
        </h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body">
          <Bell size={16} />
          <span>Alerting Routes</span>
        </div>
      </div>
      {/* Notification Channels List */}
      <div className="space-y-3">
        {notificationChannels?.map((channel) => (
          <div 
            key={channel?.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedChannel?.id === channel?.id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => setSelectedChannel(selectedChannel?.id === channel?.id ? null : channel)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getChannelIcon(channel?.type)}
                <div>
                  <div className="font-semibold text-foreground font-heading">
                    {channel?.name}
                  </div>
                  <div className="text-sm text-muted-foreground font-body">
                    {channel?.type?.charAt(0)?.toUpperCase() + channel?.type?.slice(1)} notifications
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getChannelTypeColor(channel?.type)}`}>
                  {channel?.type}
                </span>
                
                <div className={`w-2 h-2 rounded-full ${
                  channel?.is_active ? 'bg-green-600' : 'bg-gray-400'
                }`} />
              </div>
            </div>

            {/* Severity Filter Badges */}
            {channel?.severity_filter && channel?.severity_filter?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {getSeverityFilterBadges(channel?.severity_filter)}
              </div>
            )}

            {/* Expanded Details */}
            {selectedChannel?.id === channel?.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="space-y-3">
                  {/* Configuration Details */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-foreground mb-2">Configuration:</div>
                    <div className="space-y-1 text-xs">
                      {channel?.type === 'email' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SMTP Server:</span>
                            <span className="font-mono">{channel?.config?.smtp_server}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-mono">{channel?.config?.from_address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Recipients:</span>
                            <span className="font-mono">{channel?.config?.to_addresses?.length} addresses</span>
                          </div>
                        </>
                      )}
                      
                      {channel?.type === 'slack' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Channel:</span>
                            <span className="font-mono">{channel?.config?.channel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Username:</span>
                            <span className="font-mono">{channel?.config?.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Webhook:</span>
                            <span className="font-mono">Configured ✓</span>
                          </div>
                        </>
                      )}

                      {channel?.type === 'webhook' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Method:</span>
                            <span className="font-mono">{channel?.config?.method}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Timeout:</span>
                            <span className="font-mono">{channel?.config?.timeout}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Auth:</span>
                            <span className="font-mono">Bearer Token ✓</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Alert Routing Rules */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-foreground mb-2">Routing Rules:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Severity Filter:</span>
                        <div className="space-x-1">
                          {getSeverityFilterBadges(channel?.severity_filter)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Type:</span>
                        <span className="font-mono">All Services</span>
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        onUpdateChannel(channel?.id, { is_active: !channel?.is_active });
                      }}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        channel?.is_active 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' :'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {channel?.is_active ? 'Disable' : 'Enable'}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleTestChannel(channel?.id);
                      }}
                      disabled={testingChannel === channel?.id}
                      className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 flex items-center space-x-1"
                    >
                      {testingChannel === channel?.id ? (
                        <>
                          <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <TestTube size={12} />
                          <span>Test</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        alert(`Configure channel: ${channel?.name}`);
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
      {/* Notification Templates */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground font-heading mb-4">
          Message Templates
        </h3>
        
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="font-medium text-foreground text-sm">Critical Alert Template</span>
            </div>
            <div className="text-xs text-muted-foreground font-body bg-white rounded p-2 font-mono">
              🚨 CRITICAL: {`{{alertname}}`} - {`{{description}}`}<br/>
              Threshold: {`{{threshold}}`} | Current: {`{{current_value}}`}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap size={14} className="text-orange-600" />
              <span className="font-medium text-foreground text-sm">Warning Alert Template</span>
            </div>
            <div className="text-xs text-muted-foreground font-body bg-white rounded p-2 font-mono">
              ⚠️ Warning: {`{{alertname}}`} on {`{{instance}}`}<br/>
              Details: {`{{description}}`}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle size={14} className="text-green-600" />
              <span className="font-medium text-foreground text-sm">Resolution Template</span>
            </div>
            <div className="text-xs text-muted-foreground font-body bg-white rounded p-2 font-mono">
              ✅ Resolved: {`{{alertname}}`} is back to normal<br/>
              Duration: {`{{duration}}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}