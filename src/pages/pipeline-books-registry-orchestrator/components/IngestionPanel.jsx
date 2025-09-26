import React, { useState } from 'react';
import { Upload, FileText, Zap, Database, Search, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const IngestionPanel = ({ pipelineStats, processingJobs, onRefresh }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': case'ingesting':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      {/* Ingestion Process Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Process Flow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Upload className="w-5 h-5 mr-2 text-blue-400" />
            📥 Ingestion & Indexation
          </h3>
          
          {/* PDF Processing Pipeline */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <h4 className="text-md font-medium text-white mb-4">PDF Processing Pipeline</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <FileText className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">PDF → texte (OCR si besoin)</p>
                  <p className="text-xs text-gray-400">Extraction automatique avec détection chapitres/sections</p>
                </div>
                <div className="text-xs text-green-400 font-medium">98.2% accuracy</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <Database className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Chunking + embeddings → base vectorielle</p>
                  <p className="text-xs text-gray-400">Segmentation intelligente avec vector database</p>
                </div>
                <div className="text-xs text-blue-400 font-medium">2,847 chunks</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <Search className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Recherche sémantique avec citations</p>
                  <p className="text-xs text-gray-400">Livre/chapitre/page avec score de pertinence</p>
                </div>
                <div className="text-xs text-purple-400 font-medium">Ready</div>
              </div>
            </div>
          </div>

          {/* Processing Statistics */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <h4 className="text-md font-medium text-white mb-4">Processing Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Livres en cours</p>
                <p className="text-xl font-bold text-yellow-400">{pipelineStats?.bookStats?.ingesting || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Livres traités</p>
                <p className="text-xl font-bold text-green-400">{pipelineStats?.bookStats?.completed || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">En attente</p>
                <p className="text-xl font-bold text-blue-400">{pipelineStats?.bookStats?.pending || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Échecs</p>
                <p className="text-xl font-bold text-red-400">{pipelineStats?.bookStats?.failed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Processing Jobs */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-white flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Processing Jobs
          </h4>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {processingJobs?.length > 0 ? processingJobs?.map((job) => (
                <div 
                  key={job?.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedJob?.id === job?.id
                      ? 'bg-blue-600/20 border-blue-500' :'bg-gray-700/30 border-gray-600 hover:bg-gray-600/30'
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job?.status)}
                      <span className="text-sm font-medium text-white">
                        {job?.book_library?.title || `Job ${job?.id?.slice(0, 8)}`}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">
                      {job?.processing_stage}
                    </span>
                  </div>
                  
                  {job?.progress_percentage !== null && (
                    <div className="w-full bg-gray-600 rounded-full h-1.5 mb-2">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${getProgressColor(job?.progress_percentage)}`}
                        style={{ width: `${job?.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progress: {job?.progress_percentage?.toFixed(1) || 0}%</span>
                    <span>{job?.status}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No processing jobs found</p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Job Details */}
          {selectedJob && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700">
              <h5 className="text-sm font-medium text-white mb-3">Job Details</h5>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Book:</span>
                  <span className="text-white">{selectedJob?.book_library?.title || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stage:</span>
                  <span className="text-white capitalize">{selectedJob?.processing_stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white capitalize">{selectedJob?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white">
                    {selectedJob?.started_at ? new Date(selectedJob.started_at)?.toLocaleString() : 'N/A'}
                  </span>
                </div>
                {selectedJob?.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white">
                      {new Date(selectedJob.completed_at)?.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IngestionPanel;