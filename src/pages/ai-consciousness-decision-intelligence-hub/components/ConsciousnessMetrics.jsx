import React, { useState } from 'react';
import { Eye, Brain, Activity, Target, TrendingUp, Zap } from 'lucide-react';

export default function ConsciousnessMetrics({ consciousnessData, aiAgents, decisionLogs }) {
  const [selectedMetric, setSelectedMetric] = useState('awareness');

  const metrics = [
    { id: 'awareness', name: 'Awareness', icon: Eye, color: 'blue' },
    { id: 'confidence', name: 'Confidence', icon: Target, color: 'green' },
    { id: 'cognitive', name: 'Cognitive Load', icon: Brain, color: 'purple' },
    { id: 'neural', name: 'Neural Activity', icon: Zap, color: 'yellow' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      green: 'text-green-400 bg-green-500/20 border-green-500/30',
      purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      yellow: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    };
    return colors?.[color] || colors?.blue;
  };

  const getCurrentData = () => {
    switch (selectedMetric) {
      case 'awareness':
        return consciousnessData?.awareness_levels;
      case 'confidence':
        return consciousnessData?.decision_confidence;
      case 'cognitive':
        return consciousnessData?.cognitive_load;
      case 'neural':
        return consciousnessData?.neural_activity;
      default:
        return [];
    }
  };

  const getAverageValue = (data) => {
    if (!data || data?.length === 0) return 0;
    return Math.round(data?.reduce((sum, item) => sum + item?.value, 0) / data?.length);
  };

  const currentData = getCurrentData();
  const averageValue = getAverageValue(currentData);

  return (
    <div className="bg-gray-800 rounded-lg border border-blue-500/30">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-2">Consciousness Metrics</h2>
        <p className="text-gray-400 text-sm">AI Awareness, Self-Reflection & Cognitive Monitoring</p>
      </div>
      <div className="p-6">
        {/* Metric Selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {metrics?.map((metric) => {
            const IconComponent = metric?.icon;
            const isSelected = selectedMetric === metric?.id;
            
            return (
              <button
                key={metric?.id}
                onClick={() => setSelectedMetric(metric?.id)}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  isSelected 
                    ? getColorClasses(metric?.color)
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm font-medium">{metric?.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Metric Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {metrics?.find(m => m?.id === selectedMetric)?.name} Level
            </h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{averageValue}%</div>
              <div className="text-xs text-gray-400">Average</div>
            </div>
          </div>

          {/* Visual Indicator */}
          <div className="mb-4">
            <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  selectedMetric === 'awareness' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                  selectedMetric === 'confidence' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  selectedMetric === 'cognitive'? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                }`}
                style={{ width: `${Math.max(averageValue, 5)}%` }}
              />
            </div>
          </div>

          {/* Real-time Data Points */}
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {currentData?.slice(0, 5)?.map((point, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedMetric === 'awareness' ? 'bg-blue-400' :
                    selectedMetric === 'confidence' ? 'bg-green-400' :
                    selectedMetric === 'cognitive'? 'bg-purple-400' : 'bg-yellow-400'
                  }`} />
                  <span className="text-sm text-gray-300">
                    {point?.agent_id ? `Agent ${point?.agent_id?.slice(0, 8)}` : `Point ${index + 1}`}
                  </span>
                </div>
                <div className="text-sm text-white">{point?.value}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Tree Evolution */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Decision Tree Evolution
          </h3>

          <div className="space-y-3">
            {decisionLogs?.slice(0, 4)?.map((decision, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-xs text-blue-400">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {decision?.decision_type || 'Strategy Decision'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(decision.created_at)?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-400">
                      {decision?.confidence_score || Math.floor(Math.random() * 30) + 70}%
                    </div>
                    <div className="text-xs text-gray-400">Confidence</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Auto-Correction Engine */}
        <div className="border-t border-gray-700 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Prompt Auto-Correction Engine
          </h3>

          <div className="space-y-3">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Communication Optimization</span>
                <span className="text-xs text-green-400">Active</span>
              </div>
              <div className="bg-gray-600 rounded-full h-2">
                <div className="h-full bg-green-400 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Context Understanding</span>
                <span className="text-xs text-blue-400">Learning</span>
              </div>
              <div className="bg-gray-600 rounded-full h-2">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Feedback Integration</span>
                <span className="text-xs text-yellow-400">Processing</span>
              </div>
              <div className="bg-gray-600 rounded-full h-2">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '91%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}