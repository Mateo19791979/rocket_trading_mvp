import React from 'react';
import { GitBranch, CheckCircle, Clock, Zap } from 'lucide-react';

export default function DecisionTrackingPanel({ eventBusEvents, selectedAgent, agents }) {
  const getDecisionFlows = () => {
    if (!selectedAgent) return [];
    
    // Filter events for selected agent and look for decision-related events
    const agentEvents = eventBusEvents?.filter(event => 
      event?.source_agent_id === selectedAgent &&
      (event?.event_type === 'trade_signal' || 
       event?.event_type === 'order_execution' || 
       event?.event_type === 'risk_alert')
    )?.slice(0, 10);

    return agentEvents?.map(event => ({
      id: event?.id,
      timestamp: event?.created_at,
      type: event?.event_type,
      inputData: event?.event_data?.input || {},
      decisionPath: event?.event_data?.decision_path || [],
      finalRecommendation: event?.event_data?.recommendation || event?.event_data?.action,
      confidence: event?.event_data?.confidence_level,
      executionTime: event?.event_data?.execution_time_ms,
      reasoning: event?.event_data?.reasoning
    }));
  };

  const renderDecisionTree = (decisionFlow) => {
    const steps = [
      { label: 'Data Input', status: 'completed', data: decisionFlow?.inputData },
      { label: 'Analysis', status: 'completed', data: { reasoning: decisionFlow?.reasoning } },
      { label: 'Decision', status: 'completed', data: { recommendation: decisionFlow?.finalRecommendation } },
      { label: 'Output', status: 'completed', data: { confidence: decisionFlow?.confidence } }
    ];

    return (
      <div className="space-y-2">
        {steps?.map((step, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step?.status === 'completed' ? 'bg-green-500 text-white' :
                step?.status === 'processing'? 'bg-yellow-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                {step?.status === 'completed' ? 
                  <CheckCircle className="w-3 h-3" /> : 
                  <Clock className="w-3 h-3" />
                }
              </div>
              {index < steps?.length - 1 && (
                <div className="w-px h-6 bg-gray-600 mt-1" />
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <div className="text-xs font-medium text-white mb-1">{step?.label}</div>
              <div className="text-xs text-gray-400">
                {step?.label === 'Data Input' && step?.data && (
                  <div>Sources: {Object.keys(step?.data)?.join(', ') || 'Market Data'}</div>
                )}
                {step?.label === 'Analysis' && step?.data?.reasoning && (
                  <div>{step?.data?.reasoning?.slice(0, 60)}...</div>
                )}
                {step?.label === 'Decision' && step?.data?.recommendation && (
                  <div className="font-medium text-blue-400">{step?.data?.recommendation}</div>
                )}
                {step?.label === 'Output' && step?.data?.confidence && (
                  <div>Confidence: {step?.data?.confidence}%</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getSelectedAgentName = () => {
    if (!selectedAgent) return 'No Agent Selected';
    const allAgents = Object.values(agents)?.flat();
    const agent = allAgents?.find(a => a?.id === selectedAgent);
    return agent?.name || `Agent ${selectedAgent?.slice(0, 8)}`;
  };

  const decisionFlows = getDecisionFlows();

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center">
          <GitBranch className="w-4 h-4 mr-2 text-purple-400" />
          Decision Tracking
        </h3>
        <div className="text-xs text-purple-400">
          {getSelectedAgentName()}
        </div>
      </div>

      {!selectedAgent ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select an agent to track decisions</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {decisionFlows?.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <p className="text-sm">No recent decisions for this agent</p>
            </div>
          ) : (
            decisionFlows?.map(flow => (
              <div key={flow?.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-sm font-medium text-white">
                      {flow?.type?.replace(/_/g, ' ')?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(flow?.timestamp)?.toLocaleTimeString()}
                  </div>
                </div>

                {/* Decision Flow Visualization */}
                {renderDecisionTree(flow)}

                {/* Decision Metrics */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {flow?.confidence && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="font-medium text-blue-400">{flow?.confidence}%</span>
                      </div>
                    )}
                    {flow?.executionTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Execution:</span>
                        <span className="font-medium text-yellow-400">{flow?.executionTime}ms</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Interactive Decision Path Exploration */}
                  {flow?.reasoning && (
                    <div className="mt-2 bg-gray-900/50 rounded p-2">
                      <div className="text-xs font-medium text-gray-300 mb-1">Reasoning Chain:</div>
                      <div className="text-xs text-gray-400">{flow?.reasoning}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}