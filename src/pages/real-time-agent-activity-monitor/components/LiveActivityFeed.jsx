import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronRight, Clock, Target, Zap } from 'lucide-react';

export default function LiveActivityFeed({ activities, agents, onActivitySelect }) {
  const [expandedActivities, setExpandedActivities] = useState(new Set());

  const toggleActivityExpansion = (activityId) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet?.has(activityId)) {
        newSet?.delete(activityId);
      } else {
        newSet?.add(activityId);
      }
      return newSet;
    });
  };

  const getActivityIcon = (eventType) => {
    switch (eventType) {
      case 'trade_signal': return <Target className="w-3 h-3 text-green-400" />;
      case 'market_data': return <Activity className="w-3 h-3 text-blue-400" />;
      case 'order_execution': return <Zap className="w-3 h-3 text-orange-400" />;
      case 'risk_alert': return <Activity className="w-3 h-3 text-red-400" />;
      case 'system_status': return <Activity className="w-3 h-3 text-purple-400" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-orange-500 bg-orange-500/5';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-l-green-500 bg-green-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const getAgentName = (agentId) => {
    if (!agentId) return 'System';
    const allAgents = Object.values(agents)?.flat();
    const agent = allAgents?.find(a => a?.id === agentId);
    return agent?.name || `Agent ${agentId?.slice(0, 8)}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date?.toLocaleTimeString();
  };

  const renderDecisionTree = (eventData) => {
    if (!eventData?.decision_tree && !eventData?.reasoning) return null;

    return (
      <div className="mt-2 bg-gray-800/50 rounded p-2">
        <h5 className="text-xs font-medium text-gray-300 mb-2">Decision Process:</h5>
        
        {eventData?.reasoning && (
          <div className="text-xs text-gray-400 mb-2">
            <span className="font-medium">Reasoning:</span> {eventData?.reasoning}
          </div>
        )}
        
        {eventData?.confidence_level && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Confidence:</span>
            <span className="font-medium text-blue-400">{eventData?.confidence_level}%</span>
          </div>
        )}
        
        {eventData?.signal_strength && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Signal Strength:</span>
            <span className="font-medium text-green-400">{eventData?.signal_strength}</span>
          </div>
        )}
        
        {eventData?.execution_time_ms && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Execution Time:</span>
            <span className="font-medium text-yellow-400">{eventData?.execution_time_ms}ms</span>
          </div>
        )}
      </div>
    );
  };

  const renderExpandableDetails = (activity) => {
    return (
      <div className="mt-2 space-y-2">
        {/* Input Data Sources */}
        {activity?.event_data?.data_sources && (
          <div className="bg-gray-800/30 rounded p-2">
            <h5 className="text-xs font-medium text-gray-300 mb-1">Data Sources:</h5>
            <div className="flex flex-wrap gap-1">
              {activity?.event_data?.data_sources?.map((source, idx) => (
                <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Processing Algorithms */}
        {activity?.event_data?.algorithms && (
          <div className="bg-gray-800/30 rounded p-2">
            <h5 className="text-xs font-medium text-gray-300 mb-1">Algorithms Used:</h5>
            <div className="space-y-1">
              {activity?.event_data?.algorithms?.map((algo, idx) => (
                <div key={idx} className="text-xs text-gray-400">
                  • {algo}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Tree */}
        {renderDecisionTree(activity?.event_data)}

        {/* Raw Event Data */}
        <div className="bg-gray-800/30 rounded p-2">
          <h5 className="text-xs font-medium text-gray-300 mb-1">Event Data:</h5>
          <pre className="text-xs text-gray-400 overflow-x-auto">
            {JSON.stringify(activity?.event_data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center">
            <Activity className="w-4 h-4 mr-2 text-purple-400" />
            Live Activity Feed
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Real-time</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activities?.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activities found for current filters</p>
          </div>
        ) : (
          activities?.map(activity => {
            const isExpanded = expandedActivities?.has(activity?.id);
            const agentName = getAgentName(activity?.source_agent_id);
            
            return (
              <div
                key={activity?.id}
                className={`border-l-2 rounded-r-lg p-3 cursor-pointer hover:bg-gray-800/50 transition-colors ${getPriorityColor(activity?.priority)}`}
                onClick={() => onActivitySelect?.(activity)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getActivityIcon(activity?.event_type)}
                      <span className="text-sm font-medium text-white">
                        {activity?.event_type?.replace(/_/g, ' ')?.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        from {agentName}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(activity?.created_at)}</span>
                      </div>
                      <span className="capitalize px-2 py-1 bg-gray-700 rounded">
                        {activity?.priority}
                      </span>
                    </div>

                    {/* Activity Summary */}
                    {activity?.event_data?.summary && (
                      <p className="text-sm text-gray-300 mb-2">
                        {activity?.event_data?.summary}
                      </p>
                    )}

                    {/* Quick Metrics */}
                    <div className="flex items-center space-x-3 text-xs">
                      {activity?.event_data?.confidence_level && (
                        <span className="text-blue-400">
                          Confidence: {activity?.event_data?.confidence_level}%
                        </span>
                      )}
                      {activity?.event_data?.execution_time_ms && (
                        <span className="text-yellow-400">
                          {activity?.event_data?.execution_time_ms}ms
                        </span>
                      )}
                      {activity?.event_data?.signal_strength && (
                        <span className="text-green-400">
                          Signal: {activity?.event_data?.signal_strength}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e?.stopPropagation();
                      toggleActivityExpansion(activity?.id);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </button>
                </div>
                {/* Expandable Details */}
                {isExpanded && renderExpandableDetails(activity)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}