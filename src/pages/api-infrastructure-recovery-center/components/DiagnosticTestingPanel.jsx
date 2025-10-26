import React, { useState } from 'react';
import { Activity, CheckCircle, Clock, XCircle, RefreshCw, Terminal } from 'lucide-react';

export default function DiagnosticTestingPanel({ diagnosticsResults, diagnosticsRunning, onRunDiagnostics }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-400 bg-green-900/20 border-green-700/50';
      case 'error':
        return 'text-red-400 bg-red-900/20 border-red-700/50';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700/50';
    }
  };

  const formatResponseTime = (time) => {
    if (time < 100) return `${time}ms (Excellent)`;
    if (time < 500) return `${time}ms (Good)`;
    if (time < 1000) return `${time}ms (Slow)`;
    return `${time}ms (Very Slow)`;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Diagnostic Testing</h3>
        </div>
        <button
          onClick={onRunDiagnostics}
          disabled={diagnosticsRunning}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
        >
          {diagnosticsRunning ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Terminal className="w-4 h-4 mr-2" />
          )}
          {diagnosticsRunning ? 'Testing...' : 'Run Tests'}
        </button>
      </div>
      {/* Results Summary */}
      {diagnosticsResults && !diagnosticsResults?.error && (
        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-gray-700">
          <h4 className="text-sm font-medium text-white mb-3">Test Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{diagnosticsResults?.summary?.successful}</div>
              <div className="text-xs text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{diagnosticsResults?.summary?.failed}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{diagnosticsResults?.summary?.total}</div>
              <div className="text-xs text-gray-400">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{diagnosticsResults?.summary?.averageResponseTime}ms</div>
              <div className="text-xs text-gray-400">Avg Response</div>
            </div>
          </div>
        </div>
      )}
      {/* Error Display */}
      {diagnosticsResults && diagnosticsResults?.error && (
        <div className="mb-6 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <h4 className="text-sm font-medium text-red-300">Diagnostics Failed</h4>
          </div>
          <p className="text-sm text-red-200">{diagnosticsResults?.message}</p>
        </div>
      )}
      {/* Individual Test Results */}
      {diagnosticsResults && diagnosticsResults?.results && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Endpoint Tests</h4>
          {diagnosticsResults?.results?.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedEndpoint === index 
                  ? 'bg-slate-700/50 border-purple-500' 
                  : `${getStatusColor(result?.status)}`
              }`}
              onClick={() => setSelectedEndpoint(selectedEndpoint === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result?.status)}
                  <div>
                    <div className="font-medium text-white">{result?.name}</div>
                    <div className="text-xs text-gray-400">{result?.endpoint}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {formatResponseTime(result?.responseTime)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(result.timestamp)?.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedEndpoint === index && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  {result?.status === 'success' ? (
                    <div>
                      <h5 className="text-sm font-medium text-green-300 mb-2">Response Data:</h5>
                      <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                        <pre className="text-xs text-gray-300">
                          <code>{JSON.stringify(result?.data, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h5 className="text-sm font-medium text-red-300 mb-2">Error Details:</h5>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <pre className="text-xs text-red-300">
                          <code>{result?.error}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Default State */}
      {!diagnosticsResults && !diagnosticsRunning && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">Ready for Diagnostics</h4>
          <p className="text-sm text-gray-500">
            Run comprehensive tests to verify all API endpoints are responding correctly
          </p>
        </div>
      )}
      {/* Running State */}
      {diagnosticsRunning && (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <h4 className="text-lg font-medium text-purple-300 mb-2">Running Diagnostics</h4>
          <p className="text-sm text-gray-400">
            Testing all API endpoints for connectivity and response times...
          </p>
        </div>
      )}
      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
        <div className="flex items-center space-x-2 mb-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">Quick Health Check</span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Manual test: <code className="bg-gray-800 px-1 rounded">curl https://trading-mvp.com/api/health</code></div>
          <div>Local test: <code className="bg-gray-800 px-1 rounded">curl http://127.0.0.1:8001/health</code></div>
        </div>
      </div>
    </div>
  );
}