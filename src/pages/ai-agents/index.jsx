import React, { useState, useEffect } from 'react';
import { Activity, Bot, Zap, CheckCircle } from 'lucide-react';

import { aiAgentsService } from '../../services/aiAgentsService';
import AgentGroupPanel from './components/AgentGroupPanel';
import SystemHealthPanel from './components/SystemHealthPanel';
import EventBusPanel from './components/EventBusPanel';
import AgentConfigModal from './components/AgentConfigModal';



const AIAgentsPage = () => {
  const [agentGroups, setAgentGroups] = useState({});
  const [systemHealth, setSystemHealth] = useState([]);
  const [eventBusEvents, setEventBusEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('agents');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);

  const loadInitialData = async () => {
    try {
      const [agents, health, events] = await Promise.all([
        aiAgentsService?.getAgentsByGroup(),
        aiAgentsService?.getSystemHealth(),
        aiAgentsService?.getEventBusEvents(20)
      ]);

      setAgentGroups(agents);
      setSystemHealth(health);
      setEventBusEvents(events);
    } catch (error) {
      console.error('Failed to load AI agents data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const agentSubscription = aiAgentsService?.subscribeToAgentUpdates((payload) => {
      loadInitialData(); // Refresh data when agents change
    });

    const eventSubscription = aiAgentsService?.subscribeToEventBus((payload) => {
      if (payload?.new) {
        setEventBusEvents(prev => [payload?.new, ...prev?.slice(0, 19)]);
      }
    });

    const healthSubscription = aiAgentsService?.subscribeToSystemHealth((payload) => {
      if (payload?.new) {
        setSystemHealth(prev => prev?.map(h => 
          h?.agent_id === payload?.new?.agent_id ? payload?.new : h
        ));
      }
    });

    return () => {
      aiAgentsService?.removeSubscription?.(agentSubscription);
      aiAgentsService?.removeSubscription?.(eventSubscription);
      aiAgentsService?.removeSubscription?.(healthSubscription);
    };
  };

  const handleAgentStatusToggle = async (agentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await aiAgentsService?.updateAgentStatus(agentId, newStatus);
      
      // Update local state
      const updatedGroups = { ...agentGroups };
      Object.keys(updatedGroups)?.forEach(groupKey => {
        updatedGroups[groupKey] = updatedGroups?.[groupKey]?.map(agent =>
          agent?.id === agentId ? { ...agent, agent_status: newStatus } : agent
        );
      });
      setAgentGroups(updatedGroups);
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const openAgentConfig = (agent) => {
    setSelectedAgent(agent);
    setConfigModalOpen(true);
  };

  const getSystemOverview = () => {
    const totalAgents = Object.values(agentGroups)?.flat()?.length;
    const activeAgents = Object.values(agentGroups)?.flat()?.filter(a => a?.agent_status === 'active')?.length;
    const healthyAgents = systemHealth?.filter(h => h?.health_status === 'healthy')?.length;
    const recentEvents = eventBusEvents?.filter(e => 
      new Date(e.created_at) > new Date(Date.now() - 5 * 60 * 1000)
    )?.length;

    return { totalAgents, activeAgents, healthyAgents, recentEvents };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-300">Loading AI Agents System...</p>
        </div>
      </div>
    );
  }

  const overview = getSystemOverview();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Bot className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold">AI Agents System</h1>
                <p className="text-sm text-gray-400">24 Autonomous Trading Agents</p>
              </div>
            </div>
            
            {/* System Overview Cards */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm">{overview?.activeAgents}/{overview?.totalAgents} Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{overview?.healthyAgents} Healthy</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">{overview?.recentEvents} Recent Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 border-b border-gray-700">
          {[
            { id: 'agents', label: 'AI Agents', icon: Bot },
            { id: 'health', label: 'System Health', icon: Activity },
            { id: 'events', label: 'Event Bus', icon: Zap }
          ]?.map(tab => {
            const TabIcon = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab?.id
                    ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab?.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'agents' && (
          <div className="space-y-8">
            {/* Agent Groups */}
            {[
              { key: 'ingestion', title: 'Ingestion Group (6 agents)', description: 'Data collection and processing', color: 'blue' },
              { key: 'signals', title: 'Signals Group (8 agents)', description: 'Technical analysis and signal generation', color: 'green' },
              { key: 'execution', title: 'Execution Group (5 agents)', description: 'Order execution and risk management', color: 'yellow' },
              { key: 'orchestration', title: 'Orchestration Group (5 agents)', description: 'System coordination and monitoring', color: 'purple' }
            ]?.map(group => (
              <AgentGroupPanel
                key={group?.key}
                title={group?.title}
                description={group?.description}
                agents={agentGroups?.[group?.key] || []}
                color={group?.color}
                onStatusToggle={handleAgentStatusToggle}
                onConfigureAgent={openAgentConfig}
              />
            ))}
          </div>
        )}

        {activeTab === 'health' && (
          <SystemHealthPanel healthData={systemHealth} />
        )}

        {activeTab === 'events' && (
          <EventBusPanel events={eventBusEvents} />
        )}
      </div>
      {/* Agent Configuration Modal */}
      {configModalOpen && selectedAgent && (
        <AgentConfigModal
          agent={selectedAgent}
          isOpen={configModalOpen}
          onClose={() => {
            setConfigModalOpen(false);
            setSelectedAgent(null);
          }}
          onSave={async (agentId, config) => {
            await aiAgentsService?.updateAgentConfiguration(agentId, config);
            loadInitialData(); // Refresh data
          }}
        />
      )}
    </div>
  );
};

export default AIAgentsPage;