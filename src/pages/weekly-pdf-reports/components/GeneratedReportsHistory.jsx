import React, { useState } from 'react';
import { Download, Calendar, FileText, Eye, RefreshCw, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export default function GeneratedReportsHistory({ 
  generatedReports, 
  generationJobs, 
  onDownloadReport, 
  onRefresh 
}) {
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes?.[i];
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'completed': { color: 'bg-green-900 text-green-300', icon: CheckCircle },
      'pending': { color: 'bg-blue-900 text-blue-300', icon: Loader2, spin: true },
      'failed': { color: 'bg-red-900 text-red-300', icon: AlertCircle },
      'cancelled': { color: 'bg-gray-900 text-gray-300', icon: Clock }
    };
    
    const badge = badges?.[status] || badges?.pending;
    const Icon = badge?.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badge?.color}`}>
        <Icon className={`w-3 h-3 mr-1 ${badge?.spin ? 'animate-spin' : ''}`} />
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getGenerationStatusBadge = (status) => {
    const badges = {
      'completed': { color: 'bg-green-900 text-green-300', icon: CheckCircle },
      'pending': { color: 'bg-yellow-900 text-yellow-300', icon: Clock },
      'failed': { color: 'bg-red-900 text-red-300', icon: AlertCircle }
    };
    
    const badge = badges?.[status] || badges?.pending;
    const Icon = badge?.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badge?.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Generated Reports</h2>
          <p className="text-gray-400">View and manage your generated PDF reports and job history</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'reports' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Generated Reports ({generatedReports?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'jobs' ?'bg-blue-600 text-white' :'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Generation Jobs ({generationJobs?.length || 0})
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === 'reports' ? (
        <div className="space-y-4">
          {generatedReports?.length > 0 ? (
            generatedReports?.map((report) => (
              <div
                key={report?.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-medium text-white">{report?.title}</h3>
                      {getGenerationStatusBadge(report?.generation_status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Generated: {formatDateTime(report?.generated_at || report?.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Size: {formatFileSize(report?.file_size)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Downloads: {report?.downloaded_count || 0}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Type: {report?.document_type?.replace('_', ' ') || 'Report'}</span>
                      </div>
                    </div>

                    {report?.parameters && (
                      <div className="text-xs text-gray-500 bg-gray-900 rounded px-2 py-1 inline-block">
                        {JSON.stringify(report?.parameters, null, 0)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {report?.generation_status === 'completed' && (
                      <button
                        onClick={() => onDownloadReport(report?.id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Download Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {/* Handle view details */}}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {report?.error_message && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                    <div className="text-red-400 text-sm">{report?.error_message}</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Reports Generated</h3>
              <p className="text-gray-500">Generated reports will appear here once you create and run a schedule</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {generationJobs?.length > 0 ? (
            generationJobs?.map((job) => (
              <div
                key={job?.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-lg font-medium text-white">
                        {job?.schedule?.schedule_name || 'Manual Generation'}
                      </h3>
                      {getStatusBadge(job?.job_status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {formatDateTime(job?.started_at)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Completed: {formatDateTime(job?.completed_at)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {job?.processing_time_seconds ? `${job?.processing_time_seconds}s` : 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Template: {job?.schedule?.template?.template_name || 'N/A'}</span>
                      </div>
                    </div>

                    {job?.generation_params && (
                      <div className="text-xs text-gray-500 bg-gray-900 rounded px-2 py-1 inline-block">
                        {JSON.stringify(job?.generation_params, null, 0)}
                      </div>
                    )}

                    {job?.document && (
                      <div className="mt-3 text-sm text-blue-400">
                        Generated: {job?.document?.title}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {job?.document && (
                      <button
                        onClick={() => onDownloadReport(job?.document?.id)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Download Generated Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {job?.error_details && (
                  <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                    <div className="text-red-400 text-sm">{job?.error_details}</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Generation Jobs</h3>
              <p className="text-gray-500">Report generation jobs will appear here when you run manual or scheduled reports</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}