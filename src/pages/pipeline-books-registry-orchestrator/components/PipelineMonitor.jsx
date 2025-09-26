import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, RefreshCw, AlertTriangle, CheckCircle, Clock, TrendingUp, Zap } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const PipelineMonitor = ({ processingJobs, strategyExtractions, pipelineStats, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    activeJobs: 0,
    completedJobs: 0,
    extractionsToday: 0,
    avgProcessingTime: 0
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeJobs: processingJobs?.filter(job => job?.status === 'ingesting' || job?.status === 'pending')?.length || 0,
        completedJobs: processingJobs?.filter(job => job?.status === 'completed')?.length || 0,
        extractionsToday: strategyExtractions?.length || 0,
        avgProcessingTime: Math.round(Math.random() * 200 + 150) // Simulated
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [processingJobs, strategyExtractions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getJobStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'ingesting': case'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getJobStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'ingesting': case'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const monitoringMetrics = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      color: 'text-blue-400'
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      id: 'errors',
      name: 'Error Handling',
      icon: AlertTriangle,
      color: 'text-red-400'
    },
    {
      id: 'realtime',
      name: 'Real-time',
      icon: Activity,
      color: 'text-purple-400'
    }
  ];

  const errorLogs = [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15)?.toLocaleString(),
      type: 'warning',
      message: 'High memory usage detected in OCR processing',
      context: 'book_id: 1234-5678'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 45)?.toLocaleString(),
      type: 'info',
      message: 'Strategy extraction completed successfully',
      context: 'confidence: 0.87'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 120)?.toLocaleString(),
      type: 'error',
      message: 'Failed to parse chapter structure',
      context: 'page_range: 150-175'
    }
  ];

  const performanceMetrics = {
    processingSpeed: {
      value: '2.3 pages/sec',
      trend: '+12%',
      color: 'text-green-400'
    },
    accuracy: {
      value: '94.7%',
      trend: '+2.1%',
      color: 'text-green-400'
    },
    memoryUsage: {
      value: '68%',
      trend: '-5%',
      color: 'text-yellow-400'
    },
    diskSpace: {
      value: '45GB used',
      trend: '+8GB',
      color: 'text-blue-400'
    }
  };

  return (
    <div className="space-y-6">
      {/* Monitor Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-teal-400" />
          Pipeline Monitor
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg transition-colors ${
            isRefreshing ? 'cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Jobs</p>
              <p className="text-2xl font-bold text-yellow-400">{realTimeData?.activeJobs}</p>
            </div>
            <Activity className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed Today</p>
              <p className="text-2xl font-bold text-green-400">{realTimeData?.completedJobs}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Extractions</p>
              <p className="text-2xl font-bold text-blue-400">{realTimeData?.extractionsToday}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Time</p>
              <p className="text-2xl font-bold text-purple-400">{realTimeData?.avgProcessingTime}ms</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
      {/* Monitor Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        {monitoringMetrics?.map((metric) => {
          const Icon = metric?.icon;
          return (
            <button
              key={metric?.id}
              onClick={() => setSelectedMetric(metric?.id)}
              className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                selectedMetric === metric?.id
                  ? 'border-teal-400 text-teal-400' :'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{metric?.name}</span>
              </div>
            </button>
          );
        })}
      </div>
      {/* Monitor Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {selectedMetric === 'overview' && (
          <>
            {/* Processing Jobs Status */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">Current Processing Jobs</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {processingJobs?.slice(0, 8)?.map((job) => (
                  <div key={job?.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={getJobStatusColor(job?.status)}>
                        {getJobStatusIcon(job?.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {job?.book_library?.title || `Job ${job?.id?.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{job?.processing_stage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{job?.progress_percentage?.toFixed(1) || 0}%</p>
                      <p className={`text-xs capitalize ${getJobStatusColor(job?.status)}`}>
                        {job?.status}
                      </p>
                    </div>
                  </div>
                ))}
                
                {processingJobs?.length === 0 && (
                  <div className="text-center py-6 text-gray-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active processing jobs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Statistics */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">Pipeline Statistics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Books</span>
                  <span className="text-white font-medium">{pipelineStats?.totalBooks || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-green-400 font-medium">{pipelineStats?.bookStats?.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">In Progress</span>
                  <span className="text-yellow-400 font-medium">{pipelineStats?.bookStats?.ingesting || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Failed</span>
                  <span className="text-red-400 font-medium">{pipelineStats?.bookStats?.failed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-green-400 font-medium">
                    {pipelineStats?.totalBooks > 0 ? 
                      (((pipelineStats?.bookStats?.completed || 0) / pipelineStats?.totalBooks) * 100)?.toFixed(1) + '%' : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'performance' && (
          <>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">Performance Metrics</h4>
              <div className="space-y-4">
                {Object.entries(performanceMetrics)?.map(([key, metric]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-400 capitalize">{key?.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="text-right">
                      <span className="text-white font-medium">{metric?.value}</span>
                      <span className={`ml-2 text-xs ${metric?.color}`}>{metric?.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">Processing Efficiency</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">OCR Accuracy</span>
                    <span className="text-white">98.2%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.2%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Extraction Success</span>
                    <span className="text-white">87.5%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">YAML Validation</span>
                    <span className="text-white">95.1%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '95.1%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'errors' && (
          <>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">Recent Logs</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {errorLogs?.map((log, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    log?.type === 'error' ? 'border-red-500 bg-red-500/10' :
                    log?.type === 'warning'? 'border-yellow-500 bg-yellow-500/10' : 'border-blue-500 bg-blue-500/10'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium uppercase ${
                        log?.type === 'error' ? 'text-red-400' :
                        log?.type === 'warning'? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {log?.type}
                      </span>
                      <span className="text-xs text-gray-500">{log?.timestamp}</span>
                    </div>
                    <p className="text-sm text-white mb-1">{log?.message}</p>
                    <p className="text-xs text-gray-400">{log?.context}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">Error Statistics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Errors (24h)</span>
                  <span className="text-red-400 font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Warnings (24h)</span>
                  <span className="text-yellow-400 font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Auto-resolved</span>
                  <span className="text-green-400 font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Manual Intervention</span>
                  <span className="text-blue-400 font-medium">7</span>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedMetric === 'realtime' && (
          <>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">Live Activity Feed</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">{new Date()?.toLocaleTimeString()}</span>
                  <span className="text-white">Strategy extraction completed</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-400">{new Date(Date.now() - 30000)?.toLocaleTimeString()}</span>
                  <span className="text-white">OCR processing started</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-400">{new Date(Date.now() - 60000)?.toLocaleTimeString()}</span>
                  <span className="text-white">Book uploaded to queue</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h4 className="text-md font-medium text-white mb-4">System Resources</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">CPU Usage</span>
                    <span className="text-white">45%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-white">68%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Network I/O</span>
                    <span className="text-white">23%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PipelineMonitor;