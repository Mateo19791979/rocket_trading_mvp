import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, BarChart3 } from 'lucide-react';
import aiSwarmService from '../services/aiSwarmService.js';

const SwarmManagerWidget = ({ compact = false }) => {
  const [statistics, setStatistics] = useState(null);
  const [activeAgents, setActiveAgents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsResult, stateResult] = await Promise.all([
          aiSwarmService?.getSwarmStatistics(),
          aiSwarmService?.getSwarmState()
        ]);

        if (statsResult?.ok) {
          setStatistics(statsResult?.statistics);
        }
        
        if (stateResult?.ok) {
          setActiveAgents(stateResult?.swarm_state?.filter(agent => agent?.active)?.length || 0);
        }
      } catch (error) {
        console.error('Failed to load swarm data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time event subscription
  useEffect(() => {
    const subscription = aiSwarmService?.subscribeToSwarmState((event) => {
      setRecentEvents(prev => [
        {
          id: Date.now(),
          event: event?.event,
          agent: event?.agent?.agent_name || event?.data?.agent_name,
          timestamp: event?.timestamp
        },
        ...prev?.slice(0, 4)
      ]);
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${compact ? 'min-h-[120px]' : 'min-h-[200px]'}`}>
        <div className="flex items-center justify-center h-full">
          <Cpu className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Cpu className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">AI Swarm</h3>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">{activeAgents} Active</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-gray-600">Energy</p>
            <p className="font-medium text-green-600">
              {statistics?.average_energy ? `${Math?.round(statistics?.average_energy * 100)}%` : '0%'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Performance</p>
            <p className="font-medium text-blue-600">
              {statistics?.average_performance ? `${(statistics?.average_performance * 100)?.toFixed(1)}%` : '0.0%'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Moves</p>
            <p className="font-medium text-purple-600">
              {statistics?.total_moves_today || 0}
            </p>
          </div>
        </div>
        {recentEvents?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              Latest: {recentEvents?.[0]?.event?.replace('_', ' ')} 
              {recentEvents?.[0]?.agent && ` (${recentEvents?.[0]?.agent})`}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Cpu className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Swarm Manager</h2>
            <p className="text-sm text-gray-600">Global nomadic AI agents status</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">{activeAgents} Active Agents</span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-blue-600 font-medium">AGENTS</p>
              <p className="text-lg font-bold text-blue-700">
                {statistics?.total_agents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-xs text-green-600 font-medium">AVG ENERGY</p>
              <p className="text-lg font-bold text-green-700">
                {statistics?.average_energy ? `${Math?.round(statistics?.average_energy * 100)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-xs text-purple-600 font-medium">PERFORMANCE</p>
              <p className="text-lg font-bold text-purple-700">
                {statistics?.average_performance ? `${(statistics?.average_performance * 100)?.toFixed(1)}%` : '0.0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-xs text-yellow-600 font-medium">MOVES TODAY</p>
              <p className="text-lg font-bold text-yellow-700">
                {statistics?.total_moves_today || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentEvents?.slice(0, 3)?.map((event) => (
              <div key={event?.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <span className="text-sm text-gray-700">
                    {event?.event?.replace('_', ' ')?.toUpperCase()}
                    {event?.agent && ` - ${event?.agent}`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event?.timestamp)?.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Distribution */}
      {statistics?.by_region && Object?.keys(statistics?.by_region)?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Regional Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object?.entries(statistics?.by_region)?.map(([region, count]) => (
              <div key={region} className="bg-gray-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">{region?.replace('_', ' ')?.toUpperCase()}</p>
                <p className="text-sm font-medium text-gray-900">{count} agents</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwarmManagerWidget;