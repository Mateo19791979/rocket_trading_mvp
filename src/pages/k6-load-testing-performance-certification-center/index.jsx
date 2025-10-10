import React, { useState, useEffect } from 'react';
import { Activity, Zap, Target, CheckCircle, AlertTriangle, TrendingUp, Server, Database, Globe, Users } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import k6PerformanceService from '../../services/k6PerformanceService.js';

// K6 Test Suite Configuration Panel
const K6TestSuiteConfigurationPanel = ({ testSuite, onExecuteTest }) => {
  const [executingTest, setExecutingTest] = useState(null);

  const handleExecuteTest = async (scenario) => {
    setExecutingTest(scenario?.name);
    try {
      await onExecuteTest(scenario);
    } finally {
      setExecutingTest(null);
    }
  };

  const getScenarioIcon = (scenario) => {
    if (scenario?.name?.includes('API')) return <Server className="h-4 w-4" />;
    if (scenario?.name?.includes('WebSocket')) return <Globe className="h-4 w-4" />;
    if (scenario?.name?.includes('Database')) return <Database className="h-4 w-4" />;
    if (scenario?.name?.includes('User')) return <Users className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
          <Zap className="h-6 w-6" />
          K6 Test Suite Configuration
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-300">
            {testSuite?.configuredScenarios || 0}/{testSuite?.totalScenarios || 0} Configured
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {testSuite?.scenarios?.map((scenario, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-blue-400">
                  {getScenarioIcon(scenario)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200">{scenario?.name}</h4>
                  <p className="text-xs text-gray-400">{scenario?.target} • {scenario?.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${
                  scenario?.configured ? 'bg-green-400' : 'bg-gray-500'
                }`}></div>
                <button
                  onClick={() => handleExecuteTest(scenario)}
                  disabled={executingTest === scenario?.name}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    scenario?.configured 
                      ? 'bg-green-600 hover:bg-green-700 text-white' :'bg-gray-700 hover:bg-green-600 text-gray-300 hover:text-white'
                  } ${executingTest === scenario?.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {executingTest === scenario?.name ? (
                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                  ) : 'Execute'}
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              {Object.entries(scenario?.parameters || {})?.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400 capitalize">{key?.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="text-gray-300">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                </div>
              ))}
            </div>

            {scenario?.endpoints && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Endpoints:</div>
                <div className="flex flex-wrap gap-1">
                  {scenario?.endpoints?.map((endpoint, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                      {endpoint}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 bg-gray-800/30 rounded-lg p-4">
        <h4 className="font-semibold text-gray-300 mb-3">Environment Setup</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Test Environment:</div>
            <div className="text-green-300">{testSuite?.environmentSetup?.testEnvironment || 'staging-mirror'}</div>
          </div>
          <div>
            <div className="text-gray-400">K6 Version:</div>
            <div className="text-blue-300">{testSuite?.loadGenerators?.k6Version || '0.45.0'}</div>
          </div>
          <div>
            <div className="text-gray-400">Data Seeding:</div>
            <div className="text-purple-300">{testSuite?.environmentSetup?.dataSeeding ? 'Enabled' : 'Disabled'}</div>
          </div>
          <div>
            <div className="text-gray-400">Distributed Testing:</div>
            <div className="text-amber-300">{testSuite?.loadGenerators?.distributedTesting ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Performance Benchmarks Panel
const PerformanceBenchmarksPanel = ({ benchmarks }) => {
  const getBenchmarkColor = (benchmark) => {
    if (benchmark?.sloCompliant === true) return 'text-green-400';
    if (benchmark?.sloCompliant === false) return 'text-red-400';
    return 'text-gray-400';
  };

  const getBenchmarkBgColor = (benchmark) => {
    if (benchmark?.sloCompliant === true) return 'bg-green-900/20 border-green-500/30';
    if (benchmark?.sloCompliant === false) return 'bg-red-900/20 border-red-500/30';
    return 'bg-gray-800/50 border-gray-600/30';
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-blue-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <Target className="h-6 w-6" />
          Performance Benchmarks & SLO Targets
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-300">
            {benchmarks?.compliantTargets || 0}/{benchmarks?.sloTargets || 0} Compliant
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(benchmarks?.benchmarks || {})?.map(([key, benchmark]) => (
          <div key={key} className={`rounded-lg p-4 border ${getBenchmarkBgColor(benchmark)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${
                  benchmark?.sloCompliant === true ? 'bg-green-400' :
                  benchmark?.sloCompliant === false ? 'bg-red-400' : 'bg-gray-500'
                }`}></div>
                <div>
                  <h4 className="font-semibold text-gray-200 capitalize">
                    {key?.replace(/([A-Z])/g, ' $1')}
                  </h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Target: {benchmark?.target}</span>
                    {benchmark?.current && (
                      <span className={`text-sm font-medium ${getBenchmarkColor(benchmark)}`}>
                        Current: {benchmark?.current}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {benchmark?.critical && (
                <div className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded-lg border border-red-500/30">
                  CRITICAL
                </div>
              )}
            </div>

            {benchmark?.measurements && (
              <div className="grid md:grid-cols-2 gap-3">
                {benchmark?.measurements?.map((measurement, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{measurement?.endpoint || measurement?.component || measurement?.type || measurement?.metric}</span>
                      <span className="text-xs text-blue-300">{measurement?.target}</span>
                    </div>
                    {measurement?.weight && (
                      <div className="text-xs text-gray-500 mt-1">Weight: {(measurement?.weight * 100)?.toFixed(0)}%</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {benchmarks?.lastUpdate && (
        <div className="mt-6 text-center text-xs text-gray-400">
          Last updated: {new Date(benchmarks.lastUpdate)?.toLocaleString()}
        </div>
      )}
    </div>
  );
};

// Live Testing Dashboard
const LiveTestingDashboard = ({ liveResults }) => {
  const [selectedTest, setSelectedTest] = useState(null);

  // Mock performance data for charts
  const performanceData = [
    { time: '00:00', responseTime: 120, throughput: 850, errors: 0.1 },
    { time: '00:05', responseTime: 135, throughput: 920, errors: 0.2 },
    { time: '00:10', responseTime: 145, throughput: 1100, errors: 0.1 },
    { time: '00:15', responseTime: 160, throughput: 1250, errors: 0.3 },
    { time: '00:20', responseTime: 180, throughput: 1400, errors: 0.2 },
    { time: '00:25', responseTime: 195, throughput: 1350, errors: 0.4 },
    { time: '00:30', responseTime: 210, throughput: 1200, errors: 0.3 }
  ];

  if (liveResults?.status === 'no_tests') {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/20">
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Test Results Available</h3>
          <p className="text-gray-500">{liveResults?.recommendation}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Live Testing Dashboard
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-purple-300">
            Success Rate: {liveResults?.successRate || 0}%
          </div>
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
        </div>
      </div>
      {/* Real-time Performance Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-200 mb-4">Response Time & Throughput</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Response Time (ms)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="throughput" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Throughput (req/s)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-200 mb-4">Error Rate Monitoring</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Area 
                type="monotone" 
                dataKey="errors" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.3}
                name="Error Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Test Results Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{liveResults?.totalTests || 0}</div>
          <div className="text-sm text-gray-400">Total Tests</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{liveResults?.passedTests || 0}</div>
          <div className="text-sm text-gray-400">Passed Tests</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {liveResults?.aggregatedMetrics?.responseTimeP99 || 0}ms
          </div>
          <div className="text-sm text-gray-400">Avg P99 Latency</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {liveResults?.aggregatedMetrics?.requestsPerSecond || 0}
          </div>
          <div className="text-sm text-gray-400">Avg RPS</div>
        </div>
      </div>
      {/* Recent Test Results */}
      {liveResults?.results && liveResults?.results?.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-200">Recent Test Results</h4>
          {liveResults?.results?.slice(0, 5)?.map((result, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 rounded-lg p-4 cursor-pointer hover:bg-gray-700/50 transition-all"
              onClick={() => setSelectedTest(result)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${
                    result?.sloCompliance?.latency && result?.sloCompliance?.throughput && result?.sloCompliance?.errorRate
                      ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="font-medium text-gray-200">{result?.testName}</span>
                  <span className="text-xs text-gray-400 capitalize">({result?.scenario})</span>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(result.startTime)?.toLocaleTimeString()}
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">P99 Latency: </span>
                  <span className={result?.sloCompliance?.latency ? 'text-green-300' : 'text-red-300'}>
                    {result?.metrics?.responseTimeP99}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">RPS: </span>
                  <span className={result?.sloCompliance?.throughput ? 'text-green-300' : 'text-red-300'}>
                    {result?.metrics?.requestsPerSecond}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Error Rate: </span>
                  <span className={result?.sloCompliance?.errorRate ? 'text-green-300' : 'text-red-300'}>
                    {(result?.metrics?.errorRate * 100)?.toFixed(3)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Duration: </span>
                  <span className="text-blue-300">{Math.round(result?.duration / 60)}min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Bottleneck Analysis */}
      {liveResults?.bottleneckAnalysis && liveResults?.bottleneckAnalysis?.length > 0 && (
        <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Bottleneck Analysis
          </h4>
          <div className="space-y-2">
            {liveResults?.bottleneckAnalysis?.slice(0, 3)?.map((bottleneck, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-red-200">{bottleneck?.issue}</span>
                <span className="text-xs text-red-400 bg-red-900/50 px-2 py-1 rounded">
                  {bottleneck?.frequency} occurrences
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Production Readiness Assessment Panel
const ProductionReadinessAssessmentPanel = ({ readinessAssessment }) => {
  const getScoreColor = (score) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-blue-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 95) return 'bg-green-900/20 border-green-500/30';
    if (score >= 85) return 'bg-blue-900/20 border-blue-500/30';
    if (score >= 70) return 'bg-amber-900/20 border-amber-500/30';
    return 'bg-red-900/20 border-red-500/30';
  };

  const getCriteriaIcon = (status) => {
    if (status === 'passed') return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (status === 'failed') return <AlertTriangle className="h-4 w-4 text-red-400" />;
    return <div className="h-4 w-4 rounded-full bg-gray-500"></div>;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-amber-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Production Readiness Assessment
        </h3>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(readinessAssessment?.overallScore || 0)}`}>
            {readinessAssessment?.overallScore || 0}%
          </div>
          <div className="text-xs text-gray-400">Overall Score</div>
        </div>
      </div>
      {/* Readiness Level */}
      <div className={`rounded-lg p-4 mb-6 border ${getScoreBg(readinessAssessment?.overallScore || 0)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-200">Readiness Level</h4>
            <p className="text-sm text-gray-400 mt-1">
              {readinessAssessment?.readinessLevel?.level || 'NEEDS_WORK'}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            readinessAssessment?.readinessLevel?.color === 'green' ? 'bg-green-500/20' :
            readinessAssessment?.readinessLevel?.color === 'blue' ? 'bg-blue-500/20' :
            readinessAssessment?.readinessLevel?.color === 'yellow'? 'bg-amber-500/20' : 'bg-red-500/20'
          }`}>
            <TrendingUp className={`h-6 w-6 ${
              readinessAssessment?.readinessLevel?.color === 'green' ? 'text-green-400' :
              readinessAssessment?.readinessLevel?.color === 'blue' ? 'text-blue-400' :
              readinessAssessment?.readinessLevel?.color === 'yellow'? 'text-amber-400' : 'text-red-400'
            }`} />
          </div>
        </div>
      </div>
      {/* Assessment Categories */}
      <div className="space-y-4 mb-6">
        {readinessAssessment?.categories?.map((category, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-200">{category?.category}</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Weight: {(category?.weight * 100)}%</span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  category?.score >= 90 ? 'bg-green-900/50 text-green-300' :
                  category?.score >= 70 ? 'bg-amber-900/50 text-amber-300': 'bg-red-900/50 text-red-300'
                }`}>
                  {category?.score || 0}%
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {category?.criteria?.map((criterion, criterionIndex) => (
                <div key={criterionIndex} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCriteriaIcon(criterion?.status)}
                    <span className="text-sm text-gray-300">{criterion?.name}</span>
                    {criterion?.critical && (
                      <span className="text-xs bg-red-900/50 text-red-300 px-1 py-0.5 rounded">CRITICAL</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    criterion?.status === 'passed' ? 'bg-green-900/50 text-green-300' :
                    criterion?.status === 'failed'? 'bg-red-900/50 text-red-300' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {criterion?.status || 'not_tested'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Critical Issues */}
      {readinessAssessment?.criticalIssues && readinessAssessment?.criticalIssues?.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Critical Issues
          </h4>
          <div className="space-y-2">
            {readinessAssessment?.criticalIssues?.map((issue, index) => (
              <div key={index} className="text-sm text-red-200">• {issue?.name}</div>
            ))}
          </div>
        </div>
      )}
      {/* Go-Live Recommendation */}
      <div className={`rounded-lg p-4 border ${
        readinessAssessment?.goLiveRecommendation?.recommendation === 'GO_LIVE' ?'bg-green-900/20 border-green-500/30'
          : readinessAssessment?.goLiveRecommendation?.recommendation === 'GO_LIVE_WITH_MONITORING' ?'bg-blue-900/20 border-blue-500/30'
          : readinessAssessment?.goLiveRecommendation?.recommendation === 'STAGING_ONLY' ?'bg-amber-900/20 border-amber-500/30' :'bg-red-900/20 border-red-500/30'
      }`}>
        <h4 className="font-semibold text-gray-200 mb-2">Go-Live Recommendation</h4>
        <p className={`text-sm font-medium ${
          readinessAssessment?.goLiveRecommendation?.recommendation === 'GO_LIVE' ? 'text-green-300' :
          readinessAssessment?.goLiveRecommendation?.recommendation === 'GO_LIVE_WITH_MONITORING' ? 'text-blue-300' :
          readinessAssessment?.goLiveRecommendation?.recommendation === 'STAGING_ONLY'? 'text-amber-300' : 'text-red-300'
        }`}>
          {readinessAssessment?.goLiveRecommendation?.recommendation || 'NOT_READY'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {readinessAssessment?.goLiveRecommendation?.message}
        </p>
      </div>
    </div>
  );
};

// Main Component
export default function K6LoadTestingPerformanceCertificationCenter() {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await k6PerformanceService?.getPerformanceTestingSuite();
      
      if (response?.error) {
        setError(response?.error);
      } else {
        setPerformanceData(response?.data);
      }
    } catch (err) {
      setError(`Erreur de chargement: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTest = async (scenario) => {
    try {
      await k6PerformanceService?.executeK6Test(scenario?.name, scenario?.parameters);
      // Reload data to show updated test status
      await loadPerformanceData();
    } catch (err) {
      setError(`Erreur d'exécution du test: ${err?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-300">Chargement du Centre de Certification K6 Performance...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            K6 Load Testing & Performance Certification Center
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Validation complète des performances avec orchestration automatisée des tests K6, 
            vérification SLO et certification de production ready
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>
      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            <K6TestSuiteConfigurationPanel 
              testSuite={performanceData?.testSuite}
              onExecuteTest={handleExecuteTest}
            />
            <PerformanceBenchmarksPanel 
              benchmarks={performanceData?.benchmarks}
            />
          </div>

          {/* Center Column - Live Dashboard */}
          <div className="space-y-6">
            <LiveTestingDashboard 
              liveResults={performanceData?.liveResults}
            />
          </div>

          {/* Right Column - Assessment */}
          <div className="space-y-6">
            <ProductionReadinessAssessmentPanel 
              readinessAssessment={performanceData?.productionReadiness}
            />

            {/* SLO Compliance Status */}
            <div className="bg-gray-900 rounded-xl p-6 border border-cyan-500/20">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                SLO Compliance Status
              </h3>
              
              <div className="space-y-4">
                {performanceData?.sloCompliance?.sloTargets?.map((slo, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-200">{slo?.name}</span>
                      <div className={`h-2 w-2 rounded-full ${
                        slo?.compliant === true ? 'bg-green-400' :
                        slo?.compliant === false ? 'bg-red-400' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Target: {slo?.target}</span>
                      {slo?.current && (
                        <span className={slo?.compliant ? 'text-green-300' : 'text-red-300'}>
                          Current: {slo?.current}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 capitalize">
                      Trend: {slo?.trend}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300">Overall Compliance</span>
                  <span className={`text-lg font-bold ${
                    (performanceData?.sloCompliance?.compliancePercentage || 0) >= 95 ? 'text-green-400' :
                    (performanceData?.sloCompliance?.compliancePercentage || 0) >= 80 ? 'text-blue-400': 'text-amber-400'
                  }`}>
                    {performanceData?.sloCompliance?.compliancePercentage || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Certification Status */}
            <div className="bg-gray-900 rounded-xl p-6 border border-indigo-500/20">
              <h3 className="text-xl font-bold text-indigo-400 mb-4">Certification Status</h3>
              
              <div className={`rounded-lg p-4 border mb-4 ${
                performanceData?.certificationStatus?.level === 'CERTIFIED' ?'bg-green-900/20 border-green-500/30'
                  : performanceData?.certificationStatus?.level === 'PARTIAL' ?'bg-amber-900/20 border-amber-500/30' :'bg-red-900/20 border-red-500/30'
              }`}>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    performanceData?.certificationStatus?.color === 'green' ? 'text-green-400' :
                    performanceData?.certificationStatus?.color === 'amber'? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {performanceData?.certificationStatus?.level || 'NOT_READY'}
                  </div>
                  <p className="text-sm text-gray-300">
                    {performanceData?.certificationStatus?.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-400">
                    {performanceData?.overallScore || 0}%
                  </div>
                  <div className="text-xs text-gray-400">Overall Score</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-lg font-bold text-purple-400">
                    {performanceData?.sloCompliance?.compliantSLOs || 0}/{performanceData?.sloCompliance?.totalSLOs || 0}
                  </div>
                  <div className="text-xs text-gray-400">SLOs Met</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}