import React, { useState } from 'react';
import { Brain, Lightbulb, Target, Zap, Eye, BarChart3 } from 'lucide-react';

export default function IntelligenceAmplificationDashboard({ intelligenceData, iqScores, decisionLogs, aiAgents }) {
  const [selectedView, setSelectedView] = useState('amplification');

  const views = [
    { id: 'amplification', name: 'Intelligence', icon: Brain },
    { id: 'speculative', name: 'Speculative', icon: Target },
    { id: 'insights', name: 'Insights', icon: Eye }
  ];

  const calculateIntelligenceMetrics = () => {
    const cognitiveCapability = intelligenceData?.reasoning_depth?.length > 0
      ? Math.round(intelligenceData?.reasoning_depth?.reduce((sum, item) => sum + item?.value, 0) / intelligenceData?.reasoning_depth?.length)
      : 0;

    const creativityIndex = intelligenceData?.creative_solutions?.length > 0
      ? Math.round(intelligenceData?.creative_solutions?.reduce((sum, item) => sum + item?.value, 0) / intelligenceData?.creative_solutions?.length)
      : 0;

    const predictiveAccuracy = intelligenceData?.predictive_insights?.length > 0
      ? Math.round(intelligenceData?.predictive_insights?.reduce((sum, item) => sum + item?.value, 0) / intelligenceData?.predictive_insights?.length)
      : 0;

    const hypothesisRate = intelligenceData?.hypothesis_generation?.length;

    return {
      cognitiveCapability,
      creativityIndex,
      predictiveAccuracy,
      hypothesisRate
    };
  };

  const metrics = calculateIntelligenceMetrics();

  const renderAmplificationView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-blue-400" />
        Intelligence Amplification Dashboard
      </h3>

      {/* Cognitive Capability Expansion */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Cognitive Expansion</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.cognitiveCapability}%</div>
          <div className="mt-2 bg-gray-600 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              style={{ width: `${metrics?.cognitiveCapability}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Creativity Index</span>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.creativityIndex}%</div>
          <div className="mt-2 bg-gray-600 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
              style={{ width: `${metrics?.creativityIndex}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reasoning Depth Analysis */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Reasoning Depth Evolution</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            {intelligenceData?.reasoning_depth?.slice(0, 5)?.map((reasoning, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-xs text-blue-400">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">
                      Reasoning Depth: Level {Math.floor(reasoning?.value / 20) + 1}
                    </span>
                    <span className="text-sm text-white">{reasoning?.value}%</span>
                  </div>
                  <div className="bg-gray-600 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${reasoning?.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Creative Problem-Solving Metrics */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Creative Problem-Solving</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">
                {intelligenceData?.creative_solutions?.length}
              </div>
              <div className="text-xs text-gray-400">Novel Solutions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">
                {metrics?.hypothesisRate}
              </div>
              <div className="text-xs text-gray-400">Hypotheses Generated</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">
                {Math.round(metrics?.creativityIndex * 0.85)}%
              </div>
              <div className="text-xs text-gray-400">Innovation Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpeculativeView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-400" />
        Speculative Reasoning Monitor
      </h3>

      {/* Market Intuition Development */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Market Intuition Development</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Pattern Recognition</div>
              <div className="text-lg font-bold text-green-400">87%</div>
              <div className="bg-gray-600 rounded-full h-2 mt-1">
                <div className="h-full bg-green-400 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Market Sentiment</div>
              <div className="text-lg font-bold text-blue-400">73%</div>
              <div className="bg-gray-600 rounded-full h-2 mt-1">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '73%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hypothesis Generation */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Hypothesis Generation</h4>
        <div className="space-y-3">
          {intelligenceData?.hypothesis_generation?.slice(0, 4)?.map((hypothesis, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Market Hypothesis #{index + 1}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(hypothesis.timestamp)?.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-400">
                    {hypothesis?.value}%
                  </div>
                  <div className="text-xs text-gray-400">Confidence</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Insight Formation */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Predictive Insight Formation</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Forecast Accuracy</span>
              <span className="text-sm text-green-400">{metrics?.predictiveAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Time Horizon Adaptation</span>
              <span className="text-sm text-blue-400">Dynamic</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Confidence Intervals</span>
              <span className="text-sm text-purple-400">±3.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsightsView = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-purple-400" />
        Predictive Insights & Validation
      </h3>

      {/* Insight Performance Tracking */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{metrics?.predictiveAccuracy}%</div>
            <div className="text-sm text-gray-400">Prediction Accuracy</div>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{intelligenceData?.predictive_insights?.length}</div>
            <div className="text-sm text-gray-400">Active Insights</div>
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Recent Predictive Insights</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {intelligenceData?.predictive_insights?.slice(0, 6)?.map((insight, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Insight #{index + 1}
                    </div>
                    <div className="text-xs text-gray-400">
                      Predictive Model Output
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-400">
                    {insight?.value}%
                  </div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Tracking */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Validation Tracking</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="text-lg font-bold text-green-400">
                {Math.floor(intelligenceData?.predictive_insights?.length * 0.7)}
              </div>
              <div className="text-xs text-gray-400">Validated</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">
                {Math.floor(intelligenceData?.predictive_insights?.length * 0.2)}
              </div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                {Math.floor(intelligenceData?.predictive_insights?.length * 0.1)}
              </div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-purple-500/30">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Intelligence Amplification</h2>
        <p className="text-gray-400 text-sm">Evolution from Analytical to Innovative Thinking</p>
      </div>
      {/* View Navigation */}
      <div className="flex border-b border-gray-700">
        {views?.map((view) => {
          const IconComponent = view?.icon;
          return (
            <button
              key={view?.id}
              onClick={() => setSelectedView(view?.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedView === view?.id
                  ? 'text-purple-400 border-b-2 border-purple-400' :'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconComponent className="w-4 h-4" />
                {view?.name}
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-6">
        {selectedView === 'amplification' && renderAmplificationView()}
        {selectedView === 'speculative' && renderSpeculativeView()}
        {selectedView === 'insights' && renderInsightsView()}
      </div>
    </div>
  );
}