import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Brain, AlertCircle, CheckCircle2, Network, Activity } from 'lucide-react';

export default function MultiAgentCollaboration() {
  const [activeAgents, setActiveAgents] = useState([]);
  const [collaborationMode, setCollaborationMode] = useState('consensus');
  const [confidencePropagation, setConfidencePropagation] = useState(true);

  const agentTypes = [
    {
      id: 'quant_oracle',
      name: 'QuantOracle',
      specialization: 'Quantitative Analysis',
      status: 'active',
      confidence: 0.94,
      currentTask: 'Portfolio optimization',
      connections: ['strategy_weaver', 'execution_guru'],
      color: 'text-blue-400 bg-blue-500/10'
    },
    {
      id: 'strategy_weaver',
      name: 'StrategyWeaver',
      specialization: 'Strategy Synthesis',
      status: 'active',
      confidence: 0.87,
      currentTask: 'Pattern recognition',
      connections: ['quant_oracle', 'news_miner'],
      color: 'text-green-400 bg-green-500/10'
    },
    {
      id: 'execution_guru',
      name: 'ExecutionGuru',
      specialization: 'Trade Execution',
      status: 'active',
      confidence: 0.91,
      currentTask: 'Order optimization',
      connections: ['quant_oracle', 'risk_sentinel'],
      color: 'text-orange-400 bg-orange-500/10'
    },
    {
      id: 'news_miner',
      name: 'NewsMiner',
      specialization: 'Sentiment Analysis',
      status: 'processing',
      confidence: 0.89,
      currentTask: 'Market sentiment extraction',
      connections: ['strategy_weaver'],
      color: 'text-purple-400 bg-purple-500/10'
    },
    {
      id: 'risk_sentinel',
      name: 'RiskSentinel',
      specialization: 'Risk Assessment',
      status: 'active',
      confidence: 0.96,
      currentTask: 'Exposure monitoring',
      connections: ['execution_guru'],
      color: 'text-red-400 bg-red-500/10'
    }
  ];

  const collaborationModes = [
    { id: 'consensus', name: 'Consensus Building', description: 'Aggregate agent opinions with weighted voting' },
    { id: 'hierarchical', name: 'Hierarchical', description: 'Authority-based decision making with lead agents' },
    { id: 'competitive', name: 'Competitive', description: 'Agent competition with performance-based selection' }
  ];

  const mockCollaborationSessions = [
    {
      id: 1,
      participants: ['QuantOracle', 'StrategyWeaver', 'ExecutionGuru'],
      topic: 'NVDA Options Strategy',
      status: 'active',
      startTime: '14:32',
      consensus: 0.85,
      conflictResolution: 'weighted_average'
    },
    {
      id: 2,
      participants: ['NewsMiner', 'RiskSentinel'],
      topic: 'Market Volatility Assessment',
      status: 'completed',
      startTime: '13:45',
      consensus: 0.92,
      conflictResolution: 'expert_override'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500';
      case 'processing': return 'text-yellow-400 bg-yellow-500';
      case 'idle': return 'text-gray-400 bg-gray-500';
      case 'error': return 'text-red-400 bg-red-500';
      default: return 'text-gray-400 bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.8) return 'text-yellow-400';
    return 'text-orange-400';
  };

  useEffect(() => {
    setActiveAgents(agentTypes);
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Users className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Multi-Agent Collaboration</h3>
            <p className="text-sm text-gray-400">Coordinated knowledge synthesis across specialized AI agents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">{activeAgents?.filter(a => a?.status === 'active')?.length} Active</span>
          </div>
        </div>
      </div>
      {/* Collaboration Mode Selector */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-300 mb-3">Collaboration Mode</h4>
        <div className="space-y-2">
          {collaborationModes?.map((mode) => (
            <div
              key={mode?.id}
              onClick={() => setCollaborationMode(mode?.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                collaborationMode === mode?.id
                  ? 'border-orange-500/50 bg-orange-500/5' :'border-gray-600 bg-gray-700/20 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white text-sm">{mode?.name}</div>
                  <div className="text-xs text-gray-400">{mode?.description}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  collaborationMode === mode?.id 
                    ? 'border-orange-400 bg-orange-400' :'border-gray-500'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Agent Network */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-300">Agent Network</h4>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={confidencePropagation}
                onChange={(e) => setConfidencePropagation(e?.target?.checked)}
                className="w-3 h-3 rounded border-gray-500 bg-gray-700 text-orange-400 focus:ring-orange-400 focus:ring-offset-0"
              />
              <span className="text-gray-400">Confidence Propagation</span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {activeAgents?.map((agent) => (
            <div key={agent?.id} className={`p-4 rounded-lg border ${agent?.color?.replace('text-', 'border-')?.replace('-400', '-500/20')}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${agent?.color}`}>
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{agent?.name}</div>
                    <div className="text-xs text-gray-400">{agent?.specialization}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent?.status)}`}></div>
                    <span className="text-xs text-gray-400 capitalize">{agent?.status}</span>
                  </div>
                  <span className={`text-xs font-bold ${getConfidenceColor(agent?.confidence)}`}>
                    {(agent?.confidence * 100)?.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{agent?.currentTask}</span>
                <div className="flex items-center space-x-1">
                  <Network className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-500">{agent?.connections?.length} connections</span>
                </div>
              </div>
              
              {/* Confidence propagation indicator */}
              {confidencePropagation && (
                <div className="mt-2 w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${agent?.color?.replace('text-', 'bg-')?.replace('-400', '-500')}`}
                    style={{ width: `${agent?.confidence * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Active Collaboration Sessions */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-300">Active Collaboration Sessions</h4>
        
        {mockCollaborationSessions?.length > 0 ? (
          <div className="space-y-2">
            {mockCollaborationSessions?.map((session) => (
              <div key={session?.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <span className="font-medium text-white text-sm">{session?.topic}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session?.status === 'active' ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Live</span>
                      </div>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">Participants: {session?.participants?.join(', ')}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">Started: {session?.startTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">Consensus:</span>
                    <span className={`font-bold ${getConfidenceColor(session?.consensus)}`}>
                      {(session?.consensus * 100)?.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize">
                    Resolution: {session?.conflictResolution?.replace('_', ' ')}
                  </span>
                  <div className="w-24 h-1 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-green-400 transition-all duration-500"
                      style={{ width: `${session?.consensus * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active collaboration sessions</p>
          </div>
        )}
      </div>
      {/* Uncertainty Quantification */}
      <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">Uncertainty Quantification</span>
        </div>
        <div className="text-xs text-gray-400">
          Current system uncertainty: <span className="text-yellow-400 font-bold">±12%</span> 
          based on agent confidence distribution and conflicting information analysis.
        </div>
      </div>
    </div>
  );
}