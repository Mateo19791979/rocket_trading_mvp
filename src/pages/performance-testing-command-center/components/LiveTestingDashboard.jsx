import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, AlertCircle, CheckCircle, Zap, TrendingUp } from 'lucide-react';

export default function LiveTestingDashboard({ activeTests, testResults, performanceMetrics }) {
  // Generate mock time series data for charts
  const generateTimeSeriesData = () => {
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => ({
      time: new Date(now - (19 - i) * 5000)?.toLocaleTimeString(),
      throughput: 1000 + Math.floor(Math.random() * 500),
      latency: 200 + Math.floor(Math.random() * 200),
      errors: Math.floor(Math.random() * 20)
    }));
  };

  const timeSeriesData = generateTimeSeriesData();

  const recentTests = testResults?.slice(-5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Live Testing Dashboard
          </h3>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Active Tests */}
        {activeTests?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Running Tests
            </h4>
            {activeTests?.map((test) => (
              <div
                key={test?.id}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {test?.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {test?.progress}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${test?.progress}%` }}
                  ></div>
                </div>

                {test?.currentMetrics && (
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Throughput</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {test?.currentMetrics?.throughput} req/s
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Latency</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {test?.currentMetrics?.latency}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Errors</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {test?.currentMetrics?.errors}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Real-time Performance Charts */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Real-time Metrics
          </h4>

          {/* Throughput Chart */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Throughput (req/s)
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="throughput" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latency Chart */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Response Time (ms)
              </span>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SLO Compliance Tracking */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              SLO Compliance Status
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Provider Health
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                p95 {'<'} 800ms: ✓
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Errors {'<'} 1%: ✓
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Quotes HTTP
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                p95 {'<'} 700ms: ✓
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Throughput {'>'} 1000 req/s: ✓
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-1" />
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  WebSocket Bridge
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Clients {'>'} 1000: ⚠
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Loss {'<'} 0.1%: ✓
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  RAG Search
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                p95 {'<'} 900ms: ✓
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Errors {'<'} 2%: ✓
              </p>
            </div>
          </div>
        </div>

        {/* Recent Test Results */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Test Results
          </h4>
          
          {recentTests?.length > 0 ? (
            <div className="space-y-2">
              {recentTests?.map((test) => (
                <div
                  key={test?.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center">
                    {test?.results?.sloMet ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {test?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {test?.endTime?.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-gray-600 dark:text-gray-400">
                      {test?.results?.avgThroughput} req/s
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {test?.results?.p95Latency}ms p95
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No test results yet. Run a test to see performance data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}