import React from 'react';
import { Brain, TrendingUp, Target, Activity, BarChart3 } from 'lucide-react';

export default function AgentBehaviorAnalytics({ 
  agents, 
  systemHealth, 
  selectedAgent, 
  agentTrades 
}) {
  const getSelectedAgentData = () => {
    if (!selectedAgent) return null;
    
    const allAgents = Object.values(agents)?.flat();
    const agent = allAgents?.find(a => a?.id === selectedAgent);
    const health = systemHealth?.find(h => h?.agent_id === selectedAgent);
    const trades = agentTrades?.filter(t => 
      t?.source_agent_id === selectedAgent || 
      t?.event_data?.ai_agent_id === selectedAgent
    );
    
    return { agent, health, trades };
  };

  const calculatePerformanceMetrics = (agent, trades) => {
    if (!agent) return {};
    
    const recentTrades = trades?.filter(t => 
      new Date(t?.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) || [];
    
    const avgConfidence = recentTrades?.reduce((sum, t) => 
      sum + (t?.event_data?.confidence_level || 0), 0
    ) / (recentTrades?.length || 1);
    
    const avgExecutionTime = recentTrades?.reduce((sum, t) => 
      sum + (t?.event_data?.execution_time_ms || 0), 0
    ) / (recentTrades?.length || 1);

    return {
      totalTrades: agent?.total_trades || 0,
      winRate: agent?.win_rate || 0,
      totalPnL: agent?.total_pnl || 0,
      recentTradesCount: recentTrades?.length || 0,
      avgConfidence: avgConfidence?.toFixed(1),
      avgExecutionTime: avgExecutionTime?.toFixed(0),
      strategy: agent?.strategy,
      riskLevel: agent?.risk_parameters?.max_position_size || 0
    };
  };

  const calculateBehavioralBaseline = (agent, health) => {
    if (!agent || !health) return {};
    
    // Compare current metrics against historical baselines
    const currentCpuUsage = health?.cpu_usage || 0;
    const currentMemoryUsage = health?.memory_usage || 0;
    const currentErrorCount = health?.error_count || 0;
    
    // Simulate historical baselines (in a real system, these would come from time-series data)
    const baselineCpu = 15 + Math.random() * 10;
    const baselineMemory = 12 + Math.random() * 8;
    const baselineErrors = Math.floor(Math.random() * 3);
    
    return {
      cpuDeviation: ((currentCpuUsage - baselineCpu) / baselineCpu * 100)?.toFixed(1),
      memoryDeviation: ((currentMemoryUsage - baselineMemory) / baselineMemory * 100)?.toFixed(1),
      errorDeviation: currentErrorCount - baselineErrors,
      baselineCpu: baselineCpu?.toFixed(1),
      baselineMemory: baselineMemory?.toFixed(1),
      baselineErrors
    };
  };

  const getLearningProgression = (agent, trades) => {
    if (!trades?.length) return { progress: 0, trend: 'stable' };
    
    // Analyze confidence levels over time to show learning progression
    const sortedTrades = [...trades]?.sort((a, b) => new Date(a?.created_at) - new Date(b?.created_at));
    const recentConfidence = sortedTrades?.slice(-10)?.reduce((sum, t) => sum + (t?.event_data?.confidence_level || 0), 0) / 10;
    const olderConfidence = sortedTrades?.slice(-20, -10)?.reduce((sum, t) => sum + (t?.event_data?.confidence_level || 0), 0) / 10;
    
    const improvement = recentConfidence - olderConfidence;
    
    return {
      progress: recentConfidence?.toFixed(1),
      trend: improvement > 2 ? 'improving' : improvement < -2 ? 'declining' : 'stable',
      improvement: improvement?.toFixed(1)
    };
  };

  const selectedData = getSelectedAgentData();
  
  if (!selectedAgent || !selectedData?.agent) {
    return (
      <div className="h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center">
            <Brain className="w-4 h-4 mr-2 text-teal-400" />
            Agent Behavior Analytics
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">Select an Agent</p>
            <p className="text-sm">Click on an activity in the feed to analyze agent behavior</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = calculatePerformanceMetrics(selectedData?.agent, selectedData?.trades);
  const baseline = calculateBehavioralBaseline(selectedData?.agent, selectedData?.health);
  const learning = getLearningProgression(selectedData?.agent, selectedData?.trades);

  return (
    <div className="h-full p-4 overflow-y-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center">
          <Brain className="w-4 h-4 mr-2 text-teal-400" />
          Agent Behavior Analytics
        </h2>
        <div className="text-xs text-teal-400">
          {selectedData?.agent?.name || `Agent ${selectedAgent?.slice(0, 8)}`}
        </div>
      </div>
      {/* Agent Overview */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Agent Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Strategy:</div>
            <div className="text-sm font-medium text-white capitalize">
              {metrics?.strategy?.replace(/_/g, ' ')}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Status:</div>
            <div className={`text-sm font-medium ${
              selectedData?.agent?.agent_status === 'active' ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedData?.agent?.agent_status?.toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Group:</div>
            <div className="text-sm font-medium text-blue-400 capitalize">
              {selectedData?.agent?.agent_group || 'Unknown'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Autonomous:</div>
            <div className={`text-sm font-medium ${
              selectedData?.agent?.is_autonomous ? 'text-green-400' : 'text-orange-400'
            }`}>
              {selectedData?.agent?.is_autonomous ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <BarChart3 className="w-3 h-3 mr-1" />
          Performance Metrics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Processing Latency:</span>
            <span className="text-sm font-medium text-yellow-400">
              {metrics?.avgExecutionTime}ms avg
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Decision Accuracy:</span>
            <span className="text-sm font-medium text-green-400">
              {metrics?.winRate?.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Resource Consumption:</span>
            <span className="text-sm font-medium text-blue-400">
              {selectedData?.health?.cpu_usage?.toFixed(1)}% CPU
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Total Trades:</span>
            <span className="text-sm font-medium text-white">
              {metrics?.totalTrades}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">P&L:</span>
            <span className={`text-sm font-medium ${
              metrics?.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${metrics?.totalPnL?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      {/* Behavioral Baseline Comparison */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Target className="w-3 h-3 mr-1" />
          Baseline Comparison
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">CPU Usage:</span>
            <div className="text-right">
              <span className="text-sm font-medium text-white">
                {selectedData?.health?.cpu_usage?.toFixed(1)}%
              </span>
              <span className={`text-xs ml-2 ${
                parseFloat(baseline?.cpuDeviation) > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                ({baseline?.cpuDeviation > 0 ? '+' : ''}{baseline?.cpuDeviation}%)
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Memory Usage:</span>
            <div className="text-right">
              <span className="text-sm font-medium text-white">
                {selectedData?.health?.memory_usage?.toFixed(1)}%
              </span>
              <span className={`text-xs ml-2 ${
                parseFloat(baseline?.memoryDeviation) > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                ({baseline?.memoryDeviation > 0 ? '+' : ''}{baseline?.memoryDeviation}%)
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Error Rate:</span>
            <div className="text-right">
              <span className="text-sm font-medium text-white">
                {selectedData?.health?.error_count || 0}
              </span>
              <span className={`text-xs ml-2 ${
                baseline?.errorDeviation > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                ({baseline?.errorDeviation > 0 ? '+' : ''}{baseline?.errorDeviation})
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Learning Progression */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" />
          Learning Progression
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Current Confidence:</span>
            <span className="text-sm font-medium text-blue-400">
              {learning?.progress}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Learning Trend:</span>
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-medium ${
                learning?.trend === 'improving' ? 'text-green-400' : 
                learning?.trend === 'declining' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {learning?.trend?.toUpperCase()}
              </span>
              {learning?.trend !== 'stable' && (
                <span className="text-xs text-gray-400">
                  ({learning?.improvement > 0 ? '+' : ''}{learning?.improvement}%)
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Recent Activity:</span>
            <span className="text-sm font-medium text-white">
              {metrics?.recentTradesCount} actions (24h)
            </span>
          </div>
        </div>
      </div>
      {/* Health Status */}
      {selectedData?.health && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            System Health
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Health Status:</span>
              <span className={`text-sm font-medium ${
                selectedData?.health?.health_status === 'healthy' ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedData?.health?.health_status?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Last Heartbeat:</span>
              <span className="text-sm text-gray-300">
                {new Date(selectedData?.health?.last_heartbeat)?.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Warnings:</span>
              <span className={`text-sm font-medium ${
                selectedData?.health?.warning_count > 0 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {selectedData?.health?.warning_count || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}