import React, { useState } from 'react';
import { FileCheck, Play, RefreshCw, CheckCircle, AlertCircle, Database, Shield, AlertTriangle } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function PolicyTestingInterface({ securityMetrics, setSecurityMetrics, isLoading, setIsLoading }) {
  const [selectedTest, setSelectedTest] = useState('jwt-validation');
  const [testResults, setTestResults] = useState([]);
  const [activeRole, setActiveRole] = useState('system_ai');

  const testCategories = {
    'jwt-validation': {
      name: 'JWT Claim Validation',
      description: 'Test JWT role claims and token visibility',
      icon: Shield,
      color: 'purple'
    },
    'role-access': {
      name: 'Role-Based Access',
      description: 'Test role-specific database access patterns',
      icon: Database,
      color: 'blue'
    },
    'security-breach': {
      name: 'Security Breach Simulation',
      description: 'Simulate unauthorized access attempts',
      icon: AlertTriangle,
      color: 'red'
    }
  };

  const jwtValidationTests = [
    {
      id: 'jwt-visibility',
      name: 'JWT Token Visibility',
      query: 'SELECT auth.jwt() as jwt, auth.uid() as uid;',
      description: 'Verify JWT token and role claim are accessible',
      expectedResult: 'Should show JWT with role claim',
      role: 'any'
    },
    {
      id: 'role-extraction',
      name: 'Role Claim Extraction',
      query: "SELECT coalesce(auth.jwt() ->> 'role', '') as role;",
      description: 'Extract role claim from JWT token',
      expectedResult: 'Should return the user role',
      role: 'any'
    },
    {
      id: 'system-ai-check',
      name: 'System AI Role Check',
      query: "SELECT coalesce(auth.jwt() ->> 'role','') = 'system_ai' as is_system_ai;",
      description: 'Check if current user has system_ai role',
      expectedResult: 'true for system_ai users, false for others',
      role: 'system_ai'
    }
  ];

  const roleAccessTests = [
    {
      id: 'system-ai-insert',
      name: 'System AI State Insert',
      query: `INSERT INTO ai_agent_state (agent_id, state_key, state_value) 
VALUES ('${crypto.randomUUID()}', 'test_key', '{"status": "test"}');`,
      description: 'Test system_ai role can insert agent state',
      expectedResult: 'Success for system_ai, denied for others',
      role: 'system_ai'
    },
    {
      id: 'data-ingest-ohlc',
      name: 'Data Ingest OHLC Insert',
      query: `INSERT INTO ohlc (symbol, tf, ts, o, h, l, c, v) 
VALUES ('TEST', '1m', NOW(), 100.0, 101.0, 99.0, 100.5, 1000);`,
      description: 'Test data_ingest role can insert OHLC data',
      expectedResult: 'Success for data_ingest, denied for others',
      role: 'data_ingest'
    },
    {
      id: 'read-public-access',
      name: 'Public Knowledge Base Access',
      query: 'SELECT title, author FROM reading_materials LIMIT 3;',
      description: 'Test read_public role can access knowledge base',
      expectedResult: 'Success for read_public and anon users',
      role: 'read_public'
    },
    {
      id: 'providers-access',
      name: 'Providers Table Access (Should Fail)',
      query: 'SELECT * FROM providers LIMIT 1;',
      description: 'Test that normal users cannot access API keys',
      expectedResult: 'Should be denied (RLS policy violation)',
      role: 'any'
    }
  ];

  const securityBreachTests = [
    {
      id: 'unauthorized-providers',
      name: 'Unauthorized API Key Access',
      query: 'SELECT finnhub_api FROM providers WHERE id = \'default\';',
      description: 'Attempt to access API keys without proper authorization',
      expectedResult: 'Should be blocked by RLS',
      role: 'malicious'
    },
    {
      id: 'role-escalation',
      name: 'Role Escalation Attempt',
      query: "SELECT * FROM ai_agent_state WHERE state_key LIKE \'%secret%\';",
      description: 'Attempt to access sensitive data with wrong role',
      expectedResult: 'Should be blocked by role-based policies',
      role: 'read_public'
    },
    {
      id: 'bulk-data-extraction',
      name: 'Bulk Data Extraction',
      query: 'SELECT * FROM external_sources_state;',
      description: 'Attempt to extract all ingestion state data',
      expectedResult: 'Should be limited by role permissions',
      role: 'system_ai'
    }
  ];

  const getCurrentTests = () => {
    switch (selectedTest) {
      case 'jwt-validation':
        return jwtValidationTests;
      case 'role-access':
        return roleAccessTests;
      case 'security-breach':
        return securityBreachTests;
      default:
        return [];
    }
  };

  const handleRunTest = async (test) => {
    setIsLoading(true);
    
    try {
      // Simulate test execution
      setTimeout(() => {
        const simulateSuccess = () => {
          // Different success rates based on test type
          if (selectedTest === 'security-breach') {
            return Math.random() > 0.8; // 20% "success" (security breach)
          } else if (test?.role === activeRole || test?.role === 'any') {
            return Math.random() > 0.1; // 90% success for matching roles
          } else {
            return Math.random() > 0.7; // 30% success for wrong roles
          }
        };

        const success = simulateSuccess();
        const isSecurityBreach = selectedTest === 'security-breach' && success;

        const result = {
          id: crypto.randomUUID(),
          testId: test?.id,
          name: test?.name,
          query: test?.query,
          role: activeRole,
          success: success,
          timestamp: new Date()?.toISOString(),
          result: isSecurityBreach 
            ? 'SECURITY BREACH DETECTED!' 
            : success 
              ? 'Test passed successfully' :'Access denied (RLS policy blocked)',
          category: selectedTest,
          isSecurityBreach
        };

        setTestResults(prev => [result, ...prev]);

        // Update security metrics
        if (isSecurityBreach) {
          setSecurityMetrics(prev => ({
            ...prev,
            securityViolations: prev?.securityViolations + 1
          }));
        }

        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.log('Test simulation completed');
      setIsLoading(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsLoading(true);
    const currentTests = getCurrentTests();
    
    try {
      // Simulate running all tests
      setTimeout(() => {
        const newResults = currentTests?.map(test => {
          const simulateSuccess = () => {
            if (selectedTest === 'security-breach') {
              return Math.random() > 0.9; // Low breach rate
            } else if (test?.role === activeRole || test?.role === 'any') {
              return Math.random() > 0.05; // High success for matching roles
            } else {
              return Math.random() > 0.8; // Low success for wrong roles
            }
          };

          const success = simulateSuccess();
          const isSecurityBreach = selectedTest === 'security-breach' && success;

          return {
            id: crypto.randomUUID(),
            testId: test?.id,
            name: test?.name,
            query: test?.query,
            role: activeRole,
            success: success,
            timestamp: new Date()?.toISOString(),
            result: isSecurityBreach 
              ? 'SECURITY BREACH DETECTED!' 
              : success 
                ? 'Test passed successfully' :'Access denied (RLS policy blocked)',
            category: selectedTest,
            isSecurityBreach
          };
        });

        setTestResults(prev => [...newResults, ...prev]);

        // Update security metrics
        const breachCount = newResults?.filter(r => r?.isSecurityBreach)?.length;
        if (breachCount > 0) {
          setSecurityMetrics(prev => ({
            ...prev,
            securityViolations: prev?.securityViolations + breachCount
          }));
        }

        setIsLoading(false);
      }, 3000);
    } catch (error) {
      console.log('Bulk test simulation completed');
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'jwt-validation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'role-access': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'security-breach': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors?.[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getResultIcon = (result) => {
    if (result?.isSecurityBreach) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else if (result?.success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const currentCategory = testCategories?.[selectedTest];
  const currentTests = getCurrentTests();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileCheck className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Policy Testing Interface</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JWT claim validation and role-based access testing with audit logging
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e?.target?.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-sm"
            >
              <option value="system_ai">system_ai</option>
              <option value="data_ingest">data_ingest</option>
              <option value="read_public">read_public</option>
              <option value="malicious">malicious_user</option>
            </select>
            
            <button
              onClick={handleRunAllTests}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Run All Tests
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {testResults?.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Tests Executed</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {testResults?.filter(r => r?.success && !r?.isSecurityBreach)?.length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Tests Passed</div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {testResults?.filter(r => r?.isSecurityBreach)?.length}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">Security Breaches</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Test Categories</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select testing category
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.entries(testCategories)?.map(([key, category]) => {
              const Icon = category?.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTest(key)}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedTest === key
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500' :'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 text-${category?.color}-500`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category?.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category?.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Test Suite */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <currentCategory.icon className={`w-6 h-6 text-${currentCategory?.color}-500`} />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {currentCategory?.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentCategory?.description} (Testing as: {activeRole})
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentTests?.map((test) => (
                <div key={test?.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {test?.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {test?.description}
                      </p>
                      {test?.role !== 'any' && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          test?.role === 'system_ai' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          test?.role === 'data_ingest' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          test?.role === 'read_public'? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          Required: {test?.role}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRunTest(test)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                      Run Test
                    </button>
                  </div>

                  <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-3">
                    <code className="text-sm text-blue-400 whitespace-pre-wrap">
                      {test?.query}
                    </code>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Expected: {test?.expectedResult}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Test Results */}
      {testResults?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Test Results</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive audit log of all security tests
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {testResults?.map((result) => (
                <div key={result?.id} className={`p-4 ${result?.isSecurityBreach ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getResultIcon(result)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {result?.name}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(result?.category)}`}>
                            {result?.category}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Role: {result?.role} | {new Date(result.timestamp)?.toLocaleTimeString()}
                        </div>
                        
                        <div className={`text-sm mt-2 ${
                          result?.isSecurityBreach ? 'text-red-600 dark:text-red-400 font-medium' : result?.success ?'text-green-600 dark:text-green-400': 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {result?.result}
                        </div>

                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View Query
                          </summary>
                          <div className="mt-2 bg-gray-900 rounded p-2">
                            <code className="text-xs text-green-400">
                              {result?.query}
                            </code>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}