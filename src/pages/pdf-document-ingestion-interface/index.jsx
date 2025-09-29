import React, { useState, useEffect } from 'react';
import { FileText, Upload, Database, Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import DocumentUploadPanel from './components/DocumentUploadPanel';
import ProcessingConfigurationPanel from './components/ProcessingConfigurationPanel';
import ProcessingStatusPanel from './components/ProcessingStatusPanel';
import DocumentLibraryPanel from './components/DocumentLibraryPanel';

const PdfDocumentIngestionInterface = () => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [processingQueue, setProcessingQueue] = useState([]);
  const [systemHealth, setSystemHealth] = useState('healthy');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (files, metadata) => {
    // Initialize upload progress for each file
    const newProgress = {};
    files?.forEach(file => {
      const fileId = `${file?.name}_${Date.now()}`;
      newProgress[fileId] = {
        fileName: file?.name,
        size: file?.size,
        progress: 0,
        status: 'uploading',
        metadata
      };
    });
    
    setUploadProgress(prev => ({ ...prev, ...newProgress }));

    // Simulate upload progress
    files?.forEach(file => {
      const fileId = `${file?.name}_${Date.now()}`;
      simulateUploadProgress(fileId);
    });
  };

  const simulateUploadProgress = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      if (progress >= 100) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev?.[fileId], progress: 100, status: 'completed' }
        }));
        
        // Add to processing queue
        setProcessingQueue(prev => [...prev, {
          id: fileId,
          fileName: prev?.[fileId]?.fileName || 'Unknown',
          status: 'queued',
          stage: 'pending',
          progress: 0,
          startTime: new Date()
        }]);
        
        clearInterval(interval);
      } else {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { ...prev?.[fileId], progress: Math.min(progress, 100) }
        }));
      }
    }, 500);
  };

  const handleRefreshStatus = () => {
    setLastUpdate(new Date());
    // Trigger refresh in child components
    window.dispatchEvent(new CustomEvent('refresh-ingestion-status'));
  };

  const statusColor = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    processing: 'text-blue-400'
  };

  const statusIcon = {
    healthy: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
    processing: Activity
  };

  const StatusIcon = statusIcon?.[systemHealth];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-800/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-gradient-to-br from-green-500 to-teal-600 p-2">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    PDF Document Ingestion Interface
                  </h1>
                  <p className="text-sm text-gray-400">
                    Financial literature integration and processing management
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${statusColor?.[systemHealth]}`} />
                <span className={`text-sm font-medium ${statusColor?.[systemHealth]}`}>
                  {systemHealth?.charAt(0)?.toUpperCase() + systemHealth?.slice(1)}
                </span>
              </div>

              {/* Processing Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Upload className="h-4 w-4" />
                  <span>{Object.keys(uploadProgress)?.length} uploads</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Database className="h-4 w-4" />
                  <span>{processingQueue?.length} in queue</span>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefreshStatus}
                className="inline-flex items-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>

              {/* Last Update */}
              <div className="text-sm text-gray-400">
                Last update: {lastUpdate?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Document Upload */}
            <DocumentUploadPanel 
              onFileUpload={handleFileUpload}
              uploadProgress={uploadProgress}
              onSystemHealthChange={setSystemHealth}
            />
            
            {/* Processing Configuration */}
            <ProcessingConfigurationPanel systemHealth={systemHealth} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Processing Status */}
            <ProcessingStatusPanel 
              processingQueue={processingQueue}
              setProcessingQueue={setProcessingQueue}
              systemHealth={systemHealth}
            />
            
            {/* Document Library */}
            <DocumentLibraryPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfDocumentIngestionInterface;