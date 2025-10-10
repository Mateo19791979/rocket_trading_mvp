import React, { useState } from 'react';
import { Shield, TrendingUp, Brain, AlertCircle, RefreshCw, Zap, Target } from 'lucide-react';

export default function MetaLearningController({ aiAgents, strategies, evolutionMetrics, onRefreshData }) {
  const [selectedController, setSelectedController] = useState('governance');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const controllers = [
    { id: 'governance', name: 'Auto-Gouvernance', icon: Shield },
    { id: 'portfolio', name: 'Portfolio Manager', icon: TrendingUp },
    { id: 'metalearning', name: 'Meta-Learning', icon: Brain }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const calculateSystemHealth = () => {
    const totalAgents = aiAgents?.length;
    const activeAgents = aiAgents?.filter(agent => agent?.status === 'active')?.length;
    const highPerformingStrategies = strategies?.filter(s => s?.performance_score > 70)?.length;
    
    return {
      agentHealth: totalAgents > 0 ? Math.round((activeAgents / totalAgents) * 100) : 0,
      strategyHealth: strategies?.length > 0 ? Math.round((highPerformingStrategies / strategies?.length) * 100) : 0,
      overallHealth: Math.round(((activeAgents + highPerformingStrategies) / (totalAgents + strategies?.length)) * 100) || 0
    };
  };

  const systemHealth = calculateSystemHealth();

  const renderGovernanceController = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-green-400" />
        Autonomous Governance Panel
      </h3>

      {/* System Health Monitoring */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">System Health Monitor</h4>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Agent Health</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">{systemHealth?.agentHealth}%</span>
              <div className="w-16 bg-gray-600 rounded-full h-2">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: `${systemHealth?.agentHealth}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Strategy Health</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">{systemHealth?.strategyHealth}%</span>
              <div className="w-16 bg-gray-600 rounded-full h-2">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${systemHealth?.strategyHealth}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Overall Health</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">{systemHealth?.overallHealth}%</span>
              <div className="w-16 bg-gray-600 rounded-full h-2">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${systemHealth?.overallHealth}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Self-Modification Protocols */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Self-Modification Protocols</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Auto-parameter tuning</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Strategy evolution</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-400">Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Risk auto-adjustment</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-xs text-yellow-400">Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Constraint Management */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Ethical Constraints</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-gray-300">Max drawdown limit: 15%</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Position size limit: 5%</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Risk-free rate floor: 2%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolioController = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        Strategy Portfolio Manager
      </h3>

      {/* Portfolio of Strategies */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Active Strategy Allocation</h4>
        <div className="space-y-3">
          {strategies?.slice(0, 4)?.map((strategy, index) => {
            const allocation = Math.floor(Math.random() * 30) + 10; // Simulated allocation
            const performance = strategy?.performance_score || Math.floor(Math.random() * 100);
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">
                    {strategy?.name || `Strategy ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">{allocation}%</span>
                  <div className="w-12 bg-gray-600 rounded-full h-2">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min(performance, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Portfolio Metrics</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-400">Sharpe Ratio</div>
            <div className="text-lg font-bold text-green-400">2.34</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Max Drawdown</div>
            <div className="text-lg font-bold text-red-400">-8.2%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-lg font-bold text-blue-400">68.5%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Alpha</div>
            <div className="text-lg font-bold text-purple-400">4.2%</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetaLearningController = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-400" />
        Meta-Learning Engine
      </h3>

      {/* Learning Model Selection */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Model Architecture Selection</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Primary Model</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">Transformer + GNN</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Backup Model</span>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white">LSTM + Attention</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Learning Rate</span>
            <span className="text-sm text-white">0.001 → 0.0005</span>
          </div>
        </div>
      </div>

      {/* Hyperparameter Optimization */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Auto Hyperparameter Tuning</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Batch Size</span>
            <span className="text-sm text-white">64 → 128</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Dropout Rate</span>
            <span className="text-sm text-white">0.2 → 0.15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Window Size</span>
            <span className="text-sm text-white">20 → 30</span>
          </div>
        </div>
      </div>

      {/* Learning Performance */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Learning Performance</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Convergence Rate</span>
            <span className="text-sm text-green-400">+12.5%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Validation Accuracy</span>
            <span className="text-sm text-green-400">87.3%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Overfitting Risk</span>
            <span className="text-sm text-yellow-400">Low</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-gold-500/30">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Meta-Learning Controller</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>
      {/* Controller Navigation */}
      <div className="flex border-b border-gray-700">
        {controllers?.map((controller) => {
          const IconComponent = controller?.icon;
          return (
            <button
              key={controller?.id}
              onClick={() => setSelectedController(controller?.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedController === controller?.id
                  ? 'text-purple-400 border-b-2 border-purple-400' :'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconComponent className="w-4 h-4" />
                {controller?.name}
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-6">
        {selectedController === 'governance' && renderGovernanceController()}
        {selectedController === 'portfolio' && renderPortfolioController()}
        {selectedController === 'metalearning' && renderMetaLearningController()}
      </div>
    </div>
  );
}