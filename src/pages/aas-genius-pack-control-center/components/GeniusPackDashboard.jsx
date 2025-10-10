import { useState, useEffect } from 'react';
import { Activity, Target, TrendingUp, Zap, Brain, Shield, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import Icon from '@/components/AppIcon';



export default function GeniusPackDashboard({ stats, onModuleSelect, onLogAdd }) {
  const [moduleHealth, setModuleHealth] = useState({
    omega: 'healthy',
    synthetic: 'healthy', 
    attention: 'healthy'
  });

  useEffect(() => {
    calculateModuleHealth();
  }, [stats]);

  const calculateModuleHealth = () => {
    const health = {
      omega: calculateOmegaHealth(),
      synthetic: calculateSyntheticHealth(),
      attention: calculateAttentionHealth()
    };
    setModuleHealth(health);
  };

  const calculateOmegaHealth = () => {
    const { omega } = stats;
    if (omega?.totalAttacks === 0) return 'warning';
    if (omega?.successRate > 50) return 'critical';
    if (omega?.successRate > 30) return 'warning';
    return 'healthy';
  };

  const calculateSyntheticHealth = () => {
    const { synthetic } = stats;
    if (synthetic?.totalTests === 0) return 'warning';
    if (synthetic?.avgRobustness < 40) return 'critical';
    if (synthetic?.avgRobustness < 60) return 'warning';
    return 'healthy';
  };

  const calculateAttentionHealth = () => {
    const { attention } = stats;
    if (attention?.marketEfficiency < 30) return 'critical';
    if (attention?.marketEfficiency < 60) return 'warning';
    return 'healthy';
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-400 border-green-500/30 bg-green-900/20';
      case 'warning': return 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20';
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-900/20';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-900/20';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getSystemOverallHealth = () => {
    const healthScores = {
      healthy: 3,
      warning: 2,
      critical: 1
    };
    
    const avgScore = (
      healthScores?.[moduleHealth?.omega] +
      healthScores?.[moduleHealth?.synthetic] +
      healthScores?.[moduleHealth?.attention]
    ) / 3;

    if (avgScore >= 2.5) return 'healthy';
    if (avgScore >= 2) return 'warning';
    return 'critical';
  };

  const moduleCards = [
    {
      key: 'omega',
      title: 'Omega AI Antagonist',
      description: 'Digital Twin Adversarial Testing',
      icon: Target,
      color: 'red',
      health: moduleHealth?.omega,
      primaryMetric: `${stats?.omega?.totalAttacks} attacks`,
      secondaryMetric: `${stats?.omega?.successRate}% success rate`,
      details: [
        { label: 'Total Attacks', value: stats?.omega?.totalAttacks },
        { label: 'Success Rate', value: `${stats?.omega?.successRate}%` },
        { label: 'Vulnerable Strategies', value: stats?.omega?.vulnerableStrategies }
      ]
    },
    {
      key: 'synthetic',
      title: 'Synthetic Market Simulator',
      description: '1000 Futures Forward-Testing',
      icon: TrendingUp,
      color: 'blue',
      health: moduleHealth?.synthetic,
      primaryMetric: `${stats?.synthetic?.totalTests} tests`,
      secondaryMetric: `${stats?.synthetic?.avgRobustness}% avg robustness`,
      details: [
        { label: 'Forward Tests', value: stats?.synthetic?.totalTests },
        { label: 'Avg Robustness', value: `${stats?.synthetic?.avgRobustness}%` },
        { label: 'High Performers', value: stats?.synthetic?.highPerformers }
      ]
    },
    {
      key: 'attention',
      title: 'Attention Market',
      description: 'Computational Resource Allocation',
      icon: Zap,
      color: 'yellow',
      health: moduleHealth?.attention,
      primaryMetric: `${stats?.attention?.activeBids} active bids`,
      secondaryMetric: `${stats?.attention?.marketEfficiency}% efficiency`,
      details: [
        { label: 'Active Bids', value: stats?.attention?.activeBids },
        { label: 'Budget Used', value: `$${(stats?.attention?.budgetUsed || 0)?.toLocaleString()}` },
        { label: 'Market Efficiency', value: `${stats?.attention?.marketEfficiency}%` }
      ]
    }
  ];

  const overallHealth = getSystemOverallHealth();
  const OverallHealthIcon = getHealthIcon(overallHealth);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* System Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Genius Pack Dashboard</h2>
            <p className="text-gray-400">Comprehensive Multi-Module Coordination & Analytics</p>
          </div>
          <div className={`flex items-center space-x-3 px-6 py-3 rounded-lg border ${getHealthColor(overallHealth)}`}>
            <OverallHealthIcon className="w-6 h-6" />
            <div>
              <div className="text-sm font-medium">System Health</div>
              <div className="text-lg font-bold capitalize">{overallHealth}</div>
            </div>
          </div>
        </div>

        {/* Cross-Module Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg border border-purple-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300 text-sm">Meta Intelligence</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {Math.round((stats?.omega?.totalAttacks + stats?.synthetic?.totalTests + stats?.attention?.activeBids) / 3)}
            </div>
            <div className="text-xs text-gray-400">Cross-module activity score</div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg border border-blue-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300 text-sm">System Efficiency</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {Math.round((
                (100 - stats?.omega?.successRate) + // Lower omega success = higher efficiency
                stats?.synthetic?.avgRobustness +
                stats?.attention?.marketEfficiency
              ) / 3)}%
            </div>
            <div className="text-xs text-gray-400">Combined performance metric</div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg border border-green-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Risk Mitigation</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {Math.round((
                (// Higher robustness = lower risk
                (stats?.omega?.totalAttacks > 0 ? 85 : 50) + // Omega provides risk testing
                stats?.synthetic?.avgRobustness + (stats?.attention?.activeBids > 0 ? 75 : 50)) // Active resource allocation
              ) / 3)}%
            </div>
            <div className="text-xs text-gray-400">Collective risk coverage</div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg border border-gold-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300 text-sm">Innovation Index</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {Math.min(100, Math.round((
                (// Future scenario generation
                stats?.omega?.totalAttacks * 2 + // Novel adversarial insights
                stats?.synthetic?.totalTests * 3 + stats?.attention?.activeBids * 1.5) // Dynamic resource optimization
              ) / 10))}
            </div>
            <div className="text-xs text-gray-400">Multi-dimensional advancement</div>
          </div>
        </div>
      </div>
      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {moduleCards?.map((module) => {
          const Icon = module.icon;
          const HealthIcon = getHealthIcon(module.health);
          
          return (
            <div
              key={module.key}
              className={`bg-gray-700 rounded-lg p-6 border cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-gray-600 ${getHealthColor(module.health)}`}
              onClick={() => onModuleSelect(module.key)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-8 h-8 text-${module.color}-400`} />
                  <div>
                    <h3 className="text-white font-semibold text-lg">{module.title}</h3>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                  </div>
                </div>
                <HealthIcon className={`w-5 h-5 ${module.health === 'healthy' ? 'text-green-400' : module.health === 'warning' ? 'text-yellow-400' : 'text-red-400'}`} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Primary</span>
                  <span className="text-white font-semibold">{module.primaryMetric}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Performance</span>
                  <span className="text-white font-semibold">{module.secondaryMetric}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-600">
                  <div className="grid grid-cols-1 gap-2">
                    {module.details?.map((detail, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-400">{detail?.label}</span>
                        <span className="text-white">{detail?.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                className={`w-full mt-4 px-4 py-2 bg-${module.color}-600 hover:bg-${module.color}-700 text-white rounded-lg font-medium transition-colors`}
              >
                Enter {module.title}
              </button>
            </div>
          );
        })}
      </div>
      {/* Data Flow Integration */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>Cross-Module Data Flow Integration</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="text-red-400 font-medium flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Omega → Synthetic</span>
            </div>
            <div className="text-sm text-gray-300 bg-gray-600 p-3 rounded">
              Omega attack results inform synthetic market stress scenarios, creating more realistic forward-testing conditions.
            </div>
            <div className="text-xs text-gray-400">
              {stats?.omega?.totalAttacks > 0 && stats?.synthetic?.totalTests > 0 ? 
                '✅ Active data exchange' : '⏳ Waiting for cross-module data'
              }
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-blue-400 font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Synthetic → Attention</span>
            </div>
            <div className="text-sm text-gray-300 bg-gray-600 p-3 rounded">
              Forward-testing robustness scores determine computational resource allocation priorities in attention market.
            </div>
            <div className="text-xs text-gray-400">
              {stats?.synthetic?.totalTests > 0 && stats?.attention?.activeBids > 0 ? 
                '✅ Resource optimization active' : '⏳ Optimization pending'
              }
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-yellow-400 font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Attention → Omega</span>
            </div>
            <div className="text-sm text-gray-300 bg-gray-600 p-3 rounded">
              Attention market winners determine which strategies receive priority for Omega adversarial testing.
            </div>
            <div className="text-xs text-gray-400">
              {stats?.attention?.activeBids > 0 && stats?.omega?.totalAttacks > 0 ? 
                '✅ Priority-driven testing' : '⏳ Awaiting market resolution'
              }
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-600 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-white font-medium">System Integration Status</span>
          </div>
          <div className="text-sm text-gray-300">
            All three Genius Pack modules are {
              stats?.omega?.totalAttacks > 0 && stats?.synthetic?.totalTests > 0 && stats?.attention?.activeBids > 0 
                ? 'actively exchanging data and optimizing system-wide performance'
                : 'initializing cross-module communication protocols'
            }.
          </div>
        </div>
      </div>
    </div>
  );
}