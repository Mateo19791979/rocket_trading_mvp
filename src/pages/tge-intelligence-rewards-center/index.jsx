import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Database, Award, AlertTriangle, Settings, Play, Target } from 'lucide-react';
import TgeEventsPanel from './components/TgeEventsPanel';
import SourceRewardsPanel from './components/SourceRewardsPanel';
import IntelligenceScoring from './components/IntelligenceScoring';
import DataHealthMonitoring from './components/DataHealthMonitoring';
import AutomatedAlerts from './components/AutomatedAlerts';
import RewardOptimization from './components/RewardOptimization';
import { aiOps } from '../../lib/aiOpsClient';
import Icon from '@/components/AppIcon';


export default function TGEIntelligenceRewardsCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemMetrics();
  }, []);

  const loadSystemMetrics = async () => {
    setLoading(true);
    try {
      const [dhiResult, sourceResult, iqsResult, tgeResult] = await Promise.all([
        aiOps?.getAllDhiMetrics(),
        aiOps?.getSourceRewards(),
        aiOps?.getIQSScores(10),
        aiOps?.getTgeStatistics()
      ]);

      setSystemMetrics({
        dhi: dhiResult?.data || [],
        sources: sourceResult?.data || [],
        iqs: iqsResult?.data || [],
        tge: tgeResult?.data || []
      });
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'events', label: 'TGE Events', icon: TrendingUp },
    { id: 'sources', label: 'Source Rewards', icon: Award },
    { id: 'intelligence', label: 'Intelligence Scoring', icon: Target },
    { id: 'health', label: 'Data Health', icon: Database },
    { id: 'alerts', label: 'Automated Alerts', icon: AlertTriangle },
    { id: 'optimization', label: 'Optimization', icon: Settings }
  ];

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* System Health Overview */}
      <div className="lg:col-span-3">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="w-6 h-6 text-purple-400 mr-2" />
            AI Intelligence & Rewards System Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-teal-400">
                {systemMetrics?.dhi?.length || 0}
              </div>
              <div className="text-sm text-gray-300">Data Streams</div>
              <div className="text-xs text-teal-300">
                Avg DHI: {systemMetrics?.dhi?.length > 0 
                  ? (systemMetrics?.dhi?.reduce((acc, d) => acc + (d?.dhi || 0), 0) / systemMetrics?.dhi?.length)?.toFixed(2)
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">
                {systemMetrics?.sources?.length || 0}
              </div>
              <div className="text-sm text-gray-300">Source Providers</div>
              <div className="text-xs text-orange-300">
                Total Pulls: {systemMetrics?.sources?.reduce((acc, s) => acc + (s?.pulls || 0), 0) || 0}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {systemMetrics?.iqs?.length || 0}
              </div>
              <div className="text-sm text-gray-300">Insights Scored</div>
              <div className="text-xs text-purple-300">
                Avg IQS: {systemMetrics?.iqs?.length > 0
                  ? (systemMetrics?.iqs?.reduce((acc, i) => acc + (i?.iqs || 0), 0) / systemMetrics?.iqs?.length)?.toFixed(2)
                  : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {systemMetrics?.tge?.length || 0}
              </div>
              <div className="text-sm text-gray-300">TGE Events</div>
              <div className="text-xs text-green-300">
                Active Monitoring
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Play className="w-5 h-5 text-purple-400 mr-2" />
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button 
            onClick={() => handleRunCritique()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Activity className="w-4 h-4 mr-2" />
            Run Nightly Critique
          </button>
          <button 
            onClick={() => setActiveTab('sources')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Award className="w-4 h-4 mr-2" />
            Update Source Rewards
          </button>
          <button 
            onClick={() => setActiveTab('health')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Database className="w-4 h-4 mr-2" />
            Check Data Health
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent AI Activity</h3>
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-medium">Source Reward Updated</span>
              <span className="text-gray-400 text-sm">2 min ago</span>
            </div>
            <p className="text-gray-300 text-sm">icoanalytics.com - Success rate: 84%</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-purple-400 font-medium">IQS Score Calculated</span>
              <span className="text-gray-400 text-sm">5 min ago</span>
            </div>
            <p className="text-gray-300 text-sm">BTC momentum signal - IQS: 0.85</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-orange-400 font-medium">DHI Alert</span>
              <span className="text-gray-400 text-sm">12 min ago</span>
            </div>
            <p className="text-gray-300 text-sm">data.news.crypto.feed - DHI below threshold</p>
          </div>
        </div>
      </div>
    </div>
  );

  const handleRunCritique = async () => {
    try {
      const result = await aiOps?.runCritique();
      if (result?.ok) {
        alert(`Critique completed. Found ${result?.recurring?.length || 0} recurring issues with ${result?.advice?.length || 0} recommendations.`);
      } else {
        alert(`Critique failed: ${result?.error}`);
      }
    } catch (error) {
      alert(`Error running critique: ${error?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading AI Intelligence System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">TGE Intelligence & Rewards Center</h1>
              <p className="text-gray-400 mt-1">
                Comprehensive Token Generation Event monitoring with intelligent source reward tracking
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">AI System Active</span>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs?.map((tab) => {
              const Icon = tab?.icon;
              return (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab?.id
                      ? 'border-purple-500 text-purple-400' :'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'events' && <TgeEventsPanel />}
        {activeTab === 'sources' && <SourceRewardsPanel />}
        {activeTab === 'intelligence' && <IntelligenceScoring />}
        {activeTab === 'health' && <DataHealthMonitoring />}
        {activeTab === 'alerts' && <AutomatedAlerts />}
        {activeTab === 'optimization' && <RewardOptimization />}
      </div>
    </div>
  );
}