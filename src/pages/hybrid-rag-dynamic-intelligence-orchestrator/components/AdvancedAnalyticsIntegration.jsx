import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Brain, Zap, Target, Activity, AlertTriangle, CheckCircle2, Globe, LineChart } from 'lucide-react';

export default function AdvancedAnalyticsIntegration() {
  const [sentimentData, setSentimentData] = useState({});
  const [marketScenarios, setMarketScenarios] = useState([]);
  const [insightDiscovery, setInsightDiscovery] = useState({});
  const [analyticsMode, setAnalyticsMode] = useState('realtime');

  const analyticsModes = [
    { id: 'realtime', name: 'Real-time', color: 'text-green-400 bg-green-500/10' },
    { id: 'predictive', name: 'Predictive', color: 'text-blue-400 bg-blue-500/10' },
    { id: 'causal', name: 'Causal', color: 'text-purple-400 bg-purple-500/10' }
  ];

  const mockSentimentData = {
    overall: 0.67,
    trend: '+8%',
    sources: [
      { name: 'News', sentiment: 0.72, volume: 1247, trend: '+12%' },
      { name: 'Social Media', sentiment: 0.58, volume: 8934, trend: '+3%' },
      { name: 'Analyst Reports', sentiment: 0.81, volume: 156, trend: '+15%' },
      { name: 'Earnings Calls', sentiment: 0.69, volume: 43, trend: '+7%' }
    ],
    keywords: [
      { term: 'AI growth', impact: 0.89, frequency: 234 },
      { term: 'rate cuts', impact: 0.76, frequency: 189 },
      { term: 'volatility', impact: -0.45, frequency: 167 }
    ]
  };

  const mockMarketScenarios = [
    {
      id: 1,
      name: 'Bull Market Continuation',
      probability: 0.45,
      impact: 'High Positive',
      timeframe: '6 months',
      keyFactors: ['Strong earnings', 'Low inflation', 'Tech adoption'],
      confidence: 0.82
    },
    {
      id: 2,
      name: 'Volatility Spike',
      probability: 0.28,
      impact: 'Medium Negative',
      timeframe: '3 months',
      keyFactors: ['Geopolitical tension', 'Rate uncertainty', 'Sector rotation'],
      confidence: 0.74
    },
    {
      id: 3,
      name: 'Sideways Consolidation',
      probability: 0.27,
      impact: 'Neutral',
      timeframe: '4 months',
      keyFactors: ['Mixed signals', 'Balanced sentiment', 'Range-bound'],
      confidence: 0.69
    }
  ];

  const mockInsightDiscovery = {
    newInsights: 3,
    causalRelations: 7,
    statisticalSignificance: 0.95,
    patterns: [
      {
        id: 1,
        type: 'correlation',
        description: 'VIX-SPY negative correlation strengthening',
        significance: 0.94,
        discovered: '2 hours ago'
      },
      {
        id: 2,
        type: 'causal',
        description: 'Tech earnings → sector rotation pattern',
        significance: 0.89,
        discovered: '4 hours ago'
      },
      {
        id: 3,
        type: 'anomaly',
        description: 'Unusual options flow in energy sector',
        significance: 0.91,
        discovered: '1 hour ago'
      }
    ]
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 0.7) return 'text-green-400';
    if (sentiment >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getImpactColor = (impact) => {
    if (impact?.includes('Positive')) return 'text-green-400';
    if (impact?.includes('Negative')) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getPatternTypeIcon = (type) => {
    switch (type) {
      case 'correlation': return <LineChart className="h-4 w-4" />;
      case 'causal': return <Target className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    setSentimentData(mockSentimentData);
    setMarketScenarios(mockMarketScenarios);
    setInsightDiscovery(mockInsightDiscovery);
  }, []);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Advanced Analytics Integration</h3>
            <p className="text-sm text-gray-400">Real-time market sentiment fusion & predictive text generation</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-green-400 animate-pulse" />
          <span className="text-sm text-green-400">Live Feed</span>
        </div>
      </div>

      {/* Analytics Mode Selector */}
      <div className="flex space-x-2 mb-6">
        {analyticsModes?.map((mode) => (
          <button
            key={mode?.id}
            onClick={() => setAnalyticsMode(mode?.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              analyticsMode === mode?.id
                ? `${mode?.color} border border-current`
                : 'text-gray-400 hover:text-gray-300 bg-gray-700/50'
            }`}
          >
            {mode?.name}
          </button>
        ))}
      </div>

      {/* Real-time Market Sentiment */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-300 mb-3 flex items-center">
          <Globe className="h-4 w-4 mr-2 text-teal-400" />
          Market Sentiment Fusion
        </h4>
        
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{(sentimentData?.overall * 100)?.toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Overall Sentiment</div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-bold">{sentimentData?.trend}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {sentimentData?.sources?.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getSentimentColor(source?.sentiment)?.replace('text-', 'bg-')}`}></div>
                  <span className="text-sm text-white">{source?.name}</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-gray-400">{source?.volume?.toLocaleString()} signals</span>
                  <span className={getSentimentColor(source?.sentiment)}>{(source?.sentiment * 100)?.toFixed(0)}%</span>
                  <span className="text-green-400">{source?.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictive Market Scenarios */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-300 mb-3 flex items-center">
          <Brain className="h-4 w-4 mr-2 text-purple-400" />
          Predictive Text Generation
        </h4>
        
        <div className="space-y-3">
          {marketScenarios?.map((scenario) => (
            <div key={scenario?.id} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-white">{scenario?.name}</div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-blue-400">{(scenario?.probability * 100)?.toFixed(0)}%</span>
                  <div className={`w-2 h-2 rounded-full ${
                    scenario?.probability >= 0.4 ? 'bg-green-400' : 
                    scenario?.probability >= 0.25 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`font-medium ${getImpactColor(scenario?.impact)}`}>{scenario?.impact}</span>
                <span className="text-gray-400">{scenario?.timeframe} outlook</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {scenario?.keyFactors?.map((factor, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                    {factor}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Confidence: {(scenario?.confidence * 100)?.toFixed(0)}%
                </span>
                <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
                    style={{ width: `${scenario?.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Insight Discovery */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-300 flex items-center">
          <Zap className="h-4 w-4 mr-2 text-orange-400" />
          Automated Insight Discovery
        </h4>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-gray-700/50 rounded-lg text-center">
            <div className="text-lg font-bold text-orange-400">{insightDiscovery?.newInsights}</div>
            <div className="text-xs text-gray-400">New Insights</div>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-400">{insightDiscovery?.causalRelations}</div>
            <div className="text-xs text-gray-400">Causal Relations</div>
          </div>
          <div className="p-3 bg-gray-700/50 rounded-lg text-center">
            <div className="text-lg font-bold text-green-400">{(insightDiscovery?.statisticalSignificance * 100)?.toFixed(0)}%</div>
            <div className="text-xs text-gray-400">Significance</div>
          </div>
        </div>
        
        <div className="space-y-2">
          {insightDiscovery?.patterns?.map((pattern) => (
            <div key={pattern?.id} className="p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {getPatternTypeIcon(pattern?.type)}
                  <span className="text-sm font-medium text-white capitalize">{pattern?.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">{(pattern?.significance * 100)?.toFixed(0)}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">{pattern?.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Discovered {pattern?.discovered}</span>
                <div className="w-12 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-yellow-400"
                    style={{ width: `${pattern?.significance * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistical Significance Testing */}
      <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Statistical Significance Testing</span>
        </div>
        <div className="text-xs text-gray-400">
          Using causal reasoning and significance testing (p&lt;0.05) to validate discovered patterns and relationships.
          Current confidence threshold: <span className="text-blue-400 font-bold">95%</span>
        </div>
      </div>
    </div>
  );
}