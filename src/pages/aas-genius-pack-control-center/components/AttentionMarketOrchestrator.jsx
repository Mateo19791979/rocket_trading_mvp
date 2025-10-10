import { useState, useEffect } from 'react';
import { Zap, DollarSign, Users, TrendingUp, Play, RotateCw, Clock, Trophy } from 'lucide-react';
import { attentionMarketService } from '../../../services/attentionMarket.js';

export default function AttentionMarketOrchestrator({ onLogAdd }) {
  const [bids, setBids] = useState([]);
  const [pendingBids, setPendingBids] = useState([]);
  const [stats, setStats] = useState({
    total_bids: 0,
    pending_bids: 0,
    won_bids: 0,
    total_budget_used: 0,
    remaining_budget: 1000000,
    market_efficiency: 0,
    agent_stats: {}
  });
  const [loading, setLoading] = useState({
    bids: true,
    resolving: false
  });
  const [newBid, setNewBid] = useState({
    agent: '',
    taskId: '',
    bidAmount: '',
    priority: 5
  });
  const [suggestedBid, setSuggestedBid] = useState(null);

  const predefinedAgents = [
    'strategy_weaver',
    'execution_guru', 
    'options_screener',
    'sentiment_analyzer',
    'risk_controller',
    'market_scanner',
    'data_processor',
    'alert_manager'
  ];

  const taskTypes = [
    'analyze',
    'optimize',
    'scan',
    'process',
    'monitor',
    'execute',
    'validate',
    'report'
  ];

  const loadAllData = async () => {
    await Promise.all([
      loadBids(),
      loadPendingBids(),
      loadStats()
    ]);
  };

  const loadBids = async () => {
    setLoading(prev => ({ ...prev, bids: true }));
    try {
      const result = await attentionMarketService?.getBids(50);
      if (result?.success) {
        setBids(result?.bids || []);
      }
    } catch (error) {
      onLogAdd?.(`Error loading bids: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, bids: false }));
    }
  };

  const loadPendingBids = async () => {
    try {
      const result = await attentionMarketService?.getPendingBids();
      if (result?.success) {
        setPendingBids(result?.pending_bids || []);
      }
    } catch (error) {
      onLogAdd?.(`Error loading pending bids: ${error?.message}`, 'error');
    }
  };

  const loadStats = async () => {
    try {
      const result = await attentionMarketService?.getMarketStats();
      if (result?.success) {
        setStats(result?.stats);
      }
    } catch (error) {
      onLogAdd?.(`Error loading market stats: ${error?.message}`, 'error');
    }
  };

  useEffect(() => {
    loadAllData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Get bid suggestion when task type changes
    if (newBid?.taskId) {
      getSuggestedBidAmount();
    }
  }, [newBid?.taskId, newBid?.priority]);

  const getSuggestedBidAmount = async () => {
    if (!newBid?.taskId) return;
    
    try {
      const taskType = newBid?.taskId?.split(':')?.[0]; // Extract type from "analyze:TSLA"
      const result = await attentionMarketService?.suggestBidAmount(taskType, newBid?.priority);
      if (result?.success) {
        setSuggestedBid(result);
      }
    } catch (error) {
      setSuggestedBid(null);
    }
  };

  const submitNewBid = async () => {
    if (!newBid?.agent || !newBid?.taskId || !newBid?.bidAmount) {
      onLogAdd?.('Please fill all bid fields', 'error');
      return;
    }

    try {
      const result = await attentionMarketService?.submitBid(
        newBid?.agent,
        newBid?.taskId,
        parseInt(newBid?.bidAmount),
        parseInt(newBid?.priority)
      );

      if (result?.success) {
        onLogAdd?.(`Bid submitted: ${newBid?.agent} bid ${newBid?.bidAmount} tokens for ${newBid?.taskId}`, 'success');
        setNewBid({ agent: '', taskId: '', bidAmount: '', priority: 5 });
        setSuggestedBid(null);
        loadAllData();
      } else {
        onLogAdd?.(`Bid submission failed: ${result?.error}`, 'error');
      }
    } catch (error) {
      onLogAdd?.(`Bid submission error: ${error?.message}`, 'error');
    }
  };

  const resolveBids = async () => {
    setLoading(prev => ({ ...prev, resolving: true }));
    try {
      onLogAdd?.('Starting attention market auction resolution...', 'info');
      
      const result = await attentionMarketService?.resolveBids();
      
      if (result?.success) {
        onLogAdd?.(`Auction resolved! ${result?.winners?.length} winners, ${result?.bids_resolved} bids processed, ${result?.total_spent} tokens spent`, 'success');
        loadAllData();
      } else {
        onLogAdd?.(`Auction resolution failed: ${result?.error}`, 'error');
      }
    } catch (error) {
      onLogAdd?.(`Resolution error: ${error?.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, resolving: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'won': return 'text-green-400';
      case 'lost': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return Trophy;
      case 'lost': return 'X';
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const formatTokens = (amount) => {
    return (amount || 0)?.toLocaleString() + ' tokens';
  };

  const getBudgetPercentage = () => {
    const totalBudget = 1000000;
    return ((stats?.total_budget_used / totalBudget) * 100)?.toFixed(1);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Zap className="w-8 h-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Attention Market Orchestrator</h2>
            <p className="text-gray-400">Internal Resource Allocation Bidding System</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadAllData}
            disabled={loading?.bids}
            className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${loading?.bids ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={resolveBids}
            disabled={loading?.resolving || pendingBids?.length === 0}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading?.resolving ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Resolve Auction</span>
          </button>
        </div>
      </div>
      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg border border-yellow-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Active Bids</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.pending_bids}</div>
          <div className="text-xs text-gray-400">{stats?.total_bids} total</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-yellow-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Budget Used</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{getBudgetPercentage()}%</div>
          <div className="text-xs text-gray-400">{formatTokens(stats?.remaining_budget)} left</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-yellow-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats?.market_efficiency}%</div>
          <div className="text-xs text-gray-400">{stats?.won_bids} won bids</div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-yellow-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Active Agents</span>
          </div>
          <div className="text-2xl font-bold text-white">{Object.keys(stats?.agent_stats || {})?.length}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Submit New Bid */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Play className="w-5 h-5 text-yellow-400" />
            <span>Submit Attention Bid</span>
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent
                </label>
                <select
                  value={newBid?.agent}
                  onChange={(e) => setNewBid(prev => ({ ...prev, agent: e?.target?.value }))}
                  className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
                >
                  <option value="">Select agent...</option>
                  {predefinedAgents?.map((agent) => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={newBid?.priority}
                  onChange={(e) => setNewBid(prev => ({ ...prev, priority: parseInt(e?.target?.value) }))}
                  className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
                >
                  <option value={1}>1 (Low)</option>
                  <option value={3}>3 (Below Average)</option>
                  <option value={5}>5 (Normal)</option>
                  <option value={7}>7 (High)</option>
                  <option value={9}>9 (Critical)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task ID (format: type:target)
              </label>
              <div className="flex space-x-2">
                <select
                  value={newBid?.taskId?.split(':')?.[0] || ''}
                  onChange={(e) => {
                    const type = e?.target?.value;
                    const target = newBid?.taskId?.split(':')?.[1] || '';
                    setNewBid(prev => ({ ...prev, taskId: `${type}:${target}` }));
                  }}
                  className="flex-1 bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
                >
                  <option value="">Select type...</option>
                  {taskTypes?.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="target (e.g., TSLA)"
                  value={newBid?.taskId?.split(':')?.[1] || ''}
                  onChange={(e) => {
                    const type = newBid?.taskId?.split(':')?.[0] || '';
                    setNewBid(prev => ({ ...prev, taskId: `${type}:${e?.target?.value}` }));
                  }}
                  className="flex-1 bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bid Amount (tokens)
                {suggestedBid && (
                  <span className="ml-2 text-yellow-400 text-xs">
                    Suggested: {suggestedBid?.suggested_bid?.toLocaleString()} ({suggestedBid?.confidence} confidence)
                  </span>
                )}
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Enter bid amount..."
                  value={newBid?.bidAmount}
                  onChange={(e) => setNewBid(prev => ({ ...prev, bidAmount: e?.target?.value }))}
                  className="flex-1 bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2"
                  min="1000"
                  max="100000"
                  step="1000"
                />
                {suggestedBid && (
                  <button
                    onClick={() => setNewBid(prev => ({ ...prev, bidAmount: suggestedBid?.suggested_bid?.toString() }))}
                    className="bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    Use Suggested
                  </button>
                )}
              </div>
              {suggestedBid && (
                <div className="mt-1 text-xs text-gray-400">
                  {suggestedBid?.reason}
                </div>
              )}
            </div>

            <button
              onClick={submitNewBid}
              disabled={!newBid?.agent || !newBid?.taskId || !newBid?.bidAmount}
              className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Bid
            </button>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <span>Agent Performance</span>
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(stats?.agent_stats || {})?.length > 0 ? (
              Object.entries(stats?.agent_stats)?.map(([agent, agentStats]) => (
                <div
                  key={agent}
                  className="bg-gray-600 p-3 rounded-lg border border-yellow-500/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{agent}</span>
                    <span className="text-yellow-400 text-sm font-bold">
                      {agentStats?.win_rate}% win rate
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
                    <div>
                      <div className="text-gray-400">Total Bids</div>
                      <div className="font-medium">{agentStats?.total_bids}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg Bid</div>
                      <div className="font-medium">{agentStats?.avg_bid?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Won</div>
                      <div className="font-medium text-green-400">{agentStats?.won}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                No agent performance data available
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bidding Activity */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span>Recent Bidding Activity</span>
        </h3>
        
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {loading?.bids ? (
              <div className="text-gray-400 text-center py-8">Loading bids...</div>
            ) : bids?.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-600 sticky top-0">
                  <tr>
                    <th className="text-left text-gray-300 p-3 text-sm">Agent</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Task</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Bid Amount</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Priority</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Status</th>
                    <th className="text-left text-gray-300 p-3 text-sm">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {bids?.map((bid) => {
                    const StatusIcon = getStatusIcon(bid?.status);
                    return (
                      <tr key={bid?.id} className="border-t border-gray-600 hover:bg-gray-600/50">
                        <td className="p-3 text-white text-sm font-medium">
                          {bid?.agent}
                        </td>
                        <td className="p-3 text-gray-300 text-sm">
                          {bid?.task_id}
                        </td>
                        <td className="p-3 text-white text-sm">
                          {formatTokens(bid?.bid_amount)}
                        </td>
                        <td className="p-3 text-gray-300 text-sm">
                          {bid?.task_priority}
                        </td>
                        <td className="p-3">
                          <div className={`flex items-center space-x-2 ${getStatusColor(bid?.status)}`}>
                            {typeof StatusIcon === 'string' ? (
                              <span className="text-sm font-bold">{StatusIcon}</span>
                            ) : (
                              <StatusIcon className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium capitalize">{bid?.status}</span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-300 text-sm">
                          {new Date(bid.created_at)?.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No bidding activity yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}