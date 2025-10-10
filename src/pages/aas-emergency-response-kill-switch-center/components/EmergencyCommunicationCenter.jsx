import { useState } from 'react';
import { MessageCircle, Bell, Users, Copy, Send, Phone } from 'lucide-react';

export default function EmergencyCommunicationCenter({ actionLog = [], activeIncidents = [] }) {
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    slack: true,
    discord: false
  });
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'System Admin', role: 'Technical Lead', contact: 'admin@company.com', priority: 'high' },
    { name: 'Trading Manager', role: 'Operations', contact: '+1-555-0123', priority: 'high' },
    { name: 'Risk Officer', role: 'Risk Management', contact: 'risk@company.com', priority: 'medium' },
    { name: 'Compliance Team', role: 'Legal/Compliance', contact: 'compliance@company.com', priority: 'low' }
  ]);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  const getActionStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getActionIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const generateIncidentReport = () => {
    const criticalIncidents = activeIncidents?.filter(i => i?.severity === 'critical') || [];
    const activeCount = activeIncidents?.filter(i => i?.status === 'active')?.length || 0;
    
    const report = `🚨 EMERGENCY SYSTEM STATUS REPORT
    
Generated: ${new Date()?.toLocaleString()}
    
CRITICAL ALERTS:
${criticalIncidents?.length === 0 ? '• No critical incidents' : criticalIncidents?.map(i => `• ${i?.incident_type}: ${i?.description}`)?.join('\n')}

ACTIVE INCIDENTS: ${activeCount}

RECENT ACTIONS:
${actionLog?.slice(0, 5)?.map(action => 
  `• ${getActionIcon(action?.status)} ${action?.action} (${new Date(action?.timestamp)?.toLocaleTimeString()})`
)?.join('\n')}

This is an automated alert from the AAS Emergency Response System.
Please respond immediately if critical incidents are present.`;
    
    return report;
  };

  const handleCopyReport = async () => {
    const report = generateIncidentReport();
    try {
      await navigator?.clipboard?.writeText(report);
    } catch (error) {
      console.error('Failed to copy report:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!messageTemplate?.trim() || selectedContacts?.length === 0) return;
    
    // In a real implementation, this would send actual notifications
    console.log('Sending notifications to:', selectedContacts);
    console.log('Message:', messageTemplate);
    
    // Simulate notification sending
    setTimeout(() => {
      setMessageTemplate('');
      setSelectedContacts([]);
    }, 1000);
  };

  const recentActions = actionLog?.slice(0, 10) || [];

  return (
    <div className="bg-gray-800 rounded-xl border border-purple-600 shadow-2xl">
      <div className="p-6 border-b border-purple-600">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-purple-100">Emergency Communication Center</h2>
            <p className="text-purple-300 text-sm">Incident reporting and stakeholder notifications</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Action Log Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Actions</h3>
            <div className="text-sm text-gray-400">
              Last {recentActions?.length} actions
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto">
            {recentActions?.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div>No recent actions</div>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActions?.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-2 rounded bg-gray-800 text-sm"
                  >
                    <div className="text-lg">{getActionIcon(action?.status)}</div>
                    <div className="flex-1">
                      <div className={`font-medium ${getActionStatusColor(action?.status)}`}>
                        {action?.action}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(action?.timestamp)?.toLocaleString()}
                      </div>
                      {action?.details && (
                        <div className="text-gray-500 text-xs mt-1">
                          {action?.details}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Emergency Contacts</h3>
          <div className="space-y-2">
            {emergencyContacts?.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedContacts?.includes(contact?.contact)}
                    onChange={(e) => {
                      if (e?.target?.checked) {
                        setSelectedContacts(prev => [...prev, contact?.contact]);
                      } else {
                        setSelectedContacts(prev => prev?.filter(c => c !== contact?.contact));
                      }
                    }}
                    className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                  />
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-white">{contact?.name}</div>
                    <div className="text-gray-400 text-sm">{contact?.role}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded text-white ${getPriorityColor(contact?.priority)}`}>
                    {contact?.priority?.toUpperCase()}
                  </span>
                  <div className="text-gray-400 text-sm">{contact?.contact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Report Generation */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Incident Reporting</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium text-white">Emergency Status Report</div>
              <button
                onClick={handleCopyReport}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <Copy className="h-3 w-3" />
                <span>Copy Report</span>
              </button>
            </div>
            
            <div className="text-gray-300 text-sm">
              <div>• Active Incidents: {activeIncidents?.length}</div>
              <div>• Critical Level: {activeIncidents?.filter(i => i?.severity === 'critical')?.length}</div>
              <div>• Recent Actions: {recentActions?.length}</div>
              <div>• Generated: {new Date()?.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Custom Message Composer */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Send Custom Alert</h3>
          <div className="space-y-3">
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e?.target?.value)}
              placeholder="Compose emergency notification message..."
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none h-24 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {selectedContacts?.length} contacts selected
              </div>
              <button
                onClick={handleSendNotification}
                disabled={!messageTemplate?.trim() || selectedContacts?.length === 0}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Alert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Notification Channels</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object?.entries(notificationSettings)?.map(([channel, enabled]) => (
              <label
                key={channel}
                className="flex items-center space-x-2 p-2 bg-gray-700 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    [channel]: e?.target?.checked
                  }))}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <Bell className="h-4 w-4 text-gray-400" />
                <span className="text-white capitalize">{channel}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Emergency Escalation */}
        <div className="p-4 bg-red-900 rounded-lg border border-red-600">
          <h4 className="text-red-100 font-semibold mb-2">🚨 Emergency Escalation</h4>
          <div className="text-red-300 text-sm mb-3">
            For immediate assistance with critical incidents
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors text-sm flex items-center justify-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Call Emergency Hotline</span>
            </button>
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors text-sm">
              📧 Send Critical Alert to All Stakeholders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}