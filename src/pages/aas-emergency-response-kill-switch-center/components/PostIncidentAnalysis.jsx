import { useState } from 'react';
import { FileText, TrendingUp, Brain, Target, BookOpen, Download } from 'lucide-react';

export default function PostIncidentAnalysis({ systemHealth, currentRegime }) {
  const [analysisData] = useState({
    systemMetrics: {
      dhi_trend: [0.85, 0.82, 0.78, 0.71, 0.68, 0.75, 0.82, 0.89],
      error_trend: [2, 3, 5, 8, 12, 7, 4, 1],
      recovery_time: '12 minutes',
      impact_scope: ['LIVE_TRADING', 'STRATEGY_GENERATION'],
      root_cause: 'Market regime shift with insufficient adaptation'
    },
    recommendations: [
      {
        id: 1,
        category: 'Prevention',
        title: 'Enhanced Regime Detection',
        description: 'Implement faster market regime change detection with 30-second polling',
        priority: 'high',
        effort: 'medium',
        impact: 'high'
      },
      {
        id: 2,
        category: 'Response',
        title: 'Automated Level 2 Trigger',
        description: 'Auto-activate Level 2 kill switches when DHI drops below 0.7',
        priority: 'high',
        effort: 'low',
        impact: 'high'
      },
      {
        id: 3,
        category: 'Recovery',
        title: 'Gradual Recovery Protocol',
        description: 'Implement staged recovery process with health checkpoints',
        priority: 'medium',
        effort: 'high',
        impact: 'medium'
      },
      {
        id: 4,
        category: 'Learning',
        title: 'Meta-Learning Integration',
        description: 'Feed incident patterns into strategy breeding algorithms',
        priority: 'medium',
        effort: 'high',
        impact: 'high'
      }
    ],
    learningInsights: [
      'Volatile market regimes require faster adaptation cycles',
      'Strategy breeding should incorporate regime stability metrics',
      'Kill switch Level 2-3 provides optimal balance of safety and continuity',
      'Recovery procedures should validate each step before proceeding'
    ]
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Prevention': return '🛡️';
      case 'Response': return '⚡';
      case 'Recovery': return '🔄';
      case 'Learning': return '🧠';
      default: return '📋';
    }
  };

  const generateAnalysisReport = () => {
    return `AAS POST-INCIDENT ANALYSIS REPORT
Generated: ${new Date()?.toLocaleString()}

SYSTEM METRICS:
• DHI Recovery Time: ${analysisData?.systemMetrics?.recovery_time}
• Affected Systems: ${analysisData?.systemMetrics?.impact_scope?.join(', ')}
• Root Cause: ${analysisData?.systemMetrics?.root_cause}

CURRENT STATUS:
• System Health: ${systemHealth?.mode?.toUpperCase()} (DHI: ${((systemHealth?.dhi_avg || 0) * 100)?.toFixed(1)}%)
• Market Regime: ${currentRegime?.regime?.toUpperCase()} (Confidence: ${((currentRegime?.confidence || 0) * 100)?.toFixed(0)}%)

KEY RECOMMENDATIONS:
${analysisData?.recommendations?.slice(0, 3)?.map(r => 
  `• [${r?.priority?.toUpperCase()}] ${r?.title}: ${r?.description}`
)?.join('\n')}

LEARNING INSIGHTS:
${analysisData?.learningInsights?.map(insight => `• ${insight}`)?.join('\n')}

This analysis is part of the continuous improvement cycle of the AAS system.`;
  };

  const handleDownloadReport = () => {
    const report = generateAnalysisReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL?.createObjectURL(blob);
    const link = document?.createElement('a');
    link.href = url;
    link.download = `aas-incident-analysis-${new Date()?.toISOString()?.split('T')?.[0]}.txt`;
    document?.body?.appendChild(link);
    link?.click();
    document?.body?.removeChild(link);
    URL?.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-indigo-600 shadow-2xl">
      <div className="p-6 border-b border-indigo-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold text-indigo-100">Post-Incident Analysis</h2>
              <p className="text-indigo-300 text-sm">System improvement and learning integration</p>
            </div>
          </div>
          
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current System Assessment */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Current System Assessment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <div className="font-medium text-white">System Health</div>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {((systemHealth?.dhi_avg || 0) * 100)?.toFixed(1)}%
              </div>
              <div className="text-gray-400 text-sm">
                Mode: {systemHealth?.mode?.toUpperCase() || 'UNKNOWN'}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-400" />
                <div className="font-medium text-white">Market Regime</div>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {currentRegime?.regime?.toUpperCase() || 'N/A'}
              </div>
              <div className="text-gray-400 text-sm">
                Confidence: {((currentRegime?.confidence || 0) * 100)?.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recovery Performance</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {analysisData?.systemMetrics?.recovery_time}
                </div>
                <div className="text-gray-400 text-sm">Recovery Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {analysisData?.systemMetrics?.impact_scope?.length}
                </div>
                <div className="text-gray-400 text-sm">Systems Affected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {analysisData?.recommendations?.length}
                </div>
                <div className="text-gray-400 text-sm">Recommendations</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-800 rounded">
              <div className="text-sm text-gray-400">Root Cause Identified:</div>
              <div className="text-white font-medium">
                {analysisData?.systemMetrics?.root_cause}
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Recommendations */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Improvement Recommendations</h3>
          <div className="space-y-3">
            {analysisData?.recommendations?.map((rec) => (
              <div
                key={rec?.id}
                className="bg-gray-700 rounded-lg p-4 border-l-4 border-indigo-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-lg">{getCategoryIcon(rec?.category)}</div>
                      <div className="font-semibold text-white">{rec?.title}</div>
                      <span className={`px-2 py-1 text-xs rounded text-white ${getPriorityColor(rec?.priority)}`}>
                        {rec?.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm mb-2">{rec?.description}</div>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="text-gray-400">
                        <span className="font-medium">Effort:</span> {rec?.effort}
                      </div>
                      <div className="text-gray-400">
                        <span className="font-medium">Impact:</span> {rec?.impact}
                      </div>
                      <div className="text-indigo-400">
                        Category: {rec?.category}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Insights */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-green-400" />
            <span>AI Learning Insights</span>
          </h3>
          <div className="bg-green-900 rounded-lg p-4 border border-green-600">
            <div className="space-y-2">
              {analysisData?.learningInsights?.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3"
                >
                  <div className="text-green-400 mt-1">💡</div>
                  <div className="text-green-200 text-sm">{insight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Analysis Toggle */}
        <div>
          <button
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">
              {showDetailedAnalysis ? 'Hide' : 'Show'} Detailed Technical Analysis
            </span>
          </button>

          {showDetailedAnalysis && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Technical Details</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-300">DHI Trend Analysis:</div>
                  <div className="text-gray-400">
                    {analysisData?.systemMetrics?.dhi_trend?.map(val => (val * 100)?.toFixed(0))?.join('% → ')}%
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-300">Error Rate Pattern:</div>
                  <div className="text-gray-400">
                    {analysisData?.systemMetrics?.error_trend?.join(' → ')} errors/hour
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-300">System Recovery Steps:</div>
                  <div className="text-gray-400">
                    Automated kill switch activation → Manual assessment → Gradual system restoration
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Integration */}
        <div className="p-4 bg-blue-900 rounded-lg border border-blue-600">
          <h4 className="text-blue-100 font-semibold mb-2">🧠 Knowledge Integration Status</h4>
          <div className="text-blue-300 text-sm space-y-1">
            <div>✅ Incident patterns integrated into meta-learning algorithms</div>
            <div>✅ Recovery procedures updated based on performance data</div>
            <div>✅ Strategy breeding parameters adjusted for regime stability</div>
            <div>⏳ Advanced detection thresholds being calibrated</div>
          </div>
        </div>
      </div>
    </div>
  );
}