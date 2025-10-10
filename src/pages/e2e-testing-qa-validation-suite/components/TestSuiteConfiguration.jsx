import React, { useState } from 'react';
import { Settings, PlayCircle, TestTube2, Database, Shield, Zap, Globe } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function TestSuiteConfiguration({ onExecuteTest, qaValidationStatus }) {
  const [selectedEnvironment, setSelectedEnvironment] = useState('staging');
  const [selectedBrowser, setSelectedBrowser] = useState('chrome');
  const [parallelExecution, setParallelExecution] = useState(true);
  const [testConfiguration, setTestConfiguration] = useState({
    retryAttempts: 2,
    timeout: 30000,
    recordVideo: true,
    captureScreenshots: true,
    generateReport: true
  });

  const testSuites = [
    {
      id: 'cypressE2E',
      name: 'Cypress E2E Tests',
      icon: TestTube2,
      description: 'Comprehensive end-to-end testing including authentication flows, trading workflows, and UI interactions',
      estimatedTime: '15-20 min',
      testCases: [
        'User Authentication (Login/Signup/Logout)',
        'Dashboard Navigation & Display',
        'Trading Workflow Validation',
        'Portfolio Management Tests',
        'AI Agent Integration',
        'Real-time Data Updates',
        'Error Handling Scenarios'
      ]
    },
    {
      id: 'apiIntegration',
      name: 'API Integration Tests',
      icon: Database,
      description: 'Backend API validation, RLS policies testing, and data synchronization verification',
      estimatedTime: '10-12 min',
      testCases: [
        'Provider API Endpoints',
        'Supabase RLS Policies',
        'Data CRUD Operations',
        'Authentication Middleware',
        'Error Response Handling',
        'Rate Limiting Tests'
      ]
    },
    {
      id: 'webSocketValidation',
      name: 'WebSocket Tests',
      icon: Zap,
      description: 'Real-time WebSocket connectivity, quote updates, and bridge failover testing',
      estimatedTime: '8-10 min',
      testCases: [
        'Connection Establishment',
        'Real-time Quote Streaming',
        'Bridge Failover Scenarios',
        'Concurrent Connections',
        'Message Ordering',
        'Reconnection Logic'
      ]
    },
    {
      id: 'securityTesting',
      name: 'Security Validation',
      icon: Shield,
      description: 'OWASP ZAP security scans, SSL configuration, and authentication security testing',
      estimatedTime: '12-15 min',
      testCases: [
        'OWASP ZAP Baseline Scan',
        'SSL/TLS Configuration',
        'RLS Security Validation',
        'Authentication Security',
        'XSS/CSRF Protection',
        'API Security Headers'
      ]
    },
    {
      id: 'performanceBenchmarks',
      name: 'Performance Tests',
      icon: Globe,
      description: 'k6 performance testing, load validation, and SLO compliance verification',
      estimatedTime: '20-25 min',
      testCases: [
        'k6 HTTP Load Tests',
        'WebSocket Performance',
        'RAG Query Performance',
        'Database Performance',
        'SLO Compliance Check',
        'Stress Testing'
      ]
    }
  ];

  const handleExecuteTest = (suiteId) => {
    const config = {
      suiteId,
      environment: selectedEnvironment,
      browser: selectedBrowser,
      parallel: parallelExecution,
      ...testConfiguration
    };
    onExecuteTest?.(suiteId, config);
  };

  const getStatusColor = (status) => {
    switch (status?.status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'running': return 'text-yellow-600 dark:text-yellow-400';
      case 'failed': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
          Test Suite Configuration
        </h3>

        {/* Environment Configuration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test Environment
          </label>
          <select
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e?.target?.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="staging">Staging</option>
            <option value="production">Production</option>
            <option value="development">Development</option>
          </select>
        </div>

        {/* Browser Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Browser
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['chrome', 'firefox', 'edge']?.map((browser) => (
              <button
                key={browser}
                onClick={() => setSelectedBrowser(browser)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedBrowser === browser
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {browser?.charAt(0)?.toUpperCase() + browser?.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Options */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Parallel Execution
            </label>
            <button
              onClick={() => setParallelExecution(!parallelExecution)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                parallelExecution 
                  ? 'bg-purple-600' :'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                parallelExecution ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Test Suites */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Available Test Suites</h4>
          {testSuites?.map((suite) => {
            const Icon = suite?.icon;
            const status = qaValidationStatus?.[suite?.id];
            
            return (
              <div key={suite?.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">{suite?.name}</h5>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{suite?.estimatedTime}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                      {status?.status || 'ready'}
                    </span>
                    {status?.passRate > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {status?.passRate?.toFixed(1)}% pass rate
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {suite?.description}
                </p>
                
                <details className="mb-3">
                  <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400">
                    View Test Cases ({suite?.testCases?.length})
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {suite?.testCases?.map((testCase, index) => (
                      <li key={index} className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                        • {testCase}
                      </li>
                    ))}
                  </ul>
                </details>

                <button
                  onClick={() => handleExecuteTest(suite?.id)}
                  disabled={status?.status === 'running'}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {status?.status === 'running' ? 'Running...' : 'Execute Test Suite'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}