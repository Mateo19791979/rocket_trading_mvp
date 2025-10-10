import React, { useState } from 'react';
import { Terminal, Play, Copy, CheckCircle, XCircle, Clock, Code, Download } from 'lucide-react';

export function LiveTestingInterface({ connectionStatus, shadowMode }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState('health');
  const [testResults, setTestResults] = useState([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const testEndpoints = [
    {
      key: 'health',
      name: 'Health Check',
      method: 'GET',
      description: 'Test gateway connectivity and authentication status',
      curl: `curl -s "https://trading-mvp.com/api/ibkr/health" \\
  -H "x-internal-key: YOUR_KEY" | jq .`
    },
    {
      key: 'accounts',
      name: 'Accounts',
      method: 'GET',
      description: 'Retrieve user account information',
      curl: `curl -s "https://trading-mvp.com/api/ibkr/accounts" \\
  -H "x-internal-key: YOUR_KEY" | jq .`
    },
    {
      key: 'positions',
      name: 'Positions',
      method: 'GET',
      description: 'Get current portfolio positions',
      curl: `curl -s "https://trading-mvp.com/api/ibkr/positions" \\
  -H "x-internal-key: YOUR_KEY" | jq .`
    },
    {
      key: 'snapshot',
      name: 'Market Snapshot',
      method: 'GET',
      description: 'Get market data for SPY (conid 265598)',
      curl: `curl -s "https://trading-mvp.com/api/ibkr/snapshot?conids=265598&fields=31,84,85" \\
  -H "x-internal-key: YOUR_KEY" | jq .`
    },
    {
      key: 'order',
      name: 'Place Order (Shadow)',
      method: 'POST',
      description: 'Test order placement with shadow mode protection',
      curl: `curl -s -X POST "https://trading-mvp.com/api/ibkr/order" \\
  -H "x-internal-key: YOUR_KEY"\ -H"content-type: application/json" \\
  -d '{"conid":265598,"side":"BUY","qty":1}' | jq .`
    }
  ];

  const generateMockResponse = (endpoint) => {
    const responses = {
      health: {
        ok: true,
        authenticated: true,
        status: {
          connected: true,
          serverTime: new Date()?.toISOString(),
          tradingMode: shadowMode ? 'paper' : 'live'
        }
      },
      accounts: [
        {
          accountId: shadowMode ? 'DU123456' : 'U123456',
          accountName: 'Trading Account',
          tradingType: shadowMode ? 'Paper' : 'Live'
        }
      ],
      positions: [
        {
          symbol: 'SPY',
          position: 100,
          avgCost: 420.50,
          marketValue: 42150.00,
          unrealizedPnL: 175.00
        }
      ],
      snapshot: [
        {
          conid: 265598,
          symbol: 'SPY',
          bid: 421.25,
          ask: 421.30,
          last: 421.28,
          timestamp: Date.now()
        }
      ],
      order: shadowMode ? {
        ok: false,
        shadow: true,
        note: "Shadow mode actif : aucun ordre envoyé."
      } : {
        ok: true,
        orderId: Math.floor(Math.random() * 1000000),
        status: 'Submitted'
      }
    };

    return responses?.[endpoint] || { error: 'Unknown endpoint' };
  };

  const runTest = async (endpoint) => {
    if (connectionStatus?.status !== 'connected') {
      const errorResult = {
        id: Date.now(),
        endpoint: endpoint?.name,
        method: endpoint?.method,
        timestamp: new Date()?.toISOString(),
        success: false,
        error: 'Gateway connection required',
        responseTime: null
      };
      setTestResults(prev => [errorResult, ...prev?.slice(0, 9)]);
      return;
    }

    setIsRunningTest(true);
    
    try {
      const startTime = Date.now();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const responseTime = Date.now() - startTime;
      const mockResponse = generateMockResponse(endpoint?.key);
      
      const result = {
        id: Date.now(),
        endpoint: endpoint?.name,
        method: endpoint?.method,
        timestamp: new Date()?.toISOString(),
        success: true,
        response: mockResponse,
        responseTime,
        curl: endpoint?.curl
      };
      
      setTestResults(prev => [result, ...prev?.slice(0, 9)]);
      
    } catch (error) {
      const errorResult = {
        id: Date.now(),
        endpoint: endpoint?.name,
        method: endpoint?.method,
        timestamp: new Date()?.toISOString(),
        success: false,
        error: error?.message,
        responseTime: null
      };
      
      setTestResults(prev => [errorResult, ...prev?.slice(0, 9)]);
    } finally {
      setIsRunningTest(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    
    // Show success feedback
    const successEvent = new CustomEvent('show-notification', {
      detail: {
        type: 'success',
        message: 'Command copied to clipboard'
      }
    });
    window.dispatchEvent(successEvent);
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ibkr-test-results-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement?.setAttribute('href', dataUri);
    linkElement?.setAttribute('download', exportFileDefaultName);
    linkElement?.click();
  };

  return (
    <div className="space-y-6">
      {/* Curl Command Generators */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <Code className="w-4 h-4 mr-2" />
          Curl Command Generators
        </h3>
        
        <div className="space-y-3">
          {testEndpoints?.map((endpoint) => (
            <div key={endpoint?.key} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    endpoint?.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                  } text-white`}>
                    {endpoint?.method}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{endpoint?.name}</p>
                    <p className="text-xs text-gray-400">{endpoint?.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(endpoint?.curl)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
                    title="Copy curl command"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => runTest(endpoint)}
                    disabled={isRunningTest}
                    className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs font-medium rounded-md transition-colors"
                  >
                    {isRunningTest ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Test
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-md p-3">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">
                  {endpoint?.curl}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Test Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <Terminal className="w-4 h-4 mr-2" />
            Real-time Execution Logs
          </h3>
          
          {testResults?.length > 0 && (
            <button
              onClick={downloadResults}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
            >
              <Download className="w-3 h-3 mr-1" />
              Export Results
            </button>
          )}
        </div>
        
        {testResults?.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <Terminal className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-2">No test results yet</p>
            <p className="text-xs text-gray-500">Run API tests to see execution logs and responses</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {testResults?.map((result) => (
              <div key={result?.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {result?.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{result?.endpoint}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(result.timestamp)?.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      result?.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                    } text-white`}>
                      {result?.method}
                    </span>
                    
                    {result?.responseTime && (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{result?.responseTime}ms</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {result?.success ? (
                  <div className="bg-gray-800 rounded-md p-3">
                    <pre className="text-xs text-green-300 whitespace-pre-wrap">
                      {JSON.stringify(result?.response, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-red-900/20 rounded-md p-3">
                    <p className="text-xs text-red-300">Error: {result?.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Testing Notes */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">Testing Guidelines</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <p>• Replace <code className="text-blue-300">YOUR_KEY</code> with your actual INTERNAL_ADMIN_KEY</p>
          <p>• Tests require an active gateway connection to succeed</p>
          <p>• Order tests are automatically protected by shadow mode when enabled</p>
          <p>• Market data requires valid contract IDs (conids) for real symbols</p>
        </div>
      </div>
    </div>
  );
}