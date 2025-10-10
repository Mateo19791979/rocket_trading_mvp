import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Settings, CheckCircle, Clock, DollarSign, Database } from 'lucide-react';


export default function AutomatedAlerts() {
  const [alertConfig, setAlertConfig] = useState({
    dhi_threshold: 0.7,
    iqs_threshold: 0.75,
    source_failure_rate: 0.3,
    tge_funding_minimum: 1000000,
    enable_email: true,
    enable_slack: false,
    enable_webhook: false
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateMockRecentAlerts();
  }, []);

  const generateMockRecentAlerts = () => {
    const mockAlerts = [
      {
        id: 1,
        type: 'DHI_LOW',
        title: 'Data Health Index Below Threshold',
        message: 'Stream data.news.crypto.feed has DHI of 0.65 (threshold: 0.70)',
        severity: 'high',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)?.toISOString(),
        status: 'active',
        source: 'data.news.crypto.feed'
      },
      {
        id: 2,
        type: 'SOURCE_FAILURE',
        title: 'Source Reliability Alert',
        message: 'cryptorank.io failure rate increased to 35% (threshold: 30%)',
        severity: 'medium',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)?.toISOString(),
        status: 'investigating',
        source: 'cryptorank.io'
      },
      {
        id: 3,
        type: 'TGE_OPPORTUNITY',
        title: 'High-Value TGE Event Detected',
        message: 'New TGE: DeFi Protocol Alpha with $5M funding goal',
        severity: 'low',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)?.toISOString(),
        status: 'resolved',
        source: 'icoanalytics.com'
      },
      {
        id: 4,
        type: 'IQS_LOW',
        title: 'Low IQS Score Alert',
        message: 'Insight eth_momentum_001 scored 0.72 (threshold: 0.75)',
        severity: 'low',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)?.toISOString(),
        status: 'resolved',
        source: 'strategy_weaver'
      }
    ];
    setRecentAlerts(mockAlerts);
  };

  const handleConfigUpdate = async (key, value) => {
    setAlertConfig(prev => ({ ...prev, [key]: value }));
  };

  const testAlert = async (alertType) => {
    setLoading(true);
    try {
      // Simulate API call to test alert system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const testAlert = {
        id: Date.now(),
        type: alertType,
        title: `Test Alert: ${alertType}`,
        message: `This is a test alert to verify the ${alertType} notification system is working.`,
        severity: 'low',
        timestamp: new Date()?.toISOString(),
        status: 'active',
        source: 'test_system'
      };
      
      setRecentAlerts(prev => [testAlert, ...prev]);
      alert(`Test ${alertType} alert sent successfully!`);
    } catch (error) {
      alert(`Failed to send test alert: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-900/30 border-red-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-400/30';
      case 'low':
        return 'text-blue-400 bg-blue-900/30 border-blue-400/30';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-400/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-red-400';
      case 'investigating':
        return 'text-yellow-400';
      case 'resolved':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return AlertTriangle;
      case 'investigating':
        return Clock;
      case 'resolved':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return date?.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Configuration */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 text-purple-400 mr-2" />
          Alert Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Threshold Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                DHI Alert Threshold ({alertConfig?.dhi_threshold})
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={alertConfig?.dhi_threshold}
                onChange={(e) => handleConfigUpdate('dhi_threshold', parseFloat(e?.target?.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                Alert when DHI falls below this value
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                IQS Alert Threshold ({alertConfig?.iqs_threshold})
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={alertConfig?.iqs_threshold}
                onChange={(e) => handleConfigUpdate('iqs_threshold', parseFloat(e?.target?.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                Alert when IQS falls below this value
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source Failure Rate ({(alertConfig?.source_failure_rate * 100)?.toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={alertConfig?.source_failure_rate}
                onChange={(e) => handleConfigUpdate('source_failure_rate', parseFloat(e?.target?.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-400 mt-1">
                Alert when source failure rate exceeds this percentage
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum TGE Funding Alert ($)
              </label>
              <input
                type="number"
                value={alertConfig?.tge_funding_minimum}
                onChange={(e) => handleConfigUpdate('tge_funding_minimum', parseInt(e?.target?.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                min="100000"
                step="100000"
              />
              <div className="text-xs text-gray-400 mt-1">
                Alert for TGE opportunities above this funding level
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-medium">Notification Channels</h4>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={alertConfig?.enable_email}
                  onChange={(e) => handleConfigUpdate('enable_email', e?.target?.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Email Notifications</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={alertConfig?.enable_slack}
                  onChange={(e) => handleConfigUpdate('enable_slack', e?.target?.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Slack Integration</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={alertConfig?.enable_webhook}
                  onChange={(e) => handleConfigUpdate('enable_webhook', e?.target?.checked)}
                  className="mr-3"
                />
                <span className="text-gray-300">Webhook Notifications</span>
              </label>
            </div>

            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Test Alerts</h4>
              <div className="space-y-2">
                <button
                  onClick={() => testAlert('DHI_LOW')}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  Test DHI Alert
                </button>
                <button
                  onClick={() => testAlert('SOURCE_FAILURE')}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  Test Source Alert
                </button>
                <button
                  onClick={() => testAlert('TGE_OPPORTUNITY')}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  Test TGE Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">
            {recentAlerts?.filter(a => a?.status === 'active')?.length}
          </div>
          <div className="text-sm text-gray-300">Active Alerts</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">
            {recentAlerts?.filter(a => a?.status === 'investigating')?.length}
          </div>
          <div className="text-sm text-gray-300">Investigating</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {recentAlerts?.filter(a => a?.status === 'resolved')?.length}
          </div>
          <div className="text-sm text-gray-300">Resolved</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">
            {recentAlerts?.length}
          </div>
          <div className="text-sm text-gray-300">Total Alerts</div>
        </div>
      </div>
      {/* Recent Alerts */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 text-teal-400 mr-2" />
          Recent Alerts
        </h3>

        {recentAlerts?.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No recent alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts?.map((alert) => {
              const StatusIcon = getStatusIcon(alert?.status);
              return (
                <div key={alert?.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${getStatusColor(alert?.status)}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="text-white font-medium">{alert?.title}</h4>
                          <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getSeverityColor(alert?.severity)}`}>
                            {alert?.severity}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{alert?.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>Source: {alert?.source}</span>
                          <span>•</span>
                          <span>{formatTimestamp(alert?.timestamp)}</span>
                          <span>•</span>
                          <span className={getStatusColor(alert?.status)}>
                            {alert?.status?.charAt(0)?.toUpperCase() + alert?.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Alert Rules Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
          Active Alert Rules
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded p-4">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <Database className="w-4 h-4 mr-2 text-orange-400" />
              Data Health Monitoring
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• DHI threshold: {alertConfig?.dhi_threshold}</li>
              <li>• Check frequency: Every 5 minutes</li>
              <li>• Escalation: After 2 consecutive failures</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded p-4">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <Bell className="w-4 h-4 mr-2 text-orange-400" />
              Source Performance
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Failure rate: {(alertConfig?.source_failure_rate * 100)?.toFixed(0)}%</li>
              <li>• Evaluation window: Last 24 hours</li>
              <li>• Min samples: 10 attempts</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded p-4">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-orange-400" />
              TGE Opportunities
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Min funding: ${alertConfig?.tge_funding_minimum?.toLocaleString()}</li>
              <li>• Check frequency: Every 15 minutes</li>
              <li>• Auto-analysis: Enabled</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded p-4">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-orange-400" />
              Intelligence Quality
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• IQS threshold: {alertConfig?.iqs_threshold}</li>
              <li>• Review period: Real-time</li>
              <li>• Auto-flagging: Low quality insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}