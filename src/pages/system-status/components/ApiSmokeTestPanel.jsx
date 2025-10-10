import { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, Activity, AlertTriangle } from 'lucide-react';
import { smokeTestService } from '../../../services/smokeTestService';

export default function ApiSmokeTestPanel() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState('all');

  const runSmokeTests = async () => {
    setIsRunning(true);
    setTestResults(null);

    try {
      const results = await smokeTestService?.runAllTests();
      setTestResults(results);
      
      // Show toast notifications for each test
      results?.results?.forEach(result => {
        showToast(result?.status, result?.name, result?.error);
      });
    } catch (error) {
      console.error('Smoke test failed:', error);
      showToast('KO', 'Smoke Test', error?.message);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async (endpoint) => {
    setIsRunning(true);
    
    try {
      const result = await smokeTestService?.testSingleEndpoint(endpoint);
      const testName = endpoint?.replace('/scores?window=5', 'Scores')?.replace('/status', 'Status')?.replace('/select', 'Selected');
      showToast(result?.status, testName, result?.error);
    } catch (error) {
      showToast('KO', 'Single Test', error?.message);
    } finally {
      setIsRunning(false);
    }
  };

  const showToast = (status, testName, error) => {
    const toastId = `toast-${Date.now()}`;
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      status === 'OK' ?'bg-green-100 border border-green-300 text-green-800' :'bg-red-100 border border-red-300 text-red-800'
    }`;
    
    toastElement.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="flex-shrink-0">
          ${status === 'OK' ?'<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
            : '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
          }
        </div>
        <div class="flex-1">
          <div class="font-medium">${status} - ${testName}</div>
          ${error ? `<div class="text-sm opacity-75">${error}</div>` : ''}
        </div>
      </div>
    `;

    document.body?.appendChild(toastElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.getElementById(toastId)) {
        document.body?.removeChild(toastElement);
      }
    }, 5000);

    // Add click to dismiss
    toastElement?.addEventListener('click', () => {
      if (document.getElementById(toastId)) {
        document.body?.removeChild(toastElement);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            API Smoke Tests
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Production API endpoint validation
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={runSmokeTests}
            disabled={isRunning}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Play className="h-4 w-4 mr-1" />
            {isRunning ? 'Running...' : 'Run All Tests'}
          </button>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runSingleTest('/status')}
            disabled={isRunning}
            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 disabled:opacity-50"
          >
            Test /status
          </button>
          <button
            onClick={() => runSingleTest('/scores?window=5')}
            disabled={isRunning}
            className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full hover:bg-purple-200 disabled:opacity-50"
          >
            Test /scores?window=5
          </button>
          <button
            onClick={() => runSingleTest('/select')}
            disabled={isRunning}
            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50"
          >
            Test /select
          </button>
        </div>
      </div>
      {/* Test Results */}
      {testResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{testResults?.totalTests}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{testResults?.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{testResults?.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{testResults?.averageLatency}ms</div>
              <div className="text-sm text-gray-600">Avg Latency</div>
            </div>
          </div>

          <div className="space-y-2">
            {testResults?.results?.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result?.status === 'OK' ?'bg-green-50 border-green-200' :'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result?.status === 'OK' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{result?.name}</div>
                    <div className="text-sm text-gray-600">{result?.endpoint}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {result?.latency}ms
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded ${
                    result?.status === 'OK' ?'bg-green-100 text-green-800' :'bg-red-100 text-red-800'
                  }`}>
                    {result?.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {testResults?.failed > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Some tests failed</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    Check if the API server is running on https://api.trading-mvp.com
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {isRunning && (
        <div className="flex items-center justify-center py-8">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Running smoke tests...</span>
          </div>
        </div>
      )}
    </div>
  );
}