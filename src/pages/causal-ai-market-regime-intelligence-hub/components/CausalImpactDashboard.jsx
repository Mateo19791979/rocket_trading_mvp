import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, BarChart3, Activity, CheckCircle, Eye } from 'lucide-react';

export default function CausalImpactDashboard({ causalMetrics, regimeStatus, onUpdate }) {
  const [impactAnalysis, setImpactAnalysis] = useState({
    treatmentEffects: {
      syntheticControlMethod: {
        estimatedEffects: 47,
        controlUnits: 234,
        treatmentPeriods: 89,
        statisticalSignificance: 0.95
      },
      causalMediation: {
        directEffects: 12,
        indirectEffects: 8,
        mediationRatio: 0.67,
        pathAnalysis: 'COMPLETE'
      },
      instrumentalVariable: {
        instruments: 6,
        endogeneityTests: 15,
        identificationStrength: 0.89,
        robustnessChecks: 'PASSED'
      }
    }
  });

  const [interactiveCharts, setInteractiveCharts] = useState([
    {
      type: 'SYNTHETIC_CONTROL',
      title: 'Synthetic Control Analysis',
      dataPoints: 156,
      confidence: 95.2,
      significance: 'HIGH',
      lastUpdate: new Date()
    },
    {
      type: 'CAUSAL_MEDIATION',
      title: 'Causal Mediation Pathways',
      dataPoints: 89,
      confidence: 92.7,
      significance: 'MEDIUM',
      lastUpdate: new Date()
    },
    {
      type: 'INSTRUMENTAL_VARIABLE',
      title: 'Instrumental Variable Results',
      dataPoints: 203,
      confidence: 88.4,
      significance: 'HIGH',
      lastUpdate: new Date()
    }
  ]);

  const [causalInsights, setCausalInsights] = useState([
    {
      id: 'INS-001',
      type: 'TREATMENT_EFFECT',
      insight: 'Interest rate changes show 23% causal impact on trading volume',
      confidence: 94.2,
      evidenceStrength: 'STRONG',
      actionable: true,
      regimeSpecific: 'BULL_MARKET_LOW_VOLATILITY'
    },
    {
      id: 'INS-002',
      type: 'MEDIATION_EFFECT',
      insight: 'Market sentiment mediates 67% of news impact on prices',
      confidence: 89.7,
      evidenceStrength: 'MODERATE',
      actionable: true,
      regimeSpecific: 'ALL_REGIMES'
    },
    {
      id: 'INS-003',
      type: 'INSTRUMENTAL_VARIABLE',
      insight: 'Central bank communications serve as valid instrument for rate expectations',
      confidence: 91.3,
      evidenceStrength: 'STRONG',
      actionable: false,
      regimeSpecific: 'BEAR_MARKET'
    }
  ]);

  const [shapValues, setShapValues] = useState([
    {
      feature: 'Market Volatility',
      shapValue: 0.34,
      contribution: 'POSITIVE',
      importance: 'HIGH',
      regime: 'CURRENT'
    },
    {
      feature: 'Interest Rate Changes',
      shapValue: -0.21,
      contribution: 'NEGATIVE',
      importance: 'MEDIUM',
      regime: 'CURRENT'
    },
    {
      feature: 'Economic Indicators',
      shapValue: 0.18,
      contribution: 'POSITIVE',
      importance: 'MEDIUM',
      regime: 'CURRENT'
    },
    {
      feature: 'Trading Volume',
      shapValue: 0.15,
      contribution: 'POSITIVE',
      importance: 'LOW',
      regime: 'CURRENT'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update impact analysis
      setImpactAnalysis(prev => ({
        ...prev,
        treatmentEffects: {
          ...prev?.treatmentEffects,
          syntheticControlMethod: {
            ...prev?.treatmentEffects?.syntheticControlMethod,
            estimatedEffects: Math.max(40, prev?.treatmentEffects?.syntheticControlMethod?.estimatedEffects + Math.floor(Math.random() * 6 - 3)),
            statisticalSignificance: Math.max(0.9, Math.min(0.99, prev?.treatmentEffects?.syntheticControlMethod?.statisticalSignificance + (Math.random() * 0.04 - 0.02)))
          },
          causalMediation: {
            ...prev?.treatmentEffects?.causalMediation,
            mediationRatio: Math.max(0.6, Math.min(0.8, prev?.treatmentEffects?.causalMediation?.mediationRatio + (Math.random() * 0.04 - 0.02)))
          },
          instrumentalVariable: {
            ...prev?.treatmentEffects?.instrumentalVariable,
            identificationStrength: Math.max(0.85, Math.min(0.95, prev?.treatmentEffects?.instrumentalVariable?.identificationStrength + (Math.random() * 0.04 - 0.02)))
          }
        }
      }));

      // Update interactive charts
      setInteractiveCharts(prev => 
        prev?.map(chart => ({
          ...chart,
          dataPoints: chart?.dataPoints + Math.floor(Math.random() * 10),
          confidence: Math.max(85, Math.min(98, chart?.confidence + (Math.random() * 2 - 1))),
          lastUpdate: new Date()
        }))
      );

      // Update SHAP values
      setShapValues(prev =>
        prev?.map(shap => ({
          ...shap,
          shapValue: Math.max(-0.5, Math.min(0.5, shap?.shapValue + (Math.random() * 0.1 - 0.05)))
        }))
      );

      // Trigger parent update
      if (onUpdate && Math.random() > 0.7) {
        onUpdate();
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [onUpdate]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 95) return 'text-green-400';
    if (confidence >= 90) return 'text-teal-400';
    if (confidence >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSignificanceColor = (significance) => {
    const colors = {
      'HIGH': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'LOW': 'text-red-400'
    };
    return colors?.[significance] || 'text-gray-400';
  };

  const getEvidenceStrengthColor = (strength) => {
    const colors = {
      'STRONG': 'text-green-400',
      'MODERATE': 'text-yellow-400',
      'WEAK': 'text-red-400'
    };
    return colors?.[strength] || 'text-gray-400';
  };

  const getContributionColor = (contribution) => {
    return contribution === 'POSITIVE' ? 'text-green-400' : 'text-red-400';
  };

  const getImportanceColor = (importance) => {
    const colors = {
      'HIGH': 'text-red-400',
      'MEDIUM': 'text-yellow-400',
      'LOW': 'text-green-400'
    };
    return colors?.[importance] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Causal Impact Dashboard */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-orange-800/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 border-b border-orange-800/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600/20 rounded-lg">
              <Target className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Causal Impact Dashboard</h3>
              <p className="text-sm text-gray-400">Treatment effect estimation using synthetic control methods</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Synthetic Control Method */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-orange-400" />
                Synthetic Control Methods
              </h4>
              <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded">
                {(impactAnalysis?.treatmentEffects?.syntheticControlMethod?.statisticalSignificance * 100)?.toFixed(1)}% Significance
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Estimated Effects</p>
                <p className="text-lg font-semibold text-orange-400">
                  {impactAnalysis?.treatmentEffects?.syntheticControlMethod?.estimatedEffects}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Control Units</p>
                <p className="text-lg font-semibold text-blue-400">
                  {impactAnalysis?.treatmentEffects?.syntheticControlMethod?.controlUnits}
                </p>
              </div>
            </div>
          </div>

          {/* Causal Mediation Analysis */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Activity className="h-4 w-4 mr-2 text-purple-400" />
                Causal Mediation Analysis
              </h4>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                {impactAnalysis?.treatmentEffects?.causalMediation?.pathAnalysis}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-400">Direct Effects</p>
                <p className="text-lg font-semibold text-purple-400">
                  {impactAnalysis?.treatmentEffects?.causalMediation?.directEffects}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Indirect Effects</p>
                <p className="text-lg font-semibold text-teal-400">
                  {impactAnalysis?.treatmentEffects?.causalMediation?.indirectEffects}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Mediation Ratio</span>
              <span className="text-green-400 font-semibold">
                {(impactAnalysis?.treatmentEffects?.causalMediation?.mediationRatio * 100)?.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Instrumental Variable Analysis */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-teal-400" />
                Instrumental Variable Analysis
              </h4>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs text-teal-400">{impactAnalysis?.treatmentEffects?.instrumentalVariable?.robustnessChecks}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Instruments</p>
                <p className="text-lg font-semibold text-teal-400">
                  {impactAnalysis?.treatmentEffects?.instrumentalVariable?.instruments}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">ID Strength</p>
                <p className="text-lg font-semibold text-green-400">
                  {(impactAnalysis?.treatmentEffects?.instrumentalVariable?.identificationStrength * 100)?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Interactive Statistical Charts */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Interactive Statistical Charts</h3>
              <p className="text-sm text-gray-400">Advanced statistical visualization for causal inference</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {interactiveCharts?.map((chart, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{chart?.title}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getSignificanceColor(chart?.significance)} bg-gray-700/50`}>
                    {chart?.significance}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Data Points</p>
                  <p className="text-blue-400 font-semibold">{chart?.dataPoints}</p>
                </div>
                <div>
                  <p className="text-gray-400">Confidence</p>
                  <p className={`font-semibold ${getConfidenceColor(chart?.confidence)}`}>
                    {chart?.confidence?.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Updated</p>
                  <p className="text-gray-300 font-semibold">{chart?.lastUpdate?.toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      {/* Causal Insights & SHAP Values */}
      <motion.div
        className="bg-gray-900/50 rounded-lg border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Eye className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Explainable AI-Driven Trading Decisions</h3>
              <p className="text-sm text-gray-400">SHAP values and causal insights for decision transparency</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Causal Insights */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Key Causal Insights</h4>
            <div className="space-y-2">
              {causalInsights?.map((insight) => (
                <div key={insight?.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-gray-400">{insight?.id}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getEvidenceStrengthColor(insight?.evidenceStrength)} bg-gray-700/50`}>
                          {insight?.evidenceStrength}
                        </span>
                        {insight?.actionable && <CheckCircle className="h-3 w-3 text-green-400" />}
                      </div>
                      <p className="text-sm text-gray-300 mb-1">{insight?.insight}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Type: {insight?.type?.replace(/_/g, ' ')}</span>
                        <span>Regime: {insight?.regimeSpecific?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${getConfidenceColor(insight?.confidence)}`}>
                      {insight?.confidence?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHAP Values */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">SHAP Feature Importance</h4>
            <div className="space-y-2">
              {shapValues?.map((shap, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">{shap?.feature}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${getImportanceColor(shap?.importance)} bg-gray-700/50`}>
                        {shap?.importance}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">SHAP Value:</span>
                      <span className={`font-semibold ${getContributionColor(shap?.contribution)}`}>
                        {shap?.shapValue > 0 ? '+' : ''}{shap?.shapValue?.toFixed(3)}
                      </span>
                    </div>
                    <span className={`${getContributionColor(shap?.contribution)} font-semibold`}>
                      {shap?.contribution}
                    </span>
                  </div>
                  
                  {/* SHAP Value Bar */}
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full ${shap?.contribution === 'POSITIVE' ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.abs(shap?.shapValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}