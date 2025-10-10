import React, { useState, useEffect } from 'react';
import { Bot, Zap, Database, TrendingUp, Shield, Activity, Play, Pause, MessageSquare, RefreshCw } from 'lucide-react';

export default function AgentOrchestrationPanel({ onProgressUpdate, onSystemStatusUpdate }) {
  const [agentGroups, setAgentGroups] = useState([
    {
      id: 'data_phoenix',
      name: 'Data Phoenix',
      description: 'Ingestion marché + alternative data simple',
      status: 'inactive',
      agents: 8,
      activeAgents: 0,
      lastActivity: null,
      messagesProcessed: 0,
      throughput: 0,
      icon: <Database className="w-5 h-5" />,
      color: 'blue',
      natsTopics: ['market.data.ingest', 'alt.data.feed'],
      functions: ['Market data ingestion', 'Alternative data processing', 'Data quality validation']
    },
    {
      id: 'quant_oracle', 
      name: 'Quant Oracle',
      description: 'Backtest & validation de robustesse',
      status: 'inactive',
      agents: 8,
      activeAgents: 0,
      lastActivity: null,
      messagesProcessed: 0,
      throughput: 0,
      icon: <Shield className="w-5 h-5" />,
      color: 'purple',
      natsTopics: ['quant.insight', 'backtest.results'],
      functions: ['Strategy backtesting', 'Risk validation', 'Performance analysis']
    },
    {
      id: 'strategy_weaver',
      name: 'Strategy Weaver', 
      description: 'Génère stratégies simples (RSI+ATR)',
      status: 'inactive',
      agents: 8,
      activeAgents: 0,
      lastActivity: null,
      messagesProcessed: 0,
      throughput: 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'green',
      natsTopics: ['strategy.candidate', 'strategy.signal'],
      functions: ['RSI strategy generation', 'ATR volatility analysis', 'Signal generation']
    }
  ]);

  const [natsMessages, setNatsMessages] = useState([]);
  const [orchestrationStatus, setOrchestrationStatus] = useState({
    natsConnected: false,
    redisConnected: false,
    totalMessages: 0,
    errorCount: 0
  });

  const [isOrchestrating, setIsOrchestrating] = useState(false);

  useEffect(() => {
    // Simulate message flow when agents are active
    const interval = setInterval(() => {
      const activeGroups = agentGroups?.filter(group => group?.status === 'active');
      
      if (activeGroups?.length > 0) {
        // Generate simulated messages
        activeGroups?.forEach(group => {
          const messageCount = Math.floor(Math.random() * 5) + 1;
          const messages = Array.from({ length: messageCount }, (_, index) => ({
            id: Date.now() + index,
            timestamp: new Date()?.toISOString(),
            topic: group?.natsTopics?.[Math.floor(Math.random() * group?.natsTopics?.length)],
            source: group?.name,
            type: 'agent_message',
            payload: generateSamplePayload(group?.id)
          }));
          
          setNatsMessages(prev => [...messages, ...prev?.slice(0, 47)]);
          
          // Update group statistics
          setAgentGroups(prev => prev?.map(g => 
            g?.id === group?.id ? {
              ...g,
              messagesProcessed: g?.messagesProcessed + messageCount,
              throughput: Math.floor(Math.random() * 20) + 5,
              lastActivity: new Date()?.toISOString()
            } : g
          ));
        });
        
        setOrchestrationStatus(prev => ({
          ...prev,
          totalMessages: prev?.totalMessages + activeGroups?.length * 3
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [agentGroups]);

  const generateSamplePayload = (groupId) => {
    switch (groupId) {
      case 'data_phoenix':
        return {
          symbol: 'AAPL',
          price: (Math.random() * 200 + 100)?.toFixed(2),
          volume: Math.floor(Math.random() * 10000),
          source: 'market_data'
        };
      case 'quant_oracle':
        return {
          strategy_id: 'RSI_001',
          backtest_score: (Math.random() * 0.4 + 0.6)?.toFixed(3),
          sharpe_ratio: (Math.random() * 1.5 + 0.5)?.toFixed(2),
          max_drawdown: (Math.random() * -0.2)?.toFixed(3)
        };
      case 'strategy_weaver':
        return {
          signal: Math.random() > 0.5 ? 'BUY' : 'SELL',
          confidence: (Math.random() * 0.4 + 0.6)?.toFixed(2),
          indicator: 'RSI_ATR',
          symbol: 'MSFT'
        };
      default:
        return {};
    }
  };

  const activateAgentGroup = async (groupId) => {
    setIsOrchestrating(true);
    
    try {
      // Simulate activation process
      const group = agentGroups?.find(g => g?.id === groupId);
      addNatsMessage(`Activating ${group?.name} agent group...`, 'system', 'orchestrator.command');
      
      await simulateDelay(2000);
      
      // Start NATS consumers
      addNatsMessage(`Starting NATS consumers for ${group?.natsTopics?.join(', ')}`, 'system', 'nats.consumer');
      await simulateDelay(1500);
      
      // Activate agents
      setAgentGroups(prev => prev?.map(g => 
        g?.id === groupId ? {
          ...g,
          status: 'active',
          activeAgents: g?.agents,
          lastActivity: new Date()?.toISOString()
        } : g
      ));
      
      addNatsMessage(`✅ ${group?.name} activated with ${group?.agents} agents`, 'success', 'orchestrator.status');
      
      // Update orchestration status
      if (!orchestrationStatus?.natsConnected) {
        setOrchestrationStatus(prev => ({
          ...prev,
          natsConnected: true,
          redisConnected: true
        }));
      }
      
      // Calculate progress
      const activeGroups = agentGroups?.filter(g => g?.status === 'active' || g?.id === groupId)?.length;
      const progress = (activeGroups / 3) * 100;
      const status = activeGroups >= 3 ? 'completed' : 'in-progress';
      
      onProgressUpdate(progress, status);
      onSystemStatusUpdate(prev => ({
        ...prev,
        agents: { ...prev?.agents, active: activeGroups * 8 }
      }));
      
    } catch (error) {
      addNatsMessage(`❌ Error activating ${groupId}: ${error?.message}`, 'error', 'orchestrator.error');
    } finally {
      setIsOrchestrating(false);
    }
  };

  const deactivateAgentGroup = async (groupId) => {
    const group = agentGroups?.find(g => g?.id === groupId);
    
    setAgentGroups(prev => prev?.map(g => 
      g?.id === groupId ? {
        ...g,
        status: 'inactive',
        activeAgents: 0,
        throughput: 0
      } : g
    ));
    
    addNatsMessage(`🔴 ${group?.name} deactivated`, 'warning', 'orchestrator.status');
    
    // Update progress
    const activeGroups = agentGroups?.filter(g => g?.status === 'active' && g?.id !== groupId)?.length;
    const progress = (activeGroups / 3) * 100;
    const status = activeGroups >= 3 ? 'completed' : activeGroups > 0 ? 'in-progress' : 'pending';
    
    onProgressUpdate(progress, status);
    onSystemStatusUpdate(prev => ({
      ...prev,
      agents: { ...prev?.agents, active: activeGroups * 8 }
    }));
  };

  const activateAllGroups = async () => {
    setIsOrchestrating(true);
    
    for (const group of agentGroups) {
      if (group?.status === 'inactive') {
        await activateAgentGroup(group?.id);
        await simulateDelay(1000);
      }
    }
    
    setIsOrchestrating(false);
  };

  const addNatsMessage = (message, type, topic) => {
    const newMessage = {
      id: Date.now(),
      timestamp: new Date()?.toISOString(),
      topic,
      source: 'orchestrator',
      type,
      message
    };
    
    setNatsMessages(prev => [newMessage, ...prev?.slice(0, 49)]);
  };

  const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-orange-400';
      case 'system':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          Stage 3: Activation des Agents IA (NATS/Redis)
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={activateAllGroups}
            disabled={isOrchestrating || agentGroups?.every(g => g?.status === 'active')}
            className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-400/50 rounded-lg hover:bg-purple-600/30 disabled:opacity-50 flex items-center gap-2"
          >
            {isOrchestrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {isOrchestrating ? 'Orchestrating...' : 'Activate All'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Agent Groups Control */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">AI Agent Groups</h3>
          
          {agentGroups?.map((group) => (
            <div key={group?.id} className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              group?.status === 'active' 
                ? `border-${group?.color}-400/50 bg-${group?.color}-400/5` 
                : 'border-gray-600 bg-gray-800/30'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-${group?.color}-400/10`}>
                    {group?.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">{group?.name}</h4>
                    <p className="text-sm text-gray-400">{group?.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(group?.status)}`}>
                    {group?.status}
                  </span>
                  
                  {group?.status === 'inactive' ? (
                    <button
                      onClick={() => activateAgentGroup(group?.id)}
                      disabled={isOrchestrating}
                      className={`p-2 bg-${group?.color}-600/20 text-${group?.color}-400 border border-${group?.color}-400/50 rounded-lg hover:bg-${group?.color}-600/30 disabled:opacity-50`}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => deactivateAgentGroup(group?.id)}
                      className="p-2 bg-red-600/20 text-red-400 border border-red-400/50 rounded-lg hover:bg-red-600/30"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Agent Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-xs text-gray-400">Active Agents</div>
                  <div className="text-sm font-semibold text-white">{group?.activeAgents}/{group?.agents}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-xs text-gray-400">Throughput</div>
                  <div className="text-sm font-semibold text-white">{group?.throughput}/min</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-xs text-gray-400">Messages</div>
                  <div className="text-sm font-semibold text-white">{group?.messagesProcessed}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-2">
                  <div className="text-xs text-gray-400">Last Activity</div>
                  <div className="text-xs text-gray-300">
                    {group?.lastActivity 
                      ? new Date(group.lastActivity)?.toLocaleTimeString()
                      : 'Never'
                    }
                  </div>
                </div>
              </div>
              
              {/* NATS Topics */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">NATS Topics:</div>
                <div className="flex flex-wrap gap-1">
                  {group?.natsTopics?.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-900/50 text-xs text-gray-300 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Functions */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Functions:</div>
                <div className="text-xs text-gray-300">
                  {group?.functions?.join(' • ')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NATS/Redis Messaging Monitor */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">NATS/Redis Messaging Hub</h3>
          
          {/* Connection Status */}
          <div className="bg-gray-900/50 rounded-lg border border-gray-600 p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Connection Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">NATS Server</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  orchestrationStatus?.natsConnected 
                    ? 'bg-green-400/10 text-green-400' :'bg-red-400/10 text-red-400'
                }`}>
                  {orchestrationStatus?.natsConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Redis Pub/Sub</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  orchestrationStatus?.redisConnected 
                    ? 'bg-green-400/10 text-green-400' :'bg-red-400/10 text-red-400'
                }`}>
                  {orchestrationStatus?.redisConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Messages</span>
                <span className="text-sm text-white">{orchestrationStatus?.totalMessages}</span>
              </div>
            </div>
          </div>
          
          {/* Message Stream */}
          <div className="bg-gray-900/50 rounded-lg border border-gray-600 p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Live Message Stream
            </h4>
            
            <div className="h-80 overflow-y-auto font-mono text-xs space-y-1">
              {natsMessages?.length === 0 ? (
                <div className="text-gray-500 text-center mt-8">
                  No messages yet... Activate agents to start receiving messages
                </div>
              ) : (
                natsMessages?.map((msg) => (
                  <div key={msg?.id} className="border-b border-gray-700 pb-1 mb-1 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500">
                        [{new Date(msg.timestamp)?.toLocaleTimeString()}]
                      </span>
                      <span className="text-xs text-blue-400">{msg?.topic}</span>
                    </div>
                    
                    {msg?.message ? (
                      <div className={getMessageColor(msg?.type)}>{msg?.message}</div>
                    ) : (
                      <div className="text-gray-300">
                        <span className="text-yellow-400">{msg?.source}:</span>{' '}
                        {JSON.stringify(msg?.payload || {}, null, 0)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Orchestration Progress</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {agentGroups?.filter(g => g?.status === 'active')?.length}/3
            </div>
            <div className="text-xs text-gray-400">Active Groups</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {agentGroups?.reduce((sum, g) => sum + g?.activeAgents, 0)}/24
            </div>
            <div className="text-xs text-gray-400">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {agentGroups?.reduce((sum, g) => sum + g?.messagesProcessed, 0)}
            </div>
            <div className="text-xs text-gray-400">Messages Processed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {agentGroups?.reduce((sum, g) => sum + g?.throughput, 0)}/min
            </div>
            <div className="text-xs text-gray-400">Total Throughput</div>
          </div>
        </div>
      </div>
    </div>
  );
}