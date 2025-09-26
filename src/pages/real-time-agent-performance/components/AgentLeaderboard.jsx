import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

const AgentLeaderboard = ({ agents }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(value || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0)?.toFixed(1)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'inactive': return 'text-gray-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Activity className="h-4 w-4" />;
      case 'paused': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2: return <Trophy className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-gray-400 font-medium">#{index + 1}</span>;
    }
  };

  if (!agents || agents?.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No agents found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agents?.map((agent, index) => {
        const pnlColor = agent?.totalPnL >= 0 ? 'text-green-500' : 'text-red-500';
        const pnlIcon = agent?.totalPnL >= 0 ? 
          <TrendingUp className="h-4 w-4" /> : 
          <TrendingDown className="h-4 w-4" />;

        return (
          <div 
            key={agent?.id} 
            className={`bg-gray-700/50 rounded-lg p-4 border ${
              index < 3 ? 'border-blue-500/30 bg-blue-900/10' : 'border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index)}
                </div>

                {/* Agent Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-white font-semibold">{agent?.name}</h3>
                    <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                      {agent?.strategy}
                    </span>
                    <div className={`flex items-center space-x-1 ${getStatusColor(agent?.status)}`}>
                      {getStatusIcon(agent?.status)}
                      <span className="text-xs capitalize">{agent?.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Trades: {agent?.totalTrades}</span>
                    <span>Win Rate: {formatPercent(agent?.winRate)}</span>
                    {agent?.currentStreak > 0 && (
                      <span className="text-green-400">
                        Streak: {agent?.currentStreak}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className={`flex items-center ${pnlColor} font-semibold`}>
                    {pnlIcon}
                    <span className="ml-1">{formatCurrency(agent?.totalPnL)}</span>
                  </div>
                  <div className="text-xs text-gray-400">Total P&L</div>
                </div>

                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatCurrency(agent?.avgProfitPerTrade)}
                  </div>
                  <div className="text-xs text-gray-400">Avg/Trade</div>
                </div>

                <div className="text-right">
                  <div className="text-white font-semibold">
                    {formatPercent(agent?.winRate)}
                  </div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
              </div>
            </div>
            {/* Recent Activity */}
            {agent?.lastTradeAt && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    Last trade: {new Date(agent.lastTradeAt)?.toLocaleString()}
                  </span>
                  {agent?.lastActiveAt && (
                    <span>
                      Last active: {new Date(agent.lastActiveAt)?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* Performance Indicators */}
            {agent?.recentTrades?.length > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-xs text-gray-400">Recent:</span>
                {agent?.recentTrades?.slice(-5)?.map((trade, idx) => {
                  const isProfitable = parseFloat(trade?.trades?.pnl || 0) > 0;
                  return (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        isProfitable ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      title={`P&L: ${formatCurrency(trade?.trades?.pnl || 0)}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AgentLeaderboard;