import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, BarChart, Radio } from 'lucide-react';

export default function NATSIntegrationPanel({ externalSources }) {
  const [topicStats, setTopicStats] = useState({
    'macro.valuation.cmv.buffett': { messages: 247, consumers: 3, lastMessage: new Date()?.toISOString() },
    'macro.valuation.cmv.pe10': { messages: 189, consumers: 2, lastMessage: new Date()?.toISOString() },
    'macro.valuation.cmv.pricesales': { messages: 156, consumers: 1, lastMessage: new Date()?.toISOString() },
    'index.wilshire.platform': { messages: 78, consumers: 2, lastMessage: new Date()?.toISOString() },
    'index.wilshire.all-indexes': { messages: 92, consumers: 3, lastMessage: new Date()?.toISOString() },
    'index.wilshire.methodology.ftw5000': { messages: 34, consumers: 1, lastMessage: new Date()?.toISOString() }
  });

  const [aiAgentConsumption, setAiAgentConsumption] = useState([
    {
      name: 'Macro Analyst',
      topics: ['macro.valuation.cmv.buffett', 'macro.valuation.cmv.pe10'],
      status: 'active',
      lastActivity: new Date()?.toISOString()
    },
    {
      name: 'Regime Detector',
      topics: ['macro.valuation.cmv.buffett', 'index.wilshire.all-indexes'],
      status: 'active',
      lastActivity: new Date(Date.now() - 300000)?.toISOString()
    },
    {
      name: 'Narrative Builder',
      topics: ['index.wilshire.methodology.ftw5000', 'macro.valuation.cmv.pe10'],
      status: 'inactive',
      lastActivity: new Date(Date.now() - 1800000)?.toISOString()
    }
  ]);

  const getTotalMessages = () => {
    return Object.values(topicStats)?.reduce((sum, topic) => sum + topic?.messages, 0);
  };

  const getTotalConsumers = () => {
    return Object.values(topicStats)?.reduce((sum, topic) => sum + topic?.consumers, 0);
  };

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTopicCategory = (topic) => {
    if (topic?.includes('cmv')) return 'CMV';
    if (topic?.includes('wilshire')) return 'Wilshire';
    return 'Unknown';
  };

  const getTopicCategoryColor = (topic) => {
    if (topic?.includes('cmv')) return 'text-blue-400 bg-blue-900/30';
    if (topic?.includes('wilshire')) return 'text-teal-400 bg-teal-900/30';
    return 'text-gray-400 bg-gray-700';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold">NATS Integration Panel</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">Connected</span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Topic Overview */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Topic Overview</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-400">{Object.keys(topicStats)?.length}</div>
              <div className="text-xs text-gray-400">Active Topics</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-400">{getTotalMessages()}</div>
              <div className="text-xs text-gray-400">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-400">{getTotalConsumers()}</div>
              <div className="text-xs text-gray-400">Active Consumers</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {Object.entries(topicStats)?.map(([topic, stats]) => (
              <div key={topic} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTopicCategoryColor(topic)}`}>
                    {getTopicCategory(topic)}
                  </span>
                  <span className="text-gray-300 truncate max-w-48">{topic?.split('.')?.slice(-1)?.[0]}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{stats?.messages} msg</span>
                  <span>{stats?.consumers} sub</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Flow Visualization */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Real-Time Message Flow</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-400">CMV Topics</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-2 bg-blue-600 rounded-full overflow-hidden">
                  <div className="w-6 h-full bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs text-gray-400">High</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-400">Wilshire Topics</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-2 bg-teal-600 rounded-full overflow-hidden">
                  <div className="w-4 h-full bg-teal-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs text-gray-400">Medium</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Delivery Rate</span>
              <span className="text-green-400 font-medium">99.8%</span>
            </div>
          </div>
        </div>

        {/* AI Agent Consumption */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">AI Agent Consumption</h3>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {aiAgentConsumption?.map((agent, index) => (
              <div key={index} className="border border-gray-600 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-200">{agent?.name}</span>
                  <span className={`text-xs font-medium ${getAgentStatusColor(agent?.status)}`}>
                    {agent?.status}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Subscribed Topics:</div>
                  {agent?.topics?.map((topic, topicIndex) => (
                    <div key={topicIndex} className="text-xs text-gray-500 ml-2">
                      • {topic?.split('.')?.slice(-1)?.[0]}
                    </div>
                  ))}
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Last activity: {new Date(agent.lastActivity)?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Performance Metrics</h3>
            <BarChart className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg Latency</div>
              <div className="text-lg font-bold text-green-400">2.3ms</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Throughput</div>
              <div className="text-lg font-bold text-blue-400">847/min</div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Connection Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">Healthy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded text-sm">
              View Logs
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded text-sm">
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}