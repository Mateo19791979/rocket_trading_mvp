import React, { useState } from 'react';
import { Play, Settings, Code, Database, Wifi, Search, FileText } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function TestSuiteConfiguration({ onRunTest, systemStatus }) {
  const [selectedTest, setSelectedTest] = useState('providers');
  const [testConfig, setTestConfig] = useState({
    duration: '2m',
    vus: 100,
    maxVus: 500,
    rate: 200,
    symbols: 'AAPL,MSFT,TSLA,NVDA,AMZN',
    redisRate: 200
  });

  const testSuites = [
    {
      id: 'providers',
      name: 'Provider Router',
      icon: Database,
      description: 'API latency & failover testing',
      target: 'p95 < 800ms, errors < 1%',
      color: 'blue',
      script: 'k6.providers.js'
    },
    {
      id: 'quotes-http',
      name: 'Quotes HTTP',
      icon: Code,
      description: 'Throughput & latency testing',
      target: 'p95 < 700ms, > 1000 req/s',
      color: 'green',
      script: 'k6.quotes-http.js'
    },
    {
      id: 'websocket',
      name: 'WebSocket Bridge',
      icon: Wifi,
      description: 'Connection stability testing',
      target: '> 1000 clients, < 0.1% loss',
      color: 'purple',
      script: 'k6.quotes-ws.js'
    },
    {
      id: 'rag',
      name: 'RAG Knowledge Base',
      icon: Search,
      description: 'Semantic query performance',
      target: 'p95 < 900ms, errors < 2%',
      color: 'orange',
      script: 'k6.kb-rag.js'
    }
  ];

  const handleRunTest = () => {
    const suite = testSuites?.find(s => s?.id === selectedTest);
    onRunTest({
      name: suite?.name,
      type: selectedTest,
      config: testConfig,
      script: suite?.script
    });
  };

  const selectedSuite = testSuites?.find(s => s?.id === selectedTest);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Test Suite Configuration
          </h3>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {/* Test Suite Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Test Suite
          </label>
          <div className="space-y-2">
            {testSuites?.map((suite) => {
              const Icon = suite?.icon;
              return (
                <div
                  key={suite?.id}
                  onClick={() => setSelectedTest(suite?.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTest === suite?.id
                      ? `border-${suite?.color}-500 bg-${suite?.color}-50 dark:bg-${suite?.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 mr-3 text-${suite?.color}-600 dark:text-${suite?.color}-400`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {suite?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {suite?.description}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Target: {suite?.target}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Load Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Load Parameters
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Duration
              </label>
              <select
                value={testConfig?.duration}
                onChange={(e) => setTestConfig({...testConfig, duration: e?.target?.value})}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1m">1 minute</option>
                <option value="2m">2 minutes</option>
                <option value="5m">5 minutes</option>
                <option value="10m">10 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Virtual Users
              </label>
              <input
                type="number"
                value={testConfig?.vus}
                onChange={(e) => setTestConfig({...testConfig, vus: parseInt(e?.target?.value)})}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="10"
                max="1000"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Max VUs
              </label>
              <input
                type="number"
                value={testConfig?.maxVus}
                onChange={(e) => setTestConfig({...testConfig, maxVus: parseInt(e?.target?.value)})}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="100"
                max="2000"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Target Rate
              </label>
              <input
                type="number"
                value={testConfig?.rate}
                onChange={(e) => setTestConfig({...testConfig, rate: parseInt(e?.target?.value)})}
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="50"
                max="2000"
              />
            </div>
          </div>

          {/* Test-specific configuration */}
          {(selectedTest === 'quotes-http' || selectedTest === 'websocket') && (
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Symbols
              </label>
              <input
                type="text"
                value={testConfig?.symbols}
                onChange={(e) => setTestConfig({...testConfig, symbols: e?.target?.value})}
                placeholder="AAPL,MSFT,TSLA,NVDA,AMZN"
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Redis Publisher Panel */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Database className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
              Redis Tick Publisher
            </h5>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Inject market data for WebSocket testing
          </p>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={testConfig?.redisRate}
              onChange={(e) => setTestConfig({...testConfig, redisRate: parseInt(e?.target?.value)})}
              className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Messages per second"
              min="100"
              max="5000"
            />
            <button className="px-3 py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700">
              Start Publisher
            </button>
          </div>
          
          <div className="mt-2">
            <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              node perf/node.ws-publisher.js RATE={testConfig?.redisRate}
            </pre>
          </div>
        </div>

        {/* Run Test Button */}
        <button
          onClick={handleRunTest}
          className={`w-full flex items-center justify-center px-4 py-3 bg-${selectedSuite?.color}-600 hover:bg-${selectedSuite?.color}-700 text-white font-medium rounded-lg transition-colors`}
        >
          <Play className="h-4 w-4 mr-2" />
          Run {selectedSuite?.name} Test
        </button>

        {/* Test Script Preview */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FileText className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedSuite?.script}
            </span>
          </div>
          <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
{`docker run --rm -i \\
  -e BASE_URL=$BASE_URL \\
  -e WS_URL=$WS_URL \\
  grafana/k6 run - < perf/${selectedSuite?.script}`}
          </pre>
        </div>
      </div>
    </div>
  );
}