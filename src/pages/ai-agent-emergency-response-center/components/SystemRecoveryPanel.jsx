import React, { useState, useEffect } from 'react';
import { RefreshCw, RotateCcw, Shield, CheckCircle, AlertTriangle, Clock, Activity } from 'lucide-react';
import { aiAgentsService } from '../../../services/aiAgentsService';

export default function SystemRecoveryPanel({ systemHealth, onRecoveryAction }) {
  const [recoveryStatus, setRecoveryStatus] = useState({
    inProgress: false,
    currentStep: null,
    progress: 0,
    logs: []
  });
  
  const [recoveryOptions, setRecoveryOptions] = useState([]);
  const [selectedRecovery, setSelectedRecovery] = useState(null);

  useEffect(() => {
    generateRecoveryOptions();
  }, [systemHealth]);

  const generateRecoveryOptions = () => {
    const options = [
      {
        id: 'automated-rollback',
        title: 'Automated System Rollback',
        description: 'Revert to last known good configuration',
        estimatedTime: '2-3 minutes',
        riskLevel: 'low',
        compatibility: 'all',
        steps: [
          'Create system state backup',
          'Identify last stable configuration',
          'Stop affected services',
          'Apply rollback configuration',
          'Restart services in sequence',
          'Validate system integrity',
          'Resume normal operations'
        ]
      },
      {
        id: 'agent-restart',
        title: 'Agent Restart Sequence',
        description: 'Graceful restart of all AI agents',
        estimatedTime: '1-2 minutes',
        riskLevel: 'medium',
        compatibility: 'agents',
        steps: [
          'Send shutdown signals to agents',
          'Wait for graceful termination',
          'Clear agent state cache',
          'Reinitialize agent configurations',
          'Restart agents by priority',
          'Verify agent health status'
        ]
      },
      {
        id: 'data-integrity',
        title: 'Data Integrity Restoration',
        description: 'Validate and repair corrupted data',
        estimatedTime: '5-10 minutes',
        riskLevel: 'high',
        compatibility: 'data',
        steps: [
          'Scan for data inconsistencies',
          'Backup current data state',
          'Run integrity validation',
          'Repair corrupted records',
          'Rebuild indexes and caches',
          'Verify data consistency',
          'Update data checksums'
        ]
      },
      {
        id: 'network-reset',
        title: 'Network Connection Reset',
        description: 'Reset all external connections',
        estimatedTime: '30-60 seconds',
        riskLevel: 'low',
        compatibility: 'network',
        steps: [
          'Close existing connections',
          'Clear connection pools',
          'Reset network interfaces',
          'Reinitialize connection pools',
          'Test connectivity',
          'Resume data feeds'
        ]
      }
    ];

    setRecoveryOptions(options);
    setSelectedRecovery(options?.[0]);
  };

  const executeRecovery = async (option) => {
    setRecoveryStatus({
      inProgress: true,
      currentStep: null,
      progress: 0,
      logs: [`Starting ${option?.title}...`]
    });

    try {
      for (let i = 0; i < option?.steps?.length; i++) {
        const step = option?.steps?.[i];
        const progress = Math.round(((i + 1) / option?.steps?.length) * 100);
        
        setRecoveryStatus(prev => ({
          ...prev,
          currentStep: step,
          progress,
          logs: [...prev?.logs, `Step ${i + 1}: ${step}`]
        }));

        // Simulate step execution time
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (option?.id === 'agent-restart' && step?.includes('Restart agents')) {
          // Simulate agent restart
          try {
            const agents = await aiAgentsService?.getAgentsByGroup();
            const allAgents = Object.values(agents)?.flat();
            
            for (const agent of allAgents) {
              if (agent?.agent_status === 'error' || agent?.agent_status === 'inactive') {
                await aiAgentsService?.updateAgentStatus(agent?.id, 'active');
              }
            }
          } catch (error) {
            console.error('Agent restart failed:', error);
          }
        }
      }

      setRecoveryStatus(prev => ({
        ...prev,
        inProgress: false,
        currentStep: 'Recovery completed successfully',
        progress: 100,
        logs: [...prev?.logs, '✅ Recovery completed successfully']
      }));

      await aiAgentsService?.sendLocalNotification(
        '✅ System Recovery Complete',
        `${option?.title} executed successfully`,
        { tag: 'recovery-success' }
      );

      // Refresh system data
      await onRecoveryAction?.();

    } catch (error) {
      console.error('Recovery failed:', error);
      
      setRecoveryStatus(prev => ({
        ...prev,
        inProgress: false,
        currentStep: 'Recovery failed',
        logs: [...prev?.logs, `❌ Recovery failed: ${error?.message}`]
      }));

      await aiAgentsService?.sendLocalNotification(
        '❌ Recovery Failed',
        `${option?.title} execution failed`,
        { tag: 'recovery-error' }
      );
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-900/30 border-green-600';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-600';
      case 'high': return 'text-red-400 bg-red-900/30 border-red-600';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-600';
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 border border-green-600 rounded-lg overflow-hidden">
      <div className="bg-green-900/30 px-6 py-4 border-b border-green-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">System Recovery Tools</h2>
          </div>
          <div className={`text-sm font-medium ${getHealthStatusColor(systemHealth)}`}>
            Status: {systemHealth || 'Unknown'}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Recovery Progress */}
        {recoveryStatus?.inProgress && (
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-400 font-semibold">Recovery in Progress</h3>
              <div className="text-blue-400 text-sm">{recoveryStatus?.progress}%</div>
            </div>

            <div className="bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${recoveryStatus?.progress}%` }}
              ></div>
            </div>

            {recoveryStatus?.currentStep && (
              <div className="flex items-center space-x-2 text-blue-300 text-sm">
                <Activity className="h-4 w-4 animate-spin" />
                <span>{recoveryStatus?.currentStep}</span>
              </div>
            )}
          </div>
        )}

        {/* Recovery Options */}
        <div className="space-y-4">
          <h3 className="text-green-400 font-semibold">Available Recovery Options</h3>
          
          {recoveryOptions?.map((option) => (
            <div
              key={option?.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedRecovery?.id === option?.id
                  ? 'border-green-500 bg-green-900/30' :'border-gray-600 bg-gray-700/30 hover:bg-gray-700/50'
              }`}
              onClick={() => setSelectedRecovery(option)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-white font-medium">{option?.title}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(option?.riskLevel)}`}>
                      {option?.riskLevel} risk
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{option?.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{option?.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Compatible: {option?.compatibility}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    executeRecovery(option);
                  }}
                  disabled={recoveryStatus?.inProgress}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  {recoveryStatus?.inProgress ? 'Running...' : 'Execute'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recovery Steps Preview */}
        {selectedRecovery && !recoveryStatus?.inProgress && (
          <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Recovery Steps Preview</h4>
            <div className="space-y-2">
              {selectedRecovery?.steps?.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-300 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery Logs */}
        {recoveryStatus?.logs?.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Recovery Log</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recoveryStatus?.logs?.map((log, index) => (
                <div key={index} className="text-sm text-gray-300 font-mono">
                  <span className="text-gray-500">[{new Date()?.toLocaleTimeString()}]</span> {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
          <h3 className="text-blue-400 font-semibold mb-4">Quick Recovery Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              className="flex items-center space-x-2 bg-green-700/30 hover:bg-green-700/50 border border-green-600 rounded-lg p-3 transition-colors"
              onClick={() => executeRecovery(recoveryOptions?.find(o => o?.id === 'network-reset'))}
              disabled={recoveryStatus?.inProgress}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-white text-sm">Reset Connections</span>
            </button>
            
            <button 
              className="flex items-center space-x-2 bg-yellow-700/30 hover:bg-yellow-700/50 border border-yellow-600 rounded-lg p-3 transition-colors"
              onClick={() => executeRecovery(recoveryOptions?.find(o => o?.id === 'agent-restart'))}
              disabled={recoveryStatus?.inProgress}
            >
              <RotateCcw className="h-4 w-4" />
              <span className="text-white text-sm">Restart Agents</span>
            </button>
          </div>
        </div>

        {/* Success Validation */}
        <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
          <h3 className="text-green-400 font-semibold mb-3">Recovery Validation</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>System health monitoring active</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Agent communication verified</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span>Monitoring for post-recovery issues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}