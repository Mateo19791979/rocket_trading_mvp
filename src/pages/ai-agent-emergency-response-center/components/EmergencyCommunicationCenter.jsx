import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Phone, Users, Send, Download, AlertCircle, Clock } from 'lucide-react';
import { aiAgentsService } from '../../../services/aiAgentsService';

export default function EmergencyCommunicationCenter({ emergencyLevel, activeIncidents = [] }) {
  const [notifications, setNotifications] = useState([]);
  const [communicationLog, setCommunicationLog] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState({
    emergency_team: true,
    management: false,
    stakeholders: false,
    technical_team: true
  });

  useEffect(() => {
    generateEmergencyTemplates();
    loadCommunicationHistory();
    
    // Request notification permissions on mount
    aiAgentsService?.requestNotificationPermission();
  }, [emergencyLevel]);

  const emergencyTemplates = {
    system_failure: {
      subject: '🚨 CRITICAL: AI Trading System Failure',
      body: `EMERGENCY ALERT: Critical system failure detected in AI trading platform.

Status: ${emergencyLevel?.toUpperCase()} EMERGENCY
Time: ${new Date()?.toLocaleString()}
Active Incidents: ${activeIncidents?.length}

Immediate Actions Required:
- Emergency response team activated
- Trading operations suspended
- Investigation in progress

This is an automated emergency notification. Response team has been notified.

--
AI Agent Emergency Response Center`
    },
    agent_malfunction: {
      subject: '⚠️ ALERT: AI Agent Malfunction Detected',
      body: `Multiple AI agents showing erratic behavior patterns.

Emergency Level: ${emergencyLevel?.toUpperCase()}
Affected Agents: Multiple
Impact: Trading operations may be affected

Automated Response:
- Affected agents isolated
- Backup systems activated
- Monitoring increased

Updates will be provided as situation develops.

--
AI Agent Emergency Response Center`
    },
    data_corruption: {
      subject: '🔴 URGENT: Data Integrity Compromise',
      body: `Data corruption detected in trading system.

Severity: ${emergencyLevel?.toUpperCase()}
Impact: Data feeds and decision making affected
Status: Emergency protocols activated

Response Actions:
- Data sources validated
- Backup systems engaged  
- Recovery procedures initiated

Technical team investigating root cause.

--
AI Agent Emergency Response Center`
    },
    recovery_status: {
      subject: '✅ UPDATE: System Recovery Status',
      body: `System recovery operations update.

Current Status: Recovery in progress
Emergency Level: ${emergencyLevel?.toUpperCase()}
Recovery Progress: Ongoing

Actions Completed:
- System state backed up
- Recovery protocols executed
- Health monitoring restored

Estimated recovery time: 15-30 minutes

--
AI Agent Emergency Response Center`
    }
  };

  const contactGroups = {
    emergency_team: {
      name: 'Emergency Response Team',
      members: ['emergency-lead@company.com', 'ops-manager@company.com'],
      channels: ['email', 'sms', 'phone']
    },
    management: {
      name: 'Senior Management',
      members: ['ceo@company.com', 'cto@company.com', 'head-trading@company.com'],
      channels: ['email', 'phone']
    },
    stakeholders: {
      name: 'Key Stakeholders',
      members: ['board@company.com', 'investors@company.com'],
      channels: ['email']
    },
    technical_team: {
      name: 'Technical Team',
      members: ['devops@company.com', 'platform-team@company.com'],
      channels: ['email', 'slack', 'pager']
    }
  };

  const generateEmergencyTemplates = () => {
    // Templates are predefined above
    if (!selectedTemplate) {
      setSelectedTemplate('system_failure');
      setCustomMessage(emergencyTemplates?.system_failure?.body);
    }
  };

  const loadCommunicationHistory = () => {
    // Simulate communication history
    const history = [
      {
        id: 1,
        type: 'notification',
        recipient: 'Emergency Team',
        subject: 'System monitoring alert',
        timestamp: new Date(Date.now() - 300000)?.toISOString(),
        status: 'delivered',
        channel: 'email'
      },
      {
        id: 2,
        type: 'escalation',
        recipient: 'Management',
        subject: 'Incident escalation required',
        timestamp: new Date(Date.now() - 180000)?.toISOString(),
        status: 'pending',
        channel: 'phone'
      }
    ];
    
    setCommunicationLog(history);
  };

  const sendNotification = async () => {
    const selectedGroups = Object.keys(recipients)?.filter(key => recipients?.[key]);
    const template = emergencyTemplates?.[selectedTemplate];
    
    if (!template || selectedGroups?.length === 0) {
      return;
    }

    try {
      // Send browser notification
      await aiAgentsService?.sendLocalNotification(
        template?.subject,
        customMessage?.slice(0, 100) + '...',
        { 
          tag: 'emergency-notification',
          requireInteraction: true,
          actions: [
            { action: 'acknowledge', title: 'Acknowledge' },
            { action: 'escalate', title: 'Escalate' }
          ]
        }
      );

      // Log the communication
      const newNotification = {
        id: Date.now(),
        type: 'emergency_notification',
        recipients: selectedGroups?.map(group => contactGroups?.[group]?.name)?.join(', '),
        subject: template?.subject,
        timestamp: new Date()?.toISOString(),
        status: 'sent',
        channel: 'multi-channel'
      };

      setCommunicationLog(prev => [newNotification, ...prev]);
      setNotifications(prev => [...prev, newNotification]);

      // Reset form
      setCustomMessage(template?.body);

    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const generateIncidentReport = () => {
    const report = {
      timestamp: new Date()?.toISOString(),
      emergencyLevel: emergencyLevel,
      activeIncidents: activeIncidents?.length,
      systemStatus: 'Emergency Response Active',
      incidentDetails: activeIncidents?.map(incident => ({
        type: incident?.type,
        severity: incident?.severity || incident?.alert_severity,
        description: incident?.description || incident?.title,
        timestamp: incident?.created_at || incident?.detected_at
      }))
    };

    // Create downloadable report
    const reportContent = JSON.stringify(report, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-report-${new Date()?.toISOString()?.slice(0, 19)?.replace(/:/g, '-')}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-400';
      case 'sent': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-gray-800 border border-blue-600 rounded-lg overflow-hidden">
      <div className="bg-blue-900/30 px-6 py-4 border-b border-blue-700">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Emergency Communication Center</h2>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Automated Notification System */}
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-4">Send Emergency Notification</h3>
          
          {/* Template Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Notification Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e?.target?.value);
                setCustomMessage(emergencyTemplates?.[e?.target?.value]?.body || '');
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="system_failure">System Failure</option>
              <option value="agent_malfunction">Agent Malfunction</option>
              <option value="data_corruption">Data Corruption</option>
              <option value="recovery_status">Recovery Status</option>
            </select>
          </div>

          {/* Recipient Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Recipients</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(contactGroups)?.map(([key, group]) => (
                <label key={key} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={recipients?.[key] || false}
                    onChange={(e) => setRecipients(prev => ({
                      ...prev,
                      [key]: e?.target?.checked
                    }))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{group?.name}</span>
                  <span className="text-xs text-gray-500">({group?.members?.length})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Message Content</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e?.target?.value)}
              rows={8}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter emergency message..."
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={generateIncidentReport}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
            
            <button
              onClick={sendNotification}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>Send Notification</span>
            </button>
          </div>
        </div>

        {/* Communication History */}
        <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
          <h3 className="text-gray-300 font-semibold mb-4">Communication Log</h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {communicationLog?.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No communications sent yet
              </div>
            ) : (
              communicationLog?.map((log) => (
                <div key={log?.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex items-center space-x-1">
                          {log?.channel === 'email' && <Mail className="h-4 w-4 text-blue-400" />}
                          {log?.channel === 'phone' && <Phone className="h-4 w-4 text-green-400" />}
                          {log?.channel === 'multi-channel' && <MessageSquare className="h-4 w-4 text-purple-400" />}
                        </div>
                        <span className="text-white font-medium text-sm">{log?.subject}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        To: {log?.recipients || log?.recipient} • {formatTimeAgo(log?.timestamp)}
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${getStatusColor(log?.status)}`}>
                      {log?.status?.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contact Management */}
        <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
          <h3 className="text-gray-300 font-semibold mb-4">Emergency Contacts</h3>
          
          <div className="grid gap-3">
            {Object.entries(contactGroups)?.map(([key, group]) => (
              <div key={key} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-white font-medium">{group?.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{group?.members?.length} members</span>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span>Channels:</span>
                  {group?.channels?.map((channel, index) => (
                    <span key={channel} className="text-blue-400">
                      {channel}{index < group?.channels?.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escalation Procedures */}
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="text-red-400 font-semibold">Escalation Procedures</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span>Level 1: Immediate team notification (0-5 minutes)</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="h-4 w-4 text-orange-400" />
              <span>Level 2: Management escalation (5-15 minutes)</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="h-4 w-4 text-red-400" />
              <span>Level 3: Stakeholder notification (15+ minutes)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}