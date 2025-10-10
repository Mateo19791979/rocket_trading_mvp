import React, { useState, useEffect } from 'react';
import { Activity, Eye, AlertTriangle, Filter, Download, Search } from 'lucide-react';
import { aiAgentsService } from '../../services/aiAgentsService';
import LiveActivityFeed from './components/LiveActivityFeed';
import AgentBehaviorAnalytics from './components/AgentBehaviorAnalytics';
import DecisionTrackingPanel from './components/DecisionTrackingPanel';
import AnomalyDetectionDashboard from './components/AnomalyDetectionDashboard';
import CommunicationMonitor from './components/CommunicationMonitor';

export default function RealTimeAgentActivityMonitor() {
  const [agents, setAgents] = useState({});
  const [agentTrades, setAgentTrades] = useState([]);
  const [eventBusEvents, setEventBusEvents] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    agent: 'all',
    activity: 'all',
    timeRange: '1h',
    minConfidence: 0
  });

  // Load initial data
  useEffect(() => {
    loadMonitoringData();
  }, []);

  const handleAgentUpdate = (payload) => {
    if (payload?.new) {
      // Update specific agent in the agents state
      setAgents(prev => {
        const updatedAgents = { ...prev };
        Object.keys(updatedAgents)?.forEach(group => {
          updatedAgents[group] = updatedAgents?.[group]?.map(agent => 
            agent?.id === payload?.new?.id ? payload?.new : agent
          );
        });
        return updatedAgents;
      });
    }
  };

  const handleHealthUpdate = (payload) => {
    if (payload?.new) {
      setSystemHealth(prev => 
        prev?.map(health => 
          health?.agent_id === payload?.new?.agent_id ? payload?.new : health
        )
      );
    }
  };

  const handleEventUpdate = (payload) => {
    if (payload?.new) {
      setEventBusEvents(prev => [payload?.new, ...prev?.slice(0, 199)]);
      
      // Check if it's a trade-related event
      if (payload?.new?.event_type === 'trade_signal' || payload?.new?.event_type === 'order_execution') {
        setAgentTrades(prev => [payload?.new, ...prev?.slice(0, 49)]);
      }
    }
  };

  // Real-time subscriptions for granular monitoring
  useEffect(() => {
    const agentSubscription = aiAgentsService?.subscribeToAgentUpdates(handleAgentUpdate);
    const healthSubscription = aiAgentsService?.subscribeToSystemHealth(handleHealthUpdate);
    const eventSubscription = aiAgentsService?.subscribeToEventBus(handleEventUpdate);

    return () => {
      aiAgentsService?.removeSubscription(agentSubscription);
      aiAgentsService?.removeSubscription(healthSubscription);
      aiAgentsService?.removeSubscription(eventSubscription);
    };
  }, []);

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      const [agentsData, healthData, eventsData] = await Promise.all([
        aiAgentsService?.getAgentsByGroup(),
        aiAgentsService?.getSystemHealth(),
        aiAgentsService?.getEventBusEvents(200) // More events for detailed monitoring
      ]);

      setAgents(agentsData);
      setSystemHealth(healthData);
      setEventBusEvents(eventsData);

      // Load recent trades for behavior analysis
      const allAgents = Object.values(agentsData)?.flat();
      if (allAgents?.length > 0) {
        // Note: This would need a service method to get agent trades
        // For now we'll simulate with the existing event data
        const tradeEvents = eventsData?.filter(e => e?.event_type === 'trade_signal' || e?.event_type === 'order_execution');
        setAgentTrades(tradeEvents);
      }

    } catch (error) {
      setError(`Failed to load monitoring data: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredActivities = () => {
    let filtered = eventBusEvents;

    if (filterCriteria?.agent !== 'all') {
      filtered = filtered?.filter(event => 
        event?.source_agent_id === filterCriteria?.agent ||
        event?.target_agent_id === filterCriteria?.agent
      );
    }

    if (filterCriteria?.activity !== 'all') {
      filtered = filtered?.filter(event => event?.event_type === filterCriteria?.activity);
    }

    if (filterCriteria?.timeRange !== 'all') {
      const timeLimit = {
        '1h': 60 * 60 * 1000,
        '4h': 4 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000
      }?.[filterCriteria?.timeRange] || 24 * 60 * 60 * 1000;

      filtered = filtered?.filter(event => 
        new Date(event?.created_at) > new Date(Date.now() - timeLimit)
      );
    }

    return filtered;
  };

  const exportActivityData = async () => {
    try {
      const data = await aiAgentsService?.exportAuditReport('json', {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)?.toISOString(),
        endDate: new Date()?.toISOString()
      });
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agent-activity-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      a?.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Failed to export data: ${error?.message}`);
    }
  };

  const calculateActivityMetrics = () => {
    const filteredActivities = getFilteredActivities();
    const allAgents = Object.values(agents)?.flat();
    
    return {
      totalActivities: filteredActivities?.length,
      activeAgents: new Set(filteredActivities?.map(e => e?.source_agent_id))?.size,
      avgConfidence: filteredActivities?.reduce((sum, e) => sum + (e?.event_data?.confidence_level || 0), 0) / (filteredActivities?.length || 1),
      anomalyCount: filteredActivities?.filter(e => e?.priority === 'high' && e?.event_data?.anomaly)?.length || 0
    };
  };

  const metrics = calculateActivityMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-purple-400">
          <Activity className="w-8 h-8 animate-pulse" />
          <span className="text-xl">Initializing Agent Activity Monitor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Real-time Agent Activity Monitor</h1>
              <p className="text-gray-400">Granular visibility into individual agent behaviors and decisions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live Monitoring</span>
              </div>
              <span className="text-gray-400">|</span>
              <span>Activities: {metrics?.totalActivities}</span>
              <span className="text-gray-400">|</span>
              <span>Active: {metrics?.activeAgents} agents</span>
            </div>
            <button
              onClick={exportActivityData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select 
              value={filterCriteria?.agent}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, agent: e?.target?.value }))}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600"
            >
              <option value="all">All Agents</option>
              {Object.values(agents)?.flat()?.map(agent => (
                <option key={agent?.id} value={agent?.id}>
                  {agent?.name || `Agent ${agent?.id?.slice(0, 8)}`}
                </option>
              ))}
            </select>
            <select
              value={filterCriteria?.activity}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, activity: e?.target?.value }))}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600"
            >
              <option value="all">All Activities</option>
              <option value="trade_signal">Trade Signals</option>
              <option value="market_data">Market Data</option>
              <option value="order_execution">Order Execution</option>
              <option value="risk_alert">Risk Alerts</option>
              <option value="system_status">System Status</option>
            </select>
            <select
              value={filterCriteria?.timeRange}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, timeRange: e?.target?.value }))}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600"
            >
              <option value="1h">Last Hour</option>
              <option value="4h">Last 4 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Avg Confidence:</span>
            <span className="text-teal-400 font-medium">{metrics?.avgConfidence?.toFixed(1)}%</span>
            {metrics?.anomalyCount > 0 && (
              <>
                <span className="text-gray-400">|</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400">{metrics?.anomalyCount} anomalies</span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Main Content - Dynamic Layout */}
      <div className="flex h-full">
        {/* Left Panel - Live Activity Feed */}
        <div className="w-2/5 bg-gray-900 border-r border-gray-700">
          <LiveActivityFeed 
            activities={getFilteredActivities()}
            agents={agents}
            onActivitySelect={(activity) => setSelectedAgent(activity?.source_agent_id)}
          />
        </div>

        {/* Center Panel - Behavior Analytics & Decision Tracking */}
        <div className="w-2/5 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <AgentBehaviorAnalytics 
              agents={agents}
              systemHealth={systemHealth}
              selectedAgent={selectedAgent}
              agentTrades={agentTrades}
            />
          </div>
          <div className="border-t border-gray-700 h-2/5">
            <DecisionTrackingPanel 
              eventBusEvents={eventBusEvents}
              selectedAgent={selectedAgent}
              agents={agents}
            />
          </div>
        </div>

        {/* Right Panel - Anomaly Detection & Communication */}
        <div className="w-1/5 bg-gray-900 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <AnomalyDetectionDashboard 
              eventBusEvents={eventBusEvents}
              systemHealth={systemHealth}
              agents={agents}
            />
          </div>
          <div className="border-t border-gray-700 h-2/5">
            <CommunicationMonitor 
              eventBusEvents={eventBusEvents}
              agents={agents}
            />
          </div>
        </div>
      </div>
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}