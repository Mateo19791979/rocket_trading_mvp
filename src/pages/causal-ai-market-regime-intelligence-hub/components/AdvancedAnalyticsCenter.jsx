import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart3, TrendingUp, Activity, CheckCircle, AlertTriangle, Brain } from 'lucide-react';

export default function AdvancedAnalyticsCenter({ systemPerformance, causalMetrics, onSystemUpdate }) {
  const [analyticsData, setAnalyticsData] = useState({
    structuralEquationModeling: {
      modelComplexity: 234,
      pathCoefficients: 67,
      modelFitIndex: 0.94,
      convergenceStatus: 'CONVERGED'
    },
    grangerCausality: {
      testedRelationships: 89,
      significantCausalities: 42,
      temporalLags: 12,
      robustnessScore: 91.7
    },
    causalMachineLearning: {
      activeModels: 8,
      shap_integrations: 15,
      explainabilityScore: 96.3,
      predictionAccuracy: 93.8
    }
  });

  const [marketRelationships, setMarketRelationships] = useState([
    {
      relationship: 'Interest Rates → Bond Prices',
      strength: -0.87,
      significance: 0.001,
      lag: '1 day',
      stability: 'HIGH',
      model: 'Granger'
    },
    {
      relationship: 'VIX → Equity Returns',
      strength: -0.73,
      significance: 0.003,
      lag: '2 hours',
      stability: 'MEDIUM',
      model: 'SEM'
    },
    {
      relationship: 'GDP Growth → Currency Strength',
      strength: 0.65,
      significance: 0.012,
      lag: '1 week',
      stability: 'HIGH',
      model: 'Granger'
    },
    {
      relationship: 'Oil Prices → Inflation Expectations',
      strength: 0.58,
      significance: 0.025,
      lag: '3 days',
      stability: 'MEDIUM',
      model: 'Causal ML'
    }
  ]);

  const [systemComponents, setSystemComponents] = useState([
    {
      component: 'Structural Equation Models',
      status: 'PROCESSING',
      performance: 94.2,
      loadFactor: 67.3,
      lastUpdate: 'Active'
    },
    {
      component: 'Granger Causality Tests',
      status: 'OPERATIONAL',
      performance: 91.8,
      loadFactor: 45.7,
      lastUpdate: '2 min ago'
    },
    {
      component: 'Causal ML Integration',
      status: 'ACTIVE',
      performance: 96.1,
      loadFactor: 82.4,
      lastUpdate: 'Running'
    },
    {
      component: 'SHAP Explainability',
      status: 'OPTIMAL',
      performance: 97.5,
      loadFactor: 38.9,
      lastUpdate: 'Active'
    }
  ]);

  const [temporalDependencies, setTemporalDependencies] = useState([
    {
      dependency: 'Market Open → Volatility Spike',
      timeframe: '9:30-10:00 AM',
      strength: 0.82,
      frequency: 'Daily',
      pattern: 'CONSISTENT'
    },
    {
      dependency: 'Fed Announcements → Rate Volatility',
      timeframe: '2:00-2:30 PM',
      strength: 0.91,
      frequency: 'Monthly',
      pattern: 'PREDICTABLE'
    },
    {
      dependency: 'Quarter End → Rebalancing Flow',
      timeframe: 'Last 3 days',
      strength: 0.74,
      frequency: 'Quarterly',
      pattern: 'SEASONAL'
    },
    {
      dependency: 'Weekend → Monday Effect',
      timeframe: 'Monday 9:30 AM',
      strength: 0.45,
      frequency: 'Weekly',
      pattern: 'WEAK'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update analytics data
      setAnalyticsData(prev => ({
        ...prev,
        structuralEquationModeling: {
          ...prev?.structuralEquationModeling,
          modelComplexity: Math.max(200, prev?.structuralEquationModeling?.modelComplexity + Math.floor(Math.random() * 10 - 5)),
          pathCoefficients: Math.max(60, prev?.structuralEquationModeling?.pathCoefficients + Math.floor(Math.random() * 4 - 2)),
          modelFitIndex: Math.max(0.9, Math.min(0.98, prev?.structuralEquationModeling?.modelFitIndex + (Math.random() * 0.02 - 0.01)))
        },
        grangerCausality: {
          ...prev?.grangerCausality,
          testedRelationships: prev?.grangerCausality?.testedRelationships + Math.floor(Math.random() * 5),
          significantCausalities: Math.max(35, prev?.grangerCausality?.significantCausalities + Math.floor(Math.random() * 3 - 1)),
          robustnessScore: Math.max(88, Math.min(95, prev?.grangerCausality?.robustnessScore + (Math.random() * 2 - 1)))
        },
        causalMachineLearning: {
          ...prev?.causalMachineLearning,
          shap_integrations: prev?.causalMachineLearning?.shap_integrations + Math.floor(Math.random() * 3),
          explainabilityScore: Math.max(94, Math.min(98, prev?.causalMachineLearning?.explainabilityScore + (Math.random() * 1 - 0.5))),
          predictionAccuracy: Math.max(90, Math.min(97, prev?.causalMachineLearning?.predictionAccuracy + (Math.random() * 2 - 1)))
        }
      }));

      // Update system components performance
      setSystemComponents(prev =>
        prev?.map(component => ({
          ...component,
          performance: Math.max(85, Math.min(99, component?.performance + (Math.random() * 2 - 1))),
          loadFactor: Math.max(30, Math.min(90, component?.loadFactor + (Math.random() * 10 - 5)))
        }))
      );

      // Update system performance
      if (onSystemUpdate && Math.random() > 0.7) {
        onSystemUpdate(prev => ({
          ...prev,
          dataIntegrity: Math.max(99, Math.min(100, prev?.dataIntegrity + (Math.random() * 0.2 - 0.1))),
          lastUpdate: new Date()
        }));
      }
    }, 11000);

    return () => clearInterval(interval);
  }, [onSystemUpdate]);

  const getStatusColor = (status) => {
    const colors = {
      'PROCESSING': 'text-blue-400',
      'OPERATIONAL': 'text-green-400',
      'ACTIVE': 'text-green-400',
      'OPTIMAL': 'text-teal-400',
      'STANDBY': 'text-yellow-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PROCESSING': <Activity className="h-4 w-4 text-blue-400 animate-pulse" />,
      'OPERATIONAL': <CheckCircle className="h-4 w-4 text-green-400" />,
      'ACTIVE': <CheckCircle className="h-4 w-4 text-green-400" />,
      'OPTIMAL': <CheckCircle className="h-4 w-4 text-teal-400" />
    };
    return icons?.[status] || <AlertTriangle className="h-4 w-4 text-yellow-400" />;
  };

  const getSignificanceColor = (significance) => {
    if (significance < 0.01) return 'text-green-400';
    if (significance < 0.05) return 'text-teal-400';
    if (significance < 0.1) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStrengthColor = (strength) => {
    const absStrength = Math.abs(strength);
    if (absStrength >= 0.8) return 'text-red-400';
    if (absStrength >= 0.6) return 'text-orange-400';
    if (absStrength >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStabilityColor = (stability) => {
    const colors = {
      'HIGH': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'LOW': 'text-red-400'
    };
    return colors?.[stability] || 'text-gray-400';
  };

  const getPatternColor = (pattern) => {
    const colors = {
      'CONSISTENT': 'text-green-400',
      'PREDICTABLE': 'text-teal-400',
      'SEASONAL': 'text-blue-400',
      'WEAK': 'text-yellow-400'
    };
    return colors?.[pattern] || 'text-gray-400';
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 95) return 'text-green-400';
    if (performance >= 90) return 'text-teal-400';
    if (performance >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      className="bg-gray-900/50 rounded-lg border border-green-800/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 border-b border-green-800/30">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Database className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Advanced Analytics Center</h3>
            <p className="text-sm text-gray-400">Structural equation modeling and causal machine learning integration</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Structural Equation Modeling */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-green-400" />
              Structural Equation Modeling
            </h4>
            <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded">
              {analyticsData?.structuralEquationModeling?.convergenceStatus}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Model Complexity</p>
              <p className="text-lg font-semibold text-green-400">
                {analyticsData?.structuralEquationModeling?.modelComplexity}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Path Coefficients</p>
              <p className="text-lg font-semibold text-teal-400">
                {analyticsData?.structuralEquationModeling?.pathCoefficients}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-400">Model Fit Index</span>
            <span className="text-blue-400 font-semibold">
              {analyticsData?.structuralEquationModeling?.modelFitIndex?.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Granger Causality Testing */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-400" />
              Granger Causality Testing
            </h4>
            <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
              {analyticsData?.grangerCausality?.robustnessScore?.toFixed(1)}% Robust
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Tested Relationships</p>
              <p className="text-lg font-semibold text-orange-400">
                {analyticsData?.grangerCausality?.testedRelationships}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Significant Causalities</p>
              <p className="text-lg font-semibold text-green-400">
                {analyticsData?.grangerCausality?.significantCausalities}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-400">Temporal Lags</span>
            <span className="text-purple-400 font-semibold">
              {analyticsData?.grangerCausality?.temporalLags}
            </span>
          </div>
        </div>

        {/* Causal Machine Learning Integration */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <Brain className="h-4 w-4 mr-2 text-purple-400" />
              Causal Machine Learning Integration
            </h4>
            <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
              {analyticsData?.causalMachineLearning?.activeModels} Active Models
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">SHAP Integrations</p>
              <p className="text-lg font-semibold text-purple-400">
                {analyticsData?.causalMachineLearning?.shap_integrations}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Prediction Accuracy</p>
              <p className="text-lg font-semibold text-green-400">
                {analyticsData?.causalMachineLearning?.predictionAccuracy?.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-400">Explainability Score</span>
            <span className="text-teal-400 font-semibold">
              {analyticsData?.causalMachineLearning?.explainabilityScore?.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Complex Market Relationships */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Complex Market Relationships</h4>
          {marketRelationships?.map((relationship, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{relationship?.relationship}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                    {relationship?.model}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStabilityColor(relationship?.stability)} bg-gray-700/50`}>
                    {relationship?.stability}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Strength</p>
                  <p className={`font-semibold ${getStrengthColor(relationship?.strength)}`}>
                    {relationship?.strength?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Significance</p>
                  <p className={`font-semibold ${getSignificanceColor(relationship?.significance)}`}>
                    {relationship?.significance?.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Lag</p>
                  <p className="text-blue-400 font-semibold">{relationship?.lag}</p>
                </div>
                <div>
                  <p className="text-gray-400">Stability</p>
                  <p className={`font-semibold ${getStabilityColor(relationship?.stability)}`}>
                    {relationship?.stability}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Components Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">System Components Performance</h4>
          {systemComponents?.map((component, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(component?.status)}
                  <span className="text-sm font-medium text-gray-300">{component?.component}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(component?.status)} bg-gray-700/50`}>
                  {component?.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Performance</p>
                  <p className={`font-semibold ${getPerformanceColor(component?.performance)}`}>
                    {component?.performance?.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Load Factor</p>
                  <p className="text-orange-400 font-semibold">{component?.loadFactor?.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Last Update</p>
                  <p className="text-gray-300 font-semibold">{component?.lastUpdate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Temporal Dependencies */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Temporal Dependencies</h4>
          {temporalDependencies?.map((dependency, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{dependency?.dependency}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getPatternColor(dependency?.pattern)} bg-gray-700/50`}>
                    {dependency?.pattern}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Timeframe</p>
                  <p className="text-blue-400 font-semibold">{dependency?.timeframe}</p>
                </div>
                <div>
                  <p className="text-gray-400">Strength</p>
                  <p className={`font-semibold ${getStrengthColor(dependency?.strength)}`}>
                    {dependency?.strength?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Frequency</p>
                  <p className="text-teal-400 font-semibold">{dependency?.frequency}</p>
                </div>
                <div>
                  <p className="text-gray-400">Pattern</p>
                  <p className={`font-semibold ${getPatternColor(dependency?.pattern)}`}>
                    {dependency?.pattern}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}