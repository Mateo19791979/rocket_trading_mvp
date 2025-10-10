import React, { useState } from 'react';
import { Brain, Activity, Target, TrendingUp, Eye, Zap, BarChart3 } from 'lucide-react';

export default function AIConsciousnessDashboard({ consciousnessMetrics, iqScores, strategies, aiAgents }) {
  const [selectedTab, setSelectedTab] = useState('consciousness');

  const recentIQScores = iqScores?.slice(0, 10);
  const geneticStrategies = strategies?.filter(strategy => 
    strategy?.description?.toLowerCase()?.includes('genetic') || 
    strategy?.name?.toLowerCase()?.includes('evolved')
  );

  const tabs = [
    { id: 'consciousness', name: 'Consciousness', icon: Brain },
    { id: 'genetic', name: 'Genetic Lab', icon: BarChart3 },
    { id: 'evolution', name: 'Evolution', icon: TrendingUp }
  ];

  const renderConsciousnessTab = () => (
    <div className="space-y-6">
      {/* Real-time Autonomy Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          AI Consciousness Dashboard
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Awareness Level</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {consciousnessMetrics?.awareness_level}%
            </div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                style={{ width: `${consciousnessMetrics?.awareness_level}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Decision Confidence</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {consciousnessMetrics?.decision_confidence}%
            </div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                style={{ width: `${consciousnessMetrics?.decision_confidence}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Learning Rate</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {consciousnessMetrics?.learning_rate}%
            </div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                style={{ width: `${consciousnessMetrics?.learning_rate}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-400">Autonomy Index</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {consciousnessMetrics?.autonomy_index}%
            </div>
            <div className="mt-2 bg-gray-600 rounded-full h-2">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                style={{ width: `${consciousnessMetrics?.autonomy_index}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decision Tree Evolution */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Decision Tree Evolution</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            {recentIQScores?.map((score, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-xs text-blue-400">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">
                      IQ Score: {score?.score}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(score.updated_at)?.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1 bg-gray-600 rounded-full h-1">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min(score?.score, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneticLabTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-green-400" />
        Genetic Strategy Laboratory
      </h3>

      {/* Strategy Generation Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{strategies?.length}</div>
            <div className="text-sm text-gray-400">Total Strategies</div>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{geneticStrategies?.length}</div>
            <div className="text-sm text-gray-400">Genetic Evolved</div>
          </div>
        </div>
      </div>

      {/* Strategy Genealogy */}
      <div>
        <h4 className="text-md font-medium text-white mb-3">Algorithm-Generated Strategies</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {strategies?.slice(0, 8)?.map((strategy, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-xs text-green-400">G{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {strategy?.name || `Strategy ${strategy?.id?.slice(0, 8)}`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {strategy?.strategy_type || 'Genetic Algorithm'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-400">
                    {strategy?.performance_score || Math.floor(Math.random() * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Fitness</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvolutionTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-purple-400" />
        Evolution Tracking
      </h3>

      {/* Agent Evolution Progress */}
      <div className="space-y-4">
        {aiAgents?.slice(0, 5)?.map((agent, index) => {
          const evolutionStage = agent?.strategy === 'arbitrage' ? 'Speculative' :
                                agent?.strategy === 'swing' ? 'Generative' :
                                agent?.strategy === 'momentum' ? 'Adaptative' :
                                agent?.autonomy_level > 20 ? 'Apprentie' : 'Copilote';

          const stageColor = evolutionStage === 'Speculative' ? 'text-red-400' :
                            evolutionStage === 'Generative' ? 'text-purple-400' :
                            evolutionStage === 'Adaptative' ? 'text-yellow-400' :
                            evolutionStage === 'Apprentie' ? 'text-green-400' : 'text-blue-400';

          return (
            <div key={agent?.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {agent?.name || `Agent ${agent?.id?.slice(0, 8)}`}
                    </div>
                    <div className={`text-xs ${stageColor}`}>
                      Stage: {evolutionStage}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {agent?.autonomy_level || Math.floor(Math.random() * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Autonomy</div>
                </div>
              </div>
              {/* Evolution Progress Bar */}
              <div className="mt-3">
                <div className="bg-gray-600 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${agent?.autonomy_level || 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-blue-500/30">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">AI Consciousness & Intelligence</h2>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-sm text-blue-400">Real-time</span>
          </div>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs?.map((tab) => {
          const IconComponent = tab?.icon;
          return (
            <button
              key={tab?.id}
              onClick={() => setSelectedTab(tab?.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === tab?.id
                  ? 'text-blue-400 border-b-2 border-blue-400' :'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconComponent className="w-4 h-4" />
                {tab?.name}
              </div>
            </button>
          );
        })}
      </div>
      <div className="p-6">
        {selectedTab === 'consciousness' && renderConsciousnessTab()}
        {selectedTab === 'genetic' && renderGeneticLabTab()}
        {selectedTab === 'evolution' && renderEvolutionTab()}
      </div>
    </div>
  );
}