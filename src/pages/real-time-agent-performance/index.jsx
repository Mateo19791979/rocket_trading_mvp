import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import realTimeAgentPerformanceService from '../../services/realTimeAgentPerformanceService';
import AgentLeaderboard from './components/AgentLeaderboard';
import PerformanceComparison from './components/PerformanceComparison';
import RealTimeActivity from './components/RealTimeActivity';
import AgentFilters from './components/AgentFilters';
import CapitalRequirementsCalculator from './components/CapitalRequirementsCalculator';
import DailyIntelligenceReportCard from './components/DailyIntelligenceReportCard';
import OrchestratorBridgePanel from '../../components/OrchestratorBridgePanel';
import GovernancePanel from '../../components/GovernancePanel';
import { Bot, Activity, TrendingUp, AlertCircle, RefreshCw, Database, BarChart3 } from 'lucide-react';
import DialogueIAPanel from './components/DialogueIAPanel';

const RealTimeAgentPerformance = () => {
  const { user, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [filters, setFilters] = useState({
    strategy: 'all',
    status: 'all',
    timeframe: '24h',
    sortBy: 'totalPnL'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dataMode, setDataMode] = useState('live'); // 'live' or 'demo'
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected', 'connecting', 'disconnected'
  const subscriptionRef = useRef(null);

  // Enhanced demo data with better variety
  const getDemoData = () => {
    const demoAgents = [
      {
        id: 'demo-1',
        name: 'Alpha Momentum Pro',
        strategy: 'momentum',
        status: 'active',
        winRate: 68.5,
        totalPnL: 12450.75,
        totalTrades: 147,
        successfulTrades: 101,
        avgProfitPerTrade: 84.70,
        lastActiveAt: new Date()?.toISOString(),
        lastTradeAt: new Date(Date.now() - 3600000)?.toISOString(),
        currentStreak: 5,
        agentGroup: 'signals',
        description: 'High-performance momentum trading agent',
        isAutonomous: true,
        communicationEnabled: true
      },
      {
        id: 'demo-2',
        name: 'Beta Arbitrage Elite',
        strategy: 'arbitrage',
        status: 'active',
        winRate: 72.3,
        totalPnL: 8920.30,
        totalTrades: 89,
        successfulTrades: 64,
        avgProfitPerTrade: 100.23,
        lastActiveAt: new Date()?.toISOString(),
        lastTradeAt: new Date(Date.now() - 1800000)?.toISOString(),
        currentStreak: 3,
        agentGroup: 'execution',
        description: 'Cross-exchange arbitrage specialist',
        isAutonomous: true,
        communicationEnabled: true
      },
      {
        id: 'demo-3',
        name: 'Gamma Mean Reversion',
        strategy: 'mean_reversion',
        status: 'paused',
        winRate: 45.2,
        totalPnL: -1250.40,
        totalTrades: 76,
        successfulTrades: 34,
        avgProfitPerTrade: -16.45,
        lastActiveAt: new Date(Date.now() - 7200000)?.toISOString(),
        lastTradeAt: new Date(Date.now() - 10800000)?.toISOString(),
        currentStreak: 0,
        agentGroup: 'signals',
        description: 'Statistical mean reversion strategy',
        isAutonomous: false,
        communicationEnabled: false
      },
      {
        id: 'demo-4',
        name: 'Delta Scalping Bot',
        strategy: 'scalping',
        status: 'active',
        winRate: 55.8,
        totalPnL: 3275.60,
        totalTrades: 312,
        successfulTrades: 174,
        avgProfitPerTrade: 10.50,
        lastActiveAt: new Date(Date.now() - 300000)?.toISOString(),
        lastTradeAt: new Date(Date.now() - 600000)?.toISOString(),
        currentStreak: 2,
        agentGroup: 'execution',
        description: 'High-frequency scalping specialist',
        isAutonomous: true,
        communicationEnabled: true
      },
      {
        id: 'demo-5',
        name: 'Epsilon Swing Master',
        strategy: 'swing',
        status: 'error',
        winRate: 0,
        totalPnL: 0,
        totalTrades: 0,
        successfulTrades: 0,
        avgProfitPerTrade: 0,
        lastActiveAt: new Date(Date.now() - 86400000)?.toISOString(),
        lastTradeAt: null,
        currentStreak: 0,
        agentGroup: 'signals',
        description: 'Multi-day swing trading algorithm',
        isAutonomous: false,
        communicationEnabled: false
      }
    ];

    const demoComparative = demoAgents?.slice(0, 4)?.map(agent => ({
      name: agent?.name,
      strategy: agent?.strategy,
      status: agent?.status,
      winRate: agent?.winRate,
      totalPnL: agent?.totalPnL,
      totalTrades: agent?.totalTrades,
      successfulTrades: agent?.successfulTrades,
      sharpeRatio: Math.random() * 2 + 0.5,
      maxDrawdown: Math.random() * 20 + 5,
      riskAdjustedReturn: agent?.totalPnL * (Math.random() * 0.5 + 0.75),
      profitLossRatio: agent?.successfulTrades > 0 ? agent?.successfulTrades / Math.max(1, agent?.totalTrades - agent?.successfulTrades) : 0
    }));

    const demoActivity = [
      {
        id: 'activity-1',
        agentName: 'Alpha Momentum Pro',
        strategy: 'momentum',
        status: 'active',
        action: 'BUY AAPL',
        confidence: 85.5,
        signalStrength: 92.3,
        reasoning: 'Strong bullish momentum detected with RSI oversold conditions and volume confirmation',
        pnl: 250,
        executionTime: 145,
        timestamp: new Date(Date.now() - 300000)?.toISOString(),
        quantity: 100,
        price: 175.50
      },
      {
        id: 'activity-2',
        agentName: 'Beta Arbitrage Elite',
        strategy: 'arbitrage',
        status: 'active',
        action: 'SELL TSLA',
        confidence: 92.1,
        signalStrength: 88.7,
        reasoning: 'Price divergence detected between NYSE and NASDAQ, 0.3% spread opportunity',
        pnl: 180,
        executionTime: 87,
        timestamp: new Date(Date.now() - 900000)?.toISOString(),
        quantity: 50,
        price: 242.30
      },
      {
        id: 'activity-3',
        agentName: 'Delta Scalping Bot',
        strategy: 'scalping',
        status: 'active',
        action: 'BUY MSFT',
        confidence: 78.3,
        signalStrength: 82.1,
        reasoning: 'Quick scalp opportunity on volume spike, level 2 data shows strong bid support',
        pnl: 25,
        executionTime: 42,
        timestamp: new Date(Date.now() - 1200000)?.toISOString(),
        quantity: 25,
        price: 380.25
      },
      {
        id: 'activity-4',
        agentName: 'Alpha Momentum Pro',
        strategy: 'momentum',
        status: 'active',
        action: 'SELL GOOGL',
        confidence: 71.8,
        signalStrength: 75.4,
        reasoning: 'Momentum weakening, RSI overbought, taking profits at resistance',
        pnl: -45,
        executionTime: 156,
        timestamp: new Date(Date.now() - 1800000)?.toISOString(),
        quantity: 15,
        price: 2865.00
      }
    ];

    const demoAlerts = [
      {
        type: 'warning',
        agentId: 'demo-3',
        agentName: 'Gamma Mean Reversion',
        message: 'Win rate below 50% threshold (45.2% over 76 trades)',
        severity: 'medium'
      },
      {
        type: 'error',
        agentId: 'demo-5',
        agentName: 'Epsilon Swing Master',
        message: 'Agent in error state - requires attention',
        severity: 'critical'
      },
      {
        type: 'warning',
        agentId: 'demo-4',
        agentName: 'Delta Scalping Bot',
        message: 'High execution frequency detected - monitor for overtrading',
        severity: 'low'
      }
    ];

    return { demoAgents, demoComparative, demoActivity, demoAlerts };
  };

  useEffect(() => {
    if (!authLoading && user?.id) {
      loadAgentPerformanceData();
      setupRealTimeSubscription();
    } else if (!authLoading && !user) {
      setLoading(false);
      setError('Please sign in to view agent performance data');
      setConnectionStatus('disconnected');
    }
    
    return () => {
      if (subscriptionRef?.current) {
        subscriptionRef?.current?.unsubscribe();
      }
    };
  }, [user?.id, authLoading]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      loadAgentPerformanceData();
    }
  }, [filters, user?.id, authLoading]);

  const loadAgentPerformanceData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');

      const [leaderboard, comparative, activity, performanceAlerts] = await Promise.allSettled([
        realTimeAgentPerformanceService?.getAgentPerformanceLeaderboard(user?.id),
        realTimeAgentPerformanceService?.getAgentComparativeAnalysis(user?.id),
        realTimeAgentPerformanceService?.getRealTimeAgentActivity(user?.id),
        realTimeAgentPerformanceService?.getAgentPerformanceAlerts(user?.id)
      ]);

      // Check if we got any real data
      const hasRealData = leaderboard?.status === 'fulfilled' && 
                        leaderboard?.value?.length > 0;

      if (hasRealData) {
        // Use real data
        setAgents(leaderboard?.value || []);
        setComparativeData(comparative?.status === 'fulfilled' ? comparative?.value : []);
        setRecentActivity(activity?.status === 'fulfilled' ? activity?.value : []);
        setAlerts(performanceAlerts?.status === 'fulfilled' ? performanceAlerts?.value : []);
        setDataMode('live');
        setConnectionStatus('connected');
        
        // Show success message if previously had connection issues
        if (connectionStatus === 'disconnected') {
          setError(null);
        }
      } else {
        // Check if this is a connection error vs no data
        const isConnectionError = leaderboard?.status === 'rejected' && (leaderboard?.reason?.message?.includes('Cannot connect to database') ||
           leaderboard?.reason?.message?.includes('Failed to fetch'));

        if (isConnectionError) {
          setConnectionStatus('disconnected');
          setError(leaderboard?.reason?.message);
        } else {
          setConnectionStatus('connected');
          setError(null);
        }

        // Use demo data either way to ensure good UX
        const { demoAgents, demoComparative, demoActivity, demoAlerts } = getDemoData();
        setAgents(demoAgents);
        setComparativeData(demoComparative);
        setRecentActivity(demoActivity);
        setAlerts(demoAlerts);
        setDataMode('demo');
      }

      setLastUpdated(new Date());

    } catch (err) {
      // Fallback to demo data on error
      const { demoAgents, demoComparative, demoActivity, demoAlerts } = getDemoData();
      setAgents(demoAgents);
      setComparativeData(demoComparative);
      setRecentActivity(demoActivity);
      setAlerts(demoAlerts);
      setDataMode('demo');
      setConnectionStatus('disconnected');
      setError(err?.message?.includes('Cannot connect to database') ? err?.message : 
        'Connection error - using demo data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (!user?.id) return;

    if (subscriptionRef?.current) {
      subscriptionRef?.current?.unsubscribe();
    }

    try {
      subscriptionRef.current = realTimeAgentPerformanceService?.subscribeToAgentUpdates(
        user?.id,
        (payload) => {
          // Update connection status when receiving real-time data
          setConnectionStatus('connected');
          
          // Throttle updates to avoid excessive API calls
          setTimeout(() => {
            loadAgentPerformanceData();
          }, 1000);
        }
      );
    } catch (err) {
      console.warn('Real-time subscription failed:', err?.message);
      setConnectionStatus('disconnected');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    loadAgentPerformanceData();
  };

  const handleToggleDataMode = () => {
    if (dataMode === 'live') {
      const { demoAgents, demoComparative, demoActivity, demoAlerts } = getDemoData();
      setAgents(demoAgents);
      setComparativeData(demoComparative);
      setRecentActivity(demoActivity);
      setAlerts(demoAlerts);
      setDataMode('demo');
    } else {
      loadAgentPerformanceData();
    }
  };

  const getConnectionStatusIndicator = () => {
    const indicators = {
      connected: { color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700', text: 'Connected' },
      connecting: { color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700', text: 'Connecting...' },
      disconnected: { color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700', text: 'Disconnected' }
    };
    
    return indicators?.[connectionStatus] || indicators?.connecting;
  };

  const filteredAndSortedAgents = agents?.filter(agent => {
      if (filters?.strategy !== 'all' && agent?.strategy !== filters?.strategy) return false;
      if (filters?.status !== 'all' && agent?.status !== filters?.status) return false;
      return true;
    })?.sort((a, b) => {
      const field = filters?.sortBy;
      if (field === 'name') {
        return (a?.[field] || '')?.localeCompare(b?.[field] || '');
      }
      return parseFloat(b?.[field] || 0) - parseFloat(a?.[field] || 0);
    });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)]?.map((_, i) => (
                <div key={i} className="h-48 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 text-center">
            <Bot className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Authentication Required</h2>
            <p className="text-gray-400">Please sign in to view real-time agent performance data</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)]?.map((_, i) => (
                <div key={i} className="h-48 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Bot className="h-8 w-8 mr-3 text-blue-500" />
              Real-time Agent Performance
            </h1>
            <p className="text-gray-400 mt-2">
              Comprehensive monitoring and analytics for AI trading agent effectiveness
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status Indicator */}
            {(() => {
              const statusIndicator = getConnectionStatusIndicator();
              return (
                <div className={`rounded-lg px-3 py-2 flex items-center space-x-2 ${statusIndicator?.bg} border ${statusIndicator?.border}`}>
                  <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${statusIndicator?.color}`}>
                    {statusIndicator?.text}
                  </span>
                </div>
              );
            })()}

            {/* Data Mode Indicator */}
            <div className={`rounded-lg px-3 py-2 flex items-center space-x-2 ${
              dataMode === 'live' ? 'bg-green-900/30 border border-green-700' : 'bg-orange-900/30 border border-orange-700'
            }`}>
              {dataMode === 'live' ? (
                <Activity className="h-4 w-4 text-green-500" />
              ) : (
                <Database className="h-4 w-4 text-orange-500" />
              )}
              <span className={`text-sm ${dataMode === 'live' ? 'text-green-400' : 'text-orange-400'}`}>
                {dataMode === 'live' ? 'Live Data' : 'Demo Mode'}
              </span>
            </div>

            {/* Toggle Data Mode */}
            <button
              onClick={handleToggleDataMode}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
              title={dataMode === 'live' ? 'Switch to Demo Mode' : 'Switch to Live Data'}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">
                {dataMode === 'live' ? 'Demo' : 'Live'}
              </span>
            </button>

            <button
              onClick={handleRefresh}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Connection Error Banner */}
        {error && connectionStatus === 'disconnected' && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-red-400">Connection Issue</h3>
            </div>
            <p className="text-red-300 text-sm">{error}</p>
            <p className="text-gray-400 text-sm mt-2">
              Using demo data to ensure you can explore the interface. Click "Live" to retry connection.
            </p>
          </div>
        )}

        {/* Last Updated & Data Status */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Last updated: {lastUpdated?.toLocaleString()}</span>
          <span className="flex items-center space-x-4">
            <span>{filteredAndSortedAgents?.length} agents loaded</span>
            {dataMode === 'demo' && (
              <span className="bg-orange-900/30 text-orange-400 px-2 py-1 rounded text-xs">
                Demo Data Active
              </span>
            )}
            {connectionStatus === 'connected' && dataMode === 'live' && (
              <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs">
                Live Connection
              </span>
            )}
          </span>
        </div>

        {/* Performance Alerts */}
        {alerts?.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-yellow-400">Performance Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alerts?.map((alert, index) => (
                <div 
                  key={index}
                  className={`bg-gray-800 rounded p-3 border-l-4 ${
                    alert?.severity === 'critical' ? 'border-red-500' :
                    alert?.severity === 'high'? 'border-orange-500' : 'border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{alert?.agentName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert?.type === 'error' ? 'bg-red-900 text-red-300' :
                      alert?.type === 'warning'? 'bg-yellow-900 text-yellow-300' : 'bg-orange-900 text-orange-300'
                    }`}>
                      {alert?.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{alert?.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <AgentFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Daily Intelligence Report */}
        <DailyIntelligenceReportCard />

        {/* AAS Governance & Learning Pack v3 Panel */}
        <GovernancePanel />

        {/* Orchestrator Bridge Panel */}
        <OrchestratorBridgePanel />

        {/* Capital Requirements Calculator */}
        <CapitalRequirementsCalculator agents={filteredAndSortedAgents} />

        {/* Dialogue IA Panel - NEW */}
        <DialogueIAPanel />

        {/* Agent Leaderboard */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Agent Performance Leaderboard
            </h2>
            <div className="text-sm text-gray-400">
              {filteredAndSortedAgents?.length} agent{filteredAndSortedAgents?.length !== 1 ? 's' : ''} found
            </div>
          </div>
          <AgentLeaderboard agents={filteredAndSortedAgents} />
        </div>

        {/* Performance Comparison & Real-time Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceComparison data={comparativeData} />
          <RealTimeActivity activity={recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default RealTimeAgentPerformance;