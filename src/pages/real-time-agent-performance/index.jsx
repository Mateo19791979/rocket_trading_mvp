import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import realTimeAgentPerformanceService from '../../services/realTimeAgentPerformanceService';
import AgentLeaderboard from './components/AgentLeaderboard';
import PerformanceComparison from './components/PerformanceComparison';
import RealTimeActivity from './components/RealTimeActivity';
import AgentFilters from './components/AgentFilters';
import { Bot, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const RealTimeAgentPerformance = () => {
  const { user } = useAuth();
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
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      loadAgentPerformanceData();
      setupRealTimeSubscription();
    }
    
    return () => {
      if (subscriptionRef?.current) {
        subscriptionRef?.current?.unsubscribe();
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadAgentPerformanceData();
    }
  }, [filters]);

  const loadAgentPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [leaderboard, comparative, activity, performanceAlerts] = await Promise.all([
        realTimeAgentPerformanceService?.getAgentPerformanceLeaderboard(user?.id),
        realTimeAgentPerformanceService?.getAgentComparativeAnalysis(user?.id),
        realTimeAgentPerformanceService?.getRealTimeAgentActivity(user?.id),
        realTimeAgentPerformanceService?.getAgentPerformanceAlerts(user?.id)
      ]);

      setAgents(leaderboard);
      setComparativeData(comparative);
      setRecentActivity(activity);
      setAlerts(performanceAlerts);
    } catch (err) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (subscriptionRef?.current) {
      subscriptionRef?.current?.unsubscribe();
    }

    subscriptionRef.current = realTimeAgentPerformanceService?.subscribeToAgentUpdates(
      user?.id,
      (payload) => {
        // Update agents when data changes
        loadAgentPerformanceData();
      }
    );
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredAndSortedAgents = agents?.filter(agent => {
      if (filters?.strategy !== 'all' && agent?.strategy !== filters?.strategy) return false;
      if (filters?.status !== 'all' && agent?.status !== filters?.status) return false;
      return true;
    })?.sort((a, b) => {
      const field = filters?.sortBy;
      return parseFloat(b?.[field] || 0) - parseFloat(a?.[field] || 0);
    });

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Agent Performance</h2>
            <p className="text-gray-400">{error}</p>
            <button 
              onClick={loadAgentPerformanceData}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
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
            <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm text-white">Live Updates</span>
            </div>
          </div>
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

        {/* Agent Leaderboard */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Agent Performance Leaderboard
            </h2>
            <div className="text-sm text-gray-400">
              {filteredAndSortedAgents?.length} agent{filteredAndSortedAgents?.length !== 1 ? 's' : ''} active
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