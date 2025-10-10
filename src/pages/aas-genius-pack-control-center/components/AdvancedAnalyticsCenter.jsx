import { useState, useEffect } from 'react';
import { Brain, BarChart3, TrendingUp, Activity, Target, Zap, PieChart, LineChart } from 'lucide-react';

export default function AdvancedAnalyticsCenter({ stats, onLogAdd }) {
  const [metaLearningData, setMetaLearningData] = useState({
    progression_score: 0,
    learning_velocity: 0,
    adaptation_index: 0,
    insight_generation: 0
  });
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [geniusInsights, setGeniusInsights] = useState([]);

  useEffect(() => {
    calculateMetaLearning();
    generateCorrelationMatrix();
    generateGeniusInsights();
  }, [stats]);

  const calculateMetaLearning = () => {
    const { omega, synthetic, attention } = stats;
    
    // Meta-learning progression tracking
    const progression_score = Math.min(100, Math.round(
      (omega?.totalAttacks * 1.5 + synthetic?.totalTests * 2 + attention?.activeBids * 1.2) / 10
    ));

    // Learning velocity (rate of improvement)
    const learning_velocity = Math.min(100, Math.round(
      ((100 - omega?.successRate) + synthetic?.avgRobustness + attention?.marketEfficiency) / 3
    ));

    // Adaptation index (system's ability to respond to new conditions)
    const adaptation_index = Math.min(100, Math.round(
      (omega?.totalAttacks > 0 ? 85 : 50) * 0.4 +
      (synthetic?.avgRobustness > 60 ? 90 : synthetic?.avgRobustness * 1.3) * 0.4 +
      (attention?.marketEfficiency > 70 ? 95 : attention?.marketEfficiency * 1.2) * 0.2
    ));

    // Insight generation capability
    const insight_generation = Math.min(100, Math.round(
      omega?.totalAttacks * 3 + synthetic?.totalTests * 2 + attention?.activeBids * 1.5
    ));

    setMetaLearningData({
      progression_score,
      learning_velocity,
      adaptation_index,
      insight_generation
    });
  };

  const generateCorrelationMatrix = () => {
    const { omega, synthetic, attention } = stats;
    
    // Calculate correlations between modules
    const correlations = [
      {
        name: 'Omega ↔ Synthetic',
        strength: Math.min(100, Math.round(
          (omega?.totalAttacks > 0 && synthetic?.totalTests > 0) 
            ? 85 - Math.abs(omega?.successRate - (100 - synthetic?.avgRobustness))
            : 25
        )),
        description: 'Adversarial testing informs robustness validation',
        positive: true
      },
      {
        name: 'Synthetic ↔ Attention', 
        strength: Math.min(100, Math.round(
          (synthetic?.totalTests > 0 && attention?.activeBids > 0)
            ? 75 + (synthetic?.avgRobustness * 0.2)
            : 30
        )),
        description: 'Forward-testing drives resource allocation priorities',
        positive: true
      },
      {
        name: 'Attention ↔ Omega',
        strength: Math.min(100, Math.round(
          (attention?.activeBids > 0 && omega?.totalAttacks > 0)
            ? 80 - (omega?.successRate * 0.3)
            : 40
        )),
        description: 'Resource allocation enables systematic adversarial testing',
        positive: true
      }
    ];

    setCorrelationMatrix(correlations);
  };

  const generateGeniusInsights = () => {
    const { omega, synthetic, attention } = stats;
    const insights = [];
    const timestamp = new Date()?.toLocaleTimeString();

    // Omega AI Insights
    if (omega?.totalAttacks > 5) {
      if (omega?.successRate > 40) {
        insights?.push({
          module: 'omega',
          type: 'critical',
          title: 'High Strategy Vulnerability Detected',
          description: `${omega?.successRate}% Omega success rate indicates systemic strategy weaknesses. Immediate defensive optimization required.`,
          recommendation: 'Deploy enhanced strategy hardening protocols and increase diversity in Alpha generation.',
          timestamp
        });
      } else if (omega?.successRate > 25) {
        insights?.push({
          module: 'omega',
          type: 'warning',
          title: 'Moderate Adversarial Exposure',
          description: `${omega?.successRate}% attack success suggests room for robustness improvement in current strategy portfolio.`,
          recommendation: 'Implement gradual strategy enhancement and increase Omega testing frequency.',
          timestamp
        });
      } else {
        insights?.push({
          module: 'omega',
          type: 'positive',
          title: 'Exceptional Strategy Resilience',
          description: `Only ${omega?.successRate}% Omega success rate demonstrates superior adversarial resistance.`,
          recommendation: 'Current defensive posture is effective. Consider expanding strategy deployment.',
          timestamp
        });
      }
    }

    // Synthetic Market Insights
    if (synthetic?.totalTests > 3) {
      if (synthetic?.avgRobustness > 80) {
        insights?.push({
          module: 'synthetic',
          type: 'positive',
          title: 'Superior Forward-Testing Performance',
          description: `${synthetic?.avgRobustness}% average robustness indicates exceptional future-scenario resilience.`,
          recommendation: 'Strategies demonstrate high confidence for production deployment.',
          timestamp
        });
      } else if (synthetic?.avgRobustness > 60) {
        insights?.push({
          module: 'synthetic',
          type: 'neutral',
          title: 'Moderate Future Scenario Performance',
          description: `${synthetic?.avgRobustness}% robustness suggests adequate but improvable forward-testing results.`,
          recommendation: 'Consider expanding simulation parameters and stress-testing edge cases.',
          timestamp
        });
      } else {
        insights?.push({
          module: 'synthetic',
          type: 'warning',
          title: 'Concerning Forward-Test Outcomes',
          description: `${synthetic?.avgRobustness}% average robustness indicates potential future performance risks.`,
          recommendation: 'Immediate strategy optimization and expanded scenario coverage required.',
          timestamp
        });
      }
    }

    // Attention Market Insights
    if (attention?.activeBids > 0) {
      if (attention?.marketEfficiency > 80) {
        insights?.push({
          module: 'attention',
          type: 'positive',
          title: 'Optimal Resource Allocation Achieved',
          description: `${attention?.marketEfficiency}% market efficiency demonstrates superior computational resource utilization.`,
          recommendation: 'Current attention market parameters are highly effective. Maintain configuration.',
          timestamp
        });
      } else if (attention?.marketEfficiency > 50) {
        insights?.push({
          module: 'attention',
          type: 'neutral', 
          title: 'Adequate Attention Market Performance',
          description: `${attention?.marketEfficiency}% efficiency suggests room for attention allocation optimization.`,
          recommendation: 'Analyze bidding patterns and adjust agent budget allocations for improved efficiency.',
          timestamp
        });
      } else {
        insights?.push({
          module: 'attention',
          type: 'critical',
          title: 'Attention Market Inefficiency Detected',
          description: `${attention?.marketEfficiency}% efficiency indicates significant resource allocation problems.`,
          recommendation: 'Immediate attention market recalibration and agent bidding strategy review required.',
          timestamp
        });
      }
    }

    // Cross-Module Integration Insights
    const avgCorrelation = correlationMatrix?.reduce((sum, corr) => sum + corr?.strength, 0) / correlationMatrix?.length;
    if (avgCorrelation > 75) {
      insights?.push({
        module: 'integration',
        type: 'positive',
        title: 'Exceptional Cross-Module Synergy',
        description: `${Math.round(avgCorrelation)}% average correlation indicates optimal inter-module data flow and coordination.`,
        recommendation: 'Genius Pack integration is performing at peak efficiency. Consider expanding deployment scope.',
        timestamp
      });
    }

    setGeniusInsights(insights?.slice(0, 8)); // Limit to most recent 8 insights
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'critical': return 'border-red-500/50 bg-red-900/20 text-red-300';
      case 'warning': return 'border-yellow-500/50 bg-yellow-900/20 text-yellow-300';
      case 'positive': return 'border-green-500/50 bg-green-900/20 text-green-300';
      case 'neutral': return 'border-blue-500/50 bg-blue-900/20 text-blue-300';
      case 'integration': return 'border-purple-500/50 bg-purple-900/20 text-purple-300';
      default: return 'border-gray-500/50 bg-gray-900/20 text-gray-300';
    }
  };

  const getInsightIcon = (module) => {
    switch (module) {
      case 'omega': return Target;
      case 'synthetic': return TrendingUp;
      case 'attention': return Zap;
      case 'integration': return Brain;
      default: return Activity;
    }
  };

  const getCorrelationStrengthColor = (strength) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    if (strength >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-8 h-8 text-green-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics Center</h2>
          <p className="text-gray-400">Meta-Learning Progression & Genius-Level Insights</p>
        </div>
      </div>
      {/* Meta-Learning Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 p-4 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">Progression Score</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{metaLearningData?.progression_score}</div>
          <div className="w-full bg-gray-600 h-2 rounded mt-2">
            <div 
              className="h-2 bg-green-400 rounded transition-all duration-500"
              style={{ width: `${Math.min(100, metaLearningData?.progression_score)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm">Learning Velocity</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{metaLearningData?.learning_velocity}</div>
          <div className="w-full bg-gray-600 h-2 rounded mt-2">
            <div 
              className="h-2 bg-blue-400 rounded transition-all duration-500"
              style={{ width: `${Math.min(100, metaLearningData?.learning_velocity)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-purple-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-gray-300 text-sm">Adaptation Index</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{metaLearningData?.adaptation_index}</div>
          <div className="w-full bg-gray-600 h-2 rounded mt-2">
            <div 
              className="h-2 bg-purple-400 rounded transition-all duration-500"
              style={{ width: `${Math.min(100, metaLearningData?.adaptation_index)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg border border-gold-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300 text-sm">Insight Generation</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{metaLearningData?.insight_generation}</div>
          <div className="w-full bg-gray-600 h-2 rounded mt-2">
            <div 
              className="h-2 bg-yellow-400 rounded transition-all duration-500"
              style={{ width: `${Math.min(100, metaLearningData?.insight_generation)}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Correlation Matrix */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            <span>Cross-Module Performance Correlation</span>
          </h3>
          
          <div className="space-y-4">
            {correlationMatrix?.map((correlation, index) => (
              <div key={index} className="bg-gray-600 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{correlation?.name}</span>
                  <span className={`text-lg font-bold ${getCorrelationStrengthColor(correlation?.strength)}`}>
                    {correlation?.strength}%
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-2">
                  {correlation?.description}
                </div>
                <div className="w-full bg-gray-500 h-2 rounded">
                  <div 
                    className={`h-2 rounded transition-all duration-500 ${
                      correlation?.strength >= 80 ? 'bg-green-400' :
                      correlation?.strength >= 60 ? 'bg-yellow-400' :
                      correlation?.strength >= 40 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(100, correlation?.strength)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Performance Analytics */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-green-400" />
            <span>System-Wide Performance Analytics</span>
          </h3>
          
          <div className="space-y-4">
            <div className="bg-gray-600 p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Collective Intelligence Score</span>
                <span className="text-2xl font-bold text-green-400">
                  {Math.round((metaLearningData?.progression_score + metaLearningData?.learning_velocity + metaLearningData?.adaptation_index) / 3)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                Multi-dimensional system intelligence assessment
              </div>
              <div className="w-full bg-gray-500 h-3 rounded">
                <div 
                  className="h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded transition-all duration-500"
                  style={{ width: `${Math.round((metaLearningData?.progression_score + metaLearningData?.learning_velocity + metaLearningData?.adaptation_index) / 3)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-600 p-3 rounded text-center">
                <div className="text-lg font-bold text-white">
                  {stats?.omega?.totalAttacks + stats?.synthetic?.totalTests + stats?.attention?.activeBids}
                </div>
                <div className="text-xs text-gray-400">Total Operations</div>
              </div>
              <div className="bg-gray-600 p-3 rounded text-center">
                <div className="text-lg font-bold text-white">
                  {Math.round(correlationMatrix?.reduce((sum, corr) => sum + corr?.strength, 0) / correlationMatrix?.length)}%
                </div>
                <div className="text-xs text-gray-400">Integration Efficiency</div>
              </div>
            </div>

            <div className="bg-gray-600 p-3 rounded">
              <div className="text-sm text-gray-300 mb-2">System Maturity Index</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-500 h-2 rounded">
                  <div 
                    className="h-2 bg-purple-400 rounded transition-all duration-500"
                    style={{ width: `${Math.min(100, metaLearningData?.insight_generation)}%` }}
                  ></div>
                </div>
                <span className="text-white font-bold text-sm">{metaLearningData?.insight_generation}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Genius-Level Insights */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>Genius-Level Insights Generation</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {geniusInsights?.length > 0 ? (
            geniusInsights?.map((insight, index) => {
              const InsightIcon = getInsightIcon(insight?.module);
              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${getInsightColor(insight?.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <InsightIcon className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight?.title}</h4>
                        <span className="text-xs opacity-70">{insight?.timestamp}</span>
                      </div>
                      <p className="text-sm mb-3 opacity-90">
                        {insight?.description}
                      </p>
                      <div className="text-xs font-medium opacity-80 bg-black/20 p-2 rounded">
                        💡 {insight?.recommendation}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-gray-400 text-center py-8 bg-gray-700 rounded-lg">
              Genius insights will appear as the system accumulates operational data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}