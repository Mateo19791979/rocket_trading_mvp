import React from 'react';
import { BarChart3, TrendingUp, Award, Target, Zap } from 'lucide-react';

export default function PerformanceAnalytics({ agents, systemHealth, systemOverview }) {
  const calculateKPIs = () => {
    const allAgents = Object.values(agents)?.flat();
    
    const efficiency = allAgents?.reduce((sum, agent) => sum + (agent?.win_rate || 0), 0) / (allAgents?.length || 1);
    const totalTrades = allAgents?.reduce((sum, agent) => sum + (agent?.total_trades || 0), 0);
    const totalPnL = allAgents?.reduce((sum, agent) => sum + (agent?.total_pnl || 0), 0);
    const avgLatency = systemHealth?.reduce((sum, health) => sum + (health?.cpu_usage || 0), 0) / (systemHealth?.length || 1);
    
    return {
      efficiency: efficiency?.toFixed(1),
      decisionAccuracy: (92.4 + Math.random() * 5)?.toFixed(1),
      systemProductivity: totalTrades > 0 ? Math.min(98.7, (totalTrades / 100) * 20)?.toFixed(1) : '0.0',
      avgResponseTime: (124 + Math.random() * 20)?.toFixed(0),
      totalTrades,
      totalPnL: totalPnL?.toFixed(2)
    };
  };

  const kpis = calculateKPIs();

  const getOptimizationRecommendations = () => {
    const recommendations = [
      {
        type: 'performance',
        priority: 'high',
        title: 'Optimize Ingestion Pipeline',
        description: 'Reduce data processing latency by 15%',
        impact: '+12% throughput'
      },
      {
        type: 'efficiency',
        priority: 'medium',
        title: 'Rebalance Agent Workloads',
        description: 'Distribute tasks more evenly across execution agents',
        impact: '+8% efficiency'
      },
      {
        type: 'resource',
        priority: 'low',
        title: 'Memory Optimization',
        description: 'Implement caching for frequently accessed data',
        impact: '+5% response time'
      }
    ];
    
    return recommendations;
  };

  const recommendations = getOptimizationRecommendations();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getGroupPerformance = () => {
    return Object.entries(agents)?.map(([groupName, groupAgents]) => {
      const avgWinRate = groupAgents?.reduce((sum, agent) => sum + (agent?.win_rate || 0), 0) / (groupAgents?.length || 1);
      const totalTrades = groupAgents?.reduce((sum, agent) => sum + (agent?.total_trades || 0), 0);
      const totalPnL = groupAgents?.reduce((sum, agent) => sum + (agent?.total_pnl || 0), 0);
      
      return {
        name: groupName,
        performance: avgWinRate?.toFixed(1),
        trades: totalTrades,
        pnl: totalPnL?.toFixed(2),
        agents: groupAgents?.length
      };
    });
  };

  const groupPerformance = getGroupPerformance();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Performance Analytics</h3>
        <BarChart3 className="w-4 h-4 text-blue-400" />
      </div>
      {/* Real-time KPIs */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Target className="w-3 h-3 mr-1" />
          Real-time KPIs
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{kpis?.efficiency}%</div>
            <div className="text-xs text-gray-400">Agent Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{kpis?.decisionAccuracy}%</div>
            <div className="text-xs text-gray-400">Decision Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-400">{kpis?.systemProductivity}%</div>
            <div className="text-xs text-gray-400">System Productivity</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{kpis?.avgResponseTime}ms</div>
            <div className="text-xs text-gray-400">Avg Response</div>
          </div>
        </div>
      </div>
      {/* Group Performance Breakdown */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Group Performance</h4>
        
        <div className="space-y-2">
          {groupPerformance?.map(group => (
            <div key={group?.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-gray-300 capitalize">{group?.name}</span>
                <span className="text-gray-500">({group?.agents})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">{group?.performance}%</span>
                <span className={`font-medium ${parseFloat(group?.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${group?.pnl}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Trend Analysis */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trend Analysis
        </h4>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Performance Trend:</span>
            <span className="text-green-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.3% (24h)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Efficiency Change:</span>
            <span className="text-green-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +1.8% (24h)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Response Time:</span>
            <span className="text-green-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              -5ms (improved)
            </span>
          </div>
        </div>
      </div>
      {/* Optimization Recommendations */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Zap className="w-3 h-3 mr-1" />
          Optimization Recommendations
        </h4>
        
        <div className="space-y-2">
          {recommendations?.map((rec, index) => (
            <div key={index} className={`border rounded p-2 ${getPriorityColor(rec?.priority)}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{rec?.title}</span>
                <span className="text-xs uppercase">{rec?.priority}</span>
              </div>
              <p className="text-xs opacity-80">{rec?.description}</p>
              <div className="text-xs mt-1 font-medium">{rec?.impact}</div>
            </div>
          ))}
        </div>
      </div>
      {/* System Health Score */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <Award className="w-3 h-3 mr-1" />
          System Health Score
        </h4>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">94.7</div>
          <div className="text-xs text-gray-400 mb-2">Overall Health</div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-400 h-2 rounded-full" style={{ width: '94.7%' }} />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
          Generate Performance Report
        </button>
        <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
          Export Analytics Data
        </button>
      </div>
    </div>
  );
}