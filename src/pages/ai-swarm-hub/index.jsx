import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Brain, GitBranch, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import SwarmManagerWidget from '../../components/SwarmManagerWidget';
import EvolutionEnginePanel from './components/EvolutionEnginePanel';
import SystemHealthDiagnostic from './components/SystemHealthDiagnostic';
import CanaryPromotionPanel from './components/CanaryPromotionPanel';


const AISwarmHub = () => {
  const [activeTab, setActiveTab] = useState('swarm');
  const [systemHealth, setSystemHealth] = useState({ ok: true, services: [] });

  useEffect(() => {
    // Health check on mount
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response?.json();
        setSystemHealth(prev => ({ ...prev, ok: data?.ok || false }));
      } catch (error) {
        setSystemHealth(prev => ({ ...prev, ok: false }));
      }
    };

    checkHealth();
  }, []);

  const tabs = [
    { id: 'swarm', label: 'AI Swarm', icon: Users, description: 'Nomadic AI agents management' },
    { id: 'evolution', label: 'Evolution Engine', icon: GitBranch, description: 'Genetic strategy breeding' },
    { id: 'canary', label: 'Canary IBKR', icon: TrendingUp, description: 'Paper trading promotion' },
    { id: 'diagnostic', label: 'System Health', icon: Activity, description: 'Platform diagnostics' }
  ];

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab?.id)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <tab.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
      <div className="text-left">
        <div className="font-semibold">{tab?.label}</div>
        <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
          {tab?.description}
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Swarm Hub</h1>
                <p className="text-sm text-gray-500">Global AI Trading Intelligence Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {systemHealth?.ok ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">System Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">System Issues</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-2">
                {tabs?.map((tab) => (
                  <TabButton
                    key={tab?.id}
                    tab={tab}
                    isActive={activeTab === tab?.id}
                    onClick={setActiveTab}
                  />
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Agents</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Evolution Candidates</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Canary Deployments</span>
                  <span className="font-semibold text-gray-900">--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'swarm' && (
              <div className="space-y-6">
                <SwarmManagerWidget />
              </div>
            )}

            {activeTab === 'evolution' && (
              <div className="space-y-6">
                <EvolutionEnginePanel />
              </div>
            )}

            {activeTab === 'canary' && (
              <div className="space-y-6">
                <CanaryPromotionPanel />
              </div>
            )}

            {activeTab === 'diagnostic' && (
              <div className="space-y-6">
                <SystemHealthDiagnostic />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISwarmHub;