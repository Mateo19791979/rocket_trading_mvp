import React, { useState, useEffect } from 'react';
import { Users, Brain, Activity, Eye, MessageSquare } from 'lucide-react';

export default function AgentConsumptionPanel() {
  const [agentData, setAgentData] = useState([]);
  const [totalQueries, setTotalQueries] = useState(0);

  useEffect(() => {
    // Mock agent data with knowledge consumption patterns
    const mockAgentData = [
      {
        name: 'QuantOracle',
        type: 'Financial Analysis',
        queries: 1247,
        avgSimilarity: 0.89,
        topTopics: ['Financial ML', 'Trading Algorithms', 'Risk Management'],
        trend: 12,
        status: 'active'
      },
      {
        name: 'StrategyWeaver',
        type: 'Strategy Development',
        queries: 892,
        avgSimilarity: 0.91,
        topTopics: ['Strategic Planning', 'Market Analysis', 'Trend Detection'],
        trend: 8,
        status: 'active'
      },
      {
        name: 'DataPhoenix',
        type: 'Data Engineering',
        queries: 734,
        avgSimilarity: 0.87,
        topTopics: ['Data Architecture', 'System Design', 'Scalability'],
        trend: 15,
        status: 'active'
      },
      {
        name: 'Deployer',
        type: 'DevOps & SRE',
        queries: 623,
        avgSimilarity: 0.93,
        topTopics: ['SRE Practices', 'Infrastructure', 'Monitoring'],
        trend: -3,
        status: 'active'
      },
      {
        name: 'Telemetry',
        type: 'Monitoring',
        queries: 456,
        avgSimilarity: 0.85,
        topTopics: ['System Metrics', 'Alerting', 'Performance'],
        trend: 7,
        status: 'active'
      },
      {
        name: 'ImmuneSentinel',
        type: 'Security',
        queries: 389,
        avgSimilarity: 0.88,
        topTopics: ['Security Patterns', 'Threat Detection', 'Compliance'],
        trend: 22,
        status: 'active'
      }
    ];

    setAgentData(mockAgentData);
    setTotalQueries(mockAgentData?.reduce((sum, agent) => sum + agent?.queries, 0));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendColor = (trend) => {
    if (trend > 10) return 'text-green-400';
    if (trend > 0) return 'text-green-300';
    if (trend < -10) return 'text-red-400';
    return 'text-red-300';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold">Agent Knowledge Consumption</h3>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{agentData?.length}</div>
          <div className="text-xs text-gray-400">Active Agents</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{totalQueries?.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total Queries</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">91.2%</div>
          <div className="text-xs text-gray-400">Avg Relevance</div>
        </div>
      </div>
      {/* Agent List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {agentData?.map((agent, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Brain className="h-8 w-8 text-blue-400" />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(agent?.status)}`}></div>
                </div>
                <div>
                  <h4 className="font-medium text-white">{agent?.name}</h4>
                  <p className="text-sm text-gray-400">{agent?.type}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-white">{agent?.queries}</span>
                  <span className={`text-xs ${getTrendColor(agent?.trend)}`}>
                    {agent?.trend > 0 ? '+' : ''}{agent?.trend}%
                  </span>
                </div>
                <p className="text-xs text-gray-400">Queries</p>
              </div>
            </div>

            {/* Similarity Score */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Avg Similarity Score</span>
                <span className="text-white">{(agent?.avgSimilarity * 100)?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${agent?.avgSimilarity * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Top Topics */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Most Accessed Content:</p>
              <div className="flex flex-wrap gap-1">
                {agent?.topTopics?.slice(0, 3)?.map((topic, topicIndex) => (
                  <span 
                    key={topicIndex}
                    className="px-2 py-1 bg-blue-600 text-xs rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity Indicators */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{Math.floor(agent?.queries * 0.7)} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{Math.floor(agent?.queries * 0.3)} queries</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-400">Live</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Real-time Activity */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Real-time Knowledge Access</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">24 agents actively querying</span>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Average query resolution: 127ms • Peak utilization: 89% • Knowledge hit rate: 94.7%
        </div>
      </div>
    </div>
  );
}