import React, { useState, useEffect } from 'react';
import { Gauge, TrendingDown, Clock, CheckCircle2, BarChart3, Activity } from 'lucide-react';

const SafeLandingDashboard = () => {
  const [landingProgress, setLandingProgress] = useState(0);
  const [isLanding, setIsLanding] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 67,
    connections: 1245,
    throughput: 850
  });

  const [degradationStatus] = useState([
    { component: 'Trading Engine', status: 'operational', degradation: 0, priority: 'high' },
    { component: 'Market Data', status: 'degraded', degradation: 25, priority: 'medium' },
    { component: 'Risk Controller', status: 'operational', degradation: 5, priority: 'high' },
    { component: 'WebSocket Service', status: 'operational', degradation: 10, priority: 'medium' },
    { component: 'Database Pool', status: 'critical', degradation: 75, priority: 'critical' },
    { component: 'Agent Network', status: 'degraded', degradation: 40, priority: 'high' }
  ]);

  const [recoveryStages] = useState([
    { stage: 1, name: 'System Assessment', status: 'completed', duration: '2m', progress: 100 },
    { stage: 2, name: 'Safe State Transition', status: 'in-progress', duration: '5m', progress: 65 },
    { stage: 3, name: 'Data Synchronization', status: 'pending', duration: '3m', progress: 0 },
    { stage: 4, name: 'Service Validation', status: 'pending', duration: '2m', progress: 0 },
    { stage: 5, name: 'Full Recovery', status: 'pending', duration: '1m', progress: 0 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metrics updates
      setSystemMetrics(prev => ({
        cpu: Math.max(20, Math.min(90, prev?.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(95, prev?.memory + (Math.random() - 0.5) * 8)),
        connections: Math.max(500, Math.min(2000, prev?.connections + (Math.random() - 0.5) * 100)),
        throughput: Math.max(200, Math.min(1500, prev?.throughput + (Math.random() - 0.5) * 150))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const initiateSafeLanding = () => {
    setIsLanding(true);
    setLandingProgress(0);
    
    const interval = setInterval(() => {
      setLandingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLanding(false);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: 'text-green-400 bg-green-900/30',
      degraded: 'text-yellow-400 bg-yellow-900/30',
      critical: 'text-red-400 bg-red-900/30',
      completed: 'text-green-400',
      'in-progress': 'text-blue-400',
      pending: 'text-gray-400'
    };
    return colors?.[status] || 'text-gray-400';
  };

  const getMetricColor = (value, type) => {
    if (type === 'cpu' || type === 'memory') {
      if (value > 80) return 'text-red-400';
      if (value > 60) return 'text-yellow-400';
      return 'text-green-400';
    }
    return 'text-blue-400';
  };

  const formatNumber = (num) => {
    if (num > 1000) return `${(num / 1000)?.toFixed(1)}K`;
    return num?.toString();
  };

  return (
    <div className="bg-gray-800 border border-green-500 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingDown className="text-green-400 mr-3 h-6 w-6" />
          <h3 className="text-xl font-bold text-white">Safe Landing Dashboard</h3>
        </div>
        <button
          onClick={initiateSafeLanding}
          disabled={isLanding}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isLanding ? 'Landing in Progress...' : 'Initiate Safe Landing'}
        </button>
      </div>
      {/* Landing Progress */}
      {isLanding && (
        <div className="mb-8 bg-green-900/20 border border-green-500 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Activity className="text-green-400 h-5 w-5 mr-2" />
            <span className="text-green-300 font-medium">Safe Landing Sequence Active</span>
            <span className="ml-auto text-green-300 font-bold">{landingProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300 relative"
              style={{ width: `${landingProgress}%` }}
            >
              <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-50"></div>
            </div>
          </div>
          <p className="text-green-200 text-sm">
            Gracefully transitioning system to safe operational state...
          </p>
        </div>
      )}
      {/* Real-time System Status */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Gauge className="text-blue-400 mr-2 h-5 w-5" />
          Real-time System Status
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold mb-1">
              <span className={getMetricColor(systemMetrics?.cpu, 'cpu')}>
                {systemMetrics?.cpu}%
              </span>
            </div>
            <div className="text-sm text-gray-300">CPU Usage</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  systemMetrics?.cpu > 80 ? 'bg-red-500' : 
                  systemMetrics?.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemMetrics?.cpu}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold mb-1">
              <span className={getMetricColor(systemMetrics?.memory, 'memory')}>
                {systemMetrics?.memory}%
              </span>
            </div>
            <div className="text-sm text-gray-300">Memory</div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  systemMetrics?.memory > 80 ? 'bg-red-500' : 
                  systemMetrics?.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${systemMetrics?.memory}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold mb-1 text-blue-400">
              {formatNumber(systemMetrics?.connections)}
            </div>
            <div className="text-sm text-gray-300">Connections</div>
            <div className="text-xs text-green-400 mt-1">Active</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold mb-1 text-blue-400">
              {formatNumber(systemMetrics?.throughput)}
            </div>
            <div className="text-sm text-gray-300">Throughput/s</div>
            <div className="text-xs text-green-400 mt-1">Normal</div>
          </div>
        </div>
      </div>
      {/* Graceful Degradation Monitor */}
      <div className="mb-8">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <BarChart3 className="text-yellow-400 mr-2 h-5 w-5" />
          Graceful Degradation Monitor
        </h4>
        
        <div className="space-y-3">
          {degradationStatus?.map((item, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-white font-medium">{item?.component}</span>
                  <span className={`ml-3 text-xs px-2 py-1 rounded ${getStatusColor(item?.status)}`}>
                    {item?.status}
                  </span>
                </div>
                <span className={`text-sm ${
                  item?.degradation < 20 ? 'text-green-400' :
                  item?.degradation < 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {item?.degradation}% degraded
                </span>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item?.degradation < 20 ? 'bg-green-500' :
                    item?.degradation < 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${100 - item?.degradation}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recovery Progress Tracking */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-4 flex items-center">
          <Clock className="text-purple-400 mr-2 h-5 w-5" />
          Recovery Progress Timeline
        </h4>
        
        <div className="space-y-3">
          {recoveryStages?.map((stage) => (
            <div key={stage?.stage} className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center mr-4">
                {stage?.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : stage?.status === 'in-progress' ? (
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                ) : (
                  <span className="text-xs text-gray-400">{stage?.stage}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${getStatusColor(stage?.status)}`}>
                    {stage?.name}
                  </span>
                  <span className="text-xs text-gray-400">{stage?.duration}</span>
                </div>
                
                {stage?.status === 'in-progress' && (
                  <div className="w-full bg-gray-600 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${stage?.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafeLandingDashboard;