import { useState, useEffect } from 'react';
import { Zap, DollarSign, Settings, AlertTriangle, Activity, Cpu, HardDrive, BarChart3, Target, Award, Brain, Gauge } from 'lucide-react';

import AttentionAuctionEngine from './components/AttentionAuctionEngine';
import ResourcePoolManagement from './components/ResourcePoolManagement';
import BiddingStrategyConfiguration from './components/BiddingStrategyConfiguration';
import MarketActivityDashboard from './components/MarketActivityDashboard';
import AllocationAnalytics from './components/AllocationAnalytics';
import AdvancedMarketControls from './components/AdvancedMarketControls';

import attentionMarketService from '../../services/attentionMarketService';
import Icon from '@/components/AppIcon';


export default function AttentionMarketResourceAllocationHub() {
  const [marketState, setMarketState] = useState(null);
  const [resourceMetrics, setResourceMetrics] = useState(null);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('auction');

  const loadMarketData = async () => {
    try {
      const [marketResult, metricsResult, performanceResult] = await Promise.allSettled([
        attentionMarketService?.getMarketState(),
        attentionMarketService?.getResourceAllocationMetrics(),
        attentionMarketService?.getAgentPerformanceMetrics()
      ]);

      if (marketResult?.status === 'fulfilled' && marketResult?.value?.success) {
        setMarketState(marketResult?.value?.marketState);
      }

      if (metricsResult?.status === 'fulfilled' && metricsResult?.value?.success) {
        setResourceMetrics(metricsResult?.value?.metrics);
      }

      if (performanceResult?.status === 'fulfilled' && performanceResult?.value?.success) {
        setAgentPerformance(performanceResult?.value?.agentMetrics);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load market data: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  // Real-time data refresh
  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleBidSubmission = async (bidData) => {
    try {
      const result = await attentionMarketService?.submitBid(
        bidData?.agent,
        bidData?.taskId,
        bidData?.bidAmount,
        bidData?.priority,
        bidData?.computationalResources
      );

      if (result?.success) {
        await loadMarketData(); // Refresh data
        return { success: true, message: 'Bid submitted successfully' };
      } else {
        return { success: false, message: result?.error };
      }
    } catch (err) {
      return { success: false, message: err?.message };
    }
  };

  const handleBidResolution = async () => {
    try {
      const result = await attentionMarketService?.resolveBids();
      if (result?.success) {
        await loadMarketData(); // Refresh data
        return { success: true, resolution: result?.resolution };
      } else {
        return { success: false, message: result?.error };
      }
    } catch (err) {
      return { success: false, message: err?.message };
    }
  };

  const handleEmergencyReallocation = async (criticalTasks, emergencyBudget) => {
    try {
      const result = await attentionMarketService?.emergencyResourceReallocation(criticalTasks, emergencyBudget);
      if (result?.success) {
        await loadMarketData(); // Refresh data
        return { success: true, message: 'Emergency reallocation completed' };
      } else {
        return { success: false, message: result?.error };
      }
    } catch (err) {
      return { success: false, message: err?.message };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Activity className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p className="text-xl">Loading Attention Market...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-xl mb-2">Market Connection Error</p>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={loadMarketData}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-400 to-blue-500 p-3 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Attention Market & Resource Allocation Hub
                </h1>
                <p className="text-gray-300 mt-1">
                  Advanced computational resource allocation through market-based mechanisms
                </p>
              </div>
            </div>
            
            {/* Real-time status */}
            <div className="flex items-center space-x-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-semibold">Market Active</span>
                </div>
              </div>
              
              {marketState && (
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">
                      {marketState?.budgetUtilization}% Utilized
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Market Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bids */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bids</p>
                <p className="text-2xl font-bold text-white">
                  {marketState?.totalBids || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          {/* Budget Utilization */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Budget Used</p>
                <p className="text-2xl font-bold text-white">
                  {marketState?.budgetUtilization || 0}%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          {/* Active Agents */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Agents</p>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(marketState?.agentActivity || {})?.length}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Efficiency Score */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Efficiency</p>
                <p className="text-2xl font-bold text-white">
                  {resourceMetrics?.durationAccuracy ? `${resourceMetrics?.durationAccuracy?.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-2">
            {[
              { id: 'auction', label: 'Auction Engine', icon: Zap },
              { id: 'resources', label: 'Resource Pool', icon: HardDrive },
              { id: 'strategy', label: 'Bidding Strategy', icon: Settings },
              { id: 'activity', label: 'Market Activity', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'controls', label: 'Advanced Controls', icon: Target }
            ]?.map(tab => {
              const Icon = tab?.icon;
              return (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab?.id
                      ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab?.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-1 space-y-6">
            {activeTab === 'auction' && (
              <AttentionAuctionEngine
                marketState={marketState}
                onBidSubmission={handleBidSubmission}
                onBidResolution={handleBidResolution}
              />
            )}
            
            {activeTab === 'resources' && (
              <ResourcePoolManagement
                resourceMetrics={resourceMetrics}
                marketState={marketState}
              />
            )}
            
            {activeTab === 'strategy' && (
              <BiddingStrategyConfiguration
                agentPerformance={agentPerformance}
                onConfigUpdate={loadMarketData}
              />
            )}
          </div>

          {/* Center Column */}
          <div className="xl:col-span-1 space-y-6">
            {activeTab === 'activity' && (
              <MarketActivityDashboard
                marketState={marketState}
                resourceMetrics={resourceMetrics}
              />
            )}
            
            {activeTab === 'analytics' && (
              <AllocationAnalytics
                resourceMetrics={resourceMetrics}
                agentPerformance={agentPerformance}
                marketState={marketState}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="xl:col-span-1 space-y-6">
            {activeTab === 'controls' && (
              <AdvancedMarketControls
                onEmergencyReallocation={handleEmergencyReallocation}
                marketState={marketState}
                onRefresh={loadMarketData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}