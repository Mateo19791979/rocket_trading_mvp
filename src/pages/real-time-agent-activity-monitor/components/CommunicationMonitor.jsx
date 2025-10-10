import React from 'react';
import { MessageSquare, Network, ArrowRight, Share2 } from 'lucide-react';

export default function CommunicationMonitor({ eventBusEvents, agents }) {
  const analyzeCommunicationPatterns = () => {
    const recentEvents = eventBusEvents?.filter(e => 
      new Date(e?.created_at) > new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
    );

    const patterns = {
      totalMessages: recentEvents?.filter(e => e?.source_agent_id && e?.target_agent_id)?.length,
      broadcasts: recentEvents?.filter(e => e?.source_agent_id && !e?.target_agent_id)?.length,
      collaborations: recentEvents?.filter(e => e?.event_data?.collaborative)?.length,
      dependencies: new Map()
    };

    // Build dependency graph
    recentEvents?.forEach(event => {
      if (event?.source_agent_id && event?.target_agent_id) {
        const key = `${event?.source_agent_id}-${event?.target_agent_id}`;
        patterns?.dependencies?.set(key, (patterns?.dependencies?.get(key) || 0) + 1);
      }
    });

    return patterns;
  };

  const getAgentName = (agentId) => {
    if (!agentId) return 'System';
    const allAgents = Object.values(agents)?.flat();
    const agent = allAgents?.find(a => a?.id === agentId);
    return agent?.name || `Agent ${agentId?.slice(0, 8)}`;
  };

  const getAgentGroup = (agentId) => {
    if (!agentId) return 'system';
    const allAgents = Object.values(agents)?.flat();
    const agent = allAgents?.find(a => a?.id === agentId);
    return agent?.agent_group || 'unknown';
  };

  const getGroupColor = (group) => {
    const colors = {
      ingestion: 'text-blue-400',
      signals: 'text-green-400',
      execution: 'text-orange-400',
      orchestration: 'text-purple-400',
      system: 'text-gray-400',
      unknown: 'text-gray-400'
    };
    return colors?.[group] || 'text-gray-400';
  };

  const getRecentExchanges = () => {
    return eventBusEvents
      ?.filter(e => e?.source_agent_id && e?.target_agent_id)
      ?.slice(0, 8)
      ?.map(event => ({
        id: event?.id,
        sourceAgent: getAgentName(event?.source_agent_id),
        targetAgent: getAgentName(event?.target_agent_id),
        sourceGroup: getAgentGroup(event?.source_agent_id),
        targetGroup: getAgentGroup(event?.target_agent_id),
        eventType: event?.event_type,
        priority: event?.priority,
        timestamp: event?.created_at,
        data: event?.event_data
      }));
  };

  const getNetworkTopology = () => {
    const patterns = analyzeCommunicationPatterns();
    const topology = [];
    
    patterns?.dependencies?.forEach((count, key) => {
      const [sourceId, targetId] = key?.split('-');
      topology?.push({
        source: getAgentName(sourceId),
        target: getAgentName(targetId),
        sourceGroup: getAgentGroup(sourceId),
        targetGroup: getAgentGroup(targetId),
        strength: count,
        type: sourceId === targetId ? 'self' : 'inter'
      });
    });

    return topology?.sort((a, b) => b?.strength - a?.strength);
  };

  const patterns = analyzeCommunicationPatterns();
  const recentExchanges = getRecentExchanges();
  const topology = getNetworkTopology();

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-teal-400" />
          Communication Monitor
        </h3>
        <div className="text-xs text-teal-400">Last 30min</div>
      </div>

      {/* Communication Stats */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center">
            <div className="text-sm font-bold text-blue-400">{patterns?.totalMessages}</div>
            <div className="text-gray-400">Direct Messages</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-purple-400">{patterns?.broadcasts}</div>
            <div className="text-gray-400">Broadcasts</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-green-400">{patterns?.collaborations}</div>
            <div className="text-gray-400">Collaborations</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-yellow-400">{topology?.length}</div>
            <div className="text-gray-400">Active Links</div>
          </div>
        </div>
      </div>

      {/* Network Topology */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
          <Network className="w-3 h-3 mr-1" />
          Network Topology
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {topology?.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-2">
              No active communication links
            </div>
          ) : (
            topology?.slice(0, 5)?.map((link, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 flex-1 min-w-0">
                  <span className={`truncate ${getGroupColor(link?.sourceGroup)}`}>
                    {link?.source}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <span className={`truncate ${getGroupColor(link?.targetGroup)}`}>
                    {link?.target}
                  </span>
                </div>
                <span className="text-gray-400 ml-2">{link?.strength}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Message Exchanges */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
          <Share2 className="w-3 h-3 mr-1" />
          Recent Exchanges
        </h4>
        <div className="space-y-2 overflow-y-auto h-full">
          {recentExchanges?.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">
              No recent message exchanges
            </div>
          ) : (
            recentExchanges?.map(exchange => (
              <div key={exchange?.id} className="bg-gray-800/50 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1 text-xs">
                    <span className={getGroupColor(exchange?.sourceGroup)}>
                      {exchange?.sourceAgent}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    <span className={getGroupColor(exchange?.targetGroup)}>
                      {exchange?.targetAgent}
                    </span>
                  </div>
                  <span className={`text-xs px-1 py-0.5 rounded ${
                    exchange?.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    exchange?.priority === 'medium'? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {exchange?.priority}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400 mb-1">
                  {exchange?.eventType?.replace(/_/g, ' ')?.toUpperCase()}
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">
                    {new Date(exchange?.timestamp)?.toLocaleTimeString()}
                  </span>
                  {exchange?.data?.message_type && (
                    <span className="text-teal-400">
                      {exchange?.data?.message_type}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Information Sharing Stats */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          Network Health: <span className="text-green-400 font-medium">98.4%</span>
        </div>
      </div>
    </div>
  );
}