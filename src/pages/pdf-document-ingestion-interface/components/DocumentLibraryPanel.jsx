import React, { useState, useEffect } from 'react';
import { Database, Search, Download, Eye, RefreshCw, FileText, Calendar, User, Tag, CheckCircle, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';
import { PipelineBooksService } from '../../../services/pipelineBooksService';
import knowledgePipelineService from '../../../services/knowledgePipelineService';

const DocumentLibraryPanel = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('upload_date');
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    loadDocuments();

    // Listen for refresh events
    const handleRefresh = () => {
      loadDocuments();
    };

    window.addEventListener('refresh-ingestion-status', handleRefresh);
    return () => window.removeEventListener('refresh-ingestion-status', handleRefresh);
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const result = await PipelineBooksService?.getBookLibrary();
      if (result?.data) {
        setDocuments(result?.data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      const result = await knowledgePipelineService?.getDocumentDownloadUrl(document?.id);
      if (result?.success) {
        // Create a temporary link and trigger download
        const link = document?.createElement('a');
        link.href = result?.data?.downloadUrl;
        link.download = result?.data?.filename;
        document?.body?.appendChild(link);
        link?.click();
        document?.body?.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const handleReprocess = async (document) => {
    try {
      const result = await knowledgePipelineService?.triggerPdfIngestion(document?.file_path);
      if (result?.success) {
        loadDocuments(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to reprocess document:', error);
    }
  };

  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         doc?.author?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc?.processing_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedDocuments = [...filteredDocuments]?.sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a?.title || '')?.localeCompare(b?.title || '');
      case 'author':
        return (a?.author || '')?.localeCompare(b?.author || '');
      case 'upload_date':
        return new Date(b.upload_date || b.created_at) - new Date(a.upload_date || a.created_at);
      case 'file_size':
        return (b?.file_size || 0) - (a?.file_size || 0);
      default:
        return 0;
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'ingesting': case'extracting': return RefreshCw;
      case 'failed': return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'ingesting': case'extracting': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-2">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Document Library</h3>
            <p className="text-sm text-gray-400">Processed document archive with metadata and controls</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e?.target?.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="ingesting">Ingesting</option>
            <option value="extracting">Extracting</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e?.target?.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="upload_date">Upload Date</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="file_size">File Size</option>
          </select>

          <button
            onClick={loadDocuments}
            className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Document List */}
        <div className="bg-gray-900/50 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading documents...</span>
            </div>
          ) : sortedDocuments?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No documents found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {sortedDocuments?.map((document) => {
                const StatusIcon = getStatusIcon(document?.processing_status);
                const statusColor = getStatusColor(document?.processing_status);

                return (
                  <div
                    key={document?.id}
                    className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDocument(document)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          <StatusIcon className={`h-5 w-5 ${statusColor} ${
                            ['ingesting', 'extracting']?.includes(document?.processing_status) ? 'animate-spin' : ''
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="text-sm font-medium text-white truncate">
                              {document?.title || 'Untitled Document'}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${statusColor} bg-current bg-opacity-10`}>
                              {document?.processing_status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2">
                            {document?.author && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{document?.author}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(document?.upload_date || document?.created_at)}</span>
                            </div>
                            
                            <span>{formatFileSize(document?.file_size)}</span>
                            
                            {document?.document_format && (
                              <span className="uppercase">{document?.document_format}</span>
                            )}
                          </div>

                          {/* Metadata Tags */}
                          {document?.metadata?.tags && document?.metadata?.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {document?.metadata?.tags?.slice(0, 3)?.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                                >
                                  <Tag className="h-2 w-2 mr-1" />
                                  {tag}
                                </span>
                              ))}
                              {document?.metadata?.tags?.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{document?.metadata?.tags?.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Processing Jobs */}
                          {document?.book_processing_jobs && document?.book_processing_jobs?.length > 0 && (
                            <div className="mt-2 text-xs text-gray-400">
                              Latest job: {document?.book_processing_jobs?.[0]?.processing_stage} 
                              {document?.book_processing_jobs?.[0]?.progress_percentage && 
                                ` (${document?.book_processing_jobs?.[0]?.progress_percentage}%)`
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleDownload(document);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            setSelectedDocument(document);
                          }}
                          className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {document?.processing_status === 'failed' && (
                          <button
                            onClick={(e) => {
                              e?.stopPropagation();
                              handleReprocess(document);
                            }}
                            className="p-1 text-gray-400 hover:text-orange-400 transition-colors"
                            title="Reprocess"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => e?.stopPropagation()}
                          className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Count */}
        {!loading && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
            <span>
              Showing {sortedDocuments?.length} of {documents?.length} documents
            </span>
            <span>
              {documents?.filter(d => d?.processing_status === 'completed')?.length} processed, {' '}
              {documents?.filter(d => d?.processing_status === 'pending')?.length} pending
            </span>
          </div>
        )}
      </div>
      {/* Document Preview Modal - simplified for now */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedDocument?.title}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-400">Author:</span> <span className="text-white">{selectedDocument?.author || 'Unknown'}</span></div>
              <div><span className="text-gray-400">Status:</span> <span className="text-white">{selectedDocument?.processing_status}</span></div>
              <div><span className="text-gray-400">File Size:</span> <span className="text-white">{formatFileSize(selectedDocument?.file_size)}</span></div>
              <div><span className="text-gray-400">Upload Date:</span> <span className="text-white">{formatDate(selectedDocument?.upload_date)}</span></div>
              
              {selectedDocument?.metadata && Object.keys(selectedDocument?.metadata)?.length > 0 && (
                <div>
                  <span className="text-gray-400">Metadata:</span>
                  <pre className="text-xs text-gray-300 mt-1 bg-gray-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedDocument?.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentLibraryPanel;