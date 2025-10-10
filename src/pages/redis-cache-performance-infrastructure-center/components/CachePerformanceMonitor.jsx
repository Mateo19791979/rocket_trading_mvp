import React, { useState, useEffect } from 'react';
import { Activity, Clock, Database, TrendingUp, BarChart3, Zap, Target, AlertTriangle } from 'lucide-react';

export default function CachePerformanceMonitor({ metrics, stats }) {
  const [performanceData, setPerformanceData] = useState({
    hitRatio: 85.2,
    missRatio: 14.8,
    responseTimeImprovement: 67.3,
    memorySaved: 156.8,
    totalRequests: 89234,
    cachedRequests: 76047,
    avgResponseTime: 8.3,
    p95ResponseTime: 15.7,
    p99ResponseTime: 28.9
  });

  const [timeSeriesData, setTimeSeriesData] = useState([
    { time: '19:00', hits: 845, misses: 123, responseTime: 12.3 },
    { time: '19:01', hits: 892, misses: 108, responseTime: 9.8 },
    { time: '19:02', hits: 923, misses: 134, responseTime: 11.2 },
    { time: '19:03', hits: 867, misses: 156, responseTime: 8.7 },
    { time: '19:04', hits: 934, misses: 142, responseTime: 7.4 }
  ]);

  const [cacheKeys, setCacheKeys] = useState([
    { key: 'q:BTCUSDT', type: 'quotes', ttl: 3, size: '0.8KB', hits: 1247 },
    { key: 'q:ETHUSDT', type: 'quotes', ttl: 4, size: '0.7KB', hits: 923 },
    { key: 'ohlc:BTCUSDT:1h', type: 'ohlc', ttl: 45, size: '12.3KB', hits: 567 },
    { key: 'q:AAPL', type: 'quotes', ttl: 2, size: '0.9KB', hits: 834 },
    { key: 'ohlc:ETHUSDT:4h', type: 'ohlc', ttl: 38, size: '18.7KB', hits: 234 }
  ]);

  const [ttlAnalysis, setTtlAnalysis] = useState({
    quotes: {
      current: 5,
      optimal: 7,
      efficiency: 78.9,
      recommendation: 'Increase TTL to 7s for better cache efficiency'
    },
    ohlc: {
      current: 60,
      optimal: 90,
      efficiency: 85.4,
      recommendation: 'Consider increasing TTL to 90s for historical data'
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time performance updates
      setPerformanceData(prev => ({
        ...prev,
        hitRatio: Math.max(75, Math.min(95, prev?.hitRatio + (Math.random() - 0.5) * 2)),
        avgResponseTime: Math.max(5, Math.min(20, prev?.avgResponseTime + (Math.random() - 0.5) * 1)),
        totalRequests: prev?.totalRequests + Math.floor(Math.random() * 50)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getEfficiencyColor = (value) => {
    if (value >= 85) return 'text-green-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const invalidateCache = (key) => {
    console.log('Invalidating cache key:', key);
    // Here you would make API call to invalidate specific cache key
  };

  const optimizeTTL = (type) => {
    console.log('Optimizing TTL for:', type);
    // Here you would make API call to optimize TTL settings
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Performance Metrics Overview */}
      <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-400" />
          Cache Performance Analytics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-gray-400 text-sm">Hit Ratio</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{performanceData?.hitRatio?.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Target: &gt;80%</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400 text-sm">Avg Response</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{performanceData?.avgResponseTime?.toFixed(1)}ms</div>
            <div className="text-xs text-gray-400">P95: {performanceData?.p95ResponseTime}ms</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400 text-sm">Performance Gain</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{performanceData?.responseTimeImprovement?.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">vs without cache</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-orange-400" />
              <span className="text-gray-400 text-sm">Memory Saved</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">{performanceData?.memorySaved?.toFixed(1)}MB</div>
            <div className="text-xs text-gray-400">DB load reduction</div>
          </div>
        </div>

        {/* Performance Timeline */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Real-time Performance Timeline
          </h4>
          <div className="flex items-end justify-between h-32 gap-2">
            {timeSeriesData?.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-700 rounded-t relative" style={{ height: `${(point?.hits / 1000) * 100}px` }}>
                  <div 
                    className="w-full bg-green-400 rounded-t" 
                    style={{ height: `${((point?.hits / (point?.hits + point?.misses)) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">{point?.time}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Cache Hits (Green) vs Total Requests</span>
            <span>Last 5 minutes</span>
          </div>
        </div>
      </div>
      {/* Cache Keys & TTL Analysis */}
      <div className="space-y-6">
        {/* Active Cache Keys */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Active Cache Keys
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cacheKeys?.map((key, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-blue-400 text-sm font-mono">{key?.key}</code>
                  <button 
                    onClick={() => invalidateCache(key?.key)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Invalidate
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">TTL:</span>
                    <span className={`ml-1 ${key?.ttl < 10 ? 'text-yellow-400' : 'text-white'}`}>
                      {key?.ttl}s
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white ml-1">{key?.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Hits:</span>
                    <span className="text-green-400 ml-1">{key?.hits}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className={`ml-1 px-1 rounded text-xs ${
                      key?.type === 'quotes' ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {key?.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TTL Optimization */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            TTL Optimization
          </h3>

          <div className="space-y-4">
            {Object.entries(ttlAnalysis)?.map(([type, analysis]) => (
              <div key={type} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold capitalize">{type} Cache</h4>
                  <span className={`text-sm font-bold ${getEfficiencyColor(analysis?.efficiency)}`}>
                    {analysis?.efficiency}% Efficient
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-400">Current TTL:</span>
                    <span className="text-white ml-2">{analysis?.current}s</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Optimal TTL:</span>
                    <span className="text-green-400 ml-2">{analysis?.optimal}s</span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-semibold">Recommendation</span>
                  </div>
                  <p className="text-gray-300 text-sm">{analysis?.recommendation}</p>
                </div>

                <button 
                  onClick={() => optimizeTTL(type)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  Apply Optimization
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}