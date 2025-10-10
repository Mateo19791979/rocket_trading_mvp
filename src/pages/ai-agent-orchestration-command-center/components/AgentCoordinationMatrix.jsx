import React from 'react';
import { Network, Share2, Zap } from 'lucide-react';

export default function AgentCoordinationMatrix({ eventBusEvents, agents }) {
  const calculateCommunicationFlow = () => {
    const flows = {
      ingestionToSignals: 0,
      signalsToExecution: 0,
      executionToOrchestration: 0,
      orchestrationToIngestion: 0,
      crossCommunication: 0
    };

    eventBusEvents?.forEach(event => {
      const sourceGroup = event?.source_agent?.agent_group;
      const targetGroup = event?.target_agent?.agent_group;
      
      if (sourceGroup === 'ingestion' && targetGroup === 'signals') {
        flows.ingestionToSignals++;
      } else if (sourceGroup === 'signals' && targetGroup === 'execution') {
        flows.signalsToExecution++;
      } else if (sourceGroup === 'execution' && targetGroup === 'orchestration') {
        flows.executionToOrchestration++;
      } else if (sourceGroup === 'orchestration' && targetGroup === 'ingestion') {
        flows.orchestrationToIngestion++;
      } else if (sourceGroup && targetGroup && sourceGroup !== targetGroup) {
        flows.crossCommunication++;
      }
    });

    return flows;
  };

  const flows = calculateCommunicationFlow();

  const getFlowIntensity = (count) => {
    if (count > 20) return 'text-red-400 font-bold';
    if (count > 10) return 'text-yellow-400 font-medium';
    if (count > 5) return 'text-green-400';
    return 'text-gray-400';
  };

  const getTaskDelegationPatterns = () => {
    // Analyze recent events for delegation patterns
    const recentEvents = eventBusEvents?.filter(e => 
      new Date(e?.created_at) > new Date(Date.now() - 10 * 60 * 1000)
    );

    const patterns = {
      totalDelegations: recentEvents?.filter(e => e?.event_type === 'trade_signal')?.length || 0,
      priorityTasks: recentEvents?.filter(e => e?.priority === 'high')?.length || 0,
      collaborativeDecisions: recentEvents?.filter(e => e?.event_data?.collaborative)?.length || 0,
      autonomousActions: recentEvents?.filter(e => e?.event_data?.autonomous)?.length || 0
    };

    return patterns;
  };

  const patterns = getTaskDelegationPatterns();

  const groupPositions = {
    ingestion: { x: 20, y: 20 },
    signals: { x: 180, y: 20 },
    execution: { x: 180, y: 100 },
    orchestration: { x: 20, y: 100 }
  };

  const groupColors = {
    ingestion: 'text-blue-400',
    signals: 'text-green-400',
    execution: 'text-orange-400',
    orchestration: 'text-purple-400'
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Agent Coordination Matrix</h3>
        <Network className="w-4 h-4 text-blue-400" />
      </div>
      {/* Communication Flow Visualization */}
      <div className="bg-gray-800 rounded-lg p-4 h-40 relative">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Inter-Agent Communication</h4>
        
        {/* Agent Group Nodes */}
        {Object.entries(groupPositions)?.map(([group, pos]) => (
          <div
            key={group}
            className={`absolute w-16 h-8 bg-gray-700 rounded text-xs flex items-center justify-center ${groupColors?.[group]} font-medium`}
            style={{ left: pos?.x, top: pos?.y }}
          >
            {group?.slice(0, 4)}
          </div>
        ))}

        {/* Communication Flow Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Ingestion to Signals */}
          <line x1="84" y1="24" x2="180" y2="24" stroke="#10b981" strokeWidth="2" opacity="0.6" />
          <text x="130" y="20" fill="#10b981" fontSize="10" textAnchor="middle">{flows?.ingestionToSignals}</text>
          
          {/* Signals to Execution */}
          <line x1="196" y1="36" x2="196" y2="100" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
          <text x="210" y="70" fill="#f59e0b" fontSize="10">{flows?.signalsToExecution}</text>
          
          {/* Execution to Orchestration */}
          <line x1="180" y1="104" x2="84" y2="104" stroke="#8b5cf6" strokeWidth="2" opacity="0.6" />
          <text x="130" y="118" fill="#8b5cf6" fontSize="10" textAnchor="middle">{flows?.executionToOrchestration}</text>
          
          {/* Orchestration back to Ingestion */}
          <line x1="36" y1="100" x2="36" y2="36" stroke="#3b82f6" strokeWidth="2" opacity="0.6" strokeDasharray="3,3" />
          <text x="20" y="70" fill="#3b82f6" fontSize="10">{flows?.orchestrationToIngestion}</text>
        </svg>
      </div>
      {/* Communication Statistics */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Flow Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Data Flow:</span>
            <span className={getFlowIntensity(flows?.ingestionToSignals)}>{flows?.ingestionToSignals}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Signal Flow:</span>
            <span className={getFlowIntensity(flows?.signalsToExecution)}>{flows?.signalsToExecution}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Execute Flow:</span>
            <span className={getFlowIntensity(flows?.executionToOrchestration)}>{flows?.executionToOrchestration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cross-Talk:</span>
            <span className={getFlowIntensity(flows?.crossCommunication)}>{flows?.crossCommunication}</span>
          </div>
        </div>
      </div>
      {/* Task Delegation Patterns */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
          <Share2 className="w-3 h-3 mr-1" />
          Task Delegation
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Total Delegations:</span>
            <span className="text-blue-400 font-medium">{patterns?.totalDelegations}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Priority Tasks:</span>
            <span className="text-red-400 font-medium">{patterns?.priorityTasks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Collaborative:</span>
            <span className="text-green-400 font-medium">{patterns?.collaborativeDecisions}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Autonomous:</span>
            <span className="text-purple-400 font-medium">{patterns?.autonomousActions}</span>
          </div>
        </div>
      </div>
      {/* Decision Making Process */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
          <Zap className="w-3 h-3 mr-1" />
          Decision Process
        </h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-gray-300">Consensus Building: 94%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-gray-300">Conflict Resolution: 89%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span className="text-gray-300">Decision Speed: 127ms avg</span>
          </div>
        </div>
      </div>
      {/* Network Topology Health */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Network Health</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Connectivity:</span>
            <span className="text-green-400">98.7%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Latency:</span>
            <span className="text-green-400">12ms avg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Bandwidth:</span>
            <span className="text-blue-400">87% utilized</span>
          </div>
        </div>
      </div>
    </div>
  );
}