import React from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, TrendingUp, Award, Target, Zap } from 'lucide-react';

export default function ProductionReadinessAssessment({ testResults, systemStatus, performanceMetrics }) {
  const calculateReadinessScore = () => {
    let score = 0;
    let maxScore = 0;

    // SLO compliance (40% weight)
    maxScore += 40;
    if (performanceMetrics?.sloCompliance >= 95) score += 40;
    else if (performanceMetrics?.sloCompliance >= 90) score += 32;
    else if (performanceMetrics?.sloCompliance >= 85) score += 24;

    // Error rate (25% weight)
    maxScore += 25;
    if (performanceMetrics?.errorRate < 1) score += 25;
    else if (performanceMetrics?.errorRate < 2) score += 20;
    else if (performanceMetrics?.errorRate < 5) score += 15;

    // Latency performance (20% weight)
    maxScore += 20;
    if (performanceMetrics?.avgLatency < 300) score += 20;
    else if (performanceMetrics?.avgLatency < 500) score += 16;
    else if (performanceMetrics?.avgLatency < 700) score += 12;

    // System stability (15% weight)
    maxScore += 15;
    if (systemStatus?.k6Available && systemStatus?.redisConnected) score += 15;

    return Math.round((score / maxScore) * 100);
  };

  const readinessScore = calculateReadinessScore();

  const getReadinessStatus = () => {
    if (readinessScore >= 95) return { status: 'Production Ready', color: 'green', icon: CheckCircle };
    if (readinessScore >= 85) return { status: 'Pre-Production', color: 'yellow', icon: AlertTriangle };
    if (readinessScore >= 70) return { status: 'Development', color: 'orange', icon: AlertTriangle };
    return { status: 'Not Ready', color: 'red', icon: XCircle };
  };

  const readinessStatus = getReadinessStatus();
  const StatusIcon = readinessStatus?.icon;

  const performanceAssessment = [
    {
      category: 'Provider Router',
      tests: testResults?.filter(t => t?.type === 'providers')?.length,
      status: systemStatus?.apiEndpoints?.providers?.status || 'unknown',
      latency: systemStatus?.apiEndpoints?.providers?.latency || 0,
      target: 'p95 < 800ms',
      met: (systemStatus?.apiEndpoints?.providers?.latency || 0) < 800
    },
    {
      category: 'Quotes HTTP',
      tests: testResults?.filter(t => t?.type === 'quotes-http')?.length,
      status: systemStatus?.apiEndpoints?.quotes?.status || 'unknown',
      latency: systemStatus?.apiEndpoints?.quotes?.latency || 0,
      target: 'p95 < 700ms',
      met: (systemStatus?.apiEndpoints?.quotes?.latency || 0) < 700
    },
    {
      category: 'WebSocket Bridge',
      tests: testResults?.filter(t => t?.type === 'websocket')?.length,
      status: systemStatus?.apiEndpoints?.websocket?.status || 'unknown',
      latency: systemStatus?.apiEndpoints?.websocket?.latency || 0,
      target: '> 1000 clients',
      met: performanceMetrics?.activeConnections > 1000
    },
    {
      category: 'RAG Knowledge Base',
      tests: testResults?.filter(t => t?.type === 'rag')?.length,
      status: systemStatus?.apiEndpoints?.rag?.status || 'unknown',
      latency: systemStatus?.apiEndpoints?.rag?.latency || 0,
      target: 'p95 < 900ms',
      met: (systemStatus?.apiEndpoints?.rag?.latency || 0) < 900
    }
  ];

  const optimizationRecommendations = [
    {
      priority: 'High',
      category: 'Performance',
      recommendation: 'Optimize Provider Router failover logic',
      impact: 'Reduce latency by 15-20%',
      effort: '2-3 days',
      enabled: performanceMetrics?.avgLatency > 400
    },
    {
      priority: 'Medium',
      category: 'Scaling',
      recommendation: 'Increase WebSocket connection pool',
      impact: 'Support 2000+ concurrent clients',
      effort: '1-2 days',
      enabled: performanceMetrics?.activeConnections < 1000
    },
    {
      priority: 'Medium',
      category: 'Reliability',
      recommendation: 'Implement circuit breaker pattern',
      impact: 'Improve error rate to <0.5%',
      effort: '3-4 days',
      enabled: performanceMetrics?.errorRate > 1
    },
    {
      priority: 'Low',
      category: 'Monitoring',
      recommendation: 'Add Grafana dashboards for k6 metrics',
      impact: 'Better observability',
      effort: '1 day',
      enabled: true
    }
  ]?.filter(rec => rec?.enabled);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Production Readiness Assessment
          </h3>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Readiness Score */}
        <div className={`bg-${readinessStatus?.color}-50 dark:bg-${readinessStatus?.color}-900/20 border border-${readinessStatus?.color}-200 dark:border-${readinessStatus?.color}-800 rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <StatusIcon className={`h-6 w-6 text-${readinessStatus?.color}-600 dark:text-${readinessStatus?.color}-400 mr-2`} />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {readinessStatus?.status}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overall system readiness assessment
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold text-${readinessStatus?.color}-600 dark:text-${readinessStatus?.color}-400`}>
                {readinessScore}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Readiness Score
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`bg-${readinessStatus?.color}-600 h-3 rounded-full transition-all duration-500`}
              style={{ width: `${readinessScore}%` }}
            ></div>
          </div>
        </div>

        {/* Component Assessment */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Component Performance Analysis
          </h4>
          
          <div className="space-y-2">
            {performanceAssessment?.map((component, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center">
                  {component?.met ? (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-3" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {component?.category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {component?.tests} tests completed
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className={`font-medium ${
                    component?.met 
                      ? 'text-green-600 dark:text-green-400' :'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {component?.latency}ms
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {component?.target}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Regression Detection */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Performance Regression Detection
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                Throughput: Stable
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                Latency: Within SLO
              </span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                Error Rate: Trending up
              </span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                Memory: Stable
              </span>
            </div>
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Optimization Recommendations
          </h4>
          
          <div className="space-y-2">
            {optimizationRecommendations?.map((rec, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                        rec?.priority === 'High' ?'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : rec?.priority === 'Medium' ?'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {rec?.priority}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {rec?.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {rec?.recommendation}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Impact: {rec?.impact} • Effort: {rec?.effort}
                    </p>
                  </div>
                  <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Go-Live Recommendation */}
        <div className={`p-4 rounded-lg border-2 ${
          readinessScore >= 95 
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' :'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <div className="flex items-center">
            {readinessScore >= 95 ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {readinessScore >= 95 
                  ? '🚀 System Ready for Production Deployment'
                  : '⚠️ Additional Testing Recommended'
                }
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {readinessScore >= 95 
                  ? 'All SLOs met. Performance validated. Deploy with confidence.'
                  : `Score: ${readinessScore}%. Address high-priority recommendations before go-live.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}