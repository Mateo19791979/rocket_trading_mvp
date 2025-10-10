import React from 'react';
import { Database, TrendingUp, Globe, Cpu, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function LiveDataIntegrationDashboard({ eventBusEvents, systemOverview }) {
  const getDataStreamStatus = (streamName) => {
    // Simulate data stream status based on recent events
    const recentEvents = eventBusEvents?.filter(e => 
      e?.event_data?.stream === streamName &&
      new Date(e?.created_at) > new Date(Date.now() - 2 * 60 * 1000) // Last 2 minutes
    );
    
    return {
      active: recentEvents?.length > 0,
      throughput: Math.floor(Math.random() * 1000) + 100,
      quality: Math.floor(Math.random() * 20) + 80,
      lastUpdate: new Date()
    };
  };

  const dataStreams = [
    {
      name: 'CMV Market Valuation',
      type: 'market_data',
      icon: TrendingUp,
      description: 'Real-time market valuation feeds',
      status: getDataStreamStatus('cmv')
    },
    {
      name: 'Wilshire Index Updates',
      type: 'market_data',
      icon: Database,
      description: 'Index composition and performance data',
      status: getDataStreamStatus('wilshire')
    },
    {
      name: 'Quote Providers',
      type: 'market_data',
      icon: Globe,
      description: 'Multi-source quote aggregation',
      status: getDataStreamStatus('quotes')
    },
    {
      name: 'RAG Knowledge Base',
      type: 'system_data',
      icon: Cpu,
      description: 'Knowledge queries and responses',
      status: getDataStreamStatus('rag')
    }
  ];

  const calculateThroughputMetrics = () => {
    const recentEvents = eventBusEvents?.filter(e => 
      new Date(e?.created_at) > new Date(Date.now() - 5 * 60 * 1000)
    );
    
    const totalThroughput = dataStreams?.reduce((sum, stream) => sum + stream?.status?.throughput, 0);
    const avgQuality = dataStreams?.reduce((sum, stream) => sum + stream?.status?.quality, 0) / dataStreams?.length;
    
    return {
      eventsPerMinute: recentEvents?.length,
      totalThroughput,
      avgQuality: avgQuality?.toFixed(1),
      activeStreams: dataStreams?.filter(s => s?.status?.active)?.length
    };
  };

  const metrics = calculateThroughputMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Live Data Integration Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Live</span>
        </div>
      </div>
      {/* Data Stream Overview */}
      <div className="grid grid-cols-2 gap-3">
        {dataStreams?.map(stream => (
          <div key={stream?.name} className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <stream.icon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">{stream?.name}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${stream?.status?.active ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            
            <p className="text-xs text-gray-400 mb-3">{stream?.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Throughput:</span>
                <span className="text-white">{stream?.status?.throughput} ops/min</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Quality:</span>
                <span className={`font-medium ${stream?.status?.quality >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {stream?.status?.quality}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Status:</span>
                <span className={`font-medium ${stream?.status?.active ? 'text-green-400' : 'text-red-400'}`}>
                  {stream?.status?.active ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Throughput Metrics */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3 flex items-center">
          <Database className="w-4 h-4 mr-2 text-blue-400" />
          Throughput Metrics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Events/Min:</span>
              <span className="text-lg font-bold text-blue-400">{metrics?.eventsPerMinute}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Ops/Min:</span>
              <span className="text-lg font-bold text-green-400">{metrics?.totalThroughput?.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Avg Quality:</span>
              <span className="text-lg font-bold text-yellow-400">{metrics?.avgQuality}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Active Streams:</span>
              <span className="text-lg font-bold text-purple-400">{metrics?.activeStreams}/4</span>
            </div>
          </div>
        </div>
      </div>
      {/* Data Quality Indicators */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3">Data Quality Indicators</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Market Data Freshness</span>
            </div>
            <span className="text-sm text-green-400">&lt; 100ms</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Data Completeness</span>
            </div>
            <span className="text-sm text-green-400">98.7%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">Connection Stability</span>
            </div>
            <span className="text-sm text-yellow-400">94.1%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white">Error Rate</span>
            </div>
            <span className="text-sm text-green-400">&lt; 0.1%</span>
          </div>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-3">Recent Data Events</h3>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {eventBusEvents?.slice(0, 5)?.map(event => (
            <div key={event?.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  event?.priority === 'high' ? 'bg-red-400' : 
                  event?.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <span className="text-gray-300">{event?.event_type}</span>
              </div>
              <span className="text-gray-400">
                {new Date(event?.created_at)?.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}