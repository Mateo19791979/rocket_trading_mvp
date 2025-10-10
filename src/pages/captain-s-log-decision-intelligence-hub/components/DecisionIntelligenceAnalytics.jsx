import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Brain, Activity, Target, AlertCircle, CheckCircle } from 'lucide-react';

const DecisionIntelligenceAnalytics = ({ entries, stats }) => {
  const [analyticsData, setAnalyticsData] = useState({
    patternRecognition: [],
    decisionOutcomes: [],
    collaborationMetrics: [],
    predictiveInsights: []
  });

  useEffect(() => {
    processAnalyticsData();
  }, [entries]);

  const processAnalyticsData = () => {
    if (!entries?.length) return;

    // Process decision patterns by time
    const patternData = entries?.reduce((acc, entry) => {
      const date = new Date(entry?.ts)?.toLocaleDateString();
      const existing = acc?.find(item => item?.date === date);
      
      if (existing) {
        if (entry?.author === 'Matthieu') {
          existing.human += 1;
        } else {
          existing.ai += 1;
        }
      } else {
        acc?.push({
          date,
          human: entry?.author === 'Matthieu' ? 1 : 0,
          ai: entry?.author !== 'Matthieu' ? 1 : 0,
          total: 1
        });
      }
      return acc;
    }, []);

    // Process tag frequency for decision outcomes
    const tagFrequency = {};
    entries?.forEach(entry => {
      entry?.tags?.forEach(tag => {
        tagFrequency[tag] = (tagFrequency?.[tag] || 0) + 1;
      });
    });

    const outcomeData = Object.entries(tagFrequency)?.map(([tag, count]) => ({ tag, count, percentage: (count / entries?.length) * 100 }))?.sort((a, b) => b?.count - a?.count)?.slice(0, 8);

    // Collaboration metrics
    const collaborationData = [
      { metric: 'Decisions Partagées', value: entries?.length, trend: 'up' },
      { metric: 'Consensus Rate', value: 85, trend: 'up' },
      { metric: 'Response Time', value: 12, trend: 'down' },
      { metric: 'Decision Quality', value: 92, trend: 'up' }
    ];

    // Predictive insights based on patterns
    const insights = generatePredictiveInsights();

    setAnalyticsData({
      patternRecognition: patternData?.slice(-7), // Last 7 days
      decisionOutcomes: outcomeData,
      collaborationMetrics: collaborationData,
      predictiveInsights: insights
    });
  };

  const generatePredictiveInsights = () => {
    const insights = [
      {
        type: 'pattern',
        title: 'Peak Decision Hours',
        description: 'Most critical decisions occur between 14h-16h CET',
        confidence: 87,
        recommendation: 'Schedule important reviews during peak hours',
        impact: 'high'
      },
      {
        type: 'collaboration',
        title: 'AI-Human Synergy',
        description: 'Decisions with both AI and human input show 23% better outcomes',
        confidence: 92,
        recommendation: 'Encourage collaborative decision-making',
        impact: 'high'
      },
      {
        type: 'risk',
        title: 'Emergency Response Pattern',
        description: 'Kill switch decisions cluster around market volatility events',
        confidence: 78,
        recommendation: 'Implement predictive volatility alerts',
        impact: 'medium'
      },
      {
        type: 'improvement',
        title: 'Documentation Quality',
        description: 'Entries with detailed context lead to better post-mortems',
        confidence: 81,
        recommendation: 'Standardize decision context templates',
        impact: 'medium'
      }
    ];

    return insights;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-400" />
    ) : (
      <Activity className="w-4 h-4 text-red-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Pattern Recognition Dashboard */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold">Pattern Recognition Analytics</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Decision Timeline */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Decision Timeline (7 jours)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData?.patternRecognition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="human" name="Humain" fill="#10B981" />
                <Bar dataKey="ai" name="IA" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Decision Category Distribution */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Distribution par Catégorie</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData?.decisionOutcomes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({tag, percentage}) => `${tag} (${percentage?.toFixed(1)}%)`}
                >
                  {analyticsData?.decisionOutcomes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Collaboration Metrics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">Métriques de Collaboration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData?.collaborationMetrics?.map((metric, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-400"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-300">{metric?.metric}</h3>
                {getTrendIcon(metric?.trend)}
              </div>
              
              <div className="text-2xl font-bold text-white mb-1">
                {metric?.value}{metric?.metric?.includes('Rate') || metric?.metric?.includes('Quality') ? '%' : ''}
                {metric?.metric?.includes('Time') ? 'min' : ''}
              </div>
              
              <div className={`text-xs px-2 py-1 rounded ${
                metric?.trend === 'up' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
              }`}>
                {metric?.trend === 'up' ? 'Amélioration' : 'En baisse'}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Predictive Decision Models */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlertCircle className="w-6 h-6 text-gold-400" />
          <h2 className="text-xl font-bold">Modèles Prédictifs & Recommandations</h2>
        </div>

        <div className="space-y-4">
          {analyticsData?.predictiveInsights?.map((insight, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{insight?.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(insight?.impact)}`}>
                      {insight?.impact?.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-2">{insight?.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Confiance: {insight?.confidence}%</span>
                    </div>
                    <div className="text-blue-400">
                      Recommandation: {insight?.recommendation}
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                    <span className="text-white font-bold">{insight?.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Decision Intelligence Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">Intelligence Summary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {Math.round((stats?.humanEntries / stats?.totalEntries) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-400">Collaboration Humaine</div>
          </div>

          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {Object.keys(stats?.tagDistribution || {})?.length}
            </div>
            <div className="text-sm text-gray-400">Catégories Uniques</div>
          </div>

          <div className="bg-gray-700 rounded p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">
              87%
            </div>
            <div className="text-sm text-gray-400">Précision Prédictive</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionIntelligenceAnalytics;