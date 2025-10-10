import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Users, 
  Zap,
  Target,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function MarketActivityDashboard({ marketState, resourceMetrics }) {
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    auctionsPerMinute: 0,
    avgBidValue: 0,
    marketEfficiency: 0,
    activeAgents: 0
  });
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics({
        auctionsPerMinute: Math.floor(Math.random() * 10) + 2,
        avgBidValue: Math.floor(Math.random() * 5000) + 3000,
        marketEfficiency: Math.random() * 20 + 75,
        activeAgents: Math.floor(Math.random() * 5) + 8
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'lost': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'text-red-400 bg-red-900/30';
    if (priority >= 6) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-green-400 bg-green-900/30';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Market Activity Dashboard</h3>
              <p className="text-gray-400 text-sm">Live auction monitoring and efficiency metrics</p>
            </div>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-2 bg-gray-900/50 rounded-lg p-1">
            {['15m', '1h', '6h', '24h']?.map(timeframe => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white' :'text-gray-400 hover:text-white'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Auctions/Min</p>
                <p className="text-2xl font-bold text-white">
                  {realtimeMetrics?.auctionsPerMinute}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-blue-400 text-xs">Live</span>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Bid</p>
                <p className="text-2xl font-bold text-white">
                  {realtimeMetrics?.avgBidValue?.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-green-400 text-xs mt-2">
              +{((Math.random() - 0.5) * 10)?.toFixed(1)}% vs avg
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Efficiency</p>
                <p className="text-2xl font-bold text-white">
                  {realtimeMetrics?.marketEfficiency?.toFixed(1)}%
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-purple-400 text-xs mt-2">
              Market Performance
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Agents</p>
                <p className="text-2xl font-bold text-white">
                  {realtimeMetrics?.activeAgents}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
            <div className="text-orange-400 text-xs mt-2">
              Currently Bidding
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h4 className="text-white font-semibold">Live Activity Feed</h4>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Real-time</span>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {marketState?.recentBids?.slice(0, 8)?.map((bid, index) => (
              <div key={bid?.id || index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(bid?.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">{bid?.agent}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bid?.task_priority)}`}>
                        P{bid?.task_priority}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">{bid?.task_id}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white text-sm font-semibold">
                    {bid?.bid_amount?.toLocaleString()} tokens
                  </div>
                  <div className="text-gray-400 text-xs">
                    {formatTimestamp(bid?.created_at)}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Market Performance Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allocation Efficiency */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">Allocation Efficiency</h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Resource Utilization</span>
                <span className="text-white font-semibold">
                  {resourceMetrics?.resourceUtilizationRate?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, resourceMetrics?.resourceUtilizationRate || 0)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Task Completion Rate</span>
                <span className="text-white font-semibold">
                  {((marketState?.wonBids / Math.max(marketState?.totalBids, 1)) * 100 || 0)?.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(marketState?.wonBids / Math.max(marketState?.totalBids, 1)) * 100 || 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">High Priority Success</span>
                <span className="text-white font-semibold">
                  {resourceMetrics?.highPriorityAllocationRate?.toFixed(1) || '0'}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, resourceMetrics?.highPriorityAllocationRate || 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Agent Performance Distribution */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-orange-400" />
              <h4 className="text-white font-semibold">Agent Performance</h4>
            </div>

            <div className="space-y-3">
              {marketState?.agentActivity && Object.entries(marketState?.agentActivity)?.sort(([,a], [,b]) => b?.successRate - a?.successRate)?.slice(0, 5)?.map(([agentName, agent]) => (
                  <div key={agentName} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-white text-sm font-medium truncate max-w-24">
                        {agentName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {agent?.successRate?.toFixed(1)}%
                        </div>
                        <div className="text-gray-400 text-xs">
                          {agent?.wonBids}/{agent?.totalBids}
                        </div>
                      </div>
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, agent?.successRate || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-4">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No agent activity data</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}