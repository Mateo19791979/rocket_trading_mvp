import React, { useState, useEffect } from 'react';
import { BarChart3, Target, Clock, Database, Search, CheckCircle } from 'lucide-react';



export default function KnowledgeAnalyticsPanel({ stats }) {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    queryResponseTime: [],
    embeddingQuality: 85.7,
    searchAccuracy: 92.3,
    vectorSimilarity: 88.9
  });

  useEffect(() => {
    // Generate mock performance data
    const generatePerformanceData = () => {
      const data = [];
      const now = Date.now();
      
      for (let i = 23; i >= 0; i--) {
        data?.push({
          time: new Date(now - i * 60 * 60 * 1000),
          responseTime: Math.floor(Math.random() * 100) + 50,
          queries: Math.floor(Math.random() * 50) + 10
        });
      }
      
      return data;
    };

    setPerformanceMetrics(prev => ({
      ...prev,
      queryResponseTime: generatePerformanceData()
    }));
  }, []);

  const MetricCard = ({ icon: IconComponent, title, value, unit, color, trend }) => (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <IconComponent className={`h-5 w-5 ${color}`} />
        {trend && (
          <span className={`text-xs px-2 py-1 rounded ${
            trend > 0 ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-bold text-white">{value}</span>
          <span className="text-sm text-gray-400">{unit}</span>
        </div>
        <p className="text-xs text-gray-400">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-semibold">Knowledge Analytics</h3>
      </div>
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard
          icon={Clock}
          title="Avg Response Time"
          value={stats?.avgResponseTime || 0}
          unit="ms"
          color="text-green-400"
          trend={-12}
        />
        <MetricCard
          icon={Target}
          title="Search Accuracy"
          value={performanceMetrics?.searchAccuracy}
          unit="%"
          color="text-blue-400"
          trend={3}
        />
        <MetricCard
          icon={Database}
          title="Embedding Quality"
          value={performanceMetrics?.embeddingQuality}
          unit="%"
          color="text-teal-400"
          trend={1}
        />
        <MetricCard
          icon={Search}
          title="Vector Similarity"
          value={performanceMetrics?.vectorSimilarity}
          unit="%"
          color="text-orange-400"
          trend={5}
        />
      </div>
      {/* Performance Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">24-Hour Query Performance</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="h-32 flex items-end justify-between space-x-1">
            {performanceMetrics?.queryResponseTime?.map((point, index) => {
              const height = Math.max((point?.responseTime / 200) * 100, 10);
              return (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-400"
                  style={{ height: `${height}%`, width: '3px' }}
                  title={`${point?.time?.getHours()}:00 - ${point?.responseTime}ms`}
                ></div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>24h ago</span>
            <span>12h ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>
      {/* Quality Metrics */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Quality Metrics</h4>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Semantic Relevance</span>
              <span className="text-white">94.2%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Context Preservation</span>
              <span className="text-white">91.8%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '91.8%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Embedding Consistency</span>
              <span className="text-white">89.7%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-teal-500 h-2 rounded-full" style={{ width: '89.7%' }}></div>
            </div>
          </div>
        </div>
      </div>
      {/* System Health */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-300">Vector Index Health</span>
          </div>
          <span className="text-green-400 text-sm font-medium">Optimal</span>
        </div>
        
        <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="text-white font-bold">99.7%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">1536</div>
            <div className="text-gray-400">Dimensions</div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold">IVFFlat</div>
            <div className="text-gray-400">Index Type</div>
          </div>
        </div>
      </div>
    </div>
  );
}