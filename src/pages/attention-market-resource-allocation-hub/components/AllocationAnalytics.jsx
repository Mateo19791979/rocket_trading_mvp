import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Clock, 
  Zap,
  Target,
  Award,
  Users,
  DollarSign,
  Cpu,
  HardDrive
} from 'lucide-react';
import Icon from '@/components/AppIcon';


export default function AllocationAnalytics({ resourceMetrics, agentPerformance, marketState }) {
  const [selectedMetric, setSelectedMetric] = useState('efficiency');
  const [timeRange, setTimeRange] = useState('24h');

  // Calculate derived analytics
  const analytics = useMemo(() => {
    if (!resourceMetrics || !marketState) return null;

    const totalAllocated = resourceMetrics?.totalResourcesAllocated || 0;
    const avgDuration = resourceMetrics?.averageTaskDuration || 0;
    const totalBids = marketState?.totalBids || 0;
    const wonBids = marketState?.wonBids || 0;
    
    return {
      allocationTrends: {
        totalAllocated,
        growthRate: Math.random() * 10 - 5, // Simulated growth rate
        efficiency: resourceMetrics?.resourceUtilizationRate || 0,
        avgDuration
      },
      resourceDistribution: {
        cpu: Math.floor(Math.random() * 40 + 30),
        memory: Math.floor(Math.random() * 30 + 20),
        gpu: Math.floor(Math.random() * 20 + 10),
        network: Math.floor(Math.random() * 15 + 5)
      },
      performanceCorrelation: {
        highPerformers: agentPerformance?.filter(agent => agent?.successRate > 70)?.length || 0,
        mediumPerformers: agentPerformance?.filter(agent => agent?.successRate >= 40 && agent?.successRate <= 70)?.length || 0,
        lowPerformers: agentPerformance?.filter(agent => agent?.successRate < 40)?.length || 0
      },
      costEfficiency: {
        avgCostPerTask: totalAllocated / Math.max(wonBids, 1),
        budgetUtilization: parseFloat(marketState?.budgetUtilization) || 0,
        roi: ((wonBids / Math.max(totalBids, 1)) * 100 - 50) // Simplified ROI calculation
      }
    };
  }, [resourceMetrics, agentPerformance, marketState]);

  if (!analytics) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="text-center text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'efficiency': return TrendingUp;
      case 'distribution': return PieChart;
      case 'performance': return Award;
      case 'cost': return DollarSign;
      default: return BarChart3;
    }
  };

  const renderEfficiencyAnalytics = () => (
    <div className="space-y-6">
      {/* Efficiency Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {analytics?.allocationTrends?.efficiency?.toFixed(1)}%
          </div>
          <div className="text-gray-400 text-sm">Resource Utilization</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {analytics?.allocationTrends?.avgDuration?.toFixed(0)}m
          </div>
          <div className="text-gray-400 text-sm">Avg Task Duration</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {analytics?.allocationTrends?.growthRate > 0 ? '+' : ''}{analytics?.allocationTrends?.growthRate?.toFixed(1)}%
          </div>
          <div className="text-gray-400 text-sm">Growth Rate</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {analytics?.allocationTrends?.totalAllocated?.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">Total Allocated</div>
        </div>
      </div>

      {/* Efficiency Trends Chart Placeholder */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Allocation Efficiency Trends</h4>
        <div className="flex items-end justify-between h-32 bg-gray-800/50 rounded p-4">
          {[...Array(12)]?.map((_, i) => (
            <div 
              key={i}
              className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                width: '6%'
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>12h ago</span>
          <span>6h ago</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );

  const renderDistributionAnalytics = () => (
    <div className="space-y-6">
      {/* Resource Distribution */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Resource Allocation Distribution</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span className="text-white">CPU Cores</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${analytics?.resourceDistribution?.cpu}%` }}
                />
              </div>
              <span className="text-white text-sm w-12 text-right">
                {analytics?.resourceDistribution?.cpu}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-5 h-5 text-green-400" />
              <span className="text-white">Memory</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analytics?.resourceDistribution?.memory}%` }}
                />
              </div>
              <span className="text-white text-sm w-12 text-right">
                {analytics?.resourceDistribution?.memory}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white">GPU</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${analytics?.resourceDistribution?.gpu}%` }}
                />
              </div>
              <span className="text-white text-sm w-12 text-right">
                {analytics?.resourceDistribution?.gpu}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-white">Network</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${analytics?.resourceDistribution?.network}%` }}
                />
              </div>
              <span className="text-white text-sm w-12 text-right">
                {analytics?.resourceDistribution?.network}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Type Distribution */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Task Type Distribution</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: 'Analysis', count: 45, color: 'bg-blue-500' },
            { type: 'Training', count: 28, color: 'bg-green-500' },
            { type: 'Optimization', count: 18, color: 'bg-yellow-500' },
            { type: 'Monitoring', count: 9, color: 'bg-purple-500' }
          ]?.map(task => (
            <div key={task?.type} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded ${task?.color}`}></div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{task?.type}</div>
                <div className="text-gray-400 text-xs">{task?.count} tasks</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceAnalytics = () => (
    <div className="space-y-6">
      {/* Performance Distribution */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Agent Performance Distribution</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-white">High Performers (&gt;70%)</span>
            </div>
            <span className="text-green-400 font-semibold">
              {analytics?.performanceCorrelation?.highPerformers} agents
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-white">Medium Performers (40-70%)</span>
            </div>
            <span className="text-yellow-400 font-semibold">
              {analytics?.performanceCorrelation?.mediumPerformers} agents
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-white">Low Performers (&lt;40%)</span>
            </div>
            <span className="text-red-400 font-semibold">
              {analytics?.performanceCorrelation?.lowPerformers} agents
            </span>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Top Performing Agents</h4>
        <div className="space-y-3">
          {agentPerformance?.slice(0, 5)?.map((agent, index) => (
            <div key={agent?.agent || index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-medium">{agent?.agent}</div>
                  <div className="text-gray-400 text-sm">
                    {agent?.wonBids}/{agent?.totalBids} wins
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  {agent?.successRate?.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">
                  {agent?.totalSpent?.toLocaleString()} tokens
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-4">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No performance data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCostAnalytics = () => (
    <div className="space-y-6">
      {/* Cost Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {analytics?.costEfficiency?.avgCostPerTask?.toFixed(0)}
          </div>
          <div className="text-gray-400 text-sm">Avg Cost/Task</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {analytics?.costEfficiency?.budgetUtilization?.toFixed(1)}%
          </div>
          <div className="text-gray-400 text-sm">Budget Utilized</div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4 text-center">
          <div className={`text-2xl font-bold mb-1 ${
            analytics?.costEfficiency?.roi > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {analytics?.costEfficiency?.roi > 0 ? '+' : ''}{analytics?.costEfficiency?.roi?.toFixed(1)}%
          </div>
          <div className="text-gray-400 text-sm">ROI</div>
        </div>
      </div>

      {/* Cost Optimization Recommendations */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4">Cost Optimization Insights</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
            <Target className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h5 className="text-blue-400 font-medium">Optimization Opportunity</h5>
              <p className="text-gray-300 text-sm">
                Reduce average bid amounts by 15% while maintaining 90% success rate
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-900/30 rounded-lg border border-green-700">
            <Award className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h5 className="text-green-400 font-medium">High Efficiency</h5>
              <p className="text-gray-300 text-sm">
                Current resource allocation efficiency is above target (85%)
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
            <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h5 className="text-yellow-400 font-medium">Duration Variance</h5>
              <p className="text-gray-300 text-sm">
                Some tasks taking 20% longer than estimated - review resource requirements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Allocation Analytics</h3>
              <p className="text-gray-400 text-sm">Resource utilization patterns and optimization insights</p>
            </div>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center space-x-2 mb-6 bg-gray-900/50 rounded-lg p-2">
          {[
            { id: 'efficiency', label: 'Efficiency', icon: TrendingUp },
            { id: 'distribution', label: 'Distribution', icon: PieChart },
            { id: 'performance', label: 'Performance', icon: Award },
            { id: 'cost', label: 'Cost Analysis', icon: DollarSign }
          ]?.map(metric => {
            const Icon = metric?.icon;
            return (
              <button
                key={metric?.id}
                onClick={() => setSelectedMetric(metric?.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  selectedMetric === metric?.id
                    ? 'bg-blue-600 text-white' :'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{metric?.label}</span>
              </button>
            );
          })}
        </div>

        {/* Analytics Content */}
        <div>
          {selectedMetric === 'efficiency' && renderEfficiencyAnalytics()}
          {selectedMetric === 'distribution' && renderDistributionAnalytics()}
          {selectedMetric === 'performance' && renderPerformanceAnalytics()}
          {selectedMetric === 'cost' && renderCostAnalytics()}
        </div>
      </div>
    </div>
  );
}