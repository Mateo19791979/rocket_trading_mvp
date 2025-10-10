import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Server, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import TestSuiteConfiguration from './components/TestSuiteConfiguration';
import LiveTestingDashboard from './components/LiveTestingDashboard';
import ProductionReadinessAssessment from './components/ProductionReadinessAssessment';

export default function PerformanceTestingCommandCenter() {
  const [activeTests, setActiveTests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    k6Available: true,
    redisConnected: true,
    apiEndpoints: {
      providers: { status: 'healthy', latency: 245 },
      quotes: { status: 'healthy', latency: 156 },
      websocket: { status: 'healthy', latency: 89 },
      rag: { status: 'healthy', latency: 423 }
    }
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    currentThroughput: 1247,
    avgLatency: 285,
    errorRate: 0.8,
    activeConnections: 423,
    sloCompliance: 94.2
  });

  useEffect(() => {
    // Simulate real-time performance updates
    const interval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        ...prev,
        currentThroughput: 1200 + Math.floor(Math.random() * 200),
        avgLatency: 250 + Math.floor(Math.random() * 100),
        errorRate: Math.random() * 2,
        activeConnections: 400 + Math.floor(Math.random() * 100),
        sloCompliance: 92 + Math.random() * 6
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runTestSuite = async (testConfig) => {
    const newTest = {
      id: Date.now(),
      name: testConfig?.name,
      type: testConfig?.type,
      status: 'running',
      startTime: new Date(),
      progress: 0,
      currentMetrics: {
        throughput: 0,
        latency: 0,
        errors: 0
      }
    };

    setActiveTests(prev => [...prev, newTest]);

    // Simulate test execution
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveTests(prev => 
        prev?.map(test => 
          test?.id === newTest?.id 
            ? { 
                ...test, 
                progress: i,
                currentMetrics: {
                  throughput: Math.floor(Math.random() * 2000),
                  latency: Math.floor(Math.random() * 500),
                  errors: Math.floor(Math.random() * 10)
                }
              }
            : test
        )
      );
    }

    // Complete test
    setActiveTests(prev => 
      prev?.map(test => 
        test?.id === newTest?.id 
          ? { ...test, status: 'completed', progress: 100 }
          : test
      )
    );

    // Add to results
    setTestResults(prev => [...prev, {
      ...newTest,
      status: 'completed',
      endTime: new Date(),
      results: {
        avgThroughput: 1456,
        p95Latency: 423,
        errorRate: 1.2,
        sloMet: true
      }
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Performance Testing Command Center
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  k6 Performance Testing Orchestration & Real-time SLO Validation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  k6 Ready
                </div>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <Server className="h-4 w-4 mr-1" />
                  Redis Connected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Performance Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Throughput</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics?.currentThroughput?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">req/s</p>
              </div>
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Latency</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics?.avgLatency}ms
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">p95 target: 700ms</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics?.errorRate?.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">target: {'<'}2%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connections</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics?.activeConnections}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">active</p>
              </div>
              <Server className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SLO Compliance</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {performanceMetrics?.sloCompliance?.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">target: 95%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Test Suite Configuration */}
          <div className="lg:col-span-1">
            <TestSuiteConfiguration 
              onRunTest={runTestSuite}
              systemStatus={systemStatus}
            />
          </div>

          {/* Center Column - Live Testing Dashboard */}
          <div className="lg:col-span-1">
            <LiveTestingDashboard 
              activeTests={activeTests}
              testResults={testResults}
              performanceMetrics={performanceMetrics}
            />
          </div>

          {/* Right Column - Production Readiness Assessment */}
          <div className="lg:col-span-1">
            <ProductionReadinessAssessment 
              testResults={testResults}
              systemStatus={systemStatus}
              performanceMetrics={performanceMetrics}
            />
          </div>
        </div>
      </div>
    </div>
  );
}