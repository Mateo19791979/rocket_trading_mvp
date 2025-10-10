import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Clock, Target, PlayCircle, PauseCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AttentionAuctionEngine({ marketState, onBidSubmission, onBidResolution }) {
  const [newBid, setNewBid] = useState({
    agent: '',
    taskId: '',
    bidAmount: 5000,
    priority: 5,
    computationalResources: {
      cpu_cores: 2,
      memory_gb: 4,
      gpu_required: false,
      estimated_duration: 30
    }
  });
  const [submittingBid, setSubmittingBid] = useState(false);
  const [resolvingBids, setResolvingBids] = useState(false);
  const [message, setMessage] = useState(null);
  const [autoResolveEnabled, setAutoResolveEnabled] = useState(false);

  // Auto-resolve timer
  useEffect(() => {
    if (!autoResolveEnabled) return;

    const interval = setInterval(async () => {
      if (marketState?.pendingBids > 0) {
        await handleBidResolution();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [autoResolveEnabled, marketState]);

  const handleSubmitBid = async (e) => {
    e?.preventDefault();
    setSubmittingBid(true);
    setMessage(null);

    try {
      const result = await onBidSubmission(newBid);
      if (result?.success) {
        setMessage({ type: 'success', text: 'Bid submitted successfully!' });
        // Reset form
        setNewBid({
          ...newBid,
          taskId: '',
          bidAmount: 5000
        });
      } else {
        setMessage({ type: 'error', text: result?.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleBidResolution = async () => {
    setResolvingBids(true);
    setMessage(null);

    try {
      const result = await onBidResolution();
      if (result?.success) {
        const winners = result?.resolution?.winners?.length || 0;
        const spent = result?.resolution?.total_spent || 0;
        setMessage({ 
          type: 'success', 
          text: `Auction resolved: ${winners} winners, ${spent?.toLocaleString()} tokens spent` 
        });
      } else {
        setMessage({ type: 'error', text: result?.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error?.message });
    } finally {
      setResolvingBids(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'lost': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Attention Auction Engine</h3>
              <p className="text-gray-400 text-sm">Real-time bidding for computational resources</p>
            </div>
          </div>
          
          {/* Auto-resolve toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoResolveEnabled(!autoResolveEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                autoResolveEnabled 
                  ? 'bg-green-600 hover:bg-green-700' :'bg-gray-600 hover:bg-gray-700'
              }`}
              title="Auto-resolve bids every 30 seconds"
            >
              {autoResolveEnabled ? <PlayCircle className="w-4 h-4 text-white" /> : <PauseCircle className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message?.type === 'success' ?'bg-green-900/50 border border-green-700 text-green-200' :'bg-red-900/50 border border-red-700 text-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {message?.type === 'success' 
                ? <CheckCircle className="w-4 h-4" />
                : <AlertTriangle className="w-4 h-4" />
              }
              <span>{message?.text}</span>
            </div>
          </div>
        )}

        {/* New Bid Form */}
        <form onSubmit={handleSubmitBid} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={newBid?.agent}
                onChange={(e) => setNewBid({...newBid, agent: e?.target?.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="e.g., momentum_trader_01"
                required
              />
            </div>

            {/* Task ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task ID
              </label>
              <input
                type="text"
                value={newBid?.taskId}
                onChange={(e) => setNewBid({...newBid, taskId: e?.target?.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="e.g., analyze:TSLA"
                required
              />
            </div>

            {/* Bid Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bid Amount (Tokens)
              </label>
              <input
                type="number"
                value={newBid?.bidAmount}
                onChange={(e) => setNewBid({...newBid, bidAmount: parseInt(e?.target?.value)})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                min="1000"
                max="50000"
                step="500"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority (1-10)
              </label>
              <select
                value={newBid?.priority}
                onChange={(e) => setNewBid({...newBid, priority: parseInt(e?.target?.value)})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {[...Array(10)]?.map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i + 1 === 10 ? '(Highest)' : i + 1 === 1 ? '(Lowest)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resource Requirements */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Resource Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">CPU Cores</label>
                <input
                  type="number"
                  value={newBid?.computationalResources?.cpu_cores}
                  onChange={(e) => setNewBid({
                    ...newBid, 
                    computationalResources: {
                      ...newBid?.computationalResources,
                      cpu_cores: parseInt(e?.target?.value)
                    }
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                  min="1"
                  max="16"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Memory (GB)</label>
                <input
                  type="number"
                  value={newBid?.computationalResources?.memory_gb}
                  onChange={(e) => setNewBid({
                    ...newBid, 
                    computationalResources: {
                      ...newBid?.computationalResources,
                      memory_gb: parseInt(e?.target?.value)
                    }
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                  min="1"
                  max="64"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">GPU Required</label>
                <select
                  value={newBid?.computationalResources?.gpu_required}
                  onChange={(e) => setNewBid({
                    ...newBid, 
                    computationalResources: {
                      ...newBid?.computationalResources,
                      gpu_required: e?.target?.value === 'true'
                    }
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={newBid?.computationalResources?.estimated_duration}
                  onChange={(e) => setNewBid({
                    ...newBid, 
                    computationalResources: {
                      ...newBid?.computationalResources,
                      estimated_duration: parseInt(e?.target?.value)
                    }
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                  min="1"
                  max="1440"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingBid}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            {submittingBid ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Submitting Bid...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>Submit Bid</span>
              </>
            )}
          </button>
        </form>

        {/* Bid Resolution */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-semibold">Auction Status</span>
            </div>
            <button
              onClick={handleBidResolution}
              disabled={resolvingBids || (marketState?.pendingBids === 0)}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {resolvingBids ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Resolving...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Resolve Bids</span>
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-gray-300 space-y-1">
            <p>Pending Bids: <span className="font-semibold text-yellow-400">{marketState?.pendingBids || 0}</span></p>
            <p>Total Value: <span className="font-semibold text-green-400">{marketState?.totalPendingValue?.toLocaleString() || 0} tokens</span></p>
            <p>Next Resolution: <span className="font-semibold text-blue-400">{autoResolveEnabled ? 'Auto (30s)' : 'Manual'}</span></p>
          </div>
        </div>

        {/* Recent Bid History */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-white font-semibold mb-3">Recent Bids</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {marketState?.recentBids?.slice(0, 5)?.map((bid) => (
              <div key={bid?.id} className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(bid?.status)}
                    <div>
                      <p className="text-white text-sm font-medium">{bid?.agent}</p>
                      <p className="text-gray-400 text-xs">{bid?.task_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">
                      {bid?.bid_amount?.toLocaleString()} tokens
                    </p>
                    <p className="text-gray-400 text-xs">Priority: {bid?.task_priority}</p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No recent bids</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}