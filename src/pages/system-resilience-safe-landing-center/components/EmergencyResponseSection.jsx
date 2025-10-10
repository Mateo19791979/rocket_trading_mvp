import React, { useState } from 'react';
import { AlertTriangle, Power, Database, Shield, FileX, RotateCcw, Clock, Users } from 'lucide-react';

const EmergencyResponseSection = () => {
  const [activeIncident, setActiveIncident] = useState(null);
  const [shutdownProgress, setShutdownProgress] = useState(0);
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  const shutdownProcedures = [
    { 
      id: 1, 
      name: 'Graceful Trading Halt', 
      description: 'Stop new orders, complete pending trades',
      estimatedTime: '30s',
      priority: 'high',
      status: 'ready'
    },
    { 
      id: 2, 
      name: 'Agent Standby Mode', 
      description: 'Pause AI agents, save current state',
      estimatedTime: '45s',
      priority: 'high',
      status: 'ready'
    },
    { 
      id: 3, 
      name: 'Data Preservation', 
      description: 'Backup critical data, sync databases',
      estimatedTime: '2m',
      priority: 'critical',
      status: 'ready'
    },
    { 
      id: 4, 
      name: 'Connection Cleanup', 
      description: 'Close WebSocket connections, clear caches',
      estimatedTime: '15s',
      priority: 'medium',
      status: 'ready'
    }
  ];

  const incidentTypes = [
    {
      id: 'system_overload',
      name: 'System Overload',
      severity: 'critical',
      description: 'CPU/Memory usage critical',
      actions: ['Scale resources', 'Load balancing', 'Circuit breaker'],
      escalation: 'Level 1 → Level 2 in 5 minutes'
    },
    {
      id: 'data_corruption',
      name: 'Data Corruption Detected',
      severity: 'critical',
      description: 'Database integrity compromised',
      actions: ['Stop writes', 'Restore backup', 'Validate data'],
      escalation: 'Immediate Level 3'
    },
    {
      id: 'security_breach',
      name: 'Security Breach',
      severity: 'critical',
      description: 'Unauthorized access detected',
      actions: ['Lockdown', 'Audit logs', 'Notify security team'],
      escalation: 'Immediate Level 4'
    },
    {
      id: 'market_anomaly',
      name: 'Market Anomaly',
      severity: 'high',
      description: 'Unusual market behavior detected',
      actions: ['Trading pause', 'Risk assessment', 'Manual review'],
      escalation: 'Level 2 in 10 minutes'
    }
  ];

  const initiateShutdown = () => {
    setIsShuttingDown(true);
    setShutdownProgress(0);
    
    // Simulate shutdown progress
    const interval = setInterval(() => {
      setShutdownProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsShuttingDown(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-400 bg-red-900/30 border-red-500',
      high: 'text-orange-400 bg-orange-900/30 border-orange-500',
      medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-500',
      low: 'text-green-400 bg-green-900/30 border-green-500'
    };
    return colors?.[severity] || colors?.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      critical: <AlertTriangle className="h-4 w-4 text-red-400" />,
      high: <AlertTriangle className="h-4 w-4 text-orange-400" />,
      medium: <Clock className="h-4 w-4 text-yellow-400" />
    };
    return icons?.[priority] || icons?.medium;
  };

  return (
    <div className="bg-gray-800 border border-orange-500 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <AlertTriangle className="text-orange-400 mr-3 h-6 w-6" />
        <h3 className="text-xl font-bold text-white">Emergency Response Center</h3>
      </div>
      {/* Cascading Shutdown Procedures */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center">
            <Power className="text-red-400 mr-2 h-5 w-5" />
            Cascading Shutdown Procedures
          </h4>
          <button
            onClick={initiateShutdown}
            disabled={isShuttingDown}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Power className="h-4 w-4 mr-2" />
            {isShuttingDown ? 'Shutting Down...' : 'Emergency Shutdown'}
          </button>
        </div>

        {isShuttingDown && (
          <div className="mb-4 bg-red-900/30 border border-red-500 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-red-300 font-medium">Shutdown in Progress</span>
              <span className="ml-auto text-red-300">{shutdownProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${shutdownProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {shutdownProcedures?.map((procedure) => (
            <div 
              key={procedure?.id}
              className={`p-4 rounded-lg border transition-all ${
                isShuttingDown 
                  ? 'bg-red-900/20 border-red-600' :'bg-gray-700 border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getPriorityIcon(procedure?.priority)}
                  <span className="text-white font-medium ml-2">{procedure?.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400">{procedure?.estimatedTime}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    procedure?.status === 'ready' ? 'bg-green-900/50 text-green-300' :
                    procedure?.status === 'running'? 'bg-blue-900/50 text-blue-300' : 'bg-gray-900/50 text-gray-300'
                  }`}>
                    {procedure?.status}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{procedure?.description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Incident Management */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Shield className="text-blue-400 mr-2 h-5 w-5" />
          Incident Management & Escalation
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidentTypes?.map((incident) => (
            <div 
              key={incident?.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                activeIncident === incident?.id 
                  ? getSeverityColor(incident?.severity)
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setActiveIncident(incident?.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{incident?.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  incident?.severity === 'critical' ? 'bg-red-900/50 text-red-300' :
                  incident?.severity === 'high'? 'bg-orange-900/50 text-orange-300' : 'bg-yellow-900/50 text-yellow-300'
                }`}>
                  {incident?.severity}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-3">{incident?.description}</p>
              
              <div className="text-xs text-gray-400 mb-2">
                Actions: {incident?.actions?.join(' → ')}
              </div>
              
              <div className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                Escalation: {incident?.escalation}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Data Preservation */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Database className="text-green-400 mr-2 h-5 w-5" />
          Data Preservation & Recovery
        </h4>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <FileX className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-medium">Backup Status</div>
            <div className="text-green-400">Ready</div>
          </div>
          <div className="text-center">
            <RotateCcw className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-white font-medium">Recovery Time</div>
            <div className="text-gray-300">~2 minutes</div>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-white font-medium">Response Team</div>
            <div className="text-green-400">On Standby</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyResponseSection;