import React, { useState } from 'react';
import { Monitor, Activity, CheckCircle, XCircle, Clock, Camera, FileText, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function LiveTestingDashboard({ activeTests, testResults, systemHealth }) {
  const [selectedTest, setSelectedTest] = useState(null);
  const [viewMode, setViewMode] = useState('current'); // current, history, metrics

  // Generate mock metrics data
  const metricsData = [
    { time: '10:00', passed: 45, failed: 3, coverage: 85 },
    { time: '10:30', passed: 52, failed: 2, coverage: 87 },
    { time: '11:00', passed: 48, failed: 4, coverage: 83 },
    { time: '11:30', passed: 58, failed: 1, coverage: 92 },
    { time: '12:00', passed: 55, failed: 2, coverage: 89 },
    { time: '12:30', passed: 62, failed: 1, coverage: 94 }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProgressColor = (progress, status) => {
    if (status === 'failed') return 'bg-red-500';
    if (status === 'completed') return 'bg-green-500';
    return 'bg-purple-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Monitor className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-2" />
            Live Testing Dashboard
          </h3>
          <div className="flex space-x-2">
            {['current', 'history', 'metrics']?.map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' :'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {mode?.charAt(0)?.toUpperCase() + mode?.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Test Execution Status */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTests?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Tests</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {testResults?.filter(t => t?.status === 'completed')?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {testResults?.filter(t => t?.results?.failed > 0)?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {testResults?.length > 0 
                ? (testResults?.reduce((acc, t) => acc + (t?.results?.coverage || 0), 0) / testResults?.length)?.toFixed(1)
                : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Coverage</div>
          </div>
        </div>

        {/* Dynamic Content Based on View Mode */}
        {viewMode === 'current' && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Running Tests ({activeTests?.length})
            </h4>
            {activeTests?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tests currently running</p>
                <p className="text-sm">Execute a test suite to see live progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTests?.map((test) => (
                  <div key={test?.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(test?.status)}
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {test?.type?.replace(/([A-Z])/g, ' $1')?.trim()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {test?.progress}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(test?.progress, test?.status)}`}
                        style={{ width: `${test?.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Current Phase: {test?.currentPhase || 'Initializing...'}
                    </div>
                    
                    {test?.testCases?.length > 0 && (
                      <div className="mt-3 max-h-32 overflow-y-auto">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recent Test Cases:</p>
                        {test?.testCases?.slice(-3)?.map((testCase, index) => (
                          <div key={index} className="flex items-center justify-between text-xs py-1">
                            <span className="text-gray-600 dark:text-gray-400">{testCase?.name}</span>
                            <div className="flex items-center space-x-2">
                              {testCase?.status === 'passed' ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                              <span className="text-gray-500">{testCase?.duration}ms</span>
                              {testCase?.screenshot && (
                                <Camera className="h-3 w-3 text-blue-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'history' && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Test Results History ({testResults?.length})
            </h4>
            {testResults?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test results available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults?.map((result) => (
                  <div key={result?.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(result?.status)}
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {result?.type?.replace(/([A-Z])/g, ' $1')?.trim()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {result?.endTime ? new Date(result?.endTime)?.toLocaleTimeString() : 'In Progress'}
                      </span>
                    </div>
                    
                    {result?.results && (
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {result?.results?.passed}
                          </div>
                          <div className="text-xs text-gray-500">Passed</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            {result?.results?.failed}
                          </div>
                          <div className="text-xs text-gray-500">Failed</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {result?.results?.totalTests}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {result?.results?.coverage?.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Coverage</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'metrics' && (
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Testing Metrics & Trends
            </h4>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pass/Fail Trends</h5>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="passed" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Test Coverage Over Time</h5>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="coverage" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}