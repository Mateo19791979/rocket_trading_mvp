import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Target, BookOpen, Download, Search, Filter, Calendar } from 'lucide-react';
import { aiAgentsService } from '../../../services/aiAgentsService';

export default function PostIncidentAnalysis({ incidents = [], systemOverview }) {
  const [analysisData, setAnalysisData] = useState({
    incidentTrends: [],
    rootCauseAnalysis: [],
    improvements: [],
    documentation: []
  });
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalysisData();
  }, [selectedTimeframe, incidents]);

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      // Get historical incident data for analysis
      const auditTrail = await aiAgentsService?.getAuditTrail(500);
      const systemMetrics = await aiAgentsService?.getRiskManagerStatus();
      
      // Perform trend analysis
      const trends = analyzeTrends(auditTrail);
      const rootCauses = performRootCauseAnalysis(incidents, auditTrail);
      const recommendations = generateRecommendations(incidents, systemMetrics);
      const docs = generateDocumentation(incidents, trends);

      setAnalysisData({
        incidentTrends: trends,
        rootCauseAnalysis: rootCauses,
        improvements: recommendations,
        documentation: docs
      });
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTrends = (auditTrail) => {
    // Analyze patterns in incident data
    const timeframes = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168
    };

    const hours = timeframes?.[selectedTimeframe] || 24;
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const recentEvents = auditTrail?.filter(event => 
      new Date(event?.created_at) > cutoffTime
    );

    // Group events by type and analyze frequency
    const eventTypes = {};
    recentEvents?.forEach(event => {
      const type = event?.event_type;
      if (!eventTypes?.[type]) {
        eventTypes[type] = { count: 0, agents: new Set(), timestamps: [] };
      }
      eventTypes[type].count++;
      if (event?.source_agent?.name) {
        eventTypes?.[type]?.agents?.add(event?.source_agent?.name);
      }
      eventTypes?.[type]?.timestamps?.push(event?.created_at);
    });

    return Object.entries(eventTypes)?.map(([type, data]) => ({
      type,
      count: data?.count,
      affectedAgents: data?.agents?.size,
      frequency: data?.count / hours,
      trend: calculateTrend(data?.timestamps),
      severity: determineSeverity(data?.count, hours)
    }));
  };

  const performRootCauseAnalysis = (incidents, auditTrail) => {
    const causes = [];

    // Analyze agent malfunction patterns
    const agentIssues = incidents?.filter(i => i?.type === 'anomaly');
    if (agentIssues?.length > 0) {
      causes?.push({
        category: 'Agent Performance',
        description: 'Multiple agents showing performance degradation',
        likelihood: 'High',
        impact: 'Critical',
        evidence: [
          `${agentIssues?.length} agent anomalies detected`,
          'Pattern of declining performance metrics',
          'Correlation with increased system load'
        ],
        recommendations: [
          'Review agent resource allocation',
          'Implement performance monitoring thresholds',
          'Consider agent load balancing'
        ]
      });
    }

    // Analyze data quality issues
    const dataIssues = incidents?.filter(i => 
      i?.detection_type === 'data_quality' || 
      i?.type === 'alert' && i?.alert_type === 'technical'
    );
    
    if (dataIssues?.length > 0) {
      causes?.push({
        category: 'Data Quality',
        description: 'Data feed inconsistencies affecting decision making',
        likelihood: 'Medium',
        impact: 'High',
        evidence: [
          `${dataIssues?.length} data quality alerts`,
          'Provider connectivity issues observed',
          'Timestamp inconsistencies detected'
        ],
        recommendations: [
          'Implement data validation checkpoints',
          'Add redundant data sources',
          'Improve data provider monitoring'
        ]
      });
    }

    // Analyze system resource constraints
    const resourceIssues = auditTrail?.filter(event =>
      event?.event_data?.message?.toLowerCase()?.includes('resource') ||
      event?.event_data?.message?.toLowerCase()?.includes('memory') ||
      event?.event_data?.message?.toLowerCase()?.includes('cpu')
    );

    if (resourceIssues?.length > 5) {
      causes?.push({
        category: 'System Resources',
        description: 'Resource constraints limiting system performance',
        likelihood: 'Medium',
        impact: 'Medium',
        evidence: [
          `${resourceIssues?.length} resource-related events`,
          'Increased response times observed',
          'Memory usage approaching limits'
        ],
        recommendations: [
          'Scale system resources',
          'Optimize resource allocation',
          'Implement resource usage alerts'
        ]
      });
    }

    return causes;
  };

  const generateRecommendations = (incidents, systemMetrics) => {
    const recommendations = [];

    // Monitoring improvements
    recommendations?.push({
      priority: 'High',
      category: 'Monitoring',
      title: 'Enhanced Real-time Monitoring',
      description: 'Implement more granular monitoring for early incident detection',
      implementation: 'Add health check endpoints, implement circuit breakers, create performance baselines',
      timeline: '2-3 weeks',
      impact: 'Reduce incident detection time by 50%'
    });

    // Agent resilience
    if (incidents?.some(i => i?.type === 'anomaly')) {
      recommendations?.push({
        priority: 'High',
        category: 'Resilience',
        title: 'Agent Fault Tolerance',
        description: 'Improve agent resilience to handle failures gracefully',
        implementation: 'Implement retry mechanisms, add fallback strategies, create agent health scoring',
        timeline: '3-4 weeks',
        impact: 'Reduce agent failure impact by 70%'
      });
    }

    // Process improvements
    recommendations?.push({
      priority: 'Medium',
      category: 'Process',
      title: 'Incident Response Automation',
      description: 'Automate more incident response procedures',
      implementation: 'Create automated recovery scripts, implement self-healing mechanisms',
      timeline: '4-6 weeks',
      impact: 'Reduce manual intervention by 60%'
    });

    // Documentation
    recommendations?.push({
      priority: 'Medium',
      category: 'Documentation',
      title: 'Runbook Creation',
      description: 'Create comprehensive incident response runbooks',
      implementation: 'Document procedures, create decision trees, establish communication protocols',
      timeline: '1-2 weeks',
      impact: 'Improve response consistency and speed'
    });

    return recommendations;
  };

  const generateDocumentation = (incidents, trends) => {
    return [
      {
        title: 'Incident Response Timeline',
        type: 'timeline',
        content: incidents?.map(incident => ({
          timestamp: incident?.created_at || incident?.detected_at,
          event: incident?.title || incident?.description,
          severity: incident?.severity || incident?.alert_severity,
          type: incident?.type
        }))
      },
      {
        title: 'System Performance Analysis',
        type: 'analysis',
        content: {
          totalIncidents: incidents?.length,
          criticalIncidents: incidents?.filter(i => (i?.severity || i?.alert_severity) === 'critical')?.length,
          affectedAgents: new Set(incidents?.map(i => i?.source_agent_id)?.filter(Boolean))?.size,
          averageResolutionTime: '15 minutes', // Would calculate from actual data
          systemAvailability: '99.2%' // Would calculate from actual data
        }
      },
      {
        title: 'Lessons Learned',
        type: 'lessons',
        content: [
          'Early detection systems prevented cascading failures',
          'Agent isolation procedures worked effectively',
          'Communication protocols need refinement',
          'Recovery procedures completed within SLA'
        ]
      }
    ];
  };

  const calculateTrend = (timestamps) => {
    if (timestamps?.length < 2) return 'stable';
    
    // Simple trend calculation based on time intervals
    const intervals = timestamps?.slice(1)?.map((time, index) => 
      new Date(time) - new Date(timestamps?.[index])
    );
    
    const avgInterval = intervals?.reduce((a, b) => a + b, 0) / intervals?.length;
    const recentInterval = intervals?.slice(-3)?.reduce((a, b) => a + b, 0) / Math.min(3, intervals?.length);
    
    if (recentInterval < avgInterval * 0.8) return 'increasing';
    if (recentInterval > avgInterval * 1.2) return 'decreasing';
    return 'stable';
  };

  const determineSeverity = (count, hours) => {
    const rate = count / hours;
    if (rate > 10) return 'critical';
    if (rate > 5) return 'high';
    if (rate > 2) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 border-red-600 bg-red-900/30';
      case 'Medium': return 'text-yellow-400 border-yellow-600 bg-yellow-900/30';
      case 'Low': return 'text-blue-400 border-blue-600 bg-blue-900/30';
      default: return 'text-gray-400 border-gray-600 bg-gray-900/30';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const exportAnalysis = () => {
    const report = {
      generated: new Date()?.toISOString(),
      timeframe: selectedTimeframe,
      summary: {
        totalIncidents: incidents?.length,
        timeframe: selectedTimeframe,
        systemOverview: systemOverview
      },
      trends: analysisData?.incidentTrends,
      rootCauses: analysisData?.rootCauseAnalysis,
      recommendations: analysisData?.improvements,
      documentation: analysisData?.documentation
    };

    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-analysis-${selectedTimeframe}-${new Date()?.toISOString()?.slice(0, 10)}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 border border-purple-600 rounded-lg overflow-hidden">
      <div className="bg-purple-900/30 px-6 py-4 border-b border-purple-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Post-Incident Analysis</h2>
          </div>
          <button
            onClick={exportAnalysis}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Analysis</span>
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Analysis Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e?.target?.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e?.target?.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Types</option>
              <option value="critical">Critical Only</option>
              <option value="agent">Agent Related</option>
              <option value="system">System Related</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search analysis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing incident data...</p>
          </div>
        ) : (
          <>
            {/* Incident Trends */}
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <h3 className="text-purple-400 font-semibold">Incident Trends</h3>
              </div>

              <div className="grid gap-3">
                {analysisData?.incidentTrends?.map((trend, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-medium">{trend?.type?.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          trend?.severity === 'critical' ? 'bg-red-900 text-red-300' :
                          trend?.severity === 'high' ? 'bg-orange-900 text-orange-300' :
                          trend?.severity === 'medium'? 'bg-yellow-900 text-yellow-300' : 'bg-blue-900 text-blue-300'
                        }`}>
                          {trend?.severity}
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${getTrendColor(trend?.trend)}`}>
                        {trend?.trend}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                      <div>
                        <span className="text-white font-medium">{trend?.count}</span>
                        <div>Total Events</div>
                      </div>
                      <div>
                        <span className="text-white font-medium">{trend?.affectedAgents}</span>
                        <div>Agents Affected</div>
                      </div>
                      <div>
                        <span className="text-white font-medium">{trend?.frequency?.toFixed(2)}/hr</span>
                        <div>Frequency</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-5 w-5 text-orange-400" />
                <h3 className="text-orange-400 font-semibold">Root Cause Analysis</h3>
              </div>

              <div className="space-y-4">
                {analysisData?.rootCauseAnalysis?.map((cause, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{cause?.category}</h4>
                        <p className="text-gray-300 text-sm mt-1">{cause?.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(cause?.impact)}`}>
                          {cause?.impact}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Evidence</h5>
                        <ul className="space-y-1">
                          {cause?.evidence?.map((item, idx) => (
                            <li key={idx} className="text-xs text-gray-400 pl-2">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                          {cause?.recommendations?.map((item, idx) => (
                            <li key={idx} className="text-xs text-blue-400 pl-2">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Improvements */}
            <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-green-400" />
                <h3 className="text-green-400 font-semibold">System Improvement Recommendations</h3>
              </div>

              <div className="space-y-3">
                {analysisData?.improvements?.map((improvement, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-white font-medium">{improvement?.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(improvement?.priority)}`}>
                            {improvement?.priority}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{improvement?.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-400 mt-3">
                      <div>
                        <span className="text-gray-300 font-medium">Timeline:</span>
                        <div>{improvement?.timeline}</div>
                      </div>
                      <div>
                        <span className="text-gray-300 font-medium">Expected Impact:</span>
                        <div>{improvement?.impact}</div>
                      </div>
                      <div>
                        <span className="text-gray-300 font-medium">Category:</span>
                        <div>{improvement?.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation Summary */}
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-4">Incident Documentation</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {analysisData?.documentation?.map((doc, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-2">{doc?.title}</h4>
                    
                    {doc?.type === 'analysis' && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Incidents:</span>
                          <span className="text-white">{doc?.content?.totalIncidents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Critical:</span>
                          <span className="text-red-400">{doc?.content?.criticalIncidents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">System Availability:</span>
                          <span className="text-green-400">{doc?.content?.systemAvailability}</span>
                        </div>
                      </div>
                    )}

                    {doc?.type === 'lessons' && (
                      <ul className="space-y-1 text-sm">
                        {doc?.content?.map((lesson, idx) => (
                          <li key={idx} className="text-gray-300 text-sm pl-2">• {lesson}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}