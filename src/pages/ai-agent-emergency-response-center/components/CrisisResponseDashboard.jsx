import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle, Play, Pause, RotateCcw, FileText, Users } from 'lucide-react';
import { aiAgentsService } from '../../../services/aiAgentsService';

export default function CrisisResponseDashboard({ selectedIncident, onIncidentResponse, systemOverview }) {
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [responseProtocols, setResponseProtocols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  useEffect(() => {
    if (selectedIncident) {
      generateResponseProtocols(selectedIncident);
    }
  }, [selectedIncident]);

  const generateResponseProtocols = (incident) => {
    const protocols = [];

    switch (incident?.type) {
      case 'anomaly':
        protocols?.push(
          {
            id: 'isolate-agent',
            title: 'Isolate Affected Agent',
            description: 'Stop the malfunctioning agent to prevent cascade failures',
            priority: 'critical',
            estimatedTime: '30 seconds',
            automated: true,
            steps: [
              'Identify affected agent from anomaly data',
              'Suspend agent communication',
              'Stop agent trading activities',
              'Log isolation event'
            ]
          },
          {
            id: 'data-validation',
            title: 'Data Validation Check',
            description: 'Verify data quality and sources',
            priority: 'high',
            estimatedTime: '2 minutes',
            automated: false,
            steps: [
              'Check data source integrity',
              'Validate recent data points',
              'Compare with backup sources',
              'Generate data quality report'
            ]
          }
        );
        break;

      case 'alert':
        protocols?.push(
          {
            id: 'escalate-notification',
            title: 'Escalate Alert',
            description: 'Notify emergency response team',
            priority: 'high',
            estimatedTime: '1 minute',
            automated: true,
            steps: [
              'Send notifications to on-call team',
              'Create incident ticket',
              'Log alert escalation',
              'Start incident timeline'
            ]
          }
        );
        break;

      case 'risk_event':
        protocols?.push(
          {
            id: 'risk-mitigation',
            title: 'Risk Mitigation',
            description: 'Apply risk controls and position limits',
            priority: 'critical',
            estimatedTime: '45 seconds',
            automated: true,
            steps: [
              'Evaluate current risk exposure',
              'Apply emergency position limits',
              'Halt high-risk strategies',
              'Notify risk management'
            ]
          }
        );
        break;

      default:
        protocols?.push(
          {
            id: 'general-response',
            title: 'General Incident Response',
            description: 'Standard incident management procedure',
            priority: 'medium',
            estimatedTime: '5 minutes',
            automated: false,
            steps: [
              'Assess incident severity',
              'Gather relevant information',
              'Determine appropriate response',
              'Execute response plan'
            ]
          }
        );
    }

    setResponseProtocols(protocols);
    setSelectedProtocol(protocols?.[0] || null);
  };

  const executeProtocol = async (protocol) => {
    setLoading(true);
    try {
      console.log(`Executing protocol: ${protocol?.title}`);
      
      // Simulate protocol execution
      for (let i = 0; i < protocol?.steps?.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Step ${i + 1}: ${protocol?.steps?.[i]}`);
      }

      await onIncidentResponse?.(selectedIncident?.id, protocol?.id);
      
      await aiAgentsService?.sendLocalNotification(
        '✅ Response Protocol Executed',
        `${protocol?.title} completed successfully`,
        { tag: 'incident-response' }
      );
    } catch (error) {
      console.error('Protocol execution failed:', error);
      await aiAgentsService?.sendLocalNotification(
        '❌ Protocol Failed',
        `${protocol?.title} execution failed`,
        { tag: 'incident-response-error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-600';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-600';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
      case 'low': return 'text-blue-400 bg-blue-900/30 border-blue-600';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 border border-yellow-600 rounded-lg overflow-hidden">
      <div className="bg-yellow-900/30 px-6 py-4 border-b border-yellow-700">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Crisis Response Dashboard</h2>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {selectedIncident ? (
          <>
            {/* Selected Incident Details */}
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {selectedIncident?.title || selectedIncident?.description || 'Active Incident'}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                    <span>Type: {selectedIncident?.type?.replace('_', ' ')}</span>
                    <span>Severity: {selectedIncident?.alert_severity || selectedIncident?.severity}</span>
                    <span>
                      {selectedIncident?.created_at && (
                        <>Started: {new Date(selectedIncident?.created_at)?.toLocaleTimeString()}</>
                      )}
                    </span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedIncident?.alert_severity || selectedIncident?.severity)}`}>
                  {(selectedIncident?.alert_severity || selectedIncident?.severity || 'medium')?.toUpperCase()}
                </div>
              </div>

              {selectedIncident?.message && (
                <p className="text-gray-300 mb-4">{selectedIncident?.message}</p>
              )}

              {/* Incident Timeline */}
              <div className="bg-gray-800/50 rounded-lg p-3">
                <h4 className="text-white font-medium mb-3">Incident Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">
                      Incident detected - {new Date(selectedIncident?.created_at || selectedIncident?.detected_at)?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-300">Response protocols generated</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-400">Awaiting response execution...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Protocols */}
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-4">Available Response Protocols</h3>
              
              <div className="grid gap-4">
                {responseProtocols?.map((protocol) => (
                  <div
                    key={protocol?.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedProtocol?.id === protocol?.id
                        ? 'border-blue-500 bg-blue-900/30' :'border-gray-600 bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium">{protocol?.title}</h4>
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(protocol?.priority)}`}>
                              {protocol?.priority}
                            </div>
                            {protocol?.automated && (
                              <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs font-medium">
                                Automated
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">{protocol?.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{protocol?.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-3 w-3" />
                            <span>{protocol?.steps?.length} steps</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          executeProtocol(protocol);
                        }}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        {loading ? 'Executing...' : 'Execute'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Details */}
            {selectedProtocol && (
              <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Protocol Steps: {selectedProtocol?.title}</h4>
                <div className="space-y-2">
                  {selectedProtocol?.steps?.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-300 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // No incident selected
          (<div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Active Incident Selected</h3>
            <p className="text-gray-400">
              Select an incident from the detection panel to view response options
            </p>
            {/* System Status Overview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">System Health</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {systemOverview?.systemHealth?.overall || 'Unknown'}
                </div>
                <div className="text-green-300 text-sm">All systems operational</div>
              </div>

              <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">Active Agents</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {systemOverview?.agents?.active || 0}/{systemOverview?.agents?.total || 0}
                </div>
                <div className="text-blue-300 text-sm">Agents running</div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Recent Events</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {systemOverview?.events?.recent || 0}
                </div>
                <div className="text-yellow-300 text-sm">Last 5 minutes</div>
              </div>
            </div>
          </div>)
        )}

        {/* Manual Intervention Options */}
        <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4">
          <h3 className="text-orange-400 font-semibold mb-4">Manual Intervention Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="flex items-center space-x-2 bg-red-700/30 hover:bg-red-700/50 border border-red-600 rounded-lg p-3 transition-colors">
              <Pause className="h-4 w-4" />
              <span className="text-white text-sm">Pause Trading</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-yellow-700/30 hover:bg-yellow-700/50 border border-yellow-600 rounded-lg p-3 transition-colors">
              <RotateCcw className="h-4 w-4" />
              <span className="text-white text-sm">Restart Agent</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-green-700/30 hover:bg-green-700/50 border border-green-600 rounded-lg p-3 transition-colors">
              <Play className="h-4 w-4" />
              <span className="text-white text-sm">Resume Operations</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}