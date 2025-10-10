import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Server
} from 'lucide-react';



export default function ProcessingMonitoringPanel({ stats }) {
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    processingQueue: 0,
    embeddingGeneration: {
      current: 0,
      rate: 0,
      estimated: 0
    },
    vectorStorage: {
      writeOps: 0,
      latency: 0,
      success: 0
    },
    errorLog: []
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        processingQueue: Math.floor(Math.random() * 10),
        embeddingGeneration: {
          current: Math.floor(Math.random() * 50) + 10,
          rate: Math.floor(Math.random() * 100) + 50,
          estimated: Math.floor(Math.random() * 300) + 60
        },
        vectorStorage: {
          writeOps: Math.floor(Math.random() * 200) + 100,
          latency: Math.floor(Math.random() * 50) + 25,
          success: 95 + Math.random() * 4
        }
      }));

      // Add to performance history
      const newEntry = {
        timestamp: new Date(),
        documentsPerHour: Math.floor(Math.random() * 20) + 30,
        embeddingRate: Math.floor(Math.random() * 100) + 150,
        storageLatency: Math.floor(Math.random() * 30) + 20
      };

      setPerformanceHistory(prev => {
        const updated = [newEntry, ...prev?.slice(0, 11)];
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ icon: IconComponent, title, value, unit, status, color }) => (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <IconComponent className={`h-5 w-5 ${color}`} />
        <div className={`w-2 h-2 rounded-full ${
          status === 'healthy' ? 'bg-green-400' : 
          status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
        } ${status === 'healthy' ? 'animate-pulse' : ''}`}></div>
      </div>
      <div className="space-y-1">
        <div className="text-lg font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400">{title}</div>
        {unit && <div className="text-xs text-gray-500">{unit}</div>}
      </div>
    </div>
  );

  const getHealthStatus = (metric, value) => {
    const thresholds = {
      processingQueue: { warning: 5, critical: 10 },
      embeddingRate: { warning: 100, critical: 50 },
      storageLatency: { warning: 100, critical: 200 },
      storageSuccess: { warning: 95, critical: 90 }
    };

    const threshold = thresholds?.[metric];
    if (!threshold) return 'healthy';

    if (metric === 'storageSuccess') {
      if (value >= threshold?.warning) return 'healthy';
      if (value >= threshold?.critical) return 'warning';
      return 'critical';
    } else {
      if (value <= threshold?.warning) return 'healthy';
      if (value <= threshold?.critical) return 'warning';
      return 'critical';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold">Processing Monitoring</h3>
      </div>
      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard
          icon={Clock}
          title="Processing Queue"
          value={realTimeMetrics?.processingQueue}
          unit="documents waiting"
          status={getHealthStatus('processingQueue', realTimeMetrics?.processingQueue)}
          color="text-blue-400"
        />
        <MetricCard
          icon={Zap}
          title="Embedding Rate"
          value={realTimeMetrics?.embeddingGeneration?.rate}
          unit="chunks/min"
          status={getHealthStatus('embeddingRate', realTimeMetrics?.embeddingGeneration?.rate)}
          color="text-orange-400"
        />
        <MetricCard
          icon={Database}
          title="Storage Latency"
          value={`${realTimeMetrics?.vectorStorage?.latency}ms`}
          unit="write operations"
          status={getHealthStatus('storageLatency', realTimeMetrics?.vectorStorage?.latency)}
          color="text-teal-400"
        />
        <MetricCard
          icon={CheckCircle}
          title="Success Rate"
          value={`${realTimeMetrics?.vectorStorage?.success?.toFixed(1)}%`}
          unit="operations"
          status={getHealthStatus('storageSuccess', realTimeMetrics?.vectorStorage?.success)}
          color="text-green-400"
        />
      </div>
      {/* Processing Pipeline Status */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Pipeline Status</h4>
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">PDF Text Extraction</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Processing: {realTimeMetrics?.processingQueue} docs • Success: 99.2%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Embedding Generation</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-orange-400">Rate Limited</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Current: {realTimeMetrics?.embeddingGeneration?.current} chunks • ETA: {realTimeMetrics?.embeddingGeneration?.estimated}s
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Vector Storage</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-teal-400">Optimal</span>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Write Ops: {realTimeMetrics?.vectorStorage?.writeOps}/min • Latency: {realTimeMetrics?.vectorStorage?.latency}ms
            </div>
          </div>
        </div>
      </div>
      {/* Performance Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Trends (Last Hour)</h4>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="h-24 flex items-end justify-between space-x-1">
            {performanceHistory?.slice(0, 12)?.reverse()?.map((point, index) => {
              const height = Math.max((point?.documentsPerHour / 50) * 100, 10);
              return (
                <div
                  key={index}
                  className="bg-green-500 rounded-t transition-all duration-300 hover:bg-green-400"
                  style={{ height: `${height}%`, width: '8px' }}
                  title={`${point?.documentsPerHour} docs/hr at ${point?.timestamp?.toLocaleTimeString()}`}
                ></div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>-60min</span>
            <span>-30min</span>
            <span>Now</span>
          </div>
        </div>
      </div>
      {/* Error Monitoring */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Error Log</h4>
        <div className="bg-gray-700 rounded-lg p-4 max-h-32 overflow-y-auto">
          {stats?.processingErrors === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm text-gray-400">No processing errors in the last 24 hours</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Mock error entries */}
              {Array.from({ length: Math.min(stats?.processingErrors, 3) }, (_, i) => (
                <div key={i} className="flex items-start space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-gray-300">PDF parsing failed: corrupted_document_{i + 1}.pdf</div>
                    <div className="text-gray-500 text-xs">
                      {new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* System Resources */}
      <div className="pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Server className="h-4 w-4 mx-auto mb-1 text-gray-400" />
            <div className="text-sm font-medium text-white">CPU</div>
            <div className="text-xs text-gray-400">67%</div>
          </div>
          <div>
            <Database className="h-4 w-4 mx-auto mb-1 text-gray-400" />
            <div className="text-sm font-medium text-white">Memory</div>
            <div className="text-xs text-gray-400">4.2GB</div>
          </div>
          <div>
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-gray-400" />
            <div className="text-sm font-medium text-white">Throughput</div>
            <div className="text-xs text-gray-400">89%</div>
          </div>
        </div>
      </div>
    </div>
  );
}