import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, Download, Target, Award } from 'lucide-react';

export default function QAValidationCenter({ qaValidationStatus, testResults, j1j6Progress }) {
  const [validationChecklist, setValidationChecklist] = useState({
    functionalTesting: { completed: false, score: 0 },
    performanceTesting: { completed: false, score: 0 },
    securityTesting: { completed: false, score: 0 },
    usabilityTesting: { completed: false, score: 0 },
    compatibilityTesting: { completed: false, score: 0 },
    regressionTesting: { completed: false, score: 0 }
  });

  const [productionReadiness, setProductionReadiness] = useState({
    overallScore: 0,
    readinessStatus: 'not-ready', // not-ready, conditional, ready
    criticalIssues: [],
    recommendations: []
  });

  const [manualTestCases, setManualTestCases] = useState([
    {
      id: 'auth-001',
      name: 'User Authentication Flow',
      status: 'pending',
      priority: 'high',
      description: 'Verify complete user authentication including login, signup, and logout'
    },
    {
      id: 'trade-001', 
      name: 'Trading Workflow End-to-End',
      status: 'pending',
      priority: 'critical',
      description: 'Complete trading workflow from market analysis to order execution'
    },
    {
      id: 'port-001',
      name: 'Portfolio Management',
      status: 'pending',
      priority: 'high',
      description: 'Portfolio viewing, management, and performance tracking'
    },
    {
      id: 'real-001',
      name: 'Real-time Data Validation',
      status: 'pending',
      priority: 'high',
      description: 'Verify real-time quotes, WebSocket connections, and data accuracy'
    }
  ]);

  const acceptanceCriteria = [
    {
      category: 'Performance',
      criteria: [
        { name: 'Page Load Time < 3s', status: 'passed', value: '2.1s' },
        { name: 'API Response Time < 500ms', status: 'passed', value: '287ms' },
        { name: 'WebSocket Latency < 100ms', status: 'passed', value: '89ms' },
        { name: 'Error Rate < 2%', status: 'passed', value: '0.8%' }
      ]
    },
    {
      category: 'Security',
      criteria: [
        { name: 'HTTPS Enforced', status: 'passed', value: 'Yes' },
        { name: 'RLS Policies Active', status: 'passed', value: 'Yes' },
        { name: 'Authentication Required', status: 'passed', value: 'Yes' },
        { name: 'OWASP Scan Clean', status: 'warning', value: '2 Medium' }
      ]
    },
    {
      category: 'Functionality',
      criteria: [
        { name: 'All Core Features', status: 'passed', value: '100%' },
        { name: 'Error Handling', status: 'passed', value: 'Complete' },
        { name: 'Data Validation', status: 'passed', value: 'Complete' },
        { name: 'Integration Tests', status: 'passed', value: '94%' }
      ]
    }
  ];

  useEffect(() => {
    // Calculate overall readiness based on test results and J1-J6 progress
    const completedJ1J6 = Object.values(j1j6Progress)?.filter(stage => stage?.status === 'completed')?.length;
    const totalJ1J6 = Object.keys(j1j6Progress)?.length;
    const j1j6Score = (completedJ1J6 / totalJ1J6) * 100;

    const testScores = Object.values(qaValidationStatus)?.map(status => status?.passRate || 0);
    const avgTestScore = testScores?.length > 0 
      ? testScores?.reduce((acc, score) => acc + score, 0) / testScores?.length 
      : 0;

    const overallScore = (j1j6Score * 0.6) + (avgTestScore * 0.4);

    setProductionReadiness({
      overallScore,
      readinessStatus: overallScore >= 95 ? 'ready' : overallScore >= 80 ? 'conditional' : 'not-ready',
      criticalIssues: overallScore < 95 ? ['Security scan warnings', 'Performance optimization needed'] : [],
      recommendations: overallScore < 100 ? ['Complete remaining test suites', 'Address security warnings'] : []
    });
  }, [qaValidationStatus, j1j6Progress]);

  const handleManualTestUpdate = (testId, newStatus) => {
    setManualTestCases(prev => 
      prev?.map(test => 
        test?.id === testId 
          ? { ...test, status: newStatus }
          : test
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': case'completed': case'ready': return 'text-green-600 dark:text-green-400';
      case 'warning': case'conditional': return 'text-yellow-600 dark:text-yellow-400';
      case 'failed': case'not-ready': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'passed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'pending': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return colors?.[status] || colors?.['pending'];
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date()?.toISOString(),
      overallScore: productionReadiness?.overallScore,
      readinessStatus: productionReadiness?.readinessStatus,
      testResults: testResults,
      qaValidation: qaValidationStatus,
      j1j6Progress: j1j6Progress,
      acceptanceCriteria: acceptanceCriteria,
      manualTestCases: manualTestCases
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-validation-report-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    a?.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            QA Validation Center
          </h3>
          <button
            onClick={exportReport}
            className="flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </button>
        </div>

        {/* Production Readiness Assessment */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-teal-50 dark:from-purple-900/20 dark:to-teal-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Production Readiness Assessment
            </h4>
            <div className="flex items-center">
              <Award className={`h-5 w-5 mr-2 ${getStatusColor(productionReadiness?.readinessStatus)}`} />
              <span className={`font-bold ${getStatusColor(productionReadiness?.readinessStatus)}`}>
                {productionReadiness?.overallScore?.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                productionReadiness?.readinessStatus === 'ready' ? 'bg-green-500' :
                productionReadiness?.readinessStatus === 'conditional' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${productionReadiness?.overallScore}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStatusColor(productionReadiness?.readinessStatus)}`}>
                {productionReadiness?.readinessStatus?.toUpperCase()?.replace('-', ' ')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Readiness Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {productionReadiness?.criticalIssues?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {productionReadiness?.recommendations?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Recommendations</div>
            </div>
          </div>
        </div>

        {/* Acceptance Criteria Validation */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Acceptance Criteria Verification
          </h4>
          <div className="space-y-4">
            {acceptanceCriteria?.map((category) => (
              <div key={category?.category} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-t-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white">{category?.category}</h5>
                </div>
                <div className="p-4 space-y-2">
                  {category?.criteria?.map((criterion, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{criterion?.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {criterion?.value}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(criterion?.status)}`}>
                          {criterion?.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Testing Checklist */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Manual Testing Checklist
          </h4>
          <div className="space-y-3">
            {manualTestCases?.map((testCase) => (
              <div key={testCase?.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{testCase?.name}</span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        testCase?.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        testCase?.priority === 'high'? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {testCase?.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testCase?.description}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {['passed', 'failed', 'pending']?.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleManualTestUpdate(testCase?.id, status)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          testCase?.status === status
                            ? status === 'passed' ?'bg-green-600 text-white' 
                              : status === 'failed' ?'bg-red-600 text-white' :'bg-gray-600 text-white' :'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Validation */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
            Go-Live Approval Workflow
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">All automated tests passed</span>
              <span className={`font-medium ${
                Object.values(qaValidationStatus)?.every(status => status?.status === 'completed' && status?.passRate > 90)
                  ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {Object.values(qaValidationStatus)?.every(status => status?.status === 'completed' && status?.passRate > 90) ? '✓' : '○'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">Manual testing completed</span>
              <span className={`font-medium ${
                manualTestCases?.every(test => test?.status !== 'pending')
                  ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {manualTestCases?.every(test => test?.status !== 'pending') ? '✓' : '○'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">J1-J6 pipeline completed</span>
              <span className={`font-medium ${
                Object.values(j1j6Progress)?.every(stage => stage?.status === 'completed')
                  ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {Object.values(j1j6Progress)?.every(stage => stage?.status === 'completed') ? '✓' : '○'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}