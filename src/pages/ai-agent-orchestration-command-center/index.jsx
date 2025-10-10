import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, Network, Cpu, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { aiAgentsService } from '../../services/aiAgentsService';
import AgentFleetOverview from './components/AgentFleetOverview';
import AgentActivationPanel from './components/AgentActivationPanel';
import LiveDataIntegrationDashboard from './components/LiveDataIntegrationDashboard';
import AgentCoordinationMatrix from './components/AgentCoordinationMatrix';
import MasterControlInterface from './components/MasterControlInterface';
import PerformanceAnalytics from './components/PerformanceAnalytics';

export default function AIAgentOrchestrationCommandCenter() {
  const [agents, setAgents] = useState({
    ingestion: [],
    signals: [],
    execution: [],
    orchestration: []
  });
  const [systemHealth, setSystemHealth] = useState([]);
  const [eventBusEvents, setEventBusEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemOverview, setSystemOverview] = useState(null);
  const [selectedAgentGroup, setSelectedAgentGroup] = useState('all');
  const [orchestrationMode, setOrchestrationMode] = useState('auto');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [error, setError] = useState(null);

  // Define event handlers before using them in useEffect
  const handleAgentUpdate = (payload) => {
    if (payload?.new) {
      loadDashboardData(); // Refresh all data when agents change
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
      setEventBusEvents(prev => [payload?.new, ...prev?.slice(0, 99)]);
    }
  };

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time subscriptions
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

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [agentsData, healthData, eventsData, overviewData] = await Promise.all([
        aiAgentsService?.getAgentsByGroup(),
        aiAgentsService?.getSystemHealth(),
        aiAgentsService?.getEventBusEvents(100),
        aiAgentsService?.getSystemOverview()
      ]);

      setAgents(agentsData);
      setSystemHealth(healthData);
      setEventBusEvents(eventsData);
      setSystemOverview(overviewData);
    } catch (error) {
      setError(`Failed to load orchestration data: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalPause = async () => {
    try {
      setEmergencyMode(true);
      const allAgents = Object.values(agents)?.flat();
      const activeAgents = allAgents?.filter(a => a?.agent_status === 'active');
      
      await Promise.all(
        activeAgents?.map(agent => 
          aiAgentsService?.updateAgentStatus(agent?.id, 'paused')
        )
      );
      
      await loadDashboardData();
      await aiAgentsService?.sendLocalNotification(
        'System Paused', 
        `All ${activeAgents?.length} active agents have been paused`
      );
    } catch (error) {
      setError(`Failed to pause system: ${error?.message}`);
    }
  };

  const handleGlobalResume = async () => {
    try {
      const allAgents = Object.values(agents)?.flat();
      const pausedAgents = allAgents?.filter(a => a?.agent_status === 'paused');
      
      await Promise.all(
        pausedAgents?.map(agent => 
          aiAgentsService?.updateAgentStatus(agent?.id, 'active')
        )
      );
      
      setEmergencyMode(false);
      await loadDashboardData();
      await aiAgentsService?.sendLocalNotification(
        'System Resumed', 
        `${pausedAgents?.length} agents have been resumed`
      );
    } catch (error) {
      setError(`Failed to resume system: ${error?.message}`);
    }
  };

  const handleBatchActivation = async (groupName, activate) => {
    try {
      const targetAgents = agents?.[groupName] || [];
      const status = activate ? 'active' : 'inactive';
      
      await Promise.all(
        targetAgents?.map(agent => 
          aiAgentsService?.updateAgentStatus(agent?.id, status)
        )
      );
      
      await loadDashboardData();
      await aiAgentsService?.sendLocalNotification(
        `Group ${activate ? 'Activated' : 'Deactivated'}`, 
        `${targetAgents?.length} agents in ${groupName} group have been ${status}`
      );
    } catch (error) {
      setError(`Failed to update ${groupName} group: ${error?.message}`);
    }
  };

  const calculateSystemMetrics = () => {
    const allAgents = Object.values(agents)?.flat();
    const totalAgents = allAgents?.length;
    const activeAgents = allAgents?.filter(a => a?.agent_status === 'active')?.length;
    const healthyAgents = systemHealth?.filter(h => h?.health_status === 'healthy')?.length;
    const errorAgents = allAgents?.filter(a => a?.agent_status === 'error')?.length;
    
    const recentEvents = eventBusEvents?.filter(e => 
      new Date(e?.created_at) > new Date(Date.now() - 5 * 60 * 1000)
    )?.length;

    return {
      totalAgents,
      activeAgents,
      healthyAgents,
      errorAgents,
      recentEvents,
      systemHealth: errorAgents === 0 ? 'healthy' : 'degraded',
      activationRate: totalAgents > 0 ? (activeAgents / totalAgents * 100)?.toFixed(1) : 0
    };
  };

  const metrics = calculateSystemMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-blue-400">
          <Activity className="w-8 h-8 animate-spin" />
          <span className="text-xl">Loading Orchestration Command Center...</span>
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
            <Network className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">AI Agent Orchestration Command Center</h1>
              <p className="text-gray-400">Real-time control and coordination of all 24 AI agents</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${metrics?.systemHealth === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{metrics?.systemHealth?.toUpperCase()}</span>
            </div>
            <button
              onClick={emergencyMode ? handleGlobalResume : handleGlobalPause}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                emergencyMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' :'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {emergencyMode ? (
                <>
                  <Play className="w-4 h-4 inline mr-2" />
                  Resume System
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 inline mr-2" />
                  Emergency Pause
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* System Metrics Bar */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Total: {metrics?.totalAgents}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm">Active: {metrics?.activeAgents}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Health: {metrics?.healthyAgents}/{metrics?.totalAgents}</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm">Errors: {metrics?.errorAgents}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Events/5min: {metrics?.recentEvents}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Activation Rate:</span>
            <span className="font-medium text-blue-400">{metrics?.activationRate}%</span>
          </div>
        </div>
      </div>
      {/* Main Content - Three Column Layout */}
      <div className="flex h-full">
        {/* Left Column - Agent Fleet & Activation */}
        <div className="w-1/3 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <AgentFleetOverview 
              agents={agents}
              systemHealth={systemHealth}
              onAgentSelect={(agentId) => setSelectedAgentGroup(agentId)}
            />
          </div>
          <div className="border-t border-gray-700">
            <AgentActivationPanel 
              agents={agents}
              agentStates={agents}
              systemHealth={systemHealth}
              providersStatus={{}}
              onBatchActivation={handleBatchActivation}
              onAgentToggle={(agentId, status) => aiAgentsService?.updateAgentStatus(agentId, status)}
              emergencyMode={emergencyMode}
            />
          </div>
        </div>

        {/* Center Column - Data Integration & Coordination */}
        <div className="w-1/3 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <LiveDataIntegrationDashboard 
              eventBusEvents={eventBusEvents}
              systemOverview={systemOverview}
            />
          </div>
          <div className="border-t border-gray-700">
            <AgentCoordinationMatrix 
              eventBusEvents={eventBusEvents}
              agents={agents}
            />
          </div>
        </div>

        {/* Right Column - Master Control & Analytics */}
        <div className="w-1/3 bg-gray-900 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <MasterControlInterface 
              orchestrationMode={orchestrationMode}
              onModeChange={setOrchestrationMode}
              systemOverview={systemOverview}
              onGlobalCommand={(command) => {
                if (command === 'pause') handleGlobalPause();
                if (command === 'resume') handleGlobalResume();
              }}
            />
          </div>
          <div className="border-t border-gray-700">
            <PerformanceAnalytics 
              agents={agents}
              systemHealth={systemHealth}
              systemOverview={systemOverview}
            />
          </div>
        </div>
      </div>
    </div>
  );
}