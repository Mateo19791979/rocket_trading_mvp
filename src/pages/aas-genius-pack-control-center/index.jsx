import { useState, useEffect } from 'react';
import { Activity, Target, Brain, Zap, TrendingUp, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { omegaAIService } from '../../services/omegaAI.js';
import { syntheticMarketService } from '../../services/syntheticMarket.js';
import { attentionMarketService } from '../../services/attentionMarket.js';
import OmegaAntagonistController from './components/OmegaAntagonistController.jsx';
import ForwardTestingMarketSimulator from './components/ForwardTestingMarketSimulator.jsx';
import AttentionMarketOrchestrator from './components/AttentionMarketOrchestrator.jsx';
import GeniusPackDashboard from './components/GeniusPackDashboard.jsx';
import AdvancedAnalyticsCenter from './components/AdvancedAnalyticsCenter.jsx';
import Icon from '@/components/AppIcon';



export default function AASGeniusPackControlCenter() {
  const [dashboardStats, setDashboardStats] = useState({
    omega: { totalAttacks: 0, successRate: 0, vulnerableStrategies: 0 },
    synthetic: { totalTests: 0, avgRobustness: 0, highPerformers: 0 },
    attention: { activeBids: 0, budgetUsed: 0, marketEfficiency: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [logs, setLogs] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [omegaStats, syntheticStats, attentionStats] = await Promise.all([
        omegaAIService?.getOmegaStats(),
        syntheticMarketService?.getSyntheticMarketStats(),
        attentionMarketService?.getMarketStats()
      ]);

      setDashboardStats({
        omega: {
          totalAttacks: omegaStats?.stats?.totalAttacks || 0,
          successRate: omegaStats?.stats?.successRate || 0,
          vulnerableStrategies: omegaStats?.stats?.recentAttacks?.length || 0
        },
        synthetic: {
          totalTests: syntheticStats?.stats?.total_tests || 0,
          avgRobustness: syntheticStats?.stats?.avg_robustness || 0,
          highPerformers: syntheticStats?.stats?.low_risk_count || 0
        },
        attention: {
          activeBids: attentionStats?.stats?.pending_bids || 0,
          budgetUsed: attentionStats?.stats?.total_budget_used || 0,
          marketEfficiency: parseFloat(attentionStats?.stats?.market_efficiency) || 0
        }
      });

      addLog(`Dashboard refreshed - Omega: ${omegaStats?.stats?.totalAttacks || 0} attacks, Synthetic: ${syntheticStats?.stats?.total_tests || 0} tests, Attention: ${attentionStats?.stats?.pending_bids || 0} bids`);
    } catch (error) {
      addLog(`Dashboard refresh error: ${error?.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date()?.toLocaleTimeString();
    const newLog = { timestamp, message, type };
    setLogs(prev => [newLog, ...prev?.slice(0, 49)]); // Keep last 50 logs
  };

  const runAllModules = async () => {
    addLog('Starting comprehensive AAS Genius Pack execution...', 'info');
    
    try {
      // Run Attention Market resolution first
      const attentionResult = await attentionMarketService?.resolveBids();
      if (attentionResult?.success) {
        addLog(`Attention Market: Resolved ${attentionResult?.bids_resolved} bids, ${attentionResult?.winners?.length || 0} winners`, 'success');
      }

      // Trigger dashboard refresh
      setTimeout(loadDashboardData, 2000);
      addLog('AAS Genius Pack execution cycle completed', 'success');
    } catch (error) {
      addLog(`Execution error: ${error?.message || 'Unknown error'}`, 'error');
    }
  };

  const moduleButtons = [
    { key: 'dashboard', label: 'Dashboard', icon: Activity, color: 'purple' },
    { key: 'omega', label: 'Omega AI', icon: Target, color: 'red' },
    { key: 'synthetic', label: 'Forward Market', icon: TrendingUp, color: 'blue' },
    { key: 'attention', label: 'Attention Market', icon: Zap, color: 'yellow' },
    { key: 'analytics', label: 'Analytics', icon: Brain, color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-gold-400 to-blue-400 bg-clip-text text-transparent">
              AAS Genius Pack Control Center
            </h1>
            <p className="text-gray-300 mt-2">
              Revolutionary AI Modules: Omega Antagonist • Forward-Testing Market • Attention Allocation
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-white text-sm">{loading ? 'Syncing...' : 'Live'}</span>
            </div>
            <button
              onClick={runAllModules}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200"
            >
              Execute All Modules
            </button>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="flex space-x-2">
          {moduleButtons?.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setActiveModule(key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeModule === key
                  ? `bg-${color}-600 text-white`
                  : `bg-gray-800 text-gray-300 hover:bg-${color}-600/20 hover:text-${color}-400`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-red-400 font-semibold">Omega Antagonist</h3>
            <Target className="w-6 h-6 text-red-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Attacks</span>
              <span className="text-white font-semibold">{dashboardStats?.omega?.totalAttacks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Success Rate</span>
              <span className="text-white font-semibold">{dashboardStats?.omega?.successRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-400 font-semibold">Synthetic Market</h3>
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Tests</span>
              <span className="text-white font-semibold">{dashboardStats?.synthetic?.totalTests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Avg Robustness</span>
              <span className="text-white font-semibold">{dashboardStats?.synthetic?.avgRobustness}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-yellow-400 font-semibold">Attention Market</h3>
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Active Bids</span>
              <span className="text-white font-semibold">{dashboardStats?.attention?.activeBids}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Efficiency</span>
              <span className="text-white font-semibold">{dashboardStats?.attention?.marketEfficiency}%</span>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          {activeModule === 'dashboard' && (
            <GeniusPackDashboard 
              stats={dashboardStats}
              onModuleSelect={setActiveModule}
              onLogAdd={addLog}
            />
          )}
          
          {activeModule === 'omega' && (
            <OmegaAntagonistController onLogAdd={addLog} />
          )}
          
          {activeModule === 'synthetic' && (
            <ForwardTestingMarketSimulator onLogAdd={addLog} />
          )}
          
          {activeModule === 'attention' && (
            <AttentionMarketOrchestrator onLogAdd={addLog} />
          )}
          
          {activeModule === 'analytics' && (
            <AdvancedAnalyticsCenter 
              stats={dashboardStats}
              regimeState={{ currentRegime: 'normal', confidence: 0.85 }}
              onLogAdd={addLog}
            />
          )}
        </div>

        {/* Activity Log Sidebar */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Activity Log</h3>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs?.length > 0 ? (
              logs?.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm border-l-4 ${
                    log?.type === 'error' ?'bg-red-900/30 border-red-500 text-red-300'
                      : log?.type === 'success' ?'bg-green-900/30 border-green-500 text-green-300' :'bg-gray-700/50 border-purple-500 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {log?.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                    {log?.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {log?.type === 'info' && <Shield className="w-4 h-4" />}
                    <span className="text-xs opacity-70">{log?.timestamp}</span>
                  </div>
                  <div>{log?.message}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                No activity logs yet...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}