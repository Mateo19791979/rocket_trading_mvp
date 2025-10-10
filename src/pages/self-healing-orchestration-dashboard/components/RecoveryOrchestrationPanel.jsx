import React, { useState } from 'react';
import { GitBranch, Play, Settings, Clock, CheckCircle, AlertTriangle, RefreshCw, Target, Zap, TrendingUp } from 'lucide-react';
import selfHealingService from '../../../services/selfHealingService';

const RecoveryOrchestrationPanel = ({ orchestratorState = [], recoveryOperations = [], onUpdateThresholds }) => {
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholds, setThresholds] = useState({
    max_daily_loss: 1000,
    max_portfolio_drawdown: 10,
    recovery_delay_minutes: 30,
    cpu_threshold: 90,
    memory_threshold: 85,
    error_rate_threshold: 5
  });
  const [loading, setLoading] = useState(false);

  // Parse orchestrator state data
  const parsedState = orchestratorState?.reduce((acc, state) => {
    acc[state?.key] = state?.value;
    return acc;
  }, {});

  const systemMode = parsedState?.system_mode || { mode: 'NORMAL' };
  const killswitchStatus = parsedState?.killswitch_status || { enabled: false };
  const lastRegimeUpdate = parsedState?.last_regime_update || { regime: 'stable' };

  const handleUpdateThresholds = async () => {
    try {
      setLoading(true);
      await selfHealingService?.updateRecoveryThresholds({
        ...thresholds,
        configuration: {
          cpu_threshold: thresholds?.cpu_threshold,
          memory_threshold: thresholds?.memory_threshold,
          error_rate_threshold: thresholds?.error_rate_threshold,
          validate_orders: true,
          market_hours_only: true
        }
      });
      
      setShowThresholdModal(false);
      onUpdateThresholds?.();
    } catch (error) {
      console.error('Failed to update thresholds:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowStatus = (workflow) => {
    const statuses = ['queued', 'running', 'completed', 'failed'];
    return statuses?.[Math.floor(Math.random() * statuses?.length)];
  };

  const getWorkflowColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-400 bg-blue-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'queued': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Mock recovery workflows for demonstration
  const recoveryWorkflows = [
    {
      id: 1,
      name: 'Agent Health Recovery',
      description: 'Automated restart of unhealthy agents',
      status: getWorkflowStatus(),
      progress: Math.floor(Math.random() * 100),
      lastRun: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)?.toISOString()
    },
    {
      id: 2,
      name: 'Provider Failover',
      description: 'Switch to backup data providers',
      status: getWorkflowStatus(),
      progress: Math.floor(Math.random() * 100),
      lastRun: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)?.toISOString()
    },
    {
      id: 3,
      name: 'Memory Cleanup',
      description: 'Garbage collection and memory optimization',
      status: getWorkflowStatus(),
      progress: Math.floor(Math.random() * 100),
      lastRun: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)?.toISOString()
    },
    {
      id: 4,
      name: 'Load Balancing',
      description: 'Redistribute workload across healthy agents',
      status: getWorkflowStatus(),
      progress: Math.floor(Math.random() * 100),
      lastRun: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)?.toISOString()
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp)?.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <GitBranch className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Recovery Orchestration</h2>
            <p className="text-sm text-gray-400">Automated remediation workflows and graceful degradation protocols</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowThresholdModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Thresholds</span>
        </button>
      </div>
      {/* Orchestration Status */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Target className="w-5 h-5 text-orange-400" />
          <span>Orchestration Status</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">System Mode</span>
              <div className={`w-3 h-3 rounded-full ${
                systemMode?.mode === 'NORMAL' ? 'bg-green-400' :
                systemMode?.mode === 'PARTIAL' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
            </div>
            <div className="text-xl font-semibold text-white">{systemMode?.mode || 'NORMAL'}</div>
            <div className="text-xs text-gray-400">
              {systemMode?.providers_up || 0} providers active
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Killswitch</span>
              <div className={`w-3 h-3 rounded-full ${killswitchStatus?.enabled ? 'bg-red-400' : 'bg-green-400'}`} />
            </div>
            <div className="text-xl font-semibold text-white">
              {killswitchStatus?.enabled ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="text-xs text-gray-400">
              {killswitchStatus?.last_triggered ? 
                `Last: ${formatTimeAgo(killswitchStatus?.last_triggered)}` : 
                'Never triggered'
              }
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Market Regime</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-semibold text-white capitalize">
              {lastRegimeUpdate?.regime || 'Stable'}
            </div>
            <div className="text-xs text-gray-400">
              {lastRegimeUpdate?.timestamp ? formatTimeAgo(lastRegimeUpdate?.timestamp) : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
      {/* Recovery Workflows */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-green-400" />
          <span>Automated Remediation Workflows</span>
        </h3>
        
        <div className="space-y-3">
          {recoveryWorkflows?.map((workflow) => (
            <div key={workflow?.id} className="border border-gray-600/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{workflow?.name}</h4>
                  <p className="text-sm text-gray-400">{workflow?.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkflowColor(workflow?.status)}`}>
                    {workflow?.status}
                  </span>
                  <button className="p-1 text-gray-400 hover:text-white">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Last run: {formatTimeAgo(workflow?.lastRun)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        workflow?.status === 'completed' ? 'bg-green-400' :
                        workflow?.status === 'running' ? 'bg-blue-400' :
                        workflow?.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${workflow?.progress}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs">{workflow?.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Graceful Degradation */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span>Graceful Degradation Protocols</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Active Protocols</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Reduced Frequency Mode</span>
                <span className="text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cached Data Fallback</span>
                <span className="text-green-400">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Essential Services Only</span>
                <span className="text-gray-400">Disabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Read-Only Mode</span>
                <span className="text-gray-400">Disabled</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Recovery Success Rate</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last 24h</span>
                <span className="text-lg font-semibold text-green-400">94.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last 7d</span>
                <span className="text-lg font-semibold text-green-400">96.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Last 30d</span>
                <span className="text-lg font-semibold text-blue-400">95.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Threshold Configuration Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-lg w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Recovery Thresholds</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Max Daily Loss ($)</label>
                <input
                  type="number"
                  value={thresholds?.max_daily_loss}
                  onChange={(e) => setThresholds({...thresholds, max_daily_loss: parseFloat(e?.target?.value)})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Max Portfolio Drawdown (%)</label>
                <input
                  type="number"
                  value={thresholds?.max_portfolio_drawdown}
                  onChange={(e) => setThresholds({...thresholds, max_portfolio_drawdown: parseFloat(e?.target?.value)})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Recovery Delay (minutes)</label>
                <input
                  type="number"
                  value={thresholds?.recovery_delay_minutes}
                  onChange={(e) => setThresholds({...thresholds, recovery_delay_minutes: parseInt(e?.target?.value)})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">CPU Threshold (%)</label>
                  <input
                    type="number"
                    value={thresholds?.cpu_threshold}
                    onChange={(e) => setThresholds({...thresholds, cpu_threshold: parseFloat(e?.target?.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Memory Threshold (%)</label>
                  <input
                    type="number"
                    value={thresholds?.memory_threshold}
                    onChange={(e) => setThresholds({...thresholds, memory_threshold: parseFloat(e?.target?.value)})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowThresholdModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateThresholds}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryOrchestrationPanel;