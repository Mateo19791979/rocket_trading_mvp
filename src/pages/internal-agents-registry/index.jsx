import React, { useState, useEffect } from 'react';
import { Activity, Users, Clock, AlertTriangle, Play, Pause, RefreshCw, Plus, Zap } from 'lucide-react';
import { internalAgentsService } from '../../services/internalAgentsService.js';
import AgentStatusGrid from './components/AgentStatusGrid.jsx';
import TaskQueue from './components/TaskQueue.jsx';
import AgentMetrics from './components/AgentMetrics.jsx';
import KillSwitchPanel from './components/KillSwitchPanel.jsx';
import EnqueueTaskModal from './components/EnqueueTaskModal.jsx';

export default function InternalAgentsRegistry() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [killSwitches, setKillSwitches] = useState([]);
  const [stats, setStats] = useState({ agents: {}, tasks: {} });
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showEnqueueModal, setShowEnqueueModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = async () => {
    try {
      const [agentsData, tasksData, switchesData, statsData] = await Promise.all([
        internalAgentsService?.getAgents(),
        internalAgentsService?.getAgentTasks(),
        internalAgentsService?.getKillSwitches(),
        internalAgentsService?.getAgentStats()
      ]);

      setAgents(agentsData);
      setTasks(tasksData);
      setKillSwitches(switchesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load agents data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  const handleRunMaintenance = async () => {
    try {
      await internalAgentsService?.runMaintenance();
      handleRefresh();
    } catch (error) {
      console.error('Failed to run maintenance:', error);
    }
  };

  const handleEnqueueTask = async (taskData) => {
    try {
      await internalAgentsService?.enqueueTask(
        taskData?.agent_name,
        taskData?.task_type,
        taskData?.payload,
        taskData?.priority
      );
      setShowEnqueueModal(false);
      handleRefresh();
    } catch (error) {
      console.error('Failed to enqueue task:', error);
    }
  };

  useEffect(() => {
    loadData();

    // Set up real-time subscriptions
    const unsubscribe = internalAgentsService?.subscribeToAgentUpdates(() => {
      if (autoRefresh) {
        loadData();
      }
    });

    // Auto-refresh interval
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadData();
      }
    }, 10000); // Every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalAgents = agents?.length || 0;
  const activeAgents = agents?.filter(a => a?.status === 'idle' || a?.status === 'busy')?.length || 0;
  const queuedTasks = stats?.tasks?.queued || 0;
  const runningTasks = stats?.tasks?.running || 0;
  const errorCount = (stats?.agents?.error || 0) + (stats?.tasks?.failed || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internal Agents Registry</h1>
          <p className="text-gray-600 mt-1">Manage and monitor autonomous AI agents</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              autoRefresh 
                ? 'bg-green-50 border-green-200 text-green-700' :'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            Auto-refresh
          </button>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          <button
            onClick={() => setShowEnqueueModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Enqueue Task
          </button>

          <button
            onClick={handleRunMaintenance}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Run Maintenance
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-3xl font-bold text-gray-900">{totalAgents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Agents</p>
              <p className="text-3xl font-bold text-green-600">{activeAgents}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Queued Tasks</p>
              <p className="text-3xl font-bold text-blue-600">{queuedTasks}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running Tasks</p>
              <p className="text-3xl font-bold text-yellow-600">{runningTasks}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-3xl font-bold text-red-600">{errorCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Status Grid */}
        <div className="lg:col-span-2">
          <AgentStatusGrid 
            agents={agents} 
            onSelectAgent={setSelectedAgent}
            selectedAgent={selectedAgent}
          />
        </div>

        {/* Kill Switch Panel */}
        <div>
          <KillSwitchPanel switches={killSwitches} />
        </div>
      </div>

      {/* Task Queue and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskQueue tasks={tasks} />
        <AgentMetrics 
          selectedAgent={selectedAgent} 
          agents={agents}
        />
      </div>

      {/* Enqueue Task Modal */}
      {showEnqueueModal && (
        <EnqueueTaskModal
          agents={agents}
          onEnqueue={handleEnqueueTask}
          onClose={() => setShowEnqueueModal(false)}
        />
      )}
    </div>
  );
}