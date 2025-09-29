import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Pause,
  Play,
  SkipForward,
  BarChart3,
  Loader2,
  FileText,
  TrendingUp
} from 'lucide-react';
import knowledgePipelineService from '../../../services/knowledgePipelineService';

const ProcessingStatusPanel = ({ processingQueue, setProcessingQueue, systemHealth }) => {
  const [metrics, setMetrics] = useState({
    ocrCompletion: 87.3,
    textExtractionQuality: 94.1,
    classificationAccuracy: 91.8,
    totalProcessed: 1247,
    successRate: 94.2,
    averageTime: 2.3,
    errorCount: 15
  });

  const [realtimeData, setRealtimeData] = useState([
    { time: '14:30', processed: 8, errors: 0 },
    { time: '14:31', processed: 12, errors: 1 },
    { time: '14:32', processed: 6, errors: 0 },
    { time: '14:33', processed: 15, errors: 2 },
    { time: '14:34', processed: 9, errors: 0 }
  ]);

  useEffect(() => {
    const loadProcessingMetrics = async () => {
      try {
        const data = await knowledgePipelineService?.getProcessingMetrics();
        if (data?.success && data?.data) {
          setMetrics(prev => ({
            ...prev,
            totalProcessed: data?.data?.totalDocuments || prev?.totalProcessed,
            successRate: data?.data?.extractionSuccessRate || prev?.successRate
          }));
        }
      } catch (error) {
        console.error('Failed to load processing metrics:', error);
      }
    };

    loadProcessingMetrics();

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update queue progress
      setProcessingQueue(prev => 
        prev?.map(job => {
          if (job?.status === 'processing' && job?.progress < 100) {
            const newProgress = Math.min(job?.progress + Math.random() * 15, 100);
            const newStatus = newProgress >= 100 ? 'completed' : 'processing';
            
            return {
              ...job,
              progress: newProgress,
              status: newStatus,
              ...(newStatus === 'completed' && { completedAt: new Date() })
            };
          }
          return job;
        })
      );

      // Update real-time data
      setRealtimeData(prev => {
        const now = new Date();
        const newEntry = {
          time: `${now?.getHours()?.toString()?.padStart(2, '0')}:${now?.getMinutes()?.toString()?.padStart(2, '0')}`,
          processed: Math.floor(Math.random() * 10 + 5),
          errors: Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 3)
        };
        return [...prev?.slice(1), newEntry];
      });
    }, 5000);

    // Listen for refresh events
    const handleRefresh = () => {
      loadProcessingMetrics();
    };

    window.addEventListener('refresh-ingestion-status', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-ingestion-status', handleRefresh);
    };
  }, [setProcessingQueue]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Loader2;
      case 'error': return AlertCircle;
      case 'queued': return Clock;
      case 'paused': return Pause;
      default: return Activity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      case 'queued': return 'text-yellow-400';
      case 'paused': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDuration = (startTime) => {
    const now = new Date();
    const duration = now - new Date(startTime);
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds?.toString()?.padStart(2, '0')}`;
  };

  const pauseJob = (jobId) => {
    setProcessingQueue(prev => 
      prev?.map(job => 
        job?.id === jobId ? { ...job, status: 'paused' } : job
      )
    );
  };

  const resumeJob = (jobId) => {
    setProcessingQueue(prev => 
      prev?.map(job => 
        job?.id === jobId ? { ...job, status: 'processing' } : job
      )
    );
  };

  const skipJob = (jobId) => {
    setProcessingQueue(prev => 
      prev?.map(job => 
        job?.id === jobId ? { ...job, status: 'completed', progress: 100 } : job
      )
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Processing Status</h3>
            <p className="text-sm text-gray-400">Live document processing metrics and queue management</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Processing Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">OCR Completion</span>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics?.ocrCompletion}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics?.ocrCompletion}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Quality Score</span>
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics?.textExtractionQuality}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics?.textExtractionQuality}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Live Processing Queue */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-white">Processing Queue ({processingQueue?.length})</h4>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-gray-400">Completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Processing</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-gray-400">Queued</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {processingQueue?.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No documents in processing queue</p>
                </div>
              ) : (
                processingQueue?.map((job) => {
                  const StatusIcon = getStatusIcon(job?.status);
                  const statusColor = getStatusColor(job?.status);
                  const progressColor = getProgressColor(job?.progress);

                  return (
                    <div key={job?.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-4 w-4 ${statusColor} ${job?.status === 'processing' ? 'animate-spin' : ''}`} />
                          <div>
                            <p className="text-sm font-medium text-white truncate max-w-48">
                              {job?.fileName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {job?.status} • {formatDuration(job?.startTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {job?.status === 'processing' && (
                            <button
                              onClick={() => pauseJob(job?.id)}
                              className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                              title="Pause"
                            >
                              <Pause className="h-3 w-3" />
                            </button>
                          )}
                          
                          {job?.status === 'paused' && (
                            <button
                              onClick={() => resumeJob(job?.id)}
                              className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                              title="Resume"
                            >
                              <Play className="h-3 w-3" />
                            </button>
                          )}
                          
                          {(job?.status === 'processing' || job?.status === 'queued') && (
                            <button
                              onClick={() => skipJob(job?.id)}
                              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                              title="Skip"
                            >
                              <SkipForward className="h-3 w-3" />
                            </button>
                          )}

                          <span className="text-xs font-medium text-gray-400">
                            {job?.progress?.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: `${job?.progress}%` }}
                        ></div>
                      </div>
                      {/* Stage Information */}
                      <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
                        <span>Stage: {job?.stage}</span>
                        {job?.completedAt && (
                          <span>Completed: {new Date(job.completedAt)?.toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real-time Activity */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-3">Real-time Activity</h4>
            <div className="space-y-2">
              {realtimeData?.slice(-3)?.reverse()?.map((entry, index) => (
                <div key={entry?.time} className="flex items-center justify-between p-2 rounded border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-mono text-gray-300">{entry?.time}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-400">{entry?.processed} processed</span>
                    </div>
                    {entry?.errors > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-gray-400">{entry?.errors} errors</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Success Rate</span>
                <span className="text-sm font-semibold text-green-400">{metrics?.successRate}%</span>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Avg Time</span>
                <span className="text-sm font-semibold text-blue-400">{metrics?.averageTime}s</span>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Total Processed</span>
                <span className="text-sm font-semibold text-white">{metrics?.totalProcessed?.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Errors</span>
                <span className="text-sm font-semibold text-red-400">{metrics?.errorCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatusPanel;